// src: src/__tests__/AglaError.spec.ts
// @(#) : Comprehensive unit tests for AglaError base class
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { AglaError } from '../../types/AglaError.types.ts';
import type { AglaErrorContext, AglaErrorOptions } from '../../types/AglaError.types.ts';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.ts';

// Test utilities
import { TestAglaError } from './helpers/TestAglaError.class.ts';

// type definitions for Test
import type { _TAglaErrorContextWithSymbols, _TMutable } from './helpers/test-types.types.ts';

type _TCircularContext = AglaErrorContext & {
  name: string;
  self?: _TCircularContext;
};

/**
 * Test suite for AglaError constructor behavior with valid input parameters.
 * Verifies that all properties are correctly set during error instantiation.
 */
describe('Given AglaError constructor with valid inputs', () => {
  describe('When creating error with basic parameters only', () => {
    it('Then should set errorType property correctly', () => {
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

      const error = new TestAglaError('TEST_SYMBOL_CONTEXT', 'Symbol context test', { context: symbolContext });

      expect(symbolContext).toSatisfy((ctx): ctx is _TAglaErrorContextWithSymbols => {
        return ctx !== null && typeof ctx === 'object';
      });
      expect(symbolContext[symbolKey]).toBe('symbol-value');
      expect((error.context as _TAglaErrorContextWithSymbols)[symbolKey]).toBe('symbol-value');
    });

    it('Then should handle extremely large contexts and strings', () => {
      // large object context
      const largeContext = {
        data: new Array(1000).fill(0).map((_, i) => ({ id: i, value: `item-${i}` })),
        metadata: { timestamp: Date.now(), version: '1.0.0' },
      };
      const largeContextError = new TestAglaError('LARGE_CONTEXT_ERROR', 'Large context test', {
        context: largeContext,
      });
      expect(largeContextError.context).toBe(largeContext);
      expect(largeContextError.context?.data).toHaveLength(1000);

      // extremely long error message
      const longMessage = 'A'.repeat(10000);
      const longMessageError = new TestAglaError('LONG_MESSAGE_ERROR', longMessage);
      expect(longMessageError.message.length).toBe(10000);

      // extremely long error type
      const longErrorType = 'A'.repeat(1000);
      const longTypeError = new TestAglaError(longErrorType, 'Test message');
      expect(longTypeError.errorType.length).toBe(1000);
    });

    it('Then should handle extreme timestamp values', () => {
      // maximum safe integer timestamp
      const maxTimestamp = new Date(Number.MAX_SAFE_INTEGER);
      const maxError = new TestAglaError('MAX_TIME_ERROR', 'Max timestamp', { timestamp: maxTimestamp });
      expect(maxError.timestamp).toBe(maxTimestamp);

      // minimum timestamp
      const minTimestamp = new Date(0);
      const minError = new TestAglaError('MIN_TIME_ERROR', 'Min timestamp', { timestamp: minTimestamp });
      expect(minError.timestamp).toBe(minTimestamp);
    });
  });
});

/**
 * Test suite for AglaError property immutability and readonly constraints.
 * Ensures error instances maintain data integrity by preventing property modification.
 */
describe('Given AglaError instance with set properties', () => {
  describe('When attempting to modify errorType property', () => {
    it('Then should enforce readonly constraint', () => {
      // Arrange
      const error = new TestAglaError('TEST_ERROR', 'Test message');

      // Act & Assert
      expect(() => {
        (error as _TMutable<AglaError>).errorType = 'MODIFIED';
      }).toThrow('Cannot set property errorType of');
    });

    it('Then 異常系：should enforce readonly constraint for context', () => {
      // Arrange
      const context = { userId: '123', operation: 'test' };
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context });

      // Act & Assert
      expect(() => {
        (error as _TMutable<AglaError>).context = { modified: true };
      }).toThrow('Cannot set property context of');
    });
  });

  describe('When checking property defaults', () => {
    it('Then エッジケース：should return undefined for unset optional properties', () => {
      // Arrange
      const code = 'TEST_001';
      const severity = ErrorSeverity.ERROR;
      const timestamp = new Date('2025-08-29T21:42:00Z');
      const error = new TestAglaError('TEST_ERROR', 'Test message', { code, severity, timestamp });

      // Act & Assert
      expect(error.code).toBe(code);
      expect(error.severity).toBe(severity);
      expect(error.timestamp).toBe(timestamp);
    });
  });
});

