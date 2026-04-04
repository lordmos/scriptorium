<!--
  Translation status:
  Source file : framework/file-pointers.md
  Source commit: 7685751
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **語言 / Language**: [简体中文](../../../framework/file-pointers.md) · [English](../../en/framework/file-pointers.md) · [日本語](../../ja/framework/file-pointers.md) · **繁體中文**

---

# 無狀態Agent記憶協議（File Pointers）

> **框架文檔** — 多Agent協作系統的核心記憶機制
> 這是整個框架中**最重要**的設計文檔。理解此文檔是理解整個系統的前提。

---

## 1. 核心問題

### 無狀態的困境

AI Agent是**無狀態**的。每次調用都從零開始——沒有前次對話的記憶，沒有之前章節的印象，沒有全書的整體感知。

但技術書籍寫作**本質上是有狀態的**:

- 第5章使用的術語必須與第2章一致
- 第8章的比喻不能與第3章的比喻衝突
- 第12章需要引用第4章介紹的概念
- 審查員需要知道源碼的真實行爲來驗證草稿的準確性

```
传统（有状态）写作:
  人类作者 ──── 大脑记忆 ──── 跨章节连续性 ✅

AI Agent写作:
  Agent调用1 ──── 无记忆 ──── 下一次调用
  Agent调用2 ──── 无记忆 ──── 下一次调用
  ...
  每次调用都是一个"失忆"的新个体 ❌
```

### 爲什麼這很重要

如果不解決此問題:
- 同一概念在不同章節可能有不同名稱
- 相同的比喻可能被重複使用，或前後矛盾
- 代碼示例可能與源碼實際行爲不符
- 前後章節之間缺乏銜接和呼應

---

## 2. 解決方案: File Pointers

### 核心理念

> **不在Agent內部維護狀態，而是將狀態外化到文件系統。**
> **在每次調度Agent時，通過精確的文件路徑列表，告訴它需要讀什麼、寫什麼。**

這些精確的文件路徑引用就叫做 **File Pointers（文件指針）**。

```
┌─────────────────────────────────────────────────┐
│              主编排 Prompt                        │
│                                                   │
│  "你是作家Agent，负责撰写第5章。                     │
│                                                   │
│   📖 读取以下文件获取上下文:                         │
│   - meta/chapter-summaries.md (了解前4章内容)       │
│   - meta/glossary.md (已有术语，保持一致)            │
│   - meta/metaphor-registry.md (已用比喻，避免重复)   │
│   - meta/style-guide.md (写作风格要求)               │
│   - research/ch05-research.md (本章研究报告)         │
│                                                   │
│   ✏️ 输出到:                                       │
│   - drafts/ch05-draft.md"                          │
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

1. **注入上下文**: 告訴Agent需要讀取哪些文件來獲取"記憶"
2. **指定輸出**: 告訴Agent需要將成果寫入哪個文件
3. **隔離職責**: 不同Agent只看到與自己職責相關的文件，避免上下文污染

---

## 3. 文件分類

所有項目文件按**生命週期**分爲三類:

### 3.1 靜態文件（Static）

創建後**不再修改**。所有Agent只讀取，不寫入。

| 文件 | 創建時機 | 說明 |
|------|---------|------|
| `outline-final.md` | Phase 1結束 | 最終定稿大綱 |
| `source-map.md` | Phase 1結束 | 源碼文件→章節映射 |
| `meta/style-guide.md` | Phase 2 | 寫作風格指南 |

```
特点:
  - 一次写入，多次读取
  - 是全书的"宪法"，所有Agent必须遵守
  - 修改需要人工决策（相当于"修宪"）
```

### 3.2 追加文件（Append-only）

只增不刪，**每章完成後追加新內容**。是跨章節連續性的關鍵。

| 文件 | 追加時機 | 說明 |
|------|---------|------|
| `meta/chapter-summaries.md` | 每章完成後 | 各章200-300字摘要 |
| `meta/glossary.md` | 每章完成後 | 新增術語及定義 |
| `meta/metaphor-registry.md` | 每章完成後 | 新增比喻/類比 |
| `meta/cross-references.md` | 每章完成後 | 新增交叉引用點 |
| `audit-log.md` | 任何異常時 | 操作日誌 |

```
特点:
  - 随书籍进度不断增长
  - 是后续章节Agent的"长期记忆"
  - 严格追加，不修改已有内容（防止破坏前序章节的一致性）
  - 后续章节的Agent读取这些文件时，能"看到"前面所有章节积累的知识
```

### 3.3 可覆寫文件（Overwritable）

每次寫入時**全量替換**。生命週期僅限單章。

| 文件模式 | 寫入者 | 說明 |
|----------|-------|------|
| `research/chXX-research.md` | 研究員 #3 | 本章源碼分析 |
| `drafts/chXX-draft.md` | 作家 #4 | 本章初稿 |
| `reviews/chXX-r1-code.md` | R1 | 源碼審查報告 |
| `reviews/chXX-r2-consistency.md` | R2 | 一致性審查報告 |
| `reviews/chXX-r3-content.md` | R3 | 內容審查報告 |
| `reviews/chXX-review.md` | 主編排 | 合併審查報告 |
| `reader-feedback/chXX-panel.md` | 主編排 | 讀者評審合併 |

```
特点:
  - 每个章节独立的文件，不影响其他章节
  - 如果需要重做（如审查不通过），直接覆写即可
  - XX为两位数章节号: 01, 02, ..., {{章节数}}
