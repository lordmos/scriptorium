<!--
  Translation status:
  Source file : templates/style-guide.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../templates/style-guide.md) · **English** · [日本語](../../ja/templates/style-guide.md) · [繁體中文](../../zh-TW/templates/style-guide.md)

---

<!--
  ╔══════════════════════════════════════════════════════════════╗
  ║  Style Guide Template                                        ║
  ║                                                              ║
  ║  Purpose: Defines the writing style, formatting rules, and   ║
  ║           terminology conventions for the entire book.       ║
  ║           This is the primary reference file for all Writer  ║
  ║           Agents and Review Agents.                          ║
  ║                                                              ║
  ║  Usage:                                                      ║
  ║  1. Copy this file to your project directory                 ║
  ║  2. Replace all {{变量}} placeholders with actual project    ║
  ║     content                                                  ║
  ║  3. Remove sections that are not needed or add project-      ║
  ║     specific rules                                           ║
  ║  4. Have all participants review this file before the        ║
  ║     project starts                                           ║
  ╚══════════════════════════════════════════════════════════════╝
-->

# {{项目名}} Style Guide

## Basic Information

| Attribute | Value |
|------|-----|
| Book Title | {{书名}} |
| Target Audience | {{读者画像}} |
| Source Project | {{项目名}} {{版本号}} |
| Programming Language | {{语言}} |
| Estimated Chapters | {{章节数}} |
| Words per Chapter | {{最低字数}}–{{最高字数}} words |
| Project Repository | {{仓库URL}} |

<!-- 示例：
| 属性 | 值 |
|------|-----|
| 书名 | 《深入理解 Express.js 源码》 |
| 目标读者 | 有1-3年Node.js经验的中级开发者 |
| 源码项目 | Express v4.18.2 |
| 编程语言 | JavaScript/TypeScript |
| 预计章节数 | 12 |
| 每章字数 | 4000~6000字 |
| 项目仓库 | https://github.com/expressjs/express |
-->

## Writing Style

<!-- 定义本书的写作风格。常见选择：
  - 幽默轻松：适合入门级读者，多用比喻和故事
  - 严谨学术：适合高级读者，强调准确性
  - 通俗实用：平衡可读性和专业性
  - 对话式：像和读者聊天，适合教程类
-->

- **Point of view**: First-person plural ("we")
- **Tone**: {{Style description}}
- **Metaphor density**: At least one metaphor per core concept
- **Humor level**: {{None / Occasional / Moderate / Frequent}}
- **Reader address**: {{e.g. "you" / "the reader" / "fellow developers"}}

### Style Example

<!-- 写一段50-100字的示例段落，展示你期望的写作风格 -->

> {{Sample paragraph}}

### Prohibited Expressions

<!-- 列出不符合本书风格的表达 -->

- ❌ {{Prohibited expression 1, e.g. "as everyone knows"}}
- ❌ {{Prohibited expression 2, e.g. "obviously"}}
- ❌ {{Prohibited expression 3, e.g. "simply put" followed by something very complex}}

## Formatting Rules

### Heading Levels

| Level | Purpose | Count Limit | Example |
|------|------|----------|------|
| H1 (`#`) | Chapter title | One per chapter | `# Chapter 3: The Secret of Middleware` |
| H2 (`##`) | Major section | 3–6 per chapter | `## The Life of a Request` |
| H3 (`###`) | Subsection | As needed | `### Route Matching Algorithm` |
| H4 (`####`) | Avoid using | Refactor if too deep | — |

### Code Block Rules

- **Language must be specified**: ` ```{{language}} `
- **Add comments on key lines**: explain "why," not "what"
- **Single code block must not exceed 30 lines**
- **Use ellipsis for long code**: `// ...omit code related to {{功能描述}}...` and explain what was omitted
- **Annotate file path**: above the code block, note the source file path

<!-- 示例：

```javascript
// 文件: src/router/index.js (第42-58行)
Router.prototype.handle = function handle(req, res, done) {
  var self = this;
  var idx = 0;
  var stack = self.stack;  // 所有注册的中间件层

  // 递归处理每一层中间件
  function next(err) {
    var layer = stack[idx++];
    // ...省略错误处理逻辑...
    layer.handle_request(req, res, next);  // 关键：调用下一层
  }

  next();  // 启动中间件链
};
```
-->

### Paragraph Control

- No paragraph longer than **5 lines**
- Avoid **3 or more** consecutive paragraphs of pure text (intersperse code / diagrams / lists)
- Open each section with a **story / question / hook**
- End each H2 section with a **transitional sentence** connecting to what follows

### Diagram Rules

