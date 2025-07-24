# ESTA System Restructuring Plan

# ESTAシステム全体リストラクチャリング計画書

**Version**: 1.0\
**Date**: 2025-01-24\
**Status**: Draft - Ready for Implementation

## 概要 (Executive Summary)

ESTAモノレポの大規模リストラクチャリングにより、重複コードの削減、ランタイム横断対応、型安全性の向上を実現します。

### 主要な成果目標

- **パッケージ数**: 27個 → 16個（42%削減）
- **重複コード**: 40-50%削減
- **ランタイム対応**: Node.js, Deno, Bun, GitHub Actions
- **型安全性**: Result<T, E>パターン導入
- **保守性**: 統一されたアーキテクチャ

## 現状分析 (Current State Analysis)

### パッケージ構成の問題点

```
現在: 27パッケージ（@agla除く21パッケージ）
├── @esta-actions/ (1) - tools-installer
├── @esta-core/ (4) - error-handler, esta-config, feature-flags, tools-config
├── @esta-system/ (1) - exit-status
├── @esta-utils/ (4) - command-runner, config-loader, get-platform, utils
├── @shared/ (2) - constants, types
└── @agla-*/ (6) - 独立保持
```

### 主要問題

1. **機能重複**: 設定読み込み（3箇所）、パス処理（2箇所）、バリデーション（複数）
2. **エラーハンドリング不統一**: boolean, null, throw Error, errorExitが混在
3. **型共有不足**: LogLevel, Platform等が複数箇所で重複定義
4. **ランタイム対応不足**: Node.js中心、Deno/Bun対応が部分的

## 新パッケージアーキテクチャ (New Package Architecture)

### 設計原則

1. **フラット化**: 2階層維持でスクリプト互換性確保
2. **ランタイム中立**: Node.js/Deno/Bun/GitHub Actions対応
3. **段階的移行**: 既存システムを破壊せずに移行
4. **型安全性**: Result<T, E>による統一エラーハンドリング

### 新パッケージ構成

```
packages/
# 基盤レイヤー
├── @esta-runtime/                    # ランタイム抽象化統合
├── @esta-error-result/               # Result<T, E>実装

# 機能レイヤー（統合パッケージ）
├── @esta-config/                     # 設定処理統合
├── @esta-validation/                 # バリデーション統合
├── @esta-path-utils/                 # パス操作統合
├── @esta-fs-utils/                   # ファイル操作統合

# アプリケーションレイヤー
├── @esta-tools/
│   ├── installer/                    # ツールインストーラー
│   └── command/                      # コマンド実行

# 統合レイヤー
├── @esta-cli/                        # CLI開発者向け統合
└── @esta-github-actions/             # GitHub Actions向け統合

# 継続パッケージ
├── @esta-core/
│   └── error-handler/                # 既存プロセス終了処理
├── @esta-system/
│   └── exit-status/                  # 既存システム関連
├── @shared/
│   ├── constants/                    # 拡張された共有定数
│   └── types/                        # 拡張された共有型
└── @agla-*/                          # 独立保持（6パッケージ）
```

## 段階的移行戦略 (Migration Strategy)

### Phase 1: 基盤構築（Week 1-2）

**目標**: 新しい基盤パッケージの作成

#### 1.1 @esta-error-result パッケージ作成

```typescript
// Result<T, E>実装
export type Result<T, E = Error> = Ok<T> | Err<E>;

export interface Ok<T> {
  readonly tag: 'ok';
  readonly value: T;
  isOk(): this is Ok<T>;
  isErr(): this is never;
}

export interface Err<E> {
  readonly tag: 'err';
  readonly error: E;
  isOk(): this is never;
  isErr(): this is Err<E>;
}

// 既存パターンとの相互運用
export const fromBoolean = <E>(value: boolean, error: E): Result<boolean, E>;
export const fromNullable = <T, E>(value: T | null, error: E): Result<T, E>;
export const fromPromise = <T>(promise: Promise<T>): Promise<Result<T, Error>>;
```

#### 1.2 @esta-runtime パッケージ作成

```typescript
// ランタイム抽象化
export interface RuntimeAdapter {
  name: RuntimeType;
  version: string;
  features: RuntimeFeatures;
  fs: FileSystemAdapter;
  process: ProcessAdapter;
  githubActions?: GitHubActionsAdapter;
}

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
```

