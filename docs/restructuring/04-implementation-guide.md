---
header:
  - src: docs/restructuring/04-implementation-guide.md
  - @(#) : Implementation guidelines and development methodology
title: 🛠️ 実装ガイドライン（04-implementation-guide）
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

## 04. Implementation Guide - 実装ガイドライン

### 🎯 実装基本方針

#### 開発手法

- t-wada 式 BDD: Behavior-Driven Development による仕様駆動開発
- TDD: Test-Driven Development (RED → GREEN → REFACTOR サイクル)
- 型駆動開発: TypeScript の型システムを活用した設計
- 関数型パラダイム: 純粋関数、不変性、合成可能性の追求

#### コード品質基準

- TypeScript Strict Mode: 完全対応
- Test Coverage: 90%以上維持
- Cyclomatic Complexity: 10以下/関数
- Code Duplication: 5%未満

### 🏗️ アーキテクチャ実装パターン

#### Result<T,E> パターン実装

- 基本実装

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

// ヘルパークラス
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

  static async fromAsyncThrowable<T, E = Error>(
    fn: () => Promise<T>,
    errorMapper?: (error: unknown) => E,
  ): Promise<Result<T, E>> {
    try {
      const value = await fn();
      return this.ok(value);
    } catch (error) {
      const mappedError = errorMapper ? errorMapper(error) : error as E;
      return this.err(mappedError);
    }
  }
}
```

- Result 型のチェーン操作

```typescript
// Result型の合成操作
export class ResultUtils {
  static map<T, U, E>(
    result: Result<T, E>,
    mapper: (value: T) => U,
  ): Result<U, E> {
    return result.ok ? this.ok(mapper(result.value)) : result;
  }

  static flatMap<T, U, E>(
    result: Result<T, E>,
    mapper: (value: T) => Result<U, E>,
  ): Result<U, E> {
    return result.ok ? mapper(result.value) : result;
  }

  static mapError<T, E, F>(
    result: Result<T, E>,
    mapper: (error: E) => F,
  ): Result<T, F> {
    return result.ok ? result : this.err(mapper(result.error));
  }
}

// 使用例
async function processConfig(configPath: string): Promise<Result<ProcessedConfig, ConfigError>> {
  return ResultUtils.fromAsyncThrowable(
    () => fs.readFile(configPath, 'utf-8'),
    (error) => new ConfigError('Failed to read config file', { path: configPath, cause: error }),
  )
    .then((result) => ResultUtils.flatMap(result, (content) => parseConfig(content)))
    .then((result) => ResultUtils.flatMap(result, (config) => validateConfig(config)));
}
```

#### エラーハンドリング実装

- エラークラス階層

```typescript
// packages/@esta-core/esta-error/src/EstaError.ts
export enum ErrorSeverity {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

export abstract class EstaError extends Error {
  abstract readonly code: string;
  abstract readonly context: Record<string, unknown>;

  constructor(
    message: string,
    public readonly severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toString(): string {
    const contextStr = Object.keys(this.context).length > 0
      ? ` Context: ${JSON.stringify(this.context)}`
      : '';
    return `${this.name} [${this.code}]: ${this.message}${contextStr}`;
  }
}

// 具象エラークラス例
export class ConfigError extends EstaError {
  readonly code = 'CONFIG_ERROR';

  constructor(
    message: string,
    public readonly context: {
      filePath?: string;
      lineNumber?: number;
      field?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, ErrorSeverity.HIGH);
  }
}

export class ValidationError extends EstaError {
  readonly code = 'VALIDATION_ERROR';

  constructor(
    message: string,
    public readonly context: {
      field?: string;
      value?: unknown;
      constraint?: string;
    } = {},
  ) {
    super(message, ErrorSeverity.MEDIUM);
  }
}
```

- エラーファクトリパターン

```typescript
// packages/@esta-core/esta-error/src/ErrorFactory.ts
export class ErrorFactory {
  static configError(
    message: string,
    options: { filePath?: string; lineNumber?: number; field?: string; cause?: unknown } = {},
  ): ConfigError {
    return new ConfigError(message, options);
  }

  static validationError(
    field: string,
    value: unknown,
    constraint: string,
  ): ValidationError {
    return new ValidationError(
      `Validation failed for field '${field}': ${constraint}`,
      { field, value, constraint },
    );
  }

