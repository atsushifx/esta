<!--
  src: docs/specs/@esta-core--tools-config.spec.md

  Copyright (c) 2025 atsushifx
  This software is released under the MIT License.
  https://opensource.org/licenses/MIT
-->

---
title: 🔧 ツール設定統合管理仕様書（@esta-core/tools-config）
version: 1.0.0
created: 2025-01-14
updated: 2025-01-14
authors:
  - 🤖 Claude（初期設計・API仕様策定）
  - 👤 atsushifx（要件定義・仕様確定）
changes:
  - 2025-01-14: 初回作成（GitHub issue #94 対応）
---

# @esta-core/tools-config パッケージ仕様書

## 概要

`@esta-core/tools-config`は、CLI ツール設定の統合管理を行うパッケージです。個別のツール設定を読み込み、`eget`などのインストーラーで使用するための統合インストール設定を生成します。

## 目的

- ツール設定をランタイム設定から分離
- 複数の設定ファイル形式（TypeScript、JSON、YAML、JS）をサポート
- ツールインストール設定の型安全な解析・検証
- CLI、CI、その他サービスで再利用可能な軽量モジュール

## 機能要件

### 1. 設定ファイル読み込み

- TypeScript、JSON、YAML、JavaScript形式の設定ファイルをサポート
- 複数の設定ファイルのマージ機能
- 設定ファイルの自動検出機能

### 2. ツール設定管理

- ツール設定の一元管理
- ツール固有の設定項目の管理
- デフォルト設定の提供

### 3. 型安全性

- `valibot`による設定検証
- TypeScript型定義の完全なサポート
- ランタイム時の型チェック

## API仕様

### 基本API

#### `getTool(id: string): ToolEntry | undefined`

指定されたIDのツール設定を取得します。

**パラメータ:**

- `id`: ツールの一意識別子

**戻り値:**

- `ToolEntry` オブジェクト、または見つからない場合は`undefined`

#### `listTools(): ToolEntry[]`

設定されているすべてのツールのリストを取得します。

**戻り値:**

- `ToolEntry`オブジェクトの配列

### 設定データ構造

#### `ToolEntry`

```typescript
interface ToolEntry {
  installer: string; // インストーラータイプ（例: 'eget', 'scoop'）
  id: string; // ツールの一意識別子
  repository: string; // GitHubリポジトリまたはソース
  options?: Record<string, any>; // インストーラー固有のオプション
}
```

#### `ToolsConfig`

```typescript
interface ToolsConfig {
  defaultInstallDir: string; // デフォルトインストールディレクトリ
  defaultTempDir: string; // デフォルト一時ディレクトリ
  tools: ToolEntry[]; // ツール設定配列
}
```

## 技術仕様

### 依存関係

- `valibot`: 設定検証ライブラリ
- `@esta-utils/config-loader`: 設定ファイル読み込み（可能であれば）
- `@shared/types`: 共通型定義
- `@shared/constants`: 共通定数

### 設定ファイル形式

#### TypeScript設定ファイル例

```typescript
// tools.config.ts
import { ToolsConfig } from '@esta-core/tools-config';

export default {
  defaultInstallDir: '.tools/bin',
  defaultTempDir: '.tools/tmp',
  tools: [
    {
      installer: 'eget',
      id: 'gh',
      repository: 'cli/cli',
      options: {
        version: 'latest',
        args: ['--quiet'],
      },
    },
  ],
} satisfies ToolsConfig;
```

#### JSON設定ファイル例

```json
{
  "defaultInstallDir": ".tools/bin",
  "defaultTempDir": ".tools/tmp",
  "tools": [
    {
      "installer": "eget",
      "id": "gh",
      "repository": "cli/cli",
      "options": {
        "version": "latest",
        "args": ["--quiet"]
      }
    }
  ]
}
```

### 検証スキーマ

`valibot`を使用したスキーマ定義:

```typescript
import { any, array, object, optional, record, string } from 'valibot';

const ToolEntrySchema = object({
  installer: string(),
  id: string(),
  repository: string(),
  options: optional(record(any())),
});

const ToolsConfigSchema = object({
  defaultInstallDir: string(),
  defaultTempDir: string(),
  tools: array(ToolEntrySchema),
});
```

## 制約事項

- 複雑なプラグインシステムは避ける
- 設定の肥大化を防ぐ
- 軽量で独立してテスト可能な設計を維持
- 現在は`eget`インストーラーを中心とした設計（将来的に拡張可能）

## 使用例

```typescript
import { getTool, listTools } from '@esta-core/tools-config';

// 特定のツール設定を取得
const ghTool = getTool('gh');
if (ghTool) {
  console.log(`Installing ${ghTool.id} from ${ghTool.repository}`);
}

// すべてのツール設定を取得
const allTools = listTools();
allTools.forEach((tool) => {
  console.log(`Tool: ${tool.id} (${tool.installer})`);
});
```

## 互換性

- Node.js >= 20
- pnpm >= 10
- TypeScript >= 5.0
- ES2022 対応

## パフォーマンス考慮事項

- 設定ファイルの読み込みはキャッシュを使用
- 大量のツール設定でもメモリ効率を維持
- 不要な依存関係を避けた軽量な設計

## セキュリティ考慮事項

- 設定ファイルの検証を必須とする
- 任意のコード実行を防ぐ
- 設定ファイルのパスインジェクションを防ぐ

## 今後の拡張予定

- スクリプトベースインストーラーのサポート
- 設定ファイルのテンプレート機能
- 設定の継承機能
- 設定の暗号化サポート
