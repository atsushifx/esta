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
import { MockLogger } from '../MockLogger';

// test main
describe('MockLogger', () => {
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = new MockLogger();
  });

  describe('logging methods', () => {
    it('should capture fatal messages', () => {
      mockLogger.fatal('fatal error');
      expect(mockLogger.getMessages(AG_LOGLEVEL.FATAL)).toEqual(['fatal error']);
    });

    it('should capture error messages', () => {
      mockLogger.error('error message');
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error message']);
    });

    it('should capture warn messages', () => {
      mockLogger.warn('warning message');
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['warning message']);
    });

    it('should capture info messages', () => {
      mockLogger.info('info message');
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info message']);
    });

    it('should capture debug messages', () => {
      mockLogger.debug('debug message');
      expect(mockLogger.getMessages(AG_LOGLEVEL.DEBUG)).toEqual(['debug message']);
    });

    it('should capture trace messages', () => {
      mockLogger.trace('trace message');
      expect(mockLogger.getMessages(AG_LOGLEVEL.TRACE)).toEqual(['trace message']);
    });
  });

  describe('query methods', () => {
    beforeEach(() => {
      mockLogger.error('first error');
      mockLogger.error('second error');
      mockLogger.info('info message');
    });

    it('should get messages for specific log level', () => {
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['first error', 'second error']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info message']);
    });

    it('should get last message for specific log level', () => {
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBe('second error');
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.INFO)).toBe('info message');
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.WARN)).toBeNull();
    });

    it('should get all messages', () => {
      const allMessages = mockLogger.getAllMessages();
      expect(allMessages.ERROR).toEqual(['first error', 'second error']);
      expect(allMessages.INFO).toEqual(['info message']);
      expect(allMessages.WARN).toEqual([]);
    });

    it('should get message count for specific log level', () => {
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.ERROR)).toBe(2);
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(1);
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.WARN)).toBe(0);
    });

    it('should get total message count', () => {
      expect(mockLogger.getTotalMessageCount()).toBe(3);
    });

    it('should check if has messages for specific log level', () => {
      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(true);
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      expect(mockLogger.hasMessages(AG_LOGLEVEL.WARN)).toBe(false);
    });

    it('should check if has any messages', () => {
      expect(mockLogger.hasAnyMessages()).toBe(true);

      const emptyLogger = new MockLogger();
      expect(emptyLogger.hasAnyMessages()).toBe(false);
    });
  });

  describe('utility methods', () => {
    beforeEach(() => {
      mockLogger.error('error message');
      mockLogger.info('info message');
    });

    it('should clear messages for specific log level', () => {
      mockLogger.clearMessages(AG_LOGLEVEL.ERROR);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual([]);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info message']);
    });

    it('should clear all messages', () => {
      mockLogger.clearAllMessages();
      expect(mockLogger.hasAnyMessages()).toBe(false);
      expect(mockLogger.getTotalMessageCount()).toBe(0);
    });
  });

  describe('logger function creation', () => {
    it('should create logger function that logs to info level', () => {
      const loggerFn = mockLogger.createLoggerFunction();
      loggerFn('test message');

      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['test message']);
    });

    it('should create logger map with level-specific functions', () => {
      const loggerMap = mockLogger.createLoggerMap();

      loggerMap[AG_LOGLEVEL.ERROR]?.('error message');
      loggerMap[AG_LOGLEVEL.WARN]?.('warn message');

      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['warn message']);
    });

    it('should handle OFF level as no-op in logger map', () => {
      const loggerMap = mockLogger.createLoggerMap();

      // OFF level should be a no-op function
      loggerMap[AG_LOGLEVEL.OFF]?.('this should not be logged');

      expect(mockLogger.hasAnyMessages()).toBe(false);
    });
  });

  describe('legacy methods', () => {
    beforeEach(() => {
      mockLogger.error('first error');
      mockLogger.error('second error');
    });

    it('should get error messages using legacy method', () => {
      expect(mockLogger.getErrorMessages()).toEqual(['first error', 'second error']);
    });

    it('should get last error message using legacy method', () => {
      expect(mockLogger.getLastErrorMessage()).toBe('second error');
    });

    it('should clear error messages using legacy method', () => {
      mockLogger.clearErrorMessages();
      expect(mockLogger.getErrorMessages()).toEqual([]);
    });
  });

  describe('immutability', () => {
    it('should return copies of message arrays to prevent external modification', () => {
      mockLogger.error('error message');
      const messages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);

      // Modifying the returned array should not affect internal state
      messages.push('external modification');

      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error message']);
    });

    it('should return copies in getAllMessages to prevent external modification', () => {
      mockLogger.error('error message');
      const allMessages = mockLogger.getAllMessages();

      // Modifying the returned array should not affect internal state
      allMessages.ERROR.push('external modification');

      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error message']);
    });
  });
});
