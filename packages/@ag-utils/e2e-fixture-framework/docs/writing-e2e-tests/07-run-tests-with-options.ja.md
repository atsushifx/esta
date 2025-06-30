---
title: 条件指定によるテストの一括実行
description: runAllFoundTestsとfindTestCasesによる柔軟なテストコントロール方法を解説します。
sidebar_position: 7
slug: /run-tests-with-options
---

## 第7章 条件指定によるテストの一括実行

この章では、`e2e-fixture-framework` における `runAllFoundTests()` および `findTestCases()` メソッドを用いた、テスト実行の柔軟な制御方法について解説します。

### テストケースの構造

本フレームワークにおける E2E テストケースは、以下の構造で管理されます：

- 各テストは **ディレクトリ単位**で構成
  (`fixtures/<mainCategory>/<subCategory>/<testCase>`型式)
- 以下の2ファイルの組み合わせで1テストケースを定義：
  - `input.*` (任意の入力ファイル)
  - `output.json` (期待される出力)

### オプションの指定による、テスト実行の制御

#### 一括実行メソッド`runAllFoundTests`でのオプション指定

テスト一括実行メソッド`runAllFoundTests`は、オプションを指定することにより実行するテストを制御できます。
`runAllFoundTests`では、以下のオプションが使用できます:

| オプション | 型        | 説明                             |
| ---------- | --------- | -------------------------------- |
| `pattern`  | `regexp`  | ディレクトリを正規表現で絞り込み |
| `dryRun`   | `boolean` | 実行せず一覧のみ出力             |
| `verbose`  | `boolean` | 実行ログを詳細出力               |
| `timeout`  | `number`  | 各テストの最大実行時間（ミリ秒） |

オプションを指定した場合の`runAllFoundTests`の記述は以下のようになります:

```typescript
import { runAllFoundTests } from "e2e-fixture-framework";

await runAllFoundTests("fixtures", {
  pattern: /^heading/   // headingではじまるカテゴリー/テストケースのみテスト
  dryRun: false,        // dryRunではなく実際にテストする (`true`: テストするテストケースを表示)
  verbose: true,        // verbose mode (実行時のログを詳細に出力)
  timeout: 10_000,      // テスト実行時のタイムアウト秒数 (ミリ秒単位: 10_000=10秒)
});
```

> 注記:
>
> - ディレクトリは`<メインカテゴリー>`、`<サブカテゴリー>`、`<テストケース>`の3階層までスキャンします。
>   上記の正規表現の場合、上記のどれかのディレクトリが条件にあえばテストを実行します。
> - Fixture Frameworkでは、指定の方法でテストをスキップできます。 （詳細は下記「[テストのスキップ (除外)](#テストのスキップ-除外)」を参照）

#### テストケース検索メソッド `findTestCases`におけるオプション設定

テストケース検索メソッド `findTestCases` でも同様のオプションが指定できます。
`findTestCases`で使用できるオプションは、`runAllFoundTests`と同様です:

| オプション | 型        | 説明                             |
| ---------- | --------- | -------------------------------- |
| `pattern`  | `regexp`  | ディレクトリを正規表現で絞り込み |
| `dryRun`   | `boolean` | 実行せず一覧のみ出力             |
| `verbose`  | `boolean` | 実行ログを詳細出力               |
| `timeout`  | `number`  | 各テストの最大実行時間（ミリ秒） |

`findTestCases`を使用した記述は以下になります:

```typescript
// libs
import path from 'path';

// vitest
import { describe, expect, it } from 'vitest';

// E2E Fixture Framework
import { AgE2eFixtureFramework, findTestCases } from '@ag-utils/e2e-fixture-framework';

// test target
import { analyzeMarkdown } from '../src/analyzeMarkdown';

// framework setup
const framework = new AgE2eFixtureFramework(analyzeMarkdown);
const fixturesDir = path.resolve(__dirname, 'fixtures');

async describe('E2E Fixture Framework - 明示的ループ実行', () => {
  const testCases = await findTestCases(fixturesDir, {
    pattern: /^heading/,
    dryRun: false,
    verbose: true,
    timeout: 10_000,
  });

  testCases.forEach(({ name, path: casePath }) => {
    const [mainCategory, subCategory, testCase] = name.split('/');
    if (!subCategory.includes('with-frontmatter')) { continue; } // フロントマターがない入力はテストしない

    it(name, async () => {
      const passed = await framework.runTest(casePath);
      expect(passed).toBe(true);
    });
  });
});
```

> 注記:
>
> - ループを明示的に記述するので、`runAllFoundTests`より細かなテストの制御ができます。
> - Fixture Frameworkでは、指定の方法でテストをスキップできます。 （詳細は下記「[テストのスキップ (除外)](#テストのスキップ-除外)」を参照）

### テストのスキップ (除外)

E2E Fixtures Frameworkでは、以下の方法で、テストをスキップできます。

1. 適当なディレクトリ (`<メインカテゴリー>`, `<サブカテゴリー>`, `<テストケース>`) の先頭に`#`を挿入する
   → 該当ディレクトリはコメントアウト扱いとなり、テスト検索対象から除外されます

2. スキップしたいディレクトリに、ファイル`.skip-e2e`を作成する
   → 該当ディレクトリおよびその配下は、すべてスキップ対象になります
