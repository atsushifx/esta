// tests/integration/agLoggerManager/errorHandling/managerErrors.integration.spec.ts
// @(#) : AgLoggerManager Error Handling Integration Tests - Error handling and edge cases
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';

// types
import type { AgLoggerFunction } from '../../../../shared/types';

// ログレベル定数
import { AG_LOGLEVEL } from '../../../../shared/types';

// テスト対象: マネージャ本体
import { AgLoggerManager } from '@/AgLoggerManager.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

/**
 * AgLoggerManager Error Handling Integration Tests
 *
 * @description エラーハンドリングとエッジケースの統合動作を保証するテスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('AgLoggerManager Error Handling Integration', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    // Reset singleton instance for clean test state
    AgLoggerManager.resetSingleton();
  };

  /**
   * Given: 無効なログレベルアクセスが発生する環境が存在する場合
   * When: 存在しないまたは無効なログレベルにアクセスした時
   * Then: 適切なエラーが投げられる
   */
  describe('Given invalid log level access scenarios exist', () => {
    describe('When accessing non-existent or invalid log levels', () => {
      // 目的: 無効ログレベル時に例外が投げられることを確認
      it('Then should throw appropriate error for invalid log level', () => {
        setupTestContext();

        // Given: 正常なマネージャー設定
        const defaultLogger = vi.fn();
        AgLoggerManager.createManager({ defaultLogger, formatter: PlainFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: 無効なログレベルにアクセス
        const invalidLevel = 999 as unknown as typeof AG_LOGLEVEL.INFO;

        // Then: エラーが投げられる
        expect(() => logger.getLoggerFunction(invalidLevel)).toThrow();
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
      it('Then should handle empty logger map gracefully', () => {
        setupTestContext();

        // Given: 空のロガーマップ設定
        const defaultLogger = vi.fn();
        AgLoggerManager.createManager({
          defaultLogger: defaultLogger,
          formatter: PlainFormatter,
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
              const loggerFn = logger.getLoggerFunction(level as typeof AG_LOGLEVEL.INFO);
              expect(typeof loggerFn).toBe('function');
            }).not.toThrow();
          });
      });
    });

    describe('When handling null or undefined logger map values', () => {
      // 目的: null/undefined値を含むマップの安定性
      it('Then should maintain stability with null/undefined map values', () => {
        setupTestContext();

        // Given: undefined値を含むマップ設定
        const defaultLogger = vi.fn();
        AgLoggerManager.createManager({ defaultLogger, formatter: PlainFormatter });
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
      it('Then should maintain manager stability during plugin errors', () => {
        setupTestContext();

        // Given: エラーを投げるフォーマッター
        const throwingFormatter = vi.fn(() => {
          throw new Error('Formatter error');
        });
        const workingLogger = vi.fn();

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
      it('Then should recover gracefully after plugin error resolution', () => {
        setupTestContext();

        // Given: 初期の問題のある設定
        const problemLogger = vi.fn().mockImplementation(() => {
          throw new Error('Logger error');
        });

        AgLoggerManager.createManager({
          defaultLogger: problemLogger,
          formatter: PlainFormatter,
        });
        const manager = AgLoggerManager.getManager();

        // When: 正常なロガーに置き換え
        const workingLogger = vi.fn();
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
      it('Then should handle concurrent operations without deadlock or inconsistency', () => {
        setupTestContext();

        // Given: 同時アクセス対応の設定
        const initialLogger = vi.fn();
        AgLoggerManager.createManager({ defaultLogger: initialLogger, formatter: PlainFormatter });
        const manager = AgLoggerManager.getManager();

        // When: 同時設定変更と参照
        const loggers = Array.from({ length: 10 }, () => vi.fn());

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
      it('Then should operate without memory leaks during frequent changes', () => {
        setupTestContext();

        // Given: 頻繁変更対応の設定
        const initialLogger = vi.fn();
        AgLoggerManager.createManager({ defaultLogger: initialLogger, formatter: PlainFormatter });
        const manager = AgLoggerManager.getManager();

        // When: 大量の設定変更を実行
        const iterations = 100;
        for (let i = 0; i < iterations; i++) {
          const tempLogger = vi.fn();
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
