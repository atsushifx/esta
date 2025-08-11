---
header:
- src: refactor-agloggermanager.spec.md
- @(#): AgLoggerManager 再実装 仕様
title: AgLoggerManager 再実装 仕様
description: AgLoggerManagerを仕様に従って、再実装するための仕様書
version: 1.0.0
created: 2025-08-11
authors:
  - atsushifx
changes:
  - 2025-08-11: 仕様更新（API確定・DoD追記・失敗時のエラーポリシー明文化）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

# AgLoggerManager 最小仕様（更新版：setLoggerで外部注入）

## 背景

- AgLogger は単一シングルトンの軽量ロガー（出力関数・フォーマッタ・レベル判定を内包）。
- AgLoggerManager は **AgLogger への薄いフロントエンド**。生成と取得を分離し、設定は AgLogger 側（config）で行う。
- メトリクスや拡張は別クラス/プラグインで扱う。Manager は関与しない。

## 目的

- 「初期化」「取得」「委譲」の最小責務だけを堅牢に保証する。
- 初期化順序や二重初期化、未初期化利用の事故を BDD で防止。

---

## 仕様（API 契約）

### ライフサイクル

- `AgLoggerManager.createManager(options?: AgLoggerOptions): AgLoggerManager`
  - **初期化専用**。AgLogger をシングルトンとして生成（`AgLogger.createLogger(options)`）し、Manager に保持。
  - 二重初期化は**不許可**。既に作成済みなら例外。
- `AgLoggerManager.getManager(): AgLoggerManager`
  - **取得専用**。未初期化の場合は例外（生成はしない）。
- `getLogger(): AgLogger`
  - Manager が保持する **同一 AgLogger インスタンス**を返す。
  - 未初期化の場合は例外。
- `AgLoggerManager.resetSingleton(): void` **（テスト専用）**
  - **Manager も AgLogger も**破棄し、未初期化状態へ戻す。
  - 運用コードからは呼ばないことをドキュメントに明記。
- `resetLogger(options?: AgLoggerOptions): void` **（テスト専用・任意）**
  - **AgLogger だけ**をリセットして再生成。
  - Manager インスタンスは維持。

### ロガーインスタンスの外部注入

- `setLogger(logger: AgLogger): void`
  - **未初期化時に一度だけ**許可。
  - 外部で生成した `AgLogger`（`AgLogger.createLogger(config)`など）を注入可能。
  - 初期化済みの場合は例外。
  - 本番では基本的に `createManager(options)` を使用し、`setLogger` はDIやテストでのみ利用。

### ロガー関数バインド（委譲API）

- `bindLoggerFunction(level: AgLogLevel, fn: AgLoggerFunction): boolean`
  - 指定レベルにロガー関数をバインド。AgLogger の `setLogger` へ委譲。
- `updateLoggerMap(map: Partial<AgLoggerMap<AgLoggerFunction>>): void`
  - ロガーマップの差分/全体更新。AgLogger の `setLoggerConfig({ loggerMap: map })` へ委譲。
- （任意の便宜メソッド）
  - `setFormatter(formatter: AgFormatFunction): void` → `AgLogger.setFormatter`
  - `setLevel(level: AgLogLevel): void` → `AgLogger.logLevel` setter
  - `setVerbose(enabled: boolean): void` → `AgLogger.setVerbose` setter

### 非目標（Out of Scope）

- メトリクス収集、トランスポート管理、階層ロガー、ホットリロード等はやらない。
- AgLogger の動作ロジック（レベル判定・整形・出力）の再実装はしない。

### エラーポリシー

- 未初期化で `getManager()` / `getLogger()` / `bindLoggerFunction()` / `updateLoggerMap()` を呼ぶと例外。
- `createManager()` の二重呼び出しは例外。
- `setLogger()` は未初期化時のみ許可。初期化済みでは例外。
- テスト専用APIは本番コードで使用しない旨をコメントで明示。

---

## BDD タスクリスト

### (1) 初期化ガード

- [ ] 未初期化で `getManager()` を呼ぶと例外。
- [ ] `createManager()` を2回呼ぶと例外。
- [ ] `createManager()` 後は `getManager()` が同一参照を返す。

### (2) Logger の生成・取得

- [ ] `createManager(options)` 後、`getLogger()` が非 undefined。
- [ ] `getLogger()` が `AgLogger.getLogger()` と同一参照を返す。
- [ ] 未初期化で `getLogger()` は例外。

### (3) ロガーインスタンス注入

- [ ] 未初期化状態で `setLogger(AgLogger.createLogger(config))` が成功。
- [ ] 注入後の `getLogger()` が同一インスタンスを返す。
- [ ] 初期化済みで `setLogger()` を呼ぶと例外。

### (4) 廃棄（テスト専用API）

- [ ] `resetSingleton()` 後に `getManager()` は例外。
- [ ] `resetSingleton()` 後に `createManager()` で再初期化可能。
- [ ] （実装する場合）`resetLogger()` が Manager は同一参照のまま Logger を再生成する。

### (5) 委譲の成立（インタラクション）

- [ ] `bindLoggerFunction(level, fn)` が `AgLogger.setLogger` を一度だけ呼ぶ。
- [ ] `updateLoggerMap(map)` が `AgLogger.setLoggerConfig({ loggerMap: map })` を呼ぶ。
- [ ] （任意）`setFormatter` / `setLevel` / `setVerbose` も各委譲先が呼ばれる。

### (6) スレッショルド

- [ ] 例外メッセージが `/not created/i`, `/already created/i`, `/logger already initialized/i` などの正規表現に一致。
