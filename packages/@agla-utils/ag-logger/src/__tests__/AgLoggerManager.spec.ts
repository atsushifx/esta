// src/__tests__/AgLoggerManager.spec.ts
// @(#) : Unit tests for AgLoggerManager class
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ログレベル定数 - テストで使用するログレベル定義
import { AG_LOGLEVEL } from '../../shared/types';
// 型定義 - AgLoggerManagerで使用するログレベル型
import type { AgLogLevel, AgLoggerFunction, AgFormatFunction, AgLoggerOptions } from '../../shared/types';

// テスト対象 - AgLoggerManagerクラスのシングルトン実装
import { AgLoggerManager } from '../AgLoggerManager.class';

// mock functions for testing
const mockDefaultLogger = vi.fn();
const mockFatalLogger = vi.fn();
const mockErrorLogger = vi.fn();
const mockWarnLogger = vi.fn();
const mockDebugLogger = vi.fn();
const mockFormatter = vi.fn();

/**
 * AgLoggerManagerクラスの包括的ユニットテストスイート
 *
 * @description AgLoggerManagerクラスの全機能を機能・目的別にカテゴリー分けし、
 * 各カテゴリー内で正常系・異常系・エッジケースに分類して検証
 *
 * @testType Unit Test
 * @testTarget AgLoggerManager Class
 * @structure
 * - 機能別カテゴリー
 *   - 正常系: 基本的な動作確認
 *   - 異常系: エラー処理、例外時の動作
 *   - エッジケース: 境界値、特殊入力、状態遷移
 */
