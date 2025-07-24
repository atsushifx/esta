# Migration Strategy

# 移行戦略

## 移行方針

### 基本原則

1. **無停止移行**: 既存システムを停止せずに段階的移行
2. **互換性維持**: 破壊的変更を回避する互換性レイヤー
3. **段階的検証**: 各フェーズでの品質確認
4. **ロールバック対応**: 問題発生時の即座復旧

### 移行スケジュール

**総期間**: 8週間\
**各フェーズ**: 1-2週間\
**検証期間**: 各フェーズで1-2日

## Phase 1: 基盤構築（Week 1-2）

### 目標

新しい基盤パッケージの作成と動作確認

### 1.1 @esta-error-result パッケージ作成

#### 実装内容

```typescript
// packages/@esta-error-result/src/index.ts
export type Result<T, E = Error> = Ok<T> | Err<E>;

export interface Ok<T> {
  readonly tag: 'ok';
  readonly value: T;
  isOk(): this is Ok<T>;
  isErr(): this is never;
  map<U>(fn: (value: T) => U): Result<U, E>;
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
  unwrap(): T;
  unwrapOr(defaultValue: T): T;
}

export interface Err<E> {
  readonly tag: 'err';
  readonly error: E;
  isOk(): this is never;
  isErr(): this is Err<E>;
  mapErr<F>(fn: (error: E) => F): Result<T, F>;
  unwrapErr(): E;
}

// ファクトリー関数
export const ok = <T>(value: T): Ok<T> => ({
  tag: 'ok',
  value,
  isOk: () => true,
  isErr: () => false,
  map: <U>(fn: (value: T) => U) => ok(fn(value)),
  flatMap: <U>(fn: (value: T) => Result<U, E>) => fn(value),
  unwrap: () => value,
  unwrapOr: () => value,
});

export const err = <E>(error: E): Err<E> => ({
  tag: 'err',
  error,
  isOk: () => false,
  isErr: () => true,
  mapErr: <F>(fn: (error: E) => F) => err(fn(error)),
  unwrapErr: () => error,
});

// 既存パターンとの相互運用
export const fromBoolean = <E>(
  value: boolean,
  error: E,
): Result<boolean, E> => value ? ok(value) : err(error);

export const fromNullable = <T, E>(
  value: T | null | undefined,
  error: E,
): Result<T, E> => (value != null) ? ok(value) : err(error);

export const fromPromise = async <T>(
  promise: Promise<T>,
): Promise<Result<T, Error>> => {
  try {
    const value = await promise;
    return ok(value);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
};

// errorExit との統合
export const unwrapOrExit = <T>(
  result: Result<T, Error>,
  exitCode: number = 1,
): T => {
  if (result.isOk()) {
    return result.value;
  }

  // @esta-core/error-handler との統合
  const { errorExit } = require('@esta-core/error-handler');
  errorExit(exitCode, result.error.message);
};
```

#### package.json

```json
{
  "name": "@esta-error-result",
  "version": "0.1.0",
  "description": "Result<T, E> pattern for unified error handling",
  "main": "lib/index.cjs",
  "module": "module/index.js",
  "types": "lib/index.d.ts",
  "exports": {
    ".": {
      "import": "./module/index.js",
      "require": "./lib/index.cjs",
      "types": "./lib/index.d.ts"
    }
  },
  "files": ["lib/", "module/", "README.md"],
  "dependencies": {
    "@shared/constants": "workspace:*"
  },
  "devDependencies": {
    "@esta-core/error-handler": "workspace:*"
  }
}
```

#### テスト実装

