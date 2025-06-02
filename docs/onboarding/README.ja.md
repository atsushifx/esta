---
title: オンボーディングガイド
description: 新しくプロジェクトに参加する開発者向けの初期セットアップとツール導入ガイド
slug: onboarding
sidebar_position: 1
tags:
  - onboarding
  - setup
  - development
  - environment
---

## 🧭 オンボーディングガイド（Onboarding Guide）

このディレクトリは、このプロジェクトの新たな参加者が必要な環境構築をスムーズにおこなうためのセットアップガイドやツールの紹介を提供しています。

## 📚 ドキュメント構成

<!-- markdownlint-disable line-length -->

| 番号 | ファイル名                                                    | 内容                                             |
| ---- | ------------------------------------------------------------- | ------------------------------------------------ |
| 00   | [プロジェクト概要](./00_intro.md)                             | プロジェクトの目的と全体方針                     |
| 01   | [開発要件](./01_requirements.md)                              | OSやエディタなど開発に必要な環境構成             |
| 02   | [グローバルツールの導入](./02_setup-global-tools.md)          | volta, pnpm, lefthook, dprint のインストール方法 |
| 03   | [ローカルセットアップ](./03_setup-development-environment.md) | このリポジトリを使うための初期設定               |
| 04   | [Gitフックとコミット運用](./04_hooks-and-commits.md)          | commitizenやlefthookの使い方                     |
| 05   | [CIとテストツール](./05_ci-and-scripts.md)                    | GitHub Actionsやvitest等の設定と運用ガイド       |

<!-- markdownlint-enable -->

### 🗺️ 読み方のガイドライン

1. 開発マシンのセットアップが終わっていない場合は、順に上から読み進めてください。
2. セットアップ済みであれば、必要な章のみを参照してください。
3. 質問・改善提案は issue や PR にて歓迎します。

---

### 🛡️ ライセンスと著作権について

このドキュメントは [MIT License](/LICENSE) のもとで公開されています。
再配布や改変、二次利用は自由ですが、**著作権表示とライセンス文は必ず残してください**。

```plaintext
Copyright © 2025- atsushifx <http://github.com/atsushifx>
Released under the MIT License
```

この表記はすべてのコピーや派生物に含める必要があります。
