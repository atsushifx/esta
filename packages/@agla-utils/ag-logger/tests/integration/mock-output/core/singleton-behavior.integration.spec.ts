// tests/integration/agLogger/core/singleton.integration.spec.ts
// @(#) : AgLogger Core Singleton Integration Tests - Singleton behavior verification
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// 共有型・定数: ログレベルと共通ユーティリティ
import { AG_LOGLEVEL } from '@/shared/types';
import type { AgLogMessage } from '@/shared/types';
import { ENABLE } from '../../../../shared/constants';

// テスト対象: AgLoggerとマネージャ
import { AgLogger } from '@/AgLogger.class';
import { AgLoggerManager } from '@/AgLoggerManager.class';

// プラグイン（フォーマッター/ロガー）: モックとJSON
import MockFormatter from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import type { AgMockConstructor } from '@/shared/types/AgMockConstructor.class';

// Test Utilities

/**
 * テストセットアップ
 */
const setupTestContext = (_ctx?: TestContext): { mockLogger: AgMockBufferLogger; mockFormatter: AgMockConstructor } => {
  const _mockLogger = new MockLogger.buffer();
  const _mockFormatter = MockFormatter.passthrough;

  vi.clearAllMocks();
  AgLogger.resetSingleton();
  AgLoggerManager.resetSingleton();

  _ctx?.onTestFinished(() => {
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
    vi.clearAllMocks();
  });

  return {
    mockLogger: _mockLogger,
    mockFormatter: _mockFormatter,
  };
};

/**
 * AgLogger Core Singleton Integration Tests
 *
 * @description シングルトンパターンの正確な動作を保証する統合テスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('AgLogger Core Singleton Integration', () => {
  /**
   * Given: 複数のAgLoggerアクセスパターンが存在する場合
   * When: 異なるエントリポイントからアクセスした時
   * Then: 同一インスタンスが返される
   */
  describe('Given multiple AgLogger access patterns', () => {
    describe('When accessing through different entry points', () => {
      // 目的: 全てのエントリポイントでシングルトン一貫性を確認
      it('Then should return the same instance consistently', (_ctx) => {
        setupTestContext(_ctx);

        // When: 様々なエントリポイントからアクセス
        AgLogger.createLogger();
        const logger1 = AgLogger.createLogger();
        const logger2 = AgLogger.getLogger();
        const logger3 = AgLogger.createLogger();

        // Then: 全て同一インスタンス
        expect(logger1).toBe(logger2);
        expect(logger2).toBe(logger3);
      });
    });

    describe('When configuring shared state and properties', () => {
      // 目的: インスタンス間で設定/状態が共有される
      it('Then should share state and configuration across instances', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTestContext(_ctx);

        // Given: 複数のロガーインスタンス
        AgLogger.createLogger();
        const logger1 = AgLogger.createLogger();
        const logger2 = AgLogger.createLogger();

        // When: 一つのインスタンスで設定変更
        logger1.logLevel = AG_LOGLEVEL.DEBUG;
        logger1.setVerbose = ENABLE;
        logger1.setLoggerConfig({
          defaultLogger: mockLogger.default,
          formatter: mockFormatter,
          loggerMap: mockLogger.defaultLoggerMap,
        });

        // Then: 設定が他のインスタンスと共有される
        expect(logger2.logLevel).toBe(AG_LOGLEVEL.DEBUG);
        expect(logger2.isVerbose).toBe(ENABLE);

        // Then: ログ出力動作も共有される
        logger2.logLevel = AG_LOGLEVEL.INFO;
        logger2.info('test message');

        expect(mockLogger.getTotalMessageCount()).toBe(1);
        const log = mockLogger.getLastMessage(AG_LOGLEVEL.INFO) as AgLogMessage;

        expect(log.message).toBe('test message');
      });
    });
  });

  /**
   * Given: エラー発生シナリオが存在する場合
   * When: プラグインエラーが発生した時
   * Then: シングルトン整合性は維持される
   */
  describe('Given error scenarios exist', () => {
    describe('When plugin errors occur', () => {
      // 目的: エラー発生時もシングルトン整合性を維持
      it('Then should maintain singleton integrity during errors', (_ctx) => {
        const { mockLogger } = setupTestContext(_ctx);

        // Given: 正常なロガーインスタンス
        const logger1 = AgLogger.createLogger();

        // When: エラーを引き起こす設定を適用
        // Formatterを呼び出していないのでエラーを投げない
        expect(() =>
          logger1.setLoggerConfig({
            defaultLogger: mockLogger.default,
            formatter: MockFormatter.errorThrow,
          })
        ).not.toThrow();

        // Then: 新しいインスタンス取得時も同一性が保たれる
        const logger2 = AgLogger.createLogger();
        expect(logger1).toBe(logger2);
      });
    });

    describe('When accessing rapidly and concurrently', () => {
      // 目的: 急速なシングルトンアクセス時の一貫性
      it('Then should handle rapid access patterns consistently', (_ctx) => {
        setupTestContext(_ctx);

        // When: 大量の並行アクセス
        const loggers = Array.from({ length: 100 }, () => AgLogger.createLogger());

        // Then: 全て同じインスタンスであることを確認
        loggers.forEach((logger) => {
          expect(logger).toBe(loggers[0]);
        });
      });
    });
  });
});
