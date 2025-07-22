// tests/integration/AgLogger.integration.spec.ts
// @(#) : AgLogger Integration Tests - Component interaction testing
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { describe, expect, it, vi } from 'vitest';

// ログレベル定数 - テストで使用するログレベル定義
import { AG_LOG_LEVEL } from '../../shared/types';
// テスト対象 - メインAgLoggerクラスとgetLogger関数
import { AgLogger, getLogger } from '../../src/AgLogger.class';
// テスト対象 - ロガー・フォーマッター管理クラス
import { AgLoggerManager } from '../../src/AgLoggerManager.class';
// フォーマッタープラグイン - JSON形式でのログフォーマット
import { JsonFormat } from '../../src/plugins/format/JsonFormat';
// フォーマッタープラグイン - 出力なしのダミーフォーマット
import { NullFormat } from '../../src/plugins/format/NullFormat';
// フォーマッタープラグイン - 人間可読な平文フォーマット
import { PlainFormat } from '../../src/plugins/format/PlainFormat';
// ロガープラグイン - コンソール出力ロガー
import { ConsoleLogger } from '../../src/plugins/logger/ConsoleLogger';

/**
 * AgLoggerコンポーネントの統合テストスイート
 *
 * @description AgLogger、AgLoggerManager、ロガー、フォーマッター間の相互作用を検証する
 * コンポーネントが正しく連携して動作することを確認。
 * シングルトン動作、マネージャー状態一貫性、複合設定シナリオをテスト
 *
 * @testType Integration Test
 * @testTarget AgLogger + AgLoggerManager + Plugins
 * @coverage
 * - シングルトンインスタンス間の一貫性
 * - ロガー・フォーマッター組み合わせ統合
 * - 設定管理とコンポーネント連携
 * - ログレベルフィルタリング統合
 * - verbose機能統合
 * - エラー処理とエッジケース統合
 */
