---
header:
  - src: docs/.ccKiro/@esta-core/esta-config/esta-config.requirement.md
  - "@(#)": ESTA unified user configuration management requirements
title: 🔧 ESTA統合ユーザー設定管理要件定義書（@esta-core/esta-config）
description: ESTAツール群のユーザー設定を統合管理するパッケージの要件定義
version: 1.0.0
created: 2025-07-20
updated: 2025-07-20
authors:
  - 🤖 Claude（要件定義・仕様策定）
  - 👤 atsushifx（要件確認・仕様確定）
changes:
  - 2025-07-20: 初回作成（GitHub issue #88 対応）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## ESTA統合ユーザー設定管理 要件定義書

### 1. プロジェクト概要

#### 1.1 目的

ESTA ツール群で使用される統合ユーザー設定管理機能を提供します。ツールインストール設定以外のグローバル設定を管理し、CLI・GitHub Actions 間で一貫した設定共有を実現します。

#### 1.2 既存機能との関係

- `@esta-core/tools-config`: ツールインストール設定（インストール・一時ディレクトリ等）
- `@esta-utils/config-loader`: 設定ファイル読み込み機能
- `@agla-utils/ag-logger`: ログ機能

`@esta-core/esta-config`は上記以外のグローバルユーザー設定を担当します。

### 2. 機能要件

#### 2.1 設定項目

- `toolsConfigPath`: ツール設定ファイルのパス指定
- `logLevel`: ログ出力レベル（@agla-utils/ag-logger の 0-6数値）

#### 2.2 設定ファイル対応

- `.estarc`ファイル対応
- `esta.config.{js,ts,json,yml}`ファイル対応

#### 2.3 基本機能

- デフォルト設定値の提供
- ユーザー設定とデフォルト設定のマージ
- valibot による設定値検証

### 3. 非機能要件

#### 3.1 パフォーマンス

- 設定読み込み時間 50ms 以内
- 依存関係の最小化

#### 3.2 信頼性

- 設定ファイル未存在時のデフォルト値適用
- 不正な設定値のエラーハンドリング

### 4. 技術要件

#### 4.1 依存関係

- `@esta-utils/config-loader`: 設定ファイル読み込み
- `valibot`: 設定検証
- `@agla-utils/ag-logger`: ログレベル型参照

#### 4.2 アーキテクチャ

- 既存パッケージとの循環依存回避
- 軽量で高速な実装

### 5. インターフェース要件

#### 5.1 主要API

```typescript
// メインエントリーポイント
export function getEstaConfig(configPath?: string): Promise<EstaConfig>;

// デフォルト設定取得
export function defaultEstaConfig(): EstaConfig;
```

#### 5.2 データ構造

```typescript
import type { AgLogLevel } from '@agla-utils/ag-logger';

export type EstaConfig = {
  /** ツール設定ファイルへのパス */
  toolsConfigPath: string;
  /** ログレベル（@agla-utils/ag-loggerの0-6の数値） */
  logLevel: AgLogLevel;
};

export type PartialEstaConfig = {
  toolsConfigPath?: string;
  logLevel?: AgLogLevel;
};
```

### 6. デフォルト設定値

```typescript
const DEFAULT_ESTA_CONFIG: EstaConfig = {
  toolsConfigPath: './tools.config.json',
  logLevel: 4, // AgLogLevelCode.INFO
};
```

### 7. 受入基準

#### 7.1 基本機能

- `.estarc`および`esta.config.*`からの設定読み込み
- デフォルト設定とのマージ
- ログレベル値の検証（0-6）

#### 7.2 品質

- ユニットテストカバレッジ 90%以上
- 型チェック通過
- 既存パッケージとの互換性確認

### 8. 制約事項

#### 8.1 YAGNI原則

- 現時点で不要な機能は実装しない
- 設定項目は必要最低限に限定

#### 8.2 DRY原則

- 既存の`@esta-utils/config-loader`を活用
- 重複する機能は作らない

### 9. 使用例

```typescript
import { getEstaConfig } from '@esta-core/esta-config';
import { getToolsConfig } from '@esta-core/tools-config';

// ESTA設定を取得
const estaConfig = await getEstaConfig();

// ツール設定を取得
const toolsConfig = await getToolsConfig(estaConfig.toolsConfigPath);

// ログレベル設定
logger.setLogLevel(estaConfig.logLevel);
```

### 10. 参考資料

- GitHub Issue #88: <https://github.com/atsushifx/esta/issues/88>
- `@esta-core/tools-config`仕様書
- `@esta-utils/config-loader`仕様書
- `@agla-utils/ag-logger`ログレベル定義
