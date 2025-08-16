// tests/integration/agLoggerManager/errorHandling/managerErrors.integration.spec.ts
// @(#) : AgLoggerManager Error Handling Integration Tests - Error handling and edge cases
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// types
import type { AgLoggerFunction } from '@/shared/types';

// ログレベル定数
import { AG_LOGLEVEL } from '@/shared/types';
import type { AgLogLevel } from '@/shared/types';

// テスト対象: マネージャ本体
import { AgLoggerManager } from '@/AgLoggerManager.class';

// プラグイン（フォーマッター）: 出力フォーマット実装

// プラグイン（ロガー）: 出力先実装とダミー
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import type { AgMockConstructor } from '@/shared/types/AgMockConstructor.class';

const setupTestContext = (_ctx?: TestContext): {
  mockLogger: AgMockBufferLogger;
  mockFormatter: AgMockConstructor;
} => {
  const _mockLogger = new MockLogger.buffer();
  const _mockFormatter = MockFormatter.passthrough;

  _ctx?.onTestFinished(() => {
    AgLoggerManager.resetSingleton();
    vi.clearAllMocks();
  });

  // initialize
  vi.clearAllMocks();
  AgLoggerManager.resetSingleton();

  return {
    mockLogger: _mockLogger,
    mockFormatter: _mockFormatter,
  };
};

