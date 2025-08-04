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

describe('ログレベル文字列変換機能', () => {
  describe('AgToLabel function', () => {
    it('should convert OFF level to uppercase string', () => {
      expect(AgToLabel(AG_LOGLEVEL.OFF)).toBe('OFF');
    });

    it('should convert FATAL level to uppercase string', () => {
      expect(AgToLabel(AG_LOGLEVEL.FATAL)).toBe('FATAL');
    });

    it('should convert ERROR level to uppercase string', () => {
      expect(AgToLabel(AG_LOGLEVEL.ERROR)).toBe('ERROR');
    });

    it('should convert WARN level to uppercase string', () => {
      expect(AgToLabel(AG_LOGLEVEL.WARN)).toBe('WARN');
    });

    it('should convert INFO level to uppercase string', () => {
      expect(AgToLabel(AG_LOGLEVEL.INFO)).toBe('INFO');
    });

    it('should convert DEBUG level to uppercase string', () => {
      expect(AgToLabel(AG_LOGLEVEL.DEBUG)).toBe('DEBUG');
    });

    it('should convert TRACE level to uppercase string', () => {
      expect(AgToLabel(AG_LOGLEVEL.TRACE)).toBe('TRACE');
    });

    it('should convert VERBOSE level to uppercase string', () => {
      expect(AgToLabel(AG_LOGLEVEL.VERBOSE)).toBe('VERBOSE');
    });

    it('should return empty string for FORCE_OUTPUT level', () => {
      expect(AgToLabel(AG_LOGLEVEL.FORCE_OUTPUT)).toBe('');
    });

    it('should return empty string for invalid negative number', () => {
      expect(AgToLabel(-1 as AgLogLevel)).toBe('');
    });

    it('should return empty string for invalid positive number', () => {
      expect(AgToLabel(99 as AgLogLevel)).toBe('');
    });

    it('should return empty string for null input', () => {
      expect(AgToLabel(null as unknown as AgLogLevel)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(AgToLabel(undefined as unknown as AgLogLevel)).toBe('');
    });

    it('should return consistent format', () => {
      // All returned strings should be uppercase (except FORCE_OUTPUT which returns empty string)
      Object.values(AG_LOGLEVEL).forEach((level) => {
        const label = AgToLabel(level);
        expect(label).toBe(label.toUpperCase());
        if (level !== AG_LOGLEVEL.FORCE_OUTPUT) {
          expect(label).toMatch(/^[A-Z_]+$/);
        }
      });
    });

    it('should handle all AG_LOGLEVEL (except FORCE_OUTPUT) values', () => {
      // All returned strings should be uppercase (except FORCE_OUTPUT which returns empty string)
      Object.entries(AG_LOGLEVEL)
        .filter(([_key, value]) => (value !== AG_LOGLEVEL.FORCE_OUTPUT))
        .forEach(([key, value]) => {
          const stringLabel = AgToLabel(value);
          expect(stringLabel).toBe(key);
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

  it('should return true for FORCE_OUTPUT level', () => {
    expect(isValidLogLevel(AG_LOGLEVEL.FORCE_OUTPUT)).toBe(true);
  });

  it('should return true for OFF level', () => {
    expect(isValidLogLevel(AG_LOGLEVEL.OFF)).toBe(true);
  });

  it('should return true for FATAL level', () => {
    expect(isValidLogLevel(AG_LOGLEVEL.FATAL)).toBe(true);
  });

  it('should return true for ERROR level', () => {
    expect(isValidLogLevel(AG_LOGLEVEL.ERROR)).toBe(true);
  });

  it('should return true for WARN level', () => {
    expect(isValidLogLevel(AG_LOGLEVEL.WARN)).toBe(true);
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

  it('should return false for out-of-range positive number', () => {
    expect(isValidLogLevel(7 as AgLogLevel)).toBe(false);
  });

  it('should return false for decimal number', () => {
    expect(isValidLogLevel(4.5 as AgLogLevel)).toBe(false);
  });

  it('should return false for NaN input', () => {
    expect(isValidLogLevel(NaN as AgLogLevel)).toBe(false);
  });

  it('should return false for Infinity input', () => {
    expect(isValidLogLevel(Infinity as AgLogLevel)).toBe(false);
  });

  it('should return false for Number object input', () => {
    expect(isValidLogLevel(new Number(1) as unknown as AgLogLevel)).toBe(false);
  });
});
