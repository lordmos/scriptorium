# 如何使用 Scriptorium

> 你不需要手動呼叫每一個 Agent。一句話啟動，AI 自動完成所有工作。

---

## 三步上手

### 第一步：建立書籍專案

點擊 GitHub 上的 **"Use this template"** 建立你的書籍儲存庫：

```
https://github.com/lordmos/scriptorium
```

### 第二步：準備原始碼

把你想寫的開源專案原始碼放到儲存庫目錄中（或記下它的路徑）。

用 AI 工具開啟這個目錄（[Claude Code](https://claude.ai/code)、[OpenCode](https://opencode.ai)、[Cursor](https://cursor.sh) 均可）。

### 第三步：說這一句話

```
[專案名] 的原始碼在 [目錄路徑]。請讀 QUICK_START.md，然後向我提問。
沒有問題就開始你的工作。
```

**就這些。** AI 助手會自動：

1. 讀取 `QUICK_START.md` 了解完整工作指南
2. 向你確認書名、目標讀者等基本資訊
3. 扮演架構師分析原始碼、生成大綱
4. 向你展示大綱，請求確認
5. 自主運行 Phase 2→5，逐章完成研究、寫作、三重審查
6. 最終交付完整書稿

---

## 唯一需要你做的事

| 時間點 | 你的操作 |
|--------|---------|
| 啟動時 | 回答 AI 的基本問題（書名、讀者等） |
| Phase 1 結束 | 確認或修改大綱 |
| 全部完成 | 查看 `output/book-final.md` |

---

## 中斷後恢復

隨時可以暫停，下次打開告訴 AI：

```
請讀 checkpoint.md，繼續上次未完成的工作。
```

---

## 深入了解

| 文件 | 內容 |
|------|------|
| [`QUICK_START.md`](https://github.com/lordmos/scriptorium/blob/main/QUICK_START.md) | AI 編排入口檔案（機器可讀） |
| [`agents/00-system-overview.md`](/zh-TW/agents/00-system-overview) | 12 個 Agent 的完整規格 |
| [`framework/workflow.md`](/zh-TW/framework/workflow) | 五階段流水線詳解 |
| [`framework/parallel-strategy.md`](/zh-TW/framework/parallel-strategy) | 多視窗並行加速 |
| [`framework/recovery.md`](/zh-TW/framework/recovery) | 斷點恢復機制 |

