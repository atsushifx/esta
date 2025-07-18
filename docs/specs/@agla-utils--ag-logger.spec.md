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

### 3. プラグイン式アーキテクチャ

- カスタムロガーとフォーマッターの組み合わせ
- 既存プラグインの拡張・置換が容易
- レベル別の個別ロガー設定

## API仕様

### 主要クラス

#### `AgLogger`

メインロガークラス。シングルトンパターンで実装。

**主要メソッド:**

- `getInstance(logger?, formatter?): AgLogger` - シングルトンインスタンス取得
- `setLogLevel(level: AgLogLevel): void` - ログレベル設定
- `getLogLevel(): AgLogLevel` - 現在のログレベル取得
- `setLogger(options: AgLoggerOptions): void` - ロガー設定
- `fatal(...args: unknown[]): void` - 致命的エラーログ
- `error(...args: unknown[]): void` - エラーログ
- `warn(...args: unknown[]): void` - 警告ログ
- `info(...args: unknown[]): void` - 情報ログ
- `debug(...args: unknown[]): void` - デバッグログ
- `trace(...args: unknown[]): void` - トレースログ
- `log(...args: unknown[]): void` - 汎用ログ（INFOレベル）

#### `getLogger(logger, formatter): AgLogger`

便利関数。新しいロガーインスタンスを作成します。

### 型定義

```typescript
type AgLogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type AgLogMessage = {
  logLevel: AgLogLevel;
  timestamp: Date;
  message: string;
  args: unknown[];
};

type AgFormatFunction = (logMessage: AgLogMessage) => string;
type AgLoggerFunction = (formattedMessage: string) => void;

type AgLoggerOptions = {
  defaultLogger: AgLoggerFunction;
  formatter: AgFormatFunction;
  loggerMap?: Partial<Record<AgLogLevel, AgLoggerFunction>>;
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

- E2Eテスト用モックロガー
- ログメッセージのキャプチャ・検証機能
- `getMessages(level)` - レベル別メッセージ取得
- `getLastMessage(level)` - 最新メッセージ取得
- `clear()` - メッセージ履歴クリア

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
import { AgLogLevelCode, ConsoleLogger, getLogger, PlainFormat } from '@agla-utils/ag-logger';

const logger = getLogger(ConsoleLogger, PlainFormat);
logger.setLogLevel(AgLogLevelCode.INFO);

logger.info('アプリケーション開始');
logger.error('エラーが発生', { errorCode: 500 });
```

### シングルトンパターン

```typescript
import { AgLogger, AgLogLevelCode, ConsoleLogger, PlainFormat } from '@agla-utils/ag-logger';

const logger = AgLogger.getInstance(ConsoleLogger, PlainFormat);
logger.setLogLevel(AgLogLevelCode.DEBUG);

// 他のモジュールからも同じインスタンスを取得
const sameLogger = AgLogger.getInstance();
```

### カスタムロガー設定

```typescript
logger.setLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormat,
  loggerMap: {
    [AgLogLevelCode.ERROR]: (message) => {
      console.error(`🚨 ${message}`);
    },
    [AgLogLevelCode.WARN]: (message) => {
      console.warn(`⚠️ ${message}`);
    },
  },
});
```

### E2Eテストでの使用

```typescript
import { E2eMockLogger, getLogger, PlainFormat } from '@agla-utils/ag-logger';

const mockLogger = new E2eMockLogger();
const logger = getLogger(mockLogger, PlainFormat);

// テスト対象コード実行
await targetFunction();

// ログメッセージ検証
const errorMessages = mockLogger.getMessages(AgLogLevelCode.ERROR);
expect(errorMessages).toContain('期待されるエラーメッセージ');
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

- E2eMockLoggerによるテストサポート
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
  private static instance: AgLogger | null = null;

  static getInstance(logger?: AgLoggerFunction, formatter?: AgFormatFunction): AgLogger {
    if (!AgLogger.instance) {
      AgLogger.instance = new AgLogger(logger, formatter);
    }
    return AgLogger.instance;
  }
}
```

## 依存関係

### 外部依存

- なし（標準ライブラリのみ使用）

### 内部依存

- `@shared/types`: 共通型定義
- `@shared/constants`: 共通定数

## テスト仕様

### ユニットテスト

- 各プラグインの動作確認
- レベル別フィルタリング
- カスタムロガー・フォーマッターの動作
- シングルトンパターンの検証

### E2Eテスト

- 実際のログ出力統合テスト
- 複数レベルでの同時使用
- パフォーマンステスト

## 今後の拡張予定

- ファイル出力プラグイン
- リモートログサーバー連携
- ログローテーション機能
- 構造化ログ検索機能
- 設定ファイルによる動的設定
