---
title: パーサ、バリデータの理解と拡張
description: 用意されたparser, validatorの役割、カスタムパーサ・バリデーションの作成方法を紹介します。
sidebar_position: 6
slug: /parsers-and-validators
---

## 第6章 パーサ、バリデータの理解と拡張

この章では、E2E Fixture Framework における **パーサ（parser）** と **バリデータ（validator）** の役割、およびそれらを拡張する方法について解説します。

> カスタム parser/validator 機能は現在未実装です / Issue #73 にて仕様検討中

---

### パーサとバリデータの役割

E2E Fixture Framework では、入力データ `input.<ext>` の処理結果と、期待される出力 `output.json` を比較してテストを行います。

このとき、**parser** は `input.<ext>` を対象モジュールに渡す形式へ変換し、**validator** は処理結果と `output.json` を比較して検証します。

- `parser`: 入力データ (Markdown、テキストなど) を対象モジュール向けに整形
- `validator`: 対象モジュールの実行結果と `output.json` を比較し、テストの成否を判断

Framework にはファイル種別に応じたデフォルトの `parser` / `validator` が割り当てられますが、**独自の`parser`, `validator`を割り当てる**こともできます。

#### 🔁 処理の流れ

```text
input.md / input.json / input.txt
        │
        ▼
     parser
        │
        ▼
  test function (テスト対象)
        │
        ▼
   validator
        │
        ▼
output.json（期待値）との比較 → 成否
```

### デフォルトの挙動

#### デフォルトパーサ

ファイル種別によって、自動的にパーサを選択し、入力データをパースします。

| 拡張子 | ファイル種別     | 処理内容                              |
| ------ | ---------------- | ------------------------------------- |
| `.txt` | プレインテキスト | テキストをそのまま返す                |
| `.md`  | マークダウン     | Markdownをパースした結果 (AST) を返す |

#### デフォルトバリデータ

実行結果を、`output.json`とで厳密に比較します。

| 拡張子 | ファイル種別     | 処理内容                                                       |
| ------ | ---------------- | -------------------------------------------------------------- |
| `.txt` | プレインテキスト | テキストを厳密に比較                                           |
| `.md`  | マークダウン     | `type: "markdown"`となるASTについて、headersやtokens構造を比較 |

#### `output.json`の例

- `plaintext`:

  ```json
  // output.json
  {
    "type": "plaintext",
    "text": "this is plaintext."
  }
  ```

- `markdown`:

  ```json
  // output.json
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

> `ast`は`mdast`のASTを想定しています。

### パーサ・バリデータのカスタマイズ (検討中)

> ※ カスタム parser/validator 機能は現在未実装です。Issue #73 にて仕様検討中。

#### カスタムパーサの作成

<!-- textlint-disable ja-technical-writing/sentence-length -->

Issue #73 で検討中の仕様に合わせ、パーサ自体は「生のパース結果」(Markdown なら AST、プレーンテキストなら文字列) を返し、executor 側で `TResult` を組み立てる方針とします。

<!-- textlint-enable -->

カスタムパーサの例。

- `plaintext`:

  ```typescript
  // src/parsers/parseText.ts
  import type { ParserFunction } from '@ag-e2e/framework';

  // 入力文字列をそのまま返す
  export const parseText: ParserFunction<string> = (input) => input;
  ```

- `markdown`:

  ```typescript
  // src/parsers/parseMarkdown.ts
  import type { ParserFunction } from '@ag-e2e/framework';
  import type { Root } from 'mdast';
  import { remark } from 'remark';

  // remark-parse で AST を生成
  export const parseMarkdown: ParserFunction<Root> = (input) => remark().parse(input) as Root;
  ```

このように、`ParserFunction<Type>`にしたがった`parser`を書くことで、簡単にカスタムパーサを作成できます。

#### カスタムバリデータの作成

Issue #73 で検討中の仕様に合わせ、バリデータも`tester`の処理結果 (`plaintext`: `string`, `markdown`: `ast`) を渡す方式とします。

カスタムバリデータの例。

- `plaintext`:

  ```typescript
  // src/validators/validateText.ts
  import type { ValidatorFunction } from '@ag-e2e/framework';

  export const validateText: ValidatorFunction<string> = (actual, expected) => {
    // 完全一致ではなく包含チェック
    return actual.includes(expected);
  };
  ```

- `markdown`:

  ```typescript
  import type { ValidatorFunction } from '@ag-e2e/framework';
  import type { Root } from 'mdast';

  export const validateMarkdown: ValidatorFunction<Root> = (actualAst, expectedAst) => {
    // シンプルに JSON.stringify で比較
    return JSON.stringify(actualAst) === JSON.stringify(expectedAst);
  };
  ```

このように、`ValidatorFunction<Type>`にしたがった`validator`を書くことで、簡単にカスタムバリデータを作成できます。

#### カスタムパーサ／バリデータの利用方法

Issue #73 で検討中の仕様にしたがい、`AgE2eFixtureFramework`のコンストラクターでカスタムパーサ、カスタムバリデータを設定します。
設定された場合、`executor`側でカスタムパーサやカスタムバリデータを自動的に使用します。
設定されていない場合は、デフォルトのパーサ、バリデータを使用します。

```typescript
import type { ParserFunction, ValidatorFunction } from '@ag-e2e/framework';
import { AgE2eFixtureFramework } from '@ag-e2e/framework';
import { parseText } from './parsers/parseText';
import { validateText } from './validators/validateText';

// テスト対象関数（tester）は生パース結果を受け取って処理を行う
const tester = (raw: string) => {
  // 例: raw を加工して何らかの結果を返す
  return raw.toUpperCase();
};

// フレームワークインスタンス生成時に parser/validator を指定
const framework = new AgE2eFixtureFramework(tester, {
  parser: parseText, // plaintext 用カスタムパーサ
  validator: validateText, // plaintext 用カスタムバリデータ
});

// 実行例
await framework.runTest('fixtures/example/input.txt');
```

- `EXT_TO_FILETYPE`で拡張子とファイル種別を関連付け (`.txt`'→`plaintext`, `.md`'→`markdown`)
- **カスタム設定があれば優先、なければデフォルト** (`plaintext` → `string`, `markdown`→ AST)
- ファイル読み込みやテスト実行は、`executor`側で一貫して行う (`parser`, `validator`の実装はシンプル)
- ファイル種別が複数ある場合は、ファイル種別ごとに別の`spec.ts`を作成して対応する
