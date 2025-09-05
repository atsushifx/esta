---
header:
  - src: docs/onboarding/03-global_tools.md
  - "@(#) : ESTA Onboarding Guide - Global Development Tools Setup"
title: グローバル開発ツールの一括セットアップ
description: プロジェクトでグローバルに使用する開発ツールのセットアップ手順の説明
version: 1.0.0
authors:
  - 👤 atsushifx（オンボーディングガイド作成）
changes:
  - 2025-09-05: フロントマター標準化対応
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
sidebar_position: 2
---

## 3 グローバル開発ツールの一括セットアップ

### 3.1 一括インストールスクリプトの概要

本プロジェクトでは、開発に必要なツール群をまとめて導入するために、PowerShell スクリプト `./scripts/install-dev-tools.ps1` を用意しています。
このスクリプトでは、以下の複数のパッケージマネージャを組み合わせてツールを導入します:

<!-- vale Google.WordList = NO -->

- **winget**：Microsoft 公式のアプリケーション配布マネージャ
- **Scoop**：バイナリ系ツールの簡易インストール
- **Volta**：Node.js および CLI ツールのバージョン管理
- **eget**：GitHub リリースからバイナリを直接取得する軽量 CLI

これらを用いて、`lefthook`, `dprint` などの支援ツールを**一括でグローバルに導入**します。

```powershell
./scripts/install-dev-tools.ps1
```

上記スクリプトの実行により、開発環境に必要な CLI ツールが一括でインストールされます。

### 3.2 インストール対象ツール一覧

<!-- markdownlint-disable line-length -->

| ツール名                                        | 役割             | 用途                               | 備考                                  |
| ----------------------------------------------- | ---------------- | ---------------------------------- | ------------------------------------- |
| lefthook                                        | Gitフック管理    | コミット・プッシュ前のチェック実行 | `lefthook install` による初期化が必要 |
| dprint                                          | コード整形       | コードの自動フォーマット           |                                       |
| gitleaks                                        | 機密情報検出     | 秘密情報の誤コミット防止           |                                       |
| commitlint                                      | コミット検証     | コミットメッセージの構文チェック   | 以下を含む複数パッケージで構成        |
| ├─ @commitlint/cli                              | CLI 実行ツール   | commitlint コマンド本体            |                                       |
| ├─ @commitlint/config-conventional              | 設定             | Conventional Commit 構文用         |                                       |
| └─ @commitlint/types                            | 型定義           | 型補完・エディタ支援               |                                       |
| secretlint                                      | シークレット検証 | コード内の機密情報ルール検出       | 推奨ルールセットを含む                |
| └─ @secretlint/secretlint-rule-preset-recommend | ルールセット     | 一般的な機密検出ルール群           |                                       |
| cspell                                          | スペルチェック   | ソースコードのスペルミス検出       |                                       |
| dotenvx                                         | 環境変数補助     | `.env` ファイル管理                | WinGet 経由で導入                     |
| codegpt                                         | AI CLI ツール    | GPT API をターミナルから利用       | GitHub より `eget` で取得             |

<!-- markdownlint-enable -->

### 3.3 実行上の注意点と前提条件

- 本章では、Volta, Scoop, pnpm のインストールは前章で完了済みであることを前提とします。
- スクリプトは `-Global` オプションでグローバルインストールを推奨しています。
- 実行後は各ツールのバージョンを確認し、正常に導入されたことを確認してください。
- `lefthook install` の実行後、Git フックが正しく動作しているかを確認してください。

### 3.4 dotenvx による環境変数の暗号化と運用

このプロジェクトでは、機密性の高い API キーやトークンの管理に dotenvx を使用します。
特に `codeGPT` の利用に必要な `OPENAI_API_KEY` は、`.env` ファイル内に記述され、**公開鍵暗号化形式で共有**されます。

#### 🔐 **暗号化済み `.env` ファイルの構成例**

```bash
#/-------------------[DOTENV_PUBLIC_KEY]--------------------/
#/            public-key encryption for .env files          /
#/       [how it works](https://dotenvx.com/encryption)     /
#/----------------------------------------------------------/
DOTENV_PUBLIC_KEY="0286eb33f22a774bd212686dccc16e9a0e6b8ce94c5112aaf4e394312b5476ef17"

OPENAI_API_KEY="encrypted:BxxEMhDsoEjFDp7iL6QL76jLeGW7HeNw24F0..."
```

この形式では `.env` 自体をコミットして共有できますが、API キーは復号しない限り使用できません。
復号キーは `env.keys ファイルに保存されています。内容をネットに流出させないよ注意が必要です。

#### 🧪 セットアップ手順

1. `dotenvx`で環境変数を設定:

   ```powershell
   dotenvx set api_key "sk-proj-8e9Q…"
   ```

2. `Lefthook`に`dotenvx`, `codegpt`を組み込み:

   ```yaml
   dotenvx run -- \
   codegpt \
   --config ./configs/codegpt.config.yaml \
   commit \
   --no_confirm --preview \
   --file "/git/COMMIT_EDITMSG"
   ```

3. `lefthook run`で動作確認:

   ```powershell
   lefthook run prepare-commit-msg
   ```

> 🔄 prepare-commit-msg フックの構成補足
> 本プロジェクトでは、codegpt によるコミットメッセージの自動生成を 二重実行から保護するため、lefthook の prepare-commit-msg
> では直接コマンドを記述せず、中継シェルスクリプトを呼び出す設計を採用しています。

### 3.5 動作確認チェックリスト

- [ ] lefthook のバージョンを確認した (`lefthook --version`)
- [ ] lefthook のフックを登録した (`lefthook install`)
- [ ] dprint のバージョンを確認した (`dprint --version`)
- [ ] gitleaks のバージョンを確認した (`gitleaks --version`)
- [ ] commitlint のバージョンを確認した (`commitlint --version`)
- [ ] secretlint のバージョンを確認した (`secretlint --version`)
- [ ] cspell のバージョンを確認した (`cspell --version`)
- [ ] コミットメッセージの作成を確認した (`lefthook run prepare-commit-msg`)

<!-- vale on -->
