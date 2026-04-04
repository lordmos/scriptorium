# 断点恢复与容灾

> **框架文档** — 如何从中断中恢复长周期的多Agent书籍生产项目
> 核心理念: 文件系统即状态，标记即证明，恢复即重建上下文

---

## 1. 问题: 长周期项目的中断风险

### 为什么会中断

技术书籍的多Agent协作生产是一个**长周期任务**:

```
典型项目规模:
  章节数: {{章节数}}
  每章4步流水线: 研究 → 写作 → 审查 → 评审
  每步耗时: 数分钟到数十分钟
  全书总耗时: 可能跨越数天甚至数周的多个会话
```

在这个时间跨度内，以下中断场景几乎**必然发生**:

| 中断场景 | 频率 | 影响 |
|----------|------|------|
| AI会话超时/断开 | 高 | 丢失当前会话的内存上下文 |
| API调用失败 | 中 | 单个Agent任务失败 |
| 用户主动暂停 | 中 | 需要在新会话中恢复 |
| 网络中断 | 低 | 可能产生半成品文件 |
| 系统崩溃 | 极低 | 可能丢失未保存的文件 |

### 核心挑战

> AI Agent是无状态的。新会话对之前发生的一切**一无所知**。
> 如何让新会话快速理解"项目进行到哪了，接下来该做什么"？

---

## 2. 恢复信息源（优先级从高到低）

### 三级恢复体系

```
┌─────────────────────────────────────────────────────┐
│                 恢复信息源优先级                       │
│                                                       │
│  Level 1 (最可靠):  output/memory/checkpoint.md        │
│  ├── 结构化的状态矩阵                                  │
│  ├── 每章每步的完成状态                                 │
│  └── 最后更新时间戳                                    │
│                                                       │
│  Level 2 (次选):    SQL todos表                       │
│  ├── 如果上次会话使用了SQL追踪                          │
│  ├── 包含任务状态和依赖关系                             │
│  └── 可能不是最新（取决于上次会话的更新频率）             │
│                                                       │
│  Level 3 (兜底):    文件系统状态推断                    │
│  ├── 扫描目录结构推断进度                               │
│  ├── 检测文件中的完成标记                               │
│  └── 最慢但最可靠——文件系统不会说谎                     │
└─────────────────────────────────────────────────────┘
```

### Level 1: output/memory/checkpoint.md

`output/memory/checkpoint.md` 是专门维护的项目状态文件:

```markdown
# {{项目名称}} — 项目进度检查点

最后更新: {{时间戳}}
当前Phase: {{当前Phase编号}}
当前批次: Batch {{当前批次编号}}

## Phase 1: 大纲定稿 — ✅ 完成
## Phase 2: 共享资源构建 — ✅ 完成

## Phase 3: 逐章写作 — ⏳ 进行中

### Batch 1
| 章节 | 研究 | 写作 | R1审查 | R2审查 | R3审查 | 合并审查 | 读者评审 | 长记忆更新 |
|------|------|------|--------|--------|--------|---------|---------|-----------|
| ch01 | ✅   | ✅   | ✅     | ✅     | ✅     | ✅      | ✅      | ✅        |
| ch02 | ✅   | ✅   | ✅     | ✅     | ✅     | ✅      | ✅      | ✅        |
| ch04 | ✅   | ✅   | ✅     | ✅     | ✅     | ✅      | ✅      | ✅        |

### Batch 2
| 章节 | 研究 | 写作 | R1审查 | R2审查 | R3审查 | 合并审查 | 读者评审 | 长记忆更新 |
|------|------|------|--------|--------|--------|---------|---------|-----------|
| ch03 | ✅   | ✅   | ⏳     | ❌     | ✅     | —       | —       | —         |
| ch05 | ✅   | ⏳   | —      | —      | —      | —       | —       | —         |

### Batch 3 — 未开始
| 章节 | 研究 | 写作 | R1审查 | R2审查 | R3审查 | 合并审查 | 读者评审 | 长记忆更新 |
|------|------|------|--------|--------|--------|---------|---------|-----------|
| ch06 | —    | —    | —      | —      | —      | —       | —       | —         |

## Phase 4: 统稿审计 — 未开始
## Phase 5: HTML装帧 — 未开始

图例: ✅完成  ⏳进行中  ❌失败  ⚠️需人工  — 未开始
```

### Level 2: SQL todos表

如果上次会话使用了SQL追踪:

