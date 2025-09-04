---
header:
  - src: docs/specs/@esta-core--tools-config.spec.md
  - @(#) : ESTA Install Tools configuration reader
title: 🔧 ツール設定統合管理仕様書（@esta-core/tools-config）
description: CLIツール設定の統合管理を行うパッケージ。個別のツール設定を読み込み、egetなどのインストーラーで使用するための統合インストール設定を生成。複数の設定ファイル形式をサポートし、型安全な解析・検証を提供。
version: 1.2.0
authors:
  - 🤖 Claude（初期設計・API仕様策定・実装更新）
  - 👤 atsushifx（要件定義・仕様確定）
changes:
  - 2025-07-14: 初回作成（GitHub issue #94 対応）
  - 2025-07-19: 最新実装に合わせて仕様書を改訂
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

`@esta-core/tools-config`は、CLI ツール設定の統合管理を行うパッケージです。個別のツール設定を読み込み、`eget`などのインストーラーで使用するための統合インストール設定を生成します。

## 目的

- ツール設定をランタイム設定から分離
- 複数の設定ファイル形式（TypeScript、JSON、YAML、JS）をサポート
- ツールインストール設定の型安全な解析・検証
- CLI、CI、その他サービスで再利用可能な軽量モジュール

## 機能要件

### 1. 設定ファイル読み込み

- TypeScript、JSON、YAML、JavaScript 形式の設定ファイルをサポート
- 複数の設定ファイルのマージ機能
- 設定ファイルの自動検出機能

### 2. ツール設定管理

- ツール設定の一元管理
- ツール固有の設定項目の管理
- デフォルト設定の提供

### 3. 型安全性

- `valibot`による設定検証
- TypeScript 型定義の完全なサポート
- ランタイム時の型チェック

## API仕様

### メインAPI

#### `getToolsConfig(configPath: string): Promise<ToolsConfig>`

設定ファイルを読み込み、デフォルト値とマージして完全な設定を取得します。

**パラメータ:**

- `configPath`: 設定ファイルのパス（TypeScript、JSON、YAML、JavaScript 形式をサポート）

**戻り値:**

- 完全な`ToolsConfig`オブジェクト（Promise）

**機能:**

- デフォルト設定の自動マージ
- 設定の検証と正規化
- 複数設定ファイル形式のサポート

### コア機能API

#### `loadToolsConfig(configPath: string): Promise<PartialToolsConfig>`

指定されたパスから設定ファイルを読み込みます。

#### `mergeToolsConfig(defaultConfig: ToolsConfig, fileConfig: PartialToolsConfig): ToolsConfig`

デフォルト設定とファイル設定をマージします。

#### `defaultToolsConfig(): ToolsConfig`

デフォルトのツール設定を取得します。

### 設定データ構造

#### `ToolEntry`

```typescript
export type ToolEntry = {
  /** インストーラータイプ */
  installer: string;
  /** ツールID */
  id: string;
  /** リポジトリ */
  repository: string;
  /** バージョン（任意） */
  version?: string;
  /** オプション（任意） */
  options?: Record<string, string>;
};
```

#### `ToolsConfig`

```typescript
export type ToolsConfig = {
  /** デフォルトインストールディレクトリ */
  defaultInstallDir: string;
  /** デフォルト一時ディレクトリ */
  defaultTempDir: string;
  /** ツールエントリーの配列 */
  tools: ToolEntry[];
};
```

#### `PartialToolsConfig`

```typescript
export type PartialToolsConfig = {
  /** デフォルトインストールディレクトリ（任意） */
  defaultInstallDir?: string;
  /** デフォルト一時ディレクトリ（任意） */
  defaultTempDir?: string;
  /** ツールエントリーの配列（任意） */
  tools?: ToolEntry[];
};
```

## 技術仕様

### 依存関係

- `valibot`: 設定検証ライブラリ
- `@esta-utils/config-loader`: 設定ファイル読み込み
- `@agla-e2e/fileio-framework`: E2E テストフレームワーク
- `@esta-core/error-handler`: エラーハンドリング

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

`valibot`を使用したスキーマ定義 (正規化機能付き)

```typescript
import { array, check, object, optional, pipe, record, string, transform } from 'valibot';

// ツールエントリーのスキーマ（正規化機能付き）
export const ToolEntrySchema = object({
  installer: pipe(string(), transform((installer) => installer.toLowerCase())),
  id: pipe(string(), transform((id) => id.toLowerCase())),
  repository: pipe(string(), transform((repo) => repo.toLowerCase())),
  version: optional(string()),
  options: optional(
    pipe(
      record(string(), string()),
      transform((options) => {
        const normalized: Record<string, string> = {};
        for (const [key, value] of Object.entries(options)) {
          normalized[key] = value.toLowerCase();
        }
        return normalized;
      }),
    ),
  ),
});

// 部分設定対応スキーマ（パス検証と正規化付き）
export const ToolsConfigSchema = object({
  defaultInstallDir: optional(pipe(
    string(),
    check(validateAndNormalizePath),
    transform(normalizePathForSchema),
  )),
  defaultTempDir: optional(pipe(
    string(),
    check(validateAndNormalizePath),
    transform(normalizePathForSchema),
  )),
  tools: optional(array(ToolEntrySchema)),
});

// 完全な設定のスキーマ（必須フィールドチェック付き）
export const CompleteToolsConfigSchema = pipe(
  ToolsConfigSchema,
  check((config) => config.defaultInstallDir !== undefined),
  check((config) => config.defaultTempDir !== undefined),
  check((config) => config.tools !== undefined),
  check((config) => config.defaultInstallDir !== config.defaultTempDir),
);
```

## アーキテクチャ詳細

### パッケージ構造

```bash
packages/esta-core/tools-config/src/
├── core/
│   └── config/              # 設定読み込み・マージ機能
├── internal/
│   ├── constants/           # 内部定数
│   ├── schemas/             # valibotスキーマ定義
│   └── types/               # 内部型定義
├── tools-validator/         # ツール検証機能
├── utils/                   # ユーティリティ機能
├── defaults.ts              # デフォルト設定
├── getToolsConfig.ts        # メインエントリーポイント
└── index.ts                 # パッケージエクスポート
```

### 主要機能

1. **設定読み込み**: `@esta-utils/config-loader`を使用した多形式サポート
2. **設定検証**: `valibot`による型安全な検証と正規化
3. **設定マージ**: デフォルト設定との安全なマージ
4. **パス正規化**: クロスプラットフォーム対応のパス処理
5. **ツール検証**: eget ベースのツール設定検証

### デフォルトツール

現在デフォルトで含まれているツール:

- gh (GitHub CLI)
- ripgrep (高速 grep)
- fd (高速 find)
- bat (syntax highlighting された cat)
- exa (modern な ls)
- jq (JSON プロセッサー)
- yq (YAML プロセッサー)
- delta (git の diff ビューア)
- gitleaks (秘匿情報検出)

## 制約事項

- 複雑なプラグインシステムは避ける
- 設定の肥大化を防ぐ
- 軽量で独立してテスト可能な設計を維持
- 現在は`eget`インストーラーを中心とした設計（将来的に拡張可能）
- パス区切り文字の正規化による互換性確保

## 使用例

### 基本的な使用方法

```typescript
import { getToolsConfig } from '@esta-core/tools-config';

// 設定ファイルから完全な設定を取得
const config = await getToolsConfig('./tools.config.ts');

console.log(`Install directory: ${config.defaultInstallDir}`);
console.log(`Temp directory: ${config.defaultTempDir}`);

// ツールの一覧を表示
config.tools.forEach((tool) => {
  console.log(`Tool: ${tool.id} (${tool.installer}) from ${tool.repository}`);
  if (tool.version) {
    console.log(`  Version: ${tool.version}`);
  }
});
```

### デフォルト設定の取得

```typescript
import { defaultToolsConfig } from '@esta-core/tools-config';

// デフォルト設定を取得（検証済み）
const defaultConfig = defaultToolsConfig();
console.log('Default tools:', defaultConfig.tools.map((t) => t.id));
```

### カスタム設定とのマージ

```typescript
import { defaultToolsConfig, loadToolsConfig, mergeToolsConfig } from '@esta-core/tools-config';

// 段階的な設定管理
const defaultConfig = defaultToolsConfig();
const customConfig = await loadToolsConfig('./custom-tools.json');
const finalConfig = mergeToolsConfig(defaultConfig, customConfig);
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
