// src/plugins/logger/__tests__/ConsoleLogger.spec.ts
// @(#) : Unit tests for ConsoleLogger plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ログレベル定数 - テストで使用するログレベル定義
import { AG_LOG_LEVEL } from '../../../../shared/types';

// テスト対象 - コンソール出力ロガープラグインの実装
import { ConsoleLogger, ConsoleLoggerMap } from '../ConsoleLogger';

// mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

/**
 * ConsoleLoggerプラグインのユニットテストスイート
 *
 * @description コンソール出力ロガーの動作を検証する
 * デフォルトConsoleLogger関数とConsoleLoggerMapの動作、
 * 引数委譲、レベル別コンソールメソッド呼び出しを確認
 *
 * @testType Unit Test
 * @testTarget ConsoleLogger Plugin
 * @coverage
 * - デフォルトConsoleLogger関数の動作
 * - ConsoleLoggerMapのレベル別ログ出力
 * - 引数の適切な委譲
 * - 各ログレベルでの適切なconsoleメソッド呼び出し
 */
describe('ConsoleLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  /**
   * デフォルトConsoleLogger関数の動作テストスイート
   *
   * @description デフォルトのConsoleLogger関数の基本動作を検証する
   * console.logへの引数委譲、空文字列・単一引数処理、メッセージ保持を確認
   *
   * @testFocus Default ConsoleLogger Function
   * @scenarios
   * - console.logへの引数委譲
   * - 空文字列での動作
   * - 単一引数での動作
   * - メッセージ内容の保持
   */
  describe('default ConsoleLogger function', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    /**
     * Ensures console.log is called with the provided arguments.
     */
    it('calls console.log with the given arguments', () => {
      ConsoleLogger('test message');
      expect(console.log).toHaveBeenCalledWith('test message');
    });

    /**
     * Ensures console.log is called correctly with an empty string.
     */
    it('works with empty string', () => {
      ConsoleLogger('');
      expect(console.log).toHaveBeenCalledWith('');
    });

    /**
     * Ensures console.log works with a single argument.
     */
    it('works with a single argument', () => {
      ConsoleLogger('single message');
      expect(console.log).toHaveBeenCalledWith('single message');
    });

    /**
     * Ensures the string message is preserved and logged once.
     */
    it('preserves string message', () => {
      const testMessage = 'test message';
      ConsoleLogger(testMessage);
      expect(console.log).toHaveBeenCalledWith(testMessage);
      expect(console.log).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * ConsoleLoggerMapの動作テストスイート
   *
   * @description ログレベルとコンソールメソッドのマッピング動作を検証する
   * 各ログレベルでの適切なconsoleメソッド呼び出し、フォーマット済みメッセージ処理を確認
   *
   * @testFocus Log Level to Console Method Mapping
   * @scenarios
   * - OFFレベル（NullLogger）の動作
   * - FATAL/ERRORレベル（console.error）の呼び出し
   * - WARNレベル（console.warn）の呼び出し
   * - INFOレベル（console.info）の呼び出し
   * - DEBUG/TRACEレベル（console.debug）の呼び出し
   * - フォーマット済みメッセージの処理
   */
  describe('ConsoleLogger Map', () => {
    /**
     * Tests that the OFF level returns NullLogger.
     */
    it('returns NullLogger for OFF level', () => {
      expect(ConsoleLoggerMap[AG_LOG_LEVEL.OFF]).toBeDefined();
      expect(typeof ConsoleLoggerMap[AG_LOG_LEVEL.OFF]).toBe('function');
    });

    /**
     * Tests that console.error is called for FATAL level.
     */
    it('calls console.error for FATAL level', () => {
      const logFunction = ConsoleLoggerMap[AG_LOG_LEVEL.FATAL];
      expect(logFunction).toBeDefined();

      logFunction!('test fatal message');
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that console.error is called for ERROR level.
     */
    it('calls console.error for ERROR level', () => {
      const logFunction = ConsoleLoggerMap[AG_LOG_LEVEL.ERROR];
      expect(logFunction).toBeDefined();

      logFunction!('test error message');
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that console.warn is called for WARN level.
     */
    it('calls console.warn for WARN level', () => {
      const logFunction = ConsoleLoggerMap[AG_LOG_LEVEL.WARN];
      expect(logFunction).toBeDefined();

      logFunction!('test warn message');
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that console.info is called for INFO level.
     */
    it('calls console.info for INFO level', () => {
      const logFunction = ConsoleLoggerMap[AG_LOG_LEVEL.INFO];
      expect(logFunction).toBeDefined();

      logFunction!('test info message');
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that console.debug is called for DEBUG level.
     */
    it('calls console.debug for DEBUG level', () => {
      const logFunction = ConsoleLoggerMap[AG_LOG_LEVEL.DEBUG];
      expect(logFunction).toBeDefined();

      logFunction!('test debug message');
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that console.debug is called for TRACE level.
     */
    it('calls console.debug for TRACE level', () => {
      const logFunction = ConsoleLoggerMap[AG_LOG_LEVEL.TRACE];
      expect(logFunction).toBeDefined();

      logFunction!('test trace message');
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that the logger correctly processes a formatted message.
     */
    it('correctly processes a formatted message', () => {
      const logFunction = ConsoleLoggerMap[AG_LOG_LEVEL.INFO];
      const formattedMessage = 'formatted log message';
      logFunction!(formattedMessage);
      expect(mockConsole.info).toHaveBeenCalledWith(formattedMessage);
    });
  });
});
