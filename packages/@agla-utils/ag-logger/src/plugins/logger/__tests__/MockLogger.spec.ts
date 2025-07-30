// src/plugins/logger/__tests__/MockLogger.spec.ts
// @(#) : Unit tests for MockLogger plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest imports
import { beforeEach, describe, expect, it } from 'vitest';

// import test target
import { AG_LOGLEVEL } from '../../../../shared/types';
import type { AG_LABEL_TO_LOGLEVEL_MAP, AgLogLevel } from '../../../../shared/types';
import { MockLogger } from '../MockLogger';

// Type definitions derived from log level constants
type TLogLevelLabels = keyof typeof AG_LABEL_TO_LOGLEVEL_MAP;
type TMockLoggerMethods = Lowercase<Exclude<TLogLevelLabels, 'OFF'>>;

/**
 * MockLoggerプラグインの包括的ユニットテストスイート
 *
 * @description MockLoggerの全機能を効率的に検証
 * メッセージキャプチャ、クエリ機能、ユーティリティ、ロガー関数生成を包括的にテスト
 *
 * @testType Unit Test
 * @testTarget MockLogger Plugin
 * @coverage
 * - 正常系: 基本機能、メッセージ管理、クエリ機能
 * - 異常系: エラー処理、無効な入力
 * - エッジケース: 境界値、特殊条件、不変性
 */
