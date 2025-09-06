// src: src/__tests__/unit/ErrorSeverity.spec.ts
// @(#) : Unit tests for ErrorSeverity enum and validation functions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions and utilities
import { isValidErrorSeverity } from '../../../types/ErrorSeverity.types.js';

/**
 * Test suite for ErrorSeverity enum constant values.
 * Verifies that enum members have correct string values.
 */
describe('Given ErrorSeverity enum values', () => {
  describe('When validating with isValidErrorSeverity', () => {
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
