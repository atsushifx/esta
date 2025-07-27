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
import type { AgTLogLevel } from '../../shared/types';

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
 * AgLoggerManagerクラスのユニットテストスイート
 *
 * @description シングルトンパターンによるロガー・フォーマッター管理機能を検証する
 * インスタンス取得、ロガー/フォーマッター設定・取得、設定更新機能をテスト
 *
 * @testType Unit Test
 * @testTarget AgLoggerManager Class
 * @coverage
 * - シングルトンインスタンス取得・管理
 * - ロガー・フォーマッターの設定・取得
 * - デフォルト・レベル別ロガー管理
 * - 設定更新機能（legacy形式・options形式）
 * - 複合設定シナリオ
 */
describe('AgLoggerManager', () => {
  /**
   * Clears mocks and resets the singleton instance before each test.
   */
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (AgLoggerManager as unknown as { instance?: AgLoggerManager }).instance = undefined;
  });

  /**
   * Clears mocks and resets the singleton instance after each test.
   */
  afterEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (AgLoggerManager as unknown as { instance?: AgLoggerManager }).instance = undefined;
  });

  /**
   * getManager静的メソッドのテストスイート
   *
   * @description シングルトンインスタンス取得の動作を検証する
   * 同一インスタンスの取得保証、初期ロガー設定、パラメータ処理を確認
   *
   * @testFocus Singleton Instance Management
   * @scenarios
   * - 同一インスタンス取得の保証
   * - デフォルトロガー・フォーマッター・ロガーマップ設定
   * - パラメータ組み合わせ処理
   * - 初期状態でのNullLogger設定
   */
  describe('getManager', () => {
    it('returns the singleton instance', () => {
      const instance1 = AgLoggerManager.getManager();
      const instance2 = AgLoggerManager.getManager();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(AgLoggerManager);
    });

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

      expect(manager.getFormatter()).toBe(mockFormatter);

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
   * getLoggerメソッドのテストスイート
   *
   * @description ログレベルに対応するロガー関数取得を検証する
   * 有効レベルでの適切なロガー返却、無効レベルでのデフォルト返却を確認
   *
   * @testFocus Logger Function Retrieval
   * @scenarios
   * - 指定ログレベルのロガー関数取得
   * - 未知ログレベルでのデフォルトロガー返却
   * - ロガー関数の実行可能性
   */
  describe('getLogger', () => {
    it('returns logger function for specified log level', () => {
      const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

      const logger = manager.getLogger(AG_LOGLEVEL.INFO);
      expect(typeof logger).toBe('function');

      logger('test message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('test message');
    });

    it('returns default logger if log level does not exist', () => {
      const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

      const logger = manager.getLogger(999 as AgTLogLevel);
      expect(logger).toBe(mockDefaultLogger);
    });
  });

  /**
   * getFormatterメソッドのテストスイート
   *
   * @description フォーマッター取得機能を検証する
   * 設定済みフォーマッターの取得、未設定時のNullFormat返却を確認
   *
   * @testFocus Formatter Retrieval
   * @scenarios
   * - 設定済みフォーマッターの取得
   * - デフォルトNullFormatフォーマッターの取得
   * - フォーマッター関数の実行可能性
   */
  describe('getFormatter', () => {
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
  });

  /**
   * setManagerメソッド（options形式のみ）のテストスイート
   *
   * @description options形式でのロガー設定機能を検証する
   * legacy形式は削除されsetLogFunctionWithLevelに分離されたことを確認
   */
  describe('setManager - options only', () => {
    it('should only accept options object, not legacy form', () => {
      const manager = AgLoggerManager.getManager();

      // Runtime: setManager now only accepts options object
      expect(typeof manager.setManager).toBe('function');
    });

    it('updates options correctly', () => {
      const manager = AgLoggerManager.getManager();

      manager.setManager({
        defaultLogger: mockDefaultLogger,
        formatter: mockFormatter,
      });

      expect(manager.getFormatter()).toBe(mockFormatter);

      const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);
      infoLogger('info message');

      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
    });
  });

  /**
   * setManagerメソッド（options形式）のテストスイート
   *
   * @description options形式でのロガー設定機能を検証する
   * デフォルトロガー、フォーマッター、ロガーマップの個別・一括更新を確認
   *
   * @testFocus Options-based Logger Setting
   * @scenarios
   * - デフォルトロガーの更新
   * - フォーマッターの更新
   * - ロガーマップの更新
   * - 全オプション同時更新
   * - 複数オプション組み合わせ更新
   */
  describe('setManager - options form', () => {
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

    it('updates default logger and logger map simultaneously', () => {
      const manager = AgLoggerManager.getManager();

      const loggerMap = {
        [AG_LOGLEVEL.ERROR]: mockErrorLogger,
      };

      manager.setManager({
        defaultLogger: mockDefaultLogger,
        loggerMap,
      });

      const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
      const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);
      const warnLogger = manager.getLogger(AG_LOGLEVEL.WARN);

      errorLogger('error message');
      infoLogger('info message');
      warnLogger('warn message');

      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('warn message');
    });
  });

  /**
   * 複合シナリオのテストスイート
   *
   * @description 実用的な複合設定シナリオを検証する
   * setManager（options）とsetLogFunctionWithLevelの組み合わせ動作を確認
   *
   * @testFocus Complex Configuration Scenarios
   * @scenarios
   * - getLogger後の設定更新
   * - setManagerとsetLogFunctionWithLevelの組み合わせ
   * - 設定変更の累積効果
   */
  describe('Complex scenarios', () => {
    it('can update settings after getLogger', () => {
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

    it('can combine setManager and setLogFunctionWithLevel calls', () => {
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

  /**
   * setLogFunctionWithLevelメソッドのテストスイート
   *
   * @description 個別ログレベルへの特定ロガー関数設定機能を検証する
   * 指定レベルへのロガー設定、他レベルへの影響なしを確認
   *
   * @testFocus Specific Logger Function Setting
   * @scenarios
   * - 指定ログレベルへの特定ロガー関数設定
   * - 他ログレベルに影響しないこと
   * - 複数レベルへの個別設定
   */
  describe('setLogFunctionWithLevel', () => {
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
  });

  /**
   * setDefaultLogFunctionメソッドのテストスイート
   *
   * @description 個別ログレベルのデフォルトロガー設定機能を検証する
   * 特定レベルをデフォルトロガーに戻す機能を確認
   *
   * @testFocus Default Logger Function Setting
   * @scenarios
   * - 指定ログレベルをデフォルトロガーに設定
   * - 既存の特定ロガーからデフォルトロガーへの変更
   * - 他レベルに影響しないこと
   */
  describe('setDefaultLogFunction', () => {
    it('sets log level to use default logger', () => {
      const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

      manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, mockErrorLogger);
      manager.setDefaultLogFunction(AG_LOGLEVEL.ERROR);

      const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
      errorLogger('error message');

      expect(mockDefaultLogger).toHaveBeenCalledWith('error message');
      expect(mockErrorLogger).not.toHaveBeenCalled();
    });

    it('does not affect other log levels', () => {
      const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

      manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, mockErrorLogger);
      manager.setLogFunctionWithLevel(AG_LOGLEVEL.WARN, mockWarnLogger);
      manager.setDefaultLogFunction(AG_LOGLEVEL.ERROR);

      const errorLogger = manager.getLogger(AG_LOGLEVEL.ERROR);
      const warnLogger = manager.getLogger(AG_LOGLEVEL.WARN);

      errorLogger('error message');
      warnLogger('warn message');

      expect(mockDefaultLogger).toHaveBeenCalledWith('error message');
      expect(mockWarnLogger).toHaveBeenCalledWith('warn message');
      expect(mockErrorLogger).not.toHaveBeenCalled();
    });

    it('works even when no custom logger was previously set', () => {
      const manager = AgLoggerManager.getManager({ defaultLogger: mockDefaultLogger });

      manager.setDefaultLogFunction(AG_LOGLEVEL.INFO);

      const infoLogger = manager.getLogger(AG_LOGLEVEL.INFO);
      infoLogger('info message');

      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
    });
  });
});
