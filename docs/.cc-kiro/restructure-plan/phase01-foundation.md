---
title: Phase 1 - 基盤パッケージ作成
description: 新アーキテクチャの基盤となるパッケージの作成と統一エラーハンドリングの実現
sidebar_position: 1
---

# Phase 1: Foundation Packages

# Phase 1: 基盤パッケージ作成

## 実行コマンド

```bash
/kiro "Execute Phase 1: Create foundation packages (@esta-runtime, @esta-error/error-handler, @esta-error/exit-code) with unified error handling and cross-runtime abstraction according to phase1-foundation.md"
```

## 目標

新アーキテクチャの基盤となるパッケージを作成し、統一エラーハンドリングとランタイム抽象化を実現する。

## 期間

Week 1-2 (推定10-14日)

## エラーハンドリング戦略

**基本方針**:

- **基本ユーティリティ**: タプル型 `[value, ErrorResult | undefined]` または混合型（システムエラーはthrow）
- **ESTA統合モジュール**: `EstaError` + throw パターン
- **Result<T,E>パターン**: 廃止（シンプル化のため）

## 成果物

### 1. @esta-runtime パッケージ

**場所**: `packages/@esta-runtime/`
**責任**: Node.js/Deno/Bun/GitHub Actions横断ランタイム抽象化

#### 要求仕様

- 4つのランタイム(Node.js, Deno, Bun, GitHub Actions)の自動検出
- 統一されたファイルシステムAPI（混合型エラーハンドリング）
- 統一されたプロセスAPI（システムエラーはthrow）
- GitHub Actions専用機能の抽象化
- パフォーマンス最適化（各ランタイムのネイティブAPI活用）

#### 実装必須項目

```typescript
// ランタイム検出
export type RuntimeType = 'node' | 'deno' | 'bun' | 'github-actions';
export const detectRuntime = (): RuntimeType;

// 統合アダプター
export interface RuntimeAdapter {
  name: RuntimeType;
  version: string;
  features: RuntimeFeatures;
  fs: FileSystemAdapter;
  process: ProcessAdapter;
  githubActions?: GitHubActionsAdapter;
}

// ファイルシステム抽象化（混合型エラーハンドリング）
export interface FileSystemAdapter {
  // 基本操作：ユーザー入力関連はタプル型
  readText(path: string): Promise<[string, ErrorResult | undefined]>;
  writeText(path: string, content: string): Promise<[void, ErrorResult | undefined]>;
  exists(path: string): Promise<[boolean, ErrorResult | undefined]>;
  
  // システム操作：システムエラーはthrow
  mkdir(path: string, options?: MkdirOptions): Promise<void>;
  rmdir(path: string, options?: RmdirOptions): Promise<void>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<FileStats>;
  
  // パス操作：システム基盤なのでthrow
  resolve(...segments: string[]): string;
  relative(from: string, to: string): string;
}

// プロセス抽象化（システムエラーはthrow）
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

// ファクトリー
export const createRuntime = (): RuntimeAdapter;
```

#### パッケージ構成

```
packages/@esta-runtime/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # メインエクスポート
│   ├── detection.ts          # ランタイム検出
│   ├── interfaces.ts         # 型定義
│   ├── adapters/
│   │   ├── node.ts          # Node.js実装
│   │   ├── deno.ts          # Deno実装
│   │   ├── bun.ts           # Bun実装
│   │   └── github-actions.ts # GitHub Actions実装
│   └── __tests__/
│       ├── detection.spec.ts
│       ├── node-adapter.spec.ts
│       ├── deno-adapter.spec.ts
│       ├── bun-adapter.spec.ts
│       └── github-actions-adapter.spec.ts
├── lib/                     # CJS ビルド出力
├── module/                  # ESM ビルド出力
└── configs/
```

### 2. @esta-error/error-handler パッケージ

**場所**: `packages/@esta-error/error-handler/`
**責任**: EstaError + ErrorResult による統一エラーハンドリング

#### 要求仕様

- EstaError クラス（Error を拡張）の実装
- ErrorResult クラス（基本ユーティリティ用）の実装
- 既存 @esta-core/error-handler との互換性
- 構造化されたエラー情報とコンテキスト

#### 実装必須項目

```typescript
// ESTA統合モジュール用メインエラークラス
export class EstaError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'EstaError';
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      stack: this.stack,
    };
  }
}

// 基本ユーティリティ用エラークラス
export class ErrorResult extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ErrorResult';
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
    };
  }
}

// 既存 error-handler との互換性
export function errorExit(
  exitCode: number,
  message: string,
  context?: Record<string, unknown>,
): never {
  const error = new EstaError('EXIT_ERROR', message, context);
  console.error(`Error: ${message}`);
  if (context) {
    console.error('Context:', JSON.stringify(context, null, 2));
  }
  process.exit(exitCode);
}

// エラー変換ユーティリティ
export function toEstaError(error: unknown, code?: string): EstaError {
  if (error instanceof EstaError) { return error; }
  if (error instanceof Error) {
    return new EstaError(code || 'UNKNOWN_ERROR', error.message);
  }
  return new EstaError(code || 'UNKNOWN_ERROR', String(error));
}
```