#### 1.3 @shared パッケージ拡張

```typescript
// @shared/types 大幅拡張
export interface SharedTypes {
  RuntimeType: 'node' | 'deno' | 'bun' | 'github-actions';
  PlatformType: 'win32' | 'darwin' | 'linux';
  LogLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  ConfigFormat: 'json' | 'yaml' | 'toml' | 'js' | 'ts';
  PathString: string;
  NormalizedPath: string;
}

// @shared/constants 拡張
export const SharedConstants = {
  RUNTIME_IDENTIFIERS: {
    NODE: 'node' as const,
    DENO: 'deno' as const,
    BUN: 'bun' as const,
    GITHUB_ACTIONS: 'github-actions' as const,
  },
  LOG_LEVEL_MAP: {
    OFF: 0,
    FATAL: 1,
    ERROR: 2,
    WARN: 3,
    INFO: 4,
    DEBUG: 5,
    TRACE: 6,
  } as const,
} as const;
```

### Phase 2: 機能統合（Week 3-4）

**目標**: 重複機能の統合

#### 2.1 @esta-config パッケージ作成

```typescript
// 全設定処理の統合
export class UniversalConfigLoader<T> {
  constructor(private schema: ValidationSchema<T>) {}

  // config-loaderの機能
  async load(path?: string): Promise<Result<T, ConfigError>>;
  async search(options?: SearchOptions): Promise<Result<T, ConfigError>>;

  // tools-configの機能
  async loadTools(path?: string): Promise<Result<ToolsConfig, ConfigError>>;

  // esta-configの機能
  async loadEsta(path?: string): Promise<Result<EstaConfig, ConfigError>>;

  // 統合機能
  merge(...configs: Array<Partial<T> | string>): Promise<Result<T, ConfigError>>;
  validate(config: unknown): Result<T, ValidationError>;
}

// 移行元パッケージ
// - @esta-utils/config-loader (全体)
// - @esta-core/tools-config/core/config/
// - @esta-core/esta-config/configLoader.ts
```

#### 2.2 @esta-validation パッケージ作成

```typescript
// バリデーション・正規化統合
export class UniversalValidator<T> {
  constructor(private schema: ValidationSchema<T>) {}
  
  validate(input: unknown): Result<T, ValidationError>;
  normalize(input: Partial<T>): Result<T, NormalizationError>;
  sanitize(input: unknown): Result<T, SanitizationError>;
}

// 正規化関数群
export const normalizers = {
  path: (input: string | undefined | null): string,
  logLevel: (input: string | number | undefined): number,
  url: (input: string): string,
  semver: (input: string): string,
};

// 移行元パッケージ
// - @esta-core/tools-config/tools-validator/
// - @esta-core/esta-config/validators/
// - @esta-core/esta-config/utils/normalizeConfig.ts
```

#### 2.3 @esta-path-utils & @esta-fs-utils パッケージ作成

```typescript
// パス操作統合
export class PathManager {
  normalize(path: string): string;
  resolve(...segments: string[]): string;
  isAbsolute(path: string): boolean;
  relative(from: string, to: string): string;
  areEqual(path1: string, path2: string): boolean;
}

// ファイル操作統合（ランタイム抽象化）
export class FileSystemManager {
  constructor(private runtime: RuntimeAdapter) {}

  async readText(path: string): Promise<Result<string, FileError>>;
  async writeText(path: string, content: string): Promise<Result<void, FileError>>;
  async exists(path: string): Promise<Result<boolean, FileError>>;
  async mkdir(path: string): Promise<Result<void, FileError>>;
}

// 移行元パッケージ
// - @esta-core/tools-config/utils/pathUtils.ts
// - @esta-core/esta-config/utils/pathNormalize.ts
// - @agla-e2e/fileio-framework/utils/agE2eFileIoUtils.ts
// - @esta-actions/tools-installer/utils/prepareInstallDirectory.ts
```

### Phase 3: アプリケーション統合（Week 5-6）

**目標**: 高レベル機能の統合

#### 3.1 @esta-tools/installer 統合

