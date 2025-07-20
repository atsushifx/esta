// src/plugins/format/__tests__/PlainFormat.spec.ts
// @(#) : Unit tests for PlainFormat plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest imports
import { describe, expect, it } from 'vitest';

// constants
import { AG_LOG_LEVEL } from '../../../../shared/types';
// types
import type { AgLogMessage } from '../../../../shared/types/AgLogger.types';

// subject under test
import { PlainFormat } from '../PlainFormat';

describe('PlainFormat', () => {
  /**
   * Tests basic message formatting.
   */
  it('formats a basic log message', () => {
    const logMessage: AgLogMessage = {
      logLevel: AG_LOG_LEVEL.INFO,
      timestamp: new Date('2025-01-01T12:00:00.000Z'),
      message: 'Test message',
      args: [],
    };

    const result = PlainFormat(logMessage);
    expect(result).toBe('2025-01-01T12:00:00Z [INFO] Test message');
  });

  /**
   * Tests formatting a message with arguments.
   */
  it('formats a log message with arguments', () => {
    const logMessage: AgLogMessage = {
      logLevel: AG_LOG_LEVEL.ERROR,
      timestamp: new Date('2025-06-22T15:30:45.123Z'),
      message: 'An error occurred',
      args: [{ userId: 123, action: 'login' }],
    };

    const result = PlainFormat(logMessage);
    expect(result).toBe('2025-06-22T15:30:45Z [ERROR] An error occurred {"userId":123,"action":"login"}');
  });

  /**
   * Tests formatting multiple arguments as JSON.
   */
  it('formats multiple arguments as JSON strings', () => {
    const logMessage: AgLogMessage = {
      logLevel: AG_LOG_LEVEL.DEBUG,
      timestamp: new Date('2025-03-15T09:15:30.500Z'),
      message: 'Debug info',
      args: [
        { name: 'John Doe' },
        { age: 30 },
        ['item1', 'item2'],
      ],
    };

    const result = PlainFormat(logMessage);
    expect(result).toBe('2025-03-15T09:15:30Z [DEBUG] Debug info {"name":"John Doe"} {"age":30} ["item1","item2"]');
  });

  /**
   * Tests correct formatting for all log levels.
   */
  it('formats correctly for all log levels', () => {
    const baseMessage: Omit<AgLogMessage, 'logLevel'> = {
      timestamp: new Date('2025-01-01T00:00:00.000Z'),
      message: 'Test',
      args: [],
    };

    expect(PlainFormat({ ...baseMessage, logLevel: AG_LOG_LEVEL.FATAL }))
      .toBe('2025-01-01T00:00:00Z [FATAL] Test');
    expect(PlainFormat({ ...baseMessage, logLevel: AG_LOG_LEVEL.ERROR }))
      .toBe('2025-01-01T00:00:00Z [ERROR] Test');
    expect(PlainFormat({ ...baseMessage, logLevel: AG_LOG_LEVEL.WARN }))
      .toBe('2025-01-01T00:00:00Z [WARN] Test');
    expect(PlainFormat({ ...baseMessage, logLevel: AG_LOG_LEVEL.INFO }))
      .toBe('2025-01-01T00:00:00Z [INFO] Test');
    expect(PlainFormat({ ...baseMessage, logLevel: AG_LOG_LEVEL.DEBUG }))
      .toBe('2025-01-01T00:00:00Z [DEBUG] Test');
    expect(PlainFormat({ ...baseMessage, logLevel: AG_LOG_LEVEL.TRACE }))
      .toBe('2025-01-01T00:00:00Z [TRACE] Test');
  });

  /**
   * Tests formatting with an empty message string.
   */
  it('formats correctly even with an empty message', () => {
    const logMessage: AgLogMessage = {
      logLevel: AG_LOG_LEVEL.WARN,
      timestamp: new Date('2025-12-31T23:59:59.999Z'),
      message: '',
      args: [{ warning: 'empty message' }],
    };

    const result = PlainFormat(logMessage);
    expect(result).toBe('2025-12-31T23:59:59Z [WARN]  {"warning":"empty message"}');
  });

  /**
   * Tests that JSON.stringify throws on circular references.
   */
  it('throws when JSON.stringify cannot serialize circular objects', () => {
    const circularObj: { name: string; self?: unknown } = { name: 'test' };
    circularObj.self = circularObj;

    const logMessage: AgLogMessage = {
      logLevel: AG_LOG_LEVEL.INFO,
      timestamp: new Date('2025-01-01T12:00:00.000Z'),
      message: 'circular reference test',
      args: [circularObj],
    };

    expect(() => PlainFormat(logMessage)).toThrow();
  });
});
