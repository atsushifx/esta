// src/functional/core/__tests__/parseArgsToAgLogMessage.spec.ts
// @(#) : Unit tests for parseArgsToAgLogMessage pure function
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import { parseArgsToAgLogMessage } from '../parseArgsToAgLogMessage';

/**
 * Unit tests for the parseArgsToAgLogMessage pure function.
 * This function should replace AgLoggerGetMessage with a pure functional approach.
 */
describe('parseArgsToAgLogMessage', () => {
  describe('Basic functionality', () => {
    it('should format basic message with level', () => {
      const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test message');

      expect(result.level).toBe('INFO');
      expect(result.message).toBe('test message');
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.args).toEqual([]);
      expect(Object.isFrozen(result)).toBe(true);
    });

    it('should convert log level to string label', () => {
      const fatalResult = parseArgsToAgLogMessage(AG_LOGLEVEL.FATAL, 'fatal error');
      const errorResult = parseArgsToAgLogMessage(AG_LOGLEVEL.ERROR, 'error message');
      const warnResult = parseArgsToAgLogMessage(AG_LOGLEVEL.WARN, 'warning message');
      const infoResult = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'info message');
      const debugResult = parseArgsToAgLogMessage(AG_LOGLEVEL.DEBUG, 'debug message');
      const traceResult = parseArgsToAgLogMessage(AG_LOGLEVEL.TRACE, 'trace message');

      expect(fatalResult.level).toBe('FATAL');
      expect(errorResult.level).toBe('ERROR');
      expect(warnResult.level).toBe('WARN');
      expect(infoResult.level).toBe('INFO');
      expect(debugResult.level).toBe('DEBUG');
      expect(traceResult.level).toBe('TRACE');
    });

    it('should separate message args from structured args', () => {
      const userData = { id: 123, name: 'John' };
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.ERROR,
        'User error',
        userData,
        'occurred',
        42,
      );

      expect(result.level).toBe('ERROR');
      expect(result.message).toBe('User error occurred 42');
      expect(result.args).toEqual([userData]);
      expect(Object.isFrozen(result.args)).toBe(true);
    });
  });

  describe('Pure function properties', () => {
    it('should not modify input arguments', () => {
      const originalArgs = ['message', { data: 'test' }];
      const argsCopy = [...originalArgs];

      parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, ...originalArgs);

      expect(originalArgs).toEqual(argsCopy);
    });

    it('should return frozen (immutable) objects', () => {
      const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test');

      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.args)).toBe(true);
    });

    it('should be deterministic for same inputs (excluding timestamp)', () => {
      const result1 = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test', { data: 'value' });
      const result2 = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test', { data: 'value' });

      expect(result1.level).toBe(result2.level);
      expect(result1.message).toBe(result2.message);
      expect(result1.args).toEqual(result2.args);
    });
  });

  describe('Complex argument handling', () => {
    it('should handle mixed primitive and object arguments', () => {
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.WARN,
        'Processing',
        123,
        'items',
        { status: 'active' },
        true,
      );

      expect(result.message).toBe('Processing 123 items true');
      expect(result.args).toEqual([{ status: 'active' }]);
    });

    it('should handle empty arguments', () => {
      const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO);

      expect(result.message).toBe('');
      expect(result.args).toEqual([]);
    });

    it('should handle null and undefined arguments', () => {
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.DEBUG,
        'Testing',
        null,
        undefined,
        'values',
      );

      expect(result.message).toBe('Testing values');
      expect(result.args).toEqual([null, undefined]);
    });

    it('should handle empty string arguments - E2E test case verification', () => {
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.WARN,
        'Empty structures test',
        {},
        [],
        '',
      );

      // デバッグ出力
      console.log('=== E2E Test Case Debug ===');
      console.log('Message:', JSON.stringify(result.message));
      console.log('Message length:', result.message.length);
      console.log('Args:', JSON.stringify(result.args));
      console.log('Args length:', result.args.length);

      // 空文字列は文字列型なのでメッセージに含まれるが、
      // 最終的にtrim()されるので末尾空白は削除される
      expect(result.message).toBe('Empty structures test');
      expect(result.args).toEqual([{}, []]);
    });
  });

  describe('Timestamp handling (compatible with AgLoggerGetMessage)', () => {
    it('should use provided timestamp if first argument is valid ISO string', () => {
      const timestampStr = '2025-07-22T02:45:00.000Z';
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.INFO,
        timestampStr,
        'test message',
      );

      expect(result.timestamp).toEqual(new Date(timestampStr));
      expect(result.message).toBe('test message');
    });

    it('should use current time if no timestamp provided', () => {
      const before = new Date();
      const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test message');
      const after = new Date();

      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(result.message).toBe('test message');
    });

    it('should treat invalid timestamp as regular string argument', () => {
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.INFO,
        'not-a-timestamp',
        'test message',
      );

      expect(result.message).toBe('not-a-timestamp test message');
    });
  });
});
