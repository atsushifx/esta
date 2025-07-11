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

- 現在の課題:
  - CLI ツールと GitHub Actions で設定解析ロジックが重複
  - 設定の不整合により動作が異なる
  - テストが困難
- 解決策:
  - GitHub Actions 用途に特化したシンプルな設計
  - 4つの設定コンポーネントによるモジュラー設計
  - 統一されたスキーマと検証ロジック

## 2. アーキテクチャ設計

### 2.1 コンポーネント構成

```bash
@esta-core/esta-config
├── EstaConfig          # ユーザー設定管理
├── ExecutionConfig     # 実行時設定管理
├── FeatureFlagConfig   # 機能フラグ管理
└── 共通モジュール        # 設定読み込み・アクセサ機能
    ├── ConfigLoader    # 設定ファイル読み込み
    └── ConfigAccessor  # 設定値アクセス
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

### 3.1 EstaConfig

ユーザーの永続的な設定を管理します。**GitHub Actions用途に特化**してシンプルに。

```typescript
export class EstaConfig {
  // プロパティ
  installDir?: string;
  tempDir?: string;
  toolsConfig?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  defaults?: {
    version?: string;
    quiet?: boolean;
    timeout?: number;
  };

  // 静的メソッド
  static async load(options?: ConfigLoadOptions): Promise<EstaConfig>;

  // インスタンスメソッド
  get<T>(path: string): T | undefined;
  has(path: string): boolean;
  validate(): ValidationResult;
}
```

設定例:

```json
{
  "installDir": ".tools/bin",
  "tempDir": ".esta/temp",
  "toolsConfig": "./esta/tools.config.js"
  "logLevel": "info",
  "defaults": {
    "version": "latest",
    "quiet": false,
    "timeout": 30_000
  }
}
```

### 3.2 ExecutionConfig

CLI と GitHub Actions で共有される実行時設定を管理します。

```typescript
export class ExecutionConfig {
  // プロパティ
  verbose?: boolean;
  dryRun?: boolean;
  quiet?: boolean;
  color?: boolean;
  parallel?: boolean;
  maxRetries?: number;
  timeout?: number;

  // 静的メソッド
  static async load(options?: ConfigLoadOptions): Promise<ExecutionConfig>;

  // インスタンスメソッド
  get<T>(path: string): T | undefined;
  has(path: string): boolean;
  validate(): ValidationResult;
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
export class FeatureFlagConfig {
  // プロパティ
  experimentalEget?: boolean;
  scriptBasedInstaller?: boolean;
  configValidation?: boolean;

  // 静的メソッド
  static async load(options?: ConfigLoadOptions): Promise<FeatureFlagConfig>;

