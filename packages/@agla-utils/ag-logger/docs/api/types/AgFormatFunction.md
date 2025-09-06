---
header:
  - src: packages/@agla-utils/ag-logger/docs/api/types/AgFormatFunction.md
  - @(#): フォーマッター関数型 APIリファレンス
title: AgFormatFunction
description: ログメッセージをフォーマットする関数の型定義のAPIリファレンス
version: 0.3.0
created: 2025-09-05
authors:
  - atsushifx
changes:
  - 2025-09-05: 初版作成（パッケージドキュメント標準化）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

**AgFormatFunction**は、ログメッセージをフォーマットする関数の型定義です。`AgLogMessage`オブジェクトを受け取り、フォーマット済みの文字列を返します。タイムスタンプ、ログレベル、メッセージの組み合わせ方を自由に定義でき、プレーンテキスト、JSON、カスタム形式など様々な出力形式に対応できます。

## 型定義

```typescript
export type AgFormatFunction = (logMessage: AgLogMessage) => AgFormattedLogMessage;
```

## パラメータ・戻り値

### パラメータ

**`logMessage: AgLogMessage`** - フォーマット対象のログメッセージオブジェクト。

プロパティ:

<!-- textlint-disable ja-technical-writing/sentence-length, ja-technical-writing/max-comma -->

- `logLevel: AgLogLevel` - ログレベル数値 (FATAL=1, ERROR=2, WARN=3, INFO=4, DEBUG=5, TRACE=6, VERBOSE=-99, LOG=99)
- `timestamp: Date` - ログ出力時のタイムスタンプ
- `message: string` - メインのログメッセージテキスト
- `args: readonly unknown[]` - 追加引数配列 (オプション)

<!-- textlint-enable -->

### 戻り値

**`AgFormattedLogMessage`** - フォーマット済みメッセージ (通常は文字列)

## 既存フォーマッター例

### PlainFormatter

プレーンテキスト形式のフォーマッター (`[timestamp] LEVEL message ...args`)

```typescript
import { ConsoleLogger, createManager, getLogger, PlainFormatter } from '@agla-utils/ag-logger';

createManager({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});
const logger = getLogger();

logger.info('起動しました', { version: '0.3.0' });
// 出力例: 2025-08-25T10:30:00Z [INFO] 起動しました {"version":"0.3.0"}
```

### JsonFormatter

JSON 形式のフォーマッター (構造化ログ出力)

```typescript
import { ConsoleLogger, createManager, getLogger, JsonFormatter } from '@agla-utils/ag-logger';

createManager({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
});
const logger = getLogger();

logger.debug('ユーザー取得', { userId: 42 });
// 出力例: {"timestamp":"2025-08-25T10:30:00.123Z","level":"DEBUG","message":"ユーザー取得","args":[{"userId":42}]}
```

## カスタムフォーマッター作成例

### シンプルなカスタムフォーマッター

```typescript
import type { AgFormatFunction } from '@agla-utils/ag-logger';
import { AgToLabel } from '@agla-utils/ag-logger';

const simpleFormatter: AgFormatFunction = (logMessage) => {
  const level = AgToLabel(logMessage.logLevel);
  const time = logMessage.timestamp.toLocaleTimeString();
  return `${time} [${level}] ${logMessage.message}`;
};

// 出力例: 10:30:00 [INFO] 起動しました
```

### 色付きコンソールフォーマッター

```typescript
import type { AgFormatFunction } from '@agla-utils/ag-logger';
import { AG_LOGLEVEL, AgToLabel } from '@agla-utils/ag-logger';

const colorFormatter: AgFormatFunction = (logMessage) => {
  const colors = {
    [AG_LOGLEVEL.FATAL]: '\x1b[91m', // 明るい赤
    [AG_LOGLEVEL.ERROR]: '\x1b[31m', // 赤
    [AG_LOGLEVEL.WARN]: '\x1b[33m', // 黄
    [AG_LOGLEVEL.INFO]: '\x1b[36m', // シアン
    [AG_LOGLEVEL.DEBUG]: '\x1b[90m', // 灰色
    [AG_LOGLEVEL.TRACE]: '\x1b[90m', // 灰色
  };

  const reset = '\x1b[0m';
  const color = colors[logMessage.logLevel] || '';
  const level = AgToLabel(logMessage.logLevel);
  const time = logMessage.timestamp.toISOString().slice(11, 19);

  return `${time} ${color}[${level}]${reset} ${logMessage.message}`;
};

// 出力例: 10:30:00 [INFO] 起動しました (シアン色で表示)
```

### 詳細情報付きフォーマッター

```typescript
import type { AgFormatFunction } from '@agla-utils/ag-logger';
import { AgToLabel } from '@agla-utils/ag-logger';

const detailedFormatter: AgFormatFunction = (logMessage) => {
  const level = AgToLabel(logMessage.logLevel);
  const timestamp = logMessage.timestamp.toISOString();
  const argsString = logMessage.args.length > 0
    ? ` | Args: ${JSON.stringify(logMessage.args)}`
    : '';
  const pid = process.pid;

  return `[${timestamp}] [PID:${pid}] [${level}] ${logMessage.message}${argsString}`;
};

// 出力例: [2025-08-25T10:30:00.123Z] [PID:1234] [INFO] 起動しました | Args: [{"version":"0.3.0"}]
```

### 環境別フォーマッター

```typescript
import type { AgFormatFunction } from '@agla-utils/ag-logger';
import { JsonFormatter, PlainFormatter } from '@agla-utils/ag-logger';

const environmentFormatter: AgFormatFunction = (logMessage) => {
  // 本番環境では構造化ログ、開発環境では読みやすい形式
  if (process.env.NODE_ENV === 'production') {
    return JsonFormatter(logMessage);
  } else {
    return PlainFormatter(logMessage);
  }
};
```

### ファイル出力用フォーマッター

```typescript
import type { AgFormatFunction } from '@agla-utils/ag-logger';
import { AgToLabel } from '@agla-utils/ag-logger';

const fileFormatter: AgFormatFunction = (logMessage) => {
  const level = AgToLabel(logMessage.logLevel);
  const timestamp = logMessage.timestamp.toISOString();
  const message = logMessage.message;
  const args = logMessage.args.length > 0
    ? ` ${JSON.stringify(logMessage.args)}`
    : '';

  // ファイル出力用に改行文字を含める
  return `${timestamp} [${level}] ${message}${args}`;
};
```

## 注意事項

### パフォーマンス

- フォーマッター関数は頻繁に呼び出されるため、重い処理は避けてください
- JSON.stringify や複雑な文字列操作は必要最小限に留めてください
- 同期的な処理のみ実装してください (非同期処理は未対応)

### エラーハンドリング

- フォーマッター内でエラーが発生した場合、ログ出力全体が停止する可能性
- try-catch でエラーをキャッチし、フォールバック処理を実装することを推奨

```typescript
const safeFormatter: AgFormatFunction = (logMessage) => {
  try {
    // カスタムフォーマット処理
    return customFormat(logMessage);
  } catch (error) {
    // エラー時はシンプルな形式にフォールバック
    return `${logMessage.timestamp.toISOString()} ${logMessage.message}`;
  }
};
```

### メモリ使用量

- 大量のログ出力時は、フォーマッター関数でのメモリ使用量に注意してください
- 不要なオブジェクト作成や文字列結合を最小限に留めてください

## 関連項目

- [`AgLogMessage`](./AgLogMessage.md) - フォーマッター入力となるログメッセージ型
- [`AgFormattedLogMessage`](./AgFormattedLogMessage.md) - フォーマッター出力型
- [`AgLoggerOptions`](./AgLoggerOptions.md) - フォーマッター設定を含むオプション型
- [`PlainFormatter`](../plugins/PlainFormatter.md) - 標準プレーンテキストフォーマッター
- [`JsonFormatter`](../plugins/JsonFormatter.md) - 標準 JSON フォーマッター
