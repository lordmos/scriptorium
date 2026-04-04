<!--
  Translation status:
  Source file : README.md
  Source commit: 7685751
  Translated  : 2026-04-04
  Status      : up-to-date
-->

> **言語 / Language**: [简体中文](README.md) · [English](README.en.md) · **日本語** · [繁體中文](README.zh-TW.md)

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/lordmos/tech-editorial?style=flat-square&color=gold)](https://github.com/lordmos/tech-editorial/stargazers)
[![Forks](https://img.shields.io/github/forks/lordmos/tech-editorial?style=flat-square)](https://github.com/lordmos/tech-editorial/network/members)
[![Last Commit](https://img.shields.io/github/last-commit/lordmos/tech-editorial?style=flat-square)](https://github.com/lordmos/tech-editorial/commits)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Multi-Agent](https://img.shields.io/badge/Multi--Agent-12%20Agents-blueviolet?style=flat-square)]()
[![Docs](https://img.shields.io/badge/ドキュメント-lordmos.github.io-4a9eff?style=flat-square&logo=vitepress&logoColor=white)](https://lordmos.github.io/tech-editorial/ja/)
[![Powered by Meridian](https://img.shields.io/badge/Powered%20by-Meridian-f97316?style=flat-square)](https://github.com/lordmos/meridian)

# 📚 Scriptorium — 技術書籍マルチエージェント編集部フレームワーク

> **「ソースコード読解シリーズ」技術書籍のマルチエージェント協調執筆フレームワーク**

## 1. フレームワーク概要

本フレームワークは「ソースコード読解シリーズ」技術書籍向けに、完全なマルチエージェント編集部ワークフローを提供します。**12個のAI Agent**の連携により、アウトライン設計から最終出版までの全工程をカバーします。

コアコンセプト：

> **Agentはステートレスであり、ファイルシステムがステートフルである。**

各Agentは使い捨ての作業者です——前回何をしたかは記憶せず、すべての「記憶」は共有ファイルシステムに保存されます。メインオーケストレーターAgentは **File Pointers**（ファイルパス参照）を通じて各Agentに必要なコンテキストを精確に注入し、情報フローを制御可能・追跡可能にします。

---

## 2. クイックスタート

📖 **完全な使用ガイド → [オンラインドキュメント](https://lordmos.github.io/tech-editorial/ja/quick-start)**

**ステップ 1**：本フレームワークをクローンしてソースコードを準備

```bash
git clone https://github.com/lordmos/tech-editorial.git my-book
cd my-book
```

**ステップ 2**：AI コーディングアシスタント（Claude Code / OpenCode / Cursor など）でディレクトリを開き、この一文を伝える：

```
[プロジェクト名] のソースコードは [ディレクトリパス] にあります。
QUICK_START.md を読んで、質問があれば聞いてください。
質問がなければ作業を開始してください。
```

AI は [`QUICK_START.md`](QUICK_START.md) を読み込み、書籍名・読者層などの基本情報を確認した後、**5 フェーズ全体を自律的に実行**し、`output/book-final.md` を納品します。

あなたがすることは 3 つだけ：① AI の初期質問に答える → ② Phase 1 のアウトラインを承認する → ③ 最終原稿を読む。

**中断後の再開**：AI に伝えるだけ → `checkpoint.md を読んで、前回の続きから作業を再開してください。`

---

## 3. 適用ケース

本フレームワークは以下の種類の技術書籍プロジェクトに適しています：

- ✅ **オープンソースプロジェクトのソースコード読解**型の技術書籍（例：《[フレームワーク名] ソースコード深度解析》）
- ✅ 大規模コードリポジトリのアーキテクチャ分析を章ごとに解説する書籍
- ✅ 多層次の読者（学生・エンジニア・愛好者）を対象とした技術解説
- ✅ 多人数による協調・プロセス管理が必要な長編技術ライティングプロジェクト

**適していない用途**：純粋な理論教材、API リファレンスドキュメント、短編技術ブログ。

---

## 4. システムアーキテクチャ概要

本フレームワークは **Hub-Spoke（ハブアンドスポーク）アーキテクチャ**を採用しています：

```
                    ┌─────────────────┐
                    │  メインオーケ    │  ← Hub（ハブ）
                    │  ストレーター #0 │
                    └──────┬──────────┘
           ┌───────────────┼───────────────┐
           │               │               │
      ┌────▼────┐    ┌─────▼────┐    ┌─────▼────┐
      │ Agent A │    │ Agent B  │    │ Agent C  │  ← Spokes（スポーク）
      └─────────┘    └──────────┘    └──────────┘
```

- **メインオーケストレーター（#0）** は唯一のスケジューリングセンターで、すべてのサブAgentはメインオーケストレーターとのみ通信します
- サブAgent同士は **直接対話せず**、共有ファイルシステムを通じて情報を共有します
- メインオーケストレーターは **File Pointers** によって各Agentの読み書き範囲を精確に制御し、情報過多を防ぎます

---

## 5. Agentチーム一覧

| 番号 | 名前 | ロール比喩 | Agentタイプ | 担当 |
|------|------|----------|-----------|------|
| #0 | メインオーケストレーター Orchestrator | 総合監督 | general-purpose | 全工程をスケジューリング、進捗と依存関係を管理 |
| #1 | アーキテクト Architect | 技術ディレクター | general-purpose | 書籍のアウトラインと知識グラフを設計 |
| #2 | リーダーアドボケイト Reader Advocate | プロダクトマネージャー | general-purpose | 読者視点からアウトラインの妥当性を審査 |
| #3 | リサーチャー Researcher | ソースコード考古学者 | explore | ソースコードを深く調査し、リサーチレポートを作成 |
| #4 | ライター Writer | ベストセラー作家 | general-purpose | 章の本文を執筆 |
| R1 | コードレビュアー Code Reviewer | コード考証専門家 | explore | 章内のすべてのコード参照の技術的正確性を検証 |
| R2 | 一貫性レビュアー Consistency Reviewer | 記憶管理者 | explore | 章をまたいだ用語・データ・ロジックの一貫性を確認 |
| R3 | コンテンツレビュアー Content Reviewer | シニアエディター | general-purpose | 可読性・構成の完全性・センシティビティを審査 |
| RS | 大学生読者 | コンピュータ専攻の大学3年生 | general-purpose | 初学者視点での読書評価をシミュレート |
| RE | エンジニア読者 | 8年経験のフルスタックエンジニア | general-purpose | プロ開発者視点での読書評価をシミュレート |
| RH | 愛好者読者 | 技術背景のない科学技術愛好者 | general-purpose | 非技術読者視点での読書評価をシミュレート |
| #11 | ブックバインダー Bookbinder | 組版デザイナー | general-purpose | Markdown→HTML出版パイプライン |

---

## 6. 5段階ワークフロー概要

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 5
アウトライン  共有リソース  章ごとの    原稿統合・   装丁・
確定         構築         執筆        最終監査     発行
```

### Phase 1：アウトライン確定

**参加Agent**：#1 アーキテクト、#2 リーダーアドボケイト、R3 コンテンツレビュアー

アーキテクトがソースコード構造に基づいて章のアウトラインと知識グラフを設計し、リーダーアドボケイトが対象読者視点から修正提案を行い、コンテンツレビュアーがアウトラインの初期審査を実施します。最終的にユーザーが承認した `outline.md` を成果物として産出します。

### Phase 2：共有リソースの構築

**参加Agent**：#0 メインオーケストレーター（直接実行）

確定したアウトラインに基づいて、すべてのAgentが後続で必要とする共有リソースファイルを構築します：

- `source-map.md` — ソースコードのディレクトリ構造とコアモジュールの説明
- `glossary.md` — 書籍全体の統一用語集
- `metaphor-registry.md` — 比喩レジストリ（章をまたいだ比喩の衝突を防ぐ）
- `style-guide.md` — ライティングスタイルガイド
- `cross-references.md` — 章間参照登録表

### Phase 3：章ごとの執筆（大綱の章数分繰り返し）

各章は順番に4つのステップを経ます：

| ステップ | Agent | 成果物 |
|------|-------|------|
| Step 1 ソースコード調査 | #3 リサーチャー | `research/chXX-research.md` |
| Step 2 章の執筆 | #4 ライター | `chapters/chXX.md` |
| Step 3 三者レビュー | R1 + R2 + R3（並行） | 各自のレビューレポート |
| Step 4 読者評価 | RS + RE + RH（並行） | 各自の評価フィードバック |

> 💡 **並行最適化**：Step 3の3人のレビュアーは同時に作業できます（データ依存性が異なるため）；Step 4の3人の読者評価も並行可能です。複数章も分割バッチで並行処理できます（例：3 章ごとのバッチ）。

### Phase 4：原稿統合・最終監査

**参加Agent**：#0 メインオーケストレーター、R1 + R2 + R3（再審査）

書籍全体の最終監査を実施：用語の一貫性、章間参照の完全性、コードスニペットの正確性、全体的な叙述の連続性。

### Phase 5：装丁・発行

**参加Agent**：#11 ブックバインダー

Markdown→HTML変換、**Mermaid図のレンダリング**（Mermaid.jsを使用）、ASCIIアート→SVGレンダリング（既存コンテンツとの互換性）、目次生成、スタイル適用を実行します。発行可能な静的サイトを成果物として産出します。

---

## 7. ディレクトリ構成

```
tech-editorial/
├── README.md                  ← 本ファイル：フレームワーク概要とクイックスタート
├── agents/                    ← 各Agentの詳細仕様
│   ├── 00-system-overview.md  ← システムアーキテクチャとAgentレジストリ
│   ├── 01-orchestrator.md     ← #0 メインオーケストレーターAgent
│   ├── 02-architect.md        ← #1 アーキテクトAgent
│   ├── 03-reader-advocate.md  ← #2 リーダーアドボケイトAgent
│   ├── 04-researcher.md       ← #3 リサーチャーAgent
│   ├── 05-writer.md           ← #4 ライターAgent
│   ├── 06-code-reviewer.md    ← R1 コードレビュアー
│   ├── 07-consistency-reviewer.md ← R2 一貫性レビュアー
│   ├── 08-content-reviewer.md ← R3 コンテンツレビュアー
│   ├── 09-reader-panel.md     ← 読者評価パネル（大学生/エンジニア/愛好者）
│   └── 10-bookbinder.md       ← #11 ブックバインダーAgent
├── framework/                 ← ワークフロー、ルール、メカニズム
│   ├── workflow.md            ← 5段階詳細ワークフロー
│   ├── file-pointers.md       ← File Pointersメカニズムの説明
│   ├── review-architecture.md ← レビュー・評価プロトコル
│   ├── parallel-strategy.md   ← 並行実行戦略
│   └── recovery.md            ← 中断復旧と障害対応
└── templates/                 ← 記入可能なプロジェクトテンプレート
    ├── source-map.md          ← ソースマップテンプレート
    ├── outline.md             ← アウトラインテンプレート
    ├── style-guide.md         ← スタイルガイドテンプレート
    ├── glossary.md            ← 用語集テンプレート
    ├── metaphor-registry.md   ← 比喩レジストリテンプレート
    ├── chapter-summary.md     ← 章要約テンプレート（長期記憶）
    ├── checkpoint.md          ← 進捗チェックポイントテンプレート
    └── audit-log.md           ← 監査ログテンプレート
```

### サブディレクトリの説明

| ディレクトリ | 用途 |
|------|------|
| `agents/` | 各Agentの完全な仕様：システムプロンプトテンプレート、入出力仕様、File Pointersリスト、品質チェックポイント |
| `framework/` | 特定のAgentに依存しない汎用ワークフロードキュメント：フェーズ分割、レビュープロトコル、ファイルフォーマット仕様、協調メカニズム |
| `templates/` | 新プロジェクト開始時に記入するテンプレートファイル。`{{変数}}` プレースホルダーを含み、記入後にプロジェクト共有リソースとなります |

---

## 8. コア設計原則

### 原則 1：Agentはステートレス、ファイルシステムはステートフル

各Agentは呼び出されるたびに「まっさら」な状態から始まります——以前の対話を覚えていません。呼び出しをまたいで保持する必要があるすべての情報（進捗、レビュー結果、用語集……）はファイルシステムに書き込む必要があります。これにより：
- どのAgentインスタンスも置き換え可能
- 障害復旧は再呼び出しのみで済み、対話履歴を遡る必要がない

### 原則 2：すべてのAgentはメインオーケストレーターとのみ通信する（Hub-Spoke）

サブAgent同士は直接やり取りしません。メインオーケストレーターが唯一のスケジューリングセンターとして：
- どのAgentを呼び出すかを決定する
- File Pointersによって必要なコンテキストを注入する
- 成果物を収集して次のステップを決定する

### 原則 3：File Pointersが読み書き範囲を精確に制御する

各Agentには明確に伝えられます：
- **必読ファイル**：タスク実行前に読まなければならないファイルリスト
- **書き込み可能ファイル**：書き込み・修正が許可されているファイルパス
- **書き込み禁止ファイル**：変更してはならないファイルリスト

これにより、Agentが情報過多で低品質の成果物を出すことを防ぎ、誤った書き込みも防止します。

### 原則 4：長期記憶は共有ファイルによるAgent間情報伝達で実現する

Agent Aの成果物がファイルに書き込まれる → メインオーケストレーターがそのファイルをFile PointerとしてAgent Bに注入する → Agent BがAgent Aの「記憶」を取得する。代表的な共有ファイル：
- `chapter-summaries.md` — 完成した章の要約
- `glossary.md` — 書籍全体の用語集
- `metaphor-registry.md` — 使用済み比喩の登録
- `cross-references.md` — 章間の参照関係

### 原則 5：レビューと執筆を分離し、並行実行をサポートする

3人のレビュアー（R1 コード、R2 一貫性、R3 コンテンツ）はチェックする次元が異なり、データ依存関係が重複しないため、**並行実行**が可能です。同様に、3人の読者評価（RS/RE/RH）も並行できます。これにより各章の処理時間が大幅に短縮されます。

### 原則 6：中断から復旧可能

ファイルシステムの状態がプロジェクトの進捗を完全に反映しています。プロセスが中断された場合（Agentの故障、手動一時停止など）、メインオーケストレーターは既存ファイルを確認して現在の進捗を把握し、最初からやり直すことなく中断点から継続できます。

---

## 9. スキル要件

本フレームワークを使用するには以下の知識と能力が必要です：

| スキル領域 | 具体的な要件 | 重要度 |
|---------|---------|---------|
| AI Agent プロンプトエンジニアリング | システムプロンプトの書き方、Agentの動作調整の理解（Claude、GPTなど） | ⭐⭐⭐ 必須 |
| 対象ソースコードの言語 | 対象オープンソースプロジェクトが使用するプログラミング言語の習熟（例：TypeScript、Java、Go など） | ⭐⭐⭐ 必須 |
| プロジェクト管理 | 依存関係の分析、進捗トラッキング、タスク分解；DAG（有向非巡回グラフ）型ワークフローの理解 | ⭐⭐ 重要 |
| Markdownライティング | Markdown構文の習熟、文書の構造化ライティングの理解 | ⭐⭐ 重要 |
| Node.js 基礎 | Phase 5の装丁ビルドスクリプト用（Markdown→HTML変換、静的サイト生成） | ⭐ オプション |

---

## 🎯 このフレームワークを使ったプロジェクト

> このフレームワークで何かを書きましたか？[教えてください！](https://github.com/lordmos/tech-editorial/issues/new?template=show_your_book.yml)

| 書名 / Book Title | 対象ソースコード | 著者 |
|------------------|---------|------|
| [Angular 依存性注入システム深度解析（サンプル）](examples/angular-di/) | [angular/angular](https://github.com/angular/angular) | [@lordmos](https://github.com/lordmos) |

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=lordmos/tech-editorial&type=Date)](https://star-history.com/#lordmos/tech-editorial&Date)

---

## 💖 本プロジェクトを支援する

このフレームワークが時間の節約に役立った場合、作者にコーヒー一杯のご支援をいただけると嬉しいです ☕

| プラットフォーム | リンク |
|------|------|
| 愛発電（中国国内） | [afdian.com/@lordmos](https://afdian.com/a/lordmos) |
<!-- | Ko-fi（国際） | [ko-fi.com/lordmos](https://ko-fi.com/lordmos) | -->
<!-- | WeChat / Alipay | <details><summary>QRコードで支払い</summary>（収款码の画像を `assets/wechat-pay.png` および `assets/alipay.png` に配置してください）</details> | -->

---

## ライセンスと謝辞

本フレームワークは実際のマルチエージェント協調書籍プロジェクトから抽出され、抽象化処理によりプロジェクト固有の内容をすべて除去し、再利用可能なワークフローとアーキテクチャ設計のみを保持しています。

ご自身のプロジェクトのニーズに合わせて自由に修正・拡張してください。

<sub>Built with [Meridian](https://github.com/lordmos/meridian) · open-source ops toolkit for Agent projects</sub>
