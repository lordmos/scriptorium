<!--
  Translation status:
  Source file : framework/recovery.md
  Source commit: 7685751
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **語言 / Language**: [简体中文](../../../framework/recovery.md) · [English](../../en/framework/recovery.md) · [日本語](../../ja/framework/recovery.md) · **繁體中文**

---

# 斷點恢復與容災

> **框架文檔** — 如何從中斷中恢復長週期的多Agent書籍生產項目
> 核心理念: 文件系統即狀態，標記即證明，恢復即重建上下文

---

## 1. 問題: 長週期項目的中斷風險

### 爲什麼會中斷

技術書籍的多Agent協作生產是一個**長週期任務**:

```
典型项目规模:
  章节数: {{章节数}}
  每章4步流水线: 研究 → 写作 → 审查 → 评审
  每步耗时: 数分钟到数十分钟
  全书总耗时: 可能跨越数天甚至数周的多个会话
```

在這個時間跨度內，以下中斷場景幾乎**必然發生**:

| 中斷場景 | 頻率 | 影響 |
|----------|------|------|
| AI會話超時/斷開 | 高 | 丟失當前會話的內存上下文 |
| API調用失敗 | 中 | 單個Agent任務失敗 |
| 用戶主動暫停 | 中 | 需要在新會話中恢復 |
| 網絡中斷 | 低 | 可能產生半成品文件 |
| 系統崩潰 | 極低 | 可能丟失未保存的文件 |

### 核心挑戰

> AI Agent是無狀態的。新會話對之前發生的一切**一無所知**。
> 如何讓新會話快速理解"項目進行到哪了，接下來該做什麼"？

---

## 2. 恢復信息源（優先級從高到低）

### 三級恢復體系

```
┌─────────────────────────────────────────────────────┐
│                 恢复信息源优先级                       │
│                                                       │
│  Level 1 (最可靠):  checkpoint.md                     │
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

### Level 1: checkpoint.md

`checkpoint.md` 是專門維護的項目狀態文件:

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

如果上次會話使用了SQL追蹤:

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

### Level 3: 文件系統狀態推斷

當checkpoint.md和SQL都不可用時，從文件系統推斷:

```bash
# 推断脚本逻辑（伪代码）

echo "=== Phase 1 检查 ==="
if [ -f "outline-final.md" ]; then echo "Phase 1: ✅"; fi
if [ -f "source-map.md" ]; then echo "source-map: ✅"; fi

echo "=== Phase 2 检查 ==="
for f in meta/glossary.md meta/style-guide.md meta/metaphor-registry.md \
         meta/chapter-summaries.md meta/cross-references.md; do
  if [ -f "$f" ]; then echo "$f: ✅"; else echo "$f: ❌"; fi
done

echo "=== Phase 3 逐章检查 ==="
for ch in $(seq -w 1 {{章节数}}); do
  echo "--- ch${ch} ---"

  # 研究
  f="research/ch${ch}-research.md"
  if [ -f "$f" ] && grep -q "RESEARCH_COMPLETE" "$f"; then
    echo "  研究: ✅"
  elif [ -f "$f" ]; then
    echo "  研究: ⚠️ 文件存在但无完成标记"
  else
    echo "  研究: —"
  fi

  # 写作
  f="drafts/ch${ch}-draft.md"
  if [ -f "$f" ] && grep -q "DRAFT_COMPLETE" "$f"; then
    echo "  写作: ✅"
  elif [ -f "$f" ]; then
    echo "  写作: ⚠️ 文件存在但无完成标记"
  else
    echo "  写作: —"
  fi

  # 审查 (R1/R2/R3)
  for r in r1-code r2-consistency r3-content; do
    f="reviews/ch${ch}-${r}.md"
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
  f="reviews/ch${ch}-review.md"
  if [ -f "$f" ] && grep -q "REVIEW_COMPLETE" "$f"; then
    echo "  合并审查: ✅"
  elif [ -f "$f" ]; then
    echo "  合并审查: ⚠️"
  else
    echo "  合并审查: —"
  fi

  # 读者评审
  f="reader-feedback/ch${ch}-panel.md"
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
  f="chapters/ch${ch}.md"
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
  f="publish/ch${ch}.html"
  if [ -f "$f" ]; then echo "ch${ch} HTML: ✅"; else echo "ch${ch} HTML: —"; fi
