<!--
  Translation status:
  Source file : framework/workflow.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../framework/workflow.md) · **English** · [日本語](../../ja/framework/workflow.md) · [繁體中文](../../zh-TW/framework/workflow.md)

---

# 5-Phase Production Pipeline

> **Framework Document** — Applicable to any technical book production project based on multi-agent collaboration
> Project: {{项目名称}} | Source: {{源码仓库}} | Chapters: {{章节数}}

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        5阶段生产流水线                                    │
│                                                                         │
│  Phase 1        Phase 2        Phase 3          Phase 4       Phase 5   │
│ ┌────────┐    ┌────────┐    ┌──────────┐    ┌─────────┐    ┌────────┐  │
│ │大纲定稿│───▶│共享资源│───▶│逐章写作  │───▶│统稿审计 │───▶│HTML发布│  │
│ │        │    │  构建  │    │×{{章节数}}│    │         │    │        │  │
│ └────────┘    └────────┘    └──────────┘    └─────────┘    └────────┘  │
│                                                                         │
│  架构师#1       主编排#0      研究员#3         主编排#0      装帧工人#11 │
│  读者代言人#2                 作家#4           审查组R1-R3              │
│  内容审查R3                   审查组R1-R3                               │
│                               读者评审团                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Outline Finalization

### Participating Agents

| Agent | Code | Responsibility |
|-------|------|----------------|
| Architect | #1 | Analyzes source structure, generates outline draft |
| Reader Advocate | #2 | Reviews outline from the {{目标读者}} perspective |
| Content Reviewer | R3 | Reviews sensitivity and compliance |

### Execution Steps

```
Step 1.1  Architect (#1) analyzes {{源码仓库}} source code
          ├── Reads: {{源码根目录}}
          ├── Outputs: outline-draft.md (outline draft)
          └── Outputs: source-map.md (source code → chapter mapping)

Step 1.2  Reader Advocate (#2) reviews outline
          ├── Reads: outline-draft.md
          ├── Outputs: outline-reader-feedback.md
          └── Focus: learning curve, prerequisites, chapter order rationale

Step 1.3  Content Reviewer (R3) reviews outline
          ├── Reads: outline-draft.md
          ├── Outputs: outline-r3-review.md
          └── Focus: {{敏感性检查项}}

Step 1.4  User review and finalization
          ├── Reads: all feedback files
          ├── Manual decision: accept / revise / reject
          └── Outputs: outline-final.md (final outline)
```

### Deliverables

| File | Description | Type |
|------|-------------|------|
| `outline-final.md` | Final approved outline | Static |
| `source-map.md` | Source file → chapter mapping | Static |

### Phase 1 Handoff Checklist

- [ ] outline-final.md created and confirmed by user
- [ ] source-map.md created, covering all key source files
- [ ] Chapter count, order, and scope finalized
- [ ] {{敏感性检查项}} passed R3 review

---

## Phase 2: Shared Resource Construction

### Participating Agents

| Agent | Code | Responsibility |
|-------|------|----------------|
| Chief Orchestrator | #0 | Directly generates all shared resource files |

### Execution Steps

```
Step 2.1  Chief Orchestrator (#0) creates all shared files based on outline-final.md
          ├── Outputs: meta/glossary.md          — glossary (initial version)
          ├── Outputs: meta/style-guide.md       — writing style guide
          ├── Outputs: meta/metaphor-registry.md — metaphor registry
          ├── Outputs: meta/chapter-summaries.md — chapter summaries (empty template)
          └── Outputs: meta/cross-references.md  — cross-reference table (empty template)
```

### Deliverables

| File | Description | Type |
|------|-------------|------|
| `meta/glossary.md` | Full-book glossary | Append-only |
| `meta/style-guide.md` | Writing style guide | Static |
| `meta/metaphor-registry.md` | Metaphor / analogy registry | Append-only |
| `meta/chapter-summaries.md` | Per-chapter summaries (appended chapter by chapter) | Append-only |
| `meta/cross-references.md` | Cross-chapter references | Append-only |

### Phase 2 Handoff Checklist

- [ ] All 5 files under meta/ created
- [ ] glossary.md contains core terms identified in the outline
- [ ] style-guide.md contains {{写作风格要求}}
- [ ] chapter-summaries.md created as an empty template (one placeholder section per chapter)