#### パッケージ構成

```
packages/@esta-error/error-handler/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # メインエクスポート
│   ├── EstaError.ts          # EstaError クラス
│   ├── ErrorResult.ts        # ErrorResult クラス
│   ├── compatibility.ts      # 既存API互換性
│   ├── utilities.ts          # エラー変換ユーティリティ
│   └── __tests__/
│       ├── EstaError.spec.ts
│       ├── ErrorResult.spec.ts
│       ├── compatibility.spec.ts
│       └── utilities.spec.ts
├── lib/                      # CJS ビルド出力
├── module/                   # ESM ビルド出力
└── configs/
```

### 3. @esta-error/exit-code パッケージ

**場所**: `packages/@esta-error/exit-code/`
**責任**: システム終了コード管理（@esta-system/exit-status からの移行・改名）

#### 要求仕様

- 既存 @esta-system/exit-status の機能を保持
- 統一されたエラーコード体系
- プロセス終了管理
- エラーログ機能

#### 実装必須項目

```typescript
// 終了コード定数
export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  MISUSE_OF_SHELL_BUILTINS: 2,
  CANNOT_EXECUTE: 126,
  COMMAND_NOT_FOUND: 127,
  INVALID_EXIT_ARGUMENT: 128,
  FATAL_ERROR_SIGNAL_1: 129,
  FATAL_ERROR_SIGNAL_2: 130,
  // ESTA固有コード
  CONFIG_ERROR: 10,
  VALIDATION_ERROR: 11,
  INSTALLATION_ERROR: 12,
  COMMAND_ERROR: 13,
  NETWORK_ERROR: 14,
  PERMISSION_ERROR: 15,
} as const;

export type ExitCode = typeof EXIT_CODES[keyof typeof EXIT_CODES];

// 終了コード管理
export class ExitCodeManager {
  static exit(code: ExitCode, message?: string): never {
    if (message) {
      console.error(`Exit with code ${code}: ${message}`);
    }
    process.exit(code);
  }

  static getCodeName(code: number): string | undefined {
    return Object.entries(EXIT_CODES)
      .find(([, value]) => value === code)?.[0];
  }

  static isValidCode(code: number): code is ExitCode {
    return Object.values(EXIT_CODES).includes(code as ExitCode);
  }
}

// 既存API互換性
export { EXIT_CODES as ExitStatus };
export const exitWithCode = ExitCodeManager.exit;
```

### 4. @shared/types 拡張

**場所**: `shared/packages/types/base/index.ts`
**責任**: プロジェクト全体の統一型定義

#### 追加必須型

```typescript
// ランタイム関連
export type RuntimeType = 'node' | 'deno' | 'bun' | 'github-actions';
export type PlatformType = 'win32' | 'darwin' | 'linux';

// ログ関連
export type LogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type LogLevelLabel = 'OFF' | 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';

// 設定関連
export type ConfigFormat = 'json' | 'jsonc' | 'yaml' | 'yml' | 'toml' | 'js' | 'mjs' | 'ts' | 'mts';

// パス関連
export type PathString = string;
export type NormalizedPath = string;
export type AbsolutePath = string;

// エラー関連（新戦略）
export type ExitCode = number;
export type ErrorCode = string;

// タプル型エラーハンドリング
export type TupleResult<T, E = ErrorResult> = [T, undefined] | [undefined, E];

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

// エラークラス型の再エクスポート
export type EstaError = import('@esta-error/error-handler').EstaError;
export type ErrorResult = import('@esta-error/error-handler').ErrorResult;
```

### 5. @shared/constants 拡張

**場所**: `shared/packages/constants/base/index.ts`
**責任**: プロジェクト全体の統一定数定義

#### 追加必須定数

