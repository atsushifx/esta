---
header:
  - src: docs/onboarding/README.ja.md
  - "@(#) : ESTA Onboarding Guide - Main Index"
title: オンボーディングガイド
description: 新しくプロジェクトに参加する開発者向けの初期セットアップとツール導入ガイド
version: 1.0.0
authors:
  - 👤 atsushifx（オンボーディングガイド作成）
changes:
  - 2025-09-05: フロントマター標準化対応
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
slug: onboarding
tags:
  - onboarding
  - setup
  - development
  - environment
---

## 🧭 オンボーディングガイド（Onboarding Guide）

このディレクトリは、このプロジェクトの新たな参加者が必要な環境構築をスムーズに行なうためのセットアップガイドやツールの紹介を提供しています。

## 📚 ドキュメント構成

<!-- markdownlint-disable line-length -->

| 番号 | ファイル名                                                      | 内容                                                                                 |
| ---- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 00   | [プロジェクト概要](00-intro.md)                                 | プロジェクトの目的と全体方針                                                         |
| 01   | [開発要件](01-requirements.md)                                  | OSやエディタなど開発に必要な環境構成                                                 |
| 02   | [パッケージマネージャーの導入](02-package_managers.md)          | `winget`, `scoop`, `volta`などの各種パッケージマネージャーのインストール             |
| 03   | [グローバル開発ツールの一括セットアップ](03-global_tools.md)    | `lefthook`, `dprint`などグローバルにインストールするツールのインストール             |
| 04   | [ライティング支援ツールのセットアップ](04-writers_tools.md)     | `textlint`, `markdownlint`など、ライティング支援ツールのセットアップ                 |
| 05   | [開発ツールと検証ツールのセットアップ](05-dev_tools_setup.md)   | プロジェクトに関連する開発ツール、Lintツールなどのセットアップ                       |
| 06   | [monorepo構成と、その実現方法](06-monorepo_repository.md)       | このリポジトリの構成と、そのための設定ファイル構成の説明                             |
| 07   | [設定ファイルの共通化と、拡張](07_shared-configs-and-extend.md) | 設定ファイルの構造と運用方法                                                         |
| 08   | [`package.json`のスクリプト](08-package_json_scripts.md)        | `package.json`で使用している共通スクリプトとモノレポルートスクリプトの違いと管理方法 |
| 09   | [開発時のコード品質チェックツール](09-code_quality_tools.md)    | `eslint`, `vitest` などのコード品質向上ツールの概要と設定                            |
| 10   | [ライティング支援ツール](10-writing_tools.md)                   | `textlint`, `CSpell`など、文章作成の支援をするツールの設定                           |
| 11   | [CI/CDでの自動検証ツール](11-ci_validation_tools.md)            | GitHub Actions による自動化されたテスト・Lintツールの運用と設定                      |
| 12   | [コミット前のチェックツール](12-pre_commit_tools.md)            | `Lefthook`, `commitlint` などコミット前にチェックするツールの概要と設定              |

<!-- markdownlint-enable -->

### 🗺️ 読み方のガイドライン

1. 開発マシンのセットアップが終わっていない場合は、上から順に読み進めてください。
2. セットアップ済みであれば、必要な章のみを参照してください。
3. 質問・改善提案は issue や PR にて歓迎。

---

### 🛡️ ライセンスと著作権について

このドキュメントは [MIT License](/LICENSE) のもとで公開されています。
再配布や改変、二次利用は自由ですが、**著作権表示とライセンス文は必ず残してください**。

```plaintext
Copyright © 2025- atsushifx <http://github.com/atsushifx>
Released under the MIT License
```

この表記はすべての再配布物や派生コンテンツに含める必要があります。
