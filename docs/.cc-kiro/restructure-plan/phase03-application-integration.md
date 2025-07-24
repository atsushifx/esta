---
title: Phase 3 - アプリケーション統合
description: アプリケーションレイヤーの統合とGitHub Actions機能の強化
sidebar_position: 3
---

> **Note**: このフェーズの実装では **t-wad式TDD（Test-Driven Development）** を採用します。テストファーストで実装を進め、品質と設計の確実性を保証します。

# Phase 3: アクション・システムパッケージ整理 - 詳細設計書

**Version**: 1.0\
**Date**: 2025-01-24\
**Phase**: 3 (Week 5-6)\
**Status**: Design Complete - Ready for Implementation

## 概要

Phase 3では、アプリケーションレイヤーの統合を行い、GitHub Actions機能とシステムレベル機能の強化・整理を実施します。

### 目標

- **@esta-tools/installer**: 統合ツールインストーラーの完成
- **@esta-tools/command**: 統合コマンドランナーの完成
- **@esta-actions**: GitHub Actions機能の強化
- **@esta-system**: システムレベル機能の拡張

### 前提条件

- Phase 1完了: `@esta-error-result`, `@esta-runtime`, `@shared/*` 拡張
- Phase 2完了: `@esta-config`, `@esta-validation`, `@esta-path-utils`, `@esta-fs-utils`

## 3.1 @esta-tools/installer パッケージ設計

### パッケージ構成

```
packages/@esta-tools/installer/
├── src/
│   ├── index.ts                    # 公開API
│   ├── core/
│   │   ├── UniversalInstaller.ts   # メインインストーラークラス
│   │   ├── InstallerRegistry.ts    # インストーラー登録管理
│   │   └── InstallationContext.ts  # インストール文脈管理
│   ├── installers/
│   │   ├── EgetInstaller.ts        # egetベースインストーラー
│   │   ├── NpmInstaller.ts         # npmベースインストーラー
│   │   ├── ScriptInstaller.ts      # スクリプトベースインストーラー
│   │   ├── GitHubInstaller.ts      # GitHub Releasesインストーラー
│   │   └── BaseInstaller.ts        # インストーラー基底クラス
│   ├── detectors/
│   │   ├── ToolDetector.ts         # ツール検出エンジン
│   │   ├── VersionDetector.ts      # バージョン検出
│   │   └── PathDetector.ts         # インストールパス検出
│   ├── verifiers/
│   │   ├── InstallationVerifier.ts # インストール検証
│   │   ├── HealthChecker.ts        # ヘルスチェック
│   │   └── VersionVerifier.ts      # バージョン検証
│   └── types/
│       ├── installer.ts            # インストーラー型定義
│       ├── tool.ts                 # ツール関連型定義
│       └── verification.ts         # 検証関連型定義
├── tests/
│   ├── e2e/
│   │   ├── installer.e2e.spec.ts
│   │   └── github-actions.e2e.spec.ts
│   └── unit/
│       ├── core/
│       ├── installers/
│       ├── detectors/
│       └── verifiers/
└── package.json
```

### 核心クラス設計

#### UniversalInstaller クラス

