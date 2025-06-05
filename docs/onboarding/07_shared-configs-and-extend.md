---
title: 設定ファイルの共通化と拡張
description: monorepoにおける設定ファイルの共通化運用と各サブパッケージでの拡張方法を解説します。
sidebar_position: 7
---

## 7 設定ファイルの共通化と拡張

### 7.1 共通設定ファイルの使用

本プロジェクトでは、`/shared/configs/`下に、各リポジトリで共通するルールを設定した基本設定ファイルを配置しています。
また、各リポジトリでは`/configs/`下に各リポジトリ用の設定ファイルを配置しています。
`tsconfig.json`などのようにリポジトリのルートに配置する必要のあるものはリポジトリルートに配置しています。

各リポジトリの設定ファイルは、`/shared/configs/`下の基本設定ファイルを参照し、リポジトリ独自の設定を`/configs/`下の設定ファイルに記述します。
これにより、各サブリポジトリの設定を共通にしつつ、それぞれのリポジトリに応じた柔軟な設定を実現しています。

#### 同期による共通化

設定ファイルによっては、基本設定ファイルを参照できないものがあります。
`secretlint`の設定ファイル、`secretlint.config.yaml`や`package.json`内のスクリプトが、これにあたります。

これらは、同期スクリプトによって基本設定ファイルの内容を上書きすることで設定を共通化しています。
そのため、同期スクリプトを実行すると、各リポジトリ独自の内容は削除されてしまいます。

### 7.2 共通設定ファイル一覧と概要

以下に、`/shared/configs/` に配置されている主要共通設定ファイルとその概要を示します。

<!-- markdownlint-disable line-length -->

| ファイル名                    | 概要                                       | 主な用途・備考                                                           |
| ----------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| `base-scripts.json`           | package.json の scripts セクション共通定義 | サブパッケージにコピーし、スクリプトを共通化                             |
| `commitlint.config.base.ts`   | commitlint の基本設定                      | コミットメッセージの検証に使用                                           |
| `eslint.config.base.js`       | ESLint 基本設定                            | JavaScript/TypeScript の静的解析設定                                     |
| `eslint.config.typed.base.js` | 型チェック用　ESLint 基本設定              | TypeScriptの型チェック用の ESLint 拡張設定                               |
| `eslint.projects.js`          | サブパッケージ一覧                         | `eslint.config`の`project`でのパッケージ参照用                           |
| `eslint.rules.typed.js`       | 型チェック用 ESLintルールセット            | 別ファイル (=変数化)により、FlatConfig上のそれぞれのエントリーに適用可能 |
| `secretlint.config.base.yaml` | Secretlint 機密情報検出設定                | 機密文字列検出用。各パッケージにコピーして利用                           |
| `tsconfig.base.json`          | TypeScript コンパイラ基本設定              | `target`,`module`などコンパイル時に共通化したいオプションを設定          |
| `tsup.config.base.ts`         | tsup ビルドツールの基本設定                | TypeScriptビルド共通設定                                                 |
| `vitest.config.base.ts`       | Vitest テストフレームワーク共通設定        | ユニットテスト／インテグレーションテスト共通設定                         |

<!-- markdownlint-enable -->

### 7.3 サブリポジトリにおける設定ファイル

サブリポジトリでは、`/configs/`下に設定ファイルを配置しています。
tsup, ESLint といった開発ツールは`/configs/`下の設定ファイルを参照しながらツールを実行します。

#### サブリポジトリの設定ファイル一覧

以下に、サブリポジトリで使用される設定ファイルを示します。

<!-- markdownlint-disable line-length -->

| 設定ファイル             | 使用ツール | 概要                                                      | 備考                                            |
| ------------------------ | ---------- | --------------------------------------------------------- | ----------------------------------------------- |
| `commitlint.config.ts`   | commitlint | コミットメッセージを `Conventional Commit` 形式で検証     | ルールは共通設定を参照                          |
| `eslint.config.js`       | ESLint     | TypeScript 向けの静的解析設定                             | ベース設定を `extends` で継承                   |
| `eslint.config.typed.js` | ESLint     | 型チェックを含む静的解析設定（TypeScript専用）            | `languageOptions` で型チェックを明示            |
| `secretlint.config.yaml` | secretlint | APIキー・パスワード等の秘密文字列の検出                   | `/shared/configs/` から同期されるため、編集不可 |
| `tsup.config.ts`         | tsup       | ソースコードのビルド設定                                  | CJS形式                                         |
| `tsup.config.module.ts`  | tsup       | ソースコードのビルド設定                                  | ESM型式および`index.d.ts`                       |
| `vitest.config.unit.ts`  | vitest     | ユニットテストの設定（`src/` 配下を対象）                 | 各関数単位での小規模テスト向け                  |
| `vitest.config.ci.ts`    | vitest     | CI用のインテグレーションテスト設定（`tests/` 配下を対象） | サービス間の結合・E2E検証などに利用             |

