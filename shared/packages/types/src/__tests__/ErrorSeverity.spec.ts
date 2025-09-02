// src: src/__tests__/ErrorSeverity.spec.ts
// @(#) : Unit tests for ErrorSeverity enum and validation functions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions and utilities
import { ErrorSeverity, isValidErrorSeverity } from '../../types/ErrorSeverity.types.js';

/**
 * Test suite for ErrorSeverity enum constant values.
 * Verifies that enum members have correct string values.
 */
describe('Given ErrorSeverity enum values', () => {
  describe('When accessing enum constants', () => {
    it('Then should return fatal string value', () => {
      // Act & Assert
      expect(ErrorSeverity.FATAL).toBe('fatal');
      expect(ErrorSeverity.ERROR).toBe('error');
      expect(ErrorSeverity.WARNING).toBe('warning');
      expect(ErrorSeverity.INFO).toBe('info');
    });
  });

  describe('When validating with isValidErrorSeverity', () => {
    it('Then 正常系：should return true for all valid severity values', () => {
      // Arrange
      const validValues = [
        'fatal',
        'error',
        'warning',
        'info',
        ErrorSeverity.FATAL,
        ErrorSeverity.ERROR,
        ErrorSeverity.WARNING,
        ErrorSeverity.INFO,
      ];

      // Act & Assert
      validValues.forEach((value) => {
        expect(isValidErrorSeverity(value)).toBe(true);
      });
    });

    it('Then 異常系：should return false for invalid types', () => {
      // Arrange
      const invalidValues = [
        'invalid',
        123,
        null,
        undefined,
        true,
        false,
        {},
        { severity: 'error' },
        [],
        ['error'],
        () => 'error',
      ];

      // Act & Assert
      invalidValues.forEach((value) => {
        expect(isValidErrorSeverity(value)).toBe(false);
      });
    });

    it('Then エッジケース：should handle edge case values', () => {
      // Arrange
      const edgeCaseValues = [
        '',
        ' ',
        '\t',
        '\n',
        'FATAL', // case variants
        'Error',
        'WARNING',
        'Info',
        '0', // numeric strings
        '1',
        '-1',
      ];

      // Act & Assert
      edgeCaseValues.forEach((value) => {
        expect(isValidErrorSeverity(value)).toBe(false);
      });
    });

    it('Then エッジケース：should handle special JavaScript values', () => {
      // Arrange
      const specialValues = [
        Symbol('error'),
        BigInt(1),
        Number.NaN,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
      ];

      // Act & Assert
      specialValues.forEach((value) => {
        expect(isValidErrorSeverity(value)).toBe(false);
      });
    });
  });
});
