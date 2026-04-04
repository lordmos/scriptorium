<!--
  Translation status:
  Source file : framework/recovery.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../framework/recovery.md) · **English** · [日本語](../../ja/framework/recovery.md) · [繁體中文](../../zh-TW/framework/recovery.md)

---

# Checkpoint Recovery & Disaster Recovery

> **Framework Document** — How to recover from interruptions in long-running multi-agent book production projects
> Core concept: the file system is the state; markers are proof; recovery is context reconstruction

---

## 1. The Problem: Interruption Risk in Long-running Projects

### Why Interruptions Happen

Multi-agent collaborative production of a technical book is a **long-running task**:

```
Typical project scale:
  Chapters: {{章节数}}
  4-step pipeline per chapter: Research → Writing → Review → Panel
  Time per step: minutes to tens of minutes
  Total project duration: may span multiple sessions over days or even weeks
```

Within this timeframe, the following interruption scenarios are almost **inevitable**:

| Interruption scenario | Frequency | Impact |
|-----------------------|-----------|--------|
| AI session timeout / disconnect | High | Loses current session's in-memory context |
| API call failure | Medium | Single Agent task fails |
| User-initiated pause | Medium | Must resume in a new session |
| Network interruption | Low | May produce half-finished files |
| System crash | Very low | May lose unsaved files |

### Core Challenge

> AI Agents are stateless. A new session knows **nothing** about what happened before.
> How can a new session quickly understand "where the project left off and what to do next"?

---

## 2. Recovery Information Sources (Highest to Lowest Priority)

### Three-tier Recovery System

```
┌─────────────────────────────────────────────────────┐
│           Recovery Information Source Priority        │
│                                                       │
│  Level 1 (most reliable):  checkpoint.md             │
│  ├── Structured status matrix                         │
│  ├── Completion status of every chapter and step      │
│  └── Last-updated timestamp                           │
│                                                       │
│  Level 2 (secondary):      SQL todos table            │
│  ├── If the previous session used SQL tracking        │
│  ├── Contains task status and dependencies            │
│  └── May not be up to date (depends on last session's │
│       update frequency)                               │
│                                                       │
│  Level 3 (fallback):       File system state inference│
│  ├── Scan directory structure to infer progress       │
│  ├── Detect completion markers in files               │
│  └── Slowest but most reliable — the file system      │
│       never lies                                      │
└─────────────────────────────────────────────────────┘
```

### Level 1: checkpoint.md

`checkpoint.md` is a dedicated project status file:

```markdown
# {{项目名称}} — Project Progress Checkpoint

Last updated: {{时间戳}}
Current Phase: {{当前Phase编号}}
Current Batch: Batch {{当前批次编号}}

## Phase 1: Outline Finalization — ✅ Complete
## Phase 2: Shared Resource Construction — ✅ Complete

## Phase 3: Chapter-by-Chapter Writing — ⏳ In progress

### Batch 1
| Chapter | Research | Writing | R1 Review | R2 Review | R3 Review | Merged Review | Reader Panel | Long-term Memory |
|---------|----------|---------|-----------|-----------|-----------|---------------|--------------|-----------------|
| ch01 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ch02 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ch04 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Batch 2
| Chapter | Research | Writing | R1 Review | R2 Review | R3 Review | Merged Review | Reader Panel | Long-term Memory |
|---------|----------|---------|-----------|-----------|-----------|---------------|--------------|-----------------|
| ch03 | ✅ | ✅ | ⏳ | ❌ | ✅ | — | — | — |
| ch05 | ✅ | ⏳ | — | — | — | — | — | — |

### Batch 3 — Not started
| Chapter | Research | Writing | R1 Review | R2 Review | R3 Review | Merged Review | Reader Panel | Long-term Memory |
|---------|----------|---------|-----------|-----------|-----------|---------------|--------------|-----------------|
| ch06 | — | — | — | — | — | — | — | — |

## Phase 4: Final Audit & Consolidation — Not started
## Phase 5: HTML Typesetting — Not started

Legend: ✅Done  ⏳In progress  ❌Failed  ⚠️Needs human review  — Not started
```

### Level 2: SQL todos Table

If the previous session used SQL tracking:

