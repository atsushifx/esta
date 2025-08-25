---
header:
  - src: AgLoggerManager.md
  - @(#): AgLoggerManager クラス APIリファレンス
title: AgLoggerManager クラス
description: AgLoggerインスタンス管理のためのマネージャークラスのAPIリファレンス
version: 0.3.0
created: 2025-08-24
authors:
  - atsushifx
changes:
  - 2025-08-24: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

# AgLoggerManager クラス

AgLoggerインスタンスを管理するためのマネージャークラス。

## 概要

`AgLoggerManager` はAgLoggerインスタンスの作成、設定、管理を行うクラスです。シングルトンパターンを採用し、アプリケーション全体でロガーの統一管理を提供します。

## 静的メソッド

### createManager(options?: AgLoggerOptions): AgLoggerManager

AgLoggerManagerのシングルトンインスタンスを取得または作成します。オプションでロガーの設定を同時に行うことができます。

**パラメータ:**

- `options` (オプション): ロガーマネージャーの設定オプション

**戻り値:** AgLoggerManagerのシングルトンインスタンス

**例:**

```typescript
import { AG_LOGLEVEL, AgLoggerManager, ConsoleLogger, PlainFormatter } from '@agla-utils/ag-logger';

// 基本的な使用方法
const manager = AgLoggerManager.createManager();

// 設定付きで作成
const manager = AgLoggerManager.createManager({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.DEBUG,
});
```

### getManager(): AgLoggerManager

既存のAgLoggerManagerシングルトンインスタンスを取得します。インスタンスが作成されていない場合はエラーをスローします。

**戻り値:** AgLoggerManagerのシングルトンインスタンス

**例外:**

- `AgLoggerError` - インスタンスが作成されていない場合

**例:**

```typescript
const manager = AgLoggerManager.getManager();
```

### resetSingleton(): void

シングルトンインスタンスをリセットし、管理下のロガーもリセットします。主にテスト目的で使用されます。

**例:**

```typescript
// テスト後のクリーンアップ
AgLoggerManager.resetSingleton();
```

## インスタンスメソッド

### getLogger(): AgLogger

管理下のAgLoggerインスタンスを取得します。

**戻り値:** 管理されているAgLoggerインスタンス

**例:**

```typescript
const manager = AgLoggerManager.createManager();
const logger = manager.getLogger();

logger.info('ログメッセージ');
```

### setLogger(logger: AgLogger): void

管理するAgLoggerインスタンスを設定します。

**パラメータ:**

- `logger`: 管理するAgLoggerインスタンス

**例:**

```typescript
const manager = AgLoggerManager.createManager();
const customLogger = AgLogger.createLogger();

manager.setLogger(customLogger);
```

### setLoggerConfig(options: AgLoggerOptions): void

管理下のロガーの設定を行います。内部のAgLoggerインスタンスに設定を適用します。

**パラメータ:**

- `options`: ロガーの設定オプション

**例:**

```typescript
const manager = AgLoggerManager.createManager();

manager.setLoggerConfig({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
  logLevel: AG_LOGLEVEL.INFO,
  verbose: true,
});
```

### bindLoggerFunction(logLevel: AgLogLevel, loggerFunction: AgLoggerFunction): boolean

特定のログレベルに対してロガー関数をバインドします。管理下のロガーに設定を適用します。

**パラメータ:**

- `logLevel`: ログレベル
- `loggerFunction`: ロガー関数

**戻り値:** バインドが成功した場合は `true`

**例:**

```typescript
const manager = AgLoggerManager.createManager();

manager.bindLoggerFunction(AG_LOGLEVEL.ERROR, ConsoleLogger);
```

### updateLoggerMap(loggerMap: AgLoggerFunctionMap): void

ロガーマップを更新します。複数のログレベルに対して一度に設定を適用できます。

**パラメータ:**

- `loggerMap`: ログレベルとロガー関数のマッピング

**例:**

```typescript
const manager = AgLoggerManager.createManager();

manager.updateLoggerMap({
  [AG_LOGLEVEL.ERROR]: ConsoleLogger,
  [AG_LOGLEVEL.WARN]: ConsoleLogger,
  [AG_LOGLEVEL.INFO]: ConsoleLogger,
});
```

### removeLoggerFunction(logLevel: AgLogLevel): boolean

特定のログレベルのロガー関数を削除します。

**パラメータ:**

- `logLevel`: 削除するログレベル

**戻り値:** 削除が成功した場合は `true`

**例:**

```typescript
const manager = AgLoggerManager.createManager();

manager.removeLoggerFunction(AG_LOGLEVEL.DEBUG);
```

## 使用例

### 基本的な使用方法

```typescript
import { AG_LOGLEVEL, AgLoggerManager, ConsoleLogger, PlainFormatter } from '@agla-utils/ag-logger';

// マネージャーの作成
const manager = AgLoggerManager.createManager();

// ロガーの設定
manager.setLoggerConfig({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

// ロガーの取得と使用
const logger = manager.getLogger();
logger.info('アプリケーションが開始されました');
```

### 複数のロガー関数の設定

```typescript
import { AG_LOGLEVEL, AgLoggerManager, ConsoleLogger } from '@agla-utils/ag-logger';

const manager = AgLoggerManager.createManager();

// 複数のログレベルに対してロガー関数を設定
manager.updateLoggerMap({
  [AG_LOGLEVEL.ERROR]: ConsoleLogger,
  [AG_LOGLEVEL.WARN]: ConsoleLogger,
  [AG_LOGLEVEL.INFO]: ConsoleLogger,
  [AG_LOGLEVEL.DEBUG]: ConsoleLogger,
});

const logger = manager.getLogger();
logger.error('エラーメッセージ');
logger.info('情報メッセージ');
```

### カスタムロガー関数のバインド

```typescript
import { AG_LOGLEVEL, AgLoggerManager } from '@agla-utils/ag-logger';

const manager = AgLoggerManager.createManager();

// カスタムロガー関数の作成とバインド
const customErrorLogger = (message: string) => {
  console.error(`[CUSTOM ERROR] ${message}`);
  // 外部ログサービスへの送信など
};

manager.bindLoggerFunction(AG_LOGLEVEL.ERROR, customErrorLogger);

const logger = manager.getLogger();
logger.error('カスタムロガーによるエラー出力');
```

### マネージャーの動的設定変更

```typescript
import { AG_LOGLEVEL, AgLoggerManager, JsonFormatter, PlainFormatter } from '@agla-utils/ag-logger';

const manager = AgLoggerManager.createManager();

// 初期設定
manager.setLoggerConfig({
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

const logger = manager.getLogger();
logger.info('プレーン形式のログ');

// 設定の動的変更
manager.setLoggerConfig({
  formatter: JsonFormatter,
  logLevel: AG_LOGLEVEL.DEBUG,
});

logger.debug('JSON形式のログ');
```

## 注意事項

- AgLoggerManagerはシングルトンパターンで実装されているため、アプリケーション全体で同じインスタンスが使用されます
- 管理下のロガーは単一のAgLoggerインスタンスであり、マネージャーを通じて設定が適用されます
- `resetSingleton()` を呼び出すと、マネージャーと管理下のロガーの両方がリセットされます
- マネージャーが作成されていない状態で `getManager()` を呼び出すとエラーがスローされます

## 関連項目

- [AgLogger](./AgLogger.md)
- [AgManagerUtils](./utils/AgManagerUtils.md)
- [プラグイン](./plugins/README.md)
