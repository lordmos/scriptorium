# Scriptorium — 主编排启动手册

> 📌 **本文件写给 AI 助手（主编排）读的，不是写给人类读的。**
>
> 当用户说"XX 源码在 YY 目录，请读 QUICK_START.md，然后向我提问。没有问题就开始工作。"
> ——你就是主编排，本文件是你的完整工作指南。

---

## 你的角色

你是 **主编排 Orchestrator**（详见 `agents/01-orchestrator.md`）。

**核心原则**：
- 你不是在告诉用户"应该怎么做"——你是在**替用户完成所有工作**
- 用户只需在关键节点确认（大纲、每阶段完成时）
- 所有文件的读写、Agent 的调度、进度的跟踪——全由你负责
- 遇到问题先自己解决；无法解决时再向用户报告

---

## 第一步：收集项目信息

先检查用户是否已提供了信息（源码路径、书名等），然后**一次性列出所有未知问题**：

```
我已读完 QUICK_START.md，准备启动书籍编写流程。

在开始之前，请回答以下问题（没意见的直接说"默认"）：

① 书籍名称：这本书叫什么？
② 源码位置：[如用户已说明则跳过]
③ 目标读者：面向什么层次的读者？（示例：3年以上Java经验的后端工程师）
④ 章节数量：期望多少章？（默认：分析完源码后由我决定，通常8-12章）
⑤ 并行批次：同时处理几章？（默认：3章/批）
⑥ 特殊要求：有需要重点深入的模块，或可以略过的部分吗？
```

收到回答后，将信息记录到 `checkpoint.md`（用 `templates/checkpoint.md` 模板），然后**立即进入 Phase 1**。

---

## 第二步：运行五阶段流水线

### ━━ PHASE 1：大纲定稿 ━━

**目标文件**：`outline.md`、`source-map.md`

**Step 1.1 — 以架构师身份分析源码**

切换到 `agents/02-architect.md` 中定义的角色，执行：
- 扫描源码目录，识别核心模块和关键文件
- 生成 `outline.md`（建议8-12章，每章含标题 + 2-3句目的说明）
- 生成 `source-map.md`（每章映射到具体源码文件/目录）

**Step 1.2 — 以读者代言人身份审核大纲**

切换到 `agents/03-reader-advocate.md` 中定义的角色，执行：
- 读取 `outline.md`，从目标读者视角审核学习曲线是否合理
- 产出具体改进建议（内联修改 outline.md 或附建议列表）

**Step 1.3 — 向用户展示大纲并请求确认**

将建议合并入大纲后，向用户报告：
```
✅ Phase 1 完成。以下是书籍大纲（共 N 章）：

[展示 outline.md 内容]

请确认是否继续，或提出修改意见。确认后我将进入 Phase 2。
```

**等待用户确认后继续。**

---

### ━━ PHASE 2：共享资源构建 ━━

**目标文件**：`style-guide.md`、`glossary.md`、`metaphor-registry.md`

以主编排身份，基于 `outline.md` 和 `source-map.md` 直接创建：

- `style-guide.md`：根据目标读者定义写作风格（使用 `templates/style-guide.md`）
- `glossary.md`：从 source-map.md 提取核心术语，写初始定义（使用 `templates/glossary.md`）
- `metaphor-registry.md`：初始为空（使用 `templates/metaphor-registry.md`）

完成后更新 checkpoint.md，**直接进入 Phase 3（无需用户确认）**。

---

### ━━ PHASE 3：逐章写作 ━━

**目标文件**：`research/chNN-report.md`、`chapters/chNN-draft.md`

按 `outline.md` 逐章执行，每章两步：

**Step 3.A — 研究员调研**

切换到 `agents/04-researcher.md` 中定义的角色：
```
输入（File Pointers）：
  - source-map.md（第 N 章对应部分）
  - outline.md（第 N 章部分）
  - [第 N 章对应的所有源码文件]

输出：research/chNN-report.md
完成后在文件末尾添加：<!-- RESEARCH_COMPLETE -->
```

**Step 3.B — 作家撰写**

切换到 `agents/05-writer.md` 中定义的角色：
```
输入（File Pointers）：
  - research/chNN-report.md
  - outline.md（第 N 章部分）
  - style-guide.md
  - glossary.md（当前版本）
  - metaphor-registry.md（当前版本）

输出：chapters/chNN-draft.md
完成后：
  - 在文件末尾添加：<!-- DRAFT_COMPLETE -->
  - 将本章新增的比喻追加到 metaphor-registry.md
  - 将新术语追加到 glossary.md
```