```typescript
import { UniversalConfigLoader } from '@esta-config';
import { err, ok, Result } from '@esta-error-result';
import { FileSystemManager } from '@esta-fs-utils';
import { PathManager } from '@esta-path-utils';
import { RuntimeAdapter } from '@esta-runtime';

export class UniversalInstaller {
  private readonly runtime: RuntimeAdapter;
  private readonly configLoader: UniversalConfigLoader<ToolsConfig>;
  private readonly pathManager: PathManager;
  private readonly fsManager: FileSystemManager;
  private readonly installerRegistry: InstallerRegistry;
  private readonly logger: Logger;

  constructor(options: UniversalInstallerOptions = {}) {
    this.runtime = options.runtime || createRuntime();
    this.configLoader = new UniversalConfigLoader(TOOLS_CONFIG_SCHEMA, {
      runtime: this.runtime,
    });
    this.pathManager = new PathManager();
    this.fsManager = new FileSystemManager(this.runtime);
    this.installerRegistry = new InstallerRegistry();
    this.logger = options.logger || createLogger('UniversalInstaller');

    // デフォルトインストーラーの登録
    this.registerDefaultInstallers();
  }

  /**
   * 単一ツールのインストール
   */
  async install(config: ToolConfig): Promise<Result<InstallInfo, InstallError>> {
    this.logger.info(`Installing tool: ${config.name}`);

    try {
      // 1. 設定の正規化とバリデーション
      const normalizedConfig = await this.normalizeToolConfig(config);
      if (normalizedConfig.isErr()) {
        return normalizedConfig;
      }

      // 2. インストール文脈の作成
      const context = await this.createInstallationContext(normalizedConfig.value);
      if (context.isErr()) {
        return context;
      }

      // 3. 既存インストールの検出
      const existingTool = await this.detectExistingTool(normalizedConfig.value);
      if (existingTool.isOk() && existingTool.value) {
        // 既存ツールが要件を満たしている場合はスキップ
        if (await this.isToolSatisfied(existingTool.value, normalizedConfig.value)) {
          this.logger.info(`Tool ${config.name} already satisfies requirements`);
          return ok({
            tool: config.name,
            version: existingTool.value.version,
            installedPath: existingTool.value.path,
            installer: 'existing',
            duration: 0,
            verified: true,
            skipped: true,
          });
        }
      }

      // 4. 適切なインストーラーの選択
      const installer = this.installerRegistry.getInstaller(normalizedConfig.value.installer);
      if (!installer) {
        return err({
          code: 'INSTALLER_NOT_FOUND',
          message: `Installer '${normalizedConfig.value.installer}' not found`,
          tool: config.name,
        });
      }

      // 5. インストール実行
      const startTime = Date.now();
      const installResult = await installer.install(normalizedConfig.value, context.value);
      if (installResult.isErr()) {
        return installResult;
      }

      const duration = Date.now() - startTime;

      // 6. インストール検証
      const verificationResult = await this.verifyInstallation(
        normalizedConfig.value,
        installResult.value,
      );
      if (verificationResult.isErr()) {
        // インストールは成功したが検証に失敗
        this.logger.warn(`Installation verification failed for ${config.name}`, verificationResult.error);
      }

      // 7. GitHub Actions環境でのPATH追加
      if (this.runtime.name === 'github-actions' && this.runtime.githubActions) {
        const binDir = this.pathManager.resolve(installResult.value.installedPath, 'bin');
        if (await this.fsManager.exists(binDir).then((r) => r.isOk() && r.value)) {
          this.runtime.githubActions.addPath(binDir);
        }
      }

      const installInfo: InstallInfo = {
        tool: config.name,
        version: installResult.value.version,
        installedPath: installResult.value.installedPath,
        installer: normalizedConfig.value.installer,
        duration,
        verified: verificationResult.isOk(),
        metadata: installResult.value.metadata,
      };

      this.logger.info(`Successfully installed ${config.name} v${installInfo.version} in ${duration}ms`);
      return ok(installInfo);
    } catch (error) {
      return err({
        code: 'INSTALLATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown installation error',
        tool: config.name,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * 複数ツールの一括インストール
   */
  async installMultiple(
    configs: ToolConfig[],
    options: MultiInstallOptions = {},
  ): Promise<Result<InstallInfo[], InstallError>> {
    this.logger.info(`Installing ${configs.length} tools`);

    const results: InstallInfo[] = [];
    const errors: InstallError[] = [];

    if (options.parallel) {
      // 並列インストール
      const promises = configs.map((config) => this.install(config));
      const settled = await Promise.allSettled(promises);

      for (let i = 0; i < settled.length; i++) {
        const result = settled[i];
        if (result.status === 'fulfilled') {
          if (result.value.isOk()) {
            results.push(result.value.value);
          } else {
            errors.push(result.value.error);
          }
        } else {
          errors.push({
            code: 'INSTALLATION_FAILED',
            message: result.reason?.message || 'Unknown error',
            tool: configs[i].name,
          });
        }
      }
    } else {
      // 順次インストール
      for (const config of configs) {
        const result = await this.install(config);
        if (result.isOk()) {
          results.push(result.value);
        } else {
          errors.push(result.error);
          if (options.stopOnError) {
            break;
          }
        }
      }
    }

    if (errors.length > 0 && options.stopOnError) {
      return err(errors[0]);
    }

    // 部分的成功も成功として扱う（エラー情報は結果に含める）
    return ok(results);
  }

  /**
   * ツールの検出
   */
  async detect(toolName: string): Promise<Result<ToolInfo | null, DetectionError>> {
    const detector = new ToolDetector(this.runtime, this.pathManager);
    return detector.detect(toolName);
  }

  /**
   * インストール済みツールの検証
   */
  async verify(toolName: string): Promise<Result<VerificationInfo, VerificationError>> {
    const verifier = new InstallationVerifier(this.runtime);
    return verifier.verify(toolName);
  }

  /**
   * 利用可能バージョンの一覧取得
   */
  async listVersions(
    toolName: string,
    installer?: InstallerType,
  ): Promise<Result<string[], VersionError>> {
    const resolvedInstaller = installer || await this.detectBestInstaller(toolName);
    const installerInstance = this.installerRegistry.getInstaller(resolvedInstaller);

    if (!installerInstance) {
      return err({
        code: 'INSTALLER_NOT_FOUND',
        message: `Installer '${resolvedInstaller}' not found`,
        tool: toolName,
      });
    }

    return installerInstance.listVersions(toolName);
  }

  /**
   * 最新バージョンの取得
   */
  async getLatestVersion(
    toolName: string,
    installer?: InstallerType,
  ): Promise<Result<string, VersionError>> {
    const versions = await this.listVersions(toolName, installer);
    if (versions.isErr()) {
      return versions;
    }

    const latest = this.selectLatestVersion(versions.value);
    if (!latest) {
      return err({
        code: 'NO_VERSIONS_FOUND',
        message: `No versions found for tool '${toolName}'`,
        tool: toolName,
      });
    }

    return ok(latest);
  }

  // プライベートメソッド...
}
```

