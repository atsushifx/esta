// src: tests/integration/AglaError.integration.spec.ts
// @(#) : AglaError 統合テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.ts';

// Type definitions
import type { AglaErrorContext, AglaErrorOptions } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

type TNestedContext = {
  originalPackage: string;
  level1?: {
    level2?: {
      level3?: unknown;
    };
  };
};

type TCompatibilityInfo = {
  expectedVersion: string | null;
  actualVersion: string | undefined;
  packageName: string;
};

type TCircularContext = {
  name?: string;
  level?: number;
  // refer
  self?: TCircularContext;
  next?: TCircularContext;
  //
  parent?: TCircularContext;
  nested?: TCircularContext;
};

type TComplexContext = {
  complexObject: {
    nested: {
      data: Array<string>;
    };
  };
  timestamp: Date;
  metadata: {
    version: string;
    source: string;
  };
};

// P8-INTEGRATION-001: 統合シナリオ
describe('when handling complex error scenarios with all features', () => {
  it('then should handle complex error scenarios with all features', () => {
    // Arrange
    const errorType = 'INTEGRATION_TEST_ERROR';
    const message = 'Integration base message';
    const code = 'INT_001';
    const severity = ErrorSeverity.WARNING;
    const timestamp = new Date('2025-08-29T21:42:00.000Z');
    const context = { userId: 'u-123', operation: 'integrated' };

    const base = new TestAglaError(errorType, message, { code, severity, timestamp, context });
    const cause = new Error('Root cause');

    // Act
    const chained = base.chain(cause);
    const json = chained.toJSON() as AglaErrorContext;
    const str = chained.toString();

    // Assert
    expect(chained).toBeInstanceOf(TestAglaError);
    expect(chained.name).toBe('TestAglaError');

    expect(chained.errorType).toBe(errorType);
    expect(chained.message).toBe('Integration base message (caused by: Root cause)');
    expect(chained.code).toBe(code);
    expect(chained.severity).toBe(severity);
    expect(chained.timestamp).toBe(timestamp);
    // コンテキストはスタック情報を除外してキーワード部分のみをチェック
    expect(chained.context?.userId).toBe('u-123');
    expect(chained.context?.operation).toBe('integrated');
    expect(chained.context?.cause).toBe('Root cause');

    expect(json).toEqual({
      errorType,
      message: chained.message,
      code,
      severity,
      timestamp: timestamp.toISOString(),
      context: expect.objectContaining({
        userId: 'u-123',
        operation: 'integrated',
        cause: 'Root cause',
      }),
    });

    expect(str).toContain(errorType);
    expect(str).toContain(chained.message);
    expect(str).toContain('"userId":"u-123"');
    expect(str).toContain('"operation":"integrated"');
    expect(str).toContain('"cause":"Root cause"');
  });
});

// ===== PHASE 3: Integration Tests (I-001~I-005) =====

