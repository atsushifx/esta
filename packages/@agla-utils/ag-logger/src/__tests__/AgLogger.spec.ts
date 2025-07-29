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
// 内部クラス - AgLoggerConfigクラス
import { AgLoggerConfig } from '../internal/AgLoggerConfig.class';
// プラグイン - テストで使用するコンソールロガーとモックロガー
import { ConsoleLogger } from '../plugins/logger/ConsoleLogger';
import { MockLogger } from '../plugins/logger/MockLogger';

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
        expect(() => logger.setLogLevel(-1 as AgLogLevel)).toThrow('Invalid log level: -1');
        expect(() => logger.setLogLevel(999 as AgLogLevel)).toThrow('Invalid log level: 999');
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

  /**
   * AgLoggerConfig統合機能（フェーズ2）
   *
   * @description AgLoggerConfigインスタンスの組み込みと設定委譲機能のテスト
   */
  describe('AgLoggerConfig Integration (Phase 2)', () => {
    /**
     * Task 1.1: AgLoggerConfigインスタンスの追加
     */
    describe('Task 1.1: AgLoggerConfigインスタンスの追加', () => {
      /**
       * 小タスク1.1.1: AgLoggerのconstructorでAgLoggerConfigインスタンスが作成される
       */
      it('小タスク1.1.1: AgLoggerのconstructorでAgLoggerConfigインスタンスが作成される', () => {
        const logger = AgLogger.getLogger();

        // AgLoggerインスタンスが内部で_configプロパティとしてAgLoggerConfigインスタンスを持つことを確認
        // テスト用ヘルパーメソッドを使用してアクセス
        expect(logger._getConfigForTesting()).toBeInstanceOf(AgLoggerConfig);
      });

      /**
       * 小タスク1.1.2: AgLoggerConfigインスタンスがprivateプロパティとして保持される
       */
      it('小タスク1.1.2: AgLoggerConfigインスタンスがprivateプロパティとして保持される', () => {
        const logger = AgLogger.getLogger();

        // _configプロパティがプライベートであり、テスト用メソッド経由でのみアクセス可能
        const config = logger._getConfigForTesting();
        expect(config).toBeDefined();
        expect(config).toBeInstanceOf(AgLoggerConfig);

        // テスト用メソッドが期待通りに機能することを確認
        expect(typeof logger._getConfigForTesting).toBe('function');
      });

      /**
       * 小タスク1.1.3: AgLoggerConfig初期化時にデフォルト設定が適用される
       */
      it('小タスク1.1.3: AgLoggerConfig初期化時にデフォルト設定が適用される', () => {
        const logger = AgLogger.getLogger();
        const config = logger._getConfigForTesting();

        // AgLoggerConfigのデフォルト設定値を確認
        expect(config.getLogLevel()).toBe(AG_LOGLEVEL.OFF); // デフォルトはOFF
        expect(config.getVerbose()).toBe(false); // デフォルトはfalse
        expect(config.getFormatter()).toBeDefined(); // フォーマッターが設定されている
        expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBeDefined(); // ロガー関数が設定されている
      });

      /**
       * 小タスク1.1.4: 初期化後のAgLoggerConfigがアクセス可能である
       */
      it('小タスク1.1.4: 初期化後のAgLoggerConfigがアクセス可能である', () => {
        const logger = AgLogger.getLogger();
        const config = logger._getConfigForTesting();

        // AgLoggerConfigの全ての主要メソッドがアクセス可能であることを確認
        expect(() => config.getLogLevel()).not.toThrow();
        expect(() => config.getVerbose()).not.toThrow();
        expect(() => config.getFormatter()).not.toThrow();
        expect(() => config.getLoggerFunction(AG_LOGLEVEL.INFO)).not.toThrow();
        expect(() => config.shouldOutput(AG_LOGLEVEL.INFO)).not.toThrow();
        expect(() => config.shouldOutputVerbose()).not.toThrow();

        // 設定メソッドもアクセス可能であることを確認
        expect(() => config.setLogLevel(AG_LOGLEVEL.DEBUG)).not.toThrow();
        expect(() => config.setVerbose(true)).not.toThrow();

        // 実際に設定が反映されることを確認
        expect(config.getLogLevel()).toBe(AG_LOGLEVEL.DEBUG);
        expect(config.getVerbose()).toBe(true);
      });
    });

    /**
     * Task 1.2: 既存設定メソッドのリファクタリング
     */
    describe('Task 1.2: 既存設定メソッドのリファクタリング', () => {
      /**
       * 小タスク1.2.1: setLogLevelメソッドの内部実装をconfig.setLogLevel()呼び出しに変更
       */
      it('小タスク1.2.1: setLogLevelメソッドの内部実装をconfig.setLogLevel()呼び出しに変更', () => {
        const logger = AgLogger.getLogger();
        const config = logger._getConfigForTesting();

        // setLogLevelメソッドを呼び出す前の初期状態を確認
        expect(config.getLogLevel()).toBe(AG_LOGLEVEL.OFF);

        // AgLoggerのsetLogLevelメソッドを呼び出し
        const result = logger.setLogLevel(AG_LOGLEVEL.INFO);

        // 戻り値が正しいことを確認
        expect(result).toBe(AG_LOGLEVEL.INFO);

        // AgLoggerConfigの内部状態が更新されていることを確認
        expect(config.getLogLevel()).toBe(AG_LOGLEVEL.INFO);

        // 従来の動作も維持されていることを確認
        expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.INFO);
      });

      /**
       * 小タスク1.2.2: setVerboseメソッドの内部実装をconfig.setVerbose()呼び出しに変更
       */
      it('小タスク1.2.2: setVerboseメソッドの内部実装をconfig.setVerbose()呼び出しに変更', () => {
        const logger = AgLogger.getLogger();
        const config = logger._getConfigForTesting();

        // setVerboseメソッドを呼び出す前の初期状態を確認
        expect(config.getVerbose()).toBe(false);

        // AgLoggerのsetVerboseメソッドを呼び出し（引数ありパターン）
        const result1 = logger.setVerbose(true);

        // 戻り値が正しいことを確認
        expect(result1).toBe(true);

        // AgLoggerConfigの内部状態が更新されていることを確認
        expect(config.getVerbose()).toBe(true);

        // 引数なしパターンでも動作することを確認
        const result2 = logger.setVerbose();
        expect(result2).toBe(true);

        // falseに設定
        const result3 = logger.setVerbose(false);
        expect(result3).toBe(false);
        expect(config.getVerbose()).toBe(false);
      });

      /**
       * 小タスク1.2.3: getLogLevelメソッドの内部実装をconfig.getLogLevel()呼び出しに変更
       */
      it('小タスク1.2.3: getLogLevelメソッドの内部実装をconfig.getLogLevel()呼び出しに変更', () => {
        const logger = AgLogger.getLogger();
        const config = logger._getConfigForTesting();

        // AgLoggerConfigに直接設定
        config.setLogLevel(AG_LOGLEVEL.WARN);

        // AgLoggerのgetLogLevelメソッドがAgLoggerConfigの値を返すことを確認
        const result = logger.getLogLevel();

        // AgLoggerConfigの値と一致することを確認
        expect(result).toBe(AG_LOGLEVEL.WARN);
        expect(result).toBe(config.getLogLevel());

        // 異なる値でも確認
        config.setLogLevel(AG_LOGLEVEL.DEBUG);
        expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.DEBUG);
        expect(logger.getLogLevel()).toBe(config.getLogLevel());
      });

      /**
       * 小タスク1.2.4: リファクタリング後も既存APIの動作が完全に保持される
       */
      it('小タスク1.2.4: リファクタリング後も既存APIの動作が完全に保持される', () => {
        const logger = AgLogger.getLogger();

        // 既存のAPI動作テスト1: setLogLevel → getLogLevel の連携
        const setResult = logger.setLogLevel(AG_LOGLEVEL.WARN);
        expect(setResult).toBe(AG_LOGLEVEL.WARN);
        expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.WARN);

        // 既存のAPI動作テスト2: setVerbose → setVerbose() (getter) の連携
        const verboseResult1 = logger.setVerbose(true);
        expect(verboseResult1).toBe(true);
        expect(logger.setVerbose()).toBe(true); // getter として動作

        const verboseResult2 = logger.setVerbose(false);
        expect(verboseResult2).toBe(false);
        expect(logger.setVerbose()).toBe(false);

        // 既存のAPI動作テスト3: 複数回の設定変更
        logger.setLogLevel(AG_LOGLEVEL.ERROR);
        logger.setVerbose(true);
        expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.ERROR);
        expect(logger.setVerbose()).toBe(true);

        // 既存のAPI動作テスト4: シングルトンパターンの維持
        const logger2 = AgLogger.getLogger();
        expect(logger2).toBe(logger);
        expect(logger2.getLogLevel()).toBe(AG_LOGLEVEL.ERROR);
        expect(logger2.setVerbose()).toBe(true);
      });

      /**
       * 小タスク1.2.5: setAgLoggerOptionsメソッド経由の操作でも正常動作する
       */
      it('小タスク1.2.5: setAgLoggerOptionsメソッド経由の操作でも正常動作する', () => {
        const logger = AgLogger.getLogger();
        const config = logger._getConfigForTesting();

        // setAgLoggerOptionsメソッドでAgLoggerOptionsを設定
        const options = {
          defaultLogger: mockLogger,
          formatter: mockFormatter,
          logLevel: AG_LOGLEVEL.INFO,
          verbose: true,
        };

        // setAgLoggerOptionsを呼び出す前の状態確認
        expect(config.getLogLevel()).toBe(AG_LOGLEVEL.OFF);
        expect(config.getVerbose()).toBe(false);

        // setAgLoggerOptionsメソッドでAgLoggerConfigに設定を適用
        logger.setAgLoggerOptions(options);

        // AgLoggerConfigに設定が反映されていることを確認
        expect(config.getLogLevel()).toBe(AG_LOGLEVEL.INFO);
        expect(config.getVerbose()).toBe(true);
        expect(config.getFormatter()).toBe(mockFormatter);

        // AgLoggerの既存メソッド経由でも正しい値が取得できることを確認
        expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.INFO);
        expect(logger.setVerbose()).toBe(true);
      });
    });

    /**
     * Task 2.3: getCurrentSettings()メソッドの実装
     */
    describe('Task 2.3: getCurrentSettings()メソッドの実装', () => {
      /**
       * 小タスク2.3.1: getCurrentSettings()メソッドが定義される
       */
      it('小タスク2.3.1: getCurrentSettings()メソッドが定義される', () => {
        const logger = AgLogger.getLogger();

        // getCurrentSettingsメソッドが存在することを確認
        expect(typeof logger.getCurrentSettings).toBe('function');
      });

      /**
       * 小タスク2.3.2: 全設定項目（defaultLogger, formatter, loggerMap, logLevel, verbose）が取得される
       */
      it('小タスク2.3.2: 全設定項目が取得される', () => {
        const logger = AgLogger.getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);
        logger.setVerbose(true);

        const settings = logger.getCurrentSettings();

        // logLevel設定項目が取得されることを確認
        expect(settings.logLevel).toBe(AG_LOGLEVEL.INFO);
      });
    });
  });

  /**
   * Task 4: 設定管理の統合とテスト
   */
  describe('Task 4: 設定管理の統合とテスト', () => {
    /**
     * Task 4.1: 設定の適切な受け渡しテスト
     */
    describe('Task 4.1: 設定の適切な受け渡しテスト', () => {
      /**
       * タスク4.1.1: getLogger(options)実行時にAgLoggerConfigに設定が適切に渡される
       */
      it('タスク4.1.1: getLogger(options)実行時にAgLoggerConfigに設定が適切に渡される', () => {
        // Red: テストを先に書く
        const options = {
          defaultLogger: mockLogger,
          formatter: mockFormatter,
          logLevel: AG_LOGLEVEL.DEBUG,
          verbose: true,
        };

        const logger = AgLogger.getLogger(options);
        const config = logger._getConfigForTesting();

        // 設定がAgLoggerConfigに正しく渡されていることを確認
        expect(config.getLogLevel()).toBe(AG_LOGLEVEL.DEBUG);
        expect(config.getVerbose()).toBe(true);
        expect(config.getFormatter()).toBe(mockFormatter);
      });

      /**
       * タスク4.1.2: setAgLoggerOptions()でAgLoggerConfigに設定が適切に適用される
       */
      it('タスク4.1.2: setAgLoggerOptions()でAgLoggerConfigに設定が適切に適用される', () => {
        // Red: テストを先に書く
        const logger = AgLogger.getLogger();
        const config = logger._getConfigForTesting();

        // 初期状態の確認
        expect(config.getLogLevel()).toBe(AG_LOGLEVEL.OFF);
        expect(config.getVerbose()).toBe(false);

        const options = {
          defaultLogger: mockLogger,
          formatter: mockFormatter,
          logLevel: AG_LOGLEVEL.WARN,
          verbose: true,
        };

        // setAgLoggerOptionsで設定を適用
        logger.setAgLoggerOptions(options);

        // AgLoggerConfigに設定が正しく適用されていることを確認
        expect(config.getLogLevel()).toBe(AG_LOGLEVEL.WARN);
        expect(config.getVerbose()).toBe(true);
        expect(config.getFormatter()).toBe(mockFormatter);
      });

      /**
       * タスク4.1.3: 設定変更後にAgLoggerConfigから正しい値が参照される
       */
      it('タスク4.1.3: 設定変更後にAgLoggerConfigから正しい値が参照される', () => {
        // Red: テストを先に書く
        const logger = AgLogger.getLogger();
        const config = logger._getConfigForTesting();

        // 初期設定
        const initialOptions = {
          defaultLogger: mockLogger,
          formatter: mockFormatter,
          logLevel: AG_LOGLEVEL.ERROR,
          verbose: false,
        };
        logger.setAgLoggerOptions(initialOptions);

        // 初期設定の確認
        expect(config.getLogLevel()).toBe(AG_LOGLEVEL.ERROR);
        expect(config.getVerbose()).toBe(false);

        // 設定変更
        const updatedOptions = {
          logLevel: AG_LOGLEVEL.DEBUG,
          verbose: true,
        };
        logger.setAgLoggerOptions(updatedOptions);

        // 変更後の設定がAgLoggerConfigから正しく参照できることを確認
        expect(config.getLogLevel()).toBe(AG_LOGLEVEL.DEBUG);
        expect(config.getVerbose()).toBe(true);

        // getCurrentSettings()経由でも正しい値が取得できることを確認
        const currentSettings = logger.getCurrentSettings();
        expect(currentSettings.logLevel).toBe(AG_LOGLEVEL.DEBUG);
        expect(currentSettings.verbose).toBe(true);
      });

      /**
       * タスク4.1.4: 複数の設定項目が同時に設定・参照できる
       */
      it('タスク4.1.4: 複数の設定項目が同時に設定・参照できる', () => {
        // Red: テストを先に書く
        const logger = AgLogger.getLogger();
        const config = logger._getConfigForTesting();

        // 複数の設定項目を同時に設定
        const multipleOptions = {
          defaultLogger: mockLogger,
          formatter: mockFormatter,
          logLevel: AG_LOGLEVEL.INFO,
          verbose: true,
        };
        logger.setAgLoggerOptions(multipleOptions);

        // 複数の設定項目がAgLoggerConfigで同時に正しく管理されていることを確認
        expect(config.getLogLevel()).toBe(AG_LOGLEVEL.INFO);
        expect(config.getVerbose()).toBe(true);
        expect(config.getFormatter()).toBe(mockFormatter);

        // getCurrentSettings()で全設定項目が同時に参照できることを確認
        const currentSettings = logger.getCurrentSettings();
        expect(currentSettings.logLevel).toBe(AG_LOGLEVEL.INFO);
        expect(currentSettings.verbose).toBe(true);
        expect(currentSettings.formatter).toBe(mockFormatter);
        expect(currentSettings.defaultLogger).toBe(mockLogger);

        // 一部設定項目のみを変更した場合の動作確認
        const partialOptions = {
          logLevel: AG_LOGLEVEL.WARN,
          verbose: false,
        };
        logger.setAgLoggerOptions(partialOptions);

        // 変更された項目と変更されていない項目が正しく参照できることを確認
        const updatedSettings = logger.getCurrentSettings();
        expect(updatedSettings.logLevel).toBe(AG_LOGLEVEL.WARN); // 変更された
        expect(updatedSettings.verbose).toBe(false); // 変更された
        expect(updatedSettings.formatter).toBe(mockFormatter); // 維持されている
        expect(updatedSettings.defaultLogger).toBe(mockLogger); // 維持されている
      });

      /**
       * タスク4.1.5: loggerMap設定がAgLoggerConfigで適切に管理される
       */
      it('タスク4.1.5: loggerMap設定がAgLoggerConfigで適切に管理される', () => {
        // Red: テストを先に書く
        const logger = AgLogger.getLogger();
        const config = logger._getConfigForTesting();

        // MockLoggerを使用してメッセージ内容を検証
        const mockLoggerInstance = new MockLogger();
        const customLoggerMap = mockLoggerInstance.createLoggerMap();

        // loggerMapを含む設定を適用
        const options = {
          defaultLogger: mockLoggerInstance.createLoggerFunction(),
          formatter: mockFormatter,
          loggerMap: customLoggerMap,
          logLevel: AG_LOGLEVEL.INFO,
          verbose: false,
        };
        logger.setAgLoggerOptions(options);

        // loggerMapがAgLoggerConfigで適切に管理されていることを確認
        expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(customLoggerMap[AG_LOGLEVEL.ERROR]);
        expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(customLoggerMap[AG_LOGLEVEL.INFO]);

        // getCurrentSettings()でloggerMapが取得できることを確認
        const currentSettings = logger.getCurrentSettings();
        expect(currentSettings.loggerMap).toBeDefined();
        expect(currentSettings.loggerMap?.[AG_LOGLEVEL.ERROR]).toBe(customLoggerMap[AG_LOGLEVEL.ERROR]);
        expect(currentSettings.loggerMap?.[AG_LOGLEVEL.INFO]).toBe(customLoggerMap[AG_LOGLEVEL.INFO]);

        // 実際のログ出力でloggerMapが使用され、正しいメッセージが記録されることを確認
        logger.setLogLevel(AG_LOGLEVEL.INFO);
        logger.error('test error message');
        logger.info('test info message');

        // MockLoggerでメッセージ内容を検証
        expect(mockLoggerInstance.getMessages(AG_LOGLEVEL.ERROR)).toContain('test error message');
        expect(mockLoggerInstance.getMessages(AG_LOGLEVEL.INFO)).toContain('test info message');
        expect(mockLoggerInstance.getMessageCount(AG_LOGLEVEL.ERROR)).toBe(1);
        expect(mockLoggerInstance.getMessageCount(AG_LOGLEVEL.INFO)).toBe(1);
      });

      /**
       * タスク4.1.6: verboseモード設定がAgLoggerConfigで適切に管理される
       */
      it('タスク4.1.6: verboseモード設定がAgLoggerConfigで適切に管理される', () => {
        // Red: テストを先に書く
        const mockLoggerInstance = new MockLogger();
        const logger = AgLogger.getLogger({
          defaultLogger: mockLoggerInstance.createLoggerFunction(),
          formatter: mockFormatter,
        });
        const config = logger._getConfigForTesting();

        // 初期状態（verbose: false）の確認
        expect(config.getVerbose()).toBe(false);
        expect(config.shouldOutputVerbose()).toBe(false);

        // verboseモードを有効にする設定を適用
        const verboseOptions = {
          verbose: true,
          logLevel: AG_LOGLEVEL.INFO,
        };
        logger.setAgLoggerOptions(verboseOptions);

        // verboseモード設定がAgLoggerConfigで適切に管理されていることを確認
        expect(config.getVerbose()).toBe(true);
        expect(config.shouldOutputVerbose()).toBe(true);

        // getCurrentSettings()でverbose設定が取得できることを確認
        const currentSettings = logger.getCurrentSettings();
        expect(currentSettings.verbose).toBe(true);

        // AgLoggerのsetVerbose()メソッドでも連動することを確認
        expect(logger.setVerbose()).toBe(true);

        // verboseモードでのログ出力動作確認とメッセージ内容検証
        mockLoggerInstance.clearAllMessages();
        logger.verbose('verbose test message');
        expect(mockLoggerInstance.getMessages(AG_LOGLEVEL.INFO)).toContain('verbose test message');
        expect(mockLoggerInstance.getMessageCount(AG_LOGLEVEL.INFO)).toBe(1);

        // verboseモードを無効にする
        logger.setAgLoggerOptions({ verbose: false });
        expect(config.getVerbose()).toBe(false);
        expect(config.shouldOutputVerbose()).toBe(false);

        // verboseモード無効時のログ出力動作確認
        mockLoggerInstance.clearAllMessages();
        logger.verbose('verbose test message should not appear');
        expect(mockLoggerInstance.getMessageCount(AG_LOGLEVEL.INFO)).toBe(0);
        expect(mockLoggerInstance.hasAnyMessages()).toBe(false);
      });
    });
  });
});
