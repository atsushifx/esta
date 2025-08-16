// tests/integration/agLogger/performance/highLoad.integration.spec.ts
// @(#) : AgLogger Performance High Load Integration Tests - High-load and performance scenarios
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it } from 'vitest';
import type { TestContext } from 'vitest';

// 共有型・定数: ログレベルとverbose制御
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import { AG_LOGLEVEL } from '@/shared/types';
import type { AgMockConstructor } from '@/shared/types/AgMockConstructor.class';
import { ENABLE } from '../../../../shared/constants';

// テスト対象: AgLogger本体
import { AgLogger } from '@/AgLogger.class';

// プラグイン（フォーマッター/ロガー）: モック実装
import { MockFormatter } from '@/plugins/formatter/MockFormatter';

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

    describe('When verbose mode affects filtering performance', () => {
      // 目的: Verboseモード有効時でもフィルタリング性能を維持
      it('Then should maintain filtering performance even with verbose mode', (_ctx) => {
        const { mockLogger } = setupTest(_ctx);

        // Given: Verboseモード + 厳格フィルタリング

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: MockFormatter.json,
        });
        logger.logLevel = AG_LOGLEVEL.WARN;
        logger.setVerbose = ENABLE;

        // When: フィルタリング + Verbose設定で大量処理
        const iterations = 500;
        const startTime = Date.now();

        for (let i = 0; i < iterations; i++) {
          logger.info(`Info message ${i}`); // WARNでフィルタリング
          logger.debug(`Debug message ${i}`); // WARNでフィルタリング
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Then: Verboseモードでも高速フィルタリング（200ms以内）
        expect(totalTime).toBeLessThan(200);
        expect(mockLogger.getTotalMessageCount()).toBe(0); // 全てフィルタリング
        expect(logger.isVerbose).toBe(ENABLE);
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
   * Given: メモリ使用量制約がある環境が存在する場合
   * When: 長時間の連続ログ出力を行った時
   * Then: メモリリークなく安定して動作する
   */
  describe('Given memory-constrained environments exist', () => {
    describe('When performing extended continuous logging', () => {
      // 目的: 長時間動作時のメモリ使用量安定性
      it('Then should maintain stable memory usage during extended operation', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTest(_ctx);

        // Given: 長時間動作対応の設定
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 長時間の連続ログ出力（メモリリークチェック）
        const batchSize = 1000;
        const batches = 5;

        for (let batch = 0; batch < batches; batch++) {
          for (let i = 0; i < batchSize; i++) {
            logger.debug(`Batch ${batch} - Message ${i}`, {
              batch,
              message: i,
              data: { temp: new Array(10).fill(Math.random()) }, // 一時的なデータ
            });
          }
          // バッチ間での一時停止（GC機会を提供）
          mockLogger.clearAllMessages(); // メッセージバッファをクリア
        }

        // Then: 最終バッチの処理が正常完了（メモリリークによる性能劣化なし）
        const finalBatchStartTime = Date.now();
        for (let i = 0; i < 100; i++) {
          logger.debug(`Final test ${i}`);
        }
        const finalBatchTime = Date.now() - finalBatchStartTime;

        // 最終バッチの処理時間が合理的（100ms以内）
        expect(finalBatchTime).toBeLessThan(100);
        expect(mockLogger.getTotalMessageCount()).toBe(100);
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
});
