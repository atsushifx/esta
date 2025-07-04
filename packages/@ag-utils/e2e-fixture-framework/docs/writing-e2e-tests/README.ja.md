---
title: E2Eテスト書き方ガイド
description: ESTAのe2e-fixture-frameworkを使ったテスト作成のための実践ガイド
sidebar_position: 0
slug: /e2e-guide
---

<!-- textlint-disable ja-technical-writing/ja-no-mixed-period -->

[English](README.md) | 日本語

<!-- textlint-enable -->

---

## E2Eテスト書き方ガイド

このガイドは、`e2e-fixture-framework` を用いた E2E テストの構築・実装・運用のための**完全マニュアル**です。
セットアップからテストスクリプトの記述、フィクスチャの設計、CI との統合まで、段階的に学ぶことができます。

### はじめに

E2E Fixtures Framework を使って「どのように E2E テストを書くのか」という疑問に答えることを目的としています。
最小構成のセットアップから応用的なテスト拡張・CI 自動化に至るまで、実例を交えてわかりやすく解説します。

#### 想定読者

- Jest や Vitest を使ったテストに慣れている TypeScript 開発者
- Markdown や構造化テキストを対象とした E2E テストが必要な OSS メンテナーやライブラリ開発者
- 汎用的なテストフレームワークでは扱いにくいファイルベースの検証を効率化したい人

#### フレームワークの特徴

- **ファイルベースのテスト設計**
  `input.*` と `output.json` の組み合わせで、明示的かつ視認性の高いテストが可能

- **パーサ・バリデータによる柔軟な検証**
  Markdown, JSON, YAML など多様な形式を扱え、独自フォーマットへの対応も容易

- **最小記述での自動実行**
  `runAllFoundTests()` により、すべての fixture を一括で探索・実行・検証

- **CI フレンドリーな構成**
  GitHub Actions での自動実行にも対応。品質保証の自動化を手軽に導入できる

#### このガイドで得られること

- `e2e-fixture-framework` を用いたテスト設計とスクリプトの記述方法
- 保守性の高いフィクスチャ構成と、テストの追加・運用ノウハウ
- CI との連携を含む、開発・検証・配布に向けた実践的な運用フロー

> フレームワークの導入を検討しているほう、既存のテスト戦略に課題を感じているほうにとって、確かな手引きとなるはずです。

---

### 目次

- [**01. はじめてのセットアップ**](01-getting-started.ja.md)
  フレームワークのインストール、初期ファイル作成、最初のテストの実行手順

- [**02. フレームワーク全体像**](02-overview.ja.md)
  設計思想、処理フロー、ディレクトリ構成の基本理解

- [**03. プロジェクト構成ガイド**](03-project-structure.ja.md)
  テスト・フィクスチャのファイル配置とルール

- [**04. フィクスチャの書き方**](04-writing-fixtures.ja.md)
  `input.md`, `output.json` の組み立て方、命名規則と設計のコツ

- [**05. E2Eテストの実装**](05-writing-e2e-tests.ja.md)
  `framework.e2e.spec.ts` の例と、fixture 活用によるテスト記述パターン

- [**06. パーサ、バリデータの理解と拡張**](06-parsers-and-validators.ja.md)
  用意された parser, validator の役割、カスタムパーサ、カスタムバリデーションの作り方

- [**07. 条件指定によるテストの一括実行**](07-run-tests-with-options.ja.md)
  テスト実行時の条件指定・ディレクトリ除外など、柔軟なコントロール方法

- [**08. CI連携と自動実行**](08-ci-integration.ja.md)
  GitHub Actions によるテスト自動化と CI 構成のポイント

- [**09. APIリファレンス**](09-api-reference.ja.md)
  `AgE2eTestDiscovery`, `AgE2eFileReader`, `fixtureRunner` などの仕様と使用例

---

### おわりに

このガイドでは、`e2e-fixture-framework` を使った E2E テストの基本から応用までを体系的に紹介してきました。
各章は個別に参照可能ですが、順を追って読み進めることで、より実践的な理解が深まります。

E2E テストは、単なる動作確認だけでなく、**期待する出力を明示的に定義し、それを検証する文化**をプロジェクトに根付かせる重要な手段です。
このフレームワークはそのためのシンプルかつ強力なツールとして、保守性と信頼性を支えます。

> テストを書くことは、「仕様を守る意思」をコードに刻むことでもあります。

本ガイドが、あなたのプロジェクトにとって信頼できる E2E テストの第一歩となれば幸いです。
改善提案やご質問は、GitHub Discussions や Pull Request にてお気軽にお寄せください。

### License

MIT License
© 2025 [atsushifx](https://github.com/atsushifx)
*Powered by AI Agents (Elpha, Kobeni, Tsumugi)*
