// src: src/__tests__/_TErrorStatistics.validation.spec.ts
// @(#) : _TErrorStatistics型テスト専用型のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import type { _TErrorStatistics } from './helpers/test-types.types.js';

/**
 * _TErrorStatistics Test Type Definition Tests
 * Tests type compatibility for _TErrorStatistics type (R-003-01)
 */
describe('Given _TErrorStatistics test type definition', () => {
  describe('When creating error statistics objects', () => {
    it('Then should satisfy _TErrorStatistics type compatibility', () => {
      // Arrange
      const stats: _TErrorStatistics = { 'FATAL': 2, 'ERROR': 5, 'WARNING': 10 };

      // Act & Assert - Type compatibility test as per R-003-01
      expect(stats).toSatisfy((s): s is _TErrorStatistics => {
        return typeof s === 'object' && s !== null
          && Object.values(s).every((val) => typeof val === 'number');
      });
    });

    it('Then should handle various error count scenarios', () => {
      // Arrange
      const errorCounts: _TErrorStatistics = {
        'CONNECTION_ERROR': 3,
        'TIMEOUT_ERROR': 1,
        'VALIDATION_ERROR': 7,
        'UNKNOWN_ERROR': 0,
      };

      // Act & Assert
      expect(errorCounts).toSatisfy((s): s is _TErrorStatistics => {
        return typeof s === 'object' && s !== null
          && Object.values(s).every((val) => typeof val === 'number');
      });
    });

    it('Then should handle empty statistics object', () => {
      // Arrange
      const emptyStats: _TErrorStatistics = {};

      // Act & Assert
      expect(emptyStats).toSatisfy((s): s is _TErrorStatistics => {
        return typeof s === 'object' && s !== null;
      });
    });

    it('Then should handle zero and negative counts', () => {
      // Arrange
      const mixedStats: _TErrorStatistics = {
        'SUCCESS': 0,
        'FAILURE': 5,
        'ROLLBACK': -1, // negative numbers should be allowed
      };

      // Act & Assert
      expect(mixedStats).toSatisfy((s): s is _TErrorStatistics => {
        return typeof s === 'object' && s !== null
          && Object.values(s).every((val) => typeof val === 'number');
      });
    });
  });

  describe('When validating statistics structure', () => {
    it('Then should enforce number values only', () => {
      // Arrange - This should cause TypeScript compilation error if uncommented
      // const invalidStats: _TErrorStatistics = { 'ERROR': 'five' };

      // Act & Assert - Verify type constraint through successful compilation
      const validStats: _TErrorStatistics = { 'ERROR': 5 };
      expect(typeof validStats['ERROR']).toBe('number');
    });

    it('Then should allow arbitrary error type names', () => {
      // Arrange
      const customStats: _TErrorStatistics = {
        'MyCustomError': 1,
        'AnotherError': 2,
        'edge_case_error': 3,
        'ERROR-WITH-DASHES': 4,
      };

      // Act & Assert
      expect(Object.keys(customStats)).toHaveLength(4);
      expect(Object.values(customStats).every((val) => typeof val === 'number')).toBe(true);
    });

    it('Then should support numeric operations', () => {
      // Arrange
      const stats: _TErrorStatistics = {
        'FATAL': 2,
        'ERROR': 5,
        'WARNING': 10,
      };

      // Act
      const totalErrors = Object.values(stats).reduce((sum, count) => sum + count, 0);
      const hasErrors = Object.values(stats).some((count) => count > 0);

      // Assert
      expect(totalErrors).toBe(17);
      expect(hasErrors).toBe(true);
    });
  });
});
