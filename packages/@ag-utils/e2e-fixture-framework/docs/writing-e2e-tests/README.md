---
title: E2Eテスト書き方ガイド
description: ESTAのe2e-fixture-frameworkを使ったテスト作成のための実践ガイド
sidebar_position: 0
slug: /e2e-guide
---

## E2Eテスト書き方ガイド

このガイドは、`e2e-fixture-framework` を用いた E2E テストの構築・実装・運用のための**完全マニュアル**です。
セットアップからAPI仕様まで、段階的にテスト作成に必要な知識を習得できます。

---

### はじめに

本ガイドは「どうやってこのフレームワークでE2Eテストを書くか？」に答えることを目的としています。
最小構成の立ち上げから、高度なfixture連携、CI統合までを一貫してカバーします。

---

### 目次

- 🚀 [**01. はじめてのセットアップ**](01-getting-started.ja.md)
  フレームワークのインストール、初期ファイル作成、最初のテストの実行手順

- 🧭 [**02. フレームワーク全体像**](./02-overview.ja.md)
  設計思想、処理フロー、ディレクトリ構成の基本理解

- 🧩 [**03. プロジェクト構成ガイド**](./03-project-structure.ja.md)
  テスト・フィクスチャ・バリデータのファイル配置とルール

- 📦 [**04. フィクスチャの書き方**](./04-writing-fixtures.ja.md)
  `input.md`, `output.json` の組み立て方、命名規則と設計のコツ

- 🧪 [**05. E2Eテストの実装**](./05-writing-e2e-tests.ja.md)
  `framework.e2e.spec.ts` の例と、fixture活用によるテスト記述パターン

- 🔍 [**06. バリデータの理解と拡張**](./06-validators-overview.ja.md)
  用意されたvalidatorの役割、カスタムバリデーションの作り方

- 🔄 [**07. CI連携と自動実行**](./07-ci-integration.ja.md)
  GitHub Actionsによるテスト自動化とCI構成のポイント

- 📘 [**08. APIリファレンス**](./08-api-reference.ja.md)
  `AgE2eTestDiscovery`, `AgE2eFileReader`, `fixtureRunner` などの仕様と使用例

---

### おわりに

各章は独立して参照可能ですが、`01 → 08` の順に読み進めることで、より深く体系的に理解できます。
改善提案やご質問は、GitHub Discussions や Pull Request で歓迎します！