---

## Phase 3: Chapter-by-Chapter Writing ×{{章节数}} Chapters

### 4-Step Pipeline per Chapter

```
┌─────────────────────────────────────────────────────────────────┐
│                    Per-Chapter Writing Pipeline                   │
│                                                                   │
│  Step 1         Step 2         Step 3              Step 4         │
│ ┌──────┐      ┌──────┐      ┌──────────┐        ┌──────────┐    │
│ │ 研究 │─────▶│ 写作 │─────▶│ 三审并行 │───────▶│读者评审团│    │
│ │ #3   │      │ #4   │      │R1+R2+R3  │        │RS+RE+RH  │    │
│ └──────┘      └──────┘      └──────────┘        └──────────┘    │
│    │             │           ┌──┤├──┐            ┌──┤├──┐        │
│    ▼             ▼           ▼  ▼  ▼            ▼  ▼  ▼         │
│ research/     drafts/      R1  R2  R3          RS  RE  RH       │
│ chXX-         chXX-        ↓   ↓   ↓           ↓   ↓   ↓       │
│ research.md   draft.md     reviews/           reader-feedback/   │
│                            chXX-review.md     chXX-panel.md      │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 1: Research (Researcher #3)

```
Inputs:
  📖 source-map.md          — locate source files for this chapter
  📖 outline-final.md       — outline requirements for this chapter
  📖 {{源码文件列表}}        — actual source files

Output:
  ✏️ research/chXX-research.md — source code analysis report

Completion marker: <!-- RESEARCH_COMPLETE -->
```

#### Step 2: Writing (Writer #4)

```
Inputs:
  📖 research/chXX-research.md — this chapter's research report
  📖 meta/style-guide.md       — writing style guide
  📖 meta/chapter-summaries.md — previous chapter summaries
  📖 meta/glossary.md          — existing glossary
  📖 meta/metaphor-registry.md — existing metaphors

Output:
  ✏️ drafts/chXX-draft.md — chapter draft

Completion marker: <!-- DRAFT_COMPLETE -->
Word count target: {{每章目标字数}} words ± 20%
```

#### Step 3: Triple-Parallel Review (R1 + R2 + R3)

```
Three Reviewers execute in parallel — see review-architecture.md for details

R1 Code Review:
  📖 drafts/chXX-draft.md + source files
  ✏️ reviews/chXX-r1-code.md
  Completion marker: <!-- R1_CODE_REVIEW_COMPLETE -->

R2 Consistency Review:
  📖 drafts/chXX-draft.md + long-term memory files
  ✏️ reviews/chXX-r2-consistency.md
  Completion marker: <!-- R2_CONSISTENCY_REVIEW_COMPLETE -->

R3 Content Review:
  📖 drafts/chXX-draft.md + style-guide
  ✏️ reviews/chXX-r3-content.md
  Completion marker: <!-- R3_CONTENT_REVIEW_COMPLETE -->

→ After all three reviews complete, the Chief Orchestrator merges them into:
  ✏️ reviews/chXX-review.md
  Completion marker: <!-- REVIEW_COMPLETE -->
```

#### Step 4: Reader Panel (RS + RE + RH in parallel)

```
Three simulated reader types review in parallel:

RS {{读者画像_学生}}: evaluates learning curve
RE {{读者画像_工程师}}: evaluates practical value
RH {{读者画像_高手}}: evaluates technical depth

