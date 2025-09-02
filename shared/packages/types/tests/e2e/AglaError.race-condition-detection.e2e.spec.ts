import { describe, expect, it } from 'vitest';
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.js';
import type { AglaErrorContext } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// E-005-01: 競合状態でのエラー発生・処理テスト用型定義

/**
 * 競合状態発生時のコンテキスト情報
 * E-005-01用の専用型定義
 */
type RaceConditionContext = AglaErrorContext & {
  /** 競合したオペレーション一覧: 競合検出のため */
  readonly conflictingOperations: readonly {
    readonly operationId: string;
    readonly threadId: number;
    readonly startTime: number;
    readonly resource: string;
  }[];
  /** 競合したリソース名 */
  readonly conflictedResource: string;
  /** 競合検出時刻（ミリ秒） */
  readonly detectionTime: number;
  /** 競合解決方法 */
  readonly resolutionStrategy: 'retry' | 'abort' | 'queue' | 'merge';
  /** 競合回数 */
  readonly conflictCount: number;
};

// シミュレーション関数の戻り値型
type RaceConditionSimulationResult = {
  readonly error: TestAglaError;
  readonly context: RaceConditionContext;
};

// シミュレーション関数 - RED段階では未実装（エラーを投げる）

/**
 * 競合状態をシミュレートする関数
 * E-005-01: 複数スレッドでの同一リソースアクセス競合確認用
 */
const simulateRaceCondition = async (): Promise<RaceConditionSimulationResult> => {
  // GREEN段階: 最小実装 - テストを通すために必要最小限の実装
  const detectionTime = Date.now();
  const conflictedResource = 'shared-memory-buffer';

  // 2つの競合オペレーションをシミュレート
  const conflictingOperations = [
    {
      operationId: 'op-001-thread-A',
      threadId: 1001,
      startTime: detectionTime - 50,
      resource: conflictedResource,
    },
    {
      operationId: 'op-002-thread-B',
      threadId: 1002,
      startTime: detectionTime - 45,
      resource: conflictedResource,
    },
  ] as const;

  const context: RaceConditionContext = {
    conflictingOperations,
    conflictedResource,
    detectionTime,
    resolutionStrategy: 'retry',
    conflictCount: 1,
  };

  const error = new TestAglaError(
    'RACE_CONDITION_DETECTED',
    `Race condition detected on resource '${conflictedResource}' between ${conflictingOperations.length} operations`,
    {
      code: 'E_RACE_CONDITION',
      severity: ErrorSeverity.ERROR,
      context,
    },
  );

  return { error, context };
};

describe('Given AglaError in concurrent processing environment', () => {
  describe('When E-005-01 race conditions occur between multiple operations', () => {
    it('Then 競合状態検出: conflictingOperations配列に競合した2つのオペレーションが記録される', async () => {
      // Arrange: 競合状態シミュレーションの準備

      // Act: 競合状態シミュレーション実行
      const result = await simulateRaceCondition();
      const raceConditionError = result.error;

      // Assert: 競合オペレーション情報の検証
      const context = raceConditionError.context as RaceConditionContext;
      expect(context.conflictingOperations).toHaveLength(2);
      expect(context.conflictingOperations[0].operationId).toBeDefined();
      expect(context.conflictingOperations[1].operationId).toBeDefined();
      expect(context.conflictingOperations[0].threadId).not.toBe(
        context.conflictingOperations[1].threadId,
      );
    });

    it('Then 競合リソース特定: conflictedResourceに競合したリソース名が記録される', async () => {
      // Arrange & Act
      const result = await simulateRaceCondition();
      const raceConditionError = result.error;

      // Assert: 競合リソース情報の検証
      const context = raceConditionError.context as RaceConditionContext;
      expect(context.conflictedResource).toBeDefined();
      expect(typeof context.conflictedResource).toBe('string');
      expect(context.conflictedResource.length).toBeGreaterThan(0);
    });

    it('Then 競合解決戦略: resolutionStrategyに適切な解決方法が設定される', async () => {
      // Arrange & Act
      const result = await simulateRaceCondition();
      const raceConditionError = result.error;

      // Assert: 競合解決戦略の検証
      const context = raceConditionError.context as RaceConditionContext;
      const validStrategies = ['retry', 'abort', 'queue', 'merge'];
      expect(validStrategies).toContain(context.resolutionStrategy);
    });

    it('Then タイミング情報: detectionTimeに競合検出時刻が正確に記録される', async () => {
      // Arrange
      const startTime = Date.now();

      // Act
      const result = await simulateRaceCondition();
      const raceConditionError = result.error;
      const endTime = Date.now();

      // Assert: 検出時刻の妥当性検証
      const context = raceConditionError.context as RaceConditionContext;
      expect(context.detectionTime).toBeGreaterThanOrEqual(startTime);
      expect(context.detectionTime).toBeLessThanOrEqual(endTime);
    });

    it('Then 競合回数追跡: conflictCountに1以上の競合回数が記録される', async () => {
      // Arrange & Act
      const result = await simulateRaceCondition();
      const raceConditionError = result.error;

      // Assert: 競合回数の検証
      const context = raceConditionError.context as RaceConditionContext;
      expect(context.conflictCount).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(context.conflictCount)).toBe(true);
    });
  });
});
