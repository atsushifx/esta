// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// src/__tests__/AgLogger.spec.ts
// @(#) : Unit tests for AgLogger class
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// constants
import { DISABLE, ENABLE } from '../../shared/constants/common.constants';

// ログレベル定数 - テストで使用するログレベルの定義
import { AG_LOGLEVEL } from '../../shared/types';
// 型定義 - ログレベル型とオプション型
import type { AgLogLevel } from '../../shared/types';

// テスト対象 - AgLoggerクラスのメイン実装とgetLogger関数
import { AgLogger, createLogger } from '../AgLogger.class';
// プラグイン - テストで使用するコンソールロガー
import { ConsoleLogger } from '../plugins/logger/ConsoleLogger';

// テスト用モック関数
const mockLogger = vi.fn();
const mockFormatter = vi.fn().mockImplementation((msg) => msg.message ?? msg);

type TestableAgLogger = AgLogger & {
  shouldOutput(level: AgLogLevel): boolean;
  executeLog(level: AgLogLevel, msg: string): void;
};

/**
 * AgLoggerクラスの包括的ユニットテストスイート
 *
 * @description 振る舞い駆動開発(BDD)に基づくテスト構造
 * 各機能の振る舞い、目的、段階を明確に分離して検証
 *
 * @testType Unit Test
 * @testTarget AgLogger Class
 * @structure
 * - 振る舞い別トップレベル構造
 *   - インスタンス生成と管理
 *   - ログレベル制御
 *   - ログメッセージ出力
 *   - 設定管理
 *   - エラーハンドリング
 */

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
 * インスタンス生成と管理の振る舞い
 *
 * @description AgLoggerのインスタンス生成、シングルトン管理、ライフサイクル制御
 */
describe('AgLogger インスタンス生成と管理', () => {
  setupTestEnvironment();

  describe('シングルトンパターンによるインスタンス管理', () => {
    describe('createLoggerでのインスタンス生成', () => {
      it('should create logger instance via static method', () => {
        const logger = AgLogger.createLogger();
        expect(logger).toBeInstanceOf(AgLogger);
      });

      it('should create logger instance via standalone function', () => {
        const logger = createLogger();
        expect(logger).toBeInstanceOf(AgLogger);
      });

      it('should return same instance on multiple createLogger calls', () => {
        const logger1 = AgLogger.createLogger();
        const logger2 = AgLogger.createLogger();
        const logger3 = createLogger();

        expect(logger1).toBe(logger2);
        expect(logger2).toBe(logger3);
      });

      it('should maintain singleton with different parameters', () => {
        const logger1 = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        const logger2 = AgLogger.createLogger();

        expect(logger1).toBe(logger2);
      });
    });

    describe('getLoggerでのインスタンス取得', () => {
      it('should have getLogger static method', () => {
        expect(typeof AgLogger.getLogger).toBe('function');
      });

      it('should return existing instance when available', () => {
        const created = AgLogger.createLogger();
        const retrieved = AgLogger.getLogger();

        expect(created).toBe(retrieved);
      });

      it('should throw error when no instance exists', () => {
        AgLogger.resetSingleton();
        expect(() => AgLogger.getLogger()).toThrow('Logger instance not created. Call createLogger() first.');
      });
    });

    describe('シングルトンリセット', () => {
      it('should create new instance after reset', () => {
        const instance1 = AgLogger.createLogger();
        AgLogger.resetSingleton();
        const instance2 = AgLogger.createLogger();

        expect(instance1).not.toBe(instance2);
      });
    });
  });

  describe('インスタンス初期化オプション処理', () => {
    it('should handle undefined options gracefully', () => {
      const logger = AgLogger.createLogger(undefined);
      expect(logger).toBeInstanceOf(AgLogger);
    });

    it('should handle empty options object', () => {
      const logger = AgLogger.createLogger({});
      expect(logger).toBeInstanceOf(AgLogger);
    });

    it('should handle null options with descriptive error', () => {
      expect(() => {
        // @ts-expect-error: Testing invalid null input
        createLogger(null);
      }).toThrow('Cannot read properties of null');
    });
  });
});

