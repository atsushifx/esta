---
title: Phase 1.2 - ランタイム抽象化仕様書
description: @esta-runtime パッケージの詳細設計と実装仕様（エラーハンドリング統合含む）
sidebar_position: 1.2
---

> **Note**: このサブフェーズの実装では **t-wad式TDD（Test-Driven Development）** を採用します。テストファーストで実装を進め、品質と設計の確実性を保証します。

# Phase 1.2: @esta-runtime パッケージ仕様書

## 概要

@esta-runtime は、Node.js、Deno、Bun、GitHub Actions の4つのランタイム環境を統一的に扱うための抽象化レイヤーを提供します。

**重要**: このパッケージは `@esta-error/error-handler` の統一エラーハンドリング戦略を完全に実装し、タプル型とthrowの使い分けによる一貫したエラー処理を提供します。

## パッケージ基本情報

- **パッケージ名**: `@esta-runtime`
- **場所**: `packages/@esta-runtime/`
- **責任**: クロスランタイム抽象化とAPI統一
- **依存関係**: `@esta-error/error-handler`（統一エラーハンドリング）

## ランタイム検出仕様

### RuntimeType 定義

```typescript
export type RuntimeType = 'node' | 'deno' | 'bun' | 'github-actions';
```

### 検出ロジック

```typescript
export function detectRuntime(): RuntimeType {
  // GitHub Actions 環境の検出（最優先）
  if (process.env.GITHUB_ACTIONS === 'true') {
    return 'github-actions';
  }

  // Deno の検出
  if (typeof globalThis.Deno !== 'undefined') {
    return 'deno';
  }

  // Bun の検出
  if (typeof globalThis.Bun !== 'undefined') {
    return 'bun';
  }

  // Node.js の検出（デフォルト）
  if (typeof process !== 'undefined' && process.versions?.node) {
    return 'node';
  }

  // フォールバック（通常は到達しない）
  throw new Error('Unable to detect runtime environment');
}
```

## RuntimeAdapter インターフェース仕様

### 基本構造

```typescript
export interface RuntimeAdapter {
  readonly name: RuntimeType;
  readonly version: string;
  readonly features: RuntimeFeatures;
  readonly fs: FileSystemAdapter;
  readonly process: ProcessAdapter;
  readonly githubActions?: GitHubActionsAdapter;
}

export interface RuntimeFeatures {
  hasFileSystem: boolean;
  hasChildProcess: boolean;
  hasGitHubActions: boolean;
  hasWebCrypto: boolean;
  hasWorkers: boolean;
}
```

### ファクトリー関数

```typescript
export function createRuntime(): RuntimeAdapter {
  const runtimeType = detectRuntime();

  switch (runtimeType) {
    case 'node':
      return new NodeRuntimeAdapter();
    case 'deno':
      return new DenoRuntimeAdapter();
    case 'bun':
      return new BunRuntimeAdapter();
    case 'github-actions':
      return new GitHubActionsRuntimeAdapter();
    default:
      throw new Error(`Unsupported runtime: ${runtimeType}`);
  }
}
```

## エラーハンドリング統合戦略

### 基本方針

@esta-runtime は、`@esta-error/error-handler` の統一エラーハンドリング戦略に完全準拠します：

1. **ユーザー入力関連操作**: タプル型 `[value, ErrorResult | undefined]`
2. **システムレベル操作**: throw（ErrorResult または EstaError）
3. **回復可能性**: ErrorResult.recoverable フラグで制御

### エラー分類

```typescript
import { ErrorResult, EstaError } from '@esta-error/error-handler';

// ユーザー入力関連（タプル型）
export type FileOperationResult<T> = [T, undefined] | [undefined, ErrorResult];

// システムレベル関連（throw）
export type SystemOperation = () => void | never;
```

### 実装例

```typescript
// ユーザー入力関連（ファイル読み込み）
async readText(path: string): Promise<FileOperationResult<string>> {
  try {
    const content = await this.nativeReadFile(path);
    return [content, undefined];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [undefined, ErrorResult.fileNotFound(path)];
    }
    if (error.code === 'EACCES') {
      return [undefined, ErrorResult.permissionDenied(path, 'read')];
    }
    // システムエラーは回復不可能
    return [undefined, ErrorResult.fatal('FILESYSTEM_ERROR', error.message, { path })];
  }
}

// システムレベル（パス操作）
resolve(...segments: string[]): string {
  try {
    return this.nativeResolve(...segments);
  } catch (error) {
    // システム基盤の操作は即座にthrow
    throw new EstaError('RUNTIME_ERROR', 'Path resolution failed', { segments });
  }
}
```

## FileSystemAdapter 仕様

### インターフェース定義