```typescript
// ツールインストーラー統合
export class UniversalInstaller {
  constructor(
    private runtime: RuntimeAdapter,
    private config: ConfigManager,
    private logger: Logger,
  ) {}

  async install(config: ToolConfig): Promise<Result<InstallInfo, InstallError>>;
  async installMultiple(configs: ToolConfig[]): Promise<Result<InstallInfo[], InstallError>>;
  async detect(toolName: string): Promise<Result<ToolInfo | null, DetectionError>>;
  async verify(toolName: string): Promise<Result<VerificationInfo, VerificationError>>;
}

// 移行元パッケージ
// - @esta-actions/tools-installer (全体)
// - @esta-core/tools-config (設定部分)
```

#### 3.2 @esta-tools/command 統合

```typescript
// コマンド実行統合
export class CommandRunner {
  constructor(private runtime: RuntimeAdapter) {}

  async exists(command: string): Promise<Result<boolean, CommandError>>;
  async run(command: string, args?: string[]): Promise<Result<CommandOutput, CommandError>>;
  async sequence(commands: CommandSpec[]): Promise<Result<CommandOutput[], CommandError>>;
}

// 移行元パッケージ
// - @esta-utils/command-runner
```

### Phase 4: 統合レイヤー作成（Week 7）

**目標**: エンドユーザー向け統合パッケージ

#### 4.1 @esta-cli パッケージ作成

```typescript
// CLI開発者向け完全統合
export * from '@esta-config';
export * from '@esta-error-result';
export * from '@esta-fs-utils';
export * from '@esta-path-utils';
export * from '@esta-runtime';
export * from '@esta-tools/command';
export * from '@esta-tools/installer';
export * from '@esta-validation';

// 高レベルAPI
export function createCLI(options: CLIOptions): CLIBuilder;
export function createConfig<T>(schema: Schema<T>): ConfigManager<T>;
export function createInstaller(options?: InstallerOptions): UniversalInstaller;
```

#### 4.2 @esta-github-actions パッケージ作成

```typescript
// GitHub Actions開発者向け特化
export * from '@esta-runtime';
export * from '@esta-tools/installer';

// GitHub Actions専用API
export function createAction(handler: ActionHandler): void;
export function getInputs<T>(schema: Schema<T>): T;
export function setOutputs(outputs: Record<string, string>): void;
export const logger = createGitHubActionsLogger();
```

### Phase 5: クリーンアップ（Week 8）

**目標**: 旧パッケージの廃止と最終調整

#### 5.1 依存関係の更新

```json
// 各パッケージのpackage.json更新
{
  "dependencies": {
    // 旧依存関係削除
    "@esta-utils/config-loader": "DELETE",
    "@esta-core/tools-config": "DELETE",

    // 新依存関係追加
    "@esta-config": "workspace:^",
    "@esta-validation": "workspace:^"
  }
}
```

#### 5.2 旧パッケージの段階廃止

```bash
# 段階的削除
packages/@esta-utils/config-loader/ → DEPRECATED
packages/@esta-core/tools-config/ → DEPRECATED
packages/@esta-core/esta-config/ → DEPRECATED

# 保持パッケージ
packages/@esta-core/error-handler/ → KEEP
packages/@esta-system/exit-status/ → KEEP
packages/@agla-*/ → KEEP (独立予定)
```

## 重要な設計決定 (Key Design Decisions)

### 1. errorResultパッケージの導入

**決定**: @esta-error-result パッケージで Result<T, E>パターンを導入

**理由**:

- 現在のエラーハンドリング不統一（boolean, null, throw, errorExit）を解決
- 型安全なエラーハンドリング
- デバッグ情報の保持

**影響**:

- 新パッケージは最初からResult<T, E>採用
- 既存パッケージは段階的移行
- 互換性レイヤーで破壊的変更を回避

### 2. フラット化アーキテクチャ

**決定**: `@esta-foundation/config` → `@esta-config` にフラット化

**理由**:

- 既存スクリプト（sync-configs.sh）の互換性保持
- ディレクトリ階層を2層に維持
- パッケージ発見の容易性

**影響**:

- スクリプト改修不要
- 段階的移行が可能
- パッケージ名が長くなる可能性

### 3. ランタイム抽象化の統合