/**
 * ログレベル制御の振る舞い
 *
 * @description ログレベル設定によるメッセージフィルタリング、レベル変更、境界値処理
 */
describe('AgLogger ログレベル制御', () => {
  setupTestEnvironment();

  describe('ログレベル設定とフィルタリング', () => {
    describe('基本的なログレベル操作', () => {
      it('should set and get log level correctly', () => {
        const logger = AgLogger.createLogger();

        logger.logLevel = AG_LOGLEVEL.DEBUG;
        expect(logger.logLevel).toBe(AG_LOGLEVEL.DEBUG);

        logger.logLevel = AG_LOGLEVEL.ERROR;
        expect(logger.logLevel).toBe(AG_LOGLEVEL.ERROR);
      });

      it('should use OFF as default log level', () => {
        const logger = AgLogger.createLogger();
        expect(logger.logLevel).toBe(AG_LOGLEVEL.OFF);
      });
    });

    describe('メッセージレベルフィルタリング', () => {
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
    });

    describe('境界値レベル処理', () => {
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

  describe('無効なログレベルのエラーハンドリング', () => {
    describe('型検証エラー', () => {
      const testCases = [
        { value: undefined, description: 'undefined', expected: 'invalid loglevel (undefined)' },
        { value: null, description: 'null', expected: 'invalid loglevel (null)' },
        { value: 'string', description: '文字列', expected: 'invalid loglevel (string)' },
        { value: true, description: 'boolean', expected: 'invalid loglevel (true)' },
        { value: { invalid: true }, description: 'オブジェクト', expected: 'invalid loglevel ([object Object])' },
        { value: [1, 2, 3], description: '配列', expected: 'invalid loglevel (1,2,3)' },
      ];

      testCases.forEach(({ value, description, expected }) => {
        it(`should throw error when setting ${description} as log level`, () => {
          const logger = AgLogger.createLogger();

          expect(() => {
            logger.logLevel = value as unknown as AgLogLevel;
          }).toThrow(expected);
        });
      });
    });

    describe('範囲外数値エラー', () => {
      const outOfRangeCases = [
        { value: -1, description: '範囲外の負の数値(-1)' },
        { value: 999, description: '範囲外の正の数値(999)' },
        { value: 1.5, description: '小数点数値(1.5)' },
      ];

      outOfRangeCases.forEach(({ value, description }) => {
        it(`should throw error when setting ${description}`, () => {
          const logger = AgLogger.createLogger();

          expect(() => {
            logger.logLevel = value as AgLogLevel;
          }).toThrow(`invalid loglevel (${value})`);
        });
      });
    });
  });
});

/**
 * ログメッセージ出力の振る舞い
 *
 * @description ログメソッドの実行、メッセージフォーマット、引数処理
 */
describe('AgLogger ログメッセージ出力', () => {
  setupTestEnvironment();

  describe('ログメソッドの基本実行', () => {
    it('should call all log level methods correctly', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.TRACE;

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
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      const testObj = { key: 'value' };
      logger.info('message', testObj, 123, true);

      expect(mockLogger).toHaveBeenCalledTimes(1);
      expect(mockFormatter).toHaveBeenCalled();
    });
  });

  describe('特殊引数とエッジケース', () => {
    describe('空の引数処理', () => {
      it('should not output when no arguments provided', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.info();
        logger.warn();
        logger.error();

        expect(mockLogger).toHaveBeenCalledTimes(0);
      });

      it('should not output when message is empty string', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.info('');

        expect(mockLogger).not.toHaveBeenCalled();
      });
    });

    describe('null/undefined引数処理', () => {
      it('should handle undefined and null arguments', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.info(undefined);
        logger.info(null);
        logger.info('message', undefined, null);

        expect(mockLogger).toHaveBeenCalledTimes(1);
      });
    });

    describe('メッセージフォーマットエッジケース', () => {
      it('should handle message formatting edge cases', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        const edgeCases = [
          [], // 引数なし
          [undefined], // undefined単体
          [null], // null単体
          ['', ''], // 空文字列
          [0, false, ''], // falsy値
          [Symbol('test')], // Symbol
          [new Date()], // オブジェクト
        ];

        edgeCases.forEach((args) => {
          logger.info(...args);
        });

        expect(mockLogger).toHaveBeenCalledTimes(2);
        expect(mockFormatter).toHaveBeenCalledTimes(7);
      });
    });
  });

  describe('フォーマッター連携処理', () => {
    describe('基本的なフォーマッター動作', () => {
      it('should apply formatter correctly', () => {
        const customFormatter = vi.fn().mockReturnValue('formatted message');
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: customFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.info('original message');

        expect(customFormatter).toHaveBeenCalled();
        expect(mockLogger).toHaveBeenCalledWith('formatted message');
      });
    });

    describe('フォーマッターの空出力処理', () => {
      it('should not log when formatter returns empty string', () => {
        const emptyFormatter = vi.fn().mockReturnValue('');
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: emptyFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.info('test message');

        expect(emptyFormatter).toHaveBeenCalled();
        expect(mockLogger).not.toHaveBeenCalled();
      });
    });

    describe('特殊フォーマット出力', () => {
      it('should handle formatter returning non-string values', () => {
        const objectFormatter = vi.fn().mockReturnValue({ formatted: true });
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: objectFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.info('test');

        expect(objectFormatter).toHaveBeenCalled();
        expect(mockLogger).toHaveBeenCalledWith({ formatted: true });
      });
    });
  });
});

