---
title: ドキュメントツールの導入
description: textlint、markdownlint、cspell などライター向けのリント・スペルチェックツールの導入方法を説明します。
sidebar_position: 3
---

## 4 ドキュメントツールの導入

### 4.1 ツール一括インストールスクリプトについて

本プロジェクトでは、`./scripts/installLinter.ps1` スクリプトを用意しています。
このスクリプトは PowerShell で書かれており、Windows 環境で pnpm を使って以下のライター向けツールをグローバルにインストールします。

実行例:

```powershell
./scripts/installLinter.ps1 -Global
```

### 4.2 インストール対象ツール一覧

<!-- markdownlint-disable line-length -->

| ツール名          | 用途                           | 備考                                                                 |
| ----------------- | ------------------------------ | -------------------------------------------------------------------- |
| textlint          | 技術文書の文章チェック         | 各種日本語ルールと英語チェック含む                                   |
| markdownlint-cli2 | Markdown構文・スタイルチェック | CLIで実行可能                                                        |
| cspell            | スペルチェック                 | `.vscode/cspell.json` があり、外部のユーザー辞書を読み込んでいます。 |

<!-- markdownlint-enable -->

### 4.3 使い方と注意点

- 本章では、pnpm がインストール済みであることを前提とします。
- スクリプトは `-Global` オプションでグローバルインストールを推奨しています。
- 設定ファイルは、monorepo ルートの`/configs/`ディレクトリで設定しています。
- cspell は、外部の設定ファイル `${env:XDG_CONFIG_HOME}/vscode/cspell.config.json` を読み込んでユーザー専用辞書を設定しています。設定方法は、[`cSpell`の設定](#44-cspellの設定)を参考にしてください。
- インストール後、各ツールのバージョンを確認し、正しくインストールされたかをチェックしてください。

### 4.4 `cSpell`の設定

`cSpell` は環境変数`XDG_CONFIG_HOME`下の設定ファイルでユーザー専用辞書を設定します。
`cSpell`を使用するためには、`${XDG_CONFIG_HOME}/vscode/cspell.config.json`という設定ファイルを作成し、下記の設定をする必要があります。

```json
// src: ${env:XDG_CONFIG_HOME}\vscode/cspell.config.json
// @(#) :  cspell config for user centric settings
{
  "$schema": "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-types/cspell.schema.json",
  "version": "0.2",
  "language": "en",
  "caseSensitive": true,
  "dictionaryDefinitions": [
    {
      "name": "user-dic",
      "description": "dictionary words for user settings",
      "path": "${env:XDG_CONFIG_HOME}/vscode/cSpell/dicts/user.dic",
      "addWords": true,
      "scope": "user"
    }
  ],
  "dictionaries": [
    "en-us",
    "software-terms",
    "public-licenses",
    "shellscript",
    "vim",
    "user-dic",
    "project-dic"
  ],
  "useGitignore": true
}
```

### 4.5 チェックリスト

- [ ] textlint のバージョンを確認した (`textlint --version`)
- [ ] markdownlint-cli2 のバージョンを確認した (`markdownlint-cli2 --version`)
- [ ] cspell のバージョンを確認した (`cspell --version`)
- [ ] textlint の動作を確認した (`pnpm run lint:text doc/**/*.md`)
- [ ] markdownlint の動作を確認した (`pnpm run lint:markdown doc/**/*.md`)
- [ ] cspell の動作を確認した (`pnpm run check:spells **/*.ts`)
