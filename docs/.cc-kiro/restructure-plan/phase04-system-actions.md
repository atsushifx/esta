---
title: Phase 4 - 統合レイヤー作成とテスト強化
description: エンドユーザー向け統合パッケージと包括的テスト体系の構築
sidebar_position: 4
---

# Phase 4: 統合レイヤー作成とテスト強化 - 詳細設計書

**Version**: 1.0\
**Date**: 2025-01-24\
**Phase**: 4 (Week 7)\
**Status**: Design Complete - Ready for Implementation

## 概要

Phase 4では、統合レイヤーパッケージの作成と包括的なテスト戦略の実装を行います。エンドユーザー向けの使いやすいAPIを提供し、システム全体の品質を保証します。

### 目標

- **@esta-cli**: CLI開発者向け完全統合パッケージの作成
- **@esta-github-actions**: GitHub Actions開発者向け特化パッケージの作成
- **包括的テスト体系**: 統合テスト、E2Eテスト、パフォーマンステストの実装
- **品質保証フレームワーク**: 自動化された品質チェック体系の構築

### 前提条件

- Phase 1-3完了: 基盤、機能、アプリケーションレイヤーの実装完了
- 全パッケージが Result<T, E> パターンを採用
- ランタイム抽象化が完全実装済み

## 4.1 @esta-cli パッケージ設計

### パッケージ構成

```
packages/@esta-cli/
├── src/
│   ├── index.ts                    # 統合エクスポート
│   ├── builders/
│   │   ├── CLIBuilder.ts           # CLI構築ヘルパー
│   │   ├── ConfigBuilder.ts        # 設定管理ビルダー
│   │   ├── InstallerBuilder.ts     # インストーラービルダー
│   │   └── CommandBuilder.ts       # コマンドランナービルダー
│   ├── presets/
│   │   ├── NodeCLIPreset.ts        # Node.js CLI向けプリセット
│   │   ├── TypeScriptPreset.ts     # TypeScript開発向けプリセット
│   │   ├── DevToolsPreset.ts       # 開発ツール向けプリセット
│   │   └── BasePreset.ts           # 基本プリセット
│   ├── integrations/
│   │   ├── YargsIntegration.ts     # yargs統合
│   │   ├── CommanderIntegration.ts # commander統合
│   │   └── InkIntegration.ts       # React Ink統合
│   ├── utils/
│   │   ├── ErrorDisplay.ts         # エラー表示ユーティリティ
│   │   ├── ProgressDisplay.ts      # 進捗表示ユーティリティ
│   │   └── InputValidation.ts      # 入力検証ユーティリティ
│   └── types/
│       ├── cli.ts                  # CLI型定義
│       ├── builder.ts              # ビルダー型定義
│       └── preset.ts               # プリセット型定義
├── templates/                      # プロジェクトテンプレート
│   ├── basic-cli/
│   ├── typescript-cli/
│   └── advanced-cli/
├── examples/                       # 使用例
│   ├── simple-cli/
│   ├── config-based-cli/
│   └── tool-installer-cli/
└── package.json
```

### 核心クラス設計

#### CLIBuilder クラス

