---
title: 開発環境の前提要件
description: このプロジェクトを開発するために必要な環境やインストール済みツールの要件一覧
slug: requirements
sidebar_position: 1
tags:
  - onboarding
  - requirements
  - environment
---

## ⚙️ 開発要件

このドキュメントでは、本プロジェクトの開発に必要な環境要件を示します。
現在は **Windows 11 環境での開発を想定**していますが、将来的には macOS / Linux への対応も検討中です。

---

## 🪟 Windows 11 環境

### ✅ 動作確認済み環境

- OS: **Windows 11 Pro / Home（64bit）**
- 権限: **管理者権限** (一部ツールのインストールで必要)

---

### 📦 パッケージマネージャー (必須)

| ツール     | 補足                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------- |
| **winget** | Windows 11 に標準搭載。Volta以外の基本パッケージの導入に使用します。                          |
| **scoop**  | BusyBox、場合によっては Volta の導入にも使用。詳細は次章に導入手順あり。                      |
| **Volta**  | Node.js / pnpm のバージョン管理に必須です。scoop または winget 経由で導入。詳細は次章に記載。 |

> ℹ️ 各ツールの導入手順は「[02_setup-global-tools.md](./02_setup-global-tools.md)」にて案内します。

---

### 🔧 その他必須コンポーネント

| ツール     | 推奨バージョン | 説明                                  |
| ---------- | -------------- | ------------------------------------- |
| Git        | 2.40+          | CLI中心の操作推奨                     |
| Node.js    | 20.x 以降      | Voltaでの自動管理によりバージョン固定 |
| pnpm       | v8.x           | npm/yarnではなくpnpmを使用します      |
| PowerShell | 7.x (推奨)     | scoopの操作やセットアップ補助に使用   |

---

### 🛠 補助ツール（任意）

| ツール   | 用途                       | 備考                                                   |
| -------- | -------------------------- | ------------------------------------------------------ |
| Git Bash | bashスクリプトの補助       | Gitインストール時に同梱されることが多い                |
| BusyBox  | UNIX系コマンド互換         | `scoop install busybox` で導入可、CI補完にも便利       |
| gsudo    | `sudo`互換の管理者権限昇格 | `scoop install gsudo` で導入、PowerShell/WSL対応       |
| delta    | Git差分の視覚化            | `scoop install delta` で導入、`core.pager=delta` 推奨  |
| gibo     | `.gitignore` テンプレ生成  | `scoop install gibo`。多言語に対応                     |
| gh       | GitHub CLI 操作補助        | `winget install gh` で導入。issue/PR連携にも便利       |
| fzf      | ファジー検索補助           | `scoop install fzf`。履歴補完やファイル選択が快適に    |
| ghq      | Gitリポジトリ一元管理      | `scoop install ghq`。`fzf`連携でプロジェクト選択効率化 |

---

## 📁 推奨ディレクトリ構成

- `C:\Users\<user>\workspaces\develop\easy-setup-tools-action`
- パスの階層はなるべく浅く保ちます（長いパスでの依存解決失敗を避けるため）

---

## 🍎 macOS / 🐧 Linux（今後対応予定）

> 📝 現時点では macOS / Linux 環境での開発手順は未整備です。
> 要望に応じてセクションを追記・対応します。

---

> 📌 この要件定義は今後更新される可能性があります。変更提案は issue または PR で歓迎します。
