# 5阶段生产流水线

> **框架文档** — 适用于任何基于多Agent协作的技术书籍生产项目
> 项目: {{项目名称}} | 源码: {{源码仓库}} | 章节数: {{章节数}}

---

## 流水线总览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        5阶段生产流水线                                    │
│                                                                         │
│  Phase 1        Phase 2        Phase 3          Phase 4       Phase 5   │
│ ┌────────┐    ┌────────┐    ┌──────────┐    ┌─────────┐    ┌────────┐  │
│ │大纲定稿│───▶│共享资源│───▶│逐章写作  │───▶│统稿审计 │───▶│HTML发布│  │
│ │        │    │  构建  │    │×{{章节数}}│    │         │    │        │  │
│ └────────┘    └────────┘    └──────────┘    └─────────┘    └────────┘  │
│                                                                         │
│  架构师#1       主编排#0      研究员#3         主编排#0      装帧工人#11 │
│  读者代言人#2                 作家#4           审查组R1-R3              │
│  内容审查R3                   审查组R1-R3                               │
│                               读者评审团                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: 大纲定稿

### 参与Agent

| Agent | 角色代号 | 职责 |
|-------|---------|------|
| 架构师 | #1 | 分析源码结构，生成大纲草案 |
| 读者代言人 | #2 | 从{{目标读者}}视角审核大纲 |
| 内容审查员 | R3 | 审核敏感性、合规性 |

### 执行步骤

```
Step 1.1  架构师(#1) 分析{{源码仓库}}源码
          ├── 读取: {{源码根目录}}
          ├── 输出: output/memory/outline.md（大纲草案）
          └── 输出: output/memory/source-map.md（源码→章节映射）

Step 1.2  读者代言人(#2) 审核大纲
          ├── 读取: output/memory/outline.md
          ├── 输出: output/reviews/outline-reader-feedback.md
          └── 关注: 学习曲线、前置知识、章节顺序合理性

Step 1.3  内容审查员(R3) 审核大纲
          ├── 读取: output/memory/outline.md
          ├── 输出: output/reviews/outline-r3-review.md
          └── 关注: {{敏感性检查项}}

Step 1.4  用户审核定稿
          ├── 读取: 所有反馈文件
          ├── 人工决策: 接受/修改/驳回
          └── 输出: output/memory/outline.md（最终大纲）
```

### 产出清单

| 文件 | 说明 | 类型 |
|------|------|------|
| `output/memory/outline.md` | 最终定稿大纲 | 静态 |
| `output/memory/source-map.md` | 源码文件→章节映射关系 | 静态 |

### Phase 1 交接清单

- [ ] output/memory/outline.md 已创建且经用户确认
- [ ] output/memory/source-map.md 已创建，覆盖所有关键源码文件
- [ ] 章节数量、顺序、范围已最终确定
- [ ] {{敏感性检查项}}已通过R3审核

---

## Phase 2: 共享资源构建

### 参与Agent

| Agent | 角色代号 | 职责 |
|-------|---------|------|
| 主编排 | #0 | 直接生成所有共享资源文件 |

### 执行步骤

```
Step 2.1  主编排(#0) 基于 output/memory/outline.md 创建所有共享文件
          ├── 输出: output/memory/glossary.md          — 术语表（初始版本）
          ├── 输出: output/memory/style-guide.md       — 写作风格指南
          ├── 输出: output/memory/metaphor-registry.md — 比喻注册表
          ├── 输出: output/memory/chapter-summaries.md — 章节摘要（空模板）
          └── 输出: output/memory/cross-references.md  — 交叉引用表（空模板）
```

### 产出清单

| 文件 | 说明 | 类型 |
|------|------|------|
| `output/memory/glossary.md` | 全书术语表 | 追加 |
| `output/memory/style-guide.md` | 写作风格指南 | 静态 |
| `output/memory/metaphor-registry.md` | 比喻/类比注册表 | 追加 |
| `output/memory/chapter-summaries.md` | 各章摘要（逐章追加） | 追加 |
| `output/memory/cross-references.md` | 章节间交叉引用 | 追加 |

### Phase 2 交接清单

- [ ] output/memory/ 目录下所有5个文件已创建
- [ ] glossary.md 包含大纲中已识别的核心术语
- [ ] style-guide.md 包含{{写作风格要求}}
- [ ] chapter-summaries.md 已创建空模板（每章一个占位段落）

---

## Phase 3: 逐章写作 ×{{章节数}}章

### 每章4步流水线