**Rule: Wherever a flowchart, architecture diagram, hierarchy diagram, or directory tree is needed, always use Mermaid. ANSI box-drawing characters (`┌ ─ ┤ ├ └ │`) are prohibited.**

- Flowcharts for {{flow-type scenarios, e.g. request processing flow}}
- Class diagrams for {{structural scenarios, e.g. module dependency relationships}}
- Every diagram must have a **title** and a **brief description**

**Common diagram types**:

| Scenario | Diagram Type | Directive |
|------|--------|------|
| Vertical layered architecture (e.g., layered architecture diagram) | flowchart | `flowchart TD` |
| Horizontal processing flow | flowchart | `flowchart LR` |
| Reading roadmap / multi-step sequence | flowchart | `flowchart TD` + `-->` |
| File directory tree | graph | `graph LR` |
| Side-by-side category comparison | flowchart | `flowchart LR` + category nodes |
| Grouped / subsystem layout | flowchart + subgraph | `subgraph name["…"]` |

**Syntax notes**:
- Labels containing spaces, non-ASCII characters, or parentheses must be quoted: `node["Layer 6: Entry (CLI)"]`
- Multi-line labels use `<br/>`: `node["Line one<br/>Line two"]` (**`\n` is not supported in Mermaid**)
- Node IDs use only ASCII letters/numbers — no non-ASCII characters
- `**bold**` Markdown syntax is not supported inside labels; use plain text

### Special Callouts

<!-- 定义书中使用的提示框/标记格式 -->

- 💡 **Tip**: Supplementary knowledge that enriches understanding
- ⚠️ **Caution**: Common pitfalls
- 🔍 **Deep Dive**: An optional deeper exploration that can be skipped
- 📝 **Exercise**: Suggestions for hands-on practice

## Terminology Rules

<!-- 完整术语表维护在 glossary.md，这里只列最重要的总体约定 -->

### Terms Kept in English

<!-- 这些术语在正文中直接使用英文，不翻译 -->

{{List, e.g.: Promise, callback, middleware, event loop, closure}}

### Translated Terms

<!-- 这些术语使用中文，首次出现时在括号中注明英文 -->

| English | Translation |
|------|----------|
| {{英文术语1}} | {{中文翻译1}} |
| {{英文术语2}} | {{中文翻译2}} |

<!-- 示例：
| 英文 | 中文翻译 |
|------|----------|
| dependency injection | 依赖注入 |
| design pattern | 设计模式 |
| polymorphism | 多态 |
-->

### Term Usage Rules

1. **First appearance**: Chinese translation (English Original)
2. **Subsequent appearances**: use only the Chinese translation or only the English form (per the convention above)
3. **In headings**: prefer the Chinese translation with English in parentheses
4. **In code comments**: follow the code's language

## Sensitive Content Guidelines

- ❌ Do not evaluate commercial products against each other (e.g., "Framework X is better than Framework Y")
- ❌ Do not touch political / religious / gender topics
- ❌ Avoid absolute statements ("the best," "the only," "you must always")
- ✅ Keep technical comparisons objective — state only facts and data
- ✅ Cite sources when referencing others' opinions

## Chapter Structure Template

<!-- 每一章应遵循以下结构。可根据内容微调，但核心元素不可省略 -->

```
# Chapter {{N}}: {{章标题}}

## Opening Hook (200–300 words)
<!-- Introduce with a story / question / cliffhanger. For example:
  "Imagine you're debugging a production issue. The logs show the request
   reached the server, but the response has mysteriously vanished. You checked
   the routes, you checked the middleware, everything looks fine. Until you
   opened the source code of {{模块}}..."
-->

## {{节标题1}}
<!-- First core knowledge point -->

## {{节标题2}}
<!-- Second core knowledge point -->

## {{节标题3}}
<!-- Third core knowledge point. Aim for 3–5 H2 sections per chapter -->

## Code Walkthrough
<!-- Annotated key code segments, explained step by step -->

## Design Thinking
<!-- Why did the author design it this way? What alternatives exist? What trade-offs were made? -->

## Summary
<!-- Under 200 words; recap chapter highlights in list form -->

## Discussion Questions (optional)
<!-- 2–3 thought-provoking questions — not exam questions, but prompts for deeper reflection -->
1. {{问题1}}
2. {{问题2}}
```

## Cross-Reference Rules

- Forward reference: "We will discuss this topic in detail in Chapter {{N}}"
- Backward reference: "As described in Chapter {{N}}, ..."
- Avoid circular references (A references B, B references A)

## Versioning and Updates

- When the source project releases a new version: {{handling strategy, e.g. "update only affected chapters"}}
- Erratum process: {{e.g. "record in audit-log.md; correct in the next review cycle"}}
