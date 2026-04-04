# Scriptorium の使い方

> このガイドでは、Scriptorium フレームワークを使ってゼロから技術書を完成させる方法を説明します。

---

## 前提条件

- AI コーディングアシスタント（[Claude Code](https://claude.ai/code)、[OpenCode](https://opencode.ai)、[Cursor](https://cursor.sh) など）
- 執筆対象のオープンソースプロジェクトのソースコード（Spring Framework、Redis、Vue.js など）
- GitHub アカウント

---

## ステップ 1：書籍プロジェクトを作成する

GitHub で **"Use this template"** をクリックして書籍リポジトリを作成：

```
https://github.com/lordmos/tech-editorial
```

またはローカルにクローン：

```bash
git clone https://github.com/lordmos/tech-editorial.git my-book
cd my-book
```

AI ツールでこのディレクトリを開いてください（Claude Code / OpenCode / Cursor は `CLAUDE.md` を自動で読み込みます）。

---

## ステップ 2：プロジェクト情報を入力する

ルートディレクトリの `CLAUDE.md` を開き、書籍の基本情報を入力してください：

```markdown
## 📖 About This Book Project

- **Book Title**: Spring Framework ソースコード深層解析
- **Source Project**: spring-projects/spring-framework
- **Target Reader**: Java 経験 3 年以上のバックエンドエンジニア
- **One-line Description**: Spring コアモジュールのソースコードを読み、IoC/AOP の設計哲学を理解する
```

---

## ステップ 3：Phase 1 — アウトライン確定

**目標**：書籍構成の決定とソースコードマッピングの作成。

**AI アシスタントで実行（以下のプロンプトをコピーして使用）：**

```
agents/02-architect.md で定義されているアーキテクトの役割を担ってください。

コンテキスト：
- 対象書籍：[書籍タイトル]
- ソースリポジトリ：[ローカルパスまたは GitHub URL]
- 対象読者：[読者プロフィール]

タスク：
1. ソースコードのディレクトリ構成を分析し、コアモジュールを特定する
2. outline.md を生成（8〜12 章を推奨、各章に 2〜3 文の説明）
3. source-map.md を生成（各章を対応するソースファイル/ディレクトリにマッピング）

出力先：outline.md、source-map.md
```

アウトラインを確認したら、読者アドボケートの視点で再確認：

```
agents/03-reader-advocate.md で定義されている読者アドボケートの役割を担ってください。

コンテキスト：outline.md（読み込んでください）
対象読者：[読者プロフィール]

タスク：読者の視点でアウトラインをレビュー——学習曲線は適切か？前提知識は明確か？章の順序は自然に流れるか？
```

**Phase 1 の完了条件**：`outline.md` と `source-map.md` が確定済み。

---

## ステップ 4：Phase 2 & 3 — 逐章リサーチ + 執筆

各章に対して 2 つの Agent を順番に実行：

### リサーチ（Researcher）

```
agents/04-researcher.md で定義されているリサーチャーの役割を担ってください。

ファイルポインター：
- source-map.md（第 N 章の部分）
- outline.md（第 N 章の部分）
- [関連するソースコードファイルのパス]

タスク：第 N 章「[章タイトル]」の深度ソースコード調査を行い、完全なリサーチレポートを作成する。
出力先：research/ch0N-report.md
完了後に更新：checkpoint.md
```

### 執筆（Writer）

```
agents/05-writer.md で定義されているライターの役割を担ってください。

ファイルポインター：
- research/ch0N-report.md
- outline.md（第 N 章の部分）
- style-guide.md
- glossary.md
- metaphor-registry.md

タスク：リサーチレポートをもとに、第 N 章の完全な草稿を執筆する。
出力先：chapters/ch0N-draft.md
完了後に更新：checkpoint.md、metaphor-registry.md（この章の新しいメタファーを追記）
```

**バッチ処理のヒント**：「第 1 章から第 3 章を順番に処理して」と伝えると、AI が自動的にループします。

---

## ステップ 5：Phase 4 — 三並行レビュー

各章の草稿が完成したら、3 つのレビュー Agent を同時に起動（それぞれ独立したセッションで並行実行可能）：

| レビュアー | 仕様ファイル | フォーカスポイント |
|-----------|------------|-----------------|
| R1 コードレビュー | `agents/06-code-reviewer.md` | コードスニペットの正確性、API バージョン |
| R2 一貫性レビュー | `agents/07-consistency-reviewer.md` | 章をまたいだ用語・比喩の一貫性 |
| R3 コンテンツレビュー | `agents/08-content-reviewer.md` | 読みやすさ、論理構成、文量 |

**3 つのレビュー完了後**、AI にレビュー意見を統合して修正させる：

```
reviews/ch0N-r1.md、reviews/ch0N-r2.md、reviews/ch0N-r3.md のレビュー意見を統合し、
chapters/ch0N-draft.md を修正して chapters/ch0N-final.md に出力してください。
```

---

## ステップ 6：Phase 5 — 出版

すべての章が最終確定したら、ブックバインダーを実行：

```
agents/10-bookbinder.md で定義されているブックバインダーの役割を担ってください。

ファイルポインター：
- outline.md
- chapters/ch01-final.md ～ chapters/chNN-final.md
- style-guide.md

タスク：すべての章を統合し、統一されたフォーマットの完全な原稿を生成する。
出力先：output/book-final.md（または output/ 以下の複数ファイル形式）
```

---

## 進捗管理

いつでも `checkpoint.md` でプロジェクトの進捗を確認：

```bash
cat checkpoint.md
```

推奨フォーマット：

```markdown
## 進捗概要
- [x] Phase 1: アウトライン確定
- [x] Phase 2: 共有リソース構築
- [ ] Phase 3: 逐章執筆（3/12 完了）
  - [x] 第 1 章
  - [x] 第 2 章
  - [x] 第 3 章
  - [ ] 第 4 章 ← 次のステップ
...
```

---

## ヒント

**💡 いつでも中断・再開できます**  
すべての状態はファイルに保存されています。AI に「`checkpoint.md` を読んで、続きから再開してください」と伝えるだけです。

**💡 並列処理で高速化**  
Phase 3 と Phase 4 の各章は相互に独立しているため、複数の AI セッションで同時並行処理できます。  
詳細：[DAG バッチ実行戦略](/ja/framework/parallel-strategy)

**💡 共有ファイルは執筆とともに進化する**  
`glossary.md` と `metaphor-registry.md` は執筆を通じて継続的に更新されます。Writer を実行する前に必ず最新版を渡してください。

**💡 agents/ と framework/ は変更しないでください**  
この 2 つのディレクトリはフレームワークのコアです。書籍プロジェクトのすべての Agent にとって読み取り専用として扱ってください。

---

## 全パイプライン一覧

```
Phase 1  アウトライン確定   → outline.md + source-map.md
Phase 2  共有リソース構築   → glossary.md + style-guide.md + metaphor-registry.md
Phase 3  逐章執筆          → research/ch0N-report.md → chapters/ch0N-draft.md
Phase 4  三並行レビュー     → reviews/ch0N-{r1,r2,r3}.md → chapters/ch0N-final.md
Phase 5  出版              → output/book-final.md
```

> 詳細はこちら：[5フェーズ制作パイプライン](/ja/framework/workflow)、[チェックポイント回復](/ja/framework/recovery)
