// tests/integration/console-output/loggers/console-logger-behavior.integration.spec.ts
// @(#) : Console Logger Behavior Integration Tests - Console output behavior verification
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Test framework: execution, assertion, mocking
import { describe, expect, it, vi } from 'vitest';

// Shared types and constants: log levels and type definitions
import { AG_LOGLEVEL } from '@/shared/types';

// Test targets: main classes under test
import { AgLogger } from '@/AgLogger.class';

// Plugin implementations: formatters and loggers
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
import { ConsoleLogger, ConsoleLoggerMap } from '@/plugins/logger/ConsoleLogger';
import { NullLogger } from '@/plugins/logger/NullLogger';

/**
 * Console Logger Behavior Integration Tests
 *
 * @description Console出力での各種ロガーの振る舞いを保証するテスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('Console Logger Behavior Integration', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  };

  /**
   * Given: ConsoleLogger が使用される環境が存在する場合
   * When: コンソール出力が要求された時
   * Then: 適切なconsole.methodで出力される
   *
   * @description ConsoleLoggerの基本統合動作とconsole呼び出し確認テスト
   * 実際のconsole.methodが適切に呼び出されることを検証
   */
  describe('Given ConsoleLogger is used in the environment', () => {
    /**
     * @description コンソール出力要求時の適切なconsole.method呼び出しテスト
     * ConsoleLoggerが指定されたレベルのconsole.methodを正しく使用することを検証
     */
    describe('When console output is requested', () => {
      // ConsoleLoggerの基本統合動作とconsole.methodの呼び出しを確認
      it('Then should output to appropriate console method', () => {
        setupTestContext();

        // Given: コンソール出力監視の設定
        const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
        const logger = AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          formatter: JsonFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: ConsoleLoggerでの出力
        logger.info('test message', { data: 'value' });

        // Then: 適切なconsoleメソッドで出力され、有効なJSON形式
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        const [output] = consoleSpy.mock.calls[0];
        const parsed = JSON.parse(output);
        expect(parsed).toMatchObject({
          level: 'INFO',
          message: 'test message',
          args: [{ data: 'value' }],
        });

        consoleSpy.mockRestore();
      });
    });
  });

  /**
   * Given: ConsoleLoggerMap が使用される環境が存在する場合
   * When: レベル固有のコンソール出力が要求された時
   * Then: 各レベルに応じた適切なconsole.methodで出力される
   *
   * @description ConsoleLoggerMapのレベル固有動作統合テスト
   * 各ログレベルに応じて適切なconsole.methodに振り分けられることを検証
   */
  describe('Given ConsoleLoggerMap is used in the environment', () => {
    /**
     * @description レベル固有コンソール出力要求時の適切なmethod振り分けテスト
     * ConsoleLoggerMapが各ログレベルに対して正しいconsole.methodを使用することを検証
     */
    describe('When level-specific console output is requested', () => {
      // ConsoleLoggerMap×JsonFormatterで適切なconsoleメソッドに振り分けを確認
      it('Then should use correct console methods with JsonFormatter', () => {
        setupTestContext();

        // Given: 全consoleメソッド監視の設定
        const consoleSpies = {
          error: vi.spyOn(console, 'error').mockImplementation(() => {}),
          warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
          info: vi.spyOn(console, 'info').mockImplementation(() => {}),
          debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
          log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        };

        // Given: ConsoleLoggerMap設定
        const logger = AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          formatter: JsonFormatter,
          loggerMap: ConsoleLoggerMap,
        });
        logger.logLevel = AG_LOGLEVEL.TRACE;

        // When: 各レベルでのログ出力
        logger.fatal('fatal message');
        logger.error('error message');
        logger.warn('warn message');
        logger.info('info message');
        logger.debug('debug message');
        logger.trace('trace message');

        // Then: 適切なconsoleメソッドが呼び出される
        expect(consoleSpies.error).toHaveBeenCalledTimes(2); // fatal and error
        expect(consoleSpies.warn).toHaveBeenCalledTimes(1);
        expect(consoleSpies.info).toHaveBeenCalledTimes(1);
        expect(consoleSpies.debug).toHaveBeenCalledTimes(2); // debug and trace both use console.debug
        expect(consoleSpies.log).toHaveBeenCalledTimes(0); // no trace calls to log

        // Then: 各出力が有効なJSON形式
        [consoleSpies.error, consoleSpies.warn, consoleSpies.info, consoleSpies.debug]
          .forEach((spy) => {
            spy.mock.calls.forEach(([output]) => {
              const parsed = JSON.parse(output);
              expect(parsed).toHaveProperty('level');
              expect(parsed).toHaveProperty('message');
            });
          });

        Object.values(consoleSpies).forEach((spy) => spy.mockRestore());
      });
    });
  });

  /**
   * Given: NullLogger が使用される環境が存在する場合
   * When: ログ出力抑制が要求された時
   * Then: 何も出力されず、エラーも発生しない
   *
   * @description NullLoggerによるログ出力抑制動作統合テスト
   * ログ出力を抑制し、エラーなく安全に動作することを検証
   */
  describe('Given NullLogger is used in the environment', () => {
    /**
     * @description ログ出力抑制要求時の安全な無出力動作テスト
     * NullLoggerが出力を行わず、エラーも発生しないことを検証
     */
    describe('When log output suppression is requested', () => {
      // NullLogger使用時の安全な無出力動作を確認
      it('Then should handle NullLogger with any formatter safely', () => {
        setupTestContext();

        // Given: NullLogger設定
        const logger = AgLogger.createLogger({
          defaultLogger: NullLogger,
          formatter: JsonFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: NullLoggerでのログ出力試行
        // Then: エラーが発生せず、サイレントに完了
        expect(() => {
          logger.info('test message');
        }).not.toThrow();
      });
    });

    /**
     * @description ロガーマップ内でのNullLoggerフォールバック使用テスト
     * LoggerMap内でのNullLogger使用時の安定性を検証
     */
    describe('When used as fallback in logger map', () => {
      // ロガーマップ内でのNullLogger使用時の安定性を確認
      it('Then should work correctly as fallback logger in map configuration', () => {
        setupTestContext();

        // Given: NullLoggerをフォールバックとする設定
        const infoLogger = vi.fn();
        const logger = AgLogger.createLogger({
          defaultLogger: NullLogger, // デフォルトはNullLogger
          formatter: JsonFormatter,
          loggerMap: {
            [AG_LOGLEVEL.INFO]: infoLogger, // INFOのみ専用ロガー
          },
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 専用ロガーがあるレベルと、NullLoggerになるレベルで出力
        logger.info('info message'); // 専用ロガー使用
        logger.debug('debug message'); // NullLogger使用

        // Then: 専用ロガーは呼び出され、NullLoggerは安全に動作
        expect(infoLogger).toHaveBeenCalledTimes(1);
        expect(() => {
          logger.warn('warn message'); // NullLogger使用
          logger.error('error message'); // NullLogger使用
        }).not.toThrow();
      });
    });
  });

  /**
   * Given: モックロガーが使用される環境が存在する場合
   * When: テスト用のモック動作が要求された時
   * Then: 期待される動作でモック処理が実行される
   *
   * @description モックロガーの統合動作テスト
   * テスト環境でのモックロガーの適切な動作を検証
   */
  describe('Given mock loggers are used in the environment', () => {
    /**
     * @description テスト用モック動作要求時の適切な処理テスト
     * モックロガーが期待される動作で正しく処理されることを検証
     */
    describe('When test mock behavior is requested', () => {
      // モックロガーの基本統合動作を確認
      it('Then should work correctly with mock loggers', () => {
        setupTestContext();

        // Given: モックロガー設定
        const mockLogger = vi.fn();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: JsonFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: モックロガーでの出力
        logger.debug('debug message', { debug: true });

        // Then: モックロガーが適切に呼び出される
        expect(mockLogger).toHaveBeenCalledTimes(1);
        const [output] = mockLogger.mock.calls[0];

        expect(() => JSON.parse(output)).not.toThrow();
        const parsed = JSON.parse(output);
        expect(parsed).toMatchObject({
          level: 'DEBUG',
          message: 'debug message',
          args: [{ debug: true }],
        });
      });
    });

    /**
     * @description モックロガーエラーシナリオ発生時の処理テスト
     * モックロガーでエラーが発生した場合の適切な伝播を検証
     */
    describe('When mock logger error scenarios occur', () => {
      // モックロガーエラー時の適切な処理を確認
      it('Then should propagate mock logger errors correctly', () => {
        setupTestContext();

        // Given: エラーを投げるモックロガー
        const throwingMockLogger = vi.fn().mockImplementation(() => {
          throw new Error('Mock logger error');
        });

        const logger = AgLogger.createLogger({
          defaultLogger: throwingMockLogger,
          formatter: PlainFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.ERROR;

        // When/Then: モックロガーのエラーが適切にスローされる
        expect(() => logger.error('error message')).toThrow('Mock logger error');
        expect(throwingMockLogger).toHaveBeenCalledTimes(1);
      });
    });
  });
});
