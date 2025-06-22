// src/tests/e2e/AgLogger.json.spec.ts
// @(#) : AgLogger E2E Test - JSON format with Console logger
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { beforeEach, describe, expect, it, vi } from 'vitest';

// constants
import { AgLogLevelCode } from '../../shared/types';
// test targets
import { getLogger } from '../../src/AgLogger.class';
import { JsonFormat } from '../../src/plugins/format/JsonFormat';
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
 * End-to-end tests verifying the integration of AgLogger with JsonFormat and ConsoleLogger.
 * These tests cover log output correctness for various log levels, handling of multiple
 * arguments, log level filtering behavior, JSON format specifics, and realistic integration
 * scenarios to ensure logging behaves as expected in a production-like environment.
 */
describe('AgLogger E2E Tests - JSON Format with Console Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  /**
   * Tests that logs at each level output correctly formatted JSON strings,
   * with proper level, message, and timestamp fields.
   */
  describe('Basic JSON log output tests', () => {
    it('outputs INFO log as JSON with JsonFormat and ConsoleLogger', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.info('Test message');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'Test message',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('outputs ERROR log as JSON with JsonFormat and ConsoleLogger', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.ERROR);

      logger.error('Error message');

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.error.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'ERROR',
        message: 'Error message',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('outputs WARN log as JSON with JsonFormat and ConsoleLogger', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.WARN);

      logger.warn('Warning message');

      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.warn.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'WARN',
        message: 'Warning message',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('outputs DEBUG log as JSON with JsonFormat and ConsoleLogger', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.DEBUG);

      logger.debug('Debug message');

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.debug.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'DEBUG',
        message: 'Debug message',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  /**
   * Tests that JSON log output correctly includes multiple argument types
   * such as objects, arrays, and primitives, correctly separated into message and args.
   */
  describe('JSON log output tests with multiple arguments', () => {
    it('logs JSON message containing object and string', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      const userData = { userId: 123, userName: 'testUser' };
      logger.info('User info', userData, ' additional info');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'User info additional info',
        args: [{ userId: 123, userName: 'testUser' }],
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('logs JSON message containing array', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.DEBUG);

      const items = ['item1', 'item2', 'item3'];
      logger.debug('Processing items', items);

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.debug.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'DEBUG',
        message: 'Processing items',
        args: [['item1', 'item2', 'item3']],
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('logs JSON message containing number and boolean', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.info('Status update', 42, true, null);

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'Status update42true',
        args: [null],
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  /**
   * Tests the filtering of logs according to the configured log level,
   * ensuring lower-level logs are not emitted when the level is higher.
   */
  describe('JSON log level filtering tests', () => {
    it('does not output DEBUG logs when level is INFO', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.debug('Debug message');
      logger.info('Info message');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalledTimes(1);

      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);
      expect(parsedLog.level).toBe('INFO');
    });

    it('does not output INFO/WARN logs when level is ERROR', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.ERROR);

      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledTimes(1);

      const [logOutput] = mockConsole.error.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);
      expect(parsedLog.level).toBe('ERROR');
    });

    it('does not output any logs when level is OFF', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.OFF);

      logger.error('Error message');
      logger.info('Info message');

      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
    });
  });

  /**
   * Tests JSON format-specific behaviors such as omission of empty args
   * and correct serialization of nested complex objects.
   */
  describe('JSON format specific tests', () => {
    it('does not include args property when args array is empty', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.info('Simple message');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'Simple message',
        timestamp: expect.any(String),
      });
      expect(parsedLog).not.toHaveProperty('args');
    });

    it('correctly outputs deeply nested complex objects in JSON', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      const complexData = {
        user: {
          id: 123,
          profile: {
            name: 'Taro',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
        metadata: {
          version: '1.0.0',
          features: ['feature1', 'feature2'],
        },
      };

      logger.info('Complex data', complexData);

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'Complex data',
        args: [complexData],
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  /**
   * Tests a real-world sequence of log events from application startup
   * through error handling, verifying complete and correct JSON output.
   */
  describe('Real integration scenario tests (JSON version)', () => {
    it('outputs a sequence of JSON logs from application start to error', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.DEBUG);

      // Application start
      logger.info('Application is starting');

      // Config loading
      logger.debug('Loading config file', { configPath: '/app/config.json' });

      // Warning
      logger.warn('Using deprecated API', { api: 'oldMethod' });

      // Error
      logger.error('Failed to connect to database', {
        host: 'localhost',
        port: 5432,
        error: 'Connection timeout',
      });

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);

      // Validate JSON content of each log
      const infoLog = JSON.parse(mockConsole.info.mock.calls[0][0]);
      const debugLog = JSON.parse(mockConsole.debug.mock.calls[0][0]);
      const warnLog = JSON.parse(mockConsole.warn.mock.calls[0][0]);
      const errorLog = JSON.parse(mockConsole.error.mock.calls[0][0]);

      expect(infoLog).toMatchObject({
        level: 'INFO',
        message: 'Application is starting',
      });

      expect(debugLog).toMatchObject({
        level: 'DEBUG',
        message: 'Loading config file',
        args: [{ configPath: '/app/config.json' }],
      });

      expect(warnLog).toMatchObject({
        level: 'WARN',
        message: 'Using deprecated API',
        args: [{ api: 'oldMethod' }],
      });

      expect(errorLog).toMatchObject({
        level: 'ERROR',
        message: 'Failed to connect to database',
        args: [{
          host: 'localhost',
          port: 5432,
          error: 'Connection timeout',
        }],
      });

      // Validate timestamps
      [infoLog, debugLog, warnLog, errorLog].forEach((log) => {
        expect(log.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });

    it('verifies JSON output for generic log method (log)', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.log('General log message');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'General log message',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});
