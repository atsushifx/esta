---
header:
  - src: docs/specs/@esta-utils-get-platform.spec.md
  - @(#) : ESTA Utils platform detection utilities
title: 💻 プラットフォーム判定ユーティリティ仕様書（@esta-utils/get-platform）
version: 1.0.0
created: 2025-07-14
updated: 2025-07-14
authors:
  - 🧠 つむぎ（プラットフォーム判定アーキテクチャ）
  - 🧁 小紅（クロスプラットフォーム対応）
  - ⚙️ エルファ（定数・型定義実装）
  - 👤 atsushifx（全体設計・仕様確定）
changes:
  - 2025-07-14: フロントマター追加とドキュメント統一
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

`@esta-utils/get-platform`は、クロスプラットフォーム対応のアプリケーション開発において、実行時プラットフォームを判定するためのユーティリティパッケージです。

## 現在の実装状況

### アーキテクチャ

```bash
src/
├── index.ts           # バレルファイル（エクスポート管理）
├── getPlatform.ts     # メイン機能実装
└── shared/
    ├── constants/
    │   ├── index.ts   # 定数のバレルファイル
    │   └── platform.ts # プラットフォーム関連定数
    └── types/
        ├── index.ts   # 型定義のバレルファイル
        └── platform.ts # プラットフォーム関連型定義
```

### 主要機能

#### 1. PLATFORM_TYPE 列挙型

```typescript
enum PLATFORM_TYPE {
  WINDOWS = 'windows',
  LINUX = 'linux',
  MACOS = 'macos',
  UNKNOWN = '', // falsy値として設計
}
```

#### 2. プラットフォーム判定関数

```typescript
getPlatform(platform?: TPlatformKey | 'unknown' | '', strict?: boolean): PLATFORM_TYPE
```

- デフォルトで`os.platform()`を使用
- strict モード：未対応プラットフォームで例外スロー
- 非 strict モード：`PLATFORM_TYPE.UNKNOWN`を返却
- プラットフォーム情報をキャッシュして重複実行を防止

#### 3. 個別判定関数

```typescript
isWindows(): boolean
isLinux(): boolean
isMacOS(): boolean
```

#### 4. PATH区切り文字取得

```typescript
getDelimiter(): string  // Windows: ';', その他: ':'
```

#### 5. キャッシュ管理

```typescript
clearPlatformCache(): void  // 主にテスト用
```

### エクスポート構造

- 名前付きエクスポート: 個別機能
- 名前空間エクスポート: `estaUtils`オブジェクト
- デフォルトエクスポート: `getPlatform`関数

### 型定義

#### プラットフォーム関連型

```typescript
// Node.js os.platform()の値とPLATFORM_TYPEのマッピング
export const PLATFORM_MAP = {
  'win32': PLATFORM_TYPE.WINDOWS,
  'linux': PLATFORM_TYPE.LINUX,
  'darwin': PLATFORM_TYPE.MACOS,
  'unknown': PLATFORM_TYPE.UNKNOWN,
} as const;

// プラットフォームキーの型
export type TPlatformKey = keyof typeof PLATFORM_MAP;

// サポートされているプラットフォームの型
export type TSupportedPlatform = typeof PLATFORM_MAP[TPlatformKey];
```

#### PATH区切り文字

```typescript
export const PATH_DELIMITER = {
  WINDOWS: ';',
  UNIX: ':',
} as const;
```

## 実装済み改善点

### 1. 型安全性の向上

**改善実施**:

- `PLATFORM_TYPE.UNKNOWN`を空文字列に統一（すべて文字列ベース）
- 型安全なプラットフォームマッピング
- 詳細な型定義の提供

### 2. パフォーマンス改善

**改善実施**:

- プラットフォーム情報のキャッシュ機構を実装
- 重複する`os.platform()`呼び出しを防止
- キャッシュクリア機能の提供

### 3. アーキテクチャ改善

**改善実施**:

- 責任分離（constants/types/実装の分離）
- 設定ベースのプラットフォーム定義
- 保守性の向上

## 品質実装状況

### パフォーマンス

- 初回実行: `os.platform()`の 1回呼び出し
- キャッシュ後: 即座に返却
- メモリ使用量: 最小限のキャッシュ変数のみ

### 保守性

- コード品質: ESLint/TS ルール準拠
- 型定義: 完全な型情報提供
- 構造化: 責任分離されたファイル構成

## API仕様

### 関数シグネチャ

```typescript
// メイン関数
export const getPlatform: (
  platform?: TPlatformKey | 'unknown' | '',
  strict?: boolean,
) => PLATFORM_TYPE;

// 個別判定関数
export const isWindows: () => boolean;
export const isLinux: () => boolean;
export const isMacOS: () => boolean;

// ユーティリティ関数
export const getDelimiter: () => string;
export const clearPlatformCache: () => void;
```

### 名前空間エクスポート

```typescript
const estaUtils = {
  getPlatform,
  getDelimiter,
  PLATFORM_TYPE,
};
```

## 使用例

```typescript
import {
  estaUtils,
  getDelimiter,
  getPlatform,
  isWindows,
  PLATFORM_TYPE,
} from '@esta-utils/get-platform';

// 基本的な使用
const platform = getPlatform(); // PLATFORM_TYPE.WINDOWS | LINUX | MACOS | UNKNOWN

// 条件分岐
if (platform === PLATFORM_TYPE.WINDOWS) {
  // Windows固有処理
}

// 個別判定
if (isWindows()) {
  // Windows固有処理
}

// PATH区切り文字
const delimiter = getDelimiter(); // ';' または ':'

// 名前空間経由
const platform2 = estaUtils.getPlatform();
```

## 結論

現在の実装は以下の改善を完了しています。

1. **型安全性**: すべて文字列ベースの enum、詳細な型定義
2. **パフォーマンス**: キャッシュ機構による最適化
3. **保守性**: 責任分離された構造
4. **拡張性**: 設定ベースのプラットフォーム定義

堅牢で保守しやすいパッケージとして実装が完了しています。
