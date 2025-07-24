# New Package Architecture

# 新パッケージアーキテクチャ

## 設計原則

### 1. ランタイム中立性

すべてのパッケージがNode.js、Deno、Bun、GitHub Actionsで動作可能

### 2. フラット化

- 2階層ディレクトリ構造維持（`packages/@namespace/package/`）
- 既存スクリプト（`sync-configs.sh`）との互換性確保

### 3. 段階的移行

- 既存システムを破壊しない
- 新旧パッケージの併存期間を設ける
- 互換性レイヤーで破壊的変更を回避

### 4. 型安全性

- Result<T, E>による統一エラーハンドリング
- 包括的な型定義
- コンパイル時のエラー検出

## 新パッケージ構成

### アーキテクチャ図

```
┌─────────────────────────────────────────┐
│           統合レイヤー                    │
│  @esta-cli         @esta-github-actions │
└─────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────┐
│         アプリケーションレイヤー           │
│     @esta-tools/installer               │
│     @esta-tools/command                 │
└─────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────┐
│           機能レイヤー                    │
│  @esta-config     @esta-validation      │
│  @esta-path-utils @esta-fs-utils        │
└─────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────┐
│           基盤レイヤー                    │
│  @esta-runtime    @esta-error-result    │
│  @shared/types    @shared/constants     │
└─────────────────────────────────────────┘
```

## 各パッケージの詳細設計

### 基盤レイヤー

#### @esta-runtime

**責任**: ランタイム抽象化とプラットフォーム統一API

```typescript
// 統合されたランタイムアダプター
export interface RuntimeAdapter {
  // コア情報
  name: RuntimeType;
  version: string;
  features: RuntimeFeatures;

  // ファイルシステム抽象化
  fs: FileSystemAdapter;

  // プロセス抽象化
  process: ProcessAdapter;

  // GitHub Actions特化機能
  githubActions?: GitHubActionsAdapter;
}

// ランタイム自動検出
export const createRuntime = (): RuntimeAdapter => {
  const runtime = detectRuntime();
  switch (runtime) {
    case 'node':
      return new NodeRuntimeAdapter();
    case 'deno':
      return new DenoRuntimeAdapter();
    case 'bun':
      return new BunRuntimeAdapter();
    case 'github-actions':
      return new GitHubActionsRuntimeAdapter();
  }
};

// ファイルシステム統一API
export interface FileSystemAdapter {
  readText(path: string): Promise<string>;
  writeText(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string, options?: MkdirOptions): Promise<void>;
  rmdir(path: string, options?: RmdirOptions): Promise<void>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<FileStats>;
}

// プロセス統一API
export interface ProcessAdapter {
  env: EnvironmentManager;
  cwd(): string;
  chdir(path: string): void;
  exit(code?: number): never;
  platform: PlatformInfo;
  arch: string;
}
```

**統合パッケージ**:

- `@esta-utils/get-platform` → platform検出機能
- ファイル操作関連機能の一部
- プロセス操作関連機能

#### @esta-error-result

**責任**: 統一エラーハンドリングパターンの提供

```typescript
// Result<T, E>実装
export type Result<T, E = Error> = Ok<T> | Err<E>;

export interface Ok<T> {
  readonly tag: 'ok';
  readonly value: T;
  isOk(): this is Ok<T>;
  isErr(): this is never;
  map<U>(fn: (value: T) => U): Result<U, E>;
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
}

export interface Err<E> {
  readonly tag: 'err';
  readonly error: E;
  isOk(): this is never;
  isErr(): this is Err<E>;
  mapErr<F>(fn: (error: E) => F): Result<T, F>;
}

// 便利な生成関数
export const ok = <T>(value: T): Ok<T> => ({ tag: 'ok', value });
export const err = <E>(error: E): Err<E> => ({ tag: 'err', error });

// 既存パターンとの相互運用
export const fromBoolean = <E>(value: boolean, error: E): Result<boolean, E> => value ? ok(value) : err(error);

export const fromNullable = <T, E>(value: T | null, error: E): Result<T, E> => value !== null ? ok(value) : err(error);

export const fromPromise = async <T>(promise: Promise<T>): Promise<Result<T, Error>> => {
  try {
    const value = await promise;
    return ok(value);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
};
```

#### @shared/types（拡張）

**責任**: プロジェクト全体の型定義

```typescript
// ランタイム関連型
export type RuntimeType = 'node' | 'deno' | 'bun' | 'github-actions';
export type PlatformType = 'win32' | 'darwin' | 'linux';

// ログ関連型
export type LogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type LogLevelLabel = 'OFF' | 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';

// 設定関連型
export type ConfigFormat = 'json' | 'yaml' | 'yml' | 'toml' | 'js' | 'ts' | 'mjs';

// パス関連型
export type PathString = string;
export type NormalizedPath = string;
export type AbsolutePath = string;

// エラー関連型
export type ExitCode = number;
export type ErrorCode = string;

// 結果型
export type Result<T, E = Error> = import('@esta-error-result').Result<T, E>;
```

