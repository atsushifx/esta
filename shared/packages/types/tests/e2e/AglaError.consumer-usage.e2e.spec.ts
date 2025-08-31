// src: tests/e2e/AglaError.consumer-usage.e2e.spec.ts
// @(#) : E2E tests for consumer usage scenarios of AglaError (E2-001 series)

import { describe, expect, it } from 'vitest';
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.js';
import { AglaError, type AglaErrorOptions } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

type TestErrorContext = {
  endpoint?: string;
  cause?: string;
};

describe('Given package consumer uses exported types in real code', () => {
  describe('When importing types and using try/catch workflow', () => {
    // E2-001-01
    it('Then should import AglaError types successfully', () => {
      // Arrange - Consumer defines concrete error extending AglaError
      class ConsumerError extends AglaError {
        constructor(errorType: string, message: string, options?: AglaErrorOptions) {
          super(errorType, message, options);
        }

        chain(cause: Error): ConsumerError {
          return new ConsumerError(this.errorType, `${this.message} (caused by: ${cause.message})`, {
            context: this.context,
            cause: cause.message,
          });
        }
      }

      // Act - Create instance via consumer-defined class
      const err = new ConsumerError('CONSUMER_IMPORT_OK', 'Imported types are usable');

      // Assert - Successfully constructed and behaves like AglaError
      expect(err.errorType).toBe('CONSUMER_IMPORT_OK');
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(AglaError);
    });

    // E2-001-02
    it('Then should use TestAglaError in try-catch blocks', () => {
      // Arrange
      const makeError = (): TestAglaError =>
        new TestAglaError('TRY_CATCH_ERROR', 'Thrown from try/catch', {
          severity: ErrorSeverity.ERROR,
          context: { feature: 'try-catch' },
        });

      // Act
      let caught: unknown;
      try {
        throw makeError();
      } catch (e) {
        caught = e;
      }

      // Assert
      expect(caught).toBeInstanceOf(TestAglaError);
      const err = caught as TestAglaError;
      expect(err.errorType).toBe('TRY_CATCH_ERROR');
      expect((err.context as TestErrorContext).cause).toBeUndefined();
    });

    // E2-001-03
    it('Then should handle errors in async operations', async () => {
      // Arrange - Async function that rejects with TestAglaError
      const asyncOp = async (): Promise<void> => {
        await new Promise((r) => setTimeout(r, 1));
        throw new TestAglaError('ASYNC_OP_ERROR', 'Async operation failed', {
          severity: ErrorSeverity.WARNING,
          context: { endpoint: '/api/op', attempt: 1 },
        });
      };

      // Act / Assert - Try/Catch around awaited async
      try {
        await asyncOp();
        expect.unreachable('asyncOp should throw');
      } catch (e) {
        expect(e).toBeInstanceOf(TestAglaError);
        const err = e as TestAglaError;
        expect(err.errorType).toBe('ASYNC_OP_ERROR');
        expect((err.context as TestErrorContext).endpoint).toBe('/api/op');
      }
    });

    // E2-001-04
    it('Then should validate error instanceof behavior', () => {
      // Arrange
      const error = new TestAglaError('INSTANCEOF_CHECK', 'Instanceof semantics');

      // Assert
      expect(error).toBeInstanceOf(TestAglaError);
      // AglaError は抽象だがランタイムではクラスとして存在するため instanceof 成立
      expect(error).toBeInstanceOf(AglaError);
      expect(error).toBeInstanceOf(Error);
    });
  });
});
