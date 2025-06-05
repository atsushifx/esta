---
title: package.jsonのスクリプト管理
description: monorepo構成における共通スクリプトとルートスクリプトの使い分け、管理方法について解説します。
sidebar_position: 8
---

## 8 package.jsonのスクリプト管理

本章では、`monorepo`構成における `package.json` のスクリプト管理について解説します。

### 8.1 概要

本プロジェクトでは、各サブパッケージの `package.json` に定義される `scripts` セクションを共通化しています。
共通スクリプトは `/shared/configs/base-scripts.json` に記述されており、
同期コマンドにより各パッケージの `package.json` に自動で反映されます。

> ※ `/shared/common/` 下のスクリプトは対象ディレクトリ構造が異なるため、同期の対象外です。
> そのため、**手動での設定・更新が必要です。**

これにより、各サブパッケージでのスクリプト管理が効率化され、運用コストが削減されます。

一方、`monorepo`のルート（プロジェクトルート）では、
**ルート固有のスクリプトや、全体に影響する管理用スクリプト**が定義されています。
これには、CI/CD の実行、全パッケージ横断の処理などが含まれます。

<!-- markdownlint-disable line-length -->

| 定義場所                            | 役割・スコープ                        | 典型的な用途                                                    |
| ----------------------------------- | ------------------------------------- | --------------------------------------------------------------- |
| `/shared/configs/base-scripts.json` | サブパッケージ用の共通スクリプト      | ビルド、テスト、リントなど                                      |
| Monorepoルートの `package.json`     | 全体管理向けのスクリプト (ルート固有) | 全ソースコードへのリント、ドキュメント生成、CI/CD一括タスクなど |

<!-- markdownlint-enable -->

> 💡 各サブパッケージのスクリプトは、同期コマンドによって
> `/shared/configs/base-scripts.json` の内容に上書きされます。
> 一方で、ルートのスクリプトは手動で管理します (※ ルート特有の処理があるため同期の対象外です)。
> 一部の操作は `pnpm -r` 形式により、サブパッケージ全体に対して一括で実行されます。

### 8.2 スクリプトの同期方法

各サブパッケージの `package.json`のスクリプトは、共通ファイル `/shared/configs/base-scripts.json` を基に、同期スクリプトにより自動で上書き・反映されます。

#### 同期スクリプト

同期には、以下のスクリプトを使用します:

- `/scripts/sync-configs.sh`: Bash スクリプト。共通設定ファイルを指定ディレクトリに同期する。
- `/scripts/sync-package-scripts.ts`: `package.json` の `scripts` セクションを同期・マージする TypeScript スクリプト。

この仕組みにより、設定の統一と保守性の向上を実現しています。

#### 実行方法

次のコマンドにより、サブパッケージ内の `package.json` のスクリプトが共通スクリプトに同期されます:

```bash
bash ./scripts/sync-configs.sh ./packages/<@package-name-space>/<your-package-name> package
```

> 💡 dry-runを有効にしたい場合は、`--dry-run` を末尾に追加してください。

また、`config_type` に `all` を指定すると、`secretlint.config.yaml` など他の共通設定もあわせて同期可能です:

```bash
./scripts/sync-configs.sh ./packages/your-package-name all
```

あるいは、パッケージ側の `package.json` に定義された `sync:configs` スクリプトを使っても同様に実行できます:

```bash
pnpm run sync:configs package
pnpm run sync:configs all
```

#### 同期対象と動作

<!-- markdownlint-disable line-length -->

| config_type  | 対象ファイル例                                                   | 備考                                     |
| ------------ | ---------------------------------------------------------------- | ---------------------------------------- |
| `package`    | `base-scripts.json` → 各パッケージの `package.json`              | `tsx sync-package-scripts.ts` を経由     |
| `secretlint` | `secretlint.config.base.yaml` → `configs/secretlint.config.yaml` | 上書き　(編集内容は失われる)             |
| `all`        | 上記すべて                                                       | `secretlint`, `package` の両方を順に実行 |

<!-- markdownlint-enable -->

### 8.3 共通スクリプトの内容と役割

共通スクリプトは、`/shared/configs/base-scripts.json` に定義されており、各サブパッケージの`package.json`に同期されます。
これにより、各サブパッケージは一貫した開発作業が可能です。
以下に、主なスクリプトとその役割を示します。

| スクリプト名    | 内容・目的 (設定ファイル)                                       |
| --------------- | --------------------------------------------------------------- |
| `build`         | CJSとESM両方のビルドを一括実行します (`build:cjs`, `build:esm`) |
| `build:cjs`     | CommonJS形式でビルド (`tsup.config.ts`)                         |
| `build:esm`     | ESModules形式でビルド (`tsup.config.module.ts`)                 |
| `clean`         | `lib`, `module`, `.cache` ディレクトリの削除                    |
| `format:dprint` | `dprint` によるコードフォーマット実行                           |
| `check:dprint`  | `dprint` によるコード整形チェック                               |
| `check:types`   | TypeScriptの型チェック (`tsc --noEmit`)                         |
| `check:spells`  | `cspell` によるスペルチェック                                   |
| `lint`          | ESLintによるコード静的解析 (`eslint.config.js`)                 |
| `lint:types`    | 型チェック用ESLintルール適用 (`eslint.config.typed.js`)         |
| `lint:all`      | `lint` と `lint:types` の両方を実行                             |
| `lint:fix`      | `lint` の修正モード実行 (`--fix`)                               |
| `lint:secrets`  | Secretlint による秘密情報検出 (`secretlint.config.yaml`)        |
| `test`          | 開発用・CI用のテストを一括実行 (`test:develop`, `test:ci`)      |
| `test:develop`  | ユニットテストの実行 (`vitest.config.unit.ts`)                  |
| `test:ci`       | CI用のインテグレーションテスト実行 (`vitest.config.ci.ts`)      |
| `test:watch`    | ユニットテストのwatchモード (`--watch`)                         |
| `sync:configs`  | 同期スクリプト (`sync_configs.sh`) によりコンフィグ等を同期     |

