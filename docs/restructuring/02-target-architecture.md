---
header:
  - src: docs/restructuring/02-target-architecture.md
  - @(#) : Target architecture design and system structure
title: 🏗️ 目標アーキテクチャ設計（02-target-architecture）
version: 1.0.0
created: 2025-08-28
updated: 2025-08-28
authors:
  - 🤖 Claude（初期設計・API仕様策定）
  - 👤 atsushifx（要件定義・仕様確定）
changes:
  - 2025-08-28: 初回作成（ドキュメント整備）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 02. Target Architecture - 目標アーキテクチャ設計

### 🏗️ 新アーキテクチャ概要

#### 設計原則

1. 単一責務の原則 (SRP): 各パッケージは明確で単一の責務を持つ
2. 依存関係逆転の原則 (DIP): 抽象に依存し、具象に依存しない
3. インターフェース分離の原則 (ISP): 必要なインターフェースのみに依存
4. 開放閉鎖の原則 (OCP): 拡張に開放、修正に閉鎖
5. クロスプラットフォーム設計: Node/Deno/Bun/GHA 完全対応

#### レイヤード・アーキテクチャ

```mermaid
graph TD
    A[Applications Layer] --> B[Actions Layer]
    B --> C[Utils Layer]
    C --> D[Core Layer]
    C --> E[System Layer]
    D --> F[Shared Layer]
    E --> F

    subgraph "Applications Layer"
        A1[CLI Tools]
        A2[Scripts]
    end

    subgraph "Actions Layer"
        B1[@esta-actions/tools-installer]
    end

    subgraph "Utils Layer"
        C1[@esta-utils/command-runner]
        C2[@esta-utils/config-loader]
    end

    subgraph "Core Layer"
        D1[@esta-core/tools-config]
        D2[@esta-core/esta-error]
        D3[@esta-core/exec]
    end

    subgraph "System Layer"
        E1[@esta-system/runtime]
        E2[@esta-system/platform]
        E3[@esta-system/shell]
    end

    subgraph "Shared Layer"
        F1[@shared/types]
        F2[@shared/constants]
    end
```

### 📦 新パッケージ構成詳細

#### @shared/types

責務: 統一型定義。

```typescript
// 統一されたLogLevel型
export enum LogLevel {
  VERBOSE = -99,
  OFF = 0,
  FATAL = 1,
  ERROR = 2,
  WARN = 3,
  INFO = 4,
  DEBUG = 5,
  TRACE = 6,
  LOG = 10,
  DEFAULT = -99,
}

// 統一されたPlatform型
export enum Platform {
  WIN32 = 'win32',
  LINUX = 'linux',
  DARWIN = 'darwin',
  UNKNOWN = 'unknown',
}

// 統一されたRuntime型
export enum Runtime {
  NODE = 'node',
  DENO = 'deno',
  BUN = 'bun',
  GITHUB_ACTIONS = 'github-actions',
}

// Result<T,E>型（統一エラーハンドリング）
export type Result<T, E = Error> = Ok<T> | Err<E>;
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}
```

#### @shared/constants

責務: 共通定数。

```typescript
// 統一されたExitCode
export const EXIT_CODE = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  MISUSE: 2,
  CONFIG_ERROR: 3,
  PERMISSION_ERROR: 4,
  NETWORK_ERROR: 5,
} as const;

// デフォルト設定値
export const DEFAULT_CONFIG = {
  LOG_LEVEL: LogLevel.INFO,
  TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
} as const;

// ディレクトリパス
export const DIRECTORIES = {
  TOOLS: '.tools',
  CONFIG: '.config',
  CACHE: '.cache',
} as const;
```

#### @esta-core/tools-config

責務: CLI/GHA 両対応の統一設定レイヤー。

```typescript
export interface ToolConfig {
  installer: 'eget' | 'script';
  name: string;
  package: string;
  options: ToolOptions;
}

export interface ToolOptions {
  version?: string;
  installDir?: string;
  args?: string[];
  env?: Record<string, string>;
}

// CLI/GHA環境の抽象化
export abstract class ConfigManager {
  abstract loadConfig(source: string): Result<ToolConfig[], ConfigError>;
  abstract validateConfig(config: ToolConfig[]): Result<void, ValidationError>;
  abstract mergeConfigs(base: ToolConfig[], override: ToolConfig[]): Result<ToolConfig[], MergeError>;
}

// 具象実装
export class CLIConfigManager extends ConfigManager {}
export class GHAConfigManager extends ConfigManager {}
```

#### @esta-core/esta-error

責務: Result<T,E>統一エラーハンドリング。

```typescript
// エラー基底クラス
export abstract class EstaError extends Error {
  abstract readonly code: string;
  abstract readonly context: Record<string, unknown>;

  constructor(
    message: string,
    public readonly severity: ErrorSeverity = ErrorSeverity.ERROR,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// 具象エラークラス
export class ConfigError extends EstaError {
  readonly code = 'CONFIG_ERROR';
  constructor(message: string, public readonly context: ConfigErrorContext) {
    super(message);
  }
}

export class ValidationError extends EstaError {
  readonly code = 'VALIDATION_ERROR';
  constructor(message: string, public readonly context: ValidationErrorContext) {
    super(message);
  }
}

// Result型ヘルパー
export class ResultUtils {
  static ok<T>(value: T): Ok<T> {
    return { ok: true, value };
  }

  static err<E>(error: E): Err<E> {
    return { ok: false, error };
  }

  static fromThrowable<T, E = Error>(
    fn: () => T,
    errorMapper?: (error: unknown) => E,
  ): Result<T, E> {
    try {
      return this.ok(fn());
    } catch (error) {
      const mappedError = errorMapper ? errorMapper(error) : error as E;
      return this.err(mappedError);
    }
  }
}
```

#### @esta-core/exec

責務: コマンド実行中核モジュール。

```typescript
export interface ExecOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  shell?: boolean;
}

export interface ExecResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}

// ランタイム抽象化
export abstract class Executor {
  abstract exec(command: string, args: string[], options?: ExecOptions): Promise<Result<ExecResult, ExecError>>;
}

// 具象実装
export class NodeExecutor extends Executor {}
export class DenoExecutor extends Executor {}
export class BunExecutor extends Executor {}
export class GHAExecutor extends Executor {}
```

### @esta-system/ - システムレイヤー

#### @esta-system/runtime

責務: 実行環境判定 (Node/Deno/Bun/GHA)。

```typescript
export interface RuntimeInfo {
  runtime: Runtime;
  version: string;
  isGitHubActions: boolean;
  capabilities: RuntimeCapabilities;
}

export interface RuntimeCapabilities {
  childProcess: boolean;
  fileSystem: boolean;
  webAPIs: boolean;
  nodeModules: boolean;
}

export class RuntimeDetector {
  static detect(): RuntimeInfo {
    // 環境判定ロジック
  }

  static isNodeJS(): boolean {}
  static isDeno(): boolean {}
  static isBun(): boolean {}
  static isGitHubActions(): boolean {}
}

// Feature Flag by Runtime
export class RuntimeFeatureFlags {
  static hasChildProcess(runtime: Runtime): boolean {}
  static hasFileSystem(runtime: Runtime): boolean {}
  static hasNodeModules(runtime: Runtime): boolean {}
}
```

#### @esta-system/platform

責務: OS/アーキテクチャ判定。

```typescript
export interface PlatformInfo {
  platform: Platform;
  arch: Architecture;
  shell: Shell;
  pathSeparator: string;
  executableExtension: string;
}

export enum Architecture {
  X64 = 'x64',
  ARM64 = 'arm64',
  X86 = 'x86',
  ARM = 'arm',
}

export enum Shell {
  POWERSHELL = 'powershell',
  CMD = 'cmd',
  BASH = 'bash',
  ZSH = 'zsh',
  UNKNOWN = 'unknown',
}

export class PlatformDetector {
  static detect(): PlatformInfo {}
  static isWindows(): boolean {}
  static isLinux(): boolean {}
  static isMacOS(): boolean {}
}
```

#### @esta-system/shell

責務: シェル処理・パス展開・引数クォート。

```typescript
export interface ShellCommand {
  command: string;
  args: string[];
  shell: Shell;
}

export class ShellUtils {
  // 引数クォート処理
  static quoteArg(arg: string, shell: Shell): string {}
  static quoteArgs(args: string[], shell: Shell): string[] {}

  // パス処理
  static expandPath(path: string, shell: Shell): Result<string, PathError> {}
  static normalizePath(path: string, platform: Platform): string {}

  // コマンドライン構築
  static buildCommandLine(cmd: ShellCommand): string {}
}

// シェル別の差異吸収
export abstract class ShellAdapter {
  abstract quoteArg(arg: string): string;
  abstract expandPath(path: string): Result<string, PathError>;
  abstract getExecutablePaths(): string[];
}

export class PowerShellAdapter extends ShellAdapter {}
export class BashAdapter extends ShellAdapter {}
export class CmdAdapter extends ShellAdapter {}
```

### @esta-utils/ - ユーティリティ

#### @esta-utils/command-runner

責務: クロスプラットフォーム対応外部プロセス実行。

```typescript
export interface CommandOptions extends ExecOptions {
  platform?: Platform;
  shell?: Shell;
  validateExitCode?: boolean;
}

export class CommandRunner {
  constructor(
    private executor: Executor,
    private platform: PlatformInfo,
    private shell: ShellUtils,
  ) {}

  async run(
    command: string,
    args: string[] = [],
    options: CommandOptions = {},
  ): Promise<Result<ExecResult, CommandError>> {
    // プラットフォーム固有の処理
    const quotedArgs = this.shell.quoteArgs(args, this.platform.shell);
    return this.executor.exec(command, quotedArgs, options);
  }

  async exists(command: string): Promise<boolean> {
    // コマンド存在確認
  }
}
```

#### @esta-utils/config-loader

責務: YAML/JSON 設定ファイルロード・バリデーション。

```typescript
export interface LoadOptions {
  validate?: boolean;
  schema?: JSONSchema;
  merge?: boolean;
  defaultConfig?: Record<string, unknown>;
}

export class ConfigLoader {
  async load<T = unknown>(path: string, options: LoadOptions = {}): Promise<Result<T, ConfigError>> {
    // 拡張子による自動判定
    // JSON/JSONC/YAML/JS/TS対応
  }

  async loadMultiple<T = unknown>(paths: string[], options: LoadOptions = {}): Promise<Result<T, ConfigError>> {
    // 複数設定ファイルのマージ
  }

  validate<T>(data: T, schema: JSONSchema): Result<T, ValidationError> {
    // JSONSchema によるバリデーション
  }
}
```

### @esta-actions/ - GitHub Actions

#### @esta-actions/tools-installer

責務: GHA 用ツールインストール。

```typescript
export interface InstallOptions {
  toolsConfig: ToolConfig[];
  installDir?: string;
  addToPath?: boolean;
  cacheTools?: boolean;
}

export class ToolsInstaller {
  constructor(
    private configManager: ConfigManager,
    private commandRunner: CommandRunner,
    private logger: Logger,
  ) {}

  async install(options: InstallOptions): Promise<Result<InstallResult[], InstallError>> {
    // 統一されたツールインストール処理
  }

  private async installTool(config: ToolConfig): Promise<Result<InstallResult, InstallError>> {
    // 個別ツールインストール
  }
}

// インストーラー抽象化
export abstract class Installer {
  abstract install(config: ToolConfig): Promise<Result<InstallResult, InstallError>>;
}

export class EgetInstaller extends Installer {}
export class ScriptInstaller extends Installer {}
```

## 🔄 依存関係設計

### 依存方向

```bash
@esta-actions
    ↓
@esta-utils
    ↓
@esta-core ←→ @esta-system
    ↓
@shared
```

### 具体的依存関係

#### レイヤー別依存

| From Layer | To Layer                    | 許可 | 制約                 |
| ---------- | --------------------------- | ---- | -------------------- |
| actions    | utils, core, system, shared | ✅   | -                    |
| utils      | core, system, shared        | ✅   | -                    |
| core       | system, shared              | ✅   | -                    |
| system     | shared                      | ✅   | -                    |
| shared     | -                           | ✅   | 他レイヤーに依存禁止 |

#### パッケージ別依存

| Package                       | Dependencies                             | Rationale              |
| ----------------------------- | ---------------------------------------- | ---------------------- |
| @esta-actions/tools-installer | utils/command-runner, core/tools-config  | ツール実行・設定管理   |
| @esta-utils/command-runner    | core/exec, system/platform, system/shell | コマンド実行・環境判定 |
| @esta-core/tools-config       | shared/types, shared/constants           | 型・定数の統一         |
| @esta-system/runtime          | shared/types                             | 型の統一               |

### 循環依存の防止

#### 禁止パターン

- レイヤー間の循環依存
- パッケージ間の循環依存
- @shared から他への依存

#### 許可パターン

- 下位レイヤーから上位レイヤーへの依存
- 同レイヤー内での限定的相互依存（core ↔ system のみ）

## 🎯 アーキテクチャ品質属性

### 保守性 (Maintainability)

設計決定:

- 単一責務による変更影響範囲の最小化
- 抽象化によるテスタビリティ向上
- 型安全性による実行時エラー削減

定量目標:

- Cyclomatic Complexity: 10以下/関数
- Code Duplication: 5%未満
- Test Coverage: 90%以上

### 拡張性 (Extensibility)

設計決定:

- プラグインアーキテクチャの採用
- インターフェース設計による実装の差し替え可能性
- 設定による動作制御

拡張ポイント:

- 新しいインストーラーの追加
- 新しいランタイムの対応
- 新しい設定形式の対応

### 移植性 (Portability)

設計決定:

- ランタイム抽象化による環境依存の分離
- プラットフォーム判定による差異の吸収
- Web 標準 API 優先の設計

対応環境:

- Node.js (20+)
- Deno (1.30+)
- Bun (1.0+)
- GitHub Actions (ubuntu-latest, windows-latest)

### パフォーマンス (Performance)

設計決定:

- 遅延読み込みによる初期化コスト削減
- キャッシュによる重複処理の回避
- 非同期処理による並列実行

目標値:

- 初期化時間: 100ms 以下
- 設定読み込み: 50ms 以下/ファイル
- コマンド実行: オーバーヘッド 10%以下

## 🏗️ アーキテクチャ実装指針

### TypeScript設計指針

#### 型設計

- 厳密な型: strict mode 完全対応
- 型の合成: union、intersection 型の積極活用
- ジェネリクス: 再利用性の高い抽象化
- ブランド型: 型レベルでの値の区別

#### エラーハンドリング

- Result<T,E>パターン: 例外を使わない関数型エラーハンドリング
- 構造化エラー: エラーコード、コンテキスト情報の標準化
- エラー階層: 基底エラークラスからの継承構造

#### 非同期処理

- Promise 中心: async/await の統一利用
- エラー境界: 非同期エラーの処理
- キャンセレーション: AbortController による中断対応

### モジュール設計指針

#### エクスポート戦略

- 明示的エクスポート: 必要最小限の API のみ公開
- バレルエクスポート: index.ts による統一エントリ
- 型エクスポート: type import/export の活用

#### 依存性注入

- コンストラクタ注入: 依存関係の明示化
- インターフェース依存: 具象クラスへの直接依存回避
- ファクトリパターン: 複雑な生成処理の抽象化

---

この目標アーキテクチャにより、統一性・拡張性・保守性を兼ね備えたモノレポ構成を実現します。次章では、現在の構成からこのアーキテクチャへの段階的移行計画を詳説します。
