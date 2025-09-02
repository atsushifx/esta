import { describe, expect, it } from 'vitest';
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.js';
import type { AglaErrorContext } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// E-005-02: デッドロック検出時のエラー処理テスト用型定義

/**
 * デッドロック発生時のコンテキスト情報
 * E-005-02用の専用型定義
 */
type DeadlockContext = AglaErrorContext & {
  /** デッドロックに関与したスレッド一覧: デッドロック検出のため */
  readonly involvedThreads: readonly {
    readonly threadId: number;
    readonly threadName: string;
    readonly waitingFor: string;
    readonly holdingResource: string;
    readonly waitStartTime: number;
  }[];
  /** デッドロック検出アルゴリズム名 */
  readonly detectionAlgorithm: 'wait-for-graph' | 'timeout-based' | 'resource-allocation';
  /** デッドロック検出時刻（ミリ秒） */
  readonly detectionTime: number;
  /** デッドロック解決方法 */
  readonly resolutionMethod: 'kill-youngest' | 'kill-victim' | 'timeout' | 'resource-preemption';
  /** 検出までの待機時間（ミリ秒） */
  readonly detectionDelay: number;
  /** デッドロック深刻度 */
  readonly deadlockSeverity: 'minor' | 'moderate' | 'critical';
};

// シミュレーション関数の戻り値型
type DeadlockSimulationResult = {
  readonly error: TestAglaError;
  readonly context: DeadlockContext;
};

// シミュレーション関数 - RED段階では未実装（エラーを投げる）

/**
 * デッドロック状態をシミュレートする関数
 * E-005-02: 相互依存によるデッドロック検出確認用
 */
const simulateDeadlock = async (): Promise<DeadlockSimulationResult> => {
  // GREEN段階: 最小実装 - テストを通すために必要最小限の実装
  const detectionTime = Date.now();
  const detectionDelay = 150; // 150ms検出遅延
  const waitStartTime = detectionTime - detectionDelay;

  // 相互依存するデッドロック状況をシミュレート
  const resourceA = 'mutex-lock-alpha';
  const resourceB = 'mutex-lock-beta';

  const involvedThreads = [
    {
      threadId: 2001,
      threadName: 'worker-thread-A',
      waitingFor: resourceB, // スレッドAはBが保有するリソースを待機
      holdingResource: resourceA, // スレッドAはAリソースを保有
      waitStartTime,
    },
    {
      threadId: 2002,
      threadName: 'worker-thread-B',
      waitingFor: resourceA, // スレッドBはAが保有するリソースを待機
      holdingResource: resourceB, // スレッドBはBリソースを保有
      waitStartTime,
    },
  ] as const;

  const context: DeadlockContext = {
    involvedThreads,
    detectionAlgorithm: 'timeout-based',
    detectionTime,
    resolutionMethod: 'kill-youngest',
    detectionDelay,
    deadlockSeverity: 'moderate',
  };

  const error = new TestAglaError(
    'DEADLOCK_DETECTED',
    `Deadlock detected between ${involvedThreads.length} threads: mutual wait condition detected`,
    {
      code: 'E_DEADLOCK',
      severity: ErrorSeverity.ERROR,
      context,
    },
  );

  return { error, context };
};

describe('Given AglaError in concurrent processing environment', () => {
  describe('When E-005-02 deadlocks occur between multiple threads', () => {
    it('Then デッドロック関与スレッド検出: involvedThreadsに2つのスレッド情報が記録される', async () => {
      // Arrange: デッドロックシミュレーションの準備

      // Act: デッドロックシミュレーション実行
      const result = await simulateDeadlock();
      const deadlockError = result.error;

      // Assert: 関与スレッド情報の検証
      const context = deadlockError.context as DeadlockContext;
      expect(context.involvedThreads).toHaveLength(2);
      expect(context.involvedThreads[0].threadId).toBeDefined();
      expect(context.involvedThreads[1].threadId).toBeDefined();
      expect(context.involvedThreads[0].threadId).not.toBe(
        context.involvedThreads[1].threadId,
      );
    });

    it('Then 相互待機状態確認: 各スレッドが相手の保有リソースを待機している', async () => {
      // Arrange & Act
      const result = await simulateDeadlock();
      const deadlockError = result.error;
      const context = deadlockError.context as DeadlockContext;
      const threads = context.involvedThreads;

      // Assert: 相互依存関係の検証
      expect(threads[0].waitingFor).toBeDefined();
      expect(threads[1].waitingFor).toBeDefined();
      expect(threads[0].holdingResource).toBeDefined();
      expect(threads[1].holdingResource).toBeDefined();

      // 相互待機の確認: A→B, B→Aの依存関係
      expect(threads[0].waitingFor).toBe(threads[1].holdingResource);
      expect(threads[1].waitingFor).toBe(threads[0].holdingResource);
    });

    it('Then 検出アルゴリズム記録: detectionAlgorithmに有効なアルゴリズム名が設定される', async () => {
      // Arrange & Act
      const result = await simulateDeadlock();
      const deadlockError = result.error;

      // Assert: 検出アルゴリズムの検証
      const context = deadlockError.context as DeadlockContext;
      const validAlgorithms = ['wait-for-graph', 'timeout-based', 'resource-allocation'];
      expect(validAlgorithms).toContain(context.detectionAlgorithm);
    });

    it('Then 解決方法記録: resolutionMethodに適切な解決方法が設定される', async () => {
      // Arrange & Act
      const result = await simulateDeadlock();
      const deadlockError = result.error;

      // Assert: 解決方法の検証
      const context = deadlockError.context as DeadlockContext;
      const validMethods = ['kill-youngest', 'kill-victim', 'timeout', 'resource-preemption'];
      expect(validMethods).toContain(context.resolutionMethod);
    });

    it('Then タイミング情報: detectionTimeとdetectionDelayが適切に記録される', async () => {
      // Arrange
      const startTime = Date.now();

      // Act
      const result = await simulateDeadlock();
      const deadlockError = result.error;
      const endTime = Date.now();

      // Assert: 検出時刻と遅延時間の妥当性検証
      const context = deadlockError.context as DeadlockContext;
      expect(context.detectionTime).toBeGreaterThanOrEqual(startTime);
      expect(context.detectionTime).toBeLessThanOrEqual(endTime);
      expect(context.detectionDelay).toBeGreaterThan(0);
      expect(Number.isInteger(context.detectionDelay)).toBe(true);
    });

    it('Then 深刻度評価: deadlockSeverityに適切な深刻度レベルが設定される', async () => {
      // Arrange & Act
      const result = await simulateDeadlock();
      const deadlockError = result.error;

      // Assert: 深刻度レベルの検証
      const context = deadlockError.context as DeadlockContext;
      const validSeverities = ['minor', 'moderate', 'critical'];
      expect(validSeverities).toContain(context.deadlockSeverity);
    });
  });
});
