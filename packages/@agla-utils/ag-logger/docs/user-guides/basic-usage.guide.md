---
header:
  - src: docs/user-guides/basic-usage.guide.md
  - @(#): 基本的なロガーの使い方
title: 基本的なロガーの使い方
description: ag-loggerパッケージの基本的な使用方法について説明
version: 0.3.0
created: 2025-09-05
authors:
  - atsushifx
changes:
  - 2025-09-05: 初版作成（パッケージドキュメント標準化）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

このガイドでは、`ag-logger`パッケージの基本的な使用方法について説明します。

## セットアップ

ロガーマネージャーを作成し、ロガーを設定します。

```typescript
import { AG_LOGLEVEL, ConsoleLogger, createManager, getLogger, PlainFormatter } from '@agla-utils/ag-logger';

createManager({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});
const logger = getLogger();
```

## 基本的なログ出力

### 情報ログ

```typescript
logger.info('起動しました');
```

### 警告ログ (追加情報付き)

```typescript
logger.warn('設定が見つかりませんでした', { fallback: true });
```

### エラーログ (詳細情報付き))

```typescript
logger.error('処理に失敗しました', { code: 'E_FAIL', retryable: false });
```

## ログレベルの設定

利用可能なログレベル:

- `AG_LOGLEVEL.VERBOSE` (-99): 最も詳細なログ
- `AG_LOGLEVEL.TRACE` (6): トレース情報
- `AG_LOGLEVEL.DEBUG` (5): デバッグ情報
- `AG_LOGLEVEL.INFO` (4): 一般的な情報
- `AG_LOGLEVEL.WARN` (3): 警告
- `AG_LOGLEVEL.ERROR` (2): エラー
- `AG_LOGLEVEL.FATAL` (1): 致命的なエラー
- `AG_LOGLEVEL.OFF` (0): ログ出力なし

設定したレベル以上のログのみが出力されます。例えば、`AG_LOGLEVEL.INFO`に設定した場合、INFO、WARN、ERROR、FATAL レベルのログが出力されます。

## ロガーの種類

- `ConsoleLogger`: コンソールに出力するロガー
- その他のロガーについては、[getting-started.guide.md](./getting-started.guide.md)を参照してください

## フォーマッターの種類

- `PlainFormatter`: シンプルなテキスト形式での出力
- その他のフォーマッターについては、[formatters.guide.md](./formatters.guide.md)を参照してください
