---
header:
  - src: docs/.ccKiro/@esta-core/esta-config/esta-config.design.md
  - "@(#)": ESTA unified user configuration detailed design
title: ESTA統合ユーザー設定管理詳細設計書（@esta-core/esta-config）
description: ESTAツール群のユーザー設定を統合管理するパッケージの実装設計
version: 1.0.0
created: 2025-07-20
updated: 2025-07-20
authors:
  - 🤖 Claude（詳細設計・実装方針）
  - 👤 atsushifx（設計確認・承認）
changes:
  - 2025-07-20: 初回作成（仕様書に基づく実装設計）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## ESTA 統合ユーザー設定管理 詳細設計書

### 1. アーキテクチャ設計

#### 1.1 全体構成

```bash
@esta-core/esta-config
├── src/
│   ├── core/
│   │   ├── config/
│   │   │   ├── loadEstaConfig.ts      # 設定ファイル読み込み
│   │   │   ├── mergeEstaConfig.ts     # 設定マージ処理
│   │   │   └── validateEstaConfig.ts  # 設定検証処理
│   │   └── index.ts
│   ├── schemas/
│   │   ├── estaConfig.schemas.ts      # valibotスキーマ定義
│   │   └── index.ts
│   ├── types/
│   │   ├── estaConfig.types.ts        # 型定義
│   │   └── index.ts
│   ├── defaults.ts                    # デフォルト設定
│   ├── getEstaConfig.ts              # メインエントリーポイント
│   └── index.ts                       # パッケージエクスポート
```

#### 1.2 モジュール依存関係

```mermaid
graph TD
    A[getEstaConfig] --> B[loadEstaConfig]
    A --> C[mergeEstaConfig]
    A --> D[validateEstaConfig]
    A --> E[defaults]

    B --> F[@esta-utils/config-loader]
    D --> G[estaConfig.schemas]

    G --> H[valibot]
    I[estaConfig.types] --> J[@agla-utils/ag-logger]
```

### 2. 実装設計

#### 2.1 メイン関数設計

##### getEstaConfig.ts

```typescript
import { loadConfig } from '@esta-utils/config-loader';
import { loadEstaConfig } from './core/config/loadEstaConfig';
import { mergeEstaConfig } from './core/config/mergeEstaConfig';
import { validateEstaConfig } from './core/config/validateEstaConfig';
import { defaultEstaConfig } from './defaults';
import type { EstaConfig } from './types';

export async function getEstaConfig(configPath?: string): Promise<EstaConfig> {
  // 1. デフォルト設定を取得
  const defaultConfig = defaultEstaConfig();

  // 2. ユーザー設定を読み込み（ファイルが存在しない場合はnull）
  const userConfig = configPath
    ? await loadEstaConfig(configPath)
    : await searchAndLoadConfig();

  // 3. 設定をマージ
  const mergedConfig = mergeEstaConfig(defaultConfig, userConfig);

  // 4. 設定を検証
  const validatedConfig = validateEstaConfig(mergedConfig);

  return validatedConfig;
}

async function searchAndLoadConfig(): Promise<PartialEstaConfig | null> {
  const configNames = [
    '.estarc',
    'esta.config.js',
    'esta.config.ts',
    'esta.config.json',
    'esta.config.yml',
    'esta.config.yaml',
  ];

  for (const configName of configNames) {
    try {
      const config = await loadEstaConfig(configName);
      if (config) { return config; }
    } catch (error) {
      // ファイルが存在しない場合は次のファイルを試行
      continue;
    }
  }

  return null;
}
```

#### 2.2 設定読み込み設計

##### loadEstaConfig.ts

