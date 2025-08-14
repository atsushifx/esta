// tests/integration/PluginInteraction.integration.spec.ts
// @(#) : Plugin Interaction Integration Tests - Logger and Formatter coordination
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';

// 共有定数: ログレベル定義
import { AG_LOGLEVEL } from '../../shared/types';

// テスト対象: AgLoggerとエントリーポイント
import { AgLogger } from '@/AgLogger.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { NullFormatter } from '@/plugins/formatter/NullFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

// プラグイン（ロガー）: 出力先実装とマップ
import { ConsoleLogger, ConsoleLoggerMap } from '@/plugins/logger/ConsoleLogger';
import { NullLogger } from '@/plugins/logger/NullLogger';

// types
// 循環参照テスト用型は shared/types/index.ts の TCircularTestObject を使用

/**
 * プラグイン間相互作用の統合テストスイート
 *
 * @description 各種ロガーやフォーマッタープラグイン間の連携を検証する
 * 様々な組み合わせやシナリオで正しく連携して動作することを確認。
 * データフロー、フォーマット互換性、システム動作に焦点を当てる
 *
 * @testType Integration Test
 * @testTarget Plugin Interactions
 * @coverage
 * - ロガー・フォーマッター全組み合わせ機能性
 * - ConsoleLoggerMapとフォーマッター統合
 * - 複雑データ処理統合
 * - パフォーマンス統合
 * - エラー復旧統合
 */