```typescript
import { ErrorResult } from '@esta-error/error-handler';

export interface FileSystemAdapter {
  // ユーザー入力関連操作（タプル型エラーハンドリング）
  readText(path: string): Promise<[string, undefined] | [undefined, ErrorResult]>;
  writeText(path: string, content: string): Promise<[void, undefined] | [undefined, ErrorResult]>;
  exists(path: string): Promise<[boolean, undefined] | [undefined, ErrorResult]>;

  // システムレベル操作（throw エラーハンドリング）
  mkdir(path: string, options?: MkdirOptions): Promise<void>;
  rmdir(path: string, options?: RmdirOptions): Promise<void>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<FileStats>;

  // パス操作（システム基盤なので throw エラーハンドリング）
  resolve(...segments: string[]): string;
  relative(from: string, to: string): string;
  normalize(path: string): string;
  isAbsolute(path: string): boolean;
}
```

### オプション型定義

```typescript
export interface MkdirOptions {
  recursive?: boolean;
  mode?: number;
}

export interface RmdirOptions {
  recursive?: boolean;
  force?: boolean;
}

export interface FileStats {
  isFile(): boolean;
  isDirectory(): boolean;
  size: number;
  mtime: Date;
  ctime: Date;
}
```

### エラーハンドリング戦略

**タプル型を使用する操作**（ユーザー入力関連）:

- `readText()` - ファイルが存在しない可能性
- `writeText()` - 権限エラーの可能性
- `exists()` - パスが無効な可能性

**throw を使用する操作**（システム基盤）:

- `mkdir()` - システムレベルのディレクトリ作成
- `rmdir()` - システムレベルのディレクトリ削除
- `readdir()` - システムレベルのディレクトリ読み取り
- `stat()` - システムレベルのファイル情報取得
- パス操作 - 基盤機能として常に成功すべき

## ProcessAdapter 仕様

### インターフェース定義

```typescript
export interface ProcessAdapter {
  readonly env: Record<string, string>;
  readonly platform: string;
  readonly arch: string;

  cwd(): string;
  chdir(path: string): void;
  exit(code?: number): never;

  // 環境変数操作
  getEnv(key: string): string | undefined;
  setEnv(key: string, value: string): void;
  deleteEnv(key: string): void;
}
```

### 実装例（Node.js）

```typescript
class NodeProcessAdapter implements ProcessAdapter {
  get env(): Record<string, string> {
    return process.env as Record<string, string>;
  }

  get platform(): string {
    return process.platform;
  }

  get arch(): string {
    return process.arch;
  }

  cwd(): string {
    return process.cwd();
  }

  chdir(path: string): void {
    process.chdir(path);
  }

  exit(code = 0): never {
    process.exit(code);
  }

  getEnv(key: string): string | undefined {
    return process.env[key];
  }

  setEnv(key: string, value: string): void {
    process.env[key] = value;
  }

  deleteEnv(key: string): void {
    delete process.env[key];
  }
}
```

## GitHubActionsAdapter 仕様

### インターフェース定義

```typescript
export interface GitHubActionsAdapter {
  // 入力・出力
  getInput(name: string, options?: InputOptions): string;
  setOutput(name: string, value: string): void;
  setSecret(secret: string): void;

  // 環境変数・PATH
  exportVariable(name: string, value: string): void;
  addPath(path: string): void;

  // ログ・メッセージ
  info(message: string): void;
  warning(message: string | Error): void;
  error(message: string | Error): void;
  setFailed(message: string | Error): void;

  // グループ・注釈
  startGroup(name: string): void;
  endGroup(): void;
  notice(message: string, properties?: AnnotationProperties): void;

  // コマンド
  saveState(name: string, value: string): void;
  getState(name: string): string;
}

export interface InputOptions {
  required?: boolean;
  trimWhitespace?: boolean;
}

export interface AnnotationProperties {
  title?: string;
  file?: string;
  startLine?: number;
  endLine?: number;
  startColumn?: number;
  endColumn?: number;
}
```

### 実装例

```typescript
class GitHubActionsAdapterImpl implements GitHubActionsAdapter {
  private core: typeof import('@actions/core');

  constructor() {
    // 遅延読み込み
    this.core = require('@actions/core');
  }

  getInput(name: string, options?: InputOptions): string {
    return this.core.getInput(name, options);
  }

  setOutput(name: string, value: string): void {
    this.core.setOutput(name, value);
  }

  setSecret(secret: string): void {
    this.core.setSecret(secret);
  }

  exportVariable(name: string, value: string): void {
    this.core.exportVariable(name, value);
  }

  addPath(path: string): void {
    this.core.addPath(path);
  }

  info(message: string): void {
    this.core.info(message);
  }

  warning(message: string | Error): void {
    this.core.warning(message);
  }

  error(message: string | Error): void {
    this.core.error(message);
  }

  setFailed(message: string | Error): void {
    this.core.setFailed(message);
  }

  startGroup(name: string): void {
    this.core.startGroup(name);
  }

  endGroup(): void {
    this.core.endGroup();
  }

  notice(message: string, properties?: AnnotationProperties): void {
    this.core.notice(message, properties);
  }

  saveState(name: string, value: string): void {
    this.core.saveState(name, value);
  }

  getState(name: string): string {
    return this.core.getState(name);
  }
}
```

