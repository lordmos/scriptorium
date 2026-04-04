<!--
  Translation status:
  Source file : framework/review-architecture.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../framework/review-architecture.md) · **English** · [日本語](../../ja/framework/review-architecture.md) · [繁體中文](../../zh-TW/framework/review-architecture.md)

---

# Triple-Parallel Review Architecture

> **Framework Document** — Splitting review dimensions by data dependency to achieve parallel review — the core innovation of this framework
> This is the design pattern with the most significant efficiency gain in the multi-agent editorial system

---

## 1. Design Motivation

### The Bottleneck of Traditional Review

Traditional approach: one Reviewer completes reviews across **all dimensions**.

```
Traditional single-Reviewer review:

  Context that must be loaded:
  ┌─────────────────────────────────────────────────┐
  │  drafts/chXX-draft.md       — draft to review   │
  │  {{源码根目录}}/{{文件列表}} — verify code accuracy│
  │  meta/chapter-summaries.md   — check cross-chapter consistency │
  │  meta/glossary.md            — check terminology consistency    │
  │  meta/metaphor-registry.md  — check metaphor consistency        │
  │  meta/style-guide.md         — check writing style              │
  │  source-map.md               — locate source files              │
  └─────────────────────────────────────────────────┘

  Total context = draft + source code + long-term memory + style guide
               ≈ 15K + 20K + 15K + 3K
               = 53K tokens

  Problem: the context window may not be large enough!
           And even if it is, attention gets diluted.
```

### Key Insight

> **Different review dimensions require almost non-overlapping data sets.**

```
Review dimension analysis:

  "Is the code correct?"     → Needs: source code + draft → Does NOT need: long-term memory, style guide
  "Is it cross-chapter consistent?" → Needs: long-term memory + draft → Does NOT need: source code, style guide
  "Is it readable?"          → Needs: style guide + draft → Does NOT need: source code, long-term memory

  The data requirements of the three dimensions are nearly orthogonal!
  → Can be split into three independent review Agents
  → Each Agent only loads the data subset it needs
  → Three Agents can run in parallel
```

---

## 2. Division of Responsibilities

### Architecture Overview

```
                    drafts/chXX-draft.md
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ R1 Code   │ │ R2 Cons- │ │ R3 Con-  │
        │ Review    │ │ istency  │ │ tent     │
        │           │ │ Review   │ │ Review   │
        │ +source   │ │ +long-   │ │ +style   │
        │  files    │ │  term    │ │  guide   │
        │ +source   │ │  memory  │ │          │
        │  map      │ │  files   │ │          │
        └────┬──────┘ └────┬─────┘ └────┬─────┘
             │             │            │
             ▼             ▼            ▼
        r1-code.md  r2-consistency  r3-content
                       .md            .md
              │             │            │
              └─────────────┼────────────┘
                            ▼
                   reviews/chXX-review.md
                      (merged report)
```

### R1: Code Review

```
Responsibility: Verify the accuracy of all code-related content in the chapter

Agent type: explore (suited for extensive source code search and comparison)

Review items:
  ✅ Do code snippets match the source code?
  ✅ Are function signatures, parameters, and return values correct?
  ✅ Does the described execution flow match the actual code path?
  ✅ Is the data structure description complete and accurate?
  ✅ Is the analysis of design decisions well-reasoned?

File Pointers:
  📖 Reads: drafts/chXX-draft.md          — draft to review
  📖 Reads: source-map.md                 — locate source files
  📖 Reads: {{源码根目录}}/{{文件列表}}    — actual source code
  ✏️ Writes: reviews/chXX-r1-code.md       — code review report

Does NOT read:
  ✗ meta/chapter-summaries.md  — R1 does not care about cross-chapter consistency
  ✗ meta/glossary.md           — R1 does not check term usage
  ✗ meta/style-guide.md        — R1 does not review writing style

Context budget:
  Draft:      ~15K tokens
  Source code: ~20K tokens (only files relevant to this chapter)
  source-map:  ~2K tokens
  ─────────────────
  Total:      ~37K tokens (significantly less than 53K)
```