  static fromUnknown(error: unknown): EstaError {
    if (error instanceof EstaError) { return error; }
    if (error instanceof Error) {
      return new UnknownError(error.message, { cause: error });
    }
    return new UnknownError('Unknown error occurred', { cause: error });
  }
}
```

#### 依存性注入パターン

- インターフェース設計

```typescript
// packages/@esta-core/tools-config/src/interfaces/ConfigManager.ts
export interface IConfigManager {
  loadConfig(source: string): Promise<Result<ToolConfig[], ConfigError>>;
  validateConfig(config: ToolConfig[]): Result<void, ValidationError>;
  mergeConfigs(base: ToolConfig[], override: ToolConfig[]): Result<ToolConfig[], MergeError>;
}

export interface IConfigLoader {
  load<T>(path: string): Promise<Result<T, ConfigError>>;
}

export interface IConfigValidator {
  validate<T>(data: T, schema: JSONSchema): Result<T, ValidationError>;
}
```

- 具象クラス実装

```typescript
// packages/@esta-core/tools-config/src/CLIConfigManager.ts
export class CLIConfigManager implements IConfigManager {
  constructor(
    private loader: IConfigLoader,
    private validator: IConfigValidator,
    private logger: ILogger,
  ) {}

  async loadConfig(source: string): Promise<Result<ToolConfig[], ConfigError>> {
    this.logger.debug('Loading config from CLI source', { source });

    const loadResult = await this.loader.load<ToolConfig[]>(source);
    if (!loadResult.ok) {
      return ResultUtils.err(ErrorFactory.configError(
        'Failed to load config file',
        { filePath: source, cause: loadResult.error },
      ));
    }

    const validateResult = this.validateConfig(loadResult.value);
    if (!validateResult.ok) {
      return ResultUtils.err(validateResult.error);
    }

    return ResultUtils.ok(loadResult.value);
  }

  validateConfig(config: ToolConfig[]): Result<void, ValidationError> {
    // バリデーション実装
  }

  mergeConfigs(base: ToolConfig[], override: ToolConfig[]): Result<ToolConfig[], MergeError> {
    // マージ実装
  }
}
```

- ファクトリパターン

```typescript
// packages/@esta-core/tools-config/src/ConfigManagerFactory.ts
export class ConfigManagerFactory {
  static create(runtime: Runtime): IConfigManager {
    const loader = this.createLoader(runtime);
    const validator = this.createValidator();
    const logger = this.createLogger(runtime);

    switch (runtime) {
      case Runtime.GITHUB_ACTIONS:
        return new GHAConfigManager(loader, validator, logger);
      default:
        return new CLIConfigManager(loader, validator, logger);
    }
  }

  private static createLoader(runtime: Runtime): IConfigLoader {
    // runtime に応じたローダー作成
  }

  private static createValidator(): IConfigValidator {
    // バリデーター作成
  }

  private static createLogger(runtime: Runtime): ILogger {
    // runtime に応じたロガー作成
  }
}
```

### 🧪 テスト実装ガイドライン

#### atsushifx式BDD実装

- テスト構造パターン

```typescript
// Example: packages/@esta-core/esta-error/src/__tests__/ResultUtils.spec.ts
import { describe, expect, it } from 'vitest';
import { ResultUtils } from '../ResultUtils';

describe('ResultUtils: Result型操作ユーティリティ', () => {
  describe('Scenario: 成功値の生成と操作', () => {
    describe('Given: 有効な値', () => {
      const value = 'test-value';

      it('When: ok()でResult生成 Then: Ok型のResultが返される', () => {
        const result = ResultUtils.ok(value);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toBe(value);
        }
      });

      it('When: map()で値変換 Then: 変換された値のOk型Resultが返される', () => {
        const result = ResultUtils.ok(value);
        const mapped = ResultUtils.map(result, (v) => v.toUpperCase());

        expect(mapped.ok).toBe(true);
        if (mapped.ok) {
          expect(mapped.value).toBe('TEST-VALUE');
        }
      });
    });
  });

  describe('Scenario: エラー値の生成と操作', () => {
    describe('Given: エラーオブジェクト', () => {
      const error = new Error('test error');

      it('When: err()でResult生成 Then: Err型のResultが返される', () => {
        const result = ResultUtils.err(error);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toBe(error);
        }
      });

      it('When: map()で値変換 Then: 元のErr型Resultがそのまま返される', () => {
        const result = ResultUtils.err(error);
        const mapped = ResultUtils.map(result, (v) => v.toString());

        expect(mapped.ok).toBe(false);
        if (!mapped.ok) {
          expect(mapped.error).toBe(error);
        }
      });
    });
  });

