<!--
  Translation status:
  Source file : agents/00-system-overview.md
  Source commit: b016f9b
  Translated  : 2025-07-14
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../agents/00-system-overview.md) · **English** · [日本語](../../ja/agents/00-system-overview.md) · [繁體中文](../../zh-TW/agents/00-system-overview.md)

---

# 🏗️ System Architecture & Agent Registry

> This document is the system-level architecture specification for the multi-agent editorial team. It defines registration information, interaction relationships, and information-flow rules for all Agents.

---

## 1. System Philosophy

### Agents Are Stateless, Disposable Workers

In this framework, every Agent is treated as a **stateless, disposable worker**:

- **No Memory**: An Agent retains no context from previous invocations. Every start is a blank slate.
- **No Autonomy**: Agents do not decide when they work or what they do. All scheduling is handled by the Orchestrator.
- **Replaceable**: Any Agent instance can be replaced by a new instance of the same type — as long as the inputs (File Pointers) are the same, the outputs should be consistent.

### All State Is Stored in Shared Files on Disk

"Memory passing" between Agents is implemented entirely through the file system:

```
Agent A 产出 → 写入文件 → 主编排注入文件路径给 Agent B → Agent B 读取 → 获得"记忆"
```

This is consistent with modern microservice architecture principles:
- Services (Agents) are themselves stateless; state is stored externally (the file system)
- Services communicate through messages (File Pointers), not direct calls
- The Orchestrator is responsible for service discovery and scheduling

### The Orchestrator Injects Context via File Pointers

**File Pointers** are the core mechanism by which the Orchestrator controls Agent behavior:

```
主编排调用 Agent 时的 Prompt 结构：

  "你是 {{角色名称}}。请执行以下任务：{{任务描述}}。

   📂 必读文件：
   - {{文件路径1}}  ← 用途说明
   - {{文件路径2}}  ← 用途说明

   📝 输出要求：
   - 将结果写入 {{输出文件路径}}
   - 格式要求：{{格式说明}}"
```

The value of File Pointers:
- **Precise information scoping**: Agents only see the information they need, avoiding context-window waste
- **Clear read/write boundaries**: Every Agent knows exactly what it can read and what it should write
- **Traceability**: The complete context for any Agent invocation can be reconstructed from the File Pointers manifest

---

## 2. Agent Registry

### Core Creation Group

| Code | Name | Role Metaphor | Agent Type | Responsibilities | Reference |
|------|------|---------------|-----------|------------------|-----------|
| #0 | Orchestrator | Director / Producer | `general-purpose` | Schedules the full pipeline, manages progress and dependencies, injects context via File Pointers | [→ 01-orchestrator.md](./01-orchestrator.md) |
| #1 | Architect | Technical Director | `general-purpose` | Analyzes source-code structure, designs chapter outlines and knowledge maps, plans inter-chapter dependencies | [→ 02-architect.md](./02-architect.md) |
| #2 | Reader Advocate | Product Manager | `general-purpose` | Reviews the outline from the target reader's perspective, ensuring chapter order matches the learning curve | [→ 03-reader-advocate.md](./03-reader-advocate.md) |
| #3 | Researcher | Source Code Archaeologist | `explore` | Deep-dives into source modules for the specified chapter, producing structured research reports | [→ 04-researcher.md](./04-researcher.md) |
| #4 | Writer | Bestselling Author | `general-purpose` | Writes chapter content based on research reports and the style guide | [→ 05-writer.md](./05-writer.md) |

### Review Group

| Code | Name | Role Metaphor | Agent Type | Responsibilities | Reference |
|------|------|---------------|-----------|------------------|-----------|
| R1 | Code Reviewer | Code Verification Expert | `explore` | Verifies the accuracy of every code reference in a chapter: file paths, function signatures, behavioral descriptions | [→ 06-code-reviewer.md](./06-code-reviewer.md) |
| R2 | Consistency Reviewer | Memory Keeper | `explore` | Checks cross-chapter terminology consistency, data coherence, and cross-reference completeness | [→ 07-consistency-reviewer.md](./07-consistency-reviewer.md) |
| R3 | Content Reviewer | Senior Editor | `general-purpose` | Reviews readability, narrative structure, and sensitive content; ensures conformance to the style guide | [→ 08-content-reviewer.md](./08-content-reviewer.md) |

