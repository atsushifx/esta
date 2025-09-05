---
header:
  - src: docs/onboarding/04-writers_tools.md
  - "@(#) : ESTA Onboarding Guide - Writing Support Tools Setup"
title: ライティング支援ツールのセットアップ
description: ドキュメントの品質向上のためのツール群をインストール、設定します
version: 1.0.0
authors:
  - 👤 atsushifx（オンボーディングガイド作成）
changes:
  - 2025-09-05: フロントマター標準化対応
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
sidebar_position: 4
---

## 4 ライティング支援ツールのセットアップ

### 4.1 一括セットアップスクリプトの概要

このプロジェクトでは、ドキュメント作成支援用に `./scripts/install-doc-tools.ps1` を提供しています。
このスクリプトは `pnpm` を使用してライティング支援ツールをグローバルにインストールし、テンプレートディレクトリから設定ファイルを指定されたディレクトリにコピーします。

実行例 (テンプレートディレクトリと出力先を指定):

```powershell
./scripts/install-doc-tools.ps1 -TemplateDir ./configs -DestinationDir .
```

引数を省略した場合、`-TemplateDir` は `./templates`、`-DestinationDir` はカレントディレクトリが使用されます。

### 4.2 インストールされるツール一覧と役割

<!-- markdownlint-disable line-length --><!-- vale off -->

| ツール名          | 主な用途                       | 備考                                                                 |
| ----------------- | ------------------------------ | -------------------------------------------------------------------- |
| textlint          | 技術文書の文章チェック         | 各種日本語ルールと英語チェック含む                                   |
| markdownlint-cli2 | Markdown構文・スタイルチェック | CLI ベースで実行可能                                                 |
| cspell            | スペルチェック                 | `.vscode/cspell.json` があり、外部のユーザー辞書を読み込んでいます。 |

<!-- vale on --><!-- markdownlint-enable -->

### 4.3 利用方法とセットアップ時の注意点

- `pnpm` がインストール済みであることを前提とする。
- スクリプトは `pnpm` を遣ってツールをグローバルにインストールする。
- 設定ファイルはモノレポルートの `configs/` と `.vscode/` へコピーする。
- インストール後は各ツールのバージョンを確認し、正しくインストールされたかをチェックしてください。

### 4.4 `cSpell` の辞書設定

`cSpell` の VSCode 拡張機能は `.vscode/cspell.json` を自動的に読み込み、ユーザー辞書とプロジェクト用辞書を適用します。
プロジェクト固有の設定や辞書追加については、[ライティング支援ツールの設定](10-writing_tools.md)) を参照してください。

### 4.5 セットアップ完了チェックリスト

- [ ] textlint のバージョンを確認した (`textlint --version`)　※ エラーが出ないかも確認
- [ ] markdownlint-cli2 のバージョンを確認した (`markdownlint-cli2 --version`)
- [ ] cspell のバージョンを確認した (`cspell --version`)
- [ ] textlint の動作を確認した (`pnpm run lint:text doc/**/*.md`)
- [ ] markdownlint の動作を確認した (`pnpm run lint:markdown doc/**/*.md`)
- [ ] cspell の動作を確認した (`pnpm run check:spells **/*.ts`)
