# @agla-utils/ag-logger 使用ガイド

## 概要

`@agla-utils/ag-logger`は、柔軟で拡張可能なログ出力機能を提供する TypeScript ライブラリです。AWS CloudWatch Logs 準拠のログレベルを使用し、カスタムフォーマッターやロガーをサポートしています。

## 主要な特徴

<!-- textlint-disable ja-technical-writing/max-comma -->

- AWS CloudWatch Logs 準拠のログレベル: OFF, FATAL, ERROR, WARN, INFO, DEBUG, TRACE
- シングルトンパターン: アプリケーション全体で一貫したログ設定
- プラグイン式アーキテクチャ: カスタムロガーとフォーマッターをサポート
- 柔軟な設定: レベル別のロガー設定が可能
- TypeScript 完全対応: 型安全性を保証

<!-- textlint-enable -->

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
   logger.debug('処理完了', { resultCount: results.length });
   logger.debug('処理完了', { fullResults: results });
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

## E2Eテストでの使用

### E2eMockLoggerを使ったテスト

`E2eMockLogger`を使用することで、実際のコードに埋め込まれたログメッセージをテストで検証できます。

```typescript
import { AgLogLevelCode, E2eMockLogger, getLogger, PlainFormat } from '@agla-utils/ag-logger';
import { beforeEach, describe, expect, it } from 'vitest';

// テスト対象のクラス
class UserService {
  private logger = getLogger(ConsoleLogger, PlainFormat);

  async createUser(userData: any) {
    this.logger.info('ユーザー作成を開始');

    if (!userData.email) {
      this.logger.error('メールアドレスが必要です');
      throw new Error('Invalid email');
    }

    this.logger.debug('ユーザーデータを検証中', { userId: userData.id });
    this.logger.info('ユーザー作成が完了', { userId: userData.id });

    return { id: userData.id, email: userData.email };
  }
}

describe('UserService', () => {
  let mockLogger: E2eMockLogger;
  let userService: UserService;

  beforeEach(() => {
    mockLogger = new E2eMockLogger();

    // テスト対象のコードでE2eMockLoggerを使用
    userService = new UserService();
    userService['logger'] = getLogger(mockLogger, PlainFormat);
  });

  it('正常なユーザー作成時に適切なログが出力される', async () => {
    const userData = { id: '123', email: 'test@example.com' };

    const result = await userService.createUser(userData);

    expect(result).toEqual({ id: '123', email: 'test@example.com' });

    // ログメッセージの検証
    const infoMessages = mockLogger.getMessages(AgLogLevelCode.INFO);
    expect(infoMessages).toContain('ユーザー作成を開始');
    expect(infoMessages).toContain('ユーザー作成が完了 {"userId":"123"}');

    const debugMessages = mockLogger.getMessages(AgLogLevelCode.DEBUG);
    expect(debugMessages).toContain('ユーザーデータを検証中 {"userId":"123"}');
  });

  it('メールアドレスが無い場合にエラーログが出力される', async () => {
    const userData = { id: '123' };

    await expect(userService.createUser(userData)).rejects.toThrow('Invalid email');

    // エラーログの検証
    const errorMessages = mockLogger.getMessages(AgLogLevelCode.ERROR);
    expect(errorMessages).toContain('メールアドレスが必要です');

    // 情報ログは開始メッセージのみ
    const infoMessages = mockLogger.getMessages(AgLogLevelCode.INFO);
    expect(infoMessages).toContain('ユーザー作成を開始');
    expect(infoMessages).not.toContain('ユーザー作成が完了');
  });
});
```

### 依存性注入を使った方法

より柔軟なテストのために、依存性注入を使用できます。

