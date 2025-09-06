// src: src/__tests__/AglaError.chain-compatibility.spec.ts
// @(#) : AglaError チェーン互換性の単体テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
// （未使用のため削除）

// Test utilities
import { TestAglaError } from './helpers/TestAglaError.class.js';

/**
 * AglaError Chain Compatibility Unit Tests
 * Moved from E2E tests - these are unit-level tests for error chaining functionality
 */

describe('Given AglaError chain functionality', () => {
  describe('When chaining errors across different implementations', () => {
    it('Then should maintain consistent chain behavior', () => {
      const baseErrors = [
        new TestAglaError('TEST_BASE', 'Test base error'),
      ];
      const causeError = new Error('System failure');

      const chainedErrors = baseErrors.map((base) => base.chain(causeError));

      chainedErrors.forEach((chained, index) => {
        const originalType = baseErrors[index].constructor.name;
        expect(chained.constructor.name).toBe(originalType);
        expect(chained.message).toContain('caused by:');
        expect(chained.message).toContain('System failure');
      });
    });

    it('Then should preserve context through chaining', () => {
      const originalContext = { userId: '123', operation: 'test-chain' };
      const baseError = new TestAglaError('CHAIN_TEST', 'Base error', { context: originalContext });
      const causeError = new Error('Chain cause');

      const chainedError = baseError.chain(causeError);

      expect(chainedError.context).toHaveProperty('userId', '123');
      expect(chainedError.context).toHaveProperty('operation', 'test-chain');
      expect(chainedError.context).toHaveProperty('cause', 'Chain cause');
    });

    it('Then should support multi-level chaining', () => {
      const level0 = new TestAglaError('LEVEL_0', 'Base error');
      const level1Cause = new Error('Level 1 cause');
      const level2Cause = new Error('Level 2 cause');

      const level1 = level0.chain(level1Cause);
      const level2 = level1.chain(level2Cause);

      expect(level2 instanceof TestAglaError).toBe(true);
      expect(level2.message).toContain('Level 2 cause');
      expect(level2.message).toContain('Level 1 cause');
      expect(level2.errorType).toBe('LEVEL_0');
    });
  });
});
