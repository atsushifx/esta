// tests/integration/console-output/loggers/console-logger-behavior.integration.spec.ts
// @(#) : Console Logger Behavior Integration Tests - Console output behavior verification
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';

// 共有定数: ログレベル定義
import { AG_LOGLEVEL } from '@/shared/types';

// テスト対象: AgLoggerとエントリーポイント
import { AgLogger } from '@/AgLogger.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

// プラグイン（ロガー）: 出力先実装とマップ
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
   */
  describe('Given ConsoleLogger is used in the environment', () => {
    describe('When console output is requested', () => {
      // 目的: ConsoleLoggerの基本統合動作とconsole呼び出し確認
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

        // Then: 適切なconsoleメソッドで出力
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        const [output] = consoleSpy.mock.calls[0];

        expect(() => JSON.parse(output)).not.toThrow();
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
   */
  describe('Given ConsoleLoggerMap is used in the environment', () => {
    describe('When level-specific console output is requested', () => {
      // 目的: ConsoleLoggerMap×JsonFormatterで適切なconsoleメソッドに振分け
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
        [consoleSpies.error, consoleSpies.warn, consoleSpies.info, consoleSpies.debug, consoleSpies.log]
          .forEach((spy) => {
            spy.mock.calls.forEach(([output]) => {
              expect(() => JSON.parse(output)).not.toThrow();
            });
          });

        Object.values(consoleSpies).forEach((spy) => spy.mockRestore());
      });
    });

    describe('When used with PlainFormatter', () => {
      // 目的: ConsoleLoggerMap×PlainFormatterで適切なconsoleメソッドに振分け
      it('Then should use correct console methods with PlainFormatter', () => {
        setupTestContext();

        // Given: 全consoleメソッド監視の設定
        const consoleSpies = {
          error: vi.spyOn(console, 'error').mockImplementation(() => {}),
          warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
          info: vi.spyOn(console, 'info').mockImplementation(() => {}),
          debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
          log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        };

        // Given: ConsoleLoggerMap + PlainFormatter設定
        const logger = AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          formatter: PlainFormatter,
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

        // Then: 各出力がPlainFormatterパターンに一致
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
  });

  /**
   * Given: NullLogger が使用される環境が存在する場合
   * When: ログ出力抑制が要求された時
   * Then: 何も出力されず、エラーも発生しない
   */
  describe('Given NullLogger is used in the environment', () => {
    describe('When log output suppression is requested', () => {
      // 目的: NullLogger使用時の安全な無出力動作
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

    describe('When used as fallback in logger map', () => {
      // 目的: ロガーマップ内でのNullLogger使用時の安定性
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
   */
  describe('Given mock loggers are used in the environment', () => {
    describe('When test mock behavior is requested', () => {
      // 目的: モックロガーの基本統合動作
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

    describe('When mock logger error scenarios occur', () => {
      // 目的: モックロガーエラー時の処理
      it('Then should handle mock logger errors appropriately', () => {
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

        // When: エラーロガーでの出力
        // Then: モックロガーのエラーが適切にスローされる
        expect(() => {
          logger.error('error message');
        }).toThrow('Mock logger error');

        // Then: フォーマッターは呼び出される（ロガーエラーの前に実行）
        expect(throwingMockLogger).toHaveBeenCalledTimes(1);
      });
    });
  });
});
