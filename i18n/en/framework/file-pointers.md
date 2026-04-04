<!--
  Translation status:
  Source file : framework/file-pointers.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../framework/file-pointers.md) · **English** · [日本語](../../ja/framework/file-pointers.md) · [繁體中文](../../zh-TW/framework/file-pointers.md)

---

# Stateless Agent Memory Protocol (File Pointers)

> **Framework Document** — The core memory mechanism of the multi-agent collaboration system
> This is the **most important** design document in the entire framework. Understanding this document is a prerequisite for understanding the entire system.

---

## 1. The Core Problem

### The Stateless Dilemma

AI Agents are **stateless**. Every call starts from zero — no memory of previous conversations, no impression of prior chapters, no holistic sense of the whole book.

Yet technical book writing is **inherently stateful**:

- The terminology used in Chapter 5 must be consistent with Chapter 2
- The metaphors in Chapter 8 must not conflict with those in Chapter 3
- Chapter 12 needs to reference concepts introduced in Chapter 4
- Reviewers need to know the true behavior of the source code to verify draft accuracy

```
Traditional (stateful) writing:
  Human author ──── Brain memory ──── Cross-chapter continuity ✅

AI Agent writing:
  Agent call 1 ──── No memory ──── Next call
  Agent call 2 ──── No memory ──── Next call
  ...
  Every call is a new amnesiac individual ❌
```

### Why This Matters

Without solving this problem:
- The same concept may have different names in different chapters
- The same metaphor may be reused, or become contradictory
- Code examples may not match the actual behavior of the source code
- Chapters lack cohesion and cross-referencing

---

## 2. The Solution: File Pointers

### Core Concept

> **Rather than maintaining state inside the Agent, externalize state to the file system.**
> **Each time an Agent is dispatched, provide a precise list of file paths telling it what to read and what to write.**

These precise file path references are called **File Pointers**.

```
┌─────────────────────────────────────────────────┐
│              Chief Orchestrator Prompt            │
│                                                   │
│  "You are the Writer Agent, responsible for       │
│   writing Chapter 5.                              │
│                                                   │
│   📖 Read the following files for context:        │
│   - meta/chapter-summaries.md (understand Ch1-4) │
│   - meta/glossary.md (existing terms, stay consistent)│
│   - meta/metaphor-registry.md (used metaphors, avoid repetition)│
│   - meta/style-guide.md (writing style requirements)│
│   - research/ch05-research.md (this chapter's research report)│
│                                                   │
│   ✏️ Output to:                                   │
│   - drafts/ch05-draft.md"                         │
│                                                   │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│    Writer Agent #4   │
│                      │
│  Reads 5 files       │
│  Understands context │
│  Writes Chapter 5    │
│  Writes to draft file│
│                      │
│  (After this call    │
│   the Agent "forgets"│
│   but the file system│
│   retains all output)│
└─────────────────────┘
```

### Three Functions of File Pointers

1. **Inject context**: tells the Agent which files to read to obtain "memory"
2. **Specify output**: tells the Agent which file to write results to
3. **Isolate responsibility**: different Agents see only the files relevant to their role, preventing context pollution

---

## 3. File Classification

All project files are classified into three types by **lifecycle**:

### 3.1 Static Files

Created once and **never modified**. All Agents read only; none write.

| File | Created at | Description |
|------|-----------|-------------|
| `outline-final.md` | End of Phase 1 | Final approved outline |
| `source-map.md` | End of Phase 1 | Source file → chapter mapping |
| `meta/style-guide.md` | Phase 2 | Writing style guide |

```
Characteristics:
  - Written once, read many times
  - The "constitution" of the book; all Agents must comply
  - Modification requires manual decision (equivalent to "amending the constitution")
```

### 3.2 Append-only Files

Only ever grows — **new content is appended after each chapter completes**. These are the key to cross-chapter continuity.

| File | Appended at | Description |
|------|------------|-------------|
| `meta/chapter-summaries.md` | After each chapter completes | 200–300-word summary per chapter |
| `meta/glossary.md` | After each chapter completes | New terms and definitions |
| `meta/metaphor-registry.md` | After each chapter completes | New metaphors / analogies |
| `meta/cross-references.md` | After each chapter completes | New cross-reference points |
| `audit-log.md` | On any anomaly | Operation log |

