<!--
  Translation status:
  Source file : agents/00-system-overview.md
  Source commit: 7685751
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **語言 / Language**: [简体中文](../../../agents/00-system-overview.md) · [English](../../en/agents/00-system-overview.md) · [日本語](../../ja/agents/00-system-overview.md) · **繁體中文**

---

# 🏗️ 系統架構與Agent註冊表

> 本文檔是多Agent編輯部的系統級架構說明，定義了所有Agent的註冊信息、交互關係與信息流向規則。

---

## 1. 系統哲學

### Agent 是無狀態的一次性工人

在本框架中，每個 Agent 都被視爲 **無狀態的一次性工人**：

- **無記憶**：Agent 不保留前次調用的任何上下文。每次啓動都是一張白紙。
- **無自主權**：Agent 不決定自己何時工作、做什麼。一切由主編排調度。
- **可替換**：任何 Agent 實例都可以被同類型的新實例替換，只要輸入（File Pointers）相同，產出就應一致。

### 所有記憶存儲在磁盤共享文件中

Agent 之間的"記憶傳遞"完全通過文件系統實現：

```
Agent A 产出 → 写入文件 → 主编排注入文件路径给 Agent B → Agent B 读取 → 获得"记忆"
```

這與現代微服務架構的理念一致：
- 服務（Agent）本身無狀態，狀態存儲在外部（文件系統）
- 服務之間通過消息（File Pointers）通信，而非直接調用
- 編排器（Orchestrator）負責服務發現與調度

### 主編排通過 File Pointers 注入上下文

**File Pointers** 是主編排控制 Agent 行爲的核心機制：

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

File Pointers 的價值：
- **精確控制信息範圍**：Agent 只看到它需要的信息，避免上下文窗口浪費
- **明確讀寫邊界**：每個 Agent 知道自己能讀什麼、該寫什麼
- **可追溯性**：通過 File Pointers 清單，可以重建任何 Agent 調用時的完整上下文

---

## 2. Agent 註冊表

### 核心創作組

| 編號 | 名稱 | 角色隱喻 | Agent 類型 | 職責 | 詳細文檔 |
|------|------|----------|-----------|------|---------|
| #0 | 主編排 Orchestrator | 總導演 | `general-purpose` | 調度全流程，管理進度與依賴，通過 File Pointers 注入上下文 | [→ 01-orchestrator.md](./01-orchestrator.md) |
| #1 | 架構師 Architect | 技術總監 | `general-purpose` | 分析源碼結構，設計章節大綱與知識圖譜，規劃章節間依賴關係 | [→ 02-architect.md](./02-architect.md) |
| #2 | 讀者代言人 Reader Advocate | 產品經理 | `general-purpose` | 從目標讀者視角審覈大綱，確保章節順序符合學習曲線 | [→ 03-reader-advocate.md](./03-reader-advocate.md) |
| #3 | 研究員 Researcher | 源碼考古學家 | `explore` | 深度調研指定章節涉及的源碼模塊，產出結構化研究報告 | [→ 04-researcher.md](./04-researcher.md) |
| #4 | 作家 Writer | 暢銷書作者 | `general-purpose` | 基於研究報告和風格指南撰寫章節正文 | [→ 05-writer.md](./05-writer.md) |

### 審查組

| 編號 | 名稱 | 角色隱喻 | Agent 類型 | 職責 | 詳細文檔 |
|------|------|----------|-----------|------|---------|
| R1 | 源碼審查員 Code Reviewer | 代碼考據專家 | `explore` | 驗證章節中每個代碼引用的準確性：文件路徑、函數簽名、行爲描述 | [→ 06-code-reviewer.md](./06-code-reviewer.md) |
| R2 | 一致性審查員 Consistency Reviewer | 記憶管理員 | `explore` | 檢查跨章術語統一性、數據一致性、交叉引用完整性 | [→ 07-consistency-reviewer.md](./07-consistency-reviewer.md) |
| R3 | 內容審查員 Content Reviewer | 資深編輯 | `general-purpose` | 審覈可讀性、敘事結構、敏感內容，確保符合風格指南 | [→ 08-content-reviewer.md](./08-content-reviewer.md) |

### 讀者評審團

| 編號 | 名稱 | 角色隱喻 | Agent 類型 | 職責 | 詳細文檔 |
|------|------|----------|-----------|------|---------|
| RS | 大學生讀者 | 計算機專業大三學生 | `general-purpose` | 模擬初學者視角：標記看不懂的術語、缺失的背景知識、跳躍的邏輯 | [→ 09-reader-panel.md](./09-reader-panel.md) |
| RE | 工程師讀者 | 8年經驗全棧工程師 | `general-purpose` | 模擬專業開發者視角：評價技術深度、實用性、是否有新收穫 | [→ 09-reader-panel.md](./09-reader-panel.md) |
| RH | 愛好者讀者 | 無技術背景科技愛好者 | `general-purpose` | 模擬非技術讀者視角：檢驗比喻是否生動、概念解釋是否通俗 | [→ 09-reader-panel.md](./09-reader-panel.md) |

