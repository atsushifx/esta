// src/__tests__/AgLogger.features.spec.ts
// @(#) : Unit tests for AgLogger special features (Verbose, FORCE_OUTPUT, Configuration)
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../../shared/constants/';
import { AG_LOGLEVEL } from '../../shared/types';
import { AgLogger } from '../AgLogger.class';

type TestableAgLogger = AgLogger & {
  _isVerbose: boolean | null;
};

const mockLogger = vi.fn();
const mockFormatter = vi.fn().mockImplementation((msg) => msg.message ?? msg);

/**
 * 共通のテストセットアップとクリーンアップ
 */
const setupTestEnvironment = (): void => {
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });
};

/**
 * AgLogger 特殊機能ユニットテスト
 * @description verbose機能とFORCE_OUTPUTの振る舞いを検証
 */
describe('AgLogger Special Features', () => {
  setupTestEnvironment();

  describe('Verbose Functionality', () => {
    describe('正常系: Basic verbose operations', () => {
      it('should not output when verbose is disabled', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.setVerbose = false;

        logger.verbose('verbose message');

        expect(mockLogger).not.toHaveBeenCalled();
      });

      it('should output when verbose is enabled', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.setVerbose = true;

        logger.verbose('verbose message');

        expect(mockLogger).toHaveBeenCalledTimes(1);
      });

      it('should manage verbose state correctly', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        expect(logger.isVerbose).toBe(false);

        logger.setVerbose = true;
        expect(logger.isVerbose).toBe(true);

        logger.setVerbose = false;
        expect(logger.isVerbose).toBe(false);
      });
    });

    describe('異常系: Verbose error handling', () => {
      it('should handle verbose with invalid verbose state', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // Force invalid state (for edge case testing)
        (logger as TestableAgLogger)._isVerbose = null;

        expect(() => logger.verbose('test')).not.toThrow();
      });
    });

    describe('エッジケース: Verbose edge cases', () => {
      it('should handle verbose with various argument types', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.setVerbose = true;

        logger.verbose();
        logger.verbose(null);
        logger.verbose(undefined);
        logger.verbose(0);
        logger.verbose(false);
        logger.verbose({ complex: 'object' });

        expect(mockLogger).toHaveBeenCalledTimes(2); // null string not output
      });

      it('should handle verbose state changes during execution', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.setVerbose = true;
        logger.verbose('first message');

        logger.setVerbose = false;
        logger.verbose('second message');

        logger.setVerbose = true;
        logger.verbose('third message');

        expect(mockLogger).toHaveBeenCalledTimes(2);
      });

      it('should work with custom verbose formatters', () => {
        const verboseFormatter = vi.fn().mockReturnValue('VERBOSE: formatted');
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: verboseFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.setVerbose = true;

        logger.verbose('test message');

        expect(verboseFormatter).toHaveBeenCalled();
        expect(mockLogger).toHaveBeenCalledWith('VERBOSE: formatted');
      });
    });
  });
});

