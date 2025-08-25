// tests/integration/mock-output/plugins/combinations/mock-plugin-combinations.integration.spec.ts
// @(#) : Mock Plugin Combinations Integration Tests - Mock logger and formatter combinations
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
import type { AgLogMessage } from '@/shared/types';

// テスト対象: AgLoggerとエントリーポイント
import { AgLogger } from '@/AgLogger.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

// プラグイン（ロガー）: モック実装
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import type { AgMockConstructor } from '../../../../../shared/types/AgMockConstructor.class';

/**
 * Mock Plugin Combinations Integration Tests
 *
 * @description Mock出力でのフォーマッターとロガーの組み合わせ統合動作を保証するテスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('Mock Output Plugin Combination Integration', () => {
  const setupTestContext = (_ctx?: TestContext): {
    mockLogger: AgMockBufferLogger;
    mockFormatter: AgMockConstructor;
  } => {
    const _mockLogger = new MockLogger.buffer();
    const _mockFormatter = MockFormatter.passthrough;

    vi.clearAllMocks();
    AgLogger.resetSingleton();

    _ctx?.onTestFinished(() => {
      AgLogger.resetSingleton();
      vi.clearAllMocks();
    });

    return {
      mockLogger: _mockLogger,
      mockFormatter: _mockFormatter,
    };
  };

  /**
   * Given: 高負荷処理環境でプラグイン組み合わせが使用される場合
   * When: 大量のログメッセージを処理した時
   * Then: 組み合わせでも安定したパフォーマンスを維持する
   */
  describe('Given high-load plugin combinations', () => {
    describe('When combining multiple plugins under load', () => {
      // 目的: 高頻度ログ出力時の組み合わせ処理性能
      it('Then should maintain stability and performance across all plugins', () => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 高負荷対応の組み合わせ設定

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 高頻度ログ処理の実行
        const iterations = 1000;
        const startTime = Date.now();

        for (let i = 0; i < iterations; i++) {
          logger.debug(`Log message ${i}`, { iteration: i });
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Then: 組み合わせでも合理的な処理時間（1000回で1秒以内）
        expect(totalTime).toBeLessThan(1000);
        expect(mockLogger.getMessageCount()).toBe(iterations);
      });
    });

    describe('When applying filters with active plugin combinations', () => {
      // 目的: フィルタリングによる出力抑制時の組み合わせ低オーバーヘッド
      it('Then should coordinate filtering behavior across all components', () => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 厳格フィルタリング + 組み合わせ設定

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.ERROR;

        // When: フィルタリングされるレベルで大量処理
        const iterations = 1000;
        const startTime = Date.now();

        for (let i = 0; i < iterations; i++) {
          logger.debug(`Debug message ${i}`, { large: 'data'.repeat(100) });
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Then: 組み合わせでもフィルタリングによる高速処理（100ms以内）
        expect(totalTime).toBeLessThan(100);
        expect(mockLogger.getMessageCount()).toBe(0);
      });
    });
  });

  /**
   * Given: 複雑データ処理でプラグイン組み合わせが使用される場合
   * When: 複雑データ構造を各組み合わせで処理した時
   * Then: データ整合性を保って適切に処理される
   */
  describe('Given complex data plugin combinations', () => {
    describe('When processing complex data through plugin combinations', () => {
      // 目的: 複雑オブジェクトを各プラグイン組合せで安定処理
      it('Then should handle data complexity across all plugin layers', () => {
        const { mockLogger } = setupTestContext();

        // Given: 複雑データ構造
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

        // When: JsonFormatter + MockLogger 組み合わせでテスト

        const jsonLogger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: MockFormatter.json,
        });
        jsonLogger.logLevel = AG_LOGLEVEL.INFO;
        jsonLogger.info('Complex data', complexData);

        // Then: JSON組み合わせで適切に処理
        expect(mockLogger.getMessageCount()).toBe(1); // MockLoggerの呼び出し回数が1回になる
        const jsonOutput = mockLogger.getMessages()[0] as string;

        expect(() => JSON.parse(jsonOutput)).not.toThrow();
        const parsedJson = JSON.parse(jsonOutput);
        expect(parsedJson.args[0]).toEqual(complexData);

        // When: PlainFormatter + MockLogger 組み合わせでテスト
        mockLogger.reset();
        const plainLogger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: PlainFormatter,
        });
        plainLogger.logLevel = AG_LOGLEVEL.INFO;
        plainLogger.info('Complex data', complexData);

        // Then: Plain組み合わせで適切に処理
        expect(mockLogger.getMessageCount()).toBe(1);
        const plainOutput = mockLogger.getMessages()[0] as string;

        expect(plainOutput).toContain('Complex data');
        expect(plainOutput).toContain('{"nested"'); // JSON.stringify representation
      });
    });

    describe('When processing large data sets across combinations', () => {
      // 目的: 大規模データ引数での組み合わせ性能検証
      it('Then should handle large data sets efficiently across combinations', () => {
        const { mockLogger } = setupTestContext();

        // Given: 大規模データセット
        const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i, data: `item${i}` }));

        // When: 組み合わせでの大規模データ処理
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: MockFormatter.json,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        const startTime = Date.now();
        logger.info('Large data set', largeArray);
        const endTime = Date.now();

        // Then: 組み合わせでも合理的な処理時間（100ms以内）
        expect(endTime - startTime).toBeLessThan(100);
        expect(mockLogger.getMessageCount()).toBe(1);

        const output = mockLogger.getMessages()[0] as string;
        expect(() => JSON.parse(output)).not.toThrow();
      });
    });
  });

  /**
   * Given: エラー復旧が必要な環境でプラグイン組み合わせが使用される場合
   * When: 組み合わせ内でエラーが発生した時
   * Then: 適切なエラー処理と復旧が行われる
   */
  describe('Given error recovery plugin combinations', () => {
    describe('When plugins encounter errors in combination', () => {
      // 目的: ロガー側エラー時でもフォーマッター呼出は実施
      it('Then should provide coordinated error recovery behavior', () => {
        setupTestContext();

        // Given: エラーロガー + 正常フォーマッター組み合わせ
        const logger = AgLogger.createLogger({
          defaultLogger: MockLogger.throwError('Logger error'),
          formatter: MockFormatter.returnValue('formatted message'),
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: 組み合わせエラーでのログ出力
        expect(() => {
          logger.info('test message');
        }).toThrow('Logger error');

        // Then: フォーマッターは組み合わせ内で正常実行される
        const stats = logger.getStatsFormatter()?.getStats();
        expect(stats?.callCount).toBe(1);
        expect(stats?.lastMessage?.message).toBe('test message'); // format前のメッセージが返る
      });
    });

    describe('When plugins recover from errors', () => {
      // 目的: プラグインエラー発生後もシステム安定性を維持
      it('Then should maintain system stability after combination errors', () => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 初期エラー組み合わせ
        const logger = AgLogger.createLogger({
          defaultLogger: MockLogger.throwError('Temporary error'),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: 初期組み合わせでエラー発生
        expect(() => {
          logger.info('first message');
        }).toThrow('Temporary error');

        // When: 正常な組み合わせに置換
        logger.setLoggerConfig({
          defaultLogger: mockLogger.getLoggerFunction(),
        });

        // Then: 組み合わせ回復後は正常動作
        expect(() => {
          logger.info('second message');
        }).not.toThrow();

        const lastMessage = mockLogger.getLastMessage() as AgLogMessage;
        expect(mockLogger.getMessageCount()).toBe(1);
        expect(lastMessage.message).toBe('second message');
      });
    });
  });
});