```
Characteristics:
  - Grows continuously with book progress
  - Acts as the "long-term memory" for subsequent chapter Agents
  - Strictly append-only; never modifies existing content (prevents breaking consistency for preceding chapters)
  - When subsequent chapter Agents read these files, they can "see" the accumulated knowledge from all prior chapters
```

### 3.3 Overwritable Files

**Fully replaced** on each write. Lifecycle is limited to a single chapter.

| File pattern | Written by | Description |
|-------------|-----------|-------------|
| `research/chXX-research.md` | Researcher #3 | This chapter's source code analysis |
| `drafts/chXX-draft.md` | Writer #4 | This chapter's draft |
| `reviews/chXX-r1-code.md` | R1 | Code review report |
| `reviews/chXX-r2-consistency.md` | R2 | Consistency review report |
| `reviews/chXX-r3-content.md` | R3 | Content review report |
| `reviews/chXX-review.md` | Chief Orchestrator | Merged review report |
| `reader-feedback/chXX-panel.md` | Chief Orchestrator | Reader Panel merge |

```
Characteristics:
  - Each chapter has its own independent file; does not affect other chapters
  - If a redo is needed (e.g., review failed), simply overwrite
  - XX is a two-digit chapter number: 01, 02, ..., {{章节数}}
```

---

## 4. File Pointer Configuration per Agent

### Overview Diagram

```
                        ┌──────────────┐
                        │  Static files │
                        │ outline-final│
                        │ source-map   │
                        │ style-guide  │
                        └──────┬───────┘
                               │ reads
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │Researcher│    │ Writer#4  │    │ R1/R2/R3 │
        │   #3     │    │          │    │          │
        └────┬─────┘    └────┬─────┘    └────┬─────┘
             │writes          │writes          │writes
             ▼                ▼               ▼
        research/        drafts/          reviews/
        chXX-research    chXX-draft       chXX-r{1,2,3}
                              │
                              │ reads
                              ▼
                        ┌──────────────┐
                        │ Append-only  │
                        │  files       │
                        │ summaries    │
                        │ glossary     │◀─── updated after each chapter
                        │ metaphors    │
                        │ cross-refs   │
                        └──────────────┘
```

### 4.1 Researcher (#3)

```
Role: Deep source code analysis to provide material for the Writer
Agent type: explore

📖 Reads:
  - source-map.md              — locate source files for this chapter
  - outline-final.md           — get this chapter's writing requirements and scope
  - {{源码根目录}}/{{文件路径}} — actual source files (located via source-map)

✏️ Writes:
  - research/chXX-research.md  — source code analysis report

⚠️ Does NOT read:
  - Long-term memory files (summaries, glossary, etc.) — the Researcher focuses only on source code facts
  - Other chapters' drafts or research — avoid cross-contamination
```

### 4.2 Writer (#4)

```
Role: Transform the research report into a readable book chapter
Agent type: general-purpose

📖 Reads:
  - research/chXX-research.md    — this chapter's source code research report
  - meta/style-guide.md          — writing style requirements
  - meta/chapter-summaries.md    — preceding chapter summaries (to gain "memory")
  - meta/glossary.md             — existing terms (stay consistent)
  - meta/metaphor-registry.md   — existing metaphors (avoid repetition)
  - outline-final.md             — this chapter's outline requirements

✏️ Writes:
  - drafts/chXX-draft.md        — chapter draft

⚠️ Does NOT read:
  - Source files — the Writer learns about source code indirectly via the research report
  - Other chapters' drafts — learns about them indirectly via chapter-summaries
```

### 4.3 R1 Code Review

```
Role: Verify the accuracy of code descriptions in the chapter
Agent type: explore

📖 Reads:
  - drafts/chXX-draft.md          — draft to review
  - source-map.md                 — locate relevant source files
  - {{源码根目录}}/{{文件路径}}    — actual source files

✏️ Writes:
  - reviews/chXX-r1-code.md      — source code accuracy review report

⚠️ Does NOT read:
  - Long-term memory files — R1 only cares about "is the code correct?"
  - style-guide — R1 does not review writing style
```

### 4.4 R2 Consistency Review

