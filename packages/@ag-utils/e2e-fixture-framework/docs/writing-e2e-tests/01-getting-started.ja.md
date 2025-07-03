---
title: はじめてのフィクスチャーフレームワーク
description: E2E Fixture Framework を使って最初のE2Eテストを作成するための導入ガイドです。
sidebar_position: 1
slug: /getting-started
---

## 第1章 はじめてのフィクスチャーフレームワーク

E2E Fixture Framework は、ファイルベースでテストケースを記述・検証できる柔軟な E2E テストフレームワークです。
この章では、セットアップから最初のテスト実行までの流れを解説します。

### 1. セットアップ

#### 1.1 前提

E2E Fixtures Framework は、`ESTA` プロジェクトの一部として構成されています。そのため、以下の前提を満たす必要があります。

- テスト対象パッケージが、`@ag-utils/e2e-fixture-framework` を利用可能な `ESTA` モノレポ内に存在していること
- `pnpm` によるワークスペース環境が有効であること
- `Vitest` によるテストランナーを使用する構成が導入されていること

> `ESTA` 全体の構成や導入手順については、[オンボーディングドキュメント](../../../../../docs/onboarding/README.ja.md) を参照してください。

この章では、あくまで「E2E Fixtures Framework を使ったテストの書き方」に焦点を当てており、`Node.js` や `pnpm` のインストールといった環境構築の詳細は省略します。

#### 1.2 パッケージのインストール

E2E Fixture Framework を利用するには、テスト対象のパッケージに以下のように依存関係とスクリプトを追加します。
このフレームワークは、ESTA モノレポ内で `workspace:*` として管理されているため、ローカル開発中も即座に使用できます。

まず、`package.json` に次の内容を追加します。

```json
// package.json
{
  "scripts": {
    "test:ci": "pnpm exec vitest run --config ./configs/vitest.config.ci.ts"
  },
  "devDependencies": {
    "@ag-utils/e2e-fixture-framework": "workspace:*"
  }
}
```

次に、依存関係をインストールします。

```bash
pnpm install
```

この手順により、`@ag-utils/e2e-fixtures-framework` が導入され、E2E テストを記述・実行する準備が整います。

> 注意: vitest.config.ci.ts などの Vitest 設定ファイルが存在していない場合は、プロジェクト側で適切に用意してください。

### 2. フィクスチャの配置

E2E Fixtures Framework では、テストケースごとに **入力ファイルと出力ファイルのペア** をディレクトリに配置することで、テストを定義します。これは、「入力に対して、期待する出力が得られるかどうか」を検証するシンプルで明確な構造です。

#### 2.1 基本構成

E2E Fixture Framework では、各テストケースを個別のディレクトリで管理し、**そのなかに入力ファイルと期待される出力ファイルをペアで配置**する形式を採用しています。この構成によって、テストの内容が視覚的に把握しやすく、メンテナンス性も高くなります。

```bash
fixtures/
  └── basic/
      ├── input.md     ← テスト対象の入力ファイル
      └── output.json  ← 期待される出力
```

- `fixtures/` はテストフィクスチャ全体のルートディレクトリ
- その下に任意のケース名 (この例では `basic` )をディレクトリ名として作成。
- 各ディレクトリには、最低限 `input.*` と `output.json` の 2 ファイルが必要。

この構成を取ることで、ファイル単位で「入力 → 出力」の変換を検証するスタイルのテストを、簡潔かつ明示的に記述できます。

> 大規模なテストケースや多段階の構文検証にも応用可能で、入力と出力の対応関係を明確に保つことができます。

#### 2.2 テストケース名

E2E Fixtures Framework における各テストケースは、**ディレクトリ名をそのままケース名**として使用します。このケース名は、テスト実行時のログ出力やエラーメッセージの識別に使われます。

**1階層ディレクトリの場合**:

```bash
fixtures/
  └── basic/
      ├── input.md
      └── output.json
```

この構成では、`basic` というケース名でテストが実行されます。

**ネストされた構成の場合**:

````bash
fixtures/
  └── advanced/
      └── nested/
          ├── input.md
          └── output.json