  // インスタンスメソッド
  get<T>(path: string): T | undefined;
  has(path: string): boolean;
  validate(): ValidationResult;
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

### 3.4 共通モジュール

設定読み込みとアクセサ機能を提供します。各設定クラスはこれらのモジュールに処理を委譲します。

```typescript
// 設定読み込みモジュール
export class ConfigLoader {
  static async load<T>(configName: string, options?: ConfigLoadOptions): Promise<T>;
  static merge<T>(...configs: Partial<T>[]): T;
}

// 設定アクセサモジュール
export class ConfigAccessor {
  static get<T>(config: any, path: string): T | undefined;
  static has(config: any, path: string): boolean;
  static validate(config: any, schema: any): ValidationResult;
}

// 設定読み込みオプション
export interface ConfigLoadOptions {
  configPath?: string;
  validate?: boolean;
}
```

---

## 4. API設計

### 4.1 設定クラスの実装パターン

各設定クラスは以下のパターンで実装されます。

```typescript
export class EstaConfig {
  // プロパティ（設定値）
  installDir?: string;
  tempDir?: string;
  toolsConfig?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';

  // 静的メソッド（設定読み込み）
  static async load(options?: ConfigLoadOptions): Promise<EstaConfig> {
    // ConfigLoaderモジュールに委譲
    return ConfigLoader.load<EstaConfig>('esta', options);
  }

  // インスタンスメソッド（アクセサ）
  get<T>(path: string): T | undefined {
    // ConfigAccessorモジュールに委譲
    return ConfigAccessor.get<T>(this, path);
  }

  has(path: string): boolean {
    // ConfigAccessorモジュールに委譲
    return ConfigAccessor.has(this, path);
  }

  validate(): ValidationResult {
    // ConfigAccessorモジュールに委譲
    return ConfigAccessor.validate(this, EstaConfigSchema);
  }
}
```

### 4.2 共通モジュールの実装

```typescript
// 設定読み込みモジュール
export class ConfigLoader {
  static async load<T>(configName: string, options?: ConfigLoadOptions): Promise<T> {
    // @esta-utils/config-loaderを使用
    const configData = await loadConfig([configName], options?.configPath);
    return configData as T;
  }

  static merge<T>(...configs: Partial<T>[]): T {
    // オブジェクトマージ処理
    return Object.assign({}, ...configs) as T;
  }
}

// 設定アクセサモジュール
export class ConfigAccessor {
  static get<T>(config: any, path: string): T | undefined {
    // ドット記法でのプロパティアクセス
    return path.split('.').reduce((obj, key) => obj?.[key], config);
  }

  static has(config: any, path: string): boolean {
    return ConfigAccessor.get(config, path) !== undefined;
  }

  static validate(config: any, schema: any): ValidationResult {
    // valibotによる検証
    return { valid: true, errors: [], warnings: [] };
  }
}
```

---

## 5. 使用例

### 5.1 基本的な使用

```typescript
import { EstaConfig, ExecutionConfig, FeatureFlagConfig } from '@esta-core/esta-config';

// 各設定の読み込み
const estaConfig = await EstaConfig.load();
const execConfig = await ExecutionConfig.load();
const featureFlags = await FeatureFlagConfig.load();

// 設定値の取得
console.log(estaConfig.installDir);
console.log(estaConfig.get<string>('logLevel'));
console.log(execConfig.verbose);
console.log(featureFlags.experimentalEget);

// 設定の存在確認
if (estaConfig.has('toolsConfig')) {
  console.log('ツール設定ファイルが指定されています');
}
```

### 5.2 GitHub Actions での使用

```typescript
import * as core from '@actions/core';
import { EstaConfig, ExecutionConfig } from '@esta-core/esta-config';

async function runAction() {
  // 設定の読み込み
  const estaConfig = await EstaConfig.load();
  const execConfig = await ExecutionConfig.load();

  // GitHub Actions の入力で設定を上書き
  if (core.getInput('verbose') === 'true') {
    execConfig.verbose = true;
  }
  if (core.getInput('log-level')) {
    estaConfig.logLevel = core.getInput('log-level') as any;
  }

  // アクションの実行
  await runActionLogic(estaConfig, execConfig);
}
```

---

## 6. 設定ファイル検索

既存の `@esta-utils/config-loader` を使用します。以下の機能が提供されています。

<!-- textlint-disable ja-technical-writing/max-comma -->

- 複数の拡張子 (`.json`, `.jsonc`, `.yaml`, `.yml`, `.js`, `.ts`)
- サブディレクトリ（`.config/`）の自動検索
- 指定されたディレクトリ内での検索

<!-- textlint-enable -->

**検索パターン例:**

```bash
esta.config.json
esta.config.yaml
.config/esta.json
.config/esta.config.json
```

**検索範囲:**

- カレントディレクトリ（またはオプションで指定されたディレクトリ）
- 明示的に指定されたパス

---

## 7. 検証スキーマ

### 8.1 Valibot による検証

```typescript
import * as v from 'valibot';

const EstaConfigSchema = v.object({
  installDir: v.optional(v.string()),
  tempDir: v.optional(v.string()),
  toolsConfig: v.optional(v.string()),
  logLevel: v.optional(v.picklist(['debug', 'info', 'warn', 'error'])),
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

// 各設定クラスで個別に検証を実行
// 統合されたRootConfigSchemaは不要
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

- [ ] EstaConfig の実装（シンプル版）
- [ ] ExecutionConfig の実装
- [ ] FeatureFlagConfig の実装
- [ ] 共通モジュール（ConfigLoader/ConfigAccessor）の実装

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
**バージョン**: 1.3.5（GitHub Actions 特化版）
**作成者**: atsushifx
**参照**: [GitHub Issue #88](https://github.com/atsushifx/esta/issues/88)
