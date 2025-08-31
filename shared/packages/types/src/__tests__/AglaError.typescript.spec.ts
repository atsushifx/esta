import { describe, expect, it } from 'vitest';
import { AglaError } from '../../types/AglaError.types.js';
import type { AglaErrorContext, AglaErrorOptions } from '../../types/AglaError.types.js';

// Test utilities
import { TestAglaError } from './helpers/TestAglaError.class.js';

/**
 * AglaError TypeScript Integration Unit Tests
 * Moved from E2E tests - these are unit-level tests for TypeScript type safety
 */

type ProcessedError = {
  type: string;
  severity?: unknown;
  serialized: unknown;
  chained: AglaError;
};

describe('Given AglaError TypeScript type system', () => {
  describe('When using generic error handler functions', () => {
    it('Then should maintain type safety across all implementations', () => {
      const errorProcessor = (error: AglaError): ProcessedError => ({
        type: error.errorType,
        serialized: error.toJSON(),
        chained: error.chain(new Error('Test cause')),
      });

      const errors: AglaError[] = [
        new TestAglaError('TEST_ERROR', 'Test message'),
      ];

      const processed = errors.map(errorProcessor);

      processed.forEach((result) => {
        expect(typeof result.type).toBe('string');
        expect(result.serialized).toHaveProperty('errorType');
      });
    });
  });

  describe('When supporting union types with Error class', () => {
    it('Then should support union types with Error class', () => {
      const mixedErrors: (AglaError | Error)[] = [
        new TestAglaError('TEST_TYPE', 'Test message'),
        new Error('Standard error'),
      ];

      mixedErrors.forEach((error) => {
        if (error instanceof AglaError) {
          expect(typeof error.errorType).toBe('string');
          expect(typeof error.toJSON).toBe('function');
        }
      });
    });
  });

  describe('When verifying Record<> type replacement with AglaErrorContext', () => {
    it('Then AglaErrorOptions.context should satisfy AglaErrorContext type after refactoring', () => {
      const validContext: AglaErrorContext = {
        userId: 'user123',
        requestId: 'req-456',
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' },
      };

      const options: AglaErrorOptions = {
        code: 'TEST_CODE',
        context: validContext,
      };

      // Type compatibility verification - this should pass after refactoring
      const contextCheck: AglaErrorContext | undefined = options.context;
      expect(contextCheck).toBeDefined();
      expect(typeof options.context?.userId).toBe('string');
      expect(options.context?.metadata).toEqual({ source: 'test' });
    });

    it('Then _AglaErrorOptions.context should satisfy AglaErrorContext type after refactoring', () => {
      const validContext: AglaErrorContext = {
        sessionId: 'sess-789',
        operationId: 'op-012',
        debug: true,
        tags: ['error', 'validation'],
      };

      const testError = new TestAglaError('TEST_TYPE', 'Test message', {
        code: 'INTERNAL_TEST',
        context: validContext,
      });

      // Access internal options to verify _AglaErrorOptions.context type
      // @ts-expect-error - Accessing private property for testing
      const internalOptions = testError._options;

      // Type compatibility verification - this should pass after refactoring
      const internalContextCheck: AglaErrorContext | undefined = internalOptions.context;
      expect(internalContextCheck).toBeDefined();
      expect(typeof internalOptions.context?.sessionId).toBe('string');
      expect(internalOptions.context?.tags).toEqual(['error', 'validation']);
      expect(internalOptions.context?.debug).toBe(true);
    });

    it('Then AglaError.context getter should satisfy AglaErrorContext | undefined type after refactoring', () => {
      const contextWithData: AglaErrorContext = {
        traceId: 'trace-345',
        spanId: 'span-678',
        environment: 'test',
        features: { logging: true, monitoring: false },
      };

      const errorWithContext = new TestAglaError('CONTEXT_TEST', 'Context test message', {
        context: contextWithData,
      });

      const errorWithoutContext = new TestAglaError('NO_CONTEXT_TEST', 'No context message');

      // Type compatibility verification - context getter should return AglaErrorContext | undefined
      const contextWithDataCheck: AglaErrorContext | undefined = errorWithContext.context;
      const contextWithoutDataCheck: AglaErrorContext | undefined = errorWithoutContext.context;
      expect(contextWithDataCheck).toBeDefined();
      expect(contextWithoutDataCheck).toBeUndefined();

      // Verify specific properties when context exists
      if (errorWithContext.context) {
        expect(typeof errorWithContext.context.traceId).toBe('string');
        expect(errorWithContext.context.features).toEqual({ logging: true, monitoring: false });
      }
    });
  });
});
