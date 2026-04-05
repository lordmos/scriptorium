<!--
  Translation status:
  Source file : agents/00-system-overview.md
  Source commit: 2b88d15
  Translated  : 2026-04-05
  Status      : up-to-date
-->

> **言語 / Language**: [简体中文](../../../agents/00-system-overview.md) · [English](../../en/agents/00-system-overview.md) · **日本語** · [繁體中文](../../zh-TW/agents/00-system-overview.md)

---

# 🏗️ システムアーキテクチャとAgentレジストリ

> 本ドキュメントはマルチAgent編集部のシステムレベルアーキテクチャ説明書であり、全Agentの登録情報、インタラクション関係、情報フロールールを定義しています。

---

## 1. システム哲学

### AgentはステートレスなOne-Timeワーカーである

本フレームワークにおいて、各Agentは**ステートレスなOne-Timeワーカー**として扱われます：

- **記憶なし**：Agentは前回の呼び出しのコンテキストを一切保持しません。毎回起動するたびに白紙の状態です。
- **自律性なし**：Agentはいつ、何を行うかを自分で決定しません。一切はメインオーケストレーターがスケジューリングします。
- **置き換え可能**：どのAgentインスタンスも同種の新しいインスタンスに置き換えることができます。入力（File Pointers）が同じであれば、産出物も一致するはずです。

### 全ての記憶はディスク上の共有ファイルに保存される

Agent間の「記憶の伝達」はファイルシステムを通じて完全に実現されます：

```
Agent A 産出 → 写入文件 → 主编排注入文件路径给 Agent B → Agent B 读取 → 获得"记忆"
```

これは現代のマイクロサービスアーキテクチャの理念と一致しています：
- サービス（Agent）自体はステートレスで、状態は外部（ファイルシステム）に保存される
- サービス間はメッセージ（File Pointers）で通信し、直接呼び出しは行わない
- オーケストレーター（Orchestrator）がサービスディスカバリとスケジューリングを担当する

### メインオーケストレーターはFile Pointersでコンテキストを注入する

**File Pointers** はメインオーケストレーターがAgentの動作を制御するコアメカニズムです：

```
主编排调用 Agent 时的 Prompt 结构：

  "你是 {{役割名称}}。请执行以下任务：{{タスク説明}}。

   📂 必读文件：
   - {{ファイルパス1}}  ← 用途说明
   - {{ファイルパス2}}  ← 用途说明

   📝 输出要求：
   - 将结果写入 {{出力ファイルパス}}
   - 格式要求：{{フォーマット説明}}"
```

File Pointersの価値：
- **情報範囲の精密な制御**：Agentは必要な情報だけを参照し、コンテキストウィンドウの無駄を避ける
- **明確な読み書き境界**：各Agentは何を読み、何を書くべきかを把握している
- **トレーサビリティ**：File Pointersのリストから、あらゆるAgent呼び出し時の完全なコンテキストを再構築できる

---

## 2. Agentレジストリ

### コア制作グループ

| 番号 | 名称 | 役割の比喩 | Agentタイプ | 職責 | 詳細ドキュメント |
|------|------|----------|-----------|------|---------|
| #0 | メインオーケストレーターAgent Orchestrator | 総監督 | `general-purpose` | 全フローのスケジューリング、進捗と依存関係の管理、File Pointersによるコンテキスト注入 | [→ 01-orchestrator.md](./01-orchestrator.md) |
| #1 | アーキテクトAgent Architect | テクニカルディレクター | `general-purpose` | ソースコード構造の分析、章節アウトラインと知識グラフの設計、章節間依存関係の計画 | [→ 02-architect.md](./02-architect.md) |
| #2 | リーダーアドボケートAgent Reader Advocate | プロダクトマネージャー | `general-purpose` | 目標読者の視点からアウトラインをレビューし、章節順序が学習曲線に適合しているか確認 | [→ 03-reader-advocate.md](./03-reader-advocate.md) |
| #3 | リサーチャーAgent Researcher | ソースコード考古学者 | `explore` | 指定章節に関わるソースコードモジュールを深く調査し、構造化された調査レポートを生成 | [→ 04-researcher.md](./04-researcher.md) |
| #4 | ライターAgent Writer | ベストセラー作家 | `general-purpose` | 調査レポートとスタイルガイドに基づいて章節本文を執筆 | [→ 05-writer.md](./05-writer.md) |