describe('AgLoggerManager', () => {
  /**
   * テスト前の初期化 - モッククリアとシングルトンリセット
   */
  beforeEach(() => {
    vi.clearAllMocks();
    AgLoggerManager.resetSingleton();
  });

  /**
   * テスト後のクリーンアップ - モッククリアとシングルトンリセット
   */
  afterEach(() => {
    vi.clearAllMocks();
    AgLoggerManager.resetSingleton();
  });

  /**
   * シングルトンインスタンス管理機能
   *
   * @description インスタンス取得、一意性保証、リセット機能のテスト
   */
  describe('Singleton Instance Management', () => {
    /**
     * 正常系: 基本的なシングルトン動作
     */
    describe('正常系: Basic Singleton Operations', () => {
      it('returns the same instance on multiple calls', () => {
        const instance1 = AgLoggerManager.getManager();
        const instance2 = AgLoggerManager.getManager();

        expect(instance1).toBe(instance2);
        expect(instance1).toBeInstanceOf(AgLoggerManager);
      });

      it('should reset singleton correctly', () => {
        const instance1 = AgLoggerManager.getManager();
        AgLoggerManager.resetSingleton();
        const instance2 = AgLoggerManager.getManager();

        expect(instance1).not.toBe(instance2);
      });

      it('maintains singleton with different parameters', () => {
        const manager1 = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });
        const manager2 = AgLoggerManager.getManager({ formatter: mockFormatter });

        expect(manager1).toBe(manager2);
      });
    });

    /**
     * 異常系: インスタンス取得エラー処理
     */
    describe('異常系: Instance Creation Error Handling', () => {
      it('handles undefined options gracefully', () => {
        const manager = AgLoggerManager.getManager(undefined);
        expect(manager).toBeInstanceOf(AgLoggerManager);
      });

      it('handles empty options object', () => {
        const manager = AgLoggerManager.getManager({});
        expect(manager).toBeInstanceOf(AgLoggerManager);
      });
    });

    /**
     * エッジケース: 特殊条件でのインスタンス管理
     */
    describe('エッジケース: Special Instance Management Conditions', () => {
      it('should handle rapid instance requests', () => {
        const instances = Array.from({ length: 100 }, () => AgLoggerManager.getManager());

        // 全て同じインスタンスであることを確認
        instances.forEach((instance) => {
          expect(instance).toBe(instances[0]);
        });
      });
    });
  });

  /**
   * 初期設定管理機能
   *
   * @description デフォルト設定、初期化時の状態のテスト
   */
  describe('Initial Configuration Management', () => {
    /**
     * 正常系: 基本的な初期設定
     */
    describe('正常系: Basic Initial Settings', () => {
      it('initially sets all log levels to NullLogger', () => {
        const manager = AgLoggerManager.getManager();

        const offLogger = manager.getLogger(AG_LOGLEVEL.OFF);
        const fatalLogger = manager.getLogger(AG_LOGLEVEL.FATAL);
        const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
        const warnLogger = manager.getLogger(AG_LOGLEVEL.WARN);
        const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);
        const debugLogger = manager.getLogger(AG_LOGLEVEL.DEBUG);
        const traceLogger = manager.getLogger(AG_LOGLEVEL.TRACE);

        expect(typeof offLogger).toBe('function');
        expect(typeof fatalLogger).toBe('function');
        expect(typeof errorLogger).toBe('function');
        expect(typeof warnLogger).toBe('function');
        expect(typeof infoLogger).toBe('function');
        expect(typeof debugLogger).toBe('function');
        expect(typeof traceLogger).toBe('function');
      });

      it('initially sets formatter to NullFormat', () => {
        const manager = AgLoggerManager.getManager();
        const formatter = manager.getFormatter();
        expect(typeof formatter).toBe('function');
      });
    });

    /**
     * 異常系: 初期設定エラー処理
     */
    describe('異常系: Initial Configuration Error Handling', () => {
      it('should handle null initial configurations', () => {
        const manager = AgLoggerManager.getManager({
          defaultLogger: null as unknown as AgLoggerFunction,
          formatter: null as unknown as AgFormatFunction,
        });

        expect(manager).toBeInstanceOf(AgLoggerManager);
      });
    });

    /**
     * エッジケース: 特殊初期設定
     */
    describe('エッジケース: Special Initial Configurations', () => {
      it('should maintain initial settings consistency', () => {
        const manager = AgLoggerManager.getManager();

        // 全レベルで同じ初期ロガーが使用されることを確認
        const levels = Object.values(AG_LOGLEVEL).filter((v) => typeof v === 'number') as AgLogLevel[];
        const loggers = levels.map((level) => manager.getLogger(level));

        // 全て関数であることを確認（NullLoggerの性質）
        loggers.forEach((logger) => {
          expect(typeof logger).toBe('function');
        });
      });
    });
  });

  /**
   * コンストラクタオプション処理機能
   *
   * @description インスタンス作成時のオプション適用のテスト
   */
  describe('Constructor Options Processing', () => {
    /**
     * 正常系: 基本的なオプション処理
     */
    describe('正常系: Basic Options Processing', () => {
      it('accepts default logger when getting instance', () => {
        const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

        const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);
        infoLogger('test message');

        expect(mockDefaultLogger).toHaveBeenCalledWith('test message');
      });

      it('accepts formatter when getting instance', () => {
        const manager = AgLoggerManager.getManager({ formatter: mockFormatter });

        const formatter = manager.getFormatter();
        expect(formatter).toBe(mockFormatter);
      });

      it('accepts logger map when getting instance', () => {
        const loggerMap = {
          [AG_LOGLEVEL.ERROR]: mockErrorLogger,
          [AG_LOGLEVEL.WARN]: mockWarnLogger,
        };

        const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger, loggerMap: loggerMap });

        const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
        const warnLogger = manager.getLogger(AG_LOGLEVEL.WARN);
        const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);

        errorLogger('error message');
        warnLogger('warn message');
        infoLogger('info message');

        expect(mockErrorLogger).toHaveBeenCalledWith('error message');
        expect(mockWarnLogger).toHaveBeenCalledWith('warn message');
        expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
      });

      it('accepts all options when getting instance', () => {
        const loggerMap = {
          [AG_LOGLEVEL.FATAL]: mockFatalLogger,
          [AG_LOGLEVEL.ERROR]: mockErrorLogger,
        };

        const manager = AgLoggerManager.getManager({
          defaultLogger: mockDefaultLogger,
          formatter: mockFormatter,
          loggerMap: loggerMap,
        });

        const fatalLogger = manager.getLogger(AG_LOGLEVEL.FATAL);
        const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
        const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);

        fatalLogger('fatal message');
        errorLogger('error message');
        infoLogger('info message');

        expect(mockFatalLogger).toHaveBeenCalledWith('fatal message');
        expect(mockErrorLogger).toHaveBeenCalledWith('error message');
        expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
      });
    });

    /**
     * 異常系: 無効なオプション処理
     */
    describe('異常系: Invalid Options Processing', () => {
      it('handles partial logger map correctly', () => {
        const manager = AgLoggerManager.getManager({
          defaultLogger: mockDefaultLogger,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: mockErrorLogger,
            // 他のレベルは指定しない
          },
        });

        const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
        const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);

        errorLogger('error');
        infoLogger('info');

        expect(mockErrorLogger).toHaveBeenCalledWith('error');
        expect(mockDefaultLogger).toHaveBeenCalledWith('info');
      });

      it('handles undefined values in loggerMap correctly', () => {
        const manager = AgLoggerManager.getManager({
          defaultLogger: mockDefaultLogger,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: mockErrorLogger,
            [AG_LOGLEVEL.WARN]: undefined as AgLoggerFunction | null | undefined, // 意図的なundefined
            [AG_LOGLEVEL.INFO]: mockDefaultLogger,
          },
        });

        const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
        const warnLogger = manager.getLogger(AG_LOGLEVEL.WARN);
        const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);

        expect(errorLogger).toBe(mockErrorLogger);
        expect(warnLogger).toBe(mockDefaultLogger); // undefinedの場合はdefaultLogger
        expect(infoLogger).toBe(mockDefaultLogger);
      });
    });

    /**
     * エッジケース: 特殊オプション組み合わせ
     */
    describe('エッジケース: Special Options Combinations', () => {
      it('handles empty loggerMap correctly', () => {
        const manager = AgLoggerManager.getManager({
          defaultLogger: mockDefaultLogger,
          loggerMap: {},
        });

        // 全てのloggerがdefaultLoggerになることを確認
        const levels = [AG_LOGLEVEL.ERROR, AG_LOGLEVEL.WARN, AG_LOGLEVEL.INFO, AG_LOGLEVEL.DEBUG];
        levels.forEach((level) => {
          const logger = manager.getLogger(level);
          expect(logger).toBe(mockDefaultLogger);
        });
      });

      it('should handle options with mixed valid and invalid values', () => {
        const manager = AgLoggerManager.getManager({
          defaultLogger: mockDefaultLogger,
          formatter: mockFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: mockErrorLogger,
            [999 as AgLogLevel]: vi.fn(), // 無効なレベル
          },
        });

        expect(manager).toBeInstanceOf(AgLoggerManager);
        expect(manager.getFormatter()).toBe(mockFormatter);
      });
    });
  });

  /**
   * ロガー取得機能
   *
   * @description ログレベル別ロガー取得、フォールバック処理のテスト
   */
  describe('Logger Retrieval Functionality', () => {
    /**
     * 正常系: 基本的なロガー取得
     */
    describe('正常系: Basic Logger Retrieval', () => {
      it('returns logger function for specified log level', () => {
        const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

        const logger = manager.getLogger(AG_LOGLEVEL.INFO);
        expect(typeof logger).toBe('function');

        logger('test message');
        expect(mockDefaultLogger).toHaveBeenCalledWith('test message');
      });

      it('returns specific logger when configured', () => {
        const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });
        manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, mockErrorLogger);

        const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
        const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);

        expect(errorLogger).toBe(mockErrorLogger);
        expect(infoLogger).toBe(mockDefaultLogger);
      });
    });

    /**
     * 異常系: 無効なログレベル処理
     */
    describe('異常系: Invalid Log Level Handling', () => {
      it('returns default logger if log level does not exist', () => {
        const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

        const logger = manager.getLogger(999 as AgLogLevel);
        expect(logger).toBe(mockDefaultLogger);
      });
    });

    /**
     * フォーマッター管理機能
     *
     * @description フォーマッター取得、設定、更新のテスト
     */
    describe('Formatter Management Functionality', () => {
      /**
       * 正常系: 基本的なフォーマッター管理
       */
      describe('正常系: Basic Formatter Management', () => {
        it('returns the configured formatter', () => {
          const manager = AgLoggerManager.getManager({ formatter: mockFormatter });

          const formatter = manager.getFormatter();
          expect(formatter).toBe(mockFormatter);
        });

        it('defaults to NullFormat formatter', () => {
          const manager = AgLoggerManager.getManager();

          const formatter = manager.getFormatter();
          expect(typeof formatter).toBe('function');
        });

        it('allows formatter to be updated', () => {
          const manager = AgLoggerManager.getManager();
          const newMockFormatter = vi.fn();

          manager.setManager({ formatter: newMockFormatter });

          const formatter = manager.getFormatter();
          expect(formatter).toBe(newMockFormatter);
        });
      });

      /**
       * 異常系: フォーマッターエラー処理
       */
      describe('異常系: Formatter Error Handling', () => {
        it('handles formatter function throwing errors', () => {
          const throwingFormatter = vi.fn(() => {
            throw new Error('Formatter error');
          });
          const manager = AgLoggerManager.getManager({ formatter: throwingFormatter });

          const formatter = manager.getFormatter();
          const testMessage = { logLevel: 1 as AgLogLevel, timestamp: new Date(), message: 'test', args: [] };
          expect(() => formatter(testMessage)).toThrow('Formatter error');
        });

        it('handles undefined formatter gracefully', () => {
          const manager = AgLoggerManager.getManager({ formatter: undefined as AgFormatFunction | undefined });

          expect(manager).toBeInstanceOf(AgLoggerManager);
        });
      });

      /**
       * エッジケース: フォーマッター特殊動作
       */
      describe('エッジケース: Special Formatter Behaviors', () => {
        it('handles formatter replacement multiple times', () => {
          const manager = AgLoggerManager.getManager();
          const formatters = [vi.fn(), vi.fn(), vi.fn()];

          formatters.forEach((formatter) => {
            manager.setManager({ formatter });
            expect(manager.getFormatter()).toBe(formatter);
          });
        });
      });
    });

    /**
     * 設定管理機能 (setManager)
     *
     * @description 設定更新、統合処理のテスト
     */
    describe('Configuration Management (setManager)', () => {
      /**
       * 正常系: 基本的な設定管理
       */
      describe('正常系: Basic Configuration Management', () => {
        it('updates default logger', () => {
          const manager = AgLoggerManager.getManager();

          manager.setManager({ defaultLogger: mockDefaultLogger });

          const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);
          infoLogger('info message');

          expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
        });

        it('updates formatter', () => {
          const manager = AgLoggerManager.getManager();

          manager.setManager({ formatter: mockFormatter });

          const formatter = manager.getFormatter();
          expect(formatter).toBe(mockFormatter);
        });

        it('updates logger map', () => {
          const manager = AgLoggerManager.getManager();

          const loggerMap = {
            [AG_LOGLEVEL.ERROR]: mockErrorLogger,
            [AG_LOGLEVEL.WARN]: mockWarnLogger,
          };

          manager.setManager({ loggerMap });

          const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
          const warnLogger = manager.getLogger(AG_LOGLEVEL.WARN);

          errorLogger('error message');
          warnLogger('warn message');

          expect(mockErrorLogger).toHaveBeenCalledWith('error message');
          expect(mockWarnLogger).toHaveBeenCalledWith('warn message');
        });

        it('updates all options at once', () => {
          const manager = AgLoggerManager.getManager();

          const loggerMap = {
            [AG_LOGLEVEL.FATAL]: mockFatalLogger,
            [AG_LOGLEVEL.DEBUG]: mockDebugLogger,
          };

          manager.setManager({
            defaultLogger: mockDefaultLogger,
            formatter: mockFormatter,
            loggerMap,
          });

          expect(manager.getFormatter()).toBe(mockFormatter);

          const fatalLogger = manager.getLogger(AG_LOGLEVEL.FATAL);
          const debugLogger = manager.getLogger(AG_LOGLEVEL.DEBUG);
          const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);

          fatalLogger('fatal message');
          debugLogger('debug message');
          infoLogger('info message');

          expect(mockFatalLogger).toHaveBeenCalledWith('fatal message');
          expect(mockDebugLogger).toHaveBeenCalledWith('debug message');
          expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
        });
      });

      /**
       * 異常系: 設定エラー処理
       */
      describe('異常系: Configuration Error Handling', () => {
        it('handles invalid configuration objects', () => {
          const manager = AgLoggerManager.getManager();

          expect(() => manager.setManager({} as AgLoggerOptions)).not.toThrow();
          expect(() => manager.setManager({ invalidProp: 'test' } as unknown as AgLoggerOptions)).not.toThrow();
        });
      });

      /**
       * エッジケース: 複雑な設定パターン
       */
      describe('エッジケース: Complex Configuration Patterns', () => {
        it('handles multiple setManager calls', () => {
          const manager = AgLoggerManager.getManager();

          manager.setManager({ defaultLogger: mockDefaultLogger });
          manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, mockErrorLogger);
          manager.setManager({ formatter: mockFormatter });

          const secondMockLogger = vi.fn();
          manager.setLogFunctionWithLevel(AG_LOGLEVEL.WARN, secondMockLogger);

          const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
          const warnLogger = manager.getLogger(AG_LOGLEVEL.WARN);
          const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);

          errorLogger('error message');
          warnLogger('warn message');
          infoLogger('info message');

          expect(mockErrorLogger).toHaveBeenCalledWith('error message');
          expect(secondMockLogger).toHaveBeenCalledWith('warn message');
          expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
          expect(manager.getFormatter()).toBe(mockFormatter);
        });
      });
    });

    /**
     * updateLogMap内部処理機能
     *
     * @description ログマップ更新の内部動作のテスト
     */
    describe('updateLogMap Internal Processing', () => {
      /**
       * 正常系: 基本的なマップ更新処理
       */
      describe('正常系: Basic Map Update Processing', () => {
        it('should correctly merge partial logger maps with existing configuration', () => {
          const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

          // 最初の設定
          manager.setManager({
            loggerMap: {
              [AG_LOGLEVEL.ERROR]: mockErrorLogger,
              [AG_LOGLEVEL.WARN]: mockWarnLogger,
            },
          });

          // 部分更新
          manager.setManager({
            loggerMap: {
              [AG_LOGLEVEL.ERROR]: mockFatalLogger, // 上書き
              [AG_LOGLEVEL.DEBUG]: mockDebugLogger, // 追加
            },
          });

          const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
          const warnLogger = manager.getLogger(AG_LOGLEVEL.WARN);
          const debugLogger = manager.getLogger(AG_LOGLEVEL.DEBUG);
          const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);

          expect(errorLogger).toBe(mockFatalLogger); // 上書きされた
          expect(warnLogger).toBe(mockDefaultLogger); // defaultLoggerにリセットされた
          expect(debugLogger).toBe(mockDebugLogger); // 新規追加
          expect(infoLogger).toBe(mockDefaultLogger); // デフォルトのまま
        });

        it('should handle loggerMap priority over defaultLogger correctly', () => {
          const manager = AgLoggerManager.getManager();

          // defaultLoggerとloggerMapを同時設定
          manager.setManager({
            defaultLogger: mockDefaultLogger,
            loggerMap: {
              [AG_LOGLEVEL.ERROR]: mockErrorLogger,
            },
          });

          const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
          const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);

          expect(errorLogger).toBe(mockErrorLogger); // loggerMapが優先
          expect(infoLogger).toBe(mockDefaultLogger); // 未設定レベルはdefaultLogger
        });

        it('should apply defaultLogger to all levels before loggerMap override', () => {
          const manager = AgLoggerManager.getManager();
          const firstDefaultLogger = vi.fn();
          const secondDefaultLogger = vi.fn();

          // 最初のdefaultLogger設定
          manager.setManager({ defaultLogger: firstDefaultLogger });

          // 全レベルが最初のdefaultLoggerになることを確認
          const infoLogger1 = manager.getLogger(AG_LOGLEVEL.INFO);
          expect(infoLogger1).toBe(firstDefaultLogger);

          // 新しいdefaultLoggerとloggerMapを同時設定
          manager.setManager({
            defaultLogger: secondDefaultLogger,
            loggerMap: {
              [AG_LOGLEVEL.ERROR]: mockErrorLogger,
            },
          });

          const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
          const infoLogger2 = manager.getLogger(AG_LOGLEVEL.INFO);

          expect(errorLogger).toBe(mockErrorLogger); // loggerMapが優先
          expect(infoLogger2).toBe(secondDefaultLogger); // 新しいdefaultが適用
        });
      });

      /**
       * 異常系: マップ更新エラー処理
       */
      describe('異常系: Map Update Error Handling', () => {
        it('should preserve unchanged levels when updating loggerMap', () => {
          const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

          // 初期設定
          manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, mockErrorLogger);
          manager.setLogFunctionWithLevel(AG_LOGLEVEL.WARN, mockWarnLogger);

          // loggerMap更新（ERRORのみ上書き）
          manager.setManager({
            loggerMap: {
              [AG_LOGLEVEL.ERROR]: mockFatalLogger,
            },
          });

          const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
          const warnLogger = manager.getLogger(AG_LOGLEVEL.WARN);

          expect(errorLogger).toBe(mockFatalLogger); // 更新された
          expect(warnLogger).toBe(mockDefaultLogger); // リセットされた(デフォルトロガーで上書き)
        });
      });

      /**
       * エッジケース: 特殊マップ更新パターン
       */
      describe('エッジケース: Special Map Update Patterns', () => {
        it('should handle complex configuration scenarios', () => {
          const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

          manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, mockErrorLogger);
          manager.setManager({ formatter: mockFormatter });

          expect(manager.getFormatter()).toBe(mockFormatter);

          const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
          const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);

          errorLogger('error message');
          infoLogger('info message');

          expect(mockErrorLogger).toHaveBeenCalledWith('error message');
          expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
        });

        it('persists configuration across manager method calls', () => {
          const manager = AgLoggerManager.getManager({
            defaultLogger: mockDefaultLogger,
            formatter: mockFormatter,
          });

          manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, mockErrorLogger);

          // 設定が保持されることを確認
          expect(manager.getFormatter()).toBe(mockFormatter);

          const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
          const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);

          expect(errorLogger).toBe(mockErrorLogger);
          expect(infoLogger).toBe(mockDefaultLogger);
        });
      });
    });

    /**
     * 個別ロガー設定機能
     *
     * @description 特定レベルへのロガー設定、リセット機能のテスト
     */
    describe('Individual Logger Configuration', () => {
      /**
       * 正常系: 基本的な個別設定
       */
      describe('正常系: Basic Individual Configuration', () => {
        it('sets specific logger function for specified log level', () => {
          const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

          manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, mockErrorLogger);

          const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
          errorLogger('error message');

          expect(mockErrorLogger).toHaveBeenCalledWith('error message');
        });

        it('does not affect other log levels', () => {
          const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

          manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, mockErrorLogger);

          const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
          const warnLogger = manager.getLogger(AG_LOGLEVEL.WARN);
          const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);

          errorLogger('error message');
          warnLogger('warn message');
          infoLogger('info message');

          expect(mockErrorLogger).toHaveBeenCalledWith('error message');
          expect(mockDefaultLogger).toHaveBeenCalledWith('warn message');
          expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
        });

        it('allows setting different functions for multiple levels', () => {
          const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

          manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, mockErrorLogger);
          manager.setLogFunctionWithLevel(AG_LOGLEVEL.WARN, mockWarnLogger);

          const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
          const warnLogger = manager.getLogger(AG_LOGLEVEL.WARN);
          const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);

          errorLogger('error message');
          warnLogger('warn message');
          infoLogger('info message');

          expect(mockErrorLogger).toHaveBeenCalledWith('error message');
          expect(mockWarnLogger).toHaveBeenCalledWith('warn message');
          expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
        });

        it('resets log level to default logger', () => {
          const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

          manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, mockErrorLogger);
          manager.setDefaultLogFunction(AG_LOGLEVEL.ERROR);

          const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
          errorLogger('error message');

          expect(mockDefaultLogger).toHaveBeenCalledWith('error message');
          expect(mockErrorLogger).not.toHaveBeenCalled();
        });
      });

      /**
       * 異常系: 個別設定エラー処理
       */
      describe('異常系: Individual Configuration Error Handling', () => {
        it('handles invalid log levels in setLogFunctionWithLevel', () => {
          const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

          expect(() => manager.setLogFunctionWithLevel(-1 as AgLogLevel, mockErrorLogger)).not.toThrow();
          expect(() => manager.setLogFunctionWithLevel(999 as AgLogLevel, mockErrorLogger)).not.toThrow();
        });

        it('handles undefined logger functions', () => {
          const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

          expect(() => manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, undefined as unknown as AgLoggerFunction)).not
            .toThrow();
        });
      });

      /**
       * エッジケース: 特殊個別設定パターン
       */
      describe('エッジケース: Special Individual Configuration Patterns', () => {
        it('works even when no custom logger was previously set', () => {
          const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

          manager.setDefaultLogFunction(AG_LOGLEVEL.INFO);

          const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);
          infoLogger('info message');

          expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
        });

        it('handles rapid individual logger changes', () => {
          const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });
          const alternateLogger = vi.fn();

          for (let i = 0; i < 100; i++) {
            const logger = i % 2 === 0 ? mockErrorLogger : alternateLogger;
            manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, logger);
          }

          const finalLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
          expect(finalLogger).toBe(alternateLogger); // 最後に設定されたログ
        });
      });
    });
  });
});
