// tests/integration/agLogger/performance/highLoad.integration.spec.ts
// @(#) : AgLogger Performance High Load Integration Tests - High-load and performance scenarios
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Test framework: execution, assertion, mocking
import { describe, expect, it } from 'vitest';
import type { TestContext } from 'vitest';

// Shared types and constants: log levels and utilities
import { AG_LOGLEVEL } from '@/shared/types';
import { ENABLE } from '../../../../shared/constants';

// Test targets: main classes under test
import { AgLogger } from '@/AgLogger.class';

// Plugin implementations: formatters and loggers
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { E2eMockLogger } from '@/plugins/logger/E2eMockLogger';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import type { AgMockConstructor } from '@/shared/types/AgMockConstructor.class';

// Test utilities
/**
 * テストモックを作成
 */
const setupTest = (ctx: TestContext): { mockLogger: AgMockBufferLogger; mockFormatter: AgMockConstructor } => {
  const _mockLogger = new MockLogger.buffer();
  const _mockFormatter = MockFormatter.passthrough;

  AgLogger.resetSingleton();

  ctx.onTestFinished(() => {
    AgLogger.resetSingleton();
    _mockLogger.clearAllMessages();
  });

  return {
    mockLogger: _mockLogger,
    mockFormatter: _mockFormatter,
  };
};

