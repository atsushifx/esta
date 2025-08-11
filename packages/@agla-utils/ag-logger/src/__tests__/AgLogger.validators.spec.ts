// src/__tests__/AgLogger.validators.spec.ts
// @(#) : AgLogger validation tests - Input content and log level control validation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { beforeEach, describe, expect, it } from 'vitest';

// Error handling
import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../../shared/constants';
import { AG_LOGLEVEL } from '../../shared/types';

import { AgLoggerError } from '../../shared/types/AgLoggerError.types';
// Types
import type { AgLogLevel, AgLogMessage } from '../../shared/types';
// Test target
import { AgLogger } from '../AgLogger.class';
// Utils validation functions
import { validateLogLevel } from '../utils/AgLogValidators';

/**
 * AgLogger Validation Tests
 *
 * @description 2つの主要なバリデーション責務を分離してテスト
 * - ログ内容バリデーション: 入力されるログメッセージ、設定オプションの検証
 * - ログレベル制御バリデーション: ログレベル値、出力制御ロジックの検証
 */
// ---- ユニットテスト用ヘルパー

type TestableAgLogger = AgLogger & {
  executeLog: (level: AgLogLevel, ...args: unknown[]) => void;
  shouldOutput: (level: AgLogLevel) => boolean;
};

/**
 * 共通のテストセットアップとクリーンアップ
 */
const setupTestEnvironment = (): void => {
  beforeEach(() => {
    AgLogger.resetSingleton();
  });
};

