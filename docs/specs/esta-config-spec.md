<!--
  src: docs/specs/esta-config-spec.md

  Copyright (c) 2025 atsushifx
  This software is released under the MIT License.
  https://opensource.org/licenses/MIT
-->

# 📘 @esta-core/config モジュール設計仕様書

## 1. 概要

<!-- textlint-disable ja-technical-writing/sentence-length -->

`@esta-core/config` は、ESTA プロジェクトの統一的な設定管理を担うコアモジュールです。`.estarc` ファイル、`esta.config.js` 、環境変数、CLI フラグなどの複数の設定ソースを統合し、一貫性のある設定オブジェクトを提供します。

本モジュールは既存の `@esta-utils/config-loader` を基盤として活用し、`@esta-core/feature-flags` と連携して実行環境に応じた設定管理を実現します。

<!-- textlint-enable -->

---

## 2. 利用目的

| 用途             | 説明                                     |
| ---------------- | ---------------------------------------- |
| 統一的な設定管理 | 複数の設定ソースの統合と一元管理         |
| 環境依存の設定   | GHA/CLI 環境での設定の自動適用           |
| 設定の階層化     | デフォルト設定から個別設定まで優先度管理 |
| 設定値の検証     | 型安全性とバリデーション                 |
| 動的設定更新     | 実行時の設定値変更と通知                 |

---

## 3. 設定ファイル形式

### 3.1 サポートファイル形式

| ファイル名        | 形式       | 優先度 | 説明                 |
| ----------------- | ---------- | ------ | -------------------- |
| `.estarc`         | JSON       | 高     | 基本設定ファイル     |
| `.estarc.json`    | JSON       | 高     | 明示的JSON形式       |
| `.estarc.jsonc`   | JSONC      | 高     | コメント付きJSON     |
| `esta.config.js`  | JavaScript | 中     | 動的設定ファイル     |
| `esta.config.ts`  | TypeScript | 中     | 型安全な設定ファイル |
| `esta.config.mjs` | ESM        | 中     | ES Module形式        |
| `.estarc.yaml`    | YAML       | 低     | YAML形式             |
| `.estarc.yml`     | YAML       | 低     | YAML形式（短縮）     |

### 3.2 設定読み込み優先順位

1. **CLI フラグ** (最高優先度)
2. **環境変数** (`ESTA_*`)
3. **プロジェクト設定ファイル** (`.estarc`, `esta.config.js` 等)
4. **ユーザー設定ファイル** (`~/.estarc`, `~/.config/esta/config.json`)
5. **デフォルト設定** (最低優先度)

---

## 4. 設定スキーマ

### 4.1 基本設定オブジェクト

```typescript
export interface EstaConfig {
  // 実行環境設定
  runtime: EstaRuntimeConfig;

  // ツールインストール設定
  tools: EstaToolsConfig;

  // ログ設定
  logging: EstaLoggingConfig;

  // 出力設定
  output: EstaOutputConfig;

  // プラグイン設定
  plugins: EstaPluginsConfig;

  // 拡張設定
  extensions: Record<string, unknown>;
}
```

### 4.2 実行環境設定

```typescript
export interface EstaRuntimeConfig {
  // 実行モード
  mode: 'development' | 'production' | 'test';

  // デバッグモード
  debug: boolean;

  // 並列実行数
  concurrency: number;

  // タイムアウト設定
  timeout: number;

  // 実行環境固有設定
  github: EstaGitHubConfig;
  cli: EstaCliConfig;
}
```

### 4.3 ツールインストール設定

```typescript
export interface EstaToolsConfig {
  // インストールディレクトリ
  installDir: string;

  // デフォルトインストーラー
  defaultInstaller: 'eget' | 'script' | 'npm' | 'pip';

  // インストーラー設定
  installers: {
    eget: EstaEgetConfig;
    script: EstaScriptConfig;
    npm: EstaNpmConfig;
    pip: EstaPipConfig;
  };

  // ツール設定
  tools: Record<string, EstaToolConfig>;
}
```

### 4.4 ログ設定

```typescript
export interface EstaLoggingConfig {
  // ログレベル
  level: 'debug' | 'info' | 'warn' | 'error';

  // ログフォーマット
  format: 'json' | 'plain' | 'github';

  // ログ出力先
  output: 'console' | 'file' | 'both';

  // ログファイル設定
  file?: {
    path: string;
    maxSize: number;
    maxFiles: number;
  };
}
```

---

## 5. API設計

### 5.1 EstaConfig クラス

