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

    describe('Date parsing edge cases', () => {
      it('should treat "today" as regular string, not as timestamp', () => {
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.INFO,
          'today',
          'is a good day',
        );

        expect(result.message).toBe('today is a good day');
        expect(result.timestamp).toBeInstanceOf(Date);
        expect(result.timestamp.getTime()).not.toBeNaN();
      });

      it('should treat "now" as regular string, not as timestamp', () => {
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.WARN,
          'now',
          'processing',
        );

        expect(result.message).toBe('now processing');
      });

      it('should treat "yesterday" as regular string, not as timestamp', () => {
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.DEBUG,
          'yesterday',
          'was better',
        );

        expect(result.message).toBe('yesterday was better');
      });

      it('should treat "tomorrow" as regular string, not as timestamp', () => {
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.ERROR,
          'tomorrow',
          'never comes',
        );

        expect(result.message).toBe('tomorrow never comes');
      });

      it('should treat partial date strings as regular strings', () => {
        const testCases = [
          'Jan',
          'January',
          'Mon',
          'Monday',
          '2025',
          'Dec 25',
          '25/12',
          '12/25',
        ];

        testCases.forEach((dateStr) => {
          const result = parseArgsToAgLogMessage(
            AG_LOGLEVEL.INFO,
            dateStr,
            'test',
          );

          expect(result.message).toBe(`${dateStr} test`);
        });
      });

      it('should treat ambiguous date-like strings as regular strings', () => {
        const ambiguousStrings = [
          '01/02/03', // Could be various date formats
          '1/1/1', // Minimal date format
          '99/99/99', // Invalid date values
          '13/25/2025', // Invalid month/day
          '2025-13-01', // Invalid month
          '2025-01-32', // Invalid day
        ];

        ambiguousStrings.forEach((dateStr) => {
          const result = parseArgsToAgLogMessage(
            AG_LOGLEVEL.WARN,
            dateStr,
            'might be date',
          );

          expect(result.message).toBe(`${dateStr} might be date`);
        });
      });

      it('should treat numeric timestamp strings as regular strings', () => {
        const numericTimestamp = '1640995200000'; // Unix timestamp in milliseconds
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.INFO,
          numericTimestamp,
          'unix time test',
        );

        expect(result.message).toBe(`${numericTimestamp} unix time test`);
        expect(result.timestamp).toBeInstanceOf(Date);
      });

      it('should treat invalid numeric strings as regular strings', () => {
        const invalidNumbers = [
          'NaN',
          'Infinity',
          '-Infinity',
          '1.5.3', // Invalid decimal format
          '1e999', // Number too large
        ];

        invalidNumbers.forEach((numStr) => {
          const result = parseArgsToAgLogMessage(
            AG_LOGLEVEL.ERROR,
            numStr,
            'not a number',
          );

          expect(result.message).toBe(`${numStr} not a number`);
        });
      });

      it('should handle empty and whitespace-only timestamp candidates', () => {
        const whitespaceStrings = [
          '', // Empty string
          ' ', // Single space
          '\t', // Tab
          '\n', // Newline
          '   ', // Multiple spaces
          '\t\n ', // Mixed whitespace
        ];

        whitespaceStrings.forEach((wsStr) => {
          const result = parseArgsToAgLogMessage(
            AG_LOGLEVEL.TRACE,
            wsStr,
            'whitespace test',
          );

          // Empty/whitespace strings should be treated as message arguments
          if (wsStr.trim() === '') {
            expect(result.message).toBe('whitespace test');
          } else {
            expect(result.message).toBe(`${wsStr} whitespace test`);
          }
        });
      });

      it('should handle timezone-aware timestamps correctly', () => {
        const timezoneTimestamps = [
          '2025-07-22T02:45:00+09:00', // JST
          '2025-07-22T02:45:00-05:00', // EST
          '2025-07-22T02:45:00Z', // UTC (Zulu)
        ];

        timezoneTimestamps.forEach((tzTimestamp) => {
          const result = parseArgsToAgLogMessage(
            AG_LOGLEVEL.INFO,
            tzTimestamp,
            'timezone test',
          );

          expect(result.timestamp).toEqual(new Date(tzTimestamp));
          expect(result.message).toBe('timezone test');
        });
      });

      it('should reject malformed ISO strings as timestamps', () => {
        const malformedISO = [
          '2025-07-22T25:45:00.000Z', // Invalid hour
          '2025-07-22T02:60:00.000Z', // Invalid minute
          '2025-07-22T02:45:60.000Z', // Invalid second
          '2025-13-22T02:45:00.000Z', // Invalid month
          '2025-07-32T02:45:00.000Z', // Invalid day
          '2025-07-22 02:45:00.000Z', // Missing 'T'
          '2025/07/22T02:45:00.000Z', // Wrong date separator
        ];

        malformedISO.forEach((isoStr) => {
          const result = parseArgsToAgLogMessage(
            AG_LOGLEVEL.ERROR,
            isoStr,
            'malformed ISO',
          );

          expect(result.message).toBe(`${isoStr} malformed ISO`);
        });
      });
    });
  });
});
