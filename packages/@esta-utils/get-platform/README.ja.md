# @esta-utils/get-platform

---

## 概要

Node.js/TypeScript用のOSプラットフォーム判定ユーティリティです。
Windows/Linux/macOS判定・PATH区切り記号取得・型安全なenum/判定関数を提供します。

---

## インストール

```sh
pnpm add @esta-utils/get-platform
# または
yarn add @esta-utils/get-platform
# または
npm install @esta-utils/get-platform
```

---

## 主なエクスポート

- `getPlatform()` — 現在のプラットフォーム名を型安全なenumで取得
- `PLATFORM_TYPE` — 判定用enum型 (`WINDOWS`/`LINUX`/`MACOS`/`UNKNOWN`)
- `getDelimiter()` — PATH区切り記号を返す（Windowsは`;`、他は`:`）
- 判定関数：`isWindows()` / `isLinux()` / `isMacOS()`
- キャッシュ管理：`clearPlatformCache()` — プラットフォーム情報キャッシュをクリア
- まとめて使う場合：`estaUtils`ネームスペースオブジェクト

---

## 使い方

```typescript
import {
  clearPlatformCache,
  estaUtils,
  getDelimiter,
  getPlatform,
  isLinux,
  isMacOS,
  isWindows,
  PLATFORM_TYPE,
} from '@esta-utils/get-platform';

// OS種別を取得
const platform = getPlatform(); // PLATFORM_TYPE.WINDOWS | .LINUX | .MACOS | .UNKNOWN

if (platform === PLATFORM_TYPE.WINDOWS) {
  // Windows固有処理
}

// 判定関数
if (isLinux()) {
  // Linux固有処理
}

// PATH区切り記号取得
const delimiter = getDelimiter(); // ";" or ":"

// estaUtilsネームスペースからまとめて利用
const pt = estaUtils.getPlatform();
if (estaUtils.isWindows()) {
  // Windows固有処理
}

// キャッシュクリア（主にテスト用）
clearPlatformCache();
```

---

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

### パラメータ

- `platform` (省略可能): プラットフォーム文字列。空文字列の場合は`os.platform()`を使用
- `strict` (省略可能): 未サポートプラットフォームでエラーをスローするか（デフォルト: `true`）

---

## 型定義

### PLATFORM_TYPE

```typescript
enum PLATFORM_TYPE {
  WINDOWS = 'windows',
  LINUX = 'linux',
  MACOS = 'macos',
  UNKNOWN = '', // falsy値
}
```

### 関連型

```typescript
// プラットフォームキーの型
export type TPlatformKey = 'win32' | 'linux' | 'darwin' | 'unknown';

// サポートされているプラットフォームの型
export type TSupportedPlatform = PLATFORM_TYPE;
```

---

## 特徴

### パフォーマンス最適化

- プラットフォーム情報をキャッシュして重複する`os.platform()`呼び出しを防止
- 初回実行後は即座に結果を返却

### 型安全性

- 全て文字列ベースのenum設計
- 詳細な型定義によるコンパイル時エラー検出
- TypeScript strict modeに完全対応

### 拡張性

- 設定ベースのプラットフォーム定義
- 新しいプラットフォーム対応の容易さ
- モジュール化された構造

---

## ライセンス

MIT License (c) 2025 atsushifx