```sql
-- 查询当前进度
SELECT * FROM todos ORDER BY id;

-- 查找未完成的任务
SELECT * FROM todos WHERE status != 'done';

-- 查找可以开始的任务（所有依赖已完成）
SELECT t.* FROM todos t
WHERE t.status = 'pending'
AND NOT EXISTS (
    SELECT 1 FROM todo_deps td
    JOIN todos dep ON td.depends_on = dep.id
    WHERE td.todo_id = t.id AND dep.status != 'done'
);
```

### Level 3: 文件系统状态推断

当output/memory/checkpoint.md和SQL都不可用时，从文件系统推断:

```bash
# 推断脚本逻辑（伪代码）

echo "=== Phase 1 检查 ==="
if [ -f "output/memory/outline.md" ]; then echo "Phase 1: ✅"; fi
if [ -f "output/memory/source-map.md" ]; then echo "source-map: ✅"; fi

echo "=== Phase 2 检查 ==="
for f in output/memory/glossary.md output/memory/style-guide.md output/memory/metaphor-registry.md \
         output/memory/chapter-summaries.md output/memory/cross-references.md; do
  if [ -f "$f" ]; then echo "$f: ✅"; else echo "$f: ❌"; fi
done

echo "=== Phase 3 逐章检查 ==="
for ch in $(seq -w 1 {{章节数}}); do
  echo "--- ch${ch} ---"

  # 研究
  f="output/research/ch${ch}-report.md"
  if [ -f "$f" ] && grep -q "RESEARCH_COMPLETE" "$f"; then
    echo "  研究: ✅"
  elif [ -f "$f" ]; then
    echo "  研究: ⚠️ 文件存在但无完成标记"
  else
    echo "  研究: —"
  fi

  # 写作
  f="output/chapters/draft/ch${ch}-draft.md"
  if [ -f "$f" ] && grep -q "DRAFT_COMPLETE" "$f"; then
    echo "  写作: ✅"
  elif [ -f "$f" ]; then
    echo "  写作: ⚠️ 文件存在但无完成标记"
  else
    echo "  写作: —"
  fi

  # 审查 (R1/R2/R3)
  for r in r1 r2 r3; do
    f="output/reviews/ch${ch}-${r}.md"
    marker=$(echo "$r" | tr '[:lower:]' '[:upper:]' | sed 's/-/_/g')
    if [ -f "$f" ] && grep -q "${marker}_REVIEW_COMPLETE" "$f"; then
      echo "  $r: ✅"
    elif [ -f "$f" ]; then
      echo "  $r: ⚠️"
    else
      echo "  $r: —"
    fi
  done

  # 合并审查
  f="output/reviews/ch${ch}-review.md"
  if [ -f "$f" ] && grep -q "REVIEW_COMPLETE" "$f"; then
    echo "  合并审查: ✅"
  elif [ -f "$f" ]; then
    echo "  合并审查: ⚠️"
  else
    echo "  合并审查: —"
  fi

  # 读者评审
  f="output/reviews/ch${ch}-panel.md"
  if [ -f "$f" ] && grep -q "READER_PANEL_COMPLETE" "$f"; then
    echo "  读者评审: ✅"
  elif [ -f "$f" ]; then
    echo "  读者评审: ⚠️"
  else
    echo "  读者评审: —"
  fi
done

echo "=== Phase 4 检查 ==="
for ch in $(seq -w 1 {{章节数}}); do
  f="output/chapters/final/ch${ch}-final.md"
  if [ -f "$f" ] && grep -q "CHAPTER_FINAL" "$f"; then
    echo "ch${ch} 定稿: ✅"
  elif [ -f "$f" ]; then
    echo "ch${ch} 定稿: ⚠️"
  else
    echo "ch${ch} 定稿: —"
  fi
done

echo "=== Phase 5 检查 ==="
for ch in $(seq -w 1 {{章节数}}); do
  f="output/publish/ch${ch}.html"
  if [ -f "$f" ]; then echo "ch${ch} HTML: ✅"; else echo "ch${ch} HTML: —"; fi
done
```

---

## 3. 完成标记检测

### 标记定义

每个Agent在完成任务后，在输出文件的**最后一行**追加HTML注释标记:

