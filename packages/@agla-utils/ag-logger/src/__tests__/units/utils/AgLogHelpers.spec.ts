// src/utils/__tests__/AgLogHelpers.spec.ts
// @(#) : Consolidated tests for AgLogHelpers utility functions following atsushifx式BDD
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it, vi } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import type { AgLogLevel } from '../../../../shared/types';
import {
  AgToLabel,
  AgToLogLevel,
  argsToString,
  createLoggerFunction,
  valueToString,
} from '../../../utils/AgLogHelpers';
import { isValidLogLevel } from '../../../utils/AgLogValidators';

/**
 * AgLogHelpers Consolidated Unit Test Suite
 *
 * @description Comprehensive tests for all AgLogHelpers utility functions
 * Organized by function with behavioral grouping
 */
describe('AgLogHelpers', () => {
  /**
   * Value Conversion Tests
   * Tests for valueToString utility function
   */
  describe('valueToString: Value conversion utility', () => {
    describe('基本データタイプの変換', () => {
      it('should return string representation of null', () => {
        const result = valueToString(null);
        expect(result).toBe('null');
      });

      it('should return string representation of undefined', () => {
        const result = valueToString(undefined);
        expect(result).toBe('undefined');
      });

      it('should return quoted string for string values', () => {
        const result = valueToString('test string');
        expect(result).toBe('"test string"');
      });

      it('should return string representation of numbers', () => {
        expect(valueToString(42)).toBe('42');
        expect(valueToString(3.14)).toBe('3.14');
        expect(valueToString(0)).toBe('0');
      });

      it('should return string representation of booleans', () => {
        expect(valueToString(true)).toBe('true');
        expect(valueToString(false)).toBe('false');
      });
    });

    describe('配列の変換', () => {
      it('should return "array" for empty arrays', () => {
        const result = valueToString([]);
        expect(result).toBe('array');
      });

      it('should return bracketed string representation for non-empty arrays', () => {
        const result = valueToString([1, 2, 3]);
        expect(result).toBe('[1,2,3]');
      });

      it('should handle arrays with mixed types', () => {
        const result = valueToString(['a', 1, true]);
        expect(result).toBe('[a,1,true]');
      });

      it('should handle nested arrays', () => {
        const result = valueToString([[1, 2], [3, 4]]);
        expect(result).toBe('[1,2,3,4]');
      });

      it('should handle arrays with null and undefined', () => {
        const result = valueToString([null, undefined, 'test']);
        expect(result).toBe('[,,test]');
      });
    });

    describe('関数の変換', () => {
      it('should return "function" for anonymous functions', () => {
        const result = valueToString(() => {});
        expect(result).toBe('function');
      });

      it('should return "function name" for named functions', () => {
        const namedFn = function testFunction(): void {};
        const result = valueToString(namedFn);
        expect(result).toBe('function testFunction');
      });

      it('should handle arrow functions with names', () => {
        const arrowFn = (): string => 'arrow';
        const result = valueToString(arrowFn);
        expect(result).toBe('function arrowFn');
      });
    });

    describe('オブジェクトの変換', () => {
      it('should return "object" for plain objects', () => {
        const result = valueToString({ key: 'value' });
        expect(result).toBe('object');
      });

      it('should return "object" for complex objects', () => {
        const complex = { a: 1, b: { c: 2 }, d: [1, 2, 3] };
        const result = valueToString(complex);
        expect(result).toBe('object');
      });
    });
  });

  /**
   * Logger Function Creation Tests
   * Tests for createLoggerFunction utility
   */
  describe('createLoggerFunction: Logger function factory', () => {
    describe('ロガー関数の生成', () => {
      it('should create a logger function that calls the provided module function', () => {
        const mockModuleFunc = vi.fn();

        const loggerFn = createLoggerFunction(mockModuleFunc);
        loggerFn('test message');

        expect(mockModuleFunc).toHaveBeenCalledWith(AG_LOGLEVEL.INFO, 'test message');
      });

      it('should handle different formatted message types', () => {
        const mockModuleFunc = vi.fn();

        const loggerFn = createLoggerFunction(mockModuleFunc);
        loggerFn('formatted string');

        expect(mockModuleFunc).toHaveBeenCalledWith(AG_LOGLEVEL.INFO, 'formatted string');
      });
    });
  });

  /**
   * Log Level Validation Tests
   * Tests for isValidLogLevel utility
   */
  describe('isValidLogLevel: LogLevel validation utility', () => {
    describe('有効なログレベルの検証', () => {
      const validLogLevels = [
        { name: 'OFF', value: AG_LOGLEVEL.OFF },
        { name: 'FATAL', value: AG_LOGLEVEL.FATAL },
        { name: 'ERROR', value: AG_LOGLEVEL.ERROR },
        { name: 'WARN', value: AG_LOGLEVEL.WARN },
        { name: 'INFO', value: AG_LOGLEVEL.INFO },
        { name: 'DEBUG', value: AG_LOGLEVEL.DEBUG },
        { name: 'TRACE', value: AG_LOGLEVEL.TRACE },
        { name: 'VERBOSE', value: AG_LOGLEVEL.VERBOSE },
        { name: 'LOG', value: AG_LOGLEVEL.LOG },
        { name: 'DEFAULT', value: AG_LOGLEVEL.DEFAULT },
      ];

      validLogLevels.forEach(({ name, value }) => {
        it(`should validate ${name} level (${value}) as valid`, () => {
          expect(isValidLogLevel(value)).toBe(true);
        });
      });
    });

    describe('無効なログレベルの検証', () => {
      const invalidValues = [
        { name: 'undefined', value: undefined },
        { name: 'null', value: null },
        { name: 'string', value: 'invalid' },
        { name: 'negative number', value: -1000 },
        { name: 'large positive number', value: 1000 },
        { name: 'decimal number', value: 3.5 },
        { name: 'boolean', value: true },
        { name: 'object', value: {} },
        { name: 'array', value: [] },
      ];

      invalidValues.forEach(({ name, value }) => {
        it(`should validate ${name} as invalid`, () => {
          expect(isValidLogLevel(value as unknown)).toBe(false);
        });
      });
    });
  });

  /**
   * Arguments Processing Tests
   * Tests for argsToString utility
   */
  describe('argsToString: Arguments string conversion', () => {
    describe('引数の文字列変換', () => {
      it('should format single argument', () => {
        const result = argsToString(['single arg']);
        expect(result).toBe('"single arg"');
      });

      it('should format multiple arguments with spaces', () => {
        const result = argsToString(['arg1', 'arg2', 'arg3']);
        expect(result).toBe('"arg1" "arg2" "arg3"');
      });

      it('should handle empty arguments array', () => {
        const result = argsToString([]);
        expect(result).toBe('');
      });

      it('should handle mixed type arguments', () => {
        const result = argsToString(['string', 42, true, null]);
        expect(result).toBe('"string" 42 true null');
      });

      it('should handle object and array arguments', () => {
        const result = argsToString([{ key: 'value' }, [1, 2, 3]]);
        expect(result).toBe('{"key":"value"} [1,2,3]');
      });
    });
  });

  /**
   * Log Level Conversion Tests
   * Tests for AgToLabel and AgToLogLevel utilities
   */
  describe('Log Level Conversion', () => {
    describe('AgToLabel: ログレベルからラベルへの変換', () => {
      it('should convert valid log levels to labels', () => {
        expect(AgToLabel(AG_LOGLEVEL.ERROR)).toBe('ERROR');
        expect(AgToLabel(AG_LOGLEVEL.WARN)).toBe('WARN');
        expect(AgToLabel(AG_LOGLEVEL.INFO)).toBe('INFO');
      });

      it('should return empty string for LOG level', () => {
        expect(AgToLabel(AG_LOGLEVEL.LOG)).toBe('');
      });

      it('should return empty string for invalid levels', () => {
        expect(AgToLabel(999 as AgLogLevel)).toBe('');
      });
    });

    describe('AgToLogLevel: ラベルからログレベルへの変換', () => {
      it('should convert valid labels to log levels', () => {
        expect(AgToLogLevel('ERROR')).toBe(AG_LOGLEVEL.ERROR);
        expect(AgToLogLevel('warn')).toBe(AG_LOGLEVEL.WARN);
        expect(AgToLogLevel(' INFO ')).toBe(AG_LOGLEVEL.INFO);
      });

      it('should return undefined for invalid labels', () => {
        expect(AgToLogLevel('INVALID')).toBeUndefined();
        expect(AgToLogLevel('')).toBeUndefined();
        expect(AgToLogLevel(null as unknown as string)).toBeUndefined();
      });
    });
  });
});