/**
 * Verbose機能
 *
 * @description verbose設定、verbose出力制御のテスト
 */
describe('Verbose Functionality', () => {
  setupTestEnvironment();

  describe('正常系: Basic Verbose Operations', () => {
    it('should manage verbose state and output correctly', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // デフォルトはfalse
      expect(logger.isVerbose).toBe(false);

      // verbose off - no output
      logger.verbose('verbose off');
      expect(mockLogger).not.toHaveBeenCalled();

      // ENABLEに設定
      logger.setVerbose = ENABLE;
      expect(logger.isVerbose).toBe(ENABLE);

      // verbose on - output
      logger.verbose('verbose on');
      expect(mockLogger).toHaveBeenCalledTimes(1);

      // falseに戻す
      logger.setVerbose = DISABLE;
      expect(logger.isVerbose).toBe(false);
    });

    it('should not affect other log levels', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.TRACE;
      logger.setVerbose = DISABLE;

      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      expect(mockLogger).toHaveBeenCalledTimes(3);
    });
  });
});

describe('プロパティ委譲と状態管理', () => {
  describe('設定の永続化', () => {
    it('should persist settings across instances', () => {
      const logger1 = AgLogger.createLogger();
      const logger2 = AgLogger.getLogger();

      // Test default values
      expect(logger1.logLevel).toBe(AG_LOGLEVEL.OFF);
      expect(logger1.isVerbose).toBe(false);

      // Test property setters
      logger1.logLevel = AG_LOGLEVEL.ERROR;
      logger1.setVerbose = true;

      // Test property getters and persistence
      expect(logger2.logLevel).toBe(AG_LOGLEVEL.ERROR);
      expect(logger2.isVerbose).toBe(ENABLE);

      // Test property change
      logger2.logLevel = AG_LOGLEVEL.INFO;
      expect(logger1.logLevel).toBe(AG_LOGLEVEL.INFO);
    });
  });

  describe('shouldOutputメソッドのアクセス', () => {
    it('should expose shouldOutput method for testing', () => {
      const logger = AgLogger.createLogger();
      const testableLogger = logger as TestableAgLogger;

      expect(typeof testableLogger.shouldOutput).toBe('function');
    });

    it('should return true when log level ERROR is at INFO threshold', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;
      const testableLogger = logger as TestableAgLogger;

      const result = testableLogger.shouldOutput(AG_LOGLEVEL.ERROR);

      expect(result).toBe(true);
    });

    it('should return false when log level DEBUG is above INFO threshold', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;
      const testableLogger = logger as TestableAgLogger;

      const result = testableLogger.shouldOutput(AG_LOGLEVEL.DEBUG);

      expect(result).toBe(false);
    });

    it('should return false when log level is OFF regardless of message level', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.OFF;
      const testableLogger = logger as TestableAgLogger;

      const result = testableLogger.shouldOutput(AG_LOGLEVEL.ERROR);

      expect(result).toBe(false);
    });

    it('should return true for VERBOSE level when verbose flag is enabled', () => {
      const logger = AgLogger.createLogger();
      logger.setVerbose = true;
      const testableLogger = logger as TestableAgLogger;

      const result = testableLogger.shouldOutput(AG_LOGLEVEL.VERBOSE);

      expect(result).toBe(true);
    });

    it('should return false for VERBOSE level when verbose flag is disabled', () => {
      const logger = AgLogger.createLogger();
      logger.setVerbose = DISABLE;
      const testableLogger = logger as TestableAgLogger;

      const result = testableLogger.shouldOutput(AG_LOGLEVEL.VERBOSE);

      expect(result).toBe(false);
    });

    it('should return true for VERBOSE level when verbose flag is enabled even with OFF log level', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.OFF;
      logger.setVerbose = true;
      const testableLogger = logger as TestableAgLogger;

      const result = testableLogger.shouldOutput(AG_LOGLEVEL.VERBOSE);

      expect(result).toBe(true);
    });
  });
});

