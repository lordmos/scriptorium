---
layout: home

hero:
  name: "Scriptorium"
  text: "多Agent技术书籍编写框架"
  tagline: 通过 12 个 AI Agent 的协同配合，覆盖从大纲设计到最终出版的全流程。Agent 是无状态的，文件系统是有状态的。
  image:
    src: https://raw.githubusercontent.com/lordmos/tech-editorial/main/.github/assets/hero.svg
    alt: Tech Editorial
  actions:
    - theme: brand
      text: 系统架构 →
      link: /agents/00-system-overview
    - theme: alt
      text: 5阶段流水线
      link: /framework/workflow
    - theme: alt
      text: GitHub
      link: https://github.com/lordmos/tech-editorial

features:
  - icon: 🤖
    title: 12 个专业 Agent
    details: 覆盖编辑部所有角色——主编排、架构师、研究员、作家、三类审查员、读者评审团、装帧工人，职责分明。
  - icon: 📋
    title: 5 阶段生产流水线
    details: 准备 → 研究 → 写作 → 三审并行 → 出版，结构化推进，每阶段都有明确的完成标记和检查点。
  - icon: 🔗
    title: Hub-Spoke 架构
    details: 主编排是唯一枢纽，通过 File Pointers 精确注入上下文，确保信息流向可控、可追溯。
  - icon: 📚
    title: 8 套模板文件
    details: 源码映射、大纲、写作规范、术语表、比喻注册表、章节摘要、进度追踪、审计日志一应俱全。
  - icon: 🌐
    title: 多语言支持
    details: 文档覆盖简体中文、English、日本語、繁體中文四种语言，方便全球开发者使用。
  - icon: 🔄
    title: 断点恢复
    details: 内置容灾机制，通过文件存在性推断项目进度，随时可以从中断处恢复执行。
---