```
Role: Verify consistency between this chapter and all other chapters in the book
Agent type: explore

📖 Reads:
  - drafts/chXX-draft.md          — draft to review
  - meta/chapter-summaries.md     — preceding chapter summaries
  - meta/glossary.md              — glossary
  - meta/metaphor-registry.md    — metaphor registry
  - meta/cross-references.md     — cross-reference table

✏️ Writes:
  - reviews/chXX-r2-consistency.md — consistency review report

⚠️ Does NOT read:
  - Source files — R2 does not care about code correctness
  - style-guide — R2 does not care about writing style
```

### 4.5 R3 Content Review

```
Role: Verify readability, {{敏感性检查项}}, and writing quality
Agent type: general-purpose

📖 Reads:
  - drafts/chXX-draft.md     — draft to review
  - meta/style-guide.md      — writing style guide

✏️ Writes:
  - reviews/chXX-r3-content.md — content review report

⚠️ Does NOT read:
  - Source files — R3 does not verify code
  - Long-term memory files — R3 does not check cross-chapter consistency
```

### 4.6 Reader Panel (RS / RE / RH)

```
Role: Evaluate the reading experience from different reader perspectives
Agent type: explore

📖 Reads:
  - drafts/chXX-draft.md          — draft to evaluate
  - reviews/chXX-review.md        — merged report from the Review Group
  - outline-final.md              — this chapter's target positioning

✏️ Output:
  - Individual evaluations (merged by the Chief Orchestrator into reader-feedback/chXX-panel.md)

Three reader personas:
  RS: {{读者画像_学生}} — focus: learning curve, prerequisite knowledge assumptions
  RE: {{读者画像_工程师}} — focus: practical value, actionability
  RH: {{读者画像_高手}} — focus: technical depth, advanced usage
```

### 4.7 Typesetter (#11)

```
Role: Convert Markdown to publish-ready HTML
Agent type: general-purpose

📖 Reads:
  - chapters/chXX.md          — final approved chapter
  - meta/style-guide.md       — style-related configuration

✏️ Writes:
  - publish/chXX.html         — HTML page
  - publish/style.css         — stylesheet (first chapter only)
  - publish/index.html        — table of contents page (last chapter only)
```

---

## 5. Context Window Management

### 5.1 The Problem

Different Agent types have different context window sizes and capability profiles. File Pointers must account for these constraints.

### 5.2 Agent Types and Context Characteristics

```
┌──────────────────┬──────────────────────────────────────────┐
│ Agent type        │ Characteristics                           │
├──────────────────┼──────────────────────────────────────────┤
│ explore           │ Suited for read-only research tasks       │
│                   │ Can access many files; good at searching  │
│                   │  and extracting information              │
│                   │ Not suitable for complex writing or long  │
│                   │  text generation                         │
│                   │ Used for: Researcher #3, R1, R2, RS/RE/RH│
├──────────────────┼──────────────────────────────────────────┤
│ general-purpose   │ Suited for tasks requiring deep reasoning │
│                   │  and complex output                      │
│                   │ Larger context window; handles long text  │
│                   │ Good for writing, review, code analysis  │
│                   │ Used for: Architect #1, Writer #4, R3,   │
│                   │  Typesetter #11                          │
└──────────────────┴──────────────────────────────────────────┘
```

### 5.3 Context Budget Management

When constructing the dispatch prompt for each Agent, estimate the total token count of files to be read:

```
Context budget = Agent context window - system prompt - output reservation

Example (Writer #4 writing Chapter 10):
  meta/style-guide.md          ≈ 2K tokens
  meta/chapter-summaries.md    ≈ 9K tokens (9 chapters × ~1K/chapter)
  meta/glossary.md             ≈ 3K tokens
  meta/metaphor-registry.md   ≈ 1K tokens
  research/ch10-research.md   ≈ 5K tokens
  outline-final.md (this chapter's section) ≈ 1K tokens
  ──────────────────────────────────────────
  Total reads                  ≈ 21K tokens
  Output reservation ({{每章目标字数}} words) ≈ 10–15K tokens
  System prompt                ≈ 2K tokens
  ──────────────────────────────────────────
  Total requirement            ≈ 38K tokens
```

### 5.4 Handling Context Overflow

When reads may exceed the context window:

