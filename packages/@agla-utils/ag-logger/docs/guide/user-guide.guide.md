---
header:
- src: user-guide.guide.md
- @(#): AgLogger ユーザーガイド
title: AgLogger ユーザーガイド
description: AgLoggerを簡単に使用できるようになるための包括的なユーザーガイド
version: 1.0.0
created: 2025-08-19
authors:
  - atsushifx
changes:
  - 2025-08-19: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

# AgLogger ユーザーガイド

AgLoggerは、TypeScript/JavaScript向けの強力で柔軟な構造化ログライブラリです。シングルトンパターンベースの設計により、アプリケーション全体で一貫したログ管理を提供します。

## クイックスタート

### 基本的な使用方法

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@agla-utils/ag-logger';

// ロガーの初期化
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

// ログの出力
logger.info('アプリケーションを開始します');
logger.warn('設定ファイルが見つかりません', { path: '/config/app.json' });
logger.error('データベース接続に失敗', { error: 'Connection timeout' });
```

### マネージャー経由での使用

```typescript
import { AgLoggerManager, getLogger } from '@agla-utils/ag-logger';

// マネージャーの作成と設定
AgLoggerManager.createManager({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});

// どこからでもロガーを取得
const logger = getLogger();
logger.info('マネージャー経由でのログ出力');
```

## コア概念

### ログレベル

AgLoggerは以下のログレベルをサポートしています：

| レベル | 値 | 用途                                   |
| ------ | -- | -------------------------------------- |
| OFF    | 0  | ログ出力なし                           |
| FATAL  | 1  | アプリケーション終了を伴う致命的エラー |
| ERROR  | 2  | アプリケーションを停止しないエラー     |
| WARN   | 3  | 潜在的に有害な状況の警告               |
| INFO   | 4  | 一般的な情報メッセージ                 |
| DEBUG  | 5  | デバッグ用の詳細情報                   |
| TRACE  | 6  | 非常に詳細なトレース情報               |

#### 特別なログレベル

- **VERBOSE** (-11): 詳細モード専用
- **LOG** (-12): 強制出力 (フィルタリングされない)

### フォーマッター

#### PlainFormatter

テキスト形式でログを出力します：

```typescript
import { PlainFormatter } from '@agla-utils/ag-logger';

// 出力例: 2025-08-19T10:30:45Z [INFO] Starting application
```

#### JsonFormatter

JSON形式でログを出力します：

```typescript
import { JsonFormatter } from '@agla-utils/ag-logger';

// 出力例: {"timestamp":"2025-08-19T10:30:45.123Z","level":"INFO","message":"Starting application"}
```

### ロガー

#### ConsoleLogger

標準のconsoleオブジェクトに出力します：

```typescript
import { ConsoleLogger } from '@agla-utils/ag-logger';

const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
});
```

#### MockLogger

テスト用のモックロガーです：

```typescript
import { MockLogger } from '@agla-utils/ag-logger';

const mockLogger = MockLogger.buffer;
const logger = AgLogger.createLogger({
  defaultLogger: mockLogger;
});

