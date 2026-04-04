# Using with AI Tools

Scriptorium ships ready-made context files for all major AI coding assistants, so they can understand the framework, act as the Orchestrator, and run the full pipeline automatically.

## Which File Each Tool Reads

| Tool | Auto-reads | Notes |
|------|-----------|-------|
| **Claude Code** | `CLAUDE.md` | Anthropic official CLI |
| **OpenCode** | `AGENTS.md` | Open-source TUI assistant |
| **Amp** | `AGENTS.md` | By Sourcegraph |
| **Cursor** | `.cursor/rules/*.mdc` | IDE-embedded AI (`alwaysApply: true`) |
| **Windsurf** | `.windsurf/rules/*.md` | Codeium/Windsurf IDE |
| **Others** | `CLAUDE.md` | Most tools read this automatically |

---

## Starting a Book Project

The workflow is identical regardless of which tool you use:

**1. Open the project directory with your AI tool**

```bash
cd my-book
claude   # or opencode / cursor / windsurf
```

**2. Say this one sentence**

```
The source code for [project name] is in [directory path].
Please read QUICK_START.md, then ask me any questions you have.
If you have no questions, start your work.
```

The AI reads `QUICK_START.md`, collects basic information (title, audience, etc.), then runs the full 5-phase pipeline autonomously.

**3. Resume after interruption**

```
Please read checkpoint.md and continue where we left off.
```

---

## Context File Reference

| File | Audience | Contents |
|------|----------|----------|
| `QUICK_START.md` | AI Orchestrator | Full briefing: what to ask, how to run each phase, progress tracking |
| `CLAUDE.md` | Claude Code / general | Framework overview, architecture, file table, startup command |
| `AGENTS.md` | OpenCode / Amp | Same as CLAUDE.md |
| `.cursor/rules/scriptorium.mdc` | Cursor | Same, Cursor-specific format |
| `.windsurf/rules/scriptorium.md` | Windsurf | Same, Windsurf-specific format |

---

## Important Notes

- `agents/` and `framework/` are **read-only** framework core — never modify them
- `templates/` files contain `{{variable}}` placeholders — the AI fills them in at runtime
- All output files are created automatically by the AI: `research/`, `chapters/`, `reviews/`, `output/`
