---
title: "09. APIリファレンス"
description: "E2E Fixtures Framework の主要クラスやユーティリティの API 仕様と使用例を解説します。"
sidebar_position: 9
slug: /api-reference
---

## 第9章 APIリファレンス

この章では、E2E Fixtures Framework に含まれる主要クラス・関数の API を整理し、役割・引数・戻り値・使用例を中心に解説します。

### 1. `AgE2eTestDiscovery`

<!-- markdownlint-disable no-duplicate-heading -->

#### 1.1 クラス概要

`AgE2eTestDiscovery` は、E2E Fixtures Framework において **テストケースの発見 (ディスカバリ) 処理** を担当する中心的なクラスです。
特定のディレクトリ以下を再帰的に走査し、E2E テストの実行対象となる **フィクスチャディレクトリ群** を動的に検出します。

`AgE2eTestDiscovery` は、次のような要件を満たすことを目的に設計されています。

- フィクスチャの追加・削除が発生しても、**設定なしで自動的に検出される仕組み**を提供したい
- `.skip-e2e` ファイルや `#` ディレクトリのような簡易な**スキップ条件**をサポートしたい
- プロジェクトの構造が変化しても対応可能な、**柔軟な検出ルール**を実装したい

クラスの利用者は、`AgE2eTestDiscovery.findTestCases()` を呼び出すだけで、テスト実行対象のフィクスチャを自動的に収集できます。

`AgE2eTestDiscovery` によってファイル検出処理を分離することで、テスト実行とのロジックが疎結合となり、構成変更やスケーリングが容易になります。

#### 1.2 主なメソッド

`AgE2eTestDiscovery` には、テストケースの検出とフィルタリングを行うための実用的なメソッドが用意されています。
`AgE2eTestDiscovery` の主なメソッドとその役割は以下のとおりです。

<!-- textlint-disable ja-technical-writing/sentence-length -->

- `findTestCases(fixturesPath: string, options?: E2eTestOptions): Promise<E2eTestCase[]>`:
  指定されたディレクトリ以下を再帰的に走査し、テスト対象となるフィクスチャディレクトリを検索する。オプションにより正規表現での絞り込みや dry-run などの挙動を制御可能。

- `shouldSkip(dirPath: string): boolean`:
  `.skip-e2e` ファイルの存在や、ディレクトリ名の先頭が `#` で始まるかどうかをチェックし、そのディレクトリをスキップ対象とするか判定する。

- `getRelativeTestName(path: string): string`
  検出されたテストケースのフルパスから、`baseDir` を起点とした相対的なテスト名 (`main/sub/testCase` 形式) を生成する。この名前は、レポート出力やログの識別子として使用される。

<!-- textlint-enable -->

これらのメソッドにより、柔軟なテストケース検出とスキップ制御、カテゴリ別の集計処理などが簡潔に実装可能となります。

#### 1.3 `findTestCases()` の仕様

`findTestCases()` は、指定されたディレクトリ以下を走査し、実行可能な E2E フィクスチャケースを一覧として返すメソッドです。
この処理は非同期で行われ、ファイルシステムへのアクセスや各種フィルタリング条件が適用されます。

##### シグネチャ

```typescript
findTestCases(fixturesPath: string, options?: E2eTestOptions): Promise<E2eTestCase[]>
```

##### 引数

- `fixturesPath`: `string`
  ルートディレクトリの絶対パスまたは相対パス。`fixtures/` など、テストケースが配置されているルート。

- `options` (省略可能): `E2eTestOptions`
  テストケースの探索動作を制御するオプション。以下の項目を含む。
  - `pattern`: `RegExp`
    テスト名に対して適用する正規表現フィルター。`main/category/caseName` 形式にマッチするものを通過させる。
  - `dryRun`: `boolean`
    `true`: テストケースの実行は行わず、一覧取得のみを実施。
    `false`: テストケースを実行
  - `verbose`: `boolean`
    `true`: 詳細ログの出力
    `false`: 一般的なログの出力
  - `timeout`: `number`:
    各テストケースのタイムアウト時間 (ミリ秒)。テスト実行時に、タイムアウトを超えるとテスト失敗になる。

##### 戻り値

- Promise<E2eTestCase[]>
  有効なテストケース情報の排列を返す。各要素は以下の情報を含む
  - `name`: テストケースの識別名 (相対パス)
  - `path`: テストケースのパス

##### スキップ対象の扱い

