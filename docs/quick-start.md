# 如何使用 Scriptorium

> 你不需要手动调用每一个 Agent。一句话启动，AI 自动完成所有工作。

---

## 三步上手

### 第一步：创建书籍项目

点击 GitHub 上的 **"Use this template"** 创建你的书籍仓库：

```
https://github.com/lordmos/scriptorium
```

### 第二步：准备源码

把你想写的开源项目源码放到仓库目录中（或记下它的路径）。

用 AI 工具打开这个目录（[Claude Code](https://claude.ai/code)、[OpenCode](https://opencode.ai)、[Cursor](https://cursor.sh) 均可）。

### 第三步：说这一句话

```
[项目名] 的源码在 [目录路径]。请读 QUICK_START.md，然后向我提问。
没有问题就开始你的工作。
```

**就这些。** AI 助手会自动：

1. 读取 `QUICK_START.md` 了解完整工作指南
2. 向你确认书名、目标读者等基本信息
3. 扮演架构师分析源码、生成大纲
4. 向你展示大纲，请求确认
5. 自主运行 Phase 2→5，逐章完成研究、写作、三重审查
6. 最终交付完整书稿

---

## 唯一需要你做的事

| 时间点 | 你的操作 |
|--------|---------|
| 启动时 | 回答 AI 的基本问题（书名、读者等） |
| Phase 1 结束 | 确认或修改大纲 |
| 全部完成 | 查看 `output/book-final.md` |

---

## 中断后恢复

随时可以暂停，下次打开告诉 AI：

```
请读 checkpoint.md，继续上次未完成的工作。
```

---

## 深入了解

| 文档 | 内容 |
|------|------|
| [`QUICK_START.md`](https://github.com/lordmos/scriptorium/blob/main/QUICK_START.md) | AI 编排入口文件（机器可读） |
| [`agents/00-system-overview.md`](/agents/00-system-overview) | 12 个 Agent 的完整规格 |
| [`framework/workflow.md`](/framework/workflow) | 五阶段流水线详解 |
| [`framework/parallel-strategy.md`](/framework/parallel-strategy) | 多窗口并行加速 |
| [`framework/recovery.md`](/framework/recovery) | 断点恢复机制 |

