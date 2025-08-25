---
header:
  - src: AgLogValidators.md
  - "@(#)": ログバリデーション関数群 ユーティリティ APIリファレンス
title: AgLogValidators
description: ログレベルやパラメーターの検証を行うバリデーション関数群のAPIリファレンス
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

# AgLogValidators

## 概要

**AgLogValidators**は、ログレベルやパラメーターの検証を行うバリデーション関数群を提供するユーティリティモジュールです。型安全性を保証し、実行時のエラーを防ぐためのバリデーション機能を提供します。AgLoggerError を使用した構造化エラーハンドリングにより、詳細なエラー情報を提供します。

## 関数一覧

### validateLogLevel

```typescript
export const validateLogLevel = (input: unknown): AgLogLevel
```

#### パラメータ

- `input: unknown` - 検証対象の値

#### 戻り値

- `AgLogLevel` - 有効なログレベル値

#### 動作

入力値を検証し、有効なログレベルの場合はそのまま返します。無効な場合は具体的なエラー内容を含む AgLoggerError を投げます。

#### 使用例

```typescript
import { AG_LOGLEVEL, validateLogLevel } from '@agla-utils/ag-logger';

// 有効な値
const validLevel = validateLogLevel(AG_LOGLEVEL.INFO); // 4
const validNumber = validateLogLevel(2); // 2
const specialLevel = validateLogLevel(AG_LOGLEVEL.VERBOSE); // -11

// 無効な値（エラーを投げる）
try {
  validateLogLevel(undefined); // AgLoggerError
} catch (error) {
  console.error(error.message); // "Invalid log level (undefined)"
}

try {
  validateLogLevel('INFO'); // AgLoggerError
} catch (error) {
  console.error(error.message); // "Invalid log level ("INFO" - expected number)"
}

try {
  validateLogLevel(99); // AgLoggerError
} catch (error) {
  console.error(error.message); // "Invalid log level (99 - out of valid range)"
}

try {
  validateLogLevel(3.5); // AgLoggerError
} catch (error) {
  console.error(error.message); // "Invalid log level (3.5 - must be integer)"
}
```

#### エラーケース

| 入力値                         | エラーメッセージ                                   | エラータイプ |
| ------------------------------ | -------------------------------------------------- | ------------ |
| `undefined`                    | "Invalid log level (undefined)"                    | VALIDATION   |
| `null`                         | "Invalid log level (null)"                         | VALIDATION   |
| 文字列、真偽値、オブジェクト   | "Invalid log level ([値] - expected number)"       | VALIDATION   |
| `NaN`, `Infinity`, `-Infinity` | "Invalid log level ([値] - must be finite number)" | VALIDATION   |
| 小数点を含む数値               | "Invalid log level ([値] - must be integer)"       | VALIDATION   |
| 範囲外の数値                   | "Invalid log level ([値] - out of valid range)"    | VALIDATION   |

#### 注意事項

- 入力値の型チェック、有限性チェック、整数チェック、範囲チェックを順次実行します
- AgLoggerError を投げるため、適切な try-catch ブロックで囲んでください
- エラーメッセージには具体的な値と失敗理由が含まれます

### isValidLogLevel

```typescript
export const isValidLogLevel = (logLevel: unknown): logLevel is AgLogLevel
```

#### パラメータ

- `logLevel: unknown` - 検証対象の値

#### 戻り値

- `boolean` - 有効なログレベルの場合 true、そうでなければ false

#### 動作

入力値が有効なログレベルかどうかを判定します。型ガード関数として機能し、戻り値が true の場合は TypeScript が値を AgLogLevel 型として認識します。

#### 使用例

```typescript
import { AG_LOGLEVEL, isValidLogLevel } from '@agla-utils/ag-logger';

// 有効な値の判定
console.log(isValidLogLevel(AG_LOGLEVEL.INFO)); // true
console.log(isValidLogLevel(2)); // true
console.log(isValidLogLevel(AG_LOGLEVEL.VERBOSE)); // true

// 無効な値の判定
console.log(isValidLogLevel(undefined)); // false
console.log(isValidLogLevel('INFO')); // false
console.log(isValidLogLevel(3.5)); // false
console.log(isValidLogLevel(99)); // false

// 型ガードとしての使用
function processLogLevel(input: unknown): string {
  if (isValidLogLevel(input)) {
    // この時点で input は AgLogLevel 型として扱われる
    return `Valid log level: ${input}`;
  }
  return 'Invalid log level';
}
```

#### 注意事項

- エラーを投げずに boolean 値を返します
- TypeScript の型ガード関数として機能します
- validateLogLevel 内部で使用されています

### validateFormatter

```typescript
export const validateFormatter = (formatter: unknown): void
```

#### パラメータ

- `formatter: unknown` - 検証対象のフォーマッター関数

