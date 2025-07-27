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
import { AgLogger, getLogger } from '../../src/AgLogger.class';
// テスト対象 - ロガー・フォーマッター管理クラス
import { AgLoggerManager } from '../../src/AgLoggerManager.class';
// フォーマッタープラグイン
import { JsonFormat } from '../../src/plugins/format/JsonFormat';
import { NullFormat } from '../../src/plugins/format/NullFormat';
import { PlainFormat } from '../../src/plugins/format/PlainFormat';
// ロガープラグイン
import { ConsoleLogger } from '../../src/plugins/logger/ConsoleLogger';

/**
 * AgLoggerコンポーネントの包括的統合テストスイート
 *
 * @description AgLoggerエコシステム全体の統合動作を検証
 * コンポーネント間連携、設定管理、プラグイン統合、エラー処理を包括的にテスト
 *
 * @testType Integration Test
 * @testTarget AgLogger + AgLoggerManager + Plugins
 * @coverage
 * - 正常系: 基本統合、プラグイン組み合わせ、設定管理
 * - 異常系: エラー処理、システム安定性、復旧機能
 * - エッジケース: 複合設定、状態遷移、境界条件
 */
describe('AgLogger Integration Tests', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
    AgLoggerManager.resetSingleton();
  };

  /**
   * 正常系テスト: 基本統合機能
   *
   * @description コンポーネント間の基本的な連携動作を検証
   */
  describe('正常系: Basic Integration', () => {
    /**
     * シングルトン統合のテスト
     *
     * @description シングルトンパターンの統合動作を検証
     */
    describe('Singleton Integration', () => {
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
     * プラグイン統合のテスト
     *
     * @description 各種プラグインの組み合わせ統合を検証
     */
    describe('Plugin Integration', () => {
      it('should integrate logger and formatter plugins correctly', () => {
        setupTestContext();

        const testCases = [
          {
            name: 'ConsoleLogger + JsonFormat',
            logger: ConsoleLogger,
            formatter: JsonFormat,
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
            name: 'MockLogger + PlainFormat',
            logger: vi.fn(),
            formatter: PlainFormat,
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

        // NullFormat + 任意のロガー = 出力なし
        const mockLogger = vi.fn();
        const logger = getLogger({ defaultLogger: mockLogger, formatter: NullFormat });
        logger.setLogLevel(AG_LOGLEVEL.INFO);
        logger.info('test message');

        expect(mockLogger).not.toHaveBeenCalled();
      });
    });

    /**
     * 複合設定統合のテスト
     *
     * @description 複雑な設定組み合わせの統合を検証
     */
    describe('Complex Configuration Integration', () => {
      it('should handle partial logger maps with mixed configurations', () => {
        setupTestContext();

        const errorLogger = vi.fn();
        const warnLogger = vi.fn();
        const defaultLogger = vi.fn();

        const logger = getLogger({
          defaultLogger: defaultLogger,
          formatter: PlainFormat,
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
  });

  /**
   * 正常系テスト: 高度な機能統合
   *
   * @description 高度な機能の統合動作を検証
   */
  describe('Advanced Feature Integration', () => {
    /**
     * ログレベルフィルタリング統合のテスト
     *
     * @description 全コンポーネントでのフィルタリング一貫性を検証
     */
    describe('Log Level Filtering Integration', () => {
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
          formatter: JsonFormat,
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
     * Verbose機能統合のテスト
     *
     * @description verbose機能の統合動作を検証
     */
    describe('Verbose Mode Integration', () => {
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
  });

  /**
   * 異常系テスト: エラー処理と復旧
   *
   * @description エラー状況でのシステム動作を検証
   */
  describe('異常系: Error Handling and Recovery', () => {
    it('should handle component errors gracefully', () => {
      setupTestContext();

      // ロガーエラー
      const throwingLogger = vi.fn().mockImplementation(() => {
        throw new Error('Logger error');
      });

      const logger = getLogger({ defaultLogger: throwingLogger, formatter: PlainFormat });
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

    it('should handle mixed error scenarios', () => {
      setupTestContext();

      const mockLogger = vi.fn();
      const errorLogger = vi.fn().mockImplementation(() => {
        throw new Error('Error logger failed');
      });

      const logger = getLogger({
        defaultLogger: mockLogger,
        formatter: PlainFormat,
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

  /**
   * エッジケース: 複雑な統合シナリオ
   *
   * @description 複雑で特殊な統合シナリオを検証
   */
  describe('エッジケース: Complex Integration Scenarios', () => {
    it('should handle rapid configuration changes', () => {
      setupTestContext();

      const loggers = [vi.fn(), vi.fn(), vi.fn()];
      const formatters = [vi.fn().mockReturnValue('fmt1'), vi.fn().mockReturnValue('fmt2')];

      const logger = getLogger();
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      // 高速な設定変更
      for (let i = 0; i < 100; i++) {
        logger.setManager({
          defaultLogger: loggers[i % loggers.length],
          formatter: formatters[i % formatters.length],
        });
      }

      // 最終状態での動作確認
      logger.info('final test');

      const finalLogger = loggers[99 % loggers.length];
      const finalFormatter = formatters[99 % formatters.length];

      expect(finalLogger).toHaveBeenCalled();
      expect(finalFormatter).toHaveBeenCalled();
    });

    it('should handle concurrent access patterns', () => {
      setupTestContext();

      const mockLogger = vi.fn();
      const logger = getLogger({ defaultLogger: mockLogger, formatter: PlainFormat });
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      // 同時実行パターンのシミュレーション
      const operations = [
        () => logger.info('concurrent info'),
        () => logger.setLogLevel(AG_LOGLEVEL.DEBUG),
        () => logger.debug('concurrent debug'),
        () => logger.setVerbose(true),
        () => logger.verbose('concurrent verbose'),
        () => logger.setManager({ defaultLogger: mockLogger }),
      ];

      // 全操作を実行
      operations.forEach((op) => op());

      expect(mockLogger).toHaveBeenCalledTimes(3); // info, debug, verbose
    });

    it('should maintain data integrity under stress', () => {
      setupTestContext();

      const mockLogger = vi.fn();
      const logger = getLogger({ defaultLogger: mockLogger, formatter: PlainFormat });
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      // 大量のログ出力
      for (let i = 0; i < 1000; i++) {
        logger.info(`stress test ${i}`);
      }

      expect(mockLogger).toHaveBeenCalledTimes(1000);

      // 状態の整合性確認
      expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.INFO);
      expect(logger.setVerbose()).toBe(false);
    });

    it('should handle undefined/null arguments across full pipeline', () => {
      setupTestContext();

      const mockLogger = vi.fn();
      const mockFormatter = vi.fn().mockReturnValue('formatted null/undefined');

      const logger = getLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      const testCases = [
        [undefined],
        [null],
        ['message', undefined, null],
        [null, undefined, 'mixed'],
        [],
      ];

      testCases.forEach((args) => {
        expect(() => logger.info(...(args as [string?, ...unknown[]]))).not.toThrow();
      });

      expect(mockLogger).toHaveBeenCalledTimes(testCases.length);
      expect(mockFormatter).toHaveBeenCalledTimes(testCases.length);
    });
  });
});
