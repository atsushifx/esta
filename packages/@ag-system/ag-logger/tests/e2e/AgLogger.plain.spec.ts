// src/tests/e2e/AgLogger.e2e.spec.ts
// @(#) : AgLogger E2E Test - Plain Format with Console Logger
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { beforeEach, describe, expect, it, vi } from 'vitest';

// constants
import { AgLogLevelCode } from '../../shared/types';
// test unit
import { getLogger } from '../../src/AgLogger.class';
import { PlainFormat } from '../../src/plugins/format/PlainFormat';
import { ConsoleLogger } from '../../src/plugins/logger/ConsoleLogger';

// mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  log: vi.fn(),
};

/**
 * End-to-end tests for AgLogger integration with PlainFormat and ConsoleLogger.
 * Tests cover basic log output, multiple arguments, log level filtering,
 * error handling with circular references, and real-world integration scenarios.
 */
describe('AgLogger E2E Tests - Plain Format with Console Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  /**
   * Tests basic logging functionality using PlainFormat with ConsoleLogger
   * ensuring output matches expected timestamp, level, and message pattern.
   */
  describe('Basic log output tests', () => {
    it('outputs INFO log using PlainFormat and ConsoleLogger', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.info('Test message');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] Test message$/);
    });

    it('outputs ERROR log using PlainFormat and ConsoleLogger', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.ERROR);

      logger.error('Error message');

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.error.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[ERROR\] Error message$/);
    });

    it('outputs WARN log using PlainFormat and ConsoleLogger', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.WARN);

      logger.warn('Warning message');

      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.warn.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[WARN\] Warning message$/);
    });

    it('outputs DEBUG log using PlainFormat and ConsoleLogger', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.DEBUG);

      logger.debug('Debug message');

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.debug.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[DEBUG\] Debug message$/);
    });
  });

  /**
   * Tests logging of messages that include multiple arguments
   * such as objects and arrays, verifying correct formatting of output.
   */
  describe('Log output tests with multiple arguments', () => {
    it('logs message containing object and string', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      const userData = { userId: 123, userName: 'testUser' };
      logger.info('User data', userData, ' additional info');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] User data additional info \{"userId":123,"userName":"testUser"\}$/,
      );
    });

    it('logs message containing an array', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.DEBUG);

      const items = ['item1', 'item2', 'item3'];
      logger.debug('Items to process', items);

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.debug.mock.calls[0];
      expect(logOutput).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[DEBUG\] Items to process \["item1","item2","item3"\]$/,
      );
    });
  });

  /**
   * Tests log level filtering behavior ensuring logs below
   * the configured level are not output.
   */
  describe('Log level filtering tests', () => {
    it('does not output DEBUG logs when level is INFO', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.debug('Debug message');
      logger.info('Info message');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });

    it('does not output INFO/WARN logs when level is ERROR', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.ERROR);

      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('does not output any logs when level is OFF', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.OFF);

      logger.error('Error message');
      logger.info('Info message');

      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
    });
  });

  /**
   * Tests error handling when logging circular reference objects.
   */
  describe('Error handling tests', () => {
    it('throws error when logging circular reference objects', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      const circularObj: { name: string; self?: unknown } = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => {
        logger.info('Circular reference test', circularObj);
      }).toThrow();
    });
  });

  /**
   * Tests a full integration scenario from application start
   * to error occurrence, verifying proper logging output.
   */
  describe('Full integration scenario tests', () => {
    it('logs a sequence from app start to error occurrence', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.DEBUG);

      // Application start
      logger.info('Starting application');

      // Config loading
      logger.debug('Loading config file', { configPath: '/app/config.json' });

      // Warning
      logger.warn('Using deprecated API', { api: 'oldMethod' });

      // Error occurrence
      logger.error('Failed to connect to database', {
        host: 'localhost',
        port: 5432,
        error: 'Connection timeout',
      });

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);

      // Verify each log content
      const infoLog = mockConsole.info.mock.calls[0][0];
      const debugLog = mockConsole.debug.mock.calls[0][0];
      const warnLog = mockConsole.warn.mock.calls[0][0];
      const errorLog = mockConsole.error.mock.calls[0][0];

      expect(infoLog).toMatch(/\[INFO\] Starting application$/);
      expect(debugLog).toMatch(/\[DEBUG\] Loading config file \{"configPath":"\/app\/config\.json"\}$/);
      expect(warnLog).toMatch(/\[WARN\] Using deprecated API \{"api":"oldMethod"\}$/);
      expect(errorLog).toMatch(
        /\[ERROR\] Failed to connect to database \{"host":"localhost","port":5432,"error":"Connection timeout"\}$/,
      );
    });

    it('verifies log method (log) functionality', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.log('General log message');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] General log message$/);
    });
  });
});
