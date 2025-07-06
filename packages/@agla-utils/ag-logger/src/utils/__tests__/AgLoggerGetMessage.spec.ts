// src/__tests__/AgLoggerGetName.spec.ts
// @(#) : Unit tests for AgLoggerGetMessage function
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// constants
import { AgLogLevelCode } from '@shared/types/AgLogger.types';

// test target
import { AgLoggerGetMessage } from '../AgLoggerGetMessage';

/**
 * Unit tests for the AgLoggerGetMessage function.
 * Verifies correct parsing and structuring of log messages
 * from variable input arguments including primitives, objects, and timestamps.
 */
describe('AgLoggerGetMessage', () => {
  /**
   * Tests typical log messages without object parameters.
   */
  describe('Normal log messages (no objects in arguments)', () => {
    /**
     * Concatenates multiple primitive arguments into a single message string.
     */
    it('concatenates user id argument', () => {
      const userid = 'u1029165';
      const result = AgLoggerGetMessage(AgLogLevelCode.INFO, 'userid=', userid);
      expect(result.logLevel).toEqual(AgLogLevelCode.INFO);
      expect(result.message).toEqual('userid=u1029165');
      expect(result.args).toEqual([]);
    });

    /**
     * Tests template string expansion in message arguments.
     */
    it('handles variable interpolation with backticks', () => {
      const userid = 'u1029165';
      const result = AgLoggerGetMessage(AgLogLevelCode.DEBUG, `userid=${userid}`);

      expect(result.logLevel).toEqual(AgLogLevelCode.DEBUG);
      expect(result.message).toEqual('userid=u1029165');
      expect(result.args).toEqual([]);
    });

    /**
     * Concatenates multiple primitive parameters into one message.
     */
    it('concatenates multiple parameters', () => {
      const dtDate = '2022-06-10';
      const dtTime = '10:30:00';
      const result = AgLoggerGetMessage(AgLogLevelCode.WARN, 'date:', dtDate, ' time:', dtTime);
      expect(result.logLevel).toEqual(AgLogLevelCode.WARN);
      expect(result.message).toEqual('date:2022-06-10 time:10:30:00');
      expect(result.args).toEqual([]);
    });

    /**
     * Handles multiple primitive types concatenated into message string.
     */
    it('handles primitive types', () => {
      const result = AgLoggerGetMessage(AgLogLevelCode.ERROR, 'number:', 123, ' string:', 'abc', ' boolean:', true);
      expect(result.logLevel).toEqual(AgLogLevelCode.ERROR);
      expect(result.message).toEqual('number:123 string:abc boolean:true');
      expect(result.args).toEqual([]);
    });
  });

  /**
   * Tests log messages with object arguments.
   */
  describe('Log messages with parameters (simple object attached)', () => {
    /**
     * Processes a simple object as a separate argument.
     */
    it('processes a simple object', () => {
      const result = AgLoggerGetMessage(AgLogLevelCode.TRACE, 'user:', { name: 'John Doe' });
      expect(result.logLevel).toEqual(AgLogLevelCode.TRACE);
      expect(result.message).toEqual('user:');
      expect(result.args).toEqual([{ name: 'John Doe' }]);
    });
  });

  /**
   * Tests log messages with timestamp prefix.
   */
  describe('Messages with timestamp', () => {
    /**
     * Parses ISO datetime string as timestamp.
     */
    it('sets timestamp when first argument is ISO datetime string', () => {
      const timestampStr = '2025-01-15T10:30:00.000Z';
      const result = AgLoggerGetMessage(AgLogLevelCode.FATAL, timestampStr, 'test message');

      expect(result.logLevel).toEqual(AgLogLevelCode.FATAL);
      expect(result.message).toEqual('test message');
      expect(result.timestamp).toEqual(new Date(timestampStr));
      expect(result.args).toEqual([]);
    });

    /**
     * Parses other valid datetime string as timestamp.
     */
    it('sets timestamp when first argument is valid datetime string', () => {
      const timestampStr = '2025-06-18 15:45:30';
      const result = AgLoggerGetMessage(AgLogLevelCode.INFO, timestampStr, 'log entry');

      expect(result.logLevel).toEqual(AgLogLevelCode.INFO);
      expect(result.message).toEqual('log entry');
      expect(result.timestamp).toEqual(new Date(timestampStr));
      expect(result.args).toEqual([]);
    });

    /**
     * Handles multiple arguments and object with timestamp.
     */
    it('handles multiple arguments and object with timestamp', () => {
      const timestampStr = '2025-01-01T00:00:00.000Z';
      const result = AgLoggerGetMessage(AgLogLevelCode.DEBUG, timestampStr, 'user:', 'john', { id: 123 });

      expect(result.logLevel).toEqual(AgLogLevelCode.DEBUG);
      expect(result.message).toEqual('user:john');
      expect(result.timestamp).toEqual(new Date(timestampStr));
      expect(result.args).toEqual([{ id: 123 }]);
    });
  });
});
