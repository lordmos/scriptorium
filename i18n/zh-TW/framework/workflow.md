<!--
  Translation status:
  Source file : framework/workflow.md
  Source commit: 7685751
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **語言 / Language**: [简体中文](../../../framework/workflow.md) · [English](../../en/framework/workflow.md) · [日本語](../../ja/framework/workflow.md) · **繁體中文**

---

# 5階段生產流水線

> **框架文檔** — 適用於任何基於多Agent協作的技術書籍生產項目
> 項目: {{項目名稱}} | 源碼: {{源碼倉庫}} | 章節數: {{章節數}}

---

## 流水線總覽

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        5阶段生产流水线                                    │
│                                                                         │
│  Phase 1        Phase 2        Phase 3          Phase 4       Phase 5   │
│ ┌────────┐    ┌────────┐    ┌──────────┐    ┌─────────┐    ┌────────┐  │
│ │大纲定稿│───▶│共享资源│───▶│逐章写作  │───▶│统稿审计 │───▶│HTML发布│  │
│ │        │    │  构建  │    │×{{章节数}}│    │         │    │        │  │
│ └────────┘    └────────┘    └──────────┘    └─────────┘    └────────┘  │
│                                                                         │
│  架构师#1       主编排#0      研究员#3         主编排#0      装帧工人#11 │
│  读者代言人#2                 作家#4           审查组R1-R3              │
│  内容审查R3                   审查组R1-R3                               │
│                               读者评审团                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: 大綱定稿

### 參與Agent

| Agent | 角色代號 | 職責 |
|-------|---------|------|
| 架構師 | #1 | 分析源碼結構，生成大綱草案 |
| 讀者代言人 | #2 | 從{{目標讀者}}視角審覈大綱 |
| 內容審查員 | R3 | 審覈敏感性、合規性 |

### 執行步驟

```
Step 1.1  架构师(#1) 分析{{源码仓库}}源码
          ├── 读取: {{源码根目录}}
          ├── 输出: outline-draft.md（大纲草案）
          └── 输出: source-map.md（源码→章节映射）

Step 1.2  读者代言人(#2) 审核大纲
          ├── 读取: outline-draft.md
          ├── 输出: outline-reader-feedback.md
          └── 关注: 学习曲线、前置知识、章节顺序合理性

Step 1.3  内容审查员(R3) 审核大纲
          ├── 读取: outline-draft.md
          ├── 输出: outline-r3-review.md
          └── 关注: {{敏感性检查项}}

Step 1.4  用户审核定稿
          ├── 读取: 所有反馈文件
          ├── 人工决策: 接受/修改/驳回
          └── 输出: outline-final.md（最终大纲）
```

### 產出清單

| 文件 | 說明 | 類型 |
|------|------|------|
| `outline-final.md` | 最終定稿大綱 | 靜態 |
| `source-map.md` | 源碼文件→章節映射關係 | 靜態 |

### Phase 1 交接清單

- [ ] outline-final.md 已創建且經用戶確認
- [ ] source-map.md 已創建，覆蓋所有關鍵源碼文件
- [ ] 章節數量、順序、範圍已最終確定
- [ ] {{敏感性檢查項}}已通過R3審覈

---

## Phase 2: 共享資源構建

### 參與Agent

| Agent | 角色代號 | 職責 |
|-------|---------|------|
| 主編排 | #0 | 直接生成所有共享資源文件 |

### 執行步驟

```
Step 2.1  主编排(#0) 基于 outline-final.md 创建所有共享文件
          ├── 输出: meta/glossary.md          — 术语表（初始版本）
          ├── 输出: meta/style-guide.md       — 写作风格指南
          ├── 输出: meta/metaphor-registry.md — 比喻注册表
          ├── 输出: meta/chapter-summaries.md — 章节摘要（空模板）
          └── 输出: meta/cross-references.md  — 交叉引用表（空模板）
```

### 產出清單

| 文件 | 說明 | 類型 |
|------|------|------|
| `meta/glossary.md` | 全書術語表 | 追加 |
| `meta/style-guide.md` | 寫作風格指南 | 靜態 |
| `meta/metaphor-registry.md` | 比喻/類比註冊表 | 追加 |
| `meta/chapter-summaries.md` | 各章摘要（逐章追加） | 追加 |
| `meta/cross-references.md` | 章節間交叉引用 | 追加 |

