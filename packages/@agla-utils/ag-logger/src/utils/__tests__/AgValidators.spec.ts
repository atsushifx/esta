import { describe, expect, it } from 'vitest';

import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../../../shared/constants';
import { AgLoggerError } from '../../../shared/types/AgLoggerError.types';
import { AG_LOGLEVEL, type AgLogLevel } from '../../../shared/types/AgLogLevel.types';

/**
 * Test helper function that mimics AgLoggerConfig.validateLogLevel behavior
 * This function validates a log level and throws an error if invalid
 */
const validateLogLevel = (level: AgLogLevel): void => {
  const validLogLevels = Object.values(AG_LOGLEVEL);

  if (!validLogLevels.includes(level)) {
    throw new AgLoggerError(
      ERROR_TYPES.VALIDATION,
      `${AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.VALIDATION].INVALID_LOG_LEVEL} (${level})`,
    );
  }
};

describe('validateLogLevel', () => {
  describe('valid log levels', () => {
    it('should not throw error for AG_LOGLEVEL.OFF', () => {
      expect(() => validateLogLevel(AG_LOGLEVEL.OFF)).not.toThrow();
    });

    it('should not throw error for AG_LOGLEVEL.FATAL', () => {
      expect(() => validateLogLevel(AG_LOGLEVEL.FATAL)).not.toThrow();
    });

    it('should not throw error for AG_LOGLEVEL.ERROR', () => {
      expect(() => validateLogLevel(AG_LOGLEVEL.ERROR)).not.toThrow();
    });

    it('should not throw error for AG_LOGLEVEL.WARN', () => {
      expect(() => validateLogLevel(AG_LOGLEVEL.WARN)).not.toThrow();
    });

    it('should not throw error for AG_LOGLEVEL.INFO', () => {
      expect(() => validateLogLevel(AG_LOGLEVEL.INFO)).not.toThrow();
    });

    it('should not throw error for AG_LOGLEVEL.DEBUG', () => {
      expect(() => validateLogLevel(AG_LOGLEVEL.DEBUG)).not.toThrow();
    });

    it('should not throw error for AG_LOGLEVEL.TRACE', () => {
      expect(() => validateLogLevel(AG_LOGLEVEL.TRACE)).not.toThrow();
    });

    it('should not throw error for AG_LOGLEVEL.VERBOSE', () => {
      expect(() => validateLogLevel(AG_LOGLEVEL.VERBOSE)).not.toThrow();
    });
  });

  describe('invalid log levels', () => {
    it('should throw AgLoggerError for out-of-range positive number', () => {
      expect(() => validateLogLevel(999 as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(999 as AgLogLevel)).toThrow('Invalid log level (999)');
    });

    it('should throw AgLoggerError for out-of-range negative number', () => {
      expect(() => validateLogLevel(-1 as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(-1 as AgLogLevel)).toThrow('Invalid log level (-1)');
    });

    it('should throw AgLoggerError for decimal number', () => {
      expect(() => validateLogLevel(1.5 as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(1.5 as AgLogLevel)).toThrow('Invalid log level (1.5)');
    });

    it('should throw AgLoggerError for string value', () => {
      expect(() => validateLogLevel('INVALID' as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel('INVALID' as unknown as AgLogLevel)).toThrow('Invalid log level (INVALID)');
    });

    it('should throw AgLoggerError for null value', () => {
      expect(() => validateLogLevel(null as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(null as unknown as AgLogLevel)).toThrow('Invalid log level (null)');
    });

    it('should throw AgLoggerError for undefined value', () => {
      expect(() => validateLogLevel(undefined as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(undefined as unknown as AgLogLevel)).toThrow('Invalid log level (undefined)');
    });

    it('should throw AgLoggerError for boolean value', () => {
      expect(() => validateLogLevel(true as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(true as unknown as AgLogLevel)).toThrow('Invalid log level (true)');
    });

    it('should throw AgLoggerError for object value', () => {
      const objectValue = { level: 1 };
      expect(() => validateLogLevel(objectValue as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(objectValue as unknown as AgLogLevel)).toThrow(
        'Invalid log level ([object Object])',
      );
    });

    it('should throw AgLoggerError for array value', () => {
      const arrayValue = [1, 2, 3];
      expect(() => validateLogLevel(arrayValue as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(arrayValue as unknown as AgLogLevel)).toThrow('Invalid log level (1,2,3)');
    });
  });

  describe('error details', () => {
    it('should throw AgLoggerError with correct category', () => {
      try {
        validateLogLevel(999 as AgLogLevel);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AgLoggerError);
        expect((error as AgLoggerError).errorType).toBe(
          ERROR_TYPES.VALIDATION
        );
      }
    });

    it('should throw AgLoggerError with descriptive message', () => {
      try {
        validateLogLevel(-100 as AgLogLevel);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AgLoggerError);
        expect((error as AgLoggerError).message).toContain('Invalid log level (-100)');
      }
    });
  });
});
