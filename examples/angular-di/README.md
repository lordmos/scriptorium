# 示例输出：Angular 依赖注入系统深度解析

> 本目录是 **tech-editorial 框架的演示输出**。我们用框架自身来写了这个示例——就像用一把锤子打造它自己的手柄。

## 这个示例展示了什么

本示例用 tech-editorial 框架，以 [angular/angular](https://github.com/angular/angular) 的依赖注入（DI）系统为题材，展示了框架的实际输出效果：

| 文件 | 对应框架阶段 | 产出 Agent |
|------|------------|-----------|
| `research/ch01-research.md` | Phase 3 Step 1（源码调研） | #3 研究员 Researcher |
| `chapters/ch01.md` | Phase 3 Step 2（章节写作） | #4 作家 Writer |

## 研究阶段产出亮点

研究员 Agent (#3) 从 Angular 源码 commit `4a174b89` 中读取了以下关键文件：

- `packages/core/src/di/r3_injector.ts` — 核心注入器实现（25KB）
- `packages/core/src/di/injection_token.ts` — Token 系统
- `packages/core/src/di/inject_switch.ts` — 注入上下文切换机制
- `packages/core/src/di/interface/provider.ts` — Provider 类型定义
- `packages/core/src/di/interface/defs.ts` — Injectable 声明元数据
- `packages/core/primitives/di/src/injector.ts` — 底层 primitives 层

研究报告包含精确的文件路径和行号引用，记录了 6 层架构、调用链、两个哨兵值（`NOT_YET`/`CIRCULAR`）的设计，以及 5 个"令人意外的实现细节"。

## 写作阶段产出亮点

作家 Agent (#4) 基于研究报告，产出了约 5500 字的中文书章，覆盖：

- 用"城市政府"比喻贯穿全章的叙事结构
- 4000+ 字正文 + 源码片段 + ASCII 架构图
- 完整调用链追踪（`inject()` → `ɵɵinject()` → `R3Injector.get()` → `hydrate()`）
- 一个核心"惊喜"：注入上下文是全局指针 + 保存恢复模式（解释了为何不能跨 `await` 使用）
- 面向 8 年经验开发者的叙事语气，解释"为什么这么设计"而不只是"它是什么"

## 如何运行完整流水线

这个示例只展示了 Phase 3 的前两步。要产出一本完整的书，还需要：
- Step 3: R1+R2+R3 三审并行（见 `agents/06-08-reviewer.md`）
- Step 4: 读者评审团（见 `agents/09-reader-panel.md`）
- Phase 4: 统稿审计
- Phase 5: HTML 装帧发布（见 `agents/10-bookbinder.md`）

## 快速开始你的书

1. 复制 `agents/`, `framework/`, `templates/` 到你的项目
2. 修改 `templates/source-map.md` 指向你的目标源码仓库
3. 按照 `framework/workflow.md` 启动 Phase 1

---
*Generated using [tech-editorial](https://github.com/lordmos/tech-editorial)*
