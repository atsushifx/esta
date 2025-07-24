# Phase 1: Foundation Packages

# Phase 1: 基盤パッケージ作成

## 実行コマンド

```bash
/kiro "Execute Phase 1: Create foundation packages (@esta-error-result, @esta-runtime) with Result<T,E> pattern and cross-runtime abstraction according to phase1-foundation.md"
```

## 目標

新アーキテクチャの基盤となるパッケージを作成し、統一エラーハンドリングとランタイム抽象化を実現する。

## 期間

Week 1-2 (推定10-14日)

## 成果物

### 1. @esta-error-result パッケージ

**場所**: `packages/@esta-error-result/`
**責任**: Result<T,E>による統一エラーハンドリングパターンの提供

#### 要求仕様

- Result<T,E>型の完全実装
- Ok<T>とErr<E>インターフェースの実装
- 既存エラーパターン(boolean, null, throw)との相互運用
- @esta-core/error-handlerとの統合

#### 実装必須項目

```typescript
// コア型定義
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
export const ok = <T>(value: T): Ok<T>;
export const err = <E>(error: E): Err<E>;

// 相互運用関数
export const fromBoolean = <E>(value: boolean, error: E): Result<boolean, E>;
export const fromNullable = <T, E>(value: T | null | undefined, error: E): Result<T, E>;
export const fromPromise = <T>(promise: Promise<T>): Promise<Result<T, Error>>;

// error-handler統合
export const unwrapOrExit = <T>(result: Result<T, Error>, exitCode?: number): T;
```

#### パッケージ構成

```
packages/@esta-error-result/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # メインエクスポート
│   ├── result.ts         # Result型実装
│   ├── factories.ts      # ファクトリー関数
│   ├── interop.ts        # 既存パターンとの相互運用
│   └── __tests__/
│       ├── result.spec.ts
│       ├── factories.spec.ts
│       └── interop.spec.ts
├── lib/                  # CJS ビルド出力
├── module/               # ESM ビルド出力
└── configs/             # 設定ファイル
    ├── eslint.config.js
    ├── tsup.config.ts
    └── vitest.config.unit.ts
```

#### package.json要件

```json
{
  "name": "@esta-error-result",
  "version": "0.1.0",
  "description": "Result<T, E> pattern for unified error handling",
  "keywords": ["result", "error-handling", "functional", "typescript"],
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
  "files": ["lib/", "module/", "README.md", "LICENSE"],
  "dependencies": {
    "@shared/constants": "workspace:*"
  },
  "devDependencies": {
    "@esta-core/error-handler": "workspace:*"
  }
}
```

### 2. @esta-runtime パッケージ

**場所**: `packages/@esta-runtime/`
**責任**: Node.js/Deno/Bun/GitHub Actions横断ランタイム抽象化

#### 要求仕様

- 4つのランタイム(Node.js, Deno, Bun, GitHub Actions)の自動検出
- 統一されたファイルシステムAPI
- 統一されたプロセスAPI
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

// ファイルシステム抽象化
export interface FileSystemAdapter {
  readText(path: string): Promise<string>;
  writeText(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string, options?: MkdirOptions): Promise<void>;
  rmdir(path: string, options?: RmdirOptions): Promise<void>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<FileStats>;
  resolve(...segments: string[]): string;
  relative(from: string, to: string): string;
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

#### 特別要件

- **条件付きimport**: 各ランタイムでのみ利用可能なAPIの安全な処理
- **パフォーマンス**: 各ランタイムの最適API使用（Deno.readTextFile, Bun.file等）
- **エラーハンドリング**: 統一されたエラー形式で各ランタイムのエラーを抽象化

### 3. @shared/types 拡張

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

// エラー関連
export type ExitCode = number;
export type ErrorCode = string;

// 結果型（再エクスポート）
export type Result<T, E = Error> = import('@esta-error-result').Result<T, E>;

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

### 4. @shared/constants 拡張

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
    // ... 他のメッセージ
  },
  en: {
    VALIDATION_FAILED: 'Configuration validation failed',
    FILE_NOT_FOUND: 'File not found',
    CONFIG_ERROR: 'Configuration error occurred',
    // ... 他のメッセージ
  },
} as const;
```

## 品質要件

### テスト要件

```bash
# 各パッケージで必須
pnpm run test:develop --filter="@esta-error-result"  # 100%カバレッジ
pnpm run test:develop --filter="@esta-runtime"       # クロスランタイムテスト

# 統合テスト
pnpm run test:integration # 新パッケージ間の統合確認
```

### 型安全性要件

```bash
# TypeScript厳格チェック
pnpm run check:types --filter="@esta-error-result"
pnpm run check:types --filter="@esta-runtime"
pnpm run check:types --filter="@shared/*"
```

### コード品質要件

```bash
# ESLint (基本 + 型対応)
pnpm run lint-all --filter="@esta-error-result"
pnpm run lint-all:types --filter="@esta-error-result"

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
import { createRuntime, err, ok } from '@esta-error-result';
import { createRuntime } from '@esta-runtime';

// Result<T,E>動作確認
const result = ok(42);
console.assert(result.isOk());
console.assert(result.value === 42);

// Runtime抽象化確認
const runtime = createRuntime();
console.assert(['node', 'deno', 'bun', 'github-actions'].includes(runtime.name));

// ファイルシステム確認
const exists = await runtime.fs.exists('package.json');
console.assert(typeof exists === 'boolean');
```

### 統合確認基準

```bash
# 他パッケージからの利用確認
# 既存パッケージが新基盤パッケージを利用可能
pnpm exec tsc --noEmit --project packages/@esta-core/error-handler/tsconfig.json
```

## 注意事項

### 破壊的変更の回避

- 既存パッケージのAPIは変更しない
- 新パッケージは追加のみ（削除・変更なし）
- workspace:*依存関係のみ追加

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

- `Result<T, E>`パターンでの統一エラーハンドリング
- ランタイム横断でのファイル・プロセス操作
- 統一された型・定数定義

これらの基盤を使用してPhase 2で機能統合パッケージを作成する。
