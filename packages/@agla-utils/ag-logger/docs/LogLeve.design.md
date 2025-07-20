---
header:
  - src: docs/LogLevel-Design.md
  - "@(#)": ag-logger LogLevel implementation design document
title: ag-logger LogLevel設計書
description: ag-loggerのログレベル実装における設計方針とパターン比較
version: 1.0.0
created: 2025-07-20
updated: 2025-07-20
authors:
  - Claude（設計検討・仕様策定）
  - atsushifx（要件確認・設計確定）
changes:
  - 2025-07-20: 初回作成（enum vs const assertion vs 文字列マップ導出の比較検討）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

ag-loggerにおけるログレベル実装の設計方針および実装パターンについて、enum vs const assertion vs 文字列マップ導出の比較検討結果をまとめる。

## 現状分析

### 現在の実装

```typescript
// 数値定数定義
export const AgLogLevelCode = {
  OFF: 0,
  FATAL: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  DEBUG: 5,
  TRACE: 6,
} as const;

// 型定義
export type AgLogLevel = typeof AgLogLevelCode[keyof typeof AgLogLevelCode];

// 逆変換マップ（数値→文字列）
export const AgLogLevelLabels: Record<AgLogLevel, string> = {
  [AgLogLevelCode.OFF]: 'off',
  [AgLogLevelCode.FATAL]: 'fatal',
  [AgLogLevelCode.ERROR]: 'error',
  [AgLogLevelCode.WARN]: 'warn',
  [AgLogLevelCode.INFO]: 'info',
  [AgLogLevelCode.DEBUG]: 'debug',
  [AgLogLevelCode.TRACE]: 'trace',
};
```

### 問題点

1. 二重定義: `AgLogLevelCode`と`AgLogLevelLabels`を手動で維持
2. 不整合リスク: 定数と逆変換マップの同期が必要
3. 設定ファイル連携: 文字列設定値との変換ロジックが別途必要
4. 不要なexport: `AgLogLevelLabels`が公開APIで未使用

## 設計アプローチ比較

### アプローチ1: enum方式

```typescript
export enum LogLevel {
  OFF = 0,
  FATAL = 1,
  ERROR = 2,
  WARN = 3,
  INFO = 4,
  DEBUG = 5,
  TRACE = 6,
}
```

**評価:**

- 直感的で一般的
- reverse mappingによる予期しない動作
- 文字列enumとの混在リスク
- 設定ファイルとの連携で追加変換必要

### アプローチ2: const assertion + 導出型（現在）

```typescript
export const AgLogLevelCode = { OFF: 0, ... } as const;
export type AgLogLevel = typeof AgLogLevelCode[keyof typeof AgLogLevelCode];
```

**評価:**

- 型安全性確保
- 実行時不変
- 二重定義による保守性問題
- 設定値変換の複雑性

### アプローチ3: 文字列マップから導出

```typescript
export const LogLevelMap = {
  'OFF': 0, 'FATAL': 1, 'ERROR': 2, ...
} as const;
```

**評価:**

- 設定ファイルとの直接対応
- 単一の真実の源泉
- 数値定数アクセスが間接的

### アプローチ4: 数値定数ベース + 部分自動化（推奨）

```typescript
export const LOG_LEVEL = {
  OFF: 0,
  FATAL: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  DEBUG: 5,
  TRACE: 6,
} as const;

export const LogLevelFromString = {
  'OFF': LOG_LEVEL.OFF,
  'FATAL': LOG_LEVEL.FATAL,
  // ...
} as const;

// 逆変換のみ自動生成
const LogLevelToString = Object.fromEntries(
  Object.entries(LogLevelFromString).map(([key, value]) => [value, key]),
) as Record<LogLevel, LogLevelName>;
```

## 採用方針

### 推奨設計: アプローチ4（数値定数ベース + 部分自動化）

#### 理由

1. 読みやすさ優先:
   - `LOG_LEVEL.ERROR`が直感的
   - 自動生成部分を最小限に抑制

2. 保守性向上:
   - 数値定数の変更が文字列マップに自動反映
   - 逆変換マップは自動生成で不整合回避

3. 設定ファイル連携:
   - `LogLevelFromString`で直接変換
   - 設定値検証が容易

4. API設計:
   - 内部実装詳細は非export
   - 必要最小限の公開API

### 実装例

```typescript
// === Core definitions ===
export const LOG_LEVEL = {
  OFF: 0,
  FATAL: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  DEBUG: 5,
  TRACE: 6,
} as const;

export const LogLevelFromString = {
  'OFF': LOG_LEVEL.OFF,
  'FATAL': LOG_LEVEL.FATAL,
  'ERROR': LOG_LEVEL.ERROR,
  'WARN': LOG_LEVEL.WARN,
  'INFO': LOG_LEVEL.INFO,
  'DEBUG': LOG_LEVEL.DEBUG,
  'TRACE': LOG_LEVEL.TRACE,
} as const;

// === Internal utilities (non-exported) ===
const LogLevelToString = Object.fromEntries(
  Object.entries(LogLevelFromString).map(([key, value]) => [value, key]),
) as Record<LogLevel, LogLevelName>;

// === Type definitions ===
export type LogLevel = typeof LOG_LEVEL[keyof typeof LOG_LEVEL];
export type LogLevelName = keyof typeof LogLevelFromString;

// === Public API ===
export const getLogLevelFromString = (levelName: string): LogLevel | undefined => {
  return LogLevelFromString[levelName as LogLevelName];
};

export const getLogLevelLabel = (level: LogLevel): string => {
  return LogLevelToString[level].toUpperCase();
};
```

### マイグレーション方針

1. 段階的移行: 既存のAPIを保持しつつ新実装を並行導入
2. 後方互換性: `AgLogLevelCode`のエイリアス提供
3. 内部リファクタリング: 新しい定数・関数への段階的移行
4. 非破壊変更: パッケージの公開APIを変更せず内部実装のみ改善

## 実装上の注意点

### Export方針

- Export: `LOG_LEVEL`, `LogLevelFromString`, 型定義, 公開API関数
- Non-export: `LogLevelToString`, 内部ヘルパー関数

### 設定ファイル連携

```typescript
// 設定ファイルからの読み込み例
const configLevel = config.logLevel; // "INFO"
const numericLevel = getLogLevelFromString(configLevel); // 4

if (numericLevel !== undefined) {
  logger.setLogLevel(numericLevel);
}
```

### テスト戦略

1. 定数値の一貫性テスト
2. 文字列→数値変換テスト
3. 逆変換の整合性テスト
4. 大文字・小文字の扱いテスト

## 結論

数値定数ベース + 部分自動化アプローチにより、以下を実現する:

- 読みやすさ: 直感的な定数アクセス
- 保守性: 単一定義からの自動生成
- 型安全性: TypeScriptの型システム活用
- 実用性: 設定ファイルとの親和性
- 拡張性: 将来的なログレベル追加への対応

この設計により、ag-loggerのログレベル管理をより堅牢で保守しやすいものとする。
