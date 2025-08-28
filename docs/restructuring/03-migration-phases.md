---
header:
  - src: docs/restructuring/03-migration-phases.md
  - @(#) : Phased migration plan and implementation strategy
title: 📈 段階的移行計画（03-migration-phases）
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

## 03. Migration Phases - 段階的移行計画

### 移行戦略概要

#### 基本方針

1. 段階的移行: リスクを最小化するため 4つのフェーズに分割
2. 後方互換性: 既存 API の段階的非推奨化
3. 品質保証: 各フェーズでの完全なテスト実行
4. 並行開発: 機能ブランチでの独立開発とマージ戦略

#### 破壊的変更の最小化

- import パスの段階更新: 即座の全置換を避け、deprecation warning 期間を設定
- API 互換レイヤー: 旧 API から新 API へのアダプター提供
- ロールバックポイント: 各フェーズでのコミットタグ設定

#### 品質保証戦略

- 自動テスト: 既存テストの 100%成功保証
- E2E テスト: 実際の使用シナリオでの動作確認
- パフォーマンステスト: 性能劣化の防止

### 📅 Phase 1: 基盤統合 (Priority: Critical)

<!-- markdownlint-disable no-duplicate-heading -->

#### 期間・工数見積もり

- 期間: 2-3週間
- 工数: 25-35人日
- リスクレベル: 🔴 高（全体に影響）

#### 1.1 @shared パッケージ統合

- 目標
  型・定数の単一起源化による重複削除

- 作業内容
  Step 1: 統一型定義作成

  ```bash
  # 作業ディレクトリ
  shared/packages/types/

  # 新規作成ファイル
  - types/LogLevel.types.ts   # 統一LogLevel型
  - types/Platform.types.ts   # 統一Platform型
  - types/Runtime.types.ts    # 統一Runtime型
  - types/Result.types.ts     # Result<T,E>型
  - types/ErrorTypes.types.ts # エラー型階層
  - index.ts                  # 統一エクスポート
  ```

  - 実装例:

  ```typescript
  // types/LogLevel.ts
  export enum LogLevel {
    VERBOSE = -99,
    OFF = 0,
    FATAL = 1,
    ERROR = 2,
    ARN = 3,
    INFO = 4,
    DEBUG = 5,
    TRACE = 6,
    LOG = 10,
    DEFAULT = -99,
  }
  ```

  **Step 2: 統一定数作成**

  ```bash
  # 作業ディレクトリ
  shared/packages/constants/

  # 新規作成ファイル
  - constants/ExitCodes.ts    # 統一終了コード
  - constants/Defaults.ts     # デフォルト設定値
  - constants/Directories.ts  # ディレクトリパス
  - index.ts                  # 統一エクスポート
  ```

  **Step 3: 既存パッケージのimport更新**

  ```typescript
  // Before
  import { AgLogLevel } from '@agla-utils/ag-logger/shared/types';

  // After
  import { LogLevel as AgLogLevel } from '@shared/types';
  ```

#### ✅ 完了条件

- [ ] 全重複型・定数が@shared 配下に統合
- [ ] 既存パッケージの import 文がすべて更新済み
- [ ] 全テストが成功
- [ ] 型チェックエラー 0件

#### 📊 影響パッケージ

- @agla-utils/ag-logger (LogLevel)
- @esta-core/tools-config (LogLevel)
- @esta-utils/get-platform (Platform)
- @esta-core/error-handler (ExitCode)
- @esta-system/exit-status (ExitCode)

### 1.2 @esta-core/esta-error 統一エラーハンドリング

- 目標
  Result<T,E>パターンによるエラーハンドリング統一

- 作業内容
  **Step 1: Result型基盤実装**

  ```typescript
  // packages/@esta-core/esta-error/src/Result.ts
  export type Result<T, E = Error> = Ok<T> | Err<E>;

  export interface Ok<T> {
    readonly ok: true;
    readonly value: T;
  }

  export interface Err<E> {
    readonly ok: false;
    readonly error: E;
  }

  export class ResultUtils {
    static ok<T>(value: T): Ok<T> {
      return { ok: true, value };
    }

    static err<E>(error: E): Err<E> {
      return { ok: false, error };
    }

    static isOk<T, E>(result: Result<T, E>): result is Ok<T> {
      return result.ok;
    }

    static isErr<T, E>(result: Result<T, E>): result is Err<E> {
      return !result.ok;
    }
  }
  ```

  **Step 2: エラー階層実装**

  ```typescript
  // packages/@esta-core/esta-error/src/EstaError.ts
  export abstract class EstaError extends Error {
    abstract readonly code: string;
    abstract readonly context: Record<string, unknown>;

    constructor(
      message: string,
      public readonly severity: ErrorSeverity = ErrorSeverity.ERROR,
    ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace?.(this, this.constructor);
    }
  }

  export class ConfigError extends EstaError {
    readonly code = 'CONFIG_ERROR';

    constructor(
      message: string,
      public readonly context: {
        filePath?: string;
        lineNumber?: number;
        field?: string;
      } = {},
    ) {
      super(message);
    }
  }
  ```

  **Step 3: 既存パッケージのResult型移行**

  優先順位付きの移行:

  1. @esta-utils/config-loader: null 返却 → Result 型
  2. @esta-utils/command-runner: boolean 返却 → Result 型
  3. @esta-utils/get-platform: throw → Result 型
  4. @esta-core/tools-config: 複数パターン → Result 型統一

#### ✅ 完了条件

- [ ] Result<T,E>型とヘルパー関数実装完了
- [ ] EstaError クラス階層実装完了
- [ ] 4つの優先パッケージの Result 型移行完了
- [ ] 全テストが成功（既存 + Result 型テスト）
- [ ] エラーハンドリング統一度 80%達成

#### 📊 移行対象API例

```typescript
// Before
function loadConfig(path: string): Config | null;
function commandExists(cmd: string): boolean;
function getPlatform(): Platform; // throws

// After
function loadConfig(path: string): Promise<Result<Config, ConfigError>>;
function commandExists(cmd: string): Promise<Result<boolean, CommandError>>;
function getPlatform(): Result<Platform, PlatformError>;
```

#### 1.3 @esta-core/tools-config 完成

- 目標
  80%実装済みの tools-config の完成と CLI/GHA 両対応

- 作業内容
  **Step 1: 残り機能の実装**

  - logLevel 統合（@shared/types の LogLevel 使用）
  - pathNormalize 統合
  - GHA 環境での動作最適化

  **Step 2: テストカバレージ90%達成**

  - エッジケース追加テスト
  - エラーパス網羅テスト
  - 統合テスト追加

  **Step 3: CLI/GHA抽象化レイヤー**

  ```typescript
  // packages/@esta-core/tools-config/src/ConfigManager.ts
  export abstract class ConfigManager {
    abstract loadConfig(source: string): Promise<Result<ToolConfig[], ConfigError>>;
    abstract validateConfig(config: ToolConfig[]): Result<void, ValidationError>;
    abstract mergeConfigs(base: ToolConfig[], override: ToolConfig[]): Result<ToolConfig[], MergeError>;
  }

  export class CLIConfigManager extends ConfigManager {
    // CLI固有の実装
  }

  export class GHAConfigManager extends ConfigManager {
    // GitHub Actions固有の実装
  }
  ```

  - 完了条件

  - [ ] logLevel, pathNormalize 統合完了
  - [ ] テストカバレージ 90%達成
  - [ ] CLI/GHA 両環境での動作確認
  - [ ] 既存の tools-config 使用箇所の動作確認
  - [ ] パフォーマンス劣化なし

### 📅 Phase 2: システムレイヤー統合 (Priority: High)

#### 期間・工数見積もり

- 期間: 2-3週間
- 工数: 20-30人日
- リスクレベル: 🟡 中（環境依存機能）

#### 2.1 @esta-system/runtime 強化

- 目標
  Node/Deno/Bun/GHA 完全対応の実行環境判定

- 作業内容
  **Step 1: 既存runtime機能の拡張**

  ```typescript
  // packages/@esta-system/runtime/src/RuntimeDetector.ts
  export class RuntimeDetector {
    static detect(): RuntimeInfo {
      return {
        runtime: this.detectRuntime(),
        version: this.detectVersion(),
        isGitHubActions: this.isGitHubActions(),
        capabilities: this.detectCapabilities(),
      };
    }

    private static detectRuntime(): Runtime {
      // より精密な判定ロジック
      if (typeof Deno !== 'undefined') { return Runtime.DENO; }
      if (typeof Bun !== 'undefined') { return Runtime.BUN; }
      if (typeof process !== 'undefined') {
        if (process.env.GITHUB_ACTIONS) { return Runtime.GITHUB_ACTIONS; }
        return Runtime.NODE;
      }
      throw new Error('Unknown runtime');
    }
  }
  ```

  **Step 2: 機能フラグシステム**

  ```typescript
  // packages/@esta-system/runtime/src/FeatureFlags.ts
  export class RuntimeFeatureFlags {
    static hasChildProcess(runtime: Runtime): boolean {
      return runtime === Runtime.NODE || runtime === Runtime.GITHUB_ACTIONS;
    }

    static hasNodeModules(runtime: Runtime): boolean {
      return runtime !== Runtime.DENO; // Denoは npm: prefix必要
    }

    static hasWebAPIs(runtime: Runtime): boolean {
      return runtime === Runtime.DENO || runtime === Runtime.BUN;
    }
  }
  ```

#### 完了条件

- [ ] 4つのランタイムの正確な判定
- [ ] 機能フラグによる差異の抽象化
- [ ] 各ランタイムでのテスト実行成功
- [ ] GitHub Actions 環境での判定精度向上

### 2.2 @esta-system/platform 新規作成

- 目標
  @esta-utils/get-platform の機能移行と OS/アーキテクチャ判定統合

- 作業内容
  **Step 1: get-platform機能の移行**

  ```bash
  # 移行元
  packages/@esta-utils/get-platform/

  # 移行先
  packages/@esta-system/platform/
  ```

  **Step 2: 機能拡張**

  ```typescript
  // packages/@esta-system/platform/src/PlatformDetector.ts
  export class PlatformDetector {
    static detect(): PlatformInfo {
      return {
        platform: this.detectPlatform(),
        arch: this.detectArchitecture(),
        shell: this.detectShell(),
        pathSeparator: this.getPathSeparator(),
        executableExtension: this.getExecutableExtension(),
      };
    }

    private static detectShell(): Shell {
      // シェル判定ロジック
    }
  }
  ```

#### ✅ 完了条件

- [ ] get-platform の完全移行
- [ ] シェル判定機能の追加
- [ ] 実行ファイル拡張子判定の追加
- [ ] 全プラットフォームでのテスト成功

### 2.3 @esta-system/shell 新規作成

- 目標
  シェル処理・パス展開・引数クォート処理の統合

- 作業内容
  **Step 1: シェル差異の抽象化**

  ```typescript
  // packages/@esta-system/shell/src/ShellAdapter.ts
  export abstract class ShellAdapter {
    abstract quoteArg(arg: string): string;
    abstract expandPath(path: string): Result<string, PathError>;
    abstract getExecutablePaths(): string[];
    abstract buildCommandLine(command: string, args: string[]): string;
  }

  export class PowerShellAdapter extends ShellAdapter {
    quoteArg(arg: string): string {
      // PowerShell特有のクォート処理
      return `'${arg.replace(/'/g, "''")}'`;
    }
  }

  export class BashAdapter extends ShellAdapter {
    quoteArg(arg: string): string {
      // Bash特有のクォート処理
      return `'${arg.replace(/'/g, "'\\''")}'`;
    }
  }
  ```

  **Step 2: パス展開処理**

  ```typescript
  // packages/@esta-system/shell/src/PathUtils.ts
  export class PathUtils {
    static expandPath(path: string, shell: Shell): Result<string, PathError> {
      // 環境変数展開
      // ホームディレクトリ展開（~/）
      // 相対パス解決
    }

    static normalizePath(path: string, platform: Platform): string {
      // プラットフォーム固有のパス正規化
    }
  }
  ```

#### ✅ 完了条件

- [ ] 主要シェル（PowerShell, Bash, Cmd）のアダプター実装
- [ ] 引数クォート処理の正確性確認
- [ ] パス展開機能の実装と検証
- [ ] コマンドライン構築機能の実装

## 📅 Phase 3: ユーティリティ整理 (Priority: Medium)

### 期間・工数見積もり

- 期間: 3-4週間
- 工数: 30-40人日
- リスクレベル: 🟡 中 (破壊的変更あり)

### 3.1 @esta-utils 統合パッケージ

- 目標
  command-runner, config-loader の統合と API 統一

- 作業内容
  **Step 1: パッケージ統合準備**

  ```bash
  # 新構成
  packages/@esta-utils/
  ├── command-runner/     # 既存パッケージ保持
  ├── config-loader/      # 既存パッケージ保持
  └── index.ts           # 統一エクスポート
  ```

  **Step 2: API統一化**

  ```typescript
  // packages/@esta-utils/index.ts
  export { CommandRunner } from './command-runner';
  export { ConfigLoader } from './config-loader';
  export type { CommandOptions, LoadOptions } from './types';
  ```

  **Step 3: 新機能追加**

  - file-utils: ファイルシステム抽象化
  - string-utils: 文字列処理ユーティリティ

#### ✅ 完了条件

- [ ] 既存 2パッケージの機能保持
- [ ] 統一 API によるアクセス可能
- [ ] 新規ユーティリティの追加
- [ ] Result<T,E>型への完全移行

### 3.2 @agla-utils → @esta-utils 移行 (MockLoggerリファクタリング含む)

- 目標
  名前空間統一と MockLogger リファクタリングの統合実施

- 作業内容
  **Step 1: MockLoggerリファクタリング実装**
  *(既存計画の統合)*

  **Phase 3.2.1: LogBufferManager実装**
  - t-wada 式 BDD による厳格な TDD 実装
  - バッファ管理ロジックの関数型化
  - オーバーフローエラー検出機能

  ```typescript
  // packages/@agla-utils/ag-logger/src/core/LogBufferManager.ts
  export class LogBufferManager {
    private buffers: Map<AgLogLevel, string[]> = new Map();
    private readonly MAX_BUFFER_SIZE = 1000;

    addMessage(level: AgLogLevel, message: string): Result<void, MockLoggerResourceError> {
      const buffer = this.buffers.get(level) || [];

      if (buffer.length >= this.MAX_BUFFER_SIZE) {
        return ResultUtils.err(
          new MockLoggerResourceError(
            `Buffer overflow: level ${level} exceeded ${this.MAX_BUFFER_SIZE} messages`,
            { level, bufferSize: buffer.length, maxSize: this.MAX_BUFFER_SIZE },
          ),
        );
      }

      buffer.push(message);
      this.buffers.set(level, buffer);
      return ResultUtils.ok(undefined);
    }

    getMessages(level: AgLogLevel): string[] {
      return [...(this.buffers.get(level) || [])]; // 防御的コピー
    }
  }
  ```

  **Phase 3.2.2: MockLogger委譲構造化**

  ```typescript
  // packages/@agla-utils/ag-logger/src/plugins/logger/MockLogger.ts
  export class MockLogger {
    private bufferManager: LogBufferManager;

    constructor() {
      this.bufferManager = new LogBufferManager();
    }

    fatal(message: string): void {
      const result = this.bufferManager.addMessage(AG_LOGLEVEL.FATAL, message);
      if (!result.ok) {
        throw result.error;
      }
    }

    // 他のログレベルメソッドも同様に委譲
    getMessages(level: AgLogLevel): string[] {
      return this.bufferManager.getMessages(level);
    }

    cleanup(): void {
      this.bufferManager.cleanup();
    }
  }
  ```

  **Phase 3.2.3: E2eMockLogger再設計**

  ```typescript
  // packages/@agla-utils/ag-logger/src/plugins/logger/E2eMockLogger.ts
  export class E2eMockLogger {
    private static testBuffers: Map<string, LogBufferManager> = new Map();
    private testId: string;

    constructor(testId: string) {
      this.testId = this.validateTestId(testId);
      this.initializeTestBuffer();
    }

    private initializeTestBuffer(): void {
      if (!E2eMockLogger.testBuffers.has(this.testId)) {
        E2eMockLogger.testBuffers.set(this.testId, new LogBufferManager());
      }
    }

    fatal(message: string): void {
      const manager = this.getBufferManager();
      const result = manager.addMessage(AG_LOGLEVEL.FATAL, message);
      if (!result.ok) {
        throw result.error;
      }
    }

    cleanup(): void {
      E2eMockLogger.testBuffers.delete(this.testId);
    }

    static cleanupAll(): void {
      E2eMockLogger.testBuffers.clear();
    }
  }
  ```

  **Step 2: 名前空間移行**

  ```bash
  # 移行作業
  packages/@agla-utils/ag-logger/
      ↓
  packages/@esta-utils/logger/
  ```

  **Step 3: import文の一括更新**

  ```typescript
  // Before
  import { AgLogger } from '@agla-utils/ag-logger';

  // After
  import { AgLogger } from '@esta-utils/logger';
  ```

#### ✅ 完了条件

- [ ] MockLogger リファクタリング完全実装
- [ ] LogBufferManager 実装と全テスト成功
- [ ] E2eMockLogger 再設計と並列テスト対応
- [ ] @esta-utils/logger への完全移行
- [ ] 全パッケージの import 更新完了
- [ ] 後方互換性の確保（deprecated warning 実装）

#### 🧪 AgLoggerリファクタリング詳細タスク

1. Phase 3.2.1.1: エラーメッセージ定数実装 (1日)
2. Phase 3.2.1.2: ベースエラークラス実装 (1日)
3. Phase 3.2.1.3: 専用エラークラス実装 (1日)
4. Phase 3.2.1.4: 検証ユーティリティ実装 (1日)
5. Phase 3.2.2.1: LogBufferManager 基本構造 (1日)
6. Phase 3.2.2.2: メッセージ追加機能 (1日)
7. Phase 3.2.2.3: メッセージ取得機能 (1日)
8. Phase 3.2.2.4: 検索機能 (1日)
9. Phase 3.2.2.5: バッファ管理機能 (1日)
10. Phase 3.2.3.1: MockLogger 委譲構造 (2日)
11. Phase 3.2.3.2: E2eMockLogger 再設計 (3日)
12. Phase 3.2.4: 統合テスト・互換性確認 (2日)

**各タスクの品質要件:

- 失敗するテストから開始 (RED)
- 最小実装でテスト成功 (GREEN)
- 必ずリファクタリング実施 (REFACTOR)
- 1タスク完全完了後に次へ進行

### 📅 Phase 4: アクション・統合 (Priority: Medium)

#### 期間・工数見積もり

- 期間: 1-2週間
- 工数: 10-15人日
- リスクレベル: 🟢 低（独立性が高い）

#### 4.1 @esta-actions/tools-installer 拡張

- 目標
  新アーキテクチャとの統合と機能拡張

- 作業内容
  **Step 1: 新依存関係への移行**

  ```typescript
  // packages/@esta-actions/tools-installer/src/ToolsInstaller.ts
  import { Result } from '@esta-core/esta-error';
  import { ConfigManager } from '@esta-core/tools-config';
  import { CommandRunner } from '@esta-utils/command-runner';
  import { Logger } from '@esta-utils/logger';

  export class ToolsInstaller {
    constructor(
      private configManager: ConfigManager,
      private commandRunner: CommandRunner,
      private logger: Logger,
    ) {}

    async install(options: InstallOptions): Promise<Result<InstallResult[], InstallError>> {
      // 統一されたエラーハンドリング
    }
  }
  ```

  **Step 2: 複数インストーラー対応**

  ```typescript
  // packages/@esta-actions/tools-installer/src/installers/
  export abstract class Installer {
    abstract install(config: ToolConfig): Promise<Result<InstallResult, InstallError>>;
  }

  export class EgetInstaller extends Installer {}
  export class ScriptInstaller extends Installer {}
  export class CargoInstaller extends Installer {} // 新規追加
  ```

#### ✅ 完了条件

- [ ] 新アーキテクチャとの統合完了
- [ ] Result<T,E>型への移行完了
- [ ] 複数インストーラー対応
- [ ] GitHub Actions 環境での動作確認

### 🔄 移行実行戦略

#### 並行開発戦略

#### ブランチ戦略

```bash
main
├── phase/1-foundation    # Phase 1実装ブランチ
├── phase/2-system        # Phase 2実装ブランチ
├── phase/3-utils         # Phase 3実装ブランチ
└── phase/4-actions       # Phase 4実装ブランチ
```

#### マージ戦略

- Feature Branch: 各フェーズで機能ブランチ作成
- Pull Request: コードレビューと CI/CD チェック必須
- Squash Merge: 履歴整理のための Squash マージ
- Tag Release: 各フェーズ完了時のタグ付け

### 品質ゲート

#### 各フェーズ完了要件

```bash
# 必須チェック
✅ pnpm run build              # ビルド成功
✅ pnpm run check:types        # 型チェック成功
✅ pnpm run lint-all:types     # TypeScript linting成功
✅ pnpm run test:develop       # ユニットテスト成功
✅ pnpm run test:ci           # 統合テスト成功
✅ pnpm run check:spells       # スペルチェック成功
✅ pnpm run check:dprint       # フォーマット確認成功

