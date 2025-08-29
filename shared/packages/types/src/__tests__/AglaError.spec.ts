import { describe, expect, it } from 'vitest';

// Type definitions
import { AglaError } from '../../types/AglaError.types.ts';
import type { AglaErrorOptions } from '../../types/AglaError.types.ts';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.ts';

// Test utilities
import type { Mutable } from './helpers/test-types.types.ts';
import { TestAglaError } from './helpers/TestAglaError.class.ts';

type TCircularObject = {
  name?: string;
  self?: TCircularObject;
};

/**
 * Test suite for AglaError constructor behavior.
 * Verifies error instantiation with different parameter combinations and edge cases.
 */
describe('Given AglaError constructor', () => {
  describe('When creating error with valid parameters', () => {
    it('Then 正常系：should set basic properties correctly', () => {
      // Arrange
      const errorType = 'TEST_ERROR';
      const message = 'Test error message';

      // Act
      const error = new TestAglaError(errorType, message);

      // Assert
      expect(error).toBeInstanceOf(TestAglaError);
      expect(error.errorType).toBe(errorType);
      expect(error.message).toBe(message);
    });

    it('Then 正常系：should set code option', () => {
      const error = new TestAglaError('TEST_ERROR', 'Test error message', { code: 'TEST_001' });
      expect(error.code).toBe('TEST_001');
    });

    it('Then 正常系：should set context option', () => {
      const ctx = { userId: '123', operation: 'test' };
      const error = new TestAglaError('TEST_ERROR', 'Test error message', { context: ctx });
      expect(error.context).toBe(ctx);
    });

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

  describe('When creating error with invalid parameters', () => {
    it('Then 異常系：should handle invalid timestamp gracefully', () => {
      const invalidDate = new Date('invalid-date');
      const error = new TestAglaError('TEST_ERROR', 'Test message', { timestamp: invalidDate });
      expect(error.timestamp).toBe(invalidDate);
      expect(isNaN(error.timestamp!.getTime())).toBe(true);
    });

    it('Then 異常系：should handle invalid severity as per implementer policy', () => {
      const invalidSeverity = 'critical' as unknown as ErrorSeverity;
      const error = new TestAglaError('TEST_ERROR', 'Test message', { severity: invalidSeverity });
      expect(error.severity).toBe(invalidSeverity);
    });

    // U-001-01: null/undefined オプション処理テスト追加
    it('Then 異常系：should handle null code option', () => {
      const error = new TestAglaError('TEST_ERROR', 'Test message', { code: null as unknown as string });
      expect(error.code).toBeNull();
    });

    it('Then 異常系：should handle undefined severity option', () => {
      const error = new TestAglaError('TEST_ERROR', 'Test message', { severity: undefined });
      expect(error.severity).toBeUndefined();
    });

    // U-002-02: 不正なSeverity値処理テスト追加
    it('Then 異常系：should handle non-enum severity value', () => {
      const invalidSeverity = 'critical' as unknown as ErrorSeverity;
      const error = new TestAglaError('TEST_ERROR', 'Test message', { severity: invalidSeverity });
      expect(error.severity).toBe(invalidSeverity);
    });

    // U-002-03: 空文字列パラメータ処理テスト追加
    it('Then 異常系：should handle empty error type', () => {
      const error = new TestAglaError('', 'Test message');
      expect(error.errorType).toBe('');
    });

    it('Then 異常系：should handle empty message', () => {
      const error = new TestAglaError('TEST_ERROR', '');
      expect(error.message).toBe('');
    });
  });

  describe('When creating error with edge case parameters', () => {
    it('Then エッジケース：should handle special characters in errorType', () => {
      const errorType = 'TEST_ERROR/SPECIAL@CHARS#123';
      const error = new TestAglaError(errorType, 'Test message');
      expect(error.errorType).toBe(errorType);
    });

    it('Then エッジケース：should handle unicode characters in message', () => {
      const message = 'テストメッセージ 🚨 Error occurred';
      const error = new TestAglaError('TEST_ERROR', message);
      expect(error.message).toBe(message);
    });

    it('Then エッジケース：should handle nested object context', () => {
      const context = {
        user: { id: '123', name: 'John' },
        operation: { type: 'CREATE', resource: 'user' },
        metadata: { timestamp: '2025-08-29', version: '1.0' },
      };
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context });
      expect(error.context).toBe(context);
    });

    it('Then エッジケース：should handle array values in context', () => {
      const context = {
        operations: ['create', 'update', 'delete'],
        errors: [{ code: 'E001' }, { code: 'E002' }],
      };
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context });
      expect(error.context).toBe(context);
    });

    // U-001-02: 関数/シンボル値コンテキスト処理テスト追加
    it('Then エッジケース：should handle function values in context', () => {
      const callback = (): string => 'test';
      const context = { callback, operation: 'function-test' };
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context });
      expect(typeof error.context?.callback).toBe('function');
    });

    it('Then エッジケース：should handle symbol keys in context', () => {
      const symbolKey = Symbol('testSymbol');
      const context = { [symbolKey]: 'symbol-value', operation: 'symbol-test' } as Record<string | symbol, unknown>;
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context });
      expect((error.context as Record<string | symbol, unknown>)[symbolKey]).toBe('symbol-value');
    });

    it('Then エッジケース：should handle large object context', () => {
      const largeContext = {
        data: new Array(1000).fill(0).map((_, i) => ({ id: i, value: `item-${i}` })),
        metadata: { timestamp: Date.now(), version: '1.0.0' },
      };
      const error = new TestAglaError('LARGE_CONTEXT_ERROR', 'Large context test', { context: largeContext });
      expect(error.context).toBe(largeContext);
      expect(error.context?.data).toHaveLength(1000);
    });

    // U-001-03: 極端に長い文字列処理テスト追加
    it('Then エッジケース：should handle extremely long error message', () => {
      const longMessage = 'A'.repeat(10000);
      const error = new TestAglaError('LONG_MESSAGE_ERROR', longMessage);
      expect(error.message.length).toBe(10000);
    });

    it('Then エッジケース：should handle extremely long error type', () => {
      const longErrorType = 'A'.repeat(1000); // Creates exactly 1000 character string
      const error = new TestAglaError(longErrorType, 'Test message');
      expect(error.errorType.length).toBe(1000);
    });

    it('Then エッジケース：should handle maximum safe integer timestamp', () => {
      const maxTimestamp = new Date(Number.MAX_SAFE_INTEGER);
      const error = new TestAglaError('MAX_TIME_ERROR', 'Max timestamp', { timestamp: maxTimestamp });
      expect(error.timestamp).toBe(maxTimestamp);
    });

    it('Then エッジケース：should handle minimum timestamp', () => {
      const minTimestamp = new Date(0);
      const error = new TestAglaError('MIN_TIME_ERROR', 'Min timestamp', { timestamp: minTimestamp });
      expect(error.timestamp).toBe(minTimestamp);
    });
  });
});

