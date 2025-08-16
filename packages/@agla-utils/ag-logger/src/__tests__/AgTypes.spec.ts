// src/__tests__/types-consolidated/AgTypes.spec.ts
// @(#) : Consolidated type tests following atsushifx式BDD
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../shared/types';
import type { AgFormatFunction, AgLoggerOptions, AgLogLevel, AgLogMessage } from '../../shared/types';
import type { AglaError } from '../../shared/types';
import { AgLoggerError } from '../../shared/types';

/**
 * AgLogger Type System Consolidated Test Suite
 *
 * @description Comprehensive tests for all type definitions and interfaces
 * Organized by type category with behavioral testing
 */
describe('AgLogger Type System', () => {
  /**
   * AgLogLevel Type Tests
   * Tests for log level enum and type definitions
   */
  describe('AgLogLevel: Log level type system', () => {
    describe('列挙値の定義', () => {
      it('should have all expected log level values', () => {
        const expectedLogLevels = [
          { level: AG_LOGLEVEL.OFF, expected: 0 },
          { level: AG_LOGLEVEL.FATAL, expected: 1 },
          { level: AG_LOGLEVEL.ERROR, expected: 2 },
          { level: AG_LOGLEVEL.WARN, expected: 3 },
          { level: AG_LOGLEVEL.INFO, expected: 4 },
          { level: AG_LOGLEVEL.DEBUG, expected: 5 },
          { level: AG_LOGLEVEL.TRACE, expected: 6 },
        ] as const;

        expectedLogLevels.forEach(({ level, expected }) => {
          expect(level).toBe(expected);
        });
      });

      it('should have special log level values', () => {
        expect(AG_LOGLEVEL.VERBOSE).toBe(-11);
        expect(AG_LOGLEVEL.LOG).toBe(-12);
        expect(AG_LOGLEVEL.DEFAULT).toBe(-99);
      });

      it('should maintain proper log level hierarchy', () => {
        const hierarchyTests = [
          { lower: AG_LOGLEVEL.FATAL, higher: AG_LOGLEVEL.ERROR },
          { lower: AG_LOGLEVEL.ERROR, higher: AG_LOGLEVEL.WARN },
          { lower: AG_LOGLEVEL.WARN, higher: AG_LOGLEVEL.INFO },
          { lower: AG_LOGLEVEL.INFO, higher: AG_LOGLEVEL.DEBUG },
          { lower: AG_LOGLEVEL.DEBUG, higher: AG_LOGLEVEL.TRACE },
        ] as const;

        hierarchyTests.forEach(({ lower, higher }) => {
          expect(lower).toBeLessThan(higher);
        });
      });
    });

    describe('型の互換性', () => {
      it('should accept valid AgLogLevel values', () => {
        const validLevels: AgLogLevel[] = [
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
          expect(typeof level).toBe('number');
        });
      });
    });
  });

  /**
   * AgLogMessage Type Tests
   * Tests for log message structure and properties
   */
  describe('AgLogMessage: Log message type system', () => {
    describe('メッセージ構造の検証', () => {
      it('should create valid AgLogMessage with required properties', () => {
        const logMessage: AgLogMessage = {
          message: 'test message',
          logLevel: AG_LOGLEVEL.INFO,
          timestamp: new Date(),
          args: [],
        };

        expect(logMessage.message).toBe('test message');
        expect(logMessage.logLevel).toBe(AG_LOGLEVEL.INFO);
        expect(logMessage.timestamp).toBeInstanceOf(Date);
      });

      it('should handle empty message', () => {
        const logMessage: AgLogMessage = {
          message: '',
          logLevel: AG_LOGLEVEL.ERROR,
          timestamp: new Date(),
          args: [],
        };

        expect(logMessage.message).toBe('');
        expect(typeof logMessage.message).toBe('string');
      });

      it('should handle all log levels in message', () => {
        const levels = [
          AG_LOGLEVEL.OFF,
          AG_LOGLEVEL.FATAL,
          AG_LOGLEVEL.ERROR,
          AG_LOGLEVEL.WARN,
          AG_LOGLEVEL.INFO,
          AG_LOGLEVEL.DEBUG,
          AG_LOGLEVEL.TRACE,
        ];

        levels.forEach((level) => {
          const message: AgLogMessage = {
            message: `test for level ${level}`,
            logLevel: level,
            timestamp: new Date(),
            args: [],
          };
          expect(message.logLevel).toBe(level);
        });
      });
    });
  });

  /**
   * AgLoggerOptions Type Tests
   * Tests for logger configuration options
   */
  describe('AgLoggerOptions: Configuration options type system', () => {
    describe('オプション構造の検証', () => {
      it('should accept minimal valid options', () => {
        const options: AgLoggerOptions = {};
        expect(typeof options).toBe('object');
      });

      it('should accept full options configuration', () => {
        const mockLogger = (): void => {};
        const mockFormatter = (msg: AgLogMessage): string => msg.message;

        const options: AgLoggerOptions = {
          logLevel: AG_LOGLEVEL.DEBUG,
          defaultLogger: mockLogger,
          formatter: mockFormatter,
        };

        expect(options.logLevel).toBe(AG_LOGLEVEL.DEBUG);
        expect(typeof options.defaultLogger).toBe('function');
        expect(typeof options.formatter).toBe('function');
      });

      it('should handle partial options', () => {
        const options1: AgLoggerOptions = {
          logLevel: AG_LOGLEVEL.WARN,
        };

        const options2: AgLoggerOptions = {
          defaultLogger: (): void => {},
        };

        const options3: AgLoggerOptions = {
          formatter: (msg: AgLogMessage): string => msg.message,
        };

        expect(options1.logLevel).toBe(AG_LOGLEVEL.WARN);
        expect(typeof options2.defaultLogger).toBe('function');
        expect(typeof options3.formatter).toBe('function');
      });
    });
  });

  /**
   * AgLoggerError Type Tests
   * Tests for error handling types
   */
  describe('AgLoggerError: Error handling type system', () => {
    describe('エラー構造の検証', () => {
      it('should create AgLoggerError with required properties', () => {
        const error = new AgLoggerError('VALIDATION', 'Test error');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AgLoggerError);
        expect(error.message).toBe('Test error');
        expect(error.errorType).toBe('VALIDATION');
        expect(error.name).toBe('AgLoggerError');
      });

      it('should inherit from Error properly', () => {
        const error = new AgLoggerError('VALIDATION', 'Test error');

        expect(error.stack).toBeDefined();
        expect(typeof error.stack).toBe('string');
      });

      it('should handle different error types', () => {
        const errorTypes = ['VALIDATION', 'CONFIG', 'INITIALIZATION'];

        errorTypes.forEach((errorType) => {
          const error = new AgLoggerError(
            errorType as 'VALIDATION' | 'CONFIG' | 'INITIALIZATION',
            `Error: ${errorType}`,
          );
          expect(error.errorType).toBe(errorType);
          expect(error.message).toBe(`Error: ${errorType}`);
        });
      });
    });
  });

  /**
   * AgError Base Type Tests
   * Tests for base error interface
   */
  describe('AgError: Base error interface', () => {
    describe('基本エラーインターフェースの検証', () => {
      it('should define proper error structure', () => {
        const error: AglaError = {
          message: 'Base error message',
          errorType: 'VALIDATION',
          name: 'BaseError',
        };

        expect(error.message).toBe('Base error message');
        expect(error.errorType).toBe('VALIDATION');
        expect(error.name).toBe('BaseError');
      });

      it('should be compatible with AgLoggerError', () => {
        const agLoggerError = new AgLoggerError('RESOURCE', 'Logger error');
        const agError: AglaError = agLoggerError;

        expect(agError.message).toBe('Logger error');
        expect(agError.errorType).toBe('RESOURCE');
        expect(agError.name).toBe('AgLoggerError');
      });
    });
  });

  /**
   * Type Integration Tests
   * Tests for type interoperability and integration
   */
  describe('型統合テスト', () => {
    describe('型の相互運用性', () => {
      it('should work together in realistic scenarios', () => {
        const logLevel: AgLogLevel = AG_LOGLEVEL.INFO;

        const message: AgLogMessage = {
          message: 'Integration test message',
          logLevel: logLevel,
          timestamp: new Date(),
          args: [],
        };

        const options: AgLoggerOptions = {
          logLevel,
          defaultLogger: (): void => {},
          formatter: (msg: AgLogMessage): string => `[${msg.logLevel}] ${msg.message}`,
        };

        expect(message.logLevel).toBe(options.logLevel);
        expect((options.formatter as AgFormatFunction)(message)).toBe(`[${AG_LOGLEVEL.INFO}] Integration test message`);
      });

      it('should handle error scenarios with proper typing', () => {
        const createTypedError = (level: unknown): AgLoggerError | null => {
          if (typeof level !== 'number') {
            return new AgLoggerError('VALIDATION', `Invalid log level: ${String(level)}`);
          }
          return null;
        };

        const error = createTypedError('invalid');
        expect(error).toBeInstanceOf(AgLoggerError);
        expect(error?.errorType).toBe('VALIDATION');

        const noError = createTypedError(AG_LOGLEVEL.INFO);
        expect(noError).toBeNull();
      });
    });
  });
});