#### R1 Report Format

```markdown
# R1 Code Review Report — Chapter {{章节号}}

Review time: {{时间戳}}
Corresponding draft: drafts/ch{{章节号}}-draft.md
Reference source: {{源码文件列表}}

## Review Results

### ❌ Critical Errors (must be fixed)
1. [Location: §X.X paragraph N]
   - Issue: {{describe the code error}}
   - Draft text: "{{quote the erroneous description from the draft}}"
   - Actual source: "{{quote actual source code}}"
   - Suggested fix: {{fix suggestion}}

### ⚠️ Inaccuracies (recommended to fix)
1. [Location: §X.X paragraph N]
   - Issue: {{describe the inaccuracy}}
   - Suggestion: {{fix suggestion}}

### ✅ Confirmed Correct
- The description of {{feature A}} in §X.X is accurate
- The code snippet in §X.X matches the source code
- ...

## Overall Assessment
- Critical errors: N
- Inaccuracies: M
- Recommendation: {{Pass / Needs revision}}

<!-- R1_CODE_REVIEW_COMPLETE -->
```

### R2: Consistency Review

```
Responsibility: Verify consistency between this chapter and the rest of the book

Agent type: explore (suited for cross-file search and comparison)

Review items:
  ✅ Is term usage consistent with the glossary?
  ✅ Do metaphors/analogies duplicate or contradict entries in the metaphor-registry?
  ✅ Are concept explanations consistent with preceding chapters?
  ✅ Are cross-references correct ("as described in Chapter X")?
  ✅ Is the knowledge progression reasonable (not re-explaining already-covered concepts)?

File Pointers:
  📖 Reads: drafts/chXX-draft.md          — draft to review
  📖 Reads: meta/chapter-summaries.md     — preceding chapter summaries
  📖 Reads: meta/glossary.md              — glossary
  📖 Reads: meta/metaphor-registry.md    — metaphor registry
  📖 Reads: meta/cross-references.md     — cross-reference table
  ✏️ Writes: reviews/chXX-r2-consistency.md — consistency review report

Does NOT read:
  ✗ source files     — R2 does not verify code
  ✗ style-guide      — R2 does not review writing style

Context budget:
  Draft:                ~15K tokens
  Long-term memory files: ~15K tokens (grows as chapters increase)
  ─────────────────
  Total:                ~30K tokens
```

#### R2 Report Format

```markdown
# R2 Consistency Review Report — Chapter {{章节号}}

Review time: {{时间戳}}
Comparison baseline: long-term memory files from the completed {{已完成章节数}} chapters

## Review Results

### ⚠️ Term Inconsistencies
1. [Location: §X.X]
   - This chapter uses: "{{term A}}"
   - Glossary definition: "{{term B}}"
   - Suggestion: unify as "{{recommended term}}"

### ⚠️ Metaphor Conflicts / Duplicates
1. [Location: §X.X]
   - This chapter's metaphor: "{{metaphor description}}"
   - Existing metaphor (Chapter Y): "{{existing metaphor description}}"
   - Suggestion: {{revision suggestion}}

### ⚠️ Cross-reference Issues
1. [Location: §X.X]
   - Text: "As described in Chapter Z..."
   - Issue: Chapter Z does not cover this content
   - Suggestion: {{fix suggestion}}

### ✅ Consistency Confirmed
- Term usage is consistent with preceding chapters
- Knowledge progression is reasonable; no re-explanation of already-covered content
- ...

## New Items to Append to Long-term Memory
### New Terms
- {{term 1}}: {{definition}}

### New Metaphors
- {{metaphor 1}}: used to explain {{concept}}

## Overall Assessment
- Inconsistencies: N
- Recommendation: {{Pass / Needs revision}}

<!-- R2_CONSISTENCY_REVIEW_COMPLETE -->
```

