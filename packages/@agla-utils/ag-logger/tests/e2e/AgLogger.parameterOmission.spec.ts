// src/tests/e2e/AgLogger.parameterOmission.spec.ts
// @(#) : AgLogger E2E Test - Parameter omission and setLogger functionality
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { beforeEach, describe, expect, it, vi } from 'vitest';

// constants
import { AG_LOG_LEVEL } from '../../shared/types';
// test targets
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
 * End-to-end tests for AgLogger covering parameter omission in getLogger calls
 * and setLogger method functionality.
 */
describe('AgLogger E2E Tests - Parameter Omission and setLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  /**
   * Tests that after initial configuration,
   * omitting all parameters in getLogger reuses previous settings.
   */
  describe('Parameter omission behavior in getLogger', () => {
    it('uses previous settings when all parameters are omitted after initial setup', () => {
      // Initial setup
      const logger1 = getLogger(ConsoleLogger, PlainFormat);
      logger1.setLogLevel(AG_LOG_LEVEL.INFO);
      logger1.info('Log after initial setup');

      // getLogger with all parameters omitted
      const logger2 = getLogger();
      logger2.info('Log after parameter omission in getLogger');

      expect(mockConsole.info).toHaveBeenCalledTimes(2);

      const [firstLog] = mockConsole.info.mock.calls[0];
      const [secondLog] = mockConsole.info.mock.calls[1];

      expect(firstLog).toMatch(/\[INFO\] Log after initial setup$/);
      expect(secondLog).toMatch(/\[INFO\] Log after parameter omission in getLogger$/);
    });

    it('uses previous settings when only partial parameters are omitted', () => {
      // Initial setup
      getLogger(ConsoleLogger, PlainFormat);

      // Omit formatter only
      const logger = getLogger(ConsoleLogger);
      logger.setLogLevel(AG_LOG_LEVEL.INFO);
      logger.info('Log after partial parameter omission');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/\[INFO\] Log after partial parameter omission$/);
    });

    it('ensures singleton behavior', () => {
      const logger1 = getLogger(ConsoleLogger, PlainFormat);
      const logger2 = getLogger();
      const logger3 = getLogger(ConsoleLogger);

      expect(logger1).toBe(logger2);
      expect(logger2).toBe(logger3);
    });
  });

  /**
   * Tests setLogger method's ability to update logger and formatter settings.
   */
  describe('setLogger method functionality', () => {
    it('updates all settings at once via setLogger', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOG_LEVEL.INFO);

      // Change settings via setLogger
      logger.setLogger({
        defaultLogger: ConsoleLogger,
        formatter: PlainFormat,
      });

      logger.info('Log after setLogger update');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/\[INFO\] Log after setLogger update$/);
    });

    it('updates partial settings via setLogger', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOG_LEVEL.INFO);

      // Change only formatter
      logger.setLogger({
        formatter: PlainFormat,
      });

      logger.info('Log after partial settings update');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/\[INFO\] Log after partial settings update$/);
    });

    it('updates only defaultLogger via setLogger', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOG_LEVEL.INFO);

      // Change only defaultLogger
      logger.setLogger({
        defaultLogger: ConsoleLogger,
      });

      logger.info('Log after defaultLogger update');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/\[INFO\] Log after defaultLogger update$/);
    });
  });

  /**
   * Tests combined usage scenarios of settings changes and parameter omission.
   */
  describe('Integration scenario tests', () => {
    it('combines setting changes and parameter omission', () => {
      // Initial setup
      const logger1 = getLogger(ConsoleLogger, PlainFormat);
      logger1.setLogLevel(AG_LOG_LEVEL.INFO);
      logger1.info('Initial setup');

      // Change settings via setLogger
      logger1.setLogger({
        formatter: PlainFormat,
      });
      logger1.info('After settings update');

      // getLogger with omitted parameters
      const logger2 = getLogger();
      logger2.info('After parameter omission');

      // Ensure same instance
      expect(logger1).toBe(logger2);

      expect(mockConsole.info).toHaveBeenCalledTimes(3);

      const logs = mockConsole.info.mock.calls.map((call) => call[0]);
      expect(logs[0]).toMatch(/\[INFO\] Initial setup$/);
      expect(logs[1]).toMatch(/\[INFO\] After settings update$/);
      expect(logs[2]).toMatch(/\[INFO\] After parameter omission$/);
    });

    it('overwrites settings via multiple setLogger calls', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOG_LEVEL.INFO);

      // First settings update
      logger.setLogger({
        defaultLogger: ConsoleLogger,
      });
      logger.info('First settings update');

      // Second settings update
      logger.setLogger({
        formatter: PlainFormat,
      });
      logger.info('Second settings update');

      expect(mockConsole.info).toHaveBeenCalledTimes(2);

      const logs = mockConsole.info.mock.calls.map((call) => call[0]);
      expect(logs[0]).toMatch(/\[INFO\] First settings update$/);
      expect(logs[1]).toMatch(/\[INFO\] Second settings update$/);
    });
  });
});
