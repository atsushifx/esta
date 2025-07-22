// tests/integration/LogLevelHelpers.integration.spec.ts
// @(#) : LogLevel Helper Functions Integration Tests - Real system integration testing
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { describe, expect, it, vi } from 'vitest';

// ログレベル定数 - テストで使用するログレベル定義
import { AG_LOG_LEVEL } from '../../shared/types';
import type { AgTLogLevelLabel } from '../../shared/types';
// テスト対象 - メインAgLoggerクラスとgetLogger関数
import { AgLogger, getLogger } from '../../src/AgLogger.class';
// テスト対象 - ロガー・フォーマッター管理クラス
import { AgLoggerManager } from '../../src/AgLoggerManager.class';
// テスト対象 - LogLevelヘルパー関数
import { AgToLabel, AgToLogLevel } from '../../src/utils/LogLevelHelpers';
// フォーマッタープラグイン - 人間可読な平文フォーマット
import { PlainFormat } from '../../src/plugins/format/PlainFormat';

/**
 * LogLevelヘルパー関数統合テストスイート
 *
 * @description AgToLogLevel、AgToLabel関数の実際のログシステムとの統合を検証する
 * 設定ファイルから読み込んだラベルのレベル変換、ログ出力でのラベル表示、
 * エラー処理統合、相互変換の一貫性、動的設定変更を確認
 *
 * @testType Integration Test
 * @testTarget LogLevel Helper Functions + AgLogger System
 * @coverage
 * - ラベル⇔数値レベル変換とロガー設定統合
 * - フォーマッター内でのラベル表示統合
 * - エラー処理とシステム安定性統合
 * - 双方向変換の一貫性検証
 * - 動的レベル設定変更のリアルタイム反映
 * - 複合シナリオでの統合動作確認
 */