#### 戻り値

- `void` - 戻り値なし (有効な場合は正常終了、無効な場合は例外)

#### 動作

フォーマッター関数が有効かどうかを検証します。null、undefined、または関数以外の値の場合は AgLoggerError を投げます。

#### 使用例

```typescript
import { validateFormatter } from '@agla-utils/ag-logger';
import { JsonFormatter, PlainFormatter } from '@agla-utils/ag-logger';

// 有効なフォーマッター
try {
  validateFormatter(JsonFormatter); // 正常終了
  validateFormatter(PlainFormatter); // 正常終了

  // カスタムフォーマッター
  const customFormatter = (message: AgLogMessage): string => JSON.stringify(message);
  validateFormatter(customFormatter); // 正常終了
} catch (error) {
  // エラーは発生しない
}

// 無効なフォーマッター (エラーを投げる)
try {
  validateFormatter(null); // AgLoggerError
} catch (error) {
  console.error(error.message); // "formatter must be a valid function"
}

try {
  validateFormatter('not a function'); // AgLoggerError
} catch (error) {
  console.error(error.message); // "formatter must be a valid function"
}
```

#### 注意事項

- 有効な場合は何も返さず、無効な場合のみ例外を投げます
- エラータイプは CONFIG です
- 関数の内容や署名は検証せず、関数型かどうかのみをチェックします

### isValidFormatter

```typescript
export const isValidFormatter = (formatter: unknown): boolean
```

#### パラメータ

- `formatter: unknown` - 検証対象の値

#### 戻り値

- `boolean` - 有効なフォーマッター関数の場合 true、そうでなければ false

#### 動作

値が有効なフォーマッター関数かどうかを判定します。null、undefined でなく、かつ関数型である場合に true を返します。

#### 使用例

```typescript
import { isValidFormatter } from '@agla-utils/ag-logger';

// 有効なフォーマッター
console.log(isValidFormatter((msg) => JSON.stringify(msg))); // true
console.log(isValidFormatter(function formatter() {
  return '';
})); // true

// 無効なフォーマッター
console.log(isValidFormatter(null)); // false
console.log(isValidFormatter(undefined)); // false
console.log(isValidFormatter('function')); // false
console.log(isValidFormatter({})); // false

// 安全なフォーマッター設定
function setFormatterSafely(formatter: unknown): void {
  if (isValidFormatter(formatter)) {
    // フォーマッターを設定
    console.log('Formatter set successfully');
  } else {
    console.log('Invalid formatter provided');
  }
}
```

#### 注意事項

- エラーを投げずに boolean 値を返します
- validateFormatter 内部で使用されています

### validateLogger

```typescript
export const validateLogger = (logger: unknown): void
```

#### パラメータ

- `logger: unknown` - 検証対象のロガー関数

#### 戻り値

- `void` - 戻り値なし (有効な場合は正常終了、無効な場合は例外)

#### 動作

ロガー関数が有効かどうかを検証します。null、undefined、または関数以外の値の場合は AgLoggerError を投げます。

#### 使用例

```typescript
import { validateLogger } from '@agla-utils/ag-logger';
import { ConsoleLogger } from '@agla-utils/ag-logger';

// 有効なロガー
try {
  validateLogger(ConsoleLogger); // 正常終了

  // カスタムロガー
  const customLogger = (message: string): void => {
    console.log(`Custom: ${message}`);
  };
  validateLogger(customLogger); // 正常終了
} catch (error) {
  // エラーは発生しない
}

// 無効なロガー (エラーを投げる)
try {
  validateLogger(null); // AgLoggerError
} catch (error) {
  console.error(error.message); // "logger must be a valid function"
}

try {
  validateLogger('not a function'); // AgLoggerError
} catch (error) {
  console.error(error.message); // "logger must be a valid function"
}
```

#### 注意事項

- 有効な場合は何も返さず、無効な場合のみ例外を投げます
- エラータイプは CONFIG です
- 関数の内容や署名は検証せず、関数型かどうかのみをチェックします

### isValidLogger

```typescript
export const isValidLogger = (logger: unknown): boolean
```

#### パラメータ

- `logger: unknown` - 検証対象の値

#### 戻り値

- `boolean` - 有効なロガー関数の場合 true、そうでなければ false

#### 動作

値が有効なロガー関数かどうかを判定します。null、undefined でなく、かつ関数型である場合に true を返します。

#### 使用例

```typescript
import { isValidLogger } from '@agla-utils/ag-logger';

// 有効なロガー
console.log(isValidLogger((msg) => console.log(msg))); // true
console.log(isValidLogger(function logger() {})); // true

// 無効なロガー
console.log(isValidLogger(null)); // false
console.log(isValidLogger(undefined)); // false
console.log(isValidLogger('function')); // false

// 安全なロガー設定
function setLoggerSafely(logger: unknown): void {
  if (isValidLogger(logger)) {
    console.log('Logger set successfully');
  } else {
    console.log('Invalid logger provided');
  }
}
```

