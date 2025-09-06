// src: src/__tests__/unit/AglaError.core.spec.ts
// @(#) : AglaError コア（コンストラクタ・基本プロパティ）単体テスト
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import type { AglaErrorOptions } from '../../../types/AglaError.types.ts';
import { ErrorSeverity } from '../../../types/ErrorSeverity.types.ts';

// Test utilities
import type { _TAglaErrorContextWithSymbols } from '../helpers/test-types.types.ts';
import { TestAglaError } from '../helpers/TestAglaError.class.ts';

/**
 * コンストラクタの基本動作とプロパティ設定の確認
 */
describe('Given AglaError constructor with valid inputs', () => {
  describe('When creating error with basic parameters only', () => {
    it('Then 正常系：should set severity option', () => {
      const error = new TestAglaError('TEST_ERROR', 'Test error message', { severity: ErrorSeverity.ERROR });
      expect(error.severity).toBe(ErrorSeverity.ERROR);
    });

    it('Then 正常系：should set timestamp option', () => {
      const ts = new Date('2025-08-29T21:42:00Z');
      const error = new TestAglaError('TEST_ERROR', 'Test error message', { timestamp: ts });
      expect(error.timestamp).toBe(ts);
    });

    it('Then 正常系：should set all options together', () => {
      const code = 'TEST_001';
      const severity = ErrorSeverity.FATAL;
      const timestamp = new Date('2025-08-29T21:42:00Z');
      const context = { userId: '123', operation: 'all-options' };
      const error = new TestAglaError('TEST_ERROR', 'Test error message', { code, severity, timestamp, context });
      expect(error.code).toBe(code);
      expect(error.severity).toBe(severity);
      expect(error.timestamp).toBe(timestamp);
      expect(error.context).toBe(context);
    });

    it('Then 正常系：should support legacy context parameter format', () => {
      const context = { userId: '123', operation: 'legacy' };
      const error = new TestAglaError('TEST_ERROR', 'Test error message', context as AglaErrorOptions);
      expect(error.context).toBe(context);
    });
  });

  describe('When creating error with invalid or edge case parameters', () => {
    it('Then should handle invalid timestamp gracefully', () => {
      const invalidDate = new Date('invalid-date');
      const error = new TestAglaError('TEST_ERROR', 'Test message', { timestamp: invalidDate });
      expect(error.timestamp).toBe(invalidDate);
      expect(isNaN(error.timestamp!.getTime())).toBe(true);
    });

    it('Then should handle invalid severity as per implementer policy', () => {
      const invalidSeverity = 'critical' as unknown as ErrorSeverity;
      const error = new TestAglaError('TEST_ERROR', 'Test message', { severity: invalidSeverity });
      expect(error.severity).toBe(invalidSeverity);
    });

    it('Then should handle complex context objects', () => {
      // function values in context
      const callback = (): string => 'test';
      const functionContext = { callback, operation: 'function-test' };
      const functionError = new TestAglaError('TEST_ERROR', 'Test message', { context: functionContext });
      expect(typeof functionError.context?.callback).toBe('function');

      // symbol keys in context
      const symbolKey = Symbol('testSymbol');
      const symbolContext = { [symbolKey]: 'symbol-value', operation: 'symbol-test' } as _TAglaErrorContextWithSymbols;
      const symbolError = new TestAglaError('TEST_ERROR', 'Test message', { context: symbolContext });
      expect((symbolError.context as _TAglaErrorContextWithSymbols)[symbolKey]).toBe('symbol-value');

      // nested object context
      const nestedContext = {
        user: { id: '123', name: 'John' },
        operation: { type: 'CREATE', resource: 'user' },
        metadata: { timestamp: '2025-08-29', version: '1.0' },
      };
      const nestedError = new TestAglaError('TEST_ERROR', 'Test message', { context: nestedContext });
      expect(nestedError.context).toBe(nestedContext);

      // array values in context
      const arrayContext = {
        operations: ['create', 'update', 'delete'],
        errors: [{ code: 'E001' }, { code: 'E002' }],
      };
      const arrayError = new TestAglaError('TEST_ERROR', 'Test message', { context: arrayContext });
      expect(arrayError.context).toBe(arrayContext);
    });

    it('Then should handle type compatibility for symbol context', () => {
      const symbolKey = Symbol.for('test');
      const symbolContext: _TAglaErrorContextWithSymbols = {
        [symbolKey]: 'symbol-value',
        operation: 'symbol-test',
        normalProp: 'normal',
      };
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context: symbolContext });
      expect((error.context as _TAglaErrorContextWithSymbols)[symbolKey]).toBe('symbol-value');
    });

    it('Then should handle minimum timestamp', () => {
      const minTimestamp = new Date(0);
      const minError = new TestAglaError('MIN_TIME_ERROR', 'Min timestamp', { timestamp: minTimestamp });
      expect(minError.timestamp).toBe(minTimestamp);
    });
  });
});

describe('Given AglaError property defaults verification', () => {
  describe('When checking property defaults', () => {
    it('Then エッジケース：should keep provided option values', () => {
      const code = 'TEST_001';
      const severity = ErrorSeverity.ERROR;
      const timestamp = new Date('2025-08-29T21:42:00Z');
      const error = new TestAglaError('TEST_ERROR', 'Test message', { code, severity, timestamp });

      expect(error.code).toBe(code);
      expect(error.severity).toBe(severity);
      expect(error.timestamp).toBe(timestamp);
    });
  });
});

describe('Given AglaError constructor minimal parameter compatibility', () => {
  describe('When using legacy context parameter format', () => {
    it('Then should maintain backward compatibility', () => {
      const context = { userId: '123', operation: 'legacy' };
      const error = new TestAglaError('TEST_ERROR', 'Test message', context as AglaErrorOptions);
      expect(error.context).toBe(context);
      expect(error.code).toBeUndefined();
      expect(error.severity).toBeUndefined();
      expect(error.timestamp).toBeUndefined();
    });
  });
});

describe('Given AglaError with large or heavy contexts', () => {
  it('Then should handle large object context', () => {
    const largeContext = {
      data: new Array(1000).fill(0).map((_, i) => ({ id: i, value: `item-${i}` })),
      metadata: { timestamp: Date.now(), version: '1.0.0' },
    };
    const error = new TestAglaError('LARGE_CONTEXT_ERROR', 'Large context test', { context: largeContext });
    expect(error.name).toBe('TestAglaError');
  });
});
