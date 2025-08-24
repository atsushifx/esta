// tests/integration/agLogger/dataHandling/complexData.integration.spec.ts
// @(#) : AgLogger Data Handling Complex Data Integration Tests - Special data handling scenarios
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// 共有型・定数: ログレベルとモック型
import { AG_LOGLEVEL } from '@/shared/types';
import type { AgFormattedLogMessage } from '@/shared/types';

// テスト対象: AgLoggerとマネージャ
import { AgLogger } from '@/AgLogger.class';

// プラグイン（フォーマッター/ロガー）: モック実装
import { createMockFormatter, MockFormatter } from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import type { AgMockConstructor } from '@/shared/types/AgMockConstructor.class';

// type definitions
/**
 * テスト用循環参照型定義
 * @description 循環参照テストで使用する共通型定義
 */
export type TCircularTestObject = {
  name: string;
  id?: number;
  data?: string;
  // 自己参照
  self?: TCircularTestObject;
  ref?: TCircularTestObject;
  // ネストレベル
  level1?: TCircularTestObject;
  level2?: TCircularTestObject;
  level3?: TCircularTestObject;
  // 循環プロパティ
  circular?: TCircularTestObject;
};

// Test Utilities

/**
 * テスト初期設定
 */
const setupTestContext = (_ctx?: TestContext): {
  mockLogger: AgMockBufferLogger;
  mockFormatter: AgMockConstructor;
} => {
  vi.clearAllMocks();
  AgLogger.resetSingleton();

  return {
    mockLogger: new MockLogger.buffer(),
    mockFormatter: MockFormatter.passthrough,
  };
};

