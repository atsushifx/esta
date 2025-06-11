---
title: パッケージマネージャーの導入
description: このプロジェクトで使用する各種開発ツールを導入するために、各種パッケージマネージャーをインストールする方法
sidebar_position: 2
---

## はじめに

この章では、開発環境の初期化に必要な **パッケージマネージャー**、を導入します。
`winget`, `scoop`, `volta` `pnpm` は、各プロジェクトで共通して使われるため、あらかじめセットアップしておくことが推奨されます。

## 📦 パッケージマネージャーのインストール (Windows)

Windows では以下のパッケージマネージャーを使用します:<!-- vale off -->

- `winget`： Microsoft 公式のパッケージ管理コマンド
- `scoop`： CLI ツール向けに優れた軽量パッケージマネージャー
- 'Volta': `Node.js`, `pnpm`などの JavaScript ツール用バージョン管理ツール
- `pnpm` : 高速かつ効率のよぴ`Node.js`用パッケージマネージャー

<!-- vale on -->

### `winget` (標準搭載／環境によって再インストールが必要)

`winget`は Windows に標準搭載されているパッケージマネージャーです。
以下のコマンドで、`winget`の動作チェックができます。

```powershell
winget --version
```

`winget`がインストールされていない場合は、以下の記事を参考に再インストールをしてください。

➡️ [Zenn記事：wingetの再セットアップ手順](https://zenn.dev/atsushifx/articles/winhack-setup-reinstall-winget)

### `Scoop`

<!-- vale off -->

Scoop`は CLI ツール群の導入に最適なパッケージマネージャーです。

<!-- vale on -->

以下の手順で、`scoop`をインストールします。

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
cd ~/workspaces\temp
irm get.scoop.sh | iex
```

**補足**:
`| iex`とそのまま実行するのではなく、`> inst.ps1`とインストーラースクリプトとしてダウンロードすることで、アプリの保存先を指定できます。

例: `./inst.ps1 -ScoopDir ~/app/scope -ScoopGlobalDir C:\app\scoop\ -ScoopCacheDir C:\app\scoop\cache`

### `Volta`

Volta は、`Node.js`や`pnpm`など JavaScript / TypeScript 用のバージョン管理ツールです。
Volta を使うことで、Node.js`は'20.x'の最新版をインストールする、といったバージョンの管理ができます。

次の手順で、Volta をインストールします。

1. 環境変数`VOLTA_HOME`に`C:\app\develop\volta\home`を設定します。

2. 環境変数`Path`に`c:\app\develop\volta\home\bin`,`c:\app\develop\volta`を追加します。
   > 💡環境変数の編集は、`システム > バージョン情報 > システムの詳細設定 > 環境変数` から設定できます。

3. `winget install volta.volta --interactive --location C:\app\develop\volta\`を実行し、`Volta`をインストールします。

4. PowerShell を再起動します。

以上で、Volta を使ってインストールしたツールが使用できます。

## `Node`と`pnpm`

このプロジェクトは、`Node.js`と`pnpm`を使って開発をしています。
これらは、実行に使用できるバージョンをしているする必要があるため、`Volta`を利用して指定したバージョンを導入します。
Volta を活用することで、ツールのバージョンをプロジェクトごとに固定し、チーム全体の開発環境を統一できます。

### Node.js のインストール (Volta 経由)

次の手順で、Node をインストールします。

```powershell
volta install node@20
```

`node@20`と`20`を指定することで、LTS の最新版の (20.x) をインストールします。

### `pnpm`のインストール

次の手順で、`pnpm`をインストールします。

```powershell
volta install pnpm@latest
```

`latest`と指定することにより、最新の pnpm をインストールします。

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

この章のセットアップのチェックリストです。
すべてをチェックできた場合、パッケージマネージャーで問題なくツールをインストールできます。

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
