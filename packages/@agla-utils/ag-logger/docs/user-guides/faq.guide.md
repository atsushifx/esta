---
header:
  - src: faq.guide.md
  - @(#): AgLogger よくある質問 ((FAQ)
title: AgLogger よくある質問 ((FAQ)
description: AgLoggerの使用時によくある質問とその解決方法
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

## 基本的な問題

### Q: ログが何も出力されない

**A**:
既定は安全側 (OFF/NullLogger/NullFormatter = 何も出力されない) になっています。`setLoggerConfig` で `defaultLogger`/`formatter`/`logLevel` を設定してください。

```typescript
import { AG_LOGLEVEL, AgLogger, ConsoleLogger, PlainFormatter } from '@agla-utils/ag-logger';

const logger = AgLogger.createLogger();
logger.setLoggerConfig({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});
```

### Q: `ConsoleLogger` を指定したのに一部レベルが `console.log` で出力されない

**A**:
`ConsoleLoggerMap` により `error/warn/info/debug` 等に適切にマップされています。`loggerMap` を上書きしていないか確認してください。

`ConsoleLogger` を使用した場合の既定マッピング:

- ERROR → `console.error`
- WARN → `console.warn`
- INFO → `console.info`
- DEBUG → `console.debug`
- TRACE → `console.trace`

## 設定に関する問題

### Q: 既定ログレベルに `VERBOSE/LOG/DEFAULT` を設定できない

**A**:
これらは特別レベルであり、既定値としては設定不可です。`INFO` 以上の標準レベルを指定してください。

利用可能な既定レベル:

- `AG_LOGLEVEL.FATAL` (1)
- `AG_LOGLEVEL.ERROR` (2)
- `AG_LOGLEVEL.WARN` (3)
- `AG_LOGLEVEL.INFO` (4)
- `AG_LOGLEVEL.DEBUG` (5)
- `AG_LOGLEVEL.TRACE` (6)

### Q: フォーマッターが返す文字列が空だと出力されない

**A**:
仕様です。空文字は出力が抑止されます。必要ならフォーマッターで最低限の文字列を返してください。

```typescript
// 例：カスタムフォーマッターで空文字を避ける
const customFormatter = (msg: AgLogMessage) => {
  const formatted = someFormatLogic(msg);
  return formatted || '[empty log]'; // 空文字の場合はフォールバック
};
```

## テストに関する問題

### Q: テストでログ内容を検証したい

**A**:
`MockLogger.buffer (AgMockBufferLogger)` または `E2eMockLogger` を使用してください。`getMessages/getLastMessage/clearMessages` が利用できます。

```typescript
import { MockLogger } from '@agla-utils/ag-logger';

// テスト用のモックロガーを設定
const mockLogger = MockLogger.buffer();
const logger = AgLogger.createLogger();
logger.setLoggerConfig({
  defaultLogger: mockLogger.default,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.INFO,
});

// ログ出力
logger.info('テストメッセージ');

// ログ内容の検証
expect(mockLogger.getMessages()).toContain('テストメッセージ');
expect(mockLogger.getLastMessage()).toBe('テストメッセージ');

// ログバッファのクリア
mockLogger.clearMessages();
```

### Q: テストで特定のログレベルのみを検証したい

**A**: MockLogger のフィルタリング機能やテストごとに異なるログレベルを設定することで対応できます。

```typescript
// 特定レベル以上のログのみテスト
logger.setLoggerConfig({
  defaultLogger: mockLogger.logger,
  formatter: PlainFormatter,
  logLevel: AG_LOGLEVEL.WARN, // WARN以上のみ出力
});

logger.info('これは出力されない');
logger.warn('これは出力される');
expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toHaveLength(1);
```

## パフォーマンスに関する問題

### Q: 本番環境でのログ出力によるパフォーマンス影響が心配

**A**:
ログレベルを適切に設定し、不要なログを抑止してください。また、本番環境では `JsonFormatter` を使用してログ解析ツールでの処理効率を上げることを推奨します。

```typescript
// 本番環境での推奨設定
const logger = AgLogger.createLogger();
logger.setLoggerConfig({
  defaultLogger: ConsoleLogger,
  formatter: JsonFormatter, // 構造化ログで解析効率向上
  logLevel: AG_LOGLEVEL.WARN, // 警告以上のみ出力
});
```

## 併読推奨

- 基本的な使い方: `./basic-usage.guide.md`
- 導入ガイド: `./getting-started.guide.md`
- クイックスタート: `./quick-start.guide.md`
- API リファレンス: `../../api/README.md`