### インストーラー基底クラス

```typescript
export abstract class BaseInstaller {
  protected readonly runtime: RuntimeAdapter;
  protected readonly pathManager: PathManager;
  protected readonly fsManager: FileSystemManager;
  protected readonly logger: Logger;

  constructor(
    runtime: RuntimeAdapter,
    pathManager: PathManager,
    fsManager: FileSystemManager,
    logger: Logger,
  ) {
    this.runtime = runtime;
    this.pathManager = pathManager;
    this.fsManager = fsManager;
    this.logger = logger;
  }

  /**
   * ツールのインストール
   */
  abstract install(
    config: NormalizedToolConfig,
    context: InstallationContext,
  ): Promise<Result<InstallResult, InstallError>>;

  /**
   * 利用可能バージョンの取得
   */
  abstract listVersions(toolName: string): Promise<Result<string[], VersionError>>;

  /**
   * このインストーラーがツールをサポートするかチェック
   */
  abstract supports(toolName: string): Promise<Result<boolean, Error>>;

  /**
   * インストール前の準備
   */
  protected async prepareInstallation(
    config: NormalizedToolConfig,
    context: InstallationContext,
  ): Promise<Result<void, InstallError>> {
    // インストールディレクトリの作成
    const installDir = context.installDir;
    const createDirResult = await this.fsManager.mkdir(installDir, { recursive: true });
    if (createDirResult.isErr()) {
      return err({
        code: 'DIRECTORY_CREATION_FAILED',
        message: `Failed to create install directory: ${installDir}`,
        tool: config.name,
        cause: createDirResult.error,
      });
    }

    return ok(undefined);
  }

  /**
   * インストール後のクリーンアップ
   */
  protected async cleanupInstallation(
    config: NormalizedToolConfig,
    context: InstallationContext,
    success: boolean,
  ): Promise<void> {
    if (!success && context.tempDir) {
      // 失敗時は一時ディレクトリを削除
      await this.fsManager.rmdir(context.tempDir, { recursive: true });
    }
  }
}
```

### 移行対象と統合戦略

#### 移行元パッケージ

1. **@esta-actions/tools-installer** (全体)
   - `src/core/HandleInstaller.ts` → `UniversalInstaller.ts`
   - `src/core/ToolConfigManager.ts` → 設定部分は `@esta-config` に移行
   - `src/executors/` → `installers/` に移行
   - `src/utils/prepareInstallDirectory.ts` → `@esta-fs-utils` に移行

2. **@esta-core/tools-config** (設定部分)
   - 設定ローダー機能は `@esta-config` に移行済み
   - バリデーション機能は `@esta-validation` に移行済み
   - ツール設定型定義は統合

#### 統合手順

1. **段階1**: 新パッケージの基盤作成
   ```bash
   mkdir -p packages/@esta-tools/installer/src/{core,installers,detectors,verifiers,types}
   ```

