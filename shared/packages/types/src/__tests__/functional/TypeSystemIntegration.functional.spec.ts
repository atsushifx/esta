// src: src/__tests__/functional/TypeSystemIntegration.functional.spec.ts
// @(#): TypeScript type system integration functional tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { AglaError } from '../../../types/AglaError.types.js';
import type { AglaErrorContext, AglaErrorOptions } from '../../../types/AglaError.types.js';

// Test utilities
import { TestAglaError } from '../helpers/TestAglaError.class.ts';

type ProcessedError = {
  type: string;
  severity?: unknown;
  serialized: unknown;
  chained: AglaError;
};

/**
 * TypeScript type system integration functional tests
 * Tests type safety, union types, and context type compatibility
 */
describe('TypeScript Integration', () => {
  /**
   * Generic error handler type preservation scenarios
   */
  describe('Generic handlers preserve types', () => {
    // Type preservation: maintains type safety in generic processing functions
    it('maintains type safety across implementations', () => {
      const errorProcessor = (error: AglaError): ProcessedError => ({
        type: error.errorType,
        serialized: error.toJSON(),
        chained: error.chain(new Error('Test cause')),
      });

      const errors: AglaError[] = [new TestAglaError('TEST_ERROR', 'Test message')];
      const processed = errors.map(errorProcessor);

      processed.forEach((result) => {
        expect(typeof result.type).toBe('string');
        expect(result.serialized).toHaveProperty('errorType');
      });
    });
  });

  /**
   * Union type compatibility with standard Error class
   */
  describe('Union with Error works', () => {
    // Union type handling: supports mixed AglaError and Error arrays
    it('supports (AglaError | Error)[] pattern', () => {
      const mixed: (AglaError | Error)[] = [
        new TestAglaError('TEST_TYPE', 'Test message'),
        new Error('Standard error'),
      ];

      mixed.forEach((err) => {
        if (err instanceof AglaError) {
          expect(typeof err.errorType).toBe('string');
          expect(typeof err.toJSON).toBe('function');
        }
      });
    });
  });

  /**
   * AglaErrorContext type compatibility and integrity
   */
  describe('AglaErrorContext replacement integrity', () => {
    // Context type compatibility: AglaErrorOptions.context matches AglaErrorContext
    it('AglaErrorOptions.context satisfies AglaErrorContext', () => {
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

      const contextCheck: AglaErrorContext | undefined = options.context;
      expect(contextCheck).toBeDefined();
      expect(typeof options.context?.userId).toBe('string');
      expect(options.context?.metadata).toEqual({ source: 'test' });
    });

    // Context getter type safety: returns properly typed context or undefined
    it('AglaError.context getter returns AglaErrorContext | undefined', () => {
      const contextWithData: AglaErrorContext = {
        traceId: 'trace-345',
        spanId: 'span-678',
        environment: 'test',
        features: { logging: true, monitoring: false },
      };

      const errorWithContext = new TestAglaError('CONTEXT_TEST', 'Context test message', { context: contextWithData });
      const errorWithoutContext = new TestAglaError('NO_CONTEXT_TEST', 'No context message');

      const c1: AglaErrorContext | undefined = errorWithContext.context;
      const c2: AglaErrorContext | undefined = errorWithoutContext.context;
      expect(c1).toBeDefined();
      expect(c2).toBeUndefined();
      if (errorWithContext.context) {
        expect(typeof errorWithContext.context.traceId).toBe('string');
        expect(errorWithContext.context.features).toEqual({ logging: true, monitoring: false });
      }
    });
  });
});
