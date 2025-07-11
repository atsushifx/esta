// src/plugins/logger/__tests__/ConsoleLogger.spec.ts
// @(#) : Unit tests for ConsoleLogger plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest imports
import { beforeEach, describe, expect, it, vi } from 'vitest';

// constants
import { AgLogLevelCode } from '../../../../shared/types';

// test subject
import { ConsoleLogger, ConsoleLoggerMap } from '../ConsoleLogger';

// mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

/**
 * Unit tests for the default ConsoleLogger function.
 * Verifies that ConsoleLogger correctly delegates all arguments to console.log.
 */
describe('ConsoleLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  /**
   * Tests for the default ConsoleLogger function behavior.
   */
  describe('default ConsoleLogger function', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    /**
     * Ensures console.log is called with the provided arguments.
     */
    it('calls console.log with the given arguments', () => {
      ConsoleLogger('test message');
      expect(console.log).toHaveBeenCalledWith('test message');
    });

    /**
     * Ensures console.log is called correctly with an empty string.
     */
    it('works with empty string', () => {
      ConsoleLogger('');
      expect(console.log).toHaveBeenCalledWith('');
    });

    /**
     * Ensures console.log works with a single argument.
     */
    it('works with a single argument', () => {
      ConsoleLogger('single message');
      expect(console.log).toHaveBeenCalledWith('single message');
    });

    /**
     * Ensures the string message is preserved and logged once.
     */
    it('preserves string message', () => {
      const testMessage = 'test message';
      ConsoleLogger(testMessage);
      expect(console.log).toHaveBeenCalledWith(testMessage);
      expect(console.log).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Tests for ConsoleLoggerMap behavior mapping log levels to console methods.
   */
  describe('ConsoleLogger Map', () => {
    /**
     * Tests that the OFF level returns NullLogger.
     */
    it('returns NullLogger for OFF level', () => {
      expect(ConsoleLoggerMap[AgLogLevelCode.OFF]).toBeDefined();
      expect(typeof ConsoleLoggerMap[AgLogLevelCode.OFF]).toBe('function');
    });

    /**
     * Tests that console.error is called for FATAL level.
     */
    it('calls console.error for FATAL level', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.FATAL];
      expect(logFunction).toBeDefined();

      logFunction!('test fatal message');
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that console.error is called for ERROR level.
     */
    it('calls console.error for ERROR level', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.ERROR];
      expect(logFunction).toBeDefined();

      logFunction!('test error message');
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that console.warn is called for WARN level.
     */
    it('calls console.warn for WARN level', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.WARN];
      expect(logFunction).toBeDefined();

      logFunction!('test warn message');
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that console.info is called for INFO level.
     */
    it('calls console.info for INFO level', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.INFO];
      expect(logFunction).toBeDefined();

      logFunction!('test info message');
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that console.debug is called for DEBUG level.
     */
    it('calls console.debug for DEBUG level', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.DEBUG];
      expect(logFunction).toBeDefined();

      logFunction!('test debug message');
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that console.debug is called for TRACE level.
     */
    it('calls console.debug for TRACE level', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.TRACE];
      expect(logFunction).toBeDefined();

      logFunction!('test trace message');
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests that the logger correctly processes a formatted message.
     */
    it('correctly processes a formatted message', () => {
      const logFunction = ConsoleLoggerMap[AgLogLevelCode.INFO];
      const formattedMessage = 'formatted log message';
      logFunction!(formattedMessage);
      expect(mockConsole.info).toHaveBeenCalledWith(formattedMessage);
    });
  });
});
