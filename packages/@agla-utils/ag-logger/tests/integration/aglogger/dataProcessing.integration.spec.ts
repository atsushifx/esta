// tests/integration/AgLogger.dataProcessing.integration.spec.ts
// @(#) : AgLogger Data Processing Integration Tests - Special data handling scenarios
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// 共有型・定数: ログレベルとモック型
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import { AG_LOGLEVEL } from '@/shared/types';
import type { AgFormatFunction } from '@/shared/types';

// テスト対象: AgLoggerとマネージャ
import { AgLogger } from '@/AgLogger.class';
import { AgLoggerManager } from '@/AgLoggerManager.class';

// プラグイン（フォーマッター/ロガー）: モック実装
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';

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
 * テストモックを作成
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
 * AgLogger Data Processing Integration Tests
 *
 * @description 循環参照オブジェクトなど特殊データの統合処理テスト
 */
describe('AgLogger Data Processing Integration Tests', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  };

  /**
   * 特殊データ処理統合機能
   */
  describe('Special Data Processing Integration', () => {
    /**
     * 正常系: 基本的な特殊データ処理
     */
    describe('正常系: Basic Special Data Processing', () => {
      // 目的: 循環参照を含むデータでも安全に処理継続
      it('should handle circular references with graceful degradation', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: vi.fn().mockImplementation((logMessage) => {
            // フォーマッターで循環参照を処理するシナリオ
            try {
              return JSON.stringify(logMessage);
            } catch (error) {
              return `[Circular Reference Error: ${error instanceof Error ? error.message : String(error)}]`;
            }
          }),
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // 循環参照オブジェクトを作成
        const circularObj: TCircularTestObject = { name: 'test' };
        circularObj.self = circularObj;

        // システムがクラッシュしないことを確認
        expect(() => logger.info('Circular test', circularObj)).not.toThrow();
        expect(mockLogger.getTotalMessageCount()).toBe(1);
      });

      // 目的: 循環参照発生時に有益なエラーメッセージを提供
      it('should provide meaningful error messages for circular references', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        let capturedError: string | null = null;
        const errorHandlingFormatter = vi.fn().mockImplementation((logMessage) => {
          try {
            return JSON.stringify(logMessage);
          } catch (error) {
            capturedError = error instanceof Error ? error.message : String(error);
            return `[Circular Reference: ${logMessage.level ?? 'UNKNOWN'}] ${logMessage.message ?? 'No message'}`;
          }
        });

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: errorHandlingFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        const circularObj: TCircularTestObject = { name: 'test', data: 'test' };
        circularObj.circular = circularObj;

        logger.info('Testing circular reference handling', circularObj);

        expect(capturedError).toBeTruthy();
        expect(capturedError).toContain('circular');
        expect(mockLogger.getTotalMessageCount()).toBe(1);
        const messages = mockLogger.getMessages(AG_LOGLEVEL.DEFAULT);
        expect(messages[0]).toContain('Circular Reference:');
        expect(messages[0]).toContain('Testing circular reference handling');
      });
    });

    /**
     * 異常系: 特殊データ処理エラー処理
     */
    describe('異常系: Special Data Processing Error Handling', () => {
      // 目的: 循環参照エラー後もロガー機能を維持
      it('should maintain logger functionality after circular reference errors', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        const resilientFormatter = vi.fn().mockImplementation((logMessage) => {
          try {
            // first messageには循環参照オブジェクトが含まれるためエラーとなるはず
            const result = JSON.stringify(logMessage);
            return result;
          } catch {
            // フォールバック処理
            return `${logMessage.timestamp ?? new Date().toISOString()} [${logMessage.level ?? 'UNKNOWN'}] ${
              logMessage.message ?? ''
            }`;
          }
        });

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: resilientFormatter,
          loggerMap: mockLogger.defaultLoggerMap,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        const circularObj: TCircularTestObject = { name: 'circular' };
        circularObj.ref = circularObj;

        // 循環参照エラー後も機能することを確認
        logger.info('First log with circular reference', circularObj);
        logger.info('Second normal log', { normal: 'data' });
        logger.warn('Third log after error');

        // mockによる処理を
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(2);
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.WARN)).toBe(1);
        expect(mockLogger.getTotalMessageCount()).toBe(3);
        expect(resilientFormatter).toHaveBeenCalledTimes(3);

        // 最初のログはフォールバックフォーマットであることを確認
        const firstLog = mockLogger.getMessages(AG_LOGLEVEL.INFO)[0];
        expect(firstLog).toContain('First log with circular reference');

        // 2番目と3番目のログが正常処理されることを確認
        expect(mockLogger.getLastMessage(AG_LOGLEVEL.INFO)).toContain('Second normal log');
        expect(mockLogger.getLastMessage(AG_LOGLEVEL.WARN)).toContain('Third log after error');
      });
    });

    /**
     * エッジケース: 複雑な特殊データ処理パターン
     */
    describe('エッジケース: Complex Special Data Processing Patterns', () => {
      // 目的: 多段ネストの循環参照を安全に直列化/出力
      it('should handle nested circular references correctly', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        const safeFormatter = vi.fn().mockImplementation((logMessage) => {
          // 安全なフォーマッターの実装
          const safeStringify = (obj: unknown, depth = 0): string => {
            if (depth > 3) { return '[Max Depth Reached]'; }
            if (obj === null) { return 'null'; }
            if (typeof obj !== 'object') { return String(obj); }

            try {
              const seen = new WeakSet();
              return JSON.stringify(obj, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                  if (seen.has(value)) { return '[Circular]'; }
                  seen.add(value);
                }
                return value;
              });
            } catch {
              return '[Stringify Error]';
            }
          };

          return `${logMessage.timestamp} [${logMessage.level}] ${logMessage.message} ${
            safeStringify(logMessage.args)
          }`;
        });

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: safeFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // 深いネストの循環参照オブジェクト
        const deepCircular: TCircularTestObject = {
          name: 'deep',
          data: 'deep',
          level1: {
            name: 'level1',
            data: 'level1',
            level2: {
              name: 'level2',
              data: 'level2',
              level3: {
                name: 'level3',
                data: 'deep',
              },
            },
          },
        };
        deepCircular.level1!.level2!.level3!.circular = deepCircular;

        expect(() => logger.info('Deep circular reference test', deepCircular)).not.toThrow();
        expect(mockLogger.getTotalMessageCount()).toBe(1);

        const logOutput = mockLogger.getMessages(AG_LOGLEVEL.DEFAULT)[0];
        expect(logOutput).toContain('Deep circular reference test');
        expect(logOutput).toContain('[Circular]');
      });

      // 目的: 引数位置が異なる循環参照ケースにも耐性
      it('should handle circular references in different argument positions', (ctx) => {
        const { mockLogger } = createMock(ctx);
        setupTestContext();

        // 循環参照に対して強いフォーマッターを使用
        const circularSafeFormatter = vi.fn().mockImplementation((logMessage) => {
          try {
            // WeakSetを使用した安全なJSONシリアライゼーション
            const seen = new WeakSet();
            const safeObj = JSON.stringify(logMessage, (key, value) => {
              if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) { return '[Circular]'; }
                seen.add(value);
              }
              return value;
            });
            return safeObj;
          } catch {
            return `Safe fallback: ${logMessage.message ?? 'circular data'}`;
          }
        });

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: circularSafeFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        const circular1: TCircularTestObject = { id: 1, name: 'circular1' };
        const circular2: TCircularTestObject = { id: 2, name: 'circular2' };
        circular1.ref = circular2;
        circular2.ref = circular1;

        // 異なるオブジェクトによるの相互循環参照をテスト
        expect(() => logger.info(circular1, 'middle message', circular2)).not.toThrow();
        expect(() => logger.info('First', circular1, 'Second', circular2, 'Third')).not.toThrow();

        expect(mockLogger.getTotalMessageCount()).toBe(2);
        expect(circularSafeFormatter).toHaveBeenCalledTimes(2);
      });
    });
  });
});