```typescript
// src/__tests__/result.spec.ts
import { describe, expect, it } from 'vitest';
import { err, fromBoolean, fromNullable, fromPromise, ok, Result } from '../index';

describe('Result<T, E>', () => {
  describe('Ok<T>', () => {
    it('should create Ok value', () => {
      const result = ok(42);
      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
      expect(result.value).toBe(42);
    });

    it('should map value', () => {
      const result = ok(42).map((x) => x * 2);
      expect(result.isOk()).toBe(true);
      expect(result.value).toBe(84);
    });

    it('should flatMap value', () => {
      const result = ok(42).flatMap((x) => ok(x.toString()));
      expect(result.isOk()).toBe(true);
      expect(result.value).toBe('42');
    });
  });

  describe('Err<E>', () => {
    it('should create Err value', () => {
      const result = err(new Error('test'));
      expect(result.isOk()).toBe(false);
      expect(result.isErr()).toBe(true);
      expect(result.error.message).toBe('test');
    });

    it('should mapErr error', () => {
      const result = err(new Error('test')).mapErr((e) => new Error(`Wrapped: ${e.message}`));
      expect(result.isErr()).toBe(true);
      expect(result.error.message).toBe('Wrapped: test');
    });
  });

  describe('Utility functions', () => {
    it('should convert boolean to Result', () => {
      const success = fromBoolean(true, 'error');
      const failure = fromBoolean(false, 'error');

      expect(success.isOk()).toBe(true);
      expect(failure.isErr()).toBe(true);
    });

    it('should convert nullable to Result', () => {
      const value = fromNullable('test', 'null error');
      const nullValue = fromNullable(null, 'null error');

      expect(value.isOk()).toBe(true);
      expect(nullValue.isErr()).toBe(true);
    });

    it('should convert Promise to Result', async () => {
      const success = await fromPromise(Promise.resolve(42));
      const failure = await fromPromise(Promise.reject(new Error('async error')));

      expect(success.isOk()).toBe(true);
      expect(failure.isErr()).toBe(true);
    });
  });
});
```

### 1.2 @esta-runtime パッケージ作成

#### 実装内容

