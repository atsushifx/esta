---
header:
  - src: docs/specs/@agla-utils--ag-logger.spec.md
  - @(#) : Structured logging framework specification
title: 📝 構造化ログフレームワーク仕様書（@agla-utils/ag-logger）
version: 1.0.0
created: 2025-07-18
updated: 2025-07-18
authors:
  - 🤖 Claude（初期設計・API仕様策定）
  - 👤 atsushifx（要件定義・仕様確定）
changes:
  - 2025-07-18: 初回作成（ドキュメント整備）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

# 📝 構造化ログフレームワーク仕様書

## 概要

`@agla-utils/ag-logger`は、TypeScriptアプリケーション向けの柔軟で拡張可能な構造化ログフレームワークです。AWS CloudWatch Logs準拠のログレベルを使用し、プラグイン式アーキテクチャにより、カスタムロガーとフォーマッターをサポートします。

## 主要機能

### 1. AWS CloudWatch Logs準拠のログレベル

| レベル | 値 | 説明         |
| ------ | -- | ------------ |
| OFF    | 0  | ログ出力無効 |
| FATAL  | 1  | 致命的エラー |
| ERROR  | 2  | エラー       |
| WARN   | 3  | 警告         |
| INFO   | 4  | 情報         |
| DEBUG  | 5  | デバッグ情報 |
| TRACE  | 6  | 詳細トレース |

### 2. シングルトンパターン

- アプリケーション全体で一貫したログ設定
- `AgLogger.getInstance()`による統一インスタンス管理
- レベル別ロガー設定の共有
- テスト時のリセット機能（`resetSingleton()`）

### 3. プラグイン式アーキテクチャ

- カスタムロガーとフォーマッターの組み合わせ
- 既存プラグインの拡張・置換が容易
- レベル別の個別ロガー設定
- 集中管理される`AgLoggerManager`による効率的な管理

### 4. 並列テスト対応

- テストID付きE2Eモックロガー
- 並列テスト実行での独立したログキャプチャ
- テスト用ユーティリティ関数の提供

## API仕様

### 主要クラス

#### `AgLogger`

メインロガークラス。シングルトンパターンで実装。

**主要メソッド:**

- `getInstance(defaultLogger?, formatter?, loggerMap?): AgLogger` - シングルトンインスタンス取得
- `setLogLevel(level: AgTLogLevel): AgTLogLevel` - ログレベル設定
- `getLogLevel(): AgTLogLevel` - 現在のログレベル取得
- `setVerbose(value?: boolean): boolean` - verboseフラグの設定・取得
- `setLogger(options: AgLoggerOptions): void` - ロガー設定
- `fatal(...args: unknown[]): void` - 致命的エラーログ
- `error(...args: unknown[]): void` - エラーログ
- `warn(...args: unknown[]): void` - 警告ログ
- `info(...args: unknown[]): void` - 情報ログ
- `debug(...args: unknown[]): void` - デバッグログ
- `trace(...args: unknown[]): void` - トレースログ
- `log(...args: unknown[]): void` - 汎用ログ（INFOレベル）
- `verbose(...args: unknown[]): void` - verboseフラグが有効時のみ出力
- `resetSingleton(): void` - シングルトンインスタンスのリセット（テスト用）

#### `AgLoggerManager`

ロガーとフォーマッターの集中管理クラス。シングルトンパターンで実装。

**主要メソッド:**

- `getInstance(defaultLogger?, formatter?, loggerMap?): AgLoggerManager` - シングルトンインスタンス取得
- `setLogger(options): void` - ロガー設定
- `getLogger(level: AgTLogLevel): AgLoggerFunction` - レベル別ロガー取得
- `getFormatter(): AgFormatFunction` - フォーマッター取得

#### `getLogger(defaultLogger?, formatter?, loggerMap?): AgLogger`

便利関数。AgLoggerのシングルトンインスタンスを取得します。

### 型定義

```typescript
// ログレベル型（AWS CloudWatch Logs準拠）
type AgTLogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type AgTLogLevelLabel = 'OFF' | 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';

// ログレベル定数
const AG_LOGLEVEL = {
  OFF: 0,
  FATAL: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  DEBUG: 5,
  TRACE: 6,
} as const;

// ログメッセージ構造
type AgLogMessage = {
  logLevel: AgTLogLevel;
  timestamp: Date;
  message: string;
  args: unknown[];
};

// 関数型定義
type AgFormatFunction = (logMessage: AgLogMessage) => string;
type AgLoggerFunction = (formattedMessage: string) => void;
type AgLoggerMap<T extends AgLoggerFunction = AgLoggerFunction> = Record<AgTLogLevel, T | null>;

// 設定オプション
type AgLoggerOptions = {
  defaultLogger?: AgLoggerFunction;
  formatter?: AgFormatFunction;
  loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>;
};
```

## 標準プラグイン

### ロガープラグイン

#### `ConsoleLogger`

- 標準的なコンソール出力
- レベル別のconsoleメソッド使用
- FATAL/ERROR → `console.error`
- WARN → `console.warn`
- INFO → `console.info`
- DEBUG/TRACE → `console.debug`

#### `NullLogger`

- 出力なし（テスト用）
- すべてのログメッセージを無視

#### `E2eMockLogger`

- E2Eテスト用モックロガー（並列テスト対応）
- テストID付きログメッセージキャプチャ機能
- `startTest(testId)` - 新しいテストの開始
- `endTest(testId)` - テストの終了
- `getMessages(level, testId?)` - レベル別メッセージ取得
- `getLastMessage(level, testId?)` - 最新メッセージ取得
- `clear(testId?)` - メッセージ履歴クリア
- `createLoggerFunction(testId?)` - テスト用ロガー関数の作成

#### `IntegrationMockLogger`

- 統合テスト用モックロガー
- シンプルなメッセージキャプチャ機能
- E2eMockLoggerの軽量版

### フォーマッタープラグイン

#### `PlainFormat`

- プレーンテキスト形式
- 形式: `{timestamp} [{level}] {message} {args}`
- 人間が読みやすい形式

#### `JsonFormat`

- JSON形式
- 構造化ログ出力
- ログ解析ツールとの親和性

#### `NullFormat`

- 出力なし
- デバッグ・テスト用

## 使用例

### 基本的な使用

```typescript
import { AG_LOGLEVEL, ConsoleLogger, getLogger, PlainFormat } from '@agla-utils/ag-logger';

const logger = getLogger(ConsoleLogger, PlainFormat);
logger.setLogLevel(AG_LOGLEVEL.INFO);

logger.info('アプリケーション開始');
logger.error('エラーが発生', { errorCode: 500 });
```

### シングルトンパターン

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormat } from '@agla-utils/ag-logger';

