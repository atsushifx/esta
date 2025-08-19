// src/__tests__/aglogger-consolidated/AgLogger.spec.ts
// @(#) : Consolidated unit tests for AgLogger class following atsushifx式BDD
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Constants and Types
import { DISABLE, ENABLE } from '../../../shared/constants/common.constants';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogLevel } from '../../../shared/types';

// Test target
import { AgLogger } from '../../AgLogger.class';

// Test utilities
import { MockFormatter } from '../../plugins/formatter/MockFormatter';
import { MockLogger } from '../../plugins/logger/MockLogger';

const mockFormatter = MockFormatter.passthrough;

// Type for testing protected methods
type TestableAgLogger = AgLogger & {
  executeLog: (level: AgLogLevel, ...args: unknown[]) => void;
  shouldOutput: (level: AgLogLevel) => boolean;
  _isVerbose: boolean | null;
};

/**
 * Common test setup and cleanup
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
 * AgLogger Consolidated Unit Test Suite
 *
 * @description Comprehensive BDD-structured tests for AgLogger class
 * Organized by behavioral domains with maximum 3-level describe hierarchy
 */
describe('AgLogger', () => {
  setupTestEnvironment();

  /**
   * Instance Management Tests
   * Tests for singleton pattern and instance lifecycle
   */
  describe('インスタンス管理', () => {
    describe('シングルトンパターンによる生成管理', () => {
      it('createLoggerで新規インスタンスを生成できる', () => {
        const logger = AgLogger.createLogger();
        expect(logger).toBeInstanceOf(AgLogger);
      });

      it('複数回のcreateLogger呼び出しで同一インスタンスを返す', () => {
        const logger1 = AgLogger.createLogger();
        const logger2 = AgLogger.createLogger();
        const logger3 = AgLogger.createLogger();

        expect(logger1).toBe(logger2);
        expect(logger2).toBe(logger3);
      });

      it('getLoggerで既存インスタンスを取得できる', () => {
        const created = AgLogger.createLogger();
        const retrieved = AgLogger.getLogger();

        expect(created).toBe(retrieved);
      });
    });

    describe('インスタンス初期化時の異常系', () => {
      it('VERBOSEレベルを指定した場合にAgLoggerErrorを投げる', () => {
        expect(() => {
          AgLogger.createLogger({
            logLevel: AG_LOGLEVEL.VERBOSE,
          });
        }).toThrow('Special log levels cannot be set as default log level');
      });
    });
  });

  /**
   * Log Level Management Tests
   * Tests for log level validation and control
   */
  describe('ログレベル管理', () => {
    describe('標準ログレベル処理', () => {
      it('logLevelプロパティで現在のレベルを取得できる', () => {
        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;
        expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
      });

      it('shouldOutputメソッドがログレベルを正しく判定する', () => {
        const logger = AgLogger.createLogger();
        const testableLogger = logger as TestableAgLogger;
        logger.logLevel = AG_LOGLEVEL.WARN;

        const shouldOutputTests = [
          { level: AG_LOGLEVEL.ERROR, expected: true },
          { level: AG_LOGLEVEL.INFO, expected: false },
        ] as const;

        shouldOutputTests.forEach(({ level, expected }) => {
          expect(testableLogger.shouldOutput(level)).toBe(expected);
        });
      });
    });

    describe('特殊ログレベル処理', () => {
      it('LOGレベルは常に出力される', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.log,
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.OFF;
        logger.setVerbose = DISABLE;

        logger.log('force output message');

        expect(mockLogger.getMessageCount(AG_LOGLEVEL.LOG)).toBe(1);
      });

      it('VERBOSEレベルのsetLoggerConfigでAgLoggerErrorを投げる', () => {
        const logger = AgLogger.createLogger();

        expect(() => {
          logger.setLoggerConfig({
            logLevel: AG_LOGLEVEL.VERBOSE,
          });
        }).toThrow('Special log levels cannot be set as default log level');
      });
    });

    describe('異常系ログレベル処理', () => {
      it('undefinedログレベルでエラーを投げる', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.info.bind(mockLogger),
          formatter: mockFormatter,
        });
        const testableLogger = logger as TestableAgLogger;

        expect(() => {
          testableLogger.executeLog(undefined as unknown as AgLogLevel, 'test message');
        }).toThrow('Invalid log level (undefined)');
      });
    });
  });

  /**
   * Verbose Functionality Tests
   * Tests for verbose mode behavior
   */
  describe('Verbose機能', () => {
    describe('基本的なverbose制御', () => {
      it('デフォルトでverboseが無効である', () => {
        const logger = AgLogger.createLogger();
        expect(logger.isVerbose).toBe(DISABLE);
      });

      it('setVerboseでverbose状態を制御できる', () => {
        const logger = AgLogger.createLogger();

        const verboseTests = [
          { setValue: ENABLE, expected: ENABLE },
          { setValue: DISABLE, expected: DISABLE },
        ] as const;

        verboseTests.forEach(({ setValue, expected }) => {
          logger.setVerbose = setValue;
          expect(logger.isVerbose).toBe(expected);
        });
      });

      it('verboseメソッドがverbose設定を尊重する', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.verbose.bind(mockLogger),
          formatter: mockFormatter,
        });

        // Verbose disabled - no output
        logger.verbose('test message');
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(0);

        // Verbose enabled - output expected
        logger.setVerbose = ENABLE;
        logger.verbose('test message');
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(1);
      });
    });

    describe('verbose機能のエッジケース', () => {
      it('様々な引数タイプでverboseメソッドを処理する', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.verbose.bind(mockLogger),
          formatter: mockFormatter,
        });
        logger.setVerbose = true;

        // Test different argument types with functional approach
        const testArgs = [
          'string',
          42,
          { key: 'value' },
          [1, 2, 3],
        ] as const;

        testArgs.forEach((arg) => {
          logger.verbose(arg);
        });

        // Expect at least some calls to have been made

        expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(4); // count testArgs
      });

      it('高速なverbose状態変更を処理する', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.verbose.bind(mockLogger),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        Array.from({ length: 100 }, (_, i) => i).forEach((i) => {
          logger.setVerbose = i % 2 === 0;
          logger.verbose(`verbose ${i}`);
        });

        expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(50);
      });
    });
  });

  /**
   * Standard Log Methods Tests
   * Tests for standard logging methods (info, warn, error, etc.)
   */
  describe('標準ログメソッド', () => {
    describe('基本的なログ出力', () => {
      const mockLogger = new MockLogger.buffer();
      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.info.bind(mockLogger),
        formatter: mockFormatter,
        loggerMap: {
          [AG_LOGLEVEL.FATAL]: mockLogger.fatal.bind(mockLogger),
          [AG_LOGLEVEL.ERROR]: mockLogger.error.bind(mockLogger),
          [AG_LOGLEVEL.WARN]: mockLogger.warn.bind(mockLogger),
          [AG_LOGLEVEL.INFO]: mockLogger.info.bind(mockLogger),
          [AG_LOGLEVEL.DEBUG]: mockLogger.debug.bind(mockLogger),
          [AG_LOGLEVEL.TRACE]: mockLogger.trace.bind(mockLogger),
        },
      });

      const logMethods = [
        { name: 'fatal', level: AG_LOGLEVEL.FATAL, method: logger.fatal.bind(logger) },
        { name: 'error', level: AG_LOGLEVEL.ERROR, method: logger.error.bind(logger) },
        { name: 'warn', level: AG_LOGLEVEL.WARN, method: logger.warn.bind(logger) },
        { name: 'info', level: AG_LOGLEVEL.INFO, method: logger.info.bind(logger) },
        { name: 'debug', level: AG_LOGLEVEL.DEBUG, method: logger.debug.bind(logger) },
        { name: 'trace', level: AG_LOGLEVEL.TRACE, method: logger.trace.bind(logger) },
      ] as const;

      logMethods.forEach(({ name, level, method }) => {
        it(`${name}メソッドが正常に動作する`, () => {
          logger.logLevel = level;
          mockLogger.clearAllMessages();

          method('test message');

          expect(mockLogger.getMessageCount(level)).toBe(1);
        });
      });
    });

    describe('ログレベルフィルタリング', () => {
      it('設定レベルより低い優先度のログは出力されない', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.info.bind(mockLogger),
          formatter: mockFormatter,
          loggerMap: {
            [AG_LOGLEVEL.INFO]: mockLogger.info.bind(mockLogger),
            [AG_LOGLEVEL.DEBUG]: mockLogger.debug.bind(mockLogger),
          },
        });
        logger.logLevel = AG_LOGLEVEL.WARN;

        const lowerPriorityMethods = [
          { method: logger.info.bind(logger), message: 'info message', level: AG_LOGLEVEL.INFO },
          { method: logger.debug.bind(logger), message: 'debug message', level: AG_LOGLEVEL.DEBUG },
        ] as const;

        lowerPriorityMethods.forEach(({ method, message }) => {
          method(message);
        });

        expect(mockLogger.getTotalMessageCount()).toBe(0);
      });

      it('設定レベル以上の優先度のログは出力される', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.warn.bind(mockLogger),
          formatter: mockFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: mockLogger.error.bind(mockLogger),
            [AG_LOGLEVEL.WARN]: mockLogger.warn.bind(mockLogger),
          },
        });
        logger.logLevel = AG_LOGLEVEL.WARN;

        const higherPriorityMethods = [
          { method: logger.error.bind(logger), message: 'error message', level: AG_LOGLEVEL.ERROR },
          { method: logger.warn.bind(logger), message: 'warn message', level: AG_LOGLEVEL.WARN },
        ] as const;

        higherPriorityMethods.forEach(({ method, message }) => {
          method(message);
        });

        expect(mockLogger.getTotalMessageCount()).toBe(2);
      });
    });
  });

  /**
   * Validation Tests
   * Tests for input validation and error handling
   */
  describe('バリデーション機能', () => {
    describe('設定バリデーション', () => {
      it('setVerboseセッターが存在して動作する', () => {
        const logger = AgLogger.createLogger();
        logger.setVerbose = true;
        expect(logger.isVerbose).toBe(true);
      });
    });

    describe('ロガー関数設定', () => {
      it('should successfully set logger function for valid log level', () => {
        const logger = AgLogger.createLogger();
        const customLogger = vi.fn();

        const result = logger.setLoggerFunction(AG_LOGLEVEL.INFO, customLogger);

        expect(result).toBe(true);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(customLogger);
      });

      it('should throw error when setting logger function with invalid log level', () => {
        const logger = AgLogger.createLogger();
        const customLogger = vi.fn();

        expect(() => {
          logger.setLoggerFunction('invalid' as unknown as AgLogLevel, customLogger);
        }).toThrow('Invalid log level');
      });

      it('should update logger map when setLoggerFunction is called', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.error.bind(mockLogger),
          formatter: mockFormatter,
        });
        const customLogger = vi.fn();

        // Set log level to allow ERROR messages
        logger.logLevel = AG_LOGLEVEL.ERROR;
        logger.setLoggerFunction(AG_LOGLEVEL.ERROR, customLogger);

        // Verify the function was set by checking if it gets called
        logger.error('test message');
        expect(customLogger).toHaveBeenCalledOnce();
      });
    });
  });
});