```sql
-- Query current progress
SELECT * FROM todos ORDER BY id;

-- Find incomplete tasks
SELECT * FROM todos WHERE status != 'done';

-- Find tasks that can start (all dependencies complete)
SELECT t.* FROM todos t
WHERE t.status = 'pending'
AND NOT EXISTS (
    SELECT 1 FROM todo_deps td
    JOIN todos dep ON td.depends_on = dep.id
    WHERE td.todo_id = t.id AND dep.status != 'done'
);
```

### Level 3: File System State Inference

When both checkpoint.md and SQL are unavailable, infer from the file system:

```bash
# Inference script logic (pseudo-code)

echo "=== Phase 1 Check ==="
if [ -f "outline-final.md" ]; then echo "Phase 1: ✅"; fi
if [ -f "source-map.md" ]; then echo "source-map: ✅"; fi

echo "=== Phase 2 Check ==="
for f in meta/glossary.md meta/style-guide.md meta/metaphor-registry.md \
         meta/chapter-summaries.md meta/cross-references.md; do
  if [ -f "$f" ]; then echo "$f: ✅"; else echo "$f: ❌"; fi
done

echo "=== Phase 3 Per-chapter Check ==="
for ch in $(seq -w 1 {{章节数}}); do
  echo "--- ch${ch} ---"

  # Research
  f="research/ch${ch}-research.md"
  if [ -f "$f" ] && grep -q "RESEARCH_COMPLETE" "$f"; then
    echo "  Research: ✅"
  elif [ -f "$f" ]; then
    echo "  Research: ⚠️ file exists but no completion marker"
  else
    echo "  Research: —"
  fi

  # Writing
  f="drafts/ch${ch}-draft.md"
  if [ -f "$f" ] && grep -q "DRAFT_COMPLETE" "$f"; then
    echo "  Writing: ✅"
  elif [ -f "$f" ]; then
    echo "  Writing: ⚠️ file exists but no completion marker"
  else
    echo "  Writing: —"
  fi

  # Reviews (R1/R2/R3)
  for r in r1-code r2-consistency r3-content; do
    f="reviews/ch${ch}-${r}.md"
    marker=$(echo "$r" | tr '[:lower:]' '[:upper:]' | sed 's/-/_/g')
    if [ -f "$f" ] && grep -q "${marker}_REVIEW_COMPLETE" "$f"; then
      echo "  $r: ✅"
    elif [ -f "$f" ]; then
      echo "  $r: ⚠️"
    else
      echo "  $r: —"
    fi
  done

  # Merged review
  f="reviews/ch${ch}-review.md"
  if [ -f "$f" ] && grep -q "REVIEW_COMPLETE" "$f"; then
    echo "  Merged review: ✅"
  elif [ -f "$f" ]; then
    echo "  Merged review: ⚠️"
  else
    echo "  Merged review: —"
  fi

  # Reader Panel
  f="reader-feedback/ch${ch}-panel.md"
  if [ -f "$f" ] && grep -q "READER_PANEL_COMPLETE" "$f"; then
    echo "  Reader Panel: ✅"
  elif [ -f "$f" ]; then
    echo "  Reader Panel: ⚠️"
  else
    echo "  Reader Panel: —"
  fi
done

echo "=== Phase 4 Check ==="
for ch in $(seq -w 1 {{章节数}}); do
  f="chapters/ch${ch}.md"
  if [ -f "$f" ] && grep -q "CHAPTER_FINAL" "$f"; then
    echo "ch${ch} finalized: ✅"
  elif [ -f "$f" ]; then
    echo "ch${ch} finalized: ⚠️"
  else
    echo "ch${ch} finalized: —"
  fi
done

echo "=== Phase 5 Check ==="
for ch in $(seq -w 1 {{章节数}}); do
  f="publish/ch${ch}.html"
  if [ -f "$f" ]; then echo "ch${ch} HTML: ✅"; else echo "ch${ch} HTML: —"; fi
done
```

---

## 3. Completion Marker Detection

### Marker Definitions

After completing a task, each Agent appends an HTML comment marker at the **last line** of its output file:

