---
title: グローバル開発ツールのセットアップ
description: この章では、Volta, pnpm, lefthook などプロジェクトで使用するグローバルツールの導入方法について説明します。
sidebar_position: 2
---

## はじめに

この章では、開発環境の初期化に必要な **パッケージマネージャー**、および**グローバルツール** (システム全体で使用するコマンドラインツール) を導入していきます。
`Volta`, `pnpm`, `lefthook`, `dprint` などはこのプロジェクトで共通して使われるため、あらかじめセットアップしておくことが推奨されます。

## 📦 パッケージマネージャーのインストール (Windows)

Windows では以下のパッケージマネージャーを使用します:

- `winget`：Microsoft 公式のパッケージ管理コマンド
- `scoop`：CLI ツール向けに優れた軽量マネージャー
- 'Volta': Node.js, pnpm など

### `winget` (標準搭載／環境によって再インストールが必要)

`winget`は Windows に標準搭載されているパッケージマネージャーです。
以下のコマンドで、`winget`の動作チェックができます。

```powershell
winget --version
```

`winget`がインストールされていない場合は、以下の記事を参考に再インストールをしてください。

➡️ [Zenn記事：wingetの完全再セットアップ手順](https://zenn.dev/atsushifx/articles/winhack-setup-reinstall-winget)

### `Scoop`

`scoop`は CLI ツール群の導入に最適なパッケージマネージャーです。

以下の手順で、`scoop`をインストールします。

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
cd ~/workspaces\temp
irm get.scoop.sh | iex
```

**補足**:
`| iex`とそのまま実行するのでは無く`> inst.ps1`とインストーラースクリプトとしてダウンロードすることで、指定したディレクトリに`scoop`によるファイルを保存できます。

<!-- textlint-disable ja-technical-writing/sentence-length -->

例: `./inst.ps1 -ScoopDir ~/app/scope -ScoopGlobalDir C:\app\scoop\ -ScoopCacheDir C:\app\scoop\cache`

<!-- textlint-enable -->

### `Volta`

Volta は、`Node.js`や`pnpm`など開発ツールのためのパッケージマネージャーです。
Volta を使った場合、`Node.js`は'20.x.x'のような指定バージョンをインストールできます。

次の手順で、Volta をインストールします。

1. 環境変数`VOLTA_HOME`に`C:\app\develop\volta\home`を設定します。

2. 環境変数`Path`に`c:\app\develop\volta\home\bin`,`c:\app\develop\volta`を追加します。
   > 💡環境変数の編集は、`システム > バージョン情報 > システムの詳細設定 > 環境変数` から設定できます。

3. `winget install volta.volta --interactive --location C:\app\develop\volta\`を実行し、`Volta`をインストールします。

4. PowerShell を再起動します。

以上で、Volta を使ってインストールしたツールが使用できます。

## `Node`と`pnpm`のインストール

プロジェクトの開発に必要な **Node.js** および **pnpm** を Volta を利用して導入する手順を紹介します。
Volta を活用することで、ツールのバージョンをプロジェクトごとに固定し、チーム全体の開発環境を統一できます。

### Node.js のインストール (Volta 経由)

次の手順で、Node をインストールします。

```powershell
volta install node@20
```

`node@20`と`20`を指定することで、最新版の LTS 系 (20.x 系) をインストールします。

### `pnpm`のインストール

次の手順で、`pnpm`をインストールします。

```powershell
volta install pnpm@latest
```

`latest`により、最新の pnpm をインストールします。

#### `pnpm` のグローバルツール用 PATH 設定

`pnpm`では`-g`オプションを付けるとツールをグローバルにインストールします。
このとき、ツールは以下のコマンドで表示されるディレクトリに配置されます。

```powershell
pnpm config get global-bin-dir
```

例:`C:\Users\<ユーザー名>\AppData\Local\pnpm`

グローバルにインストールしたツールを使うためには、上記のディレクトリを環境変数`Path`に追加してください。
この設定で、`cspell` や `commitlint` などのコマンドがターミナル上で直接使用できるようになります。

## ✅ セットアップ チェックリスト

- [ ] `winget` の動作確認ができた
- [ ] `scoop` をインストールした
- [ ] `volta` を指定パスにインストールした
- [ ] `VOLTA_HOME` と `Path` を設定した
- [ ] `Node.js v20` をインストールした
- [ ] `pnpm` をインストールした
- [ ] `scoop --version`でバージョンが出力された
- [ ] `volta --version`でバージョンが出力された
- [ ] `pnpm --version`でバージョンが出力された
- [ ] `pnpm config get global-bin-dir`で出力されるディレクトリを Path に追加した。
- [ ] PowerShell を再起動した

**注意**:
バージョンがうまく表示されない場合:

- Path に必要なディレクトリが設定されているか
- PowerShell を再起動したか

をチェックしてください。
