---
title: Phase 2 - 機能統合パッケージ作成
description: 重複している機能パッケージの統合とクロスプラットフォーム対応の実現
sidebar_position: 2
---

# Phase 2: Integration Packages

> **Note**: このフェーズの実装では **t-wad式TDD（Test-Driven Development）** を採用します。テストファーストで実装を進め、品質と設計の確実性を保証します。

# Phase 2: 機能統合パッケージ作成

## 実行コマンド

```bash
/kiro "Execute Phase 2: Create integration packages (@esta-config, @esta-validation, @esta-path-utils, @esta-fs-utils) to consolidate duplicate functionality according to phase2-integration.md"
```

## 前提条件

**Phase 1の完了が必須**:

- `@esta-error-result` パッケージが利用可能
- `@esta-runtime` パッケージが利用可能
- `@shared/types` と `@shared/constants` が拡張済み
- 全Phase 1品質チェックが通過済み

## 目標

重複している機能パッケージを統合し、Result<T,E>パターンとランタイム抽象化を適用して、一貫したAPIを提供する。

## 期間

Week 3-4 (推定10-14日)

## 成果物

### 1. @esta-config パッケージ

**場所**: `packages/@esta-config/`
**責任**: 全設定処理の統合

#### 統合対象パッケージ

- `@esta-utils/config-loader` (全体) - 汎用設定ローダー
- `@esta-core/tools-config/core/config/` - ツール設定専用ローダー
- `@esta-core/esta-config/configLoader.ts` - Esta設定専用ローダー

#### 要求仕様

- 3つの設定ローダーの機能を統合した`UniversalConfigLoader`
- JSON/YAML/TOML/JS/TS形式の統一サポート
- XDGベース設定検索機能
- Result<T,E>による統一エラーハンドリング
- ランタイム抽象化によるクロスプラットフォーム対応

#### 実装必須項目

```typescript
// 統合設定ローダー
export class UniversalConfigLoader<T extends BaseConfig> {
  constructor(
    private schema: ValidationSchema<T>,
    private options: ConfigLoaderOptions = {},
  ) {}

  // 基本読み込み (@esta-utils/config-loaderの機能)
  async load(path?: string): Promise<Result<T, ConfigError>>;

  // 設定検索 (XDGベース検索)
  async search(options?: SearchOptions): Promise<Result<T, ConfigError>>;

  // ツール設定読み込み (@esta-core/tools-configの機能)
  async loadTools(path?: string): Promise<Result<ToolsConfig, ConfigError>>;

  // Esta設定読み込み (@esta-core/esta-configの機能)
  async loadEsta(path?: string): Promise<Result<EstaConfig, ConfigError>>;

  // 設定統合
  async merge(...sources: ConfigSource<T>[]): Promise<Result<T, ConfigError>>;

  // バリデーション
  validate(config: unknown): Result<T, ValidationError>;
}

// 設定エラー (詳細情報付き)
export interface ConfigError {
  code: 'FILE_NOT_FOUND' | 'PARSE_ERROR' | 'VALIDATION_FAILED' | 'PERMISSION_DENIED' | 'CONFIG_ERROR';
  message: string;
  path?: string;
  line?: number;
  column?: number;
  format?: ConfigFormat;
  searchDirs?: string[];
  cause?: Error;
}

// パーサー統合
export interface ConfigParser {
  canParse(extension: string): boolean;
  parse<T>(content: string): Promise<Result<T, ParseError>>;
}

// 検索オプション
export interface SearchOptions {
  configName?: string;
  searchDirs?: string[];
  stopAt?: string;
  extensions?: ConfigFormat[];
}
```

#### パッケージ構成

```
packages/@esta-config/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # メインエクスポート
│   ├── UniversalConfigLoader.ts    # 統合ローダー
│   ├── parsers/
│   │   ├── json.ts                # JSON/JSONC パーサー
│   │   ├── yaml.ts                # YAML パーサー
│   │   ├── toml.ts                # TOML パーサー
│   │   └── script.ts              # JS/TS パーサー
│   ├── search/
│   │   ├── finder.ts              # 設定ファイル検索
│   │   └── directories.ts         # XDG ディレクトリ
│   ├── merger.ts                  # 設定マージ機能
│   ├── types.ts                   # 型定義
│   └── __tests__/
│       ├── loader.spec.ts
│       ├── parsers.spec.ts
│       ├── search.spec.ts
│       └── integration.spec.ts
├── lib/
├── module/
└── configs/
```

