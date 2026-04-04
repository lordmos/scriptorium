# 🏗️ 系统架构与Agent注册表

> 本文档是多Agent编辑部的系统级架构说明，定义了所有Agent的注册信息、交互关系与信息流向规则。

---

## 1. 系统哲学

### Agent 是无状态的一次性工人

在本框架中，每个 Agent 都被视为 **无状态的一次性工人**：

- **无记忆**：Agent 不保留前次调用的任何上下文。每次启动都是一张白纸。
- **无自主权**：Agent 不决定自己何时工作、做什么。一切由主编排调度。
- **可替换**：任何 Agent 实例都可以被同类型的新实例替换，只要输入（File Pointers）相同，产出就应一致。

### 所有记忆存储在磁盘共享文件中

Agent 之间的"记忆传递"完全通过文件系统实现：

```
Agent A 产出 → 写入文件 → 主编排注入文件路径给 Agent B → Agent B 读取 → 获得"记忆"
```

这与现代微服务架构的理念一致：
- 服务（Agent）本身无状态，状态存储在外部（文件系统）
- 服务之间通过消息（File Pointers）通信，而非直接调用
- 编排器（Orchestrator）负责服务发现与调度

### 主编排通过 File Pointers 注入上下文

**File Pointers** 是主编排控制 Agent 行为的核心机制：

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

File Pointers 的价值：
- **精确控制信息范围**：Agent 只看到它需要的信息，避免上下文窗口浪费
- **明确读写边界**：每个 Agent 知道自己能读什么、该写什么
- **可追溯性**：通过 File Pointers 清单，可以重建任何 Agent 调用时的完整上下文

---

## 2. Agent 注册表

### 核心创作组

| 编号 | 名称 | 角色隐喻 | Agent 类型 | 职责 | 详细文档 |
|------|------|----------|-----------|------|---------|
| #0 | 主编排 Orchestrator | 总导演 | `general-purpose` | 调度全流程，管理进度与依赖，通过 File Pointers 注入上下文 | [→ 01-orchestrator.md](./01-orchestrator.md) |
| #1 | 架构师 Architect | 技术总监 | `general-purpose` | 分析源码结构，设计章节大纲与知识图谱，规划章节间依赖关系 | [→ 02-architect.md](./02-architect.md) |
| #2 | 读者代言人 Reader Advocate | 产品经理 | `general-purpose` | 从目标读者视角审核大纲，确保章节顺序符合学习曲线 | [→ 03-reader-advocate.md](./03-reader-advocate.md) |
| #3 | 研究员 Researcher | 源码考古学家 | `explore` | 深度调研指定章节涉及的源码模块，产出结构化研究报告 | [→ 04-researcher.md](./04-researcher.md) |
| #4 | 作家 Writer | 畅销书作者 | `general-purpose` | 基于研究报告和风格指南撰写章节正文 | [→ 05-writer.md](./05-writer.md) |

### 审查组

| 编号 | 名称 | 角色隐喻 | Agent 类型 | 职责 | 详细文档 |
|------|------|----------|-----------|------|---------|
| R1 | 源码审查员 Code Reviewer | 代码考据专家 | `explore` | 验证章节中每个代码引用的准确性：文件路径、函数签名、行为描述 | [→ 06-code-reviewer.md](./06-code-reviewer.md) |
| R2 | 一致性审查员 Consistency Reviewer | 记忆管理员 | `explore` | 检查跨章术语统一性、数据一致性、交叉引用完整性 | [→ 07-consistency-reviewer.md](./07-consistency-reviewer.md) |
| R3 | 内容审查员 Content Reviewer | 资深编辑 | `general-purpose` | 审核可读性、叙事结构、敏感内容，确保符合风格指南 | [→ 08-content-reviewer.md](./08-content-reviewer.md) |

### 读者评审团