**決定**: @esta-runtime パッケージで全ランタイム機能統合

**理由**:

- Node.js/Deno/Bun/GitHub Actions対応
- 機能の重複削減（fs, process, path）
- 一貫したAPI提供

**影響**:

- 新しい学習コストが発生
- パフォーマンス最適化の機会
- 将来の拡張性確保

### 4. @agla系パッケージの独立保持

**決定**: @agla-*パッケージは独立を保持

**理由**:

- 将来の独立プロジェクト化予定
- 明確な責任境界の維持
- リストラクチャリングの影響範囲限定

**影響**:

- 依存関係は最小限に制限
- インターフェースの安定性重視
- 独立した開発サイクルが可能

## 実装チェックリスト (Implementation Checklist)

### Phase 1: 基盤構築

- [ ] **@esta-error-result パッケージ作成**
  - [ ] Result<T, E>型定義とユーティリティ
  - [ ] 既存パターンとの相互運用関数
  - [ ] 包括的な単体テスト
  - [ ] 使用例ドキュメント

- [ ] **@esta-runtime パッケージ作成**
  - [ ] ランタイム検出機能
  - [ ] Node.js/Deno/Bun/GitHub Actions アダプター
  - [ ] 統一されたAPI インターフェース
  - [ ] クロスプラットフォームテスト

- [ ] **@shared パッケージ拡張**
  - [ ] 型定義の大幅拡張
  - [ ] 定数の体系化
  - [ ] 重複排除の確認
  - [ ] 循環依存チェック

### Phase 2: 機能統合

- [ ] **@esta-config パッケージ作成**
  - [ ] UniversalConfigLoader実装
  - [ ] 既存3パッケージからの機能移行
  - [ ] Result<T, E>パターン適用
  - [ ] 統合テストの実装

- [ ] **@esta-validation パッケージ作成**
  - [ ] UniversalValidator実装
  - [ ] 正規化関数群の統合
  - [ ] Valibot統合の最適化
  - [ ] バリデーションテストの包括化

- [ ] **@esta-path-utils & @esta-fs-utils パッケージ作成**
  - [ ] PathManager実装
  - [ ] FileSystemManager実装
  - [ ] クロスプラットフォーム対応
  - [ ] パフォーマンステスト

### Phase 3: アプリケーション統合

- [ ] **@esta-tools/installer 統合**
  - [ ] UniversalInstaller実装
  - [ ] Result<T, E>による改善されたエラーハンドリング
  - [ ] 複数インストーラータイプ対応
  - [ ] GitHub Actions統合テスト

- [ ] **@esta-tools/command 統合**
  - [ ] CommandRunner実装
  - [ ] Result<T, E>による詳細エラー情報
  - [ ] クロスプラットフォーム対応
  - [ ] パフォーマンス最適化

### Phase 4: 統合レイヤー

- [ ] **@esta-cli パッケージ作成**
  - [ ] 全機能の統合インターフェース
  - [ ] 高レベルAPI設計
  - [ ] CLI開発者向けドキュメント
  - [ ] 包括的なサンプル

- [ ] **@esta-github-actions パッケージ作成**
  - [ ] GitHub Actions特化API
  - [ ] Action開発者向けユーティリティ
  - [ ] セキュリティ考慮事項
  - [ ] Action テンプレート

### Phase 5: クリーンアップ

- [ ] **依存関係の更新**
  - [ ] 全package.jsonの依存関係更新
  - [ ] workspace:プロトコルの確認
  - [ ] 循環依存の最終チェック
  - [ ] ビルド順序の最適化

- [ ] **テストとドキュメント**
  - [ ] 全パッケージのテスト実行
  - [ ] 統合テストの更新
  - [ ] ドキュメントの更新
  - [ ] 移行ガイドの作成

- [ ] **旧パッケージの廃止**
  - [ ] 廃止パッケージのマーク
  - [ ] 段階的削除スケジュール
  - [ ] 互換性レイヤーの提供
  - [ ] ユーザーへの移行案内

## 品質保証 (Quality Assurance)

### 自動化テスト戦略