### R3: Content Review

```
Responsibility: Verify readability, writing quality, and {{敏感性检查项}}

Agent type: general-purpose (requires deep understanding and judgment)

Review items:
  ✅ Does the writing conform to the style-guide standards?
  ✅ Is the paragraph structure clear?
  ✅ Are technical concepts explained accessibly?
  ✅ Do transition paragraphs flow naturally?
  ✅ {{敏感性检查项}}
  ✅ Is the word count on target ({{每章目标字数}} ± 20%)?
  ✅ Is the ratio of code to prose appropriate?

File Pointers:
  📖 Reads: drafts/chXX-draft.md     — draft to review
  📖 Reads: meta/style-guide.md      — writing style guide
  ✏️ Writes: reviews/chXX-r3-content.md — content review report

Does NOT read:
  ✗ source files        — R3 does not verify code accuracy
  ✗ long-term memory    — R3 does not check cross-chapter consistency

Context budget:
  Draft:       ~15K tokens
  style-guide: ~3K tokens
  ─────────────────
  Total:       ~18K tokens (smallest of the three)
```

#### R3 Report Format

```markdown
# R3 Content Review Report — Chapter {{章节号}}

Review time: {{时间戳}}
Word count: {{实际字数}} / {{目标字数}} ({{百分比}}%)

## Review Results

### ❌ Sensitivity Issues
1. [Location: §X.X paragraph N]
   - Issue: {{sensitivity issue description}}
   - Suggestion: {{revision suggestion}}

### ⚠️ Readability Issues
1. [Location: §X.X]
   - Issue: technical concept explained in an overly obscure way
   - Original text: "{{quote original text}}"
   - Suggestion: {{rewrite suggestion}}

### 💡 Writing Suggestions
1. [Location: §X.X]
   - Suggestion: {{improvement suggestion}}

### ✅ Writing Quality Confirmed
- Opening introduction flows naturally
- Code-to-prose ratio is appropriate
- ...

## Overall Assessment
- Sensitivity issues: N
- Readability issues: M
- Word count on target: {{Yes / No}}
- Recommendation: {{Pass / Needs revision}}

<!-- R3_CONTENT_REVIEW_COMPLETE -->
```

---

## 3. Parallel Safety Analysis

### Why Triple-Parallel Review Is Safe

```
Three conditions for concurrency safety:

1. No read conflicts
   All three Reviewers read the same drafts/chXX-draft.md
   but all are read-only operations → no contention

2. No write conflicts
   R1 writes: reviews/chXX-r1-code.md
   R2 writes: reviews/chXX-r2-consistency.md
   R3 writes: reviews/chXX-r3-content.md
   The three output files are completely different → no contention

3. No shared mutable state
   None of the three Reviewers modifies any shared file
   Long-term memory files are read-only during the review phase
   → no side-effect conflicts
```

### Data Isolation Matrix

```
              │ Source files │ Long-term memory │ style-guide │ draft │
──────────────┼──────────────┼──────────────────┼─────────────┼───────┤
R1 Code       │  Reads ✅    │       —          │      —      │ Reads │
R2 Consistency│     —        │   Reads ✅       │      —      │ Reads │
R3 Content    │     —        │       —          │  Reads ✅   │ Reads │
──────────────┼──────────────┼──────────────────┼─────────────┼───────┤
Conflict?     │     No       │       No         │      No     │  No   │
              │ (only R1)    │   (only R2)      │  (only R3)  │(all read-only)│
```

---

## 4. Report Merging

### When to Merge

After all three independent reports are complete, the Chief Orchestrator Agent merges them into a unified review report.

```
Trigger condition:
  reviews/chXX-r1-code.md         exists and has R1_CODE_REVIEW_COMPLETE
  reviews/chXX-r2-consistency.md  exists and has R2_CONSISTENCY_REVIEW_COMPLETE
  reviews/chXX-r3-content.md      exists and has R3_CONTENT_REVIEW_COMPLETE

  All three conditions met → trigger merge
```