```

---

## 4. 每個Agent的File Pointer配置表

### 總覽圖

```
                        ┌──────────────┐
                        │  静态文件     │
                        │ outline-final│
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
        research/        drafts/          reviews/
        chXX-research    chXX-draft       chXX-r{1,2,3}
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

### 4.1 研究員（#3）

```
角色: 深度分析源码，为作家提供素材
Agent类型: explore

📖 读取:
  - source-map.md              — 定位本章对应的源码文件
  - outline-final.md           — 获取本章的写作要求和范围
  - {{源码根目录}}/{{文件路径}} — 实际源码文件（根据source-map定位）

✏️ 写入:
  - research/chXX-research.md  — 源码分析报告

⚠️ 不读取:
  - 长记忆文件（summaries, glossary等）—— 研究员只关注源码事实
  - 其他章节的draft或research —— 避免交叉影响
```

### 4.2 作家（#4）

```
角色: 将研究报告转化为可读的书籍章节
Agent类型: general-purpose

📖 读取:
  - research/chXX-research.md    — 本章的源码研究报告
  - meta/style-guide.md          — 写作风格要求
  - meta/chapter-summaries.md    — 前序章节摘要（获取"记忆"）
  - meta/glossary.md             — 已有术语（保持一致）
  - meta/metaphor-registry.md   — 已用比喻（避免重复）
  - outline-final.md             — 本章的大纲要求

✏️ 写入:
  - drafts/chXX-draft.md        — 章节初稿

⚠️ 不读取:
  - 源码文件 —— 作家通过研究报告间接了解源码
  - 其他章节的draft —— 通过chapter-summaries间接了解
```

### 4.3 R1 源碼審查

```
角色: 验证章节中代码描述的准确性
Agent类型: explore

📖 读取:
  - drafts/chXX-draft.md          — 待审查的初稿
  - source-map.md                 — 定位相关源码文件
  - {{源码根目录}}/{{文件路径}}    — 实际源码文件

✏️ 写入:
  - reviews/chXX-r1-code.md      — 源码准确性审查报告

⚠️ 不读取:
  - 长记忆文件 —— R1只关注"代码是否正确"
  - style-guide —— R1不审查写作风格
```

### 4.4 R2 一致性審查

```
角色: 验证本章与全书其他章节的一致性
Agent类型: explore

📖 读取:
  - drafts/chXX-draft.md          — 待审查的初稿
  - meta/chapter-summaries.md     — 前序章节摘要
  - meta/glossary.md              — 术语表
  - meta/metaphor-registry.md    — 比喻注册表
  - meta/cross-references.md     — 交叉引用表

✏️ 写入:
  - reviews/chXX-r2-consistency.md — 一致性审查报告

⚠️ 不读取:
  - 源码文件 —— R2不关注代码正确性
  - style-guide —— R2不关注写作风格
```

### 4.5 R3 內容審查

```
角色: 验证可读性、{{敏感性检查项}}、写作质量
Agent类型: general-purpose

📖 读取:
  - drafts/chXX-draft.md     — 待审查的初稿
  - meta/style-guide.md      — 写作风格指南

✏️ 写入:
  - reviews/chXX-r3-content.md — 内容审查报告

⚠️ 不读取:
  - 源码文件 —— R3不验证代码
  - 长记忆文件 —— R3不检查跨章一致性
```

### 4.6 讀者評審團（RS / RE / RH）

```
角色: 从不同读者视角评估阅读体验
Agent类型: explore

📖 读取:
  - drafts/chXX-draft.md          — 待评审的初稿
  - reviews/chXX-review.md        — 审查组的合并报告
  - outline-final.md              — 本章的目标定位

✏️ 输出:
  - 各自的评审意见（由主编排合并为 reader-feedback/chXX-panel.md）

三种读者画像:
  RS: {{读者画像_学生}} — 关注学习曲线、前置知识假设
  RE: {{读者画像_工程师}} — 关注实用价值、可操作性
  RH: {{读者画像_高手}} — 关注技术深度、高级用法
```

### 4.7 裝幀工人（#11）

```
角色: 将Markdown转换为发布用HTML
Agent类型: general-purpose

📖 读取:
  - chapters/chXX.md          — 最终定稿的章节
  - meta/style-guide.md       — 获取样式相关配置

✏️ 写入:
  - publish/chXX.html         — HTML页面
  - publish/style.css         — 样式表（仅首次）
  - publish/index.html        — 目录页（仅最后）
```

---

## 5. 上下文窗口管理

### 5.1 問題

不同Agent類型有不同的上下文窗口大小和能力特徵。File Pointers必須考慮這些限制。

### 5.2 Agent類型與上下文特徵

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

### 5.3 上下文預算管理

在構造每個Agent的調度prompt時，需要估算讀取文件的總token數:

```
上下文预算 = Agent上下文窗口 - 系统prompt - 输出预留

示例（作家#4写作第10章时）:
  meta/style-guide.md          ≈ 2K tokens
  meta/chapter-summaries.md    ≈ 9K tokens (前9章×1K/章)
  meta/glossary.md             ≈ 3K tokens
  meta/metaphor-registry.md   ≈ 1K tokens
  research/ch10-research.md   ≈ 5K tokens
  outline-final.md (本章部分)  ≈ 1K tokens
  ──────────────────────────────────────
  总读取量                     ≈ 21K tokens
  输出预留（{{每章目标字数}}字） ≈ 10-15K tokens
  系统prompt                   ≈ 2K tokens
  ──────────────────────────────────────
  总需求                       ≈ 38K tokens
```

### 5.4 上下文溢出應對策略

當讀取量可能超出上下文窗口時:

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

## 6. 調度Prompt模板

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

### 6.2 研究員Prompt示例

```markdown
你是研究员，负责深度分析源码为写作提供素材。

当前任务: {{项目名称}} 第{{章节号}}章 — {{章节标题}}

---

**必须阅读的文件（File Pointers）:**
- 📖 读取: {{工作目录}}/source-map.md — 定位本章对应的源码文件
- 📖 读取: {{工作目录}}/outline-final.md — 获取本章的写作要求
- 📖 读取: {{源码根目录}}/{{源码文件1}} — 核心源码
- 📖 读取: {{源码根目录}}/{{源码文件2}} — 相关源码

**必须输出的文件:**
- ✏️ 写入: {{工作目录}}/research/ch{{章节号}}-research.md

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
- 📖 读取: {{工作目录}}/research/ch{{章节号}}-research.md — 本章研究报告（核心素材）
- 📖 读取: {{工作目录}}/meta/style-guide.md — 写作风格（必须遵守）
- 📖 读取: {{工作目录}}/meta/chapter-summaries.md — 前序章节摘要（保持连贯）
- 📖 读取: {{工作目录}}/meta/glossary.md — 已有术语（保持一致）
- 📖 读取: {{工作目录}}/meta/metaphor-registry.md — 已用比喻（避免重复）

**必须输出的文件:**
- ✏️ 写入: {{工作目录}}/drafts/ch{{章节号}}-draft.md

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

## 7. 數據流圖

### 7.1 單章完整數據流

```
源码仓库                    静态文件                     追加文件
{{源码根目录}}/         outline-final.md             meta/chapter-summaries.md
                        source-map.md                meta/glossary.md
                        meta/style-guide.md          meta/metaphor-registry.md
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
│ 写: research/ │             │                            │
│    chXX-     │             │                            │
│    research  │             │                            │
└──────┬───────┘             │                            │
       │                     │                            │
       ▼                     ▼                            ▼
┌──────────────────────────────────────────────────────────┐
│  作家 #4                                                  │
│                                                           │
│  读: research/chXX-research.md                            │
│  读: style-guide.md                                       │
│  读: chapter-summaries.md   ◀── 这就是"长期记忆"          │
│  读: glossary.md                                          │
│  读: metaphor-registry.md                                 │
│                                                           │
│  写: drafts/chXX-draft.md                                 │
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
│  → 合并: reviews/chXX-review.md           │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│     读者评审团 (RS + RE + RH)              │
│                                           │
│  读: draft + review                       │
│  写: reader-feedback/chXX-panel.md        │
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

### 7.2 跨章數據流

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

## 8. 設計原則總結

### 原則1: 顯式優於隱式

每個Agent需要讀取和寫入的文件都必須**顯式列出**，不依賴Agent自行發現。

### 原則2: 最小知識原則

每個Agent只看到完成其職責所需的**最小文件集合**，減少干擾和幻覺。

### 原則3: 寫入隔離

同一時間，每個文件最多隻有**一個Agent寫入**，避免競爭條件。

### 原則4: 追加優於修改

長記憶文件採用追加模式，**從不修改已有內容**，保護歷史一致性。

### 原則5: 標記即證明

完成標記是唯一可信的進度證據——**文件存在不代表完成，標記存在才代表完成**。

---

## 附錄: File Pointer速查矩陣

| Agent | 讀取 | 寫入 |
|-------|------|------|
| 架構師 #1 | 源碼, outline-draft | outline-draft, source-map |
| 讀者代言人 #2 | outline-draft | outline-reader-feedback |
| 研究員 #3 | source-map, outline-final, 源碼 | research/chXX-research |
| 作家 #4 | research/chXX, style-guide, summaries, glossary, metaphors | drafts/chXX-draft |
| R1 源碼審查 | drafts/chXX, source-map, 源碼 | reviews/chXX-r1-code |
| R2 一致性審查 | drafts/chXX, summaries, glossary, metaphors, cross-refs | reviews/chXX-r2-consistency |
| R3 內容審查 | drafts/chXX, style-guide | reviews/chXX-r3-content |
| RS/RE/RH 讀者 | drafts/chXX, reviews/chXX-review | reader-feedback/chXX-panel |
| 裝幀工人 #11 | chapters/chXX, style-guide | publish/chXX.html |
