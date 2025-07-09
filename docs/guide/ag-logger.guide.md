# @agla-utils/ag-logger 使用ガイド

## 概要

`@agla-utils/ag-logger`は、柔軟で拡張可能なログ出力機能を提供するTypeScriptライブラリです。AWS CloudWatch Logs準拠のログレベルを使用し、カスタムフォーマッターやロガーをサポートしています。

## 主要な特徴

- **AWS CloudWatch Logs準拠のログレベル**: OFF, FATAL, ERROR, WARN, INFO, DEBUG, TRACE
- **シングルトンパターン**: アプリケーション全体で一貫したログ設定
- **プラグイン式アーキテクチャ**: カスタムロガーとフォーマッターをサポート
- **柔軟な設定**: レベル別のロガー設定が可能
- **TypeScript完全対応**: 型安全性を保証

## インストール

```bash
# モノレポ内での使用
pnpm add @agla-utils/ag-logger
```

## 基本的な使用方法

### 1. 最小限の設定

```typescript
import { AgLogLevelCode, ConsoleLogger, getLogger, PlainFormat } from '@agla-utils/ag-logger';

// 基本的なロガーの取得
const logger = getLogger(ConsoleLogger, PlainFormat);

// ログレベルの設定
logger.setLogLevel(AgLogLevelCode.INFO);

// ログ出力
logger.info('アプリケーションが開始されました');
logger.error('エラーが発生しました', { errorCode: 500 });
```

### 2. シングルトンインスタンスの使用

```typescript
import { AgLogger, AgLogLevelCode, ConsoleLogger, PlainFormat } from '@agla-utils/ag-logger';

// シングルトンインスタンスの取得
const logger = AgLogger.getInstance(ConsoleLogger, PlainFormat);
logger.setLogLevel(AgLogLevelCode.DEBUG);

// どこからでも同じインスタンスを使用
const sameLogger = AgLogger.getInstance();
sameLogger.debug('デバッグメッセージ');
```

## ログレベル

### 利用可能なログレベル

| レベル | 値 | 説明               |
| ------ | -- | ------------------ |
| OFF    | 0  | ログ出力を無効化   |
| FATAL  | 1  | 致命的エラー       |
| ERROR  | 2  | エラー             |
| WARN   | 3  | 警告               |
| INFO   | 4  | 情報               |
| DEBUG  | 5  | デバッグ情報       |
| TRACE  | 6  | 詳細なトレース情報 |

### ログレベルの設定

```typescript
import { AgLogLevelCode } from '@agla-utils/ag-logger';

// 各ログレベルの設定例
logger.setLogLevel(AgLogLevelCode.OFF); // すべてのログを無効化
logger.setLogLevel(AgLogLevelCode.ERROR); // ERROR以上のみ出力
logger.setLogLevel(AgLogLevelCode.INFO); // INFO以上のみ出力
logger.setLogLevel(AgLogLevelCode.TRACE); // すべてのログを出力
```

## ログメソッド

### 基本的なログメソッド

```typescript
// 各ログレベルでの出力
logger.fatal('致命的エラー');
logger.error('エラーメッセージ');
logger.warn('警告メッセージ');
logger.info('情報メッセージ');
logger.debug('デバッグメッセージ');
logger.trace('トレースメッセージ');
logger.log('汎用ログ（INFOレベル）');
```

### 複数引数の使用

```typescript
// 文字列と構造化データの混合
logger.info('ユーザーがログインしました', { userId: 123, userName: 'taro' });

// 複数の値
logger.error('処理に失敗しました', 'エラーコード:', 500, { details: 'connection timeout' });

// タイムスタンプの指定
const customTime = new Date('2025-01-01T00:00:00Z');
logger.info(customTime, 'カスタムタイムスタンプ付きログ');
```

## フォーマッター

### PlainFormat（プレーンテキスト）

```typescript
import { PlainFormat } from '@agla-utils/ag-logger';

const logger = getLogger(ConsoleLogger, PlainFormat);
logger.info('テストメッセージ', { key: 'value' });
// 出力: 2025-01-09T10:30:45Z [INFO] テストメッセージ {"key":"value"}
```

### JsonFormat（JSON形式）

```typescript
import { JsonFormat } from '@agla-utils/ag-logger';

const logger = getLogger(ConsoleLogger, JsonFormat);
logger.info('テストメッセージ', { key: 'value' });
// 出力: {"logLevel":4,"timestamp":"2025-01-09T10:30:45.123Z","message":"テストメッセージ","args":[{"key":"value"}]}
```