```
<!-- RESEARCH_COMPLETE -->           研究员完成
<!-- DRAFT_COMPLETE -->              作家完成
<!-- R1_CODE_REVIEW_COMPLETE -->     R1源码审查完成
<!-- R2_CONSISTENCY_REVIEW_COMPLETE --> R2一致性审查完成
<!-- R3_CONTENT_REVIEW_COMPLETE -->  R3内容审查完成
<!-- REVIEW_COMPLETE -->             三审合并完成
<!-- READER_PANEL_COMPLETE -->       读者评审完成
<!-- CHAPTER_FINAL -->               最终定稿
<!-- HTML_COMPLETE -->               HTML转换完成
```

### 标记的语义

```
标记存在   = 该步骤已成功完成，输出可信
标记不存在 = 该步骤未完成，或中途中断

关键原则:
  - 标记必须在文件写入完成后的最后一步追加
  - 标记的存在是唯一可信的完成证据
  - 文件存在但无标记 ≠ 完成（可能是中断产物）
```

### 批量检测命令

```bash
# 检测所有研究报告的完成状态
echo "=== 研究完成状态 ==="
for f in output/research/ch*-report.md; do
  ch=$(basename "$f" | grep -o 'ch[0-9]*')
  if grep -q "RESEARCH_COMPLETE" "$f" 2>/dev/null; then
    echo "✅ $ch"
  else
    echo "❌ $ch (文件$([ -f "$f" ] && echo '存在但无标记' || echo '不存在'))"
  fi
done
```

---

## 4. "半成品"检测与处理

### 什么是半成品

半成品是指**文件已创建但任务未完成**的产物。通常由以下原因产生:

```
原因1: Agent写作中途被中断（会话超时、API错误）
  → 文件存在，内容不完整，无完成标记

原因2: Agent完成了内容但标记追加前中断
  → 文件存在，内容完整，但无完成标记（罕见但可能）

原因3: Agent运行异常，输出了不合格的内容
  → 文件存在，有完成标记，但内容有问题（最难检测）
```

### 半成品检测规则

```
┌────────────────────────────────────────────┐
│            半成品检测决策树                   │
│                                              │
│  文件是否存在?                                │
│  ├── 否 → 该步骤未开始，正常                  │
│  └── 是 → 检查完成标记                        │
│           ├── 有标记 → ✅ 已完成，可信任       │
│           └── 无标记 → ⚠️ 可能是半成品         │
│                       ├── 检查文件大小          │
│                       │   ├── < 100字 → 几乎   │
│                       │   │   肯定是半成品      │
│                       │   │   → 删除重做        │
│                       │   └── > 100字 → 可能    │
│                       │       内容完整但缺标记   │
│                       │       → 人工判断或重做   │
│                       └── 检查文件末尾是否截断    │
│                           ├── 明显截断 → 重做    │
│                           └── 看起来完整 → 可能  │
│                               只是缺标记→补标记  │
└────────────────────────────────────────────┘
```

### 半成品处理策略

```
策略1: 保守策略（推荐）
  有疑问就重做。宁可浪费一次Agent调用，也不留下不可靠的内容。
  
  if 文件存在 && 无完成标记:
    备份: mv file file.bak.{{时间戳}}
    重做: 重新调度对应Agent

策略2: 激进策略（节省成本时使用）
  尝试复用半成品内容。
  
  if 文件存在 && 无完成标记 && 内容看起来完整:
    让Agent在已有内容基础上补完
    追加完成标记

策略3: 人工决策
  将半成品列表汇报给用户，由用户决定保留还是重做。
```

---

## 5. output/memory/checkpoint.md的更新时机

### 更新规则

```
┌─────────────────────────────────────────────────┐
│            output/memory/checkpoint.md 更新时机        │
│                                                   │
│  触发事件                      更新类型            │
│  ─────────────────────────────────────────────    │
│  单个Step完成                  增量更新            │
│  （如ch03的研究完成）          （更新一个单元格）    │
│                                                   │
│  单个批次完成                  全量更新            │
│  （Batch 2所有章节完成）       （更新整个批次表格）  │
│                                                   │
│  Phase切换                     全量更新            │
│  （Phase 3→4）                （更新Phase状态）    │
│                                                   │
│  异常发生                      增量更新            │
│  （某Step失败）                （标记❌）           │
│                                                   │
│  人工干预后                    全量更新            │
│  （用户手动修正了某些内容）     （重新扫描状态）     │
└─────────────────────────────────────────────────┘
```

### 更新流程

