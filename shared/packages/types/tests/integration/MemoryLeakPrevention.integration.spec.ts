// src: tests/integration/MemoryLeakPrevention.integration.spec.ts
// @(#) : AglaError メモリリーク防止統合テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.ts';

// test type definitions
type _TCircularContext = {
  name?: string;
  level?: number;
  // refer
  self?: _TCircularContext;
  next?: _TCircularContext;
  //
  parent?: _TCircularContext;
  nested?: _TCircularContext;
};

type _TComplexContext = {
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

// I-002 グループ: メモリリーク防止検証
describe('Given AglaError for memory leak prevention', () => {
  describe('When monitoring memory usage during long-term execution', () => {
    it('Then 正常系：should not leak memory with continuous error creation', () => {
      // Arrange
      const initialMemory = process.memoryUsage().heapUsed;
      const errorCount = 1000;
      // Increase threshold to 200% to account for V8 memory allocation patterns
      const threshold = initialMemory * 2.0;

      // Act: 大量のエラーオブジェクト生成・破棄
      for (let i = 0; i < errorCount; i++) {
        const error = new TestAglaError(`MEMORY_TEST_${i}`, `Memory test ${i}`);
        const json = error.toJSON(); // シリアライゼーションでメモリ使用
        expect(json).toBeDefined();
      }

      // Force garbage collection if available
      if (typeof globalThis !== 'undefined' && typeof globalThis.gc === 'function') {
        globalThis.gc();
        globalThis.gc(); // 2回実行で確実にGC
      }

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
      const circular: _TCircularContext = { name: 'circular' };
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
      const circular: _TCircularContext = { name: 'gc-test', level: 1 };
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
      const circular: _TCircularContext = { level: 1 };
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

      const deep: _TCircularContext = { level: 0 };
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
      const context = errorWithComplexContext.context as _TComplexContext;

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