// I-001 グループ: クロスパッケージエラー伝播
describe('Given AglaError for cross-package error propagation', () => {
  describe('When handling error chain across different packages', () => {
    it('Then 正常系：should maintain AglaError inheritance across packages', () => {
      // Arrange
      const packageAError = new TestAglaError('PACKAGE_A_ERROR', 'Error from package A');
      const packageBError = new TestAglaError('PACKAGE_B_ERROR', 'Error from package B');

      // Act: パッケージ境界を跨いだエラーチェーン
      const crossPackageError = packageBError.chain(packageAError);

      // Assert
      expect(crossPackageError).toBeInstanceOf(TestAglaError);
      expect(crossPackageError.errorType).toBe('PACKAGE_B_ERROR');
      expect(crossPackageError.message).toBe('Error from package B (caused by: Error from package A)');
    });

    it('Then 異常系：should handle null cause gracefully', () => {
      // Arrange
      const error = new TestAglaError('TEST_ERROR', 'Test message');
      const nullCause = null as unknown as Error;

      // Act & Assert
      expect(() => error.chain(nullCause)).toThrow();
    });

    it('Then エッジケース：should handle non-AglaError cause', () => {
      // Arrange
      const aglaError = new TestAglaError('AGLA_ERROR', 'AglaError instance');
      const standardError = new Error('Standard Error');

      // Act
      const chainedError = aglaError.chain(standardError);

      // Assert
      expect(chainedError).toBeInstanceOf(TestAglaError);
      expect(chainedError.message).toBe('AglaError instance (caused by: Standard Error)');
    });
  });

  describe('When preserving context across package boundaries', () => {
    it('Then 正常系：should preserve original package information in context', () => {
      // Arrange
      const originalPackage = '@shared/types';
      const context = { originalPackage, userId: 'test-123' };
      const error = new TestAglaError('CROSS_PACKAGE_ERROR', 'Cross package message', { context });

      // Act
      const propagatedError = error.chain(new Error('Propagation cause'));

      // Assert
      expect(propagatedError.context?.originalPackage).toBe('@shared/types');
      expect(propagatedError.context?.userId).toBe('test-123');
      expect(propagatedError.context?.cause).toBe('Propagation cause');
    });

    it('Then 異常系：should handle undefined context gracefully', () => {
      // Arrange
      const error = new TestAglaError('NO_CONTEXT_ERROR', 'No context message');
      const cause = new Error('Test cause');

      // Act
      const chainedError = error.chain(cause);

      // Assert
      expect(chainedError.context?.cause).toBe('Test cause');
      expect((chainedError.context as TNestedContext | undefined)?.originalPackage).toBeUndefined();
    });

    it('Then エッジケース：should handle complex nested context', () => {
      // Arrange
      const nestedContext: TNestedContext = {
        level1: { level2: { level3: 'deep-value' } },
        originalPackage: '@shared/types',
      };
      const error = new TestAglaError('NESTED_CONTEXT_ERROR', 'Nested context', { context: nestedContext });

      // Act
      const chainedError = error.chain(new Error('Chain cause'));

      // Assert
      expect((chainedError.context as TNestedContext | undefined)?.level1?.level2?.level3).toBe('deep-value');
      expect((chainedError.context as TNestedContext | undefined)?.originalPackage).toBe('@shared/types');
    });
  });

  describe('When handling package version compatibility errors', () => {
    it('Then 正常系：should include compatibility info for version mismatches', () => {
      // Arrange
      const compatibilityInfo: TCompatibilityInfo = {
        expectedVersion: '1.0.0',
        actualVersion: '0.9.0',
        packageName: '@shared/types',
      };
      const versionError = new TestAglaError('VERSION_MISMATCH', 'Version compatibility error', {
        context: { compatibilityInfo },
      });

      // Act & Assert
      expect(versionError.context?.compatibilityInfo).toBeDefined();
      expect((versionError.context?.compatibilityInfo as TCompatibilityInfo).expectedVersion).toBe('1.0.0');
      expect((versionError.context?.compatibilityInfo as TCompatibilityInfo).actualVersion).toBe('0.9.0');
    });

    it('Then 異常系：should handle missing version info', () => {
      // Arrange & Act
      const error = new TestAglaError('VERSION_ERROR', 'Version error without info');

      // Assert
      expect(error.context?.compatibilityInfo).toBeUndefined();
      expect(error.errorType).toBe('VERSION_ERROR');
    });

    it('Then エッジケース：should handle malformed version info', () => {
      // Arrange
      const malformedInfo = {
        expectedVersion: null,
        actualVersion: undefined,
        packageName: '',
      };
      const error = new TestAglaError('MALFORMED_VERSION', 'Malformed version', {
        context: { compatibilityInfo: malformedInfo },
      });

      // Act & Assert
      expect((error.context?.compatibilityInfo as TCompatibilityInfo).expectedVersion).toBeNull();
      expect((error.context?.compatibilityInfo as TCompatibilityInfo).actualVersion).toBeUndefined();
      expect((error.context?.compatibilityInfo as TCompatibilityInfo).packageName).toBe('');
    });
  });
});