```typescript
import { UniversalConfigLoader } from '@esta-config';
import { err, ok, Result } from '@esta-error-result';
import { createRuntime, RuntimeAdapter } from '@esta-runtime';
import { CommandRunner } from '@esta-tools/command';
import { UniversalInstaller } from '@esta-tools/installer';
import { UniversalValidator } from '@esta-validation';

export class CLIBuilder<TConfig = unknown> {
  private runtime: RuntimeAdapter;
  private configLoader?: UniversalConfigLoader<TConfig>;
  private installer?: UniversalInstaller;
  private commandRunner?: CommandRunner;
  private validator?: UniversalValidator<TConfig>;
  private presets: CLIPreset[] = [];
  private hooks: CLIHooks = {};
  private logger: Logger;

  constructor(options: CLIBuilderOptions<TConfig> = {}) {
    this.runtime = options.runtime || createRuntime();
    this.logger = options.logger || createLogger('CLIBuilder');
  }

  /**
   * 設定管理の追加
   */
  withConfig<T>(
    schema: ValidationSchema<T>,
    options: ConfigOptions = {},
  ): CLIBuilder<T> {
    this.configLoader = new UniversalConfigLoader(schema, {
      runtime: this.runtime,
      ...options,
    });

    this.validator = new UniversalValidator(schema);

    return this as CLIBuilder<T>;
  }

  /**
   * ツールインストーラーの追加
   */
  withInstaller(options: InstallerOptions = {}): this {
    this.installer = new UniversalInstaller({
      runtime: this.runtime,
      logger: this.logger.child('installer'),
      ...options,
    });

    return this;
  }

  /**
   * コマンドランナーの追加
   */
  withCommandRunner(options: CommandRunnerOptions = {}): this {
    this.commandRunner = new CommandRunner({
      runtime: this.runtime,
      logger: this.logger.child('command'),
      ...options,
    });

    return this;
  }

  /**
   * プリセットの適用
   */
  withPreset(preset: CLIPreset | string): this {
    const resolvedPreset = typeof preset === 'string'
      ? this.resolvePreset(preset)
      : preset;

    if (resolvedPreset) {
      this.presets.push(resolvedPreset);
      resolvedPreset.apply(this);
    }

    return this;
  }

  /**
   * ライフサイクルフックの追加
   */
  withHooks(hooks: Partial<CLIHooks>): this {
    this.hooks = { ...this.hooks, ...hooks };
    return this;
  }

  /**
   * CLI アプリケーションの構築
   */
  build(): Result<CLIApplication<TConfig>, CLIBuildError> {
    try {
      // 1. 設定の検証
      const validation = this.validateConfiguration();
      if (validation.isErr()) {
        return validation;
      }

      // 2. 依存関係の解決
      const dependencies = this.resolveDependencies();
      if (dependencies.isErr()) {
        return dependencies;
      }

      // 3. アプリケーションインスタンスの作成
      const app = new CLIApplication({
        runtime: this.runtime,
        configLoader: this.configLoader,
        installer: this.installer,
        commandRunner: this.commandRunner,
        validator: this.validator,
        hooks: this.hooks,
        logger: this.logger,
        dependencies: dependencies.value,
      });

      // 4. プリセットの最終適用
      for (const preset of this.presets) {
        preset.postBuild?.(app);
      }

      return ok(app);
    } catch (error) {
      return err({
        code: 'BUILD_FAILED',
        message: error instanceof Error ? error.message : 'Unknown build error',
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * 素早い構築（デフォルト設定）
   */
  static quick<T>(schema?: ValidationSchema<T>): Result<CLIApplication<T>, CLIBuildError> {
    const builder = new CLIBuilder<T>()
      .withPreset('default')
      .withCommandRunner()
      .withInstaller();

    if (schema) {
      builder.withConfig(schema);
    }

    return builder.build();
  }

  /**
   * TypeScript CLI 向けの構築
   */
  static typescript<T>(
    schema: ValidationSchema<T>,
    options: TypeScriptCLIOptions = {},
  ): Result<CLIApplication<T>, CLIBuildError> {
    return new CLIBuilder<T>()
      .withPreset('typescript')
      .withConfig(schema, options.config)
      .withCommandRunner(options.command)
      .withInstaller(options.installer)
      .build();
  }

  /**
   * GitHub Actions向けの構築
   */
  static githubActions<T>(
    schema: ValidationSchema<T>,
    options: GitHubActionsCLIOptions = {},
  ): Result<CLIApplication<T>, CLIBuildError> {
    return new CLIBuilder<T>()
      .withPreset('github-actions')
      .withConfig(schema, options.config)
      .withInstaller(options.installer)
      .withHooks({
        beforeRun: async (app) => {
          // GitHub Actions環境の初期化
          if (app.runtime.name === 'github-actions') {
            app.logger.info('Initializing GitHub Actions environment');
          }
        },
        onError: async (error, app) => {
          // GitHub Actions向けエラー出力
          if (app.runtime.githubActions) {
            app.runtime.githubActions.setFailed(error.message);
          }
        },
      })
      .build();
  }

  // プライベートメソッド...
}
```

#### CLIApplication クラス

```typescript
export class CLIApplication<TConfig = unknown> {
  readonly runtime: RuntimeAdapter;
  readonly configLoader?: UniversalConfigLoader<TConfig>;
  readonly installer?: UniversalInstaller;
  readonly commandRunner?: CommandRunner;
  readonly validator?: UniversalValidator<TConfig>;
  readonly hooks: CLIHooks;
  readonly logger: Logger;
  private config?: TConfig;

  constructor(options: CLIApplicationOptions<TConfig>) {
    this.runtime = options.runtime;
    this.configLoader = options.configLoader;
    this.installer = options.installer;
    this.commandRunner = options.commandRunner;
    this.validator = options.validator;
    this.hooks = options.hooks;
    this.logger = options.logger;
  }

  /**
   * 設定の読み込み
   */
  async loadConfig(path?: string): Promise<Result<TConfig, ConfigError>> {
    if (!this.configLoader) {
      return err({
        code: 'CONFIG_LOADER_NOT_CONFIGURED',
        message: 'Config loader not configured. Use withConfig() in builder.',
      });
    }

    await this.hooks.beforeConfigLoad?.(this);

    const result = await this.configLoader.load(path);
    if (result.isOk()) {
      this.config = result.value;
      await this.hooks.afterConfigLoad?.(result.value, this);
    }

    return result;
  }

  /**
   * 設定の取得
   */
  getConfig(): TConfig | undefined {
    return this.config;
  }

  /**
   * ツールのインストール
   */
  async installTools(
    configs: ToolConfig | ToolConfig[],
  ): Promise<Result<InstallInfo[], InstallError>> {
    if (!this.installer) {
      return err({
        code: 'INSTALLER_NOT_CONFIGURED',
        message: 'Installer not configured. Use withInstaller() in builder.',
        tool: 'unknown',
      });
    }

    const toolConfigs = Array.isArray(configs) ? configs : [configs];

    await this.hooks.beforeInstall?.(toolConfigs, this);

    const result = await this.installer.installMultiple(toolConfigs);

    if (result.isOk()) {
      await this.hooks.afterInstall?.(result.value, this);
    }

    return result;
  }

  /**
   * コマンドの実行
   */
  async runCommand(
    command: string,
    args: string[] = [],
    options: RunOptions = {},
  ): Promise<Result<CommandOutput, CommandError>> {
    if (!this.commandRunner) {
      return err({
        code: 'COMMAND_RUNNER_NOT_CONFIGURED',
        message: 'Command runner not configured. Use withCommandRunner() in builder.',
        command,
        args,
      });
    }

    await this.hooks.beforeCommand?.(command, args, options, this);

    const result = await this.commandRunner.run(command, args, options);

    if (result.isOk()) {
      await this.hooks.afterCommand?.(result.value, this);
    } else {
      await this.hooks.onError?.(result.error, this);
    }

    return result;
  }

  /**
   * アプリケーションの実行
   */
  async run(args: string[] = process.argv.slice(2)): Promise<Result<void, CLIError>> {
    try {
      await this.hooks.beforeRun?.(this);

      // 基本的な引数解析とルーティング
      const parseResult = this.parseArguments(args);
      if (parseResult.isErr()) {
        return parseResult;
      }

      const { command, arguments: cmdArgs, options } = parseResult.value;

      // コマンド実行
      const result = await this.executeCommand(command, cmdArgs, options);
      if (result.isErr()) {
        await this.hooks.onError?.(result.error, this);
        return result;
      }

      await this.hooks.afterRun?.(this);
      return ok(undefined);
    } catch (error) {
      const cliError: CLIError = {
        code: 'RUNTIME_ERROR',
        message: error instanceof Error ? error.message : 'Unknown runtime error',
        cause: error instanceof Error ? error : undefined,
      };

      await this.hooks.onError?.(cliError, this);
      return err(cliError);
    }
  }

  // プライベートメソッド...
}
```

