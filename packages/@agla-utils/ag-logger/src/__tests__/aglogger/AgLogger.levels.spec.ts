// src/__tests__/aglogger/AgLogger.levels.spec.ts
// @(#) : Log level management and filtering tests for AgLogger
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DISABLE, ENABLE } from '../../../shared/constants/common.constants';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogLevel } from '../../../shared/types';

// Test target
import { AgLogger } from '../../AgLogger.class';

// Test utilities
const mockLogger = vi.fn();
const mockFormatter = vi.fn().mockImplementation((msg) => msg.message ?? msg);

type TestableAgLogger = AgLogger & {
  shouldOutput: (level: AgLogLevel) => boolean;
};

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
 * Log Level Management Tests
 *
 * @description ログレベル設定、フィルタリング、出力制御のテスト
 */
/**
 * AgLogger ログレベル管理ユニットテスト
 * @description フィルタリング/特別レベル/パフォーマンスの検証
 */
describe('AgLogger Log Level Management', () => {
  setupTestEnvironment();

  describe('Log Level Filtering', () => {
    it('should filter logs based on current level', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.WARN;

      logger.debug('debug'); // filtered
      logger.info('info'); // filtered
      logger.warn('warn'); // logged
      logger.error('error'); // logged
      logger.fatal('fatal'); // logged

      expect(mockLogger).toHaveBeenCalledTimes(3);
    });

    it('should block all logs when level is OFF', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.OFF;

      logger.fatal('fatal');
      logger.error('error');
      logger.warn('warn');
      logger.info('info');
      logger.debug('debug');
      logger.trace('trace');

      expect(mockLogger).not.toHaveBeenCalled();
    });

    it('should handle boundary log levels correctly', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });

      // 最低レベル (FATAL only)
      logger.logLevel = AG_LOGLEVEL.FATAL;
      logger.fatal('fatal');
      logger.error('error'); // filtered
      expect(mockLogger).toHaveBeenCalledTimes(1);

      vi.clearAllMocks();

      // 最高レベル (ALL)
      logger.logLevel = AG_LOGLEVEL.TRACE;
      logger.trace('trace');
      logger.debug('debug');
      logger.info('info');
      expect(mockLogger).toHaveBeenCalledTimes(3);
    });
  });

  describe('shouldOutput Method Behavior', () => {
    it('should return true when log level ERROR is at INFO threshold', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;
      const loggerForTesting = logger as TestableAgLogger;

      const result = loggerForTesting.shouldOutput(AG_LOGLEVEL.ERROR);

      expect(result).toBe(ENABLE);
    });

    it('should return false when log level DEBUG is above INFO threshold', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;
      const loggerForTesting = logger as TestableAgLogger;

      const result = loggerForTesting.shouldOutput(AG_LOGLEVEL.DEBUG);

      expect(result).toBe(DISABLE);
    });

    it('should return false when log level is OFF regardless of message level', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.OFF;
      const loggerForTesting = logger as TestableAgLogger;

      const result = loggerForTesting.shouldOutput(AG_LOGLEVEL.ERROR);

      expect(result).toBe(DISABLE);
    });

    it('should return true for VERBOSE level when verbose flag is enabled', () => {
      const logger = AgLogger.createLogger();
      logger.setVerbose = ENABLE;
      const loggerForTesting = logger as TestableAgLogger;

      const result = loggerForTesting.shouldOutput(AG_LOGLEVEL.VERBOSE);

      expect(result).toBe(ENABLE);
    });

    it('should return false for VERBOSE level when verbose flag is disabled', () => {
      const logger = AgLogger.createLogger();
      logger.setVerbose = DISABLE;
      const loggerForTesting = logger as TestableAgLogger;

      const result = loggerForTesting.shouldOutput(AG_LOGLEVEL.VERBOSE);

      expect(result).toBe(DISABLE);
    });

    it('should return true for VERBOSE level when verbose flag is enabled even with OFF log level', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.OFF;
      logger.setVerbose = ENABLE;
      const loggerForTesting = logger as TestableAgLogger;

      const result = loggerForTesting.shouldOutput(AG_LOGLEVEL.VERBOSE);

      expect(result).toBe(ENABLE);
    });
  });

  describe('LOG Special Behavior', () => {
    it('should output LOG regardless of logLevel and verbose settings', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.OFF;
      logger.setVerbose = DISABLE;

      logger.log('force output message');

      expect(mockLogger).toHaveBeenCalledTimes(1);
    });
  });

  describe('Level Change Performance', () => {
    it('should handle rapid log level changes', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });

      // 高速なレベル変更
      for (let i = 0; i < 100; i++) {
        const level = i % 2 === 0 ? AG_LOGLEVEL.INFO : AG_LOGLEVEL.ERROR;
        logger.logLevel = level;
        logger.info('test');
      }

      expect(mockLogger).toHaveBeenCalledTimes(50); // INFO レベルの時のみ
    });
  });
});
