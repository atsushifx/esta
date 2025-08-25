---
header:
  - src: AgLoggerInterface.md
  - "@(#)": ログ出力基本インターフェース APIリファレンス
title: AgLoggerInterface
description: ログ出力メソッドの標準インターフェース定義のAPIリファレンス
version: 0.3.0
created: 2025-08-25
authors:
  - atsushifx
changes:
  - 2025-08-25: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## AgLoggerInterface

### 概要

**AgLoggerInterface**は、ログ出力メソッドの標準インターフェースを定義するTypeScript型です。このインターフェースを実装することで、コンソール出力、ファイル出力、テスト用モックなど、さまざまなログ出力先に対応したロガーを作成できます。8つのログレベル(fatal, error, warn, info, debug, trace, verbose, log) に対応したメソッドを提供します。

### インターフェース定義

```typescript
export type AgLoggerInterface = {
  /** Log a fatal error message */
  fatal(message: string | AgLogMessage): void;
  /** Log an error message */
  error(message: string | AgLogMessage): void;
  /** Log a warning message */
  warn(message: string | AgLogMessage): void;
  /** Log an informational message */
  info(message: string | AgLogMessage): void;
  /** Log a debug message */
  debug(message: string | AgLogMessage): void;
  /** Log a trace message */
  trace(message: string | AgLogMessage): void;
  /** Log a verbose message */
  verbose(message: string | AgLogMessage): void;
  /** Log a general message */
  log(message: string | AgLogMessage): void;
};
```

### メソッド詳細

#### fatal(message)

**用途**: 致命的エラーの記録 (アプリケーション終了レベル)
**ログレベル**: `AG_LOGLEVEL.FATAL` (1)
**パラメータ**: `message: string | AgLogMessage` - ログメッセージまたはログオブジェクト

#### error(message)

**用途**: エラーの記録 (回復可能なエラー)
**ログレベル**: `AG_LOGLEVEL.ERROR` (2)
**パラメータ**: `message: string | AgLogMessage` - ログメッセージまたはログオブジェクト

#### warn(message)

**用途**: 警告メッセージの記録 (注意が必要な状況)
**ログレベル**: `AG_LOGLEVEL.WARN` (3)
**パラメータ**: `message: string | AgLogMessage` - ログメッセージまたはログオブジェクト

#### info(message)

**用途**: 情報メッセージの記録 (一般的な動作状況)
**ログレベル**: `AG_LOGLEVEL.INFO` (4)
**パラメータ**: `message: string | AgLogMessage` - ログメッセージまたはログオブジェクト

#### debug(message)

**用途**: デバッグ情報の記録 (開発時のデバッグ用)
**ログレベル**: `AG_LOGLEVEL.DEBUG` (5)
**パラメータ**: `message: string | AgLogMessage` - ログメッセージまたはログオブジェクト

#### trace(message)

**用途**: トレース情報の記録 (詳細な実行経路追跡)
**ログレベル**: `AG_LOGLEVEL.TRACE` (6)
**パラメータ**: `message: string | AgLogMessage` - ログメッセージまたはログオブジェクト

#### verbose(message)

**用途**: 詳細情報の記録 (verboseモード時のみ有効)
**ログレベル**: `AG_LOGLEVEL.VERBOSE` (-99)
**パラメータ**: `message: string | AgLogMessage` - ログメッセージまたはログオブジェクト

#### log(message)

**用途**: 汎用ログメッセージの記録 (特別なレベル指定)
**ログレベル**: `AG_LOGLEVEL.LOG` (99)
**パラメータ**: `message: string | AgLogMessage` - ログメッセージまたはログオブジェクト

### 使用例

#### 基本的な実装例

```typescript
import type { AgLoggerInterface, AgLogMessage } from '@agla-utils/ag-logger';

class ConsoleLogger implements AgLoggerInterface {
  fatal(message: string | AgLogMessage): void {
    console.error(`[FATAL] ${message}`);
  }

  error(message: string | AgLogMessage): void {
    console.error(`[ERROR] ${message}`);
  }

  warn(message: string | AgLogMessage): void {
    console.warn(`[WARN] ${message}`);
  }

  info(message: string | AgLogMessage): void {
    console.info(`[INFO] ${message}`);
  }

  debug(message: string | AgLogMessage): void {
    console.debug(`[DEBUG] ${message}`);
  }

  trace(message: string | AgLogMessage): void {
    console.debug(`[TRACE] ${message}`);
  }

  verbose(message: string | AgLogMessage): void {
    console.debug(`[VERBOSE] ${message}`);
  }

  log(message: string | AgLogMessage): void {
    console.log(`[LOG] ${message}`);
  }
}
```

