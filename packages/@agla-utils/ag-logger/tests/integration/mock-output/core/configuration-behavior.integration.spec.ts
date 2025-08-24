// tests/integration/mock-output/core/configuration-behavior.integration.spec.ts
// @(#) : Core Configuration Behavior Integration Tests - Configuration management behavior verification
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
// 共有定数: ログレベル定義
import { AG_LOGLEVEL } from '@/shared/types';

// テスト対象: AgLoggerとマネージャ
import { AgLogger } from '@/AgLogger.class';
import { AgLoggerManager } from '@/AgLoggerManager.class';

// プラグイン（フォーマッター/ロガー）: モック/プレーン実装
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import type { AgLogMessage } from '@/shared/types';
import type { AgMockConstructor } from '@/shared/types/AgMockConstructor.class';

// Test Utilities

/**
 * テストモックを作成 - E2eMockLogger使用
 */
const setupTest = (): { mockLogger: AgMockBufferLogger; mockFormatter: AgMockConstructor } => {
  vi.clearAllMocks();
  AgLogger.resetSingleton();
  AgLoggerManager.resetSingleton();

  return {
    mockLogger: new MockLogger.buffer(),
    mockFormatter: MockFormatter.passthrough,
  };
};

/**
 * Core Configuration Behavior Integration Tests
 *
 * @description Mock出力での設定管理の振る舞いを保証する統合テスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('Core Configuration Behavior Integration', () => {
  /**
   * Given: 複雑な設定組み合わせが存在する場合
   * When: 部分的なロガーマップ設定を適用した時
   * Then: 適切なフォールバック動作が発生する
   *
   * @description 複雑な設定組み合わせでの動作統合テスト
   * 部分的なロガーマップ設定と適切なフォールバック動作を検証
   */
  describe('Given complex configuration combinations exist', () => {
    /**
     * @description 部分的ロガーマップ設定適用時のフォールバック動作テスト
     * 部分的なロガーマップ設定での適切なフォールバック処理を検証
     */
    describe('When applying partial logger map configurations', () => {
      // 部分ロガーマップと混在設定の適用を検証
      it('Then should handle partial logger maps with proper fallback', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTest();

        // Given: 異なる用途の専用ロガーを準備
        const errorLogger = mockLogger.getLoggerFunction(AG_LOGLEVEL.ERROR); // mockLogger使用;
        const warnLogger = mockLogger.getLoggerFunction(AG_LOGLEVEL.WARN); // mockLogger.buffer();
        const defaultLogger = mockLogger.getLoggerFunction();

        // When: 部分的なロガーマップで設定
        const logger = AgLogger.createLogger({
          defaultLogger: defaultLogger,
          formatter: mockFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger,
            [AG_LOGLEVEL.WARN]: warnLogger,
          },
        });

        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 各レベルでログ出力
        logger.error('error message'); // errorLogger使用
        logger.warn('warn message'); // warnLogger使用
        logger.info('info message'); // defaultLogger使用
        logger.debug('debug message'); // defaultLogger使用

        // Then: 各ロガーが適切に使い分けられる
        expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toHaveLength(1);
        expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toHaveLength(1);
        expect(mockLogger.getMessages(AG_LOGLEVEL.DEFAULT)).toHaveLength(2);

        // Then: メッセージ内容が正確
        expect(mockLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toMatchObject({
          message: 'error message',
        });
        expect(mockLogger.getLastMessage(AG_LOGLEVEL.WARN)).toMatchObject({
          message: 'warn message',
        });
      });
    });

    /**
     * @description 段階的設定更新時の設定維持テスト
     * 複数回の設定更新を通じて最終構成が正しく維持されることを検証
     */
    describe('When updating configurations incrementally', () => {
      // 段階的な設定更新を通じて最終構成の反映を確認
      it('Then should maintain final configuration through multiple updates', (_ctx) => {
        const { mockFormatter } = setupTest();

        // Given: 初期ロガーインスタンス
        const logger = AgLogger.createLogger();
        const finalLogger = new MockLogger.buffer();

        // When: 段階的な設定更新を実行
        const tempLogger1 = new MockLogger.buffer();
        const tempLogger2 = new MockLogger.buffer();

        logger.setLoggerConfig({ defaultLogger: tempLogger1.getLoggerFunction() });
        logger.setLoggerConfig({
          loggerMap: { [AG_LOGLEVEL.ERROR]: tempLogger2.getLoggerFunction(AG_LOGLEVEL.ERROR) },
        });

        logger.setLoggerConfig({ formatter: mockFormatter });
        logger.setLoggerConfig({ defaultLogger: finalLogger.getLoggerFunction() });

        // When: 最終設定でログ出力
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.info('test message');

        // Then: 最終設定が有効
        expect(finalLogger.getTotalMessageCount()).toBe(1);
        const logMessage = finalLogger.getLastMessage(AG_LOGLEVEL.DEFAULT) as AgLogMessage;
        expect(logMessage.message).toBe('test message');
      });
    });
  });

  /**
   * Given: 複雑な管理機能が必要な環境が存在する場合
   * When: マネージャ経由の設定変更を実行した時
   * Then: 適切な管理動作が発生する
   *
   * @description マネージャー機能統合テスト
   * マネージャーを通じた設定管理と複雑な状態遷移を検証
   */
  describe('Given complex management functionality is required', () => {
    /**
     * @description マネージャー経由の混合設定更新テスト
     * マネージャーを通じた複雑な設定更新の適切な処理を検証
     */
    describe('When executing mixed configuration updates via manager', () => {
      // マネージャーでの複合設定更新と整合性維持
      it('Then should handle manager-based mixed configuration updates correctly', () => {
        const { mockLogger, mockFormatter } = setupTest();

        // Given: マネージャー経由での初期設定
        AgLoggerManager.createManager({ defaultLogger: mockLogger.default, formatter: mockFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: 段階的な複合設定更新
        const firstLoggerInstance = new MockLogger.buffer();
        const firstLogger = firstLoggerInstance.info.bind(firstLoggerInstance);
        const firstFormatter = MockFormatter.prefixed('first');
        manager.setLoggerConfig({
          defaultLogger: firstLogger,
          formatter: firstFormatter,
        });

        // Then: 初期設定が適用される
        expect(typeof logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe('function');

        // When: フォーマッターのみ更新
        const secondFormatter = MockFormatter.prefixed('second');
        manager.setLoggerConfig({ formatter: secondFormatter });

        // When: デフォルトロガー更新
        const secondLoggerInstance = new MockLogger.buffer();
        const secondLogger = secondLoggerInstance.info.bind(secondLoggerInstance);
        manager.setLoggerConfig({ defaultLogger: secondLogger });

        // Then: 設定変更が適用される
        expect(typeof logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe('function');

        // When: 専用ロガーマップ追加
        const errorLoggerInstance = new MockLogger.buffer();
        const errorLogger = errorLoggerInstance.error.bind(errorLoggerInstance);
        manager.setLoggerConfig({
          loggerMap: { [AG_LOGLEVEL.ERROR]: errorLogger },
        });

        // Then: 専用ロガーは新設定、デフォルトは保持
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(errorLogger);
        expect(typeof logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe('function');
      });
    });

    /**
     * @description マネージャー経由の急速設定変更テスト
     * マネージャーを通じた急速な設定変更の最終状態正当性を検証
     */
    describe('When performing rapid configuration changes via manager', () => {
      // マネージャーでの急速設定変更と最終状態確認
      it('Then should handle multiple rapid manager configuration changes correctly', () => {
        const { mockLogger, mockFormatter } = setupTest();

        // Given: マネージャー経由の高頻度変更対応設定
        AgLoggerManager.createManager({ defaultLogger: mockLogger.default, formatter: mockFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: 急速な設定変更の実行
        const loggerInstances = Array.from({ length: 3 }, () => new MockLogger.buffer());
        const loggers = loggerInstances.map((instance) => instance.info.bind(instance));
        const formatters = [PlainFormatter, MockFormatter.passthrough, PlainFormatter];

        loggers.forEach((logger, index) => {
          manager.setLoggerConfig({
            defaultLogger: logger,
            formatter: formatters[index],
          });
        });

        // Then: 最終設定が有効
        const finalFn = logger.getLoggerFunction(AG_LOGLEVEL.INFO);
        expect(typeof finalFn).toBe('function');
        expect(finalFn).not.toBe(mockLogger.default);
      });
    });

    /**
     * @description マネージャーレガシーAPI互換性テスト
     * レガシーAPIと新APIの協調動作を検証
     */
    describe('When using legacy API methods with manager', () => {
      // レガシーAPI(bindLoggerFunction等)の互換動作確認
      it('Then should handle legacy manager API methods correctly', () => {
        const { mockLogger, mockFormatter } = setupTest();

        // Given: レガシーAPI対応の設定
        AgLoggerManager.createManager({ defaultLogger: mockLogger.default, formatter: mockFormatter });
        const manager = AgLoggerManager.getManager();
        const logger = manager.getLogger();

        // When: レガシーAPIメソッドの使用
        const customLoggerInstance = new MockLogger.buffer();
        const customLogger = customLoggerInstance.error.bind(customLoggerInstance);
        manager.bindLoggerFunction(AG_LOGLEVEL.ERROR, customLogger);

        // Then: レガシーAPIで設定したロガーが有効
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(customLogger);

        // When: 新APIとの組み合わせ
        const defaultLoggerInstance = new MockLogger.buffer();
        const defaultLogger = defaultLoggerInstance.info.bind(defaultLoggerInstance);
        manager.setLoggerConfig({
          defaultLogger: defaultLogger,
        });

        // Then: 新旧API設定が協調動作
        expect(typeof logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe('function');
        expect(logger.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(customLogger);
      });
    });
  });

  /**
   * Given: 設定競合とエラーシナリオが存在する場合
   * When: フォーマッター競合が発生した時
   * Then: 適切なエラー処理が行われる
   *
   * @description 設定競合とエラーシナリオでの処理統合テスト
   * フォーマッター競合や各種エラーシナリオでの適切な処理を検証
   */
  describe('Given configuration conflicts and error scenarios exist', () => {
    /**
     * @description フォーマッター競合発生時のエラー処理テスト
     * フォーマッター競合が発生した場合の適切なエラー処理を検証
     */
    describe('When formatter conflicts occur', () => {
      // フォーマッター競合発生時のエラー処理を確認
      it('Then should handle configuration conflicts gracefully', (_ctx) => {
        setupTest();

        // Given: 正常なロガーインスタンス
        const logger = AgLogger.createLogger();
        const conflictingFormatter1 = vi.fn().mockReturnValue('format1');
        const conflictingFormatter2 = vi.fn(() => {
          throw new Error('Formatter conflict');
        });

        // When: 最初の設定は成功
        logger.setLoggerConfig({ formatter: conflictingFormatter1 });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // Then: 正常な動作
        expect(() => logger.info('test1')).not.toThrow();

        // When: 競合する設定を適用
        logger.setLoggerConfig({ formatter: conflictingFormatter2 });

        // Then: エラーが適切に処理される
        expect(() => logger.info('test2')).toThrow('Formatter conflict');
      });
    });

    /**
     * @description ログ出力中の急速設定変更時の処理テスト
     * ログ出力中に急速な設定変更が発生した場合の適切な処理を検証
     */
    describe('When rapid configuration changes occur during logging', () => {
      // ログ出力中の急速な設定変更に対する耐性を確認
      it('Then should handle rapid configuration changes during active logging', (_ctx) => {
        const { mockLogger: mockLogger1 } = setupTest();

        // Given: 複数の設定オプション
        const mockLogger2 = new MockLogger.buffer();
        const mockFormatter1 = vi.fn().mockReturnValue('format1');
        const mockFormatter2 = vi.fn().mockReturnValue('format2');

        // When: 初期設定
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger1.getLoggerFunction(),
          formatter: mockFormatter1,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: ログ出力と設定変更を交互に実行
        for (let i = 0; i < 100; i++) {
          logger.info(`Rapid config test ${i}`);

          if (i % 10 === 0) {
            // 10回ごとに設定変更
            const useFirst = i % 20 === 0;
            logger.setLoggerConfig({
              defaultLogger: useFirst ? mockLogger1.getLoggerFunction() : mockLogger2.getLoggerFunction(),
              formatter: useFirst ? mockFormatter1 : mockFormatter2,
            });
          }
        }

        // Then: 全ての処理が完了
        const totalMessages = mockLogger1.getTotalMessageCount() + mockLogger2.getTotalMessageCount();
        expect(totalMessages).toBe(100);
        expect(mockFormatter1.mock.calls.length + mockFormatter2.mock.calls.length).toBe(100);
      });
    });

    /**
     * @description 複雑設定での混在エラーシナリオ処理テスト
     * 複雑な設定下での混在エラーパターンの適切な処理を検証
     */
    describe('When mixed error scenarios occur in complex configurations', () => {
      // 複雑設定下での混在エラーパターン処理を確認
      it('Then should handle mixed error scenarios appropriately', (_ctx) => {
        const { mockLogger } = setupTest();

        // Given: 正常なロガーとエラーロガーの混在設定
        const errorLogger = vi.fn().mockImplementation(() => {
          throw new Error('Error logger failed');
        });

        // When: エラーロガーを含む設定
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: PlainFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger,
          },
        });

        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // Then: エラーレベルは失敗、他は成功
        expect(() => logger.error('error')).toThrow('Error logger failed');
        expect(() => logger.info('info')).not.toThrow();
        expect(mockLogger.getTotalMessageCount()).toBe(1);
      });
    });
  });
});
