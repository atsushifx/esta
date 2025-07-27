---
header:
- src: ag-logger-refactor.spec.md
- @(#): AgLogger リファクタリング仕様書
title: AgLogger リファクタリング仕様書
description: AgLoggerアーキテクチャの責任分担を明確化し、SOLID原則に基づいた設計にリファクタリングする仕様書
version: 1.0.0
created: 2025-07-27
updated: 2025-07-27
authors:
  - atsushifx
changes:
  - 2025-07-27: 初回作成（SOLID原則に基づく責任分担設計）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

# AgLogger リファクタリング仕様書

## 概要

AgLoggerアーキテクチャの責任分担を明確化し、SOLID原則に基づいた設計にリファクタリングする。
現在のAgLoggerManagerインスタンス依存を削除し、設定管理を専用クラスに委譲することで、保守性と拡張性を向上させる。

## 現在の問題点

### 1. 責任の混在

- AgLoggerがAgLoggerManagerのインスタンスを保持
- 設定管理の責任がAgLoggerとAgLoggerManagerで分散
- ログ出力処理と設定管理が密結合

### 2. パフォーマンスの問題

- 毎回のログ出力時に静的アクセス`AgLoggerManager.getManager().getXxx()`が発生
- 不要なインスタンス参照によるメモリ使用量増加

### 3. テストの困難さ

- 設定とログ出力処理が密結合でテストが複雑
- モック化が困難

## 目標アーキテクチャ

### 設計原則

- **Single Responsibility Principle**: 各クラスが単一の責任を持つ
- **Dependency Inversion**: 具象クラスではなく抽象に依存
- **Composition over Inheritance**: 継承よりも委譲を優先

### 責任分担

#### AgLoggerConfig（新規・内部クラス）

**責任**: 設定管理と出力制御判定

- ログレベル別ロガー関数の管理
- デフォルトロガー関数の管理
- フォーマッター管理
- ログレベル制御
- Verbose制御
- 設定値の検証

#### AgLogger

**責任**: ログAPIの提供と実際のログ出力

- ログメソッドAPI（`fatal`, `error`, `warn`, `info`, `debug`, `trace`, `log`, `verbose`）
- シングルトンインスタンス管理
- AgLoggerConfigを使用した実際のログ出力処理

#### AgLoggerManager

**責任**: 管理APIの提供

- AgLoggerインスタンスのファクトリメソッド
- 設定変更の管理API
- 既存APIの互換性維持

## クラス設計詳細

### AgLoggerConfig

```typescript
// src/internal/AgLoggerConfig.ts
// 注意: このクラスは外部にexportしない
class AgLoggerConfig {
  private loggerMap: AgLoggerMap<AgLoggerFunction>;
  private formatter: AgFormatFunction;
  private defaultLogger: AgLoggerFunction;
  private logLevel: AgTLogLevel;
  private verbose: boolean;

  constructor() {
    this.defaultLogger = NullLogger;
    this.formatter = NullFormat;
    this.logLevel = AG_LOGLEVEL.OFF;
    this.verbose = false;
    this.loggerMap = this.createDefaultLoggerMap();
  }

  // 設定適用（検証付き）
  applyOptions(options: AgLoggerOptions): void;

  // ログレベル制御
  setLogLevel(level: AgTLogLevel): AgTLogLevel;
  getLogLevel(): AgTLogLevel;
  shouldOutput(level: AgTLogLevel): boolean;

  // Verbose制御
  setVerbose(value: boolean): boolean;
  getVerbose(): boolean;
  shouldOutputVerbose(): boolean;

  // ロガー・フォーマッター取得
  getLoggerFunction(level: AgTLogLevel): AgLoggerFunction;
  getFormatter(): AgFormatFunction;

  // 設定検証
  private validateOptions(options: AgLoggerOptions): void;
  private isValidLogLevel(level: AgTLogLevel): boolean;

  // 設定状態取得
  getCurrentOptions(): AgLoggerOptions;
}
```

### AgLogger（リファクタリング後）

```typescript
class AgLogger {
  private static _instance: AgLogger | undefined;
  private config: AgLoggerConfig;

  private constructor() {
    this.config = new AgLoggerConfig();
  }

  static getLogger(options?: AgLoggerOptions): AgLogger;

  // ログAPI（パブリックインターフェース）
  fatal(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  trace(...args: unknown[]): void;
  log(...args: unknown[]): void;
  verbose(...args: unknown[]): void;

  // 設定API（configに委譲）
  applySettings(options: AgLoggerOptions): void;
  setLogLevel(level: AgTLogLevel): AgTLogLevel;
  getLogLevel(): AgTLogLevel;
  setVerbose(value?: boolean): boolean;

  // 実際のログ出力処理（内部メソッド）
  private executeLog(level: AgTLogLevel, ...args: unknown[]): void;

  // シングルトンリセット（テスト用）
  static resetSingleton(): void;

  // 現在の設定取得
  getCurrentSettings(): AgLoggerOptions;
}
```

### AgLoggerManager（リファクタリング後）

```typescript
class AgLoggerManager {
  private static instance: AgLoggerManager | undefined;

  // 既存API（互換性維持）
  static getManager(options?: AgLoggerOptions): AgLoggerManager;

  // 新しいファクトリメソッド（推奨）
  static getLogger(options?: AgLoggerOptions): AgLogger;

  // 設定管理API
  setManager(options: AgLoggerOptions): void;

  // 互換性API（非推奨、将来削除予定）
  getLogFunction(logLevel: AgTLogLevel): AgLoggerFunction;
  getFormatter(): AgFormatFunction;

  // シングルトンリセット（テスト用）
  static resetSingleton(): void;
}
```

## ログ出力フロー

### 新しいログ出力フロー

1. ユーザーが`logger.info("message")`を呼び出す
2. AgLoggerの`info()`メソッドが`executeLog(AG_LOGLEVEL.INFO, "message")`を呼び出す
3. `executeLog()`内で以下の処理を実行：
   - `config.shouldOutput(level)`で出力可否判定
   - `AgLoggerGetMessage()`でメッセージ作成
   - `config.getFormatter()`でフォーマット適用
   - `config.getLoggerFunction(level)`でロガー関数取得
   - ロガー関数を実行してログ出力

### パフォーマンス改善

- 静的アクセス削除により呼び出しコスト削減
- AgLoggerConfig内でのキャッシュ効果
- 不要なインスタンス参照削除によるメモリ効率化

## API仕様

### 推奨使用パターン

```typescript
// パターン1: AgLoggerManager経由（新推奨）
const logger = AgLoggerManager.getLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormat,
  logLevel: AG_LOGLEVEL.INFO,
});
logger.info('Hello World');

// パターン2: AgLogger直接（既存互換）
const logger = AgLogger.getLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormat,
});
logger.setLogLevel(AG_LOGLEVEL.DEBUG);
logger.debug('Debug message');

// パターン3: 管理API使用
AgLoggerManager.getManager().setManager({
  defaultLogger: MockLogger,
  formatter: JsonFormat,
});
const logger = AgLoggerManager.getLogger();
logger.error('Error occurred');
```

### 設定オプション

```typescript
interface AgLoggerOptions {
  defaultLogger?: AgLoggerFunction;
  formatter?: AgFormatFunction;
  loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>;
  logLevel?: AgTLogLevel;
  verbose?: boolean;
}
```

## 互換性保証

### 破壊的変更なし

- 既存の`AgLogger.getLogger()`API維持
- 既存の`AgLoggerManager.getManager()`API維持
- 既存のログメソッド（`fatal`, `error`, `warn`等）API維持

### 非推奨API

以下のAPIは非推奨とし、将来のバージョンで削除予定：

- `AgLoggerManager.prototype.getLogger(level: AgTLogLevel)` → `getLogFunction(level)`に移行済み
- `AgLoggerManager.prototype.getFormatter()` → 直接アクセス不要

## 移行戦略

### フェーズ1: AgLoggerConfig作成

- 内部設定管理クラスの実装
- 単体テストの追加
- 設定検証ロジックの実装

### フェーズ2: AgLogger設定委譲

- AgLoggerConfigの組み込み
- 設定管理の委譲実装
- 既存機能との並行稼働確認

### フェーズ3: ログ出力処理の変更

- `executeLog`メソッドの実装
- 自身の設定を使用するよう変更
- パフォーマンステスト実行

### フェーズ4: AgLoggerManager API拡張

- `getLogger()`ファクトリメソッド追加
- 管理API整備
- 新APIのテスト追加

### フェーズ5: 旧実装削除

- `_loggerManager`インスタンス削除
- 不要なimport削除
- コードクリーンアップ

### フェーズ6: ドキュメント更新

- API使用例の更新
- 移行ガイドの作成
- README更新

## テスト戦略

### 単体テスト

- **AgLoggerConfigTest**: 設定管理・検証・制御判定の網羅的テスト
- **AgLoggerTest**: ログAPI・出力処理・設定委譲のテスト
- **AgLoggerManagerTest**: 管理API・ファクトリメソッドのテスト

### 統合テスト

- **PluginInteractionTest**: 各プラグイン（ロガー・フォーマッター）の組み合わせテスト
- **PerformanceTest**: 新アーキテクチャのパフォーマンステスト
- **CompatibilityTest**: 既存API互換性のテスト

### E2Eテスト

- **RealLoggingTest**: 実際のログ出力動作のテスト
- **ConfigurationTest**: 複雑な設定パターンのテスト

## 品質基準

### 成功基準

- [ ] 全既存テストが通過し続ける
- [ ] 新アーキテクチャでのテストカバレッジ95%以上
- [ ] パフォーマンス劣化なし（ベンチマーク実行）
- [ ] メモリ使用量削減の確認
- [ ] 既存APIの完全互換性

### 品質ゲート

- [ ] `pnpm run test:develop` - 全単体テスト通過
- [ ] `pnpm run test:ci` - 全統合テスト通過
- [ ] `pnpm run test:e2e` - 全E2Eテスト通過
- [ ] `pnpm run lint:all` - コード品質チェック通過
- [ ] `pnpm run check:types` - 型安全性チェック通過

## リスク評価

### 技術的リスク

- **Low**: 既存APIの互換性破壊
- **Medium**: パフォーマンス劣化
- **Low**: テストの複雑化

### 軽減策

- 段階的リファクタリングによる影響範囲の限定
- 各フェーズでの全テスト実行
- パフォーマンスベンチマークの継続監視

## 期待効果

### 開発体験の向上

- 責任分担の明確化による保守性向上
- テスト容易性の向上
- 新機能追加の簡易化

### パフォーマンス向上

- ログ出力時の不要な静的アクセス削除
- メモリ使用量の最適化
- キャッシュ効果による高速化

### 拡張性向上

- 新しいログレベルの追加が容易
- カスタムフォーマッターの実装が簡単
- プラグインアーキテクチャの強化