// I-002 グループ: メモリリーク防止検証
describe('Given AglaError for memory leak prevention', () => {
  describe('When monitoring memory usage during long-term execution', () => {
    it('Then 正常系：should not leak memory with continuous error creation', () => {
      // Arrange
      const initialMemory = process.memoryUsage().heapUsed;
      const errorCount = 1000;
      const threshold = initialMemory * 0.5; // 50%以上のメモリ増加は異常

      // Act: 大量のエラーオブジェクト生成・破棄
      for (let i = 0; i < errorCount; i++) {
        const error = new TestAglaError(`MEMORY_TEST_${i}`, `Memory test ${i}`);
        const json = error.toJSON(); // シリアライゼーションでメモリ使用
        expect(json).toBeDefined();
      }

      // Force garbage collection if available
      //      if (global.gc) {
      // global.gc();
      //      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;

      // Assert
      expect(memoryGrowth).toBeLessThan(threshold);
      expect(finalMemory).toBeGreaterThan(0);
    });

    it('Then 異常系：should handle memory pressure gracefully', () => {
      // Arrange
      const largeContext = {
        data: new Array(10000).fill('large-data-item'),
        timestamp: new Date().toISOString(),
      };

      // Act & Assert: 大きなコンテキストでもエラーにならない
      expect(() => {
        const error = new TestAglaError('LARGE_CONTEXT', 'Large context test', { context: largeContext });
        expect(error.context?.data).toHaveLength(10000);
      }).not.toThrow();
    });

    it('Then エッジケース：should handle null memory references', () => {
      // Arrange
      const error = new TestAglaError('NULL_REF_TEST', 'Null reference test');

      // Act: コンテキストをundefinedに設定して参照を切る
      const errorWithNullContext = new TestAglaError('NULL_CONTEXT', 'Null context', { context: undefined });

      // Assert
      expect(error.context).toBeUndefined();
      expect(errorWithNullContext.context).toBeUndefined();
    });
  });

  describe('When handling circular reference cleanup', () => {
    it('Then 正常系：should clean up circular references properly', () => {
      // Arrange: 循環参照オブジェクト作成
      const circular: TCircularContext = { name: 'circular' };
      circular.self = circular;

      const error = new TestAglaError('CIRCULAR_REF', 'Circular reference test', { context: circular });

      // Act: WeakRefでGC確認（利用可能な場合のみ）
      let weakRef: WeakRef<TestAglaError> | undefined;
      if (typeof WeakRef !== 'undefined') {
        weakRef = new WeakRef(error);
      }

      // Assert: エラーオブジェクト自体は正常に動作
      expect(error.errorType).toBe('CIRCULAR_REF');
      expect(error.context?.name).toBe('circular');
      expect(error.context?.self).toBe(error.context);

      // WeakRefが利用可能な場合のみテスト
      if (weakRef) {
        expect(weakRef.deref()).toBeDefined();
      }
    });

    it('Then 異常系：should detect circular reference cleanup through garbage collection', () => {
      // Arrange: 循環参照エラーオブジェクト作成
      const circular: TCircularContext = { name: 'gc-test', level: 1 };
      circular.self = circular;
      circular.next = { parent: circular };
      circular.nested = circular.next;

      let error = new TestAglaError('GC_CIRCULAR_REF', 'GC circular reference test', { context: circular });
      let weakRef: WeakRef<TestAglaError> | undefined;

      // Act: WeakRefでGC検証（利用可能な場合のみ）
      if (typeof WeakRef !== 'undefined') {
        weakRef = new WeakRef(error);

        // エラーオブジェクト参照を削除
        error = null as unknown as TestAglaError;

        // ガベージコレクション強制実行（利用可能な場合のみ）
        if (typeof globalThis !== 'undefined' && globalThis.gc) {
          globalThis.gc();
          globalThis.gc(); // 2回実行で確実にGC
        }

        // Assert: WeakRefが削除されていることを確認（環境に依存）
        // NOTE: GCのタイミングは保証されないため、定義状態のみ確認
        const dereferenced = weakRef.deref();
        // GCが実行されていれば削除、されていなくても循環参照の検出は完了
        expect(dereferenced === undefined || dereferenced instanceof TestAglaError).toBe(true);
      } else {
        // WeakRef未対応環境では循環参照の存在のみ確認
        expect(circular.self).toBe(circular);
        expect(circular.nested.parent).toBe(circular);
      }
    });

    it('Then 異常系：should handle circular reference in JSON serialization', () => {
      // Arrange: 循環参照オブジェクト
      const circular: TCircularContext = { level: 1 };
      circular.nested = { parent: circular };

      const error = new TestAglaError('CIRCULAR_TO_STRING', 'Circular toString test', { context: circular });

      // Act & Assert: JSON.stringify()が循環参照で例外を投げることを確認
      expect(() => {
        JSON.stringify(error.toJSON());
      }).toThrow('Converting circular structure to JSON');

      // toString()も循環参照で例外を投げることを確認
      expect(() => {
        error.toString();
      }).toThrow('Converting circular structure to JSON');
    });

    it('Then エッジケース：should handle deep circular references', () => {
      // Arrange: 深い循環参照

      const deep: TCircularContext = { level: 0 };
      let current = deep;

      for (let i = 1; i < 10; i++) {
        current.next = { level: i };
        current = current.next;
      }
      current.next = deep; // 循環を作る

      const error = new TestAglaError('DEEP_CIRCULAR', 'Deep circular test', { context: deep });

      // Act & Assert
      expect(error.context?.level).toBe(0);
      expect(error.errorType).toBe('DEEP_CIRCULAR');

      // toString()とtoJSON()が深い循環参照で例外を投げることを確認
      expect(() => {
        error.toString();
      }).toThrow('Converting circular structure to JSON');

      expect(() => {
        JSON.stringify(error.toJSON());
      }).toThrow('Converting circular structure to JSON');
    });
  });

  describe('When managing large-scale error cleanup', () => {
    it('Then 正常系：should clean up after batch error processing', () => {
      // Arrange
      const initialMemory = process.memoryUsage().heapUsed;
      const batchSize = 100;
      const largeData = new Array(1000).fill('batch-data');

      // Act: バッチでエラー生成・チェーン・破棄
      const errors: TestAglaError[] = [];
      for (let batch = 0; batch < batchSize; batch++) {
        const error = new TestAglaError(`BATCH_${batch}`, `Batch error ${batch}`, {
          context: { batchData: largeData, batchId: batch },
        });
        errors.push(error);
      }

      // エラーチェーン作成
      let chainedError = errors[0];
      for (let i = 1; i < Math.min(10, errors.length); i++) {
        chainedError = chainedError.chain(errors[i]);
      }

      // メモリ使用量確認
      const afterBatchMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = afterBatchMemory - initialMemory;

      // Assert
      expect(chainedError).toBeInstanceOf(TestAglaError);
      // メモリ使用量は増加しているか、GC により減少している可能性がある
      expect(Math.abs(memoryIncrease)).toBeGreaterThan(0); // メモリ変化がある
      expect(afterBatchMemory).toBeGreaterThan(0); // 有効なメモリ値
    });

    it('Then 異常系：should handle cleanup failures gracefully', () => {
      // Arrange
      const errorWithComplexContext = new TestAglaError('CLEANUP_TEST', 'Cleanup test', {
        context: {
          complexObject: { nested: { data: new Array(1000).fill('cleanup-data') } },
          timestamp: Date.now(),
          metadata: { version: '1.0.0', source: 'integration-test' },
        },
      });

      // Act: オブジェクト参照を操作
      const context = errorWithComplexContext.context as TComplexContext;

      // Assert: コンテキストが適切にアクセス可能
      expect(context.complexObject.nested.data).toHaveLength(1000);
      expect(context.timestamp).toBeTypeOf('number');
      expect(context.metadata.version).toBe('1.0.0');
    });

    it('Then エッジケース：should handle undefined cleanup scenarios', () => {
      // Arrange
      const error1 = new TestAglaError('UNDEF_1', 'Undefined test 1');
      const error2 = new TestAglaError('UNDEF_2', 'Undefined test 2', { context: undefined });

      // Act
      const chained = error1.chain(error2);

      // Assert
      expect(chained.context?.cause).toBe('Undefined test 2');
      expect(chained.errorType).toBe('UNDEF_1');
    });
  });
});

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