```
Strategy 1: Summary instead of full text
  - chapter-summaries: read only the full summaries of the most recent N chapters
  - Keep only a one-sentence overview for earlier chapters

Strategy 2: Load on demand
  - glossary: only load the section relevant to this chapter
  - source-map: only load the portion corresponding to this chapter

Strategy 3: Staged execution
  - Split one large task into multiple smaller tasks
  - Each smaller task loads only the necessary file subset

Strategy 4: Trim instructions
  - Explicitly tell the Agent in the prompt which files to read first
  - Mark secondary files as "read only if context space remains"
```

---

## 6. Dispatch Prompt Templates

### 6.1 Generic Template

```markdown
You are {{角色名}}, responsible for {{职责描述}}.

Current task: {{项目名称}} Chapter {{章节号}} — {{章节标题}}

---

**Files to read (File Pointers):**
- 📖 Read: {{文件路径1}} — {{purpose}}
- 📖 Read: {{文件路径2}} — {{purpose}}
- 📖 Read: {{文件路径3}} — {{purpose}}

**Files to write:**
- ✏️ Write: {{输出路径}} — {{format requirements}}

**Quality standards:**
- {{standard 1}}
- {{standard 2}}
- {{standard 3}}

**Completion marker:**
Append to the last line of the file: <!-- {{标记名}} -->
```

### 6.2 Researcher Prompt Example

```markdown
You are the Researcher, responsible for deep source code analysis to provide material for writing.

Current task: {{项目名称}} Chapter {{章节号}} — {{章节标题}}

---

**Files to read (File Pointers):**
- 📖 Read: {{工作目录}}/source-map.md — locate source files for this chapter
- 📖 Read: {{工作目录}}/outline-final.md — get the writing requirements for this chapter
- 📖 Read: {{源码根目录}}/{{源码文件1}} — core source code
- 📖 Read: {{源码根目录}}/{{源码文件2}} — related source code

**Files to write:**
- ✏️ Write: {{工作目录}}/research/ch{{章节号}}-research.md

**Output format requirements:**
1. Module overview (the overall function of the source modules covered in this chapter)
2. Core data structures (list key types/structs/classes)
3. Core functions/methods (list key functions with their inputs, outputs, and purpose)
4. Execution flow (trace the main code paths)
5. Design decisions (analyze why things are designed this way)
6. Writing material suggestions (which points are worth highlighting)

**Completion marker:**
Append to the last line of the file: <!-- RESEARCH_COMPLETE -->
```

### 6.3 Writer Prompt Example

```markdown
You are the Writer, responsible for authoring chapters of a technical book.

Current task: {{项目名称}} Chapter {{章节号}} — {{章节标题}}

---

**Files to read (File Pointers):**
- 📖 Read: {{工作目录}}/research/ch{{章节号}}-research.md — this chapter's research report (core material)
- 📖 Read: {{工作目录}}/meta/style-guide.md — writing style (must comply)
- 📖 Read: {{工作目录}}/meta/chapter-summaries.md — preceding chapter summaries (maintain continuity)
- 📖 Read: {{工作目录}}/meta/glossary.md — existing terms (stay consistent)
- 📖 Read: {{工作目录}}/meta/metaphor-registry.md — existing metaphors (avoid repetition)

**Files to write:**
- ✏️ Write: {{工作目录}}/drafts/ch{{章节号}}-draft.md

**Quality standards:**
- Word count: {{每章目标字数}} words ± 20%
- Code examples must be based on actual source code from the research report
- Term usage must be consistent with the glossary
- Metaphors must not duplicate any existing entries in the metaphor-registry
- Must comply with all writing standards in the style-guide

**Completion marker:**
Append to the last line of the file: <!-- DRAFT_COMPLETE -->
```

---

## 7. Data Flow Diagrams

### 7.1 Full Single-Chapter Data Flow

