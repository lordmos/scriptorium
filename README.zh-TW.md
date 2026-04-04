<!--
  Translation status:
  Source file : README.md
  Source commit: 7685751
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **語言 / Language**: [简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · **繁體中文**

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/lordmos/tech-editorial?style=flat-square&color=gold)](https://github.com/lordmos/tech-editorial/stargazers)
[![Forks](https://img.shields.io/github/forks/lordmos/tech-editorial?style=flat-square)](https://github.com/lordmos/tech-editorial/network/members)
[![Last Commit](https://img.shields.io/github/last-commit/lordmos/tech-editorial?style=flat-square)](https://github.com/lordmos/tech-editorial/commits)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Multi-Agent](https://img.shields.io/badge/Multi--Agent-12%20Agents-blueviolet?style=flat-square)]()
[![Docs](https://img.shields.io/badge/文件站-在線閱讀-4a9eff?style=flat-square&logo=vitepress&logoColor=white)](https://lordmos.github.io/tech-editorial/zh-TW/)

# 📚 Scriptorium — 技術書籍多Agent編輯部框架

> **"源碼閱讀系列"技術書籍的多Agent協作編寫框架**

## 1. 框架簡介

本框架爲"源碼閱讀系列"技術書籍提供一套完整的多Agent編輯部工作流。通過 **12 個 AI Agent** 的協同配合，覆蓋從大綱設計到最終出版的全流程。

核心理念：

> **Agent 是無狀態的，文件系統是有狀態的。**

每個 Agent 都是一次性工人——它不記住上次做了什麼，所有的"記憶"都存儲在共享文件系統中。主編排 Agent 通過 **File Pointers**（文件路徑引用）精確注入每個 Agent 所需的上下文，確保信息流向可控、可追溯。

---

## 2. 快速開始

📖 **完整操作指南（含逐步 Agent 呼叫提示詞）→ [線上文件](https://lordmos.github.io/tech-editorial/zh-TW/quick-start)**

五個階段，直接使用對應 Agent 規格檔案啟動 AI 助手：

| 階段 | 任務 | Agent 規格 |
|------|------|-----------|
| Phase 1 | 大綱定稿 | [`agents/02-architect.md`](agents/02-architect.md)、[`agents/03-reader-advocate.md`](agents/03-reader-advocate.md) |
| Phase 2 | 共享資源建構 | [`agents/01-orchestrator.md`](agents/01-orchestrator.md) |
| Phase 3 | 逐章寫作 | [`agents/04-researcher.md`](agents/04-researcher.md)、[`agents/05-writer.md`](agents/05-writer.md) |
| Phase 4 | 三審並行 | [`agents/06-code-reviewer.md`](agents/06-code-reviewer.md)、[`agents/07-consistency-reviewer.md`](agents/07-consistency-reviewer.md)、[`agents/08-content-reviewer.md`](agents/08-content-reviewer.md) |
| Phase 5 | 裝幀發布 | [`agents/10-bookbinder.md`](agents/10-bookbinder.md) |

進度追蹤：[`templates/checkpoint.md`](templates/checkpoint.md)　　斷點恢復：[`framework/recovery.md`](framework/recovery.md)

**中斷後恢復**：告訴 AI 助手 → `請讀 checkpoint.md，繼續上次未完成的工作。`



本框架適用於以下類型的技術書籍項目：

- ✅ **閱讀開源項目源碼** 類型的技術書籍（如《{{項目名稱}}源碼深度解析》）
- ✅ 需要逐章拆解大型代碼倉庫的架構分析書籍
- ✅ 面向多層次讀者（學生、工程師、愛好者）的技術科普
- ✅ 需要多人協作、流程可控的長篇技術寫作項目

**不適用於**：純理論教材、API 參考文檔、短篇技術博客。

---

## 4. 系統架構概覽

本框架採用 **Hub-Spoke（軸輻式）架構**：

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

- **主編排 Agent（#0）** 是唯一的調度中心，所有子 Agent 只與主編排通信
- 子 Agent 之間 **不直接對話**，通過共享文件系統傳遞信息
- 主編排通過 **File Pointers** 精確控制每個 Agent 的讀寫範圍，避免信息過載

---

## 5. Agent 團隊一覽表

| 編號 | 名稱 | 角色隱喻 | Agent 類型 | 職責 |
|------|------|----------|-----------|------|
| #0 | 主編排 Orchestrator | 總導演 | general-purpose | 調度全流程，管理進度與依賴 |
| #1 | 架構師 Architect | 技術總監 | general-purpose | 設計書籍大綱與知識圖譜 |
| #2 | 讀者代言人 Reader Advocate | 產品經理 | general-purpose | 從讀者視角審覈大綱的合理性 |
| #3 | 研究員 Researcher | 源碼考古學家 | explore | 深度調研源碼，產出研究報告 |
| #4 | 作家 Writer | 暢銷書作者 | general-purpose | 撰寫章節正文 |
| R1 | 源碼審查員 Code Reviewer | 代碼考據專家 | explore | 驗證章節中所有代碼引用的技術準確性 |
| R2 | 一致性審查員 Consistency Reviewer | 記憶管理員 | explore | 檢查跨章術語、數據、邏輯的一致性 |
| R3 | 內容審查員 Content Reviewer | 資深編輯 | general-purpose | 審覈可讀性、結構完整性與敏感性 |
| RS | 大學生讀者 | 計算機專業大三學生 | general-purpose | 模擬初學者視角的閱讀評審 |
| RE | 工程師讀者 | 8年經驗全棧工程師 | general-purpose | 模擬專業開發者視角的閱讀評審 |
| RH | 愛好者讀者 | 無技術背景科技愛好者 | general-purpose | 模擬非技術讀者視角的閱讀評審 |
| #11 | 裝幀工人 Bookbinder | 排版設計師 | general-purpose | Markdown→HTML 出版流水線 |

---

## 6. 五階段工作流概覽

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 5
大纲定稿    共享资源     逐章写作    统稿审计    装帧发布
            构建
```

### Phase 1：大綱定稿

**參與 Agent**：#1 架構師、#2 讀者代言人、R3 內容審查員

架構師根據源碼結構設計章節大綱與知識圖譜，讀者代言人從目標讀者視角提出修改建議，內容審查員對大綱進行初步審覈。最終產出經用戶審批的 `outline.md`。

### Phase 2：共享資源構建

**參與 Agent**：#0 主編排（直接執行）

基於定稿的大綱，構建所有 Agent 後續需要的共享資源文件：

- `source-map.md` — 源碼目錄結構與核心模塊說明
- `glossary.md` — 全書統一術語表
- `metaphor-registry.md` — 比喻註冊表（避免跨章比喻衝突）
- `style-guide.md` — 寫作風格指南
- `cross-references.md` — 跨章引用登記表

### Phase 3：逐章寫作（×{{章節數}}章）

每章依次經過 4 個步驟：

| 步驟 | Agent | 產出 |
|------|-------|------|
| Step 1 源碼調研 | #3 研究員 | `research/chXX-research.md` |
| Step 2 章節撰寫 | #4 作家 | `chapters/chXX.md` |
| Step 3 三員審查 | R1 + R2 + R3（並行） | 各自的審查報告 |
| Step 4 讀者評審 | RS + RE + RH（並行） | 各自的評審反饋 |

> 💡 **並行優化**：Step 3 的三位審查員可同時工作（數據依賴不同）；Step 4 的三位讀者評審同樣可並行。多章之間也可分批並行（如每批 {{並行批次數}} 章）。

### Phase 4：統稿審計

**參與 Agent**：#0 主編排、R1 + R2 + R3（複審）

對全書進行最終審計：術語一致性、跨章引用完整性、代碼片段準確性、整體敘事連貫性。

### Phase 5：裝幀發佈

**參與 Agent**：#11 裝幀工人

執行 Markdown→HTML 轉換、**Mermaid 圖表渲染**（通過 Mermaid.js）、ASCII 圖→SVG 渲染（兼容存量內容）、目錄生成、樣式應用。產出可發佈的靜態網站。

---

## 7. 目錄結構

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

### 子目錄說明

| 目錄 | 用途 |
|------|------|
| `agents/` | 每個 Agent 的完整規格說明：系統提示詞模板、輸入/輸出規範、File Pointers 清單、質量檢查點 |
| `framework/` | 與具體 Agent 無關的通用工作流文檔：階段劃分、審查協議、文件格式規範、協作機制 |
| `templates/` | 新項目啓動時需要填寫的模板文件，包含 `{{變量}}` 佔位符，填寫後即成爲項目共享資源 |

---

## 8. 核心設計原則

### 原則 1：Agent 無狀態，文件系統有狀態

每個 Agent 在每次調用時都是"全新的"——它不記住之前的對話。所有需要跨調用保留的信息（進度、審查結果、術語表……）都必須寫入文件系統。這使得：
- 任何 Agent 實例都可以被替換
- 故障恢復只需重新調用，無需回溯對話歷史

### 原則 2：所有 Agent 只與主編排通信（Hub-Spoke）

子 Agent 之間不直接交互。主編排是唯一的調度中心，負責：
- 決定調用哪個 Agent
- 通過 File Pointers 注入所需上下文
- 收集產出並決定下一步

### 原則 3：File Pointers 精確控制讀寫範圍

每個 Agent 被明確告知：
- **必讀文件**：執行任務前必須閱讀的文件列表
- **可寫文件**：允許寫入/修改的文件路徑
- **禁寫文件**：不得修改的文件列表

這避免了 Agent 因信息過載而產出低質量結果，也防止了誤寫。

### 原則 4：長記憶通過共享文件實現跨 Agent 信息傳遞

Agent A 的產出寫入文件 → 主編排將該文件作爲 File Pointer 注入給 Agent B → Agent B 獲得 Agent A 的"記憶"。典型的共享文件包括：
- `chapter-summaries.md` — 已完成章節的摘要
- `glossary.md` — 全書術語表
- `metaphor-registry.md` — 已使用的比喻登記
- `cross-references.md` — 跨章引用關係

### 原則 5：審查與寫作分離，支持並行

三位審查員（R1 源碼、R2 一致性、R3 內容）檢查的維度不同，數據依賴不重疊，因此可以 **並行執行**。同理，三位讀者評審（RS/RE/RH）也可並行。這顯著縮短了每章的處理時間。

### 原則 6：斷點可恢復

文件系統的狀態完整反映了項目進度。如果流程中斷（Agent 故障、人工暫停等），主編排可以通過檢查已有文件推斷當前進度，從斷點繼續，無需從頭開始。

---

## 9. 技能要求

使用本框架需要以下知識和能力：

| 技能領域 | 具體要求 | 重要程度 |
|---------|---------|---------|
| AI Agent Prompt 工程 | 瞭解如何編寫系統提示詞、調整 Agent 行爲（如 Claude、GPT 等） | ⭐⭐⭐ 必需 |
| 目標源碼語言 | 熟悉目標開源項目所用的編程語言（如 {{編程語言}}） | ⭐⭐⭐ 必需 |
| 項目管理 | 依賴分析、進度追蹤、任務分解；理解 DAG（有向無環圖）式的工作流 | ⭐⭐ 重要 |
| Markdown 寫作 | 熟練使用 Markdown 語法，理解文檔結構化寫作 | ⭐⭐ 重要 |
| Node.js 基礎 | 用於 Phase 5 裝幀構建腳本（Markdown→HTML 轉換、靜態站點生成） | ⭐ 可選 |

---

---

## 🎯 使用本框架的項目

> 你用本框架寫了什麼？[告訴我們！](https://github.com/lordmos/tech-editorial/issues/new?template=show_your_book.yml)

| 書名 / Book Title | 目標源碼 | 作者 |
|------------------|---------|------|
| [Angular 依賴注入系統深度解析（示例）](examples/angular-di/) | [angular/angular](https://github.com/angular/angular) | [@lordmos](https://github.com/lordmos) |

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=lordmos/tech-editorial&type=Date)](https://star-history.com/#lordmos/tech-editorial&Date)

---

## 💖 支持本項目

如果本框架爲你節省了時間，歡迎請作者喝杯咖啡 ☕

| 平臺 | 鏈接 |
|------|------|
| 愛發電（國內） | [afdian.com/@lordmos](https://afdian.com/a/lordmos) |
<!-- | Ko-fi（國際） | [ko-fi.com/lordmos](https://ko-fi.com/lordmos) | -->
<!-- | 微信 / 支付寶 | <details><summary>掃碼支付</summary>（請將收款碼圖片放在 `assets/wechat-pay.png` 和 `assets/alipay.png`）</details> | -->

---

## 許可與致謝

本框架提取自一個真實的多Agent協作寫書項目，經過抽象化處理，去除了所有項目特定內容，保留了可複用的工作流與架構設計。

歡迎根據你的項目需求自由修改和擴展。
