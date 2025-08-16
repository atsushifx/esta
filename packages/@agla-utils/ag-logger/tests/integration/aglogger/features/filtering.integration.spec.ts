// tests/integration/agLogger/features/filtering.integration.spec.ts
// @(#) : AgLogger Features Filtering Integration Tests - Log level filtering and verbose functionality
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
import { isStandardLogLevel } from '@/utils/AgLogValidators';
import { DISABLE, ENABLE } from '../../../../shared/constants';
import { AG_LOGLEVEL } from '../../../../shared/types';
import type { AgFormatFunction } from '../../../../shared/types';

// テスト対象: AgLoggerとマネージャ
import { AgLogger } from '@/AgLogger.class';
import { AgLoggerManager } from '@/AgLoggerManager.class';

// プラグイン（フォーマッター/ロガー）: JSON/Plain/モック
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { createMockFormatter } from '@/plugins/formatter/MockFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';

// Test Utilities

/**
 * テストモックを作成
 */
const createMock = (ctx: TestContext): { mockLogger: AgMockBufferLogger; mockFormatter: AgFormatFunction } => {
  const mockLogger = new MockLogger.buffer();
  const mockFormatterConstructor = createMockFormatter((msg) => msg);
  const mockFormatter = new mockFormatterConstructor((msg) => msg).execute;

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
 * AgLogger Features Filtering Integration Tests
 *
 * @description ログレベルフィルタリングとverbose機能の統合動作テスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('AgLogger Features Filtering Integration', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
  };

  /**
   * Given: 異なるログレベル設定が存在する場合
   * When: 各レベルでログメッセージを出力した時
   * Then: レベル設定に基づいて適切にフィルタリングされる
   */
  describe('Given different log level settings exist', () => {
    describe('When outputting log messages at various levels', () => {
      // 目的: すべての構成要素で一貫したフィルタリングが行われる
      it('Then should apply filtering consistently across all components', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        // Given: WARN レベルで設定されたロガー
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.info,
          formatter: JsonFormatter,
          loggerMap: mockLogger.defaultLoggerMap,
        });
        logger.logLevel = AG_LOGLEVEL.WARN;

        // When: 異なるレベルでログ出力
        logger.error('error'); // 出力される（ERROR ≤ WARN）
        logger.warn('warn'); // 出力される（WARN ≤ WARN）
        logger.info('info'); // フィルタリングされる（INFO > WARN）
        logger.debug('debug'); // フィルタリングされる（DEBUG > WARN）

        // Then: 適切にフィルタリング
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.ERROR)).toBe(1);
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.WARN)).toBe(1);
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(0); // フィルタリングされるため出力されない
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.DEBUG)).toBe(0); // フィルタリングされるため出力されない
      });
    });

    describe('When log level is set to OFF', () => {
      // 目的: OFFレベル時に全レベルで出力が抑止される
      it('Then should suppress all log output', (ctx) => {
        const { mockLogger } = createMock(ctx);
        const mockFormatter = vi.fn().mockImplementation((msg) => msg.message ?? msg);
        setupTestContext();

        // Given: OFFレベルで設定されたロガー
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
          loggerMap: mockLogger.defaultLoggerMap,
        });
        logger.logLevel = AG_LOGLEVEL.OFF;

        // When: 全レベルでログ出力を試行
        logger.fatal('fatal');
        logger.error('error');
        logger.warn('warn');
        logger.info('info');
        logger.debug('debug');
        logger.trace('trace');

        // Then: 全ての出力が抑止される
        expect(mockLogger.getTotalMessageCount()).toBe(0);
        expect(mockFormatter).not.toHaveBeenCalled();
      });
    });

    describe('When log level changes dynamically', () => {
      // 目的: 動的なログレベル変更が即座に反映される
      it('Then should immediately apply new filtering rules', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        // Given: DEBUG レベルで設定されたロガー
        const PassthroughFormatter = createMockFormatter((msg) => msg);
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: new PassthroughFormatter((msg) => msg).execute,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 初期状態でログ出力
        logger.info('info1');
        logger.debug('debug1');
        expect(mockLogger.getTotalMessageCount()).toBe(2);

        // When: ログレベルを INFO に変更
        logger.logLevel = AG_LOGLEVEL.INFO;
        mockLogger.clearAllMessages();

        logger.info('info2'); // 出力される
        logger.debug('debug2'); // フィルタリングされる

        // Then: 新しいフィルタリングルールが適用
        expect(mockLogger.getTotalMessageCount()).toBe(1);
        const message = mockLogger.getLastMessage(AG_LOGLEVEL.DEFAULT);
        expect(message).toMatchObject({ message: 'info2' });
      });
    });
  });

  /**
   * Given: Verbose モードの設定が存在する場合
   * When: Verbose モードを有効/無効にした時
   * Then: 詳細な出力制御が適切に動作する
   */
  describe('Given verbose mode configurations exist', () => {
    describe('When enabling verbose mode', () => {
      // 目的: Verboseモード有効時に詳細な出力が行われる
      it('Then should provide detailed output formatting', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        // Given: Verboseモード有効なロガー
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: PlainFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.setVerbose = ENABLE;

        // When: ログメッセージを出力
        logger.info('verbose test', { data: 'value' });

        // Then: Verboseモードが有効
        expect(logger.isVerbose).toBe(ENABLE);
        expect(mockLogger.getTotalMessageCount()).toBe(1);
        const message = mockLogger.getLastMessage(AG_LOGLEVEL.DEFAULT) as string;

        // PlainFormatterによる詳細な出力フォーマットを確認
        expect(message).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] verbose test/);
      });
    });

    describe('When disabling verbose mode', () => {
      // 目的: Verboseモード無効時に簡潔な出力が行われる
      it('Then should provide concise output formatting', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        // Given: 初期はVerboseモード有効
        const PassthroughFormatter = createMockFormatter((msg) => msg);
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: new PassthroughFormatter((msg) => msg).execute,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.setVerbose = ENABLE;

        // When: Verboseモードを無効に変更
        logger.setVerbose = DISABLE;
        logger.info('concise test');

        // Then: Verboseモードが無効
        expect(logger.isVerbose).toBe(DISABLE);
        expect(mockLogger.getTotalMessageCount()).toBe(1);
      });
    });
  });

  /**
   * Given: 複合的なフィルタリングシナリオが存在する場合
   * When: ログレベル、Verbose、ログマップが組み合わさった時
   * Then: 全ての設定が協調して適切に動作する
   */
  describe('Given complex filtering scenarios exist', () => {
    describe('When log level, verbose mode, and logger map are combined', () => {
      // 目的: 複合設定での統合フィルタリング動作
      it('Then should coordinate all filtering settings appropriately', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        // Given: 複合的な設定
        const errorLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: JsonFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger.getLoggerFunction(AG_LOGLEVEL.ERROR),
          },
        });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.setVerbose = ENABLE;

        // When: 異なるレベルで出力
        logger.error('error msg'); // errorLogger使用
        logger.warn('warn msg'); // defaultLogger使用
        logger.info('info msg'); // defaultLogger使用
        logger.debug('debug msg'); // フィルタリング

        // Then: 設定が協調動作
        expect(errorLogger.getTotalMessageCount()).toBe(1);
        expect(mockLogger.getTotalMessageCount()).toBe(2); // warn + info
        expect(logger.isVerbose).toBe(ENABLE);

        // Then: エラーメッセージが専用ロガーで処理
        const errorMessage = errorLogger.getLastMessage(AG_LOGLEVEL.ERROR) as string;
        expect(() => JSON.parse(errorMessage)).not.toThrow();
        const parsedError = JSON.parse(errorMessage);
        expect(parsedError.message).toBe('error msg');
      });
    });

    describe('When filtering with standard log level validation', () => {
      // 目的: 標準ログレベル検証との統合
      it('Then should work correctly with log level validators', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        // Given: 標準ログレベル検証と統合
        const PassthroughFormatter = createMockFormatter((msg) => msg);
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: new PassthroughFormatter((msg) => msg).execute,
        });

        // When: 標準レベルと非標準レベルをテスト
        const standardLevels = Object.values(AG_LOGLEVEL).filter((level) =>
          typeof level === 'number' && isStandardLogLevel(level)
        );

        logger.logLevel = AG_LOGLEVEL.DEBUG;

        standardLevels.forEach((level) => {
          if (level <= AG_LOGLEVEL.DEBUG && level !== AG_LOGLEVEL.OFF) {
            // 出力されるべきレベル
            expect(isStandardLogLevel(level)).toBe(true);
          }
        });

        // Then: 標準ログレベル検証が正常動作
        expect(isStandardLogLevel(AG_LOGLEVEL.INFO)).toBe(true);
        expect(isStandardLogLevel(AG_LOGLEVEL.DEBUG)).toBe(true);
        expect(isStandardLogLevel(AG_LOGLEVEL.VERBOSE)).toBe(false); // 非標準
      });
    });
  });
});
