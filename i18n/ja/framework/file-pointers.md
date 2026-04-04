<!--
  Translation status:
  Source file : framework/file-pointers.md
  Source commit: 7685751
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **言語 / Language**: [简体中文](../../../framework/file-pointers.md) · [English](../../en/framework/file-pointers.md) · **日本語** · [繁體中文](../../zh-TW/framework/file-pointers.md)

---

# ステートレスAgent記憶プロトコル（File Pointers）

> **フレームワークドキュメント** — マルチエージェント協調システムのコア記憶機構
> これはフレームワーク全体の中で**最も重要な**設計ドキュメントです。このドキュメントを理解することが、システム全体を理解する前提となります。

---

## 1. コアとなる問題

### ステートレスという困難

AI Agentは**ステートレス**です。毎回の呼び出しはゼロから始まります——前回の対話の記憶も、以前の章の印象も、書籍全体の感覚も持ちません。

しかし技術書籍の執筆は**本質的にステートフル**です:

- 第5章で使う用語は第2章と一致していなければならない
- 第8章の比喩は第3章の比喩と矛盾してはならない
- 第12章は第4章で紹介した概念を参照する必要がある
- レビュアーは初稿の正確性を検証するためにソースコードの実際の挙動を知る必要がある

```
传统（有状态）写作:
  人类作者 ──── 大脑记忆 ──── 跨章节连续性 ✅

AI Agent写作:
  Agent调用1 ──── 无记忆 ──── 下一次调用
  Agent调用2 ──── 无记忆 ──── 下一次调用
  ...
  每次调用都是一个"失忆"的新个体 ❌
```

### なぜこれが重要なのか

この問題を解決しなければ:
- 同じ概念が異なる章で異なる名前を持つ可能性がある
- 同じ比喩が繰り返し使われたり、前後で矛盾したりする
- コードサンプルがソースコードの実際の動作と一致しない
- 前後の章間に繋がりや呼応がなくなる

---

## 2. 解決策: File Pointers

### コアコンセプト

> **Agent内部で状態を維持するのではなく、状態をファイルシステムに外部化する。**
> **Agentを呼び出すたびに、正確なファイルパスのリストを通じて、何を読むべきか・何を書くべきかを伝える。**

これらの正確なファイルパス参照を **File Pointers（ファイルポインタ）** と呼びます。

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

### File Pointersの3つの機能

1. **コンテキストの注入**: Agentが「記憶」を取得するために読むべきファイルを伝える
2. **出力の指定**: Agentが成果物を書き込むファイルを伝える
3. **責任の分離**: 異なるAgentはそれぞれの職責に関連するファイルのみを参照し、コンテキストの汚染を防ぐ

---

## 3. ファイルの分類

すべてのプロジェクトファイルは**ライフサイクル**に応じて3種類に分類されます:

### 3.1 静的ファイル（Static）

作成後に**変更されない**。すべてのAgentは読み取りのみで、書き込みは行いません。

| ファイル | 作成タイミング | 説明 |
|------|---------|------|
| `outline-final.md` | Phase 1終了 | 最終確定アウトライン |
| `source-map.md` | Phase 1終了 | ソースコードファイル→章マッピング |
| `meta/style-guide.md` | Phase 2 | ライティングスタイルガイド |

```
特点:
  - 一次写入，多次读取
  - 是全书的"宪法"，所有Agent必须遵守
  - 修改需要人工决策（相当于"修宪"）
```

### 3.2 追記ファイル（Append-only）

追加のみで削除なし、**各章完了後に新しいコンテンツを追記**。章間の連続性を保つ鍵となります。

| ファイル | 追記タイミング | 説明 |
|------|---------|------|
| `meta/chapter-summaries.md` | 各章完了後 | 各章200〜300字の要約 |
| `meta/glossary.md` | 各章完了後 | 新用語と定義 |
| `meta/metaphor-registry.md` | 各章完了後 | 新しい比喩・類比 |
| `meta/cross-references.md` | 各章完了後 | 新しい相互参照ポイント |
| `audit-log.md` | 異常発生時 | 操作ログ |

```
特点:
  - 随书籍进度不断增长
  - 是后续章节Agent的"长期记忆"
  - 严格追加，不修改已有内容（防止破坏前序章节的一致性）
  - 后续章节的Agent读取这些文件时，能"看到"前面所有章节积累的知识
```