### isStandardLogLevel

```typescript
export const isStandardLogLevel = (logLevel: AgLogLevel | undefined): boolean
```

#### パラメータ

- `logLevel: AgLogLevel | undefined` - 検証対象のログレベル

#### 戻り値

- `boolean` - 標準ログレベル (0-6) の場合 true、そうでなければ false

#### 動作

ログレベルが標準レベル (OFF(0), FATAL(1), ERROR(2), WARN(3), INFO(4), DEBUG(5), TRACE(6)) かどうかを判定します。特殊レベル (VERBOSE, LOG, DEFAULT) は false を返します。

#### 使用例

```typescript
import { AG_LOGLEVEL, isStandardLogLevel } from '@agla-utils/ag-logger';

// 標準レベル
console.log(isStandardLogLevel(AG_LOGLEVEL.OFF)); // true
console.log(isStandardLogLevel(AG_LOGLEVEL.INFO)); // true
console.log(isStandardLogLevel(AG_LOGLEVEL.TRACE)); // true

// 特殊レベル
console.log(isStandardLogLevel(AG_LOGLEVEL.VERBOSE)); // false
console.log(isStandardLogLevel(AG_LOGLEVEL.LOG)); // false
console.log(isStandardLogLevel(AG_LOGLEVEL.DEFAULT)); // false

// 無効な値
console.log(isStandardLogLevel(undefined)); // false
console.log(isStandardLogLevel(99 as AgLogLevel)); // false

// 標準レベルのみを処理する関数
function processStandardLevel(level: AgLogLevel): string {
  if (isStandardLogLevel(level)) {
    return `Processing standard level: ${level}`;
  }
  return 'Not a standard level';
}
```

#### 注意事項

- 内部で isValidLogLevel を使用して事前チェックを行います
- 0-6 の範囲のみを標準レベルとして扱います
- パフォーマンスを考慮した早期リターン設計になっています

### isAgMockConstructor

```typescript
export const isAgMockConstructor = (value: unknown): value is AgMockConstructor
```

#### パラメータ

- `value: unknown` - 検証対象の値

#### 戻り値

- `boolean` - AgMockConstructor の場合 true、そうでなければ false

#### 動作

値が AgMockConstructor かどうかを判定します。関数型で、かつ `__isMockConstructor` プロパティが true の場合に true を返します。

#### 使用例

```typescript
import { isAgMockConstructor } from '@agla-utils/ag-logger';

// 通常の関数
const normalFunction = () => {};
console.log(isAgMockConstructor(normalFunction)); // false

// Mock Constructor（実装例）
const MockConstructor = () => {};
(MockConstructor as any).__isMockConstructor = true;
console.log(isAgMockConstructor(MockConstructor)); // true

// 型ガードとしての使用
function handleValue(value: unknown): string {
  if (isAgMockConstructor(value)) {
    // この時点で value は AgMockConstructor 型
    return 'Mock constructor detected';
  }
  return 'Not a mock constructor';
}
```

#### 注意事項

- TypeScript の型ガード関数として機能します
- **特殊な内部マーカーに依存します**

## 組み合わせ使用例

### 安全なロガー設定関数

```typescript
import {
  AgLoggerError,
  validateFormatter,
  validateLogger,
  validateLogLevel,
} from '@agla-utils/ag-logger';

interface SafeLoggerOptions {
  logLevel?: unknown;
  formatter?: unknown;
  defaultLogger?: unknown;
}

function createSafeLogger(options: SafeLoggerOptions): AgLogger {
  try {
    // バリデーション実行
    const validLogLevel = options.logLevel !== undefined
      ? validateLogLevel(options.logLevel)
      : AG_LOGLEVEL.INFO;

    if (options.formatter) {
      validateFormatter(options.formatter);
    }

    if (options.defaultLogger) {
      validateLogger(options.defaultLogger);
    }

    // バリデーション通過後にロガー作成
    return AgLogger.createLogger({
      logLevel: validLogLevel,
      formatter: options.formatter as AgFormatFunction,
      defaultLogger: options.defaultLogger as AgLoggerFunction,
    });
  } catch (error) {
    if (error instanceof AgLoggerError) {
      throw new Error(`Logger configuration error: ${error.message}`);
    }
    throw error;
  }
}
```

### 型安全なレベル判定

