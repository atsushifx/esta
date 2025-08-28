---
header:
  - src: docs/restructuring/05-quality-assurance.md
  - @(#) : Quality assurance and testing strategy
title: 🔍 品質保証・テスト戦略（05-quality-assurance）
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

## 05. Quality Assurance - 品質保証・テスト戦略

### 🎯 品質保証目標

#### 品質指標

- Test Coverage: 90%以上
- Type Coverage: 100% (TypeScript strict mode)
- Code Duplication: 5%未満
- Cyclomatic Complexity: 10以下/関数
- Security Vulnerabilities: 0件 (Critical/High)

#### 品質ゲート

各フェーズ完了時に、基準のクリアを確認:

| 項目           | 基準       | 測定方法                  |
| -------------- | ---------- | ------------------------- |
| ビルド成功     | 100%       | `pnpm run build`          |
| 型チェック     | エラー0件  | `pnpm run check:types`    |
| Linting        | エラー0件  | `pnpm run lint-all:types` |
| ユニットテスト | 成功率100% | `pnpm run test:develop`   |
| 統合テスト     | 成功率100% | `pnpm run test:ci`        |
| E2Eテスト      | 成功率100% | `pnpm run test:e2e`       |
| スペルチェック | エラー0件  | `pnpm run check:spells`   |
| フォーマット   | 不整合0件  | `pnpm run check:dprint`   |

### 🧪 テスト戦略

#### テスト分類・責務

1. ユニットテスト (Unit Tests)
   責務: 個別の関数・クラス・モジュールの動作検証

   範囲:
   - 純粋関数のロジック検証
   - クラスメソッドの動作検証
   - 境界値・エッジケースの処理
   - エラーハンドリングの正確性

   実装方針:

   ```typescript
   // Example: ResultUtils のユニットテスト
   describe('ResultUtils: 個別関数の動作検証', () => {
     describe('ok() function', () => {
       it('Should create Ok result with given value', () => {
         const value = 'test';
         const result = ResultUtils.ok(value);

         expect(result.ok).toBe(true);
         if (result.ok) {
           expect(result.value).toBe(value);
         }
       });
     });

     describe('map() function', () => {
       it('Should transform Ok result value', () => {
         const result = ResultUtils.ok(5);
         const mapped = ResultUtils.map(result, (x) => x * 2);

         expect(mapped.ok).toBe(true);
         if (mapped.ok) {
           expect(mapped.value).toBe(10);
         }
       });

       it('Should preserve Err result unchanged', () => {
         const error = new Error('test error');
         const result = ResultUtils.err(error);
         const mapped = ResultUtils.map(result, (x) => x * 2);

         expect(mapped.ok).toBe(false);
         if (!mapped.ok) {
           expect(mapped.error).toBe(error);
         });
       });
   });
   ```

   カバレージ目標: 95%以上。

2. 統合テスト (Integration Tests)
   責務: パッケージ間・コンポーネント間の連携動作検証。

   範囲:
   - 複数クラス間の相互作用
   - 依存性注入の動作
   - データフローの正確性
   - エラー伝播の検証

   実装方針:

   ```typescript
   // Example: ConfigManagerとConfigLoaderの統合テスト
   describe('ConfigManager Integration: コンポーネント間連携テスト', () => {
     let configManager: CLIConfigManager;
     let mockLoader: jest.Mocked<IConfigLoader>;
     let mockValidator: jest.Mocked<IConfigValidator>;

     beforeEach(() => {
       mockLoader = createMockLoader();
       mockValidator = createMockValidator();
       configManager = new CLIConfigManager(mockLoader, mockValidator);
     });

     describe('loadConfig() integration', () => {
       it('Should handle loader success and validator success', async () => {
         // Arrange
         const mockConfig = [{ installer: 'eget', name: 'just', package: 'casey/just' }];
         mockLoader.load.mockResolvedValue(ResultUtils.ok(mockConfig));
         mockValidator.validate.mockReturnValue(ResultUtils.ok(undefined));

         // Act
         const result = await configManager.loadConfig('/path/to/config.json');

         // Assert
         expect(result.ok).toBe(true);
         expect(mockLoader.load).toHaveBeenCalledWith('/path/to/config.json');
         expect(mockValidator.validate).toHaveBeenCalledWith(mockConfig);
       });

       it('Should handle loader failure properly', async () => {
         // Arrange
         const loaderError = new ConfigError('File not found');
         mockLoader.load.mockResolvedValue(ResultUtils.err(loaderError));

         // Act
         const result = await configManager.loadConfig('/invalid/path.json');

         // Assert
         expect(result.ok).toBe(false);
         if (!result.ok) {
           expect(result.error).toBeInstanceOf(ConfigError);
         }
         expect(mockValidator.validate).not.toHaveBeenCalled();
       });
     });
   });
   ```

   カバレージ目標: 85%以上。

3. E2E テスト (End-to-End Tests)
   責務: 実際の使用シナリオでのシステム全体動作検証。

   範囲:
   - 実ファイルシステムでの動作
   - 実際のコマンド実行
   - 複数パッケージ横断のワークフロー
   - パフォーマンス特性

   実装方針:

   ```typescript
   // Example: ツールインストールのE2Eテスト
   describe('Tools Installation E2E: 実際のインストールシナリオ', () => {
     const testId = createTestId('tools-installation-e2e');
     const fileFramework = new AgE2eFileIOFramework(testId);

     beforeEach(async () => {
       await fileFramework.setupTestEnvironment();
     });

     afterEach(async () => {
       await fileFramework.cleanupEnvironment();
     });

     describe('Complete installation workflow', () => {
       it('Should install tool from config file successfully', async () => {
         // Arrange
         const configContent = {
           installer: 'eget',
           name: 'just',
           package: 'casey/just',
           options: { version: 'latest', installDir: '.tools/bin' },
         };

         const configPath = await fileFramework.createConfigFile(
           'tools.json',
           JSON.stringify(configContent),
         );

         const toolsInstaller = new ToolsInstaller(
           new CLIConfigManager(),
           new CommandRunner(),
           new Logger(),
         );

         // Act
         const result = await toolsInstaller.install({
           configPath,
           installDir: '.tools/bin',
         });

         // Assert
         expect(result.ok).toBe(true);

         // 実際にツールがインストールされたか確認
         const toolPath = path.join('.tools/bin/just');
         expect(await fs.exists(toolPath)).toBe(true);

         // ツールが実行可能か確認
         const execResult = await new CommandRunner().run(toolPath, ['--version']);
         expect(execResult.ok).toBe(true);
       });
     });
   });
   ```

   カバレージ目標: 主要ワークフロー100%網羅。

4. パフォーマンステスト
   責務: 性能要件の検証とベースライン比較

   測定項目:
   - 初期化時間: 100ms 以下
   - 設定ファイル読み込み: 50ms 以下/ファイル
   - コマンド実行オーバーヘッド: 10%以下
   - メモリ使用量: ベースライン比較

   実装方針:

   ```typescript
   describe('Performance Tests: パフォーマンス要件検証', () => {
     describe('Initialization performance', () => {
       it('Should initialize within 100ms', async () => {
         const start = performance.now();

         const configManager = ConfigManagerFactory.create(Runtime.NODE);

         const end = performance.now();
         const duration = end - start;

         expect(duration).toBeLessThan(100);
       });
     });

     describe('Config loading performance', () => {
       it('Should load config file within 50ms', async () => {
         const configPath = createTestConfigFile();
         const configManager = new CLIConfigManager();

         const start = performance.now();
         await configManager.loadConfig(configPath);
         const end = performance.now();

         expect(end - start).toBeLessThan(50);
       });
     });
   });
   ```

#### MockLoggerリファクタリング特化テスト戦略

- atsushifx 式 BDD 実装要件

実装サイクル:

1. **RED: 失敗するテストを作成
2. **GREEN: 最小限の実装でテスト通過
3. **REFACTOR: コード品質向上とリファクタリング

テスト記述原則:

- 1つのテストは 1つの期待値のみ検証
- 自然言語的な記述 (Given/When/Then)
- テスト名は実行内容を明確に表現

具体例:

```typescript
describe('LogBufferManager: ログバッファ管理中核機能', () => {
  describe('Scenario: メッセージ追加とバッファオーバーフロー検出', () => {
    describe('Given: 初期化済みLogBufferManager', () => {
      let bufferManager: LogBufferManager;

      beforeEach(() => {
        bufferManager = new LogBufferManager();
      });

      it('When: 有効ログレベルでメッセージ追加 Then: 成功Resultが返される', () => {
        // RED フェーズ: 失敗するテストから開始
        const result = bufferManager.addMessage(AG_LOGLEVEL.INFO, 'test message');

        expect(result.ok).toBe(true);
      });

      it('When: 無効ログレベルでメッセージ追加 Then: ValidationErrorが返される', () => {
        const invalidLevel = -1 as AgLogLevel;

        const result = bufferManager.addMessage(invalidLevel, 'test message');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toBeInstanceOf(MockLoggerValidationError);
          expect(result.error.context.level).toBe(invalidLevel);
        }
      });

      it('When: バッファサイズ上限超過 Then: ResourceErrorが返される', () => {
        // 1000件のメッセージを追加してオーバーフローをトリガー
        for (let i = 0; i < 1000; i++) {
          const result = bufferManager.addMessage(AG_LOGLEVEL.INFO, `message ${i}`);
          expect(result.ok).toBe(true);
        }

        // 1001件目でオーバーフロー
        const overflowResult = bufferManager.addMessage(AG_LOGLEVEL.INFO, 'overflow message');

        expect(overflowResult.ok).toBe(false);
        if (!overflowResult.ok) {
          expect(overflowResult.error).toBeInstanceOf(MockLoggerResourceError);
          expect(overflowResult.error.context.bufferSize).toBe(1000);
        }
      });
    });
  });
});
```

### 🔍 静的解析・コード品質

#### ESLint設定強化

##### TypeScript特化ルール

```javascript
// configs/eslint.config.strict.js
export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      // 型安全性強化
      '@typescript-eslint/no-any': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // Result型強制
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',

      // 関数型プログラミング推奨
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'error',

      // 命名規則
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
        { selector: 'typeAlias', format: ['PascalCase'] },
        { selector: 'enum', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['UPPER_CASE'] },
      ],
    },
  },
];
```

##### カスタムルール

```javascript
// custom-rules/result-type-usage.js
module.exports = {
  create(context) {
    return {
      FunctionDeclaration(node) {
        // 例外をスローする関数の検出
        if (hasThrowStatement(node) && !returnsResult(node)) {
          context.report({
            node,
            message: 'Functions should return Result<T,E> instead of throwing exceptions',
          });
        }
      },
    };
  },
};
```

#### セキュリティ監査

##### 脆弱性スキャン

```bash
#!/bin/bash
# scripts/security-audit.sh

echo "Running security audit..."

# 依存関係の脆弱性チェック
pnpm audit --audit-level moderate

# Secretsの検出
pnpm run lint:secrets

# TypeScriptの安全でないパターンチェック
pnpm exec eslint --config ./configs/eslint.config.security.js packages/**/*.ts

# 終了コードの確認
if [ $? -eq 0 ]; then
  echo "Security audit passed"
  exit 0
else
  echo "Security audit failed"
  exit 1
fi
```

##### セキュリティ特化ESLintルール

```javascript
// configs/eslint.config.security.js
export default [
  {
    files: ['**/*.ts'],
    rules: {
      // 安全でないパターンの禁止
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // 機密情報の検出
      'no-secrets/no-secrets': 'error',

      // プロトタイプ汚染防止
      'security/detect-object-injection': 'error',

      // コマンドインジェクション防止
      'security/detect-child-process': 'error',
      'security/detect-non-literal-fs-filename': 'error',
    },
  },
];
```

### 📊 継続的インテグレーション

#### GitHub Actions ワークフロー

##### 品質チェックパイプライン

```yaml
# .github/workflows/quality-check.yml
name: Quality Check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality-check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm run check:types

      - name: Lint check
        run: pnpm run lint-all:types

      - name: Format check
        run: pnpm run check:dprint

      - name: Spell check
        run: pnpm run check:spells

      - name: Build
        run: pnpm run build

      - name: Unit tests
        run: pnpm run test:develop

      - name: Integration tests
        run: pnpm run test:ci

      - name: E2E tests
        run: pnpm run test:e2e

      - name: Security audit
        run: ./scripts/security-audit.sh

      - name: Coverage report
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

##### マルチ環境テスト

```yaml
# .github/workflows/cross-platform-test.yml
name: Cross Platform Test

on:
  pull_request:
    branches: [main]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm run build

      - name: Test
        run: pnpm run test:all
```

#### 品質メトリクス監視

##### カバレージ追跡

```typescript
// vitest.config.base.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        global: {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
      exclude: [
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/configs/**',
        '**/node_modules/**',
      ],
    },
  },
});
```

##### パフォーマンス監視

```javascript
// scripts/performance-monitor.js
const { performance } = require('perf_hooks');

async function measurePerformance() {
  const measurements = {};

  // ビルド時間測定
  const buildStart = performance.now();
  await execAsync('pnpm run build');
  measurements.buildTime = performance.now() - buildStart;

  // テスト実行時間測定
  const testStart = performance.now();
  await execAsync('pnpm run test:develop');
  measurements.testTime = performance.now() - testStart;

  // バンドルサイズ測定
  measurements.bundleSize = await getBundleSize();

  // 結果をGitHub Actionsに出力
  console.log(`::set-output name=build-time::${measurements.buildTime}`);
  console.log(`::set-output name=test-time::${measurements.testTime}`);
  console.log(`::set-output name=bundle-size::${measurements.bundleSize}`);

  return measurements;
}
```
