// src: src/__tests__/unit/AglaError.chaining.spec.ts
// @(#) : AglaError チェーン動作 単体テスト

import { describe, expect, it } from 'vitest';
import { TestAglaError } from '../helpers/TestAglaError.class.ts';

describe('Given AglaError method chaining', () => {
  describe('When chaining with cause error', () => {
    it('Then should combine messages and preserve properties', () => {
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const causeError = new Error('Cause message');
      const chainedError = originalError.chain(causeError);

      expect(chainedError.message).toBe('Original message (caused by: Cause message)');
      expect(chainedError.errorType).toBe('TEST_ERROR');
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
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const causeError = new Error('Cause message');
      const chainedError = originalError.chain(causeError);
      expect(chainedError).not.toBe(originalError);
      expect(chainedError).toBeInstanceOf(TestAglaError);
    });
  });

  describe('When chaining with invalid or non-Error causes', () => {
    it('Then 異常系：should handle null cause gracefully', () => {
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const nullCause = null as unknown as Error;
      expect(() => originalError.chain(nullCause)).toThrow();
    });

    it('Then 異常系：should handle undefined cause gracefully', () => {
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const undefinedCause = undefined as unknown as Error;
      expect(() => originalError.chain(undefinedCause)).toThrow();
    });

    it('Then 正常系：should handle string cause by accessing message property', () => {
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const stringCause = 'string error' as unknown as Error;
      const stringChainedError = originalError.chain(stringCause);
      expect(stringChainedError.message).toBe('Original message (caused by: undefined)');
    });

    it('Then エッジケース：should handle object cause by accessing message property', () => {
      const originalError = new TestAglaError('TEST_ERROR', 'Original message');
      const objectCause = { message: 'object error message' } as unknown as Error;
      const chainedError = originalError.chain(objectCause);
      expect(chainedError.message).toBe('Original message (caused by: object error message)');
    });
  });
});
