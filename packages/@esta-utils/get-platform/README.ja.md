# @ag-utils/get-platform

---

## 概要

Node.js/TypeScript用のOSプラットフォーム判定ユーティリティです。
Windows/Linux/macOS判定・PATH区切り記号取得・型安全なenum/判定関数を提供します。

---

## インストール

```sh
pnpm add @ag-utils/get-platform
# または
yarn add @ag-utils/get-platform
# または
npm install @ag-utils/get-platform
```

---

## 主なエクスポート

- `getPlatform()` — 現在のプラットフォーム名を型安全なenumで取得
- `PlatformType` — 判定用enum型 (`WINDOWS`/`LINUX`/`MACOS`/`UNKNOWN`)
- `getDelimiter()` — PATH区切り記号を返す（Windowsは`;`、他は`:`）
- 判定関数：`isWindows()` / `isLinux()` / `isMacOS()`
- まとめて使う場合：`agUtils`ネームスペースオブジェクト

---

## 使い方

```typescript
import { agUtils, getDelimiter, getPlatform, isWindows, PlatformType } from '@ag-utils/get-platform';

// OS種別を取得
const platform = getPlatform(); // PlatformType.WINDOWS | .LINUX | .MACOS | .UNKNOWN

if (platform === PlatformType.WINDOWS) {
  // Windows固有処理
}

// 判定関数
if (isLinux()) {
  // Linux固有処理
}

// PATH区切り記号取得
const delimiter = getDelimiter(); // ";" or ":"

// agUtilsネームスペースからまとめて利用
const pt: agUtils.PlatformType = agUtils.getPlatform();
if (agUtils.isMacOS()) {
  // macOS固有処理
}
```

---

## 型安全・拡張性

- 型エラー防止のため、enum（PlatformType）/判定関数/ネームスペースobjectの三段構成
- `strict`オプションで、想定外OSの時に例外スローまたはundefined返却を選択可能

---

## ライセンス

MIT License (c) 2025 atsushifx
