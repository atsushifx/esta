---
header:
  - src: docs/api/utils/AgLogHelpers.md
  - "@(#)": ログヘルパー関数群 ユーティリティ APIリファレンス
title: AgLogHelpers
description: ログレベル変換やメッセージ処理のためのヘルパー関数群のAPIリファレンス
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

## AgLogHelpers

## 概要

**AgLogHelpers**は、ログレベル変換、メッセージ抽出、文字列処理などのヘルパー関数を提供するユーティリティモジュールです。主にフォーマッターやロガープラグインで使用され、ログメッセージの処理を効率化し、一貫性のあるログデータ変換機能を提供します。

## 関数一覧

<!-- markdownlint-disable no-duplicate-heading -->

### AgToLabel

```typescript
export const AgToLabel = (level: AgLogLevel): AgLogLevelLabel | ''
```

#### パラメータ

- `level: AgLogLevel` - 変換対象の数値ログレベル

#### 戻り値

- `AgLogLevelLabel | ''` - ログレベルに対応する文字列ラベル、または空文字列

#### 動作

数値ログレベルを対応する文字列ラベルに変換します。LOG レベル（-12）や無効なレベルの場合は空文字列を返します。

#### 使用例

```typescript
import { AG_LOGLEVEL, AgToLabel } from '@agla-utils/ag-logger';

// 標準レベルの変換
const errorLabel = AgToLabel(AG_LOGLEVEL.ERROR); // 'ERROR'
const infoLabel = AgToLabel(AG_LOGLEVEL.INFO); // 'INFO'
const debugLabel = AgToLabel(AG_LOGLEVEL.DEBUG); // 'DEBUG'

// 特別レベル
const logLabel = AgToLabel(AG_LOGLEVEL.LOG); // '' (空文字列)
const verboseLabel = AgToLabel(AG_LOGLEVEL.VERBOSE); // 'VERBOSE'

// 無効なレベル
const invalidLabel = AgToLabel(999 as AgLogLevel); // '' (空文字列)
```

#### 注意事項

- LOG レベル（-12）に対しては常に空文字列を返す
- 無効なログレベル値に対しては空文字列を返す
- バリデーションは内部で isValidLogLevel を使用して実行される

### AgToLogLevel

```typescript
export const AgToLogLevel = (label: string): AgLogLevel | undefined
```

#### パラメータ

- `label: string` - 変換対象のログレベルラベル文字列

#### 戻り値

- `AgLogLevel | undefined` - 対応する数値ログレベル、または undefined（無効なラベルの場合）

#### 動作

文字列ラベルを対応する数値ログレベルに変換します。大文字小文字を区別せず、前後の空白を自動的にトリムします。

#### 使用例

```typescript
import { AgToLogLevel } from '@agla-utils/ag-logger';

// 標準的な変換
const errorLevel = AgToLogLevel('ERROR'); // 2
const warnLevel = AgToLogLevel('WARN'); // 3
const infoLevel = AgToLogLevel('INFO'); // 4

// 大文字小文字の変換とトリム
const debugLevel = AgToLogLevel('debug'); // 5 (小文字も対応)
const traceLevel = AgToLogLevel(' TRACE '); // 6 (前後の空白を自動削除)

// 特別レベル
const verboseLevel = AgToLogLevel('VERBOSE'); // -11
const defaultLevel = AgToLogLevel('DEFAULT'); // -99

// 無効なラベル
const invalid1 = AgToLogLevel('INVALID'); // undefined
const invalid2 = AgToLogLevel(''); // undefined
const invalid3 = AgToLogLevel(null as any); // undefined
```

#### 注意事項

- 入力値の型チェックを実行し、文字列以外は undefined を返す
- 大文字小文字を区別せず、内部で toUpperCase() を使用
- 前後の空白は自動的にトリムされる

### extractMessage

```typescript
export const extractMessage = (args: readonly unknown[]): string
```

#### パラメータ

- `args: readonly unknown[]` - 処理対象のログ引数配列

#### 戻り値

- `string` - プリミティブ値から構成された連結メッセージ文字列

#### 動作

引数配列からプリミティブ値 (string, number, boolean, symbol) のみを抽出し、空白区切りの文字列として連結します。オブジェクトや配列などの複合型は無視されます。

#### 使用例

```typescript
import { extractMessage } from '@agla-utils/ag-logger';

// プリミティブ値の結合
const message1 = extractMessage(['Hello', 123, true]);
// 結果: 'Hello 123 true'

// オブジェクトを含む場合（オブジェクトは除外）
const message2 = extractMessage(['User', { id: 123 }, 'logged in', false]);
// 結果: 'User logged in false'

// 空配列の場合
const message3 = extractMessage([]);
// 結果: ''

// Symbol を含む場合
const sym = Symbol('test');
const message4 = extractMessage(['Symbol:', sym, 'included']);
// 結果: 'Symbol: Symbol(test) included'

// null/undefined を含む場合
const message5 = extractMessage(['Value:', null, 'and', undefined]);
// 結果: 'Value: null and undefined'
```