  describe('Scenario: 例外処理の安全な変換', () => {
    describe('Given: 例外をスローする関数', () => {
      const throwingFn = () => {
        throw new Error('function error');
      };

      it('When: fromThrowable()で実行 Then: Err型のResultが返される', () => {
        const result = ResultUtils.fromThrowable(throwingFn);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toBeInstanceOf(Error);
          expect(result.error.message).toBe('function error');
        }
      });
    });

    describe('Given: 正常に値を返す関数', () => {
      const successFn = () => 'success';

      it('When: fromThrowable()で実行 Then: Ok型のResultが返される', () => {
        const result = ResultUtils.fromThrowable(successFn);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toBe('success');
        }
      });
    });
  });
});
```

- モック・スタブパターン

```typescript
// packages/@esta-utils/command-runner/src/__tests__/CommandRunner.spec.ts
import { describe, expect, it, vi } from 'vitest';
import { CommandRunner } from '../CommandRunner';
import type { IExecutor, IPlatformDetector, IShellUtils } from '../interfaces';

describe('CommandRunner: クロスプラットフォーム コマンド実行', () => {
  describe('Scenario: Windows環境でのコマンド実行', () => {
    describe('Given: Windows環境とPowerShellシェル', () => {
      // モック作成
      const mockExecutor: IExecutor = {
        exec: vi.fn(),
      };

      const mockPlatformDetector: IPlatformDetector = {
        detect: vi.fn().mockReturnValue({
          platform: Platform.WIN32,
          shell: Shell.POWERSHELL,
        }),
      };

      const mockShellUtils: IShellUtils = {
        quoteArgs: vi.fn().mockImplementation((args) => args.map((arg) => `'${arg}'`)),
      };

      const commandRunner = new CommandRunner(
        mockExecutor,
        mockPlatformDetector,
        mockShellUtils,
      );

      it('When: npm installコマンド実行 Then: 適切にクォートされた引数でexec呼び出し', async () => {
        // Arrange
        const command = 'npm';
        const args = ['install', '@types/node'];
        const expectedResult = {
          exitCode: 0,
          stdout: 'success',
          stderr: '',
          duration: 1000,
        };

        (mockExecutor.exec as any).mockResolvedValue(
          ResultUtils.ok(expectedResult),
        );

        // Act
        const result = await commandRunner.run(command, args);

        // Assert
        expect(result.ok).toBe(true);
        expect(mockShellUtils.quoteArgs).toHaveBeenCalledWith(
          args,
          Shell.POWERSHELL,
        );
        expect(mockExecutor.exec).toHaveBeenCalledWith(
          command,
          ["'install'", "'@types/node'"],
          expect.any(Object),
        );
      });
    });
  });
});
```

#### E2Eテスト実装

- ファイル I/O テストパターン

```typescript
// packages/@esta-utils/config-loader/tests/e2e/ConfigLoader.e2e.spec.ts
import { AgE2eFileIOFramework } from '@agla-e2e/fileio-framework';
import { createTestId } from '@esta-utils/logger';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ConfigLoader } from '../../src/ConfigLoader';

describe('ConfigLoader E2E: 実際のファイル読み込みテスト', () => {
  const testId = createTestId('config-loader-e2e');
  const fileFramework = new AgE2eFileIOFramework(testId);
  const configLoader = new ConfigLoader();

  beforeEach(async () => {
    await fileFramework.setupTestEnvironment();
  });

  afterEach(async () => {
    await fileFramework.cleanupEnvironment();
  });

  describe('Scenario: JSON設定ファイルの読み込み', () => {
    it('When: 有効なJSON設定ファイル読み込み Then: 正しく解析された設定が返される', async () => {
      // Arrange
      const configContent = {
        installer: 'eget',
        name: 'just',
        package: 'casey/just',
        options: { version: 'latest' },
      };

      const configPath = await fileFramework.createConfigFile(
        'test-config.json',
        JSON.stringify(configContent, null, 2),
      );

      // Act
      const result = await configLoader.load(configPath);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(configContent);
      }
    });

    it('When: 存在しないファイル読み込み Then: ConfigErrorが返される', async () => {
      // Act
      const result = await configLoader.load('/nonexistent/config.json');

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ConfigError);
        expect(result.error.code).toBe('CONFIG_ERROR');
      }
    });
  });
});
```

### 📦 パッケージ実装パターン

#### パッケージ構造標準化

```bash
packages/@namespace/package-name/
├── src/                    # ソースコード
│   ├── index.ts           # メインエントリ
│   ├── types.ts           # 型定義
│   ├── interfaces/        # インターフェース定義
│   ├── implementations/   # 具象実装
│   ├── utils/            # ユーティリティ
│   └── __tests__/        # ユニットテスト
├── tests/                 # 統合・E2Eテスト
│   ├── integration/      # 統合テスト
│   └── e2e/             # E2Eテスト
├── configs/              # パッケージ固有設定
├── shared/               # パッケージ内共有
│   ├── types/           # 共有型定義
│   └── constants/       # 共有定数
├── lib/                 # CJSビルド出力
├── module/              # ESMビルド出力
├── package.json         # パッケージ定義
├── tsconfig.json        # TypeScript設定
└── README.md           # パッケージドキュメント
```

#### package.json テンプレート

```json
{
  "name": "@esta-core/package-name",
  "version": "0.1.0",
  "description": "Package description",
  "type": "module",
  "main": "./lib/index.js",
  "module": "./module/index.js",
  "types": "./lib/index.d.ts",
  "exports": {
    ".": {
      "types": "./lib/index.d.ts",
      "import": "./module/index.js",
      "require": "./lib/index.cjs"
    }
  },
  "files": ["lib", "module"],
  "scripts": {
    "build": "pnpm run build:cjs && pnpm run build:esm",
    "build:cjs": "tsup --config ./configs/tsup.config.ts",
    "build:esm": "tsup --config ./configs/tsup.config.module.ts",
    "clean": "rimraf lib module .cache",
    "check:types": "tsc --noEmit --incremental",
    "lint:all": "pnpm run lint && pnpm run lint:types",
    "test:develop": "vitest run --config ./configs/vitest.config.unit.ts",
    "test:ci": "vitest run --config ./configs/vitest.config.integration.ts",
    "test:e2e": "vitest run --config ./configs/vitest.config.e2e.ts"
  },
  "dependencies": {
    "@shared/types": "workspace:*",
    "@shared/constants": "workspace:*"
  }
}
```

#### TypeScript設定パターン

```json
// packages/@esta-core/package-name/tsconfig.json
{
  "extends": "../../../base/configs/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./lib",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../../../shared/packages/*"],
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["lib", "module", "**/*.spec.ts", "tests"]
}
```

### 🔧 開発ツール・自動化

#### 設定同期自動化

```bash
#!/bin/bash
# scripts/sync-configs.sh

