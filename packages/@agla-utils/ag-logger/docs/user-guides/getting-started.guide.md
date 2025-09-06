---
header:
  - src: docs/user-guides/getting-started.guide.md
  - @(#): AgLogger 導入ガイド（軽量版）
title: AgLogger 導入ガイド（軽量版）
description: 最小構成での導入と基本設定の要点をまとめたガイド
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

本ガイドは、最小限の設定で `@agla-utils/ag-logger` を使い始めるための手順のみを扱います。発展的な話題 (例: `loggerMap` の細かな使い分け等) は別ガイドに分離しています。

## 前提

- Node.js >= 20 / TypeScript
- ESM を推奨 (CJS もビルド出力あり)

## 最小設定 (Plain + Console)

```ts
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@agla-utils/ag-logger';

const logger = AgLogger.createLogger();
logger.setLoggerConfig({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

logger.info('Hello'); // 情報ログ
logger.error('Oops', { code: 500 }); // 追加情報は args に保持
```

### よく使う設定の要点 (抜粋)

- `defaultLogger`: 既定の出力先 (例: `ConsoleLogger`)。
- `formatter`: 表示形式の制御 (例: `PlainFormatter` / `JsonFormatter`)。
- `logLevel`: 出力する最小レベル (`INFO` 以上など)。
- `verbose`: `verbose()` を出力するか (詳細デバッグ用途)。

注意事項:

- モジュール読み込み時に `setupManager()` が実行されます (`AgManagerUtils`)。
- 既定は安全側 (出力 OFF: `NullLogger`/`NullFormatter`/`AG_LOGLEVEL.OFF`)。
- 既定レベルに特別レベル (`VERBOSE`/`LOG`/`DEFAULT`) は設定できません。

### フォーマッターの使い分け（抜粋）

- PlainFormatter: 開発コンソール向け。人間可読で軽量、ざっと読む/`grep` しやすい。
- JsonFormatter: 本番やログ集約向け。構造化され、検索・集計・ダッシュボードに強い。

環境で切り替える最短例:

```ts
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, JsonFormatter, PlainFormatter } from '@agla-utils/ag-logger';

const logger = AgLogger.createLogger();
const formatter = process.env.NODE_ENV === 'production' ? JsonFormatter : PlainFormatter;

logger.setLoggerConfig({
  defaultLogger: ConsoleLogger,
  formatter,
  logLevel: AG_LOGLEVEL.INFO,
});
```

## 次に読む

- `loggerMap` の詳細とパターン: `./loggermap.guide.md`
- フォーマッター詳細（出力例/設計/注意）: `./formatters.guide.md`
- クイックに全体像を掴む: `./quick-start.guide.md`
