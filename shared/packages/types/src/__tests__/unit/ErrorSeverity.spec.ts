// src: src/__tests__/unit/ErrorSeverity.spec.ts
// @(#) : Unit tests for ErrorSeverity enum and validation functions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { isValidErrorSeverity } from '../../../types/ErrorSeverity.types.js';

/**
 * ErrorSeverity validation functions unit tests
 * Tests isValidErrorSeverity function with various input types and edge cases
 */
/**
 * ErrorSeverity列挙型値の検証テスト
 */
describe('Given ErrorSeverity enum values', () => {
  /**
   * isValidErrorSeverity function validation scenarios
   */
  describe('When validating with isValidErrorSeverity', () => {
    // Edge case validation: rejects case variants, whitespace, and numeric strings
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

    // Special value rejection: handles Symbol, BigInt, and special numeric values
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
