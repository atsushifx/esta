---
title: プロジェクト構成ガイド
description: フィクスチャ・テスト・バリデータのファイル構成とディレクトリ設計のルールを解説します。
sidebar_position: 3
slug: /project-structure
---

## プロジェクト構成ガイド

この章では、E2E Fixture Framework を導入する際の**プロジェクト構成ルール**と、
推奨されるフォルダの分け方・命名規則について解説します。

---

### プロジェクト構成

このセクションでは、ESTA内で新たにサブプロジェクトを作成する際に、推奨されるプロジェクトの構成を説明します。

#### 🗂 推奨フォルダ構成

サブプロジェクトでの、推奨フォルダ構成は、以下のようになります:

```bash
packages/
├── your-feature/
│   ├── src/
│   │   ├── extractor.ts
│   │   └── utils/
│   │       └── normalize.ts
│   ├── tests/
│   │   └── e2e/
│   │       ├── framework.e2e.spec.ts
│   │       └── fixtures/
│   │           └── markdown/
│   │               └── headings/
│   │                   └── h1-case/
│   ├── shared/
│   │   └── types/
│   │       └── index.ts                ← 共通の型定義（例：`ParsedDocument`, `ExtractResult`）
│   └── README.md
```

> 💡 各パッケージでは、`shared/types` ディレクトリを設けて
> パッケージ内で使用する共通型を整理している場合があります (詳細は省略)。

#### 📦 各構成要素の役割

| ディレクトリ / ファイル         | 役割                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| src/                            | プロジェクトにおける、各種ソース (例:設定ファイル読み込みやツールのインストールなど) |
| src/utils/                      | プロジェクト用ユーティリティ                                                         |
| tests/e2e/                      | E2Eテスト用のspecファイル配置先                                                      |
| tests/e2e/framework.e2e.spec.ts | E2E Fixture Framework用specファイル (テスト本体)                                     |
| tests/e2e/fixtures/             | E2E Fixture Test用各fixture配置ディレクトリ                                          |
| shared/type/                    | プロジェクト内共通型設定                                                             |

#### 命名規則・管理のポイント

- **処理対象別・用途別にディレクトリ階層で整理**する (例：markdown/headings/h1-case/)
- **一時無効化したい場合**は、`#`ではじめる (例：`#drafts/`)

### テスト構成

`fixture`下の各種テストは、次のようなディレクトリ/ファイルで構成されます:

```bash
fixtures/
  └── markdown/
      └── headings/
           └── h1-case/
                ├── input.md
                └── output.json
```

#### 📦 テストケースの構成要素

| ディレクトリ / ファイル     | 役割                                |
| --------------------------- | ----------------------------------- |
| `markdown/`                 | メインカテゴリー (マークダウン)     |
| `markdown/headings/`        | サブカテゴリー (見出し)             |
| `markdown/headings/h1-case` | テストケース (見出しLv1)            |
| `input.md`                  | 入力ファイル (マークダウンファイル) |
| `output.json`               | 出力ファイル (input.mdのパース結果) |

### まとめ

この章では、E2E Fixture Framework を活用するうえでの**プロジェクト全体の構成ルール**と**fixtureディレクトリの設計方針**を確認しました。

- 各プロジェクトは `src/`, `tests/e2e/`, `shared/types/` などの構造で整理
- `fixtures/` 以下は「カテゴリ → サブカテゴリ → テストケース」の3階層構成が基本
- テストケースは 1ディレクトリ＝1ケース（`input` + `output` のペア）で定義
- 除外したいケースは `#` 付きで明示的にコメントアウト可能

この構成を守ることで、**テストの可読性・拡張性・保守性**が飛躍的に高まります。
次章では、実際に fixture をどのように書くかを見ていきましょう👇
