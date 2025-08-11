// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// src/__tests__/AgLogger.log.spec.ts
// @(#) : Simplified unit tests for AgLogger.log method
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// constants
import { DISABLE, ENABLE } from '../../../shared/constants/common.constants';

// ログレベル定数 - テストで使用するログレベルの定義
import { AG_LOGLEVEL } from '../../../shared/types';

// テスト対象 - AgLoggerクラスのメイン実装
import { AgLogger } from '../../AgLogger.class';

// プラグイン - テストに必要なフォーマッター・ロガー
import { PlainFormatter } from '../../plugins/formatter/PlainFormatter';
import { ConsoleLogger } from '../../plugins/logger/ConsoleLogger';

/**
 * AgLogger.log メソッドの簡潔なユニットテストスイート
 *
 * @description logメソッド（強制出力機能）の基本機能をテスト
 * verboseモードやログレベルに関係なく常に出力されることを検証
 *
 * @testType Unit Test
 * @testTarget AgLogger.log method (Force Output)
 * @structure
 * - 強制出力: ログレベルに関係なく出力
 * - verbose独立性: verboseモードに関係なく出力
 * - 引数処理: 基本的な引数パターン
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
 * console.logのモックスパイ
 */
let consoleLogSpy: ReturnType<typeof vi.spyOn>;

/**
 * AgLogger.log ユニットテスト
 * @description 強制出力の基本挙動と引数処理を検証
 */
describe('AgLogger.log method tests', () => {
  setupTestEnvironment();

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('強制出力: Force output behavior', () => {
    it('should always output regardless of log level OFF', () => {
      const logger = AgLogger.createLogger({
        defaultLogger: ConsoleLogger,
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.OFF; // すべてのログをブロック

      logger.log('forced output message'); // 強制出力

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('forced output message'));
    });

    it('should always output regardless of high log level', () => {
      const logger = AgLogger.createLogger({
        defaultLogger: ConsoleLogger,
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.FATAL; // 最高レベル

      logger.log('forced output at FATAL level'); // 強制出力

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('forced output at FATAL level'));
    });

    it('should work independently of verbose mode', () => {
      const logger = AgLogger.createLogger({
        defaultLogger: ConsoleLogger,
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.OFF;
      logger.setVerbose = DISABLE;

      logger.log('forced output - verbose disabled'); // 強制出力

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('forced output - verbose disabled'));
    });
  });

  describe('引数処理: Argument handling', () => {
    it('should handle single string message', () => {
      const logger = AgLogger.createLogger({
        defaultLogger: ConsoleLogger,
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.log('single message');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('single message'));
    });

    it('should handle multiple arguments', () => {
      const logger = AgLogger.createLogger({
        defaultLogger: ConsoleLogger,
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      const obj = { key: 'value' };
      logger.log('multi message', obj, 42, true);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('multi message 42 true {"key":"value"}'));
    });

    it('should handle empty arguments', () => {
      const logger = AgLogger.createLogger({
        defaultLogger: ConsoleLogger,
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.log();

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/));
    });
  });

  describe('独立性確認: Independence verification', () => {
    it('should ignore all log level restrictions', () => {
      const logger = AgLogger.createLogger({
        defaultLogger: ConsoleLogger,
        formatter: PlainFormatter,
      });

      // 異なるレベルでも常に出力
      const levels = [AG_LOGLEVEL.OFF, AG_LOGLEVEL.FATAL, AG_LOGLEVEL.ERROR, AG_LOGLEVEL.WARN];

      levels.forEach((level, index) => {
        logger.logLevel = level;
        logger.log(`forced message at level ${index}`);
      });

      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, expect.stringContaining('forced message at level 0'));
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, expect.stringContaining('forced message at level 1'));
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, expect.stringContaining('forced message at level 2'));
      expect(consoleLogSpy).toHaveBeenNthCalledWith(4, expect.stringContaining('forced message at level 3'));
    });

    it('should work with any verbose state', () => {
      const logger = AgLogger.createLogger({
        defaultLogger: ConsoleLogger,
        formatter: PlainFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.OFF;

      // verbose DISABLEでも出力
      logger.setVerbose = DISABLE;
      logger.log('forced output with verbose disabled');

      // verbose ENABLEでも出力
      logger.setVerbose = ENABLE;
      logger.log('forced output with verbose enabled');

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, expect.stringContaining('forced output with verbose disabled'));
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, expect.stringContaining('forced output with verbose enabled'));
    });
  });
});