### プリセット設計

#### TypeScriptPreset

```typescript
export class TypeScriptPreset implements CLIPreset {
  name = 'typescript';

  apply(builder: CLIBuilder): void {
    // TypeScript開発者向けの設定
    builder
      .withHooks({
        beforeRun: async (app) => {
          // TypeScript環境チェック
          const tsCheck = await app.commandRunner?.exists('tsc');
          if (tsCheck?.isOk() && !tsCheck.value) {
            app.logger.warn('TypeScript compiler not found. Consider installing typescript.');
          }
        },
      });
  }

  postBuild?(app: CLIApplication): void {
    // ビルド後の追加設定
    app.logger.debug('TypeScript preset applied');
  }
}
```

### 統合エクスポート

```typescript
// packages/@esta-cli/src/index.ts

// 全機能の再エクスポート
export * from '@esta-config';
export * from '@esta-error-result';
export * from '@esta-fs-utils';
export * from '@esta-path-utils';
export * from '@esta-runtime';
export * from '@esta-tools/command';
export * from '@esta-tools/installer';
export * from '@esta-validation';

// 統合レイヤー固有のエクスポート
export * from './builders/CLIBuilder';
export * from './builders/CommandBuilder';
export * from './builders/ConfigBuilder';
export * from './builders/InstallerBuilder';

// プリセット
export * from './presets/DevToolsPreset';
export * from './presets/NodeCLIPreset';
export * from './presets/TypeScriptPreset';

// ユーティリティ
export * from './utils/ErrorDisplay';
export * from './utils/InputValidation';
export * from './utils/ProgressDisplay';

// 高レベルAPI
export function createCLI<T>(options: CLIOptions<T>): CLIBuilder<T> {
  return new CLIBuilder(options);
}

export function createConfig<T>(schema: ValidationSchema<T>): UniversalConfigLoader<T> {
  return new UniversalConfigLoader(schema);
}

export function createInstaller(options?: InstallerOptions): UniversalInstaller {
  return new UniversalInstaller(options);
}

export function createCommand(runtime?: RuntimeType): CommandRunner {
  const runtimeAdapter = runtime ? createRuntimeFromType(runtime) : createRuntime();
  return new CommandRunner({ runtime: runtimeAdapter });
}

// CLI特化ユーティリティ
export const cli = {
  // 実行時情報
  get args() {
    return process.argv.slice(2);
  },
  get env() {
    return process.env;
  },
  get cwd() {
    return process.cwd();
  },

  // ユーティリティ
  logger: createLogger('CLI'),
  runtime: createRuntime(),

  // 素早い開始用ヘルパー
  quick: CLIBuilder.quick,
  typescript: CLIBuilder.typescript,
  githubActions: CLIBuilder.githubActions,
};
```

## 4.2 @esta-github-actions パッケージ設計

### パッケージ構成

```
packages/@esta-github-actions/
├── src/
│   ├── index.ts                    # GitHub Actions特化エクスポート
│   ├── builders/
│   │   ├── ActionBuilder.ts        # アクション構築ヘルパー
│   │   └── WorkflowBuilder.ts      # ワークフロー構築ヘルパー
│   ├── integrations/
│   │   ├── ActionsCore.ts          # @actions/core統合
│   │   ├── ActionsToolCache.ts     # @actions/tool-cache統合
│   │   └── ActionsGitHub.ts        # @actions/github統合
│   ├── utils/
│   │   ├── InputParser.ts          # 入力値解析
│   │   ├── OutputFormatter.ts      # 出力フォーマット
│   │   └── SecurityChecker.ts      # セキュリティチェック
│   ├── validators/
│   │   ├── ActionInputValidator.ts # アクション入力検証
│   │   └── WorkflowValidator.ts    # ワークフロー検証
│   └── types/
│       ├── action.ts               # アクション型定義
│       ├── workflow.ts             # ワークフロー型定義
│       └── security.ts             # セキュリティ型定義
├── templates/                      # アクションテンプレート
│   ├── typescript-action/
│   ├── tool-installer-action/
│   └── composite-action/
├── examples/                       # 使用例
│   ├── simple-action/
│   ├── tool-setup-action/
│   └── matrix-action/
└── package.json
```