describe('LOG Log Level', () => {
  setupTestEnvironment();
  describe('正常系: Basic LOG functionality', () => {
    it('should output when both logLevel is OFF and verbose is false', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.OFF;
      logger.setVerbose = false;

      logger.log('force output message');

      expect(mockLogger).toHaveBeenCalledTimes(1);
    });

    it('should output regardless of any log level setting', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.setVerbose = false;

      const testLevels = [
        AG_LOGLEVEL.OFF,
        AG_LOGLEVEL.FATAL,
        AG_LOGLEVEL.ERROR,
        AG_LOGLEVEL.WARN,
        AG_LOGLEVEL.INFO,
        AG_LOGLEVEL.DEBUG,
        AG_LOGLEVEL.TRACE,
      ];

      testLevels.forEach((level, index) => {
        logger.logLevel = level;
        logger.log(`force message ${index}`);
      });

      expect(mockLogger).toHaveBeenCalledTimes(testLevels.length);
    });

    it('should work with verbose disabled', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.OFF;
      logger.setVerbose = false;

      logger.log('force with verbose off');

      expect(mockLogger).toHaveBeenCalledTimes(1);
    });
  });

  describe('異常系: LOG error scenarios', () => {
    it('should handle LOG with throwing logger', () => {
      const throwingLogger = vi.fn(() => {
        throw new Error('Logger error');
      });
      const logger = AgLogger.createLogger({ defaultLogger: throwingLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.OFF;

      expect(() => logger.log('force output')).toThrow('Logger error');
    });

    it('should handle LOG with throwing formatter', () => {
      const throwingFormatter = vi.fn(() => {
        throw new Error('Formatter error');
      });
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: throwingFormatter });
      logger.logLevel = AG_LOGLEVEL.OFF;

      expect(() => logger.log('force output')).toThrow('Formatter error');
    });
  });

  describe('エッジケース: LOG edge cases', () => {
    it('should handle LOG with empty message', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.OFF;

      logger.log('');

      expect(mockLogger).not.toHaveBeenCalled(); // Empty messages are suppressed
    });

    it('should handle LOG with no arguments', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.OFF;

      logger.log(''); // Empty messages are suppressed
      logger.log('force output message');

      expect(mockLogger).toHaveBeenCalledTimes(1);
    });

    it('should handle LOG with complex objects', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.OFF;

      const complexObj = {
        nested: { deep: { value: 'test' } },
        array: [1, 2, { inner: 'array' }],
        date: new Date(),
        func: () => 'function',
      };

      logger.log('complex data', complexObj);

      expect(mockLogger).toHaveBeenCalledTimes(1);
    });

    it('should work with VERBOSE level (edge boundary)', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.VERBOSE;
      logger.setVerbose = false;

      logger.log('force with VERBOSE level');

      expect(mockLogger).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Configuration Management', () => {
  setupTestEnvironment();
  describe('正常系: Basic configuration operations', () => {
    it('should create logger with custom configuration', () => {
      const customLogger = vi.fn();
      const customFormatter = vi.fn().mockReturnValue('custom format');

      const logger = AgLogger.createLogger({
        defaultLogger: customLogger,
        formatter: customFormatter,
        loggerMap: {
          [AG_LOGLEVEL.ERROR]: vi.fn(),
        },
      });

      logger.logLevel = AG_LOGLEVEL.INFO;
      logger.info('test');

      expect(customFormatter).toHaveBeenCalled();
      expect(customLogger).toHaveBeenCalledWith('custom format');
    });

    it('should handle logger map configuration', () => {
      const errorLogger = vi.fn();
      const warnLogger = vi.fn();
      const infoLogger = vi.fn();

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger,
        formatter: mockFormatter,
        loggerMap: {
          [AG_LOGLEVEL.ERROR]: errorLogger,
          [AG_LOGLEVEL.WARN]: warnLogger,
          [AG_LOGLEVEL.INFO]: infoLogger,
        },
      });

      logger.logLevel = AG_LOGLEVEL.TRACE;
      logger.error('error msg');
      logger.warn('warn msg');
      logger.info('info msg');
      logger.debug('debug msg'); // uses default

      expect(errorLogger).toHaveBeenCalledTimes(1);
      expect(warnLogger).toHaveBeenCalledTimes(1);
      expect(infoLogger).toHaveBeenCalledTimes(1);
      expect(mockLogger).toHaveBeenCalledTimes(1);
    });
  });

  describe('異常系: Configuration error handling', () => {
    it('should throw error when configuration is null', () => {
      expect(() => {
        // @ts-expect-error: Testing null input
        AgLogger.createLogger(null);
      }).toThrow(AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.VALIDATION].NULL_CONFIGURATION);
    });

    it('should throw error when formatter is undefined', () => {
      expect(() => {
        AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: undefined,
        });
      }).toThrow(AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.CONFIG].INVALID_FORMATTER);
    });

    it('should throw error when formatter is null', () => {
      expect(() => {
        AgLogger.createLogger({
          defaultLogger: mockLogger,
          // @ts-expect-error: Testing null formatter
          formatter: null,
        });
      }).toThrow(AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.CONFIG].INVALID_FORMATTER);
    });

    it('should throw error when defaultLogger is undefined', () => {
      expect(() => {
        AgLogger.createLogger({
          defaultLogger: undefined,
          formatter: mockFormatter,
        });
      }).toThrow(AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.CONFIG].INVALID_DEFAULT_LOGGER);
    });

    it('should throw error when defaultLogger is null', () => {
      expect(() => {
        AgLogger.createLogger({
          // @ts-expect-error: Testing null defaultLogger
          defaultLogger: null,
          formatter: mockFormatter,
        });
      }).toThrow(AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.CONFIG].INVALID_DEFAULT_LOGGER);
    });

    it('should handle invalid logger map', () => {
      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger,
        formatter: mockFormatter,
        loggerMap: {
          // @ts-expect-error: Testing invalid key
          invalid: vi.fn(),
        },
      });

      logger.logLevel = AG_LOGLEVEL.INFO;
      logger.info('test');

      expect(mockLogger).toHaveBeenCalled(); // Falls back to default
    });
  });

  describe('エッジケース: Configuration edge cases', () => {
    it('should handle empty logger map', () => {
      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger,
        formatter: mockFormatter,
        loggerMap: {},
      });

      logger.logLevel = AG_LOGLEVEL.INFO;
      logger.info('test');

      expect(mockLogger).toHaveBeenCalled();
    });

    it('should handle partial logger map', () => {
      const errorLogger = vi.fn();
      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger,
        formatter: mockFormatter,
        loggerMap: {
          [AG_LOGLEVEL.ERROR]: errorLogger,
        },
      });

      logger.logLevel = AG_LOGLEVEL.TRACE;
      logger.error('error msg');
      logger.warn('warn msg'); // not in map, uses default

      expect(errorLogger).toHaveBeenCalledTimes(1);
      expect(mockLogger).toHaveBeenCalledTimes(1);
    });

    it('should handle configuration with all log levels mapped', () => {
      const loggerMap = {
        [AG_LOGLEVEL.VERBOSE]: vi.fn(),
        [AG_LOGLEVEL.OFF]: vi.fn(),
        [AG_LOGLEVEL.FATAL]: vi.fn(),
        [AG_LOGLEVEL.ERROR]: vi.fn(),
        [AG_LOGLEVEL.WARN]: vi.fn(),
        [AG_LOGLEVEL.INFO]: vi.fn(),
        [AG_LOGLEVEL.DEBUG]: vi.fn(),
        [AG_LOGLEVEL.TRACE]: vi.fn(),
        [AG_LOGLEVEL.LOG]: vi.fn(),
      };

      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger,
        formatter: mockFormatter,
        loggerMap,
      });

      logger.logLevel = AG_LOGLEVEL.TRACE;
      logger.fatal('fatal');
      logger.error('error');
      logger.warn('warn');
      logger.info('info');
      logger.debug('debug');
      logger.trace('trace');
      logger.log('force'); // FORCE_OUTPUT

      expect(loggerMap[AG_LOGLEVEL.FATAL]).toHaveBeenCalledTimes(1);
      expect(loggerMap[AG_LOGLEVEL.ERROR]).toHaveBeenCalledTimes(1);
      expect(loggerMap[AG_LOGLEVEL.WARN]).toHaveBeenCalledTimes(1);
      expect(loggerMap[AG_LOGLEVEL.INFO]).toHaveBeenCalledTimes(1);
      expect(loggerMap[AG_LOGLEVEL.DEBUG]).toHaveBeenCalledTimes(1);
      expect(loggerMap[AG_LOGLEVEL.TRACE]).toHaveBeenCalledTimes(1);
      expect(loggerMap[AG_LOGLEVEL.LOG]).toHaveBeenCalledTimes(1);
      expect(mockLogger).not.toHaveBeenCalled(); // All mapped, default not used
    });

    it('should handle configuration updates', () => {
      const logger1 = vi.fn();
      const logger2 = vi.fn();

      const logger = AgLogger.createLogger({
        defaultLogger: logger1,
        formatter: mockFormatter,
      });

      logger.logLevel = AG_LOGLEVEL.INFO;
      logger.info('first');

      // Reconfigure
      AgLogger.resetSingleton();
      const newLogger = AgLogger.createLogger({
        defaultLogger: logger2,
        formatter: mockFormatter,
      });

      newLogger.logLevel = AG_LOGLEVEL.INFO;
      newLogger.info('second');

      expect(logger1).toHaveBeenCalledTimes(1);
      expect(logger2).toHaveBeenCalledTimes(1);
    });
  });
});
