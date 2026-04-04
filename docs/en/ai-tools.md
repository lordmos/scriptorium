# Using Scriptorium with AI Tools

Scriptorium ships ready-to-use context files for all major AI coding assistants, so they
can understand the framework structure and automatically take on the correct agent role.

## How It Works

AI tools read specific files in the project root to load context. Scriptorium provides
the right file for each tool:

| Tool | File | Notes |
|------|------|-------|
| **Claude Code** | `CLAUDE.md` | Official Anthropic CLI |
| **OpenCode** | `AGENTS.md` | Open-source TUI coding agent |
| **Amp** (formerly Antigravity) | `AGENTS.md` | By Sourcegraph |
| **Cursor** | `.cursor/rules/*.mdc` | IDE-embedded AI |
| **Windsurf** | `.windsurf/rules/*.md` | Codeium/Windsurf IDE |
| **Other tools** | `CLAUDE.md` | Most tools auto-read this |

---

## Quick Start

### Step 1: Create a book project from this template

Click **"Use this template"** on GitHub — all context files are included automatically.

```bash
# Or clone directly
git clone https://github.com/lordmos/tech-editorial.git my-book
cd my-book
```

### Step 2: Fill in the book details in `CLAUDE.md`

Open `CLAUDE.md` and fill in the `## 📖 About This Book Project` section:

```markdown
## 📖 About This Book Project

- **Book Title**: Deep Dive into Spring Framework Source Code
- **Source Project**: spring-framework (github.com/spring-projects/spring-framework)
- **Target Reader**: Backend engineers with 3+ years of Java experience
- **One-line Description**: Understand IoC/AOP design philosophy through Spring source code
```

### Step 3: Fill in the foundation templates

Before starting Phase 1, fill in these files (see `templates/` for starting points):

- `source-map.md` — source code paths → chapter mapping
- `outline.md` — book outline
- `style-guide.md` — writing conventions

---

## Claude Code

Claude Code automatically reads `CLAUDE.md` from the project root.

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Open your book project
cd my-book

# Start Claude Code (auto-reads CLAUDE.md)
claude

# Example: kick off a research task
> Check checkpoint.md, then run the Researcher Agent on Chapter 2
```

**Recommended workflow:**

```bash
# 1. Check progress
> Read checkpoint.md and tell me what the next step is

# 2. Invoke an agent
> Act as the Researcher Agent (agents/04-researcher.md) and research
> Chapter 3 "IoC Container Initialization"
> Context: source-map.md, outline.md (Chapter 3 section)

# 3. Confirm output
> Write the result to research/ch03-research-report.md and update checkpoint.md
```

---

## OpenCode

OpenCode reads `AGENTS.md` first, which is identical to `CLAUDE.md`.

```bash
# Install OpenCode (see official docs for current install command)
# Then start in your project directory
cd my-book
opencode
```

---

## Amp (formerly Antigravity)

Amp reads `AGENTS.md` as project context.

```bash
# Start Amp in your project directory
cd my-book
amp
# Amp auto-loads AGENTS.md and understands the Scriptorium framework
```

---

## Cursor

`.cursor/rules/scriptorium.mdc` is loaded automatically (`alwaysApply: true`).

1. Open the book project directory in Cursor
2. Cursor auto-loads `.cursor/rules/scriptorium.mdc`
3. Chat directly:

```
@workspace What's the current progress? Which Agent should I run next?
```

```
Act as agents/05-writer.md and write Chapter 2 based on research/ch02-report.md
```

---

## Windsurf

`.windsurf/rules/scriptorium.md` is loaded automatically in Windsurf IDE.

Open the project in Windsurf, then use Cascade (AI panel):

```
Based on checkpoint.md, what should I do next?
```

---

## Best Practices

### Standard session opener

Regardless of tool, start each session with:

```
Please read checkpoint.md first and tell me the current project state,
then suggest the next action.
```

### Standard agent invocation format

```
Please act as the agent defined in agents/[filename].md.

File Pointers (context):
- [file 1]
- [file 2]

Task: [specific task description]
Output path: [output file path]
```

### Important rules

- `agents/` and `framework/` are **read-only** framework core — never modify
- `templates/` files have `{{variable}}` placeholders — fill them before use
- After every agent run, update both `checkpoint.md` and `audit-log.md`
- Research reports → `research/`, chapter drafts → `chapters/`, review reports → `reviews/`

---

## Project Directory Reference

Recommended structure for a Scriptorium book project:

```
my-book/
├── CLAUDE.md              ← AI context (fill in your book details)
├── AGENTS.md              ← Same (for OpenCode / Amp)
├── .cursor/rules/         ← Cursor rules (auto-loaded)
├── .windsurf/rules/       ← Windsurf rules (auto-loaded)
│
├── source-map.md          ← Source mapping (fill in Phase 1)
├── outline.md             ← Book outline (fill in Phase 1)
├── style-guide.md         ← Style guide (fill in Phase 1)
├── glossary.md            ← Glossary (update continuously)
├── metaphor-registry.md   ← Metaphor registry (update continuously)
├── checkpoint.md          ← Progress tracker (auto-updated)
├── audit-log.md           ← Audit log (auto-updated)
│
├── agents/                ← Agent specs (read-only, from framework)
├── framework/             ← Framework docs (read-only, from framework)
├── templates/             ← Template files (fill in before use)
│
├── research/              ← Research reports (Phase 2 output)
├── chapters/              ← Chapter drafts (Phase 3 output)
└── reviews/               ← Review reports (Phase 4 output)
```
