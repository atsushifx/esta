// src: /src/internal/__tests__/AgLoggerConfig.spec.ts
// @(#) : AgLoggerConfig Unit Tests - Configuration Update Functionality (Task 3)
//
// Comprehensive test suite covering:
// - Basic instance creation and initialization
// - Default configuration values (secure defaults)
// - Logger function retrieval and validation
// - Configuration getter methods
// - Configuration setter methods (setLogLevel, setVerbose)
// - Error handling for invalid inputs
//
// Tests follow t-wada style TDD approach with Red-Green-Refactor cycles.
// Each test case focuses on a single behavior to ensure clarity and maintainability.
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// testing
import { describe, expect, it } from 'vitest';
// types
import type { AgTLogLevel } from '../../../shared/types';
// constants
import { AG_LOGGER_ERROR_CATEGORIES } from '../../../shared/constants/agLoggerError.constants';
import { AG_LOGLEVEL } from '../../../shared/types';
// target
import { AgLoggerConfig } from '../AgLoggerConfig';
// plugins
import { NullFormat } from '../../plugins/format/NullFormat';
import { NullLogger } from '../../plugins/logger/NullLogger';
// errors
import { AgLoggerError } from '../../../shared/types/AgLoggerError.types';

/**
 * Test suite for AgLoggerConfig internal class.
 * Verifies configuration management functionality including
 * initialization, settings management, and output control.
 */
describe('AgLoggerConfig', () => {
  it('should create AgLoggerConfig instance', () => {
    const config = new AgLoggerConfig();
    expect(config).toBeInstanceOf(AgLoggerConfig);
  });

  it('should initialize with NullLogger as default logger', () => {
    const config = new AgLoggerConfig();
    expect(config.defaultLogger).toBe(NullLogger);
  });

  it('should initialize with NullFormat as default formatter', () => {
    const config = new AgLoggerConfig();
    expect(config.formatter).toBe(NullFormat);
  });

  it('should initialize with AG_LOGLEVEL.OFF as default log level', () => {
    const config = new AgLoggerConfig();
    expect(config.logLevel).toBe(AG_LOGLEVEL.OFF);
  });

  it('should initialize with verbose as false', () => {
    const config = new AgLoggerConfig();
    expect(config.verbose).toBe(DISABLE);
  });

  it('should initialize all log levels with NullLogger', () => {
    const config = new AgLoggerConfig();
    const loggerMap = config.getLoggerMap();

    // Test that all log levels are mapped to NullLogger
    expect(loggerMap.get(AG_LOGLEVEL.OFF)).toBe(NullLogger);
    expect(loggerMap.get(AG_LOGLEVEL.FATAL)).toBe(NullLogger);
    expect(loggerMap.get(AG_LOGLEVEL.ERROR)).toBe(NullLogger);
    expect(loggerMap.get(AG_LOGLEVEL.WARN)).toBe(NullLogger);
    expect(loggerMap.get(AG_LOGLEVEL.INFO)).toBe(NullLogger);
    expect(loggerMap.get(AG_LOGLEVEL.DEBUG)).toBe(NullLogger);
    expect(loggerMap.get(AG_LOGLEVEL.TRACE)).toBe(NullLogger);
  });

  it('should return logger function for specified log level', () => {
    const config = new AgLoggerConfig();

    // Test that getLoggerFunction returns the correct logger for each level
    expect(config.getLoggerFunction(AG_LOGLEVEL.OFF)).toBe(NullLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.FATAL)).toBe(NullLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(NullLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(NullLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(NullLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(NullLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.TRACE)).toBe(NullLogger);
  });

  it('should throw AgLoggerError for non-existent log level', () => {
    const config = new AgLoggerConfig();

    // Test boundary values outside valid range (0-6)
    const invalidHighLevel = 7;
    const invalidLowLevel = -1;

    // Verify that AgLoggerError is thrown for out-of-bounds values
    expect(() => config.getLoggerFunction(invalidHighLevel as AgTLogLevel))
      .toThrow(AgLoggerError);
    expect(() => config.getLoggerFunction(invalidHighLevel as AgTLogLevel))
      .toThrow('Invalid log level: 7');

    expect(() => config.getLoggerFunction(invalidLowLevel as AgTLogLevel))
      .toThrow(AgLoggerError);
    expect(() => config.getLoggerFunction(invalidLowLevel as AgTLogLevel))
      .toThrow('Invalid log level: -1');

    // Test runtime type violations (when TypeScript type checking fails)
    const stringValue = 'INVALID' as unknown as AgTLogLevel;
    const nullValue = null as unknown as AgTLogLevel;
    const undefinedValue = undefined as unknown as AgTLogLevel;

    // Verify error handling for string values
    expect(() => config.getLoggerFunction(stringValue))
      .toThrow(AgLoggerError);
    expect(() => config.getLoggerFunction(stringValue))
      .toThrow('Invalid log level: INVALID');

    // Verify error handling for null values
    expect(() => config.getLoggerFunction(nullValue))
      .toThrow(AgLoggerError);
    expect(() => config.getLoggerFunction(nullValue))
      .toThrow('Invalid log level: null');

    // Verify error handling for undefined values
    expect(() => config.getLoggerFunction(undefinedValue))
      .toThrow(AgLoggerError);
    expect(() => config.getLoggerFunction(undefinedValue))
      .toThrow('Invalid log level: undefined');

    // Verify correct error category is set
    try {
      config.getLoggerFunction(invalidHighLevel as AgTLogLevel);
    } catch (error) {
      expect(error).toBeInstanceOf(AgLoggerError);
      expect((error as AgLoggerError).code).toBe(AG_LOGGER_ERROR_CATEGORIES.INVALID_LOG_LEVEL);
    }
  });

  it('should return configured formatter', () => {
    const config = new AgLoggerConfig();
    expect(config.getFormatter()).toBe(NullFormat);
  });

  it('should return configured log level', () => {
    const config = new AgLoggerConfig();
    expect(config.getLogLevel()).toBe(AG_LOGLEVEL.OFF);
  });

  it('should return verbose setting', () => {
    const config = new AgLoggerConfig();
    expect(config.getVerbose()).toBe(false);
  });
});
