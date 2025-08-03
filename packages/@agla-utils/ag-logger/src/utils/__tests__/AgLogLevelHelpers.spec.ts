// src/utils/__tests__/AgLogLevelHelpers.spec.ts
// @(#) : LogLevel helper functions test
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';

// Import helper functions
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogLevel } from '../../../shared/types';
import { AgToLabel } from '../AgLogLevelHelpers';
import { isValidLogLevel } from '../AgLogValidators';

describe('LogLevel Helper Functions', () => {
  describe('AgToLabel function', () => {
    it('should convert numeric log level to uppercase string', () => {
      expect(AgToLabel(AG_LOGLEVEL.OFF)).toBe('OFF');
      expect(AgToLabel(AG_LOGLEVEL.FATAL)).toBe('FATAL');
      expect(AgToLabel(AG_LOGLEVEL.ERROR)).toBe('ERROR');
      expect(AgToLabel(AG_LOGLEVEL.WARN)).toBe('WARN');
      expect(AgToLabel(AG_LOGLEVEL.INFO)).toBe('INFO');
      expect(AgToLabel(AG_LOGLEVEL.DEBUG)).toBe('DEBUG');
      expect(AgToLabel(AG_LOGLEVEL.TRACE)).toBe('TRACE');
      expect(AgToLabel(AG_LOGLEVEL.VERBOSE)).toBe('VERBOSE');
    });

    it("should return '' in special value force output", () => {
      expect(AgToLabel(AG_LOGLEVEL.FORCE_OUTPUT)).toBe('');
    });

    it("should return '' for invalid log levels", () => {
      expect(AgToLabel(-1 as AgLogLevel)).toBe('');
      expect(AgToLabel(99 as AgLogLevel)).toBe('');
      expect(AgToLabel(null as unknown as AgLogLevel)).toBe('');
      expect(AgToLabel(undefined as unknown as AgLogLevel)).toBe('');
    });

    it('should return consistent format', () => {
      // All returned strings should be uppercase (except FORCE_OUTPUT which returns empty string)
      Object.values(AG_LOGLEVEL).forEach((level) => {
        const label = AgToLabel(level);
        expect(label).toBe(label.toUpperCase());
        if (level !== AG_LOGLEVEL.FORCE_OUTPUT) {
          expect(label).toMatch(/^[A-Z_]+$/);
        } else {
          expect(label).toBe('');
        }
      });
    });

    it('should handle all AG_LOGLEVEL values', () => {
      // Test all known log level values (except FORCE_OUTPUT which returns empty string)
      Object.entries(AG_LOGLEVEL).forEach(([key, value]) => {
        const stringLabel = AgToLabel(value);
        if (key === 'FORCE_OUTPUT') {
          expect(stringLabel).toBe('');
        } else {
          expect(stringLabel).toBe(key);
        }
      });
    });

    it('should perform lookups efficiently', () => {
      const startTime = Date.now();

      // Perform many lookups
      for (let i = 0; i < 1000; i++) {
        AgToLabel(AG_LOGLEVEL.INFO);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 100ms for 1000 operations)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('isValidLogLevel function', () => {
    describe('正常系 (Valid cases)', () => {
      it('should return true for all valid AG_LOGLEVEL values', () => {
        expect(isValidLogLevel(AG_LOGLEVEL.VERBOSE)).toBe(true);
        expect(isValidLogLevel(AG_LOGLEVEL.OFF)).toBe(true);
        expect(isValidLogLevel(AG_LOGLEVEL.FATAL)).toBe(true);
        expect(isValidLogLevel(AG_LOGLEVEL.ERROR)).toBe(true);
        expect(isValidLogLevel(AG_LOGLEVEL.WARN)).toBe(true);
        expect(isValidLogLevel(AG_LOGLEVEL.INFO)).toBe(true);
        expect(isValidLogLevel(AG_LOGLEVEL.DEBUG)).toBe(true);
        expect(isValidLogLevel(AG_LOGLEVEL.TRACE)).toBe(true);
      });

      it('should return true for numeric literals matching AG_LOGLEVEL values', () => {
        expect(isValidLogLevel(-99 as AgLogLevel)).toBe(true); // VERBOSE
        expect(isValidLogLevel(0 as AgLogLevel)).toBe(true); // OFF
        expect(isValidLogLevel(1 as AgLogLevel)).toBe(true); // FATAL
        expect(isValidLogLevel(2 as AgLogLevel)).toBe(true); // ERROR
        expect(isValidLogLevel(3 as AgLogLevel)).toBe(true); // WARN
        expect(isValidLogLevel(4 as AgLogLevel)).toBe(true); // INFO
        expect(isValidLogLevel(5 as AgLogLevel)).toBe(true); // DEBUG
        expect(isValidLogLevel(6 as AgLogLevel)).toBe(true); // TRACE
      });

      it('should validate all AG_LOGLEVEL values using Object.values iteration', () => {
        Object.values(AG_LOGLEVEL).forEach((level) => {
          expect(isValidLogLevel(level)).toBe(true);
        });
      });
    });

    describe('異常系 (Invalid type cases)', () => {
      it('should return false for undefined', () => {
        expect(isValidLogLevel(undefined as unknown as AgLogLevel)).toBe(false);
      });

      it('should return false for null', () => {
        expect(isValidLogLevel(null as unknown as AgLogLevel)).toBe(false);
      });

      it('should return false for string values', () => {
        expect(isValidLogLevel('0' as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel('1' as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel('INFO' as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel('DEBUG' as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel('' as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel('invalid' as unknown as AgLogLevel)).toBe(false);
      });

      it('should return false for boolean values', () => {
        expect(isValidLogLevel(true as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(false as unknown as AgLogLevel)).toBe(false);
      });

      it('should return false for object values', () => {
        expect(isValidLogLevel({} as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel({ level: 1 } as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(AG_LOGLEVEL as unknown as AgLogLevel)).toBe(false);
      });

      it('should return false for array values', () => {
        expect(isValidLogLevel([] as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel([1] as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel([AG_LOGLEVEL.INFO] as unknown as AgLogLevel)).toBe(false);
      });

      it('should return false for function values', () => {
        expect(isValidLogLevel((() => 1) as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(isValidLogLevel as unknown as AgLogLevel)).toBe(false);
      });

      it('should return false for symbol values', () => {
        expect(isValidLogLevel(Symbol('test') as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(Symbol.for('level') as unknown as AgLogLevel)).toBe(false);
      });

      it('should return false for bigint values', () => {
        expect(isValidLogLevel(1n as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(BigInt(4) as unknown as AgLogLevel)).toBe(false);
      });
    });

    describe('エッジケース (Edge cases with numbers)', () => {
      it('should return false for out-of-range negative numbers', () => {
        expect(isValidLogLevel(-1 as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(-97 as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(-100 as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(-1000 as AgLogLevel)).toBe(false);
      });

      it('should return false for out-of-range positive numbers', () => {
        expect(isValidLogLevel(7 as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(8 as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(99 as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(1000 as AgLogLevel)).toBe(false);
      });

      it('should return false for decimal numbers', () => {
        expect(isValidLogLevel(0.5 as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(1.1 as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(3.14 as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(-99.5 as AgLogLevel)).toBe(false);
      });

      it('should return false for special numeric values', () => {
        expect(isValidLogLevel(NaN as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(Infinity as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(-Infinity as AgLogLevel)).toBe(false);
      });

      it('should return false for Number object instances', () => {
        expect(isValidLogLevel(new Number(1) as unknown as AgLogLevel)).toBe(false);
        expect(isValidLogLevel(new Number(AG_LOGLEVEL.INFO) as unknown as AgLogLevel)).toBe(false);
      });

      it('should return false for zero variants that are not exactly 0', () => {
        expect(isValidLogLevel(-0 as AgLogLevel)).toBe(true); // -0 === 0, so this should be true
        expect(isValidLogLevel(0.0 as AgLogLevel)).toBe(true); // 0.0 === 0, so this should be true
        expect(isValidLogLevel(Number('0') as AgLogLevel)).toBe(true); // Number('0') === 0
      });
    });

    describe('パフォーマンステスト (Performance tests)', () => {
      it('should validate many values efficiently', () => {
        const startTime = Date.now();
        const testValues = [
          AG_LOGLEVEL.INFO,
          AG_LOGLEVEL.ERROR,
          'invalid',
          null,
          undefined,
          7,
          -1,
          NaN,
          {},
          [],
        ];

        for (let i = 0; i < 1000; i++) {
          testValues.forEach((value) => {
            isValidLogLevel(value as AgLogLevel);
          });
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(duration).toBeLessThan(100);
      });
    });

    describe('型安全性テスト (Type safety with comprehensive edge cases)', () => {
      it('should handle mixed array of different types', () => {
        const mixedValues = [
          1,
          '1',
          true,
          null,
          undefined,
          {},
          [],
          AG_LOGLEVEL.INFO,
          Symbol('test'),
          1n,
          NaN,
          Infinity,
        ];

        mixedValues.forEach((value) => {
          const result = isValidLogLevel(value as AgLogLevel);
          expect(typeof result).toBe('boolean');
        });
      });

      it('should maintain consistent behavior across multiple calls', () => {
        const testCases = [
          { value: AG_LOGLEVEL.INFO, expected: true },
          { value: 'INFO' as unknown as AgLogLevel, expected: false },
          { value: 7 as AgLogLevel, expected: false },
          { value: null as unknown as AgLogLevel, expected: false },
        ];

        testCases.forEach(({ value, expected }) => {
          for (let i = 0; i < 10; i++) {
            expect(isValidLogLevel(value)).toBe(expected);
          }
        });
      });
    });
  });
});