```typescript
// packages/@esta-runtime/src/index.ts
export type RuntimeType = 'node' | 'deno' | 'bun' | 'github-actions';

// ランタイム検出
export const detectRuntime = (): RuntimeType => {
  if (typeof process !== 'undefined' && process.env.GITHUB_ACTIONS) {
    return 'github-actions';
  }
  if (typeof Deno !== 'undefined') {
    return 'deno';
  }
  if (typeof Bun !== 'undefined') {
    return 'bun';
  }
  if (typeof process !== 'undefined' && process.versions?.node) {
    return 'node';
  }
  throw new Error('Unknown runtime environment');
};

// ランタイムアダプター
export interface RuntimeAdapter {
  name: RuntimeType;
  version: string;
  features: RuntimeFeatures;
  fs: FileSystemAdapter;
  process: ProcessAdapter;
  githubActions?: GitHubActionsAdapter;
}

export interface RuntimeFeatures {
  hasFileSystem: boolean;
  hasProcess: boolean;
  hasNetwork: boolean;
  hasWorkerThreads: boolean;
  hasPermissions: boolean;
}

// ファイルシステム抽象化
export interface FileSystemAdapter {
  readText(path: string): Promise<string>;
  writeText(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  rmdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<FileStats>;
  resolve(...segments: string[]): string;
  relative(from: string, to: string): string;
}

export interface FileStats {
  isFile(): boolean;
  isDirectory(): boolean;
  size: number;
  mtime: Date;
}

// プロセス抽象化
export interface ProcessAdapter {
  env: Record<string, string>;
  cwd(): string;
  chdir(path: string): void;
  exit(code?: number): never;
  platform: string;
  arch: string;
}

// GitHub Actions抽象化
export interface GitHubActionsAdapter {
  setOutput(name: string, value: string): void;
  setSecret(secret: string): void;
  addPath(path: string): void;
  exportVariable(name: string, value: string): void;
  getInput(name: string, options?: { required?: boolean }): string;
  setFailed(message: string): void;
}

// ファクトリー関数
export const createRuntime = (): RuntimeAdapter => {
  const runtime = detectRuntime();

  switch (runtime) {
    case 'node':
      return createNodeAdapter();
    case 'deno':
      return createDenoAdapter();
    case 'bun':
      return createBunAdapter();
    case 'github-actions':
      return createGitHubActionsAdapter();
    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }
};

// Node.js実装
const createNodeAdapter = (): RuntimeAdapter => {
  const fs = require('fs').promises;
  const path = require('path');
  const process = require('process');

  return {
    name: 'node',
    version: process.versions.node,
    features: {
      hasFileSystem: true,
      hasProcess: true,
      hasNetwork: true,
      hasWorkerThreads: true,
      hasPermissions: false,
    },
    fs: {
      readText: (path: string) => fs.readFile(path, 'utf8'),
      writeText: (path: string, content: string) => fs.writeFile(path, content, 'utf8'),
      exists: async (path: string) => {
        try {
          await fs.access(path);
          return true;
        } catch {
          return false;
        }
      },
      mkdir: (path: string, options?) => fs.mkdir(path, options),
      rmdir: (path: string, options?) => fs.rmdir(path, options),
      readdir: (path: string) => fs.readdir(path),
      stat: async (path: string) => {
        const stats = await fs.stat(path);
        return {
          isFile: () => stats.isFile(),
          isDirectory: () => stats.isDirectory(),
          size: stats.size,
          mtime: stats.mtime,
        };
      },
      resolve: (...segments: string[]) => path.resolve(...segments),
      relative: (from: string, to: string) => path.relative(from, to),
    },
    process: {
      env: process.env,
      cwd: () => process.cwd(),
      chdir: (path: string) => process.chdir(path),
      exit: (code?: number) => process.exit(code),
      platform: process.platform,
      arch: process.arch,
    },
  };
};

// Deno実装
const createDenoAdapter = (): RuntimeAdapter => {
  return {
    name: 'deno',
    version: Deno.version.deno,
    features: {
      hasFileSystem: true,
      hasProcess: true,
      hasNetwork: true,
      hasWorkerThreads: true,
      hasPermissions: true,
    },
    fs: {
      readText: (path: string) => Deno.readTextFile(path),
      writeText: (path: string, content: string) => Deno.writeTextFile(path, content),
      exists: async (path: string) => {
        try {
          await Deno.stat(path);
          return true;
        } catch {
          return false;
        }
      },
      mkdir: (path: string, options?) => Deno.mkdir(path, options),
      rmdir: (path: string, options?) => Deno.remove(path, options),
      readdir: async (path: string) => {
        const entries = [];
        for await (const entry of Deno.readDir(path)) {
          entries.push(entry.name);
        }
        return entries;
      },
      stat: async (path: string) => {
        const stats = await Deno.stat(path);
        return {
          isFile: () => stats.isFile,
          isDirectory: () => stats.isDirectory,
          size: stats.size || 0,
          mtime: stats.mtime || new Date(),
        };
      },
      resolve: (...segments: string[]) => {
        // Deno用パス解決実装
        return segments.reduce((acc, segment) => {
          if (segment.startsWith('/')) { return segment; }
          return acc + '/' + segment;
        });
      },
      relative: (from: string, to: string) => {
        // Deno用相対パス実装
        return to.replace(from, '').replace(/^\//, '');
      },
    },
    process: {
      env: Deno.env.toObject(),
      cwd: () => Deno.cwd(),
      chdir: (path: string) => Deno.chdir(path),
      exit: (code?: number) => Deno.exit(code),
      platform: Deno.build.os,
      arch: Deno.build.arch,
    },
  };
};

// Bun実装
const createBunAdapter = (): RuntimeAdapter => {
  return {
    name: 'bun',
    version: Bun.version,
    features: {
      hasFileSystem: true,
      hasProcess: true,
      hasNetwork: true,
      hasWorkerThreads: true,
      hasPermissions: false,
    },
    fs: {
      readText: (path: string) => Bun.file(path).text(),
      writeText: (path: string, content: string) => Bun.write(path, content),
      exists: (path: string) => Bun.file(path).exists(),
      mkdir: async (path: string, options?) => {
        // Bunの場合はNode.js互換APIを使用
        const fs = require('fs').promises;
        return fs.mkdir(path, options);
      },
      rmdir: async (path: string, options?) => {
        const fs = require('fs').promises;
        return fs.rmdir(path, options);
      },
      readdir: async (path: string) => {
        const fs = require('fs').promises;
        return fs.readdir(path);
      },
      stat: async (path: string) => {
        const fs = require('fs').promises;
        const stats = await fs.stat(path);
        return {
          isFile: () => stats.isFile(),
          isDirectory: () => stats.isDirectory(),
          size: stats.size,
          mtime: stats.mtime,
        };
      },
      resolve: (...segments: string[]) => {
        const path = require('path');
        return path.resolve(...segments);
      },
      relative: (from: string, to: string) => {
        const path = require('path');
        return path.relative(from, to);
      },
    },
    process: {
      env: process.env,
      cwd: () => process.cwd(),
      chdir: (path: string) => process.chdir(path),
      exit: (code?: number) => process.exit(code),
      platform: process.platform,
      arch: process.arch,
    },
  };
};

// GitHub Actions実装
const createGitHubActionsAdapter = (): RuntimeAdapter => {
  const nodeAdapter = createNodeAdapter();
  const core = require('@actions/core');

  return {
    ...nodeAdapter,
    name: 'github-actions',
    githubActions: {
      setOutput: (name: string, value: string) => core.setOutput(name, value),
      setSecret: (secret: string) => core.setSecret(secret),
      addPath: (path: string) => core.addPath(path),
      exportVariable: (name: string, value: string) => core.exportVariable(name, value),
      getInput: (name: string, options?) => core.getInput(name, options),
      setFailed: (message: string) => core.setFailed(message),
    },
  };
};
```

