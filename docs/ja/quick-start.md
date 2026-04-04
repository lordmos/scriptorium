# Scriptorium の使い方

> 各 Agent を手動で呼び出す必要はありません。一文で起動すれば、AI がすべての作業を自動で完了します。

---

## 3 ステップで始める

### ステップ 1：書籍プロジェクトを作成する

GitHub の **"Use this template"** をクリックして書籍リポジトリを作成：

```
https://github.com/lordmos/scriptorium
```

### ステップ 2：ソースコードを準備する

執筆したいオープンソースプロジェクトのソースコードをリポジトリディレクトリに置きます（またはパスを控えておきます）。

AI ツールでディレクトリを開いてください：[Claude Code](https://claude.ai/code)、[OpenCode](https://opencode.ai)、[Cursor](https://cursor.sh) など（`CLAUDE.md` を自動で読み込みます）。

### ステップ 3：この一文を言うだけ

```
[プロジェクト名] のソースコードは [ディレクトリパス] にあります。
QUICK_START.md を読んで、質問があれば聞いてください。
質問がなければ、作業を始めてください。
```

**以上です。** AI アシスタントが自動で：

1. `QUICK_START.md` を読んで完全な作業指針を把握
2. 書籍タイトル・対象読者などの基本情報を確認
3. アーキテクト役としてソースコードを分析し、アウトラインを生成
4. アウトラインをあなたに提示し、確認を求める
5. Phase 2→5 を自律的に実行——各章のリサーチ、執筆、三並行レビューを完了
6. 完成した原稿を納品

---

## あなたがすることは 3 つだけ

| タイミング | あなたの操作 |
|-----------|-------------|
| 起動時 | AI の基本的な質問に答える（タイトル、読者層など） |
| Phase 1 終了時 | アウトラインを確認または修正 |
| 完成時 | `output/book-final.md` を読む |

---

## 中断後の再開

いつでも作業を中断できます。次回のセッションで AI に伝えるだけ：

```
checkpoint.md を読んで、前回の続きから作業を再開してください。
```

---

## 詳細を学ぶ

| ドキュメント | 内容 |
|------------|------|
| [`QUICK_START.md`](https://github.com/lordmos/scriptorium/blob/main/QUICK_START.md) | AI オーケストレーターの入口ファイル（機械可読） |
| [`agents/00-system-overview.md`](/ja/agents/00-system-overview) | 12 の Agent の完全仕様 |
| [`framework/workflow.md`](/ja/framework/workflow) | 5 フェーズパイプライン詳細 |
| [`framework/parallel-strategy.md`](/ja/framework/parallel-strategy) | 並列加速戦略 |
| [`framework/recovery.md`](/ja/framework/recovery) | チェックポイント回復メカニズム |

