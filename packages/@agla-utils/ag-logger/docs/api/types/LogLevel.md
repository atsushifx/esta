---
header:
  - src: packages/@agla-utils/ag-logger/docs/api/types/LogLevel.md
  - @(#): ログレベル 型定義 APIリファレンス
title: ログレベル
description: AgLoggerで使用されるログレベルの定義と型情報のAPIリファレンス
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

`AgLogger`は、`AWS CloudWatch Logs`規約に基づいたログレベルシステムを採用しています。数値ベースのログレベルと文字列ラベルの両方をサポートしています。

## ログレベル定数

### AG_LOGLEVEL

ログレベルの数値定数を定義したオブジェクトです。

```typescript
export const AG_LOGLEVEL = {
  OFF: 0, // ログ出力なし
  FATAL: 1, // 致命的エラー（アプリケーション終了を伴う）
  ERROR: 2, // エラー（アプリケーションは継続）
  WARN: 3, // 警告（潜在的な問題）
  INFO: 4, // 一般的な情報
  DEBUG: 5, // デバッグ情報
  TRACE: 6, // 詳細なトレース情報

  // 特殊レベル
  VERBOSE: -11, // 詳細モード専用
  LOG: -12, // 強制出力（フィルタ無視）
  DEFAULT: -99, // デフォルト値（INFOと同等）
} as const;
```

#### 標準ログレベル (0-6)

- OFF (0): ログ出力を行いません
- FATAL (1): アプリケーション終了を引き起こす致命的エラー
- ERROR (2): アプリケーションは継続するエラー状況
- WARN (3): 潜在的に有害な状況の警告
- INFO (4): 一般的な情報メッセージ
- DEBUG (5): デバッグ用の詳細情報
- TRACE (6): 非常に詳細なトレース情報

#### 特殊ログレベル

- VERBOSE (-11): 詳細フラグが有効なときのみ出力
- LOG (-12): ログレベルフィルタを無視して常に出力
- DEFAULT (-99): デフォルト設定（INFO レベルと同等の動作）

## 型定義

### AgLogLevel

ログレベルの数値型です。`AG_LOGLEVEL` の値から派生されます。

```typescript
export type AgLogLevel = typeof AG_LOGLEVEL[keyof typeof AG_LOGLEVEL];
// 結果: 0 | 1 | 2 | 3 | 4 | 5 | 6 | -11 | -12 | -99
```

### AgLogLevelLabel

ログレベルの文字列ラベル型です。`AG_LOGLEVEL` のキーから派生されます。

```typescript
export type AgLogLevelLabel = keyof typeof AG_LOGLEVEL;
// 結果: 'OFF' | 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE' | 'VERBOSE' | 'LOG' | 'DEFAULT'
```

## 変換マップ

### AG_LOGLEVEL_TO_LABEL_MAP

数値ログレベルから文字列ラベルへの変換マップです。

```typescript
export const AG_LOGLEVEL_TO_LABEL_MAP: Record<AgLogLevel, AgLogLevelLabel>;

// 使用例
const label = AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.INFO]; // 'INFO'
```

### AG_LABEL_TO_LOGLEVEL_MAP

文字列ラベルから数値ログレベルへの変換マップです。

```typescript
export const AG_LABEL_TO_LOGLEVEL_MAP: Record<AgLogLevelLabel, AgLogLevel>;

// 使用例
const level = AG_LABEL_TO_LOGLEVEL_MAP['INFO']; // 4
```

## ユーティリティ配列

### AG_LOGLEVEL_VALUES

すべてのログレベル数値の配列です。

```typescript
export const AG_LOGLEVEL_VALUES: AgLogLevel[];
// [0, 1, 2, 3, 4, 5, 6, -11, -12, -99]
```

### AG_LOGLEVEL_KEYS

すべてのログレベルラベルの配列です。

```typescript
export const AG_LOGLEVEL_KEYS: AgLogLevelLabel[];
// ['OFF', 'FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE', 'VERBOSE', 'LOG', 'DEFAULT']
```

## 使用例

### 基本的な使用方法

```typescript
import { AG_LOGLEVEL, AgLogLevel } from '@agla-utils/ag-logger';

// ログレベルの設定
const logLevel: AgLogLevel = AG_LOGLEVEL.INFO;

// ログレベルの比較
if (currentLevel >= AG_LOGLEVEL.ERROR) {
  // エラー以上のレベルの場合の処理
}
```

### ログレベルの変換

```typescript
import {
  AG_LABEL_TO_LOGLEVEL_MAP,
  AG_LOGLEVEL,
  AG_LOGLEVEL_TO_LABEL_MAP,
} from '@agla-utils/ag-logger';

// 数値から文字列への変換
const levelNumber = AG_LOGLEVEL.ERROR;
const levelLabel = AG_LOGLEVEL_TO_LABEL_MAP[levelNumber]; // 'ERROR'

// 文字列から数値への変換
const labelString = 'WARN';
const labelNumber = AG_LABEL_TO_LOGLEVEL_MAP[labelString]; // 3
```

### 動的ログレベル設定

```typescript
import { AG_LOGLEVEL, AgLogLevel, AgLogLevelLabel } from '@agla-utils/ag-logger';

function setLogLevelFromString(levelStr: string): AgLogLevel {
  const upperLevel = levelStr.toUpperCase() as AgLogLevelLabel;
  if (upperLevel in AG_LABEL_TO_LOGLEVEL_MAP) {
    return AG_LABEL_TO_LOGLEVEL_MAP[upperLevel];
  }
  return AG_LOGLEVEL.INFO; // デフォルト
}

// 環境変数からログレベルを設定
const envLogLevel = process.env.LOG_LEVEL || 'INFO';
const logLevel = setLogLevelFromString(envLogLevel);
```

### ログレベルフィルタリング

```typescript
import { AG_LOGLEVEL, AgLogLevel } from '@agla-utils/ag-logger';

function shouldLog(messageLevel: AgLogLevel, currentLevel: AgLogLevel): boolean {
  // 特殊レベルの処理
  if (messageLevel === AG_LOGLEVEL.LOG) {
    return true; // 常に出力
  }

  if (messageLevel === AG_LOGLEVEL.VERBOSE) {
    // 詳細モードの状態に依存
    return isVerboseMode;
  }

  // 標準ログレベルのフィルタリング
  if (currentLevel === AG_LOGLEVEL.OFF) {
    return false;
  }

  return messageLevel <= currentLevel;
}
```

## 注意事項

- 特殊ログレベル（VERBOSE、LOG、DEFAULT）は `logLevel` プロパティの設定値としては使用できません
- ログレベルフィルタリングは数値の大小比較で行われます（小さい値ほど重要度が高い）
- `OFF` レベルが設定されている場合、特殊レベル以外のすべてのログが出力されません
- `DEFAULT` レベルは内部的に `INFO` レベルと同等として扱われる

## 関連項目

- [AgLogger](../AgLogger.md)
- [バリデーター](../utils/AgLogValidators.md)
- [設定インターフェース](./Interfaces.md)
