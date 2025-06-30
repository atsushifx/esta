---
title: はじめてのフィクスチャーフレームワーク
description: E2E Fixture Framework を使って最初のE2Eテストを作成するための導入ガイドです。
sidebar_position: 1
slug: /getting-started
---

## 第1章 はじめてのフィクスチャーフレームワーク

### セットアップ

#### 前提

- `ESTA`プロジェクト内のパッケージであること。

> ESTAプロジェクトでの開発については、[オンボーディング](../../../../../docs/onboarding/README.ja.md) を
> 参照してください。

#### パッケージのインストール

E2E Fixture Framework は、ESTAの内部パッケージです。
E2E Fixture Framework を使いたいパッケージは、依存関係を追加してパッケージをインストールします。

package.json に次の項目を追加します。

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

パッケージをインストールします。

```bash
pnpm install
```

以上で、E2E Fixture Framework が使えるようになります。

### フィクスチャの配置

このフレームワークでは、**テストデータ（fixture）をファイルで定義**します。
1つのテストケースは、次のような構成になります:

```bash
fixtures/
  └── basic/
    ├── input.md    ← テスト対象の入力
    └── output.json ← 期待される出力
```

`fixtures/`下にテスト用のディレクトリ (例：`basic/`) を作成し、
その中に `input` / `output` ファイルを配置することで、**1つのテストケース**が定義されます。

| ファイル      | 内容例                                  |
| ------------- | --------------------------------------- |
| `input.md`    | 任意の入力データ (例: Markdown文)       |
| `output.json` | 期待される出力データ (例: 抽出結果など) |

#### ✅ テストケース名

- `basic/` のような ディレクトリ名がテストケース名 になります。
- `サブディレクトリ` (例：`basic/foo/`) もサポートされ、`basic/foo` という名前で認識されます。

`basic/` というディレクトリは、**1つのテストケース**として扱われます。
その中に、以下のようなペアを置くことで fixture が完成します:

#### 📂 拡張子に制限はありません

- .md, .txt, .error など 任意の拡張子を使用可能です。
- 内容に応じて、必要な形式で入力ファイルを用意してください。
- バリデータ (validator) 側が拡張子に応じて適切に処理します。

#### 🚫 コメントアウト用ディレクトリ (#付き)

`#` で始まるディレクトリは テスト対象外 になります:

```bash
fixtures/
  ├── basic/
  ├── #draft-case/  ← 実行されません (コメントアウト扱い)
```

上記のようなディレクトリの場合、`#-draft`内のテストケースは、テストされません。

> - 一時的に無効化したいテストを除外するのに便利
> - `runAllFoundTests()` においても自動的に無視されます

### 最初のfixtureを書いてみる

#### `fixtures`の例

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

- Markdownから`#`見出しを抽出するような処理を仮定しています
- validatorによって `input → output` の対応の一致が検証されます

### テストファイルを作る

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

### テストの実行

作成したテストスクリプトを実行するには、次のコマンドを使います：

```bash
pnpm run test:ci
```

このコマンドは、`vitest` を使って `tests/e2e/framework.e2e.spec.ts` を実行します。
`runAllFoundTests()` により、`fixtures/` 以下のすべてのテストケースが自動的に検出・検証されます。

#### ✅ 成功時の出力

```bash
✓ E2E Fixture Framework 基本テスト > fixtures/basic
```

- 緑色のチェックマークが表示され、すべてのテストが正常に通過したことを示します。

#### ❌ 失敗時の出力

```bash
✘ E2E Fixture Framework 基本テスト > fixtures/basic
   Error: Validation failed in case: basic
   Expected: ["サンプル入力"]
   Received: ["Sample"]
```

- テストケース名 (`basic`) と差分 (`Expected` / `Received`) が表示されます。
- 出力内容が期待と異なる場合は `output.json` を見直してください。

#### 💡 ヒント

- 複数のケースを作成した場合も、テストスクリプトの記述を追加する必要はありません。
- `runAllFoundTests()` が `fixtures/` を探索して全てのテストを処理してくれます。
- `#` で始まるディレクトリは自動で無視されます。