done
```

---

## 3. 完成標記檢測

### 標記定義

每個Agent在完成任務後，在輸出文件的**最後一行**追加HTML註釋標記:

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

### 標記的語義

```
标记存在   = 该步骤已成功完成，输出可信
标记不存在 = 该步骤未完成，或中途中断

关键原则:
  - 标记必须在文件写入完成后的最后一步追加
  - 标记的存在是唯一可信的完成证据
  - 文件存在但无标记 ≠ 完成（可能是中断产物）
```

### 批量檢測命令

```bash
# 检测所有研究报告的完成状态
echo "=== 研究完成状态 ==="
for f in research/ch*-research.md; do
  ch=$(basename "$f" | grep -o 'ch[0-9]*')
  if grep -q "RESEARCH_COMPLETE" "$f" 2>/dev/null; then
    echo "✅ $ch"
  else
    echo "❌ $ch (文件$([ -f "$f" ] && echo '存在但无标记' || echo '不存在'))"
  fi
done
```

---

## 4. "半成品"檢測與處理

### 什麼是半成品

半成品是指**文件已創建但任務未完成**的產物。通常由以下原因產生:

```
原因1: Agent写作中途被中断（会话超时、API错误）
  → 文件存在，内容不完整，无完成标记

原因2: Agent完成了内容但标记追加前中断
  → 文件存在，内容完整，但无完成标记（罕见但可能）

原因3: Agent运行异常，输出了不合格的内容
  → 文件存在，有完成标记，但内容有问题（最难检测）
```

### 半成品檢測規則

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

### 半成品處理策略

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

## 5. checkpoint.md的更新時機

### 更新規則

```
┌─────────────────────────────────────────────────┐
│            checkpoint.md 更新时机                 │
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
  3. 更新checkpoint.md中对应单元格
  4. 如果是批次最后一个Step → 触发长记忆更新

批次完成时:
  1. 确认批次内所有章节的所有Step完成
  2. 执行长记忆文件更新（summaries, glossary等）
  3. 全量更新checkpoint.md
  4. 判断是否可以开始下一批次

Phase切换时:
  1. 确认当前Phase的交接清单全部通过
  2. 全量更新checkpoint.md（标记旧Phase完成，新Phase开始）
  3. 开始新Phase的第一个任务
```

---

## 6. 容災場景

### 場景1: 寫作中斷（最常見）

```
症状:
  - 会话突然断开
  - drafts/chXX-draft.md 可能是半成品

恢复步骤:
  1. 读取 checkpoint.md 确定中断点
  2. 检测半成品文件（有文件但无完成标记）
  3. 对半成品文件执行保守策略（备份+重做）
  4. 从中断点继续执行

