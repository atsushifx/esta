// tests/e2e/E2EMockLoggerWithTestId.spec.ts
// @(#) : E2E tests for E2EMockLoggerWithTestId
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { createTestId, E2eMockLogger as E2EMockLoggerWithTestId } from '@/plugins/logger/E2eMockLogger';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../shared/types';
import { getLogger } from '../../src/AgLogger.class';
import { PlainFormat } from '../../src/plugins/format/PlainFormat';

describe('E2EMockLoggerWithTestId', () => {
  let mockLogger: E2EMockLoggerWithTestId;
  let testId: string;

  beforeEach(() => {
    testId = createTestId('e2e-test');
    mockLogger = new E2EMockLoggerWithTestId(testId);
  });

  afterEach(() => {
    mockLogger.cleanup();
  });

  describe('Basic logging functionality', () => {
    it('should capture log messages by level', () => {
      mockLogger.info('Test info message');
      mockLogger.error('Test error message');
      mockLogger.warn('Test warning message');

      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['Test info message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['Test error message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['Test warning message']);
    });

    it('should get last message correctly', () => {
      mockLogger.info('First info');
      mockLogger.info('Second info');
      mockLogger.info('Third info');

      expect(mockLogger.getLastMessage(AG_LOGLEVEL.INFO)).toBe('Third info');
    });

    it('should clear messages by level', () => {
      mockLogger.info('Test message');
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(1);

      mockLogger.clearMessages(AG_LOGLEVEL.INFO);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(0);
    });
  });

  describe('Test ID management', () => {
    it('should throw error when no test is active', () => {
      const tempTestId = createTestId('temp-test');
      const newMockLogger = new E2EMockLoggerWithTestId(tempTestId);

      // End the test to simulate no active test
      newMockLogger.endTest(tempTestId);

      expect(() => newMockLogger.info('Test')).toThrow('No active test. Call startTest() before logging.');
    });

    it('should clean up test data when endTest is called', () => {
      mockLogger.info('Test message');
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(1);

      mockLogger.endTest(testId);
      expect(mockLogger.hasActiveTest()).toBe(false);
      expect(mockLogger.getActiveTestIds()).not.toContain(testId);
    });

    it('should manage multiple tests independently', () => {
      const testId2 = createTestId('parallel-test');

      // Log to current test
      mockLogger.info('Message from test 1');

      // Start second test
      mockLogger.startTest(testId2);
      mockLogger.info('Message from test 2');

      // Check messages are independent
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO, testId)).toEqual(['Message from test 1']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO, testId2)).toEqual(['Message from test 2']);

      // Clean up
      mockLogger.endTest(testId2);
    });
  });

  describe('Plugin integration with ag-logger', () => {
    it('should work as AgLoggerFunction plugin', () => {
      const loggerFunction = mockLogger.createLoggerFunction();
      const logger = getLogger(loggerFunction, PlainFormat);

      logger.setLogLevel(AG_LOGLEVEL.INFO);
      logger.info('Test message via plugin');

      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatch(/Test message via plugin/);
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
      baseTestId: string,
      message: string,
    ): Promise<{ testId: string; messages: string[] }> {
      const parallelTestId = createTestId(baseTestId);
      const parallelMockLogger = new E2EMockLoggerWithTestId(parallelTestId);

      try {
        parallelMockLogger.info(message);

        // Simulate some async work
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 10));

        return {
          testId: parallelTestId,
          messages: parallelMockLogger.getMessages(AG_LOGLEVEL.INFO),
        };
      } finally {
        parallelMockLogger.endTest(parallelTestId);
      }
    };
  });

  describe('Utility functions', () => {
    it('should create unique test IDs', () => {
      const id1 = createTestId('test');
      const id2 = createTestId('test');

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^test-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^test-\d+-[a-z0-9]+$/);
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
    });
  });

  describe('Backward compatibility', () => {
    it('should support legacy error message methods', () => {
      mockLogger.error('Legacy error message');

      expect(mockLogger.getErrorMessages()).toEqual(['Legacy error message']);
      expect(mockLogger.getLastErrorMessage()).toBe('Legacy error message');

      mockLogger.clearErrorMessages();
      expect(mockLogger.getErrorMessages()).toHaveLength(0);
    });
  });
});