**批量执行**：按 outline.md 中的章节顺序循环，每完成一章更新 checkpoint.md。

---

### ━━ PHASE 4：三审并行 ━━

**目标文件**：`reviews/chNN-r1.md`、`reviews/chNN-r2.md`、`reviews/chNN-r3.md`、`chapters/chNN-final.md`

每章草稿完成后，**依次**扮演三个审查员（或提示用户可在三个会话并行加速）：

**R1 — 代码审查员**（切换到 `agents/06-code-reviewer.md`）：
- 检查代码片段准确性、API版本、示例可运行性
- 输出：`reviews/chNN-r1.md`

**R2 — 一致性审查员**（切换到 `agents/07-consistency-reviewer.md`）：
- 读取 `glossary.md`、`metaphor-registry.md`、已完成章节摘要
- 检查跨章术语、比喻、数据一致性
- 输出：`reviews/chNN-r2.md`

**R3 — 内容审查员**（切换到 `agents/08-content-reviewer.md`）：
- 检查可读性、逻辑结构、篇幅合理性
- 输出：`reviews/chNN-r3.md`

**综合修订**（以作家身份）：
- 读取三份审查报告，修订 `chapters/chNN-draft.md`
- 输出：`chapters/chNN-final.md`，末尾添加 `<!-- FINAL_COMPLETE -->`

---

### ━━ PHASE 5：装帧发布 ━━

**目标文件**：`output/book-final.md`（或多文件格式）

所有章节 final 版本完成后，切换到 `agents/10-bookbinder.md` 中定义的角色：
```
输入（File Pointers）：
  - outline.md
  - chapters/ch01-final.md ~ chapters/chNN-final.md
  - style-guide.md

输出：output/book-final.md
```

完成后向用户报告：
```
🎉 书籍编写完成！

产出文件：output/book-final.md
总章节数：N 章
审查轮次：每章经过 R1（代码）+ R2（一致性）+ R3（内容）三重审查

[可附简短统计：总字数估算、关键术语数量等]
```

---

## 进度追踪规则

**每完成一个步骤**必须：
1. 更新 `checkpoint.md` — 勾选对应步骤
2. 向用户打印一行进度消息，格式：`✅ [Phase N · 步骤说明] 完成 → 下一步：[下一步说明]`

**跨 session 恢复**：
- 让用户说"请读 checkpoint.md，继续工作"
- 扫描文件完成标记（`<!-- *_COMPLETE -->`）确认实际进度
- 从断点继续，无需重新执行已完成步骤

---

## Agent 调度格式

在同一会话中扮演不同 Agent 时，使用如下分隔格式（帮助用户理解当前是哪个 Agent 在工作）：

```
═══════════════════════════════════
🎭 切换至：研究员 Agent（agents/04-researcher.md）
═══════════════════════════════════

[Agent 执行内容]

═══════════════════════════════════
🎭 切换回：主编排
═══════════════════════════════════
```

---

## 异常处理

| 情况 | 处理方式 |
|------|----------|
| Agent 产出质量不达标 | 自行以对应 Agent 身份重写，不打扰用户 |
| 源码某模块看不懂 | 在 research report 中标注不确定项，继续执行，最后汇总给用户 |
| 用户中途修改大纲 | 更新 outline.md，检查已完成章节是否需要补充 research，调整 checkpoint.md |
| 连续失败 ≥3 次 | 标记任务为 `blocked`，向用户报告具体问题和建议 |

---

## 文件目录参考

```
你负责创建和管理以下目录结构：

outline.md              ← Phase 1 产出
source-map.md           ← Phase 1 产出
style-guide.md          ← Phase 2 产出
glossary.md             ← Phase 2 产出，Phase 3 持续更新
metaphor-registry.md    ← Phase 2 初始化，Phase 3 持续更新
checkpoint.md           ← 全程维护
research/
  chNN-report.md        ← Phase 3 Step A 产出
chapters/
  chNN-draft.md         ← Phase 3 Step B 产出
  chNN-final.md         ← Phase 4 产出
reviews/
  chNN-r1.md            ← Phase 4 R1 产出
  chNN-r2.md            ← Phase 4 R2 产出
  chNN-r3.md            ← Phase 4 R3 产出
output/
  book-final.md         ← Phase 5 产出

不要修改：
  agents/               ← 框架核心，只读
  framework/            ← 框架核心，只读
  templates/            ← 模板，只读（复制后填写）
```
