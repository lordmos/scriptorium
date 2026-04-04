# 无状态Agent记忆协议（File Pointers）

> **框架文档** — 多Agent协作系统的核心记忆机制
> 这是整个框架中**最重要**的设计文档。理解此文档是理解整个系统的前提。

---

## 1. 核心问题

### 无状态的困境

AI Agent是**无状态**的。每次调用都从零开始——没有前次对话的记忆，没有之前章节的印象，没有全书的整体感知。

但技术书籍写作**本质上是有状态的**:

- 第5章使用的术语必须与第2章一致
- 第8章的比喻不能与第3章的比喻冲突
- 第12章需要引用第4章介绍的概念
- 审查员需要知道源码的真实行为来验证草稿的准确性

```
传统（有状态）写作:
  人类作者 ──── 大脑记忆 ──── 跨章节连续性 ✅

AI Agent写作:
  Agent调用1 ──── 无记忆 ──── 下一次调用
  Agent调用2 ──── 无记忆 ──── 下一次调用
  ...
  每次调用都是一个"失忆"的新个体 ❌
```

### 为什么这很重要

如果不解决此问题:
- 同一概念在不同章节可能有不同名称
- 相同的比喻可能被重复使用，或前后矛盾
- 代码示例可能与源码实际行为不符
- 前后章节之间缺乏衔接和呼应

---

## 2. 解决方案: File Pointers

### 核心理念

> **不在Agent内部维护状态，而是将状态外化到文件系统。**
> **在每次调度Agent时，通过精确的文件路径列表，告诉它需要读什么、写什么。**

这些精确的文件路径引用就叫做 **File Pointers（文件指针）**。

```
┌─────────────────────────────────────────────────┐
│              主编排 Prompt                        │
│                                                   │
│  "你是作家Agent，负责撰写第5章。                     │
│                                                   │
│   📖 读取以下文件获取上下文:                         │
│   - output/memory/chapter-summaries.md (了解前4章内容)       │
│   - output/memory/glossary.md (已有术语，保持一致)            │
│   - output/memory/metaphor-registry.md (已用比喻，避免重复)   │
│   - output/memory/style-guide.md (写作风格要求)               │
│   - output/research/ch05-report.md (本章研究报告)         │
│                                                   │
│   ✏️ 输出到:                                       │
│   - output/chapters/draft/ch05-draft.md"                          │
│                                                   │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│    作家Agent #4      │
│                      │
│  读取5个文件          │
│  理解上下文           │
│  撰写第5章            │
│  写入draft文件        │
│                      │
│  （本次调用结束后     │
│    Agent"失忆"，      │
│    但文件系统保留     │
│    了所有成果）       │
└─────────────────────┘
```

### File Pointers 的三大功能

1. **注入上下文**: 告诉Agent需要读取哪些文件来获取"记忆"
2. **指定输出**: 告诉Agent需要将成果写入哪个文件
3. **隔离职责**: 不同Agent只看到与自己职责相关的文件，避免上下文污染

---

## 3. 文件分类

所有项目文件按**生命周期**分为三类:

### 3.1 静态文件（Static）

创建后**不再修改**。所有Agent只读取，不写入。

| 文件 | 创建时机 | 说明 |
|------|---------|------|
| `output/memory/outline.md` | Phase 1结束 | 最终定稿大纲 |
| `output/memory/source-map.md` | Phase 1结束 | 源码文件→章节映射 |
| `output/memory/style-guide.md` | Phase 2 | 写作风格指南 |

```
特点:
  - 一次写入，多次读取
  - 是全书的"宪法"，所有Agent必须遵守
  - 修改需要人工决策（相当于"修宪"）
```

### 3.2 追加文件（Append-only）

只增不删，**每章完成后追加新内容**。是跨章节连续性的关键。

| 文件 | 追加时机 | 说明 |
|------|---------|------|
| `output/memory/chapter-summaries.md` | 每章完成后 | 各章200-300字摘要 |
| `output/memory/glossary.md` | 每章完成后 | 新增术语及定义 |
| `output/memory/metaphor-registry.md` | 每章完成后 | 新增比喻/类比 |
| `output/memory/cross-references.md` | 每章完成后 | 新增交叉引用点 |
| `audit-log.md` | 任何异常时 | 操作日志 |

