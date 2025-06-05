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

| 番号 | ファイル名                                                      | 内容                                                                                 |
| ---- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 00   | [プロジェクト概要](./00_intro.md)                               | プロジェクトの目的と全体方針                                                         |
| 01   | [開発要件](01_requirements.md)                                  | OSやエディタなど開発に必要な環境構成                                                 |
| 02   | [パッケージマネージャーの導入](02_package-managers.md)          | `winget`, `scoop`, `volta`, `pnpm`といった各種パッケージマネージャーの導入           |
| 03   | [グローバルツールの導入](03_global-tools.md)                    | volta, pnpm, lefthook, dprint のインストール方法                                     |
| 04   | [ドキュメントツールの導入](04_document-tools.md)                | `textlint`, `markdownlint`など、ドキュメント用Lintツールのインストール方法           |
| 05   | [開発ツールのセットアップ](05_local-tools.md)                   | このリポジトリ用の開発ツールの初期設定                                               |
| 06   | [monorepo構成と、その実現方法](06_monorepo-repository.md)       | このリポジトリの構成と、そのための設定ファイル構成の説明                             |
| 07   | [設定ファイルの共通化と、拡張](07_shared-configs-and-extend.md) | 設定ファイルの構造と運用方法                                                         |
| 08   | [`package.json`のスクリプト](08_packagejson_scripts.md)         | `package.json`で使用している共通スクリプトとモノレポルートスクリプトの違いと管理方法 |
| 09   | [開発時のコード品質チェックツール](09_code-quality-tools.md)    | eslint, dprint などのコード品質向上ツールの概要と設定                                |
| 10   | [ドキュメント作成時のチェックツール](10_doc-check-tools.md)     | textlint, markdownlint, cspell などドキュメント向けチェックツールの概要と設定        |
| 11   | [CI/CDでの自動検証ツール](11_ci-validation-tools.md)            | GitHub Actions や自動化されたテスト・Lint・Secretlintの運用と設定                    |
| 12   | [コミット・プッシュ関連のツール](12_commit-push-tools.md)       | lefthook, commitlint などコミット・プッシュ前のチェックツールの概要と設定            |

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
