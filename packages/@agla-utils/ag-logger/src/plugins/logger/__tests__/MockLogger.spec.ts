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
import type { AG_LABEL_TO_LOGLEVEL_MAP, AgLogLevel, AgLogMessage } from '../../../../shared/types';
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

      it('should capture verbose messages in VERBOSE level storage', () => {
        // Arrange
        const verboseMessage = 'verbose diagnostic message';

        // Act
        mockLogger.verbose(verboseMessage);

        // Assert
        expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toEqual([verboseMessage]);
      });

      it('should handle multiple messages per level', () => {
        mockLogger.error('first error');
        mockLogger.error('second error');
        mockLogger.info('info message');

        expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['first error', 'second error']);
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info message']);
      });

      it('should accept AgLogMessage objects as well as strings', () => {
        // Arrange
        const logMessage: AgLogMessage = {
          logLevel: AG_LOGLEVEL.INFO,
          timestamp: new Date('2023-12-01T10:30:00Z'),
          message: 'Structured log message',
          args: [{ userId: 123, action: 'login' }],
        };
        const stringMessage = 'Simple string message';

        // Act
        mockLogger.info(logMessage);
        mockLogger.info(stringMessage);

        // Assert
        const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
        expect(messages).toHaveLength(2);
        expect(messages[0]).toEqual(logMessage);
        expect(messages[1]).toEqual(stringMessage);
      });

      it('should accept AgLogMessage objects in all logger methods', () => {
        // Arrange
        const createLogMessage = (level: AgLogLevel, msg: string): AgLogMessage => ({
          logLevel: level,
          timestamp: new Date('2023-12-01T10:30:00Z'),
          message: msg,
          args: [],
        });

        // Act & Assert
        const testCases = [
          { method: 'fatal', level: AG_LOGLEVEL.FATAL },
          { method: 'error', level: AG_LOGLEVEL.ERROR },
          { method: 'warn', level: AG_LOGLEVEL.WARN },
          { method: 'info', level: AG_LOGLEVEL.INFO },
          { method: 'debug', level: AG_LOGLEVEL.DEBUG },
          { method: 'trace', level: AG_LOGLEVEL.TRACE },
          { method: 'verbose', level: AG_LOGLEVEL.VERBOSE }, // verbose stores in VERBOSE
        ];

        testCases.forEach(({ method, level }) => {
          const logMessage = createLogMessage(level, `${method} structured message`);
          (mockLogger[method as TMockLoggerMethods] as (msg: AgLogMessage) => void)(logMessage);
          expect(mockLogger.getMessages(level)).toContain(logMessage);
          mockLogger.clearMessages(level);
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

      it('should return verbose messages in VERBOSE key and trace messages in TRACE key separately', () => {
        // Arrange
        mockLogger.verbose('verbose message 1');
        mockLogger.verbose('verbose message 2');
        mockLogger.trace('trace message 1');

        // Act
        const allMessages = mockLogger.getAllMessages();

        // Assert
        expect(allMessages.VERBOSE).toEqual(['verbose message 1', 'verbose message 2']);
        expect(allMessages.TRACE).toEqual(['trace message 1']);
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

      it('should support error message management with new methods', () => {
        // 新しいmockLoggerインスタンスを使用してテストを分離
        const testLogger = new MockLogger();
        testLogger.error('error message');

        expect(testLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error message']);
        expect(testLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBe('error message');

        testLogger.clearMessages(AG_LOGLEVEL.ERROR);
        expect(testLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual([]);
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
        loggerMap[AG_LOGLEVEL.ERROR]?.('error via map');
        loggerMap[AG_LOGLEVEL.WARN]?.('warn via map');

        expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error via map']);
        expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['warn via map']);

        // OFFレベルは何もしない
        loggerMap[AG_LOGLEVEL.OFF]?.('should not log');
        expect(mockLogger.hasMessages(AG_LOGLEVEL.OFF)).toBe(false);
      });

      it('should include VERBOSE level in createLoggerMap with correct mapping', () => {
        // Arrange
        const loggerMap = mockLogger.createLoggerMap();

        // Act
        loggerMap[AG_LOGLEVEL.VERBOSE]?.('verbose message via map');

        // Assert
        expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toEqual(['verbose message via map']);
        expect(AG_LOGLEVEL.VERBOSE).toBe(-99); // Verify VERBOSE constant
      });
    });
  });

  /**
   * 異常系テスト: エラー処理
   *
   * @description エラー状況での動作を検証
   */
  describe('異常系: Error Handling', () => {
    /**
     * 無効なログレベル型のテスト
     */
    describe('Invalid Log Level Types', () => {
      it('should throw error for string log levels with exact format', () => {
        const stringLevel = 'DEBUG' as unknown as AgLogLevel;
        expect(() => mockLogger.getMessages(stringLevel))
          .toThrow('MockLogger: Invalid log level: DEBUG');
      });

      it('should throw error for boolean log levels with exact format', () => {
        const booleanLevel = true as unknown as AgLogLevel;
        expect(() => mockLogger.getMessages(booleanLevel))
          .toThrow('MockLogger: Invalid log level: true');
      });

      it('should throw error for object log levels with exact format', () => {
        const objectLevel = { level: 1 } as unknown as AgLogLevel;
        expect(() => mockLogger.getMessages(objectLevel))
          .toThrow('MockLogger: Invalid log level: [object Object]');
      });

      it('should throw error for array log levels with exact format', () => {
        const arrayLevel = [1, 2, 3] as unknown as AgLogLevel;
        expect(() => mockLogger.getMessages(arrayLevel))
          .toThrow('MockLogger: Invalid log level: 1,2,3');
      });

      it('should throw error for null and undefined log levels with exact format', () => {
        expect(() => mockLogger.getMessages(null as unknown as AgLogLevel))
          .toThrow('MockLogger: Invalid log level: null');
        expect(() => mockLogger.getMessages(undefined as unknown as AgLogLevel))
          .toThrow('MockLogger: Invalid log level: undefined');
      });
    });

    /**
     * 無効な数値ログレベルのテスト
     */
    describe('Invalid Numeric Log Levels', () => {
      it('should throw error for out-of-range positive numbers with exact format', () => {
        const outOfRangeLevel = 7 as unknown as AgLogLevel;
        expect(() => mockLogger.getMessages(outOfRangeLevel))
          .toThrow('MockLogger: Invalid log level: 7');
      });

      it('should throw error for out-of-range negative numbers with exact format', () => {
        const negativeLevel = -1 as unknown as AgLogLevel;
        expect(() => mockLogger.getMessages(negativeLevel))
          .toThrow('MockLogger: Invalid log level: -1');
      });

      it('should throw error for invalid negative numbers near VERBOSE range with exact format', () => {
        const nearVerboseLevel = -98 as unknown as AgLogLevel;
        expect(() => mockLogger.getMessages(nearVerboseLevel))
          .toThrow('MockLogger: Invalid log level: -98');
      });

      it('should throw error for decimal numbers with exact format', () => {
        const decimalLevel = 1.5 as unknown as AgLogLevel;
        expect(() => mockLogger.getMessages(decimalLevel))
          .toThrow('MockLogger: Invalid log level: 1.5');
      });

      it('should throw error for large out-of-range numbers with exact format', () => {
        const largeLevel = 999 as unknown as AgLogLevel;
        expect(() => mockLogger.getMessages(largeLevel))
          .toThrow('MockLogger: Invalid log level: 999');
      });
    });

    /**
     * 全メソッドでの一貫した検証テスト
     */
    describe('Consistent Validation Across Methods', () => {
      const invalidLevel = 999 as unknown as AgLogLevel;

      it('should validate log levels consistently in all query methods', () => {
        expect(() => mockLogger.getMessages(invalidLevel))
          .toThrow('MockLogger: Invalid log level: 999');
        expect(() => mockLogger.clearMessages(invalidLevel))
          .toThrow('MockLogger: Invalid log level: 999');
        expect(() => mockLogger.hasMessages(invalidLevel))
          .toThrow('MockLogger: Invalid log level: 999');
        expect(() => mockLogger.getMessageCount(invalidLevel))
          .toThrow('MockLogger: Invalid log level: 999');
        expect(() => mockLogger.getLastMessage(invalidLevel))
          .toThrow('MockLogger: Invalid log level: 999');
      });
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
    type TestNestedData = {
      user: {
        id: number;
        profile: {
          name: string;
        };
      };
    };

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

    it('should return same object references for AgLogMessage objects', () => {
      // Arrange
      const nestedLogMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2023-12-01T10:30:00Z'),
        message: 'Nested object test',
        args: [{ user: { id: 123, profile: { name: 'test' } } }],
      };

      // Act
      mockLogger.info(nestedLogMessage);
      const retrievedMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      const allMessages = mockLogger.getAllMessages();

      // Assert - should return same object references (JavaScript standard behavior)
      expect(retrievedMessages[0]).toBe(nestedLogMessage);
      expect(allMessages.INFO[0]).toBe(nestedLogMessage);

      // Verify object structure is preserved
      if (typeof retrievedMessages[0] === 'object' && 'args' in retrievedMessages[0]) {
        // retrievedMessages[0]はAgLogMessage型で、args プロパティは readonly unknown[] として定義されているため
        const args = retrievedMessages[0].args;
        const testData = args[0] as TestNestedData;
        expect(testData.user.id).toBe(123);
        expect(testData.user.profile.name).toBe('test');
      }
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
