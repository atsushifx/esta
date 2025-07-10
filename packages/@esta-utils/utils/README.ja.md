# @esta-utils/utils

---

## 概要

@esta-utilsパッケージ群の統一エントリーポイントです。
プラットフォーム判定機能、コマンドユーティリティ機能を一括で提供します。

---

## インストール

```sh
pnpm add @esta-utils/utils
# または
yarn add @esta-utils/utils
# または
npm install @esta-utils/utils
```

---

## 主なエクスポート

### プラットフォーム判定機能（@esta-utils/get-platform）

- `getPlatform()`
  現在のOS種別を `PLATFORM_TYPE` enumで返します。

- `PLATFORM_TYPE`
  判定結果：`WINDOWS` / `LINUX` / `MACOS` / `UNKNOWN`

- `getDelimiter()`
  PATH区切り記号（Windows: `";"`、その他: `":"`）を返します。

- `isWindows()` / `isLinux()` / `isMacOS()`
  対応するOSかを判定するブール関数。

- `clearPlatformCache()`
  キャッシュされたOS判定結果をクリアします。

- `estaUtils`
  上記すべての関数をまとめたネームスペースオブジェクト。

### コマンドユーティリティ機能（@esta-utils/command-utils）

- `commandExists()` — コマンドの存在確認
- `getCommandPath()` — コマンドのパス取得

### 統合ネームスペース

- `agUtils` — 全機能を統合したネームスペースオブジェクト

---

## 使い方

```typescript
import { agUtils, commandExists, getDelimiter, getPlatform, isWindows, PlatformType } from '@esta-utils/utils';

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

// コマンド存在確認
if (commandExists('git')) {
  // git コマンドが利用可能
}

// agUtilsネームスペースからまとめて利用
const pt: agUtils.PlatformType = agUtils.getPlatform();
if (agUtils.isMacOS()) {
  // macOS固有処理
}

if (agUtils.commandExists('docker')) {
  // docker コマンドが利用可能
}
```

---

## 特徴

- **統一エントリーポイント**: 複数の@esta-utilsパッケージを一括インポート可能
- **型安全**: TypeScript完全対応、enum/判定関数/ネームスペースの三段構成
- **クロスプラットフォーム**: Windows/Linux/macOS対応
- **コマンドユーティリティ**: システムコマンドの存在確認機能

---

## ライセンス

MIT License (c) 2025 atsushifx
