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
// import type { AgLogLevel } from '../../shared/types';
import type { AgLogLevel } from '../../shared/types';

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
 * @description AgLoggerクラスの全機能を機能・目的別にカテゴリー分けし、
 * 各カテゴリー内で正常系・異常系・エッジケースに分類して検証
 *
 * @testType Unit Test
 * @testTarget AgLogger Class
 * @structure
 * - 機能別カテゴリー
 *   - 正常系: 基本的な動作確認
 *   - 異常系: エラー処理、例外時の動作
 *   - エッジケース: 境界値、特殊入力、状態遷移
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
   * シングルトンパターン管理機能
   *
   * @description インスタンス管理、一意性保証、リセット機能のテスト
   */
  describe('Singleton Pattern Management', () => {
    /**
     * 正常系: 基本的なシングルトン動作
     */
    describe('正常系: Basic Singleton Operations', () => {
      it('should return the same instance on multiple calls', () => {
        const instance1 = AgLogger.getLogger();
        const instance2 = AgLogger.getLogger();
        const instance3 = getLogger();

        expect(instance1).toBe(instance2);
        expect(instance2).toBe(instance3);
        expect(instance1).toBeInstanceOf(AgLogger);
      });

      it('should maintain singleton with different parameters', () => {
        const logger1 = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
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
     * 異常系: エラー処理と例外状況
     */
    describe('異常系: Error Handling', () => {
      it('should handle undefined options gracefully', () => {
        const logger = AgLogger.getLogger(undefined);
        expect(logger).toBeInstanceOf(AgLogger);
      });

      it('should handle empty options object', () => {
        const logger = AgLogger.getLogger({});
        expect(logger).toBeInstanceOf(AgLogger);
      });
    });

    /**
     * エッジケース: 特殊条件とリセット
     */
    describe('エッジケース: Special Conditions and Reset', () => {
      it('should persist settings across instances', () => {
        const logger1 = AgLogger.getLogger();
        const logger2 = AgLogger.getLogger();

        logger1.setLogLevel(AG_LOGLEVEL.ERROR);
        logger1.setVerbose(true);

        expect(logger2.getLogLevel()).toBe(AG_LOGLEVEL.ERROR);
        expect(logger2.setVerbose()).toBe(true);
      });
    });
  });

  /**
   * ログレベル管理機能
   *
   * @description ログレベルの設定、取得、フィルタリング機能のテスト
   */
  describe('Log Level Management', () => {
    /**
     * 正常系: 基本的なログレベル操作
     */
    describe('正常系: Basic Log Level Operations', () => {
      it('should set and get log level correctly', () => {
        const logger = AgLogger.getLogger();

        expect(logger.setLogLevel(AG_LOGLEVEL.DEBUG)).toBe(AG_LOGLEVEL.DEBUG);
        expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.DEBUG);

        expect(logger.setLogLevel(AG_LOGLEVEL.ERROR)).toBe(AG_LOGLEVEL.ERROR);
        expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.ERROR);
      });

      it('should filter logs based on current level', () => {
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.WARN);

        logger.debug('debug'); // filtered
        logger.info('info'); // filtered
        logger.warn('warn'); // logged
        logger.error('error'); // logged
        logger.fatal('fatal'); // logged

        expect(mockLogger).toHaveBeenCalledTimes(3);
      });

      it('should block all logs when level is OFF', () => {
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
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
     * 異常系: 無効なログレベル処理
     */
    describe('異常系: Invalid Log Level Handling', () => {
      it('should handle invalid log levels gracefully', () => {
        const logger = AgLogger.getLogger();

        // TypeScriptでは型安全だが、実行時の動作を確認
        expect(() => logger.setLogLevel(-1 as AgLogLevel)).not.toThrow();
        expect(() => logger.setLogLevel(999 as AgLogLevel)).not.toThrow();
      });
    });

    /**
     * エッジケース: 境界値とレベル変更
     */
    describe('エッジケース: Boundary Values and Level Changes', () => {
      it('should handle boundary log levels correctly', () => {
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });

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

      it('should handle rapid log level changes', () => {
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });

        // 高速なレベル変更
        for (let i = 0; i < 100; i++) {
          const level = i % 2 === 0 ? AG_LOGLEVEL.INFO : AG_LOGLEVEL.ERROR;
          logger.setLogLevel(level);
          logger.info('test');
        }

        expect(mockLogger).toHaveBeenCalledTimes(50); // INFO レベルの時のみ
      });
    });
  });

  /**
   * ログメソッド実行機能
   *
   * @description 各ログレベルメソッドの動作、引数処理のテスト
   */
  describe('Log Method Execution', () => {
    /**
     * 正常系: 基本的なログ出力
     */
    describe('正常系: Basic Log Output', () => {
      it('should call all log level methods correctly', () => {
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
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
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        const testObj = { key: 'value' };
        logger.info('message', testObj, 123, true);

        expect(mockLogger).toHaveBeenCalledTimes(1);
        expect(mockFormatter).toHaveBeenCalled();
      });
    });

    /**
     * 異常系: エラー時のログ処理
     */
    describe('異常系: Error Handling in Logging', () => {
      it('should handle logger function throwing errors', () => {
        const throwingLogger = vi.fn(() => {
          throw new Error('Logger error');
        });
        const logger = AgLogger.getLogger({ defaultLogger: throwingLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        expect(() => logger.info('test')).toThrow('Logger error');
      });

      it('should handle formatter function throwing errors', () => {
        const throwingFormatter = vi.fn(() => {
          throw new Error('Formatter error');
        });
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: throwingFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        expect(() => logger.info('test')).toThrow('Formatter error');
      });

      it('should preserve logger state when formatter throws exception', () => {
        const throwingFormatter = vi.fn(() => {
          throw new Error('Formatter error');
        });
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: throwingFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        expect(() => logger.info('test')).toThrow('Formatter error');

        // 状態が保持されていることを確認
        expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.INFO);
        expect(logger.setVerbose()).toBe(false);
      });

      it('should preserve logger state when logger function throws exception', () => {
        const throwingLogger = vi.fn(() => {
          throw new Error('Logger error');
        });
        const logger = AgLogger.getLogger({ defaultLogger: throwingLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);
        logger.setVerbose(true);

        expect(() => logger.info('test')).toThrow('Logger error');

        // 状態が保持されていることを確認
        expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.INFO);
        expect(logger.setVerbose()).toBe(true);
      });
    });

    /**
     * エッジケース: 特殊引数とデータ処理
     */
    describe('エッジケース: Special Arguments and Data Processing', () => {
      it('should handle undefined and null arguments', () => {
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        logger.info(undefined);
        logger.info(null);
        logger.info('message', undefined, null);

        expect(mockLogger).toHaveBeenCalledTimes(3);
      });

      it('should handle empty arguments', () => {
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        logger.info();
        logger.warn();
        logger.error();

        expect(mockLogger).toHaveBeenCalledTimes(3);
      });

      it('should handle message formatting edge cases', () => {
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

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

        expect(mockLogger).toHaveBeenCalledTimes(edgeCases.length);
        expect(mockFormatter).toHaveBeenCalledTimes(edgeCases.length);
      });

      it('should handle concurrent calls to logWithLevel correctly', () => {
        const delayedLogger = vi.fn();
        const logger = AgLogger.getLogger({ defaultLogger: delayedLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

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
  describe('Formatter Integration', () => {
    /**
     * 正常系: 基本的なフォーマッター動作
     */
    describe('正常系: Basic Formatter Operations', () => {
      it('should apply formatter correctly', () => {
        const customFormatter = vi.fn().mockReturnValue('formatted message');
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: customFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        logger.info('original message');

        expect(customFormatter).toHaveBeenCalled();
        expect(mockLogger).toHaveBeenCalledWith('formatted message');
      });

      it('should apply correct log level filtering in logWithLevel', () => {
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.WARN);

        // isOutputLevel内部テスト
        logger.trace('trace'); // filtered
        logger.debug('debug'); // filtered
        logger.info('info'); // filtered
        logger.warn('warn'); // logged
        logger.error('error'); // logged
        logger.fatal('fatal'); // logged

        expect(mockLogger).toHaveBeenCalledTimes(3);
      });
    });

    /**
     * 異常系: フォーマッターエラー処理
     */
    describe('異常系: Formatter Error Handling', () => {
      it('should not log when formatter returns empty string', () => {
        const emptyFormatter = vi.fn().mockReturnValue('');
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: emptyFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        logger.info('test message');

        expect(emptyFormatter).toHaveBeenCalled();
        expect(mockLogger).not.toHaveBeenCalled();
      });

      it('should handle formatter returning empty string with non-empty message correctly', () => {
        const emptyFormatter = vi.fn().mockReturnValue('');
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: emptyFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        logger.info('test message');

        expect(emptyFormatter).toHaveBeenCalled();
        expect(mockLogger).not.toHaveBeenCalled();
      });

      it('should allow empty formatter output when original message is empty', () => {
        const emptyFormatter = vi.fn().mockReturnValue('');
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: emptyFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        logger.info();

        expect(emptyFormatter).toHaveBeenCalled();
        expect(mockLogger).toHaveBeenCalledWith('');
      });
    });

    /**
     * エッジケース: 特殊フォーマッター動作
     */
    describe('エッジケース: Special Formatter Behaviors', () => {
      it('should handle formatter returning non-string values', () => {
        const objectFormatter = vi.fn().mockReturnValue({ formatted: true });
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: objectFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

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
  describe('Verbose Functionality', () => {
    /**
     * 正常系: 基本的なverbose動作
     */
    describe('正常系: Basic Verbose Operations', () => {
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
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
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
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.TRACE);
        logger.setVerbose(false);

        logger.info('info');
        logger.warn('warn');
        logger.error('error');

        expect(mockLogger).toHaveBeenCalledTimes(3);
      });
    });

    /**
     * 異常系: verbose状態管理エラー
     */
    describe('異常系: Verbose State Management Errors', () => {
      it('should handle verbose with undefined parameter', () => {
        const logger = AgLogger.getLogger();

        logger.setVerbose(true);
        expect(logger.setVerbose(undefined)).toBe(true); // 値が変更されない
      });
    });

    /**
     * エッジケース: verbose状態変更
     */
    describe('エッジケース: Verbose State Changes', () => {
      it('should handle rapid verbose state changes', () => {
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        for (let i = 0; i < 100; i++) {
          logger.setVerbose(i % 2 === 0);
          logger.verbose(`verbose ${i}`);
        }

        expect(mockLogger).toHaveBeenCalledTimes(50); // verbose がtrueの時のみ
      });
    });
  });

  /**
   * getLogger便利関数
   *
   * @description getLogger関数の動作、ConsoleLogger自動設定のテスト
   */
  describe('getLogger Convenience Function', () => {
    /**
     * 正常系: 基本的なgetLogger動作
     */
    describe('正常系: Basic getLogger Operations', () => {
      it('should auto-assign ConsoleLoggerMap when using ConsoleLogger', () => {
        const logger = getLogger({ defaultLogger: ConsoleLogger });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        // ConsoleLoggerMapが自動適用されることを間接的に確認
        expect(logger).toBeInstanceOf(AgLogger);
      });

      it('should work with custom logger and formatter', () => {
        const logger = getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);
        logger.info('test');

        expect(mockLogger).toHaveBeenCalled();
        expect(mockFormatter).toHaveBeenCalled();
      });
    });

    /**
     * 異常系: 無効なオプション処理
     */
    describe('異常系: Invalid Options Handling', () => {
      it('should handle invalid options by throwing an error with descriptive message', () => {
        expect(() => {
          // @ts-expect-error: Testing invalid null input
          getLogger(null);
        }).toThrow('Cannot read properties of null');
      });
    });

    /**
     * エッジケース: ConsoleLogger自動設定
     */
    describe('エッジケース: ConsoleLogger Auto-configuration', () => {
      it('should handle ConsoleLogger auto-configuration', () => {
        // getLogger with ConsoleLogger should auto-assign ConsoleLoggerMap
        const logger1 = getLogger({ defaultLogger: ConsoleLogger });
        expect(logger1).toBeInstanceOf(AgLogger);

        // setManager with ConsoleLogger should auto-assign ConsoleLoggerMap
        const logger2 = AgLogger.getLogger();
        logger2.setManager({ defaultLogger: ConsoleLogger });
        expect(logger2).toBeInstanceOf(AgLogger);
      });

      it('should preserve custom loggerMap when using ConsoleLogger', () => {
        const customMap = { [AG_LOGLEVEL.ERROR]: mockLogger };
        const logger = getLogger({
          defaultLogger: ConsoleLogger,
          loggerMap: customMap,
        });

        expect(logger).toBeInstanceOf(AgLogger);
      });
    });
  });
});
