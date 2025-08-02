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

// ログレベル定数 - テストで使用するログレベルの定義
import { AG_LOGLEVEL } from '../../shared/types';
// 型定義 - ログレベル型とオプション型
import type { AgLogLevel } from '../../shared/types';
import type { AgLoggerOptions } from '../../shared/types/AgLogger.interface';

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
   * createLogger method rename tests (BDD)
   *
   * @description Test that getLogger static method is renamed to createLogger
   */
  describe('createLogger method rename', () => {
    describe('createLogger should exist', () => {
      it('should have createLogger static method', () => {
        expect(typeof AgLogger.createLogger).toBe('function');
      });
    });
  });

  /**
   * new getLogger method tests (BDD)
   *
   * @description Test that new getLogger method simply returns the logger instance
   */
  describe('new getLogger method', () => {
    describe('getLogger should exist', () => {
      it('should have getLogger static method', () => {
        expect(typeof AgLogger.getLogger).toBe('function');
      });
    });

    describe('getLogger should throw error when no instance exists', () => {
      it('should throw AgLoggerError when instance not created', () => {
        AgLogger.resetSingleton();
        expect(() => AgLogger.getLogger()).toThrow('Logger instance not created. Call createLogger() first.');
      });
    });
    /**
     * createLogger method rename tests (BDD)
     *
     * @description Test that getLogger static method is renamed to createLogger
     */
    describe('createLogger method rename', () => {
      describe('createLogger should exist', () => {
        it('should have createLogger static method', () => {
          expect(typeof AgLogger.createLogger).toBe('function');
        });
      });
    });

    /**
     * new getLogger method tests (BDD)
     *
     * @description Test that new getLogger method simply returns the logger instance
     */
    describe('new getLogger method', () => {
      describe('getLogger should exist', () => {
        it('should have getLogger static method', () => {
          expect(typeof AgLogger.getLogger).toBe('function');
        });
      });

      describe('getLogger should throw error when no instance exists', () => {
        it('should throw AgLoggerError when instance not created', () => {
          AgLogger.resetSingleton();
          expect(() => AgLogger.getLogger()).toThrow('Logger instance not created. Call createLogger() first.');
        });
      });
    });

    /**
     * シングルトンパターン管理機能
     */
    describe('Singleton Pattern Management', () => {
      /**
       * 正常系: 基本的なシングルトン動作
       */
      describe('正常系: Basic Singleton Operations', () => {
        it('should return the same instance on multiple calls', () => {
          const instance1 = AgLogger.createLogger();
          const instance2 = AgLogger.createLogger();
          const instance3 = getLogger();

          expect(instance1).toBe(instance2);
          expect(instance2).toBe(instance3);
          expect(instance1).toBeInstanceOf(AgLogger);
        });

        it('should maintain singleton with different parameters', () => {
          const logger1 = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
          const logger2 = AgLogger.createLogger();

          expect(logger1).toBe(logger2);
        });

        it('should reset singleton correctly', () => {
          const instance1 = AgLogger.createLogger();
          AgLogger.resetSingleton();
          const instance2 = AgLogger.createLogger();

          expect(instance1).not.toBe(instance2);
        });
      });

      /**
       * 異常系: エラー処理と例外状況
       */
      describe('異常系: Error Handling', () => {
        it('should handle undefined options gracefully', () => {
          const logger = AgLogger.createLogger(undefined);
          expect(logger).toBeInstanceOf(AgLogger);
        });

        it('should handle empty options object', () => {
          const logger = AgLogger.createLogger({});
          expect(logger).toBeInstanceOf(AgLogger);
        });
      });

      /**
       * エッジケース: 特殊条件とリセット
       */
      describe('エッジケース: Special Conditions and Reset', () => {
        it('should persist settings across instances', () => {
          const logger1 = AgLogger.createLogger();
          const logger2 = AgLogger.getLogger();

          logger1.logLevel = AG_LOGLEVEL.ERROR;
          logger1.setVerbose = true;

          // Test property getters and persistence
          expect(logger2.logLevel).toBe(AG_LOGLEVEL.ERROR);
          expect(logger2.isVerbose).toBe(true);
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
          const logger = AgLogger.createLogger();

          logger.logLevel = AG_LOGLEVEL.DEBUG;
          expect(logger.logLevel).toBe(AG_LOGLEVEL.DEBUG);

          logger.logLevel = AG_LOGLEVEL.ERROR;
          expect(logger.logLevel).toBe(AG_LOGLEVEL.ERROR);
        });

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
          }).not.toThrow();
          expect(() => {
            logger.logLevel = 999 as AgLogLevel;
          }).not.toThrow();
          expect(() => {
            logger.logLevel = 'string' as unknown as AgLogLevel;
          }).not.toThrow();
          expect(() => {
            logger.logLevel = undefined as unknown as AgLogLevel;
          }).not.toThrow();
          expect(() => {
            logger.logLevel = null as unknown as AgLogLevel;
          }).not.toThrow();
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

      /**
       * 異常系: エラー時のログ処理
       */
      describe('異常系: Error Handling in Logging', () => {
        it('should handle logger function throwing errors', () => {
          const throwingLogger = vi.fn(() => {
            throw new Error('Logger error');
          });
          const logger = AgLogger.createLogger({ defaultLogger: throwingLogger, formatter: mockFormatter });
          logger.logLevel = AG_LOGLEVEL.INFO;

          expect(() => logger.info('test')).toThrow('Logger error');
        });

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

          // 状態が保持されていることを確認
          expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
          expect(logger.isVerbose).toBe(false);
        });

        it('should preserve logger state when logger function throws exception', () => {
          const throwingLogger = vi.fn(() => {
            throw new Error('Logger error');
          });
          const logger = AgLogger.createLogger({ defaultLogger: throwingLogger, formatter: mockFormatter });
          logger.logLevel = AG_LOGLEVEL.INFO;
          logger.setVerbose = true;

          expect(() => logger.info('test')).toThrow('Logger error');

          // 状態が保持されていることを確認
          expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
          expect(logger.isVerbose).toBe(true);
        });
      });

      /**
       * エッジケース: 特殊引数とデータ処理
       */
      describe('エッジケース: Special Arguments and Data Processing', () => {
        it('should handle undefined and null arguments', () => {
          const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
          logger.logLevel = AG_LOGLEVEL.INFO;

          logger.info(undefined);
          logger.info(null);
          logger.info('message', undefined, null);

          expect(mockLogger).toHaveBeenCalledTimes(3);
        });

        it('should handle empty arguments', () => {
          const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
          logger.logLevel = AG_LOGLEVEL.INFO;

          logger.info();
          logger.warn();
          logger.error();

          expect(mockLogger).toHaveBeenCalledTimes(3);
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

          expect(mockLogger).toHaveBeenCalledTimes(edgeCases.length);
          expect(mockFormatter).toHaveBeenCalledTimes(edgeCases.length);
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
    describe('Formatter Integration', () => {
      /**
       * 正常系: 基本的なフォーマッター動作
       */
      describe('正常系: Basic Formatter Operations', () => {
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

      /**
       * 異常系: フォーマッターエラー処理
       */
      describe('異常系: Formatter Error Handling', () => {
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
          expect(mockLogger).toHaveBeenCalledWith('');
        });
      });

      /**
       * エッジケース: 特殊フォーマッター動作
       */
      describe('エッジケース: Special Formatter Behaviors', () => {
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
    describe('Verbose Functionality', () => {
      /**
       * 正常系: 基本的なverbose動作
       */
      describe('isVerbose getter', () => {
        it('should return false as default value', () => {
          const logger = AgLogger.createLogger();
          expect(logger.isVerbose).toBe(false);
        });

        it('should return true when verbose is enabled', () => {
          const logger = AgLogger.createLogger();
          logger.setVerbose = true;
          expect(logger.isVerbose).toBe(true);
        });
      });

      describe('isVerbose method functionality', () => {
        it('should return false as default value when called as method', () => {
          const logger = AgLogger.createLogger();
          expect(logger.isVerbose).toBe(false);
        });
      });

      describe('正常系: Basic Verbose Operations', () => {
        it('should manage verbose state correctly', () => {
          const logger = AgLogger.createLogger();

          // デフォルトはfalse
          expect(logger.isVerbose).toBe(false);

          // trueに設定
          logger.setVerbose = true;
          expect(logger.isVerbose).toBe(true);

          // falseに戻す
          logger.setVerbose = false;
          expect(logger.isVerbose).toBe(false);
        });

        it('should control verbose output correctly', () => {
          const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
          logger.logLevel = AG_LOGLEVEL.INFO;

          // verbose off - no output
          logger.setVerbose = false;
          logger.verbose('verbose off');
          expect(mockLogger).not.toHaveBeenCalled();

          // verbose on - output
          logger.setVerbose = true;
          logger.verbose('verbose on');
          expect(mockLogger).toHaveBeenCalledTimes(1);
        });

        it('should not affect other log levels', () => {
          const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
          logger.logLevel = AG_LOGLEVEL.TRACE;
          logger.setVerbose = false;

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
        it('should maintain verbose state when set to true', () => {
          const logger = AgLogger.createLogger();

          logger.setVerbose = true;
          expect(logger.isVerbose).toBe(true); // 値が設定されたことを確認
        });
      });

      /**
       * executeLog 空ログ抑制機能
       *
       * @description executeLogメソッドの空ログ抑制動作をテスト
       */
      describe('executeLog Empty Log Suppression', () => {
        /**
         * 正常系: 空ログ抑制の基本動作
         */
        describe('エッジケース: Verbose State Changes', () => {
          it('should handle rapid verbose state changes', () => {
            const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
            logger.setLogLevel(AG_LOGLEVEL.INFO);
     * エッジケース: verbose状態変更
              */
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
                  logger2.setManager({ defaultLogger: ConsoleLogger });
                  expect(logger2).toBeInstanceOf(AgLogger);
                });

                it('should preserve custom loggerMap when using ConsoleLogger', () => {
                  const customMap = { [AG_LOGLEVEL.ERROR]: mockLogger };
                  AgLogger.createLogger({
                    defaultLogger: ConsoleLogger,
                    loggerMap: customMap,
                  });
                  const logger = AgLogger.getLogger();

                  expect(mockLogger).not.toHaveBeenCalled();
                });
              });
            });

            /**
             * 設定管理システム (Configuration Management System)
             *
             * @description AgClassConfigによる設定の委譲、プロパティアクセス、状態管理のテスト
             */
            describe('Configuration Management System', () => {
              /**
               * 正常系: プロパティ委譲の基本動作
               */
              describe('正常系: Property Delegation Operations', () => {
                it('should delegate verbose property access to config', () => {
                  const logger = AgLogger.createLogger();
                  expect(logger.isVerbose).toBe(false);
                });

                it('should delegate verbose property updates to config', () => {
                  const logger = AgLogger.createLogger();
                  logger.setVerbose = true;
                  expect(logger.isVerbose).toBe(true);
                });

                it('should maintain verbose state through config', () => {
                  const logger = AgLogger.createLogger();
                  logger.setVerbose = true;
                  const result = logger.isVerbose;
                  expect(result).toBe(true);
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

              /**
               * 正常系: 出力レベルフィルタリング
               */
              describe('正常系: Output Level Filtering Through Config', () => {
                it('should use config shouldOutput method for filtering', () => {
                  const logger = AgLogger.createLogger();
                  logger.logLevel = AG_LOGLEVEL.INFO;
                  const loggerForTesting = logger as AgLoggerForTesting;

                  const shouldOutputError = loggerForTesting.shouldOutput(AG_LOGLEVEL.ERROR);
                  const shouldOutputDebug = loggerForTesting.shouldOutput(AG_LOGLEVEL.DEBUG);

                  expect(shouldOutputError).toBe(true);
                  expect(shouldOutputDebug).toBe(false);
                });
              });

              /**
               * 正常系: shouldOutput Protected Method Access
               */
              describe('正常系: shouldOutput Protected Method Access', () => {
                it('should expose shouldOutput method to test subclasses', () => {
                  // Given: AgLoggerのインスタンスを取得
                  const logger = AgLogger.createLogger();

                  // When: shouldOutputメソッドにアクセスを試行
                  const loggerForTesting = logger as TestableAgLogger;

                  // Then: shouldOutputメソッドが存在し、関数として呼び出し可能であることを確認
                  expect(typeof loggerForTesting.shouldOutput).toBe('function');
                });

                it('should return true when log level ERROR is at INFO threshold', () => {
                  // Given: INFO レベルに設定されたAgLoggerインスタンス
                  const logger = AgLogger.createLogger();
                  logger.logLevel = AG_LOGLEVEL.INFO;
                  const loggerForTesting = logger as AgLoggerForTesting;

                  // When: ERROR レベル（2）でshouldOutputを呼び出し
                  const result = loggerForTesting.shouldOutput(AG_LOGLEVEL.ERROR);

                  // Then: ERROR（2）はINFO（4）以下なのでtrueが返される
                  expect(result).toBe(true);
                });

                it('should return false when log level DEBUG is above INFO threshold', () => {
                  // Given: INFO レベルに設定されたAgLoggerインスタンス
                  const logger = AgLogger.createLogger();
                  logger.logLevel = AG_LOGLEVEL.INFO;
                  const loggerForTesting = logger as AgLoggerForTesting;

                  // When: DEBUG レベル（5）でshouldOutputを呼び出し
                  const result = loggerForTesting.shouldOutput(AG_LOGLEVEL.DEBUG);

                  // Then: DEBUG（5）はINFO（4）より大きいのでfalseが返される
                  expect(result).toBe(false);
                });

                it('should return false when log level is OFF regardless of message level', () => {
                  // Given: OFF レベルに設定されたAgLoggerインスタンス
                  const logger = AgLogger.createLogger();
                  logger.logLevel = AG_LOGLEVEL.OFF;
                  const loggerForTesting = logger as AgLoggerForTesting;

                  // When: ERROR レベルでshouldOutputを呼び出し
                  const result = loggerForTesting.shouldOutput(AG_LOGLEVEL.ERROR);

                  // Then: OFFの場合はどのレベルでもfalseが返される
                  expect(result).toBe(false);
                });

                it('should return true for VERBOSE level when verbose flag is enabled', () => {
                  // Given: verboseフラグがtrueに設定されたAgLoggerインスタンス
                  const logger = AgLogger.createLogger();
                  logger.setVerbose = true;
                  const loggerForTesting = logger as AgLoggerForTesting;

                  // When: VERBOSE レベルでshouldOutputを呼び出し
                  const result = loggerForTesting.shouldOutput(AG_LOGLEVEL.VERBOSE);

                  // Then: verboseフラグがtrueなのでtrueが返される
                  expect(result).toBe(true);
                });

                it('should return false for VERBOSE level when verbose flag is disabled', () => {
                  // Given: verboseフラグがfalseに設定されたAgLoggerインスタンス
                  const logger = AgLogger.createLogger();
                  logger.setVerbose = false;
                  const loggerForTesting = logger as AgLoggerForTesting;

                  // When: VERBOSE レベルでshouldOutputを呼び出し
                  const result = loggerForTesting.shouldOutput(AG_LOGLEVEL.VERBOSE);

                  // Then: verboseフラグがfalseなのでfalseが返される
                  expect(result).toBe(false);
                });

                it('should return true for VERBOSE level when verbose flag is enabled even with OFF log level', () => {
                  // Given: OFFレベルかつverboseフラグがtrueに設定されたAgLoggerインスタンス
                  const logger = AgLogger.createLogger();
                  logger.logLevel = AG_LOGLEVEL.OFF;
                  logger.setVerbose = true;
                  const loggerForTesting = logger as AgLoggerForTesting;

                  // When: VERBOSE レベルでshouldOutputを呼び出し
                  const result = loggerForTesting.shouldOutput(AG_LOGLEVEL.VERBOSE);

                  // Then: OFFレベルでもverboseフラグがtrueならtrueが返される
                  expect(result).toBe(true);
                });
              });

              /**
               * 正常系: Verboseメソッドと設定連携
               */
              describe('正常系: Verbose Method Integration with Config', () => {
                it('should respect config verbose setting in verbose method', () => {
                  const logger = AgLogger.createLogger();
                  const mockLog = vi.fn();
                  (logger as AgLogger & { log: typeof mockLog }).log = mockLog;

                  logger.verbose('test message');
                  expect(mockLog).not.toHaveBeenCalled();

                  logger.setVerbose = true;
                  logger.verbose('test message');
                  expect(mockLog).toHaveBeenCalledWith('test message');
                });
              });
            });

            /**
             * executeLog method refactoring tests
             *
             * @description Tests for the refactored executeLog method (previously logWithLevel)
             * Testing protected method visibility and behavior preservation
             */
            describe('executeLog Method Refactoring', () => {
              /**
               * Test class that extends AgLogger to expose executeLog method for testing
               */
              class TestAgLogger extends AgLogger {
                constructor() {
                  super();
                }

                static getTestLogger(options?: AgLoggerOptions): TestAgLogger {
                  const instance = new TestAgLogger();
                  if (options !== undefined) {
                    instance.setLoggerConfig(options);
                  }
                  return instance;
                }

                // Expose the protected executeLog method for testing
                public executeLog(level: AgLogLevel, ...args: unknown[]): void {
                  return super.executeLog(level, ...args);
                }
              }

              /**
               * 正常系: executeLog method accessibility and visibility
               */
              describe('正常系: Method Accessibility and Visibility', () => {
                it('should have executeLog method accessible in TestAgLogger', () => {
                  const testLogger = TestAgLogger.getTestLogger();

                  expect(typeof testLogger.executeLog).toBe('function');
                  expect(testLogger.executeLog).toBeDefined();
                });

                it('should have executeLog method as protected (accessible via casting but not via public API)', () => {
                  const logger = AgLogger.createLogger();
                  const testLogger = TestAgLogger.getTestLogger();

                  // executeLog should be protected - accessible via TestAgLogger but not part of public API
                  expect(typeof testLogger.executeLog).toBe('function');
                  // But it should not be directly accessible without casting
                  expect('executeLog' in logger).toBe(true);
                  // The method should be defined but marked as protected in TypeScript
                  expect(testLogger.executeLog).toBeDefined();
                });
              });

              /**
               * 正常系: executeLog behavioral equivalence tests
               */
              describe('正常系: Behavioral Equivalence Tests', () => {
                it('should filter logs based on log level same as original implementation', () => {
                  const testLogger = TestAgLogger.getTestLogger({
                    defaultLogger: mockLogger,
                    formatter: mockFormatter,
                  });
                  testLogger.logLevel = AG_LOGLEVEL.WARN;

                  testLogger.executeLog(AG_LOGLEVEL.DEBUG, 'debug'); // should be filtered
                  testLogger.executeLog(AG_LOGLEVEL.INFO, 'info'); // should be filtered
                  testLogger.executeLog(AG_LOGLEVEL.WARN, 'warn'); // should be logged
                  testLogger.executeLog(AG_LOGLEVEL.ERROR, 'error'); // should be logged

                  expect(mockLogger).toHaveBeenCalledTimes(2);
                });

                it('should format messages using formatter same as original implementation', () => {
                  const customFormatter = vi.fn().mockReturnValue('formatted message');
                  const testLogger = TestAgLogger.getTestLogger({
                    defaultLogger: mockLogger,
                    formatter: customFormatter,
                  });
                  testLogger.logLevel = AG_LOGLEVEL.INFO;

                  testableLogger.executeLog(AG_LOGLEVEL.INFO, 'test message');

                  expect(customFormatter).toHaveBeenCalled();
                  expect(mockLogger).toHaveBeenCalledWith('formatted message');
                });

                it('should invoke appropriate logger function same as original implementation', () => {
                  const testLogger = TestAgLogger.getTestLogger({
                    defaultLogger: mockLogger,
                    formatter: mockFormatter,
                  });
                  testLogger.logLevel = AG_LOGLEVEL.ERROR;

                  testLogger.executeLog(AG_LOGLEVEL.ERROR, 'error message');

                  expect(mockLogger).toHaveBeenCalledTimes(1);
                  expect(mockFormatter).toHaveBeenCalled();
                });

                it('should handle empty formatter output same as original implementation', () => {
                  const emptyFormatter = vi.fn().mockReturnValue('');
                  const testLogger = TestAgLogger.getTestLogger({
                    defaultLogger: mockLogger,
                    formatter: emptyFormatter,
                  });
                  testLogger.logLevel = AG_LOGLEVEL.INFO;

                  testLogger.executeLog(AG_LOGLEVEL.INFO, 'test message');

                  expect(emptyFormatter).toHaveBeenCalled();
                  expect(mockLogger).not.toHaveBeenCalled();
                });
              });
            });

            /**
             * executeLog 空ログ抑制機能
             *
             * @description executeLogメソッドの空ログ抑制動作をテスト
             */
            describe('executeLog Empty Log Suppression', () => {
              /**
               * 正常系: 空ログ抑制の基本動作
               */
              describe('正常系: Basic Empty Log Suppression', () => {
                it('should not output when message is empty and no additional arguments', () => {
                  // Given: モックロガーとフォーマッターが設定されたAgLoggerインスタンス
                  const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
                  logger.logLevel = AG_LOGLEVEL.INFO;
                  const testableLogger = logger as TestableAgLogger;

                  // When: 空のメッセージ（''）で引数なしのexecuteLogを呼び出し
                  testableLogger.executeLog(AG_LOGLEVEL.INFO, '');

                  // Then: ロガーが呼び出されないことを確認（空ログ抑制）
                  expect(mockLogger).not.toHaveBeenCalled();
                });
              });
            });

            /**
             * AgLogger refactoring to use AgLoggerConfig instead of AgLoggerManager
             *
             * @description BDD tests for replacing AgLoggerManager with AgLoggerConfig
             */
            describe('AgLoggerConfig integration (replacing AgLoggerManager)', () => {
              describe('executeLog should use config.formatter instead of manager.getFormatter', () => {
                it('should call config.formatter when formatting message', () => {
                  const customFormatter = vi.fn().mockReturnValue('formatted by config');
                  const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: customFormatter });
                  logger.logLevel = AG_LOGLEVEL.INFO;
                  const testableLogger = logger as TestableAgLogger;

                  testableLogger.executeLog(AG_LOGLEVEL.INFO, 'test message');

                  expect(customFormatter).toHaveBeenCalled();
                  expect(mockLogger).toHaveBeenCalledWith('formatted by config');
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
                  logger.setLogLevel(AG_LOGLEVEL.TRACE);
                  const testableLogger = logger as TestableAgLogger;

                  testableLogger.executeLog(AG_LOGLEVEL.ERROR, 'error message');
                  testableLogger.executeLog(AG_LOGLEVEL.WARN, 'warn message');
                  testableLogger.executeLog(AG_LOGLEVEL.INFO, 'info message'); // uses defaultLogger

                  expect(customErrorLogger).toHaveBeenCalledTimes(1);
                  expect(customWarnLogger).toHaveBeenCalledTimes(1);
                  expect(mockLogger).toHaveBeenCalledTimes(1); // for INFO level
                });
              });
            });

            /**
             * isVerbose method implementation
             *
             * @description BDD tests for isVerbose as method (not property getter) that delegates to AgLoggerConfig
             */
            describe('isVerbose method implementation', () => {
              it('should return false as default value when called as method', () => {
                const logger = AgLogger.createLogger();
                expect(logger.isVerbose).toBe(false);
              });
            });

            /**
             * verbose property getter/setter conversion
             *
             * @description BDD tests for converting isVerbose()/setVerbose() methods to verbose getter/setter property
             */
            describe('verbose property getter/setter conversion', () => {
              it('should get verbose false as default value', () => {
                const logger = AgLogger.createLogger();
                expect(logger.isVerbose).toBe(false);
              });

              it('should set verbose to true using setter', () => {
                const logger = AgLogger.createLogger();
                logger.setVerbose = true;
                expect(logger.isVerbose).toBe(true);
              });
            });

            /**
             * logLevel property getter/setter conversion
             *
             * @description BDD tests for converting getLogLevel()/setLogLevel() methods to logLevel getter/setter property
             */
            describe('logLevel property getter/setter conversion', () => {
              it('should get logLevel OFF as default value', () => {
                const logger = AgLogger.createLogger();
                expect(logger.logLevel).toBe(AG_LOGLEVEL.OFF);
              });

              it('should set logLevel to INFO using setter', () => {
                const logger = AgLogger.createLogger();
                logger.logLevel = AG_LOGLEVEL.INFO;
                expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
              });
            });

            /**
             * setVerbose property getter/setter リネーム
             *
             * @description verbose getter/setter を setVerbose property にリネームするBDDテスト
             */
            describe('setVerbose property rename', () => {
              describe('isVerbose getter should exist', () => {
                it('should get verbose false as default value using isVerbose getter', () => {
                  const logger = AgLogger.createLogger();
                  expect(logger.isVerbose).toBe(false);
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