```
特点:
  - 随书籍进度不断增长
  - 是后续章节Agent的"长期记忆"
  - 严格追加，不修改已有内容（防止破坏前序章节的一致性）
  - 后续章节的Agent读取这些文件时，能"看到"前面所有章节积累的知识
```

### 3.3 可覆写文件（Overwritable）

每次写入时**全量替换**。生命周期仅限单章。

| 文件模式 | 写入者 | 说明 |
|----------|-------|------|
| `output/research/chXX-report.md` | 研究员 #3 | 本章源码分析 |
| `output/chapters/draft/chXX-draft.md` | 作家 #4 | 本章初稿 |
| `output/reviews/chXX-r1.md` | R1 | 源码审查报告 |
| `output/reviews/chXX-r2.md` | R2 | 一致性审查报告 |
| `output/reviews/chXX-r3.md` | R3 | 内容审查报告 |
| `output/reviews/chXX-review.md` | 主编排 | 合并审查报告 |
| `output/reviews/chXX-panel.md` | 主编排 | 读者评审合并 |

```
特点:
  - 每个章节独立的文件，不影响其他章节
  - 如果需要重做（如审查不通过），直接覆写即可
  - XX为两位数章节号: 01, 02, ..., {{章节数}}
```

---

## 4. 每个Agent的File Pointer配置表

### 总览图

```
                        ┌──────────────┐
                        │  静态文件     │
                        │ outline      │
                        │ source-map   │
                        │ style-guide  │
                        └──────┬───────┘
                               │ 读取
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ 研究员#3  │    │ 作家#4   │    │ R1/R2/R3 │
        └────┬─────┘    └────┬─────┘    └────┬─────┘
             │写入            │写入           │写入
             ▼                ▼               ▼
        output/research/        output/chapters/draft/          output/reviews/
        chXX-report      chXX-draft       chXX-r{1,2,3}
                              │
                              │ 读取
                              ▼
                        ┌──────────────┐
                        │  追加文件     │
                        │ summaries    │
                        │ glossary     │◀─── 每章完成后更新
                        │ metaphors    │
                        │ cross-refs   │
                        └──────────────┘
```

### 4.1 研究员（#3）

```
角色: 深度分析源码，为作家提供素材
Agent类型: explore

📖 读取:
  - output/memory/source-map.md              — 定位本章对应的源码文件
  - output/memory/outline.md           — 获取本章的写作要求和范围
  - {{源码根目录}}/{{文件路径}} — 实际源码文件（根据source-map定位）

✏️ 写入:
  - output/research/chXX-report.md  — 源码分析报告

⚠️ 不读取:
  - 长记忆文件（summaries, glossary等）—— 研究员只关注源码事实
  - 其他章节的draft或research —— 避免交叉影响
```

### 4.2 作家（#4）

```
角色: 将研究报告转化为可读的书籍章节
Agent类型: general-purpose

📖 读取:
  - output/research/chXX-report.md    — 本章的源码研究报告
  - output/memory/style-guide.md          — 写作风格要求
  - output/memory/chapter-summaries.md    — 前序章节摘要（获取"记忆"）
  - output/memory/glossary.md             — 已有术语（保持一致）
  - output/memory/metaphor-registry.md   — 已用比喻（避免重复）
  - output/memory/outline.md             — 本章的大纲要求

✏️ 写入:
  - output/chapters/draft/chXX-draft.md        — 章节初稿

⚠️ 不读取:
  - 源码文件 —— 作家通过研究报告间接了解源码
  - 其他章节的draft —— 通过chapter-summaries间接了解
```

### 4.3 R1 源码审查

```
角色: 验证章节中代码描述的准确性
Agent类型: explore

📖 读取:
  - output/chapters/draft/chXX-draft.md          — 待审查的初稿
  - output/memory/source-map.md                 — 定位相关源码文件
  - {{源码根目录}}/{{文件路径}}    — 实际源码文件

✏️ 写入:
  - output/reviews/chXX-r1.md      — 源码准确性审查报告

⚠️ 不读取:
  - 长记忆文件 —— R1只关注"代码是否正确"
  - style-guide —— R1不审查写作风格
```

### 4.4 R2 一致性审查

