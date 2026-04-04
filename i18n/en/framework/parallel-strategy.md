<!--
  Translation status:
  Source file : framework/parallel-strategy.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../framework/parallel-strategy.md) · **English** · [日本語](../../ja/framework/parallel-strategy.md) · [繁體中文](../../zh-TW/framework/parallel-strategy.md)

---

# DAG Batch Execution Strategy

> **Framework Document** — How to safely parallelize chapter writing to maximize production efficiency
> Applicable to any technical book project with inter-chapter dependencies

---

## 1. The Problem: Why Not Parallelize Everything

### The Naive Idea

> "{{章节数}} chapters are completely independent — write them all in parallel and finish in one go."

### Why It Doesn't Work

Technical book chapters are **not** completely independent:

```
Chapter 5: "As described in the message-queue mechanism introduced in Chapter 3..."
Chapter 8: "This reuses the configuration-loading pattern from Chapter 2..."
Chapter 12: "Combining the core data structures from Chapter 4 with the execution engine from Chapter 7..."
```

If Chapter 5 and Chapter 3 are written simultaneously:
- When the Chapter 5 Writer reads `chapter-summaries.md`, Chapter 3's summary **does not yet exist**
- The Writer can only guess at Chapter 3's content → inconsistencies, wrong references
- The glossary doesn't yet contain new terms introduced in Chapter 3 → naming inconsistencies

### Core Constraint

> **The File Pointers mechanism requires: Agents writing later chapters must be able to read the long-term memory updates from earlier chapters.**
> **Therefore, chapters with dependencies must be executed in order.**

---

## 2. Dependency Analysis: Building the Chapter DAG

### What Is a Chapter Dependency

Chapter A **depends on** chapter B if and only if:
- A references a concept first introduced in B
- A uses terminology defined in B
- A's code examples build on B's code examples
- A's "knowledge ladder" assumes the reader has already read B

### Extracting Dependencies from the Outline

After Phase 1 (Outline Finalization), extract dependencies from `outline-final.md`:

```
Method 1: Explicit declaration
  Annotate each chapter in the outline with "prerequisite chapters":
  ## Chapter 5: {{章节标题}}
  Prerequisites: ch03, ch04

Method 2: Automatic inference
  Analyze each chapter's "learning objectives" and "prerequisites"
  If chapter A's prerequisites include chapter B's learning objectives → A depends on B

Method 3: Manual annotation
  User directly annotates dependencies when finalizing the outline
```

### DAG Representation

Represent chapter dependencies as a Directed Acyclic Graph (DAG):

```
Example: a technical book with {{章节数}} chapters

ch01 ─────┐
          ├───▶ ch03 ──────┐
ch02 ─────┘                ├───▶ ch06 ──────┐
                           │                ├───▶ ch08
ch04 ──────────────────────┘                │
                                            │
ch05 ──────────────────────────────────────┘

ch07 (independent chapter, no prerequisites)

Dependencies:
  ch03 depends on [ch01, ch02]
  ch06 depends on [ch03, ch04]
  ch08 depends on [ch05, ch06]
  ch07 depends on []  ← fully independent
```

### Dependency Configuration Format

Declare dependencies in the project configuration using the following format:

```yaml
# chapter-dependencies.yaml
chapters:
  ch01: []                    # no dependencies, foundational chapter
  ch02: []                    # no dependencies, foundational chapter
  ch03: [ch01, ch02]          # depends on foundational concepts from first two chapters
  ch04: []                    # independent topic
  ch05: [ch01]                # depends only on Chapter 1
  ch06: [ch03, ch04]          # depends on Chapters 3 and 4
  ch07: []                    # independent chapter
  ch08: [ch05, ch06]          # depends on Chapters 5 and 6
  # ...
```

---

## 3. Batch Partitioning Algorithm

### Topological Sort Layering

Perform a topological sort on the DAG and partition it into multiple **batches**:

```
Algorithm:
  1. Find all nodes with in-degree 0 → these nodes form Batch 1
  2. Remove Batch 1 nodes and all their outgoing edges
  3. Find nodes with in-degree 0 again → form Batch 2
  4. Repeat until all nodes are assigned

Result:
  Batch 1: [ch01, ch02, ch04, ch05, ch07]  — all chapters with no dependencies
  Batch 2: [ch03]                           — depends on chapters in Batch 1
  Batch 3: [ch06]                           — depends on chapters in Batch 2
  Batch 4: [ch08]                           — depends on chapters in Batch 3
```

### Batch Execution Model

