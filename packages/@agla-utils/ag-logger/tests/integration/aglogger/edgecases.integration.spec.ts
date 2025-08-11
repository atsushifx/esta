// tests/integration/AgLogger.edgecases.integration.spec.ts
// @(#) : Complex edge case integration tests for AgLogger - External dependencies and plugin interactions
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: ライフサイクル・実行・モック
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// 共有型・定数: ログレベルとモック型
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgFormatFunction } from '../../../shared/types';

// テスト対象: AgLogger本体
import { AgLogger } from '@/AgLogger.class';

// プラグイン（フォーマッター/ロガー）
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
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
    mockLogger.clearAllMessages();
    vi.clearAllMocks();
  });

  return {
    mockLogger,
    mockFormatter,
  };
};

/**
 * Complex Edge Cases Integration Tests
 *
 * @description 複雑なエッジケース、外部依存、プラグイン相互作用のインテグレーションテスト
 */
describe('AgLogger Complex Edge Cases Integration Tests', () => {
  beforeEach(() => {
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    AgLogger.resetSingleton();
  });

  describe('Complex Object Structure Processing', () => {
    // 循環参照テストは dataProcessing.integration.spec.ts に移動済み

    // 目的: 深くネストしたオブジェクトの安全な処理
    it('should handle deeply nested objects', (ctx) => {
      const { mockLogger, mockFormatter } = createMock(ctx);
      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: mockFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      type DeepObj = {
        level: number;
        nested?: DeepObj;
      };

      let deepObj: DeepObj = { level: 0 };
      for (let i = 1; i < 100; i++) {
        deepObj = { level: i, nested: deepObj };
      }

      expect(() => logger.info('deep object', deepObj)).not.toThrow();
      expect(mockLogger.getTotalMessageCount()).toBe(1);
    });
  });

  describe('Error Object Processing', () => {
    // 目的: カスタムプロパティ付きErrorの取り扱い
    it('should handle errors with custom properties', (ctx) => {
      const { mockLogger, mockFormatter } = createMock(ctx);
      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: mockFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      type CustomError = Error & {
        code: string;
        details: unknown;
      };

      const customError = new Error('Custom error');
      (customError as CustomError).code = 'CUSTOM_CODE';
      (customError as CustomError).details = { id: 123, context: 'test' };

      logger.info('custom error', customError);

      expect(mockLogger.getTotalMessageCount()).toBe(1);
    });

    // 目的: 複数種のErrorを同時に扱う
    it('should handle multiple error types simultaneously', (ctx) => {
      const { mockLogger, mockFormatter } = createMock(ctx);
      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: mockFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      const typeError = new TypeError('Type error');
      const rangeError = new RangeError('Range error');
      const syntaxError = new SyntaxError('Syntax error');

      logger.info('multiple errors', typeError, rangeError, syntaxError);

      expect(mockLogger.getTotalMessageCount()).toBe(1);
    });
  });

  // 外部プラグイン統合テストは PluginInteraction.integration.spec.ts に移動済み

  describe('Special Character and Encoding Processing', () => {
    // Unicode高負荷処理テストは performance.integration.spec.ts に移動済み

    // 目的: さまざまな空白文字の安定処理
    it('should handle various whitespace types consistently', (ctx) => {
      const { mockLogger, mockFormatter } = createMock(ctx);
      const logger = AgLogger.createLogger({
        defaultLogger: mockLogger.createLoggerFunction(),
        formatter: mockFormatter,
      });
      logger.logLevel = AG_LOGLEVEL.INFO;

      const whitespaceMessages = [' ', '\t', '\n', '\r\n', '   ', '\t\n '];
      let validMessages = 0;

      whitespaceMessages.forEach((msg) => {
        logger.info(`whitespace: "${msg}"`);
        validMessages++;
      });

      expect(mockLogger.getTotalMessageCount()).toBe(validMessages);
    });
  });

  // 負荷テスト関連は performance.integration.spec.ts に移動済み
});