### 核心クラス設計

#### ActionBuilder クラス

```typescript
import { err, ok, Result } from '@esta-error-result';
import { createRuntime } from '@esta-runtime';
import { UniversalInstaller } from '@esta-tools/installer';
import { UniversalValidator } from '@esta-validation';

export class ActionBuilder<TInputs = unknown, TOutputs = unknown> {
  private inputSchema?: ValidationSchema<TInputs>;
  private outputSchema?: ValidationSchema<TOutputs>;
  private installer?: UniversalInstaller;
  private securityOptions: SecurityOptions = {};
  private handler?: ActionHandler<TInputs, TOutputs>;
  private hooks: ActionHooks<TInputs, TOutputs> = {};

  /**
   * 入力スキーマの設定
   */
  withInputs<T>(schema: ValidationSchema<T>): ActionBuilder<T, TOutputs> {
    this.inputSchema = schema as ValidationSchema<TInputs>;
    return this as ActionBuilder<T, TOutputs>;
  }

  /**
   * 出力スキーマの設定
   */
  withOutputs<T>(schema: ValidationSchema<T>): ActionBuilder<TInputs, T> {
    this.outputSchema = schema as ValidationSchema<TOutputs>;
    return this as ActionBuilder<TInputs, T>;
  }

  /**
   * ツールインストーラーの追加
   */
  withInstaller(options: InstallerOptions = {}): this {
    this.installer = new UniversalInstaller({
      runtime: createRuntime(),
      ...options,
    });
    return this;
  }

  /**
   * セキュリティオプションの設定
   */
  withSecurity(options: SecurityOptions): this {
    this.securityOptions = { ...this.securityOptions, ...options };
    return this;
  }

  /**
   * メインハンドラーの設定
   */
  withHandler(handler: ActionHandler<TInputs, TOutputs>): this {
    this.handler = handler;
    return this;
  }

  /**
   * ライフサイクルフックの設定
   */
  withHooks(hooks: Partial<ActionHooks<TInputs, TOutputs>>): this {
    this.hooks = { ...this.hooks, ...hooks };
    return this;
  }

  /**
   * アクションの構築と実行
   */
  async run(): Promise<Result<TOutputs, ActionError>> {
    try {
      const core = require('@actions/core');

      // 1. セキュリティチェック
      if (this.securityOptions.enableSecurityCheck) {
        const securityCheck = await this.performSecurityCheck();
        if (securityCheck.isErr()) {
          core.setFailed(`Security check failed: ${securityCheck.error.message}`);
          return securityCheck;
        }
      }

      // 2. 入力値の取得と検証
      const inputs = await this.getValidatedInputs();
      if (inputs.isErr()) {
        core.setFailed(`Input validation failed: ${inputs.error.message}`);
        return inputs;
      }

      await this.hooks.beforeRun?.(inputs.value);

      // 3. メインハンドラーの実行
      if (!this.handler) {
        const error: ActionError = {
          code: 'HANDLER_NOT_CONFIGURED',
          message: 'Action handler not configured',
        };
        core.setFailed(error.message);
        return err(error);
      }

      const result = await this.handler(inputs.value, {
        installer: this.installer,
        core,
        context: this.getActionContext(),
      });

      if (result.isErr()) {
        await this.hooks.onError?.(result.error);
        core.setFailed(result.error.message);
        return result;
      }

      // 4. 出力の設定
      if (this.outputSchema && result.value) {
        const validatedOutput = this.validateOutputs(result.value);
        if (validatedOutput.isErr()) {
          core.setFailed(`Output validation failed: ${validatedOutput.error.message}`);
          return validatedOutput;
        }

        this.setActionOutputs(validatedOutput.value);
      }

      await this.hooks.afterRun?.(result.value);
      return result;
    } catch (error) {
      const actionError: ActionError = {
        code: 'RUNTIME_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        cause: error instanceof Error ? error : undefined,
      };

      await this.hooks.onError?.(actionError);

      const core = require('@actions/core');
      core.setFailed(actionError.message);

      return err(actionError);
    }
  }

  // プライベートメソッド...
}
```

### GitHub Actions特化ユーティリティ

#### InputParser クラス

```typescript
export class InputParser<T> {
  constructor(private schema: ValidationSchema<T>) {}

  /**
   * GitHub Actions入力の型安全取得
   */
  parse(): Result<T, ValidationError> {
    const core = require('@actions/core');
    const rawInputs: Record<string, string> = {};

    // スキーマから入力キーを抽出
    const inputKeys = this.extractInputKeys();

    for (const key of inputKeys) {
      const value = core.getInput(key);
      if (value) {
        rawInputs[key] = value;
      }
    }

    // 型変換とバリデーション
    const validator = new UniversalValidator(this.schema);
    return validator.validate(rawInputs);
  }

  /**
   * 必須入力の取得
   */
  getRequired<K extends keyof T>(key: K): Result<T[K], ValidationError> {
    const core = require('@actions/core');
    const value = core.getInput(key as string, { required: true });

    // 単一値のバリデーション
    return this.validateSingleValue(key, value);
  }

  /**
   * オプション入力の取得
   */
  getOptional<K extends keyof T>(
    key: K,
    defaultValue?: T[K],
  ): Result<T[K] | undefined, ValidationError> {
    const core = require('@actions/core');
    const value = core.getInput(key as string);

    if (!value && defaultValue !== undefined) {
      return ok(defaultValue);
    }

    return value
      ? this.validateSingleValue(key, value)
      : ok(undefined);
  }

  // プライベートメソッド...
}
```