```
角色: 验证本章与全书其他章节的一致性
Agent类型: explore

📖 读取:
  - output/chapters/draft/chXX-draft.md          — 待审查的初稿
  - output/memory/chapter-summaries.md     — 前序章节摘要
  - output/memory/glossary.md              — 术语表
  - output/memory/metaphor-registry.md    — 比喻注册表
  - output/memory/cross-references.md     — 交叉引用表

✏️ 写入:
  - output/reviews/chXX-r2.md — 一致性审查报告

⚠️ 不读取:
  - 源码文件 —— R2不关注代码正确性
  - style-guide —— R2不关注写作风格
```

### 4.5 R3 内容审查

```
角色: 验证可读性、{{敏感性检查项}}、写作质量
Agent类型: general-purpose

📖 读取:
  - output/chapters/draft/chXX-draft.md     — 待审查的初稿
  - output/memory/style-guide.md      — 写作风格指南

✏️ 写入:
  - output/reviews/chXX-r3.md — 内容审查报告

⚠️ 不读取:
  - 源码文件 —— R3不验证代码
  - 长记忆文件 —— R3不检查跨章一致性
```

### 4.6 读者评审团（RS / RE / RH）

```
角色: 从不同读者视角评估阅读体验
Agent类型: explore

📖 读取:
  - output/chapters/draft/chXX-draft.md          — 待评审的初稿
  - output/reviews/chXX-review.md        — 审查组的合并报告
  - output/memory/outline.md              — 本章的目标定位

✏️ 输出:
  - 各自的评审意见（由主编排合并为 output/reviews/chXX-panel.md）

三种读者画像:
  RS: {{读者画像_学生}} — 关注学习曲线、前置知识假设
  RE: {{读者画像_工程师}} — 关注实用价值、可操作性
  RH: {{读者画像_高手}} — 关注技术深度、高级用法
```

### 4.7 装帧工人（#11）

```
角色: 将Markdown转换为发布用HTML
Agent类型: general-purpose

📖 读取:
  - output/chapters/final/chXX-final.md          — 最终定稿的章节
  - output/memory/style-guide.md       — 获取样式相关配置

✏️ 写入:
  - output/publish/chXX.html         — HTML页面
  - output/publish/style.css         — 样式表（仅首次）
  - output/publish/index.html        — 目录页（仅最后）
```

---

## 5. 上下文窗口管理

### 5.1 问题

不同Agent类型有不同的上下文窗口大小和能力特征。File Pointers必须考虑这些限制。

### 5.2 Agent类型与上下文特征

```
┌──────────────────┬──────────────────────────────────────────┐
│ Agent类型         │ 特征                                     │
├──────────────────┼──────────────────────────────────────────┤
│ explore          │ 适合只读调研任务                           │
│                  │ 可访问大量文件，擅长搜索和提取信息            │
│                  │ 不适合复杂写作或长文本生成                   │
│                  │ 用于: 研究员#3, R1, R2, RS/RE/RH          │
├──────────────────┼──────────────────────────────────────────┤
│ general-purpose  │ 适合需要深度推理和复杂输出的任务             │
│                  │ 上下文窗口较大，能处理长文本                  │
│                  │ 适合写作、审查、代码分析                     │
│                  │ 用于: 架构师#1, 作家#4, R3, 装帧工人#11     │
└──────────────────┴──────────────────────────────────────────┘
```

### 5.3 上下文预算管理

在构造每个Agent的调度prompt时，需要估算读取文件的总token数:

```
上下文预算 = Agent上下文窗口 - 系统prompt - 输出预留

示例（作家#4写作第10章时）:
  output/memory/style-guide.md          ≈ 2K tokens
  output/memory/chapter-summaries.md    ≈ 9K tokens (前9章×1K/章)
  output/memory/glossary.md             ≈ 3K tokens
  output/memory/metaphor-registry.md   ≈ 1K tokens
  output/research/ch10-report.md   ≈ 5K tokens
  output/memory/outline.md (本章部分)  ≈ 1K tokens
  ──────────────────────────────────────
  总读取量                     ≈ 21K tokens
  输出预留（{{每章目标字数}}字） ≈ 10-15K tokens
  系统prompt                   ≈ 2K tokens
  ──────────────────────────────────────
  总需求                       ≈ 38K tokens
```

### 5.4 上下文溢出应对策略

当读取量可能超出上下文窗口时:

