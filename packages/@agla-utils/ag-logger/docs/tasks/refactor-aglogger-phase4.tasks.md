---
header:
- src: refactor-aglogger-phase4.tasks.md
- @(#): フェーズ4: AgLoggerManager設定管理API再構成タスク
title: フェーズ4: AgLoggerManager設定管理API再構成タスク
description: AgLoggerManagerをAgLoggerの設定管理APIとしての立ち位置に適した高レベルAPIに再構成
version: 1.0.0
created: 2025-07-29
updated: 2025-07-29
authors:
  - atsushifx
changes:
  - 2025-07-29: 初回作成（Phase3完了後のManager API改善）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

# フェーズ4: AgLoggerManager設定管理API再構成タスク

## 概要

Phase3でAgLogger APIの責任分離を完了した後、Phase4ではAgLoggerManagerをシンプルな管理クラスに再構成する。
現在の低レベルAPIを活用し、シングルトンAgLoggerインスタンスへの設定適用を担当する明確な役割に特化する。

## フェーズ4の目標

- [ ] AgLoggerManagerを設定適用の仲介役に特化
- [ ] シングルトンAgLoggerインスタンスを内部で保持・管理
- [ ] 現在の低レベルAPIを活用した設定適用
- [ ] シンプルで明確な責任分担
- [ ] 既存APIの互換性維持

## 前提条件（フェーズ3完了状態）

- [ ] AgLogger APIの責任が明確に分離されている
- [ ] createLogger(), getLogger()の責任分離完了
- [ ] Single Responsibility Principleに基づくクリーンな設計
- [ ] 既存コードとの完全な互換性維持

## 現在のAgLoggerManagerの問題分析

### 設計上の問題

1. **AgLoggerとの責任重複**
   - AgLoggerが既に設定管理機能を持っている
   - Managerの独自の価値が不明確

2. **低レベルAPIの存在意義**
   - 現在の低レベルAPIは内部実装として有用
   - 外部公開する必要性が低い

3. **シングルトン管理の重複**
   - AgLoggerとAgLoggerManagerが別々にシングルトン管理
   - 設定の一貫性確保が困難

### 期待される立ち位置

**AgLoggerManagerの理想的な役割**:

- AgLoggerシングルトンインスタンスへの設定適用
- 現在の低レベルAPIを活用した内部処理
- 設定変更の仲介役
- AgLoggerへの統一されたインターフェース提供

## タスク1: AgLoggerインスタンスの統合

### 達成目標

AgLoggerManagerがシングルトンAgLoggerインスタンスを内部で保持し、設定適用の仲介役として機能する

### Task 1.1: AgLoggerインスタンスの内部保持

**目標**: ManagerがシングルトンAgLoggerを内部で管理

- [ ] AgLoggerManager内部にAgLoggerインスタンスを保持するフィールド追加
- [ ] 初回アクセス時にAgLogger.getLogger()でインスタンス取得
- [ ] 一度取得したインスタンスを再利用する仕組み
- [ ] インスタンスライフサイクルの管理

### Task 1.2: 設定適用の仲介

**目標**: Managerが設定をAgLoggerに適用する仲介役を担う

- [ ] setManager()で受け取った設定をAgLogger.setLoggerOptions()に渡す
- [ ] createLogger()で初期設定付きAgLoggerインスタンス作成
- [ ] 内部保持しているAgLoggerインスタンスに設定適用
- [ ] 設定適用のエラーハンドリング
- [ ] 設定適用後の状態管理

### Task 1.3: createLoggerメソッドの実装

**目標**: 初期設定付きロガー作成の責任をManagerに移譲

- [ ] createLogger(options?: AgLoggerOptions): AgLoggerメソッド実装
- [ ] createLoggerで新しいAgLoggerインスタンス作成と設定適用
- [ ] 作成したインスタンスを内部で保持
- [ ] 既存のgetManager(options)をcreateLoggerに内部的に移譲

## タスク2: 低レベルAPIの整理

### 達成目標

現在の低レベルAPIを内部実装として整理し、必要な機能のみを外部公開

### Task 2.1: 内部APIとしての再構成

**目標**: 現在の低レベルAPIを内部実装として活用

- [ ] getLogger(logLevel), getFormatter()をprivateメソッド化
- [ ] setLogFunctionWithLevel(), setDefaultLogFunction()をprivateメソッド化
- [ ] updateLogMap()を内部実装として活用
- [ ] 必要な機能のみをpublic APIとして保持

### Task 2.2: 新しい公開APIの設計

**目標**: シンプルで明確な公開APIを提供

- [ ] createLogger(options?: AgLoggerOptions): AgLoggerメソッド追加（初期設定付きインスタンス作成）
- [ ] getLogger(): AgLoggerメソッド（内部保持インスタンス返却）
- [ ] 既存のsetManager()を維持（内部でAgLoggerに設定適用）
- [ ] 既存のgetManager()を維持（互換性のため）
- [ ] resetSingleton()でAgLoggerインスタンスもリセット

## タスク3: AgLoggerとの連携強化

### 達成目標

AgLoggerManagerとAgLoggerの間で設定の一貫性を保ち、シームレスな連携を実現

### Task 3.1: 設定同期の実装

**目標**: Managerでの設定変更がAgLoggerに確実に反映される

- [ ] setManager()実行時にAgLogger.setLoggerOptions()を呼び出し
- [ ] 設定変更のエラーハンドリング
- [ ] 設定変更の成功/失敗状態の管理
- [ ] 設定の一貫性検証

### Task 3.2: 既存APIの互換性維持

**目標**: 既存の使用パターンを完全に保持

- [ ] 既存のgetManager(options)の動作維持
- [ ] 既存のgetLogger(logLevel)の動作維持（deprecated警告付き）
- [ ] 既存のgetFormatter()の動作維持（deprecated警告付き）
- [ ] 全ての既存テストが通過することを保証

## タスク4: テストとドキュメント

### 達成目標

シンプルな新アーキテクチャの品質保証とドキュメント整備

### Task 4.1: ユニットテストの更新

**目標**: 新しいアーキテクチャのテスト

- [ ] AgLoggerインスタンス保持のテスト
- [ ] 設定適用の仲介機能テスト
- [ ] 新しいgetLogger()メソッドのテスト
- [ ] 既存APIの互換性テスト

### Task 4.2: E2Eテストの確認

**目標**: 実際の使用シナリオでの動作確認

- [ ] Manager経由の設定→ログ出力シナリオ
- [ ] AgLoggerとManagerの連携シナリオ
- [ ] 既存コードの動作継続確認
- [ ] パフォーマンスに影響がないことを確認

### Task 4.3: ドキュメントの更新

**目標**: シンプルで明確な使用ガイド

- [ ] AgLoggerManagerの新しい役割の文書化
- [ ] 簡単な使用例の提供
- [ ] AgLoggerとの連携方法の説明
- [ ] deprecated APIの移行ガイド

## 完了基準

- [ ] AgLoggerManagerがシングルトンAgLoggerインスタンスを適切に管理
- [ ] 設定適用の仲介役として正常に機能
- [ ] 低レベルAPIが内部実装として整理されている
- [ ] 全ての既存APIが互換性を保って動作する
- [ ] 新しいgetLogger()メソッドが正常動作する
- [ ] 新しいAPIのテストカバレッジ100%
- [ ] E2Eテストでの統合動作確認完了
- [ ] シンプルな使用ガイドが完成

## 次フェーズへの準備

フェーズ4完了時には以下が整っている必要がある：

- [ ] AgLoggerManagerがシンプルで明確な役割を担っている
- [ ] AgLoggerとの連携がシームレスに動作
- [ ] 既存コードとの完全な互換性維持
- [ ] 低レベルAPIが適切に整理されている
- [ ] パフォーマンスに影響がない
- [ ] フェーズ5での最終最適化に向けた準備完了

## 期待される新しいAgLoggerManager使用例

```typescript
// 推奨: createLoggerで初期設定付きロガー作成
const manager = AgLoggerManager.getManager();
const logger = manager.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormat,
  logLevel: AG_LOGLEVEL.INFO,
});

// または: オプションなしでデフォルト設定
const logger2 = manager.createLogger(); // デフォルト設定で作成

// または: 既存パターン（互換性維持）
const manager2 = AgLoggerManager.getManager({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormat,
  logLevel: AG_LOGLEVEL.INFO,
});

// AgLoggerインスタンス取得
const logger3 = manager2.getLogger(); // 内部で保持しているAgLoggerインスタンスを返す

// 設定変更
manager.setManager({
  logLevel: AG_LOGLEVEL.DEBUG,
}); // 内部AgLoggerインスタンスに設定適用

// ログ出力
logger.info('Hello World'); // 変更された設定で動作
```

## 注意事項

- 既存のパブリックAPIを破壊しない
- シンプルな役割分担を維持する
- パフォーマンス劣化を起こさない
- 複雑な機能は追加しない（YAGNI原則）
- AgLoggerConfigとの責任分担を明確に保つ
- 過度な抽象化を避ける

**重要**: 全チェックボックスが完了した時点でフェーズ5に移行可能
