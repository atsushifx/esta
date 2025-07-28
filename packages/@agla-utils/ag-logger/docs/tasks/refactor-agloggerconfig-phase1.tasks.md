---
header:
- src: refactor-agLoggerConfig-phase1.tasks.md
- @(#): フェーズ1: AgLoggerConfigクラス作成タスク
title: フェーズ1: AgLoggerConfigクラス作成タスク
description: AgLoggerConfig内部クラスの作成と関連ユニットテストをt-wada式TDDで実装するタスクドキュメント
version: 1.0.0
created: 2025-07-27
updated: 2025-07-27
authors:
  - atsushifx
changes:
  - 2025-07-27: 初回作成（フェーズ1タスク詳細化）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

# フェーズ1: AgLoggerConfigクラス作成タスク

## 概要

AgLoggerリファクタリングのフェーズ1として、設定管理を担う内部クラス`AgLoggerConfig`を作成する。
t-wada式TDDアプローチを採用し、各タスクをitレベルまで細分化して、Red-Green-Refactorサイクルで実装する。

## フェーズ1の目標

- [ ] AgLoggerConfig内部クラスの作成（外部export無し）
- [ ] 設定管理機能の実装（ロガー、フォーマッター、ログレベル、verbose）
- [ ] 出力制御判定機能の実装
- [ ] 設定検証機能の実装
- [ ] 包括的なユニットテストの作成

## Note: t-wada式TDDアプローチ

各タスクは以下のサイクルで実装する：

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限の実装を書く
3. **Refactor**: コードを改善する（テストは通ったまま）

**重要**: 1タスク = 1つのit()テストケース として細分化されており、各タスクでRed-Green-Refactorサイクルを完了させる。

## タスク1: AgLoggerConfigクラスの基本構造作成

### Task 1.1: AgLoggerConfigクラスファイル作成

- [x] **Task 1.1.1**: AgLoggerConfigクラスが存在することをテスト
  - **Red**: `src/internal/__tests__/AgLoggerConfig.spec.ts`に「should create AgLoggerConfig instance」テスト作成（失敗）
  - **Green**: `src/internal/AgLoggerConfig.ts`に最小限のクラス定義作成
  - **Refactor**: import文、コメント整理

### Task 1.2: デフォルト設定の初期化

- [x] **Task 1.2.1**: デフォルトロガーがNullLoggerに設定されることをテスト
  - **Red**: 「should initialize with NullLogger as default logger」テスト作成（失敗）
  - **Green**: constructorでdefaultLoggerプロパティをNullLoggerに初期化
  - **Refactor**: プロパティの型定義とアクセス方法の改善

- [x] **Task 1.2.2**: デフォルトフォーマッターがNullFormatに設定されることをテスト
  - **Red**: 「should initialize with NullFormat as default formatter」テスト作成（失敗）
  - **Green**: constructorでformatterプロパティをNullFormatに初期化
  - **Refactor**: フォーマッター設定の構造改善

- [x] **Task 1.2.3**: デフォルトログレベルがOFFに設定されることをテスト
  - **Red**: 「should initialize with AG_LOGLEVEL.OFF as default log level」テスト作成（失敗）
  - **Green**: constructorでlogLevelプロパティをAG_LOGLEVEL.OFFに初期化
  - **Refactor**: ログレベル管理の構造改善

- [x] **Task 1.2.4**: デフォルトverboseがfalseに設定されることをテスト
  - **Red**: 「should initialize with verbose as false」テスト作成（失敗）
  - **Green**: constructorでverboseプロパティをfalseに初期化
  - **Refactor**: boolean設定の管理方法改善

### Task 1.3: デフォルトロガーマップの初期化

- [x] **Task 1.3.1**: 全ログレベルがNullLoggerに設定されることをテスト
  - **Red**: 「should initialize all log levels with NullLogger」テスト作成（失敗）
  - **Green**: createDefaultLoggerMapメソッド実装、全レベルにNullLogger設定
  - **Refactor**: ロガーマップの構造とメソッド設計改善
  - **実装時追加**: `getLoggerMap()`メソッドを追加実装。外部からロガーマップの参照を取得可能にし、テストやデバッグを容易にした。

## タスク2: 設定取得機能の実装

### Task 2.1: ロガー関数取得機能

- [x] **Task 2.1.1**: 指定ログレベルのロガー関数が取得できることをテスト
  - **Red**: 「should return logger function for specified log level」テスト作成（失敗）
  - **Green**: getLoggerFunction(level)メソッド実装
  - **Refactor**: エラーハンドリングと型安全性改善
  - **実装時追加**: `isValidLogLevel()`プライベートメソッドを実装。ログレベルの妥当性を検証する機能を内蔵し、型安全性とランタイム安全性を向上。

- [x] **Task 2.1.2**: 存在しないログレベルでデフォルトロガーが返されることをテスト
  - **Red**: 「should return default logger for non-existent log level」テスト作成（失敗）
  - **Green**: getLoggerFunctionでのフォールバック処理実装
  - **Refactor**: フォールバック戦略の改善
  - **実装時変更**: フォールバック戦略を変更し、無効なログレベルに対してはデフォルトロガーを返すのではなく、`AgLoggerError`（INVALID_LOG_LEVEL）を投げるように実装。より厳密なエラーハンドリングを採用。

### Task 2.2: フォーマッター取得機能

- [x] **Task 2.2.1**: 設定されたフォーマッターが取得できることをテスト
  - **Red**: 「should return configured formatter」テスト作成（失敗）
  - **Green**: getFormatter()メソッド実装
  - **Refactor**: フォーマッター管理の改善

### Task 2.3: ログレベル取得機能

- [x] **Task 2.3.1**: 設定されたログレベルが取得できることをテスト
  - **Red**: 「should return configured log level」テスト作成（失敗）
  - **Green**: getLogLevel()メソッド実装
  - **Refactor**: ログレベル管理の改善

### Task 2.4: verbose設定取得機能

- [x] **Task 2.4.1**: verbose設定が取得できることをテスト
  - **Red**: 「should return verbose setting」テスト作成（失敗）
  - **Green**: getVerbose()メソッド実装
  - **Refactor**: boolean設定管理の改善

## タスク3: 設定更新機能の実装

### Task 3.1: ログレベル設定機能

- [ ] **Task 3.1.1**: ログレベルが正しく設定されることをテスト
  - **Red**: 「should set log level correctly」テスト作成（失敗）
  - **Green**: setLogLevel(level)メソッド実装
  - **Refactor**: ログレベル設定の検証とエラーハンドリング改善

- [ ] **Task 3.1.2**: 設定されたログレベルが返されることをテスト
  - **Red**: 「should return the set log level」テスト作成（失敗）
  - **Green**: setLogLevelの戻り値実装
  - **Refactor**: メソッドの戻り値設計改善

### Task 3.2: verbose設定機能

- [ ] **Task 3.2.1**: verbose設定が正しく更新されることをテスト
  - **Red**: 「should set verbose setting correctly」テスト作成（失敗）
  - **Green**: setVerbose(value)メソッド実装
  - **Refactor**: boolean設定の管理方法改善

- [ ] **Task 3.2.2**: 設定されたverbose値が返されることをテスト
  - **Red**: 「should return the set verbose value」テスト作成（失敗）
  - **Green**: setVerboseの戻り値実装
  - **Refactor**: メソッドの一貫性改善

## タスク4: 出力制御判定機能の実装

### Task 4.1: ログレベル制御判定

- [ ] **Task 4.1.1**: ログレベルOFFで全レベルがfalseを返すことをテスト
  - **Red**: 「should return false for all levels when log level is OFF」テスト作成（失敗）
  - **Green**: shouldOutput(level)メソッドの基本実装（OFF判定）
  - **Refactor**: 判定ロジックの構造改善

- [ ] **Task 4.1.2**: 有効なログレベルで適切な判定がされることをテスト
  - **Red**: 「should return correct output decision for valid log levels」テスト作成（失敗）
  - **Green**: shouldOutputでのレベル比較実装
  - **Refactor**: レベル比較アルゴリズムの最適化

- [ ] **Task 4.1.3**: 境界値での判定が正しく動作することをテスト
  - **Red**: 「should handle boundary log level values correctly」テスト作成（失敗）
  - **Green**: 境界値処理の実装
  - **Refactor**: エッジケース処理の改善

### Task 4.2: verbose制御判定

- [ ] **Task 4.2.1**: verbose=trueでtrueが返されることをテスト
  - **Red**: 「should return true when verbose is enabled」テスト作成（失敗）
  - **Green**: shouldOutputVerbose()メソッド実装
  - **Refactor**: verbose判定ロジックの改善

- [ ] **Task 4.2.2**: verbose=falseでfalseが返されることをテスト
  - **Red**: 「should return false when verbose is disabled」テスト作成（失敗）
  - **Green**: verboseのfalse判定実装
  - **Refactor**: boolean判定の一貫性改善

## タスク5: 設定適用機能の実装

### Task 5.1: 基本設定適用機能

- [ ] **Task 5.1.1**: defaultLogger設定が適用されることをテスト
  - **Red**: 「should apply defaultLogger setting」テスト作成（失敗）
  - **Green**: applyOptions()でのdefaultLogger設定実装
  - **Refactor**: 設定適用ロジックの構造改善

- [ ] **Task 5.1.2**: formatter設定が適用されることをテスト
  - **Red**: 「should apply formatter setting」テスト作成（失敗）
  - **Green**: applyOptionsでのformatter設定実装
  - **Refactor**: フォーマッター設定の改善

- [ ] **Task 5.1.3**: logLevel設定が適用されることをテスト
  - **Red**: 「should apply logLevel setting」テスト作成（失敗）
  - **Green**: applyOptionsでのlogLevel設定実装
  - **Refactor**: ログレベル設定の改善

- [ ] **Task 5.1.4**: verbose設定が適用されることをテスト
  - **Red**: 「should apply verbose setting」テスト作成（失敗）
  - **Green**: applyOptionsでのverbose設定実装
  - **Refactor**: boolean設定適用の改善

### Task 5.2: ロガーマップ更新機能

- [ ] **Task 5.2.1**: loggerMap設定が適用されることをテスト
  - **Red**: 「should apply loggerMap setting」テスト作成（失敗）
  - **Green**: updateLoggerMapメソッド実装
  - **Refactor**: ロガーマップ更新ロジックの改善

- [ ] **Task 5.2.2**: defaultLoggerとloggerMapの組み合わせが正しく動作することをテスト
  - **Red**: 「should handle defaultLogger and loggerMap combination correctly」テスト作成（失敗）
  - **Green**: 組み合わせ処理の実装
  - **Refactor**: 設定優先度とマージロジックの改善

## タスク6: 設定検証機能の実装

### Task 6.1: ログレベル検証

- [ ] **Task 6.1.1**: 無効なログレベルでエラーが投げられることをテスト
  - **Red**: 「should throw error for invalid log level」テスト作成（失敗）
  - **Green**: isValidLogLevel()とvalidateOptions()の基本実装
  - **Refactor**: 検証ロジックとエラーメッセージの改善

- [ ] **Task 6.1.2**: 有効なログレベルで正常に処理されることをテスト
  - **Red**: 「should accept valid log levels」テスト作成（失敗）
  - **Green**: 有効値の検証実装
  - **Refactor**: 検証パフォーマンスの最適化

### Task 6.2: その他の設定値検証

- [ ] **Task 6.2.1**: null/undefinedの適切な処理をテスト
  - **Red**: 「should handle null/undefined values appropriately」テスト作成（失敗）
  - **Green**: null/undefined処理の実装
  - **Refactor**: デフォルト値とオプショナル値の処理改善

- [ ] **Task 6.2.2**: 型安全性の確保をテスト
  - **Red**: 「should ensure type safety for all options」テスト作成（失敗）
  - **Green**: 型チェック実装
  - **Refactor**: TypeScript型安全性の強化

## タスク7: 現在設定取得機能の実装

### Task 7.1: 設定状態取得

- [ ] **Task 7.1.1**: 現在の設定が正しく取得できることをテスト
  - **Red**: 「should return current configuration options」テスト作成（失敗）
  - **Green**: getCurrentOptions()メソッド実装
  - **Refactor**: 設定の防御的コピーと構造改善

- [ ] **Task 7.1.2**: 設定変更後の状態が正しく反映されることをテスト
  - **Red**: 「should reflect configuration changes in getCurrentOptions」テスト作成（失敗）
  - **Green**: 動的設定取得の実装
  - **Refactor**: 状態同期の確実性改善

## タスク8: エッジケースとエラーハンドリング

### Task 8.1: 境界値テスト

- [ ] **Task 8.1.1**: 最小・最大ログレベルでの動作をテスト
  - **Red**: 「should handle min/max log levels correctly」テスト作成（失敗）
  - **Green**: 境界値処理の実装
  - **Refactor**: 境界値処理の一般化

### Task 8.2: 異常系テスト

- [ ] **Task 8.2.1**: 予期しない入力値でのエラーハンドリングをテスト
  - **Red**: 「should handle unexpected input values gracefully」テスト作成（失敗）
  - **Green**: 例外処理とガード句の実装
  - **Refactor**: エラーハンドリング戦略の統一

## 成果物

### 実装ファイル

- `src/internal/AgLoggerConfig.ts` - AgLoggerConfig クラス本体
- `src/internal/index.ts` - 内部モジュールのエクスポート（必要に応じて）

### テストファイル

- `src/internal/__tests__/AgLoggerConfig.spec.ts` - 包括的なユニットテスト

## 品質基準

### テストカバレッジ

- [ ] 行カバレッジ: 100%
- [ ] 分岐カバレッジ: 100%
- [ ] 関数カバレッジ: 100%

### コード品質

- [ ] `pnpm run lint:all` 通過
- [ ] `pnpm run check:types` 通過
- [ ] ESLintルール準拠

### ドキュメント

- [ ] JSDocコメント完備
- [ ] メソッドの使用例記載
- [ ] エラーケースの説明

## 完了基準

- [ ] 全てのタスクが完了している
- [ ] 全テストが通過している
- [ ] コード品質基準を満たしている
- [ ] 外部にexportされていない（内部クラスとして適切に配置）
- [ ] 次フェーズ（AgLoggerへの組み込み）の準備が整っている

## 注意事項

- AgLoggerConfigは内部実装クラスのため、外部からアクセスできないようにする
- 既存のAgLoggerやAgLoggerManagerのコードには一切変更を加えない
- 各タスクでRed-Green-Refactorサイクルを厳密に守る
- テストファーストで実装を進める