/**
 * エラーハンドリングの振る舞い
 *
 * @description エラー発生時の状態保持、例外伝搬、ライフサイクル管理
 */
describe('AgLogger エラーハンドリング', () => {
  setupTestEnvironment();

  describe('ログ処理中のエラー', () => {
    describe('ロガー関数エラー', () => {
      it('should handle logger function throwing errors', () => {
        const throwingLogger = vi.fn(() => {
          throw new Error('Logger error');
        });
        const logger = AgLogger.createLogger({ defaultLogger: throwingLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        expect(() => logger.info('test')).toThrow('Logger error');
      });

      it('should preserve logger state when logger function throws exception', () => {
        const throwingLogger = vi.fn(() => {
          throw new Error('Logger error');
        });
        const logger = AgLogger.createLogger({ defaultLogger: throwingLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.setVerbose = true;

        expect(() => logger.info('test')).toThrow('Logger error');

        expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
        expect(logger.isVerbose).toBe(ENABLE);
      });
    });

    describe('フォーマッター関数エラー', () => {
      it('should handle formatter function throwing errors', () => {
        const throwingFormatter = vi.fn(() => {
          throw new Error('Formatter error');
        });
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: throwingFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        expect(() => logger.info('test')).toThrow('Formatter error');
      });

      it('should preserve logger state when formatter throws exception', () => {
        const throwingFormatter = vi.fn(() => {
          throw new Error('Formatter error');
        });
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: throwingFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        expect(() => logger.info('test')).toThrow('Formatter error');

        expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
        expect(logger.isVerbose).toBe(false);
      });
    });
  });

  describe('同時実行と性能', () => {
    it('should handle concurrent calls correctly', () => {
      const delayedLogger = vi.fn();
      const logger = AgLogger.createLogger({ defaultLogger: delayedLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      const promises = Array.from(
        { length: 10 },
        (_, i) => Promise.resolve().then(() => logger.info(`concurrent message ${i}`)),
      );

      return Promise.all(promises).then(() => {
        expect(delayedLogger).toHaveBeenCalledTimes(10);
        expect(mockFormatter).toHaveBeenCalledTimes(10);
      });
    });
  });

  describe('ConsoleLogger特殊設定', () => {
    it('should handle ConsoleLogger auto-configuration', () => {
      AgLogger.createLogger({ defaultLogger: ConsoleLogger });
      const logger1 = AgLogger.getLogger();
      expect(logger1).toBeInstanceOf(AgLogger);
    });

    it('should preserve custom loggerMap when using ConsoleLogger', () => {
      const customMap = { [AG_LOGLEVEL.ERROR]: mockLogger };
      const logger = createLogger({
        defaultLogger: ConsoleLogger,
        loggerMap: customMap,
      });

      expect(logger).toBeInstanceOf(AgLogger);
    });
  });
});