```bash
# 各フェーズでの品質チェック
pnpm run test:unit          # 単体テスト
pnpm run test:integration   # 統合テスト
pnpm run test:e2e          # E2Eテスト
pnpm run test:gha          # GitHub Actions テスト

# コード品質チェック
pnpm run lint-all          # ESLint (基本 + 型)
pnpm run lint-all:types    # TypeScript ESLint
pnpm run check:types       # TypeScript 型チェック
pnpm run check:spells      # スペルチェック
pnpm run check:dprint      # フォーマットチェック

# 依存関係チェック
pnpm run check:deps        # 循環依存チェック
pnpm run check:size        # バンドルサイズチェック
```

### パフォーマンス確認

```bash
# ビルド時間の測定
time pnpm run build

# テスト実行時間の測定
time pnpm run test:all

# 起動時間の測定（各ランタイム）
time node -e "require('@esta-cli')"
time deno eval "import '@esta-cli'"
time bun -e "import '@esta-cli'"
```

### 互換性確認

```bash
# 既存コードとの互換性テスト
pnpm run test:compatibility

# ランタイム横断テスト
pnpm run test:cross-runtime

# GitHub Actions環境テスト
pnpm run test:gha
```

## リスク管理 (Risk Management)

### 高リスク項目

1. **循環依存の発生**
   - **対策**: 依存関係の階層化ルール、自動チェック
   - **検出**: madge, dependency-cruiserによる自動検出

2. **パフォーマンス劣化**
   - **対策**: ベンチマークテスト、段階的移行
   - **測定**: 定期的なパフォーマンステスト

3. **破壊的変更の影響**
   - **対策**: 互換性レイヤー、段階的廃止
   - **検証**: リハーサル環境での検証

### 中リスク項目

1. **学習コストの増大**
   - **対策**: 包括的ドキュメント、移行ガイド
   - **緩和**: 段階的導入、サンプルコード

2. **テスト不足による品質低下**
   - **対策**: テストカバレッジ向上、自動化
   - **検証**: 品質メトリクス監視

### 低リスク項目

1. **ドキュメントの不整合**
   - **対策**: 自動生成、定期更新
   - **管理**: ドキュメント更新チェックリスト

## 成功指標 (Success Metrics)

### 定量的指標

- **パッケージ数**: 27 → 16個（42%削減）
- **重複コード**: 40-50%削減
- **ビルド時間**: 現在の90%以下
- **テスト実行時間**: 現在の90%以下
- **バンドルサイズ**: パッケージあたり20%削減

### 定性的指標

- **開発者体験**: 統一されたAPI、一貫したエラーハンドリング
- **保守性**: 明確な責任境界、理解しやすいアーキテクチャ
- **拡張性**: ランタイム横断対応、将来機能の追加容易性
- **信頼性**: 型安全性向上、包括的なテスト

## 今後の発展 (Future Evolution)

### 短期的発展（3-6ヶ月）

- エラーメッセージの国際化
- パフォーマンス最適化
- 追加ランタイム対応（Cloudflare Workers等）

### 中期的発展（6-12ヶ月）

- npm公開準備
- エンタープライズ機能追加
- プラグインアーキテクチャ導入

### 長期的発展（1年以上）

- @agla系パッケージの独立
- コミュニティエコシステム構築
- 商用サポートオプション

---

## /kiro コマンド実行ガイド

このドキュメントは Claude Code の `/kiro` コマンドで段階的に実装できるよう設計されています。

### 使用方法

```bash
# Phase 1から順番に実行
/kiro "Phase 1: Create @esta-error-result package with Result<T,E> implementation"
/kiro "Phase 1: Create @esta-runtime package with cross-runtime abstraction"
/kiro "Phase 1: Expand @shared packages with comprehensive types and constants"

# 各フェーズ完了後に品質チェック
/kiro "Run quality checks: tests, linting, type checking"

# 次のフェーズに進行
/kiro "Phase 2: Create @esta-config package consolidating all config functionality"
# ... 以下、各フェーズを順次実行
```

### 実装のポイント

- 各フェーズは独立して実行可能
- 段階的な移行により既存システムへの影響を最小化
- 各ステップでの品質確認を必須とする
- 問題が発生した場合は前のフェーズに戻り修正

このドキュメントにより、ESTAシステムの完全なリストラクチャリングが体系的に実行できます。
