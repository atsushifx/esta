---
title: 条件指定によるテストの一括実行
description: runAllFoundTestsとfindTestCasesによる柔軟なテストコントロール方法を解説します。
sidebar_position: 7
slug: /run-tests-with-options
---

## 第7章 条件指定によるテストの一括実行

<!-- textlint-disable ja-technical-writing/sentence-length -->

この章では、`e2e-fixture-framework` における `runAllFoundTests()` および `findTestCases()` メソッドを用いた、テスト実行の柔軟な制御方法について解説します。

<!-- textlint-enable -->

### 1. テストケースの構造

本フレームワークにおける E2E テストケースは、以下の構造で管理されます。

- 各テストは **ディレクトリ単位**で構成されており、`fixtures/<mainCategory>/<subCategory>/<testCase>` という階層構造を持つ。
- 1つのテストケースは、次の 2つのファイルで定義される。
  - `input.*` : 任意の拡張子を持つ入力ファイル。テスト対象のデータを含む。
  - `output.json` : 期待されるテスト結果を JSON 形式で記述したファイル。

このディレクトリ構造とファイルの組み合わせにより、テストケースの管理と実行が容易に行えます。

### 2. オプションの指定による、テスト実行の制御

`runAllFoundTests` メソッドは、テストケースの絞り込みや、テストの細かい挙動を設定するオプションを指定できます。

#### 2.1 主なオプション

設定できる主なオプションは、以下の通りです。

<!-- markdownlint-disable line-length -->

| オプション | 型        | 説明                                                                                                                                                 |
| ---------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pattern`  | `regexp`  | 実行対象のディレクトリ名を正規表現でフィルタリングします。例えば `/^heading/` のように指定すると、`heading` で始まるディレクトリのみを対象にします。 |
| `dryRun`   | `boolean` | `true` に設定すると、実際のテストは実行せず、対象となるテストケースの一覧のみを出力します。                                                          |
| `verbose`  | `boolean` | 詳細な実行ログを出力します。テストの進行状況や詳細情報を確認したい場合に有効です。                                                                   |
| `timeout`  | `number`  | 各テストケースの最大実行時間をミリ秒単位で指定します。タイムアウト時間を超えると、そのテストは失敗扱いとなります。                                   |

<!-- markdownlint-enable -->

これらのオプションを用いることで、実行対象の柔軟な選択や挙動の制御が可能です。
例えば、特定のカテゴリだけを絞って実行したり、テスト実行の事前確認として一覧表示だけ行うことができます。

#### 2.2 `runAllFoundTests`の記述例

`runAllFoundTests` は、指定したディレクトリ以下のテストケースを一括で実行するためのメソッドです。
オプションを用いて、実行対象の絞り込みや動作の詳細設定が可能です。

以下のコードは、名前が `heading` で始まるテストケースのみ、タイムアウト 10秒で実行、詳細ログを出力する例です。

```typescript
import { runAllFoundTests } from 'e2e-fixture-framework';

await runAllFoundTests('fixtures', {
  pattern: /^heading/, // headingで始まるカテゴリーやテストケースを対象に絞り込み
  dryRun: false, // 実際にテストを実行
  verbose: true, // 詳細ログを有効化
  timeout: 10_000, // タイムアウト時間を10秒 (10000ミリ秒) に設定
});
```

> 注意事項:
>
> - ディレクトリは`<メインカテゴリー>`、`<サブカテゴリー>`、`<テストケース>`の3階層までスキャンする。
> - 正規表現は 3階層いずれかの名前にマッチすれば対象となる。
> - テストをスキップしたい場合は、特定のファイルやディレクトリ名の付与で制御可能 (後述)

### 3. テストケース検索メソッド `findTestCases` におけるオプション設定

`findTestCases` メソッドは、指定したディレクトリから条件に合致するテストケースを検索して一覧を取得する機能です。
`runAllFoundTests` と同様にオプションで絞り込みや動作制御が可能で、より細かくテストケースを操作したい場合に適しています。

### 3.1 オプションの一覧

`findTestCases`の主なオプションは以下の通りです。

| オプション | 型        | 説明                                                     |
| ---------- | --------- | -------------------------------------------------------- |
| `pattern`  | `regexp`  | ディレクトリを正規表現で絞り込みます                     |
| `dryRun`   | `boolean` | `true` の場合、テストは実行せず一覧のみ返します。        |
| `verbose`  | `boolean` | 詳細なログを出力します                                   |
| `timeout`  | `number`  | 各テストケースの最大実行時間 (ミリ秒単位) を指定します。 |

#### 3.2 `findTestCases`の記述例

以下は `findTestCases` を利用して、条件に合ったテストケースをループで明示的に実行する例です。

```typescript
// ライブラリのインポート
import path from 'path';

