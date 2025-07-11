// src/__tests__/AgLoggerManager.spec.ts
// @(#) : Unit tests for AgLoggerManager class
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// constants
import { AgLogLevelCode } from '../../shared/types';
// types
import type { AgLogLevel } from '../../shared/types';

// test target
import { AgLoggerManager } from '../AgLoggerManager.class';

// mock functions for testing
const mockDefaultLogger = vi.fn();
const mockFatalLogger = vi.fn();
const mockErrorLogger = vi.fn();
const mockWarnLogger = vi.fn();
const mockDebugLogger = vi.fn();
const mockFormatter = vi.fn();

/**
 * Unit tests for AgLoggerManager singleton class.
 * Tests singleton behavior, logger and formatter retrieval,
 * and various ways to set and update loggers and formatters.
 */
describe('AgLoggerManager', () => {
  /**
   * Clears mocks and resets the singleton instance before each test.
   */
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (AgLoggerManager as unknown as { instance?: AgLoggerManager }).instance = undefined;
  });

  /**
   * Clears mocks and resets the singleton instance after each test.
   */
  afterEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (AgLoggerManager as unknown as { instance?: AgLoggerManager }).instance = undefined;
  });

  /**
   * Tests for the static method getInstance.
   * Checks singleton property, initial default logger setup,
   * and handling of input parameters such as default logger,
   * formatter, and logger map.
   */
  describe('getInstance', () => {
    it('returns the singleton instance', () => {
      const instance1 = AgLoggerManager.getInstance();
      const instance2 = AgLoggerManager.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(AgLoggerManager);
    });

    it('initially sets all log levels to NullLogger', () => {
      const manager = AgLoggerManager.getInstance();

      const offLogger = manager.getLogger(AgLogLevelCode.OFF);
      const fatalLogger = manager.getLogger(AgLogLevelCode.FATAL);
      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const warnLogger = manager.getLogger(AgLogLevelCode.WARN);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);
      const debugLogger = manager.getLogger(AgLogLevelCode.DEBUG);
      const traceLogger = manager.getLogger(AgLogLevelCode.TRACE);

      expect(typeof offLogger).toBe('function');
      expect(typeof fatalLogger).toBe('function');
      expect(typeof errorLogger).toBe('function');
      expect(typeof warnLogger).toBe('function');
      expect(typeof infoLogger).toBe('function');
      expect(typeof debugLogger).toBe('function');
      expect(typeof traceLogger).toBe('function');
    });

    it('accepts default logger when getting instance', () => {
      const manager = AgLoggerManager.getInstance(mockDefaultLogger);

      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);
      infoLogger('test message');

      expect(mockDefaultLogger).toHaveBeenCalledWith('test message');
    });

    it('accepts formatter when getting instance', () => {
      const manager = AgLoggerManager.getInstance(undefined, mockFormatter);

      const formatter = manager.getFormatter();
      expect(formatter).toBe(mockFormatter);
    });

    it('accepts logger map when getting instance', () => {
      const loggerMap = {
        [AgLogLevelCode.ERROR]: mockErrorLogger,
        [AgLogLevelCode.WARN]: mockWarnLogger,
      };

      const manager = AgLoggerManager.getInstance(mockDefaultLogger, undefined, loggerMap);

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const warnLogger = manager.getLogger(AgLogLevelCode.WARN);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);

      errorLogger('error message');
      warnLogger('warn message');
      infoLogger('info message');

      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
      expect(mockWarnLogger).toHaveBeenCalledWith('warn message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
    });

    it('accepts all options when getting instance', () => {
      const loggerMap = {
        [AgLogLevelCode.FATAL]: mockFatalLogger,
        [AgLogLevelCode.ERROR]: mockErrorLogger,
      };

      const manager = AgLoggerManager.getInstance(mockDefaultLogger, mockFormatter, loggerMap);

      expect(manager.getFormatter()).toBe(mockFormatter);

      const fatalLogger = manager.getLogger(AgLogLevelCode.FATAL);
      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);

      fatalLogger('fatal message');
      errorLogger('error message');
      infoLogger('info message');

      expect(mockFatalLogger).toHaveBeenCalledWith('fatal message');
      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
    });
  });

  /**
   * Tests for getLogger method.
   * Ensures logger function is returned for valid levels,
   * and default logger is returned for unknown levels.
   */
  describe('getLogger', () => {
    it('returns logger function for specified log level', () => {
      const manager = AgLoggerManager.getInstance(mockDefaultLogger);

      const logger = manager.getLogger(AgLogLevelCode.INFO);
      expect(typeof logger).toBe('function');

      logger('test message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('test message');
    });

    it('returns default logger if log level does not exist', () => {
      const manager = AgLoggerManager.getInstance(mockDefaultLogger);

      const logger = manager.getLogger(999 as AgLogLevel);
      expect(logger).toBe(mockDefaultLogger);
    });
  });

  /**
   * Tests for getFormatter method.
   * Ensures configured formatter is returned,
   * or defaults to NullFormat formatter.
   */
  describe('getFormatter', () => {
    it('returns the configured formatter', () => {
      const manager = AgLoggerManager.getInstance(undefined, mockFormatter);

      const formatter = manager.getFormatter();
      expect(formatter).toBe(mockFormatter);
    });

    it('defaults to NullFormat formatter', () => {
      const manager = AgLoggerManager.getInstance();

      const formatter = manager.getFormatter();
      expect(typeof formatter).toBe('function');
    });
  });

  /**
   * Tests for setLogger method in legacy form.
   * Sets logger for specified log level or defaults when null is given.
   */
  describe('setLogger - legacy form', () => {
    it('sets logger for specified log level', () => {
      const manager = AgLoggerManager.getInstance();

      manager.setLogger(AgLogLevelCode.ERROR, mockErrorLogger);

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      errorLogger('error message');

      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
    });

    it('sets default logger if null is specified', () => {
      const manager = AgLoggerManager.getInstance(mockDefaultLogger);

      manager.setLogger(AgLogLevelCode.ERROR, null);

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      errorLogger('error message');

      expect(mockDefaultLogger).toHaveBeenCalledWith('error message');
    });
  });

  /**
   * Tests for setLogger method in options form.
   * Updates default logger, formatter, logger map, or all simultaneously.
   */
  describe('setLogger - options form', () => {
    it('updates default logger', () => {
      const manager = AgLoggerManager.getInstance();

      manager.setLogger({ defaultLogger: mockDefaultLogger });

      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);
      infoLogger('info message');

      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
    });

    it('updates formatter', () => {
      const manager = AgLoggerManager.getInstance();

      manager.setLogger({ formatter: mockFormatter });

      const formatter = manager.getFormatter();
      expect(formatter).toBe(mockFormatter);
    });

    it('updates logger map', () => {
      const manager = AgLoggerManager.getInstance();

      const loggerMap = {
        [AgLogLevelCode.ERROR]: mockErrorLogger,
        [AgLogLevelCode.WARN]: mockWarnLogger,
      };

      manager.setLogger({ loggerMap });

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const warnLogger = manager.getLogger(AgLogLevelCode.WARN);

      errorLogger('error message');
      warnLogger('warn message');

      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
      expect(mockWarnLogger).toHaveBeenCalledWith('warn message');
    });

    it('updates all options at once', () => {
      const manager = AgLoggerManager.getInstance();

      const loggerMap = {
        [AgLogLevelCode.FATAL]: mockFatalLogger,
        [AgLogLevelCode.DEBUG]: mockDebugLogger,
      };

      manager.setLogger({
        defaultLogger: mockDefaultLogger,
        formatter: mockFormatter,
        loggerMap,
      });

      expect(manager.getFormatter()).toBe(mockFormatter);

      const fatalLogger = manager.getLogger(AgLogLevelCode.FATAL);
      const debugLogger = manager.getLogger(AgLogLevelCode.DEBUG);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);

      fatalLogger('fatal message');
      debugLogger('debug message');
      infoLogger('info message');

      expect(mockFatalLogger).toHaveBeenCalledWith('fatal message');
      expect(mockDebugLogger).toHaveBeenCalledWith('debug message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
    });

    it('updates default logger and logger map simultaneously', () => {
      const manager = AgLoggerManager.getInstance();

      const loggerMap = {
        [AgLogLevelCode.ERROR]: mockErrorLogger,
      };

      manager.setLogger({
        defaultLogger: mockDefaultLogger,
        loggerMap,
      });

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);
      const warnLogger = manager.getLogger(AgLogLevelCode.WARN);

      errorLogger('error message');
      infoLogger('info message');
      warnLogger('warn message');

      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('warn message');
    });
  });

  /**
   * Tests complex scenarios.
   * Ensures settings can be updated after instance creation,
   * and multiple setLogger calls work without errors.
   */
  describe('Complex scenarios', () => {
    it('can update settings after getInstance', () => {
      const manager = AgLoggerManager.getInstance(mockDefaultLogger);

      manager.setLogger(AgLogLevelCode.ERROR, mockErrorLogger);
      manager.setLogger({ formatter: mockFormatter });

      expect(manager.getFormatter()).toBe(mockFormatter);

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);

      errorLogger('error message');
      infoLogger('info message');

      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
    });

    it('can call setLogger multiple times without issue', () => {
      const manager = AgLoggerManager.getInstance();

      manager.setLogger({ defaultLogger: mockDefaultLogger });
      manager.setLogger(AgLogLevelCode.ERROR, mockErrorLogger);
      manager.setLogger({ formatter: mockFormatter });

      const secondMockLogger = vi.fn();
      manager.setLogger(AgLogLevelCode.WARN, secondMockLogger);

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const warnLogger = manager.getLogger(AgLogLevelCode.WARN);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);

      errorLogger('error message');
      warnLogger('warn message');
      infoLogger('info message');

      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
      expect(secondMockLogger).toHaveBeenCalledWith('warn message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
      expect(manager.getFormatter()).toBe(mockFormatter);
    });
  });
});