2. **段階2**: 既存機能の移行
   ```typescript
   // 既存のHandleInstallerから機能移行
   export class UniversalInstaller {
     // HandleInstaller.ts の機能を統合
     // + Result<T, E> パターン適用
     // + ランタイム抽象化適用
   }
   ```

3. **段階3**: インストーラーの個別実装
   ```typescript
   // EgetInstaller: 既存のEgetInitializer + EgetExecutorから移行
   // NpmInstaller: 新規実装
   // ScriptInstaller: 新規実装
   // GitHubInstaller: 新規実装
   ```

4. **段階4**: 互換性レイヤーの提供
   ```typescript
   // 旧APIとの互換性を保持
   export function createToolInstaller(config: LegacyConfig): UniversalInstaller {
     // 旧設定形式を新形式に変換
   }
   ```

## 3.2 @esta-tools/command パッケージ設計

### パッケージ構成

```
packages/@esta-tools/command/
├── src/
│   ├── index.ts                    # 公開API
│   ├── core/
│   │   ├── CommandRunner.ts        # メインコマンドランナー
│   │   ├── CommandRegistry.ts      # コマンド登録管理
│   │   └── ExecutionContext.ts     # 実行文脈管理
│   ├── executors/
│   │   ├── DirectExecutor.ts       # 直接実行
│   │   ├── ShellExecutor.ts        # シェル実行
│   │   ├── SpawnExecutor.ts        # 子プロセス実行
│   │   └── BaseExecutor.ts         # 実行器基底クラス
│   ├── detectors/
│   │   ├── CommandDetector.ts      # コマンド存在検出
│   │   ├── PathDetector.ts         # パス検出
│   │   └── VersionDetector.ts      # バージョン検出
│   ├── utils/
│   │   ├── OutputParser.ts         # 出力解析
│   │   ├── ErrorParser.ts          # エラー解析
│   │   └── TimeoutManager.ts       # タイムアウト管理
│   └── types/
│       ├── command.ts              # コマンド型定義
│       ├── execution.ts            # 実行関連型定義
│       └── output.ts               # 出力関連型定義
└── package.json
```

### 核心クラス設計

#### CommandRunner クラス