describe('MockLogger', () => {
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = new MockLogger();
  });

  /**
   * 正常系テスト: 基本機能
   *
   * @description MockLoggerの基本機能が正常に動作することを検証
   */
  describe('正常系: Basic Functionality', () => {
    /**
     * ログメッセージキャプチャのテスト
     *
     * @description 各ログレベルでのメッセージキャプチャを検証
     */
    describe('Log Message Capture', () => {
      it('should capture messages for all log levels', () => {
        const testCases = [
          { level: AG_LOGLEVEL.VERBOSE, method: 'verbose', message: 'verbose message' },
          { level: AG_LOGLEVEL.FATAL, method: 'fatal', message: 'fatal error' },
          { level: AG_LOGLEVEL.ERROR, method: 'error', message: 'error message' },
          { level: AG_LOGLEVEL.WARN, method: 'warn', message: 'warning message' },
          { level: AG_LOGLEVEL.INFO, method: 'info', message: 'info message' },
          { level: AG_LOGLEVEL.DEBUG, method: 'debug', message: 'debug message' },
          { level: AG_LOGLEVEL.TRACE, method: 'trace', message: 'trace message' },
        ];

        testCases.forEach(({ level, method, message }) => {
          (mockLogger[method as TMockLoggerMethods] as (msg: string) => void)(message);
          expect(mockLogger.getMessages(level)).toEqual([message]);
          mockLogger.clearMessages(level);
        });
      });

      it('should handle multiple messages per level', () => {
        mockLogger.error('first error');
        mockLogger.error('second error');
        mockLogger.info('info message');

        expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['first error', 'second error']);
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info message']);
      });

      describe('VERBOSE level support', () => {
        it('should support verbose() method for VERBOSE level logging', () => {
          const verboseMessage = 'verbose debug info';

          mockLogger.verbose(verboseMessage);

          expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toEqual([verboseMessage]);
          expect(mockLogger.getLastMessage(AG_LOGLEVEL.VERBOSE)).toBe(verboseMessage);
          expect(mockLogger.hasMessages(AG_LOGLEVEL.VERBOSE)).toBe(true);
        });

        it('should handle VERBOSE level with special value -99', () => {
          expect(AG_LOGLEVEL.VERBOSE).toBe(-99);

          const verboseMsg = 'test verbose';
          mockLogger.verbose(verboseMsg);

          expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toContain(verboseMsg);
        });

        it('should store VERBOSE messages independently from other levels', () => {
          mockLogger.verbose('verbose msg 1');
          mockLogger.debug('debug msg');
          mockLogger.verbose('verbose msg 2');

          expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toEqual(['verbose msg 1', 'verbose msg 2']);
          expect(mockLogger.getMessages(AG_LOGLEVEL.DEBUG)).toEqual(['debug msg']);
          expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(2);
        });
      });
    });

    /**
     * クエリ機能のテスト
     *
     * @description メッセージの取得・検索機能を検証
     */
    describe('Query Functions', () => {
      beforeEach(() => {
        mockLogger.error('error1');
        mockLogger.error('error2');
        mockLogger.info('info1');
        mockLogger.warn('warn1');
      });

      it('should provide comprehensive query capabilities', () => {
        // 特定レベルのメッセージ取得
        expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error1', 'error2']);
        expect(mockLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBe('error2');
        expect(mockLogger.getLastMessage(AG_LOGLEVEL.DEBUG)).toBeNull();

        // メッセージ数の確認
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.ERROR)).toBe(2);
        expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(1);
        expect(mockLogger.getTotalMessageCount()).toBe(4);

        // メッセージ存在確認
        expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(true);
        expect(mockLogger.hasMessages(AG_LOGLEVEL.DEBUG)).toBe(false);
        expect(mockLogger.hasAnyMessages()).toBe(true);
      });

      it('should provide complete message overview', () => {
        const allMessages = mockLogger.getAllMessages();
        expect(allMessages.ERROR).toEqual(['error1', 'error2']);
        expect(allMessages.INFO).toEqual(['info1']);
        expect(allMessages.WARN).toEqual(['warn1']);
        expect(allMessages.DEBUG).toEqual([]);
      });

      describe('VERBOSE level in getAllMessages', () => {
        it('should include VERBOSE messages in getAllMessages output', () => {
          const cleanLogger = new MockLogger();
          cleanLogger.verbose('verbose test message');
          cleanLogger.error('error message');

          const allMessages = cleanLogger.getAllMessages();

          expect(allMessages.VERBOSE).toEqual(['verbose test message']);
          expect(allMessages.ERROR).toEqual(['error message']);
          expect(allMessages).toHaveProperty('VERBOSE');
        });

        it('should handle empty VERBOSE array in getAllMessages', () => {
          const allMessages = mockLogger.getAllMessages();

          expect(allMessages.VERBOSE).toEqual([]);
          expect(Array.isArray(allMessages.VERBOSE)).toBe(true);
        });
      });
    });

    /**
     * ユーティリティ機能のテスト
     *
     * @description メッセージクリア機能を検証
     */
    describe('Utility Functions', () => {
      beforeEach(() => {
        mockLogger.error('error message');
        mockLogger.info('info message');
        mockLogger.warn('warn message');
      });

      it('should clear messages selectively and completely', () => {
        // 特定レベルのクリア
        mockLogger.clearMessages(AG_LOGLEVEL.ERROR);
        expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual([]);
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info message']);

        // 全メッセージクリア
        mockLogger.clearAllMessages();
        expect(mockLogger.hasAnyMessages()).toBe(false);
        expect(mockLogger.getTotalMessageCount()).toBe(0);
      });

      it('should support legacy error-specific methods', () => {
        // 新しいmockLoggerインスタンスを使用してテストを分離
        const testLogger = new MockLogger();
        testLogger.error('legacy error');

        expect(testLogger.getErrorMessages()).toEqual(['legacy error']);
        expect(testLogger.getLastErrorMessage()).toBe('legacy error');

        testLogger.clearErrorMessages();
        expect(testLogger.getErrorMessages()).toEqual([]);
      });
    });

    /**
     * ロガー関数生成のテスト
     *
     * @description 動的ロガー関数生成機能を検証
     */
    describe('Logger Function Generation', () => {
      it('should create functional logger functions and maps', () => {
        // 単一ロガー関数
        const loggerFn = mockLogger.createLoggerFunction();
        loggerFn('test message');
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['test message']);

        mockLogger.clearAllMessages();

        // ロガーマップ
        const loggerMap = mockLogger.createLoggerMap();
        loggerMap[AG_LOGLEVEL.ERROR]('error via map');
        loggerMap[AG_LOGLEVEL.WARN]('warn via map');

        expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error via map']);
        expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['warn via map']);

        // OFFレベルは何もしない
        loggerMap[AG_LOGLEVEL.OFF]('should not log');
        expect(mockLogger.hasMessages(AG_LOGLEVEL.OFF)).toBe(false);

        // VERBOSEレベルのテスト
        loggerMap[AG_LOGLEVEL.VERBOSE]('verbose via map');
        expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toEqual(['verbose via map']);
      });

      describe('VERBOSE level validation', () => {
        it('should validate VERBOSE level (-99) as valid', () => {
          expect(() => mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).not.toThrow();
          expect(() => mockLogger.clearMessages(AG_LOGLEVEL.VERBOSE)).not.toThrow();
          expect(() => mockLogger.hasMessages(AG_LOGLEVEL.VERBOSE)).not.toThrow();
        });

        it('should include VERBOSE in createLoggerFunction validation', () => {
          expect(() => mockLogger.createLoggerFunction(AG_LOGLEVEL.VERBOSE)).not.toThrow();

          const verboseLogger = mockLogger.createLoggerFunction(AG_LOGLEVEL.VERBOSE);
          verboseLogger('verbose from function');

          expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toEqual(['verbose from function']);
        });
      });
    });
  });

  /**
   * 異常系テスト: エラー処理
   *
   * @description エラー状況での動作を検証
   */
  describe('異常系: Error Handling', () => {
    it('should handle invalid log levels with appropriate errors', () => {
      const invalidLevel = 999 as unknown as AgLogLevel;

      // 無効レベルでの操作は適切なエラーを投げるべき
      expect(() => mockLogger.getMessages(invalidLevel))
        .toThrow('Invalid log level: 999');
      expect(() => mockLogger.clearMessages(invalidLevel))
        .toThrow('Invalid log level: 999');
      expect(() => mockLogger.hasMessages(invalidLevel))
        .toThrow('Invalid log level: 999');
      expect(() => mockLogger.getMessageCount(invalidLevel))
        .toThrow('Invalid log level: 999');
      expect(() => mockLogger.getLastMessage(invalidLevel))
        .toThrow('Invalid log level: 999');
    });

    it('should handle null and undefined log levels', () => {
      expect(() => mockLogger.getMessages(null as unknown as AgLogLevel))
        .toThrow('Invalid log level: null');
      expect(() => mockLogger.getMessages(undefined as unknown as AgLogLevel))
        .toThrow('Invalid log level: undefined');
    });

    it('should handle empty state operations safely', () => {
      const emptyLogger = new MockLogger();

      expect(emptyLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBeNull();
      expect(emptyLogger.getTotalMessageCount()).toBe(0);
      expect(emptyLogger.hasAnyMessages()).toBe(false);
      expect(() => emptyLogger.clearAllMessages()).not.toThrow();
    });
  });

  /**
   * エッジケース: 境界値と特殊条件
   *
   * @description 境界値や特殊な入力での動作を検証
   */
  describe('エッジケース: Edge Cases', () => {
    it('should maintain data immutability', () => {
      mockLogger.error('original error');

      // 返された配列を変更しても内部状態は保護される
      const messages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
      messages.push('external modification');
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['original error']);

      // getAllMessagesでも同様
      const allMessages = mockLogger.getAllMessages();
      allMessages.ERROR.push('external modification');
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['original error']);
    });

    it('should handle special message types', () => {
      const specialCases = [
        '', // 空文字列
        ' '.repeat(1000), // 大量の空白
        'multi\nline\nmessage', // 改行を含む
        'unicode: 🚀 テスト 中文', // Unicode文字
        undefined, // undefined
        null, // null
        123, // 数値
        { object: 'value' }, // オブジェクト
        ['array', 'values'], // 配列
      ];

      specialCases.forEach((testCase, _index) => {
        mockLogger.info(testCase as string);
        const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
        expect(messages).toContain(testCase);
        mockLogger.clearMessages(AG_LOGLEVEL.INFO);
      });
    });

    it('should handle high volume logging efficiently', () => {
      const messageCount = 1000;

      // 大量のメッセージ追加
      for (let i = 0; i < messageCount; i++) {
        mockLogger.info(`message ${i}`);
      }

      expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(messageCount);
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.INFO)).toBe(`message ${messageCount - 1}`);

      // クリア操作も効率的に動作
      mockLogger.clearMessages(AG_LOGLEVEL.INFO);
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(0);
    });

    it('should handle concurrent operations safely', () => {
      // 複数の操作を連続実行
      mockLogger.error('error1');
      const count1 = mockLogger.getMessageCount(AG_LOGLEVEL.ERROR);
      mockLogger.info('info1');
      const hasError = mockLogger.hasMessages(AG_LOGLEVEL.ERROR);
      mockLogger.clearMessages(AG_LOGLEVEL.ERROR);
      const count2 = mockLogger.getMessageCount(AG_LOGLEVEL.ERROR);

      expect(count1).toBe(1);
      expect(hasError).toBe(true);
      expect(count2).toBe(0);
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
    });
  });
});
