<!--
  Translation status:
  Source file : framework/workflow.md
  Source commit: 7685751
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **言語 / Language**: [简体中文](../../../framework/workflow.md) · [English](../../en/framework/workflow.md) · **日本語** · [繁體中文](../../zh-TW/framework/workflow.md)

---

# 5段階制作パイプライン

> **フレームワークドキュメント** — あらゆるマルチエージェント協調型技術書籍制作プロジェクトに適用可能
> プロジェクト: {{プロジェクト名}} | ソース: {{ソースコードリポジトリ}} | 章数: {{章数}}

---

## パイプライン概要

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

## Phase 1: アウトライン確定

### 参加Agent

| Agent | 役割コード | 担当 |
|-------|---------|------|
| アーキテクト | #1 | ソースコード構造を分析し、アウトライン草案を生成 |
| リーダーアドボケイト | #2 | {{対象読者}}の視点からアウトラインをレビュー |
| コンテンツレビュアー | R3 | センシティビティ・コンプライアンスの審査 |

### 実行手順

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

### 成果物一覧

| ファイル | 説明 | タイプ |
|------|------|------|
| `outline-final.md` | 最終確定アウトライン | 静的 |
| `source-map.md` | ソースコードファイル→章マッピング | 静的 |

### Phase 1 引き継ぎチェックリスト

- [ ] outline-final.md が作成され、ユーザーの確認を得た
- [ ] source-map.md が作成され、すべての重要なソースコードファイルを網羅している
- [ ] 章数、順序、スコープが最終確定した
- [ ] {{センシティビティチェック項目}} がR3のレビューを通過した

---

## Phase 2: 共有リソースの構築

### 参加Agent

| Agent | 役割コード | 担当 |
|-------|---------|------|
| メインオーケストレーター | #0 | すべての共有リソースファイルを直接生成 |

### 実行手順

```
Step 2.1  主编排(#0) 基于 outline-final.md 创建所有共享文件
          ├── 输出: meta/glossary.md          — 术语表（初始版本）
          ├── 输出: meta/style-guide.md       — 写作风格指南
          ├── 输出: meta/metaphor-registry.md — 比喻注册表
          ├── 输出: meta/chapter-summaries.md — 章节摘要（空模板）
          └── 输出: meta/cross-references.md  — 交叉引用表（空模板）
```

### 成果物一覧

| ファイル | 説明 | タイプ |
|------|------|------|
| `meta/glossary.md` | 書籍全体の用語集 | 追記 |
| `meta/style-guide.md` | ライティングスタイルガイド | 静的 |
| `meta/metaphor-registry.md` | 比喩・類比レジストリ | 追記 |
| `meta/chapter-summaries.md` | 各章要約（章ごとに追記） | 追記 |
| `meta/cross-references.md` | 章間相互参照 | 追記 |

### Phase 2 引き継ぎチェックリスト

- [ ] meta/ ディレクトリ以下の5ファイルすべてが作成されている
- [ ] glossary.md にアウトラインで特定したコアの用語が含まれている
- [ ] style-guide.md に {{ライティングスタイル要件}} が含まれている
- [ ] chapter-summaries.md に空テンプレートが作成されている（章ごとにプレースホルダー段落を含む）

---

## Phase 3: 章ごとの執筆 ×{{章数}}章

### 1章あたりの4ステップパイプライン

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

#### Step 1: リサーチ（リサーチャー #3）

```
输入:
  📖 source-map.md          — 定位本章对应的源码文件
  📖 outline-final.md       — 本章的大纲要求
  📖 {{源码文件列表}}        — 实际源码文件

输出:
  ✏️ research/chXX-research.md — 源码分析报告

完成标记: <!-- RESEARCH_COMPLETE -->
```

#### Step 2: 執筆（ライター #4）

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

#### Step 3: 三者並行レビュー（R1 + R2 + R3）

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

#### Step 4: 読者評価パネル（RS + RE + RH 並行）

```
三类模拟读者并行评审:

RS {{读者画像_学生}}: 评估学习曲线
RE {{读者画像_工程师}}: 评估实用价值
RH {{读者画像_高手}}: 评估技术深度

输入: drafts/chXX-draft.md + reviews/chXX-review.md
输出: reader-feedback/chXX-panel.md
完成标记: <!-- READER_PANEL_COMPLETE -->
```

### 章間の長期記憶更新

各章のStep 4完了後、メインオーケストレーターが実行:

```
1. meta/chapter-summaries.md ← 追加本章摘要（200-300字）
2. meta/glossary.md          ← 追加本章新增术语
3. meta/metaphor-registry.md ← 追加本章新增比喻/类比
4. meta/cross-references.md  ← 追加本章的交叉引用点
```

### 並行化戦略

同一バッチ内の章は、4ステップパイプライン全体を並行実行できます。
バッチ間は厳密に直列実行——後続バッチは前バッチの長期記憶更新に依存します。
詳細は `parallel-strategy.md` を参照してください。

### Phase 3 引き継ぎチェックリスト