```typescript
export class EstaConfig {
  // 静的メソッド
  static async load(options?: EstaConfigLoadOptions): Promise<EstaConfig>;
  static create(config: Partial<EstaConfig>): EstaConfig;
  static getDefault(): EstaConfig;

  // インスタンスメソッド
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  has(key: string): boolean;
  merge(config: Partial<EstaConfig>): EstaConfig;
  validate(): EstaConfigValidationResult;

  // 設定監視
  watch(callback: (config: EstaConfig) => void): () => void;

  // 設定の永続化
  save(filePath?: string): Promise<void>;
}
```

### 5.2 設定読み込みオプション

```typescript
export interface EstaConfigLoadOptions {
  // 設定ファイルのパス
  configPath?: string;

  // 検索ディレクトリ
  searchDirs?: string[];

  // 環境変数プレフィックス
  envPrefix?: string;

  // CLI引数
  cliArgs?: Record<string, unknown>;

  // 設定スキーマ
  schema?: EstaConfigSchema;

  // 読み込み時の変換関数
  transform?: (config: unknown) => Partial<EstaConfig>;
}
```

### 5.3 設定ファイル例

#### .estarc (JSON)

```json
{
  "runtime": {
    "mode": "development",
    "debug": true,
    "concurrency": 4,
    "timeout": 30000
  },
  "tools": {
    "installDir": ".tools/bin",
    "defaultInstaller": "eget",
    "tools": {
      "gh": {
        "installer": "eget",
        "package": "cli/cli",
        "version": "latest"
      }
    }
  },
  "logging": {
    "level": "info",
    "format": "plain",
    "output": "console"
  }
}
```

#### esta.config.js (JavaScript)

```javascript
import { defineConfig } from '@esta-core/config';

export default defineConfig({
  runtime: {
    mode: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG === 'true',
    concurrency: parseInt(process.env.ESTA_CONCURRENCY || '4'),
  },
  tools: {
    installDir: process.env.ESTA_TOOLS_DIR || '.tools/bin',
    defaultInstaller: 'eget',
  },
  logging: {
    level: process.env.ESTA_LOG_LEVEL || 'info',
    format: process.env.CI ? 'github' : 'plain',
  },
});
```

---

## 6. 内部アーキテクチャ

### 6.1 コンポーネント構成

```bash
@esta-core/config/
├── src/
│   ├── EstaConfig.class.ts          # メインクラス
│   ├── loaders/
│   │   ├── FileConfigLoader.ts      # ファイル設定読み込み
│   │   ├── EnvConfigLoader.ts       # 環境変数読み込み
│   │   ├── CliConfigLoader.ts       # CLI引数読み込み
│   │   └── index.ts
│   ├── validators/
│   │   ├── ConfigValidator.ts       # 設定検証
│   │   ├── SchemaValidator.ts       # スキーマ検証
│   │   └── index.ts
│   ├── mergers/
│   │   ├── ConfigMerger.ts          # 設定統合
│   │   ├── DeepMerger.ts           # 深いマージ
│   │   └── index.ts
│   ├── watchers/
│   │   ├── ConfigWatcher.ts         # 設定監視
│   │   └── index.ts
│   └── index.ts
├── shared/
│   ├── types/
│   │   ├── config.types.ts          # 設定型定義
│   │   ├── loader.types.ts          # ローダー型定義
│   │   ├── validator.types.ts       # 検証型定義
│   │   └── index.ts
│   ├── constants/
│   │   ├── defaults.ts              # デフォルト設定
│   │   ├── schemas.ts               # 設定スキーマ
│   │   └── index.ts
│   └── utils/
│       ├── pathUtils.ts             # パス操作
│       ├── envUtils.ts              # 環境変数操作
│       └── index.ts
└── configs/                         # ビルド設定
```

### 6.2 設定読み込みフロー

```mermaid
graph TD
    A[EstaConfig.load()] --> B[FileConfigLoader]
    A --> C[EnvConfigLoader]
    A --> D[CliConfigLoader]

    B --> E[ConfigMerger]
    C --> E
    D --> E

    E --> F[ConfigValidator]
    F --> G[EstaConfig Instance]

    G --> H[FeatureFlags Integration]
    H --> I[Runtime Configuration]
```

---

## 7. 既存モジュールとの統合

### 7.1 @esta-utils/config-loader との連携

```typescript
// @esta-utils/config-loader を内部で活用
import { findConfigFile, loadConfig, parseConfig } from '@esta-utils/config-loader';

class FileConfigLoader {
  async load(searchDirs: string[]): Promise<Partial<EstaConfig>> {
    // 既存のconfig-loaderを使用してファイル読み込み
    const configFile = await findConfigFile('esta', searchDirs);
    if (!configFile) { return {}; }

    const rawConfig = await loadConfig(configFile);
    return parseConfig(rawConfig);
  }
}
```