# 追加チェック
✅ 既存機能の後方互換性確認
✅ パフォーマンス劣化なし
✅ セキュリティスキャン成功
```

#### ロールバック条件

- 重要機能の破壊的変更発生
- パフォーマンス 20%以上劣化
- セキュリティ脆弱性発見
- テストカバレージ 10%以上低下

### リスク軽減措置

#### 破壊的変更対策

1. deprecation 警告: 3ヶ月前の事前通知
2. 移行ツール: 自動 import 更新スクリプト提供
3. 共存期間: 新旧 API 同時サポート期間設定
4. 移行ガイド: 詳細な移行手順書作成

#### テスト戦略

1. 既存テスト保護: 100%の既存テスト成功維持
2. 新規テスト追加: 新機能の 90%テストカバレージ
3. E2E テスト: 実際の使用シナリオでの検証
4. パフォーマンステスト: ベースライン比較

#### 監視・ロールバック

1. メトリクス監視: ビルド時間、テスト時間、バンドルサイズ
2. エラー監視: 新規エラーパターンの検出
3. ロールバック計画: 各フェーズでの即座復旧手順
4. 影響度評価: 変更による影響範囲の継続評価

---

この段階的移行計画により、リスクを最小化しながら目標アーキテクチャへの確実な移行を実現します。次章では、各フェーズの具体的な実装ガイドラインを詳説します。
