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
  AG_LABEL_TO_LOGLEVEL_MAP,
  AG_LOGLEVEL,
  AG_LOGLEVEL_TO_LABEL_MAP,
} from '../../../shared/types';
import type { AgTLogLevel, AgTLogLevelLabel } from '../../../shared/types';

describe('New LogLevel Constants', () => {
  describe('AG_LOGLEVEL constant object', () => {
    it('should define all required log levels with correct numeric values', () => {
      expect(AG_LOGLEVEL.OFF).toBe(0);
      expect(AG_LOGLEVEL.FATAL).toBe(1);
      expect(AG_LOGLEVEL.ERROR).toBe(2);
      expect(AG_LOGLEVEL.WARN).toBe(3);
      expect(AG_LOGLEVEL.INFO).toBe(4);
      expect(AG_LOGLEVEL.DEBUG).toBe(5);
      expect(AG_LOGLEVEL.TRACE).toBe(6);
    });

    it('should be immutable (const assertion)', () => {
      // TypeScript should prevent modification
      // This test ensures the const assertion is applied correctly
      const levelKeys = Object.keys(AG_LOGLEVEL);
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
      expect(AG_LOGLEVEL.OFF).toBe(0);
      expect(AG_LOGLEVEL.FATAL).toBe(1);
      expect(AG_LOGLEVEL.ERROR).toBe(2);
      expect(AG_LOGLEVEL.WARN).toBe(3);
      expect(AG_LOGLEVEL.INFO).toBe(4);
      expect(AG_LOGLEVEL.DEBUG).toBe(5);
      expect(AG_LOGLEVEL.TRACE).toBe(6);
    });
  });

  describe('AG_LABEL_TO_LOGLEVEL_MAP mapping', () => {
    it('should map string labels to AG_LOGLEVEL values', () => {
      expect(AG_LABEL_TO_LOGLEVEL_MAP.OFF).toBe(AG_LOGLEVEL.OFF);
      expect(AG_LABEL_TO_LOGLEVEL_MAP.FATAL).toBe(AG_LOGLEVEL.FATAL);
      expect(AG_LABEL_TO_LOGLEVEL_MAP.ERROR).toBe(AG_LOGLEVEL.ERROR);
      expect(AG_LABEL_TO_LOGLEVEL_MAP.WARN).toBe(AG_LOGLEVEL.WARN);
      expect(AG_LABEL_TO_LOGLEVEL_MAP.INFO).toBe(AG_LOGLEVEL.INFO);
      expect(AG_LABEL_TO_LOGLEVEL_MAP.DEBUG).toBe(AG_LOGLEVEL.DEBUG);
      expect(AG_LABEL_TO_LOGLEVEL_MAP.TRACE).toBe(AG_LOGLEVEL.TRACE);
    });

    it('should contain all string labels for log levels', () => {
      const labelKeys = Object.keys(AG_LABEL_TO_LOGLEVEL_MAP);
      expect(labelKeys).toHaveLength(7);
      expect(labelKeys).toEqual(['OFF', 'FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']);
    });

    it('should have consistent values with AG_LOGLEVEL', () => {
      Object.entries(AG_LABEL_TO_LOGLEVEL_MAP).forEach(([key, value]) => {
        expect(value).toBe(AG_LOGLEVEL[key as keyof typeof AG_LOGLEVEL]);
      });
    });
  });

  describe('AG_LOGLEVEL_TO_LABEL_MAP auto-generated mapping', () => {
    it('should map numeric levels to string labels', () => {
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.OFF]).toBe('OFF');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.FATAL]).toBe('FATAL');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.ERROR]).toBe('ERROR');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.WARN]).toBe('WARN');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.INFO]).toBe('INFO');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.DEBUG]).toBe('DEBUG');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.TRACE]).toBe('TRACE');
    });

    it('should be consistent with AG_LABEL_TO_LOGLEVEL_MAP (bidirectional)', () => {
      Object.entries(AG_LABEL_TO_LOGLEVEL_MAP).forEach(([label, level]) => {
        expect(AG_LOGLEVEL_TO_LABEL_MAP[level]).toBe(label);
      });
    });

    it('should contain all numeric levels', () => {
      const numericKeys = Object.keys(AG_LOGLEVEL_TO_LABEL_MAP).map(Number);
      expect(numericKeys).toHaveLength(7);
      expect(numericKeys.sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('Type definitions', () => {
    it('should correctly infer AgTLogLevel type from AG_LOGLEVEL values', () => {
      // Type test - these should compile without errors
      const levelOff: AgTLogLevel = AG_LOGLEVEL.OFF;
      const levelFatal: AgTLogLevel = AG_LOGLEVEL.FATAL;
      const levelError: AgTLogLevel = AG_LOGLEVEL.ERROR;
      const levelWarn: AgTLogLevel = AG_LOGLEVEL.WARN;
      const levelInfo: AgTLogLevel = AG_LOGLEVEL.INFO;
      const levelDebug: AgTLogLevel = AG_LOGLEVEL.DEBUG;
      const levelTrace: AgTLogLevel = AG_LOGLEVEL.TRACE;

      expect([levelOff, levelFatal, levelError, levelWarn, levelInfo, levelDebug, levelTrace]).toEqual([
        AG_LOGLEVEL.OFF,
        AG_LOGLEVEL.FATAL,
        AG_LOGLEVEL.ERROR,
        AG_LOGLEVEL.WARN,
        AG_LOGLEVEL.INFO,
        AG_LOGLEVEL.DEBUG,
        AG_LOGLEVEL.TRACE,
      ]);
    });

    it('should correctly infer AgTLogLevelLabel type from AG_LABEL_TO_LOGLEVEL_MAP keys', () => {
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
        const numericLevel = AG_LABEL_TO_LOGLEVEL_MAP[configValue as AgTLogLevelLabel];
        expect(typeof numericLevel).toBe('number');
        expect(numericLevel).toBeGreaterThanOrEqual(AG_LOGLEVEL.OFF);
        expect(numericLevel).toBeLessThanOrEqual(AG_LOGLEVEL.TRACE);
      });
    });

    it('should handle undefined for invalid config values', () => {
      // This test will validate error handling in helper functions
      const invalidLabel = 'INVALID' as AgTLogLevelLabel;
      const result = AG_LABEL_TO_LOGLEVEL_MAP[invalidLabel];
      expect(result).toBeUndefined();
    });
  });
});
