---
header:
- src: refactor-agLogger-phase2.tasks.md
- @(#): フェーズ2: AgLogger設定委譲タスク
title: フェーズ2: AgLogger設定委譲タスク
description: AgLoggerConfigをAgLoggerに組み込み、設定管理を委譲するt-wada式TDD実装タスクドキュメント
version: 1.0.0
created: 2025-07-29
updated: 2025-07-29
authors:
  - atsushifx
changes:
  - 2025-07-29: 初回作成（フェーズ1完了後のフェーズ2タスク詳細化）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

# フェーズ2: AgLogger設定委譲タスク

## 概要

AgLoggerリファクタリングのフェーズ2として、フェーズ1で作成した`AgLoggerConfig`を`AgLogger`に組み込み、設定管理の責任を委譲する。
AgLoggerConfigを唯一の設定管理者として確立し、loggerMapやverboseモードなどすべての設定項目を統一管理する。
t-wada式TDDアプローチを継続し、各タスクをitレベルまで細分化してRed-Green-Refactorサイクルで実装する。

## フェーズ2の目標

- [ ] AgLoggerにAgLoggerConfigインスタンスを組み込み
- [ ] 設定関連メソッドをAgLoggerConfigに委譲
- [ ] AgLoggerConfigを唯一の設定管理者として確立
- [ ] setAgLoggerOptionsによる統一された設定適用の実装
- [ ] 既存機能との並行稼働確認
- [ ] 包括的なユニットテストとE2Eテストの作成

## 前提条件（フェーズ1完了状態）

- [ ] AgLoggerConfigクラスが完全に実装済み
- [ ] AgLoggerConfigの包括的ユニットテストが通過
- [ ] 設定管理・検証・出力制御判定の全機能が動作確認済み

## Note: t-wada式TDDアプローチ継続

各タスクのit()レベル実装を、さらに1行のexpect文レベルの小タスクに分割し、その小タスクでRed-Green-Refactorサイクルを実行する：

1. **タスク分割**: 各it()テストケースを複数のexpect文に分解
2. **小タスクサイクル**: 各expect文に対してRed-Green-Refactorを実行
   - **Red**: 1つのexpect文を書く（失敗）
   - **Green**: そのexpect文を通す最小限の実装を書く
   - **Refactor**: その実装を改善する（expect文は通ったまま）
3. **統合**: 全てのexpect文が完了したらit()テストケース完了
4. **全体Refactor**: タスク全体をレビューし、実装を改善する（テストは通ったまま）
5. **ドキュメント、コメント整備**: 作成したファイルやメソッドなどに適切なヘッダーコメントやJSDocを追加

**重要**: 1小タスク = 1つのexpect文 として細分化し、各小タスクで完全なRed-Green-Refactorサイクルを完了させてから次の小タスクに進む。

## タスク1: AgLoggerConfigの組み込み

### 達成目標

AgLoggerクラスにAgLoggerConfigインスタンスを組み込み、デフォルト設定での動作を確認する

### Task 1.1: AgLoggerConfigインスタンスの追加

**目標**: AgLoggerがAgLoggerConfigインスタンスを内部で保持し、適切に初期化される

- [ ] AgLoggerのconstructorでAgLoggerConfigインスタンスが作成される
- [ ] AgLoggerConfigインスタンスがprivateプロパティとして保持される
- [ ] AgLoggerConfig初期化時にデフォルト設定が適用される
- [ ] 初期化後のAgLoggerConfigがアクセス可能である

### Task 1.2: 既存設定メソッドのリファクタリング

**目標**: 既存のsetLogLevel・setVerboseメソッドの外部APIを維持しつつ、内部実装をAgLoggerConfig経由に変更

- [ ] setLogLevelメソッドの内部実装をconfig.setLogLevel()呼び出しに変更
- [ ] setVerboseメソッドの内部実装をconfig.setVerbose()呼び出しに変更
- [ ] getLogLevelメソッドの内部実装をconfig.getLogLevel()呼び出しに変更
- [ ] リファクタリング後も既存APIの動作が完全に保持される
- [ ] AgLoggerManager経由の操作でも正常動作する

## タスク2: 設定委譲の実装

### 達成目標

設定関連のメソッドをAgLoggerConfigに委譲し、統一された設定管理を実現する

### Task 2.1: setAgLoggerOptionsメソッドの実装

**目標**: AgLoggerOptionsを受け取りAgLoggerConfigに設定を適用する新しいメソッドを作成

- [ ] setAgLoggerOptions(options: AgLoggerOptions)メソッドが定義される
- [ ] setAgLoggerOptionsがconfig.setLoggerConfigを呼び出す
- [ ] defaultLogger設定が正しく適用される
- [ ] formatter設定が正しく適用される
- [ ] loggerMap設定が正しく適用される
- [ ] logLevel設定が正しく適用される
- [ ] verbose設定が正しく適用される

### Task 2.2: ログメソッドのリファクタリング

**目標**: 全ログメソッド（fatal, error, warn, info, debug, trace, log, verbose）の内部実装をAgLoggerConfig経由に変更

- [ ] 全ログメソッドが内部でexecuteLog()を呼び出すように変更
- [ ] executeLog()がconfig.shouldOutput()で出力判定を実行
- [ ] executeLog()がconfig.getLoggerFunction()でロガー関数を取得
- [ ] executeLog()がconfig.getFormatter()でフォーマッターを取得
- [ ] リファクタリング後も既存のログ出力動作が完全に保持される

### Task 2.3: 現在設定取得メソッドの実装

**目標**: 現在の設定状態を取得するメソッドを新たに実装する

- [ ] getCurrentSettings()メソッドが定義される
- [ ] 全設定項目（defaultLogger, formatter, loggerMap, logLevel, verbose）が取得される
- [ ] 設定情報の防御的コピーが実装される
- [ ] 設定変更後の状態が正しく反映される

## タスク3: ログ出力処理のリファクタリング

### 達成目標

既存のログ出力処理をAgLoggerConfig経由に完全移行し、AgLoggerManagerインスタンス依存を削除する

### Task 3.1: executeLogメソッドの基本構造

**目標**: ログ出力処理を統一するexecuteLogメソッドの基本枠組みを作成

- [ ] executeLog(level: AgTLogLevel, ...args: unknown[])メソッドが定義される
- [ ] メソッドがprivateアクセス修飾子で適切に保護される
- [ ] config.shouldOutput(level)による出力制御判定が実装される
- [ ] 出力不要時の早期リターンが実装される

### Task 3.2: executeLogでの設定取得

**目標**: executeLogメソッドでAgLoggerConfigから必要な設定を取得する

- [ ] config.getLoggerFunction(level)でロガー関数が取得される
- [ ] config.getFormatter()でフォーマッターが取得される
- [ ] 取得した設定が適切に使用される
- [ ] エラー時のフォールバック処理が実装される

### Task 3.3: AgLoggerManagerインスタンス依存の削除

**目標**: AgLogger内部のAgLoggerManagerインスタンス依存を削除し、AgLoggerConfigのみを使用

- [ ] AgLogger内部の_loggerManagerプロパティを削除
- [ ] AgLoggerManager.getManager()呼び出しをすべて削除
- [ ] 既存のログ処理でAgLoggerConfigのみを使用
- [ ] メモリ使用量の改善が確認される

## タスク4: 設定管理の統合とテスト

### 達成目標

AgLoggerConfigへの設定の適切な受け渡しと参照が正常動作することを確認する

### Task 4.1: 設定の適切な受け渡しテスト

**目標**: AgLoggerからAgLoggerConfigへの設定が確実に渡され、参照できることを確認

- [ ] getLogger(options)実行時にAgLoggerConfigに設定が適切に渡される
- [ ] setAgLoggerOptions()でAgLoggerConfigに設定が適切に適用される
- [ ] 設定変更後にAgLoggerConfigから正しい値が参照される
- [ ] 複数の設定項目が同時に設定・参照できる
- [ ] loggerMap設定がAgLoggerConfigで適切に管理される
- [ ] verboseモード設定がAgLoggerConfigで適切に管理される

### Task 4.2: 互換性確保

**目標**: 既存のAPI仕様を完全に維持する

- [ ] 全ログメソッド（fatal, error, warn, info, debug, trace, log, verbose）が正常動作する
- [ ] AgLoggerManagerを通じた操作が正常動作する
- [ ] 既存のシングルトンパターンが維持される
- [ ] resetSingletonメソッドが正常動作する

## タスク5: E2Eテストによる統合確認

### 達成目標

実際の使用シナリオでの動作確認と性能測定を行う

### Task 5.1: 設定変更シナリオテスト

**目標**: 複雑な設定変更シナリオでの一貫性を確認

- [ ] 複数回の設定変更での一貫性が保たれる
- [ ] setAgLoggerOptions→ログ出力→設定再変更→ログ出力のシナリオが成功する
- [ ] AgLoggerManagerとの互換性が維持される
- [ ] リファクタリング前後で同じログ出力結果が得られる

### Task 5.2: パフォーマンステスト

**目標**: 新アーキテクチャでの性能確保とメモリ効率化を確認

- [ ] 既存実装と新実装のパフォーマンス比較が完了する
- [ ] 性能劣化がないことが確認される
- [ ] メモリ使用量の改善が確認される
- [ ] パフォーマンス計測の精度が十分である

## タスク6: エラーハンドリングと境界値テスト

### 達成目標

異常系での安定動作とエラーハンドリングの確実性を確保する

### Task 6.1: 設定委譲エラーハンドリング

**目標**: 設定関連のエラーが適切にハンドリングされる

- [ ] AgLoggerConfig設定エラーが適切にキャッチされる
- [ ] 設定委譲中のエラーが適切に処理される
- [ ] エラー時のリカバリー処理が実装される
- [ ] エラーメッセージが適切に出力される

### Task 6.2: 境界値と異常系テスト

**目標**: 予期しない入力や状態での安定動作を保証する

- [ ] executeLogでの異常入力（null/undefined引数）が適切に処理される
- [ ] 無効なログレベルが適切に処理される
- [ ] 設定オブジェクトの破損状態が検出される
- [ ] デフォルト値によるリカバリーが動作する

## タスク7: ドキュメント化と型安全性

### 達成目標

型安全性の強化と包括的なドキュメント作成を行う

### Task 7.1: TypeScript型安全性の強化

**目標**: 全メソッドで型安全性が保証される

- [ ] 全委譲メソッドで型アノテーションが適用される
- [ ] AgLoggerOptionsとAgLoggerConfigの型整合性が確保される
- [ ] ジェネリクスが適切に活用される
- [ ] コンパイル時の型チェックが強化される

### Task 7.2: JSDocドキュメント作成

**目標**: 新規メソッドの包括的なドキュメントを作成する

- [ ] setAgLoggerOptionsメソッドのJSDocが作成される
- [ ] executeLogメソッドのJSDocが作成される
- [ ] getCurrentSettingsメソッドのJSDocが作成される
- [ ] 実用的な使用例が含まれる
- [ ] エラーケースの説明が含まれる

## 成果物

### 実装ファイル

- `src/AgLogger.ts` - AgLoggerConfigの組み込みと設定委譲の実装
- `src/internal/AgLoggerConfig.ts` - 必要に応じた追加メソッド

### テストファイル

- `src/__tests__/AgLogger.spec.ts` - 設定委譲機能のユニットテスト
- `tests/e2e/AgLogger-config-delegation.e2e.spec.ts` - 設定委譲のE2Eテスト

## 品質基準

### テストカバレッジ

- [ ] 行カバレッジ: 100% (新規追加部分)
- [ ] 分岐カバレッジ: 100% (新規追加部分)
- [ ] 関数カバレッジ: 100% (新規追加部分)
- [ ] 既存テストカバレッジの維持

### コード品質

- [ ] `pnpm run lint:all` 通過
- [ ] `pnpm run check:types` 通過
- [ ] 既存のlintルール準拠
- [ ] 新機能のlintルール適合

### パフォーマンス

- [ ] 既存のログ出力性能を維持
- [ ] メモリ使用量の改善確認
- [ ] 設定変更処理の効率化確認

## 完了基準

- [ ] 全てのタスクが完了している
- [ ] 全新規テストが通過している
- [ ] 全既存テストが通過し続けている
- [ ] コード品質基準を満たしている
- [ ] E2Eテストでの統合動作確認完了
- [ ] パフォーマンス基準を満たしている
- [ ] 次フェーズ（ログ出力処理の変更）の準備が整っている

## 注意事項

- 既存のAgLoggerのパブリックAPIを変更しない
- AgLoggerManagerとの互換性を完全に維持する
- 段階的移行により破壊的変更を回避する
- 各タスクでRed-Green-Refactorサイクルを厳密に守る
- テストファーストで実装を進める
- パフォーマンス劣化を絶対に起こさない
- メモリリークの可能性を排除する

## 次フェーズへの準備

フェーズ2完了時には以下が整っている必要がある：

- [ ] AgLoggerがAgLoggerConfigのみを使用して動作
- [ ] 全既存メソッドがAgLoggerConfig経由にリファクタリング済み
- [ ] AgLoggerManagerインスタンス依存の完全削除
- [ ] executeLogメソッドによる統一されたログ出力処理
- [ ] 既存APIの完全な互換性維持
- [ ] E2Eテストによる動作確認完了
- [ ] パフォーマンス改善（メモリ使用量削減、静的アクセス削除）の確認

**重要**: 全チェックボックスが完了した時点でフェーズ3に移行可能
