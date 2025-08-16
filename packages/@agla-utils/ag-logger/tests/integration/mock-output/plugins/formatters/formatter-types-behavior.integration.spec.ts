// tests/integration/plugins/formatters/formatterTypes.integration.spec.ts
// @(#) : Plugin Formatters Integration Tests - Different formatter type behavior
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// 共有定数: ログレベル定義
import { AG_LOGLEVEL } from '@/shared/types';
import type { AgLogMessage } from '@/shared/types';

// テスト対象: AgLoggerとエントリーポイント
import { AgLogger } from '@/AgLogger.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { NullFormatter } from '@/plugins/formatter/NullFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import type { AgMockConstructor } from '../../../../../shared/types/AgMockConstructor.class';

/**
 * Plugin Formatters Integration Tests
 *
 * @description 各種フォーマッタープラグインの統合動作を保証するテスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('Plugin Formatters Integration', () => {
  const setupTestContext = (_ctx?: TestContext): {
    mockLogger: AgMockBufferLogger;
    mockFormatter: AgMockConstructor;
  } => {
    const _mockLogger = new MockLogger.buffer();
    const _mockFormatter = MockFormatter.passthrough;

    // 初期設定
    vi.clearAllMocks();
    AgLogger.resetSingleton();

    _ctx?.onTestFinished(() => {
      AgLogger.resetSingleton();
      vi.clearAllMocks();
    });

    return {
      mockLogger: _mockLogger,
      mockFormatter: _mockFormatter,
    };
  };

  /**
   * Given: JsonFormatter が使用される環境が存在する場合
   * When: JSON形式での出力が要求された時
   * Then: 適切なJSON構造で出力される
   */
  describe('Given JsonFormatter is used in the environment', () => {
    describe('When JSON format output is requested', () => {
      // 目的: JsonFormatterの基本統合動作とJSON構造検証
      it('Then should produce valid JSON output with proper structure', () => {
        const { mockLogger } = setupTestContext();

        // Given: JsonFormatter設定のモックロガー
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: MockFormatter.json,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: JSON形式でのログ出力
        logger.info('test message', { data: 'value' });

        // Then: 正しいJSON構造で出力
        expect(mockLogger.getMessageCount()).toBe(1);
        const output = mockLogger.getMessages()[0] as string;

        expect(() => JSON.parse(output)).not.toThrow();
        const parsed = JSON.parse(output);
        expect(parsed).toMatchObject({
          level: 'INFO',
          message: 'test message',
          args: [{ data: 'value' }],
        });
      });
    });

    describe('When complex data structures are formatted', () => {
      // 目的: JsonFormatterの複雑データ処理能力
      it('Then should handle complex data structures in JSON format', () => {
        const { mockLogger } = setupTestContext();

        // Given: 複雑データ対応JsonFormatter設定
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: MockFormatter.json,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 複雑データ構造での出力
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

        logger.debug('Complex data', complexData);

        // Then: 複雑データが適切にJSON化される
        expect(mockLogger.getMessageCount()).toBe(1);
        const output = mockLogger.getMessages()[0] as string;

        expect(() => JSON.parse(output)).not.toThrow();
        const parsed = JSON.parse(output);
        expect(parsed.args[0]).toEqual(complexData);
      });
    });
  });

  /**
   * Given: PlainFormatter が使用される環境が存在する場合
   * When: 平文形式での出力が要求された時
   * Then: 可読性の高い平文形式で出力される
   */
  describe('Given PlainFormatter is used in the environment', () => {
    describe('When plain text format output is requested', () => {
      // 目的: PlainFormatterの基本統合動作とフォーマットパターン検証
      it('Then should produce readable plain text with proper format pattern', () => {
        const { mockLogger } = setupTestContext();

        // Given: PlainFormatter設定のモックロガー
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: MockFormatter.passthrough,
        });
        logger.logLevel = AG_LOGLEVEL.WARN;

        // When: 平文形式でのログ出力
        logger.warn('warning message', 'additional info');

        // Then: 適切な平文形式パターンで出力
        expect(mockLogger.getMessageCount()).toBe(1);

        const output = mockLogger.getMessages()[0] as AgLogMessage;
        expect(output.logLevel).toBe(AG_LOGLEVEL.WARN);
        expect(output.message).toBe('warning message additional info');
      });
    });

    describe('When multiple arguments are formatted', () => {
      // 目的: PlainFormatterの複数引数連結能力
      it('Then should concatenate multiple arguments in plain format', () => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 複数引数対応PlainFormatter設定
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.ERROR;

        // When: 複数引数での出力
        logger.error('error occurred', 'detail1', 'detail2', { code: 500 });

        // Then: 全引数が適切に連結される
        expect(mockLogger.getMessageCount()).toBe(1);
        const output = mockLogger.getMessages()[0] as AgLogMessage;

        expect(output.logLevel).toBe(AG_LOGLEVEL.ERROR);
        expect(output.message).toBe('error occurred detail1 detail2');
        expect(output.args[0]).toEqual({ code: 500 });
      });
    });
  });

  /**
   * Given: NullFormatter が使用される環境が存在する場合
   * When: 出力抑制が要求された時
   * Then: 空文字列が返されログが出力されない
   */
  describe('Given NullFormatter is used in the environment', () => {
    describe('When output suppression is requested', () => {
      // 目的: NullFormatterによる完全な出力抑制
      it('Then should suppress all log output by returning empty string', () => {
        const { mockLogger } = setupTestContext();

        // Given: NullFormatter設定のモックロガー
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: NullFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: NullFormatterでのログ出力試行
        logger.info('test message');

        // Then: NullFormatter returns empty string, so logger should not be called
        expect(mockLogger.getMessageCount()).toBe(0);
      });
    });

    describe('When used with different log levels', () => {
      // 目的: NullFormatterの全レベル対応抑制能力
      it('Then should suppress output at all log levels', () => {
        const { mockLogger } = setupTestContext();

        // Given: 全レベル対応NullFormatter設定
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: NullFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.TRACE; // 最も詳細なレベル

        // When: 全レベルでの出力試行
        logger.fatal('fatal');
        logger.error('error');
        logger.warn('warn');
        logger.info('info');
        logger.debug('debug');
        logger.trace('trace');

        // Then: 全レベルで出力が抑制される
        expect(mockLogger.getTotalMessageCount()).toBe(0);
      });
    });
  });

  /**
   * Given: 異なるフォーマッター間の切り替えが必要な環境が存在する場合
   * When: 動的にフォーマッターを切り替えた時
   * Then: 切り替え後のフォーマットが即座に適用される
   */
  describe('Given dynamic formatter switching is required', () => {
    describe('When switching between different formatter types', () => {
      // 目的: フォーマッター間の動的切り替え能力
      it('Then should immediately apply new formatter behavior after switch', () => {
        const { mockLogger } = setupTestContext();

        // Given: 初期JsonFormatter設定
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: MockFormatter.json,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: JsonFormatter -> PlainFormatter への切り替え
        logger.setLoggerConfig({ formatter: PlainFormatter });
        logger.info('after switch to plain');

        // Then: PlainFormatter形式で出力される
        expect(mockLogger.getMessageCount()).toBe(1);
        const plainOutput = mockLogger.getMessages()[0] as string;

        expect(plainOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] after switch to plain$/);

        // When: PlainFormatter -> NullFormatter への切り替え
        mockLogger.reset();
        logger.setLoggerConfig({ formatter: NullFormatter });
        logger.info('after switch to null');

        // Then: 出力が抑制される
        expect(mockLogger.getMessageCount()).toBe(0);
      });
    });

    describe('When switching formatters with different data handling', () => {
      // 目的: フォーマッター切り替え時の異なるデータ処理対応
      it('Then should handle data differently based on current formatter', () => {
        const { mockLogger } = setupTestContext();

        // Given: 複雑データを含む環境
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: MockFormatter.json,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        const testData = { complex: true, nested: { value: 42 } };

        // When: JsonFormatterで複雑データ出力
        logger.info('json test', testData);
        const jsonOutput = mockLogger.getMessages()[0] as string;

        // Then: JSON構造として解析可能
        expect(() => JSON.parse(jsonOutput)).not.toThrow();
        const parsed = JSON.parse(jsonOutput);
        expect(parsed.args[0]).toEqual(testData);

        // When: PlainFormatterに切り替えて同じデータ出力
        mockLogger.reset();
        logger.setLoggerConfig({ formatter: PlainFormatter });
        logger.info('plain test', testData);

        const plainOutput = mockLogger.getMessages()[0] as string;

        // Then: 平文形式で同じデータが処理される
        expect(plainOutput).toContain('plain test');
        expect(plainOutput).toContain('{"complex":true'); // オブジェクトは文字列化
      });
    });
  });
});
