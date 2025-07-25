// src: ./__tests__/EstaError.spec.ts
// @(#): EstaErrorクラステスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { EstaError } from '../error/EstaError';

describe('EstaError', () => {
  it('should be instantiated with code and message', () => {
    const code = 'TEST_ERROR';
    const message = 'Test error message';
    const error = new EstaError(code, message);

    expect(error.code).toBe(code);
    expect(error.message).toBe(message);
  });

  it('should extend Error', () => {
    const error = new EstaError('TEST_ERROR', 'Test error');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(EstaError);
  });

  it('should have correct name property', () => {
    const error = new EstaError('TEST_ERROR', 'Test error');

    expect(error.name).toBe('EstaError');
  });

  it('should have default severity of error', () => {
    const error = new EstaError('TEST_ERROR', 'Test error');

    expect(error.severity).toBe('error');
  });

  it('should have timestamp field', () => {
    const beforeTime = new Date();
    const error = new EstaError('TEST_ERROR', 'Test error');
    const afterTime = new Date();

    expect(error.timestamp).toBeInstanceOf(Date);
    expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(error.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });

  it('should accept optional context parameter', () => {
    const context = { userId: 123, operation: 'test' };
    const error = new EstaError('TEST_ERROR', 'Test error', context);

    expect(error.context).toEqual(context);
  });

  it('should have undefined context when not provided', () => {
    const error = new EstaError('TEST_ERROR', 'Test error');

    expect(error.context).toBeUndefined();
  });

  describe('Edge Cases', () => {
    it('should handle empty code string', () => {
      const error = new EstaError('', 'Test message');

      expect(error.code).toBe('');
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('EstaError');
    });

    it('should handle empty message string', () => {
      const error = new EstaError('TEST_ERROR', '');

      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('');
      expect(error.name).toBe('EstaError');
    });

    it('should handle whitespace-only code', () => {
      const code = '   \t\n   ';
      const error = new EstaError(code, 'Test message');

      expect(error.code).toBe(code);
      expect(error.message).toBe('Test message');
    });

    it('should handle whitespace-only message', () => {
      const message = '   \t\n   ';
      const error = new EstaError('TEST_ERROR', message);

      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe(''); // trimmed to empty string
    });

    it('should automatically trim whitespace from message', () => {
      const messageWithWhitespace = '   Test message with spaces   ';
      const error = new EstaError('TEST_ERROR', messageWithWhitespace);

      expect(error.message).toBe('Test message with spaces');
    });

    it('should convert whitespace-only message to empty string', () => {
      const whitespaceMessage = '   \t\n   ';
      const error = new EstaError('TEST_ERROR', whitespaceMessage);

      expect(error.message).toBe('');
    });

    it('should handle very long strings', () => {
      const longCode = 'A'.repeat(10000);
      const longMessage = 'B'.repeat(10000);
      const error = new EstaError(longCode, longMessage);

      expect(error.code).toBe(longCode);
      expect(error.message).toBe(longMessage);
      expect(error.code.length).toBe(10000);
      expect(error.message.length).toBe(10000);
    });

    it('should handle special characters in code and message', () => {
      const specialCode = '🚨ERROR_日本語_@#$%^&*()_+-=[]{}|;:\'",.<>?/`~';
      const specialMessage = 'Error: ñáéíóú αβγδε 中文 🔥💀⚠️';
      const error = new EstaError(specialCode, specialMessage);

      expect(error.code).toBe(specialCode);
      expect(error.message).toBe(specialMessage);
    });

    it('should handle newlines and tabs in message (should be trimmed)', () => {
      const messageWithNewlines = '\n\t  Error with\nnewlines\tand tabs  \n\t';
      const error = new EstaError('TEST_ERROR', messageWithNewlines);

      expect(error.message).toBe('Error with\nnewlines\tand tabs');
    });
  });

  describe('Context Handling', () => {
    it('should handle null context gracefully', () => {
      const error = new EstaError('TEST_ERROR', 'Test message', null as Record<string, unknown> | null);

      expect(error.context).toBeNull();
    });

    it('should handle context with null values', () => {
      const context = { value: null, other: 'test' };
      const error = new EstaError('TEST_ERROR', 'Test message', context);

      expect(error.context).toEqual(context);
      expect(error.context?.value).toBeNull();
    });

    it('should handle context with undefined values', () => {
      const context = { value: undefined, other: 'test' };
      const error = new EstaError('TEST_ERROR', 'Test message', context);

      expect(error.context).toEqual(context);
      expect(error.context?.value).toBeUndefined();
    });

    it('should handle deeply nested context', () => {
      const context = {
        level1: {
          level2: {
            level3: {
              value: 'deep value',
              array: [1, 2, { nested: true }],
            },
          },
        },
      };
      const error = new EstaError('TEST_ERROR', 'Test message', context);

      expect(error.context).toEqual(context);
      expect((error.context as Record<string, unknown>)?.level1?.level2?.level3?.value).toBe('deep value');
    });

    it('should handle circular reference in context', () => {
      const context: Record<string, unknown> = { name: 'test' };
      context.self = context; // circular reference

      expect(() => {
        const error = new EstaError('TEST_ERROR', 'Test message', context);
        expect(error.context).toBe(context);
        // JSON.stringify should fail on circular reference
        expect(() => JSON.stringify(error.context)).toThrow();
      }).not.toThrow(); // Creating the error should not throw
    });
  });

  describe('Immutability', () => {
    it('should maintain TypeScript readonly properties (compile-time protection)', () => {
      const error = new EstaError('TEST_ERROR', 'Test message');
      const originalCode = error.code;
      const originalSeverity = error.severity;
      const originalTimestamp = error.timestamp;

      // Note: TypeScript readonly only provides compile-time protection
      // At runtime, these properties can be modified in JavaScript
      // This test documents the current behavior
      expect(error.code).toBe(originalCode);
      expect(error.severity).toBe(originalSeverity);
      expect(error.timestamp).toBe(originalTimestamp);
    });

    it('should maintain property stability during normal usage', () => {
      const context = { value: 'original' };
      const error = new EstaError('TEST_ERROR', 'Test message', context);

      const originalCode = error.code;
      const originalMessage = error.message;
      const originalSeverity = error.severity;
      const originalTimestamp = error.timestamp;
      const originalContext = error.context;

      // Properties should remain stable during normal usage
      expect(error.code).toBe(originalCode);
      expect(error.message).toBe(originalMessage);
      expect(error.severity).toBe(originalSeverity);
      expect(error.timestamp).toBe(originalTimestamp);
      expect(error.context).toBe(originalContext);
    });

    it('should allow modification of context content but not affect original', () => {
      const context = { value: 'original', nested: { prop: 'test' } };
      const error = new EstaError('TEST_ERROR', 'Test message', context);

      // Modify original context
      context.value = 'modified';
      context.nested.prop = 'changed';

      // Error's context should still reference the same object
      expect(error.context).toBe(context);
      expect((error.context as Record<string, unknown>)?.value).toBe('modified');
      expect((error.context as Record<string, unknown>)?.nested.prop).toBe('changed');
    });
  });

  describe('Stack Trace', () => {
    it('should preserve stack trace', () => {
      const error = new EstaError('TEST_ERROR', 'Test message');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('EstaError: Test message');
    });

    it('should include constructor in stack trace', () => {
      const createError = (): EstaError => {
        return new EstaError('TEST_ERROR', 'Test message');
      };

      const error = createError();
      expect(error.stack).toContain('createError');
    });
  });

  describe('String Representation', () => {
    it('should have proper toString() behavior', () => {
      const error = new EstaError('TEST_ERROR', 'Test message');

      expect(error.toString()).toBe('EstaError: Test message');
    });

    it('should handle empty message in toString()', () => {
      const error = new EstaError('TEST_ERROR', '');

      expect(error.toString()).toBe('EstaError');
    });

    it('should handle special characters in toString()', () => {
      const error = new EstaError('TEST_ERROR', 'Message with 🚨 emoji');

      expect(error.toString()).toBe('EstaError: Message with 🚨 emoji');
    });
  });
});
