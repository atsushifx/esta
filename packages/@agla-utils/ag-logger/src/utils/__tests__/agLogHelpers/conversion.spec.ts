// src/utils/__tests__/agLogHelpers/conversion.spec.ts
// @(#) : AgToLabel and AgToLogLevel conversion functions BDD tests following atsushifx-style BDD

// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL, AG_LOGLEVEL_TO_LABEL_MAP } from '../../../../shared/types';
import type { AgLogLevel, AgLogLevelLabel } from '../../../../shared/types';
import { AgToLabel, AgToLogLevel } from '../../AgLogHelpers';

describe('AgLogHelpers: Conversion Functions', () => {
  describe('AgToLabel: LogLevel to Label conversion', () => {
    describe('正常系: Valid LogLevel inputs', () => {
      describe('Standard log levels', () => {
        it('should convert OFF LogLevel to OFF label', () => {
          expect(AgToLabel(AG_LOGLEVEL.OFF)).toBe('OFF');
        });

        it('should convert FATAL LogLevel to FATAL label', () => {
          expect(AgToLabel(AG_LOGLEVEL.FATAL)).toBe('FATAL');
        });

        it('should convert ERROR LogLevel to ERROR label', () => {
          expect(AgToLabel(AG_LOGLEVEL.ERROR)).toBe('ERROR');
        });

        it('should convert WARN LogLevel to WARN label', () => {
          expect(AgToLabel(AG_LOGLEVEL.WARN)).toBe('WARN');
        });

        it('should convert INFO LogLevel to INFO label', () => {
          expect(AgToLabel(AG_LOGLEVEL.INFO)).toBe('INFO');
        });

        it('should convert DEBUG LogLevel to DEBUG label', () => {
          expect(AgToLabel(AG_LOGLEVEL.DEBUG)).toBe('DEBUG');
        });

        it('should convert TRACE LogLevel to TRACE label', () => {
          expect(AgToLabel(AG_LOGLEVEL.TRACE)).toBe('TRACE');
        });

        it('should convert VERBOSE LogLevel to VERBOSE label', () => {
          expect(AgToLabel(AG_LOGLEVEL.VERBOSE)).toBe('VERBOSE');
        });
      });

      describe('Special log levels', () => {
        it('should return empty string for FORCE_OUTPUT level', () => {
          expect(AgToLabel(AG_LOGLEVEL.FORCE_OUTPUT)).toBe('');
        });
      });

      describe('Map reference consistency', () => {
        it('should get correct values from AG_LOGLEVEL_TO_LABEL_MAP', () => {
          Object.values(AG_LOGLEVEL).forEach((level) => {
            const result = AgToLabel(level);
            const expected = level === AG_LOGLEVEL.FORCE_OUTPUT
              ? ''
              : AG_LOGLEVEL_TO_LABEL_MAP[level];
            expect(result).toBe(expected);
          });
        });

        it('should handle all AG_LOGLEVEL (except FORCE_OUTPUT) values consistently', () => {
          Object.entries(AG_LOGLEVEL)
            .filter(([_key, value]) => (value !== AG_LOGLEVEL.FORCE_OUTPUT))
            .forEach(([key, value]) => {
              const stringLabel = AgToLabel(value);
              expect(stringLabel).toBe(key);
            });
        });

        it('should return consistent uppercase format', () => {
          Object.values(AG_LOGLEVEL)
            .filter((level) => (level !== AG_LOGLEVEL.FORCE_OUTPUT))
            .forEach((level) => {
              const label = AgToLabel(level);
              expect(label).toBe(label.toUpperCase());
              expect(label).toMatch(/^[A-Z]+$/);
            });
        });
      });
    });

    describe('異常系: Invalid inputs', () => {
      describe('Invalid numeric values', () => {
        it('should return empty string for out-of-range negative numbers', () => {
          expect(AgToLabel(-1 as AgLogLevel)).toBe('');
          expect(AgToLabel(-100 as AgLogLevel)).toBe('');
          expect(AgToLabel(-97 as AgLogLevel)).toBe('');
        });

        it('should return empty string for out-of-range positive numbers', () => {
          expect(AgToLabel(7 as AgLogLevel)).toBe('');
          expect(AgToLabel(99 as AgLogLevel)).toBe('');
          expect(AgToLabel(1000 as AgLogLevel)).toBe('');
        });
      });

      describe('Invalid type inputs', () => {
        it('should return empty string for null and undefined', () => {
          expect(AgToLabel(null as unknown as AgLogLevel)).toBe('');
          expect(AgToLabel(undefined as unknown as AgLogLevel)).toBe('');
        });

        it('should return empty string for string inputs', () => {
          expect(AgToLabel('INFO' as unknown as AgLogLevel)).toBe('');
          expect(AgToLabel('4' as unknown as AgLogLevel)).toBe('');
          expect(AgToLabel('0' as unknown as AgLogLevel)).toBe('');
        });

        it('should return empty string for boolean inputs', () => {
          expect(AgToLabel(true as unknown as AgLogLevel)).toBe('');
          expect(AgToLabel(false as unknown as AgLogLevel)).toBe('');
        });

        it('should return empty string for object inputs', () => {
          expect(AgToLabel({} as unknown as AgLogLevel)).toBe('');
          expect(AgToLabel([] as unknown as AgLogLevel)).toBe('');
        });

        it('should return empty string for function inputs', () => {
          expect(AgToLabel((() => {}) as unknown as AgLogLevel)).toBe('');
        });
      });
    });

    describe('エッジケース: Edge cases and special values', () => {
      describe('Special numeric values', () => {
        it('should return empty string for NaN', () => {
          expect(AgToLabel(NaN as AgLogLevel)).toBe('');
        });

        it('should return empty string for Infinity values', () => {
          expect(AgToLabel(Infinity as AgLogLevel)).toBe('');
          expect(AgToLabel(-Infinity as AgLogLevel)).toBe('');
        });

        it('should return empty string for decimal numbers', () => {
          expect(AgToLabel(4.5 as AgLogLevel)).toBe('');
          expect(AgToLabel(0.1 as AgLogLevel)).toBe('');
        });
      });

      describe('Number objects and variations', () => {
        it('should return empty string for Number constructor values', () => {
          expect(AgToLabel(new Number(AG_LOGLEVEL.INFO) as unknown as AgLogLevel)).toBe('');
          expect(AgToLabel(new Number(4) as unknown as AgLogLevel)).toBe('');
        });

        it('should handle normalized zero variants correctly', () => {
          expect(AgToLabel(-0 as AgLogLevel)).toBe('OFF');
          expect(AgToLabel(0.0 as AgLogLevel)).toBe('OFF');
          expect(AgToLabel(Number('0') as AgLogLevel)).toBe('OFF');
        });
      });

      describe('Other primitive types', () => {
        it('should return empty string for Symbol inputs', () => {
          expect(AgToLabel(Symbol('test') as unknown as AgLogLevel)).toBe('');
          expect(AgToLabel(Symbol.for('LOG_LEVEL') as unknown as AgLogLevel)).toBe('');
        });

        it('should return empty string for BigInt inputs', () => {
          expect(AgToLabel(4n as unknown as AgLogLevel)).toBe('');
          expect(AgToLabel(BigInt(AG_LOGLEVEL.INFO) as unknown as AgLogLevel)).toBe('');
        });
      });
    });
  });

  describe('AgToLogLevel: Label to LogLevel conversion', () => {
    describe('正常系: Valid label inputs', () => {
      describe('Uppercase string labels', () => {
        it('should convert uppercase string labels to numeric log levels', () => {
          expect(AgToLogLevel('OFF' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.OFF);
          expect(AgToLogLevel('FATAL' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.FATAL);
          expect(AgToLogLevel('ERROR' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.ERROR);
          expect(AgToLogLevel('WARN' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.WARN);
          expect(AgToLogLevel('INFO' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.INFO);
          expect(AgToLogLevel('DEBUG' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.DEBUG);
          expect(AgToLogLevel('TRACE' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.TRACE);
          expect(AgToLogLevel('VERBOSE' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.VERBOSE);
        });
      });

      describe('Case-insensitive handling', () => {
        it('should handle lowercase string labels by converting to uppercase', () => {
          expect(AgToLogLevel('off' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.OFF);
          expect(AgToLogLevel('fatal' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.FATAL);
          expect(AgToLogLevel('error' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.ERROR);
          expect(AgToLogLevel('warn' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.WARN);
          expect(AgToLogLevel('info' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.INFO);
          expect(AgToLogLevel('debug' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.DEBUG);
          expect(AgToLogLevel('trace' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.TRACE);
          expect(AgToLogLevel('verbose' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.VERBOSE);
        });

        it('should handle mixed case string labels', () => {
          expect(AgToLogLevel('Off' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.OFF);
          expect(AgToLogLevel('Fatal' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.FATAL);
          expect(AgToLogLevel('Error' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.ERROR);
          expect(AgToLogLevel('Warn' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.WARN);
          expect(AgToLogLevel('Info' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.INFO);
          expect(AgToLogLevel('Debug' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.DEBUG);
          expect(AgToLogLevel('Trace' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.TRACE);
          expect(AgToLogLevel('Verbose' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.VERBOSE);
        });
      });
    });

    describe('異常系: Invalid label inputs', () => {
      describe('Invalid string labels', () => {
        it('should return undefined for invalid string labels', () => {
          expect(AgToLogLevel('INVALID' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('LOG' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('LEVEL' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('UNKNOWN' as AgLogLevelLabel)).toBeUndefined();
        });

        it('should return undefined for similar but invalid label variations', () => {
          expect(AgToLogLevel('INFORMATION' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('WARNING' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('DEBUGGING' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('TRACING' as AgLogLevelLabel)).toBeUndefined();
        });
      });

      describe('Empty and whitespace strings', () => {
        it('should return undefined for empty and whitespace strings', () => {
          expect(AgToLogLevel('' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel(' ' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('  ' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('\t' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('\n' as AgLogLevelLabel)).toBeUndefined();
        });
      });

      describe('Numeric strings', () => {
        it('should return undefined for numeric string inputs', () => {
          expect(AgToLogLevel('0' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('1' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('4' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('-99' as AgLogLevelLabel)).toBeUndefined();
        });
      });

      describe('Invalid type inputs', () => {
        it('should return undefined for invalid type inputs', () => {
          expect(AgToLogLevel(null as unknown as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel(undefined as unknown as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel(4 as unknown as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel(true as unknown as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel({} as unknown as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel([] as unknown as AgLogLevelLabel)).toBeUndefined();
        });

        it('should return undefined for function inputs', () => {
          expect(AgToLogLevel((() => {}) as unknown as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel(AgToLogLevel as unknown as AgLogLevelLabel)).toBeUndefined();
        });
      });
    });

    describe('エッジケース: Edge cases and special inputs', () => {
      describe('Whitespace handling', () => {
        it('should handle labels with extra whitespace by trimming', () => {
          expect(AgToLogLevel(' INFO ' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.INFO);
          expect(AgToLogLevel('\tERROR\t' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.ERROR);
          expect(AgToLogLevel('\nWARN\n' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.WARN);
          expect(AgToLogLevel('  DEBUG  ' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.DEBUG);
        });
      });

      describe('Special string values', () => {
        it('should return undefined for special string values', () => {
          expect(AgToLogLevel('NaN' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('Infinity' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('-Infinity' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('null' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('undefined' as AgLogLevelLabel)).toBeUndefined();
        });
      });

      describe('Special characters', () => {
        it('should return undefined for labels with special characters', () => {
          expect(AgToLogLevel('INFO!' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('ERROR-' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('WARN?' as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel('DEBUG_' as AgLogLevelLabel)).toBeUndefined();
        });
      });

      describe('Symbol and object-like inputs', () => {
        it('should handle symbol values', () => {
          expect(AgToLogLevel(Symbol('INFO') as unknown as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel(Symbol.for('ERROR') as unknown as AgLogLevelLabel)).toBeUndefined();
        });

        it('should handle array-like objects', () => {
          expect(AgToLogLevel(['INFO'] as unknown as AgLogLevelLabel)).toBeUndefined();
          expect(AgToLogLevel({ toString: () => 'INFO' } as unknown as AgLogLevelLabel)).toBeUndefined();
        });
      });
    });
  });
});
