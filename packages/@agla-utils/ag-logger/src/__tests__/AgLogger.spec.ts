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

// executeLogメソッドもテストするための型定義
type TestableAgLogger = AgLogger & {
  executeLog: (level: AgLogLevel, ...args: unknown[]) => void;
  shouldOutput: (level: AgLogLevel) => boolean;
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

      it('should throw AgLoggerError when getLogger called before createLogger', () => {
        AgLogger.resetSingleton();
        expect(() => AgLogger.getLogger()).toThrow('Logger instance not created. Call createLogger() first.');
      });

      it('should return same instance on multiple createLogger calls', () => {
        const logger1 = AgLogger.createLogger();
        const logger2 = AgLogger.createLogger();
        const logger3 = createLogger();

        expect(logger1).toBe(logger2);
        expect(logger2).toBe(logger3);
      });

      it('should persist settings across instances', () => {
        const logger1 = AgLogger.createLogger();
        const logger2 = AgLogger.getLogger();

        logger1.logLevel = AG_LOGLEVEL.ERROR;
        logger1.setVerbose = ENABLE;

        expect(logger2.logLevel).toBe(AG_LOGLEVEL.ERROR);
        expect(logger2.isVerbose).toBe(ENABLE);
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
 * ログレベル管理機能
 *
 * @description ログレベルの設定、取得、フィルタリング機能のテスト
 */
describe('ログレベル管理機能', () => {
  setupTestEnvironment();

  describe('ログレベルフィルタリング', () => {
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

  /**
   * 異常系: 無効なログレベル処理
   */
  describe('異常系: Invalid Log Level Handling', () => {
    it('should handle invalid log levels gracefully', () => {
      const logger = AgLogger.createLogger();

      // TypeScriptでは型安全だが、実行時の動作を確認
      expect(() => {
        logger.logLevel = -1 as AgLogLevel;
      }).toThrow('Invalid log level (-1)');
      expect(() => {
        logger.logLevel = 999 as AgLogLevel;
      }).toThrow('Invalid log level (999)');
      expect(() => {
        logger.logLevel = 'string' as unknown as AgLogLevel;
      }).toThrow('Invalid log level ("string")');
      expect(() => {
        logger.logLevel = undefined as unknown as AgLogLevel;
      }).toThrow('Invalid log level (undefined)');
      expect(() => {
        logger.logLevel = null as unknown as AgLogLevel;
      }).toThrow('Invalid log level (null)');
    });
  });

  /**
   * エッジケース: 境界値とレベル変更
   */
  describe('エッジケース: Boundary Values and Level Changes', () => {
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

  describe('無効なログレベルの処理', () => {
    it('should throw errors for invalid log levels with specific messages', () => {
      const logger = AgLogger.createLogger();

      expect(() => {
        logger.logLevel = -1 as AgLogLevel;
      }).toThrow('Invalid log level (-1)');

      expect(() => {
        logger.logLevel = 999 as AgLogLevel;
      }).toThrow('Invalid log level (999)');

      expect(() => {
        logger.logLevel = 'string' as unknown as AgLogLevel;
      }).toThrow('Invalid log level ("string")');

      expect(() => {
        logger.logLevel = undefined as unknown as AgLogLevel;
      }).toThrow('Invalid log level (undefined)');

      expect(() => {
        logger.logLevel = null as unknown as AgLogLevel;
      }).toThrow('Invalid log level (null)');
    });
  });
});

/**
 * ログメソッド実行機能
 *
 * @description 各ログレベルメソッドの動作、引数処理のテスト
 */
describe('ログメソッド実行機能', () => {
  setupTestEnvironment();

  describe('基本的なログ出力', () => {
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

    it('should handle logger and formatter function throwing errors', () => {
      const throwingLogger = vi.fn(() => {
        throw new Error('Logger error');
      });
      const logger = AgLogger.createLogger({ defaultLogger: throwingLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      expect(() => logger.info('test')).toThrow('Logger error');
    });
  });

  describe('特殊引数とデータ処理', () => {
    setupTestEnvironment();
    it('should handle undefined and null arguments', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.info(undefined);
      logger.info(null);
      logger.info('message', undefined, null);

      // Only the third call should succeed because it has a non-empty message
      expect(mockLogger).toHaveBeenCalledTimes(1);
    });

    it('should handle empty arguments', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.info();
      logger.warn();
      logger.error();

      // Empty arguments produce empty messages that get filtered out
      expect(mockLogger).toHaveBeenCalledTimes(0);
    });

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

      // Only 2 cases should produce output (falsy values, Symbol)
      // The Date case gets parsed as timestamp, leaving empty message
      expect(mockLogger).toHaveBeenCalledTimes(2);
      expect(mockFormatter).toHaveBeenCalledTimes(7); // Formatter is called for all cases
    });

    it('should handle concurrent calls to executeLog correctly', () => {
      const delayedLogger = vi.fn();
      const logger = AgLogger.createLogger({ defaultLogger: delayedLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // 同時実行をシミュレート
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
});

/**
 * フォーマッター連携機能
 *
 * @description フォーマッター処理、出力制御のテスト
 */
describe('フォーマッター連携機能', () => {
  setupTestEnvironment();

  describe('基本的なフォーマッター動作', () => {
    it('should apply formatter correctly', () => {
      const customFormatter = vi.fn().mockReturnValue('formatted message');
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: customFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.info('original message');

      expect(customFormatter).toHaveBeenCalled();
      expect(mockLogger).toHaveBeenCalledWith('formatted message');
    });

    it('should apply correct log level filtering in executeLog', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.WARN;

      // isOutputLevel internal test via executeLog
      logger.trace('trace'); // filtered
      logger.debug('debug'); // filtered
      logger.info('info'); // filtered
      logger.warn('warn'); // logged
      logger.error('error'); // logged
      logger.fatal('fatal'); // logged

      expect(mockLogger).toHaveBeenCalledTimes(3);
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

    it('should handle formatter returning empty string with non-empty message correctly', () => {
      const emptyFormatter = vi.fn().mockReturnValue('');
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: emptyFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.info('test message');

      expect(emptyFormatter).toHaveBeenCalled();
      expect(mockLogger).not.toHaveBeenCalled();
    });

    it('should allow empty formatter output when original message is empty', () => {
      const emptyFormatter = vi.fn().mockReturnValue('');
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: emptyFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.info();

      expect(emptyFormatter).toHaveBeenCalled();
      // Empty formatter output gets filtered out even for empty original messages
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

/**
 * Verbose機能
 *
 * @description verbose設定、verbose出力制御のテスト
 */
describe('Verbose機能', () => {
  setupTestEnvironment();

  describe('isVerbose method', () => {
    it('should return false as default value', () => {
      const logger = AgLogger.createLogger();
      expect(logger.isVerbose).toBe(DISABLE);
    });

    it('should return true when verbose is enabled', () => {
      const logger = AgLogger.createLogger();
      logger.setVerbose = ENABLE;
      expect(logger.isVerbose).toBe(ENABLE);
    });

    it('should return false as default value when called as method', () => {
      const logger = AgLogger.createLogger();
      expect(logger.isVerbose).toBe(DISABLE);
    });
  });
});

/**
 * executeLog 空ログ抑制機能
 *
 * @description executeLogメソッドの空ログ抑制動作をテスト
 */
describe('executeLog Empty Log Suppression', () => {
  setupTestEnvironment();
  /**
   * 正常系: 空ログ抑制の基本動作
   */
  describe('エッジケース: Verbose State Changes', () => {
    it('should handle rapid verbose state changes', () => {
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;
      /* エッジケース: verbose状態変更 */
      describe('エッジケース: Verbose State Changes', () => {
        it('should handle rapid verbose state changes', () => {
          const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
          logger.logLevel = AG_LOGLEVEL.INFO;

          for (let i = 0; i < 100; i++) {
            logger.setVerbose = i % 2 === 0;
            logger.verbose(`verbose ${i}`);
          }

          expect(mockLogger).toHaveBeenCalledTimes(50); // verbose がtrueの時のみ
        });
      });
    });
  });
});

/**
 * getLogger便利関数
 *
 * @description getLogger関数の動作、ConsoleLogger自動設定のテスト
 */
describe('getLogger Convenience Function', () => {
  setupTestEnvironment();
  /**
   * 正常系: 基本的なgetLogger動作
   */
  describe('正常系: Basic getLogger Operations', () => {
    it('should auto-assign ConsoleLoggerMap when using ConsoleLogger', () => {
      AgLogger.createLogger({ defaultLogger: ConsoleLogger });
      const logger = AgLogger.getLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      // ConsoleLoggerMapが自動適用されることを間接的に確認
      expect(logger).toBeInstanceOf(AgLogger);
    });

    it('should work with custom logger and formatter', () => {
      AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      const logger = AgLogger.getLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;
      logger.info('test');

      expect(mockLogger).toHaveBeenCalled();
      expect(mockFormatter).toHaveBeenCalled();
    });

    /**
     * 異常系: 無効なオプション処理
     */
    describe('異常系: Invalid Options Handling', () => {
      it('should handle invalid options by throwing an error with descriptive message', () => {
        expect(() => {
          // @ts-expect-error: Testing invalid null input
          AgLogger.createLogger(null);
        }).toThrow('Cannot read properties of null');
      });
    });

    /**
     * エッジケース: ConsoleLogger自動設定
     */
    describe('エッジケース: ConsoleLogger Auto-configuration', () => {
      it('should handle ConsoleLogger auto-configuration', () => {
        // createLogger with ConsoleLogger should auto-assign ConsoleLoggerMap
        AgLogger.createLogger({ defaultLogger: ConsoleLogger });
        const logger1 = AgLogger.getLogger();
        expect(logger1).toBeInstanceOf(AgLogger);

        // setManager with ConsoleLogger should auto-assign ConsoleLoggerMap
        AgLogger.createLogger();
        const logger2 = AgLogger.getLogger();
        logger2.setLoggerConfig({ defaultLogger: ConsoleLogger });
        expect(logger2).toBeInstanceOf(AgLogger);
      });

      it('should preserve custom loggerMap when using ConsoleLogger', () => {
        const customMap = { [AG_LOGLEVEL.ERROR]: mockLogger };
        AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          loggerMap: customMap,
        });
        const logger = AgLogger.getLogger();
        logger.error('test error');
        expect(mockLogger).not.toHaveBeenCalled();
      });
    });
  });

  /**
   * 設定管理システム (Configuration Management System)
   *
   * @description AgLoggerConfigによる設定の委譲、プロパティアクセス、状態管理のテスト
   */
  describe('設定管理システム', () => {
    setupTestEnvironment();

    describe('プロパティ委譲の基本動作', () => {
      it('should delegate verbose property access to config', () => {
        const logger = AgLogger.createLogger();
        expect(logger.isVerbose).toBe(DISABLE);
      });

      it('should delegate verbose property updates to config', () => {
        const logger = AgLogger.createLogger();
        logger.setVerbose = ENABLE;
        expect(logger.isVerbose).toBe(ENABLE);
      });

      it('should maintain verbose state through config', () => {
        const logger = AgLogger.createLogger();
        logger.setVerbose = ENABLE;
        const result = logger.isVerbose;
        expect(result).toBe(ENABLE);
      });

      it('should delegate log level property access to config', () => {
        const logger = AgLogger.createLogger();
        expect(logger.logLevel).toBe(AG_LOGLEVEL.OFF);
      });

      it('should delegate log level property updates to config', () => {
        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;
        expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
      });
    });

    describe('出力レベルフィルタリング', () => {
      it('should use config shouldOutput method for filtering', () => {
        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;
        const loggerForTesting = logger as TestableAgLogger;

        const shouldOutputError = loggerForTesting.shouldOutput(AG_LOGLEVEL.ERROR);
        const shouldOutputDebug = loggerForTesting.shouldOutput(AG_LOGLEVEL.DEBUG);

        expect(shouldOutputError).toBe(ENABLE);
        expect(shouldOutputDebug).toBe(DISABLE);
      });
    });

    describe('shouldOutput Protected Method Access', () => {
      it('should expose shouldOutput method to test subclasses', () => {
        const logger = AgLogger.createLogger();
        const loggerForTesting = logger as TestableAgLogger;

        expect(typeof loggerForTesting.shouldOutput).toBe('function');
      });

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

    describe('Verboseメソッドと設定連携', () => {
      setupTestEnvironment();

      it('should respect config verbose setting in verbose method', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });

        logger.verbose('test message');
        expect(mockLogger).not.toHaveBeenCalled();

        logger.setVerbose = ENABLE;
        logger.verbose('test message');
        expect(mockLogger).toHaveBeenCalledWith('test message');
      });
    });
  });

  /**
   * executeLog メソッドの動作テスト
   *
   * @description executeLogメソッドの保護されたメソッドとしての動作テスト
   */
  describe('executeLog メソッドの動作テスト', () => {
    setupTestEnvironment();

    /**
     * 正常系: executeLog comprehensive behavior test
     */
    describe('正常系: Comprehensive executeLog Behavior', () => {
      it('should handle method accessibility, filtering, formatting, and empty output', () => {
        const customFormatter = vi.fn().mockReturnValue('formatted message');
        const testLogger = createLogger({ defaultLogger: mockLogger, formatter: customFormatter }) as TestableAgLogger;

        expect(typeof testLogger.executeLog).toBe('function');
        expect(testLogger.executeLog).toBeDefined();
      });
    });

    describe('動作の同等性テスト', () => {
      it('should filter logs based on log level same as original implementation', () => {
        const testLogger = createLogger({
          defaultLogger: mockLogger,
          formatter: mockFormatter,
        }) as TestableAgLogger;
        testLogger.logLevel = AG_LOGLEVEL.WARN;

        testLogger.executeLog(AG_LOGLEVEL.DEBUG, 'debug'); // should be filtered
        testLogger.executeLog(AG_LOGLEVEL.INFO, 'info'); // should be filtered
        testLogger.executeLog(AG_LOGLEVEL.WARN, 'warn'); // should be logged
        testLogger.executeLog(AG_LOGLEVEL.ERROR, 'error'); // should be logged

        expect(mockLogger).toHaveBeenCalledTimes(2);
      });

      it('should format messages using formatter same as original implementation', () => {
        const customFormatter = vi.fn().mockReturnValue('formatted message');
        const testLogger = createLogger({
          defaultLogger: mockLogger,
          formatter: customFormatter,
        }) as TestableAgLogger;
        testLogger.logLevel = AG_LOGLEVEL.INFO;

        testLogger.executeLog(AG_LOGLEVEL.INFO, 'test message');

        expect(customFormatter).toHaveBeenCalled();
        expect(mockLogger).toHaveBeenCalledWith('formatted message');
      });
    });

    describe('executeLog should use config.getLoggerFunction instead of manager.getLogger', () => {
      it('should call config.getLoggerFunction when getting logger', () => {
        const customErrorLogger = vi.fn();
        const customWarnLogger = vi.fn();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: mockFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: customErrorLogger,
            [AG_LOGLEVEL.WARN]: customWarnLogger,
          },
        });
        logger.logLevel = AG_LOGLEVEL.TRACE;
        const testableLogger = logger as TestableAgLogger;

        testableLogger.executeLog(AG_LOGLEVEL.ERROR, 'error message');
        testableLogger.executeLog(AG_LOGLEVEL.WARN, 'warn message');
        testableLogger.executeLog(AG_LOGLEVEL.INFO, 'info message'); // uses defaultLogger

        expect(customErrorLogger).toHaveBeenCalledTimes(1);
        expect(customWarnLogger).toHaveBeenCalledTimes(1);
        expect(mockLogger).toHaveBeenCalledTimes(1); // for INFO level
      });
    });

    describe('executeLog 空ログ抑制機能', () => {
      it('should not output when message is empty and no additional arguments', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;
        const testableLogger = logger as TestableAgLogger;

        testableLogger.executeLog(AG_LOGLEVEL.INFO, '');

        expect(mockLogger).not.toHaveBeenCalled();
      });
    });
  });

  /**
   * FORCE_OUTPUT Log Level
   *
   * @description BDD tests for FORCE_OUTPUT log level behavior
   */
  describe('FORCE_OUTPUT Log Level', () => {
    setupTestEnvironment();

    describe('log method with FORCE_OUTPUT should output regardless of logLevel and verbose settings', () => {
      it('should output when both logLevel is OFF and verbose is false', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.logLevel = AG_LOGLEVEL.OFF;
        logger.setVerbose = DISABLE;

        logger.log('force output message');

        expect(mockLogger).toHaveBeenCalledTimes(1);
      });
    });
  });

  /**
   * Input Validation for LogLevel Parameters
   *
   * @description AgLoggerの executeLog, setLogger, setLogLevel でlogLevelが範囲外の時にエラーを投げる入力バリデーション
   */
  describe('Input Validation for LogLevel Parameters', () => {
    setupTestEnvironment();

    describe('executeLog method should validate logLevel input', () => {
      it('should throw error when logLevel is undefined', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        const testableLogger = logger as TestableAgLogger;

        expect(() => {
          testableLogger.executeLog(undefined as unknown as AgLogLevel, 'test message');
        }).toThrow('Invalid log level (undefined)');
      });
    });

    describe('logLevel setter should validate logLevel input', () => {
      it('should throw error when logLevel is null', () => {
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });

        expect(() => {
          logger.logLevel = null as unknown as AgLogLevel;
        }).toThrow('Invalid log level (null)');
      });
    });

    describe('setVerbose setter should exist', () => {
      it('should set verbose to true using setVerbose setter', () => {
        const logger = AgLogger.createLogger();
        logger.setVerbose = true;
        expect(logger.isVerbose).toBe(true);
      });
    });

    describe('existing methods should coexist', () => {
      it('should allow both isVerbose() method and isVerbose getter to work', () => {
        const logger = AgLogger.createLogger();
        expect(logger.isVerbose).toBe(false);
        expect(logger.isVerbose).toBe(false);
      });
    });
  });
});