```typescript
import { isStandardLogLevel, isValidLogLevel } from '@agla-utils/ag-logger';

function analyzeLogLevel(input: unknown): {
  isValid: boolean;
  isStandard: boolean;
  level?: AgLogLevel;
  analysis: string;
} {
  if (!isValidLogLevel(input)) {
    return {
      isValid: false,
      isStandard: false,
      analysis: `Invalid log level: ${typeof input}`,
    };
  }

  const isStandard = isStandardLogLevel(input);

  return {
    isValid: true,
    isStandard,
    level: input,
    analysis: isStandard
      ? `Standard log level: ${input}`
      : `Special log level: ${input}`,
  };
}

// 使用例
console.log(analyzeLogLevel(AG_LOGLEVEL.INFO));
// { isValid: true, isStandard: true, level: 4, analysis: "Standard log level: 4" }

console.log(analyzeLogLevel(AG_LOGLEVEL.VERBOSE));
// { isValid: true, isStandard: false, level: -11, analysis: "Special log level: -11" }

console.log(analyzeLogLevel('invalid'));
// { isValid: false, isStandard: false, analysis: "Invalid log level: string" }
```

## エラーハンドリング

### AgLoggerError の構造

```typescript
import { AgLoggerError } from '@agla-utils/ag-logger';

try {
  validateLogLevel('invalid');
} catch (error) {
  if (error instanceof AgLoggerError) {
    console.log(error.message); // 詳細なエラーメッセージ
    console.log(error.errorType); // "VALIDATION" または "CONFIG"
    console.log(error.context); // 追加情報（存在する場合）
  }
}
```

### 共通エラーハンドリングパターン

```typescript
import { AgLoggerError, validateLogLevel } from '@agla-utils/ag-logger';

function safeValidateLogLevel(input: unknown): AgLogLevel | null {
  try {
    return validateLogLevel(input);
  } catch (error) {
    if (error instanceof AgLoggerError) {
      console.warn(`Validation failed: ${error.message}`);
      return null;
    }
    throw error; // 予期しないエラーは再投げ
  }
}

// 使用例
const level1 = safeValidateLogLevel(AG_LOGLEVEL.INFO); // 4
const level2 = safeValidateLogLevel('invalid'); // null（警告ログ出力）
```

### バッチバリデーション

```typescript
import {
  AgLoggerError,
  validateFormatter,
  validateLogger,
  validateLogLevel,
} from '@agla-utils/ag-logger';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateConfiguration(config: {
  logLevel?: unknown;
  formatter?: unknown;
  defaultLogger?: unknown;
}): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // ログレベル検証
  if (config.logLevel !== undefined) {
    try {
      validateLogLevel(config.logLevel);
    } catch (error) {
      if (error instanceof AgLoggerError) {
        result.errors.push(`Log Level: ${error.message}`);
        result.isValid = false;
      }
    }
  }

  // フォーマッター検証
  if (config.formatter !== undefined) {
    try {
      validateFormatter(config.formatter);
    } catch (error) {
      if (error instanceof AgLoggerError) {
        result.errors.push(`Formatter: ${error.message}`);
        result.isValid = false;
      }
    }
  }

  // ロガー検証
  if (config.defaultLogger !== undefined) {
    try {
      validateLogger(config.defaultLogger);
    } catch (error) {
      if (error instanceof AgLoggerError) {
        result.errors.push(`Logger: ${error.message}`);
        result.isValid = false;
      }
    }
  }

  return result;
}
```

## パフォーマンス考慮事項

### 効率的な使用パターン

- **validateLogLevel**: 段階的チェックによる早期リターンで高速化
- **isValidLogLevel**: Boolean チェックのため軽量
- **isStandardLogLevel**: 範囲チェックによる O(1) 判定
- **型ガード関数**: TypeScript コンパイル時の型推論支援

### 推奨事項

- 頻繁にバリデーションが必要な場合は `is*` 系関数を優先使用
- エラー詳細が必要な場合のみ `validate*` 系関数を使用
- バッチ処理では個別エラーをキャッチして継続処理を実装

## 注意事項

- すべてのバリデーション関数は実行時チェックを行います
- TypeScript の型システムと併用することで、コンパイル時と実行時の両方で型安全性を確保できます
- AgLoggerError はエラータイプ (VALIDATION, CONFIG) で分類されており、適切なエラーハンドリングが可能です
- `validate*` 系関数は例外を投げるため、必要に応じて try-catch での処理が必要です
- `is*` 系関数は例外を投げず、安全な boolean 判定を提供します

## 関連項目

- [AgLogLevel](../types/AgLogLevel.md) - ログレベル型定義
- [AgLogHelpers](./AgLogHelpers.md) - ヘルパー関数群
- [AgLoggerError](../types/AgLoggerError.md) - エラークラス仕様
- [AgLoggerOptions](../types/AgLoggerOptions.md) - 設定オプション型定義
- [JsonFormatter](../plugins/formatters/JsonFormatter.md) - バリデーションの使用例
- [ConsoleLogger](../plugins/loggers/ConsoleLogger.md) - ロガーバリデーションの使用例