### Phase 2 交接清單

- [ ] meta/ 目錄下所有5個文件已創建
- [ ] glossary.md 包含大綱中已識別的核心術語
- [ ] style-guide.md 包含{{寫作風格要求}}
- [ ] chapter-summaries.md 已創建空模板（每章一個佔位段落）

---

## Phase 3: 逐章寫作 ×{{章節數}}章

### 每章4步流水線

```
┌─────────────────────────────────────────────────────────────────┐
│                    单章写作流水线                                  │
│                                                                   │
│  Step 1         Step 2         Step 3              Step 4         │
│ ┌──────┐      ┌──────┐      ┌──────────┐        ┌──────────┐    │
│ │ 研究 │─────▶│ 写作 │─────▶│ 三审并行 │───────▶│读者评审团│    │
│ │ #3   │      │ #4   │      │R1+R2+R3  │        │RS+RE+RH  │    │
│ └──────┘      └──────┘      └──────────┘        └──────────┘    │
│    │             │           ┌──┤├──┐            ┌──┤├──┐        │
│    ▼             ▼           ▼  ▼  ▼            ▼  ▼  ▼         │
│ research/     drafts/      R1  R2  R3          RS  RE  RH       │
│ chXX-         chXX-        ↓   ↓   ↓           ↓   ↓   ↓       │
│ research.md   draft.md     reviews/           reader-feedback/   │
│                            chXX-review.md     chXX-panel.md      │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 1: 研究（研究員 #3）

```
输入:
  📖 source-map.md          — 定位本章对应的源码文件
  📖 outline-final.md       — 本章的大纲要求
  📖 {{源码文件列表}}        — 实际源码文件

输出:
  ✏️ research/chXX-research.md — 源码分析报告

完成标记: <!-- RESEARCH_COMPLETE -->
```

#### Step 2: 寫作（作家 #4）

```
输入:
  📖 research/chXX-research.md — 本章研究报告
  📖 meta/style-guide.md       — 写作风格指南
  📖 meta/chapter-summaries.md — 前序章节摘要
  📖 meta/glossary.md          — 已有术语表
  📖 meta/metaphor-registry.md — 已用比喻表

输出:
  ✏️ drafts/chXX-draft.md — 章节初稿

完成标记: <!-- DRAFT_COMPLETE -->
字数要求: {{每章目标字数}}字 ± 20%
```

#### Step 3: 三審並行（R1 + R2 + R3）

```
三个Reviewer并行执行，详见 review-architecture.md

R1 源码审查:
  📖 drafts/chXX-draft.md + 源码文件
  ✏️ reviews/chXX-r1-code.md
  完成标记: <!-- R1_CODE_REVIEW_COMPLETE -->

R2 一致性审查:
  📖 drafts/chXX-draft.md + 长记忆文件
  ✏️ reviews/chXX-r2-consistency.md
  完成标记: <!-- R2_CONSISTENCY_REVIEW_COMPLETE -->

R3 内容审查:
  📖 drafts/chXX-draft.md + style-guide
  ✏️ reviews/chXX-r3-content.md
  完成标记: <!-- R3_CONTENT_REVIEW_COMPLETE -->

→ 三审完成后，主编排合并为:
  ✏️ reviews/chXX-review.md
  完成标记: <!-- REVIEW_COMPLETE -->
```

#### Step 4: 讀者評審團（RS + RE + RH 並行）

```
三类模拟读者并行评审:

RS {{读者画像_学生}}: 评估学习曲线
RE {{读者画像_工程师}}: 评估实用价值
RH {{读者画像_高手}}: 评估技术深度