### レビューグループ

| 番号 | 名称 | 役割の比喩 | Agentタイプ | 職責 | 詳細ドキュメント |
|------|------|----------|-----------|------|---------|
| R1 | ソースコードレビュアーAgent Code Reviewer | コード検証専門家 | `explore` | 章節中の各コード参照の正確性（ファイルパス、関数シグネチャ、動作説明）を検証 | [→ 06-code-reviewer.md](./06-code-reviewer.md) |
| R2 | コンシステンシーレビュアーAgent Consistency Reviewer | メモリ管理者 | `explore` | 章節をまたいだ用語の統一性、データの一貫性、相互参照の完全性を確認 | [→ 07-consistency-reviewer.md](./07-consistency-reviewer.md) |
| R3 | コンテンツレビュアーAgent Content Reviewer | シニアエディター | `general-purpose` | 可読性、ナラティブ構造、センシティブなコンテンツをレビューし、スタイルガイドへの準拠を確認 | [→ 08-content-reviewer.md](./08-content-reviewer.md) |

### 読者レビューパネル

| 番号 | 名称 | 役割の比喩 | Agentタイプ | 職責 | 詳細ドキュメント |
|------|------|----------|-----------|------|---------|
| RS | 大学生リーダー | コンピューターサイエンス専攻の大学3年生 | `general-purpose` | 初学者視点のシミュレーション：理解できない用語、欠けている背景知識、飛躍した論理をマーク | [→ 09-reader-panel.md](./09-reader-panel.md) |
| RE | エンジニアリーダー | 8年経験のフルスタックエンジニア | `general-purpose` | プロフェッショナルな開発者視点のシミュレーション：技術的深度、実用性、新しい発見があるかを評価 | [→ 09-reader-panel.md](./09-reader-panel.md) |
| RH | ホビイストリーダー | 技術的背景のないテック愛好家 | `general-purpose` | 非技術系読者視点のシミュレーション：比喩が生き生きとしているか、概念説明がわかりやすいかを検証 | [→ 09-reader-panel.md](./09-reader-panel.md) |

### 出版グループ

| 番号 | 名称 | 役割の比喩 | Agentタイプ | 職責 | 詳細ドキュメント |
|------|------|----------|-----------|------|---------|
| #11 | ブックバインダーAgent Bookbinder | タイポグラフィデザイナー | `general-purpose` | Markdown→HTML変換、Mermaidダイアグラムのレンダリング、ASCIIダイアグラム→SVGレンダリング、ゼロ依存ビルドスクリプト | [→ 10-bookbinder.md](./10-bookbinder.md) |
| #12 | 品質検査員 Quality Inspector | 出荷検査官 | `general-purpose` | EPUB産出物への7項目プログラム的品質検査（ZIP構造/XML有効性/SVG色/CSS準拠/タイトル整合/カバー/ナビゲーション）、修正チケットのルーティング | [→ 11-quality-inspector.md](./11-quality-inspector.md) |

---

## 3. インタラクション関係図

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
  │  Phase 3  逐章写作 ×{{章節数}}章                             │
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
  │  Phase 5  HTML装幀と発行                                    │
  │  ┌─────────────┐                                            │
  │  │ 📚 #11      │  Markdown→HTML · ASCII→SVG                │
  │  │ Bookbinder  │  ゼロ依存ビルドスクリプト                  │
  │  └──────┬──────┘                                            │
  │         │ EPUB産出物                                        │
  │  ┌──────▼──────┐                                            │
  │  │ 🔍 #12      │  7項目プログラム的品質検査                  │
  │  │ 品質検査員  │  ZIP/XML/SVG色/CSS/タイトル/カバー/ナビ     │
  │  │ Inspector   │  修正チケットを#11または#4へルーティング     │
  │  └─────────────┘                                            │
  └─────────────────────────────────────────────────────────────┘
  凡例: #N = Agent番号  R1/R2/R3 = レビュアー  RS/RE/RH = 読者パネル
