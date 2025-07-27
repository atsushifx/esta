---
header:
- src: pure-functions.spec.md
- @(#): ag-logger 純関数設計仕様書
title: ag-logger 純関数設計仕様書
description: ag-loggerパッケージを現代的な関数型プログラミングパターンを用いてリファクタリングする仕様書
version: 1.0.0
created: 2025-07-22
updated: 2025-07-22
authors:
  - atsushifx
changes:
  - 2025-07-22: 初回作成（ドキュメント整備）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

ag-loggerのメッセージ処理を純関数として再設計する。副作用のない、テスタブルで合成可能な関数群を作成し、現在の命令型処理を関数型パイプラインで置換する。

---

## formatLogMessage 関数仕様

### 目的

ログレベル、メッセージ、追加引数を統合してフォーマット済みログメッセージを生成する。

### 関数シグネチャ

> Note:
> `/shared/types/LogLevel.types.ts` から導出できるものは、そこから導出して一貫性を保つ

```typescript
type LogLevel = 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';

interface LogMessage {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: Date;
  readonly args: readonly unknown[];
}

const formatLogMessage = (
  level: AgTLogLevel,
  ...args: readonly unknown[]
): LogMessage
```

### 純関数要件

- **No Side Effects**: コンソール出力、ファイル書き込み等の副作用なし
- **Deterministic**: 同じ入力に対して常に同じ出力
- **Immutable**: 入力引数の変更なし、イミュータブルな戻り値

### 実装仕様

#### 1. ログレベル変換

```typescript
// 実装は LogLevelHelpers.ts を参照
import { AgToLabel, AgToLogLevel } from '@/utils/LogLevelHelpers';

// AgTLogLevel (数値) → AgTLogLevelLabel (文字列ラベル) 変換
// AgToLabel(level: AgTLogLevel): AgTLogLevelLabel

// AgTLogLevel (数値) → AgTLogLevel (数値、同じ値) 変換
// AgToLogLevel(level: AgTLogLevel): AgTLogLevel
```

Note: `/shared/types/LogLevel.types.ts` はこのままでいいとおもう

#### 2. メッセージ統合

```typescript
// 引数から文字列部分を抽出し連結
const extractMessage = (args: readonly unknown[]): string => {
  return args
    .filter((arg) => typeof arg === 'string' || typeof arg === 'number')
    .map(String)
    .join(' ')
    .trim();
};
```

#### 3. 非文字列引数の保持

```typescript
// オブジェクト・配列・関数等の保持
const extractArgs = (args: readonly unknown[]): readonly unknown[] => {
  return args.filter((arg) =>
    typeof arg !== 'string'
    && typeof arg !== 'number'
  );
};
```

#### 4. 完全実装

```typescript
export const formatLogMessage = (
  level: AgTLogLevel,
  ...args: readonly unknown[]
): LogMessage => {
  return Object.freeze({
    level: AgToLogLevel(level),
    message: extractMessage(args),
    timestamp: new Date(),
    args: Object.freeze(extractArgs(args)),
  });
};
```

### テストケース

```typescript
describe('formatLogMessage', () => {
  it('should format message with level and timestamp', () => {
    const result = formatLogMessage(AG_LOG_LEVEL.INFO, 'Test message');

    expect(result).toEqual({
      level: 'INFO',
      message: 'Test message',
      timestamp: expect.any(Date),
      args: [],
    });
  });

  it('should separate strings and objects', () => {
    const userData = { id: 123 };
    const result = formatLogMessage(
      AG_LOG_LEVEL.ERROR,
      'User error',
      userData,
      'occurred',
    );

    expect(result).toEqual({
      level: 'ERROR',
      message: 'User error occurred',
      timestamp: expect.any(Date),
      args: [userData],
    });
  });
});
```

---

## shouldLogAtLevel 関数仕様

### 目的

現在の設定ログレベルと対象ログレベルを比較し、ログ出力すべきかを判定する。

### 関数シグネチャ

```typescript
const shouldLogAtLevel = (
  currentLevel: AgTLogLevel,
  targetLevel: AgTLogLevel
): boolean
```

### 純関数要件

- **Pure Function**: グローバル状態への依存なし
- **Boolean Result**: 明確なtrue/false判定
- **Edge Case Handling**: OFF レベルの特別扱い

### 実装仕様

#### 1. OFF レベルの特別処理

```typescript
const shouldLogAtLevel = (
  currentLevel: AgTLogLevel,
  targetLevel: AgTLogLevel,
): boolean => {
  // OFF レベルの場合は常にログ出力しない
  if (currentLevel === AG_LOG_LEVEL.OFF) {
    return false;
  }

  // 対象レベルが現在レベル以下の場合のみ出力
  return targetLevel <= currentLevel;
};
```

### ログレベル優先度

```typescript
// 数値が小さいほど高優先度（重要度が高い）
const LOG_LEVEL_PRIORITY = {
  OFF: 0, // 無出力
  FATAL: 1, // 最高優先度
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  DEBUG: 5,
  TRACE: 6, // 最低優先度
} as const;
```

AGT_LOG_Lev

### テストケース

```typescript
describe('shouldLogAtLevel', () => {
  it('should return false when current level is OFF', () => {
    expect(shouldLogAtLevel(AG_LOG_LEVEL.OFF, AG_LOG_LEVEL.ERROR))
      .toBe(false);
  });

  it('should return true when target level is less than or equal to current', () => {
    expect(shouldLogAtLevel(AG_LOG_LEVEL.INFO, AG_LOG_LEVEL.ERROR))
      .toBe(true);
    expect(shouldLogAtLevel(AG_LOG_LEVEL.INFO, AG_LOG_LEVEL.INFO))
      .toBe(true);
  });

  it('should return false when target level is greater than current', () => {
    expect(shouldLogAtLevel(AG_LOG_LEVEL.INFO, AG_LOG_LEVEL.DEBUG))
      .toBe(false);
  });
});
```

---

## parseLogArguments 関数仕様

### 目的

可変長引数を解析し、メッセージ部分と構造化データ部分に分離する。

### 関数シグネチャ

```typescript
interface ParsedArguments {
  readonly messageArgs: readonly (string | number)[];
  readonly structuredArgs: readonly unknown[];
}

const parseLogArguments = (
  ...args: readonly unknown[]
): ParsedArguments
```

### 純関数要件

- **Immutable Input**: 入力引数を変更しない
- **Consistent Parsing**: 同じ引数配列に対して常に同じ分離結果
- **Type Safety**: 型安全な分離処理

### 実装仕様

#### 1. 引数分類ロジック

```typescript
const isMessageArg = (arg: unknown): arg is string | number => {
  return typeof arg === 'string' || typeof arg === 'number';
};

const isStructuredArg = (arg: unknown): boolean => {
  return !isMessageArg(arg) && arg != null;
};
```

#### 2. 分離処理

```typescript
export const parseLogArguments = (
  ...args: readonly unknown[]
): ParsedArguments => {
  const messageArgs: (string | number)[] = [];
  const structuredArgs: unknown[] = [];

  for (const arg of args) {
    if (isMessageArg(arg)) {
      messageArgs.push(arg);
    } else if (isStructuredArg(arg)) {
      structuredArgs.push(arg);
    }
    // null, undefined は無視
  }

  return Object.freeze({
    messageArgs: Object.freeze(messageArgs),
    structuredArgs: Object.freeze(structuredArgs),
  });
};
```

### 特殊ケース処理

#### 1. null/undefined の扱い

- **null**: structuredArgs に含める
- **undefined**: 無視する（フィルタリング）

#### 2. 空文字列の扱い

- **空文字列 ''**: messageArgs に含める
- **空白のみ文字列 ' '**: messageArgs に含める

#### 3. 関数の扱い

- **Function**: structuredArgs に含める（デバッグ用途）

### テストケース

```typescript
describe('parseLogArguments', () => {
  it('should separate strings and objects', () => {
    const user = { id: 123 };
    const result = parseLogArguments('Error in', user, 'processing', null);

    expect(result).toEqual({
      messageArgs: ['Error in', 'processing'],
      structuredArgs: [user, null],
    });
  });

  it('should handle empty and mixed arguments', () => {
    const result = parseLogArguments('', 42, undefined, [], 'test');

    expect(result).toEqual({
      messageArgs: ['', 42, 'test'],
      structuredArgs: [[]],
    });
  });

  it('should handle all structured arguments', () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const result = parseLogArguments(obj1, obj2);

    expect(result).toEqual({
      messageArgs: [],
      structuredArgs: [obj1, obj2],
    });
  });
});
```

---

## processLogMessage パイプライン仕様

### 目的

個別の純関数を組み合わせて、ログメッセージの完全な処理パイプラインを構築する。

### 関数シグネチャ

```typescript
interface LoggerConfig {
  readonly level: AgTLogLevel;
  readonly formatter: AgFormatFunction;
  readonly outputter: AgLoggerFunction;
}

const processLogMessage = (config: LoggerConfig) => (
  targetLevel: AgTLogLevel,
  ...args: readonly unknown[]
): void
```

### パイプライン構造

#### 1. 関数合成ヘルパー

```typescript
// 左から右への関数合成
const pipe = <T>(...functions: Array<(arg: T) => T>) => (value: T): T => functions.reduce((acc, fn) => fn(acc), value);

// 条件付き実行
const when = <T>(predicate: (value: T) => boolean) => (fn: (value: T) => T) => (value: T): T =>
  predicate(value) ? fn(value) : value;
```

#### 2. パイプライン段階

```typescript
export const processLogMessage = (config: LoggerConfig) => {
  return (targetLevel: AgTLogLevel, ...args: readonly unknown[]): void => {
    // Step 1: レベル判定（早期リターン）
    if (!shouldLogAtLevel(config.level, targetLevel)) {
      return;
    }

    // Step 2: メッセージフォーマット
    const logMessage = formatLogMessage(targetLevel, ...args);

    // Step 3: フォーマッター適用
    const formattedMessage = config.formatter(logMessage);

    // Step 4: 空メッセージチェック
    if (formattedMessage === '') {
      return;
    }

    // Step 5: 出力実行
    config.outputter(formattedMessage);
  };
};
```

#### 3. 関数型パイプライン版

```typescript
// より関数型らしい実装
export const processLogMessageFunctional = (config: LoggerConfig) => {
  const pipeline = pipe(
    // レベルフィルタリング
    when((ctx: ProcessingContext) => shouldLogAtLevel(config.level, ctx.targetLevel))(identity),
    // メッセージフォーマット
    (ctx) => ({
      ...ctx,
      logMessage: formatLogMessage(ctx.targetLevel, ...ctx.args),
    }),
    // フォーマッター適用
    (ctx) => ({
      ...ctx,
      formatted: config.formatter(ctx.logMessage),
    }),
    // 出力実行
    when((ctx) => ctx.formatted !== '')(
      (ctx) => {
        config.outputter(ctx.formatted);
        return ctx;
      },
    ),
  );

  return (targetLevel: AgTLogLevel, ...args: readonly unknown[]): void => {
    pipeline({ targetLevel, args, logMessage: null, formatted: '' });
  };
};
```

### パフォーマンス考慮事項

#### 1. 早期リターン最適化

- レベル判定を最初に行い、不要な処理をスキップ
- フォーマッター実行前の空メッセージチェック

#### 2. メモリ効率

- 不要な中間オブジェクト生成を避ける
- イミュータブルオブジェクトの適切な使用

#### 3. 実行速度

- 関数合成のオーバーヘッド最小化
- ホットパスでの型変換回避

### テストケース

```typescript
describe('processLogMessage', () => {
  it('should process complete log message pipeline', () => {
    const mockFormatter = vi.fn().mockReturnValue('formatted message');
    const mockOutputter = vi.fn();

    const config: LoggerConfig = {
      level: AG_LOG_LEVEL.INFO,
      formatter: mockFormatter,
      outputter: mockOutputter,
    };

    const processor = processLogMessage(config);
    processor(AG_LOG_LEVEL.INFO, 'Test message', { data: 'test' });

    expect(mockFormatter).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'INFO',
        message: 'Test message',
        args: [{ data: 'test' }],
      }),
    );
    expect(mockOutputter).toHaveBeenCalledWith('formatted message');
  });

  it('should skip processing when level is filtered', () => {
    const mockFormatter = vi.fn();
    const mockOutputter = vi.fn();

    const config: LoggerConfig = {
      level: AG_LOG_LEVEL.ERROR,
      formatter: mockFormatter,
      outputter: mockOutputter,
    };

    const processor = processLogMessage(config);
    processor(AG_LOG_LEVEL.DEBUG, 'Debug message');

    expect(mockFormatter).not.toHaveBeenCalled();
    expect(mockOutputter).not.toHaveBeenCalled();
  });
});
```

---

## 型定義と制約条件

### 共通型定義

```typescript
// 核となるログメッセージ型
interface LogMessage {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: Date;
  readonly args: readonly unknown[];
}

// 処理コンテキスト型
interface ProcessingContext {
  readonly targetLevel: AgTLogLevel;
  readonly args: readonly unknown[];
  readonly logMessage: LogMessage | null;
  readonly formatted: string;
}

// ユーティリティ型
type Identity<T> = T;
type Predicate<T> = (value: T) => boolean;
type Transform<T> = (value: T) => T;
```

### 制約条件

#### 1. イミュータビリティ

- すべての戻り値は `Object.freeze()` でフリーズ
- 配列・オブジェクトは `readonly` 修飾子必須
- 入力引数の変更は厳禁

#### 2. 型安全性

- `any` 型の使用禁止
- strict TypeScript 設定遵守
- 型アサーション最小化

#### 3. パフォーマンス

- 関数呼び出し深度の制限（スタックオーバーフロー回避）
- 大量ログ処理でのメモリリーク防止
- 同期処理によるブロッキング回避

#### 4. テスタビリティ

- 副作用のない純関数設計
- 依存注入によるモック可能性
- 決定的な動作保証

### エラーハンドリング

```typescript
// エラー境界の明確化
type SafeFunction<T, R> = (input: T) => R | Error;

// エラー伝播の制御
const safeFormatLogMessage = (
  level: AgTLogLevel,
  ...args: readonly unknown[]
): LogMessage | Error => {
  try {
    return formatLogMessage(level, ...args);
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
};
```