/**
 * Test suite for AglaError property access behavior.
 * Validates property immutability and getter functionality.
 */
describe('Given AglaError property access', () => {
  describe('When accessing properties', () => {
    it('Then 正常系：should return correct property values', () => {
      // Arrange
      const code = 'TEST_001';
      const severity = ErrorSeverity.ERROR;
      const timestamp = new Date('2025-08-29T21:42:00Z');
      const context = { userId: '123', operation: 'test' };
      const error = new TestAglaError('TEST_ERROR', 'Test message', { code, severity, timestamp, context });

      // Act & Assert
      expect(error.errorType).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe(code);
      expect(error.severity).toBe(severity);
      expect(error.timestamp).toBe(timestamp);
      expect(error.context).toBe(context);
    });
  });

  describe('When attempting property modification', () => {
    it('Then 異常系：should enforce readonly constraint for errorType', () => {
      // Arrange
      const error = new TestAglaError('TEST_ERROR', 'Test message');

      // Act & Assert
      expect(() => {
        (error as Mutable<AglaError>).errorType = 'MODIFIED';
      }).toThrow('Cannot set property errorType of');
    });

    it('Then 異常系：should enforce readonly constraint for context', () => {
      // Arrange
      const context = { userId: '123', operation: 'test' };
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context });

      // Act & Assert
      expect(() => {
        (error as Mutable<AglaError>).context = { modified: true };
      }).toThrow('Cannot set property context of');
    });
  });

  describe('When checking property defaults', () => {
    it('Then エッジケース：should return undefined for unset optional properties', () => {
      // Arrange
      const error = new TestAglaError('TEST_ERROR', 'Test message');

      // Act & Assert
      expect(error.code).toBeUndefined();
      expect(error.severity).toBeUndefined();
      expect(error.timestamp).toBeUndefined();
      expect(error.context).toBeUndefined();
    });
  });
});

