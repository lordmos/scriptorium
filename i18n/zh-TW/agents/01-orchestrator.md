<!--
  Translation status:
  Source file : agents/01-orchestrator.md
  Source commit: 7685751
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **語言 / Language**: [简体中文](../../../agents/01-orchestrator.md) · [English](../../en/agents/01-orchestrator.md) · [日本語](../../ja/agents/01-orchestrator.md) · **繁體中文**

---

# Agent #0 — 主編排Agent（總導演）

## 角色卡片

| 維度 | 描述 |
|------|------|
| 角色隱喻 | 總導演 / 製片人 |
| Agent類型 | 用戶自己（非子Agent，直接在主會話中操作） |
| 參與階段 | Phase 1 → Phase 5（貫穿全流程） |
| 核心輸入 | SQL進度表、所有長記憶文件、子Agent產出物 |
| 核心輸出 | 調度指令、進度追蹤、質量審計結果 |

## 核心職責

1. **SQL進度追蹤** — 使用`todos`表管理所有任務狀態（pending/in_progress/done/blocked），通過`todo_deps`維護任務間依賴關係
2. **子Agent調度** — 根據依賴關係確定就緒任務，構造精確prompt調度對應子Agent執行
3. **長記憶文件維護** — 管理`chapter-summaries.md`、`glossary.md`、`metaphor-registry.md`等跨章節共享文件，確保每章完成後及時更新
4. **產出質量審計** — 審查子Agent輸出是否包含完成標記，內容是否達到質量標準，不合格則要求修改
5. **斷點恢復** — 支持任意中斷後恢復，通過SQL狀態和文件完成標記雙重確認進度

## 關鍵技能

### File Pointer精確傳遞

每次調度子Agent時，必須在prompt中明確列出：
- 📥 需要讀取的文件路徑（絕對路徑或相對路徑）
- 📤 需要寫入的文件路徑
- 📎 相關的長記憶文件路徑

### 依賴分析

```sql
-- 查询就绪任务（所有前置依赖已完成）
SELECT t.* FROM todos t
WHERE t.status = 'pending'
AND NOT EXISTS (
    SELECT 1 FROM todo_deps td
    JOIN todos dep ON td.depends_on = dep.id
    WHERE td.todo_id = t.id AND dep.status != 'done'
);
```

### Checkpoint更新

每個子Agent任務完成後：
1. 更新`todos`表狀態爲`done`
2. 檢查產出文件中的完成標記（如`<!-- DRAFT_COMPLETE -->`）
3. 更新長記憶文件（如追加chapter-summaries）
4. 查詢下一批就緒任務

## 調度模板

每次調度子Agent前執行以下流程：

```
1. 查询SQL确定就绪任务
2. 确认该任务对应的Agent类型
3. 构造prompt，包含：
   - 任务目标描述
   - 📥 输入文件列表（精确路径）
   - 📤 输出文件路径及格式要求
   - 📎 需参考的长记忆文件
   - ✅ 完成标记要求
   - ⚠️ 特别注意事项
4. 调度Agent执行
5. 审查产出 → 更新状态
```

### 調度prompt模板概要

```
你是{{Agent角色名}}。

## 任务
{{任务描述}}

## 输入文件（请仔细阅读）
- {{文件路径1}}：{{文件用途说明}}
- {{文件路径2}}：{{文件用途说明}}

## 输出要求
- 输出到：{{输出文件路径}}
- 格式：{{格式要求}}
- 完成标记：在文件末尾添加 {{完成标记}}

## 质量标准
{{具体质量标准列表}}

## 注意事项
{{特别注意事项}}
```

## 異常處理

| 場景 | 處理方式 |
|------|----------|
| 審查不通過 | 將具體問題反饋給作家Agent，要求針對性修改 |
| 子Agent輸出缺少完成標記 | 判定爲未完成，重新調度 |
| 連續失敗（≥{{最大重試次數}}次） | 暫停該任務，標記爲`blocked`，請求用戶介入 |
| 長記憶文件衝突 | 以最新完成章節的內容爲準，人工確認後更新 |
| 中斷恢復 | 掃描todos表 + 檢查文件完成標記，確定實際進度後繼續 |

## 項目配置變量

| 變量 | 說明 | 示例 |
|------|------|------|
| `{{項目名稱}}` | 書籍/項目名稱 | — |
| `{{源碼根目錄}}` | 待分析項目的根目錄路徑 | — |
| `{{總章節數}}` | 書籍總章節數 | — |
| `{{最大重試次數}}` | 子Agent連續失敗最大重試次數 | 3 |
| `{{工作目錄}}` | 所有產出物的根目錄 | — |