`findTestCases()` は、以下の条件に該当するディレクトリをスキップします。

- `.skip-e2e` ファイルが存在するディレクトリ、またはその配下
- ディレクトリ名が `#` で始まるもの (例: `#disabled-test`)

これにより、一時的に無効化したいテストや CI に含めたくないケースを簡潔に除外できます。

#### 1.4 使用例と実装パターン

`AgE2eTestDiscovery` の典型的な使用パターンは、フィクスチャディレクトリ内の全テストケースを一括で検出し、ループ処理などにより個別に実行するものです。

##### 実装パターン

以下に、`findTestCases()` を活用したテストスイートの構成例を示します。

```ts
// E2E Fixtures Framework
import { AgE2eFixtureFramework, AgE2eTestDiscovery } from '@ag-utils/e2e-fixture-framework';

// lib
import path from 'path';

// vitest
import { describe, expect, it } from 'vitest';

// テストする関数
import { analyzeMarkdown } from '../src/analyzeMarkdown';

const fixturesRoot = path.resolve(__dirname, 'fixtures');
const framework = new AgE2eFixtureFramework(analyzeMarkdown);
const discovery = new AgE2eTestDiscovery();

describe('E2E Fixtures', async () => {
  const cases = await discovery.findTestCases(fixturesRoot, {
    pattern: /^markdown\/headings\//,
    dryRun: false,
    verbose: true,
  });

  for (const { name, path: fixturePath } of cases) {
    it(name, async () => {
      const result = await framework.runTest(fixturePath);
      expect(result.pass).toBe(true);
    });
  }
});
```

この例では、次のような特徴を持つ実装がされています。

- `pattern` により、特定のカテゴリ (例: `markdown/headings/` ) に絞って実行対象を選定
- `.skip-e2e` や `#` ディレクトリが存在する場合は自動的にスキップ
- ループ内で `runTest()` を個別に実行し、柔軟な制御が可能

##### CI における活用例

CI 環境では、次のような戦略が有効です。

- ラベルやパスに応じて `pattern` を動的に変更し、変更があったカテゴリのみをテスト対象とする
- `dryRun: true` で実行前に一覧を取得し、存在チェックやメタ情報を出力する
- カテゴリ単位での並列ジョブ実行に対応できるよう、`findTestCases()` の結果を分割して処理

このように `AgE2eTestDiscovery` は、実行環境や戦略に応じたテストの柔軟な設計を可能にします。

---

### 2. `AgE2eFileReader`

#### 2.1 クラス概要

`AgE2eFileReader` は、E2E Fixtures Framework において **フィクスチャディレクトリからのファイル読み取り処理** を担当するユーティリティクラスです。
テスト対象となる入力ファイル (`input.*`) および期待される出力結果 (`output.json`) を読み込み、フレームワークが直接利用できる標準的なオブジェクト形式に変換します。

主な役割は次のとおりです。

- 拡張子に応じて `input.md`, `input.txt`, `input.error` などを柔軟に読み込む
- `output.json` を正しくパースし、期待される出力データをオブジェクト形式で提供する
- 不備がある場合でも例外を投げず、`pass: false` 形式で安全に処理を続行できるようにする

この責務の分離により、テストの読み込みと実行処理の再利用性が高まり、テストケースの追加や形式変更にも柔軟に対応できます。

#### 2.2 主なメソッド

`AgE2eFileReader` が提供する中心的なメソッドは `readFixture()` です。このメソッドを通じて、1つのフィクスチャディレクトリに含まれる `input.*` と `output.json` の内容を読み取り、標準化されたオブジェクトとして返却します。

##### シグネチャ

```typescript
readFixture(fixtureDir: string): Promise<{ input: unknown; expected: unknown; }>
```

##### 引数

- `fixtureDir`:
  テストケースのパス。通常、`fixtures/<カテゴリ>/<サブカテゴリ>/<ケース名>` の形式に相当。

##### 戻り値

- ```typescript
  {
    input: unknown,    // input.* の中身。拡張子に応じて文字列、オブジェクト、バイナリなど
    expected: unknown  // output.json の中身。JSON としてパースされたオブジェクト
  }
  ```

##### 詳細仕様

- 入力ファイルの自動判別:
  `input.*` は拡張子を問わず最初に見つかったファイルを対象とする (`.md`, `.txt`など)。この柔軟性により、テストごとに異なる形式の入力ファイルが使用可能
