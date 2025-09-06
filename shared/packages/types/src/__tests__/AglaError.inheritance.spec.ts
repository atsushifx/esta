// src: src/__tests__/AglaError.inheritance.spec.ts
// @(#) : AglaError 継承機能の単体テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import type { AglaError } from '../../types/AglaError.types.js';

// Test utilities
import { TestAglaError } from './helpers/TestAglaError.class.js';

/**
 * AglaError Inheritance Unit Tests
 * Moved from E2E tests - these are unit-level tests for inheritance behavior
 */

// Helper function for creating test implementations
const createTestImplementations = (): AglaError[] => [
  new TestAglaError('TEST_ERROR', 'Test message'),
];

describe('Given AglaError inheritance hierarchy', () => {
  describe('When checking inheritance relationships', () => {
    it('Then should provide consistent interface methods', () => {
      const implementations = [
        new TestAglaError('TEST', 'msg'),
      ];

      implementations.forEach((impl) => {
        expect(typeof impl.toJSON).toBe('function');
        expect(typeof impl.toString).toBe('function');
        expect(typeof impl.chain).toBe('function');
        expect(typeof (impl as AglaError).errorType).toBe('string');
      });
    });
  });

  describe('When accessing inherited properties', () => {
    it('Then should maintain property consistency across implementations', () => {
      const baseProps = ['errorType', 'message', 'name', 'stack'] as const;
      const implementations = createTestImplementations();

      implementations.forEach((impl) => {
        baseProps.forEach((prop) => {
          expect(prop in impl).toBe(true);
        });
      });
    });
  });
});