# 基本設定の同期
cp base/configs/tsconfig.base.json packages/*/tsconfig.json
cp base/configs/eslint.config.base.js packages/*/configs/eslint.config.js

# パッケージ固有の調整
find packages -name "tsconfig.json" -exec sed -i 's/PLACEHOLDER/ACTUAL/g' {} \;

echo "Config synchronization completed"
```

#### import パス更新自動化

```typescript
// scripts/update-imports.ts
import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';

const IMPORT_MAPPINGS = {
  '@agla-utils/ag-logger': '@esta-utils/logger',
  '@esta-utils/get-platform': '@esta-system/platform',
  // 他のマッピング
};

async function updateImports() {
  const tsFiles = await glob('packages/**/*.ts');

  for (const file of tsFiles) {
    let content = await readFile(file, 'utf-8');
    let updated = false;

    for (const [oldImport, newImport] of Object.entries(IMPORT_MAPPINGS)) {
      const oldPattern = new RegExp(`from ['"]${oldImport}['"]`, 'g');
      if (oldPattern.test(content)) {
        content = content.replace(oldPattern, `from '${newImport}'`);
        updated = true;
      }
    }

    if (updated) {
      await writeFile(file, content);
      console.log(`Updated imports in ${file}`);
    }
  }
}
```

#### Git hooks設定

```yaml
# .lefthook.yml
pre-commit:
  commands:
    type-check:
      run: pnpm run check:types
    lint:
      run: pnpm run lint-all:types
    format:
      run: pnpm run check:dprint
    test:
      run: pnpm run test:develop
    spells:
      run: pnpm run check:spells

pre-push:
  commands:
    build:
      run: pnpm run build
    test-ci:
      run: pnpm run test:ci
```

### 📚 ドキュメント実装

#### API仕様書テンプレート

```markdown
# @esta-core/package-name API 仕様書

## 概要

パッケージの責務と主要機能の説明

## インストール

\`\`\`bash
pnpm add @esta-core/package-name
\`\`\`

## 基本的な使用方法

\`\`\`typescript
import { MainClass } from '@esta-core/package-name';

const instance = new MainClass();
const result = await instance.process();
\`\`\`

## API リファレンス

### クラス: MainClass

#### メソッド: process()

- 説明: 処理の実行
- パラメータ: なし
- 戻り値: `Promise<Result<ProcessResult, ProcessError>>`
- 例外: なし（Result型でエラー処理）

## 型定義

\`\`\`typescript
export interface ProcessResult {
success: boolean;
data: ProcessedData;
}
\`\`\`

## エラーハンドリング

このパッケージは Result<T,E> パターンを使用します。

## 設定

設定項目の詳細説明

## 例とユースケース

実際の使用例の提示
```

---

このガイドラインに従って、各フェーズの実装を進めることで、統一性と品質を保ちながら目標アーキテクチャを実現します。
