---
header:
  - src: formatters.guide.md
  - @(#): AgLogger Formatters ガイド
title: AgLogger Formatters ガイド
description: Plain/JSON/Mock 各フォーマッターの用途と使い分けの指針
version: 1.0.0
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

## 概要

AgLogger のフォーマッターは、`AgLogMessage` を最終的に出力する文字列へ変換します。用途に応じてプレーン/JSON/モックを使い分けます。

## 主要フォーマッター

- PlainFormatter: 人間可読なテキスト。開発時のコンソール向け。
- JsonFormatter: 構造化 JSON。集約・検索・可視化（CloudWatch/ELK など）向け。
- MockFormatter: テスト支援用の拡張可能なモック。出力の検証や統計取得に便利。

## 出力イメージ (概念)

<!-- textlint-disable ja-technical-writing/sentence-length -->

- PlainFormatter: `[2025-08-24T12:00:00Z] INFO User logged in {"userId":1}` のような平文
- JsonFormatter: `{"timestamp":"2025-08-24T12:00:00.000Z","level":"INFO","message":"User logged in","args":[{"userId":1}]}`

<!-- textlint-enable -->

## 選定ガイド

- 開発: PlainFormatter（読みやすさ優先）。
- 本番/集約: JsonFormatter（機械処理前提）。
- テスト: MockFormatter（検証に特化）。

## 使い分け例 (環境切替)

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

## MockFormatter の活用

プリセットを備え、テストでの柔軟な検証に適しています。

```ts
import { MockFormatter } from '@agla-utils/ag-logger';

// メッセージだけを検証
const MessageOnly = MockFormatter.messageOnly;
// JSON 形式で検証
const JsonLike = MockFormatter.json;
// 任意のルーチン
const Custom = MockFormatter.withRoutine((msg) => `${msg.timestamp.toISOString()} ${msg.message}`);
```

`errorThrow` を使うと例外系のテストも容易です（実行時にエラーメッセージ変更可）。

## 注意事項

- フォーマッターが空文字 `''` を返した場合、そのログは出力されません (抑止仕様)。
- 引数が 1個かつ空文字 `''` の場合も出力されません (ノイズ抑制)。
- `LOG` (強制出力) や `VERBOSE` (詳細)は「特別レベル」なので、既定ログレベルには設定できません。

## 併読推奨

- 導入（軽量版）: `./getting-started.guide.md`
- ロガーの振り分け: `./loggermap.guide.md`
- API 概要: `../../api/README.md`