describe('AgLogger Input Validation', () => {
  setupTestEnvironment();

  describe('Log Content Validation', () => {
    describe('Message Arguments Validation', () => {
      it('should handle undefined message arguments', () => {
        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;

        // Should not throw for basic undefined arguments
        expect(() => logger.info(undefined)).not.toThrow();
      });

      it('should handle null message arguments', () => {
        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;

        expect(() => logger.info(null)).not.toThrow();
      });

      it('should handle empty string arguments', () => {
        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;

        expect(() => logger.info('')).not.toThrow();
      });

      it('should handle special characters in messages', () => {
        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;

        expect(() => logger.info('Unicode: 🌟 ñ © ® ™')).not.toThrow();
        expect(() => logger.info('Control chars: \t\n\r\b\f')).not.toThrow();
      });
    });

    describe('Configuration Options Validation', () => {
      it('should throw AgLoggerError when defaultLogger is undefined', () => {
        const logger = AgLogger.createLogger();
        const invalidOptions = { defaultLogger: undefined };

        expect(() => logger.setLoggerConfig(invalidOptions)).toThrow(AgLoggerError);
        expect(() => logger.setLoggerConfig(invalidOptions)).toThrow(
          AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.CONFIG].INVALID_DEFAULT_LOGGER,
        );
      });

      it('should throw AgLoggerError when formatter is undefined', () => {
        const logger = AgLogger.createLogger();
        const invalidOptions = { formatter: undefined };

        expect(() => logger.setLoggerConfig(invalidOptions)).toThrow(AgLoggerError);
        expect(() => logger.setLoggerConfig(invalidOptions)).toThrow(
          AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.CONFIG].INVALID_FORMATTER,
        );
        expect(() => logger.setLoggerConfig(invalidOptions)).toThrow('formatter must be a valid function');
      });

      it('should accept valid formatter function', () => {
        const mockFormatter = (message: AgLogMessage): string => `formatted: ${message.message}`;
        const logger = AgLogger.createLogger();

        expect(() => logger.setLoggerConfig({ formatter: mockFormatter })).not.toThrow();
        expect(logger.getFormatter()).toBe(mockFormatter);
      });
    });

    describe('Plugin Validation', () => {
      it('should return valid formatter function', () => {
        const logger = AgLogger.createLogger();

        const formatter = logger.getFormatter();
        expect(typeof formatter).toBe('function');
      });
    });
  });

  describe('Log Level Control Validation', () => {
    describe('Log Level Value Validation', () => {
      describe('Valid log levels', () => {
        it('should accept all standard log levels', () => {
          expect(() => validateLogLevel(AG_LOGLEVEL.OFF)).not.toThrow();
          expect(() => validateLogLevel(AG_LOGLEVEL.FATAL)).not.toThrow();
          expect(() => validateLogLevel(AG_LOGLEVEL.ERROR)).not.toThrow();
          expect(() => validateLogLevel(AG_LOGLEVEL.WARN)).not.toThrow();
          expect(() => validateLogLevel(AG_LOGLEVEL.INFO)).not.toThrow();
          expect(() => validateLogLevel(AG_LOGLEVEL.DEBUG)).not.toThrow();
          expect(() => validateLogLevel(AG_LOGLEVEL.TRACE)).not.toThrow();
        });

        it('should accept special log levels', () => {
          expect(() => validateLogLevel(AG_LOGLEVEL.VERBOSE)).not.toThrow();
          expect(() => validateLogLevel(AG_LOGLEVEL.FORCE_OUTPUT)).not.toThrow();
        });

        it('should return the same valid log level value', () => {
          expect(validateLogLevel(AG_LOGLEVEL.INFO)).toBe(AG_LOGLEVEL.INFO);
          expect(validateLogLevel(AG_LOGLEVEL.VERBOSE)).toBe(AG_LOGLEVEL.VERBOSE);
          expect(validateLogLevel(AG_LOGLEVEL.FORCE_OUTPUT)).toBe(AG_LOGLEVEL.FORCE_OUTPUT);
        });
      });

      describe('Invalid type cases', () => {
        it('should throw AgLoggerError for non-number types', () => {
          expect(() => validateLogLevel(undefined as unknown as AgLogLevel)).toThrow(AgLoggerError);
          expect(() => validateLogLevel(null as unknown as AgLogLevel)).toThrow(AgLoggerError);
          expect(() => validateLogLevel('invalid' as unknown as AgLogLevel)).toThrow(AgLoggerError);
          expect(() => validateLogLevel(true as unknown as AgLogLevel)).toThrow(AgLoggerError);
          expect(() => validateLogLevel({} as unknown as AgLogLevel)).toThrow(AgLoggerError);
          expect(() => validateLogLevel([] as unknown as AgLogLevel)).toThrow(AgLoggerError);
        });

        it('should provide descriptive error messages for invalid types', () => {
          expect(() => validateLogLevel(undefined as unknown as AgLogLevel)).toThrow('Invalid log level (undefined)');
          expect(() => validateLogLevel(null as unknown as AgLogLevel)).toThrow('Invalid log level (null)');
          expect(() => validateLogLevel('test' as unknown as AgLogLevel)).toThrow('Invalid log level ("test")');
        });
      });

      describe('Invalid number cases', () => {
        it('should reject out-of-range numbers', () => {
          expect(() => validateLogLevel(7 as unknown as AgLogLevel)).toThrow('Invalid log level (7)');
          expect(() => validateLogLevel(999 as unknown as AgLogLevel)).toThrow('Invalid log level (999)');
          expect(() => validateLogLevel(-1 as unknown as AgLogLevel)).toThrow('Invalid log level (-1)');
          expect(() => validateLogLevel(-100 as unknown as AgLogLevel)).toThrow('Invalid log level (-100)');
        });

        it('should reject decimal numbers', () => {
          expect(() => validateLogLevel(4.5 as unknown as AgLogLevel)).toThrow('Invalid log level (4.5)');
          expect(() => validateLogLevel(-99.1 as unknown as AgLogLevel)).toThrow('Invalid log level (-99.1)');
        });

        it('should reject special numeric values', () => {
          expect(() => validateLogLevel(NaN as unknown as AgLogLevel)).toThrow('Invalid log level (NaN)');
          expect(() => validateLogLevel(Infinity as unknown as AgLogLevel)).toThrow('Invalid log level (Infinity)');
          expect(() => validateLogLevel(-Infinity as unknown as AgLogLevel)).toThrow('Invalid log level (-Infinity)');
        });
      });

      describe('Boundary value tests', () => {
        it('should handle boundary values correctly', () => {
          // Valid boundaries
          expect(validateLogLevel(0)).toBe(AG_LOGLEVEL.OFF);
          expect(validateLogLevel(6)).toBe(AG_LOGLEVEL.TRACE);
          expect(validateLogLevel(-99)).toBe(AG_LOGLEVEL.VERBOSE);
          expect(validateLogLevel(-98)).toBe(AG_LOGLEVEL.FORCE_OUTPUT);
        });

        it('should reject values just outside boundaries', () => {
          expect(() => validateLogLevel(-100 as unknown as AgLogLevel)).toThrow('Invalid log level (-100)');
          expect(() => validateLogLevel(7 as unknown as AgLogLevel)).toThrow('Invalid log level (7)');
          expect(() => validateLogLevel(-1 as unknown as AgLogLevel)).toThrow('Invalid log level (-1)');
        });
      });
    });

    describe('Log Level Assignment Validation', () => {
      it('should validate log level during assignment', () => {
        const logger = AgLogger.createLogger();

        // Valid assignments should work
        expect(() => {
          logger.logLevel = AG_LOGLEVEL.INFO;
        }).not.toThrow();
        expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);

        expect(() => {
          logger.logLevel = AG_LOGLEVEL.VERBOSE;
        }).not.toThrow();
        expect(logger.logLevel).toBe(AG_LOGLEVEL.VERBOSE);
      });

      it('should throw error for invalid log level assignment', () => {
        const logger = AgLogger.createLogger();

        expect(() => {
          logger.logLevel = 999 as AgLogLevel;
        }).toThrow(AgLoggerError);
        expect(() => {
          logger.logLevel = 'invalid' as unknown as AgLogLevel;
        }).toThrow(AgLoggerError);
      });
    });

    describe('Log Level Control Logic', () => {
      it('should control output based on log level hierarchy', () => {
        const logger = AgLogger.createLogger() as TestableAgLogger;

        logger.logLevel = AG_LOGLEVEL.WARN;

        // Should output (level <= WARN)
        expect(logger.shouldOutput(AG_LOGLEVEL.OFF)).toBe(true);
        expect(logger.shouldOutput(AG_LOGLEVEL.FATAL)).toBe(true);
        expect(logger.shouldOutput(AG_LOGLEVEL.ERROR)).toBe(true);
        expect(logger.shouldOutput(AG_LOGLEVEL.WARN)).toBe(true);

        // Should not output (level > WARN)
        expect(logger.shouldOutput(AG_LOGLEVEL.INFO)).toBe(false);
        expect(logger.shouldOutput(AG_LOGLEVEL.DEBUG)).toBe(false);
        expect(logger.shouldOutput(AG_LOGLEVEL.TRACE)).toBe(false);
      });

      it('should handle special level control logic', () => {
        const logger = AgLogger.createLogger() as TestableAgLogger;
        logger.logLevel = AG_LOGLEVEL.OFF;

        // FORCE_OUTPUT should always output
        expect(logger.shouldOutput(AG_LOGLEVEL.FORCE_OUTPUT)).toBe(true);

        // VERBOSE should be controlled by verbose setting
        logger.setVerbose = true;
        expect(logger.shouldOutput(AG_LOGLEVEL.VERBOSE)).toBe(true);

        logger.setVerbose = false;
        expect(logger.shouldOutput(AG_LOGLEVEL.VERBOSE)).toBe(false);
      });
    });
  });
});