```typescript
// ランタイム識別子
export const RUNTIME_IDENTIFIERS = {
  NODE: 'node' as const,
  DENO: 'deno' as const,
  BUN: 'bun' as const,
  GITHUB_ACTIONS: 'github-actions' as const,
} as const;

// ログレベルマッピング
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

// 設定ファイル拡張子
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

// デフォルト設定
export const DEFAULT_CONFIG = {
  LOG_LEVEL: 4, // INFO
  CONFIG_DIR: '.config',
  CACHE_DIR: '.cache',
  INSTALL_DIR: '.tools',
  TIMEOUT: 30000, // 30秒
  MAX_RETRIES: 3,
} as const;

// エラーメッセージ（国際化対応）
export const ERROR_MESSAGES = {
  ja: {
    VALIDATION_FAILED: '設定の検証に失敗しました',
    FILE_NOT_FOUND: 'ファイルが見つかりません',
    CONFIG_ERROR: '設定エラーが発生しました',
    PERMISSION_DENIED: 'アクセス権限がありません',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
    COMMAND_NOT_FOUND: 'コマンドが見つかりません',
    INSTALLATION_FAILED: 'インストールに失敗しました',
  },
  en: {
    VALIDATION_FAILED: 'Configuration validation failed',
    FILE_NOT_FOUND: 'File not found',
    CONFIG_ERROR: 'Configuration error occurred',
    PERMISSION_DENIED: 'Permission denied',
    NETWORK_ERROR: 'Network error occurred',
    COMMAND_NOT_FOUND: 'Command not found',
    INSTALLATION_FAILED: 'Installation failed',
  },
} as const;

// エラーコード定数
export const ERROR_CODES = {
  // システムエラー
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  PLATFORM_UNKNOWN: 'PLATFORM_UNKNOWN',
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // 設定エラー
  CONFIG_ERROR: 'CONFIG_ERROR',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_PATH: 'INVALID_PATH',

  // ネットワーク・ファイルエラー
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // インストール・コマンドエラー
  COMMAND_NOT_FOUND: 'COMMAND_NOT_FOUND',
  INSTALLATION_FAILED: 'INSTALLATION_FAILED',
  COMMAND_EXECUTION_FAILED: 'COMMAND_EXECUTION_FAILED',
} as const;
```

## 品質要件

### テスト要件

```bash
# 各パッケージで必須
pnpm run test:develop --filter="@esta-runtime"         # クロスランタイムテスト
pnpm run test:develop --filter="@esta-error/*"         # エラーハンドリングテスト

# 統合テスト
pnpm run test:integration # 新パッケージ間の統合確認
```

### 型安全性要件

```bash
# TypeScript厳格チェック
pnpm run check:types --filter="@esta-runtime"
pnpm run check:types --filter="@esta-error/*"
pnpm run check:types --filter="@shared/*"
```

### コード品質要件

```bash
# ESLint (基本 + 型対応)
pnpm run lint-all --filter="@esta-runtime"
pnpm run lint-all:types --filter="@esta-runtime"
pnpm run lint-all --filter="@esta-error/*"
pnpm run lint-all:types --filter="@esta-error/*"

# フォーマット
pnpm run check:dprint
```

### パフォーマンス要件

- **ビルド時間**: 各パッケージ5秒以内
- **テスト実行時間**: 各パッケージ10秒以内
- **ランタイムオーバーヘッド**: 既存比5%以内

## 成功基準

### 必須成功基準

1. **全テスト通過**: 単体・統合テストが100%通過
2. **型チェック通過**: TypeScript厳格モードでエラーなし
3. **ビルド成功**: CJS/ESM両方のビルドが成功
4. **循環依存なし**: madgeチェックで循環依存検出されない

### 機能確認基準

```typescript
// Phase 1 完了確認テスト
import { ErrorResult, EstaError } from '@esta-error/error-handler';
import { EXIT_CODES } from '@esta-error/exit-code';
import { createRuntime } from '@esta-runtime';

// エラーハンドリング確認
try {
  throw new EstaError('TEST_ERROR', 'Test message', { test: true });
} catch (error) {
  console.assert(error instanceof EstaError);
  console.assert(error.code === 'TEST_ERROR');
}

// Runtime抽象化確認
const runtime = createRuntime();
console.assert(['node', 'deno', 'bun', 'github-actions'].includes(runtime.name));

// ファイルシステム確認（タプル型）
const [exists, error] = await runtime.fs.exists('package.json');
if (error) {
  console.error('File check error:', error.message);
} else {
  console.assert(typeof exists === 'boolean');
}

// 終了コード確認
console.assert(EXIT_CODES.SUCCESS === 0);
console.assert(EXIT_CODES.CONFIG_ERROR === 10);
```

### 統合確認基準

```bash
# 他パッケージからの利用確認
# 既存パッケージが新基盤パッケージを利用可能
pnpm exec tsc --noEmit --project packages/@agla-utils/ag-logger/tsconfig.json
```

## 注意事項

### エラーハンドリング戦略の徹底

- **基本ユーティリティ**: タプル型またはthrowを適切に使い分け
- **ESTA統合モジュール**: EstaErrorで統一
- **システムエラー**: 即座にthrow（回復不可能）
- **ユーザー入力エラー**: タプル型で呼び出し側に判断を委ねる

### ランタイム互換性

- 各ランタイムでの条件付きimportの安全な実装
- 利用不可能な機能の適切なエラーハンドリング
- パフォーマンス最適化とポータビリティのバランス

### 依存関係管理

- 新パッケージ間の循環依存を避ける
- 既存パッケージへの影響を最小化
- @agla系パッケージとの依存関係は最小限に制限

## 次Phase準備

Phase 1完了後、以下が利用可能になる：

- `EstaError` + `ErrorResult` による統一エラーハンドリング
- タプル型による基本ユーティリティエラーハンドリング
- ランタイム横断でのファイル・プロセス操作
- 統一された型・定数定義
- システム終了コード管理

これらの基盤を使用してPhase 2で機能統合パッケージを作成する。
