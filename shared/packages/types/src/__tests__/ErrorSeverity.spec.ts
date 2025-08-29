import { describe, expect, it } from 'vitest';
import { ErrorSeverity, isValidErrorSeverity } from '../../types/ErrorSeverity.types.js';

/**
 * Test suite for ErrorSeverity enum values and validation.
 * Validates enum integrity and type guard functionality.
 */
describe('Given ErrorSeverity enum and validation', () => {
  describe('When accessing enum values', () => {
    it('Then 正常系：should have correct enum constants', () => {
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