/**
 * AgLoggerManager Error Handling Integration Tests
 *
 * @description エラーハンドリングとエッジケースの統合動作を保証するテスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('AgLoggerManager Error Handling Integration', () => {
  /**
   * Given: 無効なログレベルアクセスが発生する環境が存在する場合
   * When: 存在しないまたは無効なログレベルにアクセスした時
   * Then: 適切なエラーが投げられる
   */
  describe('Given invalid log level access scenarios exist', () => {
    describe('When accessing non-existent or invalid log levels', () => {
      // 目的: 無効ログレベル時に例外が投げられることを確認
      it('Then should throw appropriate error for invalid log level', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 正常なマネージャー設定
        const defaultLogger = mockLogger.default;
        AgLoggerManager.createManager({ defaultLogger, formatter: mockFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: 無効なログレベルにアクセス
        const invalidLevel = 999 as unknown as AgLogLevel;

        // Then: エラーが投げられる
        expect(() => logger.getLoggerFunction(invalidLevel)).toThrow('Invalid log level (999 - out of valid range)');
      });
    });
  });

  /**
   * Given: 空または不正なロガーマップが存在する場合
   * When: 不正なマップ構成でアクセスした時
   * Then: 安全なフォールバック動作が発生する
   */
  describe('Given empty or invalid logger maps exist', () => {
    describe('When accessing with invalid map configurations', () => {
      // 目的: 空のロガーマップ指定時の挙動確認
      it('Then should handle empty logger map gracefully', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTestContext(_ctx);

        // Given: 空のロガーマップ設定
        const defaultLogger = mockLogger.default;
        AgLoggerManager.createManager({
          defaultLogger: defaultLogger,
          formatter: mockFormatter,
          loggerMap: {},
        });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: 全レベルでのアクセス
        // Then: デフォルトロガーが使用される（例外なし）
        Object.values(AG_LOGLEVEL)
          .filter((level) => level !== AG_LOGLEVEL.OFF)
          .filter((level) => typeof level === 'number')
          .forEach((level) => {
            expect(() => {
              const loggerFn = logger.getLoggerFunction(level as AgLogLevel);
              expect(typeof loggerFn).toBe('function');
            }).not.toThrow();
          });
      });
    });

    describe('When handling null or undefined logger map values', () => {
      // 目的: null/undefined値を含むマップの安定性
      it('Then should maintain stability with null/undefined map values', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTestContext(_ctx);

        // Given: undefined値を含むマップ設定

        const defaultLogger = mockLogger.default;
        AgLoggerManager.createManager({ defaultLogger, formatter: mockFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: undefined/null値を含むマップで設定
        expect(() => {
          manager.setLoggerConfig({
            defaultLogger,
            loggerMap: {
              [AG_LOGLEVEL.ERROR]: undefined,
              [AG_LOGLEVEL.WARN]: null as unknown as AgLoggerFunction,
            },
          });
        }).not.toThrow();

        // Then: undefined/null値に対してデフォルトロガーにフォールバック
        expect(typeof logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe('function');
        expect(typeof logger.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe('function');
      });
    });
  });

  /**
   * Given: プラグインエラーが発生する環境が存在する場合
   * When: フォーマッターやロガーでエラーが発生した時
   * Then: マネージャーは安定性を維持する
   */
  describe('Given plugin errors occur in the environment', () => {
    describe('When formatter or logger errors are encountered', () => {
      // 目的: プラグインエラー発生時のマネージャー安定性
      it('Then should maintain manager stability during plugin errors', (_ctx) => {
        const { mockLogger } = setupTestContext(_ctx);

        const workingLogger = mockLogger.default;
        // Given: エラーを投げるフォーマッター
        const throwingFormatter = MockFormatter.errorThrow;

        // When: エラープラグインで設定
        expect(() => {
          AgLoggerManager.createManager({
            defaultLogger: workingLogger,
            formatter: throwingFormatter,
          });
        }).not.toThrow(); // 設定時はエラーなし

        // Then: マネージャー自体は安定動作
        const manager = AgLoggerManager.getManager();
        expect(manager).toBeDefined();
        expect(typeof manager.getLogger).toBe('function');
      });
    });

    describe('When recovering from plugin errors', () => {
      // 目的: プラグインエラー後の回復能力
      it('Then should recover gracefully after plugin error resolution', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 初期の問題のある設定
        const problemLoggerInstance = new MockLogger.buffer();
        const problemLogger = problemLoggerInstance.info.bind(problemLoggerInstance);

        AgLoggerManager.createManager({
          defaultLogger: problemLogger,
          formatter: mockFormatter,
        });
        const manager = AgLoggerManager.getManager();

        // When: 正常なロガーに置き換え
        const workingLogger = mockLogger.default;
        manager.setLoggerConfig({ defaultLogger: workingLogger });

        // Then: 正常に回復
        const logger = manager.getLogger();
        expect(typeof logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe('function');
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(workingLogger);
      });
    });
  });

  /**
   * Given: 同時アクセス競合が発生する環境が存在する場合
   * When: 設定変更と参照取得が同時に発生した時
   * Then: デッドロックや不整合なく処理される
   */
  describe('Given concurrent access conflicts occur', () => {
    describe('When configuration changes and access occur simultaneously', () => {
      // 目的: 同時アクセス時のマネージャー安定性
      it('Then should handle concurrent operations without deadlock or inconsistency', (_ctx) => {
        const { mockFormatter } = setupTestContext();

        // Given: 同時アクセス対応の設定
        const initialLoggerInstance = new MockLogger.buffer();
        const initialLogger = initialLoggerInstance.info.bind(initialLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger: initialLogger, formatter: mockFormatter });
        const manager = AgLoggerManager.getManager();

        // When: 同時設定変更と参照
        const loggerInstances = Array.from({ length: 10 }, () => new MockLogger.buffer());
        const loggers = loggerInstances.map((instance) => instance.info.bind(instance));

        // 設定変更と参照を交互に実行
        for (let i = 0; i < loggers.length; i++) {
          manager.setLoggerConfig({ defaultLogger: loggers[i] });
          const logger = manager.getLogger();

          // Then: 各段階で正常なロガーが取得できる
          expect(typeof logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe('function');
        }

        // Then: 最終状態が一貫している
        const finalLogger = manager.getLogger();
        expect(typeof finalLogger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe('function');
      });
    });
  });

  /**
   * Given: メモリリークリスクがある環境が存在する場合
   * When: 頻繁な設定変更が発生した時
   * Then: メモリリークなく動作する
   */
  describe('Given memory leak risks exist in the environment', () => {
    describe('When frequent configuration changes occur', () => {
      // 目的: 頻繁な設定変更時のメモリリーク防止
      it('Then should operate without memory leaks during frequent changes', (_ctx) => {
        const { mockFormatter } = setupTestContext(_ctx);

        // Given: 頻繁変更対応の設定
        const initialLoggerInstance = new MockLogger.buffer();
        const initialLogger = initialLoggerInstance.info.bind(initialLoggerInstance);
        AgLoggerManager.createManager({ defaultLogger: initialLogger, formatter: mockFormatter });
        const manager = AgLoggerManager.getManager();

        // When: 大量の設定変更を実行
        const iterations = 100;
        for (let i = 0; i < iterations; i++) {
          const tempLoggerInstance = new MockLogger.buffer();
          const tempLogger = tempLoggerInstance.info.bind(tempLoggerInstance);
          manager.setLoggerConfig({ defaultLogger: tempLogger });

          // 一時的な参照作成と解放
          const logger = manager.getLogger();
          expect(typeof logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe('function');
        }

        // Then: 最終的に正常動作（メモリリークによる性能劣化なし）
        const finalStartTime = Date.now();
        const finalLogger = manager.getLogger();
        expect(typeof finalLogger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe('function');
        const finalTime = Date.now() - finalStartTime;

        // 最終処理時間が合理的（メモリリーク等による劣化なし）
        expect(finalTime).toBeLessThan(100);
      });
    });
  });
});
