// src: src/__tests__/functional/ErrorSeverity.functional.spec.ts
// @(#) : ErrorSeverity 機能的テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions and utilities
import { ErrorSeverity, isValidErrorSeverity } from '../../../types/ErrorSeverity.types.js';

// Test utilities
import { TestAglaError } from '../helpers/TestAglaError.class.ts';

describe('Given ErrorSeverity for complete integration workflows', () => {
  describe('When performing complete severity validation workflow', () => {
    it('Then should demonstrate complete AglaError integration', () => {
      // Arrange
      const error = new TestAglaError(
        'SEVERITY_INTEGRATION_ERROR',
        'Severity integration test',
        {
          code: 'SI_001',
          severity: ErrorSeverity.WARNING,
          context: { test: 'severity-integration' },
        },
      );

      // Act
      const chainedError = error.chain(new Error('Chaining test'));

      // Assert - F1-004-02: integration validation
      expect(isValidErrorSeverity(error.severity)).toBe(true);
      expect(isValidErrorSeverity(chainedError.severity)).toBe(true);

      // Assert - F1-004-03: serialization integration
      const json = error.toJSON();
      expect(json).toHaveProperty('severity', ErrorSeverity.WARNING);
      expect(json.severity).toBe('warning');

      // Assert - F1-004-04: chain preservation validation
      expect(chainedError.severity).toBe(ErrorSeverity.WARNING);
      expect(chainedError.severity).toBe(error.severity);

      // Additional workflow validation
      const allSeverities = [
        ErrorSeverity.FATAL,
        ErrorSeverity.ERROR,
        ErrorSeverity.WARNING,
        ErrorSeverity.INFO,
      ];

      allSeverities.forEach((severity) => {
        const testError = new TestAglaError('TEST_ERROR', 'Test message', { severity });
        expect(isValidErrorSeverity(testError.severity)).toBe(true);
        expect(testError.toJSON()).toHaveProperty('severity', severity);
      });
    });
  });
});
