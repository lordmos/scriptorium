# 与 AI 工具集成

Scriptorium 为所有主流 AI 编程助手提供了开箱即用的上下文文件，让它们能够理解框架结构、自动扮演正确的 Agent 角色。

## 原理

AI 工具通过读取项目根目录中的特定文件来获取上下文。Scriptorium 为每个工具准备了对应的文件：

| 工具 | 读取的文件 | 说明 |
|------|-----------|------|
| **Claude Code** | `CLAUDE.md` | Anthropic 官方 CLI |
| **OpenCode** | `AGENTS.md` | 开源 TUI 编程助手 |
| **Amp**（前 Antigravity）| `AGENTS.md` | Sourcegraph 出品 |
| **Cursor** | `.cursor/rules/*.mdc` | IDE 内嵌 AI |
| **Windsurf** | `.windsurf/rules/*.md` | Codeium/Windsurf IDE |
| **其他工具** | `CLAUDE.md` | 大多数工具会自动读取 |

---

## 快速开始

### 第一步：基于模板创建书籍项目

在 GitHub 上点击 **"Use this template"** 创建你的书籍项目，所有上下文文件都会自动包含在内。

```bash
# 或者直接克隆
git clone https://github.com/lordmos/tech-editorial.git my-book
cd my-book
```

### 第二步：填写 `CLAUDE.md` 中的书籍信息

打开根目录的 `CLAUDE.md`，填写 `## 📖 About This Book Project` 部分：

```markdown
## 📖 About This Book Project

- **Book Title**: 《Spring Framework 源码深度解析》
- **Source Project**: spring-framework (github.com/spring-projects/spring-framework)
- **Target Reader**: 有 3 年以上 Java 经验的后端工程师
- **One-line Description**: 通过阅读 Spring 核心模块源码，理解 IoC/AOP 的设计哲学
```

### 第三步：填写基础模板

运行阶段 1 前，需要填写以下文件（参考 `templates/` 目录中的模板）：

- `source-map.md` — 源码路径与章节的映射
- `outline.md` — 书籍大纲
- `style-guide.md` — 写作规范

---

## Claude Code 使用指南

Claude Code 会自动读取项目根目录的 `CLAUDE.md`。

```bash
# 安装 Claude Code
npm install -g @anthropic-ai/claude-code

# 进入书籍项目目录
cd my-book

# 启动 Claude Code（自动读取 CLAUDE.md）
claude

# 示例：开始一个研究任务
> 请查看 checkpoint.md，然后对第 2 章执行 Researcher Agent
```

**推荐工作流：**

```bash
# 1. 检查当前进度
> 读取 checkpoint.md，告诉我下一步该做什么

# 2. 执行 Agent
> 按照 agents/04-researcher.md 的规格，研究第 3 章「IoC 容器初始化」
> 上下文：source-map.md、outline.md（第 3 章部分）

# 3. 确认输出
> 把结果写入 research/ch03-research-report.md，并更新 checkpoint.md
```

---

## OpenCode 使用指南

OpenCode 优先读取 `AGENTS.md`，格式与 `CLAUDE.md` 完全兼容。

```bash
# 安装 OpenCode
npm install -g opencode-ai   # 或按官方文档安装

# 进入项目目录
cd my-book

# 启动 OpenCode（自动读取 AGENTS.md）
opencode
```

---

## Amp（Antigravity）使用指南

Amp 读取 `AGENTS.md` 作为项目上下文。

```bash
# 在项目目录中启动 Amp
amp

# Amp 会自动加载 AGENTS.md 并理解 Scriptorium 框架
```

---

## Cursor 使用指南

`.cursor/rules/scriptorium.mdc` 会在 Cursor 中自动加载（`alwaysApply: true`）。

1. 用 Cursor 打开书籍项目目录
2. Cursor 自动读取 `.cursor/rules/scriptorium.mdc`
3. 在 Cursor Chat 中直接提问：

```
@workspace 当前项目进度如何？下一步应该执行哪个 Agent？
```

```
请按照 agents/05-writer.md 的规格，基于 research/ch02-report.md 撰写第 2 章
```

---

## Windsurf 使用指南

`.windsurf/rules/scriptorium.md` 会在 Windsurf IDE 中自动加载。

用 Windsurf 打开项目后，在 Cascade（AI 面板）中直接对话：

```
根据 checkpoint.md，我现在该做什么？
```

---

## 最佳实践

### 每次会话的标准开场

无论使用哪个工具，建议每次开始时说：

```
请先读取 checkpoint.md，告诉我当前的项目进度，然后提议下一步行动。
```

### 调用 Agent 的标准格式

```
请扮演 agents/[文件名].md 中定义的角色。

文件指针（上下文）：
- [文件1]
- [文件2]

任务：[具体任务描述]
输出路径：[输出文件路径]
```

### 注意事项

- `agents/` 和 `framework/` 目录是**只读的**框架核心，不要修改
- `templates/` 中的文件包含 `{{变量名}}` 占位符，使用前需填写
- 每次 Agent 运行后，务必更新 `checkpoint.md` 和 `audit-log.md`
- 研究报告存放在 `research/`，章节草稿存放在 `chapters/`，审查报告存放在 `reviews/`

---

## 文件结构参考

使用 Scriptorium 创建书籍项目后，推荐的完整目录结构：

```
my-book/
├── CLAUDE.md              ← AI 工具上下文（已填写书籍信息）
├── AGENTS.md              ← 同上（OpenCode/Amp 专用）
├── .cursor/rules/         ← Cursor 规则（自动加载）
├── .windsurf/rules/       ← Windsurf 规则（自动加载）
│
├── source-map.md          ← 源码映射（Phase 1 填写）
├── outline.md             ← 书籍大纲（Phase 1 填写）
├── style-guide.md         ← 写作规范（Phase 1 填写）
├── glossary.md            ← 术语表（持续更新）
├── metaphor-registry.md   ← 比喻注册表（持续更新）
├── checkpoint.md          ← 进度追踪（自动更新）
├── audit-log.md           ← 审计日志（自动更新）
│
├── agents/                ← Agent 规格（只读，来自框架）
├── framework/             ← 框架文档（只读，来自框架）
├── templates/             ← 模板文件（填写后使用）
│
├── research/              ← 研究报告（Phase 2 输出）
│   ├── ch01-research-report.md
│   └── ch02-research-report.md
├── chapters/              ← 章节草稿（Phase 3 输出）
│   ├── ch01-draft.md
│   └── ch02-draft.md
└── reviews/               ← 审查报告（Phase 4 输出）
    ├── ch01-r1-code-review.md
    ├── ch01-r2-consistency.md
    └── ch01-r3-content.md
```