```typescript
import { err, ok, Result } from '@esta-error-result';
import { RuntimeAdapter } from '@esta-runtime';

export class CommandRunner {
  private readonly runtime: RuntimeAdapter;
  private readonly commandRegistry: CommandRegistry;
  private readonly logger: Logger;

  constructor(options: CommandRunnerOptions = {}) {
    this.runtime = options.runtime || createRuntime();
    this.commandRegistry = new CommandRegistry();
    this.logger = options.logger || createLogger('CommandRunner');
  }

  /**
   * コマンド存在確認（詳細エラー情報付き）
   */
  async exists(command: string): Promise<Result<boolean, CommandError>> {
    const detector = new CommandDetector(this.runtime);
    return detector.exists(command);
  }

  /**
   * コマンドパス取得
   */
  async which(command: string): Promise<Result<string | null, CommandError>> {
    const detector = new CommandDetector(this.runtime);
    return detector.which(command);
  }

  /**
   * コマンド実行
   */
  async run(
    command: string,
    args: string[] = [],
    options: RunOptions = {},
  ): Promise<Result<CommandOutput, CommandError>> {
    this.logger.debug(`Running command: ${command} ${args.join(' ')}`);

    try {
      // 1. 実行前チェック
      const preCheck = await this.preExecutionCheck(command, options);
      if (preCheck.isErr()) {
        return preCheck;
      }

      // 2. 実行器の選択
      const executor = this.selectExecutor(options);

      // 3. 実行文脈の作成
      const context = this.createExecutionContext(command, args, options);

      // 4. コマンド実行
      const startTime = Date.now();
      const result = await executor.execute(command, args, context);
      const duration = Date.now() - startTime;

      if (result.isErr()) {
        return result;
      }

      // 5. 結果の加工
      const output: CommandOutput = {
        ...result.value,
        duration,
        command,
        args,
      };

      this.logger.debug(`Command completed in ${duration}ms with exit code ${output.exitCode}`);
      return ok(output);
    } catch (error) {
      return err({
        code: 'EXECUTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown execution error',
        command,
        args,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * 非同期プロセス起動
   */
  async spawn(
    command: string,
    args: string[] = [],
    options: SpawnOptions = {},
  ): Promise<Result<ChildProcessWrapper, CommandError>> {
    const executor = new SpawnExecutor(this.runtime, this.logger);
    const context = this.createExecutionContext(command, args, options);

    return executor.spawn(command, args, context);
  }

  /**
   * 順次実行
   */
  async sequence(commands: CommandSpec[]): Promise<Result<CommandOutput[], CommandError>> {
    const results: CommandOutput[] = [];

    for (const spec of commands) {
      const result = await this.run(spec.command, spec.args, spec.options);
      if (result.isErr()) {
        return err({
          ...result.error,
          sequenceIndex: results.length,
        });
      }

      results.push(result.value);

      // 前のコマンドが失敗した場合の処理
      if (result.value.exitCode !== 0 && spec.options?.stopOnError !== false) {
        return err({
          code: 'SEQUENCE_FAILED',
          message: `Command failed in sequence at index ${results.length - 1}`,
          command: spec.command,
          args: spec.args,
          exitCode: result.value.exitCode,
          sequenceIndex: results.length - 1,
        });
      }
    }

    return ok(results);
  }

  /**
   * 並列実行
   */
  async parallel(commands: CommandSpec[]): Promise<Result<CommandOutput[], CommandError>> {
    const promises = commands.map((spec, index) =>
      this.run(spec.command, spec.args, spec.options).then((result) => ({
        result,
        index,
        spec,
      }))
    );

    const settled = await Promise.allSettled(promises);
    const results: CommandOutput[] = new Array(commands.length);
    const errors: (CommandError & { index: number })[] = [];

    for (const settlement of settled) {
      if (settlement.status === 'fulfilled') {
        const { result, index, spec } = settlement.value;
        if (result.isOk()) {
          results[index] = result.value;
        } else {
          errors.push({
            ...result.error,
            index,
          });
        }
      } else {
        // Promise自体が失敗した場合
        errors.push({
          code: 'EXECUTION_FAILED',
          message: settlement.reason?.message || 'Unknown error',
          command: 'unknown',
          args: [],
          index: -1,
        });
      }
    }

    if (errors.length > 0) {
      // 最初のエラーを返す（並列実行では全エラーを別途ログ出力）
      this.logger.error(`Parallel execution failed with ${errors.length} errors`, { errors });
      return err(errors[0]);
    }

    return ok(results);
  }

  /**
   * シェルスクリプト実行
   */
  async shell(
    script: string,
    options: ShellOptions = {},
  ): Promise<Result<CommandOutput, CommandError>> {
    const executor = new ShellExecutor(this.runtime, this.logger);
    const context = this.createExecutionContext('sh', ['-c', script], options);

    return executor.execute(script, context);
  }

  // プライベートメソッド...
}
```

### 移行対象と統合戦略

#### 移行元パッケージ

1. **@esta-utils/command-runner** (全体)
   - `src/commandExists.ts` → `CommandDetector.ts` に統合
   - `src/index.ts` → 機能を `CommandRunner.ts` に統合
   - エラーハンドリングを Result<T, E> に変更
   - 詳細なエラー情報を追加

#### 改善点

1. **エラー情報の強化**
   ```typescript
   // 旧: boolean を返す
   export const commandExists = (command: string): boolean

   // 新: 詳細エラー情報付きResult
   async exists(command: string): Promise<Result<boolean, CommandError>>
   ```

2. **実行オプションの拡張**
   ```typescript
   interface RunOptions {
     cwd?: string;
     env?: Record<string, string>;
     timeout?: number;
     stdio?: 'pipe' | 'inherit' | 'ignore';
     shell?: boolean | string;
     encoding?: BufferEncoding;
     maxBuffer?: number;
     killSignal?: NodeJS.Signals;
     windowsHide?: boolean;
     stopOnError?: boolean;
   }
   ```

3. **クロスプラットフォーム対応**
   - Windows/Unix 両対応
   - シェル検出の自動化
   - パス区切り文字の自動処理

## 3.3 @esta-actions パッケージ強化

### 目標

既存の `@esta-actions/tools-installer` を基盤として、GitHub Actions 開発により特化した機能を追加。

### 強化内容

#### 3.3.1 新機能追加

1. **workflow-helpers**: ワークフロー支援ユーティリティ
2. **action-utils**: アクション開発ユーティリティ
3. **input-validation**: 入力値検証機能

#### 3.3.2 パッケージ構成