// ログ呼び出しの検証
expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(1)
```

## API リファレンス

### AgLogger クラス

#### メソッド

##### createLogger(options?: AgLoggerOptions): AgLogger

シングルトンインスタンスを作成または取得します。

```typescript
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.DEBUG,
  loggerMap: {
    [AG_LOGLEVEL.ERROR]: CustomErrorLogger,
  },
});
```

##### ログメソッド

各ログレベルに対応するメソッドを提供します：

```typescript
logger.fatal('致命的エラー');
logger.error('エラーメッセージ');
logger.warn('警告メッセージ');
logger.info('情報メッセージ');
logger.debug('デバッグ情報');
logger.trace('トレース情報');
logger.log('強制出力'); // フィルタリングされない
logger.verbose('詳細情報'); // verboseモード時のみ出力
```

##### setLoggerConfig(options: AgLoggerOptions): void

ロガーの設定を更新します：

```typescript
logger.setLoggerConfig({
  formatter: JsonFormatter,
  logLevel: AG_LOGLEVEL.WARN,
});
```

##### setLoggerFunction(logLevel: AgLogLevel, loggerFunction: AgLoggerFunction): boolean

特定のログレベルにカスタムロガー関数を設定します：

```typescript
logger.setLoggerFunction(AG_LOGLEVEL.ERROR, (message) => {
  // カスタムエラーログ処理
  sendToErrorService(message);
});
```

### AgLoggerManager クラス

#### メソッド

##### createManager(options?: AgLoggerOptions): AgLoggerManager

マネージャーのシングルトンインスタンスを作成します：

```typescript
const manager = AgLoggerManager.createManager({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});
```

##### getManager(): AgLoggerManager

既存のマネージャーインスタンスを取得します：

```typescript
const manager = AgLoggerManager.getManager();
```

##### getLogger(): AgLogger

管理されているAgLoggerインスタンスを取得します：

```typescript
const logger = manager.getLogger();
```

##### setLoggerConfig(options: AgLoggerOptions): void

ロガーの設定を更新します：

```typescript
manager.setLoggerConfig({
  logLevel: AG_LOGLEVEL.DEBUG,
  formatter: JsonFormatter,
});
```

## 設定オプション

### AgLoggerOptions

```typescript
interface AgLoggerOptions {
  defaultLogger?: AgLoggerFunction;
  formatter?: AgFormatFunction;
  logLevel?: AgLogLevel;
  loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>;
}
```

#### 例：完全な設定

```typescript
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
  loggerMap: {
    [AG_LOGLEVEL.ERROR]: CustomErrorLogger,
    [AG_LOGLEVEL.WARN]: CustomWarnLogger,
  },
});
```

## 高度な使用法

### カスタムフォーマッター

```typescript
import type { AgFormatFunction, AgLogMessage } from '@agla-utils/ag-logger';

const customFormatter: AgFormatFunction = (logMessage: AgLogMessage): string => {
  const { timestamp, logLevel, message, args } = logMessage;
  return `[${new Date(timestamp).toLocaleTimeString()}] ${message} ${JSON.stringify(args)}`;
};

logger.setFormatter(customFormatter);
```

### カスタムロガー

```typescript
import type { AgLoggerFunction } from '@agla-utils/ag-logger';

const fileLogger: AgLoggerFunction = (message: string) => {
  // ファイルへの書き込み処理
  fs.appendFileSync('/var/log/app.log', message + '\n');
};

logger.setLoggerFunction(AG_LOGLEVEL.ERROR, fileLogger);
```

### エラーハンドリング

AgLoggerは包括的なエラーハンドリングを提供します：

```typescript
import { AgLoggerError } from '@agla-utils/ag-logger';

try {
  const logger = AgLogger.getLogger(); // 初期化前に呼び出すとエラー
} catch (error) {
  if (error instanceof AgLoggerError) {
    console.error('ロガーエラー:', error.message);
    console.error('エラータイプ:', error.type);
  }
}
```

## 実践的な例

### Webアプリケーションでの使用

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, JsonFormatter } from '@agla-utils/ag-logger';

// アプリケーション初期化時
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: process.env.NODE_ENV === 'production' ? JsonFormatter : PlainFormatter,
  logLevel: process.env.NODE_ENV === 'production' ? AG_LOGLEVEL.WARN : AG_LOGLEVEL.DEBUG,
});

// APIリクエストハンドラー
app.get('/api/users', async (req, res) => {
  logger.info('ユーザー一覧取得開始', { userId: req.user?.id });

  try {
    const users = await userService.getAll();
    logger.debug('ユーザー取得成功', { count: users.length });
    res.json(users);
  } catch (error) {
    logger.error('ユーザー取得失敗', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

### テストでの使用

```typescript
import { AgLogger, createMockFormatter, MockLogger } from '@agla-utils/ag-logger';
import { beforeEach, describe, expect, it } from 'vitest';

describe('UserService', () => {
  let mockLogger: MockLogger;
  let logger: AgLogger;

  beforeEach(() => {
    mockLogger = new MockLogger();
    logger = AgLogger.createLogger({
      defaultLogger: mockLogger.logger,
      formatter: createMockFormatter(),
    });
  });

  it('ユーザー作成時にログが出力される', async () => {
    await userService.create({ name: 'John' });

    expect(mockLogger.hasBeenCalled('info')).toBe(true);
    expect(mockLogger.getCallCount('info')).toBe(1);
  });
});
```

### マイクロサービスでの使用

```typescript
import { AgLoggerManager, ConsoleLogger, getLogger, JsonFormatter } from '@agla-utils/ag-logger';