```
<!-- RESEARCH_COMPLETE -->           Researcher complete
<!-- DRAFT_COMPLETE -->              Writer complete
<!-- R1_CODE_REVIEW_COMPLETE -->     R1 code review complete
<!-- R2_CONSISTENCY_REVIEW_COMPLETE --> R2 consistency review complete
<!-- R3_CONTENT_REVIEW_COMPLETE -->  R3 content review complete
<!-- REVIEW_COMPLETE -->             Triple-review merge complete
<!-- READER_PANEL_COMPLETE -->       Reader Panel complete
<!-- CHAPTER_FINAL -->               Final approved version
<!-- HTML_COMPLETE -->               HTML conversion complete
```

### Marker Semantics

```
Marker present   = that step has successfully completed; output is trustworthy
Marker absent    = that step is incomplete, or was interrupted mid-way

Key principle:
  - The marker must be appended as the very last step after the file is fully written
  - The marker's presence is the only trustworthy evidence of completion
  - File exists but no marker ≠ complete (may be a half-finished product)
```

### Batch Detection Commands

```bash
# Detect completion status of all research reports
echo "=== Research completion status ==="
for f in research/ch*-research.md; do
  ch=$(basename "$f" | grep -o 'ch[0-9]*')
  if grep -q "RESEARCH_COMPLETE" "$f" 2>/dev/null; then
    echo "✅ $ch"
  else
    echo "❌ $ch (file $([ -f "$f" ] && echo 'exists but no marker' || echo 'does not exist'))"
  fi
done
```

---

## 4. Half-finished Product Detection and Handling

### What Is a Half-finished Product

A half-finished product is a file that has **been created but whose task is incomplete**. It is typically produced by:

```
Cause 1: Agent writing was interrupted mid-way (session timeout, API error)
  → File exists, content incomplete, no completion marker

Cause 2: Agent completed the content but was interrupted before the marker was appended
  → File exists, content complete, but no completion marker (rare but possible)

Cause 3: Agent ran abnormally and output substandard content
  → File exists, has completion marker, but content has problems (hardest to detect)
```

### Half-finished Product Detection Rules

```
┌────────────────────────────────────────────┐
│       Half-finished Product Decision Tree    │
│                                              │
│  Does the file exist?                        │
│  ├── No  → step not started, normal          │
│  └── Yes → check completion marker           │
│            ├── Marker present → ✅ complete, │
│            │    trustworthy                  │
│            └── Marker absent → ⚠️ possible  │
│                 half-finished product        │
│                ├── Check file size           │
│                │   ├── < 100 chars → almost  │
│                │   │   certainly half-done   │
│                │   │   → delete and redo     │
│                │   └── > 100 chars → possibly│
│                │       complete content but  │
│                │       missing marker        │
│                │       → manual review or redo│
│                └── Check if file is truncated│
│                    ├── Clearly truncated → redo│
│                    └── Looks complete → maybe│
│                        just missing marker   │
│                        → add marker manually │
└────────────────────────────────────────────┘
```

### Half-finished Product Handling Strategies

```
Strategy 1: Conservative (recommended)
  When in doubt, redo. Better to spend one extra Agent call than leave unreliable content.

  if file exists && no completion marker:
    Backup: mv file file.bak.{{时间戳}}
    Redo: reschedule the corresponding Agent

Strategy 2: Aggressive (use when cost matters)
  Try to reuse half-finished content.

  if file exists && no completion marker && content looks complete:
    Ask the Agent to complete the content based on what exists
    Append completion marker

Strategy 3: Manual decision
  Report the list of half-finished products to the user; let the user decide to keep or redo.
```

---

## 5. checkpoint.md Update Timing

### Update Rules

```
┌─────────────────────────────────────────────────┐
│       checkpoint.md Update Triggers               │
│                                                   │
│  Triggering event                Update type      │
│  ─────────────────────────────────────────────    │
│  Single step completes           Incremental      │
│  (e.g., ch03 research done)      (update one cell)│
│                                                   │
│  Single batch completes          Full update      │
│  (Batch 2 all chapters done)     (update full     │
│                                   batch table)    │
│                                                   │
│  Phase transition                Full update      │
│  (Phase 3 → 4)                   (update Phase    │
│                                   status)         │
│                                                   │
│  Anomaly occurs                  Incremental      │
│  (a step fails)                  (mark ❌)        │
│                                                   │
│  After manual intervention       Full update      │
│  (user manually fixed something) (re-scan status) │
└─────────────────────────────────────────────────┘
```

### Update Flow

