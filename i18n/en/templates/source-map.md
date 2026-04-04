<!--
  Translation status:
  Source file : templates/source-map.md
  Source commit: b016f9b
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **Languages**: [简体中文](../../../templates/source-map.md) · **English** · [日本語](../../ja/templates/source-map.md) · [繁體中文](../../zh-TW/templates/source-map.md)

---

<!--
  ╔══════════════════════════════════════════════════════════════╗
  ║  Source Map Template                                         ║
  ║                                                              ║
  ║  Purpose: Maps the files and directories of the source code  ║
  ║           project to chapters in the book, making clear      ║
  ║           which source files each chapter needs to analyze,  ║
  ║           and avoiding gaps or duplicated coverage.          ║
  ║                                                              ║
  ║  Usage:                                                      ║
  ║  1. First browse the source project's directory structure    ║
  ║     to understand the overall architecture                   ║
  ║  2. Based on chapter divisions in outline.md, assign source  ║
  ║     files to each chapter                                    ║
  ║  3. Mark the importance of each file to help Writer Agents   ║
  ║     determine depth of coverage                              ║
  ║  4. Update promptly if mappings need adjustment during       ║
  ║     writing                                                  ║
  ║                                                              ║
  ║  Relationship with outline.md:                               ║
  ║  outline.md defines "what each chapter covers";              ║
  ║  this file defines "which code each chapter examines."       ║
  ╚══════════════════════════════════════════════════════════════╝
-->

# {{书名}} Source Map

## Project Information

| Attribute | Value |
|------|-----|
| Project Name | {{项目名}} |
| Version / Commit | {{版本号或commit hash}} |
| Repository URL | {{仓库URL}} |
| Primary Language | {{编程语言}} |
| Total Files | {{约N个}} |
| Files Covered by This Book | {{约N个}} |

## Project Directory Overview

<!-- 
列出源码项目的顶层目录结构，标注每个目录的用途。
这帮助读者和作家Agent快速理解项目的组织方式。
-->

```
{{项目名}}/
├── {{目录1}}/          # {{用途说明，如"核心源码"}}
│   ├── {{子目录1}}/    # {{用途说明}}
│   └── {{子目录2}}/    # {{用途说明}}
├── {{目录2}}/          # {{用途说明，如"测试文件"}}
├── {{目录3}}/          # {{用途说明，如"配置文件"}}
├── {{入口文件}}        # {{用途说明，如"项目入口"}}
└── {{配置文件}}        # {{用途说明，如"包管理配置"}}
```

<!-- 示例：
```
express/
├── lib/                # 核心源码
│   ├── middleware/      # 内置中间件
│   ├── router/          # 路由系统
│   ├── application.js   # Express应用类
│   ├── express.js       # 模块入口
│   ├── request.js       # 请求对象扩展
│   ├── response.js      # 响应对象扩展
│   └── view.js          # 视图引擎
├── test/               # 测试文件
├── examples/           # 使用示例
├── index.js            # 包入口
└── package.json        # 包配置
```
-->

## Source Mapping Table

<!--
重要度说明：
  高 = 本章核心，需要逐行分析，代码会大段引用
  中 = 需要理解其作用，代码选择性引用
  低 = 提及即可，或仅作为背景知识，代码极少引用

备注中可以说明：
  - 重点关注哪些函数/类/方法
  - 该文件与本章主题的关系
  - 哪些部分可以跳过
-->

### Part One: {{部分标题}}

> {{What problem does this part solve, and which layer of the project does it cover}}

#### Chapter 1: {{章标题}}

| Source Path | Core File | Importance | Notes |
|----------|----------|--------|------|
| {{目录/文件路径}} | {{具体文件名}} | High | {{Key functions/classes to focus on}} |
| {{目录/文件路径}} | {{具体文件名}} | Medium | {{Focus points}} |
| {{目录/文件路径}} | {{具体文件名}} | Low | {{Mentioned only as background}} |

<!-- 示例：
| 源码路径 | 核心文件 | 重要度 | 备注 |
|----------|----------|--------|------|
| lib/ | express.js | 高 | 重点：createApplication()工厂函数，mixin模式 |
| lib/ | application.js | 高 | 重点：app.init()，app.use()，app.listen() |
| / | index.js | 低 | 仅1行，导出lib/express.js |
| / | package.json | 低 | 了解依赖项即可 |
-->

#### Chapter 2: {{章标题}}

| Source Path | Core File | Importance | Notes |
|----------|----------|--------|------|
| {{目录/文件路径}} | {{具体文件名}} | {{High/Medium/Low}} | {{备注}} |

### Part Two: {{部分标题}}

> {{What problem does this part solve}}

#### Chapter 3: {{章标题}}

| Source Path | Core File | Importance | Notes |
|----------|----------|--------|------|
| {{目录/文件路径}} | {{具体文件名}} | {{High/Medium/Low}} | {{备注}} |

#### Chapter 4: {{章标题}}

| Source Path | Core File | Importance | Notes |
|----------|----------|--------|------|
| {{目录/文件路径}} | {{具体文件名}} | {{High/Medium/Low}} | {{备注}} |

<!-- 根据实际章节数继续添加... -->

### Part Three: {{部分标题}}

> {{What problem does this part solve}}

<!-- 继续添加章节映射... -->

## Uncovered Files

<!-- 
列出项目中本书 **不打算覆盖** 的文件/目录，并说明原因。
这帮助审查Agent确认是否有意遗漏，还是不小心漏掉了。
-->

| File / Directory | Reason Not Covered |
|-----------|-------------|
| {{路径}} | {{Reason, e.g. "test files, out of scope for this book"}} |
| {{路径}} | {{Reason, e.g. "build configuration, unrelated to core logic"}} |
| {{路径}} | {{Reason, e.g. "deprecated compatibility shim"}} |

## Cross-Chapter Shared Files

<!-- 
有些文件会在多个章节中被引用（从不同角度分析）。
在这里标注，避免章节间内容重复。
-->

| File | Referenced In | Focus of Each Chapter |
|------|----------|-----------|
| {{文件路径}} | ch{{A}}, ch{{B}} | ch{{A}}: {{Focus A}}; ch{{B}}: {{Focus B}} |

<!-- 示例：
| 文件 | 引用章节 | 各章关注点 |
|------|----------|-----------|
| lib/application.js | ch01, ch03, ch05 | ch01: 整体结构; ch03: app.use()路由注册; ch05: 错误处理机制 |
-->

## Code Volume Statistics

<!-- 可选：帮助评估各章的工作量 -->

| Chapter | Files Covered | Total Lines (approx.) | Core Lines (approx.) |
|------|-----------|---------------|-----------------|
| ch01 | {{N}} | {{N}} | {{N}} |
| ch02 | {{N}} | {{N}} | {{N}} |
