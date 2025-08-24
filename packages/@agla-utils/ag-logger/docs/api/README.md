---
header:
  - src: README.md
  - @(#): AgLogger API リファレンス
title: AgLogger API リファレンス
description: AgLogger構造化ログライブラリの包括的なAPIリファレンス
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

# AgLogger API リファレンス

AgLoggerは構造化ログ機能を提供するTypeScriptライブラリです。複数の出力フォーマットとプラグイン可能なロガー/フォーマッターアーキテクチャを特徴としています。

## 目次

- [メイン](#メイン)
- [プラグイン](#プラグイン)
- [型定義](#型定義)
- [ユーティリティ](#ユーティリティ)

## メイン

### [AgLogger](./AgLogger.md)

メインロガークラス。シングルトンパターンで実装された中心的なロギング機能を提供します。

### [AgLoggerManager](./AgLoggerManager.md)

AgLoggerインスタンスを管理するためのマネージャークラス。

### [AgManagerUtils](./AgManagerUtils.md)

AgLoggerManagerの便利なユーティリティ関数群。簡潔なロガー操作を提供します。

## プラグイン

### ロガープラグイン

- **[ConsoleLogger](./plugins/loggers/ConsoleLogger.md)** - コンソール出力用のロガー
- **[E2eMockLogger](./plugins/loggers/E2eMockLogger.md)** - E2Eテスト用のモックロガー
- **[MockLogger](./plugins/loggers/MockLogger.md)** - ユニットテスト用のモックロガー
- **[NullLogger](./plugins/loggers/NullLogger.md)** - 出力しないヌルロガー

### フォーマッタープラグイン

- **[JsonFormatter](./plugins/formatters/JsonFormatter.md)** - JSON形式でフォーマット
- **[PlainFormatter](./plugins/formatters/PlainFormatter.md)** - プレーンテキストでフォーマット
- **[MockFormatter](./plugins/formatters/MockFormatter.md)** - テスト用のモックフォーマッター
- **[NullFormatter](./plugins/formatters/NullFormatter.md)** - 何もしないヌルフォーマッター

## 型定義

### [ログレベル](./types/LogLevel.md)

- `AgLogLevel` - 数値ログレベル型
- `AgLogLevelLabel` - 文字列ログレベルラベル型
- `AG_LOGLEVEL` - ログレベル定数

### [インターフェース](./types/Interfaces.md)

- `AgLoggerInterface` - ロガーのインターフェース
- `AgLoggerFormatterInterface` - フォーマッターのインターフェース
- `AgLoggerOutputInterface` - 出力のインターフェース

## ユーティリティ

### [AgManagerUtils](./utils/AgManagerUtils.md)

ロガーマネージャーのユーティリティ関数群。

### [AgLoggerGetMessage](./utils/AgLoggerGetMessage.md)

ログメッセージ取得のためのユーティリティ。

### [testIdUtils](./utils/testIdUtils.md)

テストID生成のためのユーティリティ。

## 基本的な使用方法

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@agla-utils/ag-logger';

// ロガーの設定
const logger = AgLogger.createLogger();
logger.setLoggerConfig({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

// ログ出力
logger.info('情報メッセージ');
logger.error('エラーメッセージ');
logger.debug('デバッグメッセージ');
```

## 高度な使用方法

### カスタム設定での初期化

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@agla-utils/ag-logger';

const logger = AgLogger.createLogger();
logger.setLoggerConfig({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.DEBUG,
  verbose: true,
});
```

### プラグインのカスタマイズ

```typescript
import { AgLogger, ConsoleLogger, JsonFormatter } from '@agla-utils/ag-logger';

// カスタムロガー関数を作成
const customLogger = (message: string) => {
  console.log(`[CUSTOM] ${message}`);
};

const logger = AgLogger.createLogger();
logger.setLoggerConfig({
  defaultLogger: customLogger,
  formatter: JsonFormatter,
});
```
