---
header:
  - src: AgManagerUtils.md
  - @(#): AgManagerUtils ユーティリティ APIリファレンス
title: AgManagerUtils
description: AgLoggerManagerの便利なユーティリティ関数群のAPIリファレンス
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

# AgManagerUtils

AgLoggerManagerの便利なユーティリティ関数群。

## 概要

`AgManagerUtils` はAgLoggerManagerとAgLoggerの作成・取得・管理を簡素化するためのユーティリティ関数群です。これらの関数を使用することで、より簡潔にロガーの操作を行うことができます。

## 変数

### AgManager: AgLoggerManager | undefined

現在アクティブなAgLoggerManagerインスタンスを保持する変数。内部的に管理され、自動的に更新されます。

## 関数

### createManager(options?: AgLoggerOptions): AgLoggerManager

AgLoggerManagerのインスタンスを作成し、グローバルなAgManager変数に設定します。

**パラメータ:**

- `options` (オプション): ロガーマネージャーの設定オプション

**戻り値:** 作成されたAgLoggerManagerインスタンス

**例:**

```typescript
import { AG_LOGLEVEL, ConsoleLogger, createManager, PlainFormatter } from '@agla-utils/ag-logger';

// 基本的な使用方法
const manager = createManager();

// 設定付きで作成
const manager = createManager({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
  verbose: true,
});
```

### getLogger(): AgLogger

現在アクティブなAgLoggerインスタンスを取得します。AgManagerが未初期化の場合は、既存のAgLoggerManagerから取得を試みます。

**戻り値:** AgLoggerインスタンス

**例外:**

- `AgLoggerError` - ロガーが作成されていない場合

**例:**

```typescript
import { getLogger } from '@agla-utils/ag-logger';

// ロガーを取得
const logger = getLogger();

// ログ出力
logger.info('ユーティリティ経由でのログ出力');
logger.error('エラーが発生しました');
```

### setupManager(): void

AgLoggerManagerのメソッドを拡張して、AgManager変数の自動管理を設定します。このセットアップにより、AgLoggerManagerの作成やリセット時にAgManager変数が自動的に更新されます。

**注意:** この関数はモジュール読み込み時に自動的に実行されるため、通常は手動で呼び出す必要はありません。

**例:**

```typescript
import { setupManager } from '@agla-utils/ag-logger';

// 手動でセットアップを実行（通常は不要）
setupManager();
```

## 使用例

### 基本的な使用方法

```typescript
import { AG_LOGLEVEL, ConsoleLogger, createManager, getLogger, PlainFormatter } from '@agla-utils/ag-logger';

// マネージャーの作成
const manager = createManager({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

// ロガーの取得と使用
const logger = getLogger();
logger.info('アプリケーションが開始されました');
```

### 簡潔なロガー操作

```typescript
import { AG_LOGLEVEL, createManager, getLogger } from '@agla-utils/ag-logger';

// 設定とロガー取得を一度に
createManager({ logLevel: AG_LOGLEVEL.DEBUG, verbose: true });
const logger = getLogger();

// すぐに使用開始
logger.debug('デバッグモードが有効です');
logger.verbose('詳細な処理情報', { step: 1 });
```

### 複数箇所からのロガー取得

```typescript
// ファイル1: 初期化
import { AG_LOGLEVEL, ConsoleLogger, createManager } from '@agla-utils/ag-logger';

createManager({
  defaultLogger: ConsoleLogger,
  logLevel: AG_LOGLEVEL.INFO,
});

// ファイル2: 使用
import { getLogger } from '@agla-utils/ag-logger';

const logger = getLogger();
logger.info('別ファイルからのログ出力');

// ファイル3: 使用
import { getLogger } from '@agla-utils/ag-logger';

const logger = getLogger();
logger.error('エラーが発生しました');
```

### AgLoggerManagerと併用

```typescript
import {
  AG_LOGLEVEL,
  AgLoggerManager,
  ConsoleLogger,
  createManager,
  getLogger,
} from '@agla-utils/ag-logger';

// ユーティリティ経由で作成
const utilManager = createManager({
  defaultLogger: ConsoleLogger,
  logLevel: AG_LOGLEVEL.DEBUG,
});

// 直接AgLoggerManagerからも取得可能
const directManager = AgLoggerManager.getManager();

// 同じインスタンスを参照している
console.log(utilManager === directManager); // true

// どちらの方法でもロガーは取得可能
const logger1 = getLogger();
const logger2 = directManager.getLogger();
console.log(logger1 === logger2); // true
```

### エラーハンドリング

```typescript
import { getLogger } from '@agla-utils/ag-logger';

try {
  // マネージャーが初期化されていない場合
  const logger = getLogger();
  logger.info('ログメッセージ');
} catch (error) {
  console.error('ロガーの初期化が必要です:', error.message);
  
  // 初期化してから再試行
  import { createManager } from '@agla-utils/ag-logger';
  createManager();
  const logger = getLogger();
  logger.info('初期化後のログメッセージ');
}
```

## 利点

- **簡潔性**: AgLoggerManagerの直接操作よりも簡潔な記述が可能
- **一元管理**: グローバルなAgManager変数による統一された管理
- **利便性**: どこからでも`getLogger()`でロガーにアクセス可能
- **自動同期**: AgLoggerManagerの操作と自動的に同期される

## 注意事項

- `setupManager()`はモジュール読み込み時に自動実行されるため、手動実行は通常不要です
- `AgManager`変数は内部管理用のため、直接操作は推奨されません
- エラー時は適切な例外処理を行ってください
- マルチインスタンス環境では、最後に作成されたマネージャーが優先されます

## 関連項目

- [AgLogger](./AgLogger.md)
- [AgLoggerManager](./AgLoggerManager.md)
- [ログレベル](./types/LogLevel.md)