// サービス起動時の初期化
AgLoggerManager.createManager({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
});

// 各モジュールで使用
export class UserService {
  private logger = getLogger();

  async createUser(userData: CreateUserRequest) {
    this.logger.info('ユーザー作成開始', { email: userData.email });

    try {
      const user = await this.userRepository.create(userData);
      this.logger.info('ユーザー作成成功', { userId: user.id, email: user.email });
      return user;
    } catch (error) {
      this.logger.error('ユーザー作成失敗', {
        email: userData.email,
        error: error.message,
      });
      throw error;
    }
  }
}
```

## ベストプラクティス

### 1. 適切なログレベルの選択

```typescript
// ✅ 良い例
logger.debug('キャッシュヒット', { key: 'user:123' }); // デバッグ情報
logger.info('ユーザーログイン', { userId: user.id }); // 重要なビジネスイベント
logger.warn('レート制限に近づいています', { current: 95, limit: 100 }); // 注意が必要な状況
logger.error('外部API呼び出し失敗', { api: 'payment', error: error.message }); // エラー状況

// ❌ 悪い例
logger.error('ユーザーがボタンをクリック'); // エラーレベルの誤用
logger.debug('致命的なデータベースエラー'); // 重要度の過小評価
```

### 2. 構造化されたログデータ

```typescript
// ✅ 良い例
logger.info('注文処理完了', {
  orderId: order.id,
  userId: order.userId,
  amount: order.total,
  duration: Date.now() - startTime,
});

// ❌ 悪い例
logger.info(`注文${order.id}がユーザー${order.userId}によって${order.total}円で処理されました`);
```

### 3. パフォーマンスの考慮

```typescript
// ✅ 良い例：条件付きログ
if (logger.logLevel >= AG_LOGLEVEL.DEBUG) {
  const expensiveData = computeExpensiveDebugInfo();
  logger.debug('詳細デバッグ情報', expensiveData);
}

// ✅ 良い例：遅延評価
logger.debug('詳細情報', () => computeExpensiveDebugInfo());
```

### 4. センシティブ情報の保護

```typescript
// ✅ 良い例
logger.info('ユーザー認証成功', {
  userId: user.id,
  email: maskEmail(user.email),
});

// ❌ 悪い例
logger.info('ユーザー認証成功', {
  userId: user.id,
  email: user.email,
  password: user.password, // センシティブ情報を含む
});

function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  return `${username.slice(0, 2)}***@${domain}`;
}
```

### 5. エラーログの充実

```typescript
// ✅ 良い例
try {
  await processPayment(order);
} catch (error) {
  logger.error('決済処理エラー', {
    orderId: order.id,
    paymentMethod: order.paymentMethod,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  throw error;
}
```

## トラブルシューティング

### よくある問題

#### 1. "Logger not created" エラー

```typescript
// 問題: ロガーが初期化されていない
const logger = AgLogger.getLogger(); // AgLoggerError をスロー

// 解決策: 事前にロガーを作成
const logger = AgLogger.createLogger();
// または
AgLoggerManager.createManager();
const logger = getLogger();
```

#### 2. ログが出力されない

```typescript
// 問題: ログレベルが高すぎる
logger.logLevel = AG_LOGLEVEL.ERROR;
logger.info('この情報は出力されません'); // ERROR > INFO のため出力されない

// 解決策: 適切なログレベルを設定
logger.logLevel = AG_LOGLEVEL.INFO;
logger.info('この情報は出力されます');
```

#### 3. フォーマッターが反映されない

```typescript
// 問題: 設定後にフォーマッターが変更されない
const logger = AgLogger.createLogger();
logger.setFormatter(JsonFormatter); // 正しい設定方法

// または設定オブジェクトで指定
logger.setLoggerConfig({ formatter: JsonFormatter });
```

## まとめ

AgLoggerは、TypeScript/JavaScript アプリケーションで強力で柔軟なログ機能を提供します。シングルトンパターンによる一貫したログ管理、豊富なカスタマイゼーションオプション、包括的なテスト支援により、開発からプロダクションまでのあらゆる段階でアプリケーションの可観測性を向上させます。

このガイドを参考に、あなたのプロジェクトに最適なログ戦略を構築してください。