```
┌─────────────────────────────────────────────────────────────────┐
│                    单章写作流水线                                  │
│                                                                   │
│  Step 1         Step 2         Step 3              Step 4         │
│ ┌──────┐      ┌──────┐      ┌──────────┐        ┌──────────┐    │
│ │ 研究 │─────▶│ 写作 │─────▶│ 三审并行 │───────▶│读者评审团│    │
│ │ #3   │      │ #4   │      │R1+R2+R3  │        │RS+RE+RH  │    │
│ └──────┘      └──────┘      └──────────┘        └──────────┘    │
│    │             │           ┌──┤├──┐            ┌──┤├──┐        │
│    ▼             ▼           ▼  ▼  ▼            ▼  ▼  ▼         │
│ output/       output/      R1  R2  R3          RS  RE  RH       │
│ research/     chapters/    ↓   ↓   ↓           ↓   ↓   ↓       │
│ chXX-         draft/       output/            output/            │
│ report.md     chXX-draft   reviews/           reviews/           │
│                            chXX-review.md     chXX-panel.md      │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 1: 研究（研究员 #3）

```
输入:
  📖 output/memory/source-map.md          — 定位本章对应的源码文件
  📖 output/memory/outline.md       — 本章的大纲要求
  📖 {{源码文件列表}}        — 实际源码文件

输出:
  ✏️ output/research/chXX-report.md — 源码分析报告

完成标记: <!-- RESEARCH_COMPLETE -->
```

#### Step 2: 写作（作家 #4）

```
输入:
  📖 output/research/chXX-report.md — 本章研究报告
  📖 output/memory/style-guide.md       — 写作风格指南
  📖 output/memory/chapter-summaries.md — 前序章节摘要
  📖 output/memory/glossary.md          — 已有术语表
  📖 output/memory/metaphor-registry.md — 已用比喻表

输出:
  ✏️ output/chapters/draft/chXX-draft.md — 章节初稿

完成标记: <!-- DRAFT_COMPLETE -->
字数要求: {{每章目标字数}}字 ± 20%
```

#### Step 3: 三审并行（R1 + R2 + R3）

```
三个Reviewer并行执行，详见 review-architecture.md

R1 源码审查:
  📖 output/chapters/draft/chXX-draft.md + 源码文件
  ✏️ output/reviews/chXX-r1.md
  完成标记: <!-- R1_CODE_REVIEW_COMPLETE -->

R2 一致性审查:
  📖 output/chapters/draft/chXX-draft.md + 长记忆文件
  ✏️ output/reviews/chXX-r2.md
  完成标记: <!-- R2_CONSISTENCY_REVIEW_COMPLETE -->

R3 内容审查:
  📖 output/chapters/draft/chXX-draft.md + style-guide
  ✏️ output/reviews/chXX-r3.md
  完成标记: <!-- R3_CONTENT_REVIEW_COMPLETE -->

→ 三审完成后，主编排合并为:
  ✏️ output/reviews/chXX-review.md
  完成标记: <!-- REVIEW_COMPLETE -->
```

#### Step 4: 读者评审团（RS + RE + RH 并行）

```
三类模拟读者并行评审:

RS {{读者画像_学生}}: 评估学习曲线
RE {{读者画像_工程师}}: 评估实用价值
RH {{读者画像_高手}}: 评估技术深度

输入: output/chapters/draft/chXX-draft.md + output/reviews/chXX-review.md
输出: output/reviews/chXX-panel.md
完成标记: <!-- READER_PANEL_COMPLETE -->
```

### 章间长记忆更新

每章完成Step 4后，主编排执行:

```
1. output/memory/chapter-summaries.md ← 追加本章摘要（200-300字）
2. output/memory/glossary.md          ← 追加本章新增术语
3. output/memory/metaphor-registry.md ← 追加本章新增比喻/类比
4. output/memory/cross-references.md  ← 追加本章的交叉引用点
```

### 并行策略

同一批次内的章节可并行执行完整的4步流水线。
批次间严格串行——后续批次依赖前序批次的长记忆更新。
详见 `parallel-strategy.md`。

### Phase 3 交接清单

- [ ] 所有{{章节数}}章的 output/research/ 文件完成且有RESEARCH_COMPLETE标记
- [ ] 所有{{章节数}}章的 output/chapters/draft/ 文件完成且有DRAFT_COMPLETE标记
- [ ] 所有{{章节数}}章的 output/reviews/ 合并文件完成且有REVIEW_COMPLETE标记
- [ ] 所有{{章节数}}章的 output/reviews/ 文件完成且有READER_PANEL_COMPLETE标记
- [ ] output/memory/ 下的追加文件已更新至最新
- [ ] checkpoint.md 状态矩阵全部为✅

---

## Phase 4: 统稿与最终审计

### 参与Agent

| Agent | 角色代号 | 职责 |
|-------|---------|------|
| 主编排 | #0 | 全书统稿协调 |
| R1 源码审查 | R1 | 全书代码准确性最终验证 |
| R2 一致性审查 | R2 | 全书术语/比喻一致性最终验证 |
| R3 内容审查 | R3 | 全书敏感性/可读性最终验证 |

### 执行步骤

```
Step 4.1  全书通读与统稿
          ├── 逐章检查行文连贯性
          ├── 统一过渡段落
          └── 输出: output/chapters/final/chXX-final.md（最终定稿版本，每章一个）

