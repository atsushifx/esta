<!--
  src: docs/specs/esta-config-spec.md
  Copyright (c) 2025 atsushifx
  This software is released under the MIT License.
  https://opensource.org/licenses/MIT
-->

# 📘 @esta-core/esta-config モジュール設計仕様書

## 1. 概要

`@esta-core/esta-config` は、ESTA プロジェクトにおける統一的な設定管理モジュールです。**GitHub Actions での使用をメイン**とし、CLI ツールとの共通設定処理を提供します。設定の重複・不整合を解決し、シンプルで実用的な設計を目指します。

### 1.1 課題と解決策

**現在の課題:**

- CLI ツールと GitHub Actions で設定解析ロジックが重複
- 設定の不整合により動作が異なる
- テストが困難

**解決策:**

- GitHub Actions 用途に特化したシンプルな設計
- 4つの設定コンポーネントによるモジュラー設計
- 統一されたスキーマと検証ロジック

---

## 2. アーキテクチャ設計

### 2.1 コンポーネント構成

```bash
@esta-core/esta-config
├── UserConfig          # ユーザー設定管理
├── ExecutionConfig     # 実行時設定管理
├── FeatureFlagConfig   # 機能フラグ管理
└── RootConfig          # 統合設定管理
```

### 2.2 設定ファイル階層

```bash
プロジェクトルート/
├── .estarc              # メイン設定ファイル (JSON)
├── esta.config.json     # 代替設定ファイル
└── esta.config.yaml     # YAML形式設定
```

---

## 3. 設定コンポーネント仕様

### 3.1 UserConfig

ユーザーの永続的な設定を管理します。**GitHub Actions用途に特化**してシンプルに。

```typescript
export interface UserConfig {
  installDir?: string;
  tempDir?: string;
  toolsConfig?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  defaults?: {
    version?: string;
    quiet?: boolean;
    timeout?: number;
  };
}
```

設定例:

```json
{
  "installDir": ".tools/bin",
  "tempDir": ".esta/temp",
  "toolsConfig": "./tools.config.json",
  "logLevel": "info",
  "defaults": {
    "version": "latest",
    "quiet": false,
    "timeout": 30
  }
}
```

### 3.2 ExecutionConfig

CLI と GitHub Actions で共有される実行時設定を管理します。

```typescript
export interface ExecutionConfig {
  verbose?: boolean;
  dryRun?: boolean;
  quiet?: boolean;
  color?: boolean;
  parallel?: boolean;
  maxRetries?: number;
  timeout?: number;
}
```

#### 設定例

```json
{
  "verbose": false,
  "dryRun": false,
  "quiet": false,
  "color": true,
  "parallel": true,
  "maxRetries": 3,
  "timeout": 60
}
```

### 3.3 FeatureFlagConfig

実験的機能の有効/無効を管理します。

```typescript
export interface FeatureFlagConfig {
  experimentalEget?: boolean;
  scriptBasedInstaller?: boolean;
  configValidation?: boolean;
}
```

<!-- markdownlint-disable no-duplicate-heading -->

#### 設定例

```json
{
  "experimentalEget": false,
  "scriptBasedInstaller": true,
  "configValidation": true
}
```

### 3.4 RootConfig

すべての設定を統合管理します。

```typescript
export interface RootConfig {
  user: UserConfig;
  execution: ExecutionConfig;
  featureFlags: FeatureFlagConfig;
  _metadata?: {
    configPath?: string;
    loadedAt?: Date;
    sources?: string[];
  };
}
```

---

## 4. API設計

### 4.1 設定ローダー

> 注意:
> 設定ファイルの読み込みは既存の `@esta-utils/config-loader` を使用します。

```typescript
// 既存のconfig-loaderを使用
import { loadConfig } from '@esta-utils/config-loader';

export class ConfigLoader {
  /**
   * 設定ファイルを読み込みRootConfigを生成
   */
  static async load(options?: ConfigLoadOptions): Promise<RootConfig>;

  /**
   * 複数の設定ソースをマージ
   */
  static merge(...configs: Partial<RootConfig>[]): RootConfig;
}

export interface ConfigLoadOptions {
  configPath?: string;
  validate?: boolean;
}
```

### 4.2 設定アクセサー

