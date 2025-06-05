---
title: グローバル開発ツールのセットアップ
description: この章では、Volta, pnpm, lefthook などプロジェクトで使用するグローバルツールの導入方法について説明します。
sidebar_position: 2
---

## 3 グローバルツールの導入

### 3.1 ツール一括インストールスクリプトについて

本プロジェクトでは、`./scripts/install-dev-tools.ps1` スクリプトを用意しています。
このスクリプトは PowerShell で書かれており、Windows 環境で Scoop と pnpm を使って以下の開発支援ツールをグローバルにインストールします。

./scripts/install-dev-tools.ps1 -Global

### 3.2 インストール対象ツール一覧

| ツール名   | 用途                   | 備考                               |
| ---------- | ---------------------- | ---------------------------------- |
| lefthook   | Gitフック管理          | コミット・プッシュ前のチェック実行 |
| dprint     | コードフォーマッター   | コードの自動整形                   |
| gitleaks   | 機密情報チェック       | 機密情報の誤コミット防止           |
| commitlint | コミットメッセージ検証 | コミットメッセージ規約のチェック   |
| secretlint | 機密情報ルール検証     | コード内の機密情報検出             |
| cspell     | スペルチェック         | ソースコードのスペルミス検出       |

### 3.3 使い方と注意点

- 本章では、Volta, Scoop, pnpm のインストールは前章で完了済みであることを前提とします。
- スクリプトは `-Global` オプションでグローバルインストールを推奨しています。
- 実行後、各ツールのバージョンを確認し、正しくインストールされたかをチェックしてください。
- 特に `lefthook install` を実行し、Git フックが有効になっていることを必ず確認してください。

### 3.4 チェックリスト

- [ ] lefthook のバージョンを確認した (`lefthook --version`)
- [ ] lefthook のフックを登録した (`lefthook install`)
- [ ] dprint のバージョンを確認した (`dprint --version`)
- [ ] gitleaks のバージョンを確認した (`gitleaks --version`)
- [ ] commitlint のバージョンを確認した (`commitlint --version`)
- [ ] secretlint のバージョンを確認した (`secretlint --version`)
- [ ] cspell のバージョンを確認した (`cspell --version`)
