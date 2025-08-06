import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogLevel } from '../../../shared/types';
import { AgLoggerError } from '../../../shared/types/AgLoggerError.types.js';
import { validateLogLevel } from '../AgLogValidators';

describe('validateLogLevel', () => {
  describe('正常系 (Valid cases)', () => {
    it('should return valid LogLevel when input is VERBOSE', () => {
      expect(validateLogLevel(AG_LOGLEVEL.VERBOSE)).toBe(AG_LOGLEVEL.VERBOSE);
    });

    it('should return valid LogLevel when input is FORCE_OUTPUT', () => {
      expect(validateLogLevel(AG_LOGLEVEL.FORCE_OUTPUT)).toBe(AG_LOGLEVEL.FORCE_OUTPUT);
    });

    it('should return valid LogLevel when input is OFF', () => {
      expect(validateLogLevel(AG_LOGLEVEL.OFF)).toBe(AG_LOGLEVEL.OFF);
    });

    it('should return valid LogLevel when input is FATAL', () => {
      expect(validateLogLevel(AG_LOGLEVEL.FATAL)).toBe(AG_LOGLEVEL.FATAL);
    });

    it('should return valid LogLevel when input is ERROR', () => {
      expect(validateLogLevel(AG_LOGLEVEL.ERROR)).toBe(AG_LOGLEVEL.ERROR);
    });

    it('should return valid LogLevel when input is WARN', () => {
      expect(validateLogLevel(AG_LOGLEVEL.WARN)).toBe(AG_LOGLEVEL.WARN);
    });

    it('should return valid LogLevel when input is INFO', () => {
      expect(validateLogLevel(AG_LOGLEVEL.INFO)).toBe(AG_LOGLEVEL.INFO);
    });

    it('should return valid LogLevel when input is DEBUG', () => {
      expect(validateLogLevel(AG_LOGLEVEL.DEBUG)).toBe(AG_LOGLEVEL.DEBUG);
    });

    it('should return valid LogLevel when input is TRACE', () => {
      expect(validateLogLevel(AG_LOGLEVEL.TRACE)).toBe(AG_LOGLEVEL.TRACE);
    });
  });

  describe('異常系 - 型エラー (Invalid type cases)', () => {
    it('should throw AgLoggerError with specific message when input is undefined', () => {
      expect(() => validateLogLevel(undefined as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(undefined as unknown as AgLogLevel)).toThrow('Invalid log level (undefined)');
    });

    it('should throw AgLoggerError with specific message when input is null', () => {
      expect(() => validateLogLevel(null as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(null as unknown as AgLogLevel)).toThrow('Invalid log level (null)');
    });

    it('should throw AgLoggerError with specific message when input is string', () => {
      expect(() => validateLogLevel('invalid' as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel('invalid' as unknown as AgLogLevel)).toThrow('Invalid log level ("invalid")');
    });

    it('should throw AgLoggerError when input is string number', () => {
      expect(() => validateLogLevel('4' as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel('4' as unknown as AgLogLevel)).toThrow('Invalid log level ("4")');
    });

    it('should throw AgLoggerError when input is boolean true', () => {
      expect(() => validateLogLevel(true as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(true as unknown as AgLogLevel)).toThrow('Invalid log level (true)');
    });

    it('should throw AgLoggerError when input is boolean false', () => {
      expect(() => validateLogLevel(false as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(false as unknown as AgLogLevel)).toThrow('Invalid log level (false)');
    });

    it('should throw AgLoggerError when input is object', () => {
      expect(() => validateLogLevel({} as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel({} as unknown as AgLogLevel)).toThrow('Invalid log level (object)');
    });

    it('should throw AgLoggerError when input is array', () => {
      expect(() => validateLogLevel([] as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel([] as unknown as AgLogLevel)).toThrow('Invalid log level (array)');
    });

    it('should throw AgLoggerError when input is function', () => {
      expect(() => validateLogLevel((() => { }) as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel((() => { }) as unknown as AgLogLevel)).toThrow('Invalid log level (function');
    });
  });

  describe('異常系 - 数値エラー (Invalid number cases)', () => {
    it('should throw AgLoggerError when input is out of range positive number', () => {
      expect(() => validateLogLevel(7 as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(7 as unknown as AgLogLevel)).toThrow('Invalid log level (7)');
    });

    it('should throw AgLoggerError when input is large positive number', () => {
      expect(() => validateLogLevel(999 as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(999 as unknown as AgLogLevel)).toThrow('Invalid log level (999)');
    });

    it('should throw AgLoggerError when input is out of range negative number', () => {
      expect(() => validateLogLevel(-1 as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(-1 as unknown as AgLogLevel)).toThrow('Invalid log level (-1)');
    });

    it('should throw AgLoggerError when input is large negative number', () => {
      expect(() => validateLogLevel(-100 as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(-100 as unknown as AgLogLevel)).toThrow('Invalid log level (-100)');
    });
  });

  describe('エッジケース - 特殊数値 (Edge cases with special numbers)', () => {
    it('should throw AgLoggerError when input is decimal number', () => {
      expect(() => validateLogLevel(4.5 as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(4.5 as unknown as AgLogLevel)).toThrow('Invalid log level (4.5)');
    });

    it('should throw AgLoggerError when input is negative decimal', () => {
      expect(() => validateLogLevel(-99.1 as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(-99.1 as unknown as AgLogLevel)).toThrow('Invalid log level (-99.1)');
    });

    it('should throw AgLoggerError when input is NaN', () => {
      expect(() => validateLogLevel(NaN as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(NaN as unknown as AgLogLevel)).toThrow('Invalid log level (NaN)');
    });

    it('should throw AgLoggerError when input is Infinity', () => {
      expect(() => validateLogLevel(Infinity as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(Infinity as unknown as AgLogLevel)).toThrow('Invalid log level (Infinity)');
    });

    it('should throw AgLoggerError when input is -Infinity', () => {
      expect(() => validateLogLevel(-Infinity as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(-Infinity as unknown as AgLogLevel)).toThrow('Invalid log level (-Infinity)');
    });

    it('should throw AgLoggerError when input is Number object', () => {
      expect(() => validateLogLevel(new Number(AG_LOGLEVEL.INFO) as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(new Number(AG_LOGLEVEL.INFO) as unknown as AgLogLevel)).toThrow(
        'Invalid log level (object)',
      );
    });
  });

  describe('境界値テスト (Boundary value tests)', () => {
    it('should handle zero correctly (valid OFF level)', () => {
      expect(validateLogLevel(0)).toBe(AG_LOGLEVEL.OFF);
    });

    it('should reject numbers just outside valid range', () => {
      // Just below VERBOSE (-99)
      expect(() => validateLogLevel(-100 as unknown as AgLogLevel)).toThrow('Invalid log level (-100)');

      // Just above TRACE (6)
      expect(() => validateLogLevel(7 as unknown as AgLogLevel)).toThrow('Invalid log level (7)');

      // Between FORCE_OUTPUT (-98) and OFF (0) - invalid
      expect(() => validateLogLevel(-1 as unknown as AgLogLevel)).toThrow('Invalid log level (-1)');
      expect(() => validateLogLevel(-50 as unknown as AgLogLevel)).toThrow('Invalid log level (-50)');
    });
  });
});
