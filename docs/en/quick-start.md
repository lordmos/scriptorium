# How to Use Scriptorium

> This guide walks you through writing a technical book from scratch using the Scriptorium framework.

---

## Prerequisites

- An AI coding assistant ([Claude Code](https://claude.ai/code), [OpenCode](https://opencode.ai), [Cursor](https://cursor.sh), etc.)
- An open-source project you want to analyze (Spring Framework, Redis, Vue.js, etc.)
- A GitHub account

---

## Step 1: Create a Book Project

Click **"Use this template"** on GitHub to create your book repository:

```
https://github.com/lordmos/tech-editorial
```

Or clone locally:

```bash
git clone https://github.com/lordmos/tech-editorial.git my-book
cd my-book
```

Open the directory with your AI tool — Claude Code, OpenCode, and Cursor will auto-read `CLAUDE.md`.

---

## Step 2: Fill in Project Details

Open `CLAUDE.md` in the root and fill in the book information:

```markdown
## 📖 About This Book Project

- **Book Title**: Deep Dive into Spring Framework Source Code
- **Source Project**: spring-projects/spring-framework
- **Target Reader**: Backend engineers with 3+ years of Java experience
- **One-line Description**: Understand IoC/AOP design philosophy through Spring source code
```

---

## Step 3: Phase 1 — Outline

**Goal**: Define the book structure and build the source-code mapping.

**Invoke the Architect agent (copy this prompt):**

```
Please act as the Architect agent defined in agents/02-architect.md.

Context:
- Book title: [your title]
- Source repo: [local path or GitHub URL]
- Target reader: [reader profile]

Tasks:
1. Analyze the source code directory, identify core modules
2. Generate outline.md (suggest 8–12 chapters, 2–3 sentences each)
3. Generate source-map.md (map each chapter to its source files/directories)

Output: outline.md, source-map.md
```

Then validate the outline with the Reader Advocate:

```
Please act as the Reader Advocate defined in agents/03-reader-advocate.md.

Context: outline.md (please read it)
Target reader: [reader profile]

Task: Review the outline from a reader's perspective — is the learning curve reasonable?
Are prerequisites clear? Does the chapter order flow naturally?
```

**Phase 1 done when**: `outline.md` and `source-map.md` are confirmed.

---

## Step 4: Phase 2 & 3 — Research + Writing (per chapter)

For each chapter, run these two agents in sequence:

### Researcher

```
Please act as the Researcher agent defined in agents/04-researcher.md.

File Pointers:
- source-map.md (Chapter N section)
- outline.md (Chapter N section)
- [relevant source code file paths]

Task: Research Chapter N "[chapter title]" and produce a full research report.
Output: research/ch0N-report.md
Then update: checkpoint.md
```

### Writer

```
Please act as the Writer agent defined in agents/05-writer.md.

File Pointers:
- research/ch0N-report.md
- outline.md (Chapter N section)
- style-guide.md
- glossary.md
- metaphor-registry.md

Task: Write the complete draft of Chapter N based on the research report.
Output: chapters/ch0N-draft.md
Then update: checkpoint.md, metaphor-registry.md (append new metaphors from this chapter)
```

**Batch tip**: Tell the AI "process chapters 1 through 3 in sequence" — it will loop automatically.

---

## Step 5: Phase 4 — Triple Review

After each chapter draft, run three reviewers (can run in parallel across separate sessions):

| Reviewer | Spec | Focus |
|----------|------|-------|
| R1 Code | `agents/06-code-reviewer.md` | Code snippet accuracy, API versions |
| R2 Consistency | `agents/07-consistency-reviewer.md` | Cross-chapter terminology, metaphors |
| R3 Content | `agents/08-content-reviewer.md` | Readability, logic, length |

**After the three reviews**, consolidate and revise:

```
Please consolidate the review comments in reviews/ch0N-r1.md, reviews/ch0N-r2.md,
and reviews/ch0N-r3.md, then revise chapters/ch0N-draft.md accordingly.
Output the revised draft to chapters/ch0N-final.md.
```

---

## Step 6: Phase 5 — Publish

Once all chapters are finalized, run the Bookbinder:

```
Please act as the Bookbinder agent defined in agents/10-bookbinder.md.

File Pointers:
- outline.md
- chapters/ch01-final.md through chapters/chNN-final.md
- style-guide.md

Task: Assemble all chapters into a uniformly formatted complete manuscript.
Output: output/book-final.md (or multi-file output in output/)
```

---

## Tracking Progress

Check `checkpoint.md` at any time to see project state:

```bash
cat checkpoint.md
```

Recommended format:

```markdown
## Progress Overview
- [x] Phase 1: Outline finalized
- [x] Phase 2: Shared resources built
- [ ] Phase 3: Chapter writing (3/12 done)
  - [x] Chapter 1
  - [x] Chapter 2
  - [x] Chapter 3
  - [ ] Chapter 4  ← next
...
```

---

## Tips

**💡 Stop and resume any time**  
All state lives in files. Tell the AI: "Read `checkpoint.md` and continue where we left off."

**💡 Parallelize to go faster**  
Chapters in Phase 3 and Phase 4 are independent — run them in multiple AI sessions simultaneously.  
Details: [DAG Batch Execution Strategy](/en/framework/parallel-strategy)

**💡 Shared files evolve throughout writing**  
`glossary.md` and `metaphor-registry.md` grow over time. Always pass the latest versions to the Writer.

**💡 Never modify agents/ or framework/**  
These directories are read-only framework core. Treat them as immutable reference material.

---

## Full Pipeline at a Glance

```
Phase 1  Outline       → outline.md + source-map.md
Phase 2  Shared Res.   → glossary.md + style-guide.md + metaphor-registry.md
Phase 3  Per-chapter   → research/ch0N-report.md → chapters/ch0N-draft.md
Phase 4  Triple Review → reviews/ch0N-{r1,r2,r3}.md → chapters/ch0N-final.md
Phase 5  Publish       → output/book-final.md
```

> More details: [5-Phase Production Pipeline](/en/framework/workflow), [Checkpoint Recovery](/en/framework/recovery)
