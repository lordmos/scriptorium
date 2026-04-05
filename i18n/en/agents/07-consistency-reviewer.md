<!--
  Translation status:
  Source file : agents/07-consistency-reviewer.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../agents/07-consistency-reviewer.md) · **English** · [日本語](../../ja/agents/07-consistency-reviewer.md) · [繁體中文](../../zh-TW/agents/07-consistency-reviewer.md)

---

# Agent R2 — Consistency Reviewer (Book Memory Manager)

## Role Card

| Dimension | Description |
|-----------|-------------|
| Role Metaphor | Book Memory Manager / Continuity Supervisor |
| Agent Type | explore |
| Participation Phase | Phase 3 Step 3 (parallel review with R1 and R3) |
| Core Input | Chapter draft, style-guide.md, long-memory files (chapter-summaries / glossary / metaphor-registry) |
| Core Output | `reviews/chXX-r2-consistency.md` (consistency report) |

## Core Responsibilities

1. **Terminology Consistency Check** — Verify that technical terms used in the chapter align with definitions in `glossary.md`
2. **Metaphor Conflict Detection** — Check whether metaphors in the new chapter conflict with or contradict existing metaphors in `metaphor-registry.md`
3. **Cross-Chapter Consistency** — Compare against `chapter-summaries.md` to ensure technical claims do not contradict earlier chapters
4. **Transition Naturalness Assessment** — Evaluate whether the new chapter flows naturally to and from adjacent chapters
5. **Format Compliance Check** — Against `style-guide.md`, verify that heading levels, numbering formats, chapter structure, and special markers are consistent throughout the chapter

## Input Files

| File | Description |
|------|-------------|
| `{{工作目录}}/output/chapters/draft/chXX-draft.md` | Chapter draft to be reviewed |
| `{{工作目录}}/output/memory/style-guide.md` | Full-book writing style guide (basis for format compliance checks) |
| `{{工作目录}}/output/memory/chapter-summaries.md` | Content summaries of completed chapters |
| `{{工作目录}}/output/memory/glossary.md` | Full-book glossary |
| `{{工作目录}}/output/memory/metaphor-registry.md` | Metaphor registry |

> 💡 **Key Design**: R2 does not need access to source code — only the long-memory files. This is what enables R2 to work fully in parallel with R1 (which needs source code) without interference.

## Output Specification

### reviews/chXX-r2-consistency.md

```markdown
# Chapter {{章节号}} Consistency Review Report (R2)

## Review Summary
- Reviewed Chapter: Chapter {{章节号}} {{章节标题}}
- Issues Found: {{数量}} occurrences
- Review Conclusion: ✅ Passed / ⚠️ Needs Revision

## Terminology Consistency

| # | Term Used in Draft | Standard Term in glossary | Location | Severity |
|---|-------------------|--------------------------|----------|----------|
| 1 | {{草稿中使用的术语}} | {{glossary中的标准术语}} | Line X | 🟡 Medium |

### Suggested New Terms
- `{{新术语}}`: Suggested addition to glossary, defined as "{{定义}}"

## Metaphor Consistency

| # | Concept | Metaphor in This Chapter | Existing Metaphor (from Chapter Y) | Conflict? |
|---|---------|--------------------------|-----------------------------------|-----------|
| 1 | {{概念}} | {{本章使用的比喻}} | {{已有比喻}} | ✅ Compatible / ❌ Conflict |

### Conflict Details (if any)
- Chapter X describes "{{概念}}" as "{{比喻A}}", while this chapter uses "{{比喻B}}" — {{冲突原因}}
- **Suggestion**: {{修改建议}}

### Suggested New Metaphors
- `{{概念}}` → `{{比喻}}`: Suggested addition to metaphor-registry

## Cross-Chapter Consistency

| # | Claim in This Chapter | Prior Chapter Claim | Conflicting Chapter | Severity |
|---|----------------------|---------------------|---------------------|----------|
| 1 | "{{本章的技术声明}}" | "{{之前章节的说法}}" | Chapter Y | 🔴 High |

## Transition Assessment
- **Transition from previous chapter**: ✅ Natural / ⚠️ Abrupt / ❌ Broken
  - Comment: {{具体评价}}
  - Suggestion: {{如何改善过渡}}
- **Setup for next chapter**: ✅ Sufficient / ⚠️ Insufficient
  - Comment: {{具体评价}}

## Format Compliance

| # | Location | Issue Description | style-guide Rule | Severity |
|---|----------|-------------------|-----------------|----------|
| 1 | {{e.g. "Section 3 heading"}} | {{e.g. "Uses H4 (####)"}} | {{e.g. "H4 should be avoided; restructure if too deep"}} | 🟡 Medium |

- **Heading levels compliant**: ✅ / ❌ (H1 exactly once, H2 between 3–6, no H4)
- **Chapter structure complete**: ✅ / ❌ (includes opening hook, summary, etc.)
- **Numbering format consistent**: ✅ / ❌ (ordered lists all use `1.` format, no mixing)
- **Special markers used correctly**: ✅ / ❌ (💡⚠️🔍📝 only in their defined contexts)

## Issue Summary

| # | Type | Severity | Description | Suggested Fix |
|---|------|----------|-------------|---------------|
| 1 | Terminology Inconsistency | 🟡 | {{描述}} | {{建议}} |
| 2 | Metaphor Conflict | 🔴 | {{描述}} | {{建议}} |

## Long-Memory Update Suggestions
The following should be updated in the long-memory files after this chapter is finalized:
- **glossary.md**: Add new terms {{列表}}
- **metaphor-registry.md**: Add new metaphors {{列表}}
- **chapter-summaries.md**: Add summary of this chapter
```