| 编号 | 名称 | 角色隐喻 | Agent 类型 | 职责 | 详细文档 |
|------|------|----------|-----------|------|---------|
| RS | 大学生读者 | 计算机专业大三学生 | `general-purpose` | 模拟初学者视角：标记看不懂的术语、缺失的背景知识、跳跃的逻辑 | [→ 09-reader-panel.md](./09-reader-panel.md) |
| RE | 工程师读者 | 8年经验全栈工程师 | `general-purpose` | 模拟专业开发者视角：评价技术深度、实用性、是否有新收获 | [→ 09-reader-panel.md](./09-reader-panel.md) |
| RH | 爱好者读者 | 无技术背景科技爱好者 | `general-purpose` | 模拟非技术读者视角：检验比喻是否生动、概念解释是否通俗 | [→ 09-reader-panel.md](./09-reader-panel.md) |

### 出版组

| 编号 | 名称 | 角色隐喻 | Agent 类型 | 职责 | 详细文档 |
|------|------|----------|-----------|------|---------|
| #11 | 装帧工人 Bookbinder | 排版设计师 | `general-purpose` | Markdown→HTML 转换，Mermaid 图渲染，ASCII 图→SVG 渲染，零依赖构建脚本 | [→ 10-bookbinder.md](./10-bookbinder.md) |

---

## 3. 交互关系图

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

### 架构解读

**Hub-Spoke 模式**：主编排（#0）是唯一的 Hub，所有其他 Agent 都是 Spoke。这意味着：

1. **无环依赖**：信息流是单向的（主编排→Agent→文件→主编排），不存在 Agent 之间的循环调用
2. **故障隔离**：任何一个 Spoke Agent 的失败只影响当前任务，不会级联到其他 Agent
3. **可观测性**：所有调度决策都在主编排中，便于日志记录和调试

**并行点**：
- Phase 3 Step 3：R1、R2、R3 三位审查员并行（检查维度正交）
- Phase 3 Step 4：RS、RE、RH 三位读者并行（评审视角独立）
- Phase 3 章间：不同章节的 Step 1（研究）可与已完成研究的章节的 Step 2（写作）并行

---

## 4. 信息流向规则

### 规则 1：单向通信 — 所有指令从主编排发出

```
✅ 主编排 → Agent      （通过 File Pointers 注入任务）
✅ Agent → 文件系统     （写入产出物）
✅ 主编排 ← 文件系统    （读取产出物，决定下一步）
❌ Agent → Agent        （禁止直接通信）
❌ Agent → 主编排       （Agent 不主动发起请求）
```

Agent 不知道其他 Agent 的存在。它只看到主编排提供的文件，完成任务后写入结果。

### 规则 2：File Pointers 遵循最小权限原则

每个 Agent 只获得完成当前任务 **最少量** 的文件引用：

| Agent | 典型必读文件 | 典型输出文件 |
|-------|-------------|-------------|
| #3 研究员 | `outline.md`（当前章节部分）、`source-map.md`、`glossary.md` | `research/chXX-research.md` |
| #4 作家 | `research/chXX-research.md`、`style-guide.md`、`chapter-summaries.md`、`metaphor-registry.md` | `chapters/chXX.md` |
| R1 源码审查员 | `chapters/chXX.md`、源码文件（按需） | `reviews/chXX-code-review.md` |
| R2 一致性审查员 | `chapters/chXX.md`、`glossary.md`、`chapter-summaries.md`、`cross-references.md` | `reviews/chXX-consistency-review.md` |
| R3 内容审查员 | `chapters/chXX.md`、`style-guide.md` | `reviews/chXX-content-review.md` |

> 💡 作家 **不** 获得其他章节的完整正文（避免上下文窗口浪费），只获得 `chapter-summaries.md` 中的摘要。

### 规则 3：共享文件是 Agent 间唯一的信息桥梁

以下共享文件构成了 Agent 之间的"长期记忆"：

| 共享文件 | 写入者 | 读取者 | 用途 |
|---------|-------|--------|------|
| `source-map.md` | #0 主编排 | #1、#3、R1 | 源码目录结构与模块说明 |
| `outline.md` | #1 架构师 | 所有 Agent | 章节大纲与知识依赖图 |
| `glossary.md` | #0（初始）→ #4（追加） | 所有 Agent | 全书统一术语表 |
| `metaphor-registry.md` | #4 作家（追加） | #4、R2 | 已使用比喻登记，避免跨章重复 |
| `style-guide.md` | #0 主编排 | #4、R3 | 写作风格规范 |
| `chapter-summaries.md` | #0（每章完成后更新） | #4、R2 | 已完成章节的摘要 |
| `cross-references.md` | #4（追加） → R2（验证） | #4、R2、#0 | 跨章引用关系登记 |