```
Time ──────────────────────────────────────────────────────────▶

Batch 1: ┌─ch01─┐ ┌─ch02─┐ ┌─ch04─┐ ┌─ch05─┐ ┌─ch07─┐
         └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
                           ▼ update long-term memory
Batch 2:                   ┌─ch03─┐
                           └──────┘
                           ▼ update long-term memory
Batch 3:                   ┌─ch06─┐
                           └──────┘
                           ▼ update long-term memory
Batch 4:                   ┌─ch08─┐
                           └──────┘

─── parallel within a batch ───── serial between batches ───
```

---

## 4. Parallel Safety Rules

### Rule 1: Parallel within a batch, serial between batches

```
✅ Allowed: ch01 and ch02 in Batch 1 execute research→writing→review→panel simultaneously
✅ Allowed: ch04 and ch07 in Batch 1 execute simultaneously

❌ Forbidden: ch01 from Batch 1 and ch03 from Batch 2 execute simultaneously
             (ch03 depends on ch01's long-term memory update)
```

### Rule 2: The 4 steps within a single chapter are strictly serial

```
For each chapter:
  Step 1 Research → Step 2 Writing → Step 3 Review → Step 4 Panel

❌ Forbidden: research and writing for the same chapter run in parallel
   (writing requires the research report as input)

❌ Forbidden: writing and review for the same chapter run in parallel
   (review requires the draft as input)
```

### Rule 3: Within the review step, parallelism is allowed

```
Within Step 3:
  ✅ R1, R2, R3 can review the same draft simultaneously
  (three reviewers read the same draft but write different output files)

Within Step 4:
  ✅ RS, RE, RH can review simultaneously
```

### Rule 4: Long-term memory files are updated at batch boundaries

```
Batch execution flow:
  1. Execute the full pipeline for all chapters in the batch in parallel
  2. After all chapters complete, update long-term memory files together:
     - chapter-summaries.md ← append summaries for all chapters
     - glossary.md          ← append all new terms
     - metaphor-registry.md ← append all new metaphors
  3. Start the next batch

Why not update immediately after each chapter completes?
  - Chapters within the same batch run in parallel
  - If ch01 updates summaries immediately after finishing, ch02 might be reading summaries at the same time
  - Updating at the batch boundary avoids read-write contention
```

### Rule 5: Chapters within the same batch must not cross-reference each other

```
Since chapters within the same batch are written in parallel, they should not reference each other.

If two chapters in the same batch are found to need cross-references:
  → This indicates missing dependency analysis
  → Move one of them to the next batch
  → Repartition the batches
```

---

## 5. Resource Constraints and Batch Size

### API Concurrency Limits

```
Actual concurrency = min(chapters in batch, {{最大并发数}})

Within each chapter's 4-step pipeline, Step 3 and Step 4 also have internal parallelism:
  - Step 3: 3 reviewers in parallel → 3 API calls
  - Step 4: 3 readers in parallel   → 3 API calls

Maximum simultaneous API calls for one chapter: 3
Maximum simultaneous API calls for N parallel chapters: N × 3 (when multiple chapters reach Step 3/4 at the same time)
```

### Context Quality Constraints

```
The more chapters run in parallel, the more long-term memory must be updated at once at the batch boundary.

Trade-offs:
  Too little parallelism: low efficiency, long project duration
  Too much parallelism:
    - Chapters in the same batch cannot reference each other
    - Terms may be defined differently across chapters (corrected at batch boundary)
    - Large long-term memory updates at batch boundaries

Recommendation: no more than {{最大批次大小，默认3-5}} chapters per batch
```

### Batch Size Adjustment Strategies

```
Strategy 1: Fixed size
  Fixed N chapters per batch — simple but may not be optimal

Strategy 2: Natural layering by dependency graph
  Use the natural layers from the topological sort directly
  Some layers may have only 1 chapter; others may have 5

Strategy 3: Split large batches
  If a layer has too many chapters (> {{最大批次大小}}), split into sub-batches
  Sub-batches have no dependencies on each other, but later sub-batches can
  leverage the long-term memory from earlier sub-batches

  Example:
    Original Batch 1 has 8 independent chapters → split into:
    Batch 1a: [ch01, ch02, ch04]  → update long-term memory
    Batch 1b: [ch05, ch07, ch09]  → update long-term memory (can use 1a's results)
    Batch 1c: [ch10, ch11]        → update long-term memory
```

---

## 6. Analogy to Streaming Tool Executors

This framework's parallel strategy mirrors the **Streaming Tool Executor** found in modern AI Agent frameworks.

### Concept Mapping

