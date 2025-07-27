// src/__tests__/AgLogger.spec.ts
// @(#) : Unit tests for AgLogger class
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ログレベル定数 - テストで使用するログレベルの定義
import { AG_LOGLEVEL } from '../../shared/types';
// 型定義 - ログレベル型（現在未使用）
// import type { AgTLogLevel } from '../../shared/types';

// テスト対象 - AgLoggerクラスのメイン実装とgetLogger関数
import { AgLogger, getLogger } from '../AgLogger.class';
// プラグイン - テストで使用するコンソールロガー
import { ConsoleLogger } from '../plugins/logger/ConsoleLogger';

// テスト用モック関数
const mockLogger = vi.fn();
const mockFormatter = vi.fn().mockImplementation((msg) => msg.message ?? msg);

/**
 * AgLoggerクラスの包括的ユニットテストスイート
 *
 * @description AgLoggerクラスの全機能を正常系、異常系、エッジケースに分類して検証
 * シングルトンパターン、ログレベル管理、verbose機能、エラーハンドリングを包括的にテスト
 *
 * @testType Unit Test
 * @testTarget AgLogger Class
 * @coverage
 * - 正常系: 基本機能、設定管理、ログ出力
 * - 異常系: エラー処理、例外時の動作
 * - エッジケース: 境界値、特殊入力、状態遷移
 */