### NullFormat（出力なし）

```typescript
import { NullFormat } from '@agla-utils/ag-logger';

const logger = getLogger(ConsoleLogger, NullFormat);
logger.info('このメッセージは出力されません');
// 出力: なし
```

## ロガー

### ConsoleLogger（コンソール出力）

```typescript
import { ConsoleLogger } from '@agla-utils/ag-logger';

// 基本的なConsoleLogger
const logger = getLogger(ConsoleLogger, PlainFormat);

// レベル別のconsoleメソッドを使用
// FATAL, ERROR -> console.error
// WARN -> console.warn
// INFO -> console.info
// DEBUG, TRACE -> console.debug
```

### NullLogger（出力なし）

```typescript
import { NullLogger } from '@agla-utils/ag-logger';

const logger = getLogger(NullLogger, PlainFormat);
logger.info('このメッセージは出力されません');
```

## 高度な設定

### レベル別ロガーの設定

```typescript
import { AgLogLevelCode } from '@agla-utils/ag-logger';

const logger = AgLogger.getInstance();

// レベル別に異なるロガーを設定
logger.setLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormat,
  loggerMap: {
    [AgLogLevelCode.ERROR]: (message) => {
      // エラーログは専用の処理
      console.error(`🚨 ${message}`);
    },
    [AgLogLevelCode.WARN]: (message) => {
      // 警告ログは専用の処理
      console.warn(`⚠️  ${message}`);
    },
    [AgLogLevelCode.INFO]: (message) => {
      // 情報ログは標準出力
      console.log(`ℹ️  ${message}`);
    },
  },
});
```

### カスタムフォーマッターの作成

```typescript
import type { AgFormatFunction } from '@agla-utils/ag-logger';

// カスタムフォーマッターの定義
const customFormatter: AgFormatFunction = (logMessage) => {
  const time = logMessage.timestamp.toLocaleTimeString();
  const level = logMessage.logLevel;
  const message = logMessage.message;
  return `[${time}] Level:${level} - ${message}`;
};

// カスタムフォーマッターの使用
const logger = getLogger(ConsoleLogger, customFormatter);
logger.info('カスタムフォーマットのログ');
// 出力: [10:30:45] Level:4 - カスタムフォーマットのログ
```

### カスタムロガーの作成

```typescript
import type { AgLoggerFunction } from '@agla-utils/ag-logger';

// ファイル出力用のカスタムロガー
const fileLogger: AgLoggerFunction = (formattedMessage) => {
  // 実際の実装ではfs.appendFileSync等を使用
  console.log(`[FILE] ${formattedMessage}`);
};

// カスタムロガーの使用
const logger = getLogger(fileLogger, PlainFormat);
logger.info('ファイルに出力されるログ');
```

## 実用的な使用例

### 1. エラーハンドリングでの使用

```typescript
import { AgLogLevelCode, ConsoleLogger, getLogger, PlainFormat } from '@agla-utils/ag-logger';

const logger = getLogger(ConsoleLogger, PlainFormat);
logger.setLogLevel(AgLogLevelCode.INFO);

export const errorExit = (code: number, message: string): never => {
  logger.error(`終了コード: ${code}`);
  logger.error(`メッセージ: ${message}`);

  // エラー詳細の構造化ログ
  logger.error('エラー詳細', {
    exitCode: code,
    errorMessage: message,
    timestamp: new Date().toISOString(),
    stack: new Error().stack,
  });

  throw new Error(message);
};
```

### 2. アプリケーション初期化での使用

```typescript
import { AgLogger, AgLogLevelCode, ConsoleLogger, PlainFormat } from '@agla-utils/ag-logger';

// アプリケーション初期化
export const initializeApp = () => {
  const logger = AgLogger.getInstance(ConsoleLogger, PlainFormat);

  // 開発環境とプロダクション環境での設定分岐
  if (process.env.NODE_ENV === 'development') {
    logger.setLogLevel(AgLogLevelCode.DEBUG);
  } else {
    logger.setLogLevel(AgLogLevelCode.INFO);
  }

  logger.info('アプリケーションを初期化しています...');

  // 設定情報のログ
  logger.debug('設定情報', {
    nodeEnv: process.env.NODE_ENV,
    logLevel: logger.getLogLevel(),
    timestamp: new Date().toISOString(),
  });

  logger.info('アプリケーションの初期化が完了しました');
};
```

### 3. 非同期処理でのログ出力

