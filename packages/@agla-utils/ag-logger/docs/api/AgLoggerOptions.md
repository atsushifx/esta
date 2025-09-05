---
header:
  - src: docs/api/AgLoggerOptions.md
  - "@(#)": AgLoggerOptions設定オプション APIリファレンス
title: AgLoggerOptions
description: AgLoggerOptionsはAgLoggerの初期化設定を定義するTypeScript型で、ログ出力先、フォーマッター、ログレベル、詳細モード、ロガーマップの設定ができます
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

## 概要

**AgLoggerOptions**は、[`AgLogger`](./AgLogger.md)の初期化時に使用される設定オプションを定義する TypeScript 型です。ログ出力先の設定、フォーマッター、ログレベル、詳細モード、ロガーマップを設定できます。

## 型定義

```typescript
export type AgLoggerOptions = {
  defaultLogger?: AgLoggerFunction;
  formatter?: AgFormatterInput;
  logLevel?: AgLogLevel;
  verbose?: boolean;
  loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>;
};
```

## プロパティ

### defaultLogger

- 型: `AgLoggerFunction | undefined`
- デフォルト値: `NullLogger`
- 説明: メインのログ出力先を指定。プラグインとして提供される各種ロガー（ConsoleLogger、MockLogger 等）を設定できる

### formatter

- 型: `AgFormatterInput | undefined`
- デフォルト値: `NullFormatter`
- 説明: ログメッセージのフォーマット処理を行うフォーマッターを指定。PlainFormatter (プレーンテキスト) や JsonFormatter (JSON 形式) 等が利用可能

### logLevel

- 型: `AgLogLevel | undefined`
- デフォルト値: `AG_LOGLEVEL.OFF`
- 説明: ログ出力の最小レベルを設定。指定されたレベル以上のログのみが出力される。有効な値は`FATAL`、`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`

### verbose

- 型: `boolean | undefined`
- デフォルト値: `false`
- 説明: 詳細モードの有効/無効を設定。`true`に設定すると、より詳細なログ情報が出力される

### loggerMap

- 型: `Partial<AgLoggerMap<AgLoggerFunction>> | undefined`
- デフォルト値: `{}`（空のオブジェクト）
- 説明: ログレベルごとに異なるロガーを指定するためのマッピング設定。特定のレベルのログを別の出力先に送信できる

## 使用例

### 基本的な設定

```typescript
import {
  AG_LOGLEVEL,
  ConsoleLogger,
  createManager,
  getLogger,
  PlainFormatter,
} from '@agla-utils/ag-logger';

// AgLogger管理用マネージャーでオプションを設定する
createManager({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

// 指定されたOptionのloggerを取得
const logger = getLogger();

logger.info('起動しました');
logger.warn('設定が見つかりませんでした', { fallback: true });
logger.error('処理に失敗しました', { code: 'E_FAIL', retryable: false });
```

### JSON形式での出力設定

```typescript
import {
  AG_LOGLEVEL,
  ConsoleLogger,
  createManager,
  getLogger,
  JsonFormatter,
} from '@agla-utils/ag-logger';

// AgLogger管理用マネージャーでオプションを設定する
createManager({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
  logLevel: AG_LOGLEVEL.DEBUG,
});

// 指定されたOptionのloggerを取得
const logger = getLogger();

logger.debug('ユーザー取得', { userId: 42 });
logger.info('完了', { durationMs: 123 });
```

## デフォルト値について

AgLoggerOptions の各プロパティは省略可能で、未指定の場合は以下のデフォルト値が適用される。

- 安全側の設定: すべてのデフォルト値は安全側に設定されており、何も指定しない場合はログが出力されません
- NullLogger: デフォルトロガーは何も出力しない NullLogger が設定される
- NullFormatter: デフォルトフォーマッターは何も処理しない NullFormatter が設定される
- AG_LOGLEVEL.OFF: デフォルトログレベルは OFF に設定され、すべてのログが無効化される

## 関連項目

- [`AgLogger`](./AgLogger.md) - メインのロガークラス
- [`AgLoggerMap`](./AgLoggerMap.md) - ログレベル別ロガーマッピング型定義
- [`AgLoggerManager`](./AgLoggerManager.md) - ロガー管理クラス
- [`AgLogLevel`](./AgLogLevel.md) - ログレベル定数と型定義