输入: drafts/chXX-draft.md + reviews/chXX-review.md
输出: reader-feedback/chXX-panel.md
完成标记: <!-- READER_PANEL_COMPLETE -->
```

### 章間長記憶更新

每章完成Step 4後，主編排執行:

```
1. meta/chapter-summaries.md ← 追加本章摘要（200-300字）
2. meta/glossary.md          ← 追加本章新增术语
3. meta/metaphor-registry.md ← 追加本章新增比喻/类比
4. meta/cross-references.md  ← 追加本章的交叉引用点
```

### 並行策略

同一批次內的章節可並行執行完整的4步流水線。
批次間嚴格串行——後續批次依賴前序批次的長記憶更新。
詳見 `parallel-strategy.md`。

### Phase 3 交接清單

- [ ] 所有{{章節數}}章的 research/ 文件完成且有RESEARCH_COMPLETE標記
- [ ] 所有{{章節數}}章的 drafts/ 文件完成且有DRAFT_COMPLETE標記
- [ ] 所有{{章節數}}章的 reviews/ 合併文件完成且有REVIEW_COMPLETE標記
- [ ] 所有{{章節數}}章的 reader-feedback/ 文件完成且有READER_PANEL_COMPLETE標記
- [ ] meta/ 下的追加文件已更新至最新
- [ ] checkpoint.md 狀態矩陣全部爲✅

---

## Phase 4: 統稿與最終審計

### 參與Agent

| Agent | 角色代號 | 職責 |
|-------|---------|------|
| 主編排 | #0 | 全書統稿協調 |
| R1 源碼審查 | R1 | 全書代碼準確性最終驗證 |
| R2 一致性審查 | R2 | 全書術語/比喻一致性最終驗證 |
| R3 內容審查 | R3 | 全書敏感性/可讀性最終驗證 |

### 執行步驟

```
Step 4.1  全书通读与统稿
          ├── 逐章检查行文连贯性
          ├── 统一过渡段落
          └── 输出: chapters/chXX.md（最终定稿版本，每章一个）

Step 4.2  交叉引用验证
          ├── 读取: meta/cross-references.md
          ├── 验证所有"参见第X章"引用的正确性
          └── 修正错误引用

Step 4.3  术语一致性最终检查
          ├── 读取: meta/glossary.md
          ├── 全书搜索术语使用是否一致
          └── 修正不一致处

Step 4.4  敏感性全面排查
          ├── R3对全书做最终敏感性扫描
          ├── 关注: {{敏感性检查项}}
          └── 输出: final-audit-report.md
