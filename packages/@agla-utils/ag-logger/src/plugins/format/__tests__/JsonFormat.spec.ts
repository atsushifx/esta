// src: /src/plugins/format/__tests__/JsonFormat.spec.ts
// @(#) : JUnit tests for JsonFormat plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// constants
import { AgLogLevelCode } from '../../../../shared/types';
// type
import type { AgLogMessage } from '../../../../shared/types';

// test unit
import { JsonFormat } from '../JsonFormat';

// test main

describe('JsonFormat', () => {
  /**
   * Tests basic message formatting into JSON.
   */
  it('formats a basic log message as JSON', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.INFO,
      timestamp: new Date('2025-01-01T12:00:00.000Z'),
      message: 'Test message',
      args: [],
    };

    const result = JsonFormat(logMessage);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2025-01-01T12:00:00.000Z');
    expect(parsed.level).toBe('INFO');
    expect(parsed.message).toBe('Test message');
    expect(parsed.args).toBeUndefined();
  });

  /**
   * Tests formatting of a message with additional arguments.
   */
  it('formats a log message with arguments as JSON', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.ERROR,
      timestamp: new Date('2025-06-22T15:30:45.123Z'),
      message: 'An error occurred',
      args: [{ userId: 123, action: 'login' }],
    };

    const result = JsonFormat(logMessage);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2025-06-22T15:30:45.123Z');
    expect(parsed.level).toBe('ERROR');
    expect(parsed.message).toBe('An error occurred');
    expect(parsed.args).toEqual([{ userId: 123, action: 'login' }]);
  });

  /**
   * Tests formatting of multiple arguments as a JSON array.
   */
  it('formats multiple arguments as a JSON array', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.DEBUG,
      timestamp: new Date('2025-03-15T09:15:30.500Z'),
      message: 'Debug info',
      args: [
        { name: 'John Doe' },
        { age: 30 },
        ['item1', 'item2'],
      ],
    };

    const result = JsonFormat(logMessage);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2025-03-15T09:15:30.500Z');
    expect(parsed.level).toBe('DEBUG');
    expect(parsed.message).toBe('Debug info');
    expect(parsed.args).toEqual([
      { name: 'John Doe' },
      { age: 30 },
      ['item1', 'item2'],
    ]);
  });

  /**
   * Tests correct JSON formatting for all log levels.
   */
  it('formats correctly for all log levels', () => {
    const baseMessage: Omit<AgLogMessage, 'logLevel'> = {
      timestamp: new Date('2025-01-01T00:00:00.000Z'),
      message: 'Test',
      args: [],
    };

    const testCases = [
      { level: AgLogLevelCode.FATAL, expected: 'FATAL' },
      { level: AgLogLevelCode.ERROR, expected: 'ERROR' },
      { level: AgLogLevelCode.WARN, expected: 'WARN' },
      { level: AgLogLevelCode.INFO, expected: 'INFO' },
      { level: AgLogLevelCode.DEBUG, expected: 'DEBUG' },
      { level: AgLogLevelCode.TRACE, expected: 'TRACE' },
    ];

    testCases.forEach(({ level, expected }) => {
      const result = JsonFormat({ ...baseMessage, logLevel: level });
      const parsed = JSON.parse(result);
      expect(parsed.level).toBe(expected);
    });
  });

  /**
   * Tests JSON formatting with an empty message string.
   */
  it('formats correctly even with an empty message', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.WARN,
      timestamp: new Date('2025-12-31T23:59:59.999Z'),
      message: '',
      args: [{ warning: 'empty message' }],
    };

    const result = JsonFormat(logMessage);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2025-12-31T23:59:59.999Z');
    expect(parsed.level).toBe('WARN');
    expect(parsed.message).toBe('');
    expect(parsed.args).toEqual([{ warning: 'empty message' }]);
  });

  /**
   * Tests that circular references throw during JSON.stringify.
   */
  it('throws when JSON.stringify cannot serialize circular objects', () => {
    const circularObj: { name: string; self?: unknown } = { name: 'test' };
    circularObj.self = circularObj;

    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.INFO,
      timestamp: new Date('2025-01-01T12:00:00.000Z'),
      message: 'circular reference test',
      args: [circularObj],
    };

    expect(() => JsonFormat(logMessage)).toThrow();
  });

  /**
   * Tests that the output is a valid JSON string without line breaks.
   */
  it('outputs valid JSON string without newlines', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.INFO,
      timestamp: new Date('2025-01-01T12:00:00.000Z'),
      message: 'Test',
      args: [{ key: 'value' }],
    };

    const result = JsonFormat(logMessage);

    // Verify that output is valid JSON
    expect(() => JSON.parse(result)).not.toThrow();

    // Verify output is single-line JSON string
    expect(result).not.toContain('\n');
  });
});