```
packages/@esta-actions/
├── tools-installer/          # 既存パッケージ（強化）
├── workflow-helpers/         # 新規追加
├── action-utils/            # 新規追加
└── shared/                  # 共通ユーティリティ
```

### workflow-helpers 設計

```typescript
// packages/@esta-actions/workflow-helpers/src/index.ts

export class WorkflowHelper {
  /**
   * ワークフローマトリックス生成
   */
  generateMatrix(config: MatrixConfig): Matrix {
    // 動的マトリックス生成
  }

  /**
   * アーティファクト管理
   */
  async uploadArtifact(
    name: string,
    files: string[],
    options?: UploadOptions,
  ): Promise<Result<ArtifactInfo, ArtifactError>> {
    // アーティファクトアップロード
  }

  /**
   * キャッシュ管理
   */
  async cacheManager(
    key: string,
    paths: string[],
  ): Promise<Result<CacheInfo, CacheError>> {
    // インテリジェントキャッシュ管理
  }
}
```

### action-utils 設計

```typescript
// packages/@esta-actions/action-utils/src/index.ts

export class ActionUtils {
  /**
   * アクション入力の型安全取得
   */
  getTypedInputs<T>(schema: Schema<T>): Result<T, ValidationError> {
    // @esta-validation を使用した型安全な入力取得
  }

  /**
   * プルリクエスト情報取得
   */
  async getPullRequestInfo(): Promise<Result<PullRequestInfo, GitHubError>> {
    // PR情報の詳細取得
  }

  /**
   * セキュリティチェック
   */
  async securityCheck(
    options: SecurityCheckOptions,
  ): Promise<Result<SecurityReport, SecurityError>> {
    // セキュリティチェック実行
  }
}
```

## 3.4 @esta-system パッケージ拡張

### 目標

既存の `exit-status` に加えて、システムレベルの管理機能を追加。

### 拡張内容

#### 3.4.1 新機能追加

1. **environment-manager**: 環境変数管理
2. **process-manager**: プロセス管理
3. **signal-handler**: シグナルハンドリング

#### 3.4.2 パッケージ構成

```
packages/@esta-system/
├── exit-status/             # 既存パッケージ（保持）
├── environment-manager/     # 新規追加
├── process-manager/         # 新規追加
└── signal-handler/          # 新規追加
```

### environment-manager 設計

```typescript
// packages/@esta-system/environment-manager/src/index.ts

export class EnvironmentManager {
  /**
   * 環境変数の型安全取得
   */
  get<T>(key: string, schema: Schema<T>): Result<T, EnvironmentError> {
    // 型安全な環境変数取得
  }

  /**
   * 設定ベース環境変数管理
   */
  loadFromConfig(configPath: string): Promise<Result<void, EnvironmentError>> {
    // 設定ファイルから環境変数を読み込み
  }

  /**
   * GitHub Actions固有環境変数
   */
  getGitHubActionsContext(): Result<GitHubActionsContext, EnvironmentError> {
    // GitHub Actions コンテキスト情報の取得
  }
}
```

### process-manager 設計

```typescript
// packages/@esta-system/process-manager/src/index.ts

export class ProcessManager {
  /**
   * プロセス監視
   */
  monitor(options: MonitorOptions): ProcessMonitor {
    // プロセス監視機能
  }

  /**
   * リソース使用量取得
   */
  getResourceUsage(): Result<ResourceUsage, ProcessError> {
    // CPU、メモリ使用量の取得
  }

  /**
   * 子プロセス管理
   */
  manageChildren(): ChildProcessManager {
    // 子プロセスの統合管理
  }
}
```

## 実装チェックリスト

### Phase 3 実装タスク

#### 3.1 @esta-tools/installer

- [ ] **パッケージ基盤作成**
  - [ ] ディレクトリ構成の作成
  - [ ] package.json とビルド設定
  - [ ] tsconfig.json の設定
  - [ ] 基本的なエクスポート構成

- [ ] **UniversalInstaller 実装**
  - [ ] 基底クラスとインターフェース定義
  - [ ] Result<T, E> パターンの適用
  - [ ] ランタイム抽象化の活用
  - [ ] 既存機能の移行と強化

- [ ] **個別インストーラー実装**
  - [ ] EgetInstaller（既存機能移行）
  - [ ] NpmInstaller（新規実装）
  - [ ] ScriptInstaller（新規実装）
  - [ ] GitHubInstaller（新規実装）

