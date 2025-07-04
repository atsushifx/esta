---
title: フィクスチャの書き方
description: input.md, output.json を用いたテストデータの作成方法と設計のポイントを解説します。
sidebar_position: 4
slug: /writing-fixtures
---

## 第4章 フィクスチャの書き方

この章では、E2E Fixtures Framework における **テストデータ（フィクスチャ）の作成方法**と、より効率的でメンテナブルなテスト設計を行うためのポイントを解説します。

### 1. フィクスチャファイルの基本構成

#### 1.1 フィクスチャ構成図

以下に、基本的なフィクスチャの構成を示します。

```bash
fixtures/
└── markdown/
    └── headings/
        └── h1-basic/
            ├── input.md
            └── output.json
```

E2E Fixture Framework のテストケースは、**1ディレクトリ＝1フィクスチャ**の構成で記述します。
各ディレクトリには、`input.<拡張子>` と `output.json` のペアを必ず含めます。

- `input.md` (または`.txt`,`.error`):
  - テスト対象の入力ファイル
  - 拡張子は自由に設定できますが、対象形式ごとに一貫性を持たせることが推奨される
  - `.error` は異常系テスト用の印 (詳細は後述 [error拡張子](#22-error拡張子について))

- `output.json`:
  - 処理結果として期待される出力
  - JSON 形式で書くことで、差分比較が明確かつ自動化可能
  - `type` プロパティでファイル種別を指定 (例: `"type": "markdown"`)

#### 1.2 ファイルの役割と命名

テストケースにおけるディレクトリ名/ファイル名の役割は次の通りです。

| 要素           | 命名ルール／補足                                                                    |
| -------------- | ----------------------------------------------------------------------------------- |
| ディレクトリ名 | 意味のあるケース名 (例：`heading-level1`, `invalid-nesting`)                        |
| ファイル名     | `input.<ext>` と `output.json` のペアで固定                                         |
| 除外用の命名   | `#` で始まるディレクトリ (例：`#drafts/`)は `runAllFoundTests()` で実行対象より除外 |

テストケースの管理を明確にし、実行対象を柔軟に制御するための基本ルールです。
特に、命名規則の統一はチーム開発や CI 運用の効率化に貢献します。

### 1.3 命名の工夫とコメントアウト

テストケースやカテゴリの命名には、以下の工夫が効果的です。

- **状態を表す接尾語の活用**
  `-ok`, `-ng`, `-error` など、テストの状態や種類を示す接尾語を付けることで、分類やレビューがしやすくなる。

  | 状態 | 接尾語の例      | 説明                         |
  | ---- | --------------- | ---------------------------- |
  | 正常 | `-ok`, `-pass`  | 正常に処理されることを期待   |
  | 異常 | `-ng`, `-error` | エラーや例外が発生するケース |

- **意味のあるケース名の付与**
  テストの意図が一目でわかる名前を付けることで、テストケースの管理やレビューがスムーズになる。

- **一時的なコメントアウト**
  作業中や未完成のケースは、ディレクトリ名の先頭に `#` を付けてスキップ可能。
  これにより、`runAllFoundTests()` 実行時に自動的に除外され、テスト実行に影響を与えません。

> こうした命名規則とコメントアウトの運用は、テストの継続的な保守とチーム運用の効率化に寄与します。

### 2. 拡張子と`type`プロパティ

E2E Fixtures Framework では、入力ファイルの拡張子に応じて `output.json` の `type` プロパティを設定し、対応するパーサとバリデータを自動で切り替えます。

#### 2.1 `type`プロパティの概要

`type`プロパティの概要を以下に示します。

| 拡張子   | ファイル種別 (`type` の値) | `output.json` の `type` プロパティ                 |
| -------- | -------------------------- | -------------------------------------------------- |
| `.txt`   | `plaintext`                | `plaintext`                                        |
| `.md`    | `markdown`                 | `markdown`                                         |
| `.error` | `void` (エラー検証用)      | 実際のファイル形式 (`plaintext` または `markdown`) |

#### 2.2 `.error`拡張子について

拡張子 `.error` (ファイル種別:`void`)は、エラーケースを示す特別な拡張子です。
`.error`については、以下の特徴があります。

- `.error` 拡張子は異常系の入力を示し、通常のパーサ・バリデータに加えて `expectedErrorMessage` による検証をする。
  `output.json` 側では、元のファイル形式を `type` プロパティで指定する必要がある。
- `output.json` の `type` には、実ファイル種別（`plaintext` または `markdown`）を必ず指定する
- 将来的に新しい拡張子や種別を追加する場合は、`EXT_TO_FILETYPE` に新しい拡張子のマッピングを追加してください

> この仕組みにより、正常系だけでなくエラー検証も同一フレームワークで統一的に管理できます。

##### `type`の例

- `input.md` の場合 → `output.json` は `"type": "markdown"`
- `input.error` の場合 → `output.json` は `"type": "markdown"` に加えて `expectedErrorMessage` を記述

### 3. 正常系／異常系の構成例

フィクスチャの書き方を正常系と異常系に分けて、説明します。

#### 3.1 正常系 (`input.md` + `output.json`)

以下は、`input.md` と、対応する `output.json` の例です。

- 入力ファイル (`input.md`):

  ```markdown
  # 見出し1

  ## 見出し2
  ```

- 出力ファイル (`output.json`):

  ```json
  {
    "type": "markdown",
    "ast": {
      "headers": ["見出し1", "見出し2"],
      "tokens": [
        { "type": "heading", "level": 1, "text": "見出し1" },
        { "type": "heading", "level": 2, "text": "見出し2" }
      ]
    }
  }
  ```

- `"type": "markdown"` はファイル種別が Markdown であることを示す。
- `"type"` に基づいて対応するパーサとバリデータが実行される。
- その他のキーはパーサ固有の自由な構造で問題ない。
- 配列やオブジェクトを使い詳細な検証が可能。

#### 3.2 異常系 (`input.error` + `output.json`)

異常系 (`input.error`) は、テストでエラーが出ることを期待する特殊なマーカーです。
以下に、異常系でのフィクスチャ構成と、対応する入出力ファイルの例を示します。

- フィクスチャ構成:

```bash
fixtures/
└── markdown/
    └── headings-error/
        ├── input.error         ← Markdown 形式のエラーケース入力
        └── output.json         ← type: "markdown", expectedErrorMessage を定義
```

- 入力ファイル (`input.error`)

  ```markdown
  # 見出し1

  ### 見出し2 ← 見出しLevel3なのでエラー
  ```

- 出力ファイル (`output.json`)

  ```json
  {
    "type": "markdown",
    "expectedErrorMessage": "Heading level 3 is not allowed"
  }
  ```

- `"type": "markdown"` はファイル種別が Markdown であることを示す。
- `type` に基づいて対応するパーサとバリデータが実行される。
- `output.json` の `type` プロパティは **必ず実ファイル種別** (`"markdown"` または `"plaintext"`) を指定。

異常系の`fixtures`の例。

- input.error:

  ```markdown
  # 見出し1

  ### 見出し2 ← 見出しLevel3なのでエラー
  ```

- output.json:

  ```json
  {
    "type": "markdown",
    "expectedErrorMessage": "Heading level 3 is not allowed"
  }
  ```

##### 異常系での実行フロー

異常系の場合は、テストを次の手順で実行します:

```typescript
expect(() => {
  const parsedInput = parse(input);
  const result = tester(parsedInput);
}).toThrowError(new Error(expectedErrorMessage));
```

#### 3.3 テスト設計のポイント

- 最小ケースから正常系／異常系、境界値へと段階的に拡張していく
- コメントアウト (`#skip-case/`) を利用して、開発中のケースを簡単に分離できる
- 大きな JSON 出力はコメントなどで適宜補完し、可読性を保つ (コメント機能は将来対応予定)

上記のような戦略的なテスト設計を行うことで、後からの保守や仕様変更にも柔軟に対応しやすくなります。

### 4. JSON Schema の提供 (計画中)

将来的に GitHub Pages で JSON Schema を公開し、エディタや CI ツールで `output.json` の自動検証ができるようになります。

- `error.json` - エラーメッセージや異常系ケースの検証用
- `plaintext.json` → 改行数や整形された文字列の検証に対応
- `markdown.json` → Markdown の構文抽出やトークン構造を検証
- `mdast.json` → Markdown AST (MDAST) の厳格な構造検証用 (今後対応予定)

各 `output.json` ファイルの先頭で `$schema` プロパティに URL を指定し、エディタや CI が自動でバリデーションを実行できる仕組みを整備する予定です。

### まとめ

この章のまとめは、次の通りです。

- フィクスチャは `input` ファイルと `output.json` ファイルのペアで構成し、ディレクトリ単位で管理する。
- 命名規則やディレクトリ構成を工夫することで、テストの保守性、可読性、運用しやすさが大きく向上する。
- `type` プロパティにより、パーサやバリデータが自動的に切り替わり、正常系・異常系のテストを統一的に扱える。
- 将来的には JSON Schema の提供により、エディタや CI ツールによる output.json の自動バリデーションに対応できる。