/**
 * Test suite for AglaError JSON serialization functionality.
 * Validates toJSON method output format and property inclusion/exclusion logic.
 */
describe('Given AglaError JSON serialization', () => {
  describe('When serializing to JSON', () => {
    it('Then 正常系：should include basic properties (errorType and message)', () => {
      // Arrange
      const errorType = 'TEST_ERROR';
      const message = 'Test message';
      const error = new TestAglaError(errorType, message);

      // Act
      const json = error.toJSON();

      // Assert
      expect(json).toEqual({ errorType, message });
    });

    it('Then 正常系：should include context when present', () => {
      // Arrange
      const context = { userId: '123', operation: 'test' };
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context });

      // Act
      const json = error.toJSON();

      // Assert
      expect(json).toEqual({
        errorType: 'TEST_ERROR',
        message: 'Test message',
        context,
      });
    });

    it('Then 正常系：should include all properties with correct formatting', () => {
      // Arrange
      const code = 'TEST_001';
      const severity = ErrorSeverity.FATAL;
      const timestamp = new Date('2025-08-29T21:42:00Z');
      const context = { userId: '123', operation: 'all-options' };
      const error = new TestAglaError('TEST_ERROR', 'Test message', { code, severity, timestamp, context });

      // Act
      const json = error.toJSON();

      // Assert
      expect(json).toEqual({
        errorType: 'TEST_ERROR',
        message: 'Test message',
        code,
        severity,
        timestamp: timestamp.toISOString(),
        context,
      });
    });

    it('Then 正常系：should exclude undefined properties', () => {
      // Arrange
      const error = new TestAglaError('TEST_ERROR', 'Test message', { code: 'TEST_001' });

      // Act
      const json = error.toJSON();

      // Assert
      expect(json).toEqual({
        errorType: 'TEST_ERROR',
        message: 'Test message',
        code: 'TEST_001',
      });
      expect(json).not.toHaveProperty('severity');
      expect(json).not.toHaveProperty('timestamp');
      expect(json).not.toHaveProperty('context');
    });
  });

  describe('When handling JSON edge cases', () => {
    it('Then エッジケース：should handle context with circular references', () => {
      // Arrange
      const circularContext: TCircularObject = { name: 'circular' };
      circularContext.self = circularContext;
      const error = new TestAglaError('CIRCULAR_ERROR', 'Circular test', { context: circularContext });

      // Act & Assert
      expect(() => JSON.stringify(error.toJSON())).toThrow();
    });
  });
});

/**
 * Test suite for AglaError method chaining functionality.
 * Tests error chaining behavior and context preservation.
 */