#### @shared/constants（拡張）

**責任**: プロジェクト全体の定数定義

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

// サポート対象設定ファイル拡張子
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
} as const;

// エラーメッセージ（国際化対応）
export const ERROR_MESSAGES = {
  ja: {
    VALIDATION_FAILED: '設定の検証に失敗しました',
    FILE_NOT_FOUND: 'ファイルが見つかりません',
    CONFIG_ERROR: '設定エラーが発生しました',
    PERMISSION_DENIED: 'アクセス権限がありません',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
  },
  en: {
    VALIDATION_FAILED: 'Configuration validation failed',
    FILE_NOT_FOUND: 'File not found',
    CONFIG_ERROR: 'Configuration error occurred',
    PERMISSION_DENIED: 'Permission denied',
    NETWORK_ERROR: 'Network error occurred',
  },
} as const;
```

### 機能レイヤー

#### @esta-config

**責任**: 全設定処理の統合

```typescript
// 統合設定ローダー
export class UniversalConfigLoader<T> {
  constructor(
    private schema: ValidationSchema<T>,
    private options: ConfigLoaderOptions = {},
  ) {}

  // 基本読み込み
  async load(path?: string): Promise<Result<T, ConfigError>> {
    // @esta-utils/config-loaderの機能
  }

  // 設定検索
  async search(options?: SearchOptions): Promise<Result<T, ConfigError>> {
    // XDGベース設定検索
  }

  // ツール設定読み込み
  async loadTools(path?: string): Promise<Result<ToolsConfig, ConfigError>> {
    // @esta-core/tools-configの機能
  }

  // Esta設定読み込み
  async loadEsta(path?: string): Promise<Result<EstaConfig, ConfigError>> {
    // @esta-core/esta-configの機能
  }

  // 設定統合
  async merge(...configs: ConfigSource<T>[]): Promise<Result<T, ConfigError>> {
    // 複数設定ファイルのマージ
  }

  // バリデーション
  validate(config: unknown): Result<T, ValidationError> {
    // スキーマベースバリデーション
  }
}

// 設定エラー定義
export interface ConfigError {
  code: 'FILE_NOT_FOUND' | 'PARSE_ERROR' | 'VALIDATION_FAILED' | 'PERMISSION_DENIED';
  message: string;
  path?: string;
  line?: number;
  column?: number;
  cause?: Error;
}

// 設定検索オプション
export interface SearchOptions {
  configName: string;
  searchDirs?: string[];
  stopAt?: string;
  extensions?: ConfigFormat[];
}
```

**統合パッケージ**:

- `@esta-utils/config-loader` （全体）
- `@esta-core/tools-config/core/config/`
- `@esta-core/esta-config/configLoader.ts`

#### @esta-validation

**責任**: バリデーション・正規化の統合

```typescript
// 統合バリデーター
export class UniversalValidator<T> {
  constructor(private schema: ValidationSchema<T>) {}

  validate(input: unknown): Result<T, ValidationError> {
    // Valibotベースバリデーション
  }

  normalize(input: Partial<T>): Result<T, NormalizationError> {
    // データ正規化
  }

  sanitize(input: unknown): Result<T, SanitizationError> {
    // データサニタイゼーション
  }

  transform<U>(transformer: Transformer<T, U>): UniversalValidator<U> {
    // バリデーター変換
  }
}

// 汎用正規化関数
export const normalizers = {
  // パス正規化（クロスプラットフォーム）
  path: (input: string | undefined | null): string => {
    if (input == null || input === '') { return ''; }
    return input.replace(/[/\\]+/g, '/').replace(/\/$/, '');
  },

  // ログレベル正規化
  logLevel: (input: string | number | undefined): LogLevel => {
    if (input == null) { return 4; // INFO
     }
    if (typeof input === 'number') { return input as LogLevel; }
    return LOG_LEVEL_MAP[input.toUpperCase() as keyof typeof LOG_LEVEL_MAP] ?? 4;
  },

  // URL正規化
  url: (input: string): string => {
    return new URL(input).toString();
  },

  // セマンティックバージョン正規化
  semver: (input: string): string => {
    return input.replace(/^v/, '').trim();
  },

  // 環境変数正規化
  env: (input: string | boolean | undefined): string => {
    if (typeof input === 'boolean') { return input.toString(); }
    return input?.toString() ?? '';
  },
};