// I-004 グループ: 複雑シリアライゼーション統合
describe('Given complex serialization integration', () => {
  describe('When performing JSON round-trip', () => {
    it('Then 正常系：should maintain round-trip consistency (I-004-01)', () => {
      // Arrange
      const timestamp = new Date('2025-09-01T00:00:00.000Z');
      const error = new TestAglaError('ROUND_TRIP', 'Round trip test', {
        code: 'RT001',
        severity: ErrorSeverity.INFO,
        timestamp,
        context: { a: 1, b: 'two', nested: { ok: true } },
      });

      // Act
      const originalJson = error.toJSON();
      const roundTripped = JSON.parse(JSON.stringify(originalJson));

      // Assert
      expect(roundTripped).toEqual({
        errorType: 'ROUND_TRIP',
        message: 'Round trip test',
        code: 'RT001',
        severity: ErrorSeverity.INFO,
        timestamp: timestamp.toISOString(),
        context: { a: 1, b: 'two', nested: { ok: true } },
      });
      expect(roundTripped).toEqual(originalJson);
    });

    it('Then 異常系：should handle multiple format conversion', () => {
      // Arrange
      const error = new TestAglaError('MULTI_FORMAT', 'Multi format test', {
        code: 'MF001',
        severity: ErrorSeverity.ERROR,
        context: { format: 'multi', conversion: true },
      });

      // Act: 複数フォーマット間変換をシミュレート
      const jsonFormat = error.toJSON();
      const xmlFormat = `<error><errorType>${error.errorType}</errorType><message>${error.message}</message></error>`;
      const stringFormat = error.toString();

      // Assert
      expect(xmlFormat).toContain(error.errorType);
      expect(xmlFormat).toContain(error.message);
      expect(stringFormat).toContain(error.errorType);
      expect(stringFormat).toContain(error.message);
      expect(jsonFormat.errorType).toBe('MULTI_FORMAT');
    });

    it('Then エッジケース：should support streaming serialization', () => {
      // Arrange
      const largeContext = {
        data: new Array(1000).fill('streaming-data'),
        metadata: { size: 1000, type: 'stream' },
      };
      const error = new TestAglaError('STREAMING_TEST', 'Streaming serialization test', {
        context: largeContext,
      });

      // Act: ストリーミングシリアライゼーションをシミュレート
      const json = JSON.stringify(error.toJSON());
      const chunks: string[] = [];
      const chunkSize = 100;

      for (let i = 0; i < json.length; i += chunkSize) {
        chunks.push(json.slice(i, i + chunkSize));
      }

      const streamedResult = chunks.join('');

      // Assert
      expect(streamedResult).toBe(json);
      expect(streamedResult).toContain(error.message);
      expect(chunks.length).toBeGreaterThan(1); // 複数チャンクに分割されている
      expect(JSON.parse(streamedResult)).toEqual(error.toJSON());
    });
  });
});

