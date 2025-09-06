---
header:
  - src: docs/api/plugins/formatters/PlainFormatter.md
  - "@(#)": プレーン形式フォーマッター プラグイン APIリファレンス
title: PlainFormatter
description: ログメッセージを人間が読みやすいプレーン形式でフォーマットするフォーマッタープラグインのAPIリファレンス
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

## PlainFormatter

## 概要

**PlainFormatter**は、ログメッセージを人間が読みやすいプレーン形式でフォーマットするフォーマッタープラグインです。開発環境やデバッグ時に適しており、コンソールでの視認性を重視した出力形式を提供します。

## 関数定義

```typescript
export const PlainFormatter: AgFormatFunction = (logMessage: AgLogMessage): string
```

### パラメータ

- logMessage** (`AgLogMessage`): フォーマット対象のログメッセージオブジェクト
  - `logLevel` (`AgLogLevel`): ログレベル（数値）
  - `timestamp` (`Date`): ログ出力時刻
  - `message` (`string`): ログメッセージ文字列
  - `args` (`unknown[]`): 追加引数の配列

### 戻り値

- `string`: 人間が読みやすい形式でフォーマットされたログエントリ文字列

### 動作

PlainFormatter は以下の手順でログメッセージを処理:

1. **タイムスタンプ変換: ISO 8601形式からミリ秒部分を除去 (`.replace(/\.\d{3}Z$/, 'Z')`)
2. **レベル変換: `AgToLabel()`を使用してログレベル数値を文字列ラベルに変換
3. **引数変換: `argsToString()`を使用して引数配列をスペース区切りの JSON 文字列として結合
4. **フォーマット組立: タイムスタンプ、レベルラベル (角括弧で囲む)、メッセージ、引数を結合

出力形式:

```bash
{timestamp} [{level}] {message} {args...}
```

- `timestamp`: ISO 8601形式（ミリ秒なし）
- `level`: ログレベルラベル（LOG レベル時は省略）
- `message`: ログメッセージ文字列
- `args`: JSON 文字列化された引数（スペース区切り、空の場合は省略）

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
logger.warn('設定が見つかりません', { fallback: true });
```

### 開発環境での活用例

```typescript
const devLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.DEBUG,
  verbose: true,
});

devLogger.debug('データベース接続開始', { host: 'localhost', port: 5432 });
devLogger.info('ユーザー認証成功', { userId: 123, role: 'admin' });
```

### デバッグ用設定

```typescript
const debugLogger = AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.TRACE,
  verbose: true,
});

debugLogger.trace('関数呼び出し', { function: 'processData', args: [1, 2, 3] });
debugLogger.debug('変数値確認', { variable: 'userName', value: 'testUser' });
```

## 出力例

### 基本的なログ

```console
2025-01-01T12:00:00Z [INFO] Test message
```

### 引数付きログ

```console
2025-06-22T15:30:45Z [ERROR] An error occurred {"userId":123,"action":"login"}
```

### 複数引数のログ

```console
2025-03-15T09:15:30Z [DEBUG] Debug info {{"name":"John Doe"} {"age":30} ["item1","item2"]}
```

### LOGレベルの出力（レベルラベル省略）

```console
2025-01-01T12:00:00Z Force output message
```

### 空メッセージでの出力

```console
2025-12-31T23:59:59Z [WARN] {"warning":"empty message"}
```

## 特徴

### 視認性の向上

- タイムスタンプ: ミリ秒を除いた読みやすい形式
- レベル表示: 角括弧で囲まれた明確なレベル表示
- 引数表示: JSON 形式で構造化された引数の表示

### 開発効率の向上

- コンソール表示: 開発者ツールやターミナルでの読みやすさを重視
- デバッグ支援: 複数の引数やオブジェクトを明確に分離して表示
- 即座の理解: ログレベルとメッセージを一目で判別可能

## 注意事項

### パフォーマンス考慮事項

- JSON 変換処理により、単純な文字列連結よりオーバーヘッドがある
- 大量のログ出力時は、LogLevel の調整による制御を推奨する

### タイムスタンプ形式

- ミリ秒が省略されるため、高精度なタイミング測定には不向き
- 正確なタイミングが必要な場合は JsonFormatter の使用を検討してください

## 関連項目

- [AgFormatFunction](../../types/AgFormatFunction.md) - フォーマッター関数の型定義
- [JsonFormatter](JsonFormatter.md) - JSON 形式フォーマッター
- [ConsoleLogger](../loggers/ConsoleLogger.md) - コンソール出力ロガー
- [AgLoggerOptions](../../AgLoggerOptions.md) - ロガー設定オプション