/**
 * AgLogger Data Handling Complex Data Integration Tests
 *
 * @description 循環参照オブジェクトなど特殊データの統合処理テスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('Mock Output Complex Data Handling Integration', () => {
  /**
   * Given: 循環参照オブジェクトが存在する場合
   * When: 循環参照を含むデータをログ出力した時
   * Then: 安全に処理され、システムが継続動作する
   */
  describe('Given complex data structures exist', () => {
    describe('When processing circular references', () => {
      // 目的: 循環参照を含むデータでも安全に処理継続
      it('Then should handle circular references safely without infinite loops', (_ctx) => {
        const { mockLogger } = setupTestContext();
        const circularFormatter = (logMessage: AgFormattedLogMessage): string => {
          try {
            return JSON.stringify(logMessage);
          } catch (error) {
            return `[Circular Reference Error: ${error instanceof Error ? error.message : String(error)}]`;
          }
        };

        // Given: 循環参照処理可能なロガー設定
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: MockFormatter.withRoutine(circularFormatter),
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: 循環参照オブジェクトを作成
        const circularObj: TCircularTestObject = {
          name: 'test',
          id: 1,
        };
        circularObj.self = circularObj; // 自己循環参照
        circularObj.circular = {
          name: 'circular',
          ref: circularObj, // 相互循環参照
        };

        // When: 循環参照オブジェクトをログ出力
        logger.info('Circular reference test', circularObj);

        // Then: 処理が正常に継続
        expect(mockLogger.getTotalMessageCount()).toBe(1);
        const loggedMessage = mockLogger.getLastMessage(AG_LOGLEVEL.DEFAULT) as string;
        expect(loggedMessage).toContain('Circular Reference Error');
      });
    });

    describe('When processing nested circular structures', () => {
      // 目的: 複雑にネストした循環参照の安全な処理
      it('Then should safely handle deeply nested circular structures', (_ctx) => {
        const { mockLogger } = setupTestContext(_ctx);

        const circularCheckFormatter = (logMessage: AgFormattedLogMessage): string => {
          // 循環参照安全なJSONフォーマッター
          try {
            return JSON.stringify(logMessage, (key, value) => {
              // 循環参照を検出・回避
              if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                  return '[Circular]';
                }
                seen.add(value);
              }
              return value;
            });
          } catch (error) {
            return `[Format Error: ${error instanceof Error ? error.message : String(error)}]`;
          }
        };

        // Given: ネスト循環参照処理可能なロガー
        const seen = new WeakSet(); // 循環参照検出用
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: MockFormatter.withRoutine(circularCheckFormatter),
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 多層ネスト循環参照オブジェクトを作成
        const level3: TCircularTestObject = { name: 'level3' };
        const level2: TCircularTestObject = { name: 'level2', level3 };
        const level1: TCircularTestObject = { name: 'level1', level2 };
        const root: TCircularTestObject = { name: 'root', level1 };

        // 循環参照を作成
        level3.ref = root; // level3 -> root への循環参照
        level2.self = level2; // level2 自己参照
        root.circular = level1; // root -> level1 への参照

        // When: 複雑循環参照オブジェクトをログ出力
        logger.debug('Nested circular test', root);

        // Then: 安全に処理される
        expect(mockLogger.getTotalMessageCount()).toBe(1);
        const message = mockLogger.getLastMessage(AG_LOGLEVEL.DEFAULT);
        expect(message).toBeDefined();
      });
    });
  });

  /**
   * Given: 深くネストしたオブジェクト構造が存在する場合
   * When: 深いネスト構造のデータをログ出力した時
   * Then: スタックオーバーフローなく安全に処理される
   */
  describe('Given complex data structures exist', () => {
    describe('When processing deeply nested objects', () => {
      // 目的: 深くネストしたオブジェクトの安全な処理
      it('Then should handle deeply nested objects without stack overflow', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTestContext(_ctx);

        // Given: 深いネスト対応ロガー
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: 深くネストしたオブジェクトを作成
        type DeepObj = {
          level: number;
          nested?: DeepObj;
        };

        let deepObj: DeepObj = { level: 0 };
        for (let i = 1; i < 100; i++) {
          deepObj = { level: i, nested: deepObj };
        }

        // When: 深いネストオブジェクトをログ出力
        expect(() => logger.info('deep object', deepObj)).not.toThrow();

        // Then: 正常に処理完了
        expect(mockLogger.getTotalMessageCount()).toBe(1);
      });
    });
  });

  /**
   * Given: カスタムプロパティ付きErrorオブジェクトが存在する場合
   * When: 複雑なErrorオブジェクトをログ出力した時
   * Then: Error固有プロパティも含めて適切に処理される
   */
  describe('Given special data values exist', () => {
    describe('When processing custom error objects', () => {
      // 目的: カスタムプロパティ付きErrorの取り扱い
      it('Then should extract error information properly', (_ctx) => {
        const { mockLogger, mockFormatter } = setupTestContext(_ctx);

        // Given: Errorオブジェクト対応ロガー
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: カスタムプロパティ付きErrorを作成
        type CustomError = Error & {
          code: string;
          details: unknown;
          timestamp: Date;
          metadata: Record<string, unknown>;
        };

        const customError = new Error('Custom error message') as CustomError;
        customError.code = 'CUSTOM_ERROR';
        customError.details = { source: 'test', severity: 'high' };
        customError.timestamp = new Date();
        customError.metadata = {
          userId: 123,
          sessionId: 'session-abc',
          nested: { deep: { value: 'test' } },
        };

        // When: カスタムErrorオブジェクトをログ出力
        logger.info('Custom error occurred', customError);

        // Then: 正常に処理される
        expect(mockLogger.getTotalMessageCount()).toBe(1);
        const message = mockLogger.getLastMessage(AG_LOGLEVEL.DEFAULT);
        expect(message).toMatchObject({
          message: 'Custom error occurred',
          args: [expect.objectContaining({
            message: 'Custom error message',
          })],
        });
      });
    });
  });

  /**
   * Given: 特殊なJavaScriptオブジェクトが存在する場合
   * When: 特殊オブジェクト（undefined, null, Symbol等）をログ出力した時
   * Then: 型安全に処理され、適切な文字列表現が生成される
   */
  describe('Given special data values exist', () => {
    describe('When processing undefined and null values', () => {
      // 目的: 特殊JavaScript値の安全な処理
      it('Then should handle special values appropriately', (_ctx) => {
        const { mockLogger } = setupTestContext();

        // Given: 特殊値対応ロガー
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: new (createMockFormatter((msg) => msg))((msg) => msg).execute,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: 様々な特殊値をログ出力
        const testSymbol = Symbol('test');
        const testFunction = function namedFunction(): string {
          return 'test';
        };
        const testRegExp = /test pattern/gi;
        const testDate = new Date('2025-01-01');
        const testMap = new Map([['key', 'value']]);
        const testSet = new Set([1, 2, 3]);

        const specialValues = {
          undefined: undefined,
          null: null,
          symbol: testSymbol,
          function: testFunction,
          regexp: testRegExp,
          date: testDate,
          map: testMap,
          set: testSet,
          bigint: BigInt(123456789),
        };

        // When: 特殊値をログ出力
        expect(() => logger.info('Special values test', specialValues)).not.toThrow();

        // Then: 正常に処理される
        expect(mockLogger.getTotalMessageCount()).toBe(1);
        const message = mockLogger.getLastMessage(AG_LOGLEVEL.DEFAULT);
        expect(message).toMatchObject({
          message: 'Special values test',
          args: [expect.any(Object)],
        });
      });
    });
  });
});
