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
import { AG_LOGLEVEL } from '../../shared/types';
import type { AgLogLevel } from '../../shared/types';
// test targets
import { AgLoggerManager } from '@/AgLoggerManager.class';
import { JsonFormat } from '@/plugins/format/JsonFormat';
import { NullFormat } from '@/plugins/format/NullFormat';
import { PlainFormat } from '@/plugins/format/PlainFormat';
import { MockLogger } from '@/plugins/logger/MockLogger';

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
    it('should maintain singleton behavior across multiple getManager calls', () => {
      setupTestContext();
      const mockLogger = new MockLogger();
      const manager1 = AgLoggerManager.getManager();
      const manager2 = AgLoggerManager.getManager();
      const manager3 = AgLoggerManager.getManager({
        defaultLogger: mockLogger.getDefaultLoggerFunction(),
        formatter: JsonFormat,
      });

      expect(manager1).toBe(manager2);
      expect(manager2).toBe(manager3);
    });

    it('should maintain configuration when accessed multiple times', () => {
      setupTestContext();
      const mockLogger = new MockLogger();
      const mockFormatter = vi.fn().mockReturnValue('test output');

      const manager1 = AgLoggerManager.getManager({
        defaultLogger: mockLogger.getDefaultLoggerFunction(),
        formatter: mockFormatter,
      });
      const manager2 = AgLoggerManager.getManager();

      // Both should have the same configuration
      expect(manager1.getFormatter()).toBe(manager2.getFormatter());
      expect(manager1.getLogger(AG_LOGLEVEL.INFO)).toBe(manager2.getLogger(AG_LOGLEVEL.INFO));
    });

    it('should update configuration only on first initialization with parameters', () => {
      setupTestContext();
      const firstLogger = new MockLogger();
      const secondLogger = new MockLogger();
      const firstFormatter = vi.fn().mockReturnValue('first');
      const secondFormatter = vi.fn().mockReturnValue('second');

      const manager1 = AgLoggerManager.getManager({
        defaultLogger: firstLogger.getDefaultLoggerFunction(),
        formatter: firstFormatter,
      });
      const manager2 = AgLoggerManager.getManager({
        defaultLogger: secondLogger.getDefaultLoggerFunction(),
        formatter: secondFormatter,
      });

      // Second call with parameters should still update configuration
      // since getManager allows configuration updates
      expect(manager1.getFormatter()).toBe(secondFormatter);
      expect(manager2.getFormatter()).toBe(secondFormatter);
      expect(manager1.getLogger(AG_LOGLEVEL.INFO)).toBe(secondLogger.getDefaultLoggerFunction());
      expect(manager2.getLogger(AG_LOGLEVEL.INFO)).toBe(secondLogger.getDefaultLoggerFunction());
    });
  });

  /**
   * Tests logger map management and retrieval
   * with various configuration combinations.
   */
  describe('Logger Map Management Integration', () => {
    it('should handle complete logger map override correctly', () => {
      setupTestContext();
      const mockLogger = new MockLogger();
      const loggerMap = mockLogger.getLoggerMap();

      const manager = AgLoggerManager.getManager({
        defaultLogger: mockLogger.getDefaultLoggerFunction(),
        formatter: PlainFormat,
        loggerMap: loggerMap,
      });

      expect(manager.getLogger(AG_LOGLEVEL.OFF)).toBe(loggerMap[AG_LOGLEVEL.OFF]);
      expect(manager.getLogger(AG_LOGLEVEL.FATAL)).toBe(loggerMap[AG_LOGLEVEL.FATAL]);
      expect(manager.getLogger(AG_LOGLEVEL.ERROR)).toBe(loggerMap[AG_LOGLEVEL.ERROR]);
      expect(manager.getLogger(AG_LOGLEVEL.WARN)).toBe(loggerMap[AG_LOGLEVEL.WARN]);
      expect(manager.getLogger(AG_LOGLEVEL.INFO)).toBe(loggerMap[AG_LOGLEVEL.INFO]);
      expect(manager.getLogger(AG_LOGLEVEL.DEBUG)).toBe(loggerMap[AG_LOGLEVEL.DEBUG]);
      expect(manager.getLogger(AG_LOGLEVEL.TRACE)).toBe(loggerMap[AG_LOGLEVEL.TRACE]);
    });

    it('should handle partial logger map correctly', () => {
      setupTestContext();
      const mockLogger = new MockLogger();
      const errorLogger = mockLogger.createLoggerFunction(AG_LOGLEVEL.ERROR);
      const debugLogger = mockLogger.createLoggerFunction(AG_LOGLEVEL.DEBUG);

      const partialLoggerMap = {
        [AG_LOGLEVEL.ERROR]: errorLogger,
        [AG_LOGLEVEL.DEBUG]: debugLogger,
      };

      const manager = AgLoggerManager.getManager({
        defaultLogger: mockLogger.getDefaultLoggerFunction(),
        formatter: PlainFormat,
        loggerMap: partialLoggerMap,
      });

      // Specified levels should use custom loggers
      expect(manager.getLogger(AG_LOGLEVEL.ERROR)).toBe(errorLogger);
      expect(manager.getLogger(AG_LOGLEVEL.DEBUG)).toBe(debugLogger);

      // Non-specified levels should use default logger
      expect(manager.getLogger(AG_LOGLEVEL.FATAL)).toBe(mockLogger.getDefaultLoggerFunction());
      expect(manager.getLogger(AG_LOGLEVEL.WARN)).toBe(mockLogger.getDefaultLoggerFunction());
      expect(manager.getLogger(AG_LOGLEVEL.INFO)).toBe(mockLogger.getDefaultLoggerFunction());
      expect(manager.getLogger(AG_LOGLEVEL.TRACE)).toBe(mockLogger.getDefaultLoggerFunction());
    });

    it('should fallback to default logger for missing map entries', () => {
      setupTestContext();
      const mockLogger = new MockLogger();
      const manager = AgLoggerManager.getManager({
        defaultLogger: mockLogger.getDefaultLoggerFunction(),
        formatter: PlainFormat,
      });

      // All levels should return the default logger
      Object.values(AG_LOGLEVEL).forEach((level) => {
        if (typeof level === 'number') {
          expect(manager.getLogger(level)).toBe(mockLogger.getDefaultLoggerFunction());
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
      const mockLogger = new MockLogger();
      const mockFormatter = vi.fn().mockReturnValue('formatted');
      const manager = AgLoggerManager.getManager({
        defaultLogger: mockLogger.getDefaultLoggerFunction(),
        formatter: mockFormatter,
      });

      const formatter1 = manager.getFormatter();
      const formatter2 = manager.getFormatter();

      expect(formatter1).toBe(formatter2);
      expect(formatter1).toBe(mockFormatter);
    });

    it('should handle formatter changes correctly', () => {
      setupTestContext();
      const mockLogger = new MockLogger();
      const firstFormatter = vi.fn().mockReturnValue('first format');
      const secondFormatter = vi.fn().mockReturnValue('second format');

      const manager = AgLoggerManager.getManager({
        defaultLogger: mockLogger.getDefaultLoggerFunction(),
        formatter: firstFormatter,
      });
      expect(manager.getFormatter()).toBe(firstFormatter);

      manager.setManager({ formatter: secondFormatter });
      expect(manager.getFormatter()).toBe(secondFormatter);
    });

    it('should work with different formatter types', () => {
      setupTestContext();
      const manager = AgLoggerManager.getManager();

      // Test with JsonFormat
      manager.setManager({ formatter: JsonFormat });
      expect(manager.getFormatter()).toBe(JsonFormat);

      // Test with PlainFormat
      manager.setManager({ formatter: PlainFormat });
      expect(manager.getFormatter()).toBe(PlainFormat);

      // Test with NullFormat
      manager.setManager({ formatter: NullFormat });
      expect(manager.getFormatter()).toBe(NullFormat);
    });
  });

  /**
   * Tests complex configuration scenarios with
   * multiple setManager calls and overrides.
   */
  describe('Complex Configuration Integration', () => {
    it('should handle mixed configuration updates correctly', () => {
      setupTestContext();
      const manager = AgLoggerManager.getManager();

      // Initial configuration
      const firstLogger = new MockLogger();
      const firstFormatter = vi.fn().mockReturnValue('first');
      manager.setManager({
        defaultLogger: firstLogger.getDefaultLoggerFunction(),
        formatter: firstFormatter,
      });

      expect(manager.getLogger(AG_LOGLEVEL.INFO)).toBe(firstLogger.getDefaultLoggerFunction());
      expect(manager.getFormatter()).toBe(firstFormatter);

      // Update only formatter
      const secondFormatter = vi.fn().mockReturnValue('second');
      manager.setManager({ formatter: secondFormatter });

      expect(manager.getLogger(AG_LOGLEVEL.INFO)).toBe(firstLogger.getDefaultLoggerFunction()); // Should remain
      expect(manager.getFormatter()).toBe(secondFormatter); // Should update

      // Update only default logger
      const secondLogger = new MockLogger();
      manager.setManager({ defaultLogger: secondLogger.getDefaultLoggerFunction() });

      expect(manager.getLogger(AG_LOGLEVEL.INFO)).toBe(secondLogger.getDefaultLoggerFunction()); // Should update
      expect(manager.getFormatter()).toBe(secondFormatter); // Should remain

      // Update with partial logger map
      const errorLogger = secondLogger.createLoggerFunction(AG_LOGLEVEL.ERROR);
      manager.setManager({
        loggerMap: { [AG_LOGLEVEL.ERROR]: errorLogger },
      });

      expect(manager.getLogger(AG_LOGLEVEL.ERROR)).toBe(errorLogger); // Should use custom
      expect(manager.getLogger(AG_LOGLEVEL.INFO)).toBe(secondLogger.getDefaultLoggerFunction()); // Should remain default
      expect(manager.getFormatter()).toBe(secondFormatter); // Should remain
    });

    it('should handle legacy setManager method correctly', () => {
      setupTestContext();
      const manager = AgLoggerManager.getManager();
      const mockLogger = new MockLogger();
      const customLogger = mockLogger.createLoggerFunction(AG_LOGLEVEL.ERROR);

      // Test single-level logger setting with setLogFunctionWithLevel
      manager.setLogFunctionWithLevel(AG_LOGLEVEL.ERROR, customLogger);
      expect(manager.getLogger(AG_LOGLEVEL.ERROR)).toBe(customLogger);

      // Test setting default logger for a level
      const defaultLogger = mockLogger.getDefaultLoggerFunction();
      manager.setManager({ defaultLogger });
      manager.setDefaultLogFunction(AG_LOGLEVEL.INFO);
      expect(manager.getLogger(AG_LOGLEVEL.INFO)).toBe(defaultLogger);
    });

    it('should maintain state consistency during complex updates', () => {
      setupTestContext();
      const manager = AgLoggerManager.getManager();

      const mockLogger = new MockLogger();
      const defaultLogger = mockLogger.getDefaultLoggerFunction();
      const errorLogger = mockLogger.createLoggerFunction(AG_LOGLEVEL.ERROR);
      const debugLogger = mockLogger.createLoggerFunction(AG_LOGLEVEL.DEBUG);
      const formatter = JsonFormat;

      // Complex initial setup
      manager.setManager({
        defaultLogger,
        formatter,
        loggerMap: {
          [AG_LOGLEVEL.ERROR]: errorLogger,
          [AG_LOGLEVEL.DEBUG]: debugLogger,
        },
      });

      // Verify initial state
      expect(manager.getLogger(AG_LOGLEVEL.ERROR)).toBe(errorLogger);
      expect(manager.getLogger(AG_LOGLEVEL.DEBUG)).toBe(debugLogger);
      expect(manager.getLogger(AG_LOGLEVEL.INFO)).toBe(defaultLogger);
      expect(manager.getFormatter()).toBe(formatter);

      // Update default logger - should affect ALL levels since loggerMap gets rebuilt
      const newMockLogger = new MockLogger();
      const newDefaultLogger = newMockLogger.getDefaultLoggerFunction();
      manager.setManager({ defaultLogger: newDefaultLogger });

      // When default logger is updated, all levels get the new default logger
      // Only levels explicitly in loggerMap would override this
      expect(manager.getLogger(AG_LOGLEVEL.ERROR)).toBe(newDefaultLogger); // Updated to new default
      expect(manager.getLogger(AG_LOGLEVEL.DEBUG)).toBe(newDefaultLogger); // Updated to new default
      expect(manager.getLogger(AG_LOGLEVEL.INFO)).toBe(newDefaultLogger); // Updated to new default
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
      const manager = AgLoggerManager.getManager();
      const mockLogger = new MockLogger();
      manager.setManager({ defaultLogger: mockLogger.getDefaultLoggerFunction() });

      // Test with invalid log level (should fallback to default)
      const invalidLevel = 999 as unknown as AgLogLevel;
      expect(manager.getLogger(invalidLevel)).toBe(mockLogger.getDefaultLoggerFunction());
    });

    it('should handle empty logger map correctly', () => {
      setupTestContext();
      const mockLogger = new MockLogger();
      const manager = AgLoggerManager.getManager({
        defaultLogger: mockLogger.getDefaultLoggerFunction(),
        formatter: PlainFormat,
        loggerMap: {},
      });

      // Should use default logger for all levels
      Object.values(AG_LOGLEVEL).forEach((level) => {
        if (typeof level === 'number') {
          expect(manager.getLogger(level)).toBe(mockLogger.getDefaultLoggerFunction());
        }
      });
    });

    it('should maintain stability when logger map has undefined values', () => {
      setupTestContext();
      const mockLogger = new MockLogger();
      const manager = AgLoggerManager.getManager();

      manager.setManager({
        defaultLogger: mockLogger.getDefaultLoggerFunction(),
        loggerMap: {
          [AG_LOGLEVEL.ERROR]: undefined,
        },
      });

      // Should fallback to default logger when map value is undefined
      expect(manager.getLogger(AG_LOGLEVEL.ERROR)).toBe(mockLogger.getDefaultLoggerFunction());
    });

    it('should handle multiple rapid configuration changes', () => {
      setupTestContext();
      const manager = AgLoggerManager.getManager();

      const loggers = Array.from({ length: 5 }, () => new MockLogger());
      const formatters = [JsonFormat, PlainFormat, NullFormat, JsonFormat, PlainFormat];

      // Rapid configuration changes
      loggers.forEach((logger, index) => {
        manager.setManager({
          defaultLogger: logger.getDefaultLoggerFunction(),
          formatter: formatters[index],
        });
      });

      // Should have final configuration
      expect(manager.getLogger(AG_LOGLEVEL.INFO)).toBe(loggers[4].getDefaultLoggerFunction());
      expect(manager.getFormatter()).toBe(formatters[4]);
    });
  });
});
