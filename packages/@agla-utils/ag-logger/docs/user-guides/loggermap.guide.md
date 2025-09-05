---
header:
  - src: docs/user-guides/loggermap.guide.md
  - @(#): AgLogger LoggerMap 詳細ガイド
title: AgLogger LoggerMap 詳細ガイド
description: loggerMap の基本・設計指針・実用パターン・注意点を解説
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

`loggerMap` はログレベルごとに出力先（ロガー関数）を切り替えるための仕組みです。ここでは、基本概念、よくあるパターン、注意点をまとめます。

## 基本

- 目的: レベル単位で出力先や方法を変える (例: `ERROR` は `console.error`、`INFO` は `console.info`)。
- 型: `loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>` (部分指定可能)。
- フォールバック: 指定がないレベルは `defaultLogger` が使われる。
- 初期化の補助: `defaultLogger` に `ConsoleLogger` を指定し `loggerMap` を省略した場合、自動的に `ConsoleLoggerMap` が適用される。

### 最小例 (部分上書き)

```ts
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@agla-utils/ag-logger';

const logger = AgLogger.createLogger();
logger.setLoggerConfig({
  defaultLogger: ConsoleLogger, // 省略時は ConsoleLoggerMap が自動適用
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
  loggerMap: {
    [AG_LOGLEVEL.ERROR]: (msg) => console.error('[E]', msg),
    [AG_LOGLEVEL.WARN]: (msg) => console.warn('[W]', msg),
    // INFO/DEBUG/TRACE は defaultLogger にフォールバック
  },
});
```

### カスタム先へのルーティング (例)

```ts
import { AG_LOGLEVEL, AgLogger, JsonFormatter } from '@agla-utils/ag-logger';

// 独自ロガー (ファイルや外部送信など)
const fileLogger = (message: string) => {
  // fs.appendFileSync('app.log', message + '\n');
};

const logger = AgLogger.createLogger();
logger.setLoggerConfig({
  defaultLogger: fileLogger, // 既定はファイルへ
  formatter: JsonFormatter, // JSON で構造化
  logLevel: AG_LOGLEVEL.INFO,
  loggerMap: {
    [AG_LOGLEVEL.ERROR]: (m) => console.error(m), // 重大系はコンソールへも
  },
});
```

### 設計のポイント

- 出力抑止は `logLevel` で行う: 抑止を `loggerMap` でやるのではなく、グローバルなフィルタ (`logLevel`) で制御。
- `OFF` レベルは `NullLogger` 固定: 特別扱い。ログ出力を抑止したい場合に使用する。
- 特別レベル (`VERBOSE`/`LOG`/`DEFAULT`) は既定レベルには設定不可: エラーになる
- `ConsoleLoggerMap` での既定マッピング: `error/warn/info/debug/trace` がそれぞれ `console.*` に適切に割り当てらる。

### ありがちな落とし穴

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->

- `formatter` が空文字を返す → 出力されません (仕様)。
- 引数 1個かつ空文字 `''` を渡す → 出力されません (ノイズ抑制)。
- `loggerMap` を全部埋めないと動かない? → 部分指定で OK。未指定レベルは `defaultLogger` にフォールバックする。

<!-- textlint-enable -->

## 併読推奨

- 導入 (軽量版): `./getting-started.guide.md`
- API 概要: `../../api/README.md`