```typescript
import { loadConfig } from '@esta-utils/config-loader';
import type { PartialEstaConfig } from '../../types';

export async function loadEstaConfig(configPath: string): Promise<PartialEstaConfig | null> {
  try {
    const config = await loadConfig<PartialEstaConfig>({
      configName: getConfigName(configPath),
      searchDirs: [process.cwd()],
      extensions: getExtensions(configPath),
    });

    return config;
  } catch (error) {
    if (isFileNotFoundError(error)) {
      return null;
    }
    throw new Error(`設定ファイルの読み込みに失敗しました: ${configPath}`);
  }
}

function getConfigName(configPath: string): string {
  const name = path.basename(configPath, path.extname(configPath));
  return name;
}

function getExtensions(configPath: string): string[] {
  const ext = path.extname(configPath);
  return ext ? [ext] : ['.js', '.ts', '.json', '.yml', '.yaml'];
}

function isFileNotFoundError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('ENOENT');
}
```

#### 2.3 設定マージ設計

##### mergeEstaConfig.ts

```typescript
import type { EstaConfig, PartialEstaConfig } from '../../types';

export function mergeEstaConfig(
  defaultConfig: EstaConfig,
  userConfig: PartialEstaConfig | null,
): EstaConfig {
  if (!userConfig) {
    return { ...defaultConfig };
  }

  return {
    toolsConfigPath: userConfig.toolsConfigPath ?? defaultConfig.toolsConfigPath,
    logLevel: userConfig.logLevel ?? defaultConfig.logLevel,
  };
}
```

#### 2.4 設定検証設計

##### validateEstaConfig.ts

```typescript
import { parse } from 'valibot';
import { EstaConfigSchema } from '../../schemas';
import type { EstaConfig } from '../../types';

export function validateEstaConfig(config: EstaConfig): EstaConfig {
  try {
    return parse(EstaConfigSchema, config);
  } catch (error) {
    throw new Error(`設定値の検証に失敗しました: ${formatValidationError(error)}`);
  }
}

function formatValidationError(error: unknown): string {
  // valibotのエラーを分かりやすい日本語に変換
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as any).issues;
    return issues.map((issue: any) => `${issue.path}: ${issue.message}`).join(', ');
  }
  return String(error);
}
```

### 3. 型定義設計

#### 3.1 型定義

##### estaConfig.types.ts

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

// エラー型定義
export class ConfigNotFoundError extends Error {
  constructor(configPath: string) {
    super(`設定ファイルが見つかりません: ${configPath}`);
    this.name = 'ConfigNotFoundError';
  }
}

export class ConfigParseError extends Error {
  constructor(configPath: string, originalError: Error) {
    super(`設定ファイルの解析に失敗しました: ${configPath} - ${originalError.message}`);
    this.name = 'ConfigParseError';
  }
}

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(`設定値の検証に失敗しました: ${message}`);
    this.name = 'ConfigValidationError';
  }
}
```

### 4. スキーマ設計

#### 4.1 valibotスキーマ

##### estaConfig.schemas.ts

```typescript
import { check, number, object, optional, pipe, string } from 'valibot';

// ログレベル検証関数
const validateLogLevel = (level: number): boolean => {
  return Number.isInteger(level) && level >= 0 && level <= 6;
};

// 完全設定スキーマ
export const EstaConfigSchema = object({
  toolsConfigPath: pipe(
    string('ツール設定ファイルのパスは文字列で指定してください'),
    check((path) => path.length > 0, 'ツール設定ファイルのパスは空文字列にできません'),
  ),
  logLevel: pipe(
    number('ログレベルは数値で指定してください'),
    check(validateLogLevel, 'ログレベルは0-6の整数で指定してください'),
  ),
});

// 部分設定スキーマ
export const PartialEstaConfigSchema = object({
  toolsConfigPath: optional(pipe(
    string('ツール設定ファイルのパスは文字列で指定してください'),
    check((path) => path.length > 0, 'ツール設定ファイルのパスは空文字列にできません'),
  )),
  logLevel: optional(pipe(
    number('ログレベルは数値で指定してください'),
    check(validateLogLevel, 'ログレベルは0-6の整数で指定してください'),
  )),
});
```

### 5. デフォルト設定設計

#### 5.1 デフォルト値定義

##### defaults.ts

```typescript
import { AgLogLevelCode } from '@agla-utils/ag-logger';
import type { EstaConfig } from './types';

export function defaultEstaConfig(): EstaConfig {
  return {
    toolsConfigPath: './tools.config.json',
    logLevel: AgLogLevelCode.INFO,
  };
}

