// tests/integration/AgLogger.integration.spec.ts
// @(#) : AgLogger Integration Tests - Component interaction testing
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { describe, expect, it, vi } from 'vitest';

// ログレベル定数 - テストで使用するログレベル定義
import { AG_LOGLEVEL } from '../../shared/types';

// Type definitions for vitest mocks
type TVitestMock = ReturnType<typeof vi.fn>;
// テスト対象 - メインAgLoggerクラスとgetLogger関数
import { AgLogger, getLogger } from '@/AgLogger.class';
// テスト対象 - ロガー・フォーマッター管理クラス
import { AgLoggerManager } from '@/AgLoggerManager.class';
// フォーマッタープラグイン
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { NullFormatter } from '@/plugins/formatter/NullFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
// ロガープラグイン
import { ConsoleLogger } from '@/plugins/logger/ConsoleLogger';

// type definitions
type TCircularDependency = {
  name: string;
  data: string;
  // circular reference
  self?: TCircularDependency;
  ref?: TCircularDependency;
  // nested level
  level1?: TCircularDependency;
  level2?: TCircularDependency;
  level3?: TCircularDependency;
  // circular property
  circular?: TCircularDependency;
};

/**
 * AgLoggerコンポーネントの包括的統合テストスイート
 *
 * @description AgLoggerエコシステム全体の統合動作を機能・目的別にカテゴリー分けし、
 * 各カテゴリー内で正常系・異常系・エッジケースに分類して検証
 *
 * @testType Integration Test
 * @testTarget AgLogger + AgLoggerManager + Plugins
 * @structure
 * - 機能別カテゴリー
 *   - 正常系: 基本的な統合動作確認
 *   - 異常系: エラー処理、システム安定性、復旧機能
 *   - エッジケース: 複合設定、状態遷移、境界条件
 */