```

### 產出清單

| 文件 | 說明 |
|------|------|
| `chapters/ch01.md` ~ `chapters/ch{{章節數}}.md` | 最終定稿 |
| `final-audit-report.md` | 最終審計報告 |

### Phase 4 交接清單

- [ ] chapters/ 下所有章節文件已生成
- [ ] 交叉引用全部驗證通過
- [ ] 術語一致性檢查通過
- [ ] 敏感性排查通過
- [ ] final-audit-report.md 無❌項

---

## Phase 5: HTML裝幀與發佈

### 參與Agent

| Agent | 角色代號 | 職責 |
|-------|---------|------|
| 裝幀工人 | #11 | Markdown→HTML全流程轉換 |

### 執行步驟

```
Step 5.1  Markdown → HTML 转换
          ├── 读取: chapters/*.md
          ├── 应用HTML模板
          └── 输出: publish/chXX.html

Step 5.2  代码块高亮
          ├── 对所有代码块应用语法高亮
          └── 支持语言: {{代码语言列表}}

Step 5.3  图表转换
          ├── ASCII图表 → SVG
          └── 嵌入HTML页面

Step 5.4  导航系统
          ├── 生成目录页: publish/index.html
          ├── 章节间前后导航链接
          └── 侧边栏目录

Step 5.5  样式美化
          ├── 应用CSS样式: publish/style.css
          ├── 响应式布局
          └── 代码块样式、引用样式、表格样式
```

### 產出清單

| 文件 | 說明 |
|------|------|
| `publish/index.html` | 目錄首頁 |
| `publish/ch01.html` ~ `publish/ch{{章節數}}.html` | 各章HTML |
| `publish/style.css` | 全書樣式表 |
| `publish/assets/` | 圖表、圖片等靜態資源 |

### Phase 5 交接清單

- [ ] 所有章節HTML已生成
- [ ] 導航系統可正常跳轉
- [ ] 代碼高亮渲染正常
- [ ] 在主流瀏覽器中顯示正常
- [ ] 響應式佈局在移動端正常

---

## 異常處理流程

### 審查不通過

```
触发条件: R1/R2/R3任一给出 ❌（严重问题）

处理流程:
  1. 主编排读取 reviews/chXX-review.md 中的❌项
  2. 将❌项连同原draft一起发送给作家(#4)
  3. 作家输出修订版: drafts/chXX-draft-v2.md
  4. 重新触发对应的审查（仅重审给出❌的reviewer）
  5. 如果再次不通过，升级为人工干预

最大重试次数: {{最大审查重试次数，默认2}}
```

### 字數不達標

```
触发条件: 初稿字数 < {{每章目标字数}} × 0.8 或 > {{每章目标字数}} × 1.2

处理流程:
  字数不足:
    1. 主编排标记哪些section过于简略
    2. 作家(#4)针对性扩展指定section
    3. 重新计数

  字数超标:
    1. 主编排标记哪些section冗余
    2. 作家(#4)针对性精简
    3. 重新计数
```

### 連續失敗

```
触发条件: 同一章节连续{{最大连续失败次数，默认3}}次操作失败

处理流程:
  1. 记录失败原因到 audit-log.md
  2. 跳过该章节，继续处理后续章节
  3. 在checkpoint.md中标记为 ⚠️ NEEDS_HUMAN_REVIEW
  4. 所有可处理章节完成后，汇总需人工介入的章节列表
```

---

## 完成標記體系

### 標記定義

每個標記以HTML註釋形式追加在對應文件的**最後一行**:

```
<!-- RESEARCH_COMPLETE -->
<!-- DRAFT_COMPLETE -->
<!-- R1_CODE_REVIEW_COMPLETE -->
<!-- R2_CONSISTENCY_REVIEW_COMPLETE -->
<!-- R3_CONTENT_REVIEW_COMPLETE -->
<!-- REVIEW_COMPLETE -->
<!-- READER_PANEL_COMPLETE -->
<!-- CHAPTER_FINAL -->
<!-- HTML_COMPLETE -->
```

### 標記流轉

```
研究完成            写作完成            三审各自完成              合并完成
RESEARCH     ───▶  DRAFT      ───▶  R1_CODE_REVIEW      ───▶  REVIEW
_COMPLETE          _COMPLETE         R2_CONSISTENCY_REVIEW      _COMPLETE
                                     R3_CONTENT_REVIEW

                                                    读者评审完成
                                               ───▶ READER_PANEL
                                                     _COMPLETE

统稿定稿            HTML完成
CHAPTER      ───▶  HTML
_FINAL              _COMPLETE
```

### 標記檢測方法

```bash
# 检测单个文件的完成标记
grep -l "RESEARCH_COMPLETE" research/ch*.md

# 检测所有章节的写作完成状态
for f in drafts/ch*-draft.md; do
  if grep -q "DRAFT_COMPLETE" "$f"; then
    echo "✅ $f"
  else
    echo "❌ $f"
  fi
done

# 生成全书进度矩阵
# 详见 recovery.md 中的 checkpoint.md 格式
```

---

## Phase間交接清單彙總

| Phase | 交接前必須確認 | 確認方式 |
|-------|---------------|---------|
| 1→2 | outline-final.md存在且經用戶確認 | 文件存在 + 用戶口頭確認 |
| 2→3 | meta/下5個文件全部創建 | 文件存在檢查 |
| 3→4 | 所有章節4步流水線完成 | checkpoint.md全✅ |
| 4→5 | chapters/下所有章節定稿 + 審計報告無❌ | 文件存在 + 標記檢測 |
| 5→發佈 | publish/下所有HTML + 導航可用 | 文件存在 + 瀏覽器驗證 |

---

## 附錄: Agent角色速查表

| 代號 | 角色 | 參與Phase | Agent類型 |
|------|------|----------|-----------|
| #0 | 主編排 | 2, 3, 4 | 用戶自身/腳本 |
| #1 | 架構師 | 1 | general-purpose |
| #2 | 讀者代言人 | 1 | general-purpose |
| #3 | 研究員 | 3 | explore |
| #4 | 作家 | 3 | general-purpose |
| R1 | 源碼審查 | 3, 4 | explore |
| R2 | 一致性審查 | 3, 4 | explore |
| R3 | 內容審查 | 1, 3, 4 | general-purpose |
| RS | 讀者-{{讀者畫像_學生}} | 3 | explore |
| RE | 讀者-{{讀者畫像_工程師}} | 3 | explore |
| RH | 讀者-{{讀者畫像_高手}} | 3 | explore |
| #11 | 裝幀工人 | 5 | general-purpose |
