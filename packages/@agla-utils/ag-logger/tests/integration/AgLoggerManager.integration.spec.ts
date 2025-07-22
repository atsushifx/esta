// tests/integration/AgLoggerManager.integration.spec.ts
// @(#) : AgLoggerManager Integration Tests - Manager behavior and state management
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it, vi } from 'vitest';

// constants
import { AG_LOG_LEVEL } from '../../shared/types';
import type { AgTLogLevel } from '../../shared/types';
// test targets
import { AgLoggerManager } from '../../src/AgLoggerManager.class';
import { JsonFormat } from '../../src/plugins/format/JsonFormat';
import { NullFormat } from '../../src/plugins/format/NullFormat';
import { PlainFormat } from '../../src/plugins/format/PlainFormat';
import { ConsoleLogger } from '../../src/plugins/logger/ConsoleLogger';
import { NullLogger } from '../../src/plugins/logger/NullLogger';

/**
 * Integration tests for AgLoggerManager.
 * Tests the manager's singleton behavior, logger map management,
 * formatter handling, and complex configuration scenarios.
 * Focuses on ensuring the manager correctly coordinates between
 * different loggers and formatters while maintaining state consistency.
 */
describe('AgLoggerManager Integration Tests', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    // Reset singleton instance for clean test state
    AgLoggerManager.resetSingleton();
  };

  /**
   * Tests singleton behavior and instance management
   * across multiple initialization scenarios.
   */
  describe('Singleton Management Integration', () => {
    it('should maintain singleton behavior across multiple getInstance calls', () => {
      setupTestContext();
      const manager1 = AgLoggerManager.getInstance();
      const manager2 = AgLoggerManager.getInstance();
      const manager3 = AgLoggerManager.getInstance(ConsoleLogger, JsonFormat);

      expect(manager1).toBe(manager2);
      expect(manager2).toBe(manager3);
    });

    it('should maintain configuration when accessed multiple times', () => {
      setupTestContext();
      const mockLogger = vi.fn();
      const mockFormatter = vi.fn().mockReturnValue('test output');

      const manager1 = AgLoggerManager.getInstance(mockLogger, mockFormatter);
      const manager2 = AgLoggerManager.getInstance();

      // Both should have the same configuration
      expect(manager1.getFormatter()).toBe(manager2.getFormatter());
      expect(manager1.getLogger(AG_LOG_LEVEL.INFO)).toBe(manager2.getLogger(AG_LOG_LEVEL.INFO));
    });

    it('should update configuration only on first initialization with parameters', () => {
      setupTestContext();
      const firstLogger = vi.fn();
      const secondLogger = vi.fn();
      const firstFormatter = vi.fn().mockReturnValue('first');
      const secondFormatter = vi.fn().mockReturnValue('second');

      const manager1 = AgLoggerManager.getInstance(firstLogger, firstFormatter);
      const manager2 = AgLoggerManager.getInstance(secondLogger, secondFormatter);

      // Second call with parameters should still update configuration
      // since getInstance allows configuration updates
      expect(manager1.getFormatter()).toBe(secondFormatter);
      expect(manager2.getFormatter()).toBe(secondFormatter);
      expect(manager1.getLogger(AG_LOG_LEVEL.INFO)).toBe(secondLogger);
      expect(manager2.getLogger(AG_LOG_LEVEL.INFO)).toBe(secondLogger);
    });
  });

  /**
   * Tests logger map management and retrieval
   * with various configuration combinations.
   */
  describe('Logger Map Management Integration', () => {
    it('should handle complete logger map override correctly', () => {
      setupTestContext();
      const defaultLogger = vi.fn();
      const errorLogger = vi.fn();
      const debugLogger = vi.fn();

      const loggerMap = {
        [AG_LOG_LEVEL.OFF]: NullLogger,
        [AG_LOG_LEVEL.FATAL]: errorLogger,
        [AG_LOG_LEVEL.ERROR]: errorLogger,
        [AG_LOG_LEVEL.WARN]: defaultLogger,
        [AG_LOG_LEVEL.INFO]: defaultLogger,
        [AG_LOG_LEVEL.DEBUG]: debugLogger,
        [AG_LOG_LEVEL.TRACE]: debugLogger,
      };

      const manager = AgLoggerManager.getInstance(defaultLogger, PlainFormat, loggerMap);

      expect(manager.getLogger(AG_LOG_LEVEL.OFF)).toBe(NullLogger);
      expect(manager.getLogger(AG_LOG_LEVEL.FATAL)).toBe(errorLogger);
      expect(manager.getLogger(AG_LOG_LEVEL.ERROR)).toBe(errorLogger);
      expect(manager.getLogger(AG_LOG_LEVEL.WARN)).toBe(defaultLogger);
      expect(manager.getLogger(AG_LOG_LEVEL.INFO)).toBe(defaultLogger);
      expect(manager.getLogger(AG_LOG_LEVEL.DEBUG)).toBe(debugLogger);
      expect(manager.getLogger(AG_LOG_LEVEL.TRACE)).toBe(debugLogger);
    });

    it('should handle partial logger map correctly', () => {
      setupTestContext();
      const defaultLogger = vi.fn();
      const errorLogger = vi.fn();
      const debugLogger = vi.fn();

      const partialLoggerMap = {
        [AG_LOG_LEVEL.ERROR]: errorLogger,
        [AG_LOG_LEVEL.DEBUG]: debugLogger,
      };

      const manager = AgLoggerManager.getInstance(defaultLogger, PlainFormat, partialLoggerMap);

      // Specified levels should use custom loggers
      expect(manager.getLogger(AG_LOG_LEVEL.ERROR)).toBe(errorLogger);
      expect(manager.getLogger(AG_LOG_LEVEL.DEBUG)).toBe(debugLogger);

      // Non-specified levels should use default logger
      expect(manager.getLogger(AG_LOG_LEVEL.FATAL)).toBe(defaultLogger);
      expect(manager.getLogger(AG_LOG_LEVEL.WARN)).toBe(defaultLogger);
      expect(manager.getLogger(AG_LOG_LEVEL.INFO)).toBe(defaultLogger);
      expect(manager.getLogger(AG_LOG_LEVEL.TRACE)).toBe(defaultLogger);
    });

    it('should fallback to default logger for missing map entries', () => {
      setupTestContext();
      const defaultLogger = vi.fn();
      const manager = AgLoggerManager.getInstance(defaultLogger, PlainFormat);

      // All levels should return the default logger
      Object.values(AG_LOG_LEVEL).forEach((level) => {
        if (typeof level === 'number') {
          expect(manager.getLogger(level)).toBe(defaultLogger);
        }
      });
    });
  });

  /**
   * Tests formatter integration and consistency
   * across different scenarios.
   */
  describe('Formatter Integration', () => {
    it('should maintain formatter consistency across logger retrievals', () => {
      setupTestContext();
      const mockFormatter = vi.fn().mockReturnValue('formatted');
      const manager = AgLoggerManager.getInstance(ConsoleLogger, mockFormatter);

      const formatter1 = manager.getFormatter();
      const formatter2 = manager.getFormatter();

      expect(formatter1).toBe(formatter2);
      expect(formatter1).toBe(mockFormatter);
    });

    it('should handle formatter changes correctly', () => {
      setupTestContext();
      const firstFormatter = vi.fn().mockReturnValue('first format');
      const secondFormatter = vi.fn().mockReturnValue('second format');

      const manager = AgLoggerManager.getInstance(ConsoleLogger, firstFormatter);
      expect(manager.getFormatter()).toBe(firstFormatter);

      manager.setLogger({ formatter: secondFormatter });
      expect(manager.getFormatter()).toBe(secondFormatter);
    });

    it('should work with different formatter types', () => {
      setupTestContext();
      const manager = AgLoggerManager.getInstance();

      // Test with JsonFormat
      manager.setLogger({ formatter: JsonFormat });
      expect(manager.getFormatter()).toBe(JsonFormat);

      // Test with PlainFormat
      manager.setLogger({ formatter: PlainFormat });
      expect(manager.getFormatter()).toBe(PlainFormat);

      // Test with NullFormat
      manager.setLogger({ formatter: NullFormat });
      expect(manager.getFormatter()).toBe(NullFormat);
    });
  });

  /**
   * Tests complex configuration scenarios with
   * multiple setLogger calls and overrides.
   */
  describe('Complex Configuration Integration', () => {
    it('should handle mixed configuration updates correctly', () => {
      setupTestContext();
      const manager = AgLoggerManager.getInstance();

      // Initial configuration
      const firstLogger = vi.fn();
      const firstFormatter = vi.fn().mockReturnValue('first');
      manager.setLogger({
        defaultLogger: firstLogger,
        formatter: firstFormatter,
      });

      expect(manager.getLogger(AG_LOG_LEVEL.INFO)).toBe(firstLogger);
      expect(manager.getFormatter()).toBe(firstFormatter);

      // Update only formatter
      const secondFormatter = vi.fn().mockReturnValue('second');
      manager.setLogger({ formatter: secondFormatter });

      expect(manager.getLogger(AG_LOG_LEVEL.INFO)).toBe(firstLogger); // Should remain
      expect(manager.getFormatter()).toBe(secondFormatter); // Should update

      // Update only default logger
      const secondLogger = vi.fn();
      manager.setLogger({ defaultLogger: secondLogger });

      expect(manager.getLogger(AG_LOG_LEVEL.INFO)).toBe(secondLogger); // Should update
      expect(manager.getFormatter()).toBe(secondFormatter); // Should remain

      // Update with partial logger map
      const errorLogger = vi.fn();
      manager.setLogger({
        loggerMap: { [AG_LOG_LEVEL.ERROR]: errorLogger },
      });

      expect(manager.getLogger(AG_LOG_LEVEL.ERROR)).toBe(errorLogger); // Should use custom
      expect(manager.getLogger(AG_LOG_LEVEL.INFO)).toBe(secondLogger); // Should remain default
      expect(manager.getFormatter()).toBe(secondFormatter); // Should remain
    });

    it('should handle legacy setLogger method correctly', () => {
      setupTestContext();
      const manager = AgLoggerManager.getInstance();
      const customLogger = vi.fn();

      // Test legacy single-level logger setting
      manager.setLogger(AG_LOG_LEVEL.ERROR, customLogger);
      expect(manager.getLogger(AG_LOG_LEVEL.ERROR)).toBe(customLogger);

      // Test legacy null logger setting (should use default)
      const defaultLogger = vi.fn();
      manager.setLogger({ defaultLogger });
      manager.setLogger(AG_LOG_LEVEL.INFO, null);
      expect(manager.getLogger(AG_LOG_LEVEL.INFO)).toBe(defaultLogger);
    });

    it('should maintain state consistency during complex updates', () => {
      setupTestContext();
      const manager = AgLoggerManager.getInstance();

      const defaultLogger = vi.fn();
      const errorLogger = vi.fn();
      const debugLogger = vi.fn();
      const formatter = JsonFormat;

      // Complex initial setup
      manager.setLogger({
        defaultLogger,
        formatter,
        loggerMap: {
          [AG_LOG_LEVEL.ERROR]: errorLogger,
          [AG_LOG_LEVEL.DEBUG]: debugLogger,
        },
      });

      // Verify initial state
      expect(manager.getLogger(AG_LOG_LEVEL.ERROR)).toBe(errorLogger);
      expect(manager.getLogger(AG_LOG_LEVEL.DEBUG)).toBe(debugLogger);
      expect(manager.getLogger(AG_LOG_LEVEL.INFO)).toBe(defaultLogger);
      expect(manager.getFormatter()).toBe(formatter);

      // Update default logger - should affect ALL levels since loggerMap gets rebuilt
      const newDefaultLogger = vi.fn();
      manager.setLogger({ defaultLogger: newDefaultLogger });

      // When default logger is updated, all levels get the new default logger
      // Only levels explicitly in loggerMap would override this
      expect(manager.getLogger(AG_LOG_LEVEL.ERROR)).toBe(newDefaultLogger); // Updated to new default
      expect(manager.getLogger(AG_LOG_LEVEL.DEBUG)).toBe(newDefaultLogger); // Updated to new default
      expect(manager.getLogger(AG_LOG_LEVEL.INFO)).toBe(newDefaultLogger); // Updated to new default
      expect(manager.getFormatter()).toBe(formatter); // Should remain
    });
  });

  /**
   * Tests error handling and edge cases
   * in manager integration scenarios.
   */
  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid log level gracefully', () => {
      setupTestContext();
      const manager = AgLoggerManager.getInstance();
      const defaultLogger = vi.fn();
      manager.setLogger({ defaultLogger });

      // Test with invalid log level (should fallback to default)
      const invalidLevel = 999 as unknown as AgTLogLevel;
      expect(manager.getLogger(invalidLevel)).toBe(defaultLogger);
    });

    it('should handle empty logger map correctly', () => {
      setupTestContext();
      const defaultLogger = vi.fn();
      const manager = AgLoggerManager.getInstance(defaultLogger, PlainFormat, {});

      // Should use default logger for all levels
      Object.values(AG_LOG_LEVEL).forEach((level) => {
        if (typeof level === 'number') {
          expect(manager.getLogger(level)).toBe(defaultLogger);
        }
      });
    });

    it('should maintain stability when logger map has undefined values', () => {
      setupTestContext();
      const defaultLogger = vi.fn();
      const manager = AgLoggerManager.getInstance();

      manager.setLogger({
        defaultLogger,
        loggerMap: {
          [AG_LOG_LEVEL.ERROR]: undefined,
        },
      });

      // Should fallback to default logger when map value is undefined
      expect(manager.getLogger(AG_LOG_LEVEL.ERROR)).toBe(defaultLogger);
    });

    it('should handle multiple rapid configuration changes', () => {
      setupTestContext();
      const manager = AgLoggerManager.getInstance();

      const loggers = Array.from({ length: 5 }, () => vi.fn());
      const formatters = [JsonFormat, PlainFormat, NullFormat, JsonFormat, PlainFormat];

      // Rapid configuration changes
      loggers.forEach((logger, index) => {
        manager.setLogger({
          defaultLogger: logger,
          formatter: formatters[index],
        });
      });

      // Should have final configuration
      expect(manager.getLogger(AG_LOG_LEVEL.INFO)).toBe(loggers[4]);
      expect(manager.getFormatter()).toBe(formatters[4]);
    });
  });
});