### 1.3 @shared パッケージ拡張

#### @shared/types 拡張

```typescript
// shared/packages/types/base/index.ts

// 既存エクスポートを保持
export {};

// 新しい型定義を追加
export type RuntimeType = 'node' | 'deno' | 'bun' | 'github-actions';
export type PlatformType = 'win32' | 'darwin' | 'linux';

// ログ関連型
export type LogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type LogLevelLabel = 'OFF' | 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';

// 設定関連型
export type ConfigFormat = 'json' | 'jsonc' | 'yaml' | 'yml' | 'toml' | 'js' | 'mjs' | 'ts' | 'mts';

// パス関連型
export type PathString = string;
export type NormalizedPath = string;
export type AbsolutePath = string;

// エラー関連型
export type ExitCode = number;
export type ErrorCode = string;

// 結果型（再エクスポート）
export type Result<T, E = Error> = import('@esta-error-result').Result<T, E>;

// インストーラー関連型
export type InstallerType = 'eget' | 'npm' | 'script' | 'github' | 'custom';

// 共通設定型
export interface BaseConfig {
  logLevel?: LogLevel | LogLevelLabel;
  cacheDir?: string;
  configDir?: string;
}

// 環境変数型
export interface EnvironmentVariables {
  NODE_ENV?: 'development' | 'production' | 'test';
  CI?: string;
  GITHUB_ACTIONS?: string;
  LOG_LEVEL?: string;
  [key: string]: string | undefined;
}
```

#### @shared/constants 拡張