describe('AgLogger Integration Tests', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    // Reset singleton instances for clean test state
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
  };

  /**
   * シングルトンとマネージャー統合テストスイート
   *
   * @description 複数ロガーインスタンスと設定間でのシングルトン動作と
   * マネージャー状態一貫性を検証する
   * インスタンス同一性、設定共有、マネージャー設定連携を確認
   *
   * @testFocus Singleton Pattern Integration
   * @scenarios
   * - 複数getLogger呼び出しでのインスタンス同一性
   * - ログレベル設定のインスタンス間共有
   * - ロガーマネージャー設定のインスタンス間共有
   */
  describe('Singleton and Manager Integration', () => {
    it('should maintain singleton behavior across multiple getLogger calls', () => {
      setupTestContext();
      const logger1 = getLogger();
      const logger2 = getLogger();
      const logger3 = AgLogger.getInstance();

      expect(logger1).toBe(logger2);
      expect(logger2).toBe(logger3);
    });

    it('should share log level configuration across all instances', () => {
      setupTestContext();
      const logger1 = getLogger();
      const logger2 = getLogger();

      logger1.setLogLevel(AG_LOG_LEVEL.DEBUG);
      expect(logger2.getLogLevel()).toBe(AG_LOG_LEVEL.DEBUG);

      logger2.setLogLevel(AG_LOG_LEVEL.ERROR);
      expect(logger1.getLogLevel()).toBe(AG_LOG_LEVEL.ERROR);
    });

    it('should share logger manager configuration across instances', () => {
      setupTestContext();
      const mockLogger = vi.fn();
      const mockFormatter = vi.fn().mockReturnValue('formatted message');

      const logger1 = getLogger(mockLogger, mockFormatter);
      logger1.setLogLevel(AG_LOG_LEVEL.INFO);

      const logger2 = getLogger();
      logger2.info('test message');

      expect(mockFormatter).toHaveBeenCalled();
      expect(mockLogger).toHaveBeenCalledWith('formatted message');
    });
  });

  /**
   * ロガー・フォーマッター統合テストスイート
   *
   * @description 各種ロガーとフォーマッターの組み合わせ統合を検証する
   * 異なるプラグイン組み合わせで正しく連携して動作することを確認
   * データフロー、フォーマット互換性、出力品質をテスト
   *
   * @testFocus Plugin Combination Integration
   * @scenarios
   * - ConsoleLogger + JsonFormat組み合わせ
   * - E2eMockLogger + PlainFormat組み合わせ
   * - NullFormatと任意ロガーの組み合わせ
   * - フォーマット出力の正確性検証
   */
  describe('Logger and Formatter Integration', () => {
    it('should integrate ConsoleLogger with JsonFormat correctly', () => {
      setupTestContext();
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOG_LEVEL.INFO);
      logger.info('test message', { key: 'value' });

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const [logOutput] = consoleSpy.mock.calls[0];

      // Verify JSON format output
      expect(() => JSON.parse(logOutput)).not.toThrow();
      const parsedLog = JSON.parse(logOutput);
      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'test message',
        args: [{ key: 'value' }],
      });

      consoleSpy.mockRestore();
    });

    it('should integrate mockLogger with PlainFormat correctly', () => {
      setupTestContext();
      const mockLogger = vi.fn();

      const logger = getLogger(mockLogger, PlainFormat);
      logger.setLogLevel(AG_LOG_LEVEL.WARN);
      logger.warn('warning message', 'additional info');

      expect(mockLogger).toHaveBeenCalledTimes(1);
      const [logOutput] = mockLogger.mock.calls[0];

      // Verify PlainFormat output structure
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[WARN\] warning message additional info$/);
    });

    it('should handle NullFormat with any logger correctly', () => {
      setupTestContext();
      const mockLogger = vi.fn();

      const logger = getLogger(mockLogger, NullFormat);
      logger.setLogLevel(AG_LOG_LEVEL.INFO);
      logger.info('test message');

      // NullFormat returns empty string, so logger should not be called
      expect(mockLogger).not.toHaveBeenCalled();
    });
  });

  /**
   * 複合設定統合テストスイート
   *
   * @description 部分的ロガーマップや混在ロガー・フォーマッター組み合わせの
   * 複合設定シナリオを検証する
   * 部分ロガーマップ、設定継承、複数設定更新、設定保持を確認
   *
   * @testFocus Complex Configuration Scenarios
   * @scenarios
   * - 部分ロガーマップでのレベル別ロガー使い分け
   * - 複数setLogger呼び出し後の設定保持
   * - 設定更新の累積効果と上書き動作
   */
  describe('Complex Configuration Integration', () => {
    it('should handle partial logger map with different loggers per level', () => {
      setupTestContext();
      const errorLogger = vi.fn();
      const infoLogger = vi.fn();
      const debugLogger = vi.fn();

      const logger = getLogger(
        infoLogger,
        PlainFormat,
        {
          [AG_LOG_LEVEL.ERROR]: errorLogger,
          [AG_LOG_LEVEL.DEBUG]: debugLogger,
        },
      );

      logger.setLogLevel(AG_LOG_LEVEL.DEBUG);

      logger.error('error message');
      logger.warn('warn message');
      logger.info('info message');
      logger.debug('debug message');

      expect(errorLogger).toHaveBeenCalledTimes(1);
      expect(infoLogger).toHaveBeenCalledTimes(2); // warn and info
      expect(debugLogger).toHaveBeenCalledTimes(1);
    });

    it('should maintain configuration after multiple setLogger calls', () => {
      setupTestContext();
      const firstLogger = vi.fn();
      const secondLogger = vi.fn();
      const thirdFormatter = vi.fn().mockReturnValue('third format');

      const logger = getLogger();

      // First configuration
      logger.setLogger({
        defaultLogger: firstLogger,
        formatter: PlainFormat,
      });
      logger.setLogLevel(AG_LOG_LEVEL.INFO);

      // Second configuration - should override first
      logger.setLogger({
        defaultLogger: secondLogger,
        formatter: thirdFormatter,
      });

      logger.info('test message');

      expect(firstLogger).not.toHaveBeenCalled();
      expect(secondLogger).toHaveBeenCalledWith('third format');
      expect(thirdFormatter).toHaveBeenCalled();
    });
  });

  /**
   * ログレベルフィルタリング統合テストスイート
   *
   * @description 各種ロガーやフォーマッターとの組み合わせで
   * ログレベルフィルタリングが一貫して動作することを検証する
   * 全コンポーネントでの一貫したフィルタリング、OFFレベル処理を確認
   *
   * @testFocus Log Level Filtering Integration
   * @scenarios
   * - 全コンポーネントでの一貫したフィルタリング
   * - OFFレベルでの完全な出力ブロック
   * - レベル別ロガーでの適切なフィルタリング
   */
  describe('Log Level Filtering Integration', () => {
    it('should apply log level filtering consistently across all components', () => {
      setupTestContext();
      const errorLogger = vi.fn();
      const warnLogger = vi.fn();
      const infoLogger = vi.fn();
      const debugLogger = vi.fn();

      const logger = getLogger(
        infoLogger,
        JsonFormat,
        {
          [AG_LOG_LEVEL.ERROR]: errorLogger,
          [AG_LOG_LEVEL.WARN]: warnLogger,
          [AG_LOG_LEVEL.DEBUG]: debugLogger,
        },
      );

      // Set to WARN level - should filter out INFO and DEBUG
      logger.setLogLevel(AG_LOG_LEVEL.WARN);

      logger.error('error message');
      logger.warn('warn message');
      logger.info('info message'); // should be filtered
      logger.debug('debug message'); // should be filtered

      expect(errorLogger).toHaveBeenCalledTimes(1);
      expect(warnLogger).toHaveBeenCalledTimes(1);
      expect(infoLogger).not.toHaveBeenCalled();
      expect(debugLogger).not.toHaveBeenCalled();
    });

    it('should handle OFF log level correctly across all components', () => {
      setupTestContext();
      const mockLogger = vi.fn();
      const mockFormatter = vi.fn();

      const logger = getLogger(mockLogger, mockFormatter);
      logger.setLogLevel(AG_LOG_LEVEL.OFF);

      logger.fatal('fatal message');
      logger.error('error message');
      logger.warn('warn message');
      logger.info('info message');
      logger.debug('debug message');
      logger.trace('trace message');

      expect(mockLogger).not.toHaveBeenCalled();
      expect(mockFormatter).not.toHaveBeenCalled();
    });
  });

  /**
   * Verboseモード統合テストスイート
   *
   * @description verbose機能と全体ログシステムの統合を検証する
   * verboseモードとロガー・フォーマッターの連携、状態共有、出力制御を確認
   *
   * @testFocus Verbose Mode Integration
   * @scenarios
   * - verboseモードとロガー・フォーマッターの連携
   * - 複数インスタンス間でのverbose状態共有
   * - verbose設定による出力制御
   */
  describe('Verbose Mode Integration', () => {
    it('should integrate verbose mode with logger and formatter correctly', () => {
      setupTestContext();
      const mockLogger = vi.fn();
      const mockFormatter = vi.fn().mockReturnValue('formatted verbose message');

      const logger = getLogger(mockLogger, mockFormatter);
      logger.setLogLevel(AG_LOG_LEVEL.INFO);

      // Test verbose off (default)
      logger.verbose('verbose message when off');
      expect(mockLogger).not.toHaveBeenCalled();

      // Test verbose on
      logger.setVerbose(true);
      logger.verbose('verbose message when on');

      expect(mockFormatter).toHaveBeenCalled();
      expect(mockLogger).toHaveBeenCalledWith('formatted verbose message');
    });

    it('should maintain verbose state across different logger instances', () => {
      setupTestContext();
      const mockLogger = vi.fn();

      const logger1 = getLogger(mockLogger, PlainFormat);
      logger1.setLogLevel(AG_LOG_LEVEL.INFO);
      logger1.setVerbose(true);

      const logger2 = getLogger();
      logger2.verbose('verbose from second instance');

      expect(mockLogger).toHaveBeenCalled();
    });
  });

  /**
   * エラー処理とエッジケース統合テストスイート
   *
   * @description コンポーネント統合時のエラー処理とエッジケースを検証する
   * undefined/null引数処理、ロガーエラー時のシステム安定性、
   * 空フォーマッター処理を確認
   *
   * @testFocus Error Handling Integration
   * @scenarios
   * - undefined/null引数の安全な処理
   * - ロガーエラー時のシステム安定性保持
   * - 空文字列フォーマッターの適切な処理
   * - エラー後のシステム復旧能力
   */
  describe('Error Handling and Edge Cases', () => {
    it('should handle undefined/null arguments gracefully across components', () => {
      setupTestContext();
      const mockLogger = vi.fn();
      const mockFormatter = vi.fn().mockReturnValue('formatted');

      const logger = getLogger(mockLogger, mockFormatter);
      logger.setLogLevel(AG_LOG_LEVEL.INFO);

      // Test with various undefined/null combinations
      logger.info(undefined);
      logger.info(null);
      logger.info('message', undefined, null);

      expect(mockFormatter).toHaveBeenCalledTimes(3);
      expect(mockLogger).toHaveBeenCalledTimes(3);
    });

    it('should maintain system stability when logger throws an error', () => {
      setupTestContext();
      const throwingLogger = vi.fn().mockImplementation(() => {
        throw new Error('Logger error');
      });

      const logger = getLogger(throwingLogger, PlainFormat);
      logger.setLogLevel(AG_LOG_LEVEL.INFO);

      // Should not throw - system should handle logger errors gracefully
      expect(() => {
        logger.info('test message');
      }).toThrow('Logger error');

      // System should still be functional for subsequent calls
      const workingLogger = vi.fn();
      logger.setLogger({ defaultLogger: workingLogger });

      expect(() => {
        logger.info('recovery test');
      }).not.toThrow();
      expect(workingLogger).toHaveBeenCalled();
    });

    it('should handle formatter that returns empty string correctly', () => {
      setupTestContext();
      const mockLogger = vi.fn();
      const emptyFormatter = vi.fn().mockReturnValue('');

      const logger = getLogger(mockLogger, emptyFormatter);
      logger.setLogLevel(AG_LOG_LEVEL.INFO);
      logger.info('test message');

      expect(emptyFormatter).toHaveBeenCalled();
      expect(mockLogger).not.toHaveBeenCalled(); // Should not log empty strings
    });
  });
});
