---
header:
  - src: docs/onboarding/05-dev_tools_setup.md
  - "@(#) : ESTA Onboarding Guide - Development and Validation Tools Setup"
title: 開発ツールと検証ツールのセットアップ
description: pnpm でプロジェクトに必要な開発・検証ツールをローカルおよびグローバルにインストールします。
version: 1.0.0
authors:
  - 👤 atsushifx（オンボーディングガイド作成）
changes:
  - 2025-09-05: フロントマター標準化対応
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
sidebar_position: 5
---

## 開発ツールと検証ツールのセットアップ

この章では、本プロジェクトで使用する各種開発・検証ツールのインストール方法を説明します。
ローカルインストールは、`pnpm install` によって `devDependencies` を反映します。
TypeScript はグローバルにもインストールします。

### ローカル開発ツールのインストール

`pnpm` を使って、`package.json` に記載された依存パッケージをローカル環境に一括で導入します。

```powershell
pnpm install
```

### ローカルにインストールされる開発ツール一覧

<!-- markdownlint-disable line-length -->

| ツール名   | ツール種別      | 主なパッケージ     | 概要                                  | 備考                             |
| ---------- | --------------- | ------------------ | ------------------------------------- | -------------------------------- |
| cspell     | 検証ツール      | `cspell`           | スペルチェック                        | `.vscode/cspell.json` で設定可能 |
| eslint     | 検証ツール      | `eslint`           | JS/TS の構文・品質検査                | ESLint プラグイン構成を含む      |
| ls-lint    | 検証ツール      | `@ls-lint/ls-lint` | ディレクトリ/ファイル名の型式チェック | `.yaml` によるルール定義         |
| tsup       | ビルド/実行関連 | `tsup`             | TS ビルド・バンドル                   | 高速ビルドに対応                 |
| tsx        | ビルド/実行関連 | `tsx`              | TypeScript スクリプトランナー         | Node.js 上で TS 実行             |
| typescript | ビルド/実行関連 | `typescript`       | 型チェック＋コンパイル                | グローバル導入も推奨             |
| vitest     | テストツール    | `vitest`           | 単体テスト実行                        | Vite ベースの高速テスト          |
| rimraf     | ユーティリティ  | `rimraf`           | ファイル/ディレクトリの削除           | クロスプラットフォーム対応       |

<!-- markdownlint-enable -->

### `TypeScript`のグローバルインストール

```powershell
pnpm add -g typescript
```

### セットアップまとめ

<!--  vale off -->

- `pnpm install` で開発・Lint 系ツールをローカルに導入
- TypeScript は CLI (`tsc`) のためにグローバル導入
- Volta などを用いて Node.js やパッケージのバージョンの固定化を推奨

<!-- vale on -->

### 開発ツール導入チェックリスト

- [ ] 開発ツールをインストールした (`pnpm install`)
- [ ] TypeScript がグローバルにインストールされている (`tsc --version`)
- [ ] 開発ツール群が正しく導入されていることを確認した (`pnpm list --depth=0`)