//  vitest
import { describe, expect, it } from 'vitest';

//  E2E Fixtures Framework
import { AgE2eFixtureFramework, findTestCases } from '@ag-utils/e2e-fixture-framework';

// テスト対象の関数
import { analyzeMarkdown } from '../src/analyzeMarkdown';

// フレームワーク初期化
const framework = new AgE2eFixtureFramework(analyzeMarkdown);
const fixturesDir = path.resolve(__dirname, 'fixtures');

describe('E2E Fixture Framework - 明示的ループ実行', () => {
  it('指定パターンに合致するテストケースのみ実行', async () => {
    const testCases = await findTestCases(fixturesDir, {
      pattern: /^heading/,
      dryRun: false,
      verbose: true,
      timeout: 10_000,
    });

    for (const { name, path: casePath } of testCases) {
      const [mainCategory, subCategory] = name.split('/');
      if (!subCategory.includes('with-frontmatter')) { continue; // フロントマターがないテストは除外
       }

      const passed = await framework.runTest(casePath);
      expect(passed).toBe(true);
    }
  });
});
```

この方法では、実行制御をプログラム側で柔軟に実装でき、
特定の条件でフィルターをかけたり、独自のロジックを組み込むことが可能です。

### 4. テストのスキップ

E2E Fixtures Framework では、テストの実行から特定のテストケースやディレクトリを除外 (スキップ) するために、以下の方法が用意されています。

1. **ディレクトリ名の先頭に `#` を付ける方法**
   - `<メインカテゴリー>`、`<サブカテゴリー>`、`<テストケース>` のいずれかのディレクトリ名の先頭に `#` を付けることで、そのディレクトリはコメントアウト扱いとなり、テストの検索対象から除外される。
   - これにより、該当ディレクトリとその配下の全テストケースがスキップされる。

2. **`.skip-e2e` ファイルを設置する方法**
   - スキップしたいディレクトリに空ファイルまたは任意の内容の `.skip-e2e` ファイルを作成する。
   - このディレクトリおよびその配下のテストケースはすべてスキップされる。

これらの方法を利用して、テスト対象から特定のケースを柔軟に除外できます。
開発中や問題のあるテストを一時的にスキップしたい場合に有効です。

### まとめ

本章では、`e2e-fixture-framework` におけるテストの一括実行を柔軟に制御する方法を解説しました。

- `runAllFoundTests` メソッドでは、正規表現による絞り込みや詳細ログ出力、タイムアウト設定などのオプション指定により、実行対象や挙動を柔軟に制御可能である。
- `findTestCases` メソッドは、検索のみを行い取得したテストケースに対して任意の処理を行うためのメソッドで、より細かな制御をプログラムで実装できる。
- テストのスキップには、ディレクトリ名の先頭に `#` を付ける方法や、`.skip-e2e` ファイルの設置による方法があり、特定のテストケースをテスト実行から除外できる。

これらの機能を活用することで、大規模なテストセットを効率的かつ柔軟に管理し、安定した品質保証が可能となります。