describe('Given AglaError method chaining', () => {
  describe('When chaining with cause error', () => {
    it('Then 正常系：should combine messages with cause information', () => {
      // Arrange
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const causeError = new Error('Cause message');

      // Act
      const chainedError = originalError.chain(causeError);

      // Assert
      expect(chainedError.message).toBe('Original message (caused by: Cause message)');
    });

    it('Then 正常系：should preserve original errorType', () => {
      // Arrange
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const causeError = new Error('Cause message');

      // Act
      const chainedError = originalError.chain(causeError);

      // Assert
      expect(chainedError.errorType).toBe('TEST_ERROR');
    });

    it('Then 正常系：should merge context with cause information', () => {
      // Arrange
      const originalContext = { userId: '123', operation: 'test' };
      const originalError = new TestAglaError('TEST_ERROR', 'Original message', { context: originalContext });
      const causeError = new Error('Cause message');

      // Act
      const chainedError = originalError.chain(causeError);

      // Assert
      expect(chainedError.context).toEqual({
        userId: '123',
        operation: 'test',
        cause: 'Cause message',
      });
    });

    it('Then 正常系：should return new error instance', () => {
      // Arrange
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const causeError = new Error('Cause message');

      // Act
      const chainedError = originalError.chain(causeError);

      // Assert
      expect(chainedError).not.toBe(originalError);
      expect(chainedError).toBeInstanceOf(TestAglaError);
    });

    it('Then 正常系：should handle chaining different error types', () => {
      // Arrange
      const customError = new TypeError('Type error occurred');
      const aglaError = new TestAglaError('AGLA_ERROR', 'Agla error');

      // Act
      const chainedError = aglaError.chain(customError);

      // Assert
      expect(chainedError.message).toBe('Agla error (caused by: Type error occurred)');
      expect(chainedError).toBeInstanceOf(TestAglaError);
    });

    // U-004-01: Deeply nested chains moved to functional tests
  });

  describe('When chaining with invalid cause', () => {
    it('Then 異常系：should handle null cause gracefully', () => {
      // Arrange
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const nullCause = null as unknown as Error;

      // Act & Assert
      expect(() => originalError.chain(nullCause)).toThrow();
    });

    it('Then 異常系：should handle undefined cause gracefully', () => {
      // Arrange
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const undefinedCause = undefined as unknown as Error;

      // Act & Assert
      expect(() => originalError.chain(undefinedCause)).toThrow();
    });

    it('Then エッジケース：should handle string cause by accessing message property', () => {
      // Arrange
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const stringCause = 'string error' as unknown as Error;

      // Act
      const chainedError = originalError.chain(stringCause);

      // Assert
      expect(chainedError.message).toBe('Original message (caused by: undefined)');
    });

    it('Then エッジケース：should handle object cause by accessing message property', () => {
      // Arrange
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const objectCause = { message: 'object error message' } as unknown as Error;

      // Act
      const chainedError = originalError.chain(objectCause);

      // Assert
      expect(chainedError.message).toBe('Original message (caused by: object error message)');
    });
  });
});

/**
 * Test suite for AglaError inheritance from JavaScript Error class.
 * Validates proper Error class inheritance and standard Error properties.
 */
describe('Given AglaError inheritance', () => {
  describe('When checking Error inheritance properties', () => {
    it('Then 正常系：should have correct name property', () => {
      // Arrange & Act
      const error = new TestAglaError('TEST_ERROR', 'Test message');

      // Assert
      expect(error.name).toBe('TestAglaError');
    });

    it('Then 正常系：should generate proper stack trace', () => {
      // Arrange & Act
      const error = new TestAglaError('TEST_ERROR', 'Test message');

      // Assert
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('TestAglaError: Test message');
    });

    it('Then 正常系：should be instanceof Error', () => {
      // Arrange & Act
      const error = new TestAglaError('TEST_ERROR', 'Test message');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TestAglaError);
    });
  });
});

/**
 * Test suite for AglaError string representation functionality.
 * Validates toString method output format and content inclusion.
 */