#### 注意事項

- オブジェクト、配列、関数などの複合型は結果に含まれません
- null や undefined はプリミティブとして扱われ、文字列として処理される
- Symbol 型もプリミティブとして処理される

### valueToString

```typescript
export const valueToString = (value: unknown): string
```

#### パラメータ

- `value: unknown` - 文字列化対象の値

#### 戻り値

- `string` - 型に応じた文字列表現

#### 動作

任意の値を型に応じて文字列表現に変換します。JSON.stringify では処理できない値に対して安全なフォールバック処理を提供します。

#### 使用例

```typescript
import { valueToString } from '@agla-utils/ag-logger';

// 基本データ型
const nullStr = valueToString(null); // 'null'
const undefinedStr = valueToString(undefined); // 'undefined'
const stringStr = valueToString('test'); // '"test"'
const numberStr = valueToString(42); // '42'
const booleanStr = valueToString(true); // 'true'

// 配列
const emptyArray = valueToString([]); // 'array'
const filledArray = valueToString([1, 2, 3]); // '[1,2,3]'
const mixedArray = valueToString(['a', 1, true]); // '[a,1,true]'

// 関数
const anonymousFunc = valueToString(() => {}); // 'function'
const namedFunc = valueToString(function testFunc() {}); // 'function testFunc'

// オブジェクト
const simpleObj = valueToString({ key: 'value' }); // 'object'
const complexObj = valueToString({ a: 1, b: { c: 2 } }); // 'object'
```

#### 注意事項

- 文字列値はダブルクォートで囲まれて返される
- 空配列は 'array' として返される
- 匿名関数は 'function' として、名前付き関数は 'function 名前' として返される
- すべてのオブジェクトは単純に 'object' として返される

### argsToString

```typescript
export const argsToString = (args: readonly unknown[]): string
```

#### パラメータ

- `args: readonly unknown[]` - 文字列化対象の引数配列

#### 戻り値

- `string` - 空白区切りの文字列表現

#### 動作

引数配列のすべての要素を文字列化し、空白区切りで連結します。JSON.stringify を優先使用し、失敗時は valueToString にフォールバックします。

#### 使用例

```typescript
import { argsToString } from '@agla-utils/ag-logger';

// 単一引数
const single = argsToString(['single arg']);
// 結果: '"single arg"'

// 複数引数
const multiple = argsToString(['arg1', 'arg2', 'arg3']);
// 結果: '"arg1" "arg2" "arg3"'

// 空配列
const empty = argsToString([]);
// 結果: ''

// 混合型引数
const mixed = argsToString(['string', 42, true, null]);
// 結果: '"string" 42 true null'

// オブジェクトと配列
const complex = argsToString([{ key: 'value' }, [1, 2, 3]]);
// 結果: '{"key":"value"} [1,2,3]'

// 循環参照を含むオブジェクト（JSON.stringify失敗時のフォールバック）
const circular: any = { name: 'circular' };
circular.self = circular;
const circularResult = argsToString([circular]);
// 結果: 'object' (valueToStringにフォールバック)
```

#### 注意事項

- JSON.stringify が失敗した場合は自動的に valueToString にフォールバック
- 空配列の場合は空文字列を返す
- 循環参照を含むオブジェクトも安全に処理される

### createLoggerFunction

```typescript
export const createLoggerFunction = (
  moduleFunc: (level: AgLogLevel, message: AgFormattedLogMessage) => void,
): AgLoggerFunction
```

#### パラメータ

- `moduleFunc: (level: AgLogLevel, message: AgFormattedLogMessage) => void` - ラップ対象のモジュール関数

#### 戻り値

- `AgLoggerFunction` - AgLoggerFunction インターフェースに適合するロガー関数

#### 動作

既存のモジュール関数を AgLoggerFunction インターフェースに適合する形式でラップします。loggerMap での登録に使用できます。

#### 使用例

```typescript
import { AG_LOGLEVEL, createLoggerFunction } from '@agla-utils/ag-logger';

// コンソール出力用ロガーの作成
const consoleErrorLogger = createLoggerFunction((level, message) => {
  console.error(message);
});

// カスタムモジュール関数のラッピング
class CustomLogger {
  executeLog(level: AgLogLevel, message: string): void {
    // カスタムログ処理
    console.log(`[${level}] ${message}`);
  }
}

const customLogger = new CustomLogger();
const wrappedLogger = createLoggerFunction((level, message) => {
  customLogger.executeLog(level, message);
});

// loggerMapでの使用
const logger = AgLogger.createLogger({
  loggerMap: {
    [AG_LOGLEVEL.ERROR]: consoleErrorLogger,
    [AG_LOGLEVEL.WARN]: wrappedLogger,
  },
});
```

#### 注意事項

- 実際のログレベルは呼び出し元のコンテキストで管理される
- moduleFunc は同期的に実行される

## 組み合わせ使用例

### ログレベル変換の双方向処理