### 統合エクスポート

```typescript
// packages/@esta-github-actions/src/index.ts

// 基盤機能の選択的エクスポート
export * from '@esta-error-result';
export * from '@esta-runtime';
export * from '@esta-tools/installer';
export { UniversalValidator } from '@esta-validation';

// GitHub Actions特化機能
export * from './builders/ActionBuilder';
export * from './builders/WorkflowBuilder';
export * from './utils/InputParser';
export * from './utils/OutputFormatter';
export * from './utils/SecurityChecker';

// GitHub Actions専用API
export function createAction<TInputs, TOutputs>(
  handler: ActionHandler<TInputs, TOutputs>,
): ActionBuilder<TInputs, TOutputs> {
  return new ActionBuilder<TInputs, TOutputs>().withHandler(handler);
}

export function getTypedInputs<T>(schema: ValidationSchema<T>): Result<T, ValidationError> {
  const parser = new InputParser(schema);
  return parser.parse();
}

export function setTypedOutputs<T>(outputs: T): void {
  const formatter = new OutputFormatter();
  formatter.setOutputs(outputs);
}

// GitHub Actions最適化ログ
export const logger = createGitHubActionsLogger();

// GitHub Actions統合ユーティリティ
export const actions = {
  // Actions SDK の再エクスポート
  get core() {
    return require('@actions/core');
  },
  get io() {
    return require('@actions/io');
  },
  get toolCache() {
    return require('@actions/tool-cache');
  },
  get github() {
    return require('@actions/github');
  },
  get context() {
    return require('@actions/github').context;
  },

  // 統合ヘルパー
  installer: (options?: InstallerOptions) => new UniversalInstaller(options),
  runtime: createRuntime(),

  // 素早い開始用ヘルパー
  quickAction: <T, U>(
    handler: ActionHandler<T, U>,
    inputSchema?: ValidationSchema<T>,
    outputSchema?: ValidationSchema<U>,
  ) => {
    let builder = createAction(handler);

    if (inputSchema) {
      builder = builder.withInputs(inputSchema);
    }

    if (outputSchema) {
      builder = builder.withOutputs(outputSchema);
    }

    return builder;
  },
};
```

## 4.3 包括的テスト体系の構築

### テスト戦略概要

#### 4.3.1 テスト階層

```
テスト階層
├── Unit Tests (各パッケージ)
│   ├── 関数・メソッドレベル
│   ├── クラスレベル
│   └── モジュールレベル
├── Integration Tests (パッケージ間)
│   ├── API統合テスト
│   ├── 設定統合テスト
│   └── エラーハンドリング統合テスト
├── E2E Tests (システム全体)
│   ├── CLI使用シナリオ
│   ├── GitHub Actionsワークフロー
│   └── クロスプラットフォーム動作
├── Performance Tests
│   ├── ビルド時間
│   ├── 実行時間
│   └── メモリ使用量
└── Compatibility Tests
    ├── ランタイム互換性
    ├── バージョン互換性
    └── 破壊的変更検出
```

#### 4.3.2 テスト実装計画

### 統合テストフレームワーク

```typescript
// tests/integration/framework/IntegrationTestSuite.ts

export class IntegrationTestSuite {
  private testCases: IntegrationTestCase[] = [];

  /**
   * パッケージ間統合テストの追加
   */
  addPackageIntegration(
    packages: string[],
    testCase: PackageIntegrationTest,
  ): this {
    this.testCases.push({
      type: 'package-integration',
      packages,
      test: testCase,
    });
    return this;
  }

  /**
   * API統合テストの追加
   */
  addAPIIntegration(
    api: string,
    testCase: APIIntegrationTest,
  ): this {
    this.testCases.push({
      type: 'api-integration',
      api,
      test: testCase,
    });
    return this;
  }

  /**
   * 全統合テストの実行
   */
  async run(): Promise<IntegrationTestResult[]> {
    const results: IntegrationTestResult[] = [];

    for (const testCase of this.testCases) {
      const result = await this.runTestCase(testCase);
      results.push(result);
    }

    return results;
  }
}

// 使用例: @esta-cli と @esta-tools/* の統合テスト
describe('CLI Integration Tests', () => {
  const suite = new IntegrationTestSuite();

  suite
    .addPackageIntegration(
      ['@esta-cli', '@esta-tools/installer'],
      async () => {
        const cli = CLIBuilder.quick()
          .withInstaller()
          .build();

        expect(cli.isOk()).toBe(true);

        const app = cli.value;
        const result = await app.installTools({
          name: 'test-tool',
          installer: 'eget',
          package: 'test/tool',
        });

        expect(result.isOk()).toBe(true);
      },
    )
    .addAPIIntegration(
      '@esta-cli',
      async () => {
        // CLI APIの一貫性テスト
        const configs = [
          { name: 'tool1', installer: 'eget' as const, package: 'test/tool1' },
          { name: 'tool2', installer: 'npm' as const, package: 'test-tool2' },
        ];

        const cli = CLIBuilder.typescript(testSchema).build();
        expect(cli.isOk()).toBe(true);

        const results = await cli.value.installTools(configs);
        expect(results.isOk()).toBe(true);
      },
    );

  it('should pass all integration tests', async () => {
    const results = await suite.run();
    const failures = results.filter((r) => !r.success);

    if (failures.length > 0) {
      console.error('Integration test failures:', failures);
    }

    expect(failures).toHaveLength(0);
  });
});
```