describe('Plugin Interaction Integration Tests', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  };

  /**
   * ロガー・フォーマッター組み合わせテストスイート
   *
   * @description 全ロガーとフォーマッタープラグインの組み合わせをテストし、
   * 互換性と正しい動作を保証する
   * ConsoleLogger、E2eMockLogger、NullLoggerと各フォーマッターの全組み合わせを確認
   *
   * @testFocus All Plugin Combinations
   * @scenarios
   * - ConsoleLogger + JsonFormatter/PlainFormatter
   * - E2eMockLogger + JsonFormatter/PlainFormatter
   * - NullLogger + 任意のフォーマッター
   * - 任意のロガー + NullFormatter
   * - 出力品質とフォーマット正確性
   */
  describe('Logger-Formatter Combinations', () => {
    // 目的: ConsoleLogger×JsonFormatterの基本統合動作
    it('should work correctly with ConsoleLogger and JsonFormatter', () => {
      setupTestContext();
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;
      logger.info('test message', { data: 'value' });

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const [output] = consoleSpy.mock.calls[0];

      // Should be valid JSON
      expect(() => JSON.parse(output)).not.toThrow();
      const parsed = JSON.parse(output);
      expect(parsed).toMatchObject({
        level: 'INFO',
        message: 'test message',
        args: [{ data: 'value' }],
      });

      consoleSpy.mockRestore();
    });

    // 目的: ConsoleLogger×PlainFormatterのフォーマット検証
    it('should work correctly with ConsoleLogger and PlainFormatter', () => {
      setupTestContext();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
      logger.logLevel = AG_LOGLEVEL.WARN;
      logger.warn('warning message', 'additional info');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const [output] = consoleSpy.mock.calls[0];

      // Should match PlainFormatter pattern
      expect(output).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[WARN\] warning message additional info$/);

      consoleSpy.mockRestore();
    });

    // 目的: モックロガー×JsonFormatterのJSON整形検証
    it('should work correctly with E2eMockLogger and JsonFormatter', () => {
      setupTestContext();
      const mockLogger = vi.fn();

      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: JsonFormatter });
      logger.logLevel = AG_LOGLEVEL.DEBUG;
      logger.debug('debug message', { debug: true });

      expect(mockLogger).toHaveBeenCalledTimes(1);
      const [output] = mockLogger.mock.calls[0];

      // Should be valid JSON
      expect(() => JSON.parse(output)).not.toThrow();
      const parsed = JSON.parse(output);
      expect(parsed).toMatchObject({
        level: 'DEBUG',
        message: 'debug message',
        args: [{ debug: true }],
      });
    });

    // 目的: モックロガー×PlainFormatterの整形パターン検証
    it('should work correctly with E2eMockLogger and PlainFormatter', () => {
      setupTestContext();
      const mockLogger = vi.fn();

      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: PlainFormatter });
      logger.logLevel = AG_LOGLEVEL.ERROR;
      logger.error('error message', 'error details');

      expect(mockLogger).toHaveBeenCalledTimes(1);
      const [output] = mockLogger.mock.calls[0];

      // Should match PlainFormatter pattern
      expect(output).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[ERROR\] error message error details$/);
    });

    // 目的: NullLogger使用時の安全な無出力動作
    it('should handle NullLogger with any formatter correctly', () => {
      setupTestContext();
      const logger = AgLogger.createLogger({ defaultLogger: NullLogger, formatter: JsonFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Should not throw and should complete silently
      expect(() => {
        logger.info('test message');
      }).not.toThrow();
    });

    // 目的: NullFormatter使用時にロガー未呼出となる挙動
    it('should handle any logger with NullFormatter correctly', () => {
      setupTestContext();
      const mockLogger = vi.fn();

      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: NullFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;
      logger.info('test message');

      // NullFormatter returns empty string, so logger should not be called
      expect(mockLogger).not.toHaveBeenCalled();
    });
  });

  /**
   * ConsoleLoggerMap統合テストスイート
   *
   * @description ConsoleLoggerMapと各種フォーマッターの統合を検証し、
   * レベル固有のconsoleメソッドが正しく動作することを確認する
   * ログレベルごとの適切なconsoleメソッド呼び出し、フォーマット品質を確認
   *
   * @testFocus ConsoleLoggerMap Integration
   * @scenarios
   * - JsonFormatterとの組み合わせでの適切なconsoleメソッド使用
   * - PlainFormatterとの組み合わせでの適切なconsoleメソッド使用
   * - 各ログレベルでの正しいconsoleメソッドマッピング
   * - フォーマット出力の品質検証
   */
  describe('ConsoleLoggerMap Integration', () => {
    // 目的: ConsoleLoggerMap×JsonFormatterで適切なconsoleメソッドに振分け
    it('should use correct console methods with JsonFormatter', () => {
      setupTestContext();
      const consoleSpies = {
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        info: vi.spyOn(console, 'info').mockImplementation(() => {}),
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      };

      const logger = AgLogger.createLogger({
        defaultLogger: ConsoleLogger,
        formatter: JsonFormatter,
        loggerMap: ConsoleLoggerMap,
      });
      logger.logLevel = AG_LOGLEVEL.TRACE;

      logger.fatal('fatal message');
      logger.error('error message');
      logger.warn('warn message');
      logger.info('info message');
      logger.debug('debug message');
      logger.trace('trace message');

      // Verify correct console methods are called
      expect(consoleSpies.error).toHaveBeenCalledTimes(2); // fatal and error
      expect(consoleSpies.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpies.info).toHaveBeenCalledTimes(1);
      expect(consoleSpies.debug).toHaveBeenCalledTimes(2); // debug and trace both use console.debug
      expect(consoleSpies.log).toHaveBeenCalledTimes(0); // no trace calls to log

      // Verify JSON format for each
      [consoleSpies.error, consoleSpies.warn, consoleSpies.info, consoleSpies.debug, consoleSpies.log]
        .forEach((spy) => {
          spy.mock.calls.forEach(([output]) => {
            expect(() => JSON.parse(output)).not.toThrow();
          });
        });

      Object.values(consoleSpies).forEach((spy) => spy.mockRestore());
    });

    // 目的: ConsoleLoggerMap×PlainFormatterで適切なconsoleメソッドに振分け
    it('should use correct console methods with PlainFormatter', () => {
      setupTestContext();
      const consoleSpies = {
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        info: vi.spyOn(console, 'info').mockImplementation(() => {}),
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      };

      const logger = AgLogger.createLogger({
        defaultLogger: ConsoleLogger,
        formatter: PlainFormatter,
        loggerMap: ConsoleLoggerMap,
      });
      logger.logLevel = AG_LOGLEVEL.TRACE;

      logger.fatal('fatal message');
      logger.error('error message');
      logger.warn('warn message');
      logger.info('info message');
      logger.debug('debug message');
      logger.trace('trace message');

      // Verify correct console methods are called
      expect(consoleSpies.error).toHaveBeenCalledTimes(2); // fatal and error
      expect(consoleSpies.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpies.info).toHaveBeenCalledTimes(1);
      expect(consoleSpies.debug).toHaveBeenCalledTimes(2); // debug and trace both use console.debug
      expect(consoleSpies.log).toHaveBeenCalledTimes(0); // no trace calls to log

      // Verify PlainFormatter pattern for each
      const allCalls = [
        ...consoleSpies.error.mock.calls,
        ...consoleSpies.warn.mock.calls,
        ...consoleSpies.info.mock.calls,
        ...consoleSpies.debug.mock.calls,
      ];

      allCalls.forEach(([output]) => {
        expect(output).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[\w+\] .+$/);
      });

      Object.values(consoleSpies).forEach((spy) => spy.mockRestore());
    });
  });

  /**
   * データ処理統合テストスイート
   *
   * @description 各種プラグイン組み合わせでの複雑データ処理をテストし、
   * データ整合性と適切なシリアライゼーションを保証する
   * 複合オブジェクト、循環参照、大量データの処理を確認
   *
   * @testFocus Complex Data Processing
   * @scenarios
   * - 複雑オブジェクトの全プラグイン組み合わせ処理
   * - 循環参照オブジェクトの安全な処理
   * - 大量データセットの効率的な処理
   * - データ整合性とシリアライゼーション品質
   */
  describe('Data Handling Integration', () => {
    // 目的: 複雑オブジェクトを各プラグイン組合せで安定処理
    it('should handle complex objects correctly across all plugin combinations', () => {
      setupTestContext();
      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
          null: null,
          undefined: undefined,
        },
        primitives: {
          string: 'test',
          number: 42,
          boolean: true,
        },
      };

      // Test with JsonFormatter
      const jsonMockLogger = vi.fn();
      const jsonLogger = AgLogger.createLogger({ defaultLogger: jsonMockLogger, formatter: JsonFormatter });
      jsonLogger.logLevel = AG_LOGLEVEL.INFO;
      jsonLogger.info('Complex data', complexData);

      expect(jsonMockLogger).toHaveBeenCalledTimes(1);
      const [jsonOutput] = jsonMockLogger.mock.calls[0];

      expect(() => JSON.parse(jsonOutput)).not.toThrow();
      const parsedJson = JSON.parse(jsonOutput);
      expect(parsedJson.args[0]).toEqual(complexData);

      // Test with PlainFormatter
      const plainMockLogger = vi.fn();
      const plainLogger = AgLogger.createLogger({ defaultLogger: plainMockLogger, formatter: PlainFormatter });
      plainLogger.logLevel = AG_LOGLEVEL.INFO;
      plainLogger.info('Complex data', complexData);

      expect(plainMockLogger).toHaveBeenCalledTimes(1);
      const [plainOutput] = plainMockLogger.mock.calls[0];

      // PlainFormatter should contain stringified representation
      expect(plainOutput).toContain('Complex data');
      expect(plainOutput).toContain('{"nested"'); // JSON.stringify representation
    });

    // 循環参照テストは dataProcessing.integration.spec.ts に移動済み

    // 目的: 大規模データ引数での性能を検証
    it('should handle large data sets efficiently', () => {
      setupTestContext();
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i, data: `item${i}` }));

      const mockLogger = vi.fn();
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: JsonFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      const startTime = Date.now();
      logger.info('Large data set', largeArray);
      const endTime = Date.now();

      // Should complete in reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(mockLogger).toHaveBeenCalledTimes(1);

      const [output] = mockLogger.mock.calls[0];
      expect(() => JSON.parse(output)).not.toThrow();
    });
  });

  /**
   * パフォーマンス統合テストスイート
   *
   * @description 各種プラグイン組み合わせのパフォーマンス特性をテストし、
   * 性能要件を満たすことを保証する
   * 高頻度ログ処理、フィルタリング時のオーバーヘッド、処理時間を検証
   *
   * @testFocus Performance Integration
   * @scenarios
   * - 高頻度ログ出力時のパフォーマンス維持
   * - ログレベルフィルタリング時の低オーバーヘッド
   * - 大量データ処理時の安定性
   * - メモリ使用量の適切性
   */
  describe('Performance Integration', () => {
    // 目的: 高頻度ログ出力時の処理性能
    it('should maintain performance with high-frequency logging', () => {
      setupTestContext();
      const mockLogger = vi.fn();
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: JsonFormatter });
      logger.logLevel = AG_LOGLEVEL.DEBUG;

      const iterations = 1000;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        logger.debug(`Log message ${i}`, { iteration: i });
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should handle 1000 logs in reasonable time (less than 1 second)
      expect(totalTime).toBeLessThan(1000);
      expect(mockLogger).toHaveBeenCalledTimes(iterations);
    });

    // 目的: フィルタリングにより出力抑制時の低オーバーヘッド
    it('should not impact performance when log level filters out messages', () => {
      setupTestContext();
      const mockLogger = vi.fn();
      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: JsonFormatter });
      logger.logLevel = AG_LOGLEVEL.ERROR;

      const iterations = 1000;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        logger.debug(`Debug message ${i}`, { large: 'data'.repeat(100) });
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should be very fast since messages are filtered out
      expect(totalTime).toBeLessThan(100);
      expect(mockLogger).not.toHaveBeenCalled();
    });
  });

  /**
   * エラー復旧統合テストスイート
   *
   * @description プラグインでエラーが発生した際のエラー復旧と
   * システム安定性をテストする
   * ロガーエラー、フォーマッターエラー時の処理、システム安定性を確認
   *
   * @testFocus Error Recovery Integration
   * @scenarios
   * - ロガーエラー時のフォーマッターへの影響なし
   * - フォーマッターエラーの適切な処理
   * - エラー後のシステム安定性維持
   * - プラグイン切替え時の復旧能力
   */
  describe('Error Recovery Integration', () => {
    // 目的: ロガー側エラー時でもフォーマッター呼出は実施
    it('should handle logger errors gracefully without affecting formatter', () => {
      setupTestContext();
      const throwingLogger = vi.fn().mockImplementation(() => {
        throw new Error('Logger error');
      });
      const formatterSpy = vi.fn().mockReturnValue('formatted message');

      const logger = AgLogger.createLogger({ defaultLogger: throwingLogger, formatter: formatterSpy });
      logger.logLevel = AG_LOGLEVEL.INFO;

      expect(() => {
        logger.info('test message');
      }).toThrow('Logger error');

      // Formatter should have been called despite logger error
      expect(formatterSpy).toHaveBeenCalled();
    });

    // 目的: フォーマッター例外時にロガー未呼出となる挙動
    it('should handle formatter errors gracefully', () => {
      setupTestContext();
      const mockLogger = vi.fn();
      const throwingFormatter = vi.fn().mockImplementation(() => {
        throw new Error('Formatter error');
      });

      const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: throwingFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      expect(() => {
        logger.info('test message');
      }).toThrow('Formatter error');

      // Logger should not be called if formatter throws
      expect(mockLogger).not.toHaveBeenCalled();
    });

    // 目的: プラグインエラー発生後もシステム安定性を維持
    it('should maintain system stability after plugin errors', () => {
      setupTestContext();
      const throwingLogger = vi.fn().mockImplementation(() => {
        throw new Error('Temporary error');
      });

      const logger = AgLogger.createLogger({ defaultLogger: throwingLogger, formatter: PlainFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // First call throws
      expect(() => {
        logger.info('first message');
      }).toThrow('Temporary error');

      // Replace with working logger
      const workingLogger = vi.fn();
      logger.setLoggerConfig({ defaultLogger: workingLogger });

      // Should work normally now
      expect(() => {
        logger.info('second message');
      }).not.toThrow();

      expect(workingLogger).toHaveBeenCalled();
    });
  });
});