/**
 * AgLogger Performance High Load Integration Tests
 *
 * @description 高負荷・パフォーマンス・同時実行のインテグレーションテスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('AgLogger Performance High Load Integration', () => {
  /**
   * Given: 高頻度ログ出力シナリオが存在する場合
   * When: 大量のログメッセージを連続出力した時
   * Then: 合理的な時間内で処理が完了する
   */
  describe('Given high-frequency logging scenarios exist', () => {
    describe('When outputting large volumes of log messages continuously', () => {
      // 目的: 高頻度ログ出力時の処理性能維持
      it('Then should maintain performance with high-frequency logging', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTest(_ctx);

        // Given: パフォーマンス重視の設定
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.default,
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 大量ログ出力の実行
        const iterations = 1000;
        const startTime = Date.now();

        for (let i = 0; i < iterations; i++) {
          logger.debug(`Log message ${i}`, { iteration: i, timestamp: Date.now() });
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Then: 合理的な処理時間（1000回で1秒以内）
        expect(totalTime).toBeLessThan(1_000);
        expect(mockLogger.getTotalMessageCount()).toBe(iterations);
      });
    });

    describe('When processing large data payloads at high frequency', () => {
      // 目的: 大量データを含む高頻度ログの性能
      it('Then should handle large payloads efficiently at high frequency', (_ctx) => {
        const { mockLogger } = setupTest(_ctx);

        // Given: 大量データ対応の設定
        const JsonFormatter = MockFormatter.json; // JSON化によるオーバーヘッドを含む>
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: JsonFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: 大量データを含むログを高頻度出力
        const iterations = 500;
        const largePayload = {
          data: Array.from({ length: 100 }, (_, i) => ({ id: i, value: `data_${i}` })),
          metadata: { processed: true, timestamp: Date.now() },
          summary: 'Large data processing completed',
        };

        const startTime = Date.now();
        for (let i = 0; i < iterations; i++) {
          logger.info(`Processing batch ${i}`, largePayload);
        }
        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Then: 大量データでも合理的な処理時間（500回で2秒以内）
        expect(totalTime).toBeLessThan(2_000);
        expect(mockLogger.getTotalMessageCount()).toBe(iterations);
      });
    });
  });

  /**
   * Given: ログレベルフィルタリング環境が存在する場合
   * When: フィルタリングで多数のメッセージが抑制された時
   * Then: オーバーヘッドが最小限に抑えられる
   */
  describe('Given log level filtering environments exist', () => {
    describe('When many messages are suppressed by filtering', () => {
      // 目的: フィルタリングによる出力抑制時の低オーバーヘッド
      it('Then should minimize overhead when messages are filtered out', (_ctx) => {
        const { mockLogger } = setupTest(_ctx);

        // Given: 厳格なフィルタリング設定（ERROR レベルのみ）
        const JsonFormatter = MockFormatter.json;
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: JsonFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.ERROR;

        // When: フィルタリングされるレベルで大量出力
        const iterations = 1000;
        const startTime = Date.now();

        for (let i = 0; i < iterations; i++) {
          logger.debug(`Debug message ${i}`, { large: 'data'.repeat(100) });
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Then: フィルタリングによる高速処理（100ms以内）
        expect(totalTime).toBeLessThan(100);
        expect(mockLogger.getTotalMessageCount()).toBe(0); // 全てフィルタリング
      });
    });
  });

  /**
   * Given: 同時実行環境が存在する場合
   * When: 複数の非同期処理から同時にログ出力した時
   * Then: データ競合なく安全に処理される
   */
  describe('Given concurrent execution environments exist', () => {
    describe('When multiple async processes log simultaneously', () => {
      // 目的: 同時実行時の安全性とパフォーマンス
      it('Then should handle concurrent logging safely and efficiently', async (_ctx) => {
        const { mockLogger, mockFormatter } = setupTest(_ctx);

        // Given: 同時実行対応の設定
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: 複数の非同期処理でログ出力
        const concurrentTasks = 10;
        const messagesPerTask = 50;

        const startTime = Date.now();
        const tasks = Array.from({ length: concurrentTasks }, (_, taskId) =>
          Promise.resolve().then(() => {
            for (let i = 0; i < messagesPerTask; i++) {
              logger.info(`Task ${taskId} - Message ${i}`, { taskId, messageId: i });
            }
          }));

        await Promise.all(tasks);
        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Then: 同時実行でも合理的な処理時間（1秒以内）
        expect(totalTime).toBeLessThan(1_000);
        expect(mockLogger.getTotalMessageCount()).toBe(concurrentTasks * messagesPerTask);
      });
    });
  });

  /**
   * Given: 複雑な設定組み合わせ環境が存在する場合
   * When: 全機能を有効にして高負荷処理を実行した時
   * Then: 機能間の相互作用でも安定したパフォーマンスを維持する
   */
  describe('Given complex configuration combinations exist', () => {
    describe('When executing high-load processing with all features enabled', () => {
      // 目的: フル機能有効時の統合パフォーマンス
      it('Then should maintain stable performance with full feature interaction', (_ctx) => {
        const { mockLogger } = setupTest(_ctx);

        // Given: 全機能有効の複雑な設定
        const errorLogger = new MockLogger.buffer();
        const HeavyFormatter = MockFormatter.json;
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: HeavyFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger.getLoggerFunction(),
            [AG_LOGLEVEL.WARN]: mockLogger.getLoggerFunction(),
          },
        });
        logger.logLevel = AG_LOGLEVEL.TRACE; // 最も詳細なレベル
        logger.setVerbose = ENABLE; // Verboseモード有効

        // When: 複雑設定での高負荷処理
        const iterations = 200; // 複雑設定のため回数を調整
        const startTime = Date.now();

        for (let i = 0; i < iterations; i++) {
          const level = i % 4;
          switch (level) {
            case 0:
              logger.error(`Error ${i}`, { type: 'error', data: { id: i } });
              break;
            case 1:
              logger.warn(`Warning ${i}`, { type: 'warning', data: { id: i } });
              break;
            case 2:
              logger.info(`Info ${i}`, { type: 'info', data: { id: i } });
              break;
            case 3:
              logger.debug(`Debug ${i}`, { type: 'debug', data: { id: i } });
              break;
          }
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Then: 複雑設定でも合理的な処理時間（2秒以内）
        expect(totalTime).toBeLessThan(2_000);
        expect(mockLogger.getTotalMessageCount() + errorLogger.getTotalMessageCount()).toBe(iterations);
        expect(logger.isVerbose).toBe(ENABLE);
      });
    });
  });

  /**
   * Given: E2E高負荷ストレステスト環境が存在する場合
   * When: E2E環境で高負荷処理が実行された時
   * Then: E2E環境でもパフォーマンスが維持される
   *
   * @description E2E環境での高負荷ストレステスト
   * E2E環境特有の性能特性と大量データ処理を検証
   */
  describe('Given E2E high-load stress test environments exist', () => {
    /**
     * E2E環境用テストセットアップ
     */
    const setupE2ETest = (ctx: TestContext): { mockLogger: E2eMockLogger } => {
      const mockLogger = new E2eMockLogger('e2e-performance-stress');
      mockLogger.startTest(ctx.task.id);

      AgLogger.resetSingleton();

      ctx.onTestFinished(() => {
        mockLogger.endTest();
        AgLogger.resetSingleton();
      });

      return { mockLogger };
    };

    /**
     * @description E2E環境での高負荷メッセージ整合性テスト
     * E2E環境特有の高負荷条件下でのメッセージ整合性を検証
     */
    describe('When high-load processing with message integrity is executed in E2E environment', () => {
      // E2E環境での高負荷時のメッセージ整合性維持
      it('Then should maintain E2E message integrity under high load conditions', (ctx) => {
        const { mockLogger } = setupE2ETest(ctx);

        // Given: E2E環境での高負荷パフォーマンス設定
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: (log) => `${log.timestamp.toISOString().replace(/\.\d{3}Z$/, 'Z')} [INFO] ${log.message}`,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: E2E環境での高負荷処理
        const iterations = 100;
        for (let i = 0; i < iterations; i++) {
          logger.info(`E2E stress test message ${i}`, { iteration: i, stress: true });
        }

        // Then: E2E環境でのメッセージ整合性確保
        const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
        expect(messages).toHaveLength(iterations);
        expect(String(messages[0])).toMatch(/\[INFO\] E2E stress test message 0/);
        expect(String(messages[messages.length - 1])).toMatch(/\[INFO\] E2E stress test message 99/);
      });
    });

    /**
     * @description E2E環境での大量データセット処理テスト
     * E2E環境での大量データ処理における性能制限と処理能力を検証
     */
    describe('When large dataset processing is executed in E2E environment', () => {
      // E2E環境での大量データセット処理性能
      it('Then should process large datasets within acceptable E2E performance limits', (ctx) => {
        const { mockLogger } = setupE2ETest(ctx);

        // Given: E2E環境での大量データ処理設定
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: (log) =>
            JSON.stringify({
              timestamp: log.timestamp.toISOString(),
              level: 'INFO',
              message: log.message,
              args: log.args,
            }),
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: E2E環境での大量データセット処理
        const iterations = 120;
        const largePayload = {
          data: Array.from({ length: 50 }, (_, i) => ({ id: i, value: `e2e_val_${i}` })),
          meta: { seed: 42, e2eTest: true },
        };

        const start = Date.now();
        for (let i = 0; i < iterations; i++) {
          logger.info(`E2E batch ${i}`, largePayload);
        }
        const elapsed = Date.now() - start;

        // Then: E2E環境での大量データ処理性能確保
        const messages = mockLogger.getMessages(AG_LOGLEVEL.DEFAULT);
        expect(messages).toHaveLength(iterations);
        expect(elapsed).toBeLessThan(1500); // E2E環境での許容処理時間
      });
    });
  });
});
