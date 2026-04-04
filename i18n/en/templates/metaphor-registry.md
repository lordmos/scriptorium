<!--
  Translation status:
  Source file : templates/metaphor-registry.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../templates/metaphor-registry.md) · **English** · [日本語](../../ja/templates/metaphor-registry.md) · [繁體中文](../../zh-TW/templates/metaphor-registry.md)

---

<!--
  ╔══════════════════════════════════════════════════════════════╗
  ║  Metaphor Registry Template                                  ║
  ║                                                              ║
  ║  Purpose: Registers and manages all metaphors used           ║
  ║           throughout the book, preventing different chapters ║
  ║           from using contradictory or conflicting metaphors  ║
  ║           for the same technical concept, and ensuring a     ║
  ║           consistent mental model for readers.               ║
  ║                                                              ║
  ║  Why is this file needed?                                    ║
  ║  Technical books often use metaphors to help readers         ║
  ║  understand abstract concepts. But if Chapter 3 compares     ║
  ║  the event loop to a "traffic officer" and Chapter 7         ║
  ║  compares it to a "conveyor belt," readers get confused.     ║
  ║  This file ensures each core concept is bound to one         ║
  ║  primary metaphor.                                           ║
  ║                                                              ║
  ║  Usage:                                                      ║
  ║  1. Before writing, check this table to see if the concept   ║
  ║     already has a bound metaphor                             ║
  ║  2. If a new metaphor is needed, register it before use      ║
  ║  3. During review, check that metaphors match the registry   ║
  ║  4. When deprecating a metaphor, mark it "Deprecated" and    ║
  ║     specify the replacement                                  ║
  ╚══════════════════════════════════════════════════════════════╝
-->

# {{书名}} Metaphor Registry

## Overview

This file manages all metaphor mappings used throughout the book. Each core technical concept may be bound to at most **one primary metaphor**, kept consistent across the entire book.

### Metaphor Quality Criteria

A good metaphor should satisfy:
- ✅ **Accuracy**: The key characteristics of the metaphor match the key characteristics of the technical concept
- ✅ **Familiarity**: The target audience is sufficiently familiar with the metaphor vehicle
- ✅ **Extensibility**: Can be extended to multiple aspects of the concept without "breaking" at any point
- ✅ **Unambiguous**: Does not lead readers to incorrect understanding

## Metaphor Registry

<!--
填写规则：
  - 技术概念: 被解释的技术术语或概念
  - 绑定比喻: 全书统一使用的比喻描述
  - 首次使用章节: 该比喻第一次出现的章节
  - 状态: 活跃 = 当前使用中；废弃 = 已被替换，不再使用
  - 注意事项: 比喻的局限性、不能延伸的方向、容易误导的点
-->

| Technical Concept | Bound Metaphor | First Used | Status | Notes |
|----------|----------|-------------|------|----------|
| event loop | Restaurant waiter: a single waiter (single thread) rotates between serving multiple tables (tasks), never standing idle waiting for a dish to arrive (non-blocking) — instead moving on to serve the next table | ch{{N}} | Active | Do not extend to a "multiple waiters" scenario — that is multi-threading. The emphasis is "one person rotating," not "parallel service" |
| middleware | Assembly line worker: each worker (middleware) performs one processing step on the product (request) moving along the conveyor belt, either passing it to the next worker or rejecting a defective item (terminating the request) | ch{{N}} | Active | Emphasize "sequential execution" and "can be interrupted." Do not extend to "workers can communicate with each other" — middleware communicates via req/res, not directly |
| closure | Backpack: the function has left the classroom (scope) where it was defined, but carries a backpack (closure) containing the textbooks (variables) from that classroom | ch{{N}} | Active | Emphasize "carrying away" and "still accessible." Do not say "the things in the backpack change" — although closures can technically modify outer variables, that extension can confuse beginners |
| {{技术概念}} | {{绑定比喻}} | ch{{N}} | {{Active/Deprecated}} | {{注意事项}} |

## Deprecated Metaphor Log

<!--
当一个比喻被替换时，将原表中状态改为"废弃"，并在此记录原因和替代方案。
已发布的章节中如果使用了废弃比喻，需要在下一轮审查中更新。
-->

| Technical Concept | Original Metaphor | Reason for Deprecation | Replacement Metaphor | Deprecated On |
|----------|--------|----------|----------|----------|
| {{概念}} | {{原来的比喻}} | {{为什么废弃，如"读者反馈容易产生误解"}} | {{新比喻，应已在上面的注册表中注册}} | {{YYYY-MM-DD}} |

<!-- 示例：
| Promise | 快递单号 | 读者反馈"快递单号"无法解释链式调用(.then) | 承诺卡：你拿到一张承诺卡，可以在上面写"拿到结果后做X"（.then），也可以写"出了问题做Y"（.catch） | 2024-01-15 |
-->

## Conflict Detection Rules

<!--
审查Agent在检查比喻时应遵循以下规则。
也可以作为自查清单使用。
-->

### Rule 1: One Concept, One Metaphor

The same technical concept may use only **one primary metaphor** across the entire book.

- ❌ Violation: Chapter 3 compares the event loop to a "traffic officer," Chapter 7 compares it to a "conveyor belt"
- ✅ Correct: Use "restaurant waiter" throughout the book; different chapters may extend different aspects of that metaphor

### Rule 2: Different Concepts Do Not Share a Metaphor

Two different technical concepts cannot use the same metaphor, or readers will get confused.

- ❌ Violation: middleware uses "assembly line," pipeline also uses "assembly line"
- ✅ Correct: Design distinguishable metaphors for related but different concepts

### Rule 3: Metaphor Extensions Must Be Consistent

If Chapter 3 says "middleware is like an assembly line worker," later chapters may extend that metaphor (e.g., "adding a quality-check station to the assembly line"), but must not contradict it (e.g., "assembly line workers can handle multiple products simultaneously" — this contradicts middleware's serial nature).

### Rule 4: New Metaphors Must Be Registered First

Any new metaphor **must be registered in this file before** being used in the body text. When registering, check:

- [ ] Does the concept already have a bound metaphor?
- [ ] Does the new metaphor conflict with existing metaphors?
- [ ] Does the new metaphor satisfy the "Metaphor Quality Criteria" above?

### Rule 5: Simple Concepts Do Not Require Metaphors

Not every concept needs a metaphor. If a concept is sufficiently intuitive (e.g., "variable assignment"), forcing a metaphor only increases cognitive load.

## Index by Chapter

<!-- 
可选：按章节列出该章使用了哪些比喻，方便审查时快速定位。
在写作过程中逐步填充。
-->

### Chapter {{N}}: {{章标题}}
- {{技术概念A}} → {{比喻A}}
- {{技术概念B}} → {{比喻B}}