// バリデーションエラー
export interface ValidationError {
  code: 'INVALID_TYPE' | 'INVALID_VALUE' | 'MISSING_REQUIRED' | 'INVALID_FORMAT';
  message: string;
  path: string[];
  expected?: unknown;
  received?: unknown;
}
```

**統合パッケージ**:

- `@esta-core/tools-config/tools-validator/`
- `@esta-core/esta-config/validators/`
- `@esta-core/esta-config/utils/normalizeConfig.ts`
- 各パッケージの個別バリデーション

#### @esta-path-utils

**責任**: パス操作の統合

```typescript
// パス管理統合クラス
export class PathManager {
  // 基本パス操作
  normalize(path: string): string {
    // クロスプラットフォーム正規化
  }

  resolve(...segments: string[]): string {
    // パス解決
  }

  relative(from: string, to: string): string {
    // 相対パス計算
  }

  isAbsolute(path: string): boolean {
    // 絶対パス判定
  }

  // 拡張機能
  areEqual(path1: string, path2: string): boolean {
    // パス比較（大小文字、区切り文字考慮）
  }

  validatePath(path: string): Result<string, PathError> {
    // パスバリデーション
  }

  findCommonRoot(paths: string[]): string {
    // 共通ルートパス検出
  }

  // GitHub Actions対応
  toGitHubActionsPath(path: string): string {
    // GitHub Actions用パス変換
  }
}

// パスエラー
export interface PathError {
  code: 'INVALID_PATH' | 'PATH_NOT_FOUND' | 'PERMISSION_DENIED' | 'PATH_TOO_LONG';
  message: string;
  path: string;
}
```

**統合パッケージ**:

- `@esta-core/tools-config/utils/pathUtils.ts`
- `@esta-core/esta-config/utils/pathNormalize.ts`

#### @esta-fs-utils

**責任**: ファイル操作の統合

```typescript
// ファイルシステム管理統合クラス
export class FileSystemManager {
  constructor(private runtime: RuntimeAdapter) {}

  // 基本ファイル操作
  async readText(path: string): Promise<Result<string, FileError>> {
    // ランタイム抽象化されたファイル読み込み
  }

  async writeText(path: string, content: string): Promise<Result<void, FileError>> {
    // ランタイム抽象化されたファイル書き込み
  }

  async exists(path: string): Promise<Result<boolean, FileError>> {
    // ファイル存在確認
  }

  // ディレクトリ操作
  async mkdir(path: string, options?: MkdirOptions): Promise<Result<void, FileError>> {
    // ディレクトリ作成
  }

  async rmdir(path: string, options?: RmdirOptions): Promise<Result<void, FileError>> {
    // ディレクトリ削除
  }

  async readdir(path: string): Promise<Result<string[], FileError>> {
    // ディレクトリ内容読み取り
  }

  // 高レベル操作
  async copy(src: string, dest: string): Promise<Result<void, FileError>> {
    // ファイル・ディレクトリコピー
  }

  async move(src: string, dest: string): Promise<Result<void, FileError>> {
    // ファイル・ディレクトリ移動
  }

  // GitHub Actions対応
  async createGitHubActionsDirectory(path: string): Promise<Result<string, FileError>> {
    // GitHub Actions向けディレクトリ作成とPATH追加
  }
}

// ファイルエラー
export interface FileError {
  code: 'FILE_NOT_FOUND' | 'PERMISSION_DENIED' | 'DISK_FULL' | 'INVALID_PATH';
  message: string;
  path: string;
  operation: 'read' | 'write' | 'delete' | 'create' | 'copy' | 'move';
}
```

**統合パッケージ**:

- `@agla-e2e/fileio-framework/utils/agE2eFileIoUtils.ts`
- `@esta-actions/tools-installer/utils/prepareInstallDirectory.ts`

### アプリケーションレイヤー

#### @esta-tools/installer

**責任**: ツールインストール機能の統合

```typescript
// 統合インストーラー
export class UniversalInstaller {
  constructor(
    private runtime: RuntimeAdapter,
    private config: ConfigManager,
    private logger: Logger = console,
  ) {}

  // 単一ツールインストール
  async install(config: ToolConfig): Promise<Result<InstallInfo, InstallError>> {
    // eget、npm、script、GitHub等の統合インストール
  }

  // 複数ツールインストール
  async installMultiple(configs: ToolConfig[]): Promise<Result<InstallInfo[], InstallError>> {
    // 並列・順次インストール
  }

  // ツール検出
  async detect(toolName: string): Promise<Result<ToolInfo | null, DetectionError>> {
    // インストール済みツールの検出
  }

  // ツール検証
  async verify(toolName: string): Promise<Result<VerificationInfo, VerificationError>> {
    // インストール後の動作確認
  }

  // バージョン管理
  async listVersions(toolName: string): Promise<Result<string[], VersionError>> {
    // 利用可能バージョン一覧
  }

  async getLatestVersion(toolName: string): Promise<Result<string, VersionError>> {
    // 最新バージョン取得
  }
}

