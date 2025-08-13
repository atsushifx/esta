// tests/integration/AgLogger.basic.integration.spec.ts
// @(#) : AgLogger Basic Integration Tests - Fundamental integration scenarios
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// 共有型・定数: ログレベルと共通ユーティリティ
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import { ENABLE } from '../../../shared/constants';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgFormatFunction } from '../../../shared/types';

// テスト対象: AgLoggerとマネージャ
import { AgLogger } from '@/AgLogger.class';
import { AgLoggerManager } from '@/AgLoggerManager.class';

// プラグイン（フォーマッター/ロガー）: モックとJSON
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';

// Test Utilities

/**
 * テストモック（MockLogger.buffer + 軽量フォーマッタ）を作成
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
 * AgLogger Basic Integration Tests
 *
 * @description 基本的な統合動作とシングルトン管理、プラグイン統合の基本テスト
 */
describe('AgLogger Basic Integration Tests', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
  };

  /**
   * シングルトン統合管理機能
   */
  describe('Singleton Integration Management', () => {
    /**
     * 正常系: 基本的なシングルトン統合
     */
    describe('正常系: Basic Singleton Integration', () => {
      // 目的: 全てのエントリポイントでシングルトン一貫性を確認
      it('should maintain singleton consistency across all entry points', (ctx) => {
        createMock(ctx);
        setupTestContext();

        AgLogger.createLogger();
        const logger1 = AgLogger.createLogger();
        const logger2 = AgLogger.getLogger();
        const logger3 = AgLogger.createLogger();

        expect(logger1).toBe(logger2);
        expect(logger2).toBe(logger3);
      });

      // 目的: インスタンス間で設定/状態が共有される
      it('should share state and configuration across instances', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        AgLogger.createLogger();
        const logger1 = AgLogger.createLogger();
        const logger2 = AgLogger.createLogger();

        // ログレベル設定の共有
        logger1.logLevel = AG_LOGLEVEL.DEBUG;
        expect(logger2.logLevel).toBe(AG_LOGLEVEL.DEBUG);

        // verbose設定の共有
        logger1.setVerbose = ENABLE;
        expect(logger2.isVerbose).toBe(ENABLE);

        // ロガーマネージャー設定の共有
        logger1.setLoggerConfig({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: JsonFormatter,
        });

        logger2.logLevel = AG_LOGLEVEL.INFO;
        logger2.info('test message');

        expect(mockLogger.getTotalMessageCount()).toBe(1);
        const message = mockLogger.getLastMessage(AG_LOGLEVEL.DEFAULT) as string;
        expect(() => JSON.parse(message)).not.toThrow();
        const parsed = JSON.parse(message);
        expect(parsed.message).toBe('test message');
      });
    });

    /**
     * 異常系: シングルトン統合エラー処理
     */
    describe('異常系: Singleton Integration Error Handling', () => {
      // 目的: エラー発生時もシングルトン整合性を維持
      it('should maintain singleton integrity during errors', (ctx) => {
        createMock(ctx);
        setupTestContext();

        const logger1 = AgLogger.createLogger();

        // エラーを引き起こす設定
        const throwingFormatter = vi.fn(() => {
          throw new Error('Formatter error');
        });

        // Formatterを呼び出していないのでエラーを投げない
        expect(() => logger1.setLoggerConfig({ formatter: throwingFormatter })).not.toThrow();

        const logger2 = AgLogger.createLogger();
        // 同じインスタンスであることを確認
        expect(logger1).toBe(logger2);
      });
    });

    /**
     * エッジケース: 複雑なシングルトン統合パターン
     */
    describe('エッジケース: Complex Singleton Integration Patterns', () => {
      // 目的: 急速なシングルトンアクセス時の一貫性
      it('should handle rapid singleton access patterns', (ctx) => {
        createMock(ctx);
        setupTestContext();

        const loggers = Array.from({ length: 100 }, () => AgLogger.createLogger());

        // 全て同じインスタンスであることを確認
        loggers.forEach((logger) => {
          expect(logger).toBe(loggers[0]);
        });
      });
    });
  });

  // プラグイン統合機能は PluginInteraction.integration.spec.ts に移動済み
});