describe('AgLogger', () => {
  /**
   * テスト前の初期化 - モッククリアとシングルトンリセット
   */
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  /**
   * テスト後のクリーンアップ - モッククリアとシングルトンリセット
   */
  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  /**
   * 正常系テスト: 基本機能の動作確認
   *
   * @description AgLoggerの基本機能が正常に動作することを検証
   * シングルトンパターン、ログレベル管理、各種ログメソッドの基本動作をテスト
   */
  describe('正常系: Basic Functionality', () => {
    /**
     * シングルトンパターンのテスト
     *
     * @description インスタンスの一意性とパラメータ処理を検証
     */
    describe('Singleton Pattern', () => {
      it('should return the same instance on multiple calls', () => {
        const instance1 = AgLogger.getLogger();
        const instance2 = AgLogger.getLogger();
        const instance3 = getLogger();

        expect(instance1).toBe(instance2);
        expect(instance2).toBe(instance3);
        expect(instance1).toBeInstanceOf(AgLogger);
      });

      it('should maintain singleton with different parameters', () => {
        const logger1 = AgLogger.getLogger(mockLogger, mockFormatter);
        const logger2 = AgLogger.getLogger();

        expect(logger1).toBe(logger2);
      });

      it('should reset singleton correctly', () => {
        const instance1 = AgLogger.getLogger();
        AgLogger.resetSingleton();
        const instance2 = AgLogger.getLogger();

        expect(instance1).not.toBe(instance2);
      });
    });

    /**
     * ログレベル管理のテスト
     *
     * @description ログレベルの設定、取得、フィルタリング機能を検証
     */
    describe('Log Level Management', () => {
      it('should set and get log level correctly', () => {
        const logger = AgLogger.getLogger();

        expect(logger.setLogLevel(AG_LOGLEVEL.DEBUG)).toBe(AG_LOGLEVEL.DEBUG);
        expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.DEBUG);

        expect(logger.setLogLevel(AG_LOGLEVEL.ERROR)).toBe(AG_LOGLEVEL.ERROR);
        expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.ERROR);
      });

      it('should filter logs based on current level', () => {
        const logger = AgLogger.getLogger(mockLogger, mockFormatter);
        logger.setLogLevel(AG_LOGLEVEL.WARN);

        logger.debug('debug'); // filtered
        logger.info('info'); // filtered
        logger.warn('warn'); // logged
        logger.error('error'); // logged
        logger.fatal('fatal'); // logged

        expect(mockLogger).toHaveBeenCalledTimes(3);
      });

      it('should block all logs when level is OFF', () => {
        const logger = AgLogger.getLogger(mockLogger, mockFormatter);
        logger.setLogLevel(AG_LOGLEVEL.OFF);

        logger.fatal('fatal');
        logger.error('error');
        logger.warn('warn');
        logger.info('info');
        logger.debug('debug');
        logger.trace('trace');

        expect(mockLogger).not.toHaveBeenCalled();
      });
    });

    /**
     * ログメソッドのテスト
     *
     * @description 各ログレベルメソッドの基本動作を検証
     */
    describe('Log Methods', () => {
      it('should call all log level methods correctly', () => {
        const logger = AgLogger.getLogger(mockLogger, mockFormatter);
        logger.setLogLevel(AG_LOGLEVEL.TRACE);

        logger.fatal('fatal message');
        logger.error('error message');
        logger.warn('warn message');
        logger.info('info message');
        logger.debug('debug message');
        logger.trace('trace message');
        logger.log('log message'); // maps to INFO

        expect(mockLogger).toHaveBeenCalledTimes(7);
      });

      it('should handle multiple arguments in log methods', () => {
        const logger = AgLogger.getLogger(mockLogger, mockFormatter);
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        const testObj = { key: 'value' };
        logger.info('message', testObj, 123, true);

        expect(mockLogger).toHaveBeenCalledTimes(1);
        expect(mockFormatter).toHaveBeenCalled();
      });
    });

    /**
     * getLogger関数のテスト
     *
     * @description getLogger便利関数の動作を検証
     */
    describe('getLogger Function', () => {
      it('should auto-assign ConsoleLoggerMap when using ConsoleLogger', () => {
        const logger = getLogger(ConsoleLogger);
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        // ConsoleLoggerMapが自動適用されることを間接的に確認
        expect(logger).toBeInstanceOf(AgLogger);
      });

      it('should work with custom logger and formatter', () => {
        const logger = getLogger(mockLogger, mockFormatter);
        logger.setLogLevel(AG_LOGLEVEL.INFO);
        logger.info('test');

        expect(mockLogger).toHaveBeenCalled();
        expect(mockFormatter).toHaveBeenCalled();
      });
    });
  });

  /**
   * 正常系テスト: Verbose機能
   *
   * @description verbose機能の設定と動作を検証
   */
  describe('Verbose Functionality', () => {
    it('should manage verbose state correctly', () => {
      const logger = AgLogger.getLogger();

      // デフォルトはfalse
      expect(logger.setVerbose()).toBe(false);

      // trueに設定
      expect(logger.setVerbose(true)).toBe(true);
      expect(logger.setVerbose()).toBe(true);

      // falseに戻す
      expect(logger.setVerbose(false)).toBe(false);
    });

    it('should control verbose output correctly', () => {
      const logger = AgLogger.getLogger(mockLogger, mockFormatter);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      // verbose off - no output
      logger.setVerbose(false);
      logger.verbose('verbose off');
      expect(mockLogger).not.toHaveBeenCalled();

      // verbose on - output
      logger.setVerbose(true);
      logger.verbose('verbose on');
      expect(mockLogger).toHaveBeenCalledTimes(1);
    });

    it('should not affect other log levels', () => {
      const logger = AgLogger.getLogger(mockLogger, mockFormatter);
      logger.setLogLevel(AG_LOGLEVEL.TRACE);
      logger.setVerbose(false);

      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      expect(mockLogger).toHaveBeenCalledTimes(3);
    });
  });

  /**
   * 異常系テスト: エラー処理
   *
   * @description エラー状況での動作を検証
   */
  describe('異常系: Error Handling', () => {
    it('should handle logger function throwing errors', () => {
      const throwingLogger = vi.fn(() => {
        throw new Error('Logger error');
      });
      const logger = AgLogger.getLogger(throwingLogger, mockFormatter);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      expect(() => logger.info('test')).toThrow('Logger error');
    });

    it('should handle formatter function throwing errors', () => {
      const throwingFormatter = vi.fn(() => {
        throw new Error('Formatter error');
      });
      const logger = AgLogger.getLogger(mockLogger, throwingFormatter);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      expect(() => logger.info('test')).toThrow('Formatter error');
    });

    it('should not log when formatter returns empty string', () => {
      const emptyFormatter = vi.fn().mockReturnValue('');
      const logger = AgLogger.getLogger(mockLogger, emptyFormatter);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      logger.info('test message');

      expect(emptyFormatter).toHaveBeenCalled();
      expect(mockLogger).not.toHaveBeenCalled();
    });
  });

  /**
   * エッジケース: 境界値と特殊条件
   *
   * @description 境界値や特殊な入力での動作を検証
   */
  describe('エッジケース: Edge Cases', () => {
    it('should handle undefined and null arguments', () => {
      const logger = AgLogger.getLogger(mockLogger, mockFormatter);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      logger.info(undefined);
      logger.info(null);
      logger.info('message', undefined, null);

      expect(mockLogger).toHaveBeenCalledTimes(3);
    });

    it('should handle empty arguments', () => {
      const logger = AgLogger.getLogger(mockLogger, mockFormatter);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      logger.info();
      logger.warn();
      logger.error();

      expect(mockLogger).toHaveBeenCalledTimes(3);
    });

    it('should handle boundary log levels correctly', () => {
      const logger = AgLogger.getLogger(mockLogger, mockFormatter);

      // 最低レベル (FATAL only)
      logger.setLogLevel(AG_LOGLEVEL.FATAL);
      logger.fatal('fatal');
      logger.error('error'); // filtered
      expect(mockLogger).toHaveBeenCalledTimes(1);

      vi.clearAllMocks();

      // 最高レベル (ALL)
      logger.setLogLevel(AG_LOGLEVEL.TRACE);
      logger.trace('trace');
      logger.debug('debug');
      logger.info('info');
      expect(mockLogger).toHaveBeenCalledTimes(3);
    });

    it('should persist settings across instances', () => {
      const logger1 = AgLogger.getLogger();
      const logger2 = AgLogger.getLogger();

      logger1.setLogLevel(AG_LOGLEVEL.ERROR);
      logger1.setVerbose(true);

      expect(logger2.getLogLevel()).toBe(AG_LOGLEVEL.ERROR);
      expect(logger2.setVerbose()).toBe(true);
    });

    it('should handle ConsoleLogger auto-configuration', () => {
      // getLogger with ConsoleLogger should auto-assign ConsoleLoggerMap
      const logger1 = getLogger(ConsoleLogger);
      expect(logger1).toBeInstanceOf(AgLogger);

      // setLogger with ConsoleLogger should auto-assign ConsoleLoggerMap
      const logger2 = AgLogger.getLogger();
      logger2.setLogger({ defaultLogger: ConsoleLogger });
      expect(logger2).toBeInstanceOf(AgLogger);
    });
  });
});
