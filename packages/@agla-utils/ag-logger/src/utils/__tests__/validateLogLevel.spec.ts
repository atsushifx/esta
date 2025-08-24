/**
 * @fileoverview LogLevel Validation BDD Test Suite
 * @description atsushifx式BDD厳格プロセスによるvalidateLogLevel関数のテスト
 *
 * Requirements from CLAUDE.md:
 * LogLevelが invalid (undefined, null, 文字列などの数字ではない型、範囲外の数値) なら、
 * 全てエラーを投げる
 */

import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogLevel } from '../../../shared/types';
import { AgLoggerError } from '../../../shared/types/AgLoggerError.types';
import { validateLogLevel } from '../AgLogValidators';

/**
 * validateLogLevel BDD Test Suite
 * atsushifx式BDD: 自然言語的な記述によるBehavior-Driven Development
 */
describe('validateLogLevel: LogLevel validation with comprehensive error handling', () => {
  /**
   * Scenario 1: 有効なLogLevel値の検証
   * Given: 有効なLogLevel値
   * When: validateLogLevel関数を呼び出す
   * Then: エラーなく同じ値を返す
   */
  describe('Scenario: 有効なLogLevel値を検証する', () => {
    describe('Given: 標準LogLevel値（0-6）', () => {
      const standardLevels = [
        { name: 'OFF', value: AG_LOGLEVEL.OFF },
        { name: 'FATAL', value: AG_LOGLEVEL.FATAL },
        { name: 'ERROR', value: AG_LOGLEVEL.ERROR },
        { name: 'WARN', value: AG_LOGLEVEL.WARN },
        { name: 'INFO', value: AG_LOGLEVEL.INFO },
        { name: 'DEBUG', value: AG_LOGLEVEL.DEBUG },
        { name: 'TRACE', value: AG_LOGLEVEL.TRACE },
      ] as const;

      standardLevels.forEach(({ name, value }) => {
        it(`When: ${name}レベル(${value})を検証する Then: 同じ値を返す`, () => {
          const result = validateLogLevel(value);
          expect(result).toBe(value);
          expect(result).toEqual(value as AgLogLevel);
        });
      });
    });

    describe('Given: 特殊LogLevel値', () => {
      const specialLevels = [
        { name: 'VERBOSE', value: AG_LOGLEVEL.VERBOSE },
        { name: 'LOG', value: AG_LOGLEVEL.LOG },
        { name: 'DEFAULT', value: AG_LOGLEVEL.DEFAULT },
      ] as const;

      specialLevels.forEach(({ name, value }) => {
        it(`When: ${name}レベル(${value})を検証する Then: 同じ値を返す`, () => {
          const result = validateLogLevel(value);
          expect(result).toBe(value);
          expect(result).toEqual(value as AgLogLevel);
        });
      });
    });
  });

  /**
   * Scenario 2: 型エラー（undefined, null, 非数値型）の検証
   * Given: 無効な型の値
   * When: validateLogLevel関数を呼び出す
   * Then: AgLoggerErrorを投げる
   */
  describe('Scenario: 無効な型でエラーを投げる', () => {
    describe('Given: undefined値', () => {
      it('When: undefinedを検証する Then: AgLoggerErrorを投げる', () => {
        expect(() => validateLogLevel(undefined)).toThrow(AgLoggerError);
        expect(() => validateLogLevel(undefined)).toThrow(/Invalid log level.*undefined/);
      });
    });

    describe('Given: null値', () => {
      it('When: nullを検証する Then: AgLoggerErrorを投げる', () => {
        expect(() => validateLogLevel(null)).toThrow(AgLoggerError);
        expect(() => validateLogLevel(null)).toThrow(/Invalid log level.*null/);
      });
    });

    describe('Given: 文字列型', () => {
      const stringValues = [
        { name: '空文字列', value: '' },
        { name: '数字文字列', value: '3' },
        { name: '英字文字列', value: 'invalid' },
        { name: 'LogLevel名', value: 'ERROR' },
      ];

      stringValues.forEach(({ name, value }) => {
        it(`When: ${name}(${JSON.stringify(value)})を検証する Then: AgLoggerErrorを投げる`, () => {
          expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
          expect(() => validateLogLevel(value)).toThrow(/Invalid log level.*expected number/);
        });
      });
    });

    describe('Given: 真偽値型', () => {
      [true, false].forEach((value) => {
        it(`When: ${value}を検証する Then: AgLoggerErrorを投げる`, () => {
          expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
          expect(() => validateLogLevel(value)).toThrow(/Invalid log level.*expected number/);
        });
      });
    });

    describe('Given: オブジェクト型', () => {
      const objectValues = [
        { name: '空オブジェクト', value: {} },
        { name: 'オブジェクト', value: { level: 3 } },
        { name: '配列', value: [] },
        { name: '数値配列', value: [3] },
        { name: '関数', value: () => {} },
      ];

      objectValues.forEach(({ name, value }) => {
        it(`When: ${name}を検証する Then: AgLoggerErrorを投げる`, () => {
          expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
          expect(() => validateLogLevel(value)).toThrow(/Invalid log level.*expected number/);
        });
      });
    });
  });

  /**
   * Scenario 3: 数値型だが無効な値の検証
   * Given: 数値型だが範囲外・小数・特殊数値
   * When: validateLogLevel関数を呼び出す
   * Then: AgLoggerErrorを投げる
   */
  describe('Scenario: 数値型だが無効な値でエラーを投げる', () => {
    describe('Given: 小数値', () => {
      const decimalValues = [
        { name: '正の小数', value: 3.5 },
        { name: '負の小数', value: -1.5 },
        { name: 'ゼロ近似値', value: 0.1 },
        { name: '大きな小数', value: 999.999 },
      ];

      decimalValues.forEach(({ name, value }) => {
        it(`When: ${name}(${value})を検証する Then: AgLoggerErrorを投げる`, () => {
          expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
          expect(() => validateLogLevel(value)).toThrow(/Invalid log level.*must be integer/);
        });
      });
    });

    describe('Given: 特殊数値', () => {
      const specialNumbers = [
        { name: 'NaN', value: NaN },
        { name: 'Infinity', value: Infinity },
        { name: '-Infinity', value: -Infinity },
      ];

      specialNumbers.forEach(({ name, value }) => {
        it(`When: ${name}を検証する Then: AgLoggerErrorを投げる`, () => {
          expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
          expect(() => validateLogLevel(value)).toThrow(/Invalid log level.*must be finite number/);
        });
      });
    });

    describe('Given: 範囲外整数値', () => {
      const outOfRangeValues = [
        { name: '負の大きな値', value: -1000 },
        { name: '負の小さな値', value: -1 },
        { name: '正の小さな範囲外', value: 7 },
        { name: '正の大きな値', value: 1000 },
        { name: '中間の無効値', value: 50 },
      ];

      outOfRangeValues.forEach(({ name, value }) => {
        it(`When: ${name}(${value})を検証する Then: AgLoggerErrorを投げる`, () => {
          expect(() => validateLogLevel(value)).toThrow(AgLoggerError);
          expect(() => validateLogLevel(value)).toThrow(/Invalid log level.*out of valid range/);
        });
      });
    });
  });

  /**
   * Scenario 4: エラーメッセージの詳細性検証
   * Given: 各種無効な値
   * When: validateLogLevel関数を呼び出す
   * Then: 適切で詳細なエラーメッセージを含むAgLoggerErrorを投げる
   */
  describe('Scenario: 詳細なエラーメッセージを提供する', () => {
    it('Given: undefined When: 検証する Then: undefinedを含むメッセージを投げる', () => {
      expect(() => validateLogLevel(undefined)).toThrow(/undefined/);
    });

    it('Given: null When: 検証する Then: nullを含むメッセージを投げる', () => {
      expect(() => validateLogLevel(null)).toThrow(/null/);
    });

    it('Given: 文字列 When: 検証する Then: expected numberを含むメッセージを投げる', () => {
      expect(() => validateLogLevel('invalid')).toThrow(/expected number/);
    });

    it('Given: 小数 When: 検証する Then: must be integerを含むメッセージを投げる', () => {
      expect(() => validateLogLevel(3.5)).toThrow(/must be integer/);
    });

    it('Given: 範囲外値 When: 検証する Then: out of valid rangeを含むメッセージを投げる', () => {
      expect(() => validateLogLevel(999)).toThrow(/out of valid range/);
    });

    it('Given: 特殊数値 When: 検証する Then: must be finite numberを含むメッセージを投げる', () => {
      expect(() => validateLogLevel(Infinity)).toThrow(/must be finite number/);
    });
  });

  /**
   * Scenario 5: 境界値テスト
   * Given: LogLevel範囲の境界値
   * When: validateLogLevel関数を呼び出す
   * Then: 適切に処理する
   */
  describe('Scenario: 境界値を適切に処理する', () => {
    it('Given: 最小標準値(0) When: 検証する Then: 正常に返す', () => {
      expect(validateLogLevel(0)).toBe(AG_LOGLEVEL.OFF);
    });

    it('Given: 最大標準値(6) When: 検証する Then: 正常に返す', () => {
      expect(validateLogLevel(6)).toBe(AG_LOGLEVEL.TRACE);
    });

    it('Given: 最小特殊値(-99) When: 検証する Then: 正常に返す', () => {
      expect(validateLogLevel(-99)).toBe(AG_LOGLEVEL.DEFAULT);
    });

    it('Given: 境界値の直外(-1) When: 検証する Then: エラーを投げる', () => {
      expect(() => validateLogLevel(-1)).toThrow(/out of valid range/);
    });

    it('Given: 境界値の直外(7) When: 検証する Then: エラーを投げる', () => {
      expect(() => validateLogLevel(7)).toThrow(/out of valid range/);
    });
  });
});