```
策略1: 摘要替代原文
  - chapter-summaries 只读最近N章的完整摘要
  - 更早的章节只保留一句话概要

策略2: 按需加载
  - glossary 只加载与本章相关的术语段
  - source-map 只加载本章对应的部分

策略3: 分步执行
  - 将一次大任务拆分为多个小任务
  - 每个小任务只加载必需的文件子集

策略4: 精简指令
  - 在prompt中明确要求Agent优先读取哪些文件
  - 次要文件标注"如有剩余上下文空间再读"
```

---

## 6. 调度Prompt模板

### 6.1 通用模板

```markdown
你是{{角色名}}，负责{{职责描述}}。

当前任务: {{项目名称}} 第{{章节号}}章 — {{章节标题}}

---

**必须阅读的文件（File Pointers）:**
- 📖 读取: {{文件路径1}} — {{用途说明}}
- 📖 读取: {{文件路径2}} — {{用途说明}}
- 📖 读取: {{文件路径3}} — {{用途说明}}

**必须输出的文件:**
- ✏️ 写入: {{输出路径}} — {{格式要求}}

**质量标准:**
- {{标准1}}
- {{标准2}}
- {{标准3}}

**完成标记:**
在文件最后一行追加: <!-- {{标记名}} -->
```

### 6.2 研究员Prompt示例

```markdown
你是研究员，负责深度分析源码为写作提供素材。

当前任务: {{项目名称}} 第{{章节号}}章 — {{章节标题}}

---

**必须阅读的文件（File Pointers）:**
- 📖 读取: output/memory/source-map.md — 定位本章对应的源码文件
- 📖 读取: output/memory/outline.md — 获取本章的写作要求
- 📖 读取: {{源码根目录}}/{{源码文件1}} — 核心源码
- 📖 读取: {{源码根目录}}/{{源码文件2}} — 相关源码

**必须输出的文件:**
- ✏️ 写入: output/research/ch{{章节号}}-report.md

**输出格式要求:**
1. 模块概述（本章涉及的源码模块整体功能）
2. 核心数据结构（列出关键type/struct/class）
3. 核心函数/方法（列出关键函数，说明输入输出和作用）
4. 执行流程（梳理主要代码路径）
5. 设计决策（分析为什么这样设计）
6. 写作素材建议（哪些点值得重点讲解）

**完成标记:**
在文件最后一行追加: <!-- RESEARCH_COMPLETE -->
```

### 6.3 作家Prompt示例

```markdown
你是作家，负责撰写技术书籍的章节内容。

当前任务: {{项目名称}} 第{{章节号}}章 — {{章节标题}}

---

**必须阅读的文件（File Pointers）:**
- 📖 读取: output/research/ch{{章节号}}-report.md — 本章研究报告（核心素材）
- 📖 读取: {{工作目录}}/output/memory/style-guide.md — 写作风格（必须遵守）
- 📖 读取: {{工作目录}}/output/memory/chapter-summaries.md — 前序章节摘要（保持连贯）
- 📖 读取: {{工作目录}}/output/memory/glossary.md — 已有术语（保持一致）
- 📖 读取: {{工作目录}}/output/memory/metaphor-registry.md — 已用比喻（避免重复）

**必须输出的文件:**
- ✏️ 写入: output/chapters/draft/ch{{章节号}}-draft.md

**质量标准:**
- 字数: {{每章目标字数}}字 ± 20%
- 代码示例必须基于研究报告中的真实源码
- 术语使用必须与glossary一致
- 比喻不得与metaphor-registry中已有的重复
- 必须遵守style-guide中的所有写作规范

**完成标记:**
在文件最后一行追加: <!-- DRAFT_COMPLETE -->
```

---

## 7. 数据流图

### 7.1 单章完整数据流