- エンコーディングとパース:
  テキストファイルは、`UTF-8`エンコードとして読み込まれる。

このメソッドは、入力と出力の定義が 1 対 1 で対応する前提に基づいており、E2E テストの実行に必要な最低限の構造を抽出する責任を担います。

#### 2.3 ファイル構成と拡張性

`AgE2eFileReader` は、フィクスチャディレクトリ内のファイル構成に柔軟に対応できるよう設計されています。標準では以下の形式を前提としています。

```bash
fixtures/
└── markdown/
    └── headings/
        └── h1-basic/
            ├── input.md
            └── output.json
```

##### 拡張子の扱い

- `input.*` の読み込みでは、拡張子を問わず最初に検出されたファイルを対象とする
  例: `input.md`, `input.txt` など

- ファイルの中身は拡張子に応じて自動的に読み込み処理を分岐
  - `.md` や `.txt` は UTF-8テキストとしてそのまま文字列で返却

- `output.json`は、JSON としてパースされ、オブジェクト形式で返却

##### 将来の拡張

- スキーマベースのバリデーション
  - `input.schema.json` のような補助ファイルを用いて、入力フォーマットの事前検証を可能にする
  - エラー時の詳細なフィードバックを提供し、テストの信頼性を向上させる

`AgE2eFileReader` は、テキスト主体のテストケースを効率的に扱えるようになっています。

#### 2.4 エラーハンドリング方針

`AgE2eFileReader` は、テストの安定性と実行フローの継続性を重視し、入力ファイルや出力ファイルの不備に対して例外をスローせず、明示的なエラーオブジェクトを返す設計を採用しています。

この方針により、テストランナーは各ケースの失敗を安全に記録・報告でき、途中で停止することなくほかのテストを継続実行できます。

##### 発生し得るエラー例と処理内容

<!-- markdownlint-disable line-length -->

| エラーの種類                        | 発生条件                                           | 処理内容                                                                       |
| ----------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ |
| 入力ファイル (`input.*`) の未検出   | `fixtureDir` 内に input 系ファイルが存在しない場合 | `{ pass: false, actual: null, expected: null, error: 'Input file not found' }` |
| 出力ファイル (`output.json`) の欠損 | `fixtureDir` 内に `output.json` が存在しない場合   | `pass: false`, `error`:詳細メッセージ                                          |
| JSON 形式のパースエラー             | `output.json` の構文が不正                         | `pass: false`, `error`: エラーメッセージ                                       |
| 読み込み失敗                        | パーミッションやエンコーディングの不一致など       | `pass:false`, `error`: (Node.js の `fs/promises` API によるエラー内容)         |

<!-- markdownlint-enable line-length -->

##### 実装例 (擬似コード)

```typescript
try {
  const input = await readInputFile(fixtureDir);
  const expected = await readOutputJson(fixtureDir);
  return { input, expected };
} catch (err) {
  return {
    input: null,
    expected: null,
    pass: false, // テスト失敗としてマーク
    error: String(err.message), // エラーメッセージを設定
  };
}
```

この方式により、エラーが起きても `runTest()` 側ではエラーオブジェクトを扱うだけで済み、例外ハンドリングや復旧処理を呼び出し元に強制しない安全な API 設計を実現しています。

---

### 3. `fixtureRunner` モジュール

#### 3.1 モジュール概要

`fixtureRunner` は、E2E Fixtures Framework における **テストケースの実行処理** を担うコアユーティリティです。
前述の `AgE2eTestDiscovery` や `AgE2eFileReader` によって発見・読み込まれたテストケースに対して、実際のテスト実行ロジックを提供します。

`fixtureRunner` モジュールは、次の 2関数を中心に構成されています。

<!-- textlint-disable ja-technical-writing/sentence-length -->

- `runTest(fixturePath: string): Promise<E2eTestResult>`:
  単一のテストケースを実行し、期待値 (`expected`) と比較して検証

- `runAllFoundTests(baseDir: string, options?: E2eTestOptions): Promise<void>`:
  指定ディレクトリ配下の全テストケースを検出し、オプションに応じて一括実行または dry-run を実行

<!-- textlint-enable -->

テスト実行における典型的な処理フローは以下のとおりです。

1. `readFixture()` による入力と期待値の取得
2. テスト対象関数の呼び出しと実行 (`actual`)
3. `expected` との比較
4. pass/fail 判定およびログ出力・エラー記録