### 7.2 @esta-core/feature-flags との連携

```typescript
import { FeatureFlags } from '@esta-core/feature-flags';

class EstaConfig {
  static async load(options?: EstaConfigLoadOptions): Promise<EstaConfig> {
    const context = FeatureFlags.context;

    // 実行環境に応じた設定読み込み
    const loaderOptions = {
      ...options,
      searchDirs: context.isGitHubActions
        ? [process.env.GITHUB_WORKSPACE || process.cwd()]
        : [process.cwd(), os.homedir()],
    };

    // 設定読み込み処理
    const config = await this.loadFromSources(loaderOptions);

    // 実行環境に応じたデフォルト設定適用
    if (context.isGitHubActions) {
      config.logging.format = 'github';
      config.output.quiet = true;
    }

    return new EstaConfig(config);
  }
}
```

---

## 8. 使用例

### 8.1 基本的な使用方法

```typescript
import { EstaConfig } from '@esta-core/config';

// 設定読み込み
const config = await EstaConfig.load();

// 設定値の取得
const logLevel = config.get('logging.level');
const toolsDir = config.get('tools.installDir');

// 設定値の設定
config.set('logging.level', 'debug');

// 設定の監視
const unwatch = config.watch((newConfig) => {
  console.log('Configuration updated:', newConfig);
});
```

### 8.2 カスタム設定スキーマ

```typescript
import { defineConfigSchema, EstaConfig } from '@esta-core/config';

const customSchema = defineConfigSchema({
  myPlugin: {
    type: 'object',
    properties: {
      enabled: { type: 'boolean', default: true },
      options: { type: 'object', default: {} },
    },
  },
});

const config = await EstaConfig.load({
  schema: customSchema,
});
```

### 8.3 環境変数との連携

```bash
# 環境変数設定
export ESTA_RUNTIME_MODE=production
export ESTA_TOOLS_INSTALL_DIR=/usr/local/bin
export ESTA_LOGGING_LEVEL=error
```

```typescript
// 自動的に環境変数が設定に反映される
const config = await EstaConfig.load();
console.log(config.get('runtime.mode')); // 'production'
console.log(config.get('logging.level')); // 'error'
```

---

## 9. テスト戦略

### 9.1 ユニットテスト

```typescript
describe('EstaConfig', () => {
  describe('load', () => {
    it('should load config from file', async () => {
      // テストケース実装
    });

    it('should merge environment variables', async () => {
      // テストケース実装
    });

    it('should prioritize CLI arguments', async () => {
      // テストケース実装
    });
  });
});
```

### 9.2 E2Eテスト

```typescript
describe('EstaConfig E2E', () => {
  it('should work with GitHub Actions environment', async () => {
    // GitHub Actions環境での動作テスト
  });

  it('should work with CLI environment', async () => {
    // CLI環境での動作テスト
  });
});
```

---

## 10. 拡張計画

| 項目               | 説明                                   | 優先度 |
| ------------------ | -------------------------------------- | ------ |
| 設定テンプレート   | プロジェクトタイプ別の設定テンプレート | 高     |
| 設定UI             | Web UIによる設定管理                   | 中     |
| 設定の暗号化       | 機密設定の暗号化サポート               | 中     |
| 設定の同期         | チーム間での設定同期機能               | 低     |
| プラグインシステム | 設定の拡張可能なプラグイン機構         | 低     |

---

## 11. 開発ガイドライン

### 11.1 実装原則

- 型安全性: TypeScript の型システムを最大限活用
- テスト駆動開発: t-wada 方式の TDD に従う
- パフォーマンス: 設定読み込みの最適化
- 拡張性: プラグイン機構による機能拡張
- 互換性: 既存モジュールとの完全な統合

### 11.2 コード品質

- ESLint: 厳格な lint ルール適用
- TypeScript* strict mode での開発
- テストカバレッジ: 90%以上の維持
- ドキュメント: 包括的な API 文書

---

## 12. 参考資料

- [Issue #88: ESTA用に環境設定機能を追加](https://github.com/atsushifx/esta/issues/88)
- [@esta-utils/config-loader パッケージ](https://github.com/atsushifx/esta/tree/main/packages/@esta-utils/config-loader)
- [@esta-core/feature-flags 仕様書](./feature-flags.specs.md)

---

**作成日**: 2025年7月9日
**バージョン**: 1.0.0
**作成者**: atsushifx
