// src/utils/__tests__/LogLevelHelpers.spec.ts
// @(#) : LogLevel helper functions test
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';

// Import helper functions
import { AG_LOG_LEVEL } from '../../../shared/types';
import type { AgTLogLevel } from '../../../shared/types';
import { AgToLabel } from '../LogLevelHelpers';

describe('LogLevel Helper Functions', () => {
  describe('AgToLabel function', () => {
    it('should convert numeric log level to uppercase string', () => {
      expect(AgToLabel(AG_LOG_LEVEL.OFF)).toBe('OFF');
      expect(AgToLabel(AG_LOG_LEVEL.FATAL)).toBe('FATAL');
      expect(AgToLabel(AG_LOG_LEVEL.ERROR)).toBe('ERROR');
      expect(AgToLabel(AG_LOG_LEVEL.WARN)).toBe('WARN');
      expect(AgToLabel(AG_LOG_LEVEL.INFO)).toBe('INFO');
      expect(AgToLabel(AG_LOG_LEVEL.DEBUG)).toBe('DEBUG');
      expect(AgToLabel(AG_LOG_LEVEL.TRACE)).toBe('TRACE');
    });

    it('should maintain compatibility with expected string format', () => {
      // Test that labels match expected format
      expect(AgToLabel(AG_LOG_LEVEL.OFF)).toBe('OFF');
      expect(AgToLabel(AG_LOG_LEVEL.FATAL)).toBe('FATAL');
      expect(AgToLabel(AG_LOG_LEVEL.ERROR)).toBe('ERROR');
      expect(AgToLabel(AG_LOG_LEVEL.WARN)).toBe('WARN');
      expect(AgToLabel(AG_LOG_LEVEL.INFO)).toBe('INFO');
      expect(AgToLabel(AG_LOG_LEVEL.DEBUG)).toBe('DEBUG');
      expect(AgToLabel(AG_LOG_LEVEL.TRACE)).toBe('TRACE');
    });

    it('should handle invalid log levels gracefully', () => {
      // These should either throw or return a sensible default
      expect(() => AgToLabel(-1 as AgTLogLevel)).toThrow('Invalid log level: -1');
      expect(() => AgToLabel(99 as AgTLogLevel)).toThrow('Invalid log level: 99');
      expect(() => AgToLabel(null as unknown as AgTLogLevel)).toThrow('Invalid log level: null');
      expect(() => AgToLabel(undefined as unknown as AgTLogLevel)).toThrow('Invalid log level: undefined');
    });

    it('should return consistent format', () => {
      // All returned strings should be uppercase
      Object.values(AG_LOG_LEVEL).forEach((level) => {
        const label = AgToLabel(level);
        expect(label).toBe(label.toUpperCase());
        expect(label).toMatch(/^[A-Z]+$/);
      });
    });

    it('should handle all AG_LOG_LEVEL values', () => {
      // Test all known log level values
      Object.entries(AG_LOG_LEVEL).forEach(([key, value]) => {
        const stringLabel = AgToLabel(value);
        expect(stringLabel).toBe(key);
      });
    });

    it('should perform lookups efficiently', () => {
      const startTime = Date.now();

      // Perform many lookups
      for (let i = 0; i < 1000; i++) {
        AgToLabel(AG_LOG_LEVEL.INFO);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 100ms for 1000 operations)
      expect(duration).toBeLessThan(100);
    });
  });
});
