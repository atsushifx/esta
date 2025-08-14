// src/plugins/formatter/__tests__/MockFormatter.spec.ts
// @(#) : Unit tests for MockFormatter plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest imports
import { beforeEach, describe, expect, it } from 'vitest';

// constants
import { AG_LOGLEVEL } from '../../../../shared/types';
// types
import type { AgLogMessage } from '../../../../shared/types/AgLogger.types';

// subject under test
import { MockFormatter } from '../MockFormatter';

/**
 * MockFormatterプラグインのユニットテストスイート
 *
 * @description MockFormatterの2つのフォーマッター関数をテストする:
 * - passthrough: AgLogMessageオブジェクトをそのまま返す
 * - json: AgLogMessageをJSON文字列に変換する
 *
 * @testType Unit Test
 * @testTarget MockFormatter Plugin
 * @coverage
 * - passthrough フォーマッターの同一オブジェクト参照返却
 * - passthrough フォーマッターのオブジェクトプロパティ保持
 * - passthrough フォーマッターの様々なAgLogMessage構造での動作
 * - passthrough フォーマッターの全ログレベルでの動作
 * - passthrough フォーマッターのエッジケース処理
 * - json フォーマッターの文字列型返却
 * - json フォーマッターの有効なJSON文字列出力
 * - json フォーマッターの解析可能性
 * - json フォーマッターのシリアライゼーション内容
 * - json フォーマッターの引数処理
 * - json フォーマッターの全ログレベルでの動作
 * - json フォーマッターの複雑な引数構造処理
 * - json フォーマッターのエッジケース処理
 * - json フォーマッターの循環参照エラー処理
 * - TypeScript型安全性の保証
 */
