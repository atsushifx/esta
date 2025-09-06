---
header:
  - src: docs/api/plugins/loggers/ConsoleLogger.md
  - "@(#)": コンソールロガー プラグイン APIリファレンス
title: ConsoleLogger
description: ログメッセージをコンソールに出力する標準ロガープラグインのAPIリファレンス
version: 0.3.0
created: 2025-08-25
authors:
  - atsushifx
changes:
  - 2025-08-25: 初版作成
  - 2025-09-05: フロントマター標準化・見出し階層修正
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## ConsoleLogger

## 概要

**ConsoleLogger**は、ログメッセージをコンソールに出力する標準ロガープラグインです。
内部的に**ConsoleLoggerMap**を使用し、各ログレベルごとにあわせた`console.*`メソッドをマッピングします。
これにより、ブラウザおよび Node.js 環境の両方で最適な出力を提供します。

## 関数定義

```typescript
export const ConsoleLogger: AgLoggerFunction = (formattedLogMessage: AgFormattedLogMessage): void
export const ConsoleLoggerMap: Partial<AgLoggerMap>
```

### パラメータ

- formattedLogMessage (`AgFormattedLogMessage`): フォーマット済みのログメッセージ文字列

### 戻り値

- `void`: 戻り値なし（コンソールに直接出力）

### 動作

**ConsoleLogger**は`console.log()`を使用してすべてのログメッセージを出力する基本的なロガーです。

**ConsoleLoggerMap**は各ログレベルに対応する専用の console.*メソッドを提供し、より詳細な出力制御を可能:

1. レベル別出力: 各ログレベルに適した`console.*`メソッドを使用
2. 環境対応: ブラウザと Node.js 環境の両方で適切に動作
3. 自動適用: `defaultLogger`に ConsoleLogger を指定し`loggerMap`未指定時は自動で ConsoleLoggerMap が適用される

## ConsoleLoggerMapの動作

### ログレベルとconsole.*の対応

| ログレベル | console.*メソッド | 用途         | 出力先（Node.js） |
| ---------- | ----------------- | ------------ | ----------------- |
| OFF        | NullLogger        | 出力なし     | -                 |
| FATAL      | console.error     | 致命的エラー | stderr            |
| ERROR      | console.error     | エラー       | stderr            |
| WARN       | console.warn      | 警告         | stderr            |
| INFO       | console.info      | 情報         | stdout            |
| DEBUG      | console.debug     | デバッグ     | stdout            |
| TRACE      | console.debug     | トレース     | stdout            |
| VERBOSE    | console.debug     | 詳細情報     | stdout            |
| LOG        | console.log       | 一般ログ     | stdout            |

## 使用例

### 基本的な使用方法

```typescript
import { AgLogger, ConsoleLogger, PlainFormatter } from '@agla-utils/ag-logger';

const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

logger.info('アプリケーション開始');
logger.error('エラーが発生しました');
```

### ConsoleLoggerMapとの組み合わせ

```typescript
import { AgLogger, ConsoleLogger, ConsoleLoggerMap, JsonFormatter } from '@agla-utils/ag-logger';

const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
  logLevel: AG_LOGLEVEL.DEBUG,
  loggerMap: ConsoleLoggerMap, // 明示的に指定（自動適用されるが明示性のため）
});

logger.error('API呼び出し失敗', { endpoint: '/api/data' }); // console.error
logger.warn('設定ファイルが見つかりません'); // console.warn
logger.info('処理完了'); // console.info
logger.debug('デバッグ情報', { data: [1, 2, 3] }); // console.debug
```

### 環境別設定

```typescript
// 開発環境用設定
const devLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.DEBUG,
  verbose: true,
});

// 本番環境用設定
const prodLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter,
  logLevel: AG_LOGLEVEL.WARN,
  verbose: false,
  // ConsoleLoggerMapが自動適用され、ERROR/WARNのみコンソール出力
});
```

## 環境別の動作

### ブラウザ環境

- 開発者ツール: コンソールタブに出力表示
- 色分け表示: `console.error` (赤)、`console.warn` (黄) と、コンソール出力により色分け
- スタックトレース: `console.debug`や`console.trace`でスタックトレース情報を含む
- フィルタリング: 開発者ツールのレベルフィルタで表示制御可能

### Node.js環境

- 標準出力分離:
  - `console.error`、`console.warn` → `stderr`
  - `console.info`、`console.log`、`console.debug` → `stdout`
- リダイレクト対応: ストリーム別にリダイレクト可能
- ログレベル制御: 環境変数やオプションによる出力制御対応

## 特徴

### 自動設定

AgLogger で`defaultLogger: ConsoleLogger`を指定し、`loggerMap`を未指定の場合、自動的に`ConsoleLoggerMap`を適用:

```typescript
// この設定では自動的にConsoleLoggerMapが適用される
const logger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger, // ConsoleLoggerを指定
  formatter: PlainFormatter,
  // loggerMap未指定 → 自動でConsoleLoggerMapが適用
});
```

### 環境適応性

- クロスプラットフォーム: ブラウザ・Node.js 両環境で同一 API
- 標準準拠: Web 標準の Console API を使用
- 出力制御: 環境固有の出力先制御に対応

## 注意事項

### パフォーマンス

- コンソール出力は I/O 処理のため、大量のログ出力時はパフォーマンスに影響する可能性がある
- 本番環境ではログレベル設定による制御を推奨

### 出力先制御

- Node.js 環境では stdout/stderr の分離を活用した出力制御が可能
- ブラウザ環境では開発者ツールのフィルタリング機能を活用してください

## 関連項目

- [AgLoggerFunction](../../types/AgLoggerFunction.md) - ロガー関数の型定義
- [AgLoggerMap](../../types/AgLoggerMap.md) - ロガーマップの型定義
- [PlainFormatter](../formatters/PlainFormatter.md) - プレーン形式フォーマッター
- [JsonFormatter](../formatters/JsonFormatter.md) - JSON 形式フォーマッター
- [AgLoggerOptions](../../AgLoggerOptions.md) - ロガー設定オプション
