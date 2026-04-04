# How to Use Scriptorium

> You don't need to manually invoke each Agent. One sentence starts everything — the AI handles the rest.

---

## Three Steps to Get Started

### Step 1: Create Your Book Project

Click **"Use this template"** on GitHub to create your book repository:

```
https://github.com/lordmos/scriptorium
```

### Step 2: Prepare the Source Code

Put the open-source project you want to write about in your repository directory (or note its path).

Open the directory with an AI tool: [Claude Code](https://claude.ai/code), [OpenCode](https://opencode.ai), [Cursor](https://cursor.sh), or any tool that reads `CLAUDE.md`.

### Step 3: Say This One Sentence

```
The source code for [project name] is in [directory path].
Please read QUICK_START.md, then ask me any questions you have.
If you have no questions, start your work.
```

**That's it.** Your AI assistant will automatically:

1. Read `QUICK_START.md` for its full working instructions
2. Ask you for basic information: book title, target audience, etc.
3. Act as the Architect to analyze the source code and generate an outline
4. Show you the outline and ask for your approval
5. Autonomously run Phase 2→5: research, writing, triple review per chapter
6. Deliver the complete manuscript

---

## The Only Things You Need to Do

| When | Your action |
|------|-------------|
| At startup | Answer the AI's basic questions (title, audience, etc.) |
| End of Phase 1 | Approve or revise the outline |
| When finished | Read `output/book-final.md` |

---

## Resume After Interruption

You can pause at any time. Next session, tell the AI:

```
Please read checkpoint.md and continue where we left off.
```

---

## Learn More

| Document | Contents |
|----------|----------|
| [`QUICK_START.md`](https://github.com/lordmos/scriptorium/blob/main/QUICK_START.md) | AI Orchestrator entry file (machine-readable) |
| [`agents/00-system-overview.md`](/en/agents/00-system-overview) | Full specs for all 12 Agents |
| [`framework/workflow.md`](/en/framework/workflow) | 5-phase pipeline in detail |
| [`framework/parallel-strategy.md`](/en/framework/parallel-strategy) | Parallel acceleration strategy |
| [`framework/recovery.md`](/en/framework/recovery) | Checkpoint recovery mechanism |

