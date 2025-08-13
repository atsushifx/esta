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
import { AgLoggerError } from '../../../shared/types/AgLoggerError.types';

// Test target
import { AgLogger, createLogger } from '../../AgLogger.class';

// Test utilities
const mockLogger = vi.fn();
const mockFormatter = vi.fn().mockImplementation((msg) => msg.message ?? msg);

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
        const logger3 = createLogger();

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
        }).toThrow(AgLoggerError);
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

        expect(testableLogger.shouldOutput(AG_LOGLEVEL.ERROR)).toBe(true);
        expect(testableLogger.shouldOutput(AG_LOGLEVEL.INFO)).toBe(false);
      });
    });

    describe('特殊ログレベル処理', () => {
      it('LOGレベルは常に出力される', () => {
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.OFF;
        logger.setVerbose = DISABLE;

        logger.log('force output message');

        expect(mockLogger).toHaveBeenCalledTimes(1);
      });

      it('VERBOSEレベルのsetLoggerConfigでAgLoggerErrorを投げる', () => {
        const logger = AgLogger.createLogger();

        expect(() => {
          logger.setLoggerConfig({
            logLevel: AG_LOGLEVEL.VERBOSE,
          });
        }).toThrow(AgLoggerError);
      });
    });

    describe('異常系ログレベル処理', () => {
      it('undefinedログレベルでエラーを投げる', () => {
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
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

        logger.setVerbose = ENABLE;
        expect(logger.isVerbose).toBe(ENABLE);

        logger.setVerbose = DISABLE;
        expect(logger.isVerbose).toBe(DISABLE);
      });

      it('verboseメソッドがverbose設定を尊重する', () => {
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: mockFormatter,
        });

        // Verbose disabled - no output
        logger.verbose('test message');
        expect(mockLogger).not.toHaveBeenCalled();

        // Verbose enabled - output expected
        logger.setVerbose = ENABLE;
        logger.verbose('test message');
        expect(mockLogger).toHaveBeenCalledWith('test message');
      });
    });

    describe('verbose機能のエッジケース', () => {
      it('様々な引数タイプでverboseメソッドを処理する', () => {
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: mockFormatter,
        });
        logger.setVerbose = true;

        // Call verbose with different argument types
        // Note: Some arguments like null and undefined might be filtered out
        logger.verbose('string');
        logger.verbose(42);
        logger.verbose({ key: 'value' });
        logger.verbose([1, 2, 3]);

        // Expect at least some calls to have been made
        expect(mockLogger).toHaveBeenCalled();
        expect(mockLogger.mock.calls.length).toBeGreaterThan(0);
      });

      it('高速なverbose状態変更を処理する', () => {
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        for (let i = 0; i < 100; i++) {
          logger.setVerbose = i % 2 === 0;
          logger.verbose(`verbose ${i}`);
        }

        expect(mockLogger).toHaveBeenCalledTimes(50);
      });
    });
  });

  /**
   * Standard Log Methods Tests
   * Tests for standard logging methods (info, warn, error, etc.)
   */
  describe('標準ログメソッド', () => {
    describe('基本的なログ出力', () => {
      const logMethods = [
        { name: 'fatal', level: AG_LOGLEVEL.FATAL },
        { name: 'error', level: AG_LOGLEVEL.ERROR },
        { name: 'warn', level: AG_LOGLEVEL.WARN },
        { name: 'info', level: AG_LOGLEVEL.INFO },
        { name: 'debug', level: AG_LOGLEVEL.DEBUG },
        { name: 'trace', level: AG_LOGLEVEL.TRACE },
      ] as const;

      logMethods.forEach(({ name, level }) => {
        it(`${name}メソッドが正常に動作する`, () => {
          const logger = AgLogger.createLogger({
            defaultLogger: mockLogger,
            formatter: mockFormatter,
          });
          logger.logLevel = level;

          (logger as unknown as Record<string, (...args: unknown[]) => void>)[name]('test message');

          expect(mockLogger).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('ログレベルフィルタリング', () => {
      it('設定レベルより低い優先度のログは出力されない', () => {
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.WARN;

        logger.info('info message');
        logger.debug('debug message');

        expect(mockLogger).not.toHaveBeenCalled();
      });

      it('設定レベル以上の優先度のログは出力される', () => {
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.WARN;

        logger.error('error message');
        logger.warn('warn message');

        expect(mockLogger).toHaveBeenCalledTimes(2);
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

    describe('異常な状態での処理', () => {
      it('invalid verbose stateでもverboseメソッドが例外を投げない', () => {
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: mockFormatter,
        });

        // Force invalid state for edge case testing
        (logger as TestableAgLogger)._isVerbose = null;

        expect(() => logger.verbose('test')).not.toThrow();
      });
    });
  });
});