#### 削減効果

- **3パッケージ → 1パッケージ**: 67%削減
- **重複コード**: 推定60%削減
- **API統一**: 3つの異なるAPIを1つに統合

### 2. @esta-validation パッケージ

**場所**: `packages/@esta-validation/`
**責任**: バリデーション・正規化の統合

#### 統合対象機能

- `@esta-core/tools-config/tools-validator/` - eget専用バリデーター
- `@esta-core/esta-config/validators/` - Esta設定バリデーター
- `@esta-core/esta-config/utils/normalizeConfig.ts` - 設定正規化
- `@esta-core/esta-config/utils/logLevelNormalize.ts` - ログレベル正規化
- 各パッケージの個別バリデーション

#### 実装必須項目

```typescript
// 統合バリデーター
export class UniversalValidator<T> {
  constructor(private schema: ValidationSchema<T>) {}

  validate(input: unknown): Result<T, ValidationError>;
  normalize(input: Partial<T>): Result<T, NormalizationError>;
  sanitize(input: unknown): Result<T, SanitizationError>;
  transform<U>(transformer: Transformer<T, U>): UniversalValidator<U>;
}

// 正規化関数群 (統合・拡張)
export const normalizers = {
  // パス正規化 (クロスプラットフォーム)
  path: (input: string | undefined | null): string => {
    if (input == null || input === '') return '';
    return input.replace(/[/\\]+/g, '/').replace(/\/$/, '');
  },

  // ログレベル正規化 (文字列・数値対応)
  logLevel: (input: string | number | undefined): LogLevel => {
    if (input == null) return 4; // INFO
    if (typeof input === 'number') return input as LogLevel;
    const level = LOG_LEVEL_MAP[input.toUpperCase() as keyof typeof LOG_LEVEL_MAP];
    return level ?? 4;
  },

  // URL正規化
  url: (input: string): string => new URL(input).toString(),

  // セマンティックバージョン正規化
  semver: (input: string): string => input.replace(/^v/, '').trim(),

  // 環境変数正規化
  env: (input: string | boolean | undefined): string => {
    if (typeof input === 'boolean') return input.toString();
    return input?.toString() ?? '';
  },

  // GitHub リポジトリ正規化
  githubRepo: (input: string): string => {
    return input.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');
  },
};

// スキーマ統合 (Valibot基盤)
export const createSchema = {
  // Esta設定スキーマ
  estaConfig: () => v.object({ ... }),

  // ツール設定スキーマ
  toolsConfig: () => v.object({ ... }),

  // eget設定スキーマ
  egetTool: () => v.object({ ... }),

  // カスタムスキーマ
  custom: <T>(definition: SchemaDefinition<T>) => v.object(definition),
};

// バリデーションエラー (詳細情報)
export interface ValidationError {
  code: 'INVALID_TYPE' | 'INVALID_VALUE' | 'MISSING_REQUIRED' | 'INVALID_FORMAT';
  message: string;
  path: string[];
  expected?: unknown;
  received?: unknown;
  suggestions?: string[];
}
```

### 3. @esta-path-utils パッケージ

**場所**: `packages/@esta-path-utils/`
**責任**: パス操作の統合

#### 統合対象パッケージ

- `@esta-core/tools-config/utils/pathUtils.ts` - 高機能パス操作
- `@esta-core/esta-config/utils/pathNormalize.ts` - 基本パス正規化

#### 実装必須項目

