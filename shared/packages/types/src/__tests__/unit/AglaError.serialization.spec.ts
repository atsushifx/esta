// src: src/__tests__/unit/AglaError.serialization.spec.ts
// @(#): AglaError serialization (toJSON/toString) unit tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { AglaError } from '../../../types/AglaError.types.js';
import { ErrorSeverity } from '../../../types/ErrorSeverity.types.js';

// Test utilities
import { TestAglaError } from '../helpers/TestAglaError.class.ts';

type _TCircularContext = { name: string; self?: _TCircularContext };

/**
 * AglaError serialization unit tests
 * Tests toJSON and toString methods for various property combinations and edge cases
 */
describe('Given AglaError instance for JSON serialization', () => {
  /**
   * Basic toJSON method functionality with minimal properties
   */
  describe('When calling toJSON with basic properties only', () => {
    // Basic serialization: includes required errorType and message fields
    it('Then should include errorType and message', () => {
      const errorType = 'TEST_ERROR';
      const message = 'Test message';
      const error = new TestAglaError(errorType, message);
      const json = error.toJSON();
      expect(json).toEqual({ errorType, message });
    });

    // Context inclusion: adds context object when provided in constructor
    it('Then 正常系：should include context when present', () => {
      const context = { userId: '123', operation: 'test' };
      const error = new TestAglaError('TEST_ERROR', 'Test message', { context });
      const json = error.toJSON();
      expect(json).toEqual({ errorType: 'TEST_ERROR', message: 'Test message', context });
    });

    // Timestamp formatting: converts Date objects to ISO string format
    it('Then 正常系：should include all properties with correct formatting', () => {
      const timestamp = new Date('2025-08-29T21:42:00Z');
      const error = new TestAglaError('TEST_ERROR', 'Test message', { timestamp });
      const json = error.toJSON();
      expect(json.timestamp).toBe(timestamp.toISOString());
    });
  });

  // Circular reference handling: should throw when JSON.stringify encounters cycles
  it('Then should handle circular reference edge case', () => {
    const circularContext: _TCircularContext = { name: 'circular' };
    circularContext.self = circularContext;
    const error = new TestAglaError('CIRCULAR_ERROR', 'Circular test', { context: circularContext });
    expect(() => JSON.stringify(error.toJSON())).toThrow();
  });
});

/**
 * AglaError toString method tests
 * Tests string representation format and property combinations
 */
describe('Given AglaError string representation', () => {
  /**
   * Basic toString method functionality
   */
  describe('When converting to string', () => {
    // String format consistency: follows 'errorType: message context' pattern
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

  /**
   * Complex property combination scenarios
   */
  describe('When handling special property combinations', () => {
    // Severity enumeration: tests all ErrorSeverity values with context
    it('Then エッジケース：should handle all severity levels with context', () => {
      const severities = [ErrorSeverity.FATAL, ErrorSeverity.ERROR, ErrorSeverity.WARNING, ErrorSeverity.INFO];
      const context = { test: 'context' };
      severities.forEach((severity) => {
        const error = new TestAglaError('TEST_ERROR', 'Test message', { severity, context });
        expect(error.severity).toBe(severity);
        expect(error.context).toBe(context);
      });
    });

    // Complete property set: tests all optional properties together
    it('Then エッジケース：should handle complete property set', () => {
      const timestamp = new Date('2025-12-31T23:59:59.999Z');
      const severity = ErrorSeverity.FATAL;
      const context = { final: true, year: 2025 };
      const error = new TestAglaError('FINAL_ERROR', 'Final test', { timestamp, severity, context, code: 'FINAL_001' });
      expect(error.timestamp).toBe(timestamp);
      expect(error.severity).toBe(severity);
      expect(error.context).toBe(context);
      expect(error.code).toBe('FINAL_001');
    });
  });
});

/**
 * AglaError interface compatibility tests
 * Tests type system integration and implementation consistency
 */
describe('Given AglaError instance for string representation', () => {
  /**
   * Interface method verification and type compatibility
   */
  describe('When calling toString with basic properties', () => {
    // Type processing: tests error processing functions with AglaError instances
    it('Then should include errorType in output', () => {
      type ProcessedError = { type: string; serialized: unknown; chained: AglaError };
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

    // Union type support: handles mixed AglaError and Error arrays
    it('Then 正常系：should support union types with Error class', () => {
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

    // Interface consistency: verifies all required methods are available
    it('Then 正常系：should provide consistent interface methods', () => {
      const implementations = [new TestAglaError('TEST', 'msg')];
      implementations.forEach((impl) => {
        expect(typeof impl.toJSON).toBe('function');
        expect(typeof impl.toString).toBe('function');
        expect(typeof impl.chain).toBe('function');
        expect(typeof (impl as AglaError).errorType).toBe('string');
      });
    });

    // Property consistency: ensures base properties exist across implementations
    it('Then 正常系：should maintain property consistency across implementations', () => {
      const baseProps = ['errorType', 'message', 'name', 'stack'] as const;
      const implementations = [new TestAglaError('TEST_ERROR', 'Test message')];
      implementations.forEach((impl) => {
        baseProps.forEach((prop) => {
          expect(prop in impl).toBe(true);
        });
      });
    });
  });
});