```typescript
import { AgLogger } from '@agla-utils/ag-logger';

class DataProcessor {
  constructor(private logger: AgLogger) {}

  async process(data: any[]) {
    this.logger.info(`処理開始: ${data.length}件のデータ`);

    try {
      const results = [];
      for (const item of data) {
        this.logger.debug('データ処理中', { itemId: item.id });
        results.push(await this.processItem(item));
      }

      this.logger.info('処理完了', { processedCount: results.length });
      return results;
    } catch (error) {
      this.logger.error('処理中にエラーが発生', { error: error.message });
      throw error;
    }
  }

  private async processItem(item: any) {
    // 処理の実装
    return { ...item, processed: true };
  }
}

describe('DataProcessor', () => {
  let mockLogger: E2eMockLogger;
  let processor: DataProcessor;

  beforeEach(() => {
    mockLogger = new E2eMockLogger();
    const logger = getLogger(mockLogger, PlainFormat);
    processor = new DataProcessor(logger);
  });

  it('データ処理の進捗ログが正しく出力される', async () => {
    const testData = [
      { id: '1', name: 'item1' },
      { id: '2', name: 'item2' },
    ];

    const results = await processor.process(testData);

    expect(results).toHaveLength(2);

    // 情報ログの検証
    const infoMessages = mockLogger.getMessages(AgLogLevelCode.INFO);
    expect(infoMessages).toContain('処理開始: 2件のデータ');
    expect(infoMessages).toContain('処理完了 {"processedCount":2}');

    // デバッグログの検証
    const debugMessages = mockLogger.getMessages(AgLogLevelCode.DEBUG);
    expect(debugMessages).toContain('データ処理中 {"itemId":"1"}');
    expect(debugMessages).toContain('データ処理中 {"itemId":"2"}');
  });
});
```

### シングルトンパターンでのテスト

AgLogger のシングルトンパターンを使用している場合:

```typescript
import { AgLogger } from '@agla-utils/ag-logger';

class ApplicationService {
  private logger = AgLogger.getInstance();

  initialize() {
    this.logger.info('アプリケーション初期化開始');
    // 初期化処理
    this.logger.info('アプリケーション初期化完了');
  }
}

describe('ApplicationService', () => {
  let mockLogger: E2eMockLogger;
  let service: ApplicationService;

  beforeEach(() => {
    mockLogger = new E2eMockLogger();

    // シングルトンインスタンスにE2eMockLoggerを設定
    AgLogger.getInstance(mockLogger, PlainFormat);
    service = new ApplicationService();
  });

  it('アプリケーション初期化時にログが出力される', () => {
    service.initialize();

    const infoMessages = mockLogger.getMessages(AgLogLevelCode.INFO);
    expect(infoMessages).toContain('アプリケーション初期化開始');
    expect(infoMessages).toContain('アプリケーション初期化完了');
  });
});
```

### TDD（テスト駆動開発）での活用

```typescript
// 1. Red: 失敗するテストを書く
describe('ファイル処理サービス', () => {
  it('ファイルが存在しない場合にエラーログを出力する', async () => {
    const mockLogger = new E2eMockLogger();
    const logger = getLogger(mockLogger, PlainFormat);
    const fileService = new FileService(logger);

    await expect(fileService.readFile('nonexistent.txt')).rejects.toThrow();

    expect(mockLogger.getLastMessage(AgLogLevelCode.ERROR))
      .toBe('ファイルが見つかりません: nonexistent.txt');
  });
});

// 2. Green: 最小限の実装
class FileService {
  constructor(private logger: AgLogger) {}

  async readFile(filename: string) {
    this.logger.error(`ファイルが見つかりません: ${filename}`);
    throw new Error('File not found');
  }
}

// 3. Refactor: 実装を改善
class FileService {
  constructor(private logger: AgLogger) {}

  async readFile(filename: string) {
    this.logger.debug('ファイル読み込み開始', { filename });

    if (!fs.existsSync(filename)) {
      this.logger.error(`ファイルが見つかりません: ${filename}`);
      throw new Error('File not found');
    }

    const content = await fs.readFile(filename, 'utf8');
    this.logger.info('ファイル読み込み完了', { filename, size: content.length });
    return content;
  }
}
```

## まとめ

`@agla-utils/ag-logger`は、TypeScript アプリケーションでの包括的なログ管理ソリューションを提供します。シングルトンパターンによる一貫した設定、プラグイン式のアーキテクチャ、AWS CloudWatch 準拠のログレベルにより、スケーラブルで保守性の高いログ機能を実現できます。

`E2eMockLogger`を`getLogger`と組み合わせることで、実際のコードに埋め込まれたログメッセージを効率的にテストできます。これにより、TDD 手法に基づいた開発が可能になり、ログ出力の検証を通じてアプリケーションの品質向上を図ることができます。

ログレベルの設定と構造化ログの活用により、開発効率の向上とプロダクション環境での運用性向上を実現できます。
