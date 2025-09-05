---
header:
  - src: docs/api/AgLogger.md
  - @(#): AgLogger クラス APIリファレンス
title: AgLogger クラス
description: メインロガークラスの詳細なAPIリファレンス
version: 0.3.0
created: 2025-08-24
authors:
  - atsushifx
changes:
  - 2025-08-24: 初版作成
  - 2025-09-05: フロントマター標準化・見出し階層修正
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## AgLogger クラス

メインロガークラス。シングルトンパターンで実装された中心的なロギング機能を提供します。

## 概要

`AgLogger`は構造化ログ機能の中核となるクラスです。シングルトンパターンを採用し、アプリケーション全体で一貫したログ出力を提供します。

## 静的メソッド

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->

### createLogger(options?: AgLoggerOptions): AgLogger

AgLogger のシングルトンインスタンスを取得または作成します。オプションでロガーの設定を同時に行うことができます。

**パラメータ**:

- `options` (オプション): ロガーの設定オプション

**戻り値** AgLogger のシングルトンインスタンス:

例:

```typescript
// 基本的な使用方法
const logger = AgLogger.createLogger();

// 設定付きで作成
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.DEBUG,
});
```

### getLogger(): AgLogger

既存の AgLogger シングルトンインスタンスを取得します。インスタンスが作成されていない場合はエラーをスローします。

**戻り値** AgLogger のシングルトンインスタンス:

**例外**:

- `AgLoggerError` - インスタンスが作成されていない場合

例:

```typescript
const logger = AgLogger.getLogger();
```

### resetSingleton(): void

シングルトンインスタンスをリセットします。主にテスト目的で使用されます。

例:

```typescript
// テスト後のクリーンアップ
AgLogger.resetSingleton();
```

## インスタンスメソッド

### setLoggerConfig(options: AgLoggerOptions): void

ロガーを設定します。設定オプションには、ログレベル、ロガー関数、フォーマッター等が含まれます。

**パラメータ**:

- `options`: ロガーの設定オプション

**例外:**

- `AgLoggerError` - 設定が無効な場合

REI

```typescript
logger.setLoggerConfig({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
  logLevel: AG_LOGLEVEL.INFO,
  verbose: true,
});
```

### setLoggerFunction(logLevel: AgLogLevel, loggerFunction: AgLoggerFunction): boolean

特定のログレベルに対してカスタムロガー関数を設定します。

**パラメータ**:

- `logLevel`: ログレベル
- `loggerFunction`: ロガー関数

**戻り値** 設定が成功した場合は `true`

例:

```typescript
logger.setLoggerFunction(AG_LOGLEVEL.ERROR, ConsoleLogger);
```

### getLoggerFunction(logLevel: AgLogLevel): AgLoggerFunction

指定されたログレベルのロガー関数を取得します。

**パラメータ**:

- `logLevel`: ログレベル

**戻り値** ロガー関数:

例:

```typescript
const errorLogger = logger.getLoggerFunction(AG_LOGLEVEL.ERROR);
```

### setFormatter(formatter: AgFormatFunction): void

ログメッセージのフォーマッター関数を設定します。

**パラメータ**:

- `formatter`: フォーマッター関数

例:

```typescript
logger.setFormatter(JsonFormatter);
```

### getFormatter(): AgFormatFunction

現在のフォーマッター関数を取得します。

**戻り値** フォーマッター関数:

例:

```typescript
const currentFormatter = logger.getFormatter();
```

## プロパティ

### logLevel: AgLogLevel

現在のログレベルを取得または設定します。

例:

```typescript
// ログレベルを設定
logger.logLevel = AG_LOGLEVEL.DEBUG;

// ログレベルを取得
const currentLevel = logger.logLevel;
```

### isVerbose: boolean

詳細モードの状態を取得します。

例:

```typescript
if (logger.isVerbose) {
  console.log('詳細モードが有効です');
}
```

### setVerbose: boolean

詳細モードを設定します。

例:

```typescript
logger.setVerbose = true;
```

## ログ出力メソッド

### fatal(...args: unknown[]): void

FATAL レベルのログメッセージを出力します。

**パラメータ**:

- `...args`: ログ出力する引数

例:

```typescript
logger.fatal('致命的なエラーが発生しました', error);
```

### error(...args: unknown[]): void

ERROR レベルのログメッセージを出力します。

例:

```typescript
logger.error('エラーが発生しました', errorDetails);
```

### warn(...args: unknown[]): void

WARN レベルのログメッセージを出力します。

例:

```typescript
logger.warn('警告: 非推奨のメソッドが使用されています');
```

### info(...args: unknown[]): void

INFO レベルのログメッセージを出力します。

例:

```typescript
logger.info('処理が正常に完了しました');
```

### debug(...args: unknown[]): void

DEBUG レベルのログメッセージを出力します。

例:

```typescript
logger.debug('デバッグ情報', { userId: 123, action: 'login' });
```

### trace(...args: unknown[]): void

TRACE レベルのログメッセージを出力します。

例:

```typescript
logger.trace('関数呼び出し: calculateTotal', parameters);
```

### log(...args: unknown[]): void

LOG レベル（常に出力）のログメッセージを出力します。

例:

```typescript
logger.log('重要な情報（レベルフィルタを無視）');
```

### verbose(...args: unknown[]): void

VERBOSE レベル（詳細モード時のみ出力）のログメッセージを出力します。

例:

```typescript
logger.verbose('詳細な実行ログ', executionDetails);
```

## 統計機能

### getStatsFormatter(): AgMockFormatter | null

統計フォーマッターインスタンスを取得します。

**戻り値** AgMockFormatter インスタンスまたは `null`

### hasStatsFormatter(): boolean

統計フォーマッターが利用可能かどうかを確認します。

**戻り値** 統計フォーマッターが利用可能な場合は `true`

## 使用例

### 基本的な使用方法

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@agla-utils/ag-logger';

// ロガーの作成と設定
const logger = AgLogger.createLogger();
logger.setLoggerConfig({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

// ログ出力
logger.info('アプリケーションが開始されました');
logger.error('エラーが発生しました', error);
```

### 高度な設定

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, JsonFormatter } from '@agla-utils/ag-logger';

const logger = AgLogger.createLogger();
logger.setLoggerConfig({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
  logLevel: AG_LOGLEVEL.DEBUG,
  verbose: true,
});

// 詳細ログの出力
logger.verbose('詳細な処理情報', { step: 1, data: processData });
logger.debug('デバッグ情報', { trace: stackTrace });
```

### カスタムロガー関数の設定

```typescript
import { AG_LOGLEVEL, AgLogger } from '@agla-utils/ag-logger';

const logger = AgLogger.createLogger();

// エラーレベル専用のカスタムロガー
logger.setLoggerFunction(AG_LOGLEVEL.ERROR, (message: string) => {
  // カスタムエラーログ処理
  console.error(`[CUSTOM ERROR] ${message}`);
  // 外部ログサービスへの送信など
});

logger.error('カスタムロガーによるエラー出力');
```

<!-- textlint-enable -->

## 注意事項

- AgLogger はシングルトンパターンで実装されているため、アプリケーション全体で同じインスタンスが使用される
- 特殊ログレベル（VERBOSE、LOG、DEFAULT）は `logLevel` プロパティに設定できません
- 空文字列のメッセージやフォーマッターが空文字列を返した場合、ログは出力されません
- メソッドは自動的に `this` コンテキストにバインドされるため、メソッドを抽出して使用できる

## 関連項目

- [AgLoggerManager](./AgLoggerManager.md)
- [ログレベル](./types/LogLevel.md)
- [プラグイン](./plugins/README.md)