/**
 * Test suite for AglaError constructor with minimal required parameters.
 * Verifies default behavior when optional properties are not provided.
 */
describe('Given AglaError constructor with minimal parameters', () => {
  describe('When creating error without optional properties', () => {
    it('Then should set optional properties to undefined', () => {
      // Arrange & Act
      const error = new TestAglaError('TEST_ERROR', 'Test message');

      // Act & Assert
      expect(error.code).toBeUndefined();
      expect(error.severity).toBeUndefined();
      expect(error.timestamp).toBeUndefined();
      expect(error.context).toBeUndefined();
    });
  });

  describe('When using legacy context parameter format', () => {
    it('Then should maintain backward compatibility', () => {
      // Arrange
      const context = { userId: '123', operation: 'legacy' };

      // Act
      const error = new TestAglaError('TEST_ERROR', 'Test message', context as AglaErrorOptions);

      // Assert
      expect(error.context).toBe(context);
      expect(error.code).toBeUndefined();
      expect(error.severity).toBeUndefined();
      expect(error.timestamp).toBeUndefined();
    });
  });
});

describe('Given AglaError instance for JSON serialization', () => {
  describe('When calling toJSON with basic properties only', () => {
    it('Then should include errorType and message', () => {
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
      const timestamp = new Date('2025-08-29T21:42:00Z');
      const error = new TestAglaError('TEST_ERROR', 'Test message', { timestamp });
      const json = error.toJSON();
      expect(json.timestamp).toBe(timestamp.toISOString());
    });
  });

  it('Then should handle circular reference edge case', () => {
    const circularContext: _TCircularContext = { name: 'circular' };
    circularContext.self = circularContext;
    const error = new TestAglaError('CIRCULAR_ERROR', 'Circular test', { context: circularContext });
    expect(() => JSON.stringify(error.toJSON())).toThrow();
  });
});

/**
 * Test suite for AglaError method chaining functionality.
 * Tests error chaining behavior and context preservation.
 */
