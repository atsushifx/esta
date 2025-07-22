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

// テスト対象 - AgLoggerクラスのメイン実装
import { AgLogger } from '../AgLogger.class';

// mock functions for testing
const mockLogger = vi.fn();
const mockFormatter = vi.fn().mockImplementation((msg) => msg);

/**
 * AgLoggerクラスのユニットテストスイート
 *
 * @description シングルトンパターンの動作、ログレベルフィルタリング、
 * verbose機能などの核となる機能を検証する
 *
 * @testType Unit Test
 * @testTarget AgLogger Class
 * @coverage
 * - シングルトンインスタンスの一意性
 * - verbose機能のON/OFF制御
 * - ログレベル設定とフィルタリング
 * - 設定の永続化
 */
describe('AgLogger', () => {
  /**
   * Clears mocks and resets the singleton instance before each test.
   */
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (AgLogger as unknown as { _instance?: AgLogger })._instance = undefined;
  });

  /**
   * Clears mocks and resets the singleton instance after each test.
   */
  afterEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (AgLogger as unknown as { _instance?: AgLogger })._instance = undefined;
  });

  /**
   * verbose機能のテストスイート
   *
   * @description verbose モードがログ出力を制御する機能を検証する
   * verbose設定の取得・更新、verbose無効時の出力抑制、
   * verbose有効時の出力許可、他のログレベルへの影響なしを確認
   *
   * @testFocus Verbose Mode Control
   * @scenarios
   * - verbose状態の取得・設定
   * - verbose無効時のログ出力抑制
   * - verbose有効時のログ出力許可
   * - 他のログレベル出力への影響なし
   */
  describe('verbose functionality', () => {
    it('should have setVerbose method that returns current verbose state', () => {
      const logger = AgLogger.getInstance();

      expect(logger.setVerbose()).toBe(false);
    });

    it('should allow setting verbose to true and return the new value', () => {
      const logger = AgLogger.getInstance();

      const result = logger.setVerbose(true);
      expect(result).toBe(true);
      expect(logger.setVerbose()).toBe(true);
    });

    it('should not output verbose log when verbose is false', () => {
      const logger = AgLogger.getInstance(mockLogger, mockFormatter);
      logger.setLogLevel(AG_LOGLEVEL.INFO);
      logger.setVerbose(false);

      logger.verbose('test message');

      expect(mockLogger).not.toHaveBeenCalled();
    });

    it('should output verbose log when verbose is true', () => {
      const logger = AgLogger.getInstance(mockLogger, mockFormatter);
      logger.setLogLevel(AG_LOGLEVEL.INFO);
      logger.setVerbose(true);

      logger.verbose('test message');

      expect(mockLogger).toHaveBeenCalled();
    });

    it('should output other log levels normally when verbose is false', () => {
      const logger = AgLogger.getInstance(mockLogger, mockFormatter);
      logger.setLogLevel(AG_LOGLEVEL.TRACE);
      logger.setVerbose(false);

      logger.debug('debug message');
      logger.trace('trace message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      logger.fatal('fatal message');

      expect(mockLogger).toHaveBeenCalledTimes(6);
    });
  });
});