## 各ランタイム実装仕様

### Node.js 実装

```typescript
class NodeRuntimeAdapter implements RuntimeAdapter {
  readonly name = 'node' as const;
  readonly version: string;
  readonly features: RuntimeFeatures;
  readonly fs: FileSystemAdapter;
  readonly process: ProcessAdapter;

  constructor() {
    this.version = process.version;
    this.features = {
      hasFileSystem: true,
      hasChildProcess: true,
      hasGitHubActions: false,
      hasWebCrypto: parseInt(process.version.slice(1)) >= 16,
      hasWorkers: parseInt(process.version.slice(1)) >= 12,
    };
    this.fs = new NodeFileSystemAdapter();
    this.process = new NodeProcessAdapter();
  }
}
```

### Deno 実装

```typescript
class DenoRuntimeAdapter implements RuntimeAdapter {
  readonly name = 'deno' as const;
  readonly version: string;
  readonly features: RuntimeFeatures;
  readonly fs: FileSystemAdapter;
  readonly process: ProcessAdapter;

  constructor() {
    this.version = Deno.version.deno;
    this.features = {
      hasFileSystem: true,
      hasChildProcess: true,
      hasGitHubActions: false,
      hasWebCrypto: true,
      hasWorkers: true,
    };
    this.fs = new DenoFileSystemAdapter();
    this.process = new DenoProcessAdapter();
  }
}
```

### Bun 実装

```typescript
class BunRuntimeAdapter implements RuntimeAdapter {
  readonly name = 'bun' as const;
  readonly version: string;
  readonly features: RuntimeFeatures;
  readonly fs: FileSystemAdapter;
  readonly process: ProcessAdapter;

  constructor() {
    this.version = Bun.version;
    this.features = {
      hasFileSystem: true,
      hasChildProcess: true,
      hasGitHubActions: false,
      hasWebCrypto: true,
      hasWorkers: true,
    };
    this.fs = new BunFileSystemAdapter();
    this.process = new BunProcessAdapter();
  }
}
```

### GitHub Actions 実装

```typescript
class GitHubActionsRuntimeAdapter implements RuntimeAdapter {
  readonly name = 'github-actions' as const;
  readonly version: string;
  readonly features: RuntimeFeatures;
  readonly fs: FileSystemAdapter;
  readonly process: ProcessAdapter;
  readonly githubActions: GitHubActionsAdapter;

  constructor() {
    // GitHub Actions は Node.js ベース
    this.version = process.version;
    this.features = {
      hasFileSystem: true,
      hasChildProcess: true,
      hasGitHubActions: true,
      hasWebCrypto: parseInt(process.version.slice(1)) >= 16,
      hasWorkers: parseInt(process.version.slice(1)) >= 12,
    };
    this.fs = new NodeFileSystemAdapter();
    this.process = new NodeProcessAdapter();
    this.githubActions = new GitHubActionsAdapterImpl();
  }
}
```

## パッケージ構成

```
packages/@esta-runtime/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                     # メインエクスポート
│   ├── detection.ts                 # ランタイム検出
│   ├── interfaces.ts                # 型定義
│   ├── factory.ts                   # ファクトリー関数
│   ├── adapters/
│   │   ├── base/
│   │   │   ├── RuntimeAdapter.ts    # 基底クラス
│   │   │   ├── FileSystemAdapter.ts # ファイルシステム基底
│   │   │   └── ProcessAdapter.ts    # プロセス基底
│   │   ├── node/
│   │   │   ├── NodeRuntimeAdapter.ts
│   │   │   ├── NodeFileSystemAdapter.ts
│   │   │   └── NodeProcessAdapter.ts
│   │   ├── deno/
│   │   │   ├── DenoRuntimeAdapter.ts
│   │   │   ├── DenoFileSystemAdapter.ts
│   │   │   └── DenoProcessAdapter.ts
│   │   ├── bun/
│   │   │   ├── BunRuntimeAdapter.ts
│   │   │   ├── BunFileSystemAdapter.ts
│   │   │   └── BunProcessAdapter.ts
│   │   └── github-actions/
│   │       ├── GitHubActionsRuntimeAdapter.ts
│   │       └── GitHubActionsAdapter.ts
│   ├── utils/
│   │   ├── path.ts                  # パス操作ユーティリティ
│   │   └── errors.ts                # エラー関連ユーティリティ
│   └── __tests__/
│       ├── detection.spec.ts
│       ├── adapters/
│       │   ├── node.spec.ts
│       │   ├── deno.spec.ts
│       │   ├── bun.spec.ts
│       │   └── github-actions.spec.ts
│       └── integration/
│           └── cross-runtime.spec.ts
├── lib/                             # CJS ビルド出力
├── module/                          # ESM ビルド出力
└── configs/
    ├── tsconfig.json
    ├── vitest.config.ts
    └── eslint.config.js
```