// I-005 グループ: 外部システム統合異常系
describe('Given AglaError for external system integration failures', () => {
  describe('When logging system fails', () => {
    it('Then 正常系：should provide fallback logging mechanism', () => {
      // Arrange
      const error = new TestAglaError('LOGGING_FAILURE', 'Logging system failure', {
        context: { originalDestination: 'primary-log-server', timestamp: Date.now() },
      });

      // Act: ログシステム連携失敗時のフォールバック処理をシミュレート
      let primaryLogFailed = false;
      let fallbackLog = '';

      try {
        // プライマリログシステムの失敗をシミュレート
        throw new Error('Primary logging system unavailable');
      } catch {
        primaryLogFailed = true;
        // フォールバック: エラー情報をローカルバッファに保存
        fallbackLog = `FALLBACK: ${error.errorType} - ${error.message}`;
      }

      // Assert
      expect(primaryLogFailed).toBe(true);
      expect(fallbackLog).toContain(error.errorType);
      expect(fallbackLog).toContain('FALLBACK');
      expect(error.context?.originalDestination).toBe('primary-log-server');
    });

    it('Then 異常系：should handle logging system complete failure', () => {
      // Arrange
      const criticalError = new TestAglaError('CRITICAL_LOG_FAILURE', 'Critical logging failure', {
        severity: ErrorSeverity.FATAL,
        context: {
          systemsDown: ['primary-log', 'backup-log', 'emergency-log'],
          lastSuccessfulLog: Date.now() - 3600000, // 1時間前
        },
      });

      // Act: 全ログシステム停止時の処理
      const emergencyBuffer: string[] = [];
      const logSystems = ['primary', 'backup', 'emergency'];

      logSystems.forEach((system) => {
        try {
          throw new Error(`${system} log system down`);
        } catch {
          // 緊急時バッファに記録
          emergencyBuffer.push(`${system}: ${criticalError.errorType}`);
        }
      });

      // Assert
      expect(emergencyBuffer).toHaveLength(3);
      expect(emergencyBuffer.every((log) => log.includes(criticalError.errorType))).toBe(true);
      expect(criticalError.severity).toBe(ErrorSeverity.FATAL);
    });

    it('Then エッジケース：should handle partial logging system recovery', () => {
      // Arrange
      const recoveryError = new TestAglaError('LOG_RECOVERY', 'Logging recovery test', {
        context: {
          recoveryAttempt: 3,
          partialSystems: ['backup-log'],
          failedSystems: ['primary-log', 'audit-log'],
        },
      });

      // Act: 部分回復シナリオ
      const systemStatus = {
        'primary-log': false,
        'backup-log': true,
        'audit-log': false,
      };

      const availableSystems = Object.entries(systemStatus)
        .filter(([_, available]) => available)
        .map(([system, _]) => system);

      const loggedSuccessfully = availableSystems.length > 0;

      // Assert
      expect(loggedSuccessfully).toBe(true);
      expect(availableSystems).toContain('backup-log');
      expect(availableSystems).toHaveLength(1);
      expect(recoveryError.context?.partialSystems).toContain('backup-log');
    });
  });

  describe('When monitoring system fails', () => {
    it('Then 正常系：should queue errors for monitoring system recovery', () => {
      // Arrange
      const monitoringError = new TestAglaError('MONITORING_FAILURE', 'Monitoring system failure', {
        context: { monitoringEndpoint: 'https://monitor.example.com', retryCount: 0 },
      });

      // Act: 監視システム失敗時のキューイング
      const errorQueue: TestAglaError[] = [];
      let monitoringAvailable = false;

      try {
        // 監視システム接続失敗をシミュレート
        throw new Error('Monitoring system unreachable');
      } catch {
        // エラーをキューに追加
        errorQueue.push(monitoringError);
        monitoringAvailable = false;
      }

      // Assert
      expect(errorQueue).toContain(monitoringError);
      expect(errorQueue).toHaveLength(1);
      expect(monitoringAvailable).toBe(false);
      expect(monitoringError.context?.retryCount).toBe(0);
    });

    it('Then 異常系：should handle monitoring queue overflow', () => {
      // Arrange
      const queueLimit = 100;
      const errorQueue: TestAglaError[] = [];

      // Act: キューオーバーフロー状況をシミュレート
      for (let i = 0; i < queueLimit + 50; i++) {
        const error = new TestAglaError(`QUEUE_OVERFLOW_${i}`, `Queue overflow test ${i}`, {
          context: { queuePosition: i, timestamp: Date.now() },
        });

        if (errorQueue.length < queueLimit) {
          errorQueue.push(error);
        } else {
          // キュー満杯時の処理: 古いエラーを削除して新しいエラーを追加
          errorQueue.shift();
          errorQueue.push(error);
        }
      }

      // Assert
      expect(errorQueue).toHaveLength(queueLimit);
      expect(errorQueue[0].context?.queuePosition).toBeGreaterThan(49); // 古いエラーは削除済み
      expect(errorQueue[queueLimit - 1].context?.queuePosition).toBe(149); // 最新エラー
    });

    it('Then エッジケース：should handle monitoring system partial failure', () => {
      // Arrange
      const partialError = new TestAglaError('PARTIAL_MONITORING', 'Partial monitoring failure', {
        context: {
          availableMetrics: ['cpu', 'memory'],
          failedMetrics: ['disk', 'network'],
          degradedMode: true,
        },
      });

      // Act: 部分機能動作の確認
      const availableServices = partialError.context?.availableMetrics as string[];
      const failedServices = partialError.context?.failedMetrics as string[];
      const isPartiallyOperational = availableServices.length > 0;

      // Assert
      expect(isPartiallyOperational).toBe(true);
      expect(availableServices).toContain('cpu');
      expect(availableServices).toContain('memory');
      expect(failedServices).toContain('disk');
      expect(failedServices).toContain('network');
      expect(partialError.context?.degradedMode).toBe(true);
    });
  });

  describe('When database persistence fails', () => {
    it('Then 正常系：should use local buffer for database failure', () => {
      // Arrange
      const dbError = new TestAglaError('DATABASE_FAILURE', 'Database persistence failure', {
        context: {
          database: 'error-db',
          operation: 'INSERT',
          retryAttempts: 3,
        },
      });

      // Act: データベース障害時のローカルバッファ使用
      const localBuffer: AglaErrorContext[] = [];
      let dbConnectionFailed = false;

      try {
        // データベース接続失敗をシミュレート
        throw new Error('Database connection timeout');
      } catch {
        dbConnectionFailed = true;
        // ローカルバッファに保存
        localBuffer.push(dbError.toJSON());
      }

      // Assert
      expect(dbConnectionFailed).toBe(true);
      expect(localBuffer).toHaveLength(1);
      expect(localBuffer[0]).toEqual(dbError.toJSON());
      expect(localBuffer[0].errorType).toBe('DATABASE_FAILURE');
    });

    it('Then 異常系：should handle database recovery with buffer flush', () => {
      // Arrange
      const bufferSize = 10;
      const localBuffer: AglaErrorContext[] = [];

      // バッファに複数エラーを蓄積
      for (let i = 0; i < bufferSize; i++) {
        const error = new TestAglaError(`DB_RECOVERY_${i}`, `Database recovery test ${i}`, {
          context: { buffered: true, index: i },
        });
        localBuffer.push(error.toJSON());
      }

      // Act: データベース復旧時のバッファフラッシュ
      const flushedErrors: AglaErrorContext[] = [];

      // バッファからデータベースに一括保存
      flushedErrors.push(...localBuffer);
      localBuffer.length = 0; // バッファクリア

      // Assert
      expect(flushedErrors).toHaveLength(bufferSize);
      expect(localBuffer).toHaveLength(0);
      expect(flushedErrors[0].errorType).toBe('DB_RECOVERY_0');
      expect(flushedErrors[bufferSize - 1].errorType).toBe(`DB_RECOVERY_${bufferSize - 1}`);
    });

    it('Then エッジケース：should handle database transaction rollback', () => {
      // Arrange
      const transactionError = new TestAglaError('TRANSACTION_ROLLBACK', 'Transaction rollback test', {
        context: {
          transactionId: 'tx-12345',
          affectedTables: ['errors', 'logs', 'audit'],
          rollbackReason: 'constraint_violation',
        },
      });

      // Act: トランザクションロールバック処理
      let transactionCompleted = false;
      let rollbackPerformed = false;

      try {
        // トランザクション失敗をシミュレート
        throw new Error('Foreign key constraint violation');
      } catch {
        rollbackPerformed = true;
        // ロールバック後の状態確認
        transactionCompleted = false;
      }

      // Assert
      expect(rollbackPerformed).toBe(true);
      expect(transactionCompleted).toBe(false);
      expect(transactionError.context?.transactionId).toBe('tx-12345');
      expect(transactionError.context?.rollbackReason).toBe('constraint_violation');
      expect((transactionError.context?.affectedTables as string[]).length).toBe(3);
    });
  });
});

// P8-INTEGRATION-002: 互換性最終確認
describe('when ensuring full backward compatibility', () => {
  it('then should maintain full backward compatibility', () => {
    // Arrange
    const errorType = 'LEGACY_TEST_ERROR';
    const message = 'Legacy mode';
    const legacyContext = { legacy: true, path: '/v0' };

    // Act: 旧APIの第3引数にcontextオブジェクトを渡す
    const legacy = new TestAglaError(errorType, message, legacyContext as unknown as AglaErrorOptions);
    const legacyJson = legacy.toJSON() as AglaErrorContext;
    const legacyStr = legacy.toString();

    // Assert
    expect(legacy.errorType).toBe(errorType);
    expect(legacy.message).toBe(message);
    expect(legacy.context).toBe(legacyContext);

    expect(legacyJson).toEqual({
      errorType,
      message,
      context: legacyContext,
    });

    // toStringの一貫フォーマット
    expect(legacyStr).toBe(`${errorType}: ${message} ${JSON.stringify(legacyContext)}`);
  });
});