```typescript
// shared/packages/constants/base/index.ts

// 既存の定数をインポート
export * from './common';
export * from './defaults';
export * from './directories';
export * from './exit-code';

// 新しい定数を追加
export const RUNTIME_IDENTIFIERS = {
  NODE: 'node' as const,
  DENO: 'deno' as const,
  BUN: 'bun' as const,
  GITHUB_ACTIONS: 'github-actions' as const,
} as const;

export const LOG_LEVEL_MAP = {
  OFF: 0,
  FATAL: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  DEBUG: 5,
  TRACE: 6,
} as const;

export const LOG_LEVEL_LABELS = {
  0: 'OFF',
  1: 'FATAL',
  2: 'ERROR',
  3: 'WARN',
  4: 'INFO',
  5: 'DEBUG',
  6: 'TRACE',
} as const;

export const SUPPORTED_CONFIG_EXTENSIONS = [
  '.json',
  '.jsonc',
  '.yaml',
  '.yml',
  '.toml',
  '.js',
  '.mjs',
  '.ts',
  '.mts',
] as const;

export const DEFAULT_CONFIG = {
  LOG_LEVEL: 4, // INFO
  CONFIG_DIR: '.config',
  CACHE_DIR: '.cache',
  INSTALL_DIR: '.tools',
  TIMEOUT: 30000, // 30秒
  MAX_RETRIES: 3,
} as const;

export const ERROR_MESSAGES = {
  ja: {
    VALIDATION_FAILED: '設定の検証に失敗しました',
    FILE_NOT_FOUND: 'ファイルが見つかりません',
    CONFIG_ERROR: '設定エラーが発生しました',
    PERMISSION_DENIED: 'アクセス権限がありません',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
    TIMEOUT_ERROR: 'タイムアウトが発生しました',
    INVALID_PATH: '無効なパスが指定されました',
    COMMAND_NOT_FOUND: 'コマンドが見つかりません',
  },
  en: {
    VALIDATION_FAILED: 'Configuration validation failed',
    FILE_NOT_FOUND: 'File not found',
    CONFIG_ERROR: 'Configuration error occurred',
    PERMISSION_DENIED: 'Permission denied',
    NETWORK_ERROR: 'Network error occurred',
    TIMEOUT_ERROR: 'Timeout occurred',
    INVALID_PATH: 'Invalid path specified',
    COMMAND_NOT_FOUND: 'Command not found',
  },
} as const;

export const PLATFORM_ALIASES = {
  win32: ['windows', 'win'],
  darwin: ['macos', 'osx', 'mac'],
  linux: ['linux', 'ubuntu', 'debian', 'centos', 'fedora'],
} as const;

export const INSTALLER_PRIORITIES = {
  eget: 1,
  github: 2,
  npm: 3,
  script: 4,
  custom: 5,
} as const;
```

### Phase 1 完了チェック

#### 品質確認

```bash
# 新パッケージのテスト実行
pnpm run test:develop --filter="@esta-error-result"
pnpm run test:develop --filter="@esta-runtime"
pnpm run test:develop --filter="@shared/*"

# 型チェック
pnpm run check:types --filter="@esta-error-result"
pnpm run check:types --filter="@esta-runtime"

# ビルド確認
pnpm run build --filter="@esta-error-result"
pnpm run build --filter="@esta-runtime"

# 依存関係チェック
pnpm exec madge --circular packages/@esta-error-result
pnpm exec madge --circular packages/@esta-runtime
```

#### 動作確認

```typescript
// Phase 1 動作確認スクリプト
// scripts/verify-phase1.ts
import { err, ok, Result } from '@esta-error-result';
import { createRuntime, detectRuntime } from '@esta-runtime';
import { LOG_LEVEL_MAP, RUNTIME_IDENTIFIERS } from '@shared/constants';

console.log('Phase 1 動作確認開始...');

// Result<T, E> 動作確認
const testResult: Result<number, string> = ok(42);
console.log('Result test:', testResult.isOk() ? '✓' : '✗');

// Runtime 動作確認
const runtime = createRuntime();
console.log('Runtime:', runtime.name);
console.log('Version:', runtime.version);

// 共有定数確認
console.log('Log levels:', Object.keys(LOG_LEVEL_MAP));
console.log('Runtimes:', Object.values(RUNTIME_IDENTIFIERS));

console.log('Phase 1 完了 ✓');
```

## Phase 2: 機能統合（Week 3-4）

### 目標

重複している機能パッケージの統合

### 2.1 @esta-config パッケージ作成

#### 移行対象

- `@esta-utils/config-loader` （全体）
- `@esta-core/tools-config/core/config/`
- `@esta-core/esta-config/configLoader.ts`

#### 実装アプローチ

1. **統合インターフェース設計**: 3つのローダーの機能を統合
2. **Result<T, E>適用**: エラーハンドリングの統一
3. **ランタイム抽象化**: `@esta-runtime`を活用
4. **段階的移行**: 既存インターフェースの互換性レイヤー

