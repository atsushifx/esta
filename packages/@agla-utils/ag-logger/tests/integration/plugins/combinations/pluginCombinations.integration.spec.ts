// tests/integration/plugins/combinations/pluginCombinations.integration.spec.ts
// @(#) : Plugin Combinations Integration Tests - Formatter and logger combinations
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';

// 共有定数: ログレベル定義
import { AG_LOGLEVEL } from '../../../../shared/types';

// テスト対象: AgLoggerとエントリーポイント
import { AgLogger } from '@/AgLogger.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

// プラグイン（ロガー）: 出力先実装とマップ
import { ConsoleLogger, ConsoleLoggerMap } from '@/plugins/logger/ConsoleLogger';

/**
 * Plugin Combinations Integration Tests
 *
 * @description フォーマッターとロガーの組み合わせ統合動作を保証するテスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('Plugin Combinations Integration', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  };

  /**
   * Given: 高負荷処理環境でプラグイン組み合わせが使用される場合
   * When: 大量のログメッセージを処理した時
   * Then: 組み合わせでも安定したパフォーマンスを維持する
   */
  describe('Given high-load environments use plugin combinations', () => {
    describe('When processing large volumes of log messages', () => {
      // 目的: 高頻度ログ出力時の組み合わせ処理性能
      it('Then should maintain performance with plugin combinations under high frequency', () => {
        setupTestContext();

        // Given: 高負荷対応の組み合わせ設定
        const mockLogger = vi.fn();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: JsonFormatter,
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
        expect(mockLogger).toHaveBeenCalledTimes(iterations);
      });
    });

    describe('When filtering suppresses many messages in combinations', () => {
      // 目的: フィルタリングによる出力抑制時の組み合わせ低オーバーヘッド
      it('Then should minimize overhead when combinations filter out messages', () => {
        setupTestContext();

        // Given: 厳格フィルタリング + 組み合わせ設定
        const mockLogger = vi.fn();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: JsonFormatter,
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
        expect(mockLogger).not.toHaveBeenCalled();
      });
    });
  });

  /**
   * Given: 複雑データ処理でプラグイン組み合わせが使用される場合
   * When: 複雑データ構造を各組み合わせで処理した時
   * Then: データ整合性を保って適切に処理される
   */
  describe('Given complex data processing uses plugin combinations', () => {
    describe('When processing complex data structures across combinations', () => {
      // 目的: 複雑オブジェクトを各プラグイン組合せで安定処理
      it('Then should handle complex objects correctly across all combinations', () => {
        setupTestContext();

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
        const jsonMockLogger = vi.fn();
        const jsonLogger = AgLogger.createLogger({
          defaultLogger: jsonMockLogger,
          formatter: JsonFormatter,
        });
        jsonLogger.logLevel = AG_LOGLEVEL.INFO;
        jsonLogger.info('Complex data', complexData);

        // Then: JSON組み合わせで適切に処理
        expect(jsonMockLogger).toHaveBeenCalledTimes(1);
        const [jsonOutput] = jsonMockLogger.mock.calls[0];

        expect(() => JSON.parse(jsonOutput)).not.toThrow();
        const parsedJson = JSON.parse(jsonOutput);
        expect(parsedJson.args[0]).toEqual(complexData);

        // When: PlainFormatter + MockLogger 組み合わせでテスト
        const plainMockLogger = vi.fn();
        const plainLogger = AgLogger.createLogger({
          defaultLogger: plainMockLogger,
          formatter: PlainFormatter,
        });
        plainLogger.logLevel = AG_LOGLEVEL.INFO;
        plainLogger.info('Complex data', complexData);

        // Then: Plain組み合わせで適切に処理
        expect(plainMockLogger).toHaveBeenCalledTimes(1);
        const [plainOutput] = plainMockLogger.mock.calls[0];

        expect(plainOutput).toContain('Complex data');
        expect(plainOutput).toContain('{"nested"'); // JSON.stringify representation
      });
    });

    describe('When handling large data sets efficiently in combinations', () => {
      // 目的: 大規模データ引数での組み合わせ性能検証
      it('Then should handle large data sets efficiently across combinations', () => {
        setupTestContext();

        // Given: 大規模データセット
        const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i, data: `item${i}` }));

        // When: 組み合わせでの大規模データ処理
        const mockLogger = vi.fn();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger,
          formatter: JsonFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        const startTime = Date.now();
        logger.info('Large data set', largeArray);
        const endTime = Date.now();

        // Then: 組み合わせでも合理的な処理時間（100ms以内）
        expect(endTime - startTime).toBeLessThan(100);
        expect(mockLogger).toHaveBeenCalledTimes(1);

        const [output] = mockLogger.mock.calls[0];
        expect(() => JSON.parse(output)).not.toThrow();
      });
    });
  });

  /**
   * Given: エラー復旧が必要な環境でプラグイン組み合わせが使用される場合
   * When: 組み合わせ内でエラーが発生した時
   * Then: 適切なエラー処理と復旧が行われる
   */
  describe('Given error recovery is needed with plugin combinations', () => {
    describe('When errors occur within plugin combinations', () => {
      // 目的: ロガー側エラー時でもフォーマッター呼出は実施
      it('Then should handle logger errors gracefully without affecting formatter', () => {
        setupTestContext();

        // Given: エラーロガー + 正常フォーマッター組み合わせ
        const throwingLogger = vi.fn().mockImplementation(() => {
          throw new Error('Logger error');
        });
        const formatterSpy = vi.fn().mockReturnValue('formatted message');

        const logger = AgLogger.createLogger({
          defaultLogger: throwingLogger,
          formatter: formatterSpy,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: 組み合わせエラーでのログ出力
        expect(() => {
          logger.info('test message');
        }).toThrow('Logger error');

        // Then: フォーマッターは組み合わせ内で正常実行される
        expect(formatterSpy).toHaveBeenCalled();
      });
    });

    describe('When combinations recover from errors', () => {
      // 目的: プラグインエラー発生後もシステム安定性を維持
      it('Then should maintain system stability after combination errors', () => {
        setupTestContext();

        // Given: 初期エラー組み合わせ
        const throwingLogger = vi.fn().mockImplementation(() => {
          throw new Error('Temporary error');
        });

        const logger = AgLogger.createLogger({
          defaultLogger: throwingLogger,
          formatter: PlainFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: 初期組み合わせでエラー発生
        expect(() => {
          logger.info('first message');
        }).toThrow('Temporary error');

        // When: 正常な組み合わせに置換
        const workingLogger = vi.fn();
        logger.setLoggerConfig({ defaultLogger: workingLogger });

        // Then: 組み合わせ回復後は正常動作
        expect(() => {
          logger.info('second message');
        }).not.toThrow();

        expect(workingLogger).toHaveBeenCalled();
      });
    });
  });

  /**
   * Given: 実際のシステム統合環境でプラグイン組み合わせが使用される場合
   * When: ConsoleLoggerMapとフォーマッターの実際の組み合わせを使用した時
   * Then: 実環境での統合動作が適切に実行される
   */
  describe('Given real system integration uses plugin combinations', () => {
    describe('When using actual ConsoleLoggerMap with formatter combinations', () => {
      // 目的: ConsoleLoggerMap×各フォーマッターの実システム統合
      it('Then should integrate correctly in real system scenarios', () => {
        setupTestContext();

        // Given: 実システム相当の組み合わせ設定
        const consoleSpies = {
          error: vi.spyOn(console, 'error').mockImplementation(() => {}),
          warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
          info: vi.spyOn(console, 'info').mockImplementation(() => {}),
          debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
        };

        const logger = AgLogger.createLogger({
          defaultLogger: ConsoleLogger,
          formatter: JsonFormatter,
          loggerMap: ConsoleLoggerMap,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 実システム相当の組み合わせ使用
        logger.error('System error occurred', { code: 500, stack: 'error stack' });
        logger.warn('System warning', { resource: 'memory', usage: '90%' });
        logger.info('System info', { status: 'running', uptime: 12345 });
        logger.debug('System debug', { query: 'SELECT * FROM table', time: 45 });

        // Then: 実システム統合での適切な出力先振り分け
        expect(consoleSpies.error).toHaveBeenCalledTimes(1);
        expect(consoleSpies.warn).toHaveBeenCalledTimes(1);
        expect(consoleSpies.info).toHaveBeenCalledTimes(1);
        expect(consoleSpies.debug).toHaveBeenCalledTimes(1);

        // Then: 実システム統合での適切なフォーマット
        consoleSpies.error.mock.calls.forEach(([output]) => {
          expect(() => JSON.parse(output)).not.toThrow();
          const parsed = JSON.parse(output);
          expect(parsed.level).toBe('ERROR');
        });

        Object.values(consoleSpies).forEach((spy) => spy.mockRestore());
      });
    });
  });
});