```
Step完成时:
  1. Agent输出文件并追加完成标记
  2. 主编排验证完成标记存在
  3. 更新output/memory/checkpoint.md中对应单元格
  4. 如果是批次最后一个Step → 触发长记忆更新

批次完成时:
  1. 确认批次内所有章节的所有Step完成
  2. 执行长记忆文件更新（summaries, glossary等）
  3. 全量更新output/memory/checkpoint.md
  4. 判断是否可以开始下一批次

Phase切换时:
  1. 确认当前Phase的交接清单全部通过
  2. 全量更新output/memory/checkpoint.md（标记旧Phase完成，新Phase开始）
  3. 开始新Phase的第一个任务
```

---

## 6. 容灾场景

### 场景1: 写作中断（最常见）

```
症状:
  - 会话突然断开
  - output/chapters/draft/chXX-draft.md 可能是半成品

恢复步骤:
  1. 读取 output/memory/checkpoint.md 确定中断点
  2. 检测半成品文件（有文件但无完成标记）
  3. 对半成品文件执行保守策略（备份+重做）
  4. 从中断点继续执行

示例:
  checkpoint显示 ch05 写作=⏳
  output/chapters/draft/ch05-draft.md 存在但无 DRAFT_COMPLETE 标记
  → 备份 ch05-draft.md
  → 重新调度作家(#4)写作第5章
```

### 场景2: 审查中断

```
症状:
  - 三审并行中某个reviewer的报告缺失
  - 例如R1和R3完成，但R2的报告不存在

恢复步骤:
  1. 检测 output/reviews/chXX-r{1,2,3}.md 的完成标记
  2. 只重做缺失/不完整的reviewer
  3. 已完成的reviewer报告保留不动

示例:
  output/reviews/ch05-r1.md     → 有R1_CODE_REVIEW_COMPLETE ✅
  output/reviews/ch05-r2.md     → 不存在 ❌
  output/reviews/ch05-r3.md     → 有R3_CONTENT_REVIEW_COMPLETE ✅
  → 只需重新调度R2审查ch05
  → R2完成后合并三份报告
```

### 场景3: 长记忆文件损坏

```
症状:
  - chapter-summaries.md 内容不完整或格式异常
  - glossary.md 缺少某些已完成章节的术语

恢复步骤:
  1. 从已完成的 output/chapters/final/ 或 output/chapters/draft/ 重建长记忆
  2. 逐章扫描，重新提取摘要、术语、比喻
  3. 重建 chapter-summaries.md, glossary.md, metaphor-registry.md

重建策略:
  if output/chapters/final/chXX-final.md 存在（Phase 4产出）:
    → 从最终定稿重建（最可靠）
  elif output/chapters/draft/chXX-draft.md 有 DRAFT_COMPLETE 标记:
    → 从初稿重建（可靠）
  else:
    → 该章需要重做
```

### 场景4: 全部丢失

```
症状:
  - output/memory/checkpoint.md 不存在
  - SQL状态不可用
  - 但文件系统中有各种产出文件

恢复步骤:
  1. 执行Level 3文件系统推断（完整扫描）
  2. 基于扫描结果重建 output/memory/checkpoint.md
  3. 重建长记忆文件（如果缺失）
  4. 从推断出的中断点继续

这是最耗时的恢复方式，但由于文件系统是
唯一的持久存储，总能从中恢复。
```

### 场景5: 依赖链断裂

```
症状:
  - Batch 1中某章失败
  - 导致依赖它的后续章节无法进行

恢复步骤:
  1. 识别失败章节和受影响的下游章节
  2. 重试失败章节
  3. 如果重试成功，继续下游章节
  4. 如果重试仍失败，标记为 NEEDS_HUMAN_REVIEW
  5. 跳过受影响的章节，处理不受影响的章节
  6. 最终汇总需人工介入的章节
```

---

## 7. RESUME.md模式

### 设计理念

> 每次会话结束前，写一份"给下一个自己的信"。
> 新会话读取这封信，即可快速恢复上下文。

### RESUME.md 模板

