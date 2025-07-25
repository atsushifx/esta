---
header:
- src: functional-refactoring.spec.md
- @(#): ag-logger 関数型リファクタリング仕様書
title: ag-logger 関数型リファクタリング仕様書
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

## 概要

ag-loggerパッケージを現代的な関数型プログラミングパターンを用いてリファクタリングする。
ユーザビリティを最大化するため、**外部APIは従来型を維持**しつつ、**内部実装を関数型**に変更する。

## 現在のアーキテクチャ分析

### 課題点

1. **Singleton Dependencies**
   - `AgLogger`と`AgLoggerManager`のシングルトンパターンが密結合を生成
   - グローバル状態によりテストの並列実行が困難
   - 設定変更が予測困難な副作用を引き起こす可能性

2. **Mutable State Management**
   - ロガーインスタンスが可変状態（verbose flag, log levels）を保持
   - マネージャークラスが複雑な内部状態変更を行う
   - 副作用が散在し、予測可能性が低い

3. **Imperative Configuration**
   - 複雑な条件分岐による設定処理（`setLogger`メソッド）
   - 手動状態同期が必要
   - プラグイン関係がハードコード（ConsoleLogger → ConsoleLoggerMap）

4. **Limited Composability**
   - プラグインの組み合わせが制限的
   - 実行時プラグイン変更が困難
   - 設定とロジックの結合度が高い

## 関数型リファクタリング方針

### 1. Pure Function Pipeline

```typescript
// 現在: 命令型処理
private logWithLevel(level: AgTLogLevel, ...args: unknown[]): void {
  if (this.isOutputLevel(level)) {
    const logMessage = AgLoggerGetMessage(level, ...args);
    const formatter = this._loggerManager.getFormatter();
    const formattedMessage = formatter(logMessage);
    if (formattedMessage === '') return;
    const logger = this._loggerManager.getLogger(level);
    logger(formattedMessage);
  }
}

// リファクタリング後: 純関数パイプライン
const processLogMessage = pipe(
  parseLogArguments,
  filterByLogLevel(config.level),
  formatMessage(config.formatter),
  outputLog(config.loggers)
);
```

### 2. Immutable Configuration

```typescript
// 現在: 可変設定オブジェクト
class AgLogger {
  private static _logLevel: AgTLogLevel = AG_LOG_LEVEL.OFF;
  private _verbose: boolean = false;
}

// リファクタリング後: イミュータブル設定
type LoggerConfig = Readonly<{
  level: AgTLogLevel;
  verbose: boolean;
  formatter: AgFormatFunction;
  loggers: Readonly<AgLoggerMap<AgLoggerFunction>>;
}>;

const updateConfig = (
  current: LoggerConfig,
  updates: Partial<LoggerConfig>,
): LoggerConfig => ({
  ...current,
  ...updates,
});
```

### 3. Factory Function Pattern

```typescript
// 現在: シングルトンパターン
export const getLogger = (...args) => AgLogger.getInstance(...args);

// リファクタリング後: ファクトリー関数
export const createLogger = (config: Partial<LoggerConfig> = {}): Logger => {
  const finalConfig = mergeWithDefaults(config);
  return createLoggerInstance(finalConfig);
};

// 互換性のためのラッパー
export const getLogger = (...args) => createLogger(convertLegacyArgs(args));
```

### 4. Higher-Order Function Plugins

```typescript
// 現在: ハードコードされたマッピング
if (options.defaultLogger === ConsoleLogger && !options.loggerMap) {
  enhancedOptions.loggerMap = ConsoleLoggerMap;
}

// リファクタリング後: コンポーザブルプラグイン
const withConsoleOutput = () => (config: LoggerConfig): LoggerConfig => ({
  ...config,
  loggers: createConsoleLoggerMap(),
});

const withJsonFormat = () => (config: LoggerConfig): LoggerConfig => ({
  ...config,
  formatter: JsonFormat,
});

// 使用例
const logger = createLogger(
  pipe(
    withLogLevel('INFO'),
    withJsonFormat(),
    withConsoleOutput(),
  )({}),
);
```

## API互換性保証戦略

### 1. Backward Compatibility Layer

```typescript
// 既存API（完全互換）
export class AgLogger {
  static getInstance(...args): AgLogger {
    // 内部で関数型実装を呼び出し、クラスインターフェースでラップ
    return new AgLoggerCompatWrapper(createLogger(convertArgs(args)));
  }

  info(...args: unknown[]): void {
    // 関数型実装への委譲
    this._functionalLogger.info(...args);
  }
}

export const getLogger = AgLogger.getInstance;
```

### 2. Progressive Migration Support

```typescript
// 新しい関数型API（オプション）
export const createLogger = (config: LoggerConfig): Logger => {/* ... */};

// 移行期間中の両対応
export const getLogger = (...args) => {
  if (isLegacyArgs(args)) {
    return AgLogger.getInstance(...args);
  }
  return createLogger(args[0]);
};
```

## 段階的移行計画

### Phase 1: Pure Function Core

- メッセージ処理ロジックを純関数化
- 既存のテストケースを通すことを保証
- パフォーマンス回帰がないことを確認

### Phase 2: Immutable Configuration

- 設定管理をイミュータブルに変更
- 設定更新時の新しいオブジェクト生成パターン導入
- メモリリークがないことを確認

### Phase 3: Dependency Injection

- シングルトンパターンを段階的に削除
- ファクトリー関数による独立インスタンス生成
- テスト並列実行の有効化

### Phase 4: Plugin System Modernization

- プラグインシステムを高階関数ベースに変更
- プラグインの合成可能性向上
- 実行時プラグイン変更サポート

### Phase 5: Error Handling Enhancement

- Result/Either型パターン導入
- 明示的なエラー処理
- エラー処理の合成可能性向上

## 品質保証

### 性能基準

- 既存実装と同等以上のパフォーマンス
- メモリ使用量の増加なし
- バンドルサイズの大幅な増加なし

### 互換性基準

- 既存のすべてのE2Eテストが通過
- public APIの破壊的変更なし
- 既存の設定オプションがすべて動作

### コード品質基準

- 100%型安全（`any`型の使用禁止）
- 純関数の副作用なし保証
- イミュータブルデータ構造の活用

## 期待される効果

### 開発体験向上

- **テスト並列実行**: シングルトン削除によりテストが並列実行可能
- **予測可能性**: 純関数により副作用が予測可能
- **デバッグ容易性**: イミュータブルな状態により状態変更が追跡しやすい

### 保守性向上

- **モジュラリティ**: 疎結合なコンポーネント設計
- **拡張性**: プラグインシステムの柔軟性向上
- **再利用性**: 純関数の再利用可能性

### コード品質向上

- **型安全性**: より表現力豊かなTypeScript型
- **テスタビリティ**: 純関数の単体テストが容易
- **可読性**: 関数型パターンによる意図の明確化
