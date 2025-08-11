---
header:
- src: refactor-agLoggerConfig-phase1.tasks.md
- @(#): フェーズ1: AgLoggerConfigクラス作成タスク
title: フェーズ1: AgLoggerConfigクラス作成タスク
description: AgLoggerConfig内部クラスの作成と関連ユニットテストをt-wada式TDDで実装するタスクドキュメント
version: 1.0.0
created: 2025-07-27
updated: 2025-08-11
authors:
  - atsushifx
changes:
  - 2025-07-27: 初回作成（フェーズ1タスク詳細化）
  - 2025-08-11: 仕様更新（API確定・DoD追記・失敗時のエラーポリシー明文化）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

# 目的 / ゴール

- `AgLogger` が依存する **内部設定クラス `AgLoggerConfig`** を新規実装し、
  ログレベル判定・フォーマッタ・デフォルトロガー・レベル別ロガーマップ・verbose フラグの**一元管理**を行う。
- 既存 `AgLogger` の公開 API（`setLoggerConfig`, `setLogger`, `getLoggerFunction`, `formatter`, `logLevel`, `isVerbose`, `shouldOutput` 相当）を**安全に委譲**できる状態を作る。
- 実装は **t-wada式TDD** に従い、失敗するテスト→最小実装→リファクタリングのサイクルで進める。

# スコープ（フェーズ1）

- `AgLoggerConfig` クラスの実装（内部クラス／単体で完結）
- バリデーションとの連携：`validateLogLevel`, `validateFormatter`, `isValidLogger` の利用
- コンソール用デフォルト適用ロジック（`defaultLogger === ConsoleLogger` かつ `loggerMap` 未指定時は `ConsoleLoggerMap` を適用）
- ユニットテスト（失敗系を含む）
- 非スコープ：トランスポート、メトリクス、非同期I/O、持続化、ホットリロード

# 成果物

- `src/internal/AgLoggerConfig.class.ts`
- `test/internal/AgLoggerConfig.spec.ts`
- 必要な型・定数の再確認（`AgLogLevel`, `AG_LOGLEVEL`, `AgLoggerFunction`, `AgFormatFunction`, `AgLoggerOptions` など）

# 仕様（API）

## `AgLoggerConfig` プロパティ

- `logLevel: AgLogLevel`（既定: `AG_LOGLEVEL.INFO`）
- `formatter: AgFormatFunction`（既定: `NullFormatter` を想定）
- `defaultLogger: AgLoggerFunction`（既定: `NullLogger` を想定）
- `loggerMap: Record<AgLogLevel, AgLoggerFunction>`（全レベルを `defaultLogger` で初期化）
- `isVerbose: boolean`（既定: `false`）

## `AgLoggerConfig` メソッド

- `setLoggerConfig(options: AgLoggerOptions): void`
  - `formatter` があれば `validateFormatter` を通す
  - `defaultLogger` があれば `isValidLogger` を通す
  - `logLevel` があれば `validateLogLevel` を通す
  - `defaultLogger === ConsoleLogger` かつ `loggerMap` 未指定なら `ConsoleLoggerMap` を自動適用
  - `loggerMap` があれば **部分マップをマージ**（未指定レベルは既存を保持）
- `setLogger(level: AgLogLevel, fn: AgLoggerFunction): boolean`
  - `validateLogLevel(level)` 成功時のみ設定、`true` を返す
- `getLoggerFunction(level: AgLogLevel): AgLoggerFunction`
  - マップ未登録なら `defaultLogger` を返す
- `shouldOutput(level: AgLogLevel): boolean`
  - `FORCE_OUTPUT` は常に `true`
  - `VERBOSE` は `isVerbose` が `true` の場合のみ `true`
  - それ以外は `level >= logLevel`
- アクセサ
  - `get logLevel(): AgLogLevel` / `set logLevel(v: AgLogLevel)`
  - `get isVerbose(): boolean` / `set setVerbose(v: boolean)`
  - `get formatter(): AgFormatFunction` / `set formatter(f: AgFormatFunction)`

## エラーポリシー

- `setLoggerConfig(undefined|null)` は `AgLoggerError(ERROR_TYPES.VALIDATION.NULL_CONFIGURATION)` を投げる
- 不正な `formatter` / `defaultLogger` / `logLevel` は各 `validate*` に委譲し、該当の `AgLoggerError` を投げる
- `setLogger` の `level` が不正な場合は例外（`validateLogLevel`）

# 振る舞いの例（擬似コード）

```ts
const cfg = new AgLoggerConfig();
cfg.setLoggerConfig({
  defaultLogger: ConsoleLogger,
  logLevel: AG_LOGLEVEL.DEBUG,
});
cfg.setLogger(AG_LOGLEVEL.WARN, customWarnLogger);
if (cfg.shouldOutput(AG_LOGLEVEL.INFO)) {
  cfg.getLoggerFunction(AG_LOGLEVEL.INFO)('message');
}
```

# BDD タスクリスト

- **初期状態**
  - [ ] 既定の `logLevel` が INFO
  - [ ] 既定の `formatter` が `NullFormatter`
  - [ ] 全レベルのロガーが `NullLogger`
  - [ ] `isVerbose` が false
- **setLoggerConfig**
  - [ ] `null` / `undefined` 渡しで `AgLoggerError(ERROR_TYPES.VALIDATION.NULL_CONFIGURATION)`
  - [ ] 不正な `formatter` / `defaultLogger` / `logLevel` で例外
  - [ ] ConsoleLogger適用時の `loggerMap` 自動セット
  - [ ] 部分マップマージ動作の確認
- **setLogger**
  - [ ] 正常レベル設定で true
  - [ ] 不正レベルで例外
- **getLoggerFunction**
  - [ ] 登録済みロガーを返す
  - [ ] 未登録は `defaultLogger` を返す
- **shouldOutput**
  - [ ] FORCE_OUTPUT 常に true
  - [ ] VERBOSE は `isVerbose` true のときのみ
  - [ ] その他は閾値比較
