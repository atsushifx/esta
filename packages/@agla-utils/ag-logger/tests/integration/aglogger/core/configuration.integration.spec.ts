// tests/integration/agLogger/core/configuration.integration.spec.ts
// @(#) : AgLogger Core Configuration Integration Tests - Configuration management verification
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { MockInstance, TestContext } from 'vitest';

// 共有定数: ログレベル定義
import { AG_LOGLEVEL } from '@/shared/types';

// テスト対象: AgLoggerとマネージャ
import { AgLogger } from '@/AgLogger.class';
import { AgLoggerManager } from '@/AgLoggerManager.class';

// プラグイン（フォーマッター/ロガー）: モック/プレーン実装
import { createMockFormatter } from '@/plugins/formatter/MockFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';

// Test Utilities

/**
 * テストモックを作成
 */
const createMock = (ctx: TestContext): { mockLogger: MockInstance; mockFormatter: MockInstance } => {
  const mockLogger = vi.fn();
  const mockFormatter = vi.fn().mockImplementation((msg) => msg.message ?? msg);

  ctx.onTestFinished(() => {
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
    vi.clearAllMocks();
  });

  return {
    mockLogger,
    mockFormatter,
  };
};

/**
 * AgLogger Core Configuration Integration Tests
 *
 * @description 設定管理の正確な動作を保証する統合テスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('AgLogger Core Configuration Integration', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
  };

  /**
   * Given: 複雑な設定組み合わせが存在する場合
   * When: 部分的なロガーマップ設定を適用した時
   * Then: 適切なフォールバック動作が発生する
   */
  describe('Given complex configuration combinations exist', () => {
    describe('When applying partial logger map configurations', () => {
      // 目的: 部分ロガーマップと混在設定の適用検証
      it('Then should handle partial logger maps with proper fallback', (ctx) => {
        createMock(ctx);
        setupTestContext();

        // Given: 異なる用途の専用ロガーを準備
        const errorLogger = new MockLogger.buffer();
        const warnLogger = new MockLogger.buffer();
        const defaultLogger = new MockLogger.buffer();

        // When: 部分的なロガーマップで設定
        const PassthroughFormatter = createMockFormatter((msg) => msg);
        const logger = AgLogger.createLogger({
          defaultLogger: defaultLogger.getLoggerFunction(),
          formatter: new PassthroughFormatter((msg) => msg).execute,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger.getLoggerFunction(AG_LOGLEVEL.ERROR),
            [AG_LOGLEVEL.WARN]: warnLogger.getLoggerFunction(AG_LOGLEVEL.WARN),
          },
        });

        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 各レベルでログ出力
        logger.error('error message'); // errorLogger使用
        logger.warn('warn message'); // warnLogger使用
        logger.info('info message'); // defaultLogger使用
        logger.debug('debug message'); // defaultLogger使用

        // Then: 各ロガーが適切に使い分けられる
        expect(errorLogger.getTotalMessageCount()).toBe(1);
        expect(warnLogger.getTotalMessageCount()).toBe(1);
        expect(defaultLogger.getTotalMessageCount()).toBe(2);

        // Then: メッセージ内容が正確
        expect(errorLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toMatchObject({
          message: 'error message',
        });
        expect(warnLogger.getLastMessage(AG_LOGLEVEL.WARN)).toMatchObject({
          message: 'warn message',
        });
      });
    });

    describe('When updating configurations incrementally', () => {
      // 目的: 段階的な設定更新を通じて最終構成が反映される
      it('Then should maintain final configuration through multiple updates', (ctx) => {
        createMock(ctx);
        setupTestContext();

        // Given: 初期ロガーインスタンス
        const logger = AgLogger.createLogger();
        const finalLogger = new MockLogger.buffer();

        // When: 段階的な設定更新を実行
        const tempLogger1 = new MockLogger.buffer();
        const tempLogger2 = new MockLogger.buffer();

        logger.setLoggerConfig({ defaultLogger: tempLogger1.getLoggerFunction() });
        logger.setLoggerConfig({
          loggerMap: { [AG_LOGLEVEL.ERROR]: tempLogger2.getLoggerFunction(AG_LOGLEVEL.ERROR) },
        });
        const JsonFormatter = createMockFormatter((msg) => JSON.stringify(msg));
        logger.setLoggerConfig({ formatter: new JsonFormatter((msg) => JSON.stringify(msg)).execute });
        logger.setLoggerConfig({ defaultLogger: finalLogger.getLoggerFunction() });

        // When: 最終設定でログ出力
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.info('test message');

        // Then: 最終設定が有効
        expect(finalLogger.getTotalMessageCount()).toBe(1);
        const message = finalLogger.getLastMessage(AG_LOGLEVEL.DEFAULT) as string;
        expect(() => JSON.parse(message)).not.toThrow();
        const parsed = JSON.parse(message);
        expect(parsed.message).toBe('test message');
      });
    });
  });

  /**
   * Given: 設定競合とエラーシナリオが存在する場合
   * When: フォーマッター競合が発生した時
   * Then: 適切なエラー処理が行われる
   */
  describe('Given configuration conflicts and error scenarios exist', () => {
    describe('When formatter conflicts occur', () => {
      // 目的: フォーマッター競合発生時のエラー処理
      it('Then should handle configuration conflicts gracefully', (ctx) => {
        createMock(ctx);
        setupTestContext();

        // Given: 正常なロガーインスタンス
        const logger = AgLogger.createLogger();
        const conflictingFormatter1 = vi.fn().mockReturnValue('format1');
        const conflictingFormatter2 = vi.fn(() => {
          throw new Error('Formatter conflict');
        });

        // When: 最初の設定は成功
        logger.setLoggerConfig({ formatter: conflictingFormatter1 });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // Then: 正常な動作
        expect(() => logger.info('test1')).not.toThrow();

        // When: 競合する設定を適用
        logger.setLoggerConfig({ formatter: conflictingFormatter2 });

        // Then: エラーが適切に処理される
        expect(() => logger.info('test2')).toThrow('Formatter conflict');
      });
    });

    describe('When rapid configuration changes occur during logging', () => {
      // 目的: ログ出力中の急速な設定変更に耐える
      it('Then should handle rapid configuration changes during active logging', (ctx) => {
        createMock(ctx);
        setupTestContext();

        // Given: 複数の設定オプション
        const mockLogger1 = vi.fn();
        const mockLogger2 = vi.fn();
        const mockFormatter1 = vi.fn().mockReturnValue('format1');
        const mockFormatter2 = vi.fn().mockReturnValue('format2');

        // When: 初期設定
        const logger = AgLogger.createLogger({ defaultLogger: mockLogger1, formatter: mockFormatter1 });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: ログ出力と設定変更を交互に実行
        for (let i = 0; i < 100; i++) {
          logger.info(`Rapid config test ${i}`);

          if (i % 10 === 0) {
            // 10回ごとに設定変更
            const useFirst = i % 20 === 0;
            logger.setLoggerConfig({
              defaultLogger: useFirst ? mockLogger1 : mockLogger2,
              formatter: useFirst ? mockFormatter1 : mockFormatter2,
            });
          }
        }

        // Then: 全ての処理が完了
        expect(mockLogger1.mock.calls.length + mockLogger2.mock.calls.length).toBe(100);
        expect(mockFormatter1.mock.calls.length + mockFormatter2.mock.calls.length).toBe(100);
      });
    });

    describe('When mixed error scenarios occur in complex configurations', () => {
      // 目的: 複雑設定下での混在エラーパターン処理
      it('Then should handle mixed error scenarios appropriately', (ctx) => {
        createMock(ctx);
        setupTestContext();

        // Given: 正常なロガーとエラーロガーの混在設定
        const mockLogger = vi.fn();
        const errorLogger = vi.fn().mockImplementation(() => {
          throw new Error('Error logger failed');
        });

        // When: エラーロガーを含む設定
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: PlainFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger,
          },
        });

        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // Then: エラーレベルは失敗、他は成功
        expect(() => logger.error('error')).toThrow('Error logger failed');
        expect(() => logger.info('info')).not.toThrow();
        expect(mockLogger).toHaveBeenCalledTimes(1);
      });
    });
  });
});
