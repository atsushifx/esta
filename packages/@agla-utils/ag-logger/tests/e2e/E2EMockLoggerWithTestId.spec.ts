// tests/e2e/E2EMockLoggerWithTestId.spec.ts
// @(#) : E2E tests for E2EMockLoggerWithTestId
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { E2eMockLogger as E2EMockLoggerWithTestId } from '@/plugins/logger/E2eMockLogger';
import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../shared/types';
import { getLogger } from '../../src/AgLogger.class';
import { PlainFormat } from '../../src/plugins/format/PlainFormat';

describe('E2EMockLoggerWithTestId', () => {
  describe('Basic logging functionality', () => {
    const mockLogger = new E2EMockLoggerWithTestId('basic-logging-test');

    it('should capture log messages by level', () => {
      mockLogger.info('Test info message');
      mockLogger.error('Test error message');
      mockLogger.warn('Test warning message');

      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['Test info message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['Test error message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['Test warning message']);

      mockLogger.cleanup();
    });

    it('should get last message correctly', () => {
      mockLogger.info('First info');
      mockLogger.info('Second info');
      mockLogger.info('Third info');

      expect(mockLogger.getLastMessage(AG_LOGLEVEL.INFO)).toBe('Third info');

      mockLogger.cleanup();
    });

    it('should clear messages by level', () => {
      mockLogger.info('Test message');
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(1);

      mockLogger.clearMessages(AG_LOGLEVEL.INFO);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(0);

      mockLogger.cleanup();
    });
  });

  describe('Test ID management', () => {
    const mockLogger = new E2EMockLoggerWithTestId('test-id-management');

    it('should get test ID', () => {
      const testId = mockLogger.getTestId();

      expect(mockLogger.getTestId()).toBe(testId);
      expect(testId).toMatch(/^test-id-management-\d+-[a-z0-9]+$/);

      mockLogger.cleanup();
    });

    it('should manage multiple tests independently', () => {
      const mockLogger2 = new E2EMockLoggerWithTestId('independent-test');

      // Log to first test
      mockLogger.info('Message from test 1');

      // Log to second test
      mockLogger2.info('Message from test 2');

      // Check messages are independent
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['Message from test 1']);
      expect(mockLogger2.getMessages(AG_LOGLEVEL.INFO)).toEqual(['Message from test 2']);

      mockLogger.cleanup();
      mockLogger2.cleanup();
    });
  });

  describe('Plugin integration with ag-logger', () => {
    const mockLogger = new E2EMockLoggerWithTestId('plugin-integration');

    it('should work as AgLoggerFunction plugin', () => {
      const loggerFunction = mockLogger.createLoggerFunction();
      const logger = getLogger(loggerFunction, PlainFormat);

      logger.setLogLevel(AG_LOGLEVEL.INFO);
      logger.info('Test message via plugin');

      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatch(/Test message via plugin/);

      mockLogger.cleanup();
    });

    it('should work as AgLoggerMap plugin', () => {
      const loggerMap = mockLogger.createLoggerMap();
      const logger = getLogger(mockLogger.createLoggerFunction(), PlainFormat, loggerMap);

      logger.setLogLevel(AG_LOGLEVEL.DEBUG);
      logger.error('Error message');
      logger.warn('Warning message');
      logger.info('Info message');
      logger.debug('Debug message');

      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toHaveLength(1);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toHaveLength(1);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(1);
      expect(mockLogger.getMessages(AG_LOGLEVEL.DEBUG)).toHaveLength(1);

      mockLogger.cleanup();
    });
  });

  describe('Parallel execution simulation', () => {
    it('should handle concurrent test execution without interference', async () => {
      const testResults = await Promise.all([
        simulateParallelTest('test-1', 'Message from test 1'),
        simulateParallelTest('test-2', 'Message from test 2'),
        simulateParallelTest('test-3', 'Message from test 3'),
      ]);

      // Each test should have captured only its own message
      testResults.forEach(({ testId: _resultTestId, messages }, index) => {
        expect(messages).toEqual([`Message from test ${index + 1}`]);
      });
    });

    const simulateParallelTest = async function(
      identifier: string,
      message: string,
    ): Promise<{ testId: string; messages: string[] }> {
      const parallelMockLogger = new E2EMockLoggerWithTestId(identifier);

      try {
        parallelMockLogger.info(message);

        // Simulate some async work
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 10));

        return {
          testId: parallelMockLogger.getTestId(),
          messages: parallelMockLogger.getMessages(AG_LOGLEVEL.INFO),
        };
      } finally {
        parallelMockLogger.cleanup();
      }
    };
  });

  describe('Utility functions', () => {
    const mockLogger = new E2EMockLoggerWithTestId('utility-functions');

    it('should create unique test IDs', () => {
      const logger2 = new E2EMockLoggerWithTestId('utility-functions');

      const id1 = mockLogger.getTestId();
      const id2 = logger2.getTestId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^utility-functions-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^utility-functions-\d+-[a-z0-9]+$/);

      mockLogger.cleanup();
      logger2.cleanup();
    });

    it('should get all messages for a test', () => {
      mockLogger.info('Info message');
      mockLogger.error('Error message');
      mockLogger.warn('Warning message');

      const allMessages = mockLogger.getAllMessages();

      expect(allMessages.INFO).toEqual(['Info message']);
      expect(allMessages.ERROR).toEqual(['Error message']);
      expect(allMessages.WARN).toEqual(['Warning message']);
      expect(allMessages.DEBUG).toEqual([]);

      mockLogger.cleanup();
    });
  });
});