```typescript
import { AG_LOGLEVEL, AgToLabel, AgToLogLevel } from '@agla-utils/ag-logger';

// レベル → ラベル → レベル の変換
const originalLevel = AG_LOGLEVEL.WARN;
const label = AgToLabel(originalLevel); // 'WARN'
const convertedLevel = AgToLogLevel(label); // 3

console.log(originalLevel === convertedLevel); // true

// 安全な変換チェーン
function safeLogLevelConversion(level: AgLogLevel): string {
  const label = AgToLabel(level);
  if (label === '') {
    return 'UNKNOWN';
  }
  return label;
}
```

### カスタムフォーマッターでの活用

```typescript
import { AgToLabel, extractMessage } from '@agla-utils/ag-logger';
import type { AgFormatFunction, AgLogMessage } from '@agla-utils/ag-logger';

const CustomFormatter: AgFormatFunction = (logMessage: AgLogMessage): string => {
  const level = AgToLabel(logMessage.logLevel);
  const message = extractMessage([logMessage.message, ...logMessage.args]);
  const timestamp = logMessage.timestamp.toISOString();

  // レベルラベルが空の場合の処理
  const levelDisplay = level || 'LOG';

  return `[${timestamp}] ${levelDisplay}: ${message}`;
};

// 使用例
const logger = AgLogger.createLogger({
  formatter: CustomFormatter,
  defaultLogger: ConsoleLogger,
});

logger.info('User action', { userId: 123 });
// 出力: [2025-08-25T10:30:45.123Z] INFO: User action
```

### 引数処理の高度な例

```typescript
import { argsToString, extractMessage, valueToString } from '@agla-utils/ag-logger';

// メッセージとメタデータの分離処理
function processLogArguments(args: unknown[]): { message: string; metadata: string } {
  const message = extractMessage(args);
  const allArgs = argsToString(args);

  // プリミティブ値以外の情報も含めた完全な引数表現
  const metadata = args
    .filter((arg) => typeof arg === 'object' && arg !== null)
    .map((arg) => valueToString(arg))
    .join(' ');

  return { message, metadata };
}

// 使用例
const result = processLogArguments([
  'User login attempt',
  { userId: 123, ip: '192.168.1.1' },
  true,
  'success',
]);

console.log(result.message); // 'User login attempt true success'
console.log(result.metadata); // 'object'
```

## エラーハンドリング

### 型安全な変換処理

```typescript
import { AgToLabel, AgToLogLevel } from '@agla-utils/ag-logger';
import type { AgLogLevel } from '@agla-utils/ag-logger';

// 安全なレベル変換
function safeConvertToLabel(level: unknown): string {
  // 型ガードを使用した安全な変換
  if (typeof level === 'number') {
    const label = AgToLabel(level as AgLogLevel);
    return label || 'UNKNOWN';
  }
  return 'INVALID';
}

// 安全なラベル変換
function safeConvertToLevel(label: unknown): AgLogLevel | null {
  if (typeof label === 'string') {
    return AgToLogLevel(label) ?? null;
  }
  return null;
}
```

### 引数処理のエラーケース

```typescript
import { argsToString, extractMessage } from '@agla-utils/ag-logger';

// ロバストな引数処理
function robustArgumentProcessing(args: unknown): string {
  try {
    // 配列以外の場合の処理
    if (!Array.isArray(args)) {
      return valueToString(args);
    }

    // 空配列の処理
    if (args.length === 0) {
      return 'No arguments provided';
    }

    // 通常の処理
    const message = extractMessage(args);
    return message || argsToString(args);
  } catch (error) {
    return 'Error processing arguments';
  }
}
```

## パフォーマンス考慮事項

### 効率的な使用パターン

- AgToLabel/AgToLogLevel: マップベースの O(1) 変換を使用しており、高速
- extractMessage: フィルタリング処理のため、引数数に比例した計算量
- valueToString: 型チェックが最小限で、軽量な処理
- argsToString: JSON.stringify を優先使用するため、大きなオブジェクトでは注意が必要

### 推奨事項

- 頻繁な変換処理では結果をキャッシュすることを検討してください
- 大量の引数処理では extractMessage を優先使用してください
- 循環参照を含む可能性があるオブジェクトでは argsToString の使用に注意してください

## 注意事項

- すべての関数は null-safe に設計されており、予期しない入力でもエラーを投げません
- 型チェックは実行時に行われるため、TypeScript の型システムと併用することを推奨
- 特殊なログレベル（LOG, VERBOSE, DEFAULT）は通常のレベルとは異なる動作をする
- argsToString は JSON.stringify に依存するため、循環参照や非シリアライズ可能なオブジェクトに注意する

## 関連項目

<!-- markdownlint-enable -->

- [AgLogLevel](../types/AgLogLevel.md) - ログレベル型定義
- [AgLogValidators](./AgLogValidators.md) - バリデーション関数群
- [PlainFormatter](../plugins/formatters/PlainFormatter.md) - extractMessage の使用例
- [JsonFormatter](../plugins/formatters/JsonFormatter.md) - argsToString の使用例
- [AgLoggerOptions](../types/AgLoggerOptions.md) - 設定オプション型定義
