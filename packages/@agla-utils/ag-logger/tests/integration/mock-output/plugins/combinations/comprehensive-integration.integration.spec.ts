// tests/integration/mock-output/plugins/combinations/aglogger-e2e-integration.integration.spec.ts
// @(#) : AgLogger E2eMockLogger Integration Tests - AgLogger and E2eMockLogger system integration
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// 共有定数: ログレベル定義
import { AG_LOGLEVEL } from '@/shared/types';

// テスト対象: AgLoggerとエントリーポイント
import { AgLogger } from '@/AgLogger.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

// プラグイン（ロガー）: E2E実装
import { E2eMockLogger } from '@/plugins/logger/E2eMockLogger';

// Test Utilities

/**
 * テストモックを作成 - E2eMockLogger使用
 */
const setupTest = (ctx: TestContext): { mockLogger: E2eMockLogger } => {
  vi.clearAllMocks();
  AgLogger.resetSingleton();

  const mockLogger = new E2eMockLogger('aglogger-e2e-integration');
  mockLogger.startTest(ctx.task.id);

  ctx.onTestFinished(() => {
    mockLogger.endTest();
    AgLogger.resetSingleton();
    vi.clearAllMocks();
  });

  return {
    mockLogger,
  };
};

/**
 * AgLogger E2eMockLogger Integration Tests
 *
 * @description AgLoggerとE2eMockLoggerのシステム間連携統合動作を保証するテスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('Mock Output Comprehensive Integration', () => {
  /**
   * Given: PlainFormatter統合シナリオが存在する場合
   * When: 基本ログ操作が実行された時
   * Then: 包括的なメッセージ検証で正しく統合される
   *
   * @description PlainFormatterとE2eMockLoggerの基本統合動作テスト
   * システム間連携での基本ログレベル動作と内容検証を実施
   */
  describe('Given complete system integration scenarios', () => {
    describe('When using plain formatter with basic operations', () => {
      it('Then should integrate formatting with data handling seamlessly', (ctx) => {
        const { mockLogger } = setupTest(ctx);

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: PlainFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // Act
        logger.info('Integration test message');
        logger.warn('Warning message');
        logger.error('Error message');

        // Assert - counts
        const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
        const warnMessages = mockLogger.getMessages(AG_LOGLEVEL.WARN);
        const errorMessages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);

        expect(infoMessages).toHaveLength(1);
        expect(warnMessages).toHaveLength(1);
        expect(errorMessages).toHaveLength(1);

        // Assert - contents
        expect(infoMessages[0]).toMatch(/\[INFO\] Integration test message$/);
        expect(warnMessages[0]).toMatch(/\[WARN\] Warning message$/);
        expect(errorMessages[0]).toMatch(/\[ERROR\] Error message$/);
      });
    });

    describe('When processing complex data objects', () => {
      it('Then should integrate formatting with complex data correctly', (ctx) => {
        const { mockLogger } = setupTest(ctx);

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: PlainFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // Arrange
        const complexArg = { user: { id: 123, roles: ['admin', 'editor'] }, meta: { requestId: 'req-xyz' } };

        // Act
        logger.info('Complex data', complexArg);

        // Assert
        const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
        expect(messages).toHaveLength(1);
        const messageText = String(messages[0]);
        expect(messageText).toMatch(/\[INFO\] Complex data/);
        expect(messageText).toContain(JSON.stringify(complexArg));
      });
    });
  });

  /**
   * Given: JsonFormatter統合シナリオが存在する場合
   * When: JSON出力処理が実行された時
   * Then: JSON構造と高頻度ログの検証で正しく統合される
   *
   * @description JsonFormatterとE2eMockLoggerの統合動作テスト
   * JSON出力形式でのシステム間連携と高頻度ログ処理性能を検証
   */
  describe('Given formatter and logger combinations', () => {
    describe('When coordinating JSON output with mock logger', () => {
      it('Then should produce structured output correctly', (ctx) => {
        const { mockLogger } = setupTest(ctx);

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: JsonFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // Act
        const args = { userId: 123, action: 'login' };
        logger.info('JSON test message', args);

        // Assert
        const messages = mockLogger.getMessages(AG_LOGLEVEL.DEFAULT);
        expect(messages).toHaveLength(1);
        const parsedMessage = JSON.parse(String(messages[0]));
        expect(parsedMessage.level).toBe('INFO');
        expect(parsedMessage.message).toBe('JSON test message');
        expect(parsedMessage.args).toEqual([args]);
      });
    });

    describe('When processing high-volume logging operations', () => {
      it('Then should maintain performance under load conditions', (ctx) => {
        const { mockLogger } = setupTest(ctx);

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: JsonFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        const logCount = 50;
        for (let i = 0; i < logCount; i++) {
          logger.info('Perf iteration', { iteration: i });
        }

        const messages = mockLogger.getMessages(AG_LOGLEVEL.DEFAULT);
        expect(messages).toHaveLength(logCount);

        const firstMessage = JSON.parse(String(messages[0]));
        const lastMessage = JSON.parse(String(messages[messages.length - 1]));
        expect(firstMessage.args[0].iteration).toBe(0);
        expect(lastMessage.args[0].iteration).toBe(logCount - 1);
      });
    });
  });

  /**
   * Given: ログレベル管理シナリオが存在する場合
   * When: ログフィルタリングと動的変更が適用された時
   * Then: 統合環境で正しくログをフィルタリングし、実行時変更を処理する
   *
   * @description ログレベル管理でのシステム間連携テスト
   * フィルタリング動作と動的レベル変更での統合動作を検証
   */
  describe('Given formatter and logger combinations', () => {
    describe('When managing log level changes with active formatters', () => {
      it('Then should synchronize level changes across components', (ctx) => {
        const { mockLogger } = setupTest(ctx);

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: PlainFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.WARN;

        logger.debug('debug suppressed');
        logger.info('info suppressed');
        logger.warn('warn shown');
        logger.error('error shown');

        expect(mockLogger.getMessages(AG_LOGLEVEL.DEBUG)).toHaveLength(0);
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(0);
        expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toHaveLength(1);
        expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toHaveLength(1);
      });
    });

    describe('When dynamic level changes occur', () => {
      it('Then should handle runtime level changes correctly', (ctx) => {
        const { mockLogger } = setupTest(ctx);

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: PlainFormatter,
        });

        // Start with WARN: INFO/DEBUG suppressed
        logger.logLevel = AG_LOGLEVEL.WARN;
        logger.debug('debug suppressed');
        logger.info('info suppressed');
        logger.warn('warn shown 1');
        expect(mockLogger.getMessages(AG_LOGLEVEL.DEBUG)).toHaveLength(0);
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(0);
        expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toHaveLength(1);

        // Change to INFO: INFO allowed
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.info('info shown 1');
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(1);

        // Change to ERROR: WARN now suppressed, ERROR allowed
        logger.logLevel = AG_LOGLEVEL.ERROR;
        logger.warn('warn suppressed 2');
        logger.error('error shown 1');
        expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toHaveLength(1);
        expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toHaveLength(1);
      });
    });
  });
});
