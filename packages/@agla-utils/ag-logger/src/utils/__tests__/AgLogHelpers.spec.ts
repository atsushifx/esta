// src/utils/__tests__/AgLogHelpers.spec.ts
// @(#) : AgLogHelpers utility functions BDD tests following atsushifx-style BDD

// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogLevel } from '../../../shared/types';
import { AgToLabel, AgToLogLevel, argsToString, extractMessage, valueToString } from '../AgLogHelpers';
import { isValidLogLevel } from '../AgLogValidators';

type TCircularObj = {
  name?: string;
  self?: TCircularObj;
};

describe('AgLogHelpers utility functions', () => {
  describe('AgToLabel function', () => {
    describe('when given valid log levels', () => {
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

      it('should handle all AG_LOGLEVEL (except FORCE_OUTPUT) values', () => {
        // All returned strings should be uppercase (except FORCE_OUTPUT which returns empty string)
        Object.entries(AG_LOGLEVEL)
          .filter(([_key, value]) => (value !== AG_LOGLEVEL.FORCE_OUTPUT))
          .forEach(([key, value]) => {
            const stringLabel = AgToLabel(value);
            expect(stringLabel).toBe(key);
          });
      });

      it('should return consistent format', () => {
        // All returned strings should be uppercase (except FORCE_OUTPUT which returns empty string)
        Object.values(AG_LOGLEVEL)
          .filter((level) => (level !== AG_LOGLEVEL.FORCE_OUTPUT))
          .forEach((level) => {
            const label = AgToLabel(level);
            expect(label).toBe(label.toUpperCase());
            expect(label).toMatch(/^[A-Z]+$/);
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

    describe('when given FORCE_OUTPUT level', () => {
      it('should return empty string for FORCE_OUTPUT level', () => {
        expect(AgToLabel(AG_LOGLEVEL.FORCE_OUTPUT)).toBe('');
      });
    });

    describe('when given invalid values', () => {
      it('should return empty string for invalid number / undefined / null', () => {
        expect(AgToLabel(-1 as AgLogLevel)).toBe('');
        expect(AgToLabel(99 as AgLogLevel)).toBe('');
        expect(AgToLabel(null as unknown as AgLogLevel)).toBe('');
        expect(AgToLabel(undefined as unknown as AgLogLevel)).toBe('');
      });
    });
  });

  describe('AgToLogLevel function', () => {
    describe('when given valid labels', () => {
      it('should return correct numeric value for INFO label', () => {
        const result = AgToLogLevel('INFO');

        expect(result).toBe(AG_LOGLEVEL.INFO);
      });

      it('should return correct numeric value for ERROR label', () => {
        const result = AgToLogLevel('ERROR');

        expect(result).toBe(AG_LOGLEVEL.ERROR);
      });

      it('should handle lowercase labels', () => {
        const result = AgToLogLevel('debug');

        expect(result).toBe(AG_LOGLEVEL.DEBUG);
      });
    });

    describe('when given invalid labels', () => {
      it('should return undefined for invalid label', () => {
        const result = AgToLogLevel('INVALID');

        expect(result).toBeUndefined();
      });

      it('should return undefined for empty string', () => {
        const result = AgToLogLevel('');

        expect(result).toBeUndefined();
      });
    });
  });

  describe('extractMessage function', () => {
    describe('when given empty arguments', () => {
      it('should return empty string when no arguments provided', () => {
        const result = extractMessage([]);

        expect(result).toBe('');
      });
    });

    describe('when given primitive arguments', () => {
      it('should extract and join string arguments with spaces', () => {
        const result = extractMessage(['hello', 'world']);

        expect(result).toBe('hello world');
      });

      it('should extract and convert number arguments to strings', () => {
        const result = extractMessage([42, 3.14]);

        expect(result).toBe('42 3.14');
      });

      it('should extract and convert boolean arguments to strings', () => {
        const result = extractMessage([true, false]);

        expect(result).toBe('true false');
      });

      it('should handle mixed primitive types correctly', () => {
        const result = extractMessage(['test', 123, true, 'end']);

        expect(result).toBe('test 123 true end');
      });
    });

    describe('when given complex arguments', () => {
      it('should filter out object arguments from message', () => {
        const result = extractMessage(['hello', { key: 'value' }, 'world']);

        expect(result).toBe('hello world');
      });

      it('should filter out array arguments from message', () => {
        const result = extractMessage(['start', [1, 2, 3], 'end']);

        expect(result).toBe('start end');
      });

      it('should filter out function arguments from message', () => {
        const mockFn = (): string => 'test';
        const result = extractMessage(['begin', mockFn, 'finish']);

        expect(result).toBe('begin finish');
      });
    });

    describe('when given arguments with whitespace', () => {
      it('should trim the final result but preserve internal spaces', () => {
        const result = extractMessage(['  hello  ', '  world  ']);

        expect(result).toBe('hello     world');
      });
    });
  });

  describe('valueToString function', () => {
    describe('when given null or undefined values', () => {
      it('should return string representation of null', () => {
        const result = valueToString(null);

        expect(result).toBe('null');
      });

      it('should return string representation of undefined', () => {
        const result = valueToString(undefined);

        expect(result).toBe('undefined');
      });
    });

    describe('when given array values', () => {
      it('should return "array" for empty arrays', () => {
        const result = valueToString([]);

        expect(result).toBe('array');
      });

      it('should return bracketed string representation for non-empty arrays', () => {
        const result = valueToString([1, 2, 3]);

        expect(result).toBe('[1,2,3]');
      });
    });

    describe('when given function values', () => {
      it('should return "function" for anonymous functions', () => {
        const result = valueToString(() => {});

        expect(result).toBe('function');
      });

      it('should return "function name" for named functions', () => {
        const namedFn = function testFunction(): void {};
        const result = valueToString(namedFn);

        expect(result).toBe('function testFunction');
      });
    });

    describe('when given object values', () => {
      it('should return "object" for plain objects', () => {
        const result = valueToString({ key: 'value' });

        expect(result).toBe('object');
      });

      it('should return "object" for class instances', () => {
        class TestClass {}
        const result = valueToString(new TestClass());

        expect(result).toBe('object');
      });
    });

    describe('when given string values', () => {
      it('should return quoted string for string inputs', () => {
        const result = valueToString('test string');

        expect(result).toBe('"test string"');
      });

      it('should return quoted empty string for empty string input', () => {
        const result = valueToString('');

        expect(result).toBe('""');
      });
    });

    describe('when given primitive non-string values', () => {
      it('should return string representation for numbers', () => {
        const result = valueToString(42);

        expect(result).toBe('42');
      });

      it('should return string representation for booleans', () => {
        const result = valueToString(true);

        expect(result).toBe('true');
      });

      it('should return string representation for symbols', () => {
        const sym = Symbol('test');
        const result = valueToString(sym);

        expect(result).toBe('Symbol(test)');
      });
    });
  });

  describe('argsToString function', () => {
    describe('when given empty arguments', () => {
      it('should return empty string for empty array', () => {
        const result = argsToString([]);

        expect(result).toBe('');
      });
    });

    describe('when given JSON-stringifiable arguments', () => {
      it('should use JSON.stringify for simple objects', () => {
        const result = argsToString([{ key: 'value' }]);

        expect(result).toBe('{"key":"value"}');
      });

      it('should use JSON.stringify for arrays', () => {
        const result = argsToString([[1, 2, 3]]);

        expect(result).toBe('[1,2,3]');
      });

      it('should use JSON.stringify for primitives', () => {
        const result = argsToString(['test', 42, true]);

        expect(result).toBe('"test" 42 true');
      });
    });

    describe('when given non-JSON-stringifiable arguments', () => {
      it('should throw error for circular objects', () => {
        const circular: TCircularObj = {};
        circular.self = circular;

        expect(() => argsToString([circular])).toThrow('Converting circular structure to JSON');
      });

      it('should fall back to valueToString for functions', () => {
        const result = argsToString([() => 'test']);

        expect(result).toBe('function');
      });

      it('should fall back to valueToString for undefined', () => {
        const result = argsToString([undefined]);

        expect(result).toBe('undefined');
      });
    });

    describe('when given mixed arguments', () => {
      it('should handle mixed JSON-stringifiable and non-stringifiable values', () => {
        const fn = (): void => {};
        const result = argsToString(['hello', 42, fn, { key: 'value' }]);

        expect(result).toBe('"hello" 42 function fn {"key":"value"}');
      });

      it('should join multiple arguments with spaces and trim', () => {
        const result = argsToString(['  start  ', '  end  ']);

        expect(result).toBe('"  start  " "  end  "');
      });
    });
  });

  describe('isValidLogLevel function', () => {
    describe('when given valid log levels', () => {
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

    describe('when given invalid types', () => {
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

    describe('when given edge case numbers', () => {
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
  });
});
