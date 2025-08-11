// tests/integration/AgLogger.filtering.integration.spec.ts
// @(#) : AgLogger Filtering Integration Tests - Log level filtering and verbose functionality
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// 共有型・定数: ログレベルとverbose制御
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import { DISABLE, ENABLE } from '@/shared/constants/common.constants';
import { AG_LOGLEVEL } from '@/shared/types';
import type { AgFormatFunction } from '@/shared/types';

// テスト対象: AgLoggerとマネージャ
import { AgLogger } from '@/AgLogger.class';
import { AgLoggerManager } from '@/AgLoggerManager.class';

// プラグイン（フォーマッター/ロガー）: JSON/Plain/モック
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';

// Test Utilities

/**
 * テストモックを作成
 */
const createMock = (ctx: TestContext): { mockLogger: AgMockBufferLogger; mockFormatter: AgFormatFunction } => {
  const mockLogger = new MockLogger.buffer();
  const mockFormatter = MockFormatter.passthrough;

  ctx.onTestFinished(() => {
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
    mockLogger.clearAllMessages();
    vi.clearAllMocks();
  });

  return {
    mockLogger,
    mockFormatter,
  };
};

/**
 * AgLogger Filtering Integration Tests
 *
 * @description ログレベルフィルタリングとverbose機能の統合動作テスト
 */
describe('AgLogger Filtering Integration Tests', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
  };

  /**
   * ログレベルフィルタリング統合機能
   */
  describe('Log Level Filtering Integration', () => {
    /**
     * 正常系: 基本的なフィルタリング統合
     */
    describe('正常系: Basic Filtering Integration', () => {
      // 目的: すべての構成要素で一貫したフィルタリングが行われる
      it('should apply filtering consistently across all components', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.info,
          formatter: JsonFormatter,
          loggerMap: mockLogger.defaultLoggerMap,
        });
        logger.logLevel = AG_LOGLEVEL.WARN;

        // フィルタリングテスト
        logger.error('error'); // 出力される
        logger.warn('warn'); // 出力される
        logger.info('info'); // フィルタリングされる
        logger.debug('debug'); // フィルタリングされる

        expect(mockLogger.getMessageCount(AG_LOGLEVEL.ERROR)).toBe(1);
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.WARN)).toBe(1);
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(0); // フィルタリングされるため出力されない
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.DEBUG)).toBe(0); // フィルタリングされるため出力されない
      });

      // 目的: OFFレベル時に全レベルで出力が抑止される
      it('should handle OFF level across all components', (ctx) => {
        const { mockLogger } = createMock(ctx);
        const mockFormatter = vi.fn().mockImplementation((msg) => msg.message ?? msg);
        setupTestContext();

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.OFF;

        // 全レベルでフィルタリング
        Object.values(AG_LOGLEVEL).forEach((level) => {
          if (typeof level === 'number') {
            logger.logLevel = level;
            logger.logLevel = AG_LOGLEVEL.OFF;
            logger.info('test');
          }
        });

        expect(mockLogger.getTotalMessageCount()).toBe(0);
        expect(mockFormatter).not.toHaveBeenCalled();
      });
    });

    /**
     * 異常系: フィルタリングエラー処理
     */
    describe('異常系: Filtering Error Handling', () => {
      // 目的: フォーマッター例外時でもフィルタリングは機能する
      it('should maintain filtering integrity during formatter errors', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        const throwingFormatter = vi.fn(() => {
          throw new Error('Formatter error');
        });

        const logger = AgLogger.createLogger({ defaultLogger: mockLogger.info, formatter: throwingFormatter });
        logger.logLevel = AG_LOGLEVEL.WARN;

        // エラーが発生してもフィルタリングは機能する
        expect(() => logger.error('should process')).toThrow('Formatter error');
        expect(() => logger.debug('should be filtered')).not.toThrow(); // フィルタリングされるのでformatterは呼ばれない

        expect(throwingFormatter).toHaveBeenCalledTimes(1); // errorのみ
      });
    });

    /**
     * エッジケース: 動的フィルタリングパターン
     */
    describe('エッジケース: Dynamic Filtering Patterns', () => {
      // 目的: ログ中の動的なレベル変更に追従する
      it('should handle dynamic level changes during logging', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.info,
          formatter: PlainFormatter,
          loggerMap: mockLogger.defaultLoggerMap,
        });

        const levels = [AG_LOGLEVEL.ERROR, AG_LOGLEVEL.WARN, AG_LOGLEVEL.INFO, AG_LOGLEVEL.DEBUG];

        levels.forEach((level, index) => {
          logger.logLevel = level;

          // 各レベルで複数ログを出力
          logger.error(`error ${index}`);
          logger.warn(`warn ${index}`);
          logger.info(`info ${index}`);
          logger.debug(`debug ${index}`);
        });

        // 期待される呼び出し回数: ERROR(4) + WARN(3) + INFO(2) + DEBUG(1) = 10
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.ERROR)).toBe(4);
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.WARN)).toBe(3);
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(2);
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.DEBUG)).toBe(1);
        expect(mockLogger.getTotalMessageCount()).toBe(10);
      });
    });
  });

  /**
   * Verbose機能統合
   */
  describe('Verbose Functionality Integration', () => {
    /**
     * 正常系: 基本的なverbose統合
     */
    describe('正常系: Basic Verbose Integration', () => {
      // 目的: verboseモードがパイプライン全体と整合して動作
      it('should integrate verbose mode with full logging pipeline', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: MockFormatter.messageOnly,
          loggerMap: mockLogger.defaultLoggerMap,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // default: verbose off

        logger.verbose('verbose off');
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(0);

        // verbose有効時
        logger.setVerbose = ENABLE;
        logger.verbose('verbose on');

        expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(1);
        expect(mockLogger.getLastMessage(AG_LOGLEVEL.VERBOSE)).toBe('verbose on');
      });

      // 目的: インスタンス間・設定変更後もverbose状態を保持
      it('should maintain verbose state across instances and reconfigurations', (ctx) => {
        createMock(ctx);
        setupTestContext();

        const logger1 = AgLogger.createLogger();
        logger1.setVerbose = ENABLE; // verbose on

        const logger2 = AgLogger.createLogger();
        expect(logger2.isVerbose).toBe(ENABLE); // verbose on (継true);

        // 設定変更後もverbose状態を維持
        logger2.setLoggerConfig({ defaultLogger: vi.fn() });
        expect(logger1.isVerbose).toBe(ENABLE);
      });
    });

    /**
     * 異常系: verbose統合エラー処理
     */
    describe('異常系: Verbose Integration Error Handling', () => {
      // 目的: verbose出力時にフォーマッターが失敗するケースの処理
      it('should handle verbose with failing formatter', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        const throwingFormatter = vi.fn(() => {
          throw new Error('Verbose formatter error');
        });

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: throwingFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.setVerbose = true;

        expect(() => logger.verbose('test')).toThrow('Verbose formatter error');
      });
    });

    /**
     * エッジケース: verbose特殊統合パターン
     */
    describe('エッジケース: Verbose Special Integration Patterns', () => {
      // 目的: verboseの高速切替に対する安定性
      it('should handle rapid verbose state changes', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: PlainFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        for (let i = 0; i < 100; i++) {
          logger.setVerbose = (i % 2 === 0) ? ENABLE : DISABLE;
          logger.verbose(`verbose ${i}`);
        }

        expect(mockLogger.getTotalMessageCount()).toBe(50); // verbose がtrueの時のみ(50);
      });
    });
  });
});
