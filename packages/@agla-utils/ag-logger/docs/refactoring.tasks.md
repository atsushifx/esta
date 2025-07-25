---
header:
- src: refactoring.tasks.md
- @(#): ag-logger リファクタリング tasks
title: ag-logger リファクタリング tasks
description: ag-loggerパッケージを現代的な関数型プログラミングパターンを用いてリファクタリングする仕様書
version: 1.0.0
created: 2025-07-22
updated: 2025-07-22
authors:
  - atsushifx
changes:
  - 2025-07-22: 初回作成（ドキュメント整備）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## TDDアプローチ: Red-Green-Refactor

各タスクはBDD形式（Given-When-Then）で記述し、t-wada式TDDの5ステップに従って実行します：

1. **テストリストの作成** ✓（このドキュメント）
2. **失敗するテストの作成**（Red）
3. **最小限の実装**（Green）
4. **リファクタリング**
5. **繰り返し**

---

## Phase 1: 純関数コアの構築

### Task 1.1: メッセージフォーマット関数の純関数化

**BDD仕様:**

- **Given** 現在の`AgLoggerGetMessage`関数がレベルとメッセージを処理している
- **When** 純関数`formatLogMessage`を作成する
- **Then** 同じ入力に対して同じ出力が得られ、副作用がない

**完了条件:**

- [ ] `formatLogMessage(level, message, ...args)`関数のテスト作成（Red）
- [ ] 最小実装で既存テストが通る（Green）
- [ ] 純関数として設計改善（Refactor）
- [ ] 既存の`AgLoggerGetMessage`と同等の出力を生成

**実装場所:** `src/functional/core/formatLogMessage.ts`

### Task 1.2: ログレベルフィルタリング関数の純関数化

**BDD仕様:**

- **Given** 現在の`isOutputLevel`メソッドがレベル判定を行っている
- **When** 純関数`shouldLogAtLevel`を作成する
- **Then** 同じレベル設定と入力レベルに対して一貫した判定結果が得られる

**完了条件:**

- [ ] `shouldLogAtLevel(currentLevel, targetLevel)`関数のテスト作成（Red）
- [ ] 最小実装で既存ロジックと同等動作（Green）
- [ ] 純関数として境界値処理を改善（Refactor）
- [ ] `AG_LOG_LEVEL.OFF`の特別処理を含む

**実装場所:** `src/functional/core/shouldLogAtLevel.ts`

### Task 1.3: 引数解析関数の純関数化

**BDD仕様:**

- **Given** 現在のログメソッドが可変長引数を処理している
- **When** 純関数`parseLogArguments`を作成する
- **Then** メッセージと追加引数が適切に分離される

**完了条件:**

- [ ] `parseLogArguments(...args)`関数のテスト作成（Red）
- [ ] 文字列、オブジェクト、配列の混在処理実装（Green）
- [ ] エッジケース処理の改善（Refactor）
- [ ] 既存のE2Eテストケースがすべて通る

**実装場所:** `src/functional/core/parseLogArguments.ts`

### Task 1.4: メッセージ処理パイプライン作成

**BDD仕様:**

- **Given** 3つの純関数（format, filter, parse）が存在する
- **When** パイプライン`processLogMessage`を作成する
- **Then** 既存の`logWithLevel`メソッドと同等の処理が関数合成で実現される

**完了条件:**

- [ ] `pipe`または`compose`ユーティリティの実装とテスト（Red）
- [ ] `processLogMessage`パイプラインの実装（Green）
- [ ] パフォーマンスと可読性の最適化（Refactor）
- [ ] 既存のすべてのログレベルテストが通る

**実装場所:** `src/functional/core/processLogMessage.ts`

---

## Phase 2: イミュータブル設定管理

### Task 2.1: イミュータブル設定型定義

**BDD仕様:**

- **Given** 現在の可変な設定プロパティがある
- **When** `LoggerConfig`型をイミュータブルとして設計する
- **Then** 型安全で変更不可能な設定オブジェクトが定義される

**完了条件:**

- [ ] `LoggerConfig`型定義のテスト作成（Red）
- [ ] `Readonly`修飾子を用いた型定義（Green）
- [ ] ネストしたオブジェクトのディープイミュータブル化（Refactor）
- [ ] 既存設定項目の完全カバー

**実装場所:** `src/functional/types/LoggerConfig.ts`

### Task 2.2: 設定更新関数の実装

**BDD仕様:**

- **Given** イミュータブル設定型が定義されている
- **When** 設定更新関数`updateConfig`を作成する
- **Then** 新しい設定オブジェクトが返され、元の設定は不変のまま

**完了条件:**

- [ ] `updateConfig(current, updates)`関数のテスト作成（Red）
- [ ] スプレッド構文による浅いマージ実装（Green）
- [ ] 深いマージとバリデーションロジック追加（Refactor）
- [ ] 型安全性とランタイム検証

**実装場所:** `src/functional/config/updateConfig.ts`

### Task 2.3: 既存setLogLevelメソッドの置換

**BDD仕様:**

- **Given** 新しい設定更新関数がある
- **When** 既存の`setLogLevel`を関数型実装で置換する
- **Then** 既存のAPIは維持しつつ、内部実装が関数型になる

**完了条件:**

- [ ] 互換性レイヤーのテスト作成（Red）
- [ ] `setLogLevel`メソッドの関数型実装への委譲（Green）
- [ ] エラーハンドリングとバリデーション強化（Refactor）
- [ ] 既存のすべてのログレベルテストが通る

**実装場所:** `src/AgLogger.class.ts`（既存ファイル更新）

---

## Phase 3: ファクトリー関数化

### Task 3.1: ロガーファクトリー関数作成

**BDD仕様:**

- **Given** Singletonパターンによるインスタンス管理がある
- **When** ファクトリー`createLogger`を作成する
- **Then** 独立したロガーインスタンスが設定に基づいて生成される

**完了条件:**

- [ ] `createLogger(config)`関数のテスト作成（Red）
- [ ] デフォルト設定とのマージ機能実装（Green）
- [ ] プラグイン自動適用とバリデーション（Refactor）
- [ ] メモリリークがないことの確認

**実装場所:** `src/functional/factory/createLogger.ts`

### Task 3.2: 既存getLogger関数の置換

**BDD仕様:**

- **Given** ファクトリー関数が実装されている
- **When** 既存の`getLogger`を新しい実装で置換する
- **Then** 既存のE2Eテストがすべて通り、APIは完全互換

**完了条件:**

- [ ] 引数変換ロジックのテスト作成（Red）
- [ ] レガシー引数から新設定への変換実装（Green）
- [ ] エッジケースとエラーハンドリング強化（Refactor）
- [ ] すべてのE2Eテストが並列実行で通る

**実装場所:** `src/AgLogger.class.ts`（既存ファイル更新）

### Task 3.3: テスト並列実行の有効化

**BDD仕様:**

- **Given** 独立したロガーインスタンスが生成される
- **When** テストスイートを並列実行する
- **Then** テスト間でのグローバル状態の競合が発生しない

**完了条件:**

- [ ] 並列テスト実行設定のテスト作成（Red）
- [ ] Vitestの並列実行設定を有効化（Green）
- [ ] 共有状態によるテスト失敗の修正（Refactor）
- [ ] CI環境での並列テスト成功

**実装場所:** `configs/vitest.config.*.ts`

---

## Phase 4: プラグインシステム現代化

### Task 4.1: 高階関数型プラグイン作成

**BDD仕様:**

- **Given** 現在のハードコードされたプラグインマッピングがある
- **When** 合成可能な高階関数型プラグインを作成する
- **Then** プラグインが独立して組み合わせ可能になる

**完了条件:**

- [ ] 高階関数プラグインのテスト作成（Red）
- [ ] `withConsoleOutput`, `withJsonFormat`等の実装（Green）
- [ ] プラグイン合成ヘルパーの追加（Refactor）
- [ ] 既存プラグインとの出力互換性確認

**実装場所:** `src/functional/plugins/`

### Task 4.2: プラグイン合成システム実装

**BDD仕様:**

- **Given** 高階関数型プラグインが実装されている
- **When** プラグイン合成関数を作成する
- **Then** 複数のプラグインを柔軟に組み合わせられる

**完了条件:**

- [ ] プラグイン合成のテスト作成（Red）
- [ ] `compose`関数によるプラグイン適用（Green）
- [ ] 順序依存性とエラー処理の改善（Refactor）
- [ ] 動的プラグイン追加/削除サポート

**実装場所:** `src/functional/plugins/compose.ts`

---

## Phase 5: エラーハンドリング関数型化

### Task 5.1: Result/Either型パターン導入

**BDD仕様:**

- **Given** 現在のtry-catchベースのエラー処理がある
- **When** Result型パターンを導入する
- **Then** エラーが型システムで明示的に表現される

**完了条件:**

- [ ] `Result<T, E>`型定義のテスト作成（Red）
- [ ] `Success`, `Failure`コンストラクタの実装（Green）
- [ ] `map`, `flatMap`, `fold`メソッドの追加（Refactor）
- [ ] 既存例外処理の段階的置換

**実装場所:** `src/functional/types/Result.ts`

### Task 5.2: エラー処理パイプライン実装

**BDD仕様:**

- **Given** Result型が実装されている
- **When** エラー処理パイプラインを作成する
- **Then** エラーが適切に伝播・合成される

**完了条件:**

- [ ] エラー処理パイプラインのテスト作成（Red）
- [ ] 関数合成でのエラー処理実装（Green）
- [ ] エラーメッセージの詳細化とロギング（Refactor）
- [ ] 既存のエラー処理テストケース対応

**実装場所:** `src/functional/error/errorPipeline.ts`

---

## 全体完了条件

### 必須条件（すべて満たす必要あり）

- [ ] **既存E2Eテストが100%通る**：`pnpm run test:e2e`
- [ ] **ユニットテストが100%通る**：`pnpm run test:develop`
- [ ] **型チェックエラーなし**：`pnpm run check:types`
- [ ] **リントエラーなし**：`pnpm run lint-all:types`
- [ ] **並列テスト実行成功**：`pnpm run test:develop --reporter=verbose --run`

### 品質基準

- [ ] **コードカバレッジ維持**：既存レベル以上を維持
- [ ] **パフォーマンス回帰なし**：既存実装との性能比較
- [ ] **バンドルサイズ増加<10%**：webpack-bundle-analyzer確認
- [ ] **メモリリークなし**：長時間実行テストで確認

### ドキュメンテーション

- [ ] **APIドキュメント更新**：JSDocコメントの追加
- [ ] **マイグレーションガイド作成**：新旧実装の違い説明
- [ ] **アーキテクチャ図更新**：関数型パターンの図解

## ロールバック戦略

### 各フェーズでのセーフティネット

1. **フィーチャーフラグ**：新旧実装の切り替え機能
2. **段階的ロールバック**：フェーズ単位での巻き戻し
3. **自動テスト監視**：CI/CDでの品質ゲート
4. **パフォーマンス監視**：実行時性能の継続監視

### 緊急時対応

- 既存実装への即座復帰機能
- 設定によるフォールバックモード
- デバッグ情報の詳細ロギング
- 段階的機能無効化オプション