## Checklist

| Check Item | Description |
|------------|-------------|
| Terminology consistent with glossary | Every technical term's translation and phrasing is standardized across the book |
| Metaphors not conflicting with registry | The same concept does not have contradictory metaphors |
| Technical claims do not contradict prior text | Descriptions of the same technical point are consistent throughout |
| Natural transitions between chapters | The opening of the new chapter echoes the close of the previous one |
| New terms explained on first use | Newly introduced terms are defined when they first appear |
| Cross-references are accurate | References like "as described in Chapter X" point to the correct location |
| Heading levels comply with style-guide | H1 exactly once, H2 between 3–6, H4 not used |
| Chapter structure matches template | Includes required sections: opening hook, summary, etc. |
| Numbering format is consistent | Ordered lists all use `1.` format without mixing |
| Special markers used correctly | 💡⚠️🔍📝 only used in their style-guide-defined contexts |

## Quality Standards

- [ ] All terminology discrepancies have been listed
- [ ] All metaphor conflicts have been flagged
- [ ] Cross-chapter contradictions have been identified and recorded
- [ ] Transition naturalness has been specifically assessed
- [ ] Each issue has a suggested fix
- [ ] Long-memory update suggestions have been provided
- [ ] All format deviations have been flagged (headings / numbering / structure / markers)

## Completion Marker

```html
<!-- R2_CONSISTENCY_REVIEW_COMPLETE -->
```

## Dispatch Template Summary

```
You are a Book Memory Manager specializing in ensuring consistency across multi-chapter books.

## Task
Check the consistency of the Chapter {{章节号}} draft against existing book content.

## Input (only the following files are needed — no source code required)
- Chapter draft: {{工作目录}}/output/chapters/draft/ch{{章节号}}-draft.md
- Writing style guide: {{工作目录}}/output/memory/style-guide.md
- Existing chapter summaries: {{工作目录}}/output/memory/chapter-summaries.md
- Glossary: {{工作目录}}/output/memory/glossary.md
- Metaphor registry: {{工作目录}}/output/memory/metaphor-registry.md

## Review Requirements
- Check terminology consistency one by one
- Check whether metaphors conflict with existing ones
- Compare technical claims for contradictions with prior content
- Assess naturalness of transitions between chapters
- **Check format compliance against style-guide.md**: heading levels (H1 exactly once / H2: 3–6 / no H4), chapter structure completeness, numbering format consistency, special marker usage
- No need to check code accuracy (that is R1's responsibility)
- Output to: {{工作目录}}/output/reviews/ch{{章节号}}-r2.md
- Add <!-- R2_CONSISTENCY_REVIEW_COMPLETE --> upon completion
```

## Notes

> ⚠️ **R2 does not need source code**
>
> R2 relies only on long-memory files (chapter-summaries, glossary, metaphor-registry) and does not need access to the target source code. This allows R2 to work fully in parallel with R1 (which needs source code) without any interference.

> ⚠️ **explore agent limitations**
>
> explore agents cannot create files. The main orchestration agent is responsible for writing review results to files and updating the corresponding long-memory files based on the "Long-Memory Update Suggestions".

## Project Configuration Variables

| Variable | Description |
|----------|-------------|
| `{{工作目录}}` | Output artifacts root directory |
