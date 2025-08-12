// src/utils/__tests__/agLogHelpers/createLoggerFunction.spec.ts
// @(#) : BDD Tests for createLoggerFunction utility

import { beforeEach, describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import { AgMockBufferLogger } from '../../../plugins/logger/MockLogger';
import { createLoggerFunction } from '../../AgLogHelpers';

describe('createLoggerFunction', () => {
  let mockLogger: AgMockBufferLogger;
  let loggerFunc: ReturnType<typeof createLoggerFunction>;

  beforeEach(() => {
    mockLogger = new AgMockBufferLogger();
    loggerFunc = createLoggerFunction((level, message) => mockLogger.executeLog(level, message));
  });

  describe('When creating logger functions for loggerMap registration', () => {
    it('should create a function compatible with AgLoggerFunction interface', () => {
      expect(typeof loggerFunc).toBe('function');
      expect(loggerFunc.length).toBe(1);
    });

    it('should call executeLog with default INFO level and provided message', () => {
      loggerFunc('test message');

      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBe('test message');
    });
  });

  describe('When handling different message types', () => {
    it('should handle string messages', () => {
      loggerFunc('string message');

      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toContain('string message');
    });

    it('should handle AgLogMessage objects', () => {
      const logMessage = {
        logLevel: AG_LOGLEVEL.ERROR,
        timestamp: new Date(),
        message: 'error message',
        args: [],
      };

      loggerFunc(logMessage);

      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toContain(logMessage);
    });

    it('should handle empty string messages', () => {
      loggerFunc('');

      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toContain('');
    });
  });

  describe('When handling multiple calls', () => {
    it('should handle successive calls correctly', () => {
      loggerFunc('first message');
      loggerFunc('second message');
      loggerFunc('third message');

      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages).toHaveLength(3);
      expect(messages).toEqual(['first message', 'second message', 'third message']);
    });
  });
});
