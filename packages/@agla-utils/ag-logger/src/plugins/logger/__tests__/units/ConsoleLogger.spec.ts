// src/plugins/logger/__tests__/ConsoleLogger.spec.ts
// @(#) : Unit tests for ConsoleLogger plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ログレベル定数 - テストで使用するログレベル定義
import { AG_LOGLEVEL } from '../../../../../shared/types';

// テスト対象 - コンソール出力ロガープラグインの実装
import { ConsoleLogger, ConsoleLoggerMap } from '../../../../plugins/logger/ConsoleLogger';

// mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

/**
 * ConsoleLoggerプラグインの包括的ユニットテストスイート
 *
 * @description ConsoleLoggerの全機能を効率的に検証
 * デフォルトロガー、レベル別マッピング、エラー処理を包括的にテスト
 *
 * @testType Unit Test
 * @testTarget ConsoleLogger Plugin
 * @coverage
 * - 正常系: 基本動作、レベルマッピング
 * - 異常系: エラー処理
 * - エッジケース: 境界値、特殊入力
 */
describe('ConsoleLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  /**
   * 正常系テスト: 基本機能
   *
   * @description ConsoleLoggerの基本機能が正常に動作することを検証
   */
  describe('正常系: Basic Functionality', () => {
    /**
     * デフォルトConsoleLogger関数のテスト
     *
     * @description console.logへの引数委譲を検証
     */
    describe('Default ConsoleLogger Function', () => {
      beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
      });

      it('should delegate to console.log correctly', () => {
        const testCases = [
          'test message',
          '',
          'single message',
          'multiple word message',
        ];

        testCases.forEach((message) => {
          ConsoleLogger(message);
          expect(console.log).toHaveBeenCalledWith(message);
        });

        expect(console.log).toHaveBeenCalledTimes(testCases.length);
      });
    });

    /**
     * ConsoleLoggerMapのテスト
     *
     * @description ログレベルとconsoleメソッドのマッピングを検証
     */
    describe('ConsoleLoggerMap', () => {
      it('should map log levels to correct console methods', () => {
        const testCases = [
          { level: AG_LOGLEVEL.OFF, expectFunction: true }, // NullLogger
          { level: AG_LOGLEVEL.FATAL, method: 'error' },
          { level: AG_LOGLEVEL.ERROR, method: 'error' },
          { level: AG_LOGLEVEL.WARN, method: 'warn' },
          { level: AG_LOGLEVEL.INFO, method: 'info' },
          { level: AG_LOGLEVEL.DEBUG, method: 'debug' },
          { level: AG_LOGLEVEL.TRACE, method: 'debug' },
        ];

        testCases.forEach(({ level, method }) => {
          const logFunction = ConsoleLoggerMap[level];
          expect(logFunction).toBeDefined();
          expect(typeof logFunction).toBe('function');

          if (method) {
            logFunction!(`test ${method} message`);
            expect(mockConsole[method as keyof typeof mockConsole]).toHaveBeenCalledTimes(1);
            vi.clearAllMocks();
          }
        });
      });

      it('should handle formatted messages correctly', () => {
        const testMessage = 'formatted log message';
        const infoLogger = ConsoleLoggerMap[AG_LOGLEVEL.INFO];

        infoLogger!(testMessage);
        expect(mockConsole.info).toHaveBeenCalledWith(testMessage);
      });
    });
  });

  /**
   * 異常系テスト: エラー処理
   *
   * @description エラー状況での動作を検証
   */
  describe('異常系: Error Handling', () => {
    it('should handle console method throwing errors', () => {
      const throwingConsole = vi.spyOn(console, 'error').mockImplementation(() => {
        throw new Error('Console error');
      });

      const errorLogger = ConsoleLoggerMap[AG_LOGLEVEL.ERROR];
      expect(() => errorLogger!('test')).toThrow('Console error');

      throwingConsole.mockRestore();
    });
  });

  /**
   * エッジケース: 境界値と特殊条件
   *
   * @description 境界値や特殊な入力での動作を検証
   */
  describe('エッジケース: Edge Cases', () => {
    it('should handle undefined and null messages', () => {
      vi.spyOn(console, 'log').mockImplementation(() => {});

      ConsoleLogger(undefined as unknown as string);
      ConsoleLogger(null as unknown as string);

      expect(console.log).toHaveBeenCalledWith(undefined);
      expect(console.log).toHaveBeenCalledWith(null);
    });

    it('should handle very long messages', () => {
      vi.spyOn(console, 'info').mockImplementation(() => {});

      const longMessage = 'a'.repeat(10000);
      const infoLogger = ConsoleLoggerMap[AG_LOGLEVEL.INFO];

      infoLogger!(longMessage);
      expect(console.info).toHaveBeenCalledWith(longMessage);
    });

    it('should handle special characters in messages', () => {
      vi.spyOn(console, 'log').mockImplementation(() => {});

      const specialMessage = '\n\t\r\\"\'';
      ConsoleLogger(specialMessage);

      expect(console.log).toHaveBeenCalledWith(specialMessage);
    });
  });
});
