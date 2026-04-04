# 如何使用 Scriptorium

> 本指南帮助你从零开始，用 Scriptorium 框架完成一本技术书籍的编写。

---

## 前提条件

- 一个 AI 编程助手（推荐 [Claude Code](https://claude.ai/code)、[OpenCode](https://opencode.ai)、[Cursor](https://cursor.sh) 等）
- 一个想写的开源项目源码（如 Spring Framework、Redis、Vue.js……）
- GitHub 账号

---

## 第一步：创建书籍项目

在 GitHub 上点击 **"Use this template"** 创建你的书籍仓库：

```
https://github.com/lordmos/tech-editorial
```

或克隆到本地：

```bash
git clone https://github.com/lordmos/tech-editorial.git my-book
cd my-book
```

然后用 AI 工具打开这个目录（Claude Code / OpenCode / Cursor 均会自动读取 `CLAUDE.md`）。

---

## 第二步：填写项目信息

打开根目录的 `CLAUDE.md`，填写书籍基本信息：

```markdown
## 📖 About This Book Project

- **Book Title**: 《Spring Framework 源码深度解析》
- **Source Project**: spring-projects/spring-framework
- **Target Reader**: 有 3 年以上 Java 经验的后端工程师
- **One-line Description**: 通过阅读 Spring 核心模块源码，理解 IoC/AOP 的设计哲学
```

---

## 第三步：Phase 1 — 大纲定稿

**目标**：确定书籍结构，建立源码映射。

**用 AI 助手执行（复制以下提示词）：**

```
请扮演 agents/02-architect.md 中定义的架构师角色。

上下文：
- 目标书籍：[你的书名]
- 源码仓库：[本地路径或 GitHub URL]
- 目标读者：[读者定位]

任务：
1. 分析源码目录结构，识别核心模块
2. 生成 outline.md（建议 8-12 章，每章附 2-3 句说明）
3. 生成 source-map.md（每章映射到对应源码文件/目录）

输出路径：outline.md、source-map.md
```

验证大纲后，用读者代言人视角再过一遍：

```
请扮演 agents/03-reader-advocate.md 中定义的读者代言人角色。

上下文：outline.md（请读取）
目标读者：[读者定位]

任务：以读者视角审核大纲——学习曲线是否合理？前置知识是否明确？章节顺序是否流畅？
```

**Phase 1 完成标志**：`outline.md` 和 `source-map.md` 已确认。

---

## 第四步：Phase 2 & 3 — 逐章研究 + 写作

每章按顺序执行两个 Agent：

### 研究（Researcher）

```
请扮演 agents/04-researcher.md 中定义的研究员角色。

文件指针：
- source-map.md（第 N 章部分）
- outline.md（第 N 章部分）
- [相关源码文件路径]

任务：对第 N 章「[章节标题]」进行深度源码调研，输出完整的研究报告。
输出路径：research/ch0N-report.md
完成后更新：checkpoint.md
```

### 写作（Writer）

```
请扮演 agents/05-writer.md 中定义的作家角色。

文件指针：
- research/ch0N-report.md
- outline.md（第 N 章部分）
- style-guide.md
- glossary.md
- metaphor-registry.md

任务：基于研究报告，撰写第 N 章完整草稿。
输出路径：chapters/ch0N-draft.md
完成后更新：checkpoint.md、metaphor-registry.md（追加本章新比喻）
```

**批量执行技巧**：告诉 AI 助手"依次处理第 1 章到第 3 章"，它会自动循环。

---

## 第五步：Phase 4 — 三审并行

每章草稿完成后，同时启动三个审查 Agent（可在三个独立会话中并行运行）：

| 审查员 | 提示词起点 | 关注点 |
|--------|-----------|--------|
| R1 代码审查 | `agents/06-code-reviewer.md` | 代码片段准确性、API 版本 |
| R2 一致性审查 | `agents/07-consistency-reviewer.md` | 跨章术语、比喻一致性 |
| R3 内容审查 | `agents/08-content-reviewer.md` | 可读性、逻辑结构、篇幅 |

**三审结束后**，让 AI 综合审查意见修订章节：

```
请综合 reviews/ch0N-r1.md、reviews/ch0N-r2.md、reviews/ch0N-r3.md 中的审查意见，
对 chapters/ch0N-draft.md 进行修订，输出到 chapters/ch0N-final.md。
```

---

## 第六步：Phase 5 — 出版

所有章节定稿后，执行装帧工人：

```
请扮演 agents/10-bookbinder.md 中定义的装帧工人角色。

文件指针：
- outline.md
- chapters/ch01-final.md 至 chapters/chNN-final.md
- style-guide.md

任务：汇总所有章节，生成统一格式的完整书稿。
输出路径：output/book-final.md（或 output/ 目录下的多文件格式）
```

---

## 进度追踪

随时查看 `checkpoint.md` 了解项目进度：

```bash
cat checkpoint.md
```

推荐格式：

```markdown
## 进度总览
- [x] Phase 1: 大纲定稿
- [x] Phase 2: 共享资源构建
- [ ] Phase 3: 逐章写作（3/12 完成）
  - [x] 第 1 章
  - [x] 第 2 章
  - [x] 第 3 章
  - [ ] 第 4 章 ← 下一步
...
```

---

## 小技巧

**💡 随时中断，随时恢复**  
所有状态都在文件里。告诉 AI："请读取 `checkpoint.md`，继续未完成的工作。"

**💡 多窗口并行加速**  
Phase 3 和 Phase 4 的各章之间相互独立，可以在多个 AI 会话里同时进行。  
详见：[DAG 批次执行策略](/framework/parallel-strategy)

**💡 共享文件会随写作演进**  
`glossary.md` 和 `metaphor-registry.md` 在写作过程中持续更新，Writer 每次运行前请确保传入最新版本。

**💡 不要修改 agents/ 和 framework/ 目录**  
这两个目录是框架核心，对书籍项目的所有 Agent 而言均是只读的。

---

## 完整流水线一览

```
Phase 1  大纲定稿     → outline.md + source-map.md
Phase 2  共享资源     → glossary.md + style-guide.md + metaphor-registry.md
Phase 3  逐章写作     → research/ch0N-report.md → chapters/ch0N-draft.md
Phase 4  三审并行     → reviews/ch0N-{r1,r2,r3}.md → chapters/ch0N-final.md
Phase 5  出版         → output/book-final.md
```

> 更多技术细节见：[5阶段生产流水线](/framework/workflow)、[断点恢复](/framework/recovery)
