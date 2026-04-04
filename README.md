> **语言 / Language**: **简体中文** · [English](README.en.md) · [日本語](README.ja.md) · [繁體中文](README.zh-TW.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/lordmos/tech-editorial?style=flat-square&color=gold)](https://github.com/lordmos/tech-editorial/stargazers)
[![Forks](https://img.shields.io/github/forks/lordmos/tech-editorial?style=flat-square)](https://github.com/lordmos/tech-editorial/network/members)
[![Last Commit](https://img.shields.io/github/last-commit/lordmos/tech-editorial?style=flat-square)](https://github.com/lordmos/tech-editorial/commits)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Multi-Agent](https://img.shields.io/badge/Multi--Agent-12%20Agents-blueviolet?style=flat-square)]()

# 📚 技术书籍多Agent编辑部框架

> **"源码阅读系列"技术书籍的多Agent协作编写框架**

## 1. 框架简介

本框架为"源码阅读系列"技术书籍提供一套完整的多Agent编辑部工作流。通过 **12 个 AI Agent** 的协同配合，覆盖从大纲设计到最终出版的全流程。

核心理念：

> **Agent 是无状态的，文件系统是有状态的。**

每个 Agent 都是一次性工人——它不记住上次做了什么，所有的"记忆"都存储在共享文件系统中。主编排 Agent 通过 **File Pointers**（文件路径引用）精确注入每个 Agent 所需的上下文，确保信息流向可控、可追溯。

---

## 2. 适用场景

本框架适用于以下类型的技术书籍项目：

- ✅ **阅读开源项目源码** 类型的技术书籍（如《{{项目名称}}源码深度解析》）
- ✅ 需要逐章拆解大型代码仓库的架构分析书籍
- ✅ 面向多层次读者（学生、工程师、爱好者）的技术科普
- ✅ 需要多人协作、流程可控的长篇技术写作项目

**不适用于**：纯理论教材、API 参考文档、短篇技术博客。

---

## 3. 系统架构概览

本框架采用 **Hub-Spoke（轴辐式）架构**：

```
                    ┌─────────────┐
                    │  主编排 #0   │  ← Hub（中枢）
                    │ Orchestrator│
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
      ┌────▼────┐    ┌─────▼────┐    ┌─────▼────┐
      │ Agent A │    │ Agent B  │    │ Agent C  │  ← Spokes（辐条）
      └─────────┘    └──────────┘    └──────────┘
```

- **主编排 Agent（#0）** 是唯一的调度中心，所有子 Agent 只与主编排通信
- 子 Agent 之间 **不直接对话**，通过共享文件系统传递信息
- 主编排通过 **File Pointers** 精确控制每个 Agent 的读写范围，避免信息过载

---

## 4. Agent 团队一览表

| 编号 | 名称 | 角色隐喻 | Agent 类型 | 职责 |
|------|------|----------|-----------|------|
| #0 | 主编排 Orchestrator | 总导演 | general-purpose | 调度全流程，管理进度与依赖 |
| #1 | 架构师 Architect | 技术总监 | general-purpose | 设计书籍大纲与知识图谱 |
| #2 | 读者代言人 Reader Advocate | 产品经理 | general-purpose | 从读者视角审核大纲的合理性 |
| #3 | 研究员 Researcher | 源码考古学家 | explore | 深度调研源码，产出研究报告 |
| #4 | 作家 Writer | 畅销书作者 | general-purpose | 撰写章节正文 |
| R1 | 源码审查员 Code Reviewer | 代码考据专家 | explore | 验证章节中所有代码引用的技术准确性 |
| R2 | 一致性审查员 Consistency Reviewer | 记忆管理员 | explore | 检查跨章术语、数据、逻辑的一致性 |
| R3 | 内容审查员 Content Reviewer | 资深编辑 | general-purpose | 审核可读性、结构完整性与敏感性 |
| RS | 大学生读者 | 计算机专业大三学生 | general-purpose | 模拟初学者视角的阅读评审 |
| RE | 工程师读者 | 8年经验全栈工程师 | general-purpose | 模拟专业开发者视角的阅读评审 |
| RH | 爱好者读者 | 无技术背景科技爱好者 | general-purpose | 模拟非技术读者视角的阅读评审 |
| #11 | 装帧工人 Bookbinder | 排版设计师 | general-purpose | Markdown→HTML 出版流水线 |

---

## 5. 五阶段工作流概览

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 5
大纲定稿    共享资源     逐章写作    统稿审计    装帧发布
            构建
```

### Phase 1：大纲定稿

**参与 Agent**：#1 架构师、#2 读者代言人、R3 内容审查员

架构师根据源码结构设计章节大纲与知识图谱，读者代言人从目标读者视角提出修改建议，内容审查员对大纲进行初步审核。最终产出经用户审批的 `outline.md`。

### Phase 2：共享资源构建

**参与 Agent**：#0 主编排（直接执行）

基于定稿的大纲，构建所有 Agent 后续需要的共享资源文件：

- `source-map.md` — 源码目录结构与核心模块说明
- `glossary.md` — 全书统一术语表
- `metaphor-registry.md` — 比喻注册表（避免跨章比喻冲突）
- `style-guide.md` — 写作风格指南
- `cross-references.md` — 跨章引用登记表

### Phase 3：逐章写作（×{{章节数}}章）

每章依次经过 4 个步骤：

| 步骤 | Agent | 产出 |
|------|-------|------|
| Step 1 源码调研 | #3 研究员 | `research/chXX-research.md` |
| Step 2 章节撰写 | #4 作家 | `chapters/chXX.md` |
| Step 3 三员审查 | R1 + R2 + R3（并行） | 各自的审查报告 |
| Step 4 读者评审 | RS + RE + RH（并行） | 各自的评审反馈 |

> 💡 **并行优化**：Step 3 的三位审查员可同时工作（数据依赖不同）；Step 4 的三位读者评审同样可并行。多章之间也可分批并行（如每批 {{并行批次数}} 章）。

### Phase 4：统稿审计

**参与 Agent**：#0 主编排、R1 + R2 + R3（复审）

对全书进行最终审计：术语一致性、跨章引用完整性、代码片段准确性、整体叙事连贯性。

### Phase 5：装帧发布

**参与 Agent**：#11 装帧工人

执行 Markdown→HTML 转换、**Mermaid 图表渲染**（通过 Mermaid.js）、ASCII 图→SVG 渲染（兼容存量内容）、目录生成、样式应用。产出可发布的静态网站。

---

## 6. 目录结构

```
tech-editorial/
├── README.md                  ← 本文件：框架总览与快速开始
├── agents/                    ← 每个 Agent 的详细规格说明
│   ├── 00-system-overview.md  ← 系统架构与Agent注册表
│   ├── 01-orchestrator.md     ← #0 主编排 Agent
│   ├── 02-architect.md        ← #1 架构师 Agent
│   ├── 03-reader-advocate.md  ← #2 读者代言人 Agent
│   ├── 04-researcher.md       ← #3 研究员 Agent
│   ├── 05-writer.md           ← #4 作家 Agent
│   ├── 06-code-reviewer.md    ← R1 源码审查员
│   ├── 07-consistency-reviewer.md ← R2 一致性审查员
│   ├── 08-content-reviewer.md ← R3 内容审查员
│   ├── 09-reader-panel.md     ← 读者评审团（大学生/工程师/爱好者）
│   └── 10-bookbinder.md       ← #11 装帧工人 Agent
├── framework/                 ← 工作流程、规则与机制
│   ├── workflow.md            ← 五阶段详细工作流
│   ├── file-pointers.md       ← File Pointers 机制说明
│   ├── review-architecture.md ← 审查与评审协议
│   ├── parallel-strategy.md   ← 并行执行策略
│   └── recovery.md            ← 断点恢复与容灾机制
└── templates/                 ← 可填写的项目模板
    ├── source-map.md          ← 源码地图模板
    ├── outline.md             ← 大纲模板
    ├── style-guide.md         ← 风格指南模板
    ├── glossary.md            ← 术语表模板
    ├── metaphor-registry.md   ← 比喻注册表模板
    ├── chapter-summary.md     ← 章节摘要模板（长记忆）
    ├── checkpoint.md          ← 进度检查点模板
    └── audit-log.md           ← 审计日志模板
```

### 子目录说明

| 目录 | 用途 |
|------|------|
| `agents/` | 每个 Agent 的完整规格说明：系统提示词模板、输入/输出规范、File Pointers 清单、质量检查点 |
| `framework/` | 与具体 Agent 无关的通用工作流文档：阶段划分、审查协议、文件格式规范、协作机制 |
| `templates/` | 新项目启动时需要填写的模板文件，包含 `{{变量}}` 占位符，填写后即成为项目共享资源 |

---

## 7. 快速开始

### Step 1：复制框架

```bash
cp -r tech-editorial/ {{你的项目路径}}/editorial/
```

### Step 2：填写模板

进入 `templates/` 目录，填写以下核心模板：

| 模板文件 | 需要填写的内容 |
|---------|--------------|
| `source-map.md` | 目标源码的目录结构、核心模块说明、关键文件路径 |
| `outline.md` | 初始章节大纲（可由架构师 Agent 辅助生成） |
| `style-guide.md` | 写作风格偏好、代码展示规范、读者定位 |
| `glossary.md` | 已知术语的初始翻译/定义（后续由 Agent 补充） |
| `metaphor-registry.md` | 留空即可，由写作过程中逐步填充 |

### Step 3：配置主编排 Agent

在主编排 Agent 的启动提示词中，设定以下项目参数：

```yaml
项目名称: {{项目名称}}
源码仓库: {{源码仓库地址}}
源码版本: {{源码版本/commit}}
章节总数: {{章节数}}
并行批次: {{并行批次数}}  # 每批同时写作的章节数
目标读者: {{目标读者描述}}
输出目录: {{输出目录路径}}
```

### Step 4：按阶段推进

依次执行 Phase 1→5，每个 Phase 完成后确认产出物再进入下一阶段：

1. **Phase 1**：启动架构师 → 读者代言人审核 → 用户审批大纲
2. **Phase 2**：主编排生成共享资源文件
3. **Phase 3**：逐章（或分批并行）执行 研究→撰写→审查→评审
4. **Phase 4**：全书统稿审计
5. **Phase 5**：装帧工人生成 HTML 发布物

---

## 8. 核心设计原则

### 原则 1：Agent 无状态，文件系统有状态

每个 Agent 在每次调用时都是"全新的"——它不记住之前的对话。所有需要跨调用保留的信息（进度、审查结果、术语表……）都必须写入文件系统。这使得：
- 任何 Agent 实例都可以被替换
- 故障恢复只需重新调用，无需回溯对话历史

### 原则 2：所有 Agent 只与主编排通信（Hub-Spoke）

子 Agent 之间不直接交互。主编排是唯一的调度中心，负责：
- 决定调用哪个 Agent
- 通过 File Pointers 注入所需上下文
- 收集产出并决定下一步

### 原则 3：File Pointers 精确控制读写范围

每个 Agent 被明确告知：
- **必读文件**：执行任务前必须阅读的文件列表
- **可写文件**：允许写入/修改的文件路径
- **禁写文件**：不得修改的文件列表

这避免了 Agent 因信息过载而产出低质量结果，也防止了误写。

### 原则 4：长记忆通过共享文件实现跨 Agent 信息传递

Agent A 的产出写入文件 → 主编排将该文件作为 File Pointer 注入给 Agent B → Agent B 获得 Agent A 的"记忆"。典型的共享文件包括：
- `chapter-summaries.md` — 已完成章节的摘要
- `glossary.md` — 全书术语表
- `metaphor-registry.md` — 已使用的比喻登记
- `cross-references.md` — 跨章引用关系

### 原则 5：审查与写作分离，支持并行

三位审查员（R1 源码、R2 一致性、R3 内容）检查的维度不同，数据依赖不重叠，因此可以 **并行执行**。同理，三位读者评审（RS/RE/RH）也可并行。这显著缩短了每章的处理时间。

### 原则 6：断点可恢复

文件系统的状态完整反映了项目进度。如果流程中断（Agent 故障、人工暂停等），主编排可以通过检查已有文件推断当前进度，从断点继续，无需从头开始。

---

## 9. 技能要求

使用本框架需要以下知识和能力：

| 技能领域 | 具体要求 | 重要程度 |
|---------|---------|---------|
| AI Agent Prompt 工程 | 了解如何编写系统提示词、调整 Agent 行为（如 Claude、GPT 等） | ⭐⭐⭐ 必需 |
| 目标源码语言 | 熟悉目标开源项目所用的编程语言（如 {{编程语言}}） | ⭐⭐⭐ 必需 |
| 项目管理 | 依赖分析、进度追踪、任务分解；理解 DAG（有向无环图）式的工作流 | ⭐⭐ 重要 |
| Markdown 写作 | 熟练使用 Markdown 语法，理解文档结构化写作 | ⭐⭐ 重要 |
| Node.js 基础 | 用于 Phase 5 装帧构建脚本（Markdown→HTML 转换、静态站点生成） | ⭐ 可选 |

---

---

## 🎯 使用本框架的项目

> 你用本框架写了什么？[告诉我们！](https://github.com/lordmos/tech-editorial/issues/new?template=show_your_book.yml)

| 书名 / Book Title | 目标源码 | 作者 |
|------------------|---------|------|
| [Angular 依赖注入系统深度解析（示例）](examples/angular-di/) | [angular/angular](https://github.com/angular/angular) | [@lordmos](https://github.com/lordmos) |

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=lordmos/tech-editorial&type=Date)](https://star-history.com/#lordmos/tech-editorial&Date)

---

## 💖 支持本项目

如果本框架为你节省了时间，欢迎请作者喝杯咖啡 ☕

| 平台 | 链接 |
|------|------|
| 爱发电（国内） | [afdian.com/@lordmos](https://afdian.com/@lordmos) |
| Ko-fi（国际） | [ko-fi.com/lordmos](https://ko-fi.com/lordmos) |
| 微信 / 支付宝 | <details><summary>扫码支付</summary>（请将收款码图片放在 `assets/wechat-pay.png` 和 `assets/alipay.png`）</details> |

---

## 许可与致谢

本框架提取自一个真实的多Agent协作写书项目，经过抽象化处理，去除了所有项目特定内容，保留了可复用的工作流与架构设计。

欢迎根据你的项目需求自由修改和扩展。