### 出版組

| 編號 | 名稱 | 角色隱喻 | Agent 類型 | 職責 | 詳細文檔 |
|------|------|----------|-----------|------|---------|
| #11 | 裝幀工人 Bookbinder | 排版設計師 | `general-purpose` | Markdown→HTML 轉換，Mermaid 圖渲染，ASCII 圖→SVG 渲染，零依賴構建腳本 | [→ 10-bookbinder.md](./10-bookbinder.md) |
| #12 | 品質檢查員 Quality Inspector | 出廠檢驗師 | `general-purpose` | EPUB 產出物 7 項程序化品質檢查（ZIP 結構 / XML 有效性 / SVG 顏色 / CSS 合規 / 標題一致 / 封面 / 導航），路由修復工單 | [→ 11-quality-inspector.md](./11-quality-inspector.md) |

---

## 3. 交互關係圖

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
  │  Phase 5  HTML 裝幀與發布                                   │
  │  ┌─────────────┐                                            │
  │  │ 📚 #11      │  Markdown→HTML · ASCII→SVG                │
  │  │ 裝幀工人    │  零依賴構建腳本                            │
  │  │ Bookbinder  │                                            │
  │  └──────┬──────┘                                            │
  │         │ EPUB 產出物                                       │
  │  ┌──────▼──────┐                                            │
  │  │ 🔍 #12      │  7 項程序化品質檢查                        │
  │  │ 品質檢查員  │  ZIP/XML/SVG 色/CSS/標題/封面/導航         │
  │  │ Inspector   │  路由修復工單 → #11 或 #4                  │
  │  └─────────────┘                                            │
  └─────────────────────────────────────────────────────────────┘
  圖例: #N = Agent 編號  R1/R2/R3 = 審查員  RS/RE/RH = 讀者評審員
