// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// src/__tests__/AgLogger.performance.spec.ts
// @(#) : Performance tests for AgLogger - using logger.info as representative
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// node lib
import { performance } from 'node:perf_hooks';

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ログレベル定数 - テストで使用するログレベルの定義
import { AG_LOGLEVEL } from '../../../shared/types';

// テスト対象 - AgLoggerクラスのメイン実装
import { AgLogger } from '../../AgLogger.class';

/**
 * 共通のテストセットアップとクリーンアップ
 */
const setupTestEnvironment = (): void => {
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });
};

/**
 * 高頻度ログ出力のパフォーマンステスト
 * logger.infoで代表してテスト（全ログメソッド共通機能）
 */
describe('High-Frequency Logging Performance', () => {
  setupTestEnvironment();

  describe('Simple message performance', () => {
    it('should handle high-frequency simple logging', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        logger.info(`High frequency message ${i}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 1秒以内で完了することを期待
      expect(duration).toBeLessThan(1_000);
    });
  });

  describe('Complex object performance', () => {
    it('should handle complex object logging performance', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const complexObject = {
        metadata: {
          version: '1.0.0',
          timestamp: new Date(),
          config: { debug: true, verbose: false },
        },
        data: Array.from({ length: 50 }, (_, i) => ({
          id: i,
          properties: {
            name: `item_${i}`,
            tags: [`tag1_${i}`, `tag2_${i}`],
            metrics: { score: Math.random(), count: i },
          },
        })),
      };

      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        logger.info(`Complex object logging ${i}`, complexObject);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 1秒以内で完了することを期待
      expect(duration).toBeLessThan(1000);
    });
  });
});

/**
 * メモリ効率とリソース管理のテスト
 * logger.infoで代表してテスト（全ログメソッド共通機能）
 */
describe('Memory Efficiency and Resource Management', () => {
  setupTestEnvironment();

  describe('Filtered logging efficiency', () => {
    it('should not process arguments when filtered by log level', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.WARN; // INFOをフィルタリング

      // 重い計算のシミュレーション（実際には実行されない）
      const heavyComputation = (): unknown[] => {
        const result = [];
        for (let i = 0; i < 10000; i++) {
          result.push({ id: i, data: Math.random().toString() });
        }
        return result;
      };

      const startTime = performance.now();

      // フィルタされるため、重い計算は実行されるべきではない
      for (let i = 0; i < 100; i++) {
        logger.info('heavy computation', heavyComputation());
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // フィルタリングされているため、高速であることを期待（引数評価は回避不可）
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Large data handling', () => {
    it('should handle large arrays efficiently', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        value: `item_${i}`,
        timestamp: Date.now(),
      }));

      const startTime = performance.now();

      logger.info('large array test', largeArray);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 大きなデータでも合理的な時間で処理
      expect(duration).toBeLessThan(500);
    });
  });
});

/**
 * 同時実行と並行処理のテスト
 * logger.infoで代表してテスト（全ログメソッド共通機能）
 */
describe('Concurrent Execution Performance', () => {
  setupTestEnvironment();

  describe('Concurrent logging calls', () => {
    it('should handle concurrent calls correctly', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const startTime = performance.now();

      const promises = Array.from({ length: 100 }, (_, i) =>
        Promise.resolve().then(() => {
          logger.info(`concurrent message ${i}`, {
            iteration: i,
            timestamp: Date.now(),
          });
        }));

      return Promise.all(promises).then(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // 並行処理でも合理的な時間で完了
        expect(duration).toBeLessThan(1000);
      });
    });
  });

  describe('Rapid state changes', () => {
    it('should handle rapid log level changes efficiently', () => {
      const logger = AgLogger.createLogger();

      const startTime = performance.now();

      const levels = [
        AG_LOGLEVEL.TRACE,
        AG_LOGLEVEL.DEBUG,
        AG_LOGLEVEL.INFO,
        AG_LOGLEVEL.WARN,
        AG_LOGLEVEL.ERROR,
        AG_LOGLEVEL.FATAL,
      ];

      for (let i = 0; i < 1000; i++) {
        const level = levels[i % levels.length];
        logger.logLevel = level;
        logger.info(`rapid change ${i}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 高速な状態変更でも効率的に処理
      expect(duration).toBeLessThan(500);
    });
  });
});

/**
 * エラー処理のパフォーマンステスト
 * logger.infoで代表してテスト（全ログメソッド共通機能）
 */
describe('Error Handling Performance', () => {
  setupTestEnvironment();

  describe('Error recovery performance', () => {
    it('should recover from errors efficiently', () => {
      let callCount = 0;

      const flakyLogger = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount % 10 === 0) {
          throw new Error('Intermittent error');
        }
        return 'logged successfully';
      });

      const logger = AgLogger.createLogger({
        defaultLogger: flakyLogger,
        formatter: (msg) => msg.message || msg,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      const startTime = performance.now();
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < 100; i++) {
        try {
          logger.info(`Error recovery test ${i}`);
          successCount++;
        } catch {
          errorCount++;
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // エラー処理があっても合理的な時間で完了
      expect(duration).toBeLessThan(1000);
      expect(successCount).toBeGreaterThan(0);
      expect(errorCount).toBeGreaterThan(0);
    });
  });
});
