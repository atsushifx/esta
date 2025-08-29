import { describe, expect, it } from 'vitest';
import { AglaError } from '../../types/AglaError.types.js';
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
});
