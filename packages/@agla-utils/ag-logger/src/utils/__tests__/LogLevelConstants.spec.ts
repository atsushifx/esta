// src/utils/__tests__/LogLevelConstants.spec.ts
// @(#) : New LogLevel constants and mapping test (TDD Red Phase)
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';

// Import unified implementation
import {
  AG_LABEL_TO_LOG_LEVEL_MAP,
  AG_LOG_LEVEL,
  AG_LOG_LEVEL_TO_LABEL_MAP,
} from '../../../shared/types';
import type { AgTLogLevel, AgTLogLevelLabel } from '../../../shared/types';

describe('New LogLevel Constants', () => {
  describe('AG_LOG_LEVEL constant object', () => {
    it('should define all required log levels with correct numeric values', () => {
      expect(AG_LOG_LEVEL.OFF).toBe(0);
      expect(AG_LOG_LEVEL.FATAL).toBe(1);
      expect(AG_LOG_LEVEL.ERROR).toBe(2);
      expect(AG_LOG_LEVEL.WARN).toBe(3);
      expect(AG_LOG_LEVEL.INFO).toBe(4);
      expect(AG_LOG_LEVEL.DEBUG).toBe(5);
      expect(AG_LOG_LEVEL.TRACE).toBe(6);
    });

    it('should be immutable (const assertion)', () => {
      // TypeScript should prevent modification
      // This test ensures the const assertion is applied correctly
      const levelKeys = Object.keys(AG_LOG_LEVEL);
      expect(levelKeys).toHaveLength(7);
      expect(levelKeys).toContain('OFF');
      expect(levelKeys).toContain('FATAL');
      expect(levelKeys).toContain('ERROR');
      expect(levelKeys).toContain('WARN');
      expect(levelKeys).toContain('INFO');
      expect(levelKeys).toContain('DEBUG');
      expect(levelKeys).toContain('TRACE');
    });

    it('should maintain compatibility with existing AgLogLevelCode values', () => {
      // These values must match the existing implementation
      expect(AG_LOG_LEVEL.OFF).toBe(0);
      expect(AG_LOG_LEVEL.FATAL).toBe(1);
      expect(AG_LOG_LEVEL.ERROR).toBe(2);
      expect(AG_LOG_LEVEL.WARN).toBe(3);
      expect(AG_LOG_LEVEL.INFO).toBe(4);
      expect(AG_LOG_LEVEL.DEBUG).toBe(5);
      expect(AG_LOG_LEVEL.TRACE).toBe(6);
    });
  });

  describe('AG_LABEL_TO_LOG_LEVEL_MAP mapping', () => {
    it('should map string labels to AG_LOG_LEVEL values', () => {
      expect(AG_LABEL_TO_LOG_LEVEL_MAP.OFF).toBe(AG_LOG_LEVEL.OFF);
      expect(AG_LABEL_TO_LOG_LEVEL_MAP.FATAL).toBe(AG_LOG_LEVEL.FATAL);
      expect(AG_LABEL_TO_LOG_LEVEL_MAP.ERROR).toBe(AG_LOG_LEVEL.ERROR);
      expect(AG_LABEL_TO_LOG_LEVEL_MAP.WARN).toBe(AG_LOG_LEVEL.WARN);
      expect(AG_LABEL_TO_LOG_LEVEL_MAP.INFO).toBe(AG_LOG_LEVEL.INFO);
      expect(AG_LABEL_TO_LOG_LEVEL_MAP.DEBUG).toBe(AG_LOG_LEVEL.DEBUG);
      expect(AG_LABEL_TO_LOG_LEVEL_MAP.TRACE).toBe(AG_LOG_LEVEL.TRACE);
    });

    it('should contain all string labels for log levels', () => {
      const labelKeys = Object.keys(AG_LABEL_TO_LOG_LEVEL_MAP);
      expect(labelKeys).toHaveLength(7);
      expect(labelKeys).toEqual(['OFF', 'FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']);
    });

    it('should have consistent values with AG_LOG_LEVEL', () => {
      Object.entries(AG_LABEL_TO_LOG_LEVEL_MAP).forEach(([key, value]) => {
        expect(value).toBe(AG_LOG_LEVEL[key as keyof typeof AG_LOG_LEVEL]);
      });
    });
  });

  describe('AG_LOG_LEVEL_TO_LABEL_MAP auto-generated mapping', () => {
    it('should map numeric levels to string labels', () => {
      expect(AG_LOG_LEVEL_TO_LABEL_MAP[AG_LOG_LEVEL.OFF]).toBe('OFF');
      expect(AG_LOG_LEVEL_TO_LABEL_MAP[AG_LOG_LEVEL.FATAL]).toBe('FATAL');
      expect(AG_LOG_LEVEL_TO_LABEL_MAP[AG_LOG_LEVEL.ERROR]).toBe('ERROR');
      expect(AG_LOG_LEVEL_TO_LABEL_MAP[AG_LOG_LEVEL.WARN]).toBe('WARN');
      expect(AG_LOG_LEVEL_TO_LABEL_MAP[AG_LOG_LEVEL.INFO]).toBe('INFO');
      expect(AG_LOG_LEVEL_TO_LABEL_MAP[AG_LOG_LEVEL.DEBUG]).toBe('DEBUG');
      expect(AG_LOG_LEVEL_TO_LABEL_MAP[AG_LOG_LEVEL.TRACE]).toBe('TRACE');
    });

    it('should be consistent with AG_LABEL_TO_LOG_LEVEL_MAP (bidirectional)', () => {
      Object.entries(AG_LABEL_TO_LOG_LEVEL_MAP).forEach(([label, level]) => {
        expect(AG_LOG_LEVEL_TO_LABEL_MAP[level]).toBe(label);
      });
    });

    it('should contain all numeric levels', () => {
      const numericKeys = Object.keys(AG_LOG_LEVEL_TO_LABEL_MAP).map(Number);
      expect(numericKeys).toHaveLength(7);
      expect(numericKeys.sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('Type definitions', () => {
    it('should correctly infer AgTLogLevel type from AG_LOG_LEVEL values', () => {
      // Type test - these should compile without errors
      const levelOff: AgTLogLevel = AG_LOG_LEVEL.OFF;
      const levelFatal: AgTLogLevel = AG_LOG_LEVEL.FATAL;
      const levelError: AgTLogLevel = AG_LOG_LEVEL.ERROR;
      const levelWarn: AgTLogLevel = AG_LOG_LEVEL.WARN;
      const levelInfo: AgTLogLevel = AG_LOG_LEVEL.INFO;
      const levelDebug: AgTLogLevel = AG_LOG_LEVEL.DEBUG;
      const levelTrace: AgTLogLevel = AG_LOG_LEVEL.TRACE;

      expect([levelOff, levelFatal, levelError, levelWarn, levelInfo, levelDebug, levelTrace]).toEqual([
        AG_LOG_LEVEL.OFF,
        AG_LOG_LEVEL.FATAL,
        AG_LOG_LEVEL.ERROR,
        AG_LOG_LEVEL.WARN,
        AG_LOG_LEVEL.INFO,
        AG_LOG_LEVEL.DEBUG,
        AG_LOG_LEVEL.TRACE,
      ]);
    });

    it('should correctly infer AgTLogLevelLabel type from AG_LABEL_TO_LOG_LEVEL_MAP keys', () => {
      // Type test - these should compile without errors
      const labelOff: AgTLogLevelLabel = 'OFF';
      const labelFatal: AgTLogLevelLabel = 'FATAL';
      const labelError: AgTLogLevelLabel = 'ERROR';
      const labelWarn: AgTLogLevelLabel = 'WARN';
      const labelInfo: AgTLogLevelLabel = 'INFO';
      const labelDebug: AgTLogLevelLabel = 'DEBUG';
      const labelTrace: AgTLogLevelLabel = 'TRACE';

      expect([labelOff, labelFatal, labelError, labelWarn, labelInfo, labelDebug, labelTrace]).toEqual([
        'OFF',
        'FATAL',
        'ERROR',
        'WARN',
        'INFO',
        'DEBUG',
        'TRACE',
      ]);
    });
  });

  describe('Integration with configuration files', () => {
    it('should support typical configuration file scenarios', () => {
      // Simulate reading from config file
      const configValues = ['OFF', 'INFO', 'DEBUG', 'ERROR'];

      configValues.forEach((configValue) => {
        const numericLevel = AG_LABEL_TO_LOG_LEVEL_MAP[configValue as AgTLogLevelLabel];
        expect(typeof numericLevel).toBe('number');
        expect(numericLevel).toBeGreaterThanOrEqual(AG_LOG_LEVEL.OFF);
        expect(numericLevel).toBeLessThanOrEqual(AG_LOG_LEVEL.TRACE);
      });
    });

    it('should handle undefined for invalid config values', () => {
      // This test will validate error handling in helper functions
      const invalidLabel = 'INVALID' as AgTLogLevelLabel;
      const result = AG_LABEL_TO_LOG_LEVEL_MAP[invalidLabel];
      expect(result).toBeUndefined();
    });
  });
});