// ツール設定
export interface ToolConfig {
  name: string;
  installer: 'eget' | 'npm' | 'script' | 'github' | 'custom';
  package?: string; // GitHub repo or npm package
  version?: string;
  installDir?: string;
  options?: Record<string, unknown>;
  verification?: VerificationConfig;
}

// インストール情報
export interface InstallInfo {
  tool: string;
  version: string;
  installedPath: string;
  installer: string;
  duration: number;
  verified: boolean;
}
```

**統合パッケージ**:

- `@esta-actions/tools-installer` （全体）
- `@esta-core/tools-config` （設定部分）

#### @esta-tools/command

**責任**: コマンド実行機能の統合

```typescript
// 統合コマンドランナー
export class CommandRunner {
  constructor(private runtime: RuntimeAdapter) {}

  // コマンド存在確認
  async exists(command: string): Promise<Result<boolean, CommandError>> {
    // 詳細なエラー情報付きの存在確認
  }

  async which(command: string): Promise<Result<string | null, CommandError>> {
    // コマンドパス取得
  }

  // コマンド実行
  async run(
    command: string,
    args?: string[],
    options?: RunOptions,
  ): Promise<Result<CommandOutput, CommandError>> {
    // 統一されたコマンド実行
  }

  async spawn(
    command: string,
    args?: string[],
    options?: SpawnOptions,
  ): Promise<Result<ChildProcess, CommandError>> {
    // 非同期プロセス実行
  }

  // バッチ実行
  async sequence(commands: CommandSpec[]): Promise<Result<CommandOutput[], CommandError>> {
    // 順次実行
  }

  async parallel(commands: CommandSpec[]): Promise<Result<CommandOutput[], CommandError>> {
    // 並列実行
  }

  // シェル操作
  async shell(script: string, options?: ShellOptions): Promise<Result<CommandOutput, CommandError>> {
    // シェルスクリプト実行
  }
}

// コマンドエラー（詳細情報付き）
export interface CommandError {
  code: 'COMMAND_NOT_FOUND' | 'PERMISSION_DENIED' | 'TIMEOUT' | 'EXECUTION_FAILED';
  message: string;
  command: string;
  args?: string[];
  exitCode?: number;
  signal?: string;
  stdout?: string;
  stderr?: string;
}

// コマンド出力
export interface CommandOutput {
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
  command: string;
  args: string[];
}
```

**統合パッケージ**:

- `@esta-utils/command-runner`

### 統合レイヤー

#### @esta-cli

**責任**: CLI開発者向け完全統合パッケージ

```typescript
// 全機能の統合エクスポート
export * from '@esta-config';
export * from '@esta-error-result';
export * from '@esta-fs-utils';
export * from '@esta-path-utils';
export * from '@esta-runtime';
export * from '@esta-tools/command';
export * from '@esta-tools/installer';
export * from '@esta-validation';

// 高レベル統合API
export function createCLI(options: CLIOptions): CLIBuilder {
  // CLI構築ヘルパー
}

export function createConfig<T>(schema: Schema<T>): ConfigManager<T> {
  // 設定管理ヘルパー
}

export function createInstaller(options?: InstallerOptions): UniversalInstaller {
  // インストーラーヘルパー
}

export function createCommand(runtime?: RuntimeType): CommandRunner {
  // コマンドランナーヘルパー
}

// CLI特化ユーティリティ
export const cli = {
  args: parseArguments(process.argv),
  env: loadEnvironment(),
  logger: createLogger(),
  runtime: createRuntime(),
};
```

#### @esta-github-actions

**責任**: GitHub Actions開発者向け特化パッケージ

```typescript
// GitHub Actions特化エクスポート
export * from '@esta-runtime';
export * from '@esta-tools/installer';

// GitHub Actions専用API
export function createAction(handler: ActionHandler): void {
  // GitHub Action作成ヘルパー
}

export function getInputs<T>(schema: Schema<T>): T {
  // GitHub Actions入力取得
}

export function setOutputs(outputs: Record<string, string>): void {
  // GitHub Actions出力設定
}

// GitHub Actions最適化ログ
export const logger = createGitHubActionsLogger();

// GitHub Actions特化ユーティリティ
export const actions = {
  core: require('@actions/core'),
  io: require('@actions/io'),
  toolCache: require('@actions/tool-cache'),
  context: require('@actions/github').context,
};
```

## 継続パッケージ

### @esta-core/error-handler（継続）

既存のプロセス終了型エラーハンドリングを維持。
新しいResult<T, E>と併用可能。

### @esta-system/exit-status（継続）

システムレベルの終了コード管理を継続。

### @agla-*（独立保持）

将来の独立化に向けて現状維持。
依存関係は最小限に制限。

この新アーキテクチャにより、統一性、保守性、拡張性が大幅に向上します。
