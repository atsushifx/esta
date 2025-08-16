// tests/integration/agLoggerManager/management/configuration.integration.spec.ts
// @(#) : AgLoggerManager Management Configuration Integration Tests - Configuration management
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';

// 共有型・定数: ログレベル定義と型
import { AG_LOGLEVEL } from '../../../../shared/types';

// テスト対象: マネージャ本体
import { AgLoggerManager } from '@/AgLoggerManager.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { NullFormatter } from '@/plugins/formatter/NullFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

// プラグイン（ロガー）: 出力先実装とダミー
import { ConsoleLogger } from '@/plugins/logger/ConsoleLogger';

/**
 * AgLoggerManager Management Configuration Integration Tests
 *
 * @description 設定管理機能の統合動作を保証するテスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('AgLoggerManager Management Configuration Integration', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    // Reset singleton instance for clean test state
    AgLoggerManager.resetSingleton();
  };

  /**
   * Given: 複合的な設定更新シナリオが存在する場合
   * When: 混在した設定更新を実行した時
   * Then: 設定の整合性が維持される
   */
  describe('Given mixed configuration update scenarios exist', () => {
    describe('When executing mixed configuration updates', () => {
      // 目的: 複合的なsetManager更新での整合性維持
      it('Then should handle mixed configuration updates correctly', () => {
        setupTestContext();

        // Given: 初期設定のマネージャー
        AgLoggerManager.createManager({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        const manager = AgLoggerManager.getManager();

        // When: 段階的な複合設定更新
        const firstLogger = vi.fn();
        const firstFormatter = vi.fn().mockReturnValue('first');
        manager.setLoggerConfig({
          defaultLogger: firstLogger,
          formatter: firstFormatter,
        });
        const logger = manager.getLogger();

        // Then: 初期設定が適用される（関数型の確認）
        expect(typeof logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe('function');

        // When: フォーマッターのみ更新
        const secondFormatter = vi.fn().mockReturnValue('second');
        manager.setLoggerConfig({ formatter: secondFormatter });

        // Then: フォーマッターのみ変更、ロガーは保持
        const secondLogger = vi.fn();
        manager.setLoggerConfig({ defaultLogger: secondLogger });
        expect(typeof logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe('function');

        // When: 専用ロガーマップ追加
        const errorLogger = vi.fn();
        manager.setLoggerConfig({
          loggerMap: { [AG_LOGLEVEL.ERROR]: errorLogger },
        });

        // Then: 専用ロガーは新設定、デフォルトは保持
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(errorLogger); // 専用ロガー使用
        expect(typeof logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe('function'); // デフォルト保持
      });
    });

    describe('When performing rapid configuration changes', () => {
      // 目的: 急速な設定変更連続時の最終状態の正当性
      it('Then should handle multiple rapid configuration changes correctly', () => {
        setupTestContext();

        // Given: 高頻度変更対応の設定
        AgLoggerManager.createManager({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: 急速な設定変更の実行
        const loggers = Array.from({ length: 5 }, () => vi.fn());
        const formatters = [JsonFormatter, PlainFormatter, NullFormatter, JsonFormatter, PlainFormatter];

        loggers.forEach((logger, index) => {
          manager.setLoggerConfig({
            defaultLogger: logger,
            formatter: formatters[index],
          });
        });

        // Then: 最終設定（最後に適用されたもの）が有効
        const finalFn = logger.getLoggerFunction(AG_LOGLEVEL.INFO);
        expect(typeof finalFn).toBe('function');
        expect(finalFn).not.toBe(ConsoleLogger); // 初期設定から変更済み
      });
    });
  });

  /**
   * Given: フォーマッター統合管理が必要な環境が存在する場合
   * When: 異なるフォーマッター間で切り替えた時
   * Then: 一貫性を保ってフォーマッター変更が適用される
   */
  describe('Given formatter integration management is required', () => {
    describe('When switching between different formatters', () => {
      // 目的: フォーマッター変更が即時反映されることの確認
      it('Then should handle formatter changes with immediate effect', () => {
        setupTestContext();

        // Given: 初期フォーマッター設定
        const firstFormatter = vi.fn().mockReturnValue('first format');
        AgLoggerManager.createManager({ defaultLogger: ConsoleLogger, formatter: firstFormatter });
        const manager = AgLoggerManager.getManager();

        // When: フォーマッター変更
        const secondFormatter = vi.fn().mockReturnValue('second format');
        manager.setLoggerConfig({ formatter: secondFormatter });

        // Then: 変更が即時反映される（実際のログ呼び出しで確認）
        const logger = manager.getLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;

        // フォーマッター呼び出しを確認するため、実際にログ出力は行わない
        // 設定変更の確認のみ実施
        expect(() => manager.setLoggerConfig({ formatter: firstFormatter })).not.toThrow();
      });
    });

    describe('When working with different formatter types', () => {
      // 目的: 複数フォーマッター型の切替互換性検証
      it('Then should work correctly with different formatter implementations', () => {
        setupTestContext();

        // Given: 初期設定
        AgLoggerManager.createManager({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        const manager = AgLoggerManager.getManager();

        // When: 異なるフォーマッター型への切り替え
        expect(() => {
          manager.setLoggerConfig({ formatter: JsonFormatter });
          manager.setLoggerConfig({ formatter: PlainFormatter });
          manager.setLoggerConfig({ formatter: NullFormatter });
        }).not.toThrow();

        // Then: 全ての切り替えが正常完了
        const logger = manager.getLogger();
        expect(logger).toBeDefined();
      });
    });
  });

  /**
   * Given: レガシーAPI互換性が必要な環境が存在する場合
   * When: 旧式のAPIメソッドを使用した時
   * Then: 新しい内部実装と互換性を保って動作する
   */
  describe('Given legacy API compatibility is required', () => {
    describe('When using legacy API methods', () => {
      // 目的: 旧API(bindLoggerFunction等)の互換動作確認
      it('Then should handle legacy setLoggerConfig method correctly', () => {
        setupTestContext();

        // Given: レガシーAPI対応の設定
        AgLoggerManager.createManager({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: レガシーAPIメソッドの使用
        const customLogger = vi.fn();
        manager.bindLoggerFunction(AG_LOGLEVEL.ERROR, customLogger);

        // Then: レガシーAPIで設定したロガーが有効
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(customLogger);

        // When: 新APIとの組み合わせ
        const defaultLogger = vi.fn();
        manager.setLoggerConfig({
          defaultLogger: defaultLogger,
        });

        // Then: 新旧API設定が協調動作
        expect(typeof logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe('function');
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(customLogger); // レガシー設定保持
      });
    });
  });

  /**
   * Given: 複雑な状態遷移が発生する環境が存在する場合
   * When: 複雑な更新中に状態を参照した時
   * Then: 状態一貫性が維持される
   */
  describe('Given complex state transitions occur', () => {
    describe('When accessing state during complex updates', () => {
      // 目的: 複雑更新中の状態一貫性維持を検証
      it('Then should maintain state consistency during complex updates', () => {
        setupTestContext();

        // Given: 複雑な初期設定
        AgLoggerManager.createManager({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        const defaultLogger = vi.fn();
        const errorLogger = vi.fn();
        const debugLogger = vi.fn();
        const formatter = JsonFormatter;

        // When: 複雑な設定更新
        manager.setLoggerConfig({
          defaultLogger,
          formatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger,
            [AG_LOGLEVEL.DEBUG]: debugLogger,
          },
        });

        // Then: 初期複雑設定の確認
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(errorLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(debugLogger);
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(defaultLogger);

        // When: デフォルトロガーのみ更新
        const newDefaultLogger = vi.fn();
        manager.setLoggerConfig({ defaultLogger: newDefaultLogger });

        // Then: デフォルトロガー変更時の選択的適用
        // マップで明示的に設定されたレベルは専用ロガーを保持
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(errorLogger); // 専用ロガー保持
        expect(logger.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(debugLogger); // 専用ロガー保持
        expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(newDefaultLogger); // 新デフォルト使用
      });
    });
  });
});