```

### 架構解讀

**Hub-Spoke 模式**：主編排（#0）是唯一的 Hub，所有其他 Agent 都是 Spoke。這意味着：

1. **無環依賴**：信息流是單向的（主編排→Agent→文件→主編排），不存在 Agent 之間的循環調用
2. **故障隔離**：任何一個 Spoke Agent 的失敗隻影響當前任務，不會級聯到其他 Agent
3. **可觀測性**：所有調度決策都在主編排中，便於日誌記錄和調試

**並行點**：
- Phase 3 Step 3：R1、R2、R3 三位審查員並行（檢查維度正交）
- Phase 3 Step 4：RS、RE、RH 三位讀者並行（評審視角獨立）
- Phase 3 章間：不同章節的 Step 1（研究）可與已完成研究的章節的 Step 2（寫作）並行

---

## 4. 信息流向規則

### 規則 1：單向通信 — 所有指令從主編排發出

```
✅ 主编排 → Agent      （通过 File Pointers 注入任务）
✅ Agent → 文件系统     （写入产出物）
✅ 主编排 ← 文件系统    （读取产出物，决定下一步）
❌ Agent → Agent        （禁止直接通信）
❌ Agent → 主编排       （Agent 不主动发起请求）
```

Agent 不知道其他 Agent 的存在。它只看到主編排提供的文件，完成任務後寫入結果。

### 規則 2：File Pointers 遵循最小權限原則

每個 Agent 只獲得完成當前任務 **最少量** 的文件引用：

| Agent | 典型必讀文件 | 典型輸出文件 |
|-------|-------------|-------------|
| #3 研究員 | `outline.md`（當前章節部分）、`source-map.md`、`glossary.md` | `research/chXX-research.md` |
| #4 作家 | `research/chXX-research.md`、`style-guide.md`、`chapter-summaries.md`、`metaphor-registry.md` | `chapters/chXX.md` |
| R1 源碼審查員 | `chapters/chXX.md`、源碼文件（按需） | `reviews/chXX-code-review.md` |
| R2 一致性審查員 | `chapters/chXX.md`、`glossary.md`、`chapter-summaries.md`、`cross-references.md` | `reviews/chXX-consistency-review.md` |
| R3 內容審查員 | `chapters/chXX.md`、`style-guide.md` | `reviews/chXX-content-review.md` |

> 💡 作家 **不** 獲得其他章節的完整正文（避免上下文窗口浪費），只獲得 `chapter-summaries.md` 中的摘要。

### 規則 3：共享文件是 Agent 間唯一的信息橋樑

以下共享文件構成了 Agent 之間的"長期記憶"：

| 共享文件 | 寫入者 | 讀取者 | 用途 |
|---------|-------|--------|------|
| `source-map.md` | #0 主編排 | #1、#3、R1 | 源碼目錄結構與模塊說明 |
| `outline.md` | #1 架構師 | 所有 Agent | 章節大綱與知識依賴圖 |
| `glossary.md` | #0（初始）→ #4（追加） | 所有 Agent | 全書統一術語表 |
| `metaphor-registry.md` | #4 作家（追加） | #4、R2 | 已使用比喻登記，避免跨章重複 |
| `style-guide.md` | #0 主編排 | #4、R3 | 寫作風格規範 |
| `chapter-summaries.md` | #0（每章完成後更新） | #4、R2 | 已完成章節的摘要 |
| `cross-references.md` | #4（追加） → R2（驗證） | #4、R2、#0 | 跨章引用關係登記 |

### 規則 4：狀態推斷 — 文件存在性即進度

主編排通過檢查文件系統推斷每章的進度狀態：

```
文件不存在                        → 未开始
research/chXX-research.md 存在   → Step 1 完成（研究完成）
chapters/chXX.md 存在            → Step 2 完成（初稿完成）
reviews/chXX-*-review.md 存在    → Step 3 完成（审查完成）
feedback/chXX-*-feedback.md 存在 → Step 4 完成（评审完成）
chapters/chXX-final.md 存在      → 该章定稿
```

這使得流程具備 **斷點恢復** 能力：中斷後重新啓動，主編排掃描文件系統即可恢復進度，無需任何額外的狀態存儲。

---

## 5. 關聯文檔

### 框架文檔

| 文檔 | 路徑 | 內容 |
|------|------|------|
| 五階段工作流詳解 | [`framework/workflow.md`](../framework/workflow.md) | 每個 Phase 的詳細步驟、入口條件、出口條件 |
| File Pointers 機制 | [`framework/file-pointers.md`](../framework/file-pointers.md) | File Pointers 的設計原理與使用規範 |
| 審查與評審協議 | [`framework/review-architecture.md`](../framework/review-architecture.md) | 審查員和讀者評審的評分標準、反饋格式 |
| 並行執行策略 | [`framework/parallel-strategy.md`](../framework/parallel-strategy.md) | 多章並行、多員並行的調度策略 |
| 斷點恢復機制 | [`framework/recovery.md`](../framework/recovery.md) | 流程中斷後的狀態恢復方法 |

### Agent 詳細文檔

| Agent | 文檔路徑 |
|-------|---------|
| #0 主編排 Orchestrator | [`agents/01-orchestrator.md`](./01-orchestrator.md) |
| #1 架構師 Architect | [`agents/02-architect.md`](./02-architect.md) |
| #2 讀者代言人 Reader Advocate | [`agents/03-reader-advocate.md`](./03-reader-advocate.md) |
| #3 研究員 Researcher | [`agents/04-researcher.md`](./04-researcher.md) |
| #4 作家 Writer | [`agents/05-writer.md`](./05-writer.md) |
| R1 源碼審查員 Code Reviewer | [`agents/06-code-reviewer.md`](./06-code-reviewer.md) |
| R2 一致性審查員 Consistency Reviewer | [`agents/07-consistency-reviewer.md`](./07-consistency-reviewer.md) |
| R3 內容審查員 Content Reviewer | [`agents/08-content-reviewer.md`](./08-content-reviewer.md) |
| RS 大學生讀者 | [`agents/09-reader-panel.md`](./09-reader-panel.md) |
| RE 工程師讀者 | [`agents/09-reader-panel.md`](./09-reader-panel.md) |
| RH 愛好者讀者 | [`agents/09-reader-panel.md`](./09-reader-panel.md) |
| #11 裝幀工人 Bookbinder | [`agents/10-bookbinder.md`](./10-bookbinder.md) |
| #12 品質檢查員 Quality Inspector | [`agents/11-quality-inspector.md`](./11-quality-inspector.md) |
| #12 品質檢查員 Quality Inspector | [`agents/11-quality-inspector.md`](./11-quality-inspector.md) |

### 模板文件

| 模板 | 路徑 | 新項目啓動時操作 |
|------|------|----------------|
| 源碼地圖 | [`templates/source-map.md`](../templates/source-map.md) | 填寫目標源碼的目錄結構與核心模塊 |
| 大綱模板 | [`templates/outline.md`](../templates/outline.md) | 填寫初始章節規劃（可由 #1 架構師輔助） |
| 風格指南 | [`templates/style-guide.md`](../templates/style-guide.md) | 填寫寫作風格偏好與代碼展示規範 |
| 術語表 | [`templates/glossary.md`](../templates/glossary.md) | 填寫已知術語的定義與翻譯 |
| 比喻註冊表 | [`templates/metaphor-registry.md`](../templates/metaphor-registry.md) | 留空，由寫作過程逐步填充 |
