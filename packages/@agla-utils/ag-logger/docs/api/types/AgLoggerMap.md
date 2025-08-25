---
header:
  - src: AgLoggerMap.md
  - "@(#)": ログレベル別ロガーマッピング 型定義 APIリファレンス
title: AgLoggerMap
description: ログレベルごとに異なるロガー関数を指定するためのマッピング型のAPIリファレンス
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

## AgLoggerMap

### 概要

**AgLoggerMap**は、ログレベルごとに異なるロガー関数を指定するためのマッピング型です。各ログレベルに対して専用のロガー関数を設定することで、エラーはファイルに出力、致命的エラーは外部サービスに送信するなど、レベル別の柔軟な出力先制御が可能になります。

### 型定義

```typescript
export type AgLoggerMap<T extends AgLoggerFunction = AgLoggerFunction> = Record<AgLogLevel, T | null>;
```

#### ジェネリック型パラメータ

##### T

**型**: `T extends AgLoggerFunction = AgLoggerFunction`
**説明**: ロガー関数の型。デフォルトは `AgLoggerFunction` ですが、カスタムロガー型を指定できます。

### プロパティ

AgLoggerMapは以下のログレベルをキーとするレコード型です：

#### ログレベルキー

- `AG_LOGLEVEL.OFF` (0) - ログ無効化（通常は `null` を設定）
- `AG_LOGLEVEL.FATAL` (1) - 致命的エラー
- `AG_LOGLEVEL.ERROR` (2) - エラー
- `AG_LOGLEVEL.WARN` (3) - 警告
- `AG_LOGLEVEL.INFO` (4) - 情報
- `AG_LOGLEVEL.DEBUG` (5) - デバッグ
- `AG_LOGLEVEL.TRACE` (6) - トレース
- `AG_LOGLEVEL.VERBOSE` (-99) - 詳細出力
- `AG_LOGLEVEL.LOG` (99) - 汎用ログ

各キーの値は `T | null` 型で、ロガー関数または `null`（そのレベルでの出力無効化）を指定できます。

### 使用例

#### 基本的な使用方法

##### 完全なマッピング指定

```typescript
import { AG_LOGLEVEL, type AgLoggerMap, ConsoleLogger } from '@agla-utils/ag-logger';

const fullLoggerMap: AgLoggerMap = {
  [AG_LOGLEVEL.OFF]: null,
  [AG_LOGLEVEL.FATAL]: ConsoleLogger,
  [AG_LOGLEVEL.ERROR]: ConsoleLogger,
  [AG_LOGLEVEL.WARN]: ConsoleLogger,
  [AG_LOGLEVEL.INFO]: ConsoleLogger,
  [AG_LOGLEVEL.DEBUG]: ConsoleLogger,
  [AG_LOGLEVEL.TRACE]: ConsoleLogger,
  [AG_LOGLEVEL.VERBOSE]: ConsoleLogger,
  [AG_LOGLEVEL.LOG]: ConsoleLogger,
};
```

##### 部分的なオーバーライド（推奨）

```typescript
import { AG_LOGLEVEL, type AgLoggerOptions, ConsoleLogger } from '@agla-utils/ag-logger';

// カスタムロガー定義
const fileErrorLogger = (message: string) => {
  fs.appendFileSync('error.log', message + '\n');
};

const alertLogger = (message: string) => {
  // 外部監視システムに送信
  sendAlert(message);
};

const partialMap: Partial<AgLoggerMap> = {
  [AG_LOGLEVEL.ERROR]: fileErrorLogger, // エラーはファイルに記録
  [AG_LOGLEVEL.FATAL]: alertLogger, // 致命的エラーは外部通知
  // 他のレベルは defaultLogger を使用
};

const options: AgLoggerOptions = {
  defaultLogger: ConsoleLogger,
  loggerMap: partialMap,
};
```

#### 環境別設定例

```typescript
// 開発環境用：すべてコンソール出力
const devLoggerMap: Partial<AgLoggerMap> = {
  // defaultLogger (ConsoleLogger) をすべてのレベルで使用
};

// 本番環境用：重要度別に出力先を分離
const prodLoggerMap: Partial<AgLoggerMap> = {
  [AG_LOGLEVEL.FATAL]: (msg) => {
    sendToMonitoring(msg);
    fs.appendFileSync('fatal.log', msg + '\n');
  },
  [AG_LOGLEVEL.ERROR]: (msg) => fs.appendFileSync('error.log', msg + '\n'),
  [AG_LOGLEVEL.WARN]: (msg) => fs.appendFileSync('warn.log', msg + '\n'),
  // INFO以下は defaultLogger (ConsoleLogger) を使用
};

const options: AgLoggerOptions = {
  defaultLogger: ConsoleLogger,
  loggerMap: process.env.NODE_ENV === 'production' ? prodLoggerMap : devLoggerMap,
};
```

### 注意事項

#### デフォルト動作

- マップに含まれないレベルでは `NullLogger` が使用されます
- マップ内のLoggerが`NullLogger`のばあい、`defaultLogger`にフォールバックされます

#### パフォーマンス

- ログレベルフィルタリングは出力前に実行されるため、無効化されたレベルでのロガー呼び出しは発生しません
- ただし、メッセージ構築処理は実行されるため、重いメッセージ生成処理は避けてください

### 関連項目

- [`AgLoggerOptions`](./AgLoggerOptions.md) - AgLoggerMap を利用する設定オプション
- [`AgLoggerFunction`](./AgLoggerFunction.md) - マップの値として使用するロガー関数型
- [`AgLogLevel`](../constants/AgLogLevel.md) - マップのキーとして使用するログレベル定数
- [`AgLogger`](../classes/AgLogger.md) - AgLoggerMap を使用するメインクラス
