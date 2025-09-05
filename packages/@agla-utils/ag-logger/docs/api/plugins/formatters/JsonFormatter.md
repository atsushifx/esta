---
header:
  - src: docs/api/plugins/formatters/JsonFormatter.md
  - "@(#)": JSON形式フォーマッター プラグイン APIリファレンス
title: JsonFormatter
description: ログメッセージをJSON形式でフォーマットするフォーマッタープラグインのAPIリファレンス
version: 0.3.0
created: 2025-08-25
authors:
  - atsushifx
changes:
  - 2025-08-25: 初版作成
  - 2025-09-05: フロントマター標準化・見出し階層修正
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## JsonFormatter

## 概要

**JsonFormatter**は、ログメッセージを JSON 形式の構造化データとしてフォーマットするフォーマッタープラグインです。本番環境でのログ解析やログ監視システムとの連携に適しており、機械可読な形式でログデータを出力します。

## 関数定義

```typescript
export const JsonFormatter: AgFormatFunction = (logMessage: AgLogMessage): string
```

### パラメータ

- **logMessage** (`AgLogMessage`): フォーマット対象のログメッセージオブジェクト
  - `logLevel` (`AgLogLevel`): ログレベル（数値）
  - `timestamp` (`Date`): ログ出力時刻
  - `message` (`string`): ログメッセージ文字列
  - `args` (`unknown[]`): 追加引数の配列

### 戻り値

- `string`: JSON 形式でシリアライズされたログエントリ文字列

### 動作

JsonFormatter は以下の手順でログメッセージを処理:

1. **レベル変換**: `AgToLabel()`を使用してログレベル数値を文字列ラベルに変換
2. **条件付きフィールド**: level と args は該当する場合のみ JSON オブジェクトに含める
3. **JSONシリアライズ**: `JSON.stringify()`で単一行の JSON 文字列として出力

出力される JSON オブジェクトの構造:

```typescript
{
  timestamp: string,    // ISO 8601形式のタイムスタンプ
  level?: string,       // ログレベルラベル（LOG レベル時は省略）
  message: string,      // ログメッセージ
  args?: unknown[]      // 引数配列（空の場合は省略）
}
```

## 使用例

### 基本的な使用方法

```typescript
import { AgLogger, ConsoleLogger, JsonFormatter } from '@agla-utils/ag-logger';

const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

logger.info('ユーザーログイン', { userId: 123, ip: '192.168.1.1' });
```

### 設定例

```typescript
const logger = AgLogger.createLogger();
logger.setLoggerConfig({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
  logLevel: AG_LOGLEVEL.DEBUG,
});
```

### 本番環境での活用例

```typescript
const prodLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
  logLevel: AG_LOGLEVEL.WARN,
  verbose: false,
});

prodLogger.error('API呼び出し失敗', {
  endpoint: '/api/users',
  statusCode: 500,
  requestId: 'req-12345',
});
```

## 出力例

### 基本的なログ

```json
{ "timestamp": "2025-01-01T12:00:00.000Z", "level": "INFO", "message": "Test message" }
```

### 引数付きログ

```json
{
  "timestamp": "2025-06-22T15:30:45.123Z",
  "level": "ERROR",
  "message": "An error occurred",
  "args": [{ "userId": 123, "action": "login" }]
}
```

### 複数引数のログ

```json
{
  "timestamp": "2025-03-15T09:15:30.500Z",
  "level": "DEBUG",
  "message": "Debug info",
  "args": [{ "name": "John Doe" }, { "age": 30 }, ["item1", "item2"]]
}
```

### LOGレベルの出力（levelフィールド省略）

```json
{ "timestamp": "2025-01-01T12:00:00.000Z", "message": "Force output message" }
```

## 注意事項

### 循環参照の制限

JsonFormatter は循環参照を含むオブジェクトをログ引数に渡すとエラーが発生:

```typescript
const circularObj = { name: 'test' };
circularObj.self = circularObj;

// これはエラーになります
logger.info('循環参照テスト', circularObj); // TypeError: Converting circular structure to JSON
```

### パフォーマンス考慮事項

- JSON 変換処理により、PlainFormatter より若干のオーバーヘッドがある
- 大きなオブジェクトのシリアライズは処理時間に影響する可能性がある

## 関連項目

- [AgFormatFunction](../../types/AgFormatFunction.md) - フォーマッター関数の型定義
- [PlainFormatter](PlainFormatter.md) - プレーン形式フォーマッター
- [ConsoleLogger](../loggers/ConsoleLogger.md) - コンソール出力ロガー
- [AgLoggerOptions](../../AgLoggerOptions.md) - ロガー設定オプション