```
Source repository             Static files                  Append-only files
{{源码根目录}}/           outline-final.md             meta/chapter-summaries.md
                          source-map.md                meta/glossary.md
                          meta/style-guide.md          meta/metaphor-registry.md
     │                        │                             │
     │    ┌───────────────────┤                             │
     ▼    ▼                   │                             │
┌──────────────┐              │                             │
│  Researcher  │              │                             │
│     #3       │              │                             │
│              │              │                             │
│ Reads: source│              │                             │
│ Reads: map   │              │                             │
│ Reads: outline│             │                             │
│              │              │                             │
│ Writes:      │              │                             │
│  research/   │              │                             │
│  chXX-       │              │                             │
│  research    │              │                             │
└──────┬───────┘              │                             │
       │                      │                             │
       ▼                      ▼                             ▼
┌──────────────────────────────────────────────────────────┐
│  Writer #4                                                │
│                                                           │
│  Reads: research/chXX-research.md                         │
│  Reads: style-guide.md                                    │
│  Reads: chapter-summaries.md   ◀── this is "long-term memory"│
│  Reads: glossary.md                                       │
│  Reads: metaphor-registry.md                              │
│                                                           │
│  Writes: drafts/chXX-draft.md                             │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│        Triple-Parallel Review (R1+R2+R3)  │
│                                           │
│  R1: Reads [draft+source]  → r1-code.md   │
│  R2: Reads [draft+long-term] → r2-consistency│
│  R3: Reads [draft+style]   → r3-content.md│
│                                           │
│  → Merged: reviews/chXX-review.md         │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│     Reader Panel (RS + RE + RH)           │
│                                           │
│  Reads: draft + review                    │
│  Writes: reader-feedback/chXX-panel.md    │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│     Chief Orchestrator: Update long-term memory│
│                                           │
│  chapter-summaries.md  ← append this chapter's summary│
│  glossary.md           ← append new terms│
│  metaphor-registry.md  ← append new metaphors│
│  cross-references.md   ← append cross-reference points│
└──────────────────────────────────────────┘
```

### 7.2 Cross-chapter Data Flow

```
Chapter 1                  Chapter 2                  Chapter N
┌──────────┐              ┌──────────┐              ┌──────────┐
│research→ │              │research→ │              │research→ │
│writing→  │              │writing→  │              │writing→  │
│review→   │              │review→   │              │review→   │
│panel     │              │panel     │              │panel     │
└────┬─────┘              └────┬─────┘              └────┬─────┘
     │                         │                         │
     ▼                         ▼                         ▼
  update                    update                    update
  long-term                 long-term                 long-term
  memory                    memory                    memory
     │                         │                         │
     ▼                         ▼                         ▼
┌─────────┐    passes    ┌─────────┐    passes     ┌─────────┐
│summaries│─────────────▶│summaries│──────────────▶│summaries│
│(1 ch)   │             │(ch 1-2) │               │(ch 1-N) │
│glossary │─────────────▶│glossary │──────────────▶│glossary │
│metaphors│─────────────▶│metaphors│──────────────▶│metaphors│
└─────────┘             └─────────┘               └─────────┘

Key: after each chapter completes, it appends to long-term memory →
     when the next chapter's Writer reads these files, it can "see"
     the accumulated knowledge from all preceding chapters.
     This is the core mechanism by which File Pointers implement "memory passing".
```

---

## 8. Summary of Design Principles

### Principle 1: Explicit over Implicit

Every file an Agent needs to read or write must be **explicitly listed**; Agents are not expected to discover files on their own.

### Principle 2: Principle of Least Knowledge

Each Agent sees only the **minimum set of files** needed to fulfill its responsibility, reducing interference and hallucination.

### Principle 3: Write Isolation

At any given time, each file has at most **one Agent writing to it**, avoiding race conditions.

### Principle 4: Append over Modify

Long-term memory files use append mode — **never modify existing content** — protecting historical consistency.

### Principle 5: Marker as Proof

A completion marker is the only reliable evidence of progress — **a file's existence does not mean it is complete; a marker's presence means it is complete**.

---

## Appendix: File Pointer Quick-Reference Matrix

| Agent | Reads | Writes |
|-------|-------|--------|
| Architect #1 | source code, outline-draft | outline-draft, source-map |
| Reader Advocate #2 | outline-draft | outline-reader-feedback |
| Researcher #3 | source-map, outline-final, source code | research/chXX-research |
| Writer #4 | research/chXX, style-guide, summaries, glossary, metaphors | drafts/chXX-draft |
| R1 Code Review | drafts/chXX, source-map, source code | reviews/chXX-r1-code |
| R2 Consistency Review | drafts/chXX, summaries, glossary, metaphors, cross-refs | reviews/chXX-r2-consistency |
| R3 Content Review | drafts/chXX, style-guide | reviews/chXX-r3-content |
| RS/RE/RH Readers | drafts/chXX, reviews/chXX-review | reader-feedback/chXX-panel |
| Typesetter #11 | chapters/chXX, style-guide | publish/chXX.html |
