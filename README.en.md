<!--
  Translation status:
  Source file : README.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Language / 语言**: [简体中文](README.md) · **English** · [日本語](README.ja.md) · [繁體中文](README.zh-TW.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/lordmos/tech-editorial?style=flat-square&color=gold)](https://github.com/lordmos/tech-editorial/stargazers)
[![Forks](https://img.shields.io/github/forks/lordmos/tech-editorial?style=flat-square)](https://github.com/lordmos/tech-editorial/network/members)
[![Last Commit](https://img.shields.io/github/last-commit/lordmos/tech-editorial?style=flat-square)](https://github.com/lordmos/tech-editorial/commits)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Multi-Agent](https://img.shields.io/badge/Multi--Agent-12%20Agents-blueviolet?style=flat-square)]()
[![Docs](https://img.shields.io/badge/Docs-lordmos.github.io-4a9eff?style=flat-square&logo=vitepress&logoColor=white)](https://lordmos.github.io/tech-editorial/)

# 📚 Scriptorium — Multi-Agent Editorial Framework for Technical Books

> **A multi-agent collaborative writing framework for the "Source Code Reading" series of technical books**

## 1. Framework Overview

This framework provides a complete multi-agent editorial workflow for "Source Code Reading" series technical books. Through the collaboration of **12 AI Agents**, it covers the entire pipeline from outline design to final publication.

Core philosophy:

> **Agents are stateless; the file system is stateful.**

Each Agent is a one-time worker — it has no memory of what it did before. All "memory" that must persist across invocations is stored in the shared file system. The main orchestrating Agent precisely injects the context each Agent needs via **File Pointers** (file path references), ensuring information flow is controlled and traceable.

---

## 2. Quick Start

📖 **Full usage guide → [Online Docs](https://lordmos.github.io/tech-editorial/en/quick-start)**

**Step 1**: Clone this framework and prepare your source code project

```bash
git clone https://github.com/lordmos/tech-editorial.git my-book
cd my-book
```

**Step 2**: Open the directory with your AI coding assistant (Claude Code / OpenCode / Cursor, etc.) and say this one sentence:

```
The source code for [project name] is in [directory path].
Please read QUICK_START.md, then ask me any questions you have.
If you have no questions, start your work.
```

The AI reads [`QUICK_START.md`](QUICK_START.md), confirms the book title, audience, and other basics, then **runs all five phases autonomously** and delivers `output/book-final.md`.

You only need to do three things: ① Answer the AI's initial questions → ② Approve the Phase 1 outline → ③ Read the final manuscript.

**After an interruption**: Tell your AI → `Please read checkpoint.md and continue where we left off.`

---

## 3. Use Cases

This framework is suited for the following types of technical book projects:

- ✅ **Open-source project source code reading** books (e.g., *Deep Dive into [Framework] Source Code*)
- ✅ Architecture analysis books that dissect a large code repository chapter by chapter
- ✅ Technical explainers for multi-level audiences (students, engineers, enthusiasts)
- ✅ Long-form technical writing projects that require multi-person collaboration with a controlled workflow

**Not suitable for**: purely theoretical textbooks, API reference documentation, short technical blog posts.

---

## 4. System Architecture Overview

This framework uses a **Hub-Spoke architecture**:

```
                    ┌─────────────┐
                    │  主编排 #0   │  ← Hub
                    │ Orchestrator│
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
      ┌────▼────┐    ┌─────▼────┐    ┌─────▼────┐
      │ Agent A │    │ Agent B  │    │ Agent C  │  ← Spokes
      └─────────┘    └──────────┘    └──────────┘
```

- **Main Orchestrator (#0)** is the sole scheduling hub; all sub-Agents communicate only with the Orchestrator
- Sub-Agents **do not communicate directly with each other** — they exchange information through the shared file system
- The Orchestrator uses **File Pointers** to precisely control each Agent's read/write scope, preventing information overload

---

## 5. Agent Team Directory

| ID | Name | Role Metaphor | Agent Type | Responsibilities |
|------|------|----------|-----------|------|
| #0 | Orchestrator | Chief Director | general-purpose | Schedules the full pipeline; manages progress and dependencies |
| #1 | Architect | Technical Director | general-purpose | Designs book outline and knowledge graph |
| #2 | Reader Advocate | Product Manager | general-purpose | Reviews outline rationale from the target reader's perspective |
| #3 | Researcher | Source Code Archaeologist | explore | Deep-dives into source code; produces research reports |
| #4 | Writer | Bestselling Author | general-purpose | Writes chapter body text |
| R1 | Code Reviewer | Code Verification Expert | explore | Validates the technical accuracy of all code references in a chapter |
| R2 | Consistency Reviewer | Memory Manager | explore | Checks consistency of terminology, data, and logic across chapters |
| R3 | Content Reviewer | Senior Editor | general-purpose | Reviews readability, structural completeness, and sensitivity |
| RS | Undergraduate Reader | Junior CS student | general-purpose | Simulates a beginner's reading perspective |
| RE | Engineer Reader | Senior full-stack engineer with 8 years of experience | general-purpose | Simulates a professional developer's reading perspective |
| RH | Hobbyist Reader | Non-technical tech enthusiast | general-purpose | Simulates a non-technical reader's reading perspective |
| #11 | Bookbinder | Layout Designer | general-purpose | Markdown → HTML publishing pipeline |

---

## 6. Five-Phase Workflow Overview

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 5
Outline     Shared      Chapter-by-  Comprehen-  Binding &
Finalized   Resources   Chapter      sive Audit  Publishing
            Built       Writing
```

### Phase 1: Outline Finalization

**Agents involved**: #1 Architect, #2 Reader Advocate, R3 Content Reviewer

The Architect designs the chapter outline and knowledge graph based on the source code structure. The Reader Advocate proposes revisions from the target reader's perspective. The Content Reviewer conducts an initial review of the outline. The final output is a user-approved `outline.md`.

### Phase 2: Shared Resource Building

**Agents involved**: #0 Orchestrator (executing directly)

Based on the finalized outline, this phase builds all shared resource files needed by subsequent Agents:

- `source-map.md` — source directory structure and core module descriptions
- `glossary.md` — book-wide unified terminology table
- `metaphor-registry.md` — metaphor registry (prevents cross-chapter metaphor conflicts)
- `style-guide.md` — writing style guide
- `cross-references.md` — cross-chapter reference register

### Phase 3: Chapter-by-Chapter Writing (one loop per chapter in the outline)

Each chapter goes through 4 steps in sequence:

| Step | Agent | Output |
|------|-------|------|
| Step 1 — Source Research | #3 Researcher | `research/chXX-research.md` |
| Step 2 — Chapter Writing | #4 Writer | `chapters/chXX.md` |
| Step 3 — Three-Way Review | R1 + R2 + R3 (parallel) | Individual review reports |
| Step 4 — Reader Review | RS + RE + RH (parallel) | Individual reader feedback |

> 💡 **Parallelization**: The three reviewers in Step 3 can work simultaneously (different data dependencies); the three reader reviewers in Step 4 can also run in parallel. Multiple chapters can also be processed in batches in parallel (e.g., 3 chapters per batch).

### Phase 4: Comprehensive Audit

**Agents involved**: #0 Orchestrator, R1 + R2 + R3 (re-review)

Performs a final audit of the entire book: terminology consistency, cross-chapter reference completeness, code snippet accuracy, and overall narrative coherence.

### Phase 5: Binding & Publishing

**Agents involved**: #11 Bookbinder

Executes Markdown → HTML conversion, **Mermaid diagram rendering** (via Mermaid.js), ASCII art → SVG rendering (for legacy content compatibility), table of contents generation, and style application. Produces a publishable static website.

---

## 7. Directory Structure

```
tech-editorial/
├── README.md                  ← This file: framework overview and quick start
├── agents/                    ← Detailed spec for each Agent
│   ├── 00-system-overview.md  ← System architecture and Agent registry
│   ├── 01-orchestrator.md     ← #0 Orchestrator Agent
│   ├── 02-architect.md        ← #1 Architect Agent
│   ├── 03-reader-advocate.md  ← #2 Reader Advocate Agent
│   ├── 04-researcher.md       ← #3 Researcher Agent
│   ├── 05-writer.md           ← #4 Writer Agent
│   ├── 06-code-reviewer.md    ← R1 Code Reviewer
│   ├── 07-consistency-reviewer.md ← R2 Consistency Reviewer
│   ├── 08-content-reviewer.md ← R3 Content Reviewer
│   ├── 09-reader-panel.md     ← Reader Panel (undergraduate / engineer / hobbyist)
│   └── 10-bookbinder.md       ← #11 Bookbinder Agent
├── framework/                 ← Workflow, rules, and mechanisms
│   ├── workflow.md            ← Five-phase detailed workflow
│   ├── file-pointers.md       ← File Pointers mechanism description
│   ├── review-architecture.md ← Review and evaluation protocol
│   ├── parallel-strategy.md   ← Parallel execution strategy
│   └── recovery.md            ← Checkpoint recovery and fault tolerance
└── templates/                 ← Fillable project templates
    ├── source-map.md          ← Source map template
    ├── outline.md             ← Outline template
    ├── style-guide.md         ← Style guide template
    ├── glossary.md            ← Glossary template
    ├── metaphor-registry.md   ← Metaphor registry template
    ├── chapter-summary.md     ← Chapter summary template (long-term memory)
    ├── checkpoint.md          ← Progress checkpoint template
    └── audit-log.md           ← Audit log template
```

### Subdirectory Descriptions

| Directory | Purpose |
|------|------|
| `agents/` | Full spec for each Agent: system prompt templates, input/output specs, File Pointers checklist, quality checkpoints |
| `framework/` | General workflow docs independent of specific Agents: phase breakdown, review protocols, file format specs, collaboration mechanisms |
| `templates/` | Template files to fill in when starting a new project, containing `{{变量}}` placeholders; once filled in they become project shared resources |

---

## 8. Core Design Principles

### Principle 1: Agents Are Stateless; the File System Is Stateful

Each Agent is "brand new" on every invocation — it does not remember previous conversations. All information that must persist across invocations (progress, review results, glossary…) must be written to the file system. This means:
- Any Agent instance can be replaced
- Failure recovery only requires re-invoking; no need to replay conversation history

### Principle 2: All Agents Communicate Only with the Orchestrator (Hub-Spoke)

Sub-Agents do not interact directly with each other. The Orchestrator is the sole scheduling hub, responsible for:
- Deciding which Agent to invoke
- Injecting required context via File Pointers
- Collecting outputs and deciding the next step

### Principle 3: File Pointers Precisely Control Read/Write Scope

Each Agent is explicitly told:
- **Required reads**: files that must be read before executing the task
- **Writable files**: file paths that may be written to or modified
- **Off-limits files**: files that must not be modified

This prevents Agents from producing low-quality output due to information overload, and prevents accidental writes.

### Principle 4: Long-Term Memory Is Implemented via Shared Files

Agent A writes its output to a file → the Orchestrator injects that file as a File Pointer into Agent B → Agent B gains Agent A's "memory." Typical shared files include:
- `chapter-summaries.md` — summaries of completed chapters
- `glossary.md` — book-wide terminology table
- `metaphor-registry.md` — registry of metaphors already used
- `cross-references.md` — cross-chapter reference relationships

### Principle 5: Review and Writing Are Separated and Support Parallelism

The three reviewers (R1 Code, R2 Consistency, R3 Content) check different dimensions with non-overlapping data dependencies, so they can **run in parallel**. Likewise, the three reader reviewers (RS/RE/RH) can also run in parallel. This significantly reduces the processing time per chapter.

### Principle 6: Checkpoints Are Recoverable

The file system state fully reflects project progress. If the workflow is interrupted (Agent failure, manual pause, etc.), the Orchestrator can infer the current progress by examining existing files and resume from the checkpoint — no need to start over.

---

## 9. Skill Requirements

Using this framework requires the following knowledge and capabilities:

| Skill Area | Specific Requirements | Importance |
|---------|---------|---------|
| AI Agent Prompt Engineering | Understand how to write system prompts and tune Agent behavior (e.g., Claude, GPT) | ⭐⭐⭐ Required |
| Target Source Code Language | Familiar with the programming language of the target open-source project (e.g., TypeScript, Java, Go) | ⭐⭐⭐ Required |
| Project Management | Dependency analysis, progress tracking, task decomposition; understand DAG-style workflows | ⭐⭐ Important |
| Markdown Writing | Proficient in Markdown syntax; understand structured document writing | ⭐⭐ Important |
| Node.js Basics | Used for Phase 5 binding build scripts (Markdown → HTML conversion, static site generation) | ⭐ Optional |

---

## 🎯 Projects Using This Framework

> Did you write something with this framework? [Tell us!](https://github.com/lordmos/tech-editorial/issues/new?template=show_your_book.yml)

| Book Title | Target Source Code | Author |
|------------------|---------|------|
| [Deep Dive into Angular Dependency Injection (example)](examples/angular-di/) | [angular/angular](https://github.com/angular/angular) | [@lordmos](https://github.com/lordmos) |

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=lordmos/tech-editorial&type=Date)](https://star-history.com/#lordmos/tech-editorial&Date)

---

## 💖 Support This Project

If this framework saved you time, consider buying the author a coffee ☕

| Platform | Link |
|------|------|
| 爱发电 (China) | [afdian.com/@lordmos](https://afdian.com/a/lordmos) |
<!-- | Ko-fi (International) | [ko-fi.com/lordmos](https://ko-fi.com/lordmos) | -->
<!-- | WeChat / Alipay | <details><summary>扫码支付</summary>（请将收款码图片放在 `assets/wechat-pay.png` 和 `assets/alipay.png`）</details> | -->

---

## License and Acknowledgments

This framework was extracted from a real multi-agent collaborative book-writing project. It has been abstracted and stripped of all project-specific content, retaining only the reusable workflow and architectural design.

Feel free to modify and extend it according to your project's needs.