describe('AgLogger Integration Tests', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
  };

  /**
   * シングルトン統合管理機能
   *
   * @description シングルトンパターンによる統合システム管理のテスト
   */
  describe('Singleton Integration Management', () => {
    /**
     * 正常系: 基本的なシングルトン統合
     */
    describe('正常系: Basic Singleton Integration', () => {
      it('should maintain singleton consistency across all entry points', () => {
        setupTestContext();

        const logger1 = getLogger();
        const logger2 = AgLogger.getLogger();
        const logger3 = getLogger();

        expect(logger1).toBe(logger2);
        expect(logger2).toBe(logger3);
      });

      it('should share state and configuration across instances', () => {
        setupTestContext();

        const logger1 = getLogger();
        const logger2 = getLogger();

        // ログレベル設定の共有
        logger1.setLogLevel(AG_LOGLEVEL.DEBUG);
        expect(logger2.getLogLevel()).toBe(AG_LOGLEVEL.DEBUG);

        // verbose設定の共有
        logger1.setVerbose(true);
        expect(logger2.setVerbose()).toBe(true);

        // ロガーマネージャー設定の共有
        const mockLogger = vi.fn();
        const mockFormatter = vi.fn().mockReturnValue('shared format');

        logger1.setManager({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger2.setLogLevel(AG_LOGLEVEL.INFO);
        logger2.info('test message');

        expect(mockFormatter).toHaveBeenCalled();
        expect(mockLogger).toHaveBeenCalledWith('shared format');
      });
    });

    /**
     * 異常系: シングルトン統合エラー処理
     */
    describe('異常系: Singleton Integration Error Handling', () => {
      it('should maintain singleton integrity during errors', () => {
        setupTestContext();

        const logger1 = getLogger();

        // エラーを引き起こす設定
        const throwingFormatter = vi.fn(() => {
          throw new Error('Formatter error');
        });

        expect(() => logger1.setManager({ formatter: throwingFormatter })).not.toThrow();

        const logger2 = getLogger();
        // 同じインスタンスであることを確認
        expect(logger1).toBe(logger2);
      });
    });

    /**
     * エッジケース: 複雑なシングルトン統合パターン
     */
    describe('エッジケース: Complex Singleton Integration Patterns', () => {
      it('should handle rapid singleton access patterns', () => {
        setupTestContext();

        const loggers = Array.from({ length: 100 }, () => getLogger());

        // 全て同じインスタンスであることを確認
        loggers.forEach((logger) => {
          expect(logger).toBe(loggers[0]);
        });
      });
    });
  });

  /**
   * プラグイン統合機能
   *
   * @description フォーマッターとロガープラグインの統合動作のテスト
   */
  describe('Plugin Integration Functionality', () => {
    /**
     * 正常系: 基本的なプラグイン統合
     */
    describe('正常系: Basic Plugin Integration', () => {
      it('should integrate logger and formatter plugins correctly', () => {
        setupTestContext();

        const testCases = [
          {
            name: 'ConsoleLogger + JsonFormatter',
            logger: ConsoleLogger,
            formatter: JsonFormatter,
            setupSpy: () => vi.spyOn(console, 'info').mockImplementation(() => {}),
            verify: (spy: TVitestMock) => {
              const [output] = spy.mock.calls[0];
              expect(() => JSON.parse(output)).not.toThrow();
              const parsed = JSON.parse(output);
              expect(parsed).toMatchObject({
                level: 'INFO',
                message: 'test message',
                args: [{ data: 'test' }],
              });
            },
          },
          {
            name: 'MockLogger + PlainFormatter',
            logger: vi.fn(),
            formatter: PlainFormatter,
            setupSpy: () => null,
            verify: (spy: TVitestMock | null, logger: TVitestMock) => {
              expect(logger).toHaveBeenCalledTimes(1);
              const [output] = logger.mock.calls[0];
              expect(output).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] test message/);
            },
          },
        ];

        testCases.forEach(({ logger, formatter, setupSpy, verify }) => {
          const spy = setupSpy();
          const testLogger = getLogger({ defaultLogger: logger, formatter: formatter });
          testLogger.setLogLevel(AG_LOGLEVEL.INFO);
          testLogger.info('test message', { data: 'test' });

          verify(spy as TVitestMock, logger as TVitestMock);
          spy?.mockRestore();
          setupTestContext();
        });
      });

      it('should handle special plugin combinations', () => {
        setupTestContext();

        // NullFormatter + 任意のロガー = 出力なし
        const mockLogger = vi.fn();
        const logger = getLogger({ defaultLogger: mockLogger, formatter: NullFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);
        logger.info('test message');

        expect(mockLogger).not.toHaveBeenCalled();
      });
    });

    /**
     * 異常系: プラグイン統合エラー処理
     */
    describe('異常系: Plugin Integration Error Handling', () => {
      it('should handle plugin errors gracefully', () => {
        setupTestContext();

        // ロガーエラー
        const throwingLogger = vi.fn().mockImplementation(() => {
          throw new Error('Logger error');
        });

        const logger = getLogger({ defaultLogger: throwingLogger, formatter: PlainFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        expect(() => logger.info('test')).toThrow('Logger error');

        // システム復旧
        const workingLogger = vi.fn();
        logger.setManager({ defaultLogger: workingLogger });

        expect(() => logger.info('recovery test')).not.toThrow();
        expect(workingLogger).toHaveBeenCalled();
      });

      it('should handle formatter errors gracefully', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const throwingFormatter = vi.fn().mockImplementation(() => {
          throw new Error('Formatter error');
        });

        const logger = getLogger({ defaultLogger: mockLogger, formatter: throwingFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        expect(() => logger.info('test')).toThrow('Formatter error');
      });
    });

    /**
     * エッジケース: 特殊プラグイン統合パターン
     */
    describe('エッジケース: Special Plugin Integration Patterns', () => {
      it('should handle mixed error scenarios', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const errorLogger = vi.fn().mockImplementation(() => {
          throw new Error('Error logger failed');
        });

        const logger = getLogger({
          defaultLogger: mockLogger,
          formatter: PlainFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger,
          },
        });

        logger.setLogLevel(AG_LOGLEVEL.DEBUG);

        // エラーレベルは失敗、他は成功
        expect(() => logger.error('error')).toThrow('Error logger failed');
        expect(() => logger.info('info')).not.toThrow();
        expect(mockLogger).toHaveBeenCalledTimes(1);
      });
    });
  });

  /**
   * 複合設定統合機能
   *
   * @description 複雑な設定組み合わせの統合動作のテスト
   */
  describe('Complex Configuration Integration', () => {
    /**
     * 正常系: 基本的な複合設定統合
     */
    describe('正常系: Basic Complex Configuration Integration', () => {
      it('should handle partial logger maps with mixed configurations', () => {
        setupTestContext();

        const errorLogger = vi.fn();
        const warnLogger = vi.fn();
        const defaultLogger = vi.fn();

        const logger = getLogger({
          defaultLogger: defaultLogger,
          formatter: PlainFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger,
            [AG_LOGLEVEL.WARN]: warnLogger,
          },
        });

        logger.setLogLevel(AG_LOGLEVEL.DEBUG);

        // 各レベルでのロガー使い分けを確認
        logger.error('error message'); // errorLogger使用
        logger.warn('warn message'); // warnLogger使用
        logger.info('info message'); // defaultLogger使用
        logger.debug('debug message'); // defaultLogger使用

        expect(errorLogger).toHaveBeenCalledTimes(1);
        expect(warnLogger).toHaveBeenCalledTimes(1);
        expect(defaultLogger).toHaveBeenCalledTimes(2);
      });

      it('should maintain configuration through multiple updates', () => {
        setupTestContext();

        const logger = getLogger();
        const finalLogger = vi.fn();
        const finalFormatter = vi.fn().mockReturnValue('final format');

        // 段階的な設定更新
        logger.setManager({ defaultLogger: vi.fn() });
        logger.setManager({ loggerMap: { [AG_LOGLEVEL.ERROR]: vi.fn() } });
        logger.setManager({ formatter: finalFormatter });
        logger.setManager({ defaultLogger: finalLogger });

        logger.setLogLevel(AG_LOGLEVEL.INFO);
        logger.info('test message');

        expect(finalFormatter).toHaveBeenCalled();
        expect(finalLogger).toHaveBeenCalledWith('final format');
      });
    });

    /**
     * 異常系: 複合設定エラー処理
     */
    describe('異常系: Complex Configuration Error Handling', () => {
      it('should handle configuration conflicts gracefully', () => {
        setupTestContext();

        const logger = getLogger();
        const conflictingFormatter1 = vi.fn().mockReturnValue('format1');
        const conflictingFormatter2 = vi.fn(() => {
          throw new Error('Formatter conflict');
        });

        // 最初の設定は成功
        logger.setManager({ formatter: conflictingFormatter1 });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        expect(() => logger.info('test1')).not.toThrow();

        // 競合する設定でエラー
        logger.setManager({ formatter: conflictingFormatter2 });

        expect(() => logger.info('test2')).toThrow('Formatter conflict');
      });
    });

    /**
     * エッジケース: 複雑な設定統合パターン
     */
    describe('エッジケース: Complex Configuration Integration Patterns', () => {
      it('should handle rapid configuration changes during logging', () => {
        setupTestContext();

        const mockLogger1 = vi.fn();
        const mockLogger2 = vi.fn();
        const mockFormatter1 = vi.fn().mockReturnValue('format1');
        const mockFormatter2 = vi.fn().mockReturnValue('format2');

        const logger = getLogger({ defaultLogger: mockLogger1, formatter: mockFormatter1 });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        // ログ出力と設定変更を交互に実行
        for (let i = 0; i < 100; i++) {
          logger.info(`Rapid config test ${i}`);

          if (i % 10 === 0) {
            // 10回ごとに設定変更
            const useFirst = i % 20 === 0;
            logger.setManager({
              defaultLogger: useFirst ? mockLogger1 : mockLogger2,
              formatter: useFirst ? mockFormatter1 : mockFormatter2,
            });
          }
        }

        // 両方のロガーが使用されたことを確認
        expect(mockLogger1.mock.calls.length + mockLogger2.mock.calls.length).toBe(100);
        expect(mockFormatter1.mock.calls.length + mockFormatter2.mock.calls.length).toBe(100);
      });
    });
  });

  /**
   * ログレベルフィルタリング統合機能
   *
   * @description 全コンポーネントでのフィルタリング一貫性のテスト
   */
  describe('Log Level Filtering Integration', () => {
    /**
     * 正常系: 基本的なフィルタリング統合
     */
    describe('正常系: Basic Filtering Integration', () => {
      it('should apply filtering consistently across all components', () => {
        setupTestContext();

        const loggers = {
          [AG_LOGLEVEL.ERROR]: vi.fn(),
          [AG_LOGLEVEL.WARN]: vi.fn(),
          [AG_LOGLEVEL.INFO]: vi.fn(),
          [AG_LOGLEVEL.DEBUG]: vi.fn(),
        };

        const logger = getLogger({
          defaultLogger: loggers[AG_LOGLEVEL.INFO],
          formatter: JsonFormatter,
          loggerMap: loggers,
        });
        logger.setLogLevel(AG_LOGLEVEL.WARN);

        // フィルタリングテスト
        logger.error('error'); // 出力される
        logger.warn('warn'); // 出力される
        logger.info('info'); // フィルタリングされる
        logger.debug('debug'); // フィルタリングされる

        expect(loggers[AG_LOGLEVEL.ERROR]).toHaveBeenCalledTimes(1);
        expect(loggers[AG_LOGLEVEL.WARN]).toHaveBeenCalledTimes(1);
        expect(loggers[AG_LOGLEVEL.INFO]).not.toHaveBeenCalled();
        expect(loggers[AG_LOGLEVEL.DEBUG]).not.toHaveBeenCalled();
      });

      it('should handle OFF level across all components', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const mockFormatter = vi.fn();

        const logger = getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.OFF);

        // 全レベルでフィルタリング
        Object.values(AG_LOGLEVEL).forEach((level) => {
          if (typeof level === 'number') {
            logger.setLogLevel(level);
            logger.setLogLevel(AG_LOGLEVEL.OFF);
            logger.info('test');
          }
        });

        expect(mockLogger).not.toHaveBeenCalled();
        expect(mockFormatter).not.toHaveBeenCalled();
      });
    });

    /**
     * 異常系: フィルタリングエラー処理
     */
    describe('異常系: Filtering Error Handling', () => {
      it('should maintain filtering integrity during formatter errors', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const throwingFormatter = vi.fn(() => {
          throw new Error('Formatter error');
        });

        const logger = getLogger({ defaultLogger: mockLogger, formatter: throwingFormatter });
        logger.setLogLevel(AG_LOGLEVEL.WARN);

        // エラーが発生してもフィルタリングは機能する
        expect(() => logger.error('should process')).toThrow('Formatter error');
        expect(() => logger.debug('should be filtered')).not.toThrow(); // フィルタリングされるのでformatterは呼ばれない

        expect(throwingFormatter).toHaveBeenCalledTimes(1); // errorのみ
      });
    });

    /**
     * エッジケース: 動的フィルタリングパターン
     */
    describe('エッジケース: Dynamic Filtering Patterns', () => {
      it('should handle dynamic level changes during logging', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const logger = getLogger({ defaultLogger: mockLogger, formatter: PlainFormatter });

        const levels = [AG_LOGLEVEL.ERROR, AG_LOGLEVEL.WARN, AG_LOGLEVEL.INFO, AG_LOGLEVEL.DEBUG];

        levels.forEach((level, index) => {
          logger.setLogLevel(level);

          // 各レベルで複数ログを出力
          logger.error(`error ${index}`);
          logger.warn(`warn ${index}`);
          logger.info(`info ${index}`);
          logger.debug(`debug ${index}`);
        });

        // 期待される呼び出し回数: ERROR(4) + WARN(3) + INFO(2) + DEBUG(1) = 10
        expect(mockLogger).toHaveBeenCalledTimes(10);
      });
    });
  });

  /**
   * Verbose機能統合
   *
   * @description verbose機能の統合動作のテスト
   */
  describe('Verbose Functionality Integration', () => {
    /**
     * 正常系: 基本的なverbose統合
     */
    describe('正常系: Basic Verbose Integration', () => {
      it('should integrate verbose mode with full logging pipeline', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const mockFormatter = vi.fn().mockReturnValue('verbose formatted');

        const logger = getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        // verbose無効時
        logger.verbose('verbose off');
        expect(mockLogger).not.toHaveBeenCalled();

        // verbose有効時
        logger.setVerbose(true);
        logger.verbose('verbose on');

        expect(mockFormatter).toHaveBeenCalled();
        expect(mockLogger).toHaveBeenCalledWith('verbose formatted');
      });

      it('should maintain verbose state across instances and reconfigurations', () => {
        setupTestContext();

        const logger1 = getLogger();
        logger1.setVerbose(true);

        const logger2 = getLogger();
        expect(logger2.setVerbose()).toBe(true);

        // 設定変更後もverbose状態を維持
        logger2.setManager({ defaultLogger: vi.fn() });
        expect(logger1.setVerbose()).toBe(true);
      });
    });

    /**
     * 異常系: verbose統合エラー処理
     */
    describe('異常系: Verbose Integration Error Handling', () => {
      it('should handle verbose with failing formatter', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const throwingFormatter = vi.fn(() => {
          throw new Error('Verbose formatter error');
        });

        const logger = getLogger({ defaultLogger: mockLogger, formatter: throwingFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);
        logger.setVerbose(true);

        expect(() => logger.verbose('test')).toThrow('Verbose formatter error');
      });
    });

    /**
     * エッジケース: verbose特殊統合パターン
     */
    describe('エッジケース: Verbose Special Integration Patterns', () => {
      it('should handle rapid verbose state changes', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const logger = getLogger({ defaultLogger: mockLogger, formatter: PlainFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        for (let i = 0; i < 100; i++) {
          logger.setVerbose(i % 2 === 0);
          logger.verbose(`verbose ${i}`);
        }

        expect(mockLogger).toHaveBeenCalledTimes(50); // verbose がtrueの時のみ
      });
    });
  });

  /**
   * 特殊データ処理統合機能
   *
   * @description 循環参照オブジェクトなど特殊データの統合処理のテスト
   */
  describe('Special Data Processing Integration', () => {
    /**
     * 正常系: 基本的な特殊データ処理
     */
    describe('正常系: Basic Special Data Processing', () => {
      it('should handle circular references with graceful degradation', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const mockFormatter = vi.fn().mockImplementation((logMessage) => {
          // フォーマッターで循環参照を処理するシナリオ
          try {
            return JSON.stringify(logMessage);
          } catch (error) {
            return `[Circular Reference Error: ${error instanceof Error ? error.message : String(error)}]`;
          }
        });

        const logger = getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        // 循環参照オブジェクトを作成
        const circularObj: Record<string, unknown> = { name: 'test' };
        circularObj.self = circularObj;

        // システムがクラッシュしないことを確認
        expect(() => logger.info('Circular test', circularObj)).not.toThrow();
        expect(mockLogger).toHaveBeenCalledTimes(1);
        expect(mockFormatter).toHaveBeenCalledTimes(1);
      });

      it('should provide meaningful error messages for circular references', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        let capturedError: string | null = null;

        const errorHandlingFormatter = vi.fn().mockImplementation((logMessage) => {
          try {
            return JSON.stringify(logMessage);
          } catch (error) {
            capturedError = error instanceof Error ? error.message : String(error);
            return `[Circular Reference: ${logMessage.level ?? 'UNKNOWN'}] ${logMessage.message ?? 'No message'}`;
          }
        });

        const logger = getLogger({ defaultLogger: mockLogger, formatter: errorHandlingFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        const circularObj: Record<string, unknown> = { data: 'test' };
        circularObj.circular = circularObj;

        logger.info('Testing circular reference handling', circularObj);

        expect(capturedError).toBeTruthy();
        expect(capturedError).toContain('circular');
        expect(mockLogger).toHaveBeenCalledTimes(1);
        const [logOutput] = mockLogger.mock.calls[0];
        expect(logOutput).toContain('[Circular Reference:');
        expect(logOutput).toContain('Testing circular reference handling');
      });
    });

    /**
     * 異常系: 特殊データ処理エラー処理
     */
    describe('異常系: Special Data Processing Error Handling', () => {
      it('should maintain logger functionality after circular reference errors', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const resilientFormatter = vi.fn().mockImplementation((logMessage) => {
          try {
            // 意図的に循環参照でJSON.stringifyを失敗させる
            const result = JSON.stringify(logMessage);
            return result;
          } catch {
            // フォールバック処理
            return `${logMessage.timestamp ?? new Date().toISOString()} [${logMessage.level ?? 'UNKNOWN'}] ${
              logMessage.message ?? ''
            }`;
          }
        });

        const logger = getLogger({ defaultLogger: mockLogger, formatter: resilientFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        const circularObj: Record<string, unknown> = { name: 'circular' };
        circularObj.ref = circularObj;

        // 循環参照エラー後も機能することを確認
        logger.info('First log with circular reference', circularObj);
        logger.info('Second normal log', { normal: 'data' });
        logger.warn('Third log after error');

        expect(mockLogger).toHaveBeenCalledTimes(3);
        expect(resilientFormatter).toHaveBeenCalledTimes(3);

        // 最初のログはフォールバックフォーマットであることを確認
        const [firstLog] = mockLogger.mock.calls[0];
        expect(firstLog).toContain('First log with circular reference');

        // 2番目と３番目のログが正常処理されることを確認
        expect(mockLogger.mock.calls[1]).toBeDefined();
        expect(mockLogger.mock.calls[2]).toBeDefined();
      });
    });

    /**
     * エッジケース: 複雑な特殊データ処理パターン
     */
    describe('エッジケース: Complex Special Data Processing Patterns', () => {
      it('should handle nested circular references correctly', () => {
        setupTestContext();

        const mockLogger = vi.fn();
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

        const logger = getLogger({ defaultLogger: mockLogger, formatter: safeFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        // 深いネストの循環参照オブジェクト
        const deepCircular: TCircularDependency = {
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
        expect(mockLogger).toHaveBeenCalledTimes(1);

        const [logOutput] = mockLogger.mock.calls[0];
        expect(logOutput).toContain('Deep circular reference test');
        expect(logOutput).toContain('[Circular]');
      });

      it('should handle circular references in different argument positions', () => {
        setupTestContext();

        const mockLogger = vi.fn();
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

        const logger = getLogger({ defaultLogger: mockLogger, formatter: circularSafeFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        const circular1: Record<string, unknown> = { id: 1 };
        const circular2: Record<string, unknown> = { id: 2 };
        circular1.ref = circular2;
        circular2.ref = circular1;

        // 異なる位置の循環参照をテスト
        expect(() => logger.info(circular1, 'middle message', circular2)).not.toThrow();
        expect(() => logger.info('First', circular1, 'Second', circular2, 'Third')).not.toThrow();

        expect(mockLogger).toHaveBeenCalledTimes(2);
        expect(circularSafeFormatter).toHaveBeenCalledTimes(2);
      });
    });
  });

  /**
   * パフォーマンス統合機能
   *
   * @description 高負荷時の統合システム動作のテスト
   */
  describe('Performance Integration', () => {
    /**
     * 正常系: 基本的なパフォーマンス統合
     */
    describe('正常系: Basic Performance Integration', () => {
      it('should handle high-frequency logging without memory leaks', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const logger = getLogger({ defaultLogger: mockLogger, formatter: PlainFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        const startMemory = process.memoryUsage().heapUsed;
        const logCount = 10000;

        // 大量ログ出力
        for (let i = 0; i < logCount; i++) {
          logger.info(`High frequency log ${i}`, { iteration: i, data: 'test'.repeat(10) });
        }

        expect(mockLogger).toHaveBeenCalledTimes(logCount);

        // メモリ使用量の確認（簡易チェック）
        const endMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = endMemory - startMemory;

        // メモリ増加が過度でないことを確認（10MB以下）
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      });

      it('should maintain consistent performance under load', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const logger = getLogger({ defaultLogger: mockLogger, formatter: JsonFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        const batchSize = 1000;
        const batchCount = 5;
        const performanceMeasurements: number[] = [];

        // 複数バッチでパフォーマンス測定
        for (let batch = 0; batch < batchCount; batch++) {
          const startTime = Date.now();

          for (let i = 0; i < batchSize; i++) {
            logger.info(`Batch ${batch} Log ${i}`, {
              batch,
              iteration: i,
              timestamp: Date.now(),
              data: { nested: { value: i * batch } },
            });
          }

          const endTime = Date.now();
          performanceMeasurements.push(endTime - startTime);
        }

        expect(mockLogger).toHaveBeenCalledTimes(batchSize * batchCount);

        // パフォーマンスの一貫性を確認（最初と最後のバッチの差が2倍以内）
        const firstBatchTime = performanceMeasurements[0];
        const lastBatchTime = performanceMeasurements[performanceMeasurements.length - 1];

        expect(lastBatchTime).toBeLessThan(firstBatchTime * 2);
      });
    });

    /**
     * 異常系: パフォーマンス統合エラー処理
     */
    describe('異常系: Performance Integration Error Handling', () => {
      it('should maintain performance during error conditions', () => {
        setupTestContext();

        const errorLogger = vi.fn(() => {
          throw new Error('Intermittent error');
        });
        const normalLogger = vi.fn();

        const logger = getLogger({
          defaultLogger: normalLogger,
          formatter: PlainFormatter,
          loggerMap: {
            [AG_LOGLEVEL.ERROR]: errorLogger,
          },
        });

        logger.setLogLevel(AG_LOGLEVEL.DEBUG);

        const startTime = Date.now();

        // エラーが発生する条件下でのパフォーマンステスト
        for (let i = 0; i < 1000; i++) {
          try {
            if (i % 10 === 0) {
              logger.error(`Error log ${i}`); // エラーが発生
            } else {
              logger.info(`Normal log ${i}`); // 正常処理
            }
          } catch {
            // エラーは無視して続行
          }
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // エラーがあってもパフォーマンスが著しく劣化しないことを確認
        expect(totalTime).toBeLessThan(1000); // 1秒以内
        expect(normalLogger).toHaveBeenCalledTimes(900); // エラー以外の呼び出し
      });
    });

    /**
     * エッジケース: 特殊パフォーマンス統合パターン
     */
    describe('エッジケース: Special Performance Integration Patterns', () => {
      it('should handle concurrent logging from multiple sources', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const logger = getLogger({ defaultLogger: mockLogger, formatter: PlainFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        const concurrentSources = 10;
        const logsPerSource = 100;

        // 複数ソースからの同時ログ出力をシミュレート
        const promises = Array.from({ length: concurrentSources }, (_, sourceId) =>
          Promise.resolve().then(() => {
            for (let i = 0; i < logsPerSource; i++) {
              logger.info(`Source ${sourceId} Log ${i}`, {
                sourceId,
                logId: i,
                timestamp: Date.now(),
              });
            }
          }));

        return Promise.all(promises).then(() => {
          expect(mockLogger).toHaveBeenCalledTimes(concurrentSources * logsPerSource);

          // 全てのログが適切にフォーマットされていることを確認
          mockLogger.mock.calls.forEach(([logOutput]) => {
            expect(logOutput).toMatch(/Source \d+ Log \d+/);
          });
        });
      });

      it('should handle stress test with mixed log levels and complex data', () => {
        setupTestContext();

        const mockLogger = vi.fn();
        const logger = getLogger({ defaultLogger: mockLogger, formatter: JsonFormatter });
        logger.setLogLevel(AG_LOGLEVEL.TRACE);

        const logMethods = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
        const complexData = {
          user: { id: 123, name: 'Test User', roles: ['admin', 'user'] },
          request: { method: 'POST', url: '/api/test', headers: { 'content-type': 'application/json' } },
          response: { status: 200, data: { success: true, items: Array(50).fill({ id: 1, name: 'item' }) } },
          metadata: { timestamp: Date.now(), version: '1.0.0', environment: 'test' },
        };

        const stressCount = 1000;
        const startTime = Date.now();

        for (let i = 0; i < stressCount; i++) {
          const method = logMethods[i % logMethods.length];
          const logData = { ...complexData, iteration: i, randomValue: Math.random() };

          (logger[method] as (msg: string, data?: unknown) => void)(
            `Stress test log ${i} - ${method}`,
            logData,
          );
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        expect(mockLogger).toHaveBeenCalledTimes(stressCount);
        // 1秒以内に完了することを確認（パフォーマンス要件）
        expect(totalTime).toBeLessThan(1000);

        // ランダムサンプリングでログ品質確認
        const sampleCalls = [0, Math.floor(stressCount / 2), stressCount - 1];
        sampleCalls.forEach((index) => {
          const [logOutput] = mockLogger.mock.calls[index];
          expect(() => JSON.parse(logOutput)).not.toThrow();
        });
      });
    });
  });
});
