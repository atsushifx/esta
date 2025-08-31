// src: tests/integration/HighFrequencyPerformance.integration.spec.ts
// @(#) : AglaError 高頻度エラー生成性能統合テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.ts';

// I-003 グループ: 高頻度エラー生成性能検証
describe('Given AglaError for high-frequency error generation performance', () => {
  describe('When generating errors at high frequency', () => {
    it('Then 正常系：should generate 1000+ errors per second', () => {
      // Arrange
      const targetThroughput = 1000; // 目標: 1000エラー/秒
      const testDuration = 1000; // 1秒間のテスト
      const startTime = Date.now();
      let errorCount = 0;

      // Act: 1秒間で可能な限りエラーを生成
      while ((Date.now() - startTime) < testDuration) {
        const error = new TestAglaError(`HIGH_FREQ_${errorCount}`, `High frequency test ${errorCount}`, {
          context: { timestamp: Date.now(), index: errorCount },
        });
        expect(error.errorType).toBe(`HIGH_FREQ_${errorCount}`);
        errorCount++;
      }

      const actualDuration = Date.now() - startTime;
      const throughput = Math.floor((errorCount / actualDuration) * 1000); // エラー/秒

      // Assert
      expect(throughput).toBeGreaterThan(targetThroughput);
      expect(errorCount).toBeGreaterThan(targetThroughput);
      expect(actualDuration).toBeLessThanOrEqual(testDuration + 100); // 100ms の誤差を許容
    });

    it('Then 異常系：should handle memory pressure during high-frequency generation', () => {
      // Arrange
      const batchSize = 5000; // メモリ圧迫を想定したバッチサイズ
      const initialMemory = process.memoryUsage().heapUsed;
      const errors: TestAglaError[] = [];

      // Act: 大量エラー生成でメモリ圧迫状況をシミュレート
      const startTime = Date.now();
      for (let i = 0; i < batchSize; i++) {
        const error = new TestAglaError(`MEM_PRESSURE_${i}`, `Memory pressure test ${i}`, {
          context: {
            largeData: new Array(100).fill(`data-${i}`),
            timestamp: Date.now(),
            batchIndex: i,
          },
        });
        errors.push(error);
      }
      const duration = Date.now() - startTime;
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Assert
      expect(errors).toHaveLength(batchSize);
      expect(duration).toBeLessThan(10000); // 10秒以内
      expect(memoryIncrease).toBeGreaterThan(0); // メモリ使用量が増加
      expect(finalMemory).toBeGreaterThan(initialMemory);
    });

    it('Then エッジケース：should maintain performance with complex contexts', () => {
      // Arrange
      const iterationCount = 2000;
      const complexContextBase = {
        nested: { level1: { level2: { level3: 'deep-value' } } },
        array: new Array(50).fill('complex-data'),
        metadata: { version: '1.0.0', timestamp: Date.now() },
      };

      // Act: 複雑なコンテキスト付きエラーの高頻度生成
      const startTime = Date.now();
      const errors: TestAglaError[] = [];

      for (let i = 0; i < iterationCount; i++) {
        const complexContext = {
          ...complexContextBase,
          index: i,
          timestamp: Date.now(),
        };

        const error = new TestAglaError(`COMPLEX_${i}`, `Complex context test ${i}`, {
          context: complexContext,
        });
        errors.push(error);
      }

      const duration = Date.now() - startTime;
      const throughput = Math.floor((iterationCount / duration) * 1000);

      // Assert
      expect(errors).toHaveLength(iterationCount);
      expect(throughput).toBeGreaterThan(500); // 複雑コンテキストでも500エラー/秒以上
      expect(duration).toBeLessThan(5000); // 5秒以内

      // 最後のエラーが正常に作成されていることを確認
      const lastError = errors[iterationCount - 1];
      expect(lastError.errorType).toBe(`COMPLEX_${iterationCount - 1}`);
      expect(lastError.context?.index).toBe(iterationCount - 1);
    });
  });

  describe('When handling concurrent error generation', () => {
    it('Then 正常系：should handle concurrent operations without race conditions', () => {
      // Arrange
      const concurrentCount = 10;
      const errorsPerThread = 100;
      const expectedTotalErrors = concurrentCount * errorsPerThread;

      // Act: 並行エラー生成をシミュレート
      const promises = Array.from({ length: concurrentCount }, async (_, threadIndex) => {
        const threadErrors: TestAglaError[] = [];

        for (let i = 0; i < errorsPerThread; i++) {
          const error = new TestAglaError(
            `CONCURRENT_T${threadIndex}_E${i}`,
            `Concurrent test thread ${threadIndex} error ${i}`,
            {
              context: {
                threadIndex,
                errorIndex: i,
                timestamp: Date.now(),
              },
            },
          );
          threadErrors.push(error);
        }

        return threadErrors;
      });

      return Promise.all(promises).then((results) => {
        const allErrors = results.flat();

        // Assert
        expect(allErrors).toHaveLength(expectedTotalErrors);

        // 各エラーがユニークであることを確認
        const errorTypes = allErrors.map((e) => e.errorType);
        const uniqueErrorTypes = new Set(errorTypes);
        expect(uniqueErrorTypes.size).toBe(expectedTotalErrors);

        // 各スレッドからの結果が正常であることを確認
        results.forEach((threadErrors, threadIndex) => {
          expect(threadErrors).toHaveLength(errorsPerThread);
          threadErrors.forEach((error, errorIndex) => {
            expect(error.errorType).toBe(`CONCURRENT_T${threadIndex}_E${errorIndex}`);
            expect(error.context?.threadIndex).toBe(threadIndex);
            expect(error.context?.errorIndex).toBe(errorIndex);
          });
        });
      });
    });

    it('Then 異常系：should maintain data integrity under concurrent access', () => {
      // Arrange
      const concurrentOperations = 50;

      // Act: 並行アクセスでのデータ整合性確認
      const promises = Array.from({ length: concurrentOperations }, async (_, index) => {
        // 各操作で独立したコンテキストを作成（参照共有を避ける）
        const isolatedContext = {
          operationId: index,
          timestamp: Date.now(),
          data: `operation-${index}`,
        };

        const error = new TestAglaError(
          `ISOLATION_${index}`,
          `Isolation test ${index}`,
          { context: isolatedContext },
        );

        return { error, operationId: index };
      });

      return Promise.all(promises).then((results) => {
        // Assert
        expect(results).toHaveLength(concurrentOperations);

        // 各エラーのコンテキストが独立していることを確認
        results.forEach(({ error, operationId }) => {
          expect(error.context?.operationId).toBe(operationId);
          expect(error.context?.data).toBe(`operation-${operationId}`);
          expect(error.errorType).toBe(`ISOLATION_${operationId}`);
        });

        // オペレーションIDが重複していないことを確認
        const operationIds = results.map((r) => r.operationId);
        const uniqueIds = new Set(operationIds);
        expect(uniqueIds.size).toBe(concurrentOperations);
      });
    });

    it('Then エッジケース：should monitor CPU usage during concurrent generation', () => {
      // Arrange
      const startTime = process.hrtime.bigint();
      const concurrentBatches = 5;
      const errorsPerBatch = 200;

      // Act: CPU使用率監視付き並行エラー生成
      const promises = Array.from({ length: concurrentBatches }, async (_, _batchIndex) => {
        const batchStartTime = process.hrtime.bigint();
        const errors: TestAglaError[] = [];

        for (let i = 0; i < errorsPerBatch; i++) {
          const error = new TestAglaError(
            `CPU_BATCH${_batchIndex}_${i}`,
            `CPU monitoring batch ${_batchIndex} error ${i}`,
            {
              context: {
                batchIndex: _batchIndex,
                errorIndex: i,
                cpuTime: Number(process.hrtime.bigint() - batchStartTime) / 1000000, // ms
              },
            },
          );
          errors.push(error);
        }

        const batchDuration = Number(process.hrtime.bigint() - batchStartTime) / 1000000; // ms
        return { errors, batchIndex: _batchIndex, duration: batchDuration };
      });

      return Promise.all(promises).then((results) => {
        const totalDuration = Number(process.hrtime.bigint() - startTime) / 1000000; // ms
        const totalErrors = results.reduce((sum, batch) => sum + batch.errors.length, 0);

        // Assert
        expect(totalErrors).toBe(concurrentBatches * errorsPerBatch);
        expect(totalDuration).toBeLessThan(5000); // 5秒以内

        // 各バッチの実行時間が妥当であることを確認
        results.forEach(({ errors, batchIndex: _batchIndex, duration }) => {
          expect(errors).toHaveLength(errorsPerBatch);
          expect(duration).toBeLessThan(2000); // 各バッチ2秒以内
          expect(duration).toBeGreaterThan(0);

          // 最後のエラーのCPU時間が設定されていることを確認
          const lastError = errors[errorsPerBatch - 1];
          expect(lastError.context?.cpuTime).toBeGreaterThan(0);
        });
      });
    });
  });
});