示例:
  checkpoint显示 ch05 写作=⏳
  drafts/ch05-draft.md 存在但无 DRAFT_COMPLETE 标记
  → 备份 ch05-draft.md
  → 重新调度作家(#4)写作第5章
```

### 場景2: 審查中斷

```
症状:
  - 三审并行中某个reviewer的报告缺失
  - 例如R1和R3完成，但R2的报告不存在

恢复步骤:
  1. 检测 reviews/chXX-r{1,2,3}-*.md 的完成标记
  2. 只重做缺失/不完整的reviewer
  3. 已完成的reviewer报告保留不动

示例:
  reviews/ch05-r1-code.md     → 有R1_CODE_REVIEW_COMPLETE ✅
  reviews/ch05-r2-consistency.md → 不存在 ❌
  reviews/ch05-r3-content.md  → 有R3_CONTENT_REVIEW_COMPLETE ✅
  → 只需重新调度R2审查ch05
  → R2完成后合并三份报告
```

### 場景3: 長記憶文件損壞

```
症状:
  - chapter-summaries.md 内容不完整或格式异常
  - glossary.md 缺少某些已完成章节的术语

恢复步骤:
  1. 从已完成的 chapters/ 或 drafts/ 重建长记忆
  2. 逐章扫描，重新提取摘要、术语、比喻
  3. 重建 chapter-summaries.md, glossary.md, metaphor-registry.md

重建策略:
  if chapters/chXX.md 存在（Phase 4产出）:
    → 从最终定稿重建（最可靠）
  elif drafts/chXX-draft.md 有 DRAFT_COMPLETE 标记:
    → 从初稿重建（可靠）
  else:
    → 该章需要重做
```

### 場景4: 全部丟失

```
症状:
  - checkpoint.md 不存在
  - SQL状态不可用
  - 但文件系统中有各种产出文件

恢复步骤:
  1. 执行Level 3文件系统推断（完整扫描）
  2. 基于扫描结果重建 checkpoint.md
  3. 重建长记忆文件（如果缺失）
  4. 从推断出的中断点继续

这是最耗时的恢复方式，但由于文件系统是
唯一的持久存储，总能从中恢复。
```

### 場景5: 依賴鏈斷裂

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

### 設計理念

> 每次會話結束前，寫一份"給下一個自己的信"。
> 新會話讀取這封信，即可快速恢復上下文。

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
1. 读取 checkpoint.md 确认进度
2. 检测半成品文件
3. {{具体的下一步操作}}

## 重要文件位置
- 检查点: {{工作目录}}/checkpoint.md
- 大纲: {{工作目录}}/outline-final.md
- 源码映射: {{工作目录}}/source-map.md
- 共享资源: {{工作目录}}/meta/
- 草稿: {{工作目录}}/drafts/
- 审查: {{工作目录}}/reviews/
- 定稿: {{工作目录}}/chapters/
- 发布: {{工作目录}}/publish/
```

### RESUME.md 的使用流程

```
会话结束时:
  1. 主编排生成/更新 RESUME.md
  2. 同时更新 checkpoint.md
  3. 会话结束

新会话开始时:
  1. 读取 RESUME.md → 快速获取项目概况和进度
  2. 读取 checkpoint.md → 获取精确的状态矩阵
  3. 如有必要，执行文件系统扫描验证
  4. 确定下一步操作，继续执行
```

---

## 8. 恢復流程總覽

```
┌──────────────────────────────────────────────────────────┐
│                    新会话恢复流程                           │
│                                                            │
│  Step 1: 识别恢复信息源                                     │
│  ├── RESUME.md 存在?   ──── 是 → 读取项目概况               │
│  ├── checkpoint.md 存在? ── 是 → 读取状态矩阵               │
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
│  ├── checkpoint.md 缺失 → 重建                              │
│  ├── 长记忆文件缺失 → 从drafts/chapters重建                  │
│  └── SQL状态缺失 → 从checkpoint.md重建                      │
│                                                            │
│  Step 5: 继续执行                                          │
│  ├── 从中断点继续                                           │
│  ├── 重做半成品对应的Step                                    │
│  └── 更新checkpoint.md                                     │
└──────────────────────────────────────────────────────────┘
```

---

## 9. 最佳實踐

### 預防優於恢復

```
1. 频繁更新checkpoint.md
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

### 恢復優先級

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

### 人工檢查點

```
建议在以下时机进行人工检查:

1. Phase 1 完成后: 确认大纲符合预期
2. 每个Batch完成后: 抽查一两章的质量
3. Phase 4 完成后: 全书通读确认
4. 发布前: 最终人工审核

人工检查不影响自动化流程，但可以及早发现问题。
```