#### ファイル出力ロガーの実装

```typescript
import type { AgLoggerInterface, AgLogMessage } from '@agla-utils/ag-logger';
import fs from 'fs';

class FileLogger implements AgLoggerInterface {
  constructor(private logFilePath: string) {}

  private writeToFile(level: string, message: string | AgLogMessage): void {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [${level}] ${message}\n`;
    fs.appendFileSync(this.logFilePath, logEntry);
  }

  fatal(message: string | AgLogMessage): void {
    this.writeToFile('FATAL', message);
  }

  error(message: string | AgLogMessage): void {
    this.writeToFile('ERROR', message);
  }

  warn(message: string | AgLogMessage): void {
    this.writeToFile('WARN', message);
  }

  info(message: string | AgLogMessage): void {
    this.writeToFile('INFO', message);
  }

  debug(message: string | AgLogMessage): void {
    this.writeToFile('DEBUG', message);
  }

  trace(message: string | AgLogMessage): void {
    this.writeToFile('TRACE', message);
  }

  verbose(message: string | AgLogMessage): void {
    this.writeToFile('VERBOSE', message);
  }

  log(message: string | AgLogMessage): void {
    this.writeToFile('LOG', message);
  }
}
```

#### テスト用モックロガーの実装

```typescript
import type { AgLoggerInterface, AgLogMessage } from '@agla-utils/ag-logger';

class MockLogger implements AgLoggerInterface {
  private messages: Array<{ level: string; message: string | AgLogMessage }> = [];

  // ログメッセージを収集
  private capture(level: string, message: string | AgLogMessage): void {
    this.messages.push({ level, message });
  }

  // テスト用のメッセージ検証メソッド
  getMessages(): Array<{ level: string; message: string | AgLogMessage }> {
    return [...this.messages];
  }

  hasMessage(level: string, messagePattern: string): boolean {
    return this.messages.some(
      (msg) => msg.level === level && String(msg.message).includes(messagePattern),
    );
  }

  clearMessages(): void {
    this.messages.length = 0;
  }

  // AgLoggerInterface 実装
  fatal(message: string | AgLogMessage): void {
    this.capture('FATAL', message);
  }

  error(message: string | AgLogMessage): void {
    this.capture('ERROR', message);
  }

  warn(message: string | AgLogMessage): void {
    this.capture('WARN', message);
  }

  info(message: string | AgLogMessage): void {
    this.capture('INFO', message);
  }

  debug(message: string | AgLogMessage): void {
    this.capture('DEBUG', message);
  }

  trace(message: string | AgLogMessage): void {
    this.capture('TRACE', message);
  }

  verbose(message: string | AgLogMessage): void {
    this.capture('VERBOSE', message);
  }

  log(message: string | AgLogMessage): void {
    this.capture('LOG', message);
  }
}

// テストでの使用例
describe('Logger Test', () => {
  const mockLogger = new MockLogger();

  it('should capture error messages', () => {
    mockLogger.error('Test error message');

    expect(mockLogger.hasMessage('ERROR', 'Test error')).toBe(true);
    expect(mockLogger.getMessages()).toHaveLength(1);
  });
});
```

### 注意事項

#### メッセージ型

- パラメータは `string | AgLogMessage` 型を受け入れる必要があります
- `AgLogMessage` オブジェクトの場合、適切にシリアライズして出力してください

#### パフォーマンス

- ログ出力処理は同期的に実行されます
- ファイル出力など重い処理を行う場合は、非同期処理やバッファリングを検討してください
- メッセージ構築処理は必要時のみ実行するよう注意してください

#### エラーハンドリング

- ログ出力自体がエラーを発生させないよう適切な例外処理を実装してください
- 出力先が利用できない場合の代替処理を検討してください

### 関連項目

- [`AgLogMessage`](./AgLogMessage.md) - ログメッセージオブジェクト型
- [`AgLoggerFunction`](./AgLoggerFunction.md) - ロガー関数型
- [`AgLoggerMap`](./AgLoggerMap.md) - ロガーマッピング型
- [`AgLogger`](../classes/AgLogger.md) - メインロガークラス
- [コンソールロガー](../plugins/ConsoleLogger.md) - 標準実装例