// 定数として利用したい場合のエクスポート
export const DEFAULT_ESTA_CONFIG: EstaConfig = {
  toolsConfigPath: './tools.config.json',
  logLevel: AgLogLevelCode.INFO,
} as const;
```

### 6. パッケージエクスポート設計

#### 6.1 メインエクスポート

##### index.ts

```typescript
// メイン関数
export { defaultEstaConfig } from './defaults';
export { getEstaConfig } from './getEstaConfig';

// 型定義
export type { EstaConfig, PartialEstaConfig } from './types';

// エラー型
export {
  ConfigNotFoundError,
  ConfigParseError,
  ConfigValidationError,
} from './types';

// 内部関数（必要に応じて）
export { loadEstaConfig } from './core/config/loadEstaConfig';
export { mergeEstaConfig } from './core/config/mergeEstaConfig';
export { validateEstaConfig } from './core/config/validateEstaConfig';
```

### 7. テスト設計

#### 7.1 テスト構成

```text
src/
├── __tests__/
│   ├── getEstaConfig.spec.ts          # メイン関数テスト
│   ├── defaults.spec.ts               # デフォルト設定テスト
│   └── core/
│       └── config/
│           ├── loadEstaConfig.spec.ts
│           ├── mergeEstaConfig.spec.ts
│           └── validateEstaConfig.spec.ts
```

#### 7.2 テスト方針

##### ユニットテスト

- 各関数の単体テスト
- エッジケースの検証
- エラーハンドリングの確認

##### E2E テスト

```text
tests/e2e/
├── configFileFormats.spec.ts         # 各設定ファイル形式のテスト
├── configFileSearch.spec.ts          # 設定ファイル検索のテスト
└── configValidation.spec.ts          # 設定検証のテスト
```

#### 7.3 テストデータ設計

##### フィクスチャ

```text
tests/fixtures/
├── valid/
│   ├── .estarc
│   ├── esta.config.js
│   ├── esta.config.ts
│   ├── esta.config.json
│   └── esta.config.yml
└── invalid/
    ├── invalid-json.json
    ├── invalid-logLevel.json
    └── invalid-path.json
```

### 8. エラーハンドリング設計

#### 8.1 エラー階層

```bash
Error
├── ConfigNotFoundError     # 設定ファイル未発見
├── ConfigParseError        # パースエラー
└── ConfigValidationError   # バリデーションエラー
```

#### 8.2 エラー処理フロー

1. **ファイル読み込みエラー**: ConfigNotFoundError として処理、デフォルト設定を使用
2. **パースエラー**: ConfigParseError としてスロー、処理中断
3. **バリデーションエラー**: ConfigValidationError としてスロー、処理中断

### 9. パフォーマンス最適化

#### 9.1 最適化戦略

- 設定ファイル検索の効率化（存在確認を先行実行）
- valibot スキーマのコンパイル時最適化
- 不要なファイル読み込みの回避

#### 9.2 メモリ管理

- 設定オブジェクトの最小化
- 一時的な中間オブジェクトの削減

### 10. セキュリティ設計

#### 10.1 設定ファイル読み込み

- パストラバーサル攻撃の防止
- 相対パス解決の制限
- 実行可能ファイルの安全な処理

#### 10.2 設定値検証

- 入力値のサニタイゼーション
- 型安全性の保証
- 不正な値の拒否

### 11. ビルド設定

#### 11.1 tsup設定

##### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  target: 'es2022',
});
```

#### 11.2 package.json設定

##### 主要フィールド

```json
{
  "name": "@esta-core/esta-config",
  "type": "module",
  "main": "./lib/index.cjs",
  "module": "./module/index.js",
  "types": "./module/index.d.ts",
  "exports": {
    ".": {
      "types": "./module/index.d.ts",
      "import": "./module/index.js",
      "require": "./lib/index.cjs"
    }
  },
  "dependencies": {
    "valibot": "^1.1.0",
    "@esta-utils/config-loader": "workspace:*",
    "@agla-utils/ag-logger": "workspace:*"
  }
}
```