describe('MockFormatter', () => {
  describe('passthrough formatter', () => {
    /**
     * Tests that passthrough formatter returns the exact same object reference.
     */
    it('returns the exact same object reference', () => {
      // Arrange
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Test message',
        args: [],
      };

      // Act
      const result = MockFormatter.passthrough(logMessage) as AgLogMessage;

      // Assert
      expect(result).toBe(logMessage); // Same reference
      expect(result === logMessage).toBe(true); // Strict equality
    });

    /**
     * Tests that passthrough formatter preserves all object properties unchanged.
     */
    it('preserves all object properties unchanged', () => {
      // Arrange
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.DEBUG,
        timestamp: new Date('2025-06-15T14:30:45.123Z'),
        message: 'Debug message with data',
        args: [{ userId: 123, action: 'click' }],
      };

      // Act
      const result = MockFormatter.passthrough(logMessage) as AgLogMessage;

      // Assert
      expect(result.logLevel).toBe(AG_LOGLEVEL.DEBUG);
      expect(result.timestamp).toEqual(new Date('2025-06-15T14:30:45.123Z'));
      expect(result.message).toBe('Debug message with data');
      expect(result.args).toEqual([{ userId: 123, action: 'click' }]);
    });

    /**
     * Tests that passthrough formatter handles AgLogMessage with empty args array.
     */
    it('handles AgLogMessage with empty args array', () => {
      // Arrange
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.WARN,
        timestamp: new Date('2025-03-20T08:15:30.000Z'),
        message: 'Warning without additional data',
        args: [],
      };

      // Act
      const result = MockFormatter.passthrough(logMessage) as AgLogMessage;

      // Assert
      expect(result).toBe(logMessage);
      expect(result.args).toEqual([]);
      expect(Array.isArray(result.args)).toBe(true);
    });

    /**
     * Tests that passthrough formatter handles AgLogMessage with complex args structures.
     */
    it('handles AgLogMessage with complex args structures', () => {
      // Arrange
      const complexArgs = [
        { nested: { deep: { value: 'test' } } },
        ['array', 'of', 'strings'],
        42,
        true,
        null,
        undefined,
      ];
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.TRACE,
        timestamp: new Date('2025-09-10T16:45:00.567Z'),
        message: 'Complex data structure',
        args: complexArgs,
      };

      // Act
      const result = MockFormatter.passthrough(logMessage) as AgLogMessage;

      // Assert
      expect(result).toBe(logMessage);
      expect(result.args).toBe(complexArgs); // Same reference for args
      expect(result.args).toEqual(complexArgs); // Same content
    });

    /**
     * Tests that passthrough formatter works correctly with all log levels.
     */
    it('works correctly with all log levels', () => {
      // Arrange
      const baseMessage: Omit<AgLogMessage, 'logLevel'> = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        message: 'Test message',
        args: [],
      };

      const testCases = [
        AG_LOGLEVEL.OFF,
        AG_LOGLEVEL.FATAL,
        AG_LOGLEVEL.ERROR,
        AG_LOGLEVEL.WARN,
        AG_LOGLEVEL.INFO,
        AG_LOGLEVEL.DEBUG,
        AG_LOGLEVEL.TRACE,
      ];

      testCases.forEach((level) => {
        // Arrange
        const logMessage = { ...baseMessage, logLevel: level };

        // Act
        const result = MockFormatter.passthrough(logMessage) as AgLogMessage;

        // Assert
        expect(result).toBe(logMessage);
        expect(result.logLevel).toBe(level);
      });
    });

    /**
     * Tests that passthrough formatter handles edge cases.
     */
    it('handles edge cases with empty message and special timestamps', () => {
      // Arrange
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.ERROR,
        timestamp: new Date('1970-01-01T00:00:00.000Z'), // Unix epoch
        message: '', // Empty message
        args: [{ error: 'critical failure' }],
      };

      // Act
      const result = MockFormatter.passthrough(logMessage) as AgLogMessage;

      // Assert
      expect(result).toBe(logMessage);
      expect(result.message).toBe('');
      expect(result.timestamp.getTime()).toBe(0); // Unix epoch timestamp
    });
  });

  describe('json formatter', () => {
    /**
     * Tests that json formatter returns a string type.
     */
    it('returns a string type', () => {
      // Arrange
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Test message',
        args: [],
      };

      // Act
      const result = MockFormatter.json(logMessage) as string;

      // Assert
      expect(typeof result).toBe('string');
      expect(result).toBeTypeOf('string');
    });

    /**
     * Tests that json formatter returns parsable JSON string.
     */
    it('returns parsable JSON string', () => {
      // Arrange
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Test message',
        args: [],
      };

      // Act
      const result = MockFormatter.json(logMessage) as string;

      // Assert
      expect(() => JSON.parse(result)).not.toThrow();
      const parsed = JSON.parse(result);
      expect(typeof parsed).toBe('object');
      expect(parsed).not.toBeNull();
    });

    /**
     * Tests that json formatter produces JSON with correct serialized content.
     */
    it('produces JSON with correct serialized content', () => {
      // Arrange
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.WARN,
        timestamp: new Date('2025-04-15T10:30:15.456Z'),
        message: 'Warning message',
        args: [{ userId: 789, status: 'active' }],
      };

      // Act
      const result = MockFormatter.json(logMessage) as string;
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.logLevel).toBe(AG_LOGLEVEL.WARN);
      expect(parsed.timestamp).toBe('2025-04-15T10:30:15.456Z');
      expect(parsed.message).toBe('Warning message');
      expect(parsed.args).toEqual([{ userId: 789, status: 'active' }]);
    });

    /**
     * Tests that json formatter correctly serializes AgLogMessage with args.
     */
    it('correctly serializes AgLogMessage with args', () => {
      // Arrange
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.ERROR,
        timestamp: new Date('2025-07-22T18:45:30.789Z'),
        message: 'Error occurred',
        args: [
          { errorCode: 500 },
          { stack: 'Error at line 42' },
          'additional context',
        ],
      };

      // Act
      const result = MockFormatter.json(logMessage) as string;
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.args).toEqual([
        { errorCode: 500 },
        { stack: 'Error at line 42' },
        'additional context',
      ]);
      expect(Array.isArray(parsed.args)).toBe(true);
      expect(parsed.args.length).toBe(3);
    });

    /**
     * Tests that json formatter works correctly with all log levels.
     */
    it('works correctly with all log levels', () => {
      // Arrange
      const baseMessage: Omit<AgLogMessage, 'logLevel'> = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        message: 'Test message',
        args: [],
      };

      const testCases = [
        AG_LOGLEVEL.OFF,
        AG_LOGLEVEL.FATAL,
        AG_LOGLEVEL.ERROR,
        AG_LOGLEVEL.WARN,
        AG_LOGLEVEL.INFO,
        AG_LOGLEVEL.DEBUG,
        AG_LOGLEVEL.TRACE,
      ];

      testCases.forEach((level) => {
        // Arrange
        const logMessage = { ...baseMessage, logLevel: level };

        // Act
        const result = MockFormatter.json(logMessage) as string;
        const parsed = JSON.parse(result);

        // Assert
        expect(parsed.logLevel).toBe(level);
        expect(typeof result).toBe('string');
        expect(() => JSON.parse(result)).not.toThrow();
      });
    });

    /**
     * Tests that json formatter handles complex args structures.
     */
    it('handles complex args structures with objects, arrays, and nested data', () => {
      // Arrange
      const complexArgs = [
        {
          user: { id: 123, name: 'John Doe', roles: ['admin', 'user'] },
          metadata: { version: '1.0.0', timestamp: '2025-01-01' },
        },
        [1, 2, { nested: [3, 4, 5] }],
        'simple string',
        42,
        true,
        null,
      ];
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.DEBUG,
        timestamp: new Date('2025-05-10T13:20:45.321Z'),
        message: 'Complex nested data',
        args: complexArgs,
      };

      // Act
      const result = MockFormatter.json(logMessage) as string;
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.args).toEqual(complexArgs);
      expect(parsed.args[0].user.roles).toEqual(['admin', 'user']);
      expect(parsed.args[1][2].nested).toEqual([3, 4, 5]);
    });

    /**
     * Tests that json formatter handles edge cases with empty message and special characters.
     */
    it('handles edge cases with empty message and special characters', () => {
      // Arrange
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.TRACE,
        timestamp: new Date('2025-12-31T23:59:59.999Z'),
        message: '', // Empty message
        args: [
          { text: 'Special chars: "\\n\\t\\r\\' },
          { unicode: '🚀 Unicode test 日本語' },
        ],
      };

      // Act
      const result = MockFormatter.json(logMessage) as string;
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.message).toBe('');
      expect(parsed.args[0].text).toBe('Special chars: "\\n\\t\\r\\');
      expect(parsed.args[1].unicode).toBe('🚀 Unicode test 日本語');
    });

    /**
     * Tests that json formatter throws appropriate error for circular references.
     */
    it('throws appropriate error for circular references', () => {
      // Arrange
      const circularObj: { name: string; self?: unknown } = { name: 'test' };
      circularObj.self = circularObj; // Create circular reference

      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.ERROR,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Circular reference test',
        args: [circularObj],
      };

      // Act & Assert
      expect(() => MockFormatter.json(logMessage)).toThrow();
      expect(() => MockFormatter.json(logMessage)).toThrow(/circular/i);
    });
  });

  describe('errorThrow formatter', () => {
    /**
     * Tests that errorThrow formatter throws the specified error message when called.
     */
    it('throws the specified error message when formatting is called', () => {
      // Arrange
      const errorMessage = 'Test error from formatter';
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.ERROR,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'This should trigger an error',
        args: [],
      };

      // Act & Assert
      expect(() => {
        MockFormatter.errorThrow(errorMessage)(logMessage);
      }).toThrow(errorMessage);
    });

    /**
     * Tests that errorThrow formatter throws Error instance with correct message.
     */
    it('throws Error instance with correct message', () => {
      // Arrange
      const errorMessage = 'Custom formatter error';
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.WARN,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Test message',
        args: [{ test: 'data' }],
      };

      // Act & Assert
      expect(() => {
        MockFormatter.errorThrow(errorMessage)(logMessage);
      }).toThrow(Error);

      try {
        MockFormatter.errorThrow(errorMessage)(logMessage);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(errorMessage);
      }
    });

    /**
     * Tests that errorThrow formatter works with different error messages.
     */
    it('works with different error messages', () => {
      // Arrange
      const testCases = [
        'Simple error',
        'Error with special chars: "\'\\n\\t',
        'Unicode error: 🚨 エラーが発生しました',
        '',
        ' ',
      ];
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.FATAL,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Test message',
        args: [],
      };

      testCases.forEach((errorMessage) => {
        // Act & Assert
        expect(() => {
          MockFormatter.errorThrow(errorMessage)(logMessage);
        }).toThrow(errorMessage);
      });
    });

    /**
     * Tests that errorThrow formatter preserves error message regardless of log message content.
     */
    it('preserves error message regardless of log message content', () => {
      // Arrange
      const errorMessage = 'Consistent error message';
      const testLogMessages: AgLogMessage[] = [
        {
          logLevel: AG_LOGLEVEL.INFO,
          timestamp: new Date('2025-01-01T12:00:00.000Z'),
          message: 'Different message 1',
          args: [],
        },
        {
          logLevel: AG_LOGLEVEL.DEBUG,
          timestamp: new Date('2025-06-15T14:30:45.123Z'),
          message: 'Different message 2',
          args: [{ complex: { nested: 'data' } }],
        },
        {
          logLevel: AG_LOGLEVEL.ERROR,
          timestamp: new Date('1970-01-01T00:00:00.000Z'),
          message: '',
          args: [null, undefined, 42, 'string'],
        },
      ];

      testLogMessages.forEach((logMessage) => {
        // Act & Assert
        expect(() => {
          MockFormatter.errorThrow(errorMessage)(logMessage);
        }).toThrow(errorMessage);

        try {
          MockFormatter.errorThrow(errorMessage)(logMessage);
        } catch (error) {
          expect((error as Error).message).toBe(errorMessage);
        }
      });
    });

    /**
     * Tests that errorThrow formatter function can be created multiple times with different messages.
     */
    it('can be created multiple times with different messages', () => {
      // Arrange
      const errorMessage1 = 'First error message';
      const errorMessage2 = 'Second error message';
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.TRACE,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Test message',
        args: [],
      };

      // Act & Assert
      const formatter1 = MockFormatter.errorThrow(errorMessage1);
      const formatter2 = MockFormatter.errorThrow(errorMessage2);

      expect(() => formatter1(logMessage)).toThrow(errorMessage1);
      expect(() => formatter2(logMessage)).toThrow(errorMessage2);

      // Verify they are independent
      expect(() => formatter1(logMessage)).not.toThrow(errorMessage2);
      expect(() => formatter2(logMessage)).not.toThrow(errorMessage1);
    });
  });

  describe('messageOnly formatter', () => {
    /**
     * Tests that messageOnly formatter returns only the message string.
     */
    it('returns only the message string', () => {
      // Arrange
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Test message only',
        args: [{ extra: 'data' }],
      };

      // Act
      const result = MockFormatter.messageOnly(logMessage) as string;

      // Assert
      expect(result).toBe('Test message only');
      expect(typeof result).toBe('string');
    });

    /**
     * Tests that messageOnly formatter handles empty messages.
     */
    it('handles empty messages', () => {
      // Arrange
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.WARN,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: '',
        args: [],
      };

      // Act
      const result = MockFormatter.messageOnly(logMessage) as string;

      // Assert
      expect(result).toBe('');
      expect(typeof result).toBe('string');
    });

    /**
     * Tests that messageOnly formatter works with special characters.
     */
    it('works with special characters and unicode', () => {
      // Arrange
      const specialMessage = 'Special chars: "\'\\n\\t\\r and Unicode: 🚀 日本語';
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.DEBUG,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: specialMessage,
        args: [],
      };

      // Act
      const result = MockFormatter.messageOnly(logMessage) as string;

      // Assert
      expect(result).toBe(specialMessage);
      expect(typeof result).toBe('string');
    });
  });

  describe('type safety', () => {
    /**
     * Tests that both formatters maintain proper TypeScript type safety.
     */
    it('maintains proper TypeScript type safety for both formatters', () => {
      // Arrange
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Type safety test',
        args: [{ typed: 'data' }],
      };

      // Act
      const passthroughResult = MockFormatter.passthrough(logMessage);
      const jsonResult = MockFormatter.json(logMessage);

      // Assert type compatibility
      expect(passthroughResult).toSatisfy((result: AgLogMessage) => {
        return (
          typeof result.logLevel === 'number'
          && result.timestamp instanceof Date
          && typeof result.message === 'string'
          && Array.isArray(result.args)
        );
      });

      expect(jsonResult).toSatisfy((result: string) => {
        return typeof result === 'string';
      });
    });
  });

  /**
   * Statistics tracking functionality tests.
   * Tests that each formatter method tracks usage statistics including
   * call count and last processed log message.
   */
  describe('statistics tracking functionality', () => {
    const createTestLogMessage = (message: string): AgLogMessage => ({
      timestamp: new Date('2025-01-01T00:00:00.000Z'),
      logLevel: AG_LOGLEVEL.INFO,
      message,
      args: [],
    });

    beforeEach(() => {
      // Reset statistics before each test to ensure clean state
      MockFormatter.resetStats();
    });

    /**
     * Tests that passthrough formatter tracks call count correctly.
     * When passthrough formatter is called multiple times,
     * Then the call count should increment appropriately.
     */
    describe('passthrough formatter call count tracking', () => {
      it('should track single call correctly', () => {
        // Arrange
        const logMessage = createTestLogMessage('test message');

        // Act
        MockFormatter.passthrough(logMessage);

        // Assert
        const stats = MockFormatter.getStats('passthrough');
        expect(stats).not.toBeNull();
        expect(stats!.callCount).toBe(1);
      });

      it('should track multiple calls correctly', () => {
        // Arrange
        const logMessage1 = createTestLogMessage('first message');
        const logMessage2 = createTestLogMessage('second message');

        // Act
        MockFormatter.passthrough(logMessage1);
        MockFormatter.passthrough(logMessage2);

        // Assert
        const stats = MockFormatter.getStats('passthrough');
        expect(stats).not.toBeNull();
        expect(stats!.callCount).toBe(2);
      });
    });

    /**
     * Tests that json formatter tracks call count correctly.
     * When json formatter is called multiple times,
     * Then the call count should increment appropriately.
     */
    describe('json formatter call count tracking', () => {
      it('should track single call correctly', () => {
        // Arrange
        const logMessage = createTestLogMessage('test message');

        // Act
        MockFormatter.json(logMessage);

        // Assert
        const stats = MockFormatter.getStats('json');
        expect(stats).not.toBeNull();
        expect(stats!.callCount).toBe(1);
      });

      it('should track multiple calls correctly', () => {
        // Arrange
        const logMessage1 = createTestLogMessage('first message');
        const logMessage2 = createTestLogMessage('second message');

        // Act
        MockFormatter.json(logMessage1);
        MockFormatter.json(logMessage2);

        // Assert
        const stats = MockFormatter.getStats('json');
        expect(stats).not.toBeNull();
        expect(stats!.callCount).toBe(2);
      });
    });

    /**
     * Tests that messageOnly formatter tracks call count correctly.
     * When messageOnly formatter is called multiple times,
     * Then the call count should increment appropriately.
     */
    describe('messageOnly formatter call count tracking', () => {
      it('should track single call correctly', () => {
        // Arrange
        const logMessage = createTestLogMessage('test message');

        // Act
        MockFormatter.messageOnly(logMessage);

        // Assert
        const stats = MockFormatter.getStats('messageOnly');
        expect(stats).not.toBeNull();
        expect(stats!.callCount).toBe(1);
      });

      it('should track multiple calls correctly', () => {
        // Arrange
        const logMessage1 = createTestLogMessage('first message');
        const logMessage2 = createTestLogMessage('second message');

        // Act
        MockFormatter.messageOnly(logMessage1);
        MockFormatter.messageOnly(logMessage2);

        // Assert
        const stats = MockFormatter.getStats('messageOnly');
        expect(stats).not.toBeNull();
        expect(stats!.callCount).toBe(2);
      });
    });

    /**
     * Tests that errorThrow formatter tracks call count correctly.
     * When errorThrow formatter is called multiple times,
     * Then the call count should increment appropriately even when throwing.
     */
    describe('errorThrow formatter call count tracking', () => {
      it('should track single call correctly when throwing error', () => {
        // Arrange
        const logMessage = createTestLogMessage('test message');
        const errorFormatter = MockFormatter.errorThrow('Test error');

        // Act & Assert
        expect(() => errorFormatter(logMessage)).toThrow('Test error');

        const stats = MockFormatter.getStats('errorThrow');
        expect(stats).not.toBeNull();
        expect(stats!.callCount).toBe(1);
      });

      it('should track multiple calls correctly when throwing errors', () => {
        // Arrange
        const logMessage1 = createTestLogMessage('first message');
        const logMessage2 = createTestLogMessage('second message');
        const errorFormatter = MockFormatter.errorThrow('Test error');

        // Act & Assert
        expect(() => errorFormatter(logMessage1)).toThrow('Test error');
        expect(() => errorFormatter(logMessage2)).toThrow('Test error');

        const stats = MockFormatter.getStats('errorThrow');
        expect(stats).not.toBeNull();
        expect(stats!.callCount).toBe(2);
      });
    });

    /**
     * Tests that formatters track the last processed log message correctly.
     * When formatters are called with different messages,
     * Then getLastMessage should return the most recent message.
     */
    describe('last message tracking', () => {
      it('should track last message for passthrough formatter', () => {
        // Arrange
        const firstMessage = createTestLogMessage('first message');
        const secondMessage = createTestLogMessage('second message');

        // Act
        MockFormatter.passthrough(firstMessage);
        MockFormatter.passthrough(secondMessage);

        // Assert
        const lastMessage = MockFormatter.getLastMessage('passthrough');
        expect(lastMessage).toEqual(secondMessage);
      });

      it('should track last message for json formatter', () => {
        // Arrange
        const firstMessage = createTestLogMessage('first message');
        const secondMessage = createTestLogMessage('second message');

        // Act
        MockFormatter.json(firstMessage);
        MockFormatter.json(secondMessage);

        // Assert
        const lastMessage = MockFormatter.getLastMessage('json');
        expect(lastMessage).toEqual(secondMessage);
      });

      it('should track last message for messageOnly formatter', () => {
        // Arrange
        const firstMessage = createTestLogMessage('first message');
        const secondMessage = createTestLogMessage('second message');

        // Act
        MockFormatter.messageOnly(firstMessage);
        MockFormatter.messageOnly(secondMessage);

        // Assert
        const lastMessage = MockFormatter.getLastMessage('messageOnly');
        expect(lastMessage).toEqual(secondMessage);
      });

      it('should track last message for errorThrow formatter even when throwing', () => {
        // Arrange
        const firstMessage = createTestLogMessage('first message');
        const secondMessage = createTestLogMessage('second message');
        const errorFormatter = MockFormatter.errorThrow('Test error');

        // Act & Assert
        expect(() => errorFormatter(firstMessage)).toThrow('Test error');
        expect(() => errorFormatter(secondMessage)).toThrow('Test error');

        const lastMessage = MockFormatter.getLastMessage('errorThrow');
        expect(lastMessage).toEqual(secondMessage);
      });
    });

    /**
     * Tests getAllStats functionality.
     * When multiple formatters are used,
     * Then getAllStats should return statistics for all formatters.
     */
    describe('getAllStats functionality', () => {
      it('should return statistics for all formatters after usage', () => {
        // Arrange
        const logMessage = createTestLogMessage('test message');
        const errorFormatter = MockFormatter.errorThrow('Test error');

        // Act
        MockFormatter.passthrough(logMessage);
        MockFormatter.json(logMessage);
        MockFormatter.messageOnly(logMessage);
        expect(() => errorFormatter(logMessage)).toThrow('Test error');

        // Assert
        const allStats = MockFormatter.getAllStats();
        expect(allStats).toHaveProperty('passthrough');
        expect(allStats).toHaveProperty('json');
        expect(allStats).toHaveProperty('messageOnly');
        expect(allStats).toHaveProperty('errorThrow');

        expect(allStats.passthrough.callCount).toBe(1);
        expect(allStats.json.callCount).toBe(1);
        expect(allStats.messageOnly.callCount).toBe(1);
        expect(allStats.errorThrow.callCount).toBe(1);
      });
    });

    /**
     * Tests resetStats functionality.
     * When resetStats is called,
     * Then all statistics should be reset to initial values.
     */
    describe('resetStats functionality', () => {
      it('should reset all statistics to initial values', () => {
        // Arrange
        const logMessage = createTestLogMessage('test message');
        const errorFormatter = MockFormatter.errorThrow('Test error');

        // Use all formatters to generate statistics
        MockFormatter.passthrough(logMessage);
        MockFormatter.json(logMessage);
        MockFormatter.messageOnly(logMessage);
        expect(() => errorFormatter(logMessage)).toThrow('Test error');

        // Act
        MockFormatter.resetStats();

        // Assert
        const allStats = MockFormatter.getAllStats();
        expect(allStats.passthrough.callCount).toBe(0);
        expect(allStats.passthrough.lastMessage).toBeNull();
        expect(allStats.json.callCount).toBe(0);
        expect(allStats.json.lastMessage).toBeNull();
        expect(allStats.messageOnly.callCount).toBe(0);
        expect(allStats.messageOnly.lastMessage).toBeNull();
        expect(allStats.errorThrow.callCount).toBe(0);
        expect(allStats.errorThrow.lastMessage).toBeNull();
      });
    });

    /**
     * Tests resetFormatterStats functionality.
     * When resetFormatterStats is called for a specific formatter,
     * Then only that formatter's statistics should be reset.
     */
    describe('resetFormatterStats functionality', () => {
      it('should reset only specified formatter statistics', () => {
        // Arrange
        const logMessage = createTestLogMessage('test message');

        MockFormatter.passthrough(logMessage);
        MockFormatter.json(logMessage);

        // Act
        MockFormatter.resetFormatterStats('passthrough');

        // Assert
        const passthroughStats = MockFormatter.getStats('passthrough');
        const jsonStats = MockFormatter.getStats('json');

        expect(passthroughStats!.callCount).toBe(0);
        expect(passthroughStats!.lastMessage).toBeNull();
        expect(jsonStats!.callCount).toBe(1);
        expect(jsonStats!.lastMessage).toEqual(logMessage);
      });
    });

    /**
     * Tests getStats with invalid formatter name.
     * When getStats is called with non-existent formatter name,
     * Then it should return null.
     */
    describe('getStats with invalid formatter', () => {
      it('should return null for non-existent formatter', () => {
        // Act
        const stats = MockFormatter.getStats('nonExistentFormatter');

        // Assert
        expect(stats).toBeNull();
      });
    });

    /**
     * Tests getLastMessage with invalid formatter name.
     * When getLastMessage is called with non-existent formatter name,
     * Then it should return null.
     */
    describe('getLastMessage with invalid formatter', () => {
      it('should return null for non-existent formatter', () => {
        // Act
        const lastMessage = MockFormatter.getLastMessage('nonExistentFormatter');

        // Assert
        expect(lastMessage).toBeNull();
      });
    });
  });
});
