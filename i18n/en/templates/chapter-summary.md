<!--
  Translation status:
  Source file : templates/chapter-summary.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../templates/chapter-summary.md) · **English** · [日本語](../../ja/templates/chapter-summary.md) · [繁體中文](../../zh-TW/templates/chapter-summary.md)

---

<!--
  ╔══════════════════════════════════════════════════════════════╗
  ║  Chapter Summary Template                                    ║
  ║                                                              ║
  ║  Purpose: This is the core file for long-term memory.        ║
  ║           After completing each chapter, append a ~300-word  ║
  ║           summary to this file. Writer Agents for subsequent ║
  ║           chapters will read this file to avoid repeating    ║
  ║           content, maintain cross-chapter coherence, and     ║
  ║           correctly reference earlier concepts.              ║
  ║                                                              ║
  ║  Why is this file needed?                                    ║
  ║  AI Agents have limited context windows and cannot read all  ║
  ║  completed chapters simultaneously. This file compresses     ║
  ║  each chapter's core information into a summary, enabling    ║
  ║  Agents to quickly understand "what has been written so far" ║
  ║  so they can:                                                ║
  ║  - Avoid re-explaining the same concept                      ║
  ║  - Make correct forward/backward references                  ║
  ║  - Maintain consistency in terminology and metaphors         ║
  ║  - Control the pacing of knowledge introduction              ║
  ║                                                              ║
  ║  Usage:                                                      ║
  ║  1. After finalizing each chapter, write and append a        ║
  ║     summary to this file                                     ║
  ║  2. Before starting a new chapter, the Writer Agent reads    ║
  ║     this file first                                          ║
  ║  3. Review Agents use this file to check cross-chapter       ║
  ║     consistency                                              ║
  ║  4. Once written, summaries are generally not modified       ║
  ║     (unless the corresponding chapter is substantially       ║
  ║     rewritten)                                               ║
  ╚══════════════════════════════════════════════════════════════╝
-->

# {{书名}} Chapter Summaries

## Usage Guide

### For Writer Agents

Before starting Chapter N, read all completed chapter summaries below, paying special attention to:

1. **Concepts already explained** — No need to re-explain from scratch; reference with "as described in Chapter X"
2. **Metaphors already used** — Stay consistent, or explicitly connect when extending them
3. **Terms already introduced** — Use the same translation; do not introduce synonyms that cause confusion
4. **Setups and foreshadowing** — If earlier chapters laid groundwork for this chapter, "deliver" on those setups
5. **Uncovered content** — If earlier chapters mentioned "this will be discussed in detail in a later chapter," check whether it should be covered here

### For Review Agents

Use this file to check:

- Whether there is cross-chapter content repetition (two chapters explaining the same concept)
- Whether forward references have all been fulfilled
- Whether terminology and metaphors are consistent across chapters
- Whether the pacing of knowledge introduction is reasonable (not too abrupt or too drawn-out)

### Summary Writing Guidelines

Each summary should be kept to **approximately 300 words** and include the following 5 fixed fields:

| Field | Description | Word Count Guide |
|------|------|----------|
| Core Content | What this chapter covers (3–5 sentences) | 100–150 words |
| Key Terms | Terms introduced or heavily used in this chapter | List format |
| Key Metaphors | Metaphors used in this chapter (corresponding to metaphor-registry) | List format |
| Relationships to Other Chapters | Which earlier concepts were referenced; what groundwork is laid for later chapters | 50–100 words |
| What Readers Should Know After This Chapter | Final output check | 30–50 words |

---

## Summary List

<!-- 
每完成一章定稿后，在此处追加一条摘要。
按章节顺序排列，使用分隔线分开。

下面是模板和示例，实际使用时替换为项目内容。
-->

## Chapter 1: {{章标题}}

**Core Content**: {{3–5 sentences summarizing what this chapter covers. Describe the chapter's main throughline: what problem it starts from, what analysis it goes through, and what conclusion it reaches. Write in cohesive sentences, not bullet points.}}

**Key Terms**: {{List of new terms introduced in this chapter, comma-separated. Format consistent with glossary.md}}

**Key Metaphors**: {{List of metaphors used in this chapter. Format: "Concept A → Metaphor A", consistent with metaphor-registry.md}}

**Relationships to Other Chapters**:
- Earlier references: None (first chapter)
- Groundwork for later: {{What setups this chapter lays for subsequent chapters, e.g. "mentioned the concept of middleware but did not expand on it; will be discussed in detail in Chapter 4"}}

**What Readers Should Know After This Chapter**: {{Learning outcomes for this chapter, e.g. "Can describe the overall architecture of the project and draw a dependency diagram of the core modules"}}

---

## Chapter 2: {{章标题}}

**Core Content**: {{3–5 sentence summary}}

**Key Terms**: {{List of terms}}

**Key Metaphors**: {{List of metaphors}}

**Relationships to Other Chapters**:
- Earlier references: {{Which concepts from Chapter 1 were referenced}}
- Groundwork for later: {{What groundwork is laid for subsequent chapters}}

**What Readers Should Know After This Chapter**: {{Learning outcomes}}

---

## Chapter 3: {{章标题}}

**Core Content**: {{3–5 sentence summary}}

**Key Terms**: {{List of terms}}

**Key Metaphors**: {{List of metaphors}}

**Relationships to Other Chapters**:
- Earlier references: {{Which concepts from earlier chapters were referenced}}
- Groundwork for later: {{What groundwork is laid for subsequent chapters}}

**What Readers Should Know After This Chapter**: {{Learning outcomes}}

---

<!-- 
继续追加后续章节的摘要...

每追加一条摘要后的检查清单：
  ☐ 字数是否在250~350字之间？
  ☐ 核心内容是否用连贯的句子而非列表？
  ☐ 关键术语是否已在 glossary.md 中注册？
  ☐ 关键比喻是否已在 metaphor-registry.md 中注册？
  ☐ 前序引用是否准确（确实在前序章节中出现过）？
  ☐ 后续铺垫是否有对应的章节会"兑现"？
-->

<!--
═══════════════════════════════════════════════════════
  示例（已填充的摘要，展示期望的格式和详细程度）：

## 第1章: 项目架构总览

**核心内容**: 本章从"一个npm包如何变成一个Web框架"的问题出发，
首先分析了项目的package.json，发现整个框架仅依赖30个npm包。
接着通过入口文件index.js追踪到lib/express.js，揭示了
createApplication工厂函数的设计——它创建一个普通函数app，
然后通过mixin模式将proto（application.js）上的所有方法
混入app对象。本章最后给出了项目的整体架构图：6个核心文件
各司其职，通过原型链和mixin模式组装在一起。

**关键术语**: mixin模式, 工厂函数, 原型链, 模块入口

**关键比喻**: Express架构 → 瑞士军刀（核心很小，功能通过
组合附加）

**与其他章节的关联**:
- 前序引用: 无（第一章）
- 后续铺垫: 提到了app.use()注册中间件但未展开（→第4章），
  提到了Router但未解释路由匹配（→第3章），提到了req/res扩展
  但未详述（→第5、6章）

**读者在本章结束时应掌握的知识**: 能画出项目的6个核心文件
及其关系图，理解mixin模式在项目中的作用，能从入口文件
追踪到任意核心模块。

═══════════════════════════════════════════════════════
-->