#### 実装詳細

```typescript
// packages/@esta-config/src/UniversalConfigLoader.ts
import { err, ok, Result } from '@esta-error-result';
import { createRuntime, RuntimeAdapter } from '@esta-runtime';
import { BaseConfig, ConfigFormat } from '@shared/types';

export class UniversalConfigLoader<T extends BaseConfig> {
  private runtime: RuntimeAdapter;

  constructor(
    private schema: ValidationSchema<T>,
    private options: ConfigLoaderOptions = {},
  ) {
    this.runtime = createRuntime();
  }

  // @esta-utils/config-loaderの機能
  async load(path?: string): Promise<Result<T, ConfigError>> {
    try {
      // 設定ファイル探索
      const configPath = path || await this.findConfigFile();
      if (!configPath) {
        return err({
          code: 'FILE_NOT_FOUND',
          message: 'Configuration file not found',
          path: path || 'unknown',
        });
      }

      // ファイル読み込み
      const content = await this.runtime.fs.readText(configPath);

      // 形式判定と解析
      const format = this.detectFormat(configPath);
      const parsed = await this.parseContent(content, format);
      if (parsed.isErr()) {
        return parsed;
      }

      // バリデーション
      const validated = this.validateConfig(parsed.value);
      if (validated.isErr()) {
        return validated;
      }

      return ok(validated.value);
    } catch (error) {
      return err({
        code: 'CONFIG_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        path: path || 'unknown',
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  // 設定ファイル検索
  async search(options?: SearchOptions): Promise<Result<T, ConfigError>> {
    const searchDirs = options?.searchDirs || this.getDefaultSearchDirs();

    for (const dir of searchDirs) {
      for (const extension of SUPPORTED_CONFIG_EXTENSIONS) {
        const configPath = this.runtime.fs.resolve(dir, `${options?.configName || 'config'}${extension}`);

        if (await this.runtime.fs.exists(configPath)) {
          return this.load(configPath);
        }
      }
    }

    return err({
      code: 'FILE_NOT_FOUND',
      message: 'Configuration file not found in search directories',
      searchDirs,
    });
  }

  // @esta-core/tools-configの機能
  async loadTools(path?: string): Promise<Result<ToolsConfig, ConfigError>> {
    const result = await this.load(path);
    if (result.isErr()) {
      return result;
    }

    // ツール設定特化処理
    return this.processToolsConfig(result.value);
  }

  // @esta-core/esta-configの機能
  async loadEsta(path?: string): Promise<Result<EstaConfig, ConfigError>> {
    const result = await this.load(path);
    if (result.isErr()) {
      return result;
    }

    // Esta設定特化処理
    return this.processEstaConfig(result.value);
  }

  // 設定マージ
  async merge(...sources: ConfigSource<T>[]): Promise<Result<T, ConfigError>> {
    const configs: T[] = [];

    for (const source of sources) {
      let config: Result<T, ConfigError>;

      if (typeof source === 'string') {
        config = await this.load(source);
      } else {
        config = ok(source as T);
      }

      if (config.isErr()) {
        return config;
      }

      configs.push(config.value);
    }

    // ディープマージ実行
    const merged = this.deepMerge(...configs);

    // 最終バリデーション
    return this.validateConfig(merged);
  }
}

// エラー型定義
export interface ConfigError {
  code: 'FILE_NOT_FOUND' | 'PARSE_ERROR' | 'VALIDATION_FAILED' | 'PERMISSION_DENIED' | 'CONFIG_ERROR';
  message: string;
  path?: string;
  line?: number;
  column?: number;
  searchDirs?: string[];
  cause?: Error;
}

// 設定ソース型
export type ConfigSource<T> = string | Partial<T>;

// 検索オプション
export interface SearchOptions {
  configName?: string;
  searchDirs?: string[];
  stopAt?: string;
  extensions?: ConfigFormat[];
}

// ローダーオプション
export interface ConfigLoaderOptions {
  cache?: boolean;
  validateOnLoad?: boolean;
  allowPartial?: boolean;
  runtime?: RuntimeAdapter;
}
```