### E2Eテストフレームワーク

```typescript
// tests/e2e/framework/E2ETestSuite.ts

export class E2ETestSuite {
  private scenarios: E2EScenario[] = [];

  /**
   * CLIシナリオの追加
   */
  addCLIScenario(scenario: CLIScenario): this {
    this.scenarios.push({
      type: 'cli',
      ...scenario,
    });
    return this;
  }

  /**
   * GitHub Actionsシナリオの追加
   */
  addGitHubActionsScenario(scenario: GitHubActionsScenario): this {
    this.scenarios.push({
      type: 'github-actions',
      ...scenario,
    });
    return this;
  }

  /**
   * 全E2Eテストの実行
   */
  async run(): Promise<E2ETestResult[]> {
    const results: E2ETestResult[] = [];

    for (const scenario of this.scenarios) {
      const result = await this.runScenario(scenario);
      results.push(result);
    }

    return results;
  }
}

// 使用例: 実際のユーザーシナリオテスト
describe('E2E User Scenarios', () => {
  const suite = new E2ETestSuite();

  suite
    .addCLIScenario({
      name: 'Tool Installation Workflow',
      setup: async () => {
        // テスト環境のセットアップ
        await fs.mkdir('/tmp/test-cli', { recursive: true });
        process.chdir('/tmp/test-cli');
      },
      steps: [
        {
          action: 'create-config',
          input: {
            tools: [
              { name: 'gh', installer: 'eget', package: 'cli/cli' },
              { name: 'jq', installer: 'eget', package: 'jqlang/jq' },
            ],
          },
        },
        {
          action: 'run-install',
          expected: {
            exitCode: 0,
            installedTools: ['gh', 'jq'],
          },
        },
        {
          action: 'verify-tools',
          expected: {
            commands: ['gh --version', 'jq --version'],
            success: true,
          },
        },
      ],
      cleanup: async () => {
        await fs.rmdir('/tmp/test-cli', { recursive: true });
      },
    })
    .addGitHubActionsScenario({
      name: 'GitHub Actions Tool Setup',
      workflow: `
        name: Test Tool Setup
        on: push
        jobs:
          test:
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v4
              - uses: ./
                with:
                  tools: |
                    gh
                    jq
                    ripgrep
              - run: |
                  gh --version
                  jq --version
                  rg --version
      `,
      expected: {
        success: true,
        toolsInstalled: ['gh', 'jq', 'rg'],
      },
    });

  it('should complete all E2E scenarios successfully', async () => {
    const results = await suite.run();
    const failures = results.filter((r) => !r.success);

    expect(failures).toHaveLength(0);
  });
});
```

### パフォーマンステストフレームワーク

```typescript
// tests/performance/framework/PerformanceTestSuite.ts

export class PerformanceTestSuite {
  private benchmarks: PerformanceBenchmark[] = [];

  /**
   * ビルド時間ベンチマーク
   */
  addBuildTimeBenchmark(name: string, buildFn: () => Promise<void>): this {
    this.benchmarks.push({
      type: 'build-time',
      name,
      fn: buildFn,
      threshold: { max: 60000 }, // 1分以内
    });
    return this;
  }

  /**
   * 実行時間ベンチマーク
   */
  addExecutionTimeBenchmark(
    name: string,
    executeFn: () => Promise<void>,
    threshold: { max: number },
  ): this {
    this.benchmarks.push({
      type: 'execution-time',
      name,
      fn: executeFn,
      threshold,
    });
    return this;
  }

  /**
   * メモリ使用量ベンチマーク
   */
  addMemoryBenchmark(
    name: string,
    executeFn: () => Promise<void>,
    threshold: { max: number },
  ): this {
    this.benchmarks.push({
      type: 'memory-usage',
      name,
      fn: executeFn,
      threshold,
    });
    return this;
  }

  /**
   * 全ベンチマークの実行
   */
  async run(): Promise<PerformanceResult[]> {
    const results: PerformanceResult[] = [];

    for (const benchmark of this.benchmarks) {
      const result = await this.runBenchmark(benchmark);
      results.push(result);
    }

    return results;
  }
}

// 使用例: パフォーマンス回帰テスト
describe('Performance Regression Tests', () => {
  const suite = new PerformanceTestSuite();

  suite
    .addBuildTimeBenchmark(
      'Full monorepo build',
      async () => {
        await execAsync('pnpm run build');
      },
    )
    .addExecutionTimeBenchmark(
      'CLI application startup',
      async () => {
        const cli = CLIBuilder.quick().build();
        expect(cli.isOk()).toBe(true);
      },
      { max: 100 }, // 100ms以内
    )
    .addExecutionTimeBenchmark(
      'Tool installation (eget)',
      async () => {
        const installer = new UniversalInstaller();
        const result = await installer.install({
          name: 'test-tool',
          installer: 'eget',
          package: 'test/tool',
        });
        expect(result.isOk()).toBe(true);
      },
      { max: 5000 }, // 5秒以内
    )
    .addMemoryBenchmark(
      'CLI application memory usage',
      async () => {
        const cli = CLIBuilder.quick().build();
        expect(cli.isOk()).toBe(true);

        // 複数回実行してメモリ使用量を測定
        for (let i = 0; i < 10; i++) {
          await cli.value.loadConfig();
        }
      },
      { max: 100 * 1024 * 1024 }, // 100MB以内
    );

  it('should meet all performance thresholds', async () => {
    const results = await suite.run();
    const failures = results.filter((r) => r.failed);

    if (failures.length > 0) {
      console.table(failures.map((f) => ({
        name: f.name,
        actual: f.actual,
        threshold: f.threshold,
        unit: f.unit,
      })));
    }

    expect(failures).toHaveLength(0);
  });
});
```