describe('Given AglaError string representation', () => {
  describe('When converting to string', () => {
    it('Then 正常系：should include errorType and message', () => {
      // Arrange
      const errorType = 'TEST_ERROR';
      const message = 'Test message';
      const error = new TestAglaError(errorType, message);

      // Act
      const result = error.toString();

      // Assert
      expect(result).toContain(errorType);
      expect(result).toContain(message);
    });

    it('Then 正常系：should include context when present', () => {
      // Arrange
      const context = { userId: '123', operation: 'test' };
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context });

      // Act
      const result = error.toString();

      // Assert
      expect(result).toContain(JSON.stringify(context));
    });

    it('Then 正常系：should follow consistent format', () => {
      // Arrange
      const errorType = 'TEST_ERROR';
      const message = 'Test message';
      const context = { userId: '123' };
      const error = new TestAglaError(errorType, message, { context });
      const expectedFormat = `${errorType}: ${message} ${JSON.stringify(context)}`;

      // Act
      const result = error.toString();

      // Assert
      expect(result).toBe(expectedFormat);
    });
  });

  describe('When handling special property combinations', () => {
    it('Then エッジケース：should handle all severity levels with context', () => {
      // Arrange
      const severities = [ErrorSeverity.FATAL, ErrorSeverity.ERROR, ErrorSeverity.WARNING, ErrorSeverity.INFO];
      const context = { test: 'context' };

      // Act & Assert
      severities.forEach((severity) => {
        const error = new TestAglaError('TEST_ERROR', 'Test message', { severity, context });
        expect(error.severity).toBe(severity);
        expect(error.context).toBe(context);
      });
    });

    it('Then エッジケース：should handle complete property set', () => {
      // Arrange
      const timestamp = new Date('2025-12-31T23:59:59.999Z');
      const severity = ErrorSeverity.FATAL;
      const context = { final: true, year: 2025 };

      // Act
      const error = new TestAglaError('FINAL_ERROR', 'Final test', {
        timestamp,
        severity,
        context,
        code: 'FINAL_001',
      });

      // Assert
      expect(error.timestamp).toBe(timestamp);
      expect(error.severity).toBe(severity);
      expect(error.context).toBe(context);
      expect(error.code).toBe('FINAL_001');
    });
  });
});

// === 継承・TypeScript型安全性テスト（統合済み）===

/**
 * Test suite for AglaError TypeScript type system integration.
 * Validates type safety across implementations and generic usage.
 */
describe('Given AglaError TypeScript type system', () => {
  describe('When using generic error handler functions', () => {
    it('Then 正常系：should maintain type safety across implementations', () => {
      // Arrange
      type ProcessedError = {
        type: string;
        serialized: unknown;
        chained: AglaError;
      };
      const errorProcessor = (error: AglaError): ProcessedError => ({
        type: error.errorType,
        serialized: error.toJSON(),
        chained: error.chain(new Error('Test cause')),
      });
      const errors: AglaError[] = [new TestAglaError('TEST_ERROR', 'Test message')];

      // Act
      const processed = errors.map(errorProcessor);

      // Assert
      processed.forEach((result) => {
        expect(typeof result.type).toBe('string');
        expect(result.serialized).toHaveProperty('errorType');
      });
    });

    it('Then 正常系：should support union types with Error class', () => {
      // Arrange
      const mixedErrors: (AglaError | Error)[] = [
        new TestAglaError('TEST_TYPE', 'Test message'),
        new Error('Standard error'),
      ];

      // Act & Assert
      mixedErrors.forEach((error) => {
        if (error instanceof AglaError) {
          expect(typeof error.errorType).toBe('string');
          expect(typeof error.toJSON).toBe('function');
        }
      });
    });

    it('Then 正常系：should provide consistent interface methods', () => {
      // Arrange
      const implementations = [new TestAglaError('TEST', 'msg')];

      // Act & Assert
      implementations.forEach((impl) => {
        expect(typeof impl.toJSON).toBe('function');
        expect(typeof impl.toString).toBe('function');
        expect(typeof impl.chain).toBe('function');
        expect(typeof (impl as AglaError).errorType).toBe('string');
      });
    });

    it('Then 正常系：should maintain property consistency across implementations', () => {
      // Arrange
      const baseProps = ['errorType', 'message', 'name', 'stack'] as const;
      const implementations = [new TestAglaError('TEST_ERROR', 'Test message')];

      // Act & Assert
      implementations.forEach((impl) => {
        baseProps.forEach((prop) => {
          expect(prop in impl).toBe(true);
        });
      });
    });
  });
});