### 2.2 @esta-validation パッケージ作成

#### 移行対象

- `@esta-core/tools-config/tools-validator/`
- `@esta-core/esta-config/validators/`
- 各パッケージの個別バリデーション

#### 統合戦略

1. **Valibot統合**: 既存のvalibotベースバリデーションを統合
2. **正規化機能統合**: 各パッケージの正規化関数を統合
3. **Result<T, E>適用**: バリデーションエラーの統一
4. **プラグイン機能**: カスタムバリデーター追加機能

### 2.3 @esta-path-utils & @esta-fs-utils パッケージ作成

#### 移行対象

- `@esta-core/tools-config/utils/pathUtils.ts`
- `@esta-core/esta-config/utils/pathNormalize.ts`
- `@agla-e2e/fileio-framework/utils/agE2eFileIoUtils.ts`
- `@esta-actions/tools-installer/utils/prepareInstallDirectory.ts`

#### 統合アプローチ

1. **機能統合**: パス操作機能の完全統合
2. **ランタイム抽象化**: `@esta-runtime`のファイルシステム活用
3. **クロスプラットフォーム**: Windows/Unix両対応
4. **GitHub Actions対応**: 特化機能の提供

### Phase 2 完了チェック

#### 統合テスト

```bash
# 統合パッケージのテスト
pnpm run test:integration --filter="@esta-config"
pnpm run test:integration --filter="@esta-validation"
pnpm run test:integration --filter="@esta-path-utils"
pnpm run test:integration --filter="@esta-fs-utils"

# 既存パッケージとの互換性テスト
pnpm run test:compatibility
```

#### 移行確認

```typescript
// 既存インターフェースとの互換性確認
// scripts/verify-phase2.ts

// 旧: @esta-utils/config-loader
import { loadConfig as oldLoadConfig } from '@esta-utils/config-loader';

// 新: @esta-config
import { UniversalConfigLoader } from '@esta-config';

// 互換性テスト
const testMigration = async () => {
  // 旧方式
  const oldResult = await oldLoadConfig({ configName: 'test' });

  // 新方式
  const loader = new UniversalConfigLoader(testSchema);
  const newResult = await loader.load('test.json');

  console.log('Migration test:', (oldResult !== null) === newResult.isOk() ? '✓' : '✗');
};
```

## Phase 3-5: 継続実装

### Phase 3: アプリケーション統合（Week 5-6）

- `@esta-tools/installer` 作成
- `@esta-tools/command` 作成

### Phase 4: 統合レイヤー作成（Week 7）

- `@esta-cli` 作成
- `@esta-github-actions` 作成

### Phase 5: クリーンアップ（Week 8）

- 旧パッケージ廃止
- 依存関係整理
- 最終テスト

## 品質保証戦略

### 継続的テスト

```bash
# 各フェーズでの品質チェック
./scripts/quality-check.sh

# 内容
#!/bin/bash
set -e

echo "品質チェック開始..."

# 単体テスト
pnpm run test:develop
echo "✓ 単体テスト完了"

# 統合テスト  
pnpm run test:integration
echo "✓ 統合テスト完了"

# E2Eテスト
pnpm run test:e2e
echo "✓ E2Eテスト完了"

# 型チェック
pnpm run check:types
echo "✓ 型チェック完了"

# リント
pnpm run lint-all
pnpm run lint-all:types
echo "✓ リント完了"

# 循環依存チェック
pnpm exec madge --circular packages
echo "✓ 循環依存チェック完了"

# パフォーマンス確認
time pnpm run build
echo "✓ ビルド性能確認完了"

echo "品質チェック完了 ✓"
```

### ロールバック戦略

```bash
# 各フェーズでのバックアップ
git tag "backup-before-phase-${PHASE}"

# 問題発生時のロールバック
git reset --hard "backup-before-phase-${PHASE}"
pnpm install
pnpm run build
```

この移行戦略により、安全で確実なリストラクチャリングを実現します。