describe('LogLevel Helper Functions Integration Tests', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    // Reset singleton instances for clean test state
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
  };

  /**
   * AgToLogLevel統合テストスイート
   *
   * @description AgToLogLevel関数とログシステム設定の統合を検証する
   * 設定ファイルから読み込んだ文字列ラベルを数値レベルに変換して
   * ロガー設定に適用し、期待通りのログフィルタリングが行われることを確認
   *
   * @testFocus Label to Numeric Level Conversion Integration
   * @scenarios
   * - 全ラベル種類での変換と設定統合
   * - 変換後レベルでのログフィルタリング動作確認
   * - 無効ラベルエラー処理とシステム復旧
   */
  describe('AgToLogLevel Integration', () => {
    it('should integrate AgToLogLevel with logger configuration from string labels', () => {
      setupTestContext();
      const mockLogger = vi.fn();
      const mockFormatter = vi.fn().mockImplementation((logMessage) => {
        return `[${AgToLabel(logMessage.logLevel)}] ${logMessage.message} ${logMessage.args.join(' ')}`;
      });

      const logger = getLogger(mockLogger, mockFormatter);

      // Test various string labels converted to numeric levels
      const testCases: Array<{ label: AgTLogLevelLabel; expectedLevel: number }> = [
        { label: 'OFF', expectedLevel: AG_LOG_LEVEL.OFF },
        { label: 'FATAL', expectedLevel: AG_LOG_LEVEL.FATAL },
        { label: 'ERROR', expectedLevel: AG_LOG_LEVEL.ERROR },
        { label: 'WARN', expectedLevel: AG_LOG_LEVEL.WARN },
        { label: 'INFO', expectedLevel: AG_LOG_LEVEL.INFO },
        { label: 'DEBUG', expectedLevel: AG_LOG_LEVEL.DEBUG },
        { label: 'TRACE', expectedLevel: AG_LOG_LEVEL.TRACE },
      ];

      testCases.forEach(({ label, expectedLevel }) => {
        // Convert label to numeric level using AgToLogLevel
        const numericLevel = AgToLogLevel(label);
        expect(numericLevel).toBe(expectedLevel);

        // Set logger to this level
        logger.setLogLevel(numericLevel);
        expect(logger.getLogLevel()).toBe(expectedLevel);

        // Verify the level is correctly applied in logging behavior
        vi.clearAllMocks();
        logger.info('test message');

        if (expectedLevel >= AG_LOG_LEVEL.INFO) {
          expect(mockLogger).toHaveBeenCalled();
          expect(mockFormatter).toHaveBeenCalled();
        } else {
          expect(mockLogger).not.toHaveBeenCalled();
        }
      });
    });

    it('should handle configuration errors gracefully in integration scenarios', () => {
      setupTestContext();
      const mockLogger = vi.fn();

      const logger = getLogger(mockLogger, PlainFormat);

      // Test invalid label handling
      expect(() => {
        const invalidLevel = AgToLogLevel('INVALID' as AgTLogLevelLabel);
        logger.setLogLevel(invalidLevel);
      }).toThrow('Invalid log level label: INVALID');

      // Verify logger remains functional after error
      logger.setLogLevel(AG_LOG_LEVEL.INFO);
      logger.info('recovery test');
      expect(mockLogger).toHaveBeenCalled();
    });

    it('should support dynamic level configuration using string labels', () => {
      setupTestContext();
      const mockLogger = vi.fn();

      const logger = getLogger(mockLogger, PlainFormat);

      // Simulate configuration changes using string labels
      const configSequence: AgTLogLevelLabel[] = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'OFF'];

      configSequence.forEach((labelConfig, _index) => {
        vi.clearAllMocks();

        const numericLevel = AgToLogLevel(labelConfig);
        logger.setLogLevel(numericLevel);

        // Test that the level change took effect
        expect(logger.getLogLevel()).toBe(numericLevel);

        // Test logging behavior at each level
        logger.info('test message');

        const shouldLog = numericLevel >= AG_LOG_LEVEL.INFO;
        if (shouldLog) {
          expect(mockLogger).toHaveBeenCalled();
        } else {
          expect(mockLogger).not.toHaveBeenCalled();
        }
      });
    });
  });

  /**
   * AgToLabel統合テストスイート
   *
   * @description AgToLabel関数とフォーマッター統合を検証する
   * 数値ログレベルを文字列ラベルに変換してフォーマッター内で使用し、
   * ログ出力に正しいラベルが表示されることを確認
   *
   * @testFocus Numeric Level to Label Conversion Integration
   * @scenarios
   * - フォーマッター内でのラベル変換と表示
   * - 全ログレベルでの正確なラベル出力確認
   * - ログメソッド呼び出しとラベル表示の一致検証
   */
  describe('AgToLabel Integration', () => {
    it('should integrate AgToLabel with log formatters for level display', () => {
      setupTestContext();
      const mockLogger = vi.fn();

      // Custom formatter that uses AgToLabel for level display
      const labelFormatter = vi.fn().mockImplementation((logMessage) => {
        const levelLabel = AgToLabel(logMessage.logLevel);
        return `${logMessage.timestamp.toISOString()} [${levelLabel}] ${logMessage.message} ${
          logMessage.args.join(' ')
        }`;
      });

      const logger = getLogger(mockLogger, labelFormatter);
      logger.setLogLevel(AG_LOG_LEVEL.TRACE); // Allow all levels

      // Test all log levels with their expected labels
      const logMethods = [
        { method: 'fatal', level: AG_LOG_LEVEL.FATAL, expectedLabel: 'FATAL' },
        { method: 'error', level: AG_LOG_LEVEL.ERROR, expectedLabel: 'ERROR' },
        { method: 'warn', level: AG_LOG_LEVEL.WARN, expectedLabel: 'WARN' },
        { method: 'info', level: AG_LOG_LEVEL.INFO, expectedLabel: 'INFO' },
        { method: 'debug', level: AG_LOG_LEVEL.DEBUG, expectedLabel: 'DEBUG' },
        { method: 'trace', level: AG_LOG_LEVEL.TRACE, expectedLabel: 'TRACE' },
      ] as const;

      logMethods.forEach(({ method, expectedLabel }) => {
        vi.clearAllMocks();
        (logger as unknown as Record<string, (msg: string) => void>)[method]('test message');

        expect(labelFormatter).toHaveBeenCalled();
        const [formattedOutput] = mockLogger.mock.calls[0];
        expect(formattedOutput).toContain(`[${expectedLabel}]`);
      });
    });
  });

  /**
   * 双方向変換一貫性統合テストスイート
   *
   * @description AgToLogLevelとAgToLabel間の双方向変換一貫性を
   * 実際のログシステム環境で検証する
   * ラウンドトリップ変換での値保持、フォーマッター内一貫性確認
   *
   * @testFocus Bidirectional Conversion Consistency
   * @scenarios
   * - 数値→ラベル→数値変換での値一致確認
   * - フォーマッター内でのリアルタイム変換整合性
   * - 全ログレベルでの変換一貫性検証
   */
  describe('Bidirectional Conversion Consistency', () => {
    it('should maintain conversion consistency in round-trip scenarios', () => {
      setupTestContext();
      const mockLogger = vi.fn();
      const consistencyFormatter = vi.fn().mockImplementation((logMessage) => {
        // Convert numeric level to label and back to numeric
        const label = AgToLabel(logMessage.logLevel);
        const convertedLevel = AgToLogLevel(label);

        // Should be identical to original level
        expect(convertedLevel).toBe(logMessage.logLevel);

        return `[${label}] ${logMessage.message}`;
      });

      const logger = getLogger(mockLogger, consistencyFormatter);
      logger.setLogLevel(AG_LOG_LEVEL.TRACE);

      // Test round-trip conversion for all levels
      const allLevels = Object.values(AG_LOG_LEVEL);
      allLevels.slice(1).forEach((level) => { // Skip OFF level as it doesn't log
        vi.clearAllMocks();

        // Temporarily set to the test level and trigger logging
        logger.setLogLevel(level);
        logger.info('round-trip test');

        if (level >= AG_LOG_LEVEL.INFO) {
          expect(consistencyFormatter).toHaveBeenCalled();
          expect(mockLogger).toHaveBeenCalled();
        }
      });
    });
  });

  /**
   * 複合シナリオ統合テストスイート
   *
   * @description LogLevelヘルパー関数とロガーシステム全体の
   * 複合的な統合シナリオを検証する
   * レベル別ロガー配置、動的設定変更、エラー処理を組み合わせた実使用場面での動作確認
   *
   * @testFocus Complex Integration Scenarios
   * @scenarios
   * - 複数ロガー + ヘルパー関数統合
   * - 動的設定変更でのリアルタイム反映
   * - エラー処理とシステム復旧の複合シナリオ
   * - フォーマッター内変換と出力ルーティングの統合
   */
  describe('Complex Integration Scenarios', () => {
    it('should integrate with complex logging scenarios using both helper functions', () => {
      setupTestContext();
      const errorLogger = vi.fn();
      const infoLogger = vi.fn();
      const debugLogger = vi.fn();

      // Formatter that demonstrates both helper functions
      const dualFormatter = vi.fn().mockImplementation((logMessage) => {
        const label = AgToLabel(logMessage.logLevel);
        const roundTripLevel = AgToLogLevel(label);

        // Verify consistency
        expect(roundTripLevel).toBe(logMessage.logLevel);

        return `${logMessage.timestamp.toISOString()} [${label}] ${logMessage.message} ${logMessage.args.join(' ')}`;
      });

      // Setup with level-specific loggers
      const logger = getLogger(
        infoLogger,
        dualFormatter,
        {
          [AG_LOG_LEVEL.ERROR]: errorLogger,
          [AG_LOG_LEVEL.DEBUG]: debugLogger,
        },
      );

      // Configuration using string labels converted to numeric
      const configuredLevel = AgToLogLevel('DEBUG');
      logger.setLogLevel(configuredLevel);

      // Test logging at different levels
      logger.error('error message');
      logger.info('info message');
      logger.debug('debug message');

      // Verify correct routing and formatting
      expect(errorLogger).toHaveBeenCalledTimes(1);
      expect(infoLogger).toHaveBeenCalledTimes(1);
      expect(debugLogger).toHaveBeenCalledTimes(1);
      expect(dualFormatter).toHaveBeenCalledTimes(3);

      // Verify formatted output contains correct labels
      const errorOutput = errorLogger.mock.calls[0][0];
      const infoOutput = infoLogger.mock.calls[0][0];
      const debugOutput = debugLogger.mock.calls[0][0];

      expect(errorOutput).toContain('[ERROR]');
      expect(infoOutput).toContain('[INFO]');
      expect(debugOutput).toContain('[DEBUG]');
    });

    it('should handle real-time configuration changes with helper functions', () => {
      setupTestContext();
      const mockLogger = vi.fn();
      const dynamicFormatter = vi.fn().mockImplementation((logMessage) => {
        const currentLabel = AgToLabel(logMessage.logLevel);
        return `Dynamic: [${currentLabel}] ${logMessage.message}`;
      });

      const logger = getLogger(mockLogger, dynamicFormatter);

      // Simulate real-time configuration changes from external config source
      const configUpdates: AgTLogLevelLabel[] = ['INFO', 'WARN', 'ERROR', 'DEBUG', 'TRACE'];

      configUpdates.forEach((newConfig, index) => {
        vi.clearAllMocks();

        // Update configuration using helper function
        const newLevel = AgToLogLevel(newConfig);
        logger.setLogLevel(newLevel);

        // Test immediate application
        logger.info(`Config update ${index + 1}`);
        logger.debug(`Debug message ${index + 1}`);

        // Verify behavior based on new level
        const infoShouldLog = newLevel >= AG_LOG_LEVEL.INFO;
        const debugShouldLog = newLevel >= AG_LOG_LEVEL.DEBUG;

        const logCallCount = (infoShouldLog ? 1 : 0) + (debugShouldLog ? 1 : 0);
        expect(mockLogger).toHaveBeenCalledTimes(logCallCount);

        // If there was output, verify correct label formatting
        if (mockLogger.mock.calls.length > 0) {
          mockLogger.mock.calls.forEach(([output]) => {
            expect(output).toMatch(/Dynamic: \[(INFO|DEBUG)\]/);
          });
        }
      });
    });

    it('should maintain system stability across helper function errors and recovery', () => {
      setupTestContext();
      const mockLogger = vi.fn();
      const resilientFormatter = vi.fn().mockImplementation((logMessage) => {
        try {
          const label = AgToLabel(logMessage.logLevel);
          return `[${label}] ${logMessage.message}`;
        } catch {
          // Fallback for invalid levels
          return `[UNKNOWN] ${logMessage.message}`;
        }
      });

      const logger = getLogger(mockLogger, resilientFormatter);

      // Test normal operation
      logger.setLogLevel(AgToLogLevel('INFO'));
      logger.info('normal operation');
      expect(mockLogger).toHaveBeenCalledWith('[INFO] normal operation');

      // Test error handling
      vi.clearAllMocks();
      expect(() => {
        AgToLogLevel('INVALID' as AgTLogLevelLabel);
      }).toThrow('Invalid log level label: INVALID');

      // System should recover and continue normal operation
      logger.setLogLevel(AgToLogLevel('WARN'));
      logger.warn('recovery test');
      expect(mockLogger).toHaveBeenCalledWith('[WARN] recovery test');
    });
  });
});
