// src/utils/__tests__/AgLogValidators.spec.ts
// @(#) : Consolidated validation tests following atsushifx式BDD
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import type { AgLogMessage } from '../../../../shared/types';
import { AgLoggerError } from '../../../../shared/types/AgLoggerError.types';
import type { AgFormatRoutine } from '../../../../shared/types/AgMockConstructor.class';
import { AgMockFormatter } from '../../../plugins/formatter/AgMockFormatter';
import { isAgMockConstructor, isValidLogLevel, validateLogLevel } from '../../../utils/AgLogValidators';

/**
 * AgLogValidators Consolidated Test Suite
 *
 * @description Comprehensive validation tests for log level and input validation
 * Organized by validation type with max 3-level hierarchy
 */
describe('AgLogValidators', () => {
  /**
   * Log Level Validation Tests
   * Tests for validateLogLevel function - throws on invalid, returns on valid
   */
  describe('validateLogLevel: Runtime log level validation', () => {
    describe('有効なログレベル', () => {
      const validStandardLevels = [
        { name: 'OFF', value: AG_LOGLEVEL.OFF },
        { name: 'FATAL', value: AG_LOGLEVEL.FATAL },
        { name: 'ERROR', value: AG_LOGLEVEL.ERROR },
        { name: 'WARN', value: AG_LOGLEVEL.WARN },
        { name: 'INFO', value: AG_LOGLEVEL.INFO },
        { name: 'DEBUG', value: AG_LOGLEVEL.DEBUG },
        { name: 'TRACE', value: AG_LOGLEVEL.TRACE },
      ];

      validStandardLevels.forEach(({ name, value }) => {
        it(`should accept standard ${name} level (${value})`, () => {
          expect(validateLogLevel(value)).toBe(value);
        });
      });

      const validSpecialLevels = [
        { name: 'VERBOSE', value: AG_LOGLEVEL.VERBOSE },
        { name: 'LOG', value: AG_LOGLEVEL.LOG },
        { name: 'DEFAULT', value: AG_LOGLEVEL.DEFAULT },
      ];

      validSpecialLevels.forEach(({ name, value }) => {
        it(`should accept special ${name} level (${value})`, () => {
          expect(validateLogLevel(value)).toBe(value);
        });
      });
    });

    describe('無効なタイプ', () => {
      const invalidTypeTests = [
        { name: 'undefined', value: undefined },
        { name: 'null', value: null },
        { name: 'string', value: 'invalid' },
        { name: 'boolean', value: true },
        { name: 'object', value: {} },
        { name: 'array', value: [] },
        { name: 'function', value: () => {} },
      ];

      invalidTypeTests.forEach(({ name, value }) => {
        it(`should throw AgLoggerError for ${name} type`, () => {
          expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
          expect(() => validateLogLevel(value)).toThrow(/Invalid log level/);
        });
      });
    });

    describe('無効な数値範囲', () => {
      const invalidRangeTests = [
        { name: 'negative out of range', value: -1000 },
        { name: 'positive out of range', value: 1000 },
        { name: 'decimal number', value: 3.5 },
        { name: 'NaN', value: NaN },
        { name: 'Infinity', value: Infinity },
        { name: '-Infinity', value: -Infinity },
      ];

      invalidRangeTests.forEach(({ name, value }) => {
        it(`should throw AgLoggerError for ${name} (${value})`, () => {
          expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
          expect(() => validateLogLevel(value)).toThrow(/Invalid log level/);
        });
      });
    });
  });

  /**
   * Log Level Check Tests
   * Tests for isValidLogLevel function - boolean return
   */
  describe('isValidLogLevel: Boolean log level validation', () => {
    describe('有効性チェック', () => {
      it('should return true for all valid standard log levels', () => {
        const validLevels = [
          AG_LOGLEVEL.OFF,
          AG_LOGLEVEL.FATAL,
          AG_LOGLEVEL.ERROR,
          AG_LOGLEVEL.WARN,
          AG_LOGLEVEL.INFO,
          AG_LOGLEVEL.DEBUG,
          AG_LOGLEVEL.TRACE,
          AG_LOGLEVEL.VERBOSE,
          AG_LOGLEVEL.LOG,
          AG_LOGLEVEL.DEFAULT,
        ];

        validLevels.forEach((level) => {
          expect(isValidLogLevel(level)).toBe(true);
        });
      });

      it('should return false for invalid types', () => {
        const invalidInputs = [
          undefined,
          null,
          'string',
          true,
          false,
          {},
          [],
          () => {},
        ];

        invalidInputs.forEach((input) => {
          expect(isValidLogLevel(input)).toBe(false);
        });
      });

      it('should return false for invalid numeric ranges', () => {
        const invalidNumbers = [-1000, 1000, 3.5, NaN, Infinity, -Infinity];

        invalidNumbers.forEach((num) => {
          expect(isValidLogLevel(num)).toBe(false);
        });
      });
    });
  });

  /**
   * Standard Log Level Restriction Tests
   * Tests for scenarios where only standard levels are accepted
   */
  describe('Standard Level Restrictions', () => {
    describe('標準レベル制限の検証', () => {
      it('should identify VERBOSE as non-standard level', () => {
        expect(isValidLogLevel(AG_LOGLEVEL.VERBOSE)).toBe(true);
        // Note: In contexts where VERBOSE is restricted, additional validation should occur
        // This test confirms VERBOSE is a valid log level but may be restricted in certain contexts
      });

      it('should identify LOG as special level', () => {
        expect(isValidLogLevel(AG_LOGLEVEL.LOG)).toBe(true);
        // LOG level bypasses normal level filtering
      });
    });
  });

  /**
   * Error Message Validation Tests
   * Tests for proper error messaging
   */
  describe('エラーメッセージの検証', () => {
    describe('適切なエラーメッセージ', () => {
      it('should provide descriptive error for undefined input', () => {
        expect(() => validateLogLevel(undefined)).toThrow(/Invalid log level.*undefined/);
      });

      it('should provide descriptive error for null input', () => {
        expect(() => validateLogLevel(null)).toThrow(/Invalid log level.*null/);
      });

      it('should provide descriptive error for string input', () => {
        expect(() => validateLogLevel('invalid')).toThrow(/Invalid log level.*invalid/);
      });

      it('should provide descriptive error for out-of-range numbers', () => {
        expect(() => validateLogLevel(999)).toThrow(/Invalid log level.*999/);
        expect(() => validateLogLevel(-999)).toThrow(/Invalid log level.*-999/);
      });
    });
  });

  /**
   * AgMockConstructor 判定
   * isAgMockConstructor(value: unknown): boolean の動作検証
   * atsushifx式BDD: RED-GREEN-REFACTOR を it/expect 粒度で進める
   */
  describe('isAgMockConstructor: AgMockConstructor 判定', () => {
    describe('真となるケース', () => {
      it('AgMockFormatter クラスを渡すと true', () => {
        expect(isAgMockConstructor(AgMockFormatter)).toBe(true);
      });

      it('モックシグネチャを満たす独自クラスで true', () => {
        class TestMockConstructor {
          static readonly __isMockConstructor = true as const;
          constructor(_routine: AgFormatRoutine) {}
          execute = (msg: AgLogMessage): string => msg.message;
          getStats = (): { callCount: number; lastMessage: AgLogMessage | null } => ({
            callCount: 0,
            lastMessage: null as AgLogMessage | null,
          });
          reset = (): void => {};
        }

        expect(isAgMockConstructor(TestMockConstructor)).toBe(true);
      });

      it('関数に __isMockConstructor=true を付与すると true', () => {
        // 通常の関数（クラスではない）にマーカーを付与
        type MockCtorLike = ((...args: unknown[]) => void) & { __isMockConstructor?: boolean };
        const fn: MockCtorLike = function() {/* noop */};
        fn.__isMockConstructor = true;
        expect(isAgMockConstructor(fn)).toBe(true);
      });
    });

    describe('偽となるケース', () => {
      it('通常の関数（マーカーなし）は false', () => {
        const fn: () => void = () => {};
        expect(isAgMockConstructor(fn)).toBe(false);
      });

      it('クラスでも __isMockConstructor が無い/false なら false', () => {
        class NoMarker {}
        class FalseMarker {
          static readonly __isMockConstructor = false as unknown as true;
        }
        expect(isAgMockConstructor(NoMarker)).toBe(false);
        expect(isAgMockConstructor(FalseMarker)).toBe(false);
      });

      it('オブジェクトに __isMockConstructor=true があっても関数でないので false', () => {
        const obj = { __isMockConstructor: true };
        expect(isAgMockConstructor(obj)).toBe(false);
      });

      it('プリミティブ値（null/undefined/数値/文字列/boolean）は false', () => {
        const cases: unknown[] = [null, undefined, 0, 1, 'x', true, false];
        cases.forEach((c) => expect(isAgMockConstructor(c)).toBe(false));
      });
    });
  });
});