### 3.3 上書きファイル（Overwritable）

書き込み時に**全量置換**。ライフサイクルは1章のみ。

| ファイルパターン | 書き込み者 | 説明 |
|----------|-------|------|
| `research/chXX-research.md` | リサーチャー #3 | 本章ソースコード分析 |
| `drafts/chXX-draft.md` | ライター #4 | 本章初稿 |
| `reviews/chXX-r1-code.md` | R1 | コードレビューレポート |
| `reviews/chXX-r2-consistency.md` | R2 | 一貫性レビューレポート |
| `reviews/chXX-r3-content.md` | R3 | コンテンツレビューレポート |
| `reviews/chXX-review.md` | メインオーケストレーター | 統合レビューレポート |
| `reader-feedback/chXX-panel.md` | メインオーケストレーター | 読者評価まとめ |

```
特点:
  - 每个章节独立的文件，不影响其他章节
  - 如果需要重做（如审查不通过），直接覆写即可
  - XX为两位数章节号: 01, 02, ..., {{章节数}}
```

---

## 4. 各AgentのFile Pointer設定表

### 全体像

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

### 4.1 リサーチャー（#3）

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

### 4.2 ライター（#4）

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

### 4.3 R1 コードレビュアー

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

### 4.4 R2 一貫性レビュアー

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

### 4.5 R3 コンテンツレビュアー

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

### 4.6 読者評価パネル（RS / RE / RH）

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

### 4.7 ブックバインダー（#11）

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

## 5. コンテキストウィンドウの管理

### 5.1 問題

Agentのタイプによってコンテキストウィンドウのサイズと特性が異なります。File Pointersはこれらの制限を考慮する必要があります。

### 5.2 Agentタイプとコンテキスト特性

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

### 5.3 コンテキスト予算の管理

各Agentのスケジューリングプロンプトを構成する際には、読み込むファイルの合計トークン数を見積もる必要があります:

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

### 5.4 コンテキストオーバーフローへの対処戦略

読み込む量がコンテキストウィンドウを超える可能性がある場合:

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

## 6. スケジューリングプロンプトテンプレート

### 6.1 汎用テンプレート

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

### 6.2 リサーチャープロンプトの例

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

### 6.3 ライタープロンプトの例

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

## 7. データフロー図

### 7.1 1章の完全なデータフロー

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

### 7.2 章をまたぐデータフロー

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

## 8. 設計原則まとめ

### 原則1: 暗黙より明示

各Agentが読み書きするファイルは**明示的にリストアップ**する必要があります。Agentが自分でファイルを発見することには頼りません。

### 原則2: 最小知識の原則

各Agentは自分の職責を果たすのに必要な**最小限のファイルセット**のみを参照します。干渉と幻覚（ハルシネーション）を減らすためです。

### 原則3: 書き込みの分離

同一時刻に、各ファイルへの書き込みは**最大1つのAgent**のみが行います。競合状態を防ぐためです。

### 原則4: 修正より追記を優先

長期記憶ファイルは追記モードを採用し、**既存のコンテンツを変更しない**ことで、過去の一貫性を保護します。

### 原則5: マーカーが証明となる

完了マーカーは唯一の信頼できる進捗証拠です——**ファイルが存在するだけでは完了を意味せず、マーカーが存在して初めて完了を意味します**。

---

## 付録: File Pointer早見マトリックス

| Agent | 読み込み | 書き込み |
|-------|------|------|
| アーキテクト #1 | 源码, outline-draft | outline-draft, source-map |
| リーダーアドボケイト #2 | outline-draft | outline-reader-feedback |
| リサーチャー #3 | source-map, outline-final, 源码 | research/chXX-research |
| ライター #4 | research/chXX, style-guide, summaries, glossary, metaphors | drafts/chXX-draft |
| R1 コードレビュアー | drafts/chXX, source-map, 源码 | reviews/chXX-r1-code |
| R2 一貫性レビュアー | drafts/chXX, summaries, glossary, metaphors, cross-refs | reviews/chXX-r2-consistency |
| R3 コンテンツレビュアー | drafts/chXX, style-guide | reviews/chXX-r3-content |
| RS/RE/RH 読者 | drafts/chXX, reviews/chXX-review | reader-feedback/chXX-panel |
| ブックバインダー #11 | chapters/chXX, style-guide | publish/chXX.html |
