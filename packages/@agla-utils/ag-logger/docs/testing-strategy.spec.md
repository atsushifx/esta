---
header:
- src: testing-strategy.spec.md
- @(#): ag-logger テスト戦略 仕様書
title: ag-logger テスト戦略 仕様書
description: ag-loggerパッケージを現代的な関数型プログラミングパターンを用いてリファクタリングする仕様書
version: 1.0.0
created: 2025-07-22
updated: 2025-07-22
authors:
  - atsushifx
changes:
  - 2025-07-22: 初回作成（ドキュメント整備）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

ag-logger関数型リファクタリングにおけるt-wada式TDD実行戦略を定義する。Red-Green-Refactorサイクルを厳密に適用し、既存機能の安全性を保証しつつ、新機能の確実な実装を実現する。

---

## t-wada式TDD実行手順

### 基本サイクル

1. **テストリスト作成** - 実装すべき機能をテストケースとして列挙
2. **Red** - 失敗するテストを1つ作成
3. **Green** - テストを通す最小限のコードを実装
4. **Refactor** - コード品質を向上させる（テストは維持）
5. **繰り返し** - 次のテストケースへ移行

### 厳密な実行ルール

```typescript
// ✅ 正しいTDDサイクル
describe('formatLogMessage', () => {
  // Red: 失敗するテストを1つだけ作成
  it('should format basic message with level', () => {
    const result = formatLogMessage(AG_LOG_LEVEL.INFO, 'test');
    expect(result.level).toBe('INFO');
    expect(result.message).toBe('test');
  });

  // この時点で実装は存在せず、テストは失敗する
});

// Green: 最小限の実装
export const formatLogMessage = (level: AgTLogLevel, message: string) => ({
  level: 'INFO', // ハードコード（最小実装）
  message: message,
  timestamp: new Date(),
  args: []
});

// Refactor: より良い実装に改善
const LEVEL_MAP = { ... };
export const formatLogMessage = (level: AgTLogLevel, ...args: unknown[]) => ({
  level: LEVEL_MAP[level],
  message: extractMessage(args),
  timestamp: new Date(),
  args: extractArgs(args)
});
```

---

## 既存テスト保護戦略

### 1. テスト実行順序

```bash
# 各フェーズでの必須テスト実行順序
1. 新機能ユニットテスト実行
   pnpm exec vitest run --config ./configs/vitest.config.unit.ts

2. 既存ユニットテスト実行（退行検知）
   pnpm run test:develop

3. 統合テスト実行
   pnpm exec vitest run --config ./configs/vitest.config.integration.ts

4. 既存E2Eテスト実行（完全後方互換性確認）
   pnpm run test:e2e

5. 全テスト並列実行（最終確認）
   pnpm run test:all
```

### 2. テスト隔離戦略

```typescript
// 新機能テスト用ディレクトリ構成
src/
├── functional/
│   ├── __tests__/              # 純関数ユニットテスト
│   │   ├── formatLogMessage.spec.ts
│   │   ├── shouldLogAtLevel.spec.ts
│   │   └── processLogMessage.spec.ts
│
tests/
├── integration/
│   ├── functional/                 # 関数型統合テスト
│   │    └── functional-pipeline.spec.ts
│   └── compatibility/              # 互換性テスト
│        ├── legacy-api.spec.ts     # 既存APIの動作確認
│        └── migration.spec.ts      # 段階的移行テスト
│
└── e2e/                       # 既存E2Eテスト（変更なし）
    ├── AgLogger.json.spec.ts
    ├── AgLogger.plain.spec.ts
    └── AgLogger.parameterOmission.spec.ts
```

### 3. 後方互換性監視

```typescript
// 既存APIの完全互換性テスト
describe('Legacy API Compatibility', () => {
  beforeEach(() => {
    // 各テスト前にシングルトンをリセット
    AgLogger.resetSingleton();
  });

  it('should maintain exact same behavior for getLogger', () => {
    // 既存の使用パターンをテスト
    const logger1 = getLogger(ConsoleLogger, JsonFormat);
    const logger2 = getLogger(ConsoleLogger, JsonFormat);

    expect(logger1).toBe(logger2); // シングルトン動作維持

    // 既存のログ出力をテスト
    const mockConsole = vi.spyOn(console, 'info').mockImplementation();
    logger1.info('test message', { data: 'test' });

    // 出力形式の完全一致を確認
    expect(mockConsole).toHaveBeenCalledWith(
      expect.stringMatching(/.*test message.*/), // 既存と同じ形式
    );
  });
});
```

---

## 純関数テスト戦略

### 1. 純関数の特性活用

```typescript
// 純関数テストの利点を最大活用
describe('formatLogMessage (Pure Function)', () => {
  // 決定的動作テスト
  it('should return identical results for identical inputs', () => {
    const input1 = formatLogMessage(AG_LOG_LEVEL.INFO, 'test');
    const input2 = formatLogMessage(AG_LOG_LEVEL.INFO, 'test');

    // タイムスタンプ以外は完全一致
    expect(input1.level).toBe(input2.level);
    expect(input1.message).toBe(input2.message);
    expect(input1.args).toEqual(input2.args);
  });

  // 副作用なしテスト
  it('should not modify input arguments', () => {
    const originalArgs = ['message', { data: 'test' }];
    const argsCopy = [...originalArgs];

    formatLogMessage(AG_LOG_LEVEL.INFO, ...originalArgs);

    expect(originalArgs).toEqual(argsCopy);
  });

  // イミュータブル戻り値テスト
  it('should return frozen (immutable) objects', () => {
    const result = formatLogMessage(AG_LOG_LEVEL.INFO, 'test');

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.args)).toBe(true);
  });
});
```

### 2. プロパティベーステスト

```typescript
// より堅牢なテストのためのプロパティテスト
import fc from 'fast-check';

describe('formatLogMessage Property Tests', () => {
  it('should always return valid LogMessage structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(AG_LOG_LEVEL)),
        fc.array(fc.anything()),
        (level, args) => {
          const result = formatLogMessage(level, ...args);

          // 基本構造の検証
          expect(result).toHaveProperty('level');
          expect(result).toHaveProperty('message');
          expect(result).toHaveProperty('timestamp');
          expect(result).toHaveProperty('args');

          // 型の検証
          expect(typeof result.level).toBe('string');
          expect(typeof result.message).toBe('string');
          expect(result.timestamp).toBeInstanceOf(Date);
          expect(Array.isArray(result.args)).toBe(true);
        },
      ),
    );
  });
});
```

---

## 並列テスト実行対応

### 1. Vitestの並列実行設定

```typescript
// configs/vitest.config.unit.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 並列実行を有効化
    threads: true,
    maxThreads: 4,
    minThreads: 2,

    // テスト隔離を強化
    isolate: true,

    // 並列実行でのタイムアウト調整
    testTimeout: 10000,
    hookTimeout: 10000,

    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.spec.ts', '**/dist/**'],
    },
  },
});
```

### 2. テスト間隔離の保証

```typescript
// シングルトンのリセット戦略
describe('Parallel Test Safe Setup', () => {
  // 各テスト前にクリーンな状態を保証
  beforeEach(() => {
    // 既存シングルトンのリセット
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();

    // モックのクリア
    vi.clearAllMocks();

    // 新機能用の関数型実装は状態を持たないためリセット不要
  });

  // テスト実行後のクリーンアップ
  afterEach(() => {
    // テスト固有の状態をクリア
    vi.restoreAllMocks();
  });
});
```

### 3. 関数型実装のテスト並列化メリット

```typescript
// 関数型実装は並列テストに最適
describe('Functional Implementation Parallel Tests', () => {
  // これらのテストは完全に独立して並列実行可能
  it.concurrent('should format message concurrently 1', async () => {
    const result = formatLogMessage(AG_LOG_LEVEL.INFO, 'concurrent test 1');
    expect(result.message).toBe('concurrent test 1');
  });

  it.concurrent('should format message concurrently 2', async () => {
    const result = formatLogMessage(AG_LOG_LEVEL.ERROR, 'concurrent test 2');
    expect(result.message).toBe('concurrent test 2');
  });

  // 純関数なので状態競合なし
  it.concurrent('should handle complex args concurrently', async () => {
    const complexData = { nested: { data: Math.random() } };
    const result = formatLogMessage(AG_LOG_LEVEL.DEBUG, 'complex', complexData);

    expect(result.args).toContain(complexData);
  });
});
```

---

## パフォーマンステスト戦略

### 1. ベンチマークテスト

```typescript
// 既存実装vs新実装のパフォーマンス比較
describe('Performance Benchmarks', () => {
  const iterations = 10000;

  it('should maintain or improve performance vs legacy implementation', () => {
    // 既存実装のベンチマーク
    const legacyStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.info('benchmark test', { iteration: i });
    }
    const legacyTime = performance.now() - legacyStart;

    // 新実装のベンチマーク
    const functionalStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      const message = formatLogMessage(AG_LOG_LEVEL.INFO, 'benchmark test', { iteration: i });
      const formatted = JsonFormat(message);
      ConsoleLogger(formatted);
    }
    const functionalTime = performance.now() - functionalStart;

    // 性能回帰なしを確認（10%の余裕）
    expect(functionalTime).toBeLessThan(legacyTime * 1.1);
  });
});
```

### 2. メモリリークテスト

```typescript
describe('Memory Leak Tests', () => {
  it('should not create memory leaks with repeated config updates', () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // 大量の設定更新
    let config = DEFAULT_LOGGER_CONFIG;
    for (let i = 0; i < 10000; i++) {
      config = updateConfig(config, { verbose: i % 2 === 0 });
    }

    // ガベージコレクション実行
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // メモリ増加量が妥当な範囲内
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB以下
  });
});
```

---

## カバレッジ維持戦略

### 1. カバレッジ目標値

```typescript
// vitest.config.ts でのカバレッジ設定
export default defineConfig({
  test: {
    coverage: {
      // カバレッジ目標値
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 95,
        lines: 95,
      },

      // カバレッジ必須ファイル
      include: [
        'src/**/*.ts',
        'src/functional/**/*.ts',
      ],

      // カバレッジ除外対象
      exclude: [
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/dist/**',
        '**/node_modules/**',
        'src/types/**', // 型定義ファイル
      ],
    },
  },
});
```

### 2. カバレッジの段階的向上

```typescript
// 各フェーズでのカバレッジ目標
const COVERAGE_TARGETS = {
  'Phase 1 - Pure Functions': {
    statements: 100, // 純関数は完全カバレッジ可能
    branches: 100,
    functions: 100,
  },
  'Phase 2 - Config Management': {
    statements: 95, // バリデーション分岐により若干低下
    branches: 90,
  },
  'Phase 3 - Factory Functions': {
    statements: 90, // レガシー互換性レイヤー含む
    branches: 85,
  },
  'Phase 4 - Plugin System': {
    statements: 95,
    branches: 90,
  },
  'Phase 5 - Error Handling': {
    statements: 98, // エラーパターンの網羅
    branches: 95,
  },
};
```

---

## CI/CD統合戦略

### 1. GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      # 依存関係のインストール
      - run: pnpm install --frozen-lockfile

      # 段階的テスト実行
      - name: Unit Tests
        run: pnpm run test:develop

      - name: Integration Tests
        run: pnpm run test:integration

      - name: E2E Tests
        run: pnpm run test:e2e

      - name: Parallel Test Execution
        run: pnpm exec vitest run --reporter=verbose --threads=4

      # コード品質チェック
      - name: Type Check
        run: pnpm run check:types

      - name: Lint Check
        run: pnpm run lint-all:types

      - name: Coverage Report
        run: pnpm exec vitest run --coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

### 2. プリコミットフック

```bash
# .lefthook.yml
pre-commit:
  parallel: true
  commands:
    types:
      run: pnpm run check:types

    lint:
      run: pnpm run lint-all:types

    test-changed:
      # 変更ファイルに関連するテストのみ実行
      run: pnpm exec vitest run --changed --reporter=verbose

    test-functional:
      # 新機能のテストを必ず実行
      run: pnpm exec vitest run src/functional --reporter=verbose
```

---

## デバッグとトラブルシューティング

### 1. テスト失敗時のデバッグ戦略

```typescript
// デバッグ用ヘルパー関数
const debugLogMessage = (logMessage: LogMessage) => {
  console.debug('LogMessage Debug:', {
    level: logMessage.level,
    message: logMessage.message,
    timestamp: logMessage.timestamp.toISOString(),
    args: logMessage.args,
    argsTypes: logMessage.args.map((arg) => typeof arg),
  });
};

// テスト内でのデバッグ使用例
describe('formatLogMessage debugging', () => {
  it('should debug complex message formatting', () => {
    const result = formatLogMessage(
      AG_LOG_LEVEL.INFO,
      'Complex',
      42,
      { user: 'test' },
      'message',
    );

    // デバッグ出力（テスト失敗時のみ有効）
    if (process.env.DEBUG_TESTS) {
      debugLogMessage(result);
    }

    expect(result.message).toBe('Complex 42 message');
    expect(result.args).toEqual([{ user: 'test' }]);
  });
});
```

### 2. 段階的ロールバック手順

```typescript
// フィーチャーフラグによる段階的無効化
const FEATURE_FLAGS = {
  USE_FUNCTIONAL_FORMAT: process.env.USE_FUNCTIONAL_FORMAT !== 'false',
  USE_IMMUTABLE_CONFIG: process.env.USE_IMMUTABLE_CONFIG !== 'false',
  USE_FACTORY_PATTERN: process.env.USE_FACTORY_PATTERN !== 'false',
};

// ロールバック可能な実装
export const formatLogMessage = FEATURE_FLAGS.USE_FUNCTIONAL_FORMAT
  ? functionalFormatLogMessage
  : legacyFormatLogMessage;
```

### 3. パフォーマンス監視

```typescript
// テスト実行時間の監視
describe('Performance Monitoring', () => {
  it('should complete within performance budget', () => {
    const start = performance.now();

    // 大量処理の実行
    for (let i = 0; i < 1000; i++) {
      formatLogMessage(AG_LOG_LEVEL.INFO, `message ${i}`, { data: i });
    }

    const duration = performance.now() - start;

    // パフォーマンス予算：1000回で100ms以下
    expect(duration).toBeLessThan(100);
  });
});
```

この戦略により、t-wada式TDDを完璧に実行し、安全で確実な関数型リファクタリングを実現します。