## 4.4 品質保証フレームワーク

### 自動化品質チェック体系

```typescript
// scripts/quality-assurance/QualityChecker.ts

export class QualityChecker {
  private checks: QualityCheck[] = [];

  /**
   * 型チェックの追加
   */
  addTypeCheck(packages?: string[]): this {
    this.checks.push({
      name: 'TypeScript Type Check',
      command: packages
        ? `pnpm run check:types --filter="${packages.join(',')}"`
        : 'pnpm run check:types',
      critical: true,
    });
    return this;
  }

  /**
   * リントチェックの追加
   */
  addLintCheck(packages?: string[]): this {
    this.checks.push(
      {
        name: 'ESLint Basic',
        command: packages
          ? `pnpm run lint-all --filter="${packages.join(',')}"`
          : 'pnpm run lint-all',
        critical: true,
      },
      {
        name: 'ESLint TypeScript',
        command: packages
          ? `pnpm run lint-all:types --filter="${packages.join(',')}"`
          : 'pnpm run lint-all:types',
        critical: true,
      },
    );
    return this;
  }

  /**
   * テストチェックの追加
   */
  addTestCheck(packages?: string[]): this {
    this.checks.push(
      {
        name: 'Unit Tests',
        command: packages
          ? `pnpm run test:develop --filter="${packages.join(',')}"`
          : 'pnpm run test:develop',
        critical: true,
      },
      {
        name: 'Integration Tests',
        command: packages
          ? `pnpm run test:integration --filter="${packages.join(',')}"`
          : 'pnpm run test:integration',
        critical: false,
      },
    );
    return this;
  }

  /**
   * コード品質チェックの追加
   */
  addCodeQualityCheck(): this {
    this.checks.push(
      {
        name: 'Spell Check',
        command: 'pnpm run check:spells',
        critical: false,
      },
      {
        name: 'Format Check',
        command: 'pnpm run check:dprint',
        critical: false,
      },
      {
        name: 'Secret Detection',
        command: 'pnpm run lint:secrets',
        critical: true,
      },
    );
    return this;
  }

  /**
   * 依存関係チェックの追加
   */
  addDependencyCheck(): this {
    this.checks.push(
      {
        name: 'Circular Dependencies',
        command: 'pnpm exec madge --circular packages',
        critical: true,
      },
      {
        name: 'Bundle Size Check',
        command: 'pnpm run check:size',
        critical: false,
      },
    );
    return this;
  }

  /**
   * 全品質チェックの実行
   */
  async run(): Promise<QualityReport> {
    const results: QualityCheckResult[] = [];
    let criticalFailures = 0;

    for (const check of this.checks) {
      const result = await this.runCheck(check);
      results.push(result);

      if (!result.passed && check.critical) {
        criticalFailures++;
      }
    }

    return {
      passed: criticalFailures === 0,
      criticalFailures,
      totalChecks: this.checks.length,
      results,
    };
  }

  /**
   * 包括的品質チェック（Phase 4用）
   */
  static forPhase4(): QualityChecker {
    return new QualityChecker()
      .addTypeCheck(['@esta-cli', '@esta-github-actions'])
      .addLintCheck(['@esta-cli', '@esta-github-actions'])
      .addTestCheck(['@esta-cli', '@esta-github-actions'])
      .addCodeQualityCheck()
      .addDependencyCheck();
  }

  /**
   * 全システム品質チェック
   */
  static comprehensive(): QualityChecker {
    return new QualityChecker()
      .addTypeCheck()
      .addLintCheck()
      .addTestCheck()
      .addCodeQualityCheck()
      .addDependencyCheck();
  }
}
```

### 継続的品質監視

```bash
#!/bin/bash
# scripts/quality-assurance/continuous-quality-check.sh

set -e

echo "🔍 Phase 4 Quality Assurance Check"
echo "=================================="

# Phase 4 特化品質チェック
echo "📋 Phase 4 Package Checks..."
pnpm run test:develop --filter="@esta-cli"
pnpm run test:develop --filter="@esta-github-actions"
pnpm run check:types --filter="@esta-cli"
pnpm run check:types --filter="@esta-github-actions"

# 統合テスト
echo "🔗 Integration Tests..."
pnpm run test:integration

# E2Eテスト
echo "🎭 E2E Tests..."
pnpm run test:e2e

# パフォーマンステスト
echo "⚡ Performance Tests..."
pnpm run test:performance

# 全体品質チェック
echo "🌟 Comprehensive Quality Check..."
pnpm run lint-all:types
pnpm run check:spells
pnpm run check:dprint
pnpm run lint:secrets

# 依存関係チェック
echo "📦 Dependency Checks..."
pnpm exec madge --circular packages
pnpm audit --audit-level moderate

# ビルド確認
echo "🏗️ Build Verification..."
time pnpm run build

echo "✅ Phase 4 Quality Assurance Complete!"
```

## 実装チェックリスト

### Phase 4 実装タスク

