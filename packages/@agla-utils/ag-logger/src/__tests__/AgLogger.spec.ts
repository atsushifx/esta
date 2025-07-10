// src/__tests__/AgLogger.spec.ts
// @(#) : Unit tests for AgLogger class
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// constants
import { AgLogLevelCode } from '@shared/types';

// test target
import { AgLogger } from '../AgLogger.class';

// mock functions for testing
const mockLogger = vi.fn();
const mockFormatter = vi.fn().mockImplementation((msg) => msg);

/**
 * Unit tests for AgLogger class.
 * Tests singleton behavior, log level filtering, and verbose functionality.
 */
describe('AgLogger', () => {
  /**
   * Clears mocks and resets the singleton instance before each test.
   */
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (AgLogger as unknown as { _instance?: AgLogger })._instance = undefined;
  });

  /**
   * Clears mocks and resets the singleton instance after each test.
   */
  afterEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (AgLogger as unknown as { _instance?: AgLogger })._instance = undefined;
  });

  /**
   * Tests for verbose functionality.
   * Checks that verbose mode controls log output.
   */
  describe('verbose functionality', () => {
    it('should have setVerbose method that returns current verbose state', () => {
      const logger = AgLogger.getInstance();

      expect(logger.setVerbose()).toBe(false);
    });

    it('should allow setting verbose to true and return the new value', () => {
      const logger = AgLogger.getInstance();

      const result = logger.setVerbose(true);
      expect(result).toBe(true);
      expect(logger.setVerbose()).toBe(true);
    });

    it('should not output verbose log when verbose is false', () => {
      const logger = AgLogger.getInstance(mockLogger, mockFormatter);
      logger.setLogLevel(AgLogLevelCode.INFO);
      logger.setVerbose(false);

      logger.verbose('test message');

      expect(mockLogger).not.toHaveBeenCalled();
    });

    it('should output verbose log when verbose is true', () => {
      const logger = AgLogger.getInstance(mockLogger, mockFormatter);
      logger.setLogLevel(AgLogLevelCode.INFO);
      logger.setVerbose(true);

      logger.verbose('test message');

      expect(mockLogger).toHaveBeenCalled();
    });

    it('should output other log levels normally when verbose is false', () => {
      const logger = AgLogger.getInstance(mockLogger, mockFormatter);
      logger.setLogLevel(AgLogLevelCode.TRACE);
      logger.setVerbose(false);

      logger.debug('debug message');
      logger.trace('trace message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      logger.fatal('fatal message');

      expect(mockLogger).toHaveBeenCalledTimes(6);
    });
  });
});