Step 4.2  交叉引用验证
          ├── 读取: output/memory/cross-references.md
          ├── 验证所有"参见第X章"引用的正确性
          └── 修正错误引用

Step 4.3  术语一致性最终检查
          ├── 读取: output/memory/glossary.md
          ├── 全书搜索术语使用是否一致
          └── 修正不一致处

Step 4.4  敏感性全面排查
          ├── R3对全书做最终敏感性扫描
          ├── 关注: {{敏感性检查项}}
          └── 输出: output/memory/final-audit-report.md
```

### 产出清单

| 文件 | 说明 |
|------|------|
| `output/chapters/final/ch01-final.md` ~ `output/chapters/final/ch{{章节数}}-final.md` | 最终定稿 |
| `output/memory/final-audit-report.md` | 最终审计报告 |

### Phase 4 交接清单

- [ ] output/chapters/final/ 下所有章节文件已生成
- [ ] 交叉引用全部验证通过
- [ ] 术语一致性检查通过
- [ ] 敏感性排查通过
- [ ] output/memory/final-audit-report.md 无❌项

---

## Phase 5: HTML装帧与发布

### 参与Agent

| Agent | 角色代号 | 职责 |
|-------|---------|------|
| 装帧工人 | #11 | Markdown→HTML全流程转换，EPUB生成 |
| 质检员 | #12 | EPUB产出物程序化质检，路由修复工单 |

### 执行步骤

```
Step 5.1  Markdown → HTML 转换
          ├── 读取: output/chapters/final/*.md
          ├── 应用HTML模板
          └── 输出: output/publish/chXX.html

Step 5.2  代码块高亮
          ├── 对所有代码块应用语法高亮
          └── 支持语言: {{代码语言列表}}

Step 5.3  图表转换
          ├── ASCII图表 → SVG
          └── 嵌入HTML页面

Step 5.4  导航系统
          ├── 生成目录页: output/publish/index.html
          ├── 章节间前后导航链接
          └── 侧边栏目录

Step 5.5  样式美化
          ├── 应用CSS样式: output/publish/style.css
          ├── 响应式布局
          └── 代码块样式、引用样式、表格样式

Step 5.6  EPUB 质量检查（仅 EPUB 模式）
          ├── 读取: output/publish/{{epub文件名}}.epub
          ├── 执行 7 项检查:
          │     1. EPUB ZIP 结构（mimetype 第一且不压缩）
          │     2. XHTML XML 有效性（逐文件解析，报告错误位置）
          │     3. Mermaid SVG 文字颜色（检查白色文字）
          │     4. CSS 合规性（无 overflow-x:auto，th/td 含 word-break）
          │     5. 章节标题一致性（<title> == 第一个 <h1>）
          │     6. 封面完整性（cover.xhtml 和 cover.svg 存在，书脊第一项为封面）
          │     7. 导航完整性（nav.xhtml 和 toc.ncx 存在且条目完整）
          ├── 输出: output/publish/qa-report.md
          ├── 通过: 报告末尾追加 <!-- QA_PASSED -->
          └── 失败: 报告末尾追加 <!-- QA_FAILED -->，路由修复工单给 #11 或 #4
```

### 产出清单

| 文件 | 说明 |
|------|------|
| `output/publish/index.html` | 目录首页 |
| `output/publish/ch01.html` ~ `output/publish/ch{{章节数}}.html` | 各章HTML |
| `output/publish/style.css` | 全书样式表 |
| `output/publish/assets/` | 图表、图片等静态资源 |
| `output/publish/{{epub文件名}}.epub` | EPUB电子书（EPUB模式） |
| `output/publish/qa-report.md` | EPUB质检报告（EPUB模式） |

### Phase 5 交接清单

- [ ] 所有章节HTML已生成
- [ ] 导航系统可正常跳转
- [ ] 代码高亮渲染正常
- [ ] 在主流浏览器中显示正常
- [ ] 响应式布局在移动端正常
- [ ] （EPUB模式）`qa-report.md` 最后一行含 `<!-- QA_PASSED -->`

---

## 异常处理流程

### 审查不通过

```
触发条件: R1/R2/R3任一给出 ❌（严重问题）

处理流程:
  1. 主编排读取 output/reviews/chXX-review.md 中的❌项
  2. 将❌项连同原draft一起发送给作家(#4)
  3. 作家输出修订版: output/chapters/draft/chXX-draft-v2.md
  4. 重新触发对应的审查（仅重审给出❌的reviewer）
  5. 如果再次不通过，升级为人工干预

最大重试次数: {{最大审查重试次数，默认2}}
```

### 字数不达标

```
触发条件: 初稿字数 < {{每章目标字数}} × 0.8 或 > {{每章目标字数}} × 1.2

处理流程:
  字数不足:
    1. 主编排标记哪些section过于简略
    2. 作家(#4)针对性扩展指定section
    3. 重新计数

  字数超标:
    1. 主编排标记哪些section冗余
    2. 作家(#4)针对性精简
    3. 重新计数
```

### 连续失败

```
触发条件: 同一章节连续{{最大连续失败次数，默认3}}次操作失败

处理流程:
  1. 记录失败原因到 audit-log.md
  2. 跳过该章节，继续处理后续章节
  3. 在checkpoint.md中标记为 ⚠️ NEEDS_HUMAN_REVIEW
  4. 所有可处理章节完成后，汇总需人工介入的章节列表
```

---

## 完成标记体系

### 标记定义

每个标记以HTML注释形式追加在对应文件的**最后一行**:

```
<!-- RESEARCH_COMPLETE -->
<!-- DRAFT_COMPLETE -->
<!-- R1_CODE_REVIEW_COMPLETE -->
<!-- R2_CONSISTENCY_REVIEW_COMPLETE -->
<!-- R3_CONTENT_REVIEW_COMPLETE -->
<!-- REVIEW_COMPLETE -->
<!-- READER_PANEL_COMPLETE -->
<!-- CHAPTER_FINAL -->
<!-- HTML_COMPLETE -->
<!-- BOOKBINDING_COMPLETE -->
<!-- QA_PASSED -->
<!-- QA_FAILED -->
```

### 标记流转

```
研究完成            写作完成            三审各自完成              合并完成
RESEARCH     ───▶  DRAFT      ───▶  R1_CODE_REVIEW      ───▶  REVIEW
_COMPLETE          _COMPLETE         R2_CONSISTENCY_REVIEW      _COMPLETE
                                     R3_CONTENT_REVIEW

                                                    读者评审完成
                                               ───▶ READER_PANEL
                                                     _COMPLETE

统稿定稿            HTML完成
CHAPTER      ───▶  HTML
_FINAL              _COMPLETE
```

### 标记检测方法

```bash
# 检测单个文件的完成标记
grep -l "RESEARCH_COMPLETE" output/research/ch*.md

# 检测所有章节的写作完成状态
for f in output/chapters/draft/ch*-draft.md; do
  if grep -q "DRAFT_COMPLETE" "$f"; then
    echo "✅ $f"
  else
    echo "❌ $f"
  fi
done

# 生成全书进度矩阵
# 详见 recovery.md 中的 checkpoint.md 格式
```

---

## Phase间交接清单汇总

| Phase | 交接前必须确认 | 确认方式 |
|-------|---------------|---------|
| 1→2 | output/memory/outline.md存在且经用户确认 | 文件存在 + 用户口头确认 |
| 2→3 | output/memory/下5个文件全部创建 | 文件存在检查 |
| 3→4 | 所有章节4步流水线完成 | checkpoint.md全✅ |
| 4→5 | output/chapters/final/下所有章节定稿 + 审计报告无❌ | 文件存在 + 标记检测 |
| 5→发布 | output/publish/下所有HTML + 导航可用；（EPUB模式）qa-report.md含`QA_PASSED` | 文件存在 + 浏览器验证 + 标记检测 |

---

## 附录: Agent角色速查表

| 代号 | 角色 | 参与Phase | Agent类型 |
|------|------|----------|-----------|
| #0 | 主编排 | 2, 3, 4 | 用户自身/脚本 |
| #1 | 架构师 | 1 | general-purpose |
| #2 | 读者代言人 | 1 | general-purpose |
| #3 | 研究员 | 3 | explore |
| #4 | 作家 | 3 | general-purpose |
| R1 | 源码审查 | 3, 4 | explore |
| R2 | 一致性审查 | 3, 4 | explore |
| R3 | 内容审查 | 1, 3, 4 | general-purpose |
| RS | 读者-{{读者画像_学生}} | 3 | explore |
| RE | 读者-{{读者画像_工程师}} | 3 | explore |
| RH | 读者-{{读者画像_高手}} | 3 | explore |
| #11 | 装帧工人 | 5 | general-purpose |
| #12 | 质检员 | 5 | general-purpose |