### Reader Panel

| Code | Name | Role Metaphor | Agent Type | Responsibilities | Reference |
|------|------|---------------|-----------|------------------|-----------|
| RS | Student Reader | CS Junior Undergraduate | `general-purpose` | Simulates a beginner's perspective: flags unclear terms, missing background knowledge, and logical leaps | [→ 09-reader-panel.md](./09-reader-panel.md) |
| RE | Engineer Reader | 8-Year Full-Stack Engineer | `general-purpose` | Simulates a professional developer's perspective: evaluates technical depth, practicality, and whether new insights are gained | [→ 09-reader-panel.md](./09-reader-panel.md) |
| RH | Hobbyist Reader | Non-Technical Tech Enthusiast | `general-purpose` | Simulates a non-technical reader's perspective: checks whether analogies are vivid and concepts are explained accessibly | [→ 09-reader-panel.md](./09-reader-panel.md) |

### Publishing Group

| Code | Name | Role Metaphor | Agent Type | Responsibilities | Reference |
|------|------|---------------|-----------|------------------|-----------|
| #11 | Bookbinder | Typesetter / Designer | `general-purpose` | Markdown→HTML conversion, Mermaid diagram rendering, ASCII→SVG rendering, zero-dependency build script | [→ 10-bookbinder.md](./10-bookbinder.md) |

---

## 3. Interaction Diagram

```
                          ┌──────────────┐
                          │   👤 用户     │
                          │  审核 / 决策  │
                          └──────┬───────┘
                                 │ 指令/审核
                          ┌──────▼───────┐
                          │ 🎯 主编排 #0  │ ← 贯穿 Phase 1→5
                          │ Orchestrator │   SQL进度 + File Pointers
                          └──────┬───────┘
                                 │ 调度各Agent
  ═══════════════════════════════▼═══════════════════════════════
  ║         📂 共享文件系统（Agent间唯一通信通道）               ║
  ║  chapter-summaries · glossary · metaphor-registry           ║
  ║  source-map · cross-references · style-guide                ║
  ║  checkpoint · audit-log                                     ║
  ═══════════════════════════════════════════════════════════════
                                 │
  ┌──────────────────────────────▼──────────────────────────────┐
  │                                                             │
  │  Phase 1  大纲定稿                                          │
  │  ┌──────────┐ ┌───────────┐                                 │
  │  │ 🏗️ #1    │ │ 👤 #2     │ ──→ 📖 R3 大纲审核             │
  │  │ 架构师   │ │ 读者代言人│                                 │
  │  └──────────┘ └───────────┘                                 │
  │       ↓                                                     │
  │  Phase 2  共享资源构建（Orchestrator 直接生成）              │
  │       ↓                                                     │
  │  Phase 3  逐章写作 ×{{章节数}}章                             │
  │    Step 1   🔬 #3 研究员 ─────── 源码调研                   │
  │       ↓                                                     │
  │    Step 2   ✍️ #4 作家 ───────── 章节撰写                   │
  │       ↓                                                     │
  │    Step 3   ┌──────┬──────┬──────┐  三员并行审查             │
  │             │🔬 R1 │🔗 R2 │📖 R3 │                         │
  │             │源码   │一致  │内容   │                         │
  │             └──────┴──────┴──────┘                          │
  │       ↓                                                     │
  │    Step 4   ┌──────┬──────┬──────┐  三人并行评审             │
  │             │🎓 RS │💻 RE │🌐 RH │                         │
  │             │大学生│工程师│爱好者│                         │
  │             └──────┴──────┴──────┘                          │
  │       ↓                                                     │
  │  Phase 4  统稿与最终审计（Orchestrator + 审查组复审）        │
  │       ↓                                                     │
  │  Phase 5  HTML装帧与发布                                    │
  │  ┌─────────────┐                                            │
  │  │ 📚 #11      │  Markdown→HTML · ASCII→SVG                │
  │  │ 装帧工人    │  零依赖构建脚本                            │
  │  │ Bookbinder  │                                            │
  │  └─────────────┘                                            │
  └─────────────────────────────────────────────────────────────┘
  图例: #N = Agent编号  R1/R2/R3 = 审查员  RS/RE/RH = 读者评审员
```