- [ ] **検出・検証機能**
  - [ ] ToolDetector 実装
  - [ ] InstallationVerifier 実装
  - [ ] VersionDetector 実装

- [ ] **テスト実装**
  - [ ] 単体テストの包括的実装
  - [ ] 統合テストの実装
  - [ ] E2Eテストの実装
  - [ ] GitHub Actions環境テスト

#### 3.2 @esta-tools/command

- [ ] **パッケージ基盤作成**
  - [ ] ディレクトリ構成とビルド設定
  - [ ] 既存機能の分析と移行計画
  - [ ] 型定義の設計

- [ ] **CommandRunner 実装**
  - [ ] コア機能の実装
  - [ ] Result<T, E> パターンの適用
  - [ ] エラー情報の詳細化
  - [ ] 並列・順次実行機能

- [ ] **実行器群の実装**
  - [ ] DirectExecutor 実装
  - [ ] ShellExecutor 実装
  - [ ] SpawnExecutor 実装

- [ ] **検出機能の強化**
  - [ ] CommandDetector 実装
  - [ ] PathDetector 実装
  - [ ] クロスプラットフォーム対応

- [ ] **テストとドキュメント**
  - [ ] 包括的テストスイート
  - [ ] パフォーマンステスト
  - [ ] 使用例とドキュメント

#### 3.3 @esta-actions 強化

- [ ] **既存パッケージの改良**
  - [ ] tools-installer の新UniversalInstallerへの移行
  - [ ] 互換性レイヤーの実装
  - [ ] エラーハンドリングの改善

- [ ] **新機能パッケージ作成**
  - [ ] workflow-helpers パッケージ
  - [ ] action-utils パッケージ
  - [ ] 共通ユーティリティの抽出

#### 3.4 @esta-system 拡張

- [ ] **新機能パッケージ作成**
  - [ ] environment-manager パッケージ
  - [ ] process-manager パッケージ
  - [ ] signal-handler パッケージ

- [ ] **既存パッケージとの統合**
  - [ ] exit-status との連携強化
  - [ ] 共通インターフェースの設計

### 品質保証

#### テスト戦略

```bash
# Phase 3 品質チェック
pnpm run test:develop --filter="@esta-tools/*"
pnpm run test:develop --filter="@esta-actions/*"  
pnpm run test:develop --filter="@esta-system/*"

# 統合テスト
pnpm run test:integration --filter="@esta-tools/*"

# E2Eテスト
pnpm run test:e2e --filter="@esta-tools/installer"

# GitHub Actions環境テスト
pnpm run test:gha
```

#### パフォーマンス確認

```bash
# インストール性能テスト
time pnpm exec vitest run packages/@esta-tools/installer/tests/performance/

# コマンド実行性能テスト  
time pnpm exec vitest run packages/@esta-tools/command/tests/performance/
```

### 依存関係管理

#### 新パッケージの依存関係

```json
{
  "dependencies": {
    "@esta-error-result": "workspace:*",
    "@esta-runtime": "workspace:*",
    "@esta-config": "workspace:*",
    "@esta-validation": "workspace:*",
    "@esta-path-utils": "workspace:*",
    "@esta-fs-utils": "workspace:*",
    "@shared/constants": "workspace:*",
    "@shared/types": "workspace:*"
  }
}
```

#### 循環依存チェック

```bash
# 依存関係グラフの確認
pnpm exec madge --circular packages/@esta-tools
pnpm exec madge --circular packages/@esta-actions
pnpm exec madge --circular packages/@esta-system
```

## Phase 3 完了条件

### 技術的完了条件

1. **全パッケージのビルド成功**
2. **テストカバレージ 90%以上**
3. **型エラーゼロ**
4. **リントエラーゼロ**
5. **循環依存なし**

### 機能的完了条件

1. **@esta-tools/installer が既存の tools-installer と同等以上の機能を提供**
2. **@esta-tools/command が既存の command-runner より詳細なエラー情報を提供**
3. **すべての新機能が Result<T, E> パターンを採用**
4. **GitHub Actions 環境での動作確認**

### ドキュメント完了条件

1. **各パッケージの README.md**
2. **API ドキュメント**
3. **移行ガイド**
4. **使用例とサンプルコード**

---

**Next Phase**: Phase 4 - 統合レイヤー作成（Week 7）

Phase 3 の完了により、ESTA システムの核心機能が統合され、型安全で信頼性の高いツールインストールとコマンド実行環境が構築されます。