Inputs: drafts/chXX-draft.md + reviews/chXX-review.md
Output: reader-feedback/chXX-panel.md
Completion marker: <!-- READER_PANEL_COMPLETE -->
```

### Inter-chapter Long-term Memory Update

After each chapter completes Step 4, the Chief Orchestrator executes:

```
1. meta/chapter-summaries.md ← append this chapter's summary (200–300 words)
2. meta/glossary.md          ← append new terms introduced in this chapter
3. meta/metaphor-registry.md ← append new metaphors/analogies from this chapter
4. meta/cross-references.md  ← append cross-reference points from this chapter
```

### Parallel Strategy

Chapters within the same batch can execute the full 4-step pipeline in parallel.
Batches are strictly sequential — later batches depend on the long-term memory updates from earlier batches.
See `parallel-strategy.md` for details.

### Phase 3 Handoff Checklist

- [ ] All {{章节数}} chapters' research/ files complete with RESEARCH_COMPLETE markers
- [ ] All {{章节数}} chapters' drafts/ files complete with DRAFT_COMPLETE markers
- [ ] All {{章节数}} chapters' reviews/ merged files complete with REVIEW_COMPLETE markers
- [ ] All {{章节数}} chapters' reader-feedback/ files complete with READER_PANEL_COMPLETE markers
- [ ] Append-only files under meta/ updated to latest
- [ ] checkpoint.md status matrix is all ✅

---

## Phase 4: Final Audit & Consolidation

### Participating Agents

| Agent | Code | Responsibility |
|-------|------|----------------|
| Chief Orchestrator | #0 | Full-book consolidation coordination |
| R1 Code Review | R1 | Final verification of code accuracy across the entire book |
| R2 Consistency Review | R2 | Final verification of terminology/metaphor consistency across the entire book |
| R3 Content Review | R3 | Final verification of sensitivity/readability across the entire book |

### Execution Steps

```
Step 4.1  Full-book read-through and consolidation
          ├── Check narrative coherence chapter by chapter
          ├── Unify transition paragraphs
          └── Output: chapters/chXX.md (final version, one file per chapter)

Step 4.2  Cross-reference validation
          ├── Reads: meta/cross-references.md
          ├── Verifies correctness of all "see Chapter X" references
          └── Corrects erroneous references

Step 4.3  Terminology consistency final check
          ├── Reads: meta/glossary.md
          ├── Searches the entire book for consistent term usage
          └── Corrects inconsistencies

Step 4.4  Comprehensive sensitivity scan
          ├── R3 performs final sensitivity scan of the entire book
          ├── Focus: {{敏感性检查项}}
          └── Output: final-audit-report.md
