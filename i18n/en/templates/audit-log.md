<!--
  Translation status:
  Source file : templates/audit-log.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../templates/audit-log.md) · **English** · [日本語](../../ja/templates/audit-log.md) · [繁體中文](../../zh-TW/templates/audit-log.md)

---

<!--
  ╔══════════════════════════════════════════════════════════════╗
  ║  Audit Log Template                                          ║
  ║                                                              ║
  ║  Purpose: Records all important decisions, changes, and      ║
  ║           operations in the project, providing complete      ║
  ║           traceability. Consult this file when you need to   ║
  ║           answer "why was this decision made at the time."   ║
  ║                                                              ║
  ║  Usage:                                                      ║
  ║  1. After each important operation, append a record at the   ║
  ║     end of this file                                         ║
  ║  2. Maintain chronological order (newest at the bottom)      ║
  ║  3. Major modification decisions made during review must     ║
  ║     be recorded                                              ║
  ║  4. Controversial decisions must include complete rationale  ║
  ║                                                              ║
  ║  What to record:                                             ║
  ║  - Chapter structure changes (merge, split, reorder)         ║
  ║  - Terminology translation decisions                         ║
  ║  - Metaphor additions, replacements, deprecations            ║
  ║  - Critical issues found in reviews and their solutions      ║
  ║  - Content changes caused by source code version updates     ║
  ║  - Adjustments driven by reader feedback                     ║
  ║  - Any decision that may affect multiple chapters            ║
  ╚══════════════════════════════════════════════════════════════╝
-->

# {{书名}} Audit Log

## Log Format

Each record contains the following fields:

| Field | Description |
|------|------|
| Date | Operation date, format YYYY-MM-DD |
| Phase | Current project phase (Phase 1~7) |
| Operation Type | See "Operation Type Categories" below |
| Scope of Impact | Which files and chapters are affected |
| Decision | What decision was made |
| Reason | Why this decision was made |
| Executor | Which Agent or person performed the operation |

### Operation Type Categories

<!-- 使用标签分类便于后续筛选 -->

| Tag | Meaning | Example |
|------|------|------|
| `[Structure]` | Chapter structure change | Merging two chapters, adding chapters, reordering |
| `[Terminology]` | Terminology-related decision | Finalizing a translation, replacing a term |
| `[Metaphor]` | Metaphor-related decision | Adding a metaphor, deprecating a metaphor |
| `[Review]` | Critical finding during review | Factual error found, logic issue |
| `[SourceCode]` | Source code-related change | Version update, discovery of a new important file |
| `[Style]` | Writing style adjustment | Changing tone, adjusting level of detail |
| `[Reader]` | Change driven by reader feedback | Difficulty adjustment, adding explanations |
| `[Fix]` | Error correction | Code error, factual error |

---

## Log Entries

<!-- ═══════════════════════════════════════════════════════ -->

### [{{YYYY-MM-DD}}] Phase {{N}} — `[Structure]` Project Initialization

- **Impact**: All files
- **Decision**: Created project structure, initialized all template files
- **Reason**: Project kickoff
- **Executor**: {{执行者}}

<!-- ═══════════════════════════════════════════════════════ -->

### [{{YYYY-MM-DD}}] Phase {{N}} — `[Structure]` Outline Finalized

- **Impact**: outline.md, source-map.md, checkpoint.md
- **Decision**: {{确定了哪些章节划分}}
- **Reason**: {{基于什么考虑做的章节划分}}
- **Executor**: {{执行者}}

<!-- ═══════════════════════════════════════════════════════

  以下是示例记录，展示各种类型的日志条目格式。
  实际使用时删除这些示例，替换为项目实际内容。

═══════════════════════════════════════════════════════ -->

<!--
示例记录1 — 术语决策：

### [2024-03-15] Phase 2 — `[术语]` 确定 "middleware" 术语处理方式

- **影响**: glossary.md, style-guide.md, 全书正文
- **决策**: "middleware" 保留英文，不翻译为"中间件"
- **原因**: 目标读者群体（中级开发者）普遍直接使用英文 "middleware"；
            翻译为"中间件"反而可能影响检索和与同事交流
- **执行**: 术语审查Agent
-->

<!--
示例记录2 — 章节合并：

### [2024-03-20] Phase 3 — `[结构]` 合并第3章和第4章

- **影响**: outline.md (ch03, ch04 → ch03), checkpoint.md, source-map.md
- **决策**: 将"路由注册"和"路由匹配"合并为"路由系统全解析"
- **原因**: 两章内容高度耦合，拆开后第4章无法独立阅读；
            合并后字数约7000字，仍在可接受范围
- **执行**: 编辑Agent
-->

<!--
示例记录3 — 比喻调整：

### [2024-04-01] Phase 4 — `[比喻]` 废弃 Promise 的"快递单"比喻

- **影响**: metaphor-registry.md, ch05正文
- **决策**: 将 Promise 的比喻从"快递单号"改为"承诺卡"
- **原因**: R2审查发现"快递单号"无法解释 .then() 链式调用；
            "承诺卡"可以自然延伸为"在卡上写下后续步骤"
- **执行**: R2审查Agent
-->

<!--
示例记录4 — 审查发现：

### [2024-04-10] Phase 4 — `[审查]` 发现ch03代码示例存在事实错误

- **影响**: ch03 "路由匹配"代码段
- **决策**: 修正 Layer.prototype.match 的参数处理逻辑说明
- **原因**: R1审查时对照源码v4.18.2发现，初稿中描述的是v4.17的行为，
            v4.18中已修改参数解码方式
- **执行**: R1审查Agent
-->

<!-- ═══════════════════════════════════════════════════════ -->

<!-- 
  在此处继续追加新的日志记录...
  
  追加新记录的检查清单：
  ☐ 日期是否正确？
  ☐ Phase标注是否正确？
  ☐ 操作类型标签是否合适？
  ☐ 影响范围是否列全？
  ☐ 原因是否写清楚了（而不仅仅是"需要修改"）？
  ☐ 相关文件（glossary/metaphor-registry/checkpoint等）是否已同步更新？
-->

---

## Statistics Summary

<!-- 可选：定期更新，帮助了解项目决策的分布 -->

| Operation Type | Total |
|----------|------|
| `[Structure]` | {{N}} |
| `[Terminology]` | {{N}} |
| `[Metaphor]` | {{N}} |
| `[Review]` | {{N}} |
| `[SourceCode]` | {{N}} |
| `[Style]` | {{N}} |
| `[Reader]` | {{N}} |
| `[Fix]` | {{N}} |