### Architecture Interpretation

**Hub-Spoke Pattern**: The Orchestrator (#0) is the sole Hub; all other Agents are Spokes. This means:

1. **Acyclic dependencies**: Information flow is unidirectional (Orchestrator → Agent → file → Orchestrator); no circular calls exist between Agents
2. **Fault isolation**: Failure of any Spoke Agent affects only the current task and does not cascade to other Agents
3. **Observability**: All scheduling decisions reside in the Orchestrator, making logging and debugging straightforward

**Parallelization points**:
- Phase 3 Step 3: Reviewers R1, R2, and R3 run in parallel (orthogonal review dimensions)
- Phase 3 Step 4: Readers RS, RE, and RH run in parallel (independent review perspectives)
- Phase 3 inter-chapter: Step 1 (research) for one chapter can run in parallel with Step 2 (writing) for a chapter whose research is already complete

---

## 4. Information Flow Rules

### Rule 1: Unidirectional Communication — All Instructions Originate from the Orchestrator

```
✅ 主编排 → Agent      （通过 File Pointers 注入任务）
✅ Agent → 文件系统     （写入产出物）
✅ 主编排 ← 文件系统    （读取产出物，决定下一步）
❌ Agent → Agent        （禁止直接通信）
❌ Agent → 主编排       （Agent 不主动发起请求）
```

Agents are unaware of one another's existence. An Agent only sees the files provided by the Orchestrator and writes results after completing its task.

### Rule 2: File Pointers Follow the Principle of Least Privilege

Each Agent receives only the **minimum number** of file references needed to complete the current task:

| Agent | Typical Required Input Files | Typical Output Files |
|-------|------------------------------|----------------------|
| #3 Researcher | `outline.md` (current chapter's section), `source-map.md`, `glossary.md` | `research/chXX-research.md` |
| #4 Writer | `research/chXX-research.md`, `style-guide.md`, `chapter-summaries.md`, `metaphor-registry.md` | `chapters/chXX.md` |
| R1 Code Reviewer | `chapters/chXX.md`, source files (as needed) | `reviews/chXX-code-review.md` |
| R2 Consistency Reviewer | `chapters/chXX.md`, `glossary.md`, `chapter-summaries.md`, `cross-references.md` | `reviews/chXX-consistency-review.md` |
| R3 Content Reviewer | `chapters/chXX.md`, `style-guide.md` | `reviews/chXX-content-review.md` |

> 💡 The Writer does **not** receive the full body text of other chapters (to avoid wasting context-window capacity); it only receives the summaries in `chapter-summaries.md`.

### Rule 3: Shared Files Are the Only Information Bridge Between Agents

The following shared files form the "long-term memory" between Agents:

| Shared File | Writer | Reader(s) | Purpose |
|-------------|--------|-----------|---------|
| `source-map.md` | #0 Orchestrator | #1, #3, R1 | Source-code directory structure and module descriptions |
| `outline.md` | #1 Architect | All Agents | Chapter outline and knowledge dependency graph |
| `glossary.md` | #0 (initial) → #4 (appended) | All Agents | Unified book-wide glossary |
| `metaphor-registry.md` | #4 Writer (appended) | #4, R2 | Registry of used metaphors, preventing cross-chapter duplication |
| `style-guide.md` | #0 Orchestrator | #4, R3 | Writing style specification |
| `chapter-summaries.md` | #0 (updated after each chapter) | #4, R2 | Summaries of completed chapters |
| `cross-references.md` | #4 (appended) → R2 (verified) | #4, R2, #0 | Cross-chapter reference registry |

### Rule 4: State Inference — File Existence Equals Progress

The Orchestrator infers the progress status of each chapter by inspecting the file system:

```
文件不存在                        → 未开始
research/chXX-research.md 存在   → Step 1 完成（研究完成）
chapters/chXX.md 存在            → Step 2 完成（初稿完成）
reviews/chXX-*-review.md 存在    → Step 3 完成（审查完成）
feedback/chXX-*-feedback.md 存在 → Step 4 完成（评审完成）
chapters/chXX-final.md 存在      → 该章定稿
```

This gives the pipeline **checkpoint recovery** capability: after an interruption and restart, the Orchestrator scans the file system to restore progress without any additional state storage.

---

## 5. Related Documents

### Framework Documents

| Document | Path | Description |
|----------|------|-------------|
| Five-Phase Workflow Details | [`framework/workflow.md`](../framework/workflow.md) | Detailed steps, entry conditions, and exit conditions for each phase |
| File Pointers Mechanism | [`framework/file-pointers.md`](../framework/file-pointers.md) | Design principles and usage specifications for File Pointers |
| Review & Panel Protocol | [`framework/review-architecture.md`](../framework/review-architecture.md) | Scoring criteria and feedback formats for reviewers and reader panel |
| Parallel Execution Strategy | [`framework/parallel-strategy.md`](../framework/parallel-strategy.md) | Scheduling strategies for multi-chapter and multi-agent parallelism |
| Checkpoint Recovery Mechanism | [`framework/recovery.md`](../framework/recovery.md) | Method for recovering state after pipeline interruption |

### Agent Reference Documentation

| Agent | Reference Path |
|-------|----------------|
| #0 Orchestrator | [`agents/01-orchestrator.md`](./01-orchestrator.md) |
| #1 Architect | [`agents/02-architect.md`](./02-architect.md) |
| #2 Reader Advocate | [`agents/03-reader-advocate.md`](./03-reader-advocate.md) |
| #3 Researcher | [`agents/04-researcher.md`](./04-researcher.md) |
| #4 Writer | [`agents/05-writer.md`](./05-writer.md) |
| R1 Code Reviewer | [`agents/06-code-reviewer.md`](./06-code-reviewer.md) |
| R2 Consistency Reviewer | [`agents/07-consistency-reviewer.md`](./07-consistency-reviewer.md) |
| R3 Content Reviewer | [`agents/08-content-reviewer.md`](./08-content-reviewer.md) |
| RS Student Reader | [`agents/09-reader-panel.md`](./09-reader-panel.md) |
| RE Engineer Reader | [`agents/09-reader-panel.md`](./09-reader-panel.md) |
| RH Hobbyist Reader | [`agents/09-reader-panel.md`](./09-reader-panel.md) |
| #11 Bookbinder | [`agents/10-bookbinder.md`](./10-bookbinder.md) |

### Template Files

| Template | Path | Action when starting a new project |
|----------|------|-------------------------------------|
| Source Map | [`templates/source-map.md`](../templates/source-map.md) | Fill in the directory structure and core modules of the target source code |
| Outline Template | [`templates/outline.md`](../templates/outline.md) | Fill in the initial chapter plan (can be assisted by Architect #1) |
| Style Guide | [`templates/style-guide.md`](../templates/style-guide.md) | Fill in writing style preferences and code display conventions |
| Glossary | [`templates/glossary.md`](../templates/glossary.md) | Fill in definitions and translations for known terms |
| Metaphor Registry | [`templates/metaphor-registry.md`](../templates/metaphor-registry.md) | Leave blank; filled in progressively during the writing process |
