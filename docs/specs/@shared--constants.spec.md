---
header:
  - src: docs/specs/@shared--constants.spec.md
  - @(#): 共通定数パッケージ仕様書
title: 🔧 共通定数パッケージ仕様書（@shared/constants）
description: estaモノレポ全体で使用される共通定数を集約したパッケージの技術仕様書
version: 1.0.0
created: 2025-09-04
authors:
  - atsushifx
changes:
  - 2025-09-04: フロントマター標準化対応
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 🔧 共通定数パッケージ仕様書

## 概要

`@shared/constants`は、esta モノレポ全体で使用される共通定数を集約したパッケージです。アプリケーション全体で一貫した設定値・定数を提供し、重複を排除して保守性を向上させます。

## 主要機能

### 1. 定数の集約管理

- アプリケーション全体で使用される定数の統一管理
- 重複排除による保守性向上
- 一箇所での変更による全体への反映

### 2. カテゴリ別定数管理

- 機能別の定数グループ化
- 用途に応じた定数の分類
- 明確な命名規則による可読性向上

### 3. 型安全な定数定義

- TypeScript の型システムを活用
- `const assertion`による型推論
- 実行時の値変更防止

## 定数カテゴリ

### 1. 共通定数 (`common.ts`)

- アプリケーション全体で使用される汎用定数
- 文字列リテラル、数値リテラル
- 設定値のデフォルト値

### 2. デフォルト値 (`defaults.ts`)

- 各機能のデフォルト設定値
- フォールバック値
- 初期化時の標準値

### 3. ディレクトリ定数 (`directories.ts`)

- ファイルシステムパス
- 作業ディレクトリ
- 設定ファイルパス

### 4. 終了コード (`exit-code.ts`)

- システム終了時のステータスコード
- エラー分類別の終了コード
- 標準的な終了コード定義

## API仕様

### エクスポート構造

```typescript
// メインエクスポート
export * from './common';
export * from './defaults';
export * from './directories';
export * from './exit-code';
```

### 定数定義パターン

#### 1. 基本定数

```typescript
// 文字列定数
export const APP_NAME = 'esta' as const;
export const VERSION = '1.0.0' as const;

// 数値定数
export const DEFAULT_TIMEOUT = 5000 as const;
export const MAX_RETRIES = 3 as const;
```

#### 2. オブジェクト定数

```typescript
// 設定オブジェクト
export const DEFAULT_CONFIG = {
  timeout: 5000,
  retries: 3,
  debug: false,
} as const;
```

#### 3. 配列定数

```typescript
// 許可される値の配列
export const SUPPORTED_FORMATS = [
  'json',
  'yaml',
  'toml',
] as const;
```

#### 4. 列挙型風定数

```typescript
// 文字列列挙
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

// 数値列挙
export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  MISUSE: 2,
  CANNOT_EXECUTE: 126,
  COMMAND_NOT_FOUND: 127,
} as const;
```

## 使用例

### 基本的な使用

```typescript
import {
  APP_NAME,
  DEFAULT_CONFIG,
  DEFAULT_TIMEOUT,
  EXIT_CODES,
} from '@shared/constants';

console.log(`Starting ${APP_NAME}...`);

// タイムアウト設定
const timeout = DEFAULT_TIMEOUT;

// 終了コード使用
process.exit(EXIT_CODES.SUCCESS);

// 設定値使用
const config = { ...DEFAULT_CONFIG, debug: true };
```

### 特定カテゴリの使用

```typescript
import {
  DEFAULT_CACHE_DIR,
  DEFAULT_INSTALL_DIR,
} from '@shared/constants';

// ディレクトリ設定
const installPath = path.join(DEFAULT_INSTALL_DIR, 'tools');
const cachePath = path.join(DEFAULT_CACHE_DIR, 'downloads');
```

### 型安全な使用

```typescript
import { LOG_LEVELS, SUPPORTED_FORMATS } from '@shared/constants';

// 型推論による安全な使用
type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];
type SupportedFormat = typeof SUPPORTED_FORMATS[number];

function setLogLevel(level: LogLevel) {
  // 型安全な実装
}

function parseFile(format: SupportedFormat) {
  // 型安全な実装
}
```

## 定数定義ガイドライン

### 1. 命名規則

- 大文字スネークケース: `DEFAULT_TIMEOUT`
- 意味のある名前: `MAX_RETRY_COUNT`（`MAX_CNT`ではない）
- プレフィックス: カテゴリ別のプレフィックス使用

### 2. 値の定義

- const assertion: `as const`を使用
- 型安全性: TypeScript の型システムを活用
- 不変性: 値の変更を防止

### 3. グループ化

- 機能別分類: 関連する定数をまとめる
- ファイル分割: 用途に応じたファイル分割
- 明確な境界: 各カテゴリの責任範囲を明確化

### 4. ドキュメント化

- コメント: 定数の用途・意味を記述
- 例: 使用例を含める
- 制約: 値の制約や条件を記述

## 設計原則

### 1. 単一責任原則

- 各定数は明確な目的を持つ
- 関連する定数をグループ化
- 責任の分離

### 2. 不変性

- 定数値の変更防止
- `const assertion`による型固定
- 実行時の値変更防止

### 3. 可読性

- 自己文書化する命名
- 読みやすいコメント
- 論理的なグループ化

### 4. 再利用性

- 汎用的な定数定義
- 特定機能に依存しない設計
- 他パッケージからの利用容易性

## 内部構造

### ディレクトリ構成

```bash
@shared/constants/
├── base/
│   ├── common.ts      # 共通定数
│   ├── defaults.ts    # デフォルト値
│   ├── directories.ts # ディレクトリパス
│   ├── exit-code.ts   # 終了コード
│   └── index.ts       # バレルエクスポート
├── lib/               # CJS出力
├── module/            # ESM出力
└── package.json
```

### ビルドシステム

- tsup: CJS/ESM 両対応
- 型定義: `.d.ts`ファイル生成
- ソースマップ: デバッグ用マップ生成

## 依存関係

### 外部依存

- なし（標準ライブラリのみ）

### 内部依存

- なし（他パッケージに依存しない）

## テスト仕様

### ユニットテスト

- 定数値の検証
- 型安全性の確認
- エクスポート構造の検証

### 統合テスト

- 他パッケージからの利用テスト
- 循環依存の検証
- ビルド結果の検証

## 使用場面

### 1. 設定管理

```typescript
// アプリケーション設定
import { DEFAULT_CONFIG } from '@shared/constants';

const appConfig = {
  ...DEFAULT_CONFIG,
  customSetting: 'value',
};
```

### 2. エラーハンドリング

```typescript
// 終了コード使用
import { EXIT_CODES } from '@shared/constants';

if (error) {
  process.exit(EXIT_CODES.GENERAL_ERROR);
}
```

### 3. ファイルシステム操作

```typescript
// ディレクトリパス使用
import { DEFAULT_CACHE_DIR } from '@shared/constants';

const cacheFile = path.join(DEFAULT_CACHE_DIR, 'data.json');
```

## 今後の拡張予定

- 環境変数連携機能
- 設定ファイルからの動的読み込み
- 定数の検証機能
- 定数使用状況の分析ツール