```
When a step completes:
  1. Agent outputs the file and appends the completion marker
  2. Chief Orchestrator verifies the completion marker is present
  3. Updates the corresponding cell in checkpoint.md
  4. If this is the last step in the batch → trigger long-term memory update

When a batch completes:
  1. Confirm all steps for all chapters in the batch are complete
  2. Execute long-term memory file updates (summaries, glossary, etc.)
  3. Perform a full update of checkpoint.md
  4. Determine whether the next batch can begin

When a Phase transitions:
  1. Confirm all items on the current Phase's handoff checklist have passed
  2. Perform a full update of checkpoint.md (mark old Phase complete, new Phase started)
  3. Begin the first task of the new Phase
```

---

## 6. Disaster Recovery Scenarios

### Scenario 1: Writing Interrupted (Most Common)

```
Symptoms:
  - Session suddenly disconnects
  - drafts/chXX-draft.md may be a half-finished product

Recovery steps:
  1. Read checkpoint.md to identify the interruption point
  2. Detect half-finished files (file exists but no completion marker)
  3. Apply conservative strategy to half-finished files (backup + redo)
  4. Continue execution from the interruption point

Example:
  checkpoint shows ch05 writing = ⏳
  drafts/ch05-draft.md exists but has no DRAFT_COMPLETE marker
  → Back up ch05-draft.md
  → Reschedule Writer (#4) to write Chapter 5
```

### Scenario 2: Review Interrupted

```
Symptoms:
  - A reviewer's report is missing from the triple-parallel review
  - E.g., R1 and R3 are complete, but R2's report does not exist

Recovery steps:
  1. Check completion markers in reviews/chXX-r{1,2,3}-*.md
  2. Only redo the missing / incomplete reviewer
  3. Keep completed reviewer reports as-is

Example:
  reviews/ch05-r1-code.md        → has R1_CODE_REVIEW_COMPLETE ✅
  reviews/ch05-r2-consistency.md → does not exist ❌
  reviews/ch05-r3-content.md     → has R3_CONTENT_REVIEW_COMPLETE ✅
  → Only reschedule R2 to review ch05
  → After R2 completes, merge the three reports
```

### Scenario 3: Long-term Memory File Corrupted

```
Symptoms:
  - chapter-summaries.md is incomplete or has abnormal formatting
  - glossary.md is missing terms from some completed chapters

Recovery steps:
  1. Rebuild long-term memory from completed chapters/ or drafts/
  2. Scan chapter by chapter, re-extract summaries, terms, and metaphors
  3. Rebuild chapter-summaries.md, glossary.md, metaphor-registry.md

Rebuild strategy:
  if chapters/chXX.md exists (Phase 4 output):
    → Rebuild from the final approved version (most reliable)
  elif drafts/chXX-draft.md has DRAFT_COMPLETE marker:
    → Rebuild from the draft (reliable)
  else:
    → This chapter needs to be redone
```

### Scenario 4: Everything Lost

```
Symptoms:
  - checkpoint.md does not exist
  - SQL state unavailable
  - But the file system contains various output files

Recovery steps:
  1. Run the Level 3 file system inference (full scan)
  2. Reconstruct checkpoint.md based on scan results
  3. Rebuild long-term memory files (if missing)
  4. Continue from the inferred interruption point

This is the most time-consuming recovery method, but since the file system
is the only persistent storage, recovery is always possible.
```

### Scenario 5: Dependency Chain Broken

```
Symptoms:
  - A chapter in Batch 1 fails
  - Downstream chapters that depend on it cannot proceed

Recovery steps:
  1. Identify the failed chapter and all affected downstream chapters
  2. Retry the failed chapter
  3. If retry succeeds, continue with downstream chapters
  4. If retry still fails, mark as NEEDS_HUMAN_REVIEW
  5. Skip affected chapters; process unaffected chapters
  6. At the end, aggregate all chapters requiring manual intervention
```

---

## 7. The RESUME.md Pattern

### Design Concept

> At the end of each session, write "a letter to your next self."
> The new session reads this letter and can quickly restore context.

### RESUME.md Template