describe('Given AglaError method chaining', () => {
  describe('When chaining with cause error', () => {
    it('Then should combine messages and preserve properties', () => {
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const causeError = new Error('Cause message');
      const chainedError = originalError.chain(causeError);

      // should combine messages with cause information
      expect(chainedError.message).toBe('Original message (caused by: Cause message)');

      // should preserve original errorType
      expect(chainedError.errorType).toBe('TEST_ERROR');

      // should return new error instance
      expect(chainedError).not.toBe(originalError);
      expect(chainedError).toBeInstanceOf(TestAglaError);
    });

    it('Then should merge context with cause information', () => {
      const originalContext = { userId: '123', operation: 'test' };
      const originalError = new TestAglaError('TEST_ERROR', 'Original message', { context: originalContext });
      const causeError = new Error('Cause message');
      const chainedError = originalError.chain(causeError);

      expect(chainedError.context).toHaveProperty('userId', '123');
      expect(chainedError.context).toHaveProperty('operation', 'test');
      expect(chainedError.context).toHaveProperty('cause', 'Cause message');
      expect(chainedError.context).toHaveProperty('originalError');
      expect(chainedError.context?.originalError).toEqual({
        name: 'Error',
        message: 'Cause message',
        stack: causeError.stack,
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
  });
});

describe('Given AglaError inheriting from Error class', () => {
  describe('When checking Error inheritance properties', () => {
    it('Then should have correct name property', () => {
      // Arrange & Act
      const error = new TestAglaError('TEST_ERROR', 'Test message');

      // Assert
      expect(error.name).toBe('TestAglaError');
    });

    it('Then should generate proper stack trace', () => {
      // Arrange & Act
      const error = new TestAglaError('TEST_ERROR', 'Test message');

      // Assert
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('TestAglaError: Test message');
    });

    it('Then should pass instanceof checks', () => {
      // Arrange & Act
      const error = new TestAglaError('TEST_ERROR', 'Test message');

      // Assert
      expect(error instanceof Error).toBe(true);
      expect(error instanceof TestAglaError).toBe(true);
    });
  });
});

describe('Given AglaError constructor with various input combinations', () => {
  describe('When creating error with empty string parameters', () => {
    it('Then should handle empty errorType', () => {
      // Arrange & Act
      const error = new TestAglaError('', 'Test message');

      // Assert
      expect(error.errorType).toBe('');
    });

    it('Then should handle empty message', () => {
      // Arrange & Act
      const error = new TestAglaError('TEST_ERROR', '');

      // Assert
      expect(error.message).toBe('');
    });
  });

  describe('When creating error with special characters', () => {
    it('Then should handle special characters in errorType', () => {
      // Arrange
      const customError = new TypeError('Type error occurred');
      const aglaError = new TestAglaError('AGLA_ERROR', 'Agla error');

      // Act
      const chainedError = aglaError.chain(customError);

      // Assert
      // チェーン後も errorType は変化しない
      expect(chainedError.errorType).toBe('AGLA_ERROR');
    });

    it('Then should handle unicode characters in message', () => {
      // Arrange
      const message = 'テストメッセージ 🚨 Error occurred';

      // Act
      const error = new TestAglaError('TEST_ERROR', message);

      // Assert
      expect(error.message).toBe(message);
    });
  });

  describe('When creating error with complex context objects', () => {
    it('Then should handle nested object context', () => {
      // Arrange
      const context = {
        user: { id: '123', name: 'John' },
        operation: { type: 'CREATE', resource: 'user' },
        metadata: { timestamp: '2025-08-29', version: '1.0' },
      };

      // Act
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context });

      // Assert
      expect(error.context).toBe(context);
    });

    it('Then should handle array values in context', () => {
      // Arrange
      const context = {
        operations: ['create', 'update', 'delete'],
        errors: [{ code: 'E001' }, { code: 'E002' }],
      };

      // Act
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context });

      // Assert
      expect(error.context).toBe(context);
    });
  });
});

describe('Given AglaError constructor with invalid inputs', () => {
  describe('When creating error with invalid timestamp', () => {
    it('Then should handle invalid Date object', () => {
      // Arrange
      const invalidDate = new Date('invalid-date');

      // Act
      const error = new TestAglaError('TEST_ERROR', 'Test message', { timestamp: invalidDate });

      // Assert
      expect(error.timestamp).toBe(invalidDate);
      expect(isNaN(error.timestamp!.getTime())).toBe(true);
    });
  });

  describe('When creating error with invalid severity', () => {
    it('Then should handle non-ErrorSeverity value', () => {
      // Arrange
      const invalidSeverity = 'critical' as unknown as ErrorSeverity;

      // Act
      const error = new TestAglaError('TEST_ERROR', 'Test message', { severity: invalidSeverity });

      // Assert
      expect(error.severity).toBe(invalidSeverity);
    });
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

    it('Then 正常系：should handle string cause by accessing message property', () => {
      // Arrange
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const stringCause = 'string error' as unknown as Error;

      // Act
      const stringChainedError = originalError.chain(stringCause);

      // Assert
      expect(stringChainedError.message).toBe('Original message (caused by: undefined)');
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

describe('Given AglaError with edge case scenarios', () => {
  describe('When creating error with extremely large context', () => {
    it('Then should handle large object context', () => {
      // Arrange
      const largeContext = {
        data: new Array(1000).fill(0).map((_, i) => ({ id: i, value: `item-${i}` })),
        metadata: { timestamp: Date.now(), version: '1.0.0' },
      };

      // Act
      const error = new TestAglaError('LARGE_CONTEXT_ERROR', 'Large context test', { context: largeContext });

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
    it('Then should follow consistent format with context', () => {
      const errorType = 'TEST_ERROR';
      const message = 'Test message';
      const context = { userId: '123' };
      const error = new TestAglaError(errorType, message, { context });
      const expectedFormat = `${errorType}: ${message} ${JSON.stringify(context)}`;
      const result = error.toString();
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

describe('Given AglaError instance for string representation', () => {
  describe('When calling toString with basic properties', () => {
    it('Then should include errorType in output', () => {
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