```typescript
import { AgLogLevelCode, ConsoleLogger, getLogger, JsonFormat } from '@agla-utils/ag-logger';

const logger = getLogger(ConsoleLogger, JsonFormat);
logger.setLogLevel(AgLogLevelCode.INFO);

export const processData = async (data: any[]) => {
  const startTime = Date.now();

  logger.info('データ処理を開始', {
    totalItems: data.length,
    startTime: new Date().toISOString(),
  });

  try {
    for (let i = 0; i < data.length; i++) {
      logger.debug(`アイテム ${i + 1}/${data.length} を処理中`);

      // 処理の実行
      await processItem(data[i]);

      // 進捗ログ
      if ((i + 1) % 100 === 0) {
        logger.info(`進捗: ${i + 1}/${data.length} 完了`);
      }
    }

    const processingTime = Date.now() - startTime;
    logger.info('データ処理が完了', {
      totalItems: data.length,
      processingTime: `${processingTime}ms`,
      averageTime: `${processingTime / data.length}ms/item`,
    });
  } catch (error) {
    logger.error('データ処理でエラーが発生', {
      error: error.message,
      stack: error.stack,
      processingTime: `${Date.now() - startTime}ms`,
    });
    throw error;
  }
};
```

## ベストプラクティス

### 1. ログレベルの適切な使用

```typescript
// ❌ 悪い例
logger.info('デバッグ用の変数値', { debugVar: someValue });

// ✅ 良い例
logger.debug('デバッグ用の変数値', { debugVar: someValue });
logger.info('ユーザー操作が完了しました', { userId: 123 });
logger.error('予期しないエラーが発生', { error: error.message });
```

### 2. 構造化ログの活用

```typescript
// ❌ 悪い例
logger.info(`ユーザー ${userId} がファイル ${filename} をアップロードしました`);

// ✅ 良い例
logger.info('ファイルアップロード完了', {
  userId,
  filename,
  fileSize: file.size,
  mimeType: file.type,
  timestamp: new Date().toISOString(),
});
```

### 3. 適切なログレベル設定

```typescript
// 環境に応じたログレベル設定
const getLogLevel = (): AgLogLevel => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return AgLogLevelCode.WARN;
    case 'staging':
      return AgLogLevelCode.INFO;
    case 'development':
      return AgLogLevelCode.DEBUG;
    case 'test':
      return AgLogLevelCode.ERROR;
    default:
      return AgLogLevelCode.INFO;
  }
};

logger.setLogLevel(getLogLevel());
```

## トラブルシューティング

### よくある問題と解決方法

1. **ログが出力されない**
   ```typescript
   // ログレベルを確認
   console.log('Current log level:', logger.getLogLevel());

   // OFFになっていないか確認
   if (logger.getLogLevel() === AgLogLevelCode.OFF) {
     logger.setLogLevel(AgLogLevelCode.INFO);
   }
   ```

2. **フォーマットが期待と異なる**
   ```typescript
   // 使用中のフォーマッターを確認
   // カスタムフォーマッターを作成して問題を特定
   const debugFormatter = (logMessage) => {
     console.log('LogMessage structure:', logMessage);
     return JSON.stringify(logMessage, null, 2);
   };
   ```

3. **パフォーマンスの問題**
   ```typescript
   // 本番環境では不要なログレベルを無効化
   logger.setLogLevel(AgLogLevelCode.WARN);

   // 重いオブジェクトのログ出力を避ける
   logger.debug('処理完了', { resultCount: results.length }); // ✅
   logger.debug('処理完了', { fullResults: results }); // ❌
   ```

## 型定義

### 主要な型

```typescript
// ログレベル
type AgLogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ログメッセージの構造
type AgLogMessage = {
  logLevel: AgLogLevel;
  timestamp: Date;
  message: string;
  args: unknown[];
};

// フォーマッター関数
type AgFormatFunction = (logMessage: AgLogMessage) => string;

// ロガー関数
type AgLoggerFunction = (formattedMessage: string) => void;

// ロガーマップ
type AgLoggerMap<T = AgLoggerFunction> = {
  [K in AgLogLevel]: T;
};
```

## まとめ

`@agla-utils/ag-logger`は、TypeScriptアプリケーションでの包括的なログ管理ソリューションを提供します。シングルトンパターンによる一貫した設定、プラグイン式のアーキテクチャ、AWS CloudWatch準拠のログレベルにより、スケーラブルで保守性の高いログ機能を実現できます。

適切なログレベルの設定と構造化ログの活用により、開発効率の向上とプロダクション環境での運用性向上を実現できます。