const logger = AgLogger.getInstance(ConsoleLogger, PlainFormat);
logger.setLogLevel(AG_LOGLEVEL.DEBUG);

// 他のモジュールからも同じインスタンスを取得
const sameLogger = AgLogger.getInstance();
```

### Verboseモード

```typescript
const logger = AgLogger.getInstance();
logger.setVerbose(true);

// verboseフラグが有効な場合のみ出力される
logger.verbose('詳細なデバッグ情報');
```

### カスタムロガー設定

```typescript
logger.setLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormat,
  loggerMap: {
    [AG_LOGLEVEL.ERROR]: (message) => {
      console.error(`🚨 ${message}`);
    },
    [AG_LOGLEVEL.WARN]: (message) => {
      console.warn(`⚠️ ${message}`);
    },
  },
});
```

### E2Eテストでの使用（並列対応）

```typescript
import { createTestId, E2eMockLogger, getLogger, PlainFormat } from '@agla-utils/ag-logger';

const testId = createTestId('my-test');
const mockLogger = new E2eMockLogger(testId);
const logger = getLogger(mockLogger.createLoggerFunction(testId), PlainFormat);

// テスト対象コード実行
await targetFunction();

// ログメッセージ検証
const errorMessages = mockLogger.getMessages(AG_LOGLEVEL.ERROR, testId);
expect(errorMessages).toContain('期待されるエラーメッセージ');
```

### テストID生成ユーティリティ

```typescript
import { createTestId, createTestIdFromFile } from '@agla-utils/ag-logger';

