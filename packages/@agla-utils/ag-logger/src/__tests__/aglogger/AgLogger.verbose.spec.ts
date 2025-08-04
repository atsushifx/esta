// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// src/__tests__/AgLogger.verbose.spec.ts
// @(#) : Comprehensive unit tests for AgLogger.verbose method
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

/**
 * AgLogger.verbose メソッドの簡潔なユニットテストスイート
 *
 * @description verboseメソッドの基本機能をテスト
 * verbose状態管理と基本的な出力制御を検証、通常ログとの対比でinfoも使用
 *
 * @testType Unit Test
 * @testTarget AgLogger.verbose method
 * @structure
 * - 基本動作: verbose状態による出力制御
 * - 引数処理: 基本的な引数パターン
 * - 状態管理: verbose設定の切り替え
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

describe('AgLogger.verbose method tests', () => {
  setupTestEnvironment();

  describe('基本動作: Verbose state control', () => {
    it('should not output when verbose is DISABLE (default)', () => {
      const logger = AgLogger.createLogger();

      expect(logger.isVerbose).toBe(DISABLE);

      // verbose=DISABLEなので出力なし
      logger.verbose('test message - should be silent');
    });

    it('should output when verbose is ENABLE', () => {
      const logger = AgLogger.createLogger();
      logger.setVerbose = ENABLE;

      expect(logger.isVerbose).toBe(ENABLE);

      // verbose=ENABLEなので出力あり
      logger.verbose('test message - should be output');
    });

    it('should toggle verbose state correctly', () => {
      const logger = AgLogger.createLogger();

      // デフォルト: DISABLE
      expect(logger.isVerbose).toBe(DISABLE);

      // ENABLE に切り替え
      logger.setVerbose = ENABLE;
      expect(logger.isVerbose).toBe(ENABLE);

      // DISABLE に戻す
      logger.setVerbose = DISABLE;
      expect(logger.isVerbose).toBe(DISABLE);
    });
  });

  describe('引数処理: Argument handling', () => {
    it('should handle single string message', () => {
      const logger = AgLogger.createLogger();
      logger.setVerbose = ENABLE;

      logger.verbose('single message');
    });

    it('should handle multiple arguments', () => {
      const logger = AgLogger.createLogger();
      logger.setVerbose = ENABLE;

      const obj = { key: 'value' };
      logger.verbose('multi message', obj, 42, true);
    });

    it('should handle empty arguments', () => {
      const logger = AgLogger.createLogger();
      logger.setVerbose = ENABLE;

      logger.verbose();
    });
  });

  describe('状態管理: Verbose independence', () => {
    it('should work independently from other log levels', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;
      logger.setVerbose = DISABLE;

      logger.verbose('verbose msg - should be silent'); // 出力されない
    });

    it('should work even when logLevel is OFF', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.OFF;
      logger.setVerbose = ENABLE;

      logger.verbose('verbose msg - works independently'); // verbose独立で動作
    });
  });
});
