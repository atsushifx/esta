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

// error

// constants
import { DISABLE, ENABLE } from '../../../../shared/constants/common.constants';
import { AG_LOGLEVEL } from '../../../../shared/types';

// types
import type { AgLogLevel, AgLogMessage } from '../../../../shared/types';
import type { AgLoggerOptions } from '../../../../shared/types/AgLogger.interface';
import { AgLoggerError } from '../../../../shared/types/AgLoggerError.types';

// target
import { AgLoggerConfig } from '../../../internal/AgLoggerConfig.class';
// plugins
import { NullFormatter } from '../../../plugins/formatter/NullFormatter';
import { NullLogger } from '../../../plugins/logger/NullLogger';
// utilities
import { ERROR_TYPES } from 'shared/constants';
import { validateLogLevel } from '../../../utils/AgLogValidators';

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
    // Test through public interface by checking fallback behavior
    // When loggerMap has NullLogger, getLoggerFunction should return defaultLogger (which is NullLogger initially)
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(NullLogger);
  });

  it('should initialize with NullFormatter as default formatter', () => {
    const config = new AgLoggerConfig();
    expect(config.formatter).toBe(NullFormatter);
  });

  it('should initialize with AG_LOGLEVEL.OFF as default log level', () => {
    const config = new AgLoggerConfig();
    expect(config.logLevel).toBe(AG_LOGLEVEL.OFF);
  });

  it('should initialize with verbose as false', () => {
    const config = new AgLoggerConfig();
    expect(config.isVerbose).toBe(DISABLE);
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
    expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(NullLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(NullLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(NullLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.OFF)).toBe(NullLogger);
  });

  it('should return NullLogger for invalid log levels', () => {
    const config = new AgLoggerConfig();

    // Test boundary values outside valid range
    const invalidHighLevel = 7;
    const invalidLowLevel = -1;

    // Verify that NullLogger is returned for out-of-bounds values
    expect(config.getLoggerFunction(invalidHighLevel as AgLogLevel))
      .toBe(NullLogger);
    expect(config.getLoggerFunction(invalidLowLevel as AgLogLevel))
      .toBe(NullLogger);

    // Test runtime type violations (when TypeScript type checking fails)
    const stringValue = 'INVALID' as unknown as AgLogLevel;
    const nullValue = null as unknown as AgLogLevel;
    const undefinedValue = undefined as unknown as AgLogLevel;

    // Verify NullLogger is returned for string values
    expect(config.getLoggerFunction(stringValue))
      .toBe(NullLogger);

    // Verify NullLogger is returned for null values
    expect(config.getLoggerFunction(nullValue))
      .toBe(NullLogger);

    // Verify NullLogger is returned for undefined values
    expect(config.getLoggerFunction(undefinedValue))
      .toBe(NullLogger);
  });

  it('should return configured formatter', () => {
    const config = new AgLoggerConfig();
    expect(config.formatter).toBe(NullFormatter);
  });

  it('should return configured log level', () => {
    const config = new AgLoggerConfig();
    expect(config.logLevel).toBe(AG_LOGLEVEL.OFF);
  });

  it('should return verbose setting', () => {
    const config = new AgLoggerConfig();
    expect(config.isVerbose).toBe(DISABLE);
  });

  describe('isVerbose getter', () => {
    it('should return false as default value', () => {
      const config = new AgLoggerConfig();
      expect(config.isVerbose).toBe(false);
    });

    it('should have isVerbose getter that returns boolean type', () => {
      const config = new AgLoggerConfig();
      expect(typeof config.isVerbose).toBe('boolean');
    });

    it('should return true when verbose is enabled', () => {
      const config = new AgLoggerConfig();
      config.setVerbose = ENABLE;
      expect(config.isVerbose).toBe(true);
    });
  });

  describe('isVerbose getter', () => {
    it('should return false as default value', () => {
      const config = new AgLoggerConfig();
      expect(config.isVerbose).toBe(false);
    });

    it('should have isVerbose getter that returns boolean type', () => {
      const config = new AgLoggerConfig();
      expect(typeof config.isVerbose).toBe('boolean');
    });

    it('should return true when verbose is enabled', () => {
      const config = new AgLoggerConfig();
      config.setVerbose = ENABLE;
      expect(config.isVerbose).toBe(true);
    });
  });

  it('should set log level correctly', () => {
    const config = new AgLoggerConfig();

    // Test setting one log level first (t-wada style - one expect at a time)
    config.logLevel = AG_LOGLEVEL.DEBUG;
    expect(config.logLevel).toBe(AG_LOGLEVEL.DEBUG);
  });

  it('should not change log level when invalid value is provided', () => {
    const config = new AgLoggerConfig();
    const originalLevel = config.logLevel;

    // Attempt to set invalid log level
    config.logLevel = 999 as AgLogLevel;

    // Verify log level remains unchanged
    expect(config.logLevel).toBe(originalLevel);
  });

  it('should not change log level when null is provided via property', () => {
    const config = new AgLoggerConfig();
    const originalLevel = config.logLevel;

    // Attempt to set null log level
    config.logLevel = null as unknown as AgLogLevel;

    // Verify log level remains unchanged
    expect(config.logLevel).toBe(originalLevel);
  });

  it('should not change log level when undefined is provided via property', () => {
    const config = new AgLoggerConfig();
    const originalLevel = config.logLevel;

    // Attempt to set undefined log level
    config.logLevel = undefined as unknown as AgLogLevel;

    // Verify log level remains unchanged
    expect(config.logLevel).toBe(originalLevel);
  });

  it('should not change log level when string is provided via property', () => {
    const config = new AgLoggerConfig();
    const originalLevel = config.logLevel;

    // Attempt to set string log level
    config.logLevel = 'INVALID' as unknown as AgLogLevel;

    // Verify log level remains unchanged
    expect(config.logLevel).toBe(originalLevel);
  });

  it('should set verbose setting correctly', () => {
    const config = new AgLoggerConfig();

    // Test enabling verbose mode (t-wada style - one expect at a time)
    config.setVerbose = ENABLE;
    expect(config.isVerbose).toBe(ENABLE);
  });

  it('should return the set verbose value', () => {
    const config = new AgLoggerConfig();

    // Test that setVerbose returns the set verbose value
    const result = config.setVerbose = DISABLE;
    expect(result).toBe(DISABLE);
  });

  it('should return false for all levels when log level is OFF', () => {
    const config = new AgLoggerConfig();

    // Ensure log level is OFF (default state)
    expect(config.logLevel).toBe(AG_LOGLEVEL.OFF);

    // Test that shouldOutput returns false for all log levels when set to OFF
    expect(config.shouldOutput(AG_LOGLEVEL.DEBUG)).toBe(false);
    expect(config.shouldOutput(AG_LOGLEVEL.INFO)).toBe(false);
    expect(config.shouldOutput(AG_LOGLEVEL.WARN)).toBe(false);
    expect(config.shouldOutput(AG_LOGLEVEL.ERROR)).toBe(false);
    expect(config.shouldOutput(AG_LOGLEVEL.OFF)).toBe(false);
  });

  it('should return correct output decision for valid log levels', () => {
    const config = new AgLoggerConfig();

    // Set log level to WARN
    config.logLevel = AG_LOGLEVEL.WARN;

    // Test that levels below WARN return false
    expect(config.shouldOutput(AG_LOGLEVEL.DEBUG)).toBe(false);
    expect(config.shouldOutput(AG_LOGLEVEL.INFO)).toBe(false);

    // Test that levels at or above WARN return true
    expect(config.shouldOutput(AG_LOGLEVEL.WARN)).toBe(true);
    expect(config.shouldOutput(AG_LOGLEVEL.ERROR)).toBe(true);
  });

  it('should handle boundary log level values correctly', () => {
    const config = new AgLoggerConfig();

    // Test minimum log level (FATAL = 1)
    config.logLevel = AG_LOGLEVEL.FATAL;
    expect(config.shouldOutput(AG_LOGLEVEL.FATAL)).toBe(true); // 1 <= 1
    expect(config.shouldOutput(AG_LOGLEVEL.ERROR)).toBe(false); // 2 > 1

    // Test maximum log level (TRACE = 6)
    config.logLevel = AG_LOGLEVEL.TRACE;
    expect(config.shouldOutput(AG_LOGLEVEL.TRACE)).toBe(true); // 6 <= 6
    expect(config.shouldOutput(AG_LOGLEVEL.DEBUG)).toBe(true); // 5 <= 6
    expect(config.shouldOutput(AG_LOGLEVEL.FATAL)).toBe(true); // 1 <= 6
  });

  it('should return false for invalid log levels in shouldOutput', () => {
    const config = new AgLoggerConfig();

    // Set a valid log level

    // Test that shouldOutput returns false for invalid log levels
    expect(config.shouldOutput(999 as AgLogLevel)).toBe(false);
    expect(config.shouldOutput(-1 as AgLogLevel)).toBe(false);
    expect(config.shouldOutput('INVALID' as unknown as AgLogLevel)).toBe(false);
    expect(config.shouldOutput(null as unknown as AgLogLevel)).toBe(false);
    expect(config.shouldOutput(undefined as unknown as AgLogLevel)).toBe(false);
  });

  it('should return true when verbose is enabled', () => {
    const config = new AgLoggerConfig();

    // Enable verbose mode
    config.setVerbose = ENABLE;

    // Test that shouldOutputVerbose returns true when verbose is enabled
    expect(config.shouldOutputVerbose()).toBe(true);
  });

  it('should return false when verbose is disabled', () => {
    const config = new AgLoggerConfig();

    // Ensure verbose is disabled (default state)
    expect(config.isVerbose).toBe(DISABLE);

    // Test that shouldOutputVerbose returns false when verbose is disabled
    expect(config.shouldOutputVerbose()).toBe(false);

    // Explicitly disable verbose and test again
    config.setVerbose = DISABLE;
    expect(config.shouldOutputVerbose()).toBe(false);
  });

  it('should extract and apply configuration from AgLoggerOptions', () => {
    const config = new AgLoggerConfig();

    // Test with empty options (should not throw error)
    const emptyOptions: AgLoggerOptions = {};
    expect(() => config.setLoggerConfig(emptyOptions)).not.toThrow();
  });

  it('should apply defaultLogger setting', () => {
    const config = new AgLoggerConfig();

    // Create a test logger function
    const testLogger = (_message: string | AgLogMessage): void => {/* test logger */};

    // Apply configuration with defaultLogger
    const options: AgLoggerOptions = {
      defaultLogger: testLogger,
    };
    config.setLoggerConfig(options);

    // Verify defaultLogger was applied by checking fallback behavior
    const loggerMap = config.getLoggerMap();
    loggerMap.clear();
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testLogger);
  });

  it('should apply formatter setting', () => {
    const config = new AgLoggerConfig();

    // Create a test formatter function
    const testFormatter = (_logMessage: AgLogMessage): string => 'test formatted message';

    // Apply configuration with formatter
    const options: AgLoggerOptions = {
      formatter: testFormatter,
    };
    config.setLoggerConfig(options);

    // Verify formatter was applied
    expect(config.formatter).toBe(testFormatter);
  });

  it('should apply logLevel setting', () => {
    const config = new AgLoggerConfig();

    // Apply configuration with logLevel
    const options: AgLoggerOptions = {
      logLevel: AG_LOGLEVEL.DEBUG,
    };
    config.setLoggerConfig(options);

    // Verify logLevel was applied
    expect(config.logLevel).toBe(AG_LOGLEVEL.DEBUG);
  });

  it('should apply verbose setting', () => {
    const config = new AgLoggerConfig();

    // Apply configuration with verbose
    const options: AgLoggerOptions = {
      verbose: ENABLE,
    };
    config.setLoggerConfig(options);

    // Verify verbose was applied
    expect(config.isVerbose).toBe(ENABLE);
  });

  it('should have setLogger method that can be called', () => {
    const config = new AgLoggerConfig();
    const testLogger = (_message: string | AgLogMessage): void => {/* test logger */};

    // Test that setLogger method exists and can be called
    expect(typeof config.setLogger).toBe('function');

    // Test that it can be called without throwing error
    expect(() => config.setLogger(AG_LOGLEVEL.ERROR, testLogger)).not.toThrow();
  });

  it('should update single logger in map via updateLoggerMap', () => {
    const config = new AgLoggerConfig();

    // Create test logger
    const testErrorLogger = (_message: string | AgLogMessage): void => {/* test error logger */};

    // Verify initial state is NullLogger
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(NullLogger);

    // Update single logger in map
    config.setLogger(AG_LOGLEVEL.ERROR, testErrorLogger);

    // Verify the logger was updated
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testErrorLogger);
    // Verify other levels remain unchanged
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(NullLogger);
  });

  it('should update multiple loggers in map via updateLoggerMap', () => {
    const config = new AgLoggerConfig();

    // Create test loggers
    const testErrorLogger = (_message: string | AgLogMessage): void => {/* test error logger */};
    const testWarnLogger = (_message: string | AgLogMessage): void => {/* test warn logger */};
    const testInfoLogger = (_message: string | AgLogMessage): void => {/* test info logger */};

    // Verify initial state
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(NullLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(NullLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(NullLogger);

    // Update multiple loggers in map
    config.setLogger(AG_LOGLEVEL.ERROR, testErrorLogger);
    config.setLogger(AG_LOGLEVEL.WARN, testWarnLogger);
    config.setLogger(AG_LOGLEVEL.INFO, testInfoLogger);

    // Verify all specified loggers were updated
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testErrorLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testWarnLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testInfoLogger);
    // Verify unspecified levels remain unchanged
    expect(config.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(NullLogger);
  });

  it('should apply loggerMap setting via setLoggerConfig', () => {
    const config = new AgLoggerConfig();

    // Create test loggers
    const testErrorLogger = (_message: string | AgLogMessage): void => {/* test error logger */};
    const testWarnLogger = (_message: string | AgLogMessage): void => {/* test warn logger */};

    // Verify initial state
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(NullLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(NullLogger);

    // Apply configuration with loggerMap
    const options: AgLoggerOptions = {
      loggerMap: {
        [AG_LOGLEVEL.ERROR]: testErrorLogger,
        [AG_LOGLEVEL.WARN]: testWarnLogger,
      },
    };
    config.setLoggerConfig(options);

    // Verify loggerMap was applied via setLoggerConfig
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testErrorLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testWarnLogger);
    // Verify unspecified levels remain unchanged
    expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(NullLogger);
  });

  it('should allow loggerMap to override defaultLogger for specified levels', () => {
    const config = new AgLoggerConfig();

    // Create test loggers
    const testDefaultLogger = (_message: string | AgLogMessage): void => {/* test default logger */};
    const testErrorLogger = (_message: string | AgLogMessage): void => {/* test error logger */};

    // Set a default logger via setLoggerConfig - this initializes all loggerMap entries
    const options: AgLoggerOptions = {
      defaultLogger: testDefaultLogger,
    };
    config.setLoggerConfig(options);

    // All levels should now use the default logger
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testDefaultLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testDefaultLogger);

    // Apply loggerMap that overrides ERROR level only
    config.setLogger(AG_LOGLEVEL.ERROR, testErrorLogger);

    // Verify ERROR level uses the specific logger from loggerMap
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testErrorLogger);
    // Verify other levels still use the default logger
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testDefaultLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testDefaultLogger);
  });

  it('should use defaultLogger for levels not explicitly overridden', () => {
    const config = new AgLoggerConfig();

    // Create test loggers
    const testDefaultLogger = (_message: string | AgLogMessage): void => {/* test default logger */};
    const testSpecificLogger = (_message: string | AgLogMessage): void => {/* test specific logger */};

    // Set defaultLogger via setLoggerConfig which initializes all levels
    const options: AgLoggerOptions = {
      defaultLogger: testDefaultLogger,
    };
    config.setLoggerConfig(options);

    // All levels should use the default logger initially
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testDefaultLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testDefaultLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testDefaultLogger);

    // Override one specific level
    config.setLogger(AG_LOGLEVEL.ERROR, testSpecificLogger);

    // Verify ERROR level uses the specific logger
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testSpecificLogger);
    // Verify other levels still use the default logger
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testDefaultLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testDefaultLogger);
  });

  it('should properly handle defaultLogger changes via setLoggerConfig', () => {
    const config = new AgLoggerConfig();

    // Create test loggers
    const testDefaultLogger1 = (_message: string | AgLogMessage): void => {/* test default logger 1 */};
    const testDefaultLogger2 = (_message: string | AgLogMessage): void => {/* test default logger 2 */};

    // Set first defaultLogger
    const options1: AgLoggerOptions = {
      defaultLogger: testDefaultLogger1,
    };
    config.setLoggerConfig(options1);

    // All levels should use first defaultLogger
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testDefaultLogger1);
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testDefaultLogger1);
    expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testDefaultLogger1);

    // Change defaultLogger via setLoggerConfig
    const options2: AgLoggerOptions = {
      defaultLogger: testDefaultLogger2,
    };
    config.setLoggerConfig(options2);

    // All levels should now use second defaultLogger
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testDefaultLogger2);
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testDefaultLogger2);
    expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testDefaultLogger2);
  });

  it('should apply both defaultLogger and loggerMap together via setLoggerConfig', () => {
    const config = new AgLoggerConfig();

    // Create test loggers
    const testDefaultLogger = (_message: string | AgLogMessage): void => {/* test default logger */};
    const testErrorLogger = (_message: string | AgLogMessage): void => {/* test error logger */};
    const testWarnLogger = (_message: string | AgLogMessage): void => {/* test warn logger */};

    // Apply configuration with both defaultLogger and loggerMap
    const options: AgLoggerOptions = {
      defaultLogger: testDefaultLogger,
      loggerMap: {
        [AG_LOGLEVEL.ERROR]: testErrorLogger,
        [AG_LOGLEVEL.WARN]: testWarnLogger,
      },
    };
    config.setLoggerConfig(options);

    // Verify explicitly mapped levels use loggerMap (override defaultLogger)
    expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testErrorLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testWarnLogger);

    // Verify non-mapped levels use defaultLogger (from initialization step)
    expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(testDefaultLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.DEBUG)).toBe(testDefaultLogger);
    expect(config.getLoggerFunction(AG_LOGLEVEL.FATAL)).toBe(testDefaultLogger);
  });

  // TDD: validateLogLevel() function tests
  describe('validateLogLevel()', () => {
    it('should not throw for valid log levels', () => {
      // Test all valid log levels
      expect(() => validateLogLevel(AG_LOGLEVEL.OFF)).not.toThrow();
      expect(() => validateLogLevel(AG_LOGLEVEL.FATAL)).not.toThrow();
      expect(() => validateLogLevel(AG_LOGLEVEL.ERROR)).not.toThrow();
      expect(() => validateLogLevel(AG_LOGLEVEL.WARN)).not.toThrow();
      expect(() => validateLogLevel(AG_LOGLEVEL.INFO)).not.toThrow();
      expect(() => validateLogLevel(AG_LOGLEVEL.DEBUG)).not.toThrow();
      expect(() => validateLogLevel(AG_LOGLEVEL.TRACE)).not.toThrow();
    });

    it('should throw AgLoggerError for invalid log levels', () => {
      // Test invalid log levels (out of range numbers)
      expect(() => validateLogLevel(999 as unknown as AgLogLevel)).toThrow(AgLoggerError);
      expect(() => validateLogLevel(-1 as unknown as AgLogLevel)).toThrow(AgLoggerError);
    });

    it('should throw error with correct error category', () => {
      try {
        validateLogLevel(999 as unknown as AgLogLevel);
      } catch (error) {
        expect(error).toBeInstanceOf(AgLoggerError);
        expect((error as AgLoggerError).errorType).toBe(ERROR_TYPES.VALIDATION);
      }
    });
  });

  // TDD: setLogger() method tests
  describe('setLogger()', () => {
    it('should set logger function for specified log level', () => {
      const config = new AgLoggerConfig();
      const testLogger = (_message: string | AgLogMessage): void => {/* test logger */};

      config.setLogger(AG_LOGLEVEL.ERROR, testLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testLogger);
    });

    it('should set different logger functions for different levels', () => {
      const config = new AgLoggerConfig();
      const testErrorLogger = (_message: string | AgLogMessage): void => {/* test error logger */};
      const testWarnLogger = (_message: string | AgLogMessage): void => {/* test warn logger */};

      config.setLogger(AG_LOGLEVEL.ERROR, testErrorLogger);
      config.setLogger(AG_LOGLEVEL.WARN, testWarnLogger);

      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(testErrorLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.WARN)).toBe(testWarnLogger);
      // Other levels should remain unchanged
      expect(config.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(NullLogger);
    });

    it('should return false for invalid log levels', () => {
      const config = new AgLoggerConfig();
      const testLogger = (_message: string | AgLogMessage): void => {/* test logger */};

      expect(config.setLogger(999 as AgLogLevel, testLogger)).toBe(false);
      expect(config.setLogger(-1 as AgLogLevel, testLogger)).toBe(false);
      expect(config.setLogger('INVALID' as unknown as AgLogLevel, testLogger)).toBe(false);
      expect(config.setLogger(null as unknown as AgLogLevel, testLogger)).toBe(false);
      expect(config.setLogger(undefined as unknown as AgLogLevel, testLogger)).toBe(false);
    });

    it('should return true for valid log levels', () => {
      const config = new AgLoggerConfig();
      const testLogger = (_message: string | AgLogMessage): void => {/* test logger */};

      expect(config.setLogger(AG_LOGLEVEL.ERROR, testLogger)).toBe(true);
      expect(config.setLogger(AG_LOGLEVEL.WARN, testLogger)).toBe(true);
      expect(config.setLogger(AG_LOGLEVEL.INFO, testLogger)).toBe(true);
    });

    it('should not modify logger map when invalid log level is provided', () => {
      const config = new AgLoggerConfig();
      const testLogger = (_message: string | AgLogMessage): void => {/* test logger */};
      const originalLoggerFunction = config.getLoggerFunction(AG_LOGLEVEL.ERROR);

      // Attempt to set logger with invalid level
      config.setLogger(999 as AgLogLevel, testLogger);

      // Verify logger map remains unchanged
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(originalLoggerFunction);
    });

    it('should allow overwriting existing logger for same level', () => {
      const config = new AgLoggerConfig();
      const firstLogger = (_message: string | AgLogMessage): void => {/* first logger */};
      const secondLogger = (_message: string | AgLogMessage): void => {/* second logger */};

      config.setLogger(AG_LOGLEVEL.ERROR, firstLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(firstLogger);

      config.setLogger(AG_LOGLEVEL.ERROR, secondLogger);
      expect(config.getLoggerFunction(AG_LOGLEVEL.ERROR)).toBe(secondLogger);
    });
  });
});