- [ ] すべての{{章数}}章の research/ ファイルが完成し、RESEARCH_COMPLETE マーカーがある
- [ ] すべての{{章数}}章の drafts/ ファイルが完成し、DRAFT_COMPLETE マーカーがある
- [ ] すべての{{章数}}章の reviews/ 統合ファイルが完成し、REVIEW_COMPLETE マーカーがある
- [ ] すべての{{章数}}章の reader-feedback/ ファイルが完成し、READER_PANEL_COMPLETE マーカーがある
- [ ] meta/ 以下の追記ファイルが最新の状態に更新されている
- [ ] checkpoint.md の状態マトリックスがすべて ✅

---

## Phase 4: 原稿統合・最終監査

### 参加Agent

| Agent | 役割コード | 担当 |
|-------|---------|------|
| メインオーケストレーター | #0 | 書籍全体の原稿統合を調整 |
| R1 コードレビュアー | R1 | 書籍全体のコード正確性を最終検証 |
| R2 一貫性レビュアー | R2 | 書籍全体の用語・比喩の一貫性を最終検証 |
| R3 コンテンツレビュアー | R3 | 書籍全体のセンシティビティ・可読性を最終検証 |

### 実行手順

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

### 成果物一覧

| ファイル | 説明 |
|------|------|
| `chapters/ch01.md` ～ `chapters/ch{{章节数}}.md` | 最終確定稿 |
| `final-audit-report.md` | 最終監査レポート |

### Phase 4 引き継ぎチェックリスト

- [ ] chapters/ 以下のすべての章ファイルが生成されている
- [ ] すべての相互参照が検証されている
- [ ] 用語の一貫性チェックが通過した
- [ ] センシティビティチェックが通過した
- [ ] final-audit-report.md に ❌ 項目がない

---

## Phase 5: HTML装丁・発行

### 参加Agent

| Agent | 役割コード | 担当 |
|-------|---------|------|
| ブックバインダー | #11 | Markdown→HTMLの全フロー変換 |

### 実行手順

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

### 成果物一覧

| ファイル | 説明 |
|------|------|
| `publish/index.html` | 目次トップページ |
| `publish/ch01.html` ～ `publish/ch{{章节数}}.html` | 各章HTML |
| `publish/style.css` | 書籍全体スタイルシート |
| `publish/assets/` | 図表・画像などの静的リソース |

### Phase 5 引き継ぎチェックリスト

- [ ] すべての章のHTMLが生成されている
- [ ] ナビゲーションが正常に機能する
- [ ] コードハイライトが正しくレンダリングされる
- [ ] 主要ブラウザで正常に表示される
- [ ] レスポンシブレイアウトがモバイルで正常に機能する

---

## 異常処理フロー

### レビュー不合格

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

### 文字数未達

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

### 連続失敗

```
触发条件: 同一章节连续{{最大连续失败次数，默认3}}次操作失败

处理流程:
  1. 记录失败原因到 audit-log.md
  2. 跳过该章节，继续处理后续章节
  3. 在checkpoint.md中标记为 ⚠️ NEEDS_HUMAN_REVIEW
  4. 所有可处理章节完成后，汇总需人工介入的章节列表
```

---

## 完了マーカーシステム

### マーカー定義

各マーカーはHTMLコメント形式で、対応ファイルの**最終行**に追記されます:

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

### マーカーフロー

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

### マーカー検出方法

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

## フェーズ間引き継ぎチェックリスト集計

| フェーズ | 引き継ぎ前に確認すること | 確認方法 |
|-------|---------------|---------|
| 1→2 | outline-final.md が存在し、ユーザーの確認を得ている | ファイル存在 + ユーザー口頭確認 |
| 2→3 | meta/ 以下の5ファイルがすべて作成されている | ファイル存在チェック |
| 3→4 | すべての章の4ステップパイプラインが完了 | checkpoint.md すべて ✅ |
| 4→5 | chapters/ 以下のすべての章が最終確定 + 監査レポートに ❌ なし | ファイル存在 + マーカー検出 |
| 5→発行 | publish/ 以下のすべてのHTML + ナビゲーションが利用可能 | ファイル存在 + ブラウザ確認 |

---

## 付録: Agentロール早見表

| コード | ロール | 参加フェーズ | Agentタイプ |
|------|------|----------|-----------|
| #0 | メインオーケストレーター | 2, 3, 4 | ユーザー自身/スクリプト |
| #1 | アーキテクト | 1 | general-purpose |
| #2 | リーダーアドボケイト | 1 | general-purpose |
| #3 | リサーチャー | 3 | explore |
| #4 | ライター | 3 | general-purpose |
| R1 | コードレビュアー | 3, 4 | explore |
| R2 | 一貫性レビュアー | 3, 4 | explore |
| R3 | コンテンツレビュアー | 1, 3, 4 | general-purpose |
| RS | 読者-{{読者プロファイル_学生}} | 3 | explore |
| RE | 読者-{{読者プロファイル_エンジニア}} | 3 | explore |
| RH | 読者-{{読者プロファイル_上級者}} | 3 | explore |
| #11 | ブックバインダー | 5 | general-purpose |