この一連の流れをモジュールレベルで提供することで、**CLI からの実行・CI 上での自動実行・Vitest 経由の明示的ループ** など、さまざまなユースケースに共通のテストエンジンとして機能します。

実行中にエラーが発生しても例外はスローせず、すべて E2eTestResult オブジェクトにまとめて返却する設計により、**堅牢で安定したテスト実行基盤**が構築できます。

#### 3.2 `runTest()` の仕様と使い方

`runTest()` は、指定されたフィクスチャディレクトリに含まれる入力ファイルと期待出力を用いて、対象のテスト処理関数を実行し、結果を比較・検証する関数です。

##### シグネチャ

```typescript
runTest(fixturePath: string): Promise<E2eTestResult>
```

##### 引数

- `fixturePath`: `string`:
  テスト対象のディレクトリパス。(例: `fixtures/markdown/headings/h1-basic`)

##### 戻り値

- `Promise<E2eTestResult>`:
  実行結果を次のような構造で返却

  ```typescript
  {
    pass: boolean;           // テストが成功したかどうか
    actual: unknown;         // 実行結果 (テスト対象関数の戻り値)
    expected: unknown;       // output.json に定義された期待結果
    error?: string | null;   // エラーが発生した場合のメッセージ
  }
  ```

##### 実行フロー

1. `AgE2eFileReader.readFixture()` により `input.*` と `output.json` を読み込む

2. 対象のテスト処理関数 (例：analyzeMarkdown()) に `input` を渡して実行

3. 得られた `actual` と `expected` を比較

4. 差異がなければ pass: true、不一致またはエラー発生時は pass: false として返却

##### 例外ハンドリング

- ファイル読み込みや JSON パースに失敗した場合も、例外はスローせず `pass: false` + `error メッセージ`を返す。

- テスト全体の実行が途中で中断されることなく、すべてのケースが評価される。

##### サンプルコード

```typescript
const result = await runTest('fixtures/markdown/headings/h1-basic');

if (!result.pass) {
  console.error(`❌ Test failed:`, result.error);
} else {
  console.log(`✅ Test passed.`);
}
```

この関数は、E2E Fixtures Framework における最小単位のテスト実行関数であり、個別テストの検証やデバッグ、カスタムフィルタ条件付きテストに最適です。

#### 3.3 `runAllFoundTests()` のオプション

`runAllFoundTests()` は、特定のディレクトリ配下にあるすべてのフィクスチャディレクトリをスキャンし、`runTest()` を通じて順次実行するユーティリティ関数です。
条件に合致するテストのみを対象に一括処理できるため、CI や一斉検証の自動化に適しています。

##### シグネチャ

```typescript
runAllFoundTests(fixturesPath: string, options?: E2eTestOptions): Promise<void>
```

##### 引数