```

### Deliverables

| File | Description |
|------|-------------|
| `chapters/ch01.md` ~ `chapters/ch{{章节数}}.md` | Final approved chapters |
| `final-audit-report.md` | Final audit report |

### Phase 4 Handoff Checklist

- [ ] All chapter files under chapters/ generated
- [ ] All cross-references validated
- [ ] Terminology consistency check passed
- [ ] Sensitivity scan passed
- [ ] final-audit-report.md has no ❌ items

---

## Phase 5: HTML Typesetting & Publishing

### Participating Agents

| Agent | Code | Responsibility |
|-------|------|----------------|
| Typesetter | #11 | Full Markdown → HTML conversion workflow |

### Execution Steps

```
Step 5.1  Markdown → HTML conversion
          ├── Reads: chapters/*.md
          ├── Applies HTML template
          └── Outputs: publish/chXX.html

Step 5.2  Code block syntax highlighting
          ├── Apply syntax highlighting to all code blocks
          └── Supported languages: {{代码语言列表}}

Step 5.3  Diagram conversion
          ├── ASCII diagrams → SVG
          └── Embedded in HTML pages

Step 5.4  Navigation system
          ├── Generate table of contents page: publish/index.html
          ├── Previous/next chapter navigation links
          └── Sidebar table of contents

Step 5.5  Style and beautification
          ├── Apply CSS styles: publish/style.css
          ├── Responsive layout
          └── Code block styles, blockquote styles, table styles
```

### Deliverables

| File | Description |
|------|-------------|
| `publish/index.html` | Table of contents home page |
| `publish/ch01.html` ~ `publish/ch{{章节数}}.html` | Per-chapter HTML |
| `publish/style.css` | Full-book stylesheet |
| `publish/assets/` | Diagrams, images, and other static assets |

### Phase 5 Handoff Checklist

- [ ] All chapter HTML files generated
- [ ] Navigation system works correctly
- [ ] Code highlighting renders correctly
- [ ] Displays correctly in mainstream browsers
- [ ] Responsive layout works on mobile

---

## Exception Handling

### Review Failure

```
Trigger: R1/R2/R3 gives a ❌ (critical issue)

Handling:
  1. Chief Orchestrator reads the ❌ items from reviews/chXX-review.md
  2. Sends the ❌ items together with the original draft to the Writer (#4)
  3. Writer outputs revised version: drafts/chXX-draft-v2.md
  4. Re-triggers the corresponding review (only re-reviews the Reviewer that gave ❌)
  5. If it fails again, escalate to manual intervention

Maximum retries: {{最大审查重试次数，默认2}}
```

### Word Count Out of Range

```
Trigger: draft word count < {{每章目标字数}} × 0.8  or  > {{每章目标字数}} × 1.2

Handling:
  Under word count:
    1. Chief Orchestrator marks which sections are too brief
    2. Writer (#4) expands those specific sections
    3. Recount

  Over word count:
    1. Chief Orchestrator marks which sections are redundant
    2. Writer (#4) trims those specific sections
    3. Recount
```

### Consecutive Failures

```
Trigger: the same chapter fails {{最大连续失败次数，默认3}} consecutive operations

Handling:
  1. Log failure reason to audit-log.md
  2. Skip this chapter and continue with subsequent chapters
  3. Mark as ⚠️ NEEDS_HUMAN_REVIEW in checkpoint.md
  4. After all processable chapters complete, summarize the list of chapters requiring manual intervention
```

---

## Completion Marker System

### Marker Definitions

Each marker is appended as an HTML comment at the **last line** of the corresponding file:

```
<!-- RESEARCH_COMPLETE -->
<!-- DRAFT_COMPLETE -->
<!-- R1_CODE_REVIEW_COMPLETE -->
<!-- R2_CONSISTENCY_REVIEW_COMPLETE -->
<!-- R3_CONTENT_REVIEW_COMPLETE -->
<!-- REVIEW_COMPLETE -->
<!-- READER_PANEL_COMPLETE -->
<!-- CHAPTER_FINAL -->
<!-- HTML_COMPLETE -->
```

### Marker Flow

```
Research done          Writing done          Three reviews individually done    Merged done
RESEARCH     ───▶  DRAFT      ───▶  R1_CODE_REVIEW      ───▶  REVIEW
_COMPLETE          _COMPLETE         R2_CONSISTENCY_REVIEW      _COMPLETE
                                     R3_CONTENT_REVIEW

                                                   Reader panel done
                                              ───▶ READER_PANEL
                                                    _COMPLETE

Final consolidation    HTML done
CHAPTER      ───▶  HTML
_FINAL              _COMPLETE
```

### Marker Detection

```bash
# Detect completion marker in a single file
grep -l "RESEARCH_COMPLETE" research/ch*.md

# Detect writing completion status for all chapters
for f in drafts/ch*-draft.md; do
  if grep -q "DRAFT_COMPLETE" "$f"; then
    echo "✅ $f"
  else
    echo "❌ $f"
  fi
done

# Generate full-book progress matrix
# See checkpoint.md format in recovery.md
```

---

## Phase Handoff Checklist Summary

| Phase | Must Confirm Before Handoff | Verification Method |
|-------|-----------------------------|---------------------|
| 1→2 | outline-final.md exists and user-confirmed | File exists + user verbal confirmation |
| 2→3 | All 5 files under meta/ created | File existence check |
| 3→4 | All chapters' 4-step pipeline complete | checkpoint.md all ✅ |
| 4→5 | All chapters finalized under chapters/ + audit report has no ❌ | File exists + marker detection |
| 5→Publish | All HTML under publish/ + navigation functional | File exists + browser verification |

---

## Appendix: Agent Role Quick Reference

| Code | Role | Phases | Agent Type |
|------|------|--------|------------|
| #0 | Chief Orchestrator | 2, 3, 4 | User / script |
| #1 | Architect | 1 | general-purpose |
| #2 | Reader Advocate | 1 | general-purpose |
| #3 | Researcher | 3 | explore |
| #4 | Writer | 3 | general-purpose |
| R1 | Code Reviewer | 3, 4 | explore |
| R2 | Consistency Reviewer | 3, 4 | explore |
| R3 | Content Reviewer | 1, 3, 4 | general-purpose |
| RS | Reader — {{读者画像_学生}} | 3 | explore |
| RE | Reader — {{读者画像_工程师}} | 3 | explore |
| RH | Reader — {{读者画像_高手}} | 3 | explore |
| #11 | Typesetter | 5 | general-purpose |
