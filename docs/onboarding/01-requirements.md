---
header:
  - src: docs/onboarding/01-requirements.md
  - "@(#) : ESTA Onboarding Guide - Development Requirements"
title: 開発環境の前提要件
description: このプロジェクトを開発するために必要な環境やインストール済みツールの要件一覧
version: 1.0.0
authors:
  - 👤 atsushifx（オンボーディングガイド作成）
changes:
  - 2025-09-05: フロントマター標準化対応
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
slug: requirements
sidebar_position: 1
tags:
  - onboarding
  - requirements
  - environment
---

## ⚙️ 開発要件

このドキュメントでは、本プロジェクトの開発に必要な環境要件を示します。
現在は **Windows 11 環境での開発を想定**しています。

---

## 🪟 Windows 11 環境

### ✅ 動作確認済み環境

- OS: **Windows 11 Pro / Home（64bit）**
- 権限: **管理者権限** (一部ツールのインストール時に必要となる場合があります)

---

### 📦 パッケージマネージャー (必須)

| ツール     | 補足                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| **winget** | Windows 11 に標準搭載。基本的ツールや開発ツールの導入に使用します。                      |
| **scoop**  | `BusyBox`、場合によっては `Volta` の導入にも使用します。詳細は次章に導入手順があります。 |
| **Volta**  | Node.js / pnpm のバージョン管理に必須。`scoop` または `winget` 経由で導入します。        |

> 各ツールの導入手順は「[パッケージマネージャーの導入](/docs/onboarding/02_package-managers.md)」にて案内します。
> `winget` は Windows の基本的なツールや開発ツールの導入に使用します。
> `scoop`はUNIX系開発ツールのインストールに使用します。また、`winget`には登録されていないツールもあります。

---

### 🔧 その他必須コンポーネント

| ツール     | 推奨バージョン | 説明                                                     |
| ---------- | -------------- | -------------------------------------------------------- |
| Git        | 2.40+          | CLI中心の操作を推奨します                                |
| Node.js    | 20.x (以降)    | LTS (長期サポートバージョン) である20.x 以降を推奨します |
| pnpm       | v10.x          | 最新の安定版を使用します                                 |
| PowerShell | 7.x (推奨)     | 7.x 以降でのクラス機能などを利用しています               |
| Eget       | 1.x (以降)     | Web上のビルド済みバイナリのインストーラー                |

---

### 🛠 補助ツール (任意)

コンソール上で開発するため、`Windows Terminal`の使用を推奨します。

<!-- vale off -->

| ツール   | 用途                       | インストールコマンド    | 備考                                               |
| -------- | -------------------------- | ----------------------- | -------------------------------------------------- |
| Git Bash | `bash`スクリプトの補助     |                         | 一般的に、`Git` のインストール時に同梱されています |
| BusyBox  | UNIX系コマンド互換         | `scoop install busybox` | CI補完にも便利                                     |
| gsudo    | `sudo`互換の管理者権限昇格 | `scoop install gsudo`   | `PowerShell`/`WSL`対応                             |
| delta    | Git差分の視覚化            | `scoop install delta`   | `core.pager=delta` 推奨                            |
| gibo     | `.gitignore` テンプレ生成  | `scoop install gibo`    | 各種言語、ツールに対応しています                   |
| gh       | GitHub CLI 操作補助        | `winget install gh`     | issue/PR連携にも便利                               |
| fzf      | ファジー検索補助           | `scoop install fzf`     | 履歴補完やファイル選択を快適に行えます             |
| ghq      | Gitリポジトリ一元管理      | `scoop install ghq`     | `fzf`連携でプロジェクト選択効率化                  |

<!-- vale on -->

---

## 📁 推奨ディレクトリ構成

- `C:\Users\<user>\workspaces\develop\easy-setup-tools-action`
- Windows のパス長制限の影響で依存関係解決やビルドに失敗する場合がある。できるだけ浅い階層で開発をしてください。

---

## 🍎 macOS / 🐧 Linux（今後対応予定）

> 📝 現時点では macOS / Linux 環境での開発手順は未整備です。
> 要望に応じて、今後の対応を検討していきます。

---

> 📌 この要件定義は今後更新される可能性があります。変更提案は[Issues](https://github.com/atsushifx/easy-setup-tools-action/issues)、
> または[Discussions](https://github.com/atsushifx/easy-setup-tools-action/discussions) にてお願いします。