```typescript
// 統合パス管理
export class PathManager {
  // 基本パス操作
  normalize(path: string): string;
  resolve(...segments: string[]): string;
  relative(from: string, to: string): string;
  isAbsolute(path: string): boolean;

  // 拡張機能 (tools-configから)
  areEqual(path1: string, path2: string): boolean;
  validatePath(path: string): Result<string, PathError>;
  findCommonRoot(paths: string[]): string;

  // GitHub Actions対応
  toGitHubActionsPath(path: string): string;
  addToGitHubActionsPath(path: string): Result<void, PathError>;

  // セキュリティ機能
  isSafePath(path: string, basePath: string): boolean;
  sanitizePath(path: string): string;
}

// パスエラー (詳細情報)
export interface PathError {
  code: 'INVALID_PATH' | 'PATH_NOT_FOUND' | 'PERMISSION_DENIED' | 'PATH_TOO_LONG' | 'UNSAFE_PATH';
  message: string;
  path: string;
  platform?: string;
  suggestions?: string[];
}

// プラットフォーム対応
export const createPathManager = (runtime?: RuntimeAdapter): PathManager;
```

### 4. @esta-fs-utils パッケージ

**場所**: `packages/@esta-fs-utils/`
**責任**: ファイル操作の統合

#### 統合対象機能

- `@agla-e2e/fileio-framework/utils/agE2eFileIoUtils.ts` - E2E用ファイル操作
- `@esta-actions/tools-installer/utils/prepareInstallDirectory.ts` - インストール用ディレクトリ操作

#### 実装必須項目

```typescript
// 統合ファイルシステム管理
export class FileSystemManager {
  constructor(private runtime: RuntimeAdapter) {}

  // 基本ファイル操作 (Result<T,E>対応)
  async readText(path: string): Promise<Result<string, FileError>>;
  async writeText(path: string, content: string): Promise<Result<void, FileError>>;
  async exists(path: string): Promise<Result<boolean, FileError>>;

  // ディレクトリ操作
  async mkdir(path: string, options?: MkdirOptions): Promise<Result<void, FileError>>;
  async rmdir(path: string, options?: RmdirOptions): Promise<Result<void, FileError>>;
  async readdir(path: string): Promise<Result<string[], FileError>>;

  // 高レベル操作 (E2E frameworkから)
  async copy(src: string, dest: string): Promise<Result<void, FileError>>;
  async move(src: string, dest: string): Promise<Result<void, FileError>>;
  async ensureDir(path: string): Promise<Result<void, FileError>>;

  // GitHub Actions対応 (tools-installerから)
  async createGitHubActionsDirectory(path: string): Promise<Result<string, FileError>>;
  async addPathToGitHubActions(path: string): Promise<Result<void, FileError>>;

  // セキュリティ・安全性
  async safeWrite(path: string, content: string): Promise<Result<void, FileError>>;
  async safeRemove(path: string): Promise<Result<void, FileError>>;
}

// ファイルエラー (詳細情報)
export interface FileError {
  code: 'FILE_NOT_FOUND' | 'PERMISSION_DENIED' | 'DISK_FULL' | 'INVALID_PATH' | 'ALREADY_EXISTS';
  message: string;
  path: string;
  operation: 'read' | 'write' | 'delete' | 'create' | 'copy' | 'move';
  runtime?: RuntimeType;
  cause?: Error;
}

// ランタイム対応ファクトリー
export const createFileSystemManager = (runtime?: RuntimeAdapter): FileSystemManager;
```

## 品質要件

### テスト要件

```bash
# 各パッケージの包括テスト
pnpm run test:develop --filter="@esta-config"      # 統合機能テスト
pnpm run test:develop --filter="@esta-validation"  # バリデーション網羅テスト
pnpm run test:develop --filter="@esta-path-utils"  # クロスプラットフォームテスト
pnpm run test:develop --filter="@esta-fs-utils"    # ランタイム横断テスト

# 統合テスト
pnpm run test:integration # 新パッケージ間の相互作用テスト

# 互換性テスト
pnpm run test:compatibility # 既存パッケージとの互換性確認
```

### Result<T,E>適用要件

```typescript
// 全ての非同期操作でResult<T,E>を返す
async loadConfig(): Promise<Result<Config, ConfigError>>     // ✓
async validateData(): Promise<Result<Data, ValidationError>> // ✓
async normalizePath(): Promise<Result<string, PathError>>    // ✓
async readFile(): Promise<Result<string, FileError>>         // ✓

// 同期操作も適切にResult<T,E>を使用
normalize(data: unknown): Result<Data, NormalizeError>       // ✓
validate(input: unknown): Result<Output, ValidationError>   // ✓
```

