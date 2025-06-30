---
title: E2Eテストの実装
description: framework.e2e.spec.ts の記述方法と、fixtureを使ったテスト実装パターンを解説します。
sidebar_position: 5
slug: /writing-e2e-tests
---

## 第5章 E2Eテストの実装

この章では、E2E Fixture Framework を用いて実際にテストを記述する `framework.e2e.spec.ts` の構成と、
fixtureディレクトリからの読み込み・実行のパターンを解説します。

---

### 🧪 基本構成：テストスクリプトの最小例

まずは、E2Eテストを記述する `framework.e2e.spec.ts` のシンプルなサンプルです。

```ts
// tests/e2e/framework.e2e.spec.ts
// vitest
import { describe } from 'vitest';
// E2E Fixture Framework
import { AgE2eFixtureFramework } from '@ag-utils/e2e-fixture-framework';
// test target
import { analyzeText } from '../src/analyzeText';

beforeAll(() => {
  const framework = new AgE2eFixtureFramework(analyzeText);
});

describe('E2E Fixture Framework 基本テスト', () => {
  const fixturePath = path.resolve(__dirname, 'fixtures');
  framework.runAllFoundTests(fixturePath);
});
```

---

このテストスクリプトは、以下のような役割分担で構成されています：

#### ✅ `beforeAll`：前処理として Framework を初期化

```typescript
beforeAll(() => {
  framework.runAllFoundTests(fixturePath);
});
```

- テスト実行前に一度だけ `AgE2eFixtureFramework` のインスタンスを作成します
- コンストラクタには、実際に input を処理する関数 (ここでは `analyzeText` ) を渡します
- `analyzeText` は、マークダウン／テキストの内容に応じて抽出・変換・分析などを行うアプリケーション固有の処理関数です
  > 💡 `analyzeText` は、文字数カウント・用語抽出や Markdown の構文解析など、任意の処理を含んでもOKです

#### 🧪 describe: テストケースの定義ブロック

```typescript
describe('E2E Fixture Framework 基本テスト', () => {
  const fixturePath = path.resolve(__dirname, 'fixtures');
  framework.runAllFoundTests('fixtures');
});
```

- `__dirname`と`path.resolve()`を使って、`tests/e2e/`下の`fixtures`を絶対パスで指定しています。
  **相対パスで指定すると、環境によって失敗する可能性がある**ためです。
- `describe` は `vitest` の構文で、テストグループを表します
- `runAllFoundTests()` を呼び出すことで、指定ディレクトリ (この例では `fixtures`) の下にある全てのテストケースを読み込み、一括実行します

#### 📁 runAllFoundTests() の挙動

- `input.*` / `output.json` の組み合わせが存在するディレクトリを再帰的に探索 (最大2階層)
- テスト対象であるかを判定し、順に `test()` として登録していきます
- `#` で始まるディレクトリをスキップします (コメントアウト)
- `.skip-e2e`ファイルがあるディレクトリはスキップします

### 🔁 testCasesを明示的にスキャンしてループ実行する例

より細かな制御をしたい場合には、`findTestCases()` を使ってテストケースを個別にスキャンし、`runTest()` をループで呼び出すこともできます。

```typescript
// libs
import path from 'path';

// vitest
import { describe, it } from 'vitest';

// E2E Fixture Framework
import { AgE2eFixtureFramework } from '@ag-utils/e2e-fixture-framework';
import { AgE2eScanCategorizedTests } from '@ag-utils/e2e-fixture-framework';

// test target
import { analyzeText } from '../src/analyzeText';

// test cases取得
const framework = new AgE2eFixtureFramework(analyzeText);
const fixturesDir = path.resolve(__dirname, 'fixtures');
const testCases = AgE2eScanCategorizedTests(fixturesDir);

describe('E2E Fixture Framework - 明示的ループ実行', () => {
  testCases.forEach(({ name, path }) => {
    it(name, () => {
      const passed = framework.runTest(path);
      expect(passed).toBe(true);
    });
  });
});
```

#### 📁 明示的ループの挙動

- AgE2eScanCategorizedTests() は、3階層構造 (`fixtures/category/sub-category/test-case/`) に対応したスキャナ
- BDDスタイルの `it()` を使うことで、テスト名を自然文で記述でき、ログもわかりやすくなる
  各テストケースは `runTest(path)` で個別実行され、`expect(passed).toBe(true)` によって結果を検証
- `runTest()` を実行するかどうかを `if`文で判定できるため、細かいテスト制御が可能

### テストのスキップ

`runTests()` を用いた単一ケース実行においても、以下の条件により**テストは自動的にスキップされます**:

1. `casePath` 配下に存在する任意のディレクトリが `#` ではじまる場合
   → そのディレクトリは **コメントアウトされたものと見なされ、実行されません**

2. 任意の階層 (<メインカテゴリー>・<サブカテゴリー>・<テストケース>)に、`.skip-e2e`ファイルが存在する場合
   → そのテストケースは スキップ対象として扱われます

> *注意*:
> これらのスキップ処理は `findTestCases()` や `runAllFoundTests()` だけでなく、
> 単体実行の `runTests()` においても適用される仕様です。
> スキップ条件を認識していないと「なぜテストが実行されないのか分からない」状態に陥ることがあります。

### 🎯 注意点・ベストプラクティス

| 注意点                 | 内容                                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| `framework` のスコープ | グローバルで定義するか、`beforeAll` 内部で let 宣言して外部参照可に        |
| ディレクトリ階層       | 3段階構成を推奨: `fixtures/<メインカテゴリ>/<サブカテゴリ>/<テストケース>` |
| ファイル名固定         | input.* / output.json 以外は読み込まれない                                 |

### まとめ

- `framework.e2e.spec.ts` は、E2E Fixture Framework によるテストの「エントリポイント」
- `AgE2eFixtureFramework(analyzeText)` により、任意のロジックをE2E検証に組み込める
- テスト構造が整っていれば、実装ごとの記述は非常に簡潔かつ自動化しやすい
