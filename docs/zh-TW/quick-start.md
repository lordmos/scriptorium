# 如何使用 Scriptorium

> 本指南幫助你從零開始，用 Scriptorium 框架完成一本技術書籍的編寫。

---

## 前提條件

- 一個 AI 程式設計助手（推薦 [Claude Code](https://claude.ai/code)、[OpenCode](https://opencode.ai)、[Cursor](https://cursor.sh) 等）
- 一個想寫的開源專案原始碼（如 Spring Framework、Redis、Vue.js……）
- GitHub 帳號

---

## 第一步：建立書籍專案

在 GitHub 上點擊 **"Use this template"** 建立你的書籍儲存庫：

```
https://github.com/lordmos/tech-editorial
```

或複製到本地：

```bash
git clone https://github.com/lordmos/tech-editorial.git my-book
cd my-book
```

然後用 AI 工具開啟這個目錄（Claude Code / OpenCode / Cursor 均會自動讀取 `CLAUDE.md`）。

---

## 第二步：填寫專案資訊

開啟根目錄的 `CLAUDE.md`，填寫書籍基本資訊：

```markdown
## 📖 About This Book Project

- **Book Title**: 《Spring Framework 原始碼深度解析》
- **Source Project**: spring-projects/spring-framework
- **Target Reader**: 有 3 年以上 Java 經驗的後端工程師
- **One-line Description**: 透過閱讀 Spring 核心模組原始碼，理解 IoC/AOP 的設計哲學
```

---

## 第三步：Phase 1 — 大綱定稿

**目標**：確定書籍結構，建立原始碼映射。

**用 AI 助手執行（複製以下提示詞）：**

```
請扮演 agents/02-architect.md 中定義的架構師角色。

上下文：
- 目標書籍：[你的書名]
- 原始碼儲存庫：[本地路徑或 GitHub URL]
- 目標讀者：[讀者定位]

任務：
1. 分析原始碼目錄結構，識別核心模組
2. 生成 outline.md（建議 8-12 章，每章附 2-3 句說明）
3. 生成 source-map.md（每章映射到對應原始碼檔案/目錄）

輸出路徑：outline.md、source-map.md
```

驗證大綱後，用讀者代言人視角再過一遍：

```
請扮演 agents/03-reader-advocate.md 中定義的讀者代言人角色。

上下文：outline.md（請讀取）
目標讀者：[讀者定位]

任務：以讀者視角審核大綱——學習曲線是否合理？前置知識是否明確？章節順序是否流暢？
```

**Phase 1 完成標誌**：`outline.md` 和 `source-map.md` 已確認。

---

## 第四步：Phase 2 & 3 — 逐章研究 + 寫作

每章按順序執行兩個 Agent：

### 研究（Researcher）

```
請扮演 agents/04-researcher.md 中定義的研究員角色。

檔案指標：
- source-map.md（第 N 章部分）
- outline.md（第 N 章部分）
- [相關原始碼檔案路徑]

任務：對第 N 章「[章節標題]」進行深度原始碼調研，輸出完整的研究報告。
輸出路徑：research/ch0N-report.md
完成後更新：checkpoint.md
```

### 寫作（Writer）

```
請扮演 agents/05-writer.md 中定義的作家角色。

檔案指標：
- research/ch0N-report.md
- outline.md（第 N 章部分）
- style-guide.md
- glossary.md
- metaphor-registry.md

任務：基於研究報告，撰寫第 N 章完整草稿。
輸出路徑：chapters/ch0N-draft.md
完成後更新：checkpoint.md、metaphor-registry.md（追加本章新比喻）
```

**批次執行技巧**：告訴 AI 助手「依次處理第 1 章到第 3 章」，它會自動循環。

---

## 第五步：Phase 4 — 三審並行

每章草稿完成後，同時啟動三個審查 Agent（可在三個獨立會話中並行運行）：

| 審查員 | 提示詞起點 | 關注點 |
|--------|-----------|--------|
| R1 程式碼審查 | `agents/06-code-reviewer.md` | 程式碼片段準確性、API 版本 |
| R2 一致性審查 | `agents/07-consistency-reviewer.md` | 跨章術語、比喻一致性 |
| R3 內容審查 | `agents/08-content-reviewer.md` | 可讀性、邏輯結構、篇幅 |

**三審結束後**，讓 AI 綜合審查意見修訂章節：

```
請綜合 reviews/ch0N-r1.md、reviews/ch0N-r2.md、reviews/ch0N-r3.md 中的審查意見，
對 chapters/ch0N-draft.md 進行修訂，輸出到 chapters/ch0N-final.md。
```

---

## 第六步：Phase 5 — 出版

所有章節定稿後，執行裝幀工人：

```
請扮演 agents/10-bookbinder.md 中定義的裝幀工人角色。

檔案指標：
- outline.md
- chapters/ch01-final.md 至 chapters/chNN-final.md
- style-guide.md

任務：彙總所有章節，生成統一格式的完整書稿。
輸出路徑：output/book-final.md（或 output/ 目錄下的多檔案格式）
```

---

## 進度追蹤

隨時查看 `checkpoint.md` 了解專案進度：

```bash
cat checkpoint.md
```

推薦格式：

```markdown
## 進度總覽
- [x] Phase 1: 大綱定稿
- [x] Phase 2: 共享資源建構
- [ ] Phase 3: 逐章寫作（3/12 完成）
  - [x] 第 1 章
  - [x] 第 2 章
  - [x] 第 3 章
  - [ ] 第 4 章 ← 下一步
...
```

---

## 小技巧

**💡 隨時中斷，隨時恢復**  
所有狀態都在檔案裡。告訴 AI：「請讀取 `checkpoint.md`，繼續未完成的工作。」

**💡 多視窗並行加速**  
Phase 3 和 Phase 4 的各章之間相互獨立，可以在多個 AI 會話裡同時進行。  
詳見：[DAG 批次執行策略](/zh-TW/framework/parallel-strategy)

**💡 共享檔案會隨寫作演進**  
`glossary.md` 和 `metaphor-registry.md` 在寫作過程中持續更新，Writer 每次執行前請確保傳入最新版本。

**💡 不要修改 agents/ 和 framework/ 目錄**  
這兩個目錄是框架核心，對書籍專案的所有 Agent 而言均是唯讀的。

---

## 完整流水線一覽

```
Phase 1  大綱定稿     → outline.md + source-map.md
Phase 2  共享資源     → glossary.md + style-guide.md + metaphor-registry.md
Phase 3  逐章寫作     → research/ch0N-report.md → chapters/ch0N-draft.md
Phase 4  三審並行     → reviews/ch0N-{r1,r2,r3}.md → chapters/ch0N-final.md
Phase 5  出版         → output/book-final.md
```

> 更多技術細節見：[5階段生產流水線](/zh-TW/framework/workflow)、[斷點恢復](/zh-TW/framework/recovery)