## テスト戦略

### 単体テスト

```typescript
// __tests__/detection.spec.ts
describe('Runtime Detection', () => {
  it('should detect Node.js runtime', () => {
    // Node.js 環境をモック
    expect(detectRuntime()).toBe('node');
  });

  it('should detect GitHub Actions runtime', () => {
    process.env.GITHUB_ACTIONS = 'true';
    expect(detectRuntime()).toBe('github-actions');
    delete process.env.GITHUB_ACTIONS;
  });
});
```

### 統合テスト

```typescript
// __tests__/integration/cross-runtime.spec.ts
describe('Cross-Runtime Integration', () => {
  it('should provide consistent file system API across runtimes', async () => {
    const runtime = createRuntime();

    // 各ランタイムで同じAPIが利用可能
    expect(runtime.fs.readText).toBeDefined();
    expect(runtime.fs.writeText).toBeDefined();
    expect(runtime.fs.exists).toBeDefined();
  });
});
```

### E2E テスト

```bash
# 各ランタイムでの実際の動作確認
npm run test:node
npm run test:deno  
npm run test:bun
npm run test:github-actions
```

## パフォーマンス要件

### レスポンス時間

- **ランタイム検出**: 1ms以内
- **アダプター作成**: 5ms以内
- **ファイル操作**: ネイティブAPI比105%以内
- **プロセス操作**: ネイティブAPI比102%以内

### メモリ使用量

- **基本アダプター**: 1MB以内
- **GitHub Actions アダプター**: 2MB以内（@actions/* 依存含む）

### 遅延読み込み

```typescript
// GitHub Actions SDK の遅延読み込み例
class GitHubActionsAdapter {
  private _core?: typeof import('@actions/core');

  private get core() {
    if (!this._core) {
      this._core = require('@actions/core');
    }
    return this._core;
  }
}
```

## セキュリティ考慮事項

### 1. パス操作の安全性

```typescript
// パストラバーサル攻撃の防止
function safePath(path: string, basePath: string): string {
  const resolved = this.resolve(basePath, path);
  if (!resolved.startsWith(basePath)) {
    throw new Error('Path traversal detected');
  }
  return resolved;
}
```

### 2. 環境変数の機密情報保護

```typescript
// 機密情報のログ出力防止
function getEnv(key: string): string | undefined {
  const value = process.env[key];
  if (SENSITIVE_ENV_KEYS.includes(key) && value) {
    // ログに出力されないよう注意
    return value;
  }
  return value;
}
```

### 3. GitHub Actions 固有のセキュリティ

```typescript
// GitHub Actions での機密情報マスキング
setSecret(sensitiveValue: string): void {
  this.core.setSecret(sensitiveValue);
}
```

## 互換性とマイグレーション

### 既存コードとの互換性

```typescript
// 既存の get-platform パッケージとの互換性
export function getPlatform(): string {
  const runtime = createRuntime();
  return runtime.process.platform;
}

export function getArch(): string {
  const runtime = createRuntime();
  return runtime.process.arch;
}
```

### 段階的移行支援

```typescript
// 旧APIとの橋渡し
export const platform = {
  get current() {
    return createRuntime().process.platform;
  },

  get arch() {
    return createRuntime().process.arch;
  },

  isWindows: () => createRuntime().process.platform === 'win32',
  isMac: () => createRuntime().process.platform === 'darwin',
  isLinux: () => createRuntime().process.platform === 'linux',
};
```

## 実装優先順位

### Phase 1a: 基本実装

1. RuntimeType とインターフェース定義
2. ランタイム検出ロジック
3. Node.js アダプター実装
4. 基本テスト

### Phase 1b: マルチランタイム対応

1. Deno アダプター実装
2. Bun アダプター実装
3. GitHub Actions アダプター実装
4. クロスランタイムテスト

### Phase 1c: 最適化・安定化

1. パフォーマンス最適化
2. エラーハンドリング強化
3. セキュリティ監査
4. ドキュメント整備