```

### アーキテクチャの解読

**Hub-Spoke パターン**：メインオーケストレーター（#0）が唯一のHubであり、他の全AgentはSpokeです。これは以下を意味します：

1. **循環依存なし**：情報フローは一方向（メインオーケストレーター→Agent→ファイル→メインオーケストレーター）で、Agent間の循環呼び出しは存在しません
2. **障害の隔離**：あるSpokeAgentの失敗は現在のタスクにのみ影響し、他のAgentにカスケードしません
3. **観測可能性**：全てのスケジューリング決定はメインオーケストレーター内にあり、ログ記録とデバッグが容易です

**並行実行ポイント**：
- Phase 3 Step 3：R1、R2、R3の3名のレビュアーが並行（チェックの観点が直交）
- Phase 3 Step 4：RS、RE、RHの3名の読者が並行（レビュー視点が独立）
- Phase 3 章間：異なる章のStep 1（調査）は、既に調査が完了した章のStep 2（執筆）と並行可能

---

## 4. 情報フロールール

### ルール1：一方向通信 — 全ての指令はメインオーケストレーターから発信

```
✅ 主编排 → Agent      （通过 File Pointers 注入任务）
✅ Agent → 文件系统     （写入产出物）
✅ 主编排 ← 文件系统    （读取产出物，决定下一步）
❌ Agent → Agent        （禁止直接通信）
❌ Agent → 主编排       （Agent 不主动发起请求）
```

AgentはAother Agentの存在を知りません。メインオーケストレーターが提供するファイルのみを参照し、タスク完了後に結果を書き込みます。

### ルール2：File Pointersは最小権限の原則に従う

各Agentは現在のタスクを完了するための**最小限**のファイル参照のみを取得します：

| Agent | 典型的な必読ファイル | 典型的な出力ファイル |
|-------|-------------|-------------|
| #3 リサーチャー | `outline.md`（現在の章節部分）、`source-map.md`、`glossary.md` | `research/chXX-research.md` |
| #4 ライター | `research/chXX-research.md`、`style-guide.md`、`chapter-summaries.md`、`metaphor-registry.md` | `chapters/chXX.md` |
| R1 ソースコードレビュアー | `chapters/chXX.md`、ソースコードファイル（必要に応じて） | `reviews/chXX-code-review.md` |
| R2 コンシステンシーレビュアー | `chapters/chXX.md`、`glossary.md`、`chapter-summaries.md`、`cross-references.md` | `reviews/chXX-consistency-review.md` |
| R3 コンテンツレビュアー | `chapters/chXX.md`、`style-guide.md` | `reviews/chXX-content-review.md` |

> 💡 ライターは他の章節の完全な本文を取得**しません**（コンテキストウィンドウの無駄を避けるため）。`chapter-summaries.md`内の要約のみを取得します。

### ルール3：共有ファイルはAgent間の唯一の情報ブリッジ

以下の共有ファイルがAgent間の「長期記憶」を構成します：

| 共有ファイル | 書き込み者 | 読み取り者 | 用途 |
|---------|-------|--------|------|
| `source-map.md` | #0 メインオーケストレーター | #1、#3、R1 | ソースコードのディレクトリ構造とモジュール説明 |
| `outline.md` | #1 アーキテクト | 全Agent | 章節アウトラインと知識依存グラフ |
| `glossary.md` | #0（初期）→ #4（追加） | 全Agent | 全書統一用語集 |
| `metaphor-registry.md` | #4 ライター（追加） | #4、R2 | 使用済み比喩の登録、章節をまたいだ重複を避ける |
| `style-guide.md` | #0 メインオーケストレーター | #4、R3 | 執筆スタイルガイドライン |
| `chapter-summaries.md` | #0（各章完了後に更新） | #4、R2 | 完成済み章節の要約 |
| `cross-references.md` | #4（追加） → R2（検証） | #4、R2、#0 | 章節をまたいだ参照関係の登録 |

### ルール4：状態の推論 — ファイルの存在が進捗を示す

メインオーケストレーターはファイルシステムを確認することで各章の進捗状態を推論します：

```
文件不存在                        → 未开始
research/chXX-research.md 存在   → Step 1 完成（研究完成）
chapters/chXX.md 存在            → Step 2 完成（初稿完成）
reviews/chXX-*-review.md 存在    → Step 3 完成（审查完成）
feedback/chXX-*-feedback.md 存在 → Step 4 完成（评审完成）
chapters/chXX-final.md 存在      → 该章定稿
```

これによりフローは**中断点からの復旧**機能を備えます：中断後に再起動した際、メインオーケストレーターはファイルシステムをスキャンするだけで進捗を復元でき、追加の状態保存は不要です。

---

## 5. 関連ドキュメント

### フレームワークドキュメント

| ドキュメント | パス | 内容 |
|------|------|------|
| 5フェーズワークフロー詳細 | [`framework/workflow.md`](../framework/workflow.md) | 各Phaseの詳細ステップ、入口条件、出口条件 |
| File Pointersメカニズム | [`framework/file-pointers.md`](../framework/file-pointers.md) | File Pointersの設計原理と使用仕様 |
| レビューと評価プロトコル | [`framework/review-architecture.md`](../framework/review-architecture.md) | レビュアーと読者評価の採点基準、フィードバックフォーマット |
| 並行実行戦略 | [`framework/parallel-strategy.md`](../framework/parallel-strategy.md) | 複数章の並行、複数員の並行スケジューリング戦略 |
| 中断回復メカニズム | [`framework/recovery.md`](../framework/recovery.md) | フロー中断後の状態復旧方法 |

### Agent詳細ドキュメント

| Agent | ドキュメントパス |
|-------|---------|
| #0 メインオーケストレーター Orchestrator | [`agents/01-orchestrator.md`](./01-orchestrator.md) |
| #1 アーキテクト Architect | [`agents/02-architect.md`](./02-architect.md) |
| #2 リーダーアドボケート Reader Advocate | [`agents/03-reader-advocate.md`](./03-reader-advocate.md) |
| #3 リサーチャー Researcher | [`agents/04-researcher.md`](./04-researcher.md) |
| #4 ライター Writer | [`agents/05-writer.md`](./05-writer.md) |
| R1 ソースコードレビュアー Code Reviewer | [`agents/06-code-reviewer.md`](./06-code-reviewer.md) |
| R2 コンシステンシーレビュアー Consistency Reviewer | [`agents/07-consistency-reviewer.md`](./07-consistency-reviewer.md) |
| R3 コンテンツレビュアー Content Reviewer | [`agents/08-content-reviewer.md`](./08-content-reviewer.md) |
| RS 大学生リーダー | [`agents/09-reader-panel.md`](./09-reader-panel.md) |
| RE エンジニアリーダー | [`agents/09-reader-panel.md`](./09-reader-panel.md) |
| RH ホビイストリーダー | [`agents/09-reader-panel.md`](./09-reader-panel.md) |
| #11 ブックバインダー Bookbinder | [`agents/10-bookbinder.md`](./10-bookbinder.md) |
| #12 品質検査員 Quality Inspector | [`agents/11-quality-inspector.md`](./11-quality-inspector.md) |

### テンプレートファイル

| テンプレート | パス | 新プロジェクト開始時の操作 |
|------|------|----------------|
| ソースマップ | [`templates/source-map.md`](../templates/source-map.md) | 対象ソースコードのディレクトリ構造とコアモジュールを記入 |
| アウトラインテンプレート | [`templates/outline.md`](../templates/outline.md) | 初期章節プランを記入（#1 アーキテクトが補助可能） |
| スタイルガイド | [`templates/style-guide.md`](../templates/style-guide.md) | 執筆スタイルの好みとコード表示規則を記入 |
| 用語集 | [`templates/glossary.md`](../templates/glossary.md) | 既知の用語の定義と翻訳を記入 |
| 比喩レジストリ | [`templates/metaphor-registry.md`](../templates/metaphor-registry.md) | 空白のまま、執筆過程で徐々に埋める |