```markdown
# {{项目名称}} — Recovery Guide

Generated at: {{时间戳}}
Generated by: the previous orchestration session

---

## Project Overview
- Project: {{项目名称}}
- Source: {{源码仓库}}
- Chapters: {{章节数}}
- Working directory: {{工作目录}}

## Current Progress
- Current Phase: Phase {{N}}
- Current Batch: Batch {{M}}
- Completed chapters: {{已完成章节列表}}
- In-progress chapters: {{进行中章节列表}}
- Not-yet-started chapters: {{未开始章节列表}}

## Incomplete Tasks
1. {{task description 1}} — Status: {{status}} — Priority: {{High/Medium/Low}}
2. {{task description 2}} — Status: {{status}} — Priority: {{High/Medium/Low}}

## Known Issues
- {{issue description 1}} — Impact: {{impact scope}}
- {{issue description 2}} — Impact: {{impact scope}}

## Key Decision History
- {{decision 1}}: {{rationale and outcome}}
- {{decision 2}}: {{rationale and outcome}}

## Next Steps
1. Read checkpoint.md to confirm progress
2. Detect half-finished files
3. {{specific next action}}

## Important File Locations
- Checkpoint: {{工作目录}}/checkpoint.md
- Outline: {{工作目录}}/outline-final.md
- Source map: {{工作目录}}/source-map.md
- Shared resources: {{工作目录}}/meta/
- Drafts: {{工作目录}}/drafts/
- Reviews: {{工作目录}}/reviews/
- Final chapters: {{工作目录}}/chapters/
- Publish: {{工作目录}}/publish/
```

### RESUME.md Usage Flow

```
At session end:
  1. Chief Orchestrator generates / updates RESUME.md
  2. Also updates checkpoint.md
  3. Session ends

At new session start:
  1. Read RESUME.md → quickly get project overview and progress
  2. Read checkpoint.md → get the precise status matrix
  3. If necessary, run a file system scan to verify
  4. Determine the next action and continue execution
```

---

## 8. Recovery Flow Overview

```
┌──────────────────────────────────────────────────────────┐
│                  New Session Recovery Flow                  │
│                                                            │
│  Step 1: Identify recovery information sources             │
│  ├── RESUME.md exists?     ── Yes → read project overview  │
│  ├── checkpoint.md exists? ── Yes → read status matrix     │
│  └── Neither exists?       ── → file system scan           │
│                                                            │
│  Step 2: Determine interruption point                      │
│  ├── Which Phase?                                          │
│  ├── Which Batch?                                          │
│  └── Which Step?                                           │
│                                                            │
│  Step 3: Detect half-finished products                     │
│  ├── Scan overwritable file directories                    │
│  ├── Check completion markers                              │
│  └── Apply handling strategy to half-finished products     │
│                                                            │
│  Step 4: Reconstruct missing state                         │
│  ├── checkpoint.md missing → rebuild                       │
│  ├── Long-term memory files missing → rebuild from         │
│  │    drafts/chapters                                      │
│  └── SQL state missing → rebuild from checkpoint.md        │
│                                                            │
│  Step 5: Continue execution                                │
│  ├── Continue from interruption point                      │
│  ├── Redo the step corresponding to half-finished products │
│  └── Update checkpoint.md                                  │
└──────────────────────────────────────────────────────────┘
```

---

## 9. Best Practices

### Prevention over Recovery

```
1. Update checkpoint.md frequently
   - Update immediately after each step completes; don't wait until the batch ends

2. Keep RESUME.md up to date
   - Update whenever there is important progress
   - At minimum, update at the end of each batch

3. Use completion markers
   - All Agent prompts must require appending a completion marker
   - This is a prerequisite for the recovery mechanism to work

4. Never modify existing content in append-only files
   - chapter-summaries: only append; never modify preceding chapters' summaries
   - This way, even if an interruption occurs, existing content is safe
```

### Recovery Priority

```
When recovering, handle in the following priority order:

1. High priority: fix failures that block downstream work
   - A failed dependency chapter will block multiple subsequent chapters
   - Retry these critical chapters first

2. Medium priority: handle half-finished products
   - Files that exist but are incomplete
   - Back up and redo

3. Low priority: continue tasks that haven't started yet
   - Continue with the normal flow
```

### Manual Checkpoints

```
Recommended times for manual review:

1. After Phase 1 completes: confirm the outline meets expectations
2. After each Batch completes: spot-check one or two chapters for quality
3. After Phase 4 completes: read through the full book to confirm
4. Before publishing: final manual review

Manual checkpoints do not interrupt the automated pipeline but allow
problems to be caught early.
```
