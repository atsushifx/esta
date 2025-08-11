// tests/integration/AgLogger.configuration.integration.spec.ts
// @(#) : AgLogger Configuration Integration Tests - Complex configuration scenarios
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
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
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
 * AgLogger Configuration Integration Tests
 *
 * @description 複雑な設定組み合わせと動的設定変更の統合動作テスト
 */
describe('AgLogger Configuration Integration Tests', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
  };

  /**
   * 複合設定統合機能
   */
  describe('Complex Configuration Integration', () => {
    /**
     * 正常系: 基本的な複合設定統合
     */
    describe('正常系: Basic Complex Configuration Integration', () => {
      // 目的: 部分ロガーマップと混在設定の適用検証
      it('should handle partial logger maps with mixed configurations', (ctx) => {
        createMock(ctx);
        setupTestContext();

        const errorLogger = new MockLogger.buffer();
        const warnLogger = new MockLogger.buffer();
        const defaultLogger = new MockLogger.buffer();

        const logger = AgLogger.createLogger({
          defaultLogger: defaultLogger.createLoggerFunction(),
          formatter: MockFormatter.passthrough,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger.createLoggerFunction(AG_LOGLEVEL.ERROR),
            [AG_LOGLEVEL.WARN]: warnLogger.createLoggerFunction(AG_LOGLEVEL.WARN),
          },
        });

        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // 各レベルでのロガー使い分けを確認
        logger.error('error message'); // errorLogger使用
        logger.warn('warn message'); // warnLogger使用
        logger.info('info message'); // defaultLogger使用
        logger.debug('debug message'); // defaultLogger使用

        expect(errorLogger.getTotalMessageCount()).toBe(1);
        expect(warnLogger.getTotalMessageCount()).toBe(1);
        expect(defaultLogger.getTotalMessageCount()).toBe(2);

        expect(errorLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toMatchObject({
          message: 'error message',
        });
        expect(warnLogger.getLastMessage(AG_LOGLEVEL.WARN)).toMatchObject({
          message: 'warn message',
        });
      });

      // 目的: 段階的な設定更新を通じて最終構成が反映される
      it('should maintain configuration through multiple updates', (ctx) => {
        createMock(ctx);
        setupTestContext();

        const logger = AgLogger.createLogger();
        const finalLogger = new MockLogger.buffer();

        // 段階的な設定更新
        const tempLogger1 = new MockLogger.buffer();
        const tempLogger2 = new MockLogger.buffer();

        logger.setLoggerConfig({ defaultLogger: tempLogger1.createLoggerFunction() });
        logger.setLoggerConfig({
          loggerMap: { [AG_LOGLEVEL.ERROR]: tempLogger2.createLoggerFunction(AG_LOGLEVEL.ERROR) },
        });
        logger.setLoggerConfig({ formatter: MockFormatter.json });
        logger.setLoggerConfig({ defaultLogger: finalLogger.createLoggerFunction() });

        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.info('test message');

        expect(finalLogger.getTotalMessageCount()).toBe(1);
        const message = finalLogger.getLastMessage(AG_LOGLEVEL.INFO) as string;
        expect(() => JSON.parse(message)).not.toThrow();
        const parsed = JSON.parse(message);
        expect(parsed.message).toBe('test message');
      });
    });

    /**
     * 異常系: 複合設定エラー処理
     */
    describe('異常系: Complex Configuration Error Handling', () => {
      // 目的: フォーマッター競合発生時のエラー処理
      it('should handle configuration conflicts gracefully', (ctx) => {
        createMock(ctx);
        setupTestContext();

        const logger = AgLogger.createLogger();
        const conflictingFormatter1 = vi.fn().mockReturnValue('format1');
        const conflictingFormatter2 = vi.fn(() => {
          throw new Error('Formatter conflict');
        });

        // 最初の設定は成功
        logger.setLoggerConfig({ formatter: conflictingFormatter1 });
        logger.logLevel = AG_LOGLEVEL.INFO;

        expect(() => logger.info('test1')).not.toThrow();

        // 競合する設定でエラー
        logger.setLoggerConfig({ formatter: conflictingFormatter2 });

        expect(() => logger.info('test2')).toThrow('Formatter conflict');
      });
    });

    /**
     * エッジケース: 複雑な設定統合パターン
     */
    describe('エッジケース: Complex Configuration Integration Patterns', () => {
      // 目的: ログ出力中の急速な設定変更に耐える
      it('should handle rapid configuration changes during logging', (ctx) => {
        createMock(ctx);
        setupTestContext();

        const mockLogger1 = vi.fn();
        const mockLogger2 = vi.fn();
        const mockFormatter1 = vi.fn().mockReturnValue('format1');
        const mockFormatter2 = vi.fn().mockReturnValue('format2');

        const logger = AgLogger.createLogger({ defaultLogger: mockLogger1, formatter: mockFormatter1 });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // ログ出力と設定変更を交互に実行
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

        // 両方のロガーが使用されたことを確認
        expect(mockLogger1.mock.calls.length + mockLogger2.mock.calls.length).toBe(100);
        expect(mockFormatter1.mock.calls.length + mockFormatter2.mock.calls.length).toBe(100);
      });

      // 目的: 複雑設定下での混在エラーパターン処理
      it('should handle mixed error scenarios in complex configurations', (ctx) => {
        createMock(ctx);
        setupTestContext();

        const mockLogger = vi.fn();
        const errorLogger = vi.fn().mockImplementation(() => {
          throw new Error('Error logger failed');
        });

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: PlainFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger,
          },
        });

        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // エラーレベルは失敗、他は成功
        expect(() => logger.error('error')).toThrow('Error logger failed');
        expect(() => logger.info('info')).not.toThrow();
        expect(mockLogger).toHaveBeenCalledTimes(1);
      });
    });
  });
});