```typescript
export class ConfigAccessor {
  constructor(private config: RootConfig) {}

  /**
   * ドット記法で設定値にアクセス
   */
  get<T>(path: string): T | undefined;

  /**
   * 設定値の存在確認
   */
  has(path: string): boolean;

  /**
   * 設定値の設定
   */
  set<T>(path: string, value: T): void;

  /**
   * 設定のマージ
   */
  merge(partial: Partial<RootConfig>): void;

  /**
   * 設定の検証
   */
  validate(): ValidationResult;
}
```

---

## 5. 使用例

### 5.1 基本的な使用

```typescript
import { ConfigAccessor, ConfigLoader } from '@esta-core/esta-config';

// 設定の読み込み
const config = await ConfigLoader.load();
const accessor = new ConfigAccessor(config);

// 設定値の取得
const installDir = accessor.get<string>('user.installDir');
const logLevel = accessor.get<string>('user.logLevel');
```

---

## 6. 設定ファイル検索

既存の `@esta-utils/config-loader` を使用します。以下の機能が提供されています。

<!-- textlint-disable ja-technical-writing/max-comma -->

- 拡張子なしファイル（`.estarc`）の検索
- 複数の拡張子 (`.json`, `.jsonc`, `.yaml`, `.yml`, `.js`, `.ts)
- サブディレクトリ（`.config/`）の自動検索

<!-- textlint-enable -->

**検索パターン例:**

```bash
.estarc
.estarc.json
esta.config.json
.config/esta.json
.config/esta.config.json
```

---

## 7. 検証スキーマ

### 8.1 Valibot による検証

```typescript
import * as v from 'valibot';

const UserConfigSchema = v.object({
  installDir: v.optional(v.string()),
  tempDir: v.optional(v.string()),
  toolsConfig: v.optional(v.string()),
  logLevel: v.optional(v.pickList('debug', 'info', 'warn', 'error'])),
  defaults: v.optional(v.object({
    version: v.optional(v.string()),
    quiet: v.optional(v.boolean()),
    timeout: v.optional(v.number()),
  })),
});

const ExecutionConfigSchema = v.object({
  verbose: v.optional(v.boolean()),
  dryRun: v.optional(v.boolean()),
  quiet: v.optional(v.boolean()),
  color: v.optional(v.boolean()),
  parallel: v.optional(v.boolean()),
  maxRetries: v.optional(v.number()),
  timeout: v.optional(v.number()),
});

const FeatureFlagConfigSchema = v.object({
  experimentalEget: v.optional(v.boolean()),
  scriptBasedInstaller: v.optional(v.boolean()),
  configValidation: v.optional(v.boolean()),
});

const RootConfigSchema = v.object({
  user: UserConfigSchema,
  execution: ExecutionConfigSchema,
  featureFlags: FeatureFlagConfigSchema,
});
```

---

## 8. 主要な設計変更点

### 8.1 ログ設定の簡素化

**変更前:**

```typescript
logging?: {
  level?: 'debug' | 'info' | 'warn' | 'error';
  format?: 'plain' | 'json' | 'github';
  output?: 'console' | 'file';
  file?: string;
};
```

**変更後:**

```typescript
logLevel?: 'debug' | 'info' | 'warn' | 'error';
```

**理由:** GitHub Actions 用途では、ログレベルの制御のみで十分。

### 8.2 設定ファイル参照の改善

**変更前:**

```typescript
toolsFile?: string;
```

**変更後:**

```typescript
toolsConfig?: string;
```

**理由:** `toolsConfig`のほうが設定ファイル（JSON/YAML）を指すことが明確。

### 8.3 tempDir の追加

**変更前:**

```typescript
cacheDir?: string;
```

**変更後:**

```typescript
tempDir?: string;
```

**理由:** 一時ファイルの管理が主な用途。

---

## 9. 実装チェックリスト

### 9.1 Phase 1: 基本実装

- [ ] UserConfig の実装（シンプル版）
- [ ] ExecutionConfig の実装
- [ ] FeatureFlagConfig の実装
- [ ] RootConfig の実装
- [ ] ConfigLoader の基本機能

### 9.2 Phase 2: GitHub Actions特化

- [ ] GitHub Actions 入力との統合
- [ ] 検証機能
- [ ] エラーハンドリング

### 9.3 Phase 3: テストとドキュメント

- [ ] ユニットテスト
- [ ] GitHub Actions E2E テスト
- [ ] CLI 統合テスト
- [ ] ドキュメント

---

**作成日**: 2025年7月11日
**バージョン**: 1.3.1（GitHub Actions 特化版）
**作成者**: atsushifx
**参照**: [GitHub Issue #88](https://github.com/atsushifx/esta/issues/88)
