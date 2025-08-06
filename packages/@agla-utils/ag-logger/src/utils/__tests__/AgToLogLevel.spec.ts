// src/utils/__tests__/AgToLogLevel.spec.ts
// @(#) : Unit tests for AgToLogLevel function (String label to log level conversion)
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogLevelLabel } from '../../../shared/types';
import { AgToLogLevel } from '../AgLogLevelHelpers';

describe('AgToLogLevel Function', () => {
  describe('正常系: Valid label conversions', () => {
    it('should convert uppercase string labels to numeric log levels', () => {
      expect(AgToLogLevel('OFF' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.OFF);
      expect(AgToLogLevel('FATAL' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.FATAL);
      expect(AgToLogLevel('ERROR' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.ERROR);
      expect(AgToLogLevel('WARN' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.WARN);
      expect(AgToLogLevel('INFO' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.INFO);
      expect(AgToLogLevel('DEBUG' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.DEBUG);
      expect(AgToLogLevel('TRACE' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.TRACE);
      expect(AgToLogLevel('VERBOSE' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.VERBOSE);
    });

    it('should handle lowercase string labels by converting to uppercase', () => {
      expect(AgToLogLevel('off' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.OFF);
      expect(AgToLogLevel('fatal' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.FATAL);
      expect(AgToLogLevel('error' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.ERROR);
      expect(AgToLogLevel('warn' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.WARN);
      expect(AgToLogLevel('info' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.INFO);
      expect(AgToLogLevel('debug' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.DEBUG);
      expect(AgToLogLevel('trace' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.TRACE);
      expect(AgToLogLevel('verbose' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.VERBOSE);
    });

    it('should handle mixed case string labels', () => {
      expect(AgToLogLevel('Off' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.OFF);
      expect(AgToLogLevel('Fatal' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.FATAL);
      expect(AgToLogLevel('Error' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.ERROR);
      expect(AgToLogLevel('Warn' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.WARN);
      expect(AgToLogLevel('Info' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.INFO);
      expect(AgToLogLevel('Debug' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.DEBUG);
      expect(AgToLogLevel('Trace' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.TRACE);
      expect(AgToLogLevel('Verbose' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.VERBOSE);
    });

    it('should handle all valid log level labels consistently', () => {
      const validLabels = ['OFF', 'FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE', 'VERBOSE'];
      const expectedValues = [
        AG_LOGLEVEL.OFF,
        AG_LOGLEVEL.FATAL,
        AG_LOGLEVEL.ERROR,
        AG_LOGLEVEL.WARN,
        AG_LOGLEVEL.INFO,
        AG_LOGLEVEL.DEBUG,
        AG_LOGLEVEL.TRACE,
        AG_LOGLEVEL.VERBOSE,
      ];

      validLabels.forEach((label, index) => {
        expect(AgToLogLevel(label as AgLogLevelLabel)).toBe(expectedValues[index]);
      });
    });
  });

  describe('異常系: Invalid label inputs', () => {
    it('should return undefined for invalid string labels', () => {
      expect(AgToLogLevel('INVALID' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('LOG' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('LEVEL' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('UNKNOWN' as AgLogLevelLabel)).toBeUndefined();
    });

    it('should return undefined for empty and whitespace strings', () => {
      expect(AgToLogLevel('' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel(' ' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('  ' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('\t' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('\n' as AgLogLevelLabel)).toBeUndefined();
    });

    it('should return undefined for numeric string inputs', () => {
      expect(AgToLogLevel('0' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('1' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('4' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('-99' as AgLogLevelLabel)).toBeUndefined();
    });

    it('should return undefined for invalid type inputs', () => {
      expect(AgToLogLevel(null as unknown as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel(undefined as unknown as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel(4 as unknown as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel(true as unknown as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel({} as unknown as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel([] as unknown as AgLogLevelLabel)).toBeUndefined();
    });

    it('should return undefined for function inputs', () => {
      expect(AgToLogLevel((() => {}) as unknown as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel(AgToLogLevel as unknown as AgLogLevelLabel)).toBeUndefined();
    });
  });

  describe('エッジケース: Edge cases and special inputs', () => {
    it('should handle labels with extra whitespace by trimming', () => {
      expect(AgToLogLevel(' INFO ' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.INFO);
      expect(AgToLogLevel('\tERROR\t' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.ERROR);
      expect(AgToLogLevel('\nWARN\n' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.WARN);
      expect(AgToLogLevel('  DEBUG  ' as AgLogLevelLabel)).toBe(AG_LOGLEVEL.DEBUG);
    });

    it('should return undefined for special string values', () => {
      expect(AgToLogLevel('NaN' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('Infinity' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('-Infinity' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('null' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('undefined' as AgLogLevelLabel)).toBeUndefined();
    });

    it('should handle similar but invalid label variations', () => {
      expect(AgToLogLevel('INFORMATION' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('WARNING' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('DEBUGGING' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('TRACING' as AgLogLevelLabel)).toBeUndefined();
    });

    it('should return undefined for labels with special characters', () => {
      expect(AgToLogLevel('INFO!' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('ERROR-' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('WARN?' as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel('DEBUG_' as AgLogLevelLabel)).toBeUndefined();
    });

    it('should handle symbol values', () => {
      expect(AgToLogLevel(Symbol('INFO') as unknown as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel(Symbol.for('ERROR') as unknown as AgLogLevelLabel)).toBeUndefined();
    });

    it('should handle array-like objects', () => {
      expect(AgToLogLevel(['INFO'] as unknown as AgLogLevelLabel)).toBeUndefined();
      expect(AgToLogLevel({ toString: () => 'INFO' } as unknown as AgLogLevelLabel)).toBeUndefined();
    });
  });

  describe('Performance and consistency tests', () => {
    it('should perform lookups efficiently', () => {
      const startTime = Date.now();

      for (let i = 0; i < 10000; i++) {
        AgToLogLevel('INFO' as AgLogLevelLabel);
        AgToLogLevel('ERROR' as AgLogLevelLabel);
        AgToLogLevel('WARN' as AgLogLevelLabel);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in reasonable time
    });

    it('should return consistent results across multiple calls', () => {
      const testCases = [
        { input: 'INFO' as AgLogLevelLabel, expected: AG_LOGLEVEL.INFO },
        { input: 'error' as AgLogLevelLabel, expected: AG_LOGLEVEL.ERROR },
        { input: 'INVALID' as AgLogLevelLabel, expected: undefined },
        { input: null as unknown as AgLogLevelLabel, expected: undefined },
      ];

      testCases.forEach(({ input, expected }) => {
        for (let i = 0; i < 100; i++) {
          expect(AgToLogLevel(input)).toBe(expected);
        }
      });
    });

    it('should handle mixed valid and invalid inputs in sequence', () => {
      const mixedInputs = [
        'INFO',
        'INVALID',
        'ERROR',
        null,
        'warn',
        123,
        'VERBOSE',
      ] as AgLogLevelLabel[];

      const expectedOutputs = [
        AG_LOGLEVEL.INFO,
        undefined,
        AG_LOGLEVEL.ERROR,
        undefined,
        AG_LOGLEVEL.WARN,
        undefined,
        AG_LOGLEVEL.VERBOSE,
      ];

      mixedInputs.forEach((input, index) => {
        expect(AgToLogLevel(input)).toBe(expectedOutputs[index]);
      });
    });
  });
});