> 💡 これらのスクリプトは各パッケージの`package.json`に同期されて使用されます。
> コマンドの前には `pnpm run` を付けて実行します。

### 8.4 `monorepo`ルートスクリプトの内容と役割

`monorepo`ルート（リポジトリのルートディレクトリ）は、各サブパッケージの統括的な管理や CI/CD 実行など、全体に関わる処理を担当する特別なパッケージです。

そのため、`package.json` に定義されるスクリプトもサブパッケージとは異なり、プロジェクト全体を対象としています。

#### `monorepo`ルートの代表的なスクリプト

以下は、`monorepo`ルートで定義されている代表的なスクリプトとその役割です。

<!-- markdownlint-disable line-length -->

| スクリプト名     | 役割                                                                   | 備考                                 |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------ |
| `build`          | 全サブパッケージの `build` スクリプトを `pnpm -r run build` で一括実行 | `build:esm` `build:cjs` も同様に存在 |
| `clean`          | 各パッケージのビルド成果物 (`lib`, `module`) を削除                    | `pnpm -r run clean` を使用           |
| `format:dprint`  | `dprint` による全体のコードフォーマット                                |                                      |
| `check:dprint`   | `dprint` の整形チェック                                                |                                      |
| `check:types`    | 全パッケージの型チェック (`tsc --noEmit`) を一括実行                   |                                      |
| `check:spells`   | `cspell` によるスペルミス検出                                          | `.cache/cspell/` にキャッシュを保存  |
| `lint`           | 各パッケージのESLintチェックを一括実行 (`pnpm -r run lint`)            |                                      |
| `lint:types`     | 各パッケージの型チェック用 ESLint を一括実行                           |                                      |
| `lint-all`       | 全ソースコード対象にルート直下のESLint設定で静的解析を実施             | `lefthook`の`pre-commit`で使用される |
| `lint-all:types` | 型チェックを含む静的解析 (`eslint.config.typed.js`)                    | `lefthook`の`pre-commit`で使用される |
| `lint:filename`  | `ls-lint` によるファイル名ポリシー検証                                 |                                      |
| `lint:text`      | `textlint` による自然言語チェック（README等）                          |                                      |
| `lint:markdown`  | `markdownlint-cli2` によるMarkdown構文チェック                         |                                      |
| `lint:secrets`   | `secretlint` による機密文字列の検出                                    | `.gitignore` を無視リストとして使用  |

<!-- markdownlint-enable -->

**補足**:

- `pnpm -r run <script>` は、すべてのサブパッケージに対してスクリプトを一括実行します。
- 処理の順序が不要なタスク (例：`lint` や `clean`) では `--parallel` オプションをつけて並列実行することで高速化できます。
- ルートの`lint-all`,`lint-all:types`スクリプトは、Lefthook での実行時に変更されたソースコードのみスキャンします。
  ソースコード全体をスキャンする`lint`と違い、高速な実行が見込めます。

#### Gitフックとの連携

ルートには `lefthook.yml` があり、`pre-commit` フックとして `lint-all` が設定されています。これにより、コミット前にコードの静的解析が自動で実行されます。

```yaml
# .lefthook.yml (抜粋)
pre-commit:
  commands:
    lint:
      run: pnpm lint-all
```

このように、`monorepo`ルートではサブパッケージ全体をまたぐ横断的なスクリプトと、それらを自動実行する Git フック設定により、プロジェクトの品質管理を支えています。

### 8.5 チェックポイントとチェックリスト

この章で学んだ内容を正しく理解し、プロジェクト内で運用できているかを以下の観点で確認しましょう。

#### ✅ チェックポイント

- [ ] 共通スクリプトの定義場所が `/shared/configs/base-scripts.json` にあることを理解している
- [ ] 各サブパッケージの `package.json` は同期コマンドによりスクリプトが上書き・反映される
- [ ] ルートの `package.json` は同期されず、プロジェクト全体の横断的処理を担う
- [ ] `pnpm -r run <script>` による一括処理と、`--parallel` による高速化の違いを理解している
- [ ] Git フック (`lefthook.yml`) を用いた静的解析の自動実行が設定されていることを知っている

#### 📋 実践用チェックリスト

<!-- markdownlint-disable line-length -->

| 項目                                                                     | コマンド or ファイル                | 達成状況 |
| ------------------------------------------------------------------------ | ----------------------------------- | -------- |
| 共通スクリプトの同期を実行した                                           | `pnpm run sync:configs package`     | ✅ / ☐   |
| `base-scripts.json` に必要なスクリプトが定義されている                   | `/shared/configs/base-scripts.json` | ✅ / ☐   |
| ルートの `lint-all` 実行で静的解析できる                                 | `pnpm run lint-all`                 | ✅ / ☐   |
| Gitコミット前に `lefthook` によるチェックが動作する                      | `.lefthook.yml` 設定確認済み        | ✅ / ☐   |
| サブパッケージに個別スクリプトを追加した場合、同期の再実行を忘れていない | `sync-configs.sh` 再実行済み        | ✅ / ☐   |

<!-- markdownlint-enable -->

> 💡 チェックリストはCI導入や開発初期の設定確認としても活用できます。

---

これにより、スクリプト管理の運用が**自動化、属人性が排除される構成**されます。
