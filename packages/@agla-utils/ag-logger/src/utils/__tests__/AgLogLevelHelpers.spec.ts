// src/utils/__tests__/AgLogLevelHelpers.spec.ts
// @(#) : LogLevel helper functions test
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';

// Import helper functions
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogLevel } from '../../../shared/types';
import { AgToLabel } from '../AgLogLevelHelpers';

describe('LogLevel Helper Functions', () => {
  describe('AgToLabel function', () => {
    it('should convert numeric log level to uppercase string', () => {
      expect(AgToLabel(AG_LOGLEVEL.OFF)).toBe('OFF');
      expect(AgToLabel(AG_LOGLEVEL.FATAL)).toBe('FATAL');
      expect(AgToLabel(AG_LOGLEVEL.ERROR)).toBe('ERROR');
      expect(AgToLabel(AG_LOGLEVEL.WARN)).toBe('WARN');
      expect(AgToLabel(AG_LOGLEVEL.INFO)).toBe('INFO');
      expect(AgToLabel(AG_LOGLEVEL.DEBUG)).toBe('DEBUG');
      expect(AgToLabel(AG_LOGLEVEL.TRACE)).toBe('TRACE');
    });

    it('should maintain compatibility with expected string format', () => {
      // Test that labels match expected format
      expect(AgToLabel(AG_LOGLEVEL.OFF)).toBe('OFF');
      expect(AgToLabel(AG_LOGLEVEL.FATAL)).toBe('FATAL');
      expect(AgToLabel(AG_LOGLEVEL.ERROR)).toBe('ERROR');
      expect(AgToLabel(AG_LOGLEVEL.WARN)).toBe('WARN');
      expect(AgToLabel(AG_LOGLEVEL.INFO)).toBe('INFO');
      expect(AgToLabel(AG_LOGLEVEL.DEBUG)).toBe('DEBUG');
      expect(AgToLabel(AG_LOGLEVEL.TRACE)).toBe('TRACE');
    });

    it('should handle invalid log levels gracefully', () => {
      // These should either throw or return a sensible default
      expect(() => AgToLabel(-1 as AgLogLevel)).toThrow('Invalid log level: -1');
      expect(() => AgToLabel(99 as AgLogLevel)).toThrow('Invalid log level: 99');
      expect(() => AgToLabel(null as unknown as AgLogLevel)).toThrow('Invalid log level: null');
      expect(() => AgToLabel(undefined as unknown as AgLogLevel)).toThrow('Invalid log level: undefined');
    });

    it('should return consistent format', () => {
      // All returned strings should be uppercase
      Object.values(AG_LOGLEVEL).forEach((level) => {
        const label = AgToLabel(level);
        expect(label).toBe(label.toUpperCase());
        expect(label).toMatch(/^[A-Z]+$/);
      });
    });

    it('should handle all AG_LOGLEVEL values', () => {
      // Test all known log level values
      Object.entries(AG_LOGLEVEL).forEach(([key, value]) => {
        const stringLabel = AgToLabel(value);
        expect(stringLabel).toBe(key);
      });
    });

    it('should perform lookups efficiently', () => {
      const startTime = Date.now();

      // Perform many lookups
      for (let i = 0; i < 1000; i++) {
        AgToLabel(AG_LOGLEVEL.INFO);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 100ms for 1000 operations)
      expect(duration).toBeLessThan(100);
    });
  });
});