```
源码仓库                    静态文件                     追加文件
{{源码根目录}}/         output/memory/outline.md             output/memory/chapter-summaries.md
                        output/memory/source-map.md                output/memory/glossary.md
                        output/memory/style-guide.md          output/memory/metaphor-registry.md
     │                       │                            │
     │    ┌──────────────────┤                            │
     ▼    ▼                  │                            │
┌──────────────┐             │                            │
│  研究员 #3    │             │                            │
│              │             │                            │
│ 读: 源码      │             │                            │
│ 读: source-map│             │                            │
│ 读: outline   │             │                            │
│              │             │                            │
│ 写: output/research/ │             │                            │
│    chXX-     │             │                            │
│    report    │             │                            │
└──────┬───────┘             │                            │
       │                     │                            │
       ▼                     ▼                            ▼
┌──────────────────────────────────────────────────────────┐
│  作家 #4                                                  │
│                                                           │
│  读: output/research/chXX-report.md                            │
│  读: style-guide.md                                       │
│  读: chapter-summaries.md   ◀── 这就是"长期记忆"          │
│  读: glossary.md                                          │
│  读: metaphor-registry.md                                 │
│                                                           │
│  写: output/chapters/draft/chXX-draft.md                                 │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│        三审并行 (R1 + R2 + R3)            │
│                                           │
│  R1: 读[draft+源码]     → r1-code.md      │
│  R2: 读[draft+长记忆]   → r2-consistency  │
│  R3: 读[draft+style]   → r3-content.md   │
│                                           │
│  → 合并: output/reviews/chXX-review.md           │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│     读者评审团 (RS + RE + RH)              │
│                                           │
│  读: draft + review                       │
│  写: output/reviews/chXX-panel.md        │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│     主编排: 更新长记忆                      │
│                                           │
│  chapter-summaries.md  ← 追加本章摘要      │
│  glossary.md           ← 追加新术语        │
│  metaphor-registry.md  ← 追加新比喻        │
│  cross-references.md   ← 追加交叉引用      │
└──────────────────────────────────────────┘
```

### 7.2 跨章数据流

```
Chapter 1                  Chapter 2                  Chapter N
┌──────────┐              ┌──────────┐              ┌──────────┐
│研究→写作  │              │研究→写作  │              │研究→写作  │
│→审查→评审 │              │→审查→评审 │              │→审查→评审 │
└────┬─────┘              └────┬─────┘              └────┬─────┘
     │                         │                         │
     ▼                         ▼                         ▼
  更新长记忆                 更新长记忆                  更新长记忆
     │                         │                         │
     ▼                         ▼                         ▼
┌─────────┐    传递     ┌─────────┐    传递      ┌─────────┐
│summaries│───────────▶│summaries│───────────▶ │summaries│
│(1章)    │            │(1-2章)  │              │(1-N章)  │
│glossary │───────────▶│glossary │───────────▶ │glossary │
│metaphors│───────────▶│metaphors│───────────▶ │metaphors│
└─────────┘            └─────────┘              └─────────┘

关键: 每章完成后追加长记忆 → 下一章的作家读取时就能"看到"前面所有章节的积累
这就是 File Pointers 实现"记忆传递"的核心机制。
```

---

## 8. 设计原则总结

### 原则1: 显式优于隐式

每个Agent需要读取和写入的文件都必须**显式列出**，不依赖Agent自行发现。

### 原则2: 最小知识原则

每个Agent只看到完成其职责所需的**最小文件集合**，减少干扰和幻觉。

### 原则3: 写入隔离

同一时间，每个文件最多只有**一个Agent写入**，避免竞争条件。

### 原则4: 追加优于修改

长记忆文件采用追加模式，**从不修改已有内容**，保护历史一致性。

### 原则5: 标记即证明

完成标记是唯一可信的进度证据——**文件存在不代表完成，标记存在才代表完成**。

---

## 附录: File Pointer速查矩阵

| Agent | 读取 | 写入 |
|-------|------|------|
| 架构师 #1 | 源码 | output/memory/outline.md, output/memory/source-map.md |
| 读者代言人 #2 | output/memory/outline.md | output/reviews/outline-reader-feedback.md |
| 研究员 #3 | output/memory/source-map.md, output/memory/outline.md, 源码 | output/research/chXX-report.md |
| 作家 #4 | output/research/chXX-report.md, output/memory/style-guide.md, summaries, glossary, metaphors | output/chapters/draft/chXX-draft.md |
| R1 源码审查 | output/chapters/draft/chXX-draft.md, output/memory/source-map.md, 源码 | output/reviews/chXX-r1.md |
| R2 一致性审查 | output/chapters/draft/chXX-draft.md, summaries, glossary, metaphors, cross-refs | output/reviews/chXX-r2.md |
| R3 内容审查 | output/chapters/draft/chXX-draft.md, output/memory/style-guide.md | output/reviews/chXX-r3.md |
| RS/RE/RH 读者 | output/chapters/draft/chXX-draft.md, output/reviews/chXX-review.md | output/reviews/chXX-panel.md |
| 装帧工人 #11 | output/chapters/final/chXX-final, output/memory/style-guide.md | output/publish/chXX.html |