// 手動でテストID生成
const testId1 = createTestId('feature-test');

// ファイルパスからテストID生成
const testId2 = createTestIdFromFile(__filename);
```

## 設計原則

### 1. 柔軟性

- プラグイン式アーキテクチャによる拡張性
- レベル別の個別ロガー設定
- カスタムフォーマッターの容易な作成

### 2. 型安全性

- TypeScriptの型システムを活用
- 型安全なログメッセージ構造
- コンパイル時エラー検出

### 3. パフォーマンス

- レベル別のフィルタリング
- 最小限の処理オーバーヘッド
- シングルトンパターンによる効率的なインスタンス管理

### 4. テスト容易性

- E2eMockLoggerによる並列テストサポート
- IntegrationMockLoggerによる統合テストサポート
- テストID管理による独立したテスト環境
- 依存性注入対応
- TDD手法との親和性

## 内部実装

### ログメッセージ処理フロー

1. **レベル判定**: 現在のログレベルと比較
2. **メッセージ構築**: タイムスタンプ・レベル・メッセージの組み立て
3. **フォーマット**: 設定されたフォーマッターによる整形
4. **出力**: 設定されたロガーによる出力

### シングルトン実装

```typescript
class AgLogger {
  private static _instance: AgLogger | undefined;
  private static _logLevel: AgTLogLevel = AG_LOGLEVEL.OFF;

  static getInstance(
    defaultLogger?: AgLoggerFunction,
    formatter?: AgFormatFunction,
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>,
  ): AgLogger {
    const instance = (AgLogger._instance ??= new AgLogger());

    if (defaultLogger !== undefined || formatter !== undefined || loggerMap !== undefined) {
      instance.setLogger({ defaultLogger, formatter, loggerMap });
    }

    return instance;
  }

  static resetSingleton(): void {
    AgLogger._instance = undefined;
    AgLogger._logLevel = AG_LOGLEVEL.OFF;
  }
}
```

### 関数型コア

ログメッセージの処理には関数型アプローチを採用し、純粋関数による処理が可能：

```typescript
import { formatLogMessage } from '@agla-utils/ag-logger/functional/core/formatLogMessage';

// 関数型でのログメッセージフォーマット
const formattedMessage = formatLogMessage(AG_LOGLEVEL.INFO, 'メッセージ', data);
```

## 依存関係

### 外部依存

- なし（標準ライブラリのみ使用）

### 内部依存

- `shared/types`: パッケージ内共通型定義（AgLogger.types.ts, AgLogger.interface.ts, LogLevel.types.ts）
- Node.js標準モジュール: `crypto`, `path`（テストID生成用）

## テスト仕様

### ユニットテスト

- 各プラグインの動作確認
- レベル別フィルタリング
- カスタムロガー・フォーマッターの動作
- シングルトンパターンの検証
- 関数型コアの純粋関数テスト
- verboseモードの動作確認

### 統合テスト

- プラグイン間の相互作用テスト
- AgLoggerManagerとの統合動作確認
- IntegrationMockLoggerによるテスト

### E2Eテスト

- 実際のログ出力統合テスト
- 複数レベルでの同時使用
- 並列テスト実行でのテストID分離
- パフォーマンステスト

## 追加されたユーティリティ

### `AgLoggerGetMessage`

ログの引数を解析してAgLogMessage構造に変換するユーティリティ関数。

### テストID生成関数

- `createTestId(name: string): string` - 手動でのテストID生成
- `createTestIdFromFile(filename: string): string` - ファイルパスからのテストID生成

## 今後の拡張予定

- ファイル出力プラグイン
- リモートログサーバー連携
- ログローテーション機能
- 構造化ログ検索機能
- 設定ファイルによる動的設定
- 非同期ログ処理
- ログフィルタリング機能の拡張