```markdown
# {{项目名称}} — 恢复指南

生成时间: {{时间戳}}
生成者: 上一次编排会话

---

## 项目概述
- 项目: {{项目名称}}
- 源码: {{源码仓库}}
- 章节数: {{章节数}}
- 工作目录: {{工作目录}}

## 当前进度
- 当前Phase: Phase {{N}}
- 当前批次: Batch {{M}}
- 已完成章节: {{已完成章节列表}}
- 进行中章节: {{进行中章节列表}}
- 未开始章节: {{未开始章节列表}}

## 未完成任务
1. {{任务描述1}} — 状态: {{状态}} — 优先级: {{高/中/低}}
2. {{任务描述2}} — 状态: {{状态}} — 优先级: {{高/中/低}}

## 已知问题
- {{问题描述1}} — 影响: {{影响范围}}
- {{问题描述2}} — 影响: {{影响范围}}

## 关键决策历史
- {{决策1}}: {{原因和结果}}
- {{决策2}}: {{原因和结果}}

## 下一步操作
1. 读取 output/memory/checkpoint.md 确认进度
2. 检测半成品文件
3. {{具体的下一步操作}}

## 重要文件位置
- 检查点: {{工作目录}}/output/memory/checkpoint.md
- 大纲: {{工作目录}}/output/memory/outline.md
- 源码映射: {{工作目录}}/output/memory/source-map.md
- 共享资源: {{工作目录}}/output/memory/
- 草稿: {{工作目录}}/output/chapters/draft/
- 审查: {{工作目录}}/output/reviews/
- 定稿: {{工作目录}}/output/chapters/final/
- 发布: {{工作目录}}/output/publish/
```

### RESUME.md 的使用流程

```
会话结束时:
  1. 主编排生成/更新 RESUME.md
  2. 同时更新 output/memory/checkpoint.md
  3. 会话结束

新会话开始时:
  1. 读取 RESUME.md → 快速获取项目概况和进度
  2. 读取 output/memory/checkpoint.md → 获取精确的状态矩阵
  3. 如有必要，执行文件系统扫描验证
  4. 确定下一步操作，继续执行
```

---

## 8. 恢复流程总览

```
┌──────────────────────────────────────────────────────────┐
│                    新会话恢复流程                           │
│                                                            │
│  Step 1: 识别恢复信息源                                     │
│  ├── RESUME.md 存在?   ──── 是 → 读取项目概况               │
│  ├── output/memory/checkpoint.md 存在? ── 是 → 读取状态矩阵               │
│  └── 都不存在?          ──── → 文件系统扫描                  │
│                                                            │
│  Step 2: 确定中断点                                         │
│  ├── 哪个Phase?                                            │
│  ├── 哪个Batch?                                            │
│  └── 哪个Step?                                             │
│                                                            │
│  Step 3: 检测半成品                                         │
│  ├── 扫描可覆写文件目录                                      │
│  ├── 检查完成标记                                           │
│  └── 对半成品执行处理策略                                    │
│                                                            │
│  Step 4: 重建缺失状态                                       │
│  ├── output/memory/checkpoint.md 缺失 → 重建                              │
│  ├── 长记忆文件缺失 → 从output/chapters/draft和output/chapters/final重建   │
│  └── SQL状态缺失 → 从output/memory/checkpoint.md重建                      │
│                                                            │
│  Step 5: 继续执行                                          │
│  ├── 从中断点继续                                           │
│  ├── 重做半成品对应的Step                                    │
│  └── 更新output/memory/checkpoint.md                                     │
└──────────────────────────────────────────────────────────┘
```

---

## 9. 最佳实践

### 预防优于恢复

```
1. 频繁更新output/memory/checkpoint.md
   - 每个Step完成后立即更新，不要攒到批次结束

2. 保持RESUME.md最新
   - 每次有重要进展时更新
   - 至少每个批次结束时更新一次

3. 使用完成标记
   - 所有Agent的prompt中都要求追加完成标记
   - 这是恢复机制能工作的前提

4. 追加文件不要修改已有内容
   - chapter-summaries 只追加，不修改前序章节的摘要
   - 这样即使中断，已有内容也是安全的
```

### 恢复优先级

```
恢复时，按以下优先级处理:

1. 高优先级: 修复阻塞下游的失败
   - 某个依赖章节失败，会阻塞后续多章
   - 优先重试这些关键章节

2. 中优先级: 处理半成品
   - 文件存在但不完整的情况
   - 备份后重做

3. 低优先级: 继续未开始的任务
   - 按正常流程继续
```

### 人工检查点

```
建议在以下时机进行人工检查:

1. Phase 1 完成后: 确认大纲符合预期
2. 每个Batch完成后: 抽查一两章的质量
3. Phase 4 完成后: 全书通读确认
4. 发布前: 最终人工审核

人工检查不影响自动化流程，但可以及早发现问题。
```