### Merge Rules

```
Priority (highest to lowest):

1. R1's ❌ (code errors)          — highest priority
   Inaccurate code is a fatal flaw in a technical book
   Any ❌ must be fixed before passing

2. R3's ❌ (sensitivity issues)   — high priority
   Sensitivity issues must be addressed

3. R2's ⚠️ (inconsistencies)     — medium priority
   Cross-chapter inconsistencies hurt reading experience
   Recommended to fix but not a blocker

4. R3's ⚠️ (readability issues)  — medium priority
   Affects reading experience

5. All 💡 (suggestions)           — low priority
   May be adopted or ignored
```

### Merged Report Format

```markdown
# Consolidated Review Report — Chapter {{章节号}}

Merged at: {{时间戳}}
Sources: R1 Code Review + R2 Consistency Review + R3 Content Review

## Overall Verdict: {{Pass / Needs revision}}

## ❌ Must Fix (from R1/R3)
1. [R1] {{code error description}} → {{fix suggestion}}
2. [R3] {{sensitivity issue description}} → {{fix suggestion}}

## ⚠️ Recommended to Fix (from R2/R3)
1. [R2] {{consistency issue description}} → {{fix suggestion}}
2. [R3] {{readability issue description}} → {{rewrite suggestion}}

## 💡 Optional Improvements
1. [R3] {{suggestion description}}

## New Long-term Memory Items (from R2)
### New Terms
- {{term}}: {{definition}}

### New Metaphors
- {{metaphor description}}

## Per-Reviewer Summary
- R1 Code Review:        {{Pass / Needs revision}} (❌×N, ⚠️×M)
- R2 Consistency Review: {{Pass / Needs revision}} (⚠️×N)
- R3 Content Review:     {{Pass / Needs revision}} (❌×N, ⚠️×M, 💡×K)

<!-- REVIEW_COMPLETE -->
```

### Post-merge Flow

```
Merged report verdict is "Pass":
  → Proceed to Step 4 (Reader Panel)
  → No Writer revisions needed

Merged report verdict is "Needs revision":
  → Send merged report + original draft to the Writer (#4)
  → Writer revises addressing all ❌ and ⚠️ items
  → Output new draft version: drafts/chXX-draft-v2.md
  → Re-review (only re-run the relevant dimensions)
  → Maximum retries: {{最大审查重试次数，默认2}}
```

---

## 5. Distinction from the Reader Panel

### Role Comparison

```
┌────────────────────────┬──────────────────────────┐
│   Review Group (R1/R2/R3)│  Reader Panel (RS/RE/RH) │
├────────────────────────┼──────────────────────────┤
│ Reviews technical quality│ Evaluates reading experience│
│ Has pass/fail authority  │ Advisory only, no veto   │
│ Errors must be fixed     │ Feedback is for reference │
│ Executes in Step 3       │ Executes in Step 4       │
│ Focus: is it correct?    │ Focus: is it readable?   │
│ Based on objective standards│ Based on subjective experience│
│ Must all pass to proceed │ Does not block the pipeline│
└────────────────────────┴──────────────────────────┘
```

### Rationale for Execution Order

```
Why does the Review Group come before the Reader Panel?

  1. If the code is wrong, the Reader Panel is pointless
     → Ensure correctness first, then evaluate experience

  2. Review may trigger revisions, and revised content changes
     → Let the Reader Panel evaluate the final version

  3. Review has veto power and may trigger a rewrite
     → Pass the "hard requirements" before the "soft requirements"

Flow:
  Writing → Review Group (R1+R2+R3) → [possible revisions] → Reader Panel (RS+RE+RH) → Done
```

### Reader Panel Data Requirements

