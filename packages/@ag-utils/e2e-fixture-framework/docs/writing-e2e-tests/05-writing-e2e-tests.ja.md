---
title: E2Eテストの実装
description: framework.e2e.spec.ts の記述方法と、fixtureを使ったテスト実装パターンを解説します。
sidebar_position: 5
slug: /writing-e2e-tests
---

## 第5章 E2Eテストの実装

この章では、E2E Fixture Framework を使ったテストスクリプトの基本構成と、fixture ディレクトリからテストケースを読み込み、実行する方法について解説します。

### 1 基本構成：テストスクリプトの最小例

<!-- textlint-disable ja-technical-writing/sentence-length -->

E2E Fixtures Framework テストの基本は、`framework.e2e.spec.ts` にテストスクリプトを記述し、
フレームワークを用いて指定したディレクトリ以下のテストケースを一括実行することです。

<!-- textlint-enable -->

#### 1.1 最小構成のテストスクリプト

以下に、最小構成のテストスクリプトの例を示します。

```typescript
// tests/e2e/framework.e2e.spec.ts
import { AgE2eFixtureFramework } from '@ag-utils/e2e-fixture-framework';
import path from 'path';
import { beforeAll, describe } from 'vitest';
import { analyzeText } from '../src/analyzeText';

let framework: AgE2eFixtureFramework;

beforeAll(() => {
  framework = new AgE2eFixtureFramework(analyzeText);
});

describe('E2E Fixture Framework 基本テスト', () => {
  const fixturePath = path.resolve(__dirname, 'fixtures');
  framework.runAllFoundTests(fixturePath);
});
```

- `beforeAll` で一度だけフレームワークのインスタンスを初期化している。
- `fixturePath` は絶対パスで指定し、`runAllFoundTests()` で全テストケースを一括実行する。
- これにより、`analyzeText` 関数を使った E2E テストが簡潔に記述できる。

### 1.2 `beforeAll`：前処理として Framework を初期化

`beforeAll` フックは、テストスイートの実行前に一度だけ呼ばれます。
ここで E2E Fixtures Framework のインスタンスを生成します。

```typescript
beforeAll(() => {
  framework = new AgE2eFixtureFramework(analyzeText);
});
```

- フレームワークの初期化は一度だけ行い、すべてのテストケースで同じインスタンスを使う。
- コンストラクタには、テスト対象の処理関数 (ここでは `analyzeText`)を渡す。
- `analyzeText` はマークダウンやテキストの解析・変換など、任意の処理を実装した関数で、テストの内容に応じて
  カスタマイズ可能。

> 💡 `analyzeText` には文字数カウントや用語抽出、Markdown の構文解析などを自由に実装できます。

### 1.3 `describe`：テストケースの定義ブロック

`describe` は Vitest のテストグループを定義する構文で、複数のテストケースをひとまとめに管理します。

```typescript
describe('E2E Fixture Framework 基本テスト', () => {
  const fixturePath = path.resolve(__dirname, 'fixtures');
  framework.runAllFoundTests(fixturePath);
});
```

- `fixturePath` はテスト用フィクスチャが配置されたディレクトリの絶対パス
- 相対パスではなく絶対パスを指定することで、環境依存の問題を避けられる
- `runAllFoundTests()` を呼び出すことで、指定ディレクトリ以下のすべてのテストケースを自動的に読み込み、Vitest の `it()`として登録して一括実行する

この構造により、大量のフィクスチャテストを簡潔にまとめて実行可能です。

### 1.4 `runAllFoundTests()` の挙動

`runAllFoundTests()` は指定した fixture ディレクトリを再帰的に探索し、テストケースを自動的に検出・登録・実行します。

- `input.*` と `output.json` のペアが存在するディレクトリを最大 2階層まで再帰的に探索
- テスト対象ディレクトリは、内部で `it()` として Vitest に登録
- 名前が `#` で始まるディレクトリはコメントアウトとしてスキップ
- `.skip-e2e` ファイルが存在するディレクトリはテストから除外

これらの仕組みにより、不必要なテスト実行を防ぎ、効率的かつ安全に大量のテストを管理できます。

### 2. testCasesを明示的にスキャンしてループ実行する例

より細かくテストケースを制御したい場合は、`findTestCases()` を使って
個別にテストケースをスキャンし、`runTest()` をループで呼び出す方法があります。

#### 2.1 明示的ループの例

以下に、`AgE2eScanCategorizedTests`による明示的ループの例を示します。

```typescript
// lib
import path from 'path';

// vitest
import { describe, expect, it } from 'vitest';

// E2E Fixtures Framework
import { AgE2eFixtureFramework, AgE2eScanCategorizedTests } from '@ag-utils/e2e-fixture-framework';

// テスト対象関数
import { analyzeText } from '../src/analyzeText';

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

#### 2.2 明示的ループの挙動

<!-- textlint-disable ja-technical-writing/sentence-length -->

- `AgE2eScanCategorizedTests()` は、3階層構造 (`fixtures/category/sub-category/test-case/`) に対応したテストケーススキャナである。
- BDD スタイルの `it()` を使い、テスト名を自然な文章で記述できるため、ログの可読性が高い。
- 各テストケースは `runTest(path)` で個別に実行され、結果は `expect(passed).toBe(true)` で検証される。
- `runTest()` の実行有無は `if` 文などで制御可能なので、柔軟なテスト運用が可能である。

<!-- textlint-enable -->

この方法は、特定ケースの追加検証や、問題の切り分けに便利です。

### 3. テストのスキップ

E2E Fixtures Framework のテスト実行時には、以下の条件でテストケースが自動的にスキップされます。

1. 任意のディレクトリ名が `#` で始まる場合、そのディレクトリはコメントアウトとみなされ、テストは実行されない。

2. 任意の階層に `.skip-e2e` ファイルが存在すると、そのテストケースはスキップされる。

> これらのスキップ条件は、findTestCases()、runAllFoundTests()、および単体の runTest() に共通して適用されます。
> スキップ条件を把握していないと、テストが実行されない原因がわかりにくくなるため注意が必要です。

### 4. 注意点・ベストプラクティス

E2E Fixture Framework を用いたテスト開発における注意点と推奨されるベストプラクティスを紹介します。

| 注意点                 | 内容                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `framework` のスコープ | グローバルに定義するか、beforeAll 内で let 宣言し、外部から参照できるようにすること。        |
| ディレクトリ階層       | 3階層構成を推奨する。 例: `fixtures/<メインカテゴリ>/<サブカテゴリ>/<テストケース>`          |
| ファイル名固定         | テストで読み込まれるファイルは `input.*` と `output.json` のみである。それ以外は無視される。 |

これらを守ることで、テストの管理や保守がしやすくなり、トラブルを減らせます。

### まとめ

E2E Fixtures Framework を使った E2E テストについてまとめると、以下の通りになります。

- `framework.e2e.spec.ts` は、E2E Fixture Framework によるテストの「エントリポイント」である
- `AgE2eFixtureFramework(analyzeText)` により、任意のロジックを E2E 検証に組み込める
- テスト構造が整っていれば、実装ごとの記述は非常に簡潔かつ自動化しやすい