#### 4.1 @esta-cli パッケージ

- [ ] **パッケージ基盤作成**
  - [ ] ディレクトリ構成の作成
  - [ ] package.json とビルド設定
  - [ ] 統合エクスポートの設計
  - [ ] 依存関係の整理

- [ ] **CLIBuilder 実装**
  - [ ] 基本ビルダークラス
  - [ ] プリセットシステム
  - [ ] ライフサイクルフック
  - [ ] 素早い構築ヘルパー

- [ ] **CLIApplication 実装**
  - [ ] アプリケーションクラス
  - [ ] 設定管理統合
  - [ ] コマンド実行統合
  - [ ] エラーハンドリング統合

- [ ] **統合インターフェース**
  - [ ] 高レベルAPI設計
  - [ ] 便利関数の実装
  - [ ] 型安全性の確保
  - [ ] ドキュメント生成

#### 4.2 @esta-github-actions パッケージ

- [ ] **パッケージ基盤作成**
  - [ ] GitHub Actions特化構成
  - [ ] Actions SDK統合
  - [ ] セキュリティ考慮事項
  - [ ] テンプレート作成

- [ ] **ActionBuilder 実装**
  - [ ] アクション構築システム
  - [ ] 入力検証フレームワーク
  - [ ] 出力管理システム
  - [ ] エラーハンドリング

- [ ] **GitHub Actions統合**
  - [ ] ActionsCore統合
  - [ ] ToolCache統合
  - [ ] GitHub API統合
  - [ ] セキュリティチェック

#### 4.3 テスト体系構築

- [ ] **統合テストフレームワーク**
  - [ ] パッケージ間統合テスト
  - [ ] API統合テスト
  - [ ] エラーハンドリング統合テスト
  - [ ] 設定統合テスト

- [ ] **E2Eテストフレームワーク**
  - [ ] CLIシナリオテスト
  - [ ] GitHub Actionsワークフローテスト
  - [ ] クロスプラットフォームテスト
  - [ ] ユーザーシナリオテスト

- [ ] **パフォーマンステスト**
  - [ ] ビルド時間測定
  - [ ] 実行時間測定
  - [ ] メモリ使用量測定
  - [ ] 回帰テスト

#### 4.4 品質保証フレームワーク

- [ ] **自動化品質チェック**
  - [ ] 型チェック自動化
  - [ ] リントチェック自動化
  - [ ] テスト実行自動化
  - [ ] 依存関係チェック自動化

- [ ] **継続的品質監視**
  - [ ] 品質メトリクス収集
  - [ ] 品質レポート生成
  - [ ] 品質回帰検出
  - [ ] 品質改善提案

### 品質保証

#### Phase 4 専用品質チェック

```bash
# Phase 4 品質チェックスイート
echo "🔍 Phase 4 Quality Check"

# 新パッケージの基本チェック
pnpm run build --filter="@esta-cli"
pnpm run build --filter="@esta-github-actions"
pnpm run test:develop --filter="@esta-cli"
pnpm run test:develop --filter="@esta-github-actions"

# 統合テスト
pnpm run test:integration --filter="@esta-cli"
pnpm run test:integration --filter="@esta-github-actions"

# E2Eテスト
pnpm run test:e2e

# パフォーマンステスト
pnpm run test:performance

# 品質チェック
pnpm run lint-all:types --filter="@esta-cli"
pnpm run lint-all:types --filter="@esta-github-actions"
pnpm run check:types --filter="@esta-cli"
pnpm run check:types --filter="@esta-github-actions"

# 依存関係チェック
pnpm exec madge --circular packages/@esta-cli
pnpm exec madge --circular packages/@esta-github-actions
```

#### テストカバレージ目標

- **@esta-cli**: 95%以上
- **@esta-github-actions**: 90%以上
- **統合テスト**: 主要APIの100%カバー
- **E2Eテスト**: 主要ユーザーシナリオの100%カバー

## Phase 4 完了条件

### 技術的完了条件

1. **@esta-cli パッケージが完全動作**
   - 全ての基盤パッケージを統合
   - 型安全なビルダーパターン実装
   - 包括的なテストスイート

2. **@esta-github-actions パッケージが完全動作**
   - GitHub Actions環境で完全動作
   - セキュリティ要件を満たす
   - Actions SDK完全統合

3. **テスト体系が完全稼働**
   - 統合テスト、E2Eテスト、パフォーマンステストが全て動作
   - 品質保証フレームワークが稼働
   - 継続的品質監視が動作

### 機能的完了条件

1. **エンドユーザーAPIの完成**
   - CLI開発者が簡単に使える高レベルAPI
   - GitHub Actions開発者向け特化API
   - 包括的なドキュメントとサンプル

2. **品質保証の完成**
   - 自動化された品質チェック体系
   - 回帰テスト体系
   - パフォーマンス監視体系

### ドキュメント完了条件

1. **ユーザードキュメント**
   - @esta-cli 使用ガイド
   - @esta-github-actions 使用ガイド
   - テンプレートとサンプル

2. **開発者ドキュメント**
   - API リファレンス
   - アーキテクチャドキュメント
   - テスト戦略ドキュメント

---

**Next Phase**: Phase 5 - 最適化とドキュメント整備（Week 8）

Phase 4 の完了により、ESTA システムの統合レイヤーが完成し、エンドユーザーが簡単に使える統一されたAPIと、包括的な品質保証体系が構築されます。
