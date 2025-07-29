---
header:
- src: refactor-aglogger-phase3.tasks.md
- @(#): フェーズ3: AgLogger APIリストラクチャタスク
title: フェーズ3: AgLogger APIリストラクチャタスク
description: Single Responsibility Principleに基づいたAgLogger APIの責任分離と明確化
version: 1.0.0
created: 2025-07-29
updated: 2025-07-29
authors:
  - atsushifx
changes:
  - 2025-07-29: 初回作成（Phase2完了後のAPI改善）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

# フェーズ3: AgLogger APIリストラクチャタスク

## 概要

Phase2で内部実装をAgLoggerConfig経由にリファクタリングした後、Phase3ではAgLogger APIの責任を明確化し、Single Responsibility Principleに基づいてAPI構造を改善する。
混在した責任を持つメソッドを分離し、より直感的で保守しやすいAPIに再構成する。

## フェーズ3の目標

- [ ] 混在した責任を持つメソッドの分離
- [ ] 設定系メソッドの責任明確化
- [ ] インスタンス取得と設定適用の責任分離
- [ ] 既存APIの互換性維持（deprecation warning付き）
- [ ] 新しいAPI設計の一貫性確保

## 前提条件（フェーズ2完了状態）

- [ ] AgLoggerConfigが唯一の設定管理者として動作
- [ ] 全既存メソッドがAgLoggerConfig経由にリファクタリング済み
- [ ] AgLoggerManagerインスタンス依存の完全削除
- [ ] executeLogメソッドによる統一されたログ出力処理
- [ ] 既存APIの完全な互換性維持

## API責任分析

### 現在の問題のあるメソッド

#### 1. `getLogger(options?: AgLoggerOptions)` - 混在した責任

**問題**: インスタンス取得と設定適用の2つの責任

- インスタンス取得: シングルトンパターンの責任
- 設定適用: 設定管理の責任

**解決策**: `createLogger(options?)`と`getLogger()`への分離

#### 2. `setVerbose(value?: boolean)` - 曖昧な責任

**問題**: 設定と取得の両方を担当

- value=undefined時: 取得の責任
- value指定時: 設定の責任

#### 3. `setManager(options)` - 名前と実装の不一致

**問題**: 名前はmanager設定だが実際は全体設定

- 実際の処理: AgLoggerConfigへの設定適用
- メソッド名: Manager設定を示唆

## タスク1: インスタンス取得と設定の責任分離

### 達成目標

既存のgetLogger(options?)をcreateLogger(options?)にリネームし、新しいgetLogger()をインスタンス取得専用とする

### Task 1.1: createLogger()メソッドの追加

**目標**: 既存getLogger(options?)をcreateLogger(options?)にリネーム

- [ ] createLogger(options?: AgLoggerOptions): AgLoggerメソッドを追加
- [ ] createLoggerがAgLoggerConfigに設定を適用してインスタンスを返す
- [ ] createLoggerのoptionsパラメータはオプショナル
- [ ] createLoggerが設定適用後のインスタンスを返す

### Task 1.2: getLogger()のシンプル化

**目標**: getLogger()をインスタンス取得専用にする

- [ ] getLogger(): AgLoggerメソッドに変更（パラメータなし）
- [ ] getLoggerが純粋にシングルトンインスタンスを返すのみ
- [ ] getLoggerで設定適用処理を削除
- [ ] getLoggerのJSDocを「インスタンス取得専用」として更新

### Task 1.3: 後方互換性の確保

**目標**: 既存のgetLogger(options)使用箇所への対応

- [ ] 既存のgetLogger(options?: AgLoggerOptions)をdeprecated methodとして維持
- [ ] deprecated警告メッセージの追加
- [ ] createLogger(options?)への移行ガイダンスをJSDocに追加
- [ ] 既存テストが引き続き通過することを確認

## タスク2: 設定系メソッドの責任明確化

### 達成目標

設定と取得の責任を明確に分離し、一貫した命名規則を確立する

### Task 2.1: setVerbose()の責任分離

**目標**: 設定と取得を別メソッドに分離

- [ ] setVerbose(value: boolean): booleanメソッドに変更（必須パラメータ）
- [ ] getVerbose(): booleanメソッドを新規追加
- [ ] 既存のsetVerbose(value?: boolean)をdeprecated methodとして維持
- [ ] deprecated警告と新メソッドへの移行ガイダンスを追加

### Task 2.2: setManager()の名前変更

**目標**: メソッド名と実際の責任を一致させる

- [ ] setLoggerOptions(options: AgLoggerOptions): voidメソッドを新規追加
- [ ] setLoggerOptionsが内部でconfig.setLoggerConfig()を呼び出す
- [ ] 既存のsetManager()をdeprecated methodとして維持
- [ ] deprecated警告とsetLoggerOptions()への移行ガイダンスを追加

### Task 2.3: 設定取得メソッドの追加

**目標**: 現在の設定状態を取得する統一的なAPI

- [ ] getCurrentOptions(): AgLoggerOptionsメソッドを追加
- [ ] getCurrentOptionsが内部でconfig.getCurrentSettings()を呼び出す
- [ ] 全設定項目（logLevel, verbose, その他）を含む完全な設定情報を返す
- [ ] 防御的コピーによる設定情報の保護

## タスク3: API一貫性の確保

### 達成目標

新しいAPI設計の一貫性を確保し、将来の拡張性を考慮する

### Task 3.1: 命名規則の統一

**目標**: 一貫した命名規則でAPIの予測可能性を向上

- [ ] 設定系メソッド: setXxx(value), getXxx()の形式で統一
- [ ] インスタンス管理: createXxx(), getXxx()の形式で統一
- [ ] ログ出力系: 既存の動詞形式を維持（fatal, error, warn, etc.）
- [ ] 命名規則のドキュメント化

### Task 3.2: TypeScript型安全性の強化

**目標**: 新しいAPIで型安全性を最大化

- [ ] createLogger()のoptionsパラメータを必須として型定義
- [ ] setVerbose()のvalueパラメータを必須として型定義
- [ ] 戻り値の型アノテーションを明示的に定義
- [ ] JSDocでの型情報の詳細化

### Task 3.3: APIドキュメントの整備

**目標**: 新旧APIの使い分けを明確化

- [ ] 新しいAPIの使用例をJSDocに追加
- [ ] deprecated APIの移行ガイドを作成
- [ ] APIの責任分担をドキュメント化
- [ ] 推奨使用パターンの例示

## タスク4: テストの更新と検証

### 達成目標

新しいAPIの動作確認と既存APIの互換性確保

### Task 4.1: 新しいAPIのテスト追加

**目標**: 新規メソッドの包括的テスト

- [ ] createLogger()のテスト追加
- [ ] 新しいgetLogger()（パラメータなし）のテスト追加
- [ ] 新しいsetVerbose() / getVerbose()のテスト追加
- [ ] setLoggerOptions()のテスト追加
- [ ] getCurrentOptions()のテスト追加

### Task 4.2: deprecated APIの互換性テスト

**目標**: 既存APIが引き続き正常動作することを確認

- [ ] 既存のgetLogger(options)テストが通過することを確認
- [ ] 既存のsetVerbose(value?)テストが通過することを確認
- [ ] 既存のsetManager()テストが通過することを確認
- [ ] deprecation warningが適切に表示されることを確認

### Task 4.3: E2Eテストでの統合確認

**目標**: 実際の使用シナリオでの動作確認

- [ ] 新APIを使用したログ出力シナリオテスト
- [ ] 旧APIから新APIへの移行シナリオテスト
- [ ] 混在使用（新旧API両方使用）シナリオテスト
- [ ] パフォーマンスに影響がないことを確認

## タスク5: ドキュメントとガイダンスの作成

### 達成目標

開発者向けの移行ガイドと使用例の提供

### Task 5.1: 移行ガイドの作成

**目標**: 既存コードの移行を支援

- [ ] 旧API → 新API の対応表作成
- [ ] 具体的な移行例の提示
- [ ] 移行時の注意点の説明
- [ ] 段階的移行戦略の提案

### Task 5.2: 使用例の更新

**目標**: 新しいAPIの推奨使用パターンを示す

- [ ] README.mdの使用例を新APIに更新
- [ ] TypeScriptサンプルコードの追加
- [ ] 一般的な使用パターンの例示
- [ ] アンチパターンの説明

## 完了基準

- [ ] 全ての新しいAPIが正常動作する
- [ ] 全ての既存APIが互換性を保って動作する
- [ ] deprecated警告が適切に表示される
- [ ] 新しいAPIのテストカバレッジ100%
- [ ] 既存テストが全て通過する
- [ ] E2Eテストでの統合動作確認完了
- [ ] 移行ガイドとドキュメントが完成

## 次フェーズへの準備

フェーズ3完了時には以下が整っている必要がある：

- [ ] AgLogger APIの責任が明確に分離されている
- [ ] Single Responsibility Principleに基づくクリーンな設計
- [ ] 既存コードとの完全な互換性維持
- [ ] 新しいAPIの包括的なテストとドキュメント
- [ ] 開発者向けの移行ガイドが利用可能
- [ ] フェーズ4での最終最適化に向けた準備完了

## 注意事項

- 既存のパブリックAPIを破壊しない
- deprecation warningは適切なレベル（console.warn等）で実装
- 段階的移行により破壊的変更を回避
- 新しいAPIは将来の拡張を考慮した設計
- TypeScript型安全性を最大限活用
- パフォーマンス劣化を絶対に起こさない

**重要**: 全チェックボックスが完了した時点でフェーズ4に移行可能