### パフォーマンス要件

- **機能統合による高速化**: 重複処理の削減
- **ランタイム最適化**: 各ランタイムの最適APIを使用
- **メモリ効率**: 統合により不要なオブジェクト生成を削減

## 互換性戦略

### 既存パッケージとの共存

```typescript
// 段階的移行のための互換性レイヤー
// @esta-utils/config-loader の既存API維持
export const loadConfig = async <T>(options: LoadConfigOptions): Promise<T | null> => {
  const loader = new UniversalConfigLoader(schema);
  const result = await loader.load(options.configPath);
  return result.isOk() ? result.value : null;
};

// 既存のerrorExitとの統合
export const validateOrExit = <T>(result: Result<T, ValidationError>): T => {
  if (result.isErr()) {
    errorExit(ExitCode.VALIDATION_FAILED, result.error.message);
  }
  return result.value;
};
```

### 段階的API移行

1. **Phase 2**: 新APIと旧APIを併存
2. **Phase 3-4**: 新APIの使用を推奨（旧APIは非推奨）
3. **Phase 5**: 旧APIを削除

## 成功基準

### 削減効果の確認

```bash
# パッケージ数削減確認
# 削減前: @esta-utils/config-loader, @esta-core/tools-config/core/config, @esta-core/esta-config/configLoader
# 削減後: @esta-config
echo "Config packages: 3 → 1 (67% reduction)"

# コード重複削減確認
# 統合前後のLOC比較
cloc packages/@esta-utils/config-loader
cloc packages/@esta-core/tools-config/core/config
cloc packages/@esta-core/esta-config/src/configLoader.ts
# vs
cloc packages/@esta-config
```

### 機能確認基準

```typescript
// Phase 2 完了確認テスト
import { UniversalConfigLoader } from '@esta-config';
import { createFileSystemManager } from '@esta-fs-utils';
import { FileSystemManager, PathManager } from '@esta-path-utils';
import { normalizers, UniversalValidator } from '@esta-validation';

// 設定読み込み確認
const loader = new UniversalConfigLoader(testSchema);
const configResult = await loader.load('test.json');
console.assert(configResult.isOk());

// バリデーション確認
const validator = new UniversalValidator(testSchema);
const validationResult = validator.validate(testData);
console.assert(validationResult.isOk());

// パス操作確認
const pathManager = new PathManager();
const normalizedPath = pathManager.normalize('./test/path');
console.assert(typeof normalizedPath === 'string');

// ファイル操作確認
const fsManager = createFileSystemManager();
const fileExists = await fsManager.exists('package.json');
console.assert(fileExists.isOk());
```

### 統合テスト確認

```bash
# 新パッケージ間の統合動作確認
# @esta-config が @esta-validation を使用
# @esta-fs-utils が @esta-path-utils を使用
# 全て @esta-runtime を使用
pnpm run test:integration --filter="@esta-config,@esta-validation,@esta-path-utils,@esta-fs-utils"
```

## 注意事項

### API設計原則

- **一貫性**: 全パッケージでResult<T,E>パターンを使用
- **予測可能性**: 同じ種類の操作は同じAPIパターン
- **拡張性**: 将来の機能追加を考慮したインターフェース設計

### エラーハンドリング

- **詳細なエラー情報**: ユーザーが問題を特定・解決できる情報
- **国際化対応**: エラーメッセージの多言語対応準備
- **カテゴリ化**: エラー種別によるプログラマティックな処理

### パフォーマンス考慮

- **遅延読み込み**: 大きな依存関係の必要時読み込み
- **キャッシュ**: 同一設定ファイルの重複読み込み回避
- **ストリーミング**: 大きなファイルのストリーミング処理

## 次Phase準備

Phase 2完了後、以下が利用可能になる：

- 統一された設定処理API
- 統合されたバリデーション・正規化機能
- クロスプラットフォーム対応のパス・ファイル操作
- Result<T,E>による一貫したエラーハンドリング

これらの機能を使用してPhase 3でアプリケーション層パッケージを作成する。
