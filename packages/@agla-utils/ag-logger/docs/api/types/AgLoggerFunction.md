---
header:
  - src: packages/@agla-utils/ag-logger/docs/api/types/AgLoggerFunction.md
  - @(#): ロガー関数型 APIリファレンス
title: AgLoggerFunction
description: フォーマット済みログメッセージを出力する関数の型定義のAPIリファレンス
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

**AgLoggerFunction**は、フォーマット済みログメッセージを実際に出力する関数の型定義です。フォーマッターで整形されたメッセージを受け取り、コンソール、ファイル、外部サービスなど様々な出力先に送信します。`AgLoggerMap`と組み合わせることで、ログレベルごとに異なる出力先を指定できます。

## 型定義

```typescript
export type AgLoggerFunction = (formattedLogMessage: AgFormattedLogMessage) => void;
```

## パラメータ詳細

### formattedLogMessage

**型**: `AgFormattedLogMessage` ((通常は `string`)
**説明**: フォーマッター関数によって整形済みのログメッセージ。

この引数は`AgFormatFunction`によって処理された結果で、出力可能な形式になっています。

## 出力先バリエーション例

### コンソール出力

最も基本的な出力先で、標準出力やコンソールにログを表示します。

```typescript
import type { AgLoggerFunction } from '@agla-utils/ag-logger';

// シンプルなコンソールロガー
const simpleConsoleLogger: AgLoggerFunction = (message) => {
  console.log(message);
};

// レベル別コンソール出力
const leveledConsoleLogger: AgLoggerFunction = (message) => {
  // メッセージからレベルを推定して適切なコンソールメソッドを使用
  if (message.includes('[ERROR]') || message.includes('[FATAL]')) {
    console.error(message);
  } else if (message.includes('[WARN]')) {
    console.warn(message);
  } else if (message.includes('[INFO]')) {
    console.info(message);
  } else {
    console.log(message);
  }
};
```

### ファイル出力

ログをファイルに保存する実装例です。

```typescript
import type { AgLoggerFunction } from '@agla-utils/ag-logger';
import fs from 'fs';
import path from 'path';

// 単一ファイル出力
const fileLogger: AgLoggerFunction = (message) => {
  const logFile = path.join(process.cwd(), 'app.log');
  fs.appendFileSync(logFile, message + '\n');
};

// 日付別ファイル出力
const dailyFileLogger: AgLoggerFunction = (message) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const logFile = path.join(process.cwd(), `logs/app-${today}.log`);

  // ディレクトリが存在しない場合は作成
  const logDir = path.dirname(logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  fs.appendFileSync(logFile, message + '\n');
};

// 非同期ファイル出力 (パフォーマンス重視)
const asyncFileLogger: AgLoggerFunction = (message) => {
  const logFile = path.join(process.cwd(), 'app.log');
  fs.appendFile(logFile, message + '\n', (err) => {
    if (err) {
      console.error('ログファイル書き込みエラー:', err);
    }
  });
};
```

### 外部サービス送信

ログ監視サービスや外部 API にログを送信する実装例です。

```typescript
import type { AgLoggerFunction } from '@agla-utils/ag-logger';

// HTTP API送信
const apiLogger: AgLoggerFunction = (message) => {
  fetch('/api/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      message: message,
      service: 'my-app',
    }),
  }).catch((err) => {
    console.error('ログAPI送信エラー:', err);
  });
};

// Webhook送信 (Slack等)
const webhookLogger: AgLoggerFunction = (message) => {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) { return; }

  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: `🚨 ${message}`,
      username: 'Log Bot',
    }),
  }).catch((err) => {
    console.error('Webhook送信エラー:', err);
  });
};

// 監視サービス送信 (DataDog、CloudWatch等)
const monitoringLogger: AgLoggerFunction = (message) => {
  // 例：DataDog Logs API
  const ddApiKey = process.env.DD_API_KEY;
  if (!ddApiKey) { return; }

  fetch('https://http-intake.logs.datadoghq.com/v1/input/' + ddApiKey, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      ddtags: 'env:production,service:my-app',
      timestamp: Date.now(),
    }),
  }).catch((err) => {
    console.error('監視サービス送信エラー:', err);
  });
};
```

### 無効化ロガー

ログ出力を無効にするための Null ロガーです。

```typescript
import type { AgLoggerFunction } from '@agla-utils/ag-logger';

// ログ出力を行わない（無効化）
const nullLogger: AgLoggerFunction = () => {
  // 何もしない
};
```

## LoggerMap活用例

`AgLoggerMap`と組み合わせることで、ログレベルごとに異なる出力先を指定できます。

### レベル別出力先指定

```typescript
import { AG_LOGLEVEL, ConsoleLogger, createManager, getLogger } from '@agla-utils/ag-logger';
import type { AgLoggerOptions } from '@agla-utils/ag-logger';

// ファイル出力ロガー
const errorFileLogger: AgLoggerFunction = (message) => {
  fs.appendFileSync('error.log', message + '\n');
};

// アラート送信ロガー
const alertLogger: AgLoggerFunction = (message) => {
  // 致命的エラー時は即座に通知
  sendUrgentAlert(message);
};

// レベル別設定
const options: AgLoggerOptions = {
  defaultLogger: ConsoleLogger, // 通常ログはコンソール出力
  loggerMap: {
    [AG_LOGLEVEL.FATAL]: alertLogger, // 致命的エラーはアラート送信
    [AG_LOGLEVEL.ERROR]: errorFileLogger, // エラーはファイルに記録
    // INFO, WARN, DEBUG等は defaultLogger を使用
  },
};

createManager(options);
const logger = getLogger();

logger.info('通常の動作'); // → コンソール出力
logger.error('処理に失敗'); // → error.logファイルに記録
logger.fatal('システム停止'); // → アラート送信
```

### 環境別設定

```typescript
// 開発環境：すべてコンソール出力
const devOptions: AgLoggerOptions = {
  defaultLogger: ConsoleLogger,
};

// 本番環境：重要度別に出力先を分離
const prodOptions: AgLoggerOptions = {
  defaultLogger: ConsoleLogger,
  loggerMap: {
    [AG_LOGLEVEL.FATAL]: (message) => {
      alertLogger(message);
      errorFileLogger(message);
    },
    [AG_LOGLEVEL.ERROR]: errorFileLogger,
    [AG_LOGLEVEL.WARN]: (message) => {
      fs.appendFileSync('warning.log', message + '\n');
    },
  },
};

// 環境に応じて設定を切り替え
const options = process.env.NODE_ENV === 'production' ? prodOptions : devOptions;
```

### テスト用設定

```typescript
// テスト用バッファロガー
let logBuffer: string[] = [];

const bufferLogger: AgLoggerFunction = (message) => {
  logBuffer.push(message);
};

const testOptions: AgLoggerOptions = {
  defaultLogger: bufferLogger,
};

// テスト後にログ内容を検証
function getTestLogs(): string[] {
  const logs = [...logBuffer];
  logBuffer = []; // リセット
  return logs;
}
```

## 注意事項

### パフォーマンス

- ログ出力は頻繁に呼び出されるため、重い処理は避けてください
- ファイル出力では非同期処理の使用を検討してください
- ネットワーク通信を伴う場合は、エラーハンドリングを適切に行ってください

### エラーハンドリング

- ロガー自体がエラーを発生させた場合、ログ出力全体が停止する可能性
- 外部サービス通信では必ず例外処理を実装してください

```typescript
const safeLogger: AgLoggerFunction = (message) => {
  try {
    // ログ出力処理
    dangerousLogOutput(message);
  } catch (error) {
    // フォールバック：最低限コンソールに出力
    console.error('ログ出力エラー:', error);
    console.log(message);
  }
};
```

### リソース管理

- ファイル出力ではリソース管理をしてください
- 長時間実行されるアプリケーションでは、ファイルハンドルのリークに注意してください

## 関連項目

- [`AgFormattedLogMessage`](./AgFormattedLogMessage.md) - ロガー関数の入力型
- [`AgLoggerMap`](./AgLoggerMap.md) - ロガー関数をマッピングする型
- [`AgLoggerOptions`](./AgLoggerOptions.md) - ロガー関数を設定するオプション型
- [`AgFormatFunction`](./AgFormatFunction.md) - ロガー関数にメッセージを渡すフォーマッター
- [`ConsoleLogger`](../plugins/ConsoleLogger.md) - 標準コンソールロガー実装
- [`NullLogger`](../plugins/NullLogger.md) - 無効化ロガー実装