```
The Reader Panel does not need source code or long-term memory:

  RS {{读者画像_学生}}:
    📖 Reads: draft + merged review report
    Focus: learning curve, prerequisite knowledge assumptions, example difficulty

  RE {{读者画像_工程师}}:
    📖 Reads: draft + merged review report
    Focus: practical value, actionability, engineering practices

  RH {{读者画像_高手}}:
    📖 Reads: draft + merged review report
    Focus: technical depth, advanced usage, performance analysis
```

---

## 6. Efficiency Analysis

### Time Comparison

```
Assumptions:
  Single Reviewer loading full context for review: T_full minutes
  R1 review (code dimension only):        T_r1 ≈ 0.6 × T_full
  R2 review (consistency dimension only): T_r2 ≈ 0.4 × T_full
  R3 review (content dimension only):     T_r3 ≈ 0.3 × T_full
  Merging reports:                         T_merge ≈ 0.1 × T_full

Serial review:   T_serial   = T_full
Triple-parallel: T_parallel = max(T_r1, T_r2, T_r3) + T_merge
                            = 0.6 × T_full + 0.1 × T_full
                            = 0.7 × T_full

Efficiency gain: approximately 30% time savings
```

### Quality Comparison

```
Serial (single Reviewer):
  Advantage: single perspective, internally consistent
  Disadvantage: attention scattered, easy to miss things, large context window pressure

Parallel (three Reviewers):
  Advantages:
    - Each Reviewer focuses on one dimension; concentrated attention
    - Each Reviewer has less context window pressure
    - Three independent perspectives; less likely to miss the same issue simultaneously
  Disadvantages:
    - Requires an additional merge step
    - Three Reviewers may have conflicting opinions on the same passage (resolved by priority rules)

Conclusion: triple-parallel review outperforms serial review in both time and quality.
```

### Cost Analysis

```
API call costs:

Serial:   1 call × large context  = high per-call cost
Parallel: 3 calls × small context = 3× call count but lower per-call cost

Since most APIs charge per token:
  Serial:   53K input tokens × 1 = 53K tokens
  Parallel: 37K + 30K + 18K = 85K tokens

Total input tokens for parallel is slightly more (because the draft is read 3 times),
but considering the time savings and quality improvement, it is generally worthwhile.

Optimization: if cost is a concern, smaller/cheaper models can be used for R2 and R3,
since their task complexity is lower than R1's.
```

---

## 7. Extension: Custom Review Dimensions

### Adding a New Reviewer

The triple-review architecture can be extended to N reviews. The key is ensuring that any new dimension has **independent data requirements**.

```
Example: adding R4 Performance Review

R4 Performance Review:
  📖 Reads: drafts/chXX-draft.md + performance benchmark data
  ✏️ Writes: reviews/chXX-r4-performance.md
  Review items: Are descriptions of the performance impact of code examples accurate?
                Are important performance considerations missing?
  Completion marker: <!-- R4_PERFORMANCE_REVIEW_COMPLETE -->

Parallel-safe with R1/R2/R3: ✅ (writes to a different file, reads non-overlapping auxiliary data)
```

### Reducing Reviewers

For simpler projects that do not need all dimensions:

```
Lean option 1: keep only R1 + R3
  - R1 verifies code; R3 verifies readability
  - Omit R2 consistency (suitable for short books / independent chapters)

Lean option 2: keep only R1
  - Verify code accuracy only
  - Suitable for technical notes / documentation rather than formal books

Note: regardless of how much you trim, R1 Code Review is recommended to keep,
because code accuracy is the baseline for any technical book.
```

---

## 8. Summary of Design Principles

```
Principle 1: Split by data dependency
  Different review dimensions need different data → let each one access only what it needs

Principle 2: Shared reads, isolated writes
  All Reviewers share read-only access to the same draft
  but each writes to its own independent report file

Principle 3: Priority resolves conflicts
  Different Reviewers may have different views on the same issue
  Resolve conflicts through explicit priority rules

Principle 4: Extensible and trimmable
  Three reviews is not a fixed number; increase or decrease based on project needs
  The key is ensuring each dimension has independent data requirements
```