<!-- markdownlint-enable -->

#### 拡張設定の例

主な設定ファイルは、基本設定ファイルを参照し、リポジトリごとの設定だけを記述しています。

`eslint.config.js`では、下記のようになります。

```js
import baseConfig from '../../../../shared/configs/eslint.config.base.js';

// settings
export default [
  ...baseConfig,

  // source code settings
  {
    files: [
      'src/**/*.ts',
    ],
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
];
```

> 上記のように、ベース設定 (`baseConfig`) をスプレッドで継承し、
> プロジェクト固有のファイルパスや `tsconfig.json` の指定などを、個別エントリで追加しています。
> `settings.import/resolver` により、TypeScript のモジュール解決を正しく行います。

#### 同期する設定ファイル

Secretlint では、設定ファイルから基本設定ファイル`secretlint.config.base.yaml`の内容を読み込めません。
そのため、同期コマンドにより基本設定ファイルを各リポジトリの設定ファイルにコピーします。

以下のコマンドを実行すると、基本設定ファイル (`secretlint.config.base.yaml`)を設定ファイル (`secretlint.config.yaml`) にコピーします。

```powershell
pnpm run sync:configs secretlint
```

> 💡 このコマンドは、リポジトリ内の`/configs/secretlint.config.yaml` を
> `/shared/configs/secretlint.config.base.yaml` で上書きコピーします。
> すでに存在するファイルの**中身は破壊される**ので注意してください。

### 7.4 `monorepo`ルートの設定ファイル

本リポジトリは`monorepo`構成です。
ルートにおける設定ファイルは、すべてのサブパッケージが対象となるもの、CI/CD や Git の操作に関するもの、ドキュメント作成関連の設定ファイルといった特殊な設定ファイルが入ります。

具体的には、`eslint.config.js`などの設定ファイルはすべてのサブパッケージのコードが対象になります。
`lefthook.yml`のように Git フックに関する設定ファイルもあります。

`monorepo`ルートにおける設定ファイルは、次の通りです。

<!-- markdownlint-disable line-length -->

| 設定ファイル             | 使用ツール        | 概要                                                  | 備考                                                                       |
| ------------------------ | ----------------- | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| `commitlint.config.ts`   | commitlint        | コミットメッセージを `Conventional Commit` 形式で検証 | ルールは共通設定を参照                                                     |
| `secretlint.config.yaml` | Secretlint        | 機密情報検出設定                                      | コミット前のスキャンで機密情報の漏洩をチェック                             |
| `eslint.config.js`       | ESLint            | TypeScript 向けの静的解析設定                         | 全サブパッケージのソースコード (`/packages/**/*.ts,/shared/**/*.ts`)が対象 |
| `eslint.config.typed.js` | ESLint            | TypeScript 向けの型チェック設定                       | 全サブパッケージのソースコード (`/packages/**/*.ts,/shared/**/*.ts`)が対象 |
| `gitleaks.toml`          | Gitleaks          | 機密情報設定                                          | GitHub Actions での機密情報スキャンでも利用                                |
| `ls-lint.yaml`           | ls-lint           | ファイル／ディレクトリ形式設定                        | コミット前のスキャンでファイル名／ディレクトリ名が指定形式かチェック       |
| `.markdownlint.yaml`     | markdownlint-cli2 | マークダウンドキュメントのエラーチェックルールを設定  | ドキュメント作成時に使用                                                   |
| `textlintrc.yaml`        | textlint          | ドキュメントの文章に対しての文法エラーチェック        | サブディレクトリ`/configs/.textlint`内の設定も同様                         |
| `dprint.jsonc`           | dprint            | dprint フォーマッタ用フォーマット形式指定             | サブリポジトリでのフォーマットも、この設定ファイルを使用                   |
| `lefthook.yml`           | Lefthook          | Git フックマネージャーLefthook用設定                  | Git フックは monorepo 全体に適用されるため、monorepoルートにのみ配置       |

<!-- markdownlint-enable -->
