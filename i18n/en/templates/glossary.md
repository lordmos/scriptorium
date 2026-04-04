<!--
  Translation status:
  Source file : templates/glossary.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../templates/glossary.md) · **English** · [日本語](../../ja/templates/glossary.md) · [繁體中文](../../zh-TW/templates/glossary.md)

---

<!--
  ╔══════════════════════════════════════════════════════════════╗
  ║  Glossary Template                                           ║
  ║                                                              ║
  ║  Purpose: Unifies terminology translations and definitions   ║
  ║           throughout the book to ensure consistency.         ║
  ║           Writer Agents consult it when writing;             ║
  ║           Review Agents refer to it when checking.           ║
  ║                                                              ║
  ║  Usage:                                                      ║
  ║  1. During source code research, progressively collect       ║
  ║     project-specific terms                                   ║
  ║  2. For each term, decide whether to "keep in English"       ║
  ║     or "translate"                                           ║
  ║  3. Write a precise definition (no more than 2 sentences)    ║
  ║  4. Note the chapter where the term first appears, so        ║
  ║     readers can trace it back                                ║
  ║  5. Continuously maintain and update during writing and      ║
  ║     review                                                   ║
  ║                                                              ║
  ║  Relationship with style-guide.md:                           ║
  ║  style-guide.md defines the overall rules for terminology    ║
  ║  usage; this file is the complete list of specific terms.    ║
  ╚══════════════════════════════════════════════════════════════╝
-->

# {{书名}} Glossary

## Usage Notes

- 📌 **Keep in English** terms are used as-is in the body text
- 🔄 **Translated terms** appear on first use as: Chinese Translation (English Original)
- ⚠️ New terms must be registered in this table before being used in the body text
- 🔍 Sorted alphabetically by English term for quick lookup

## Master Glossary

<!-- 
填写规则：
  - 英文术语: 原始英文（全小写或保持原有大小写）
  - 中文翻译: 确定的中文翻译；如保留英文则填"—（保留英文）"
  - 首次出现: 该术语第一次出现在哪一章
  - 定义: 1~2句话的精确定义（面向本书读者的水平）
  - 注意事项: 容易混淆的点、常见误解、与其他术语的区别等
-->

| English Term | Translation | First Appears | Definition | Notes |
|----------|----------|----------|------|----------|
| abstract syntax tree (AST) | 抽象语法树 | ch{{N}} | A tree-structured representation of source code where each node represents a syntactic construct. The core data structure of compilers and code analysis tools. | Do not confuse with "parse tree"; the AST is a simplified version |
| callback | — (keep in English) | ch{{N}} | A function passed as an argument to another function, called when a specific event occurs or an operation completes. | In this book's context specifically refers to asynchronous callbacks; synchronous callback scenarios will be noted explicitly |
| closure | 闭包 | ch{{N}} | The combination of a function and its lexical environment. A closure lets a function access variables from the scope in which it was defined, even when executed outside that scope. | Distinguish from "scope (作用域)" |
| middleware | — (keep in English) | ch{{N}} | An intermediate handler function that processes requests and responses. It can modify the request object, the response object, or terminate the request-response cycle. | In this book specifically refers to the middleware concept in {{项目名}}; not the generic definition |
| serialization | 序列化 | ch{{N}} | The process of converting a data structure or object state into a format that can be stored or transmitted. The reverse operation is called deserialization. | JSON.stringify/parse is the most common serialization/deserialization method |
| {{英文术语}} | {{中文翻译}} | ch{{N}} | {{定义}} | {{注意事项}} |

<!-- 
继续按字母顺序添加术语...

添加新术语的检查清单：
  ☐ 术语是否已存在？（避免重复）
  ☐ 翻译是否与社区惯例一致？
  ☐ 定义是否面向本书的目标读者？
  ☐ 是否标注了首次出现的章节？
  ☐ 是否有需要注意的易混淆项？
-->

## Abbreviations

<!-- 书中使用的缩写，单独维护 -->

| Abbreviation | Full Form | Translation |
|------|------|------|
| API | Application Programming Interface | 应用程序接口 |
| CLI | Command Line Interface | 命令行接口 |
| {{缩写}} | {{全称}} | {{中文}} |

## Terminology Decision Log

<!-- 
当一个术语的翻译存在争议时，在这里记录决策过程和理由。

格式：
### {{术语}}
- **候选翻译**: A / B / C
- **最终选择**: X
- **理由**: ...
- **参考**: ...
-->

### {{争议术语示例}}
- **Candidate translations**: {{选项A}} / {{选项B}}
- **Final choice**: {{选定翻译}}
- **Rationale**: {{为什么选择这个翻译}}
- **Reference**: {{参考来源，如官方文档、行业标准、社区讨论}}