### 规则 4：状态推断 — 文件存在性即进度

主编排通过检查文件系统推断每章的进度状态：

```
文件不存在                        → 未开始
research/chXX-research.md 存在   → Step 1 完成（研究完成）
chapters/chXX.md 存在            → Step 2 完成（初稿完成）
reviews/chXX-*-review.md 存在    → Step 3 完成（审查完成）
feedback/chXX-*-feedback.md 存在 → Step 4 完成（评审完成）
chapters/chXX-final.md 存在      → 该章定稿
```

这使得流程具备 **断点恢复** 能力：中断后重新启动，主编排扫描文件系统即可恢复进度，无需任何额外的状态存储。

---

## 5. 关联文档

### 框架文档

| 文档 | 路径 | 内容 |
|------|------|------|
| 五阶段工作流详解 | [`framework/workflow.md`](../framework/workflow.md) | 每个 Phase 的详细步骤、入口条件、出口条件 |
| File Pointers 机制 | [`framework/file-pointers.md`](../framework/file-pointers.md) | File Pointers 的设计原理与使用规范 |
| 审查与评审协议 | [`framework/review-architecture.md`](../framework/review-architecture.md) | 审查员和读者评审的评分标准、反馈格式 |
| 并行执行策略 | [`framework/parallel-strategy.md`](../framework/parallel-strategy.md) | 多章并行、多员并行的调度策略 |
| 断点恢复机制 | [`framework/recovery.md`](../framework/recovery.md) | 流程中断后的状态恢复方法 |

### Agent 详细文档

| Agent | 文档路径 |
|-------|---------|
| #0 主编排 Orchestrator | [`agents/01-orchestrator.md`](./01-orchestrator.md) |
| #1 架构师 Architect | [`agents/02-architect.md`](./02-architect.md) |
| #2 读者代言人 Reader Advocate | [`agents/03-reader-advocate.md`](./03-reader-advocate.md) |
| #3 研究员 Researcher | [`agents/04-researcher.md`](./04-researcher.md) |
| #4 作家 Writer | [`agents/05-writer.md`](./05-writer.md) |
| R1 源码审查员 Code Reviewer | [`agents/06-code-reviewer.md`](./06-code-reviewer.md) |
| R2 一致性审查员 Consistency Reviewer | [`agents/07-consistency-reviewer.md`](./07-consistency-reviewer.md) |
| R3 内容审查员 Content Reviewer | [`agents/08-content-reviewer.md`](./08-content-reviewer.md) |
| RS 大学生读者 | [`agents/09-reader-panel.md`](./09-reader-panel.md) |
| RE 工程师读者 | [`agents/09-reader-panel.md`](./09-reader-panel.md) |
| RH 爱好者读者 | [`agents/09-reader-panel.md`](./09-reader-panel.md) |
| #11 装帧工人 Bookbinder | [`agents/10-bookbinder.md`](./10-bookbinder.md) |

### 模板文件

| 模板 | 路径 | 新项目启动时操作 |
|------|------|----------------|
| 源码地图 | [`templates/source-map.md`](../templates/source-map.md) | 填写目标源码的目录结构与核心模块 |
| 大纲模板 | [`templates/outline.md`](../templates/outline.md) | 填写初始章节规划（可由 #1 架构师辅助） |
| 风格指南 | [`templates/style-guide.md`](../templates/style-guide.md) | 填写写作风格偏好与代码展示规范 |
| 术语表 | [`templates/glossary.md`](../templates/glossary.md) | 填写已知术语的定义与翻译 |
| 比喻注册表 | [`templates/metaphor-registry.md`](../templates/metaphor-registry.md) | 留空，由写作过程逐步填充 |