```

このように階層構造を取る場合でも、テストケース名は `advanced/nested` として認識され、テスト出力やエラーメッセージにそのまま表示されます。

> ケース名はファイルパスに基づいて決定されるため、カテゴリ別に階層化されたテストも自然に管理できます。>これにより、
> 数百を超える大規模なテストケースでも整理しやすくなり、メンテナンス性が向上します。

#### 2.3 拡張子の柔軟性

E2E Fixtures Framework では、入力ファイルの拡張子を柔軟に選択できます。テスト内容や対象形式に応じて `.md`, `.txt`, `.error` など、任意の拡張子を使用可能です。

**主な利用例**:

| 拡張子 | ファイル種別 | 用途 |
| -- | -- | -- |
| .md | Markdown | Markdown を入力とした見出し抽出などの検証 |
| .txt | プレインテキスト | プレインテキストを処理対象とする変換系 |
| .error | void | パース失敗や例外系のテストフィクスチャ |

フレームワーク内部では、**ファイルの拡張子に応じて適切な処理ロジック (パーサやバリデータ) を選択**する設計になっています。

> 独自の拡張子に対応したい場合は、パーサやバリデータのカスタマイズにより処理対象を拡張できます (詳細は[第6章](06-parsers-and-validators.ja.md)参照)。
> この柔軟性により、多様な形式・目的に応じたE2Eテストを構築できます。

### 2.4 実行対象外のディレクトリ（`#` 付き）

テスト開発の途中で一時的に特定のテストケースをスキップしたい場合、**ディレクトリ名の先頭に `#` を付けることで、そのディレクトリを実行対象から除外**できます。

#### **使用例**

```bash
fixtures/
  ├── basic/           # 実行対象
  ├── #draft-case/     # 実行されない
````

この構成では、`basic` のみがテスト対象となり、`#draft-case` ディレクトリ内のケースは **無視されます**。

#### **特徴と利点**

- 一時的に無効化したいケースや作業中のケースを簡易に管理できる
- `runAllFoundTests()` 実行時にも自動でスキップされるため、明示的な除外設定は不要
- 複数人開発時にも、未完成のフィクスチャを安全に保持しておける

> コメントアウト的な扱いとして使えるこの機能は、テスト開発のスピードと柔軟性を両立させるうえで非常に便利です。

### 3. 最初のfixtureを書いてみる

#### 3.1 `fixtures`の例

最初の`fixtures`として、`basic`ディレクトリ下に以下のファイルを作成します。

`fixtures/basic/input.md`

```markdown
# サンプル入力

これはテスト用のマークダウンです。
```

`fixtures/basic/output.json`

```json
{
  "type": "markdown",
  "headers": ["サンプル入力"]
}
```

- Markdown から`#`見出しを抽出するような処理を仮定
- validator によって `input → output` の対応の一致を検証

### 3.2 テストファイルを作る

作成した `fixtures/` を対象に、テストスクリプトを記述します。
以下のように `tests/e2e/framework.e2e.spec.ts` を作成してください。

```typescript
// tests/e2e/framework.e2e.spec.ts
import { AgE2eFixtureFramework } from '@ag-utils/e2e-fixture-framework';
import { describe } from 'vitest';

const testCases = AgE2eTestDiscovery.fromDirectory('fixtures');

describe('E2E Fixture Framework 基本テスト', () => {
  framework.runAllFoundTests('fixtures');
});
```

### 4. テストの実行

作成したテストスクリプトを実行するには、次のコマンドを使います:

```bash
pnpm run test:ci
```

このコマンドは、`vitest` を使って `tests/e2e/framework.e2e.spec.ts` を実行します。
`runAllFoundTests()` により、`fixtures/` 以下のすべてのテストケースが自動的に検出・検証されます。

#### 4.1 成功時の出力

```bash
✓ E2E Fixture Framework 基本テスト > fixtures/basic
```

- 緑色のチェックマークが表示され、すべてのテストが正常に通過したことを示す。

#### 4.2 失敗時の出力

```bash
✘ E2E Fixture Framework 基本テスト > fixtures/basic
   Error: Validation failed in case: basic
   Expected: ["サンプル入力"]
   Received: ["Sample"]
```

- テストケース名 (`basic`) と差分 (`Expected` / `Received`) が表示される。
- 出力内容が期待と異なる場合は `output.json` を見直してください。

#### 4.3 ヒント

- 複数のケースを作成した場合も、テストスクリプトの記述を追加する必要はありません。
- `runAllFoundTests()` が `fixtures/` を探索してすべてのテストを処理してくる。
- `#` で始まるディレクトリは自動で無視される。
