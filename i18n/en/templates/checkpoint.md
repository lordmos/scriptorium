<!--
  Translation status:
  Source file : templates/checkpoint.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../templates/checkpoint.md) · **English** · [日本語](../../ja/templates/checkpoint.md) · [繁體中文](../../zh-TW/templates/checkpoint.md)

---

<!--
  ╔══════════════════════════════════════════════════════════════╗
  ║  Progress Tracking Template (Checkpoint)                     ║
  ║                                                              ║
  ║  Purpose: Tracks the complete lifecycle of each chapter      ║
  ║           from research to final draft. This is the core     ║
  ║           project management file; all Agents should update  ║
  ║           this file when starting and finishing their work.  ║
  ║                                                              ║
  ║  Usage:                                                      ║
  ║  1. Fill in the progress table based on chapter list in      ║
  ║     outline.md                                               ║
  ║  2. Update the corresponding status symbol after each phase  ║
  ║     is completed                                             ║
  ║  3. Record blockers promptly in the "Blockers" section       ║
  ║  4. Regularly update "Last Updated" timestamp                ║
  ║                                                              ║
  ║  Status symbols:                                             ║
  ║  ⬜ Not started  🔄 In progress  ✅ Done  ❌ Needs revision  ║
  ╚══════════════════════════════════════════════════════════════╝
-->

# {{书名}} Progress Tracking

## Project Status Overview

| Attribute | Value |
|------|-----|
| Current Phase | Phase {{N}}: {{Phase描述}} |
| Current Batch | Batch {{N}} ({{包含章节列表}}) |
| Overall Progress | {{已完成章节数}}/{{总章节数}} chapters |
| Last Updated | {{YYYY-MM-DD HH:MM}} |
| Next Milestone | {{描述，如"完成第一部分全部章节的R1审查"}} |

<!-- 
Phase 说明（根据项目实际情况调整）：
  Phase 1: 大纲与规范制定
  Phase 2: 源码研究
  Phase 3: 初稿写作
  Phase 4: 多轮审查（R1/R2/R3）
  Phase 5: 读者评审
  Phase 6: 终稿定版
  Phase 7: 格式转换与发布
-->

## Chapter Progress Table

<!-- 
使用说明：
  - 根据你的 outline.md 填充章节ID和标题
  - {{章节数}} 应与 outline.md 中的章节数一致
  - 每完成一个阶段，将对应的 ⬜ 改为 ✅ 或其他状态
  - R1/R2/R3 分别代表三轮审查，可根据项目需要增减
  
列说明：
  - 研究: 阅读源码、理解原理、做笔记
  - 写作: 完成初稿
  - R1审查: 第一轮审查（准确性、完整性）
  - R2审查: 第二轮审查（可读性、连贯性）
  - R3审查: 第三轮审查（术语一致性、格式规范）
  - 读者评审: 目标读者试读反馈
  - 定稿: 最终版本确认
  - HTML: 转换为发布格式
-->

| Chapter ID | Chapter Title | Research | Writing | R1 Review | R2 Review | R3 Review | Reader Review | Final | HTML |
|--------|----------|------|------|--------|--------|--------|----------|------|------|
| ch01 | {{第1章标题}} | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| ch02 | {{第2章标题}} | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| ch03 | {{第3章标题}} | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| ch04 | {{第4章标题}} | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| ch05 | {{第5章标题}} | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| ch06 | {{第6章标题}} | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| ch07 | {{第7章标题}} | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| ch08 | {{第8章标题}} | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

<!--
  如果章节数不同，增删行即可。确保章节ID（ch01, ch02...）与
  其他文件（source-map.md, outline.md 等）中的引用一致。
  
  示例（已填充的行）：
  | ch01 | 项目架构总览 | ✅ | ✅ | 🔄 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
  | ch02 | 启动流程解析 | ✅ | 🔄 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
  | ch03 | 路由系统深入 | ✅ | ❌ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
-->

## Batch Plan

<!-- 
将章节分批处理，每批2-4章。同一批内的章节应该相对独立，
可以并行写作。有依赖关系的章节放在不同批次。
-->

### Batch 1: {{批次主题}}
- Chapters included: {{ch01, ch02, ...}}
- Planned start: {{YYYY-MM-DD}}
- Planned completion: {{YYYY-MM-DD}}
- Status: {{Not started / In progress / Completed}}

### Batch 2: {{批次主题}}
- Chapters included: {{ch03, ch04, ...}}
- Planned start: {{YYYY-MM-DD}}
- Planned completion: {{YYYY-MM-DD}}
- Status: {{Not started / In progress / Completed}}

### Batch 3: {{批次主题}}
- Chapters included: {{ch05, ch06, ...}}
- Planned start: {{YYYY-MM-DD}}
- Planned completion: {{YYYY-MM-DD}}
- Status: {{Not started / In progress / Completed}}

<!-- 根据实际章节数增减批次 -->

## Blockers

<!-- 
记录当前阻碍进度的问题。解决后移到"已解决"区域并注明解决方案。

格式：
  - [阻塞] 问题描述 → 影响的章节 → 需要谁来解决
-->

### Current Blockers

<!-- 示例：
  - [阻塞] 源码中 {{模块名}} 的实现逻辑不清楚 → 影响 ch03, ch04 → 需要深入调试
  - [阻塞] {{术语}} 的翻译在社区中有争议 → 影响全书 → 需要确定统一用法
-->

{{No current blockers / List specific issues}}

### Resolved

<!-- 示例：
  - [已解决 {{YYYY-MM-DD}}] 源码版本从v4.17升级到v4.18 → 重新研究了ch01~ch03
-->

## Quality Metrics

<!-- 可选：追踪每章的质量指标 -->

| Chapter ID | Word Count | Code Blocks | Diagrams | Metaphors | Terminology Coverage |
|--------|------|----------|--------|--------|----------|
| ch01 | — | — | — | — | — |
| ch02 | — | — | — | — | — |

<!-- 在写作和审查过程中逐步填充 -->

## Update Log

<!-- 每次更新进度表时，在这里追加一行 -->

| Date | Update | Agent/Person |
|------|----------|-------------|
| {{YYYY-MM-DD}} | Progress table initialized | {{操作人}} |
