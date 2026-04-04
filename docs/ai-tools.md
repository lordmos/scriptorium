# 与 AI 工具集成

Scriptorium 为所有主流 AI 编程助手提供了开箱即用的上下文文件，让它们能够理解框架结构、自动扮演主编排角色并运行完整流水线。

## 各工具读取的文件

| 工具 | 自动读取 | 说明 |
|------|---------|------|
| **Claude Code** | `CLAUDE.md` | Anthropic 官方 CLI |
| **OpenCode** | `AGENTS.md` | 开源 TUI 编程助手 |
| **Amp** | `AGENTS.md` | Sourcegraph 出品 |
| **Cursor** | `.cursor/rules/*.mdc` | IDE 内嵌 AI（`alwaysApply: true`） |
| **Windsurf** | `.windsurf/rules/*.md` | Codeium/Windsurf IDE |
| **其他工具** | `CLAUDE.md` | 大多数工具均可自动读取 |

---

## 启动书籍项目

无论使用哪个工具，操作方式完全一样：

**1. 用 AI 工具打开项目目录**

```bash
cd my-book
claude   # 或 opencode / cursor / windsurf
```

**2. 说这一句话**

```
[项目名] 的源码在 [目录路径]。请读 QUICK_START.md，然后向我提问。
没有问题就开始你的工作。
```

AI 会读取 `QUICK_START.md`，收集书名/读者等基本信息，然后自主运行全部五阶段流水线。

**3. 中断后恢复**

```
请读 checkpoint.md，继续上次未完成的工作。
```

---

## 上下文文件说明

| 文件 | 写给谁 | 内容 |
|------|--------|------|
| `QUICK_START.md` | AI Orchestrator | 完整编排手册：问什么、怎么跑、怎么追踪进度 |
| `CLAUDE.md` | Claude Code / 通用 | 框架概览、架构、文件表、启动命令 |
| `AGENTS.md` | OpenCode / Amp | 同 CLAUDE.md |
| `.cursor/rules/scriptorium.mdc` | Cursor | 同上，Cursor 专用格式 |
| `.windsurf/rules/scriptorium.md` | Windsurf | 同上，Windsurf 专用格式 |

---

## 注意事项

- `agents/` 和 `framework/` 目录是**只读的**框架核心，不要修改
- `templates/` 中的文件包含 `{{变量名}}` 占位符，由 AI 在运行时填写
- 所有产出文件由 AI 自动创建：`research/`、`chapters/`、`reviews/`、`output/`