```
AI Agent framework concept         →  Book production concept
─────────────────────────────────────────────────────────────
Streaming Tool Executor            →  Chief Orchestrator (#0)
Tool call                          →  Agent dispatch
Bounded concurrency pool           →  Maximum parallelism per batch
Dependency wait                    →  Serial execution between batches
Independent tool calls run together→  Chapters in the same batch run in parallel
Resume after tool results converge →  Update long-term memory after batch completes
```

### Execution Pattern Comparison

```
AI Agent framework:
  const results = await Promise.all([
    tool1(),    // independent task 1
    tool2(),    // independent task 2
    tool3(),    // independent task 3
  ]);
  // continue using results after all complete

Book production:
  // Batch 1: parallel
  const batch1Results = await Promise.all([
    writeChapter(ch01),
    writeChapter(ch02),
    writeChapter(ch04),
  ]);
  updateLongTermMemory(batch1Results);

  // Batch 2: depends on Batch 1's long-term memory
  const batch2Results = await Promise.all([
    writeChapter(ch03),  // reads updated long-term memory
  ]);
  updateLongTermMemory(batch2Results);
```

---

## 7. Implementation Steps

### Step 1: Define Dependencies

After Phase 1 (Outline Finalization) completes, create a dependency configuration:

```markdown
## Chapter Dependencies

| Chapter | Dependencies | Notes |
|---------|--------------|-------|
| ch01 | — | {{章节1标题}}, foundational chapter |
| ch02 | — | {{章节2标题}}, foundational chapter |
| ch03 | ch01, ch02 | {{章节3标题}}, requires concepts from first two chapters |
| ... | ... | ... |
```

### Step 2: Generate Batch Plan

```markdown
## Batch Execution Plan

### Batch 1 (parallel)
- ch01: {{章节1标题}}
- ch02: {{章节2标题}}
Estimated time: {{单章时间}} (parallel execution)

### Batch 2 (wait for Batch 1 to complete)
- ch03: {{章节3标题}}
Estimated time: {{单章时间}}

### Totals
- Number of batches: {{批次数}}
- If serial: {{章节数}} × {{单章时间}} = {{总串行时间}}
- Using batch parallelism: {{实际预计时间}}
- Efficiency gain: {{提升百分比}}
```

### Step 3: Execute and Monitor

```
For each batch execution:
  1. Start Step 1 (Research) for all chapters in the batch in parallel
  2. As each chapter's research completes, start its Step 2 (Writing)
  3. As each chapter's writing completes, start its Step 3 (triple-parallel review)
  4. As each chapter's review completes, start its Step 4 (Reader Panel)
  5. All chapters in the batch complete
  6. Update long-term memory files together
  7. Update checkpoint.md
  8. Start the next batch
```

---

## 8. Exception Handling

### Single Chapter Failure Does Not Block Other Chapters in the Same Batch

```
Scenario: ch01 writing fails in Batch 1

Handling:
  1. Mark ch01 as failed, record in audit-log
  2. ch02 and ch04 continue normally
  3. When Batch 1 ends, long-term memory update only includes successful chapters
  4. ch01 can be retried in a later batch (does not affect the dependency graph)
     Note: if ch03 depends on ch01, ch03 must also be deferred
```

### Single Chapter Failure Causes Downstream Blockage

```
Scenario: ch03 depends on ch01, but ch01 keeps failing

Handling:
  1. Before the batch containing ch03 starts, check that all dependencies are complete
  2. If ch01 is incomplete → mark ch03 as BLOCKED
  3. Skip ch03 and continue executing other chapters in the batch that don't depend on ch01
  4. Finally, aggregate all BLOCKED chapters and await manual intervention
```

### Long-term Memory Conflicts at Batch Boundaries

```
Scenario: In Batch 1, ch01 and ch02 both define similar terms but with different wording

Handling:
  1. Detect conflicts during the long-term memory update after the batch completes
  2. Prefer the term definition from the chapter that finished first
  3. Naturally unify during the writing of subsequent chapters
  4. Final unification during Phase 4 (Final Audit & Consolidation)
```

---

## 9. Monitoring and Visualization

### Batch Progress Matrix

```
Batch 1:
  ch01: [✅Research] [✅Writing] [✅R1] [✅R2] [✅R3] [✅Merged] [✅Panel]
  ch02: [✅Research] [✅Writing] [✅R1] [⏳R2] [✅R3] [  Merged] [  Panel]
  ch04: [✅Research] [⏳Writing] [  R1] [  R2] [  R3] [  Merged] [  Panel]

Batch 2: (waiting for Batch 1)
  ch03: [  Research] [  Writing] [  R1] [  R2] [  R3] [  Merged] [  Panel]

Legend: ✅Done  ⏳In progress  ❌Failed  blank=Not started
```

This matrix is recorded in `checkpoint.md` — see `recovery.md` for details.
