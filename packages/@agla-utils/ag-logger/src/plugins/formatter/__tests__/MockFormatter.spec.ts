// src/plugins/formatter/__tests__/MockFormatter.spec.ts
// @(#) : Unit tests for MockFormatter plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest imports
import { describe, expect, it } from 'vitest';

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
});