- `fixturesPath`: `string`
  テストケースが格納されたルートディレクトリのパス。(例: `fixtures')

- `options`: `E2eTestOptions` (省略可能)
  テスト実行の挙動を制御するオプション。主な項目は以下のとおり。

  | オプション名 | 型        | 説明                                                                |
  | ------------ | --------- | ------------------------------------------------------------------- |
  | `pattern`    | `RegExp`  | 実行対象とするディレクトリ名を正規表現でフィルタリング              |
  | `dryRun`     | `boolean` | 実行せず、対象となるテストケースの一覧だけを出力                    |
  | `verbose`    | `boolean` | 実行中の詳細ログを出力。ファイル名・パス・成功/失敗の一覧などを表示 |
  | `timeout`    | `number`  | テスト実行ごとのタイムアウト時間 (ミリ秒)                           |

##### 実行フロー

1. `AgE2eTestDiscovery.findTestCases()` を内部で呼び出し、対象となるテストケース一覧を取得

2. `dryRun`: `true` の場合、対象となるテストケース一覧を取得して表示するのみで、テストは実行しません。

3. 各テストケースごとに `runTest()` を実行し、`pass` の成否を評価

4. 成功・失敗の数を集計して出力 (verbose: true の場合)

##### 成功・失敗のログ出力例 (verbose)

```markdown
[✓] fixtures/markdown/headings/h1-basic
[✓] fixtures/markdown/headings/h1-multi
[✗] fixtures/markdown/invalid/h1-overlap
(Error: Expected heading depth mismatch)
```

##### 用途とユースケース

- CI 上での自動一括実行
- フィクスチャが増減してもコード変更なしで実行範囲を自動調整
- PR ごとの差分確認や、失敗テストの一覧表示などを簡潔に行える

`runAllFoundTests()` は、E2E Fixture Framework を自動化・継続運用する際に中核となる関数です。

#### 3.4 テスト戦略に応じた使い分け

`runTest()` と `runAllFoundTests()` は、用途やスケールの違いに応じて設計されています。
目的に応じて適切に使い分けることが重要です。

##### 単体テスト (明示的ループ): `runTest()`

- **用途**
  - 個別のテストケースを精査・デバッグしたいとき
  - 特定条件を満たすテストだけを実行したいとき (例: カテゴリ名でフィルター)

- **特徴**
  - 柔軟な制御が可能 (ループ途中で break、条件分岐など)
  - `it()` を使ったテストフレームワークとの統合がしやすい
  - エラー発生時の文脈 (fixture 名など) を細かく制御できる

- **サンプルコード**

  ```ts
  const result = await runTest('fixtures/md/heading/h1-basic');
  expect(result.pass).toBe(true);
  ```

##### 一括実行 (自動スキャン): runAllFoundTests()

- 用途:
  - 全体のテストスイートを一括実行したいとき
  - CI 上で変更を検知してすべてのテストを通したいとき
  - dry-run による事前確認、ログ取得が目的のとき
- 特徴:
  - 自動検出 + 自動実行のため、コード変更が不要
  - テスト増減への追従が高速・容易
  - 成功数・失敗数のレポートが出力される
- サンプルコード:

  ```typescript
  await runAllFoundTests('fixtures', { dryRun: false, verbose: true });
  ```

##### 選択のポイント

| 条件                                 | 推奨関数                        |
| ------------------------------------ | ------------------------------- |
| 特定の1ケースのみを検証したい        | `runTest()`                     |
| カテゴリ単位でフィルターしたい       | `runTest()` + `findTestCases()` |
| 全体を CI 上で一括実行したい         | `runAllFoundTests()`            |
| 一覧取得のみを行いたい（dryRun）     | `runAllFoundTests()`            |
| カスタム処理 (前処理・後処理) が必要 | `runTest()` + 明示ループ        |

テスト戦略の柔軟性を保つために、両者を併用することが推奨されます。開発中は runTest()、自動実行では runAllFoundTests() といった使い分けが実践的です。

---

### 4. 共通型定義 `E2eTestOptions`

#### 4.1 型定義の構成

`E2eTestOptions` は、テスト実行処理における挙動を制御するためのオプション型です。
`findTestCases()` や `runAllFoundTests()` など、複数の関数に共通して使用されており、テスト実行関数間でオプション形式を統一し、共通のインターフェースとして機能します。

##### 型定義 (例)

```typescript
type E2eTestOptions = {
  pattern?: RegExp; // 実行対象ディレクトリ名のフィルター (正規表現)
  dryRun?: boolean; // 実行せず一覧のみを出力（デフォルト値: false）
  verbose?: boolean; // 詳細なログ出力（デフォルト値: false）
  timeout?: number; // テストごとのタイムアウト（ミリ秒単位）
};
```

##### プロパティ一覧

| プロパティ | 型        | 説明                                                                  |
| ---------- | --------- | --------------------------------------------------------------------- |
| `pattern`  | `RegExp`  | `main/category/caseName` にマッチさせるための正規表現                 |
| `dryRun`   | `boolean` | 実行せずにテストケース一覧のみを出力 (デフォルト: false)              |
| `verbose`  | `boolean` | 各ステップの詳細ログを出力 (デフォルト: false)                        |
| `timeout`  | `number`  | 各テストケースの最大実行時間 (ミリ秒)。省略時は無制限または内部既定値 |

##### 使用箇所と互換性

この型は以下の関数群で共通して利用されます。

- `AgE2eTestDiscovery.findTestCases()`
- `fixtureRunner.runAllFoundTests()`

オプションの互換性を保つことで、CLI や上位アプリケーションとの統合がしやすく、将来的な機能追加にも柔軟に対応できます。

#### 4.2 CLI との連携を考慮した設計

`E2eTestOptions` は、コマンドラインツール (CLI) との連携も視野に入れて設計されています。`yargs` や `commander` などのライブラリと相性がよく、次のような特徴を持ちます。

##### 特徴と設計意図

- **オプションの型がそのまま CLI 引数にマッピング可能**
  - `--pattern`, `--dry-run`などの CLI 引数とオプション型の各プロパティが直截マッピングされる構造
  - CLI 側で受け取ったオプションオブジェクトを、そのまま `runAllFoundTests()` などに渡せる構造

- **デフォルト値の明示が容易**
  - CLI 側でも型定義と同様に `default: false` のような初期値を宣言でき、型と UI の整合性が保ちやすい

- **拡張性を意識したシンプルな構成**
  - 新しいオプション（例: `reportFormat`, `failFast`）を追加する際も、既存構造を壊さず型を拡張可能

##### 実装例 (yargs 使用時)

```typescript
import { runAllFoundTests } from '@ag-utils/e2e-fixture-framework';
import yargs from 'yargs';

const args = yargs(process.argv.slice(2))
  .option('pattern', { type: 'string' })
  .option('dry-run', { type: 'boolean', default: false })
  .option('verbose', { type: 'boolean', default: false })
  .option('timeout', { type: 'number', default: 5000 })
  .parseSync();

await runAllFoundTests('fixtures', {
  pattern: args.pattern ? new RegExp(args.pattern) : undefined,
  dryRun: args['dry-run'],
  verbose: args.verbose,
  timeout: args.timeout,
});
```

このように、`E2eTestOptions` は CLI とも自然に連携できる設計となっており、スクリプト用途から開発者ツールへの組み込みまで幅広く活用できます。

### 5. テスト実装のベストプラクティス

#### 5.1 明示的ループと一括実行の比較

E2E Fixtures Framework では、テストの実行方法として、明示的ループ実行と一括実行の 2種類をサポートしています。

- 明示的にループを書いて `runTest()` を呼び出すパターン
- `runAllFoundTests()` を用いた一括実行パターン

両者にはそれぞれ利点と適した用途があり、テスト戦略に応じて使い分けることで柔軟な運用が可能です。

##### 明示的ループ (個別制御向き)

- 特徴:
  - 条件分岐やフィルター処理をテストケース単位で記述できる
  - it() 関数などと併用し、テストレポートとの統合がしやすい
  - CI とローカル環境の両方で同じテストロジックを活用できる

- サンプルコード:

  ```typescript
  const testCases = await findTestCases('fixtures', { pattern: /^markdown/ });
  for (const { name, path: casePath } of testCases) {
    if (!name.includes('valid')) { continue; }
    it(name, async () => {
      const passed = await framework.runTest(casePath);
      expect(passed).toBe(true);
    });
  }
  ```

##### 一括実行 (CI・自動検証向き)

- 特徴:
  - すべてのフィクスチャを対象に、スキャン→実行までを自動で完了
  - 実行失敗時の件数表示やログ出力が標準で含まれる
  - コードが非常に簡潔で、メンテナンスコストが低い

- サンプルコード:

  ```typescript
  await runAllFoundTests('fixtures', {
    pattern: /^markdown/,
    dryRun: false,
    verbose: true,
  });
  ```

##### 比較まとめ

| 項目             | 明示的ループ (`runTest`) | 一括実行 (`runAllFoundTests`) |
| ---------------- | ------------------------ | ----------------------------- |
| 柔軟な条件分岐   | ◎ (任意のフィルタリング) | △ (pattern のみ)              |
| テスト出力と統合 | ◎ (`it()` などと併用可)  | △ (カスタム出力要対応)        |
| 記述の簡潔さ     | △ (ループ記述が必要)     | ◎ (1関数呼び出しで完結)       |
| CI 向け自動化    | 〇 (併用可)              | ◎ (ログ集約・統計に優れる)    |

実装の初期段階では `runTest()` による柔軟な制御が推奨されますが、安定したスイートや CI 統合後は `runAllFoundTests()` への切り替えが効果的です。

#### 5.2 カスタム処理の挿入ポイント

E2E Fixtures Framework は、`runTest()` を用いたテスト実行時に、**テストケース単位での前処理・後処理**を容易に組み込める構造となっています。これにより、標準的な入力・出力チェックに加えて、柔軟な検証やログ出力、外部リソースとの連携なども実現できます。

##### 挿入ポイントの例

| 処理フェーズ | 目的例                           | 実装箇所                               |
| ------------ | -------------------------------- | -------------------------------------- |
| 前処理       | 入力の正規化、環境変数の設定     | `runTest()` の前に独自関数を呼び出す   |
| テスト実行時 | 独自のパーサや変換ロジックの使用 | `AgE2eFixtureFramework` に別実装を注入 |
| 後処理       | 結果の保存、ログ出力、DB書き込み | `runTest()` の結果オブジェクトを加工   |

##### 実装イメージ (前後処理の挿入)

```typescript
const framework = new AgE2eFixtureFramework(myCustomParser);

for (const { name, path: casePath } of testCases) {
  // 前処理: 環境初期化
  prepareEnvironment(name);

  it(name, async () => {
    const result = await framework.runTest(casePath);

    // 後処理: 結果をログに保存
    logResult(name, result);

    expect(result.pass).toBe(true);
  });
}
```

##### パーサやバリデータの差し替え

`AgE2eFixtureFramework` はコンストラクタで任意のパーサ・バリデータを受け取れるため、以下のようにテストの仕様に応じた差し替えが可能です。

```typescript
const framework = new AgE2eFixtureFramework(analyzeMarkdown, {
  parser: myCustomParser,
  validator: myCustomValidator,
});
```

この設計により、パーサ／バリデータの入れ替え、ログロジックの追加、外部 API の呼び出しなど、多様なテストユースケースに柔軟に対応できます。

#### 5.3 CI連携での設計観点

E2E Fixtures Framework を継続的インテグレーション (CI) 環境に組み込む際には、以下の設計観点を考慮することで、効率的で拡張性の高い運用が可能になります。

##### 1. テスト対象の限定と並列実行

- **対象絞り込み**
  `pattern` オプションを使って、変更されたカテゴリやファイルだけに絞ってテストを実行する。
  これはモノレポなどで部分的な変更を反映したい場合に効果的である。

- **並列ジョブ分割**
  `findTestCases()` の結果をカテゴリ単位でグルーピングし、GitHub Actions の `matrix` を使って並列実行すると、CI 時間を短縮できる。

##### 2. `.skip-e2e` と `#` ディレクトリによるスキップ戦略

- 一時的に CI 対象から除外したいテストは `.skip-e2e` ファイルを配置するだけで済む。
- WIP や不安定なケースを手軽に除外できるため、開発効率を落とさずに CI を安定化できる。

##### 3. テスト結果の出力と通知

- **JUnit 出力**
  Vitest の `--reporter=junit` を利用すれば、GitHub Actions における結果可視化や Allure Report などとの連携が可能。

- **失敗結果の投稿**
  `github-script` や通知アクションを組み合わせることで、PR に自動で失敗結果の概要を投稿し、レビュワーへの共有を高速化できる。

##### 4. キャッシュの活用

- `pnpm store`, `node_modules`, `.vitest` などのキャッシュを有効化することで、依存インストールやテストセットアップの速度を最適化できる。

```yaml
# テスト環境のキャッシュを有効化し、CI の高速化を図る
- uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm-store
      .vitest
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

##### 5. 実行効率と信頼性の両立

- 信頼性を重視する本番用ブランチでは、すべてのフィクスチャを対象とした `runAllFoundTests()` を使用。
- 検証段階や開発中のブランチでは `findTestCases()` を活用し、範囲限定テストで CI 負荷を軽減。

このような CI 設計により、フィクスチャ型のテスト戦略を最大限に活かしながら、安定かつ高速な開発フローを実現できます。

---

### まとめ

本章では、E2E Fixtures Framework に含まれる主要 API の構造と使用法を詳しく解説しました。

- `AgE2eTestDiscovery` により、柔軟かつ動的なテストケース検出が可能となり、大規模プロジェクトでも安定したテスト構成が実現できる。
- `AgE2eFileReader` は、入力ファイルと出力期待値を標準化された形式で取得でき、あらゆる形式のデータに対応しやすくなっている。
- `fixtureRunner` モジュールを活用することで、最小構成のテストから CI 統合まで、柔軟かつ簡潔な実行制御が可能になる。
- 共通型 `E2eTestOptions` によって、CLI やスクリプトからの設定統一ができ、開発者体験を向上できる。
- 実装戦略の観点では、カスタム処理の挿入、実行方法の選択、CI 連携のベストプラクティスなど、運用フェーズごとに最適な活用ができる。

E2E Fixtures Framework の API 群は、**拡張性と汎用性を兼ね備えたモジュール設計**により、初期開発から CI 統合、継続的運用までを包括的にカバーできるよう設計されています。

各 API の役割と活用法を理解することで、E2E テストの設計から運用までを一貫して効率化できます。
