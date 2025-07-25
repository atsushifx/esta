// src/functional/core/__tests__/formatLogMessage.compatibility.spec.ts
// @(#) : Compatibility tests between formatLogMessage and AgLoggerGetMessage
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import { AgLoggerGetMessage } from '../../../utils/AgLoggerGetMessage';
import { formatLogMessage } from '../formatLogMessage';

/**
 * Compatibility tests to ensure formatLogMessage produces equivalent output
 * to the existing AgLoggerGetMessage function.
 */
describe('formatLogMessage compatibility with AgLoggerGetMessage', () => {
  describe('Basic message formatting equivalence', () => {
    it('should produce equivalent output for simple string messages', () => {
      const level = AG_LOGLEVEL.INFO;
      const args = ['userid=', 'u1029165'];

      const legacy = AgLoggerGetMessage(level, ...args);
      const functional = formatLogMessage(level, ...args);

      expect(functional.message).toBe(legacy.message);
      expect(functional.args).toEqual(legacy.args);
    });

    it('should produce equivalent output for template strings', () => {
      const level = AG_LOGLEVEL.DEBUG;
      const userid = 'u1029165';
      const args = [`userid=${userid}`];

      const legacy = AgLoggerGetMessage(level, ...args);
      const functional = formatLogMessage(level, ...args);

      expect(functional.message).toBe(legacy.message);
      expect(functional.args).toEqual(legacy.args);
    });

    it('should produce equivalent output for mixed primitive arguments', () => {
      const level = AG_LOGLEVEL.ERROR;
      const args = ['number:', 123, ' string:', 'abc', ' boolean:', true];

      const legacy = AgLoggerGetMessage(level, ...args);
      const functional = formatLogMessage(level, ...args);

      expect(functional.message).toBe(legacy.message);
      expect(functional.args).toEqual(legacy.args);
    });

    it('should produce equivalent output with object arguments', () => {
      const level = AG_LOGLEVEL.TRACE;
      const args = ['user:', { name: 'John Doe' }];

      const legacy = AgLoggerGetMessage(level, ...args);
      const functional = formatLogMessage(level, ...args);

      expect(functional.message).toBe(legacy.message);
      expect(functional.args).toEqual(legacy.args);
    });
  });

  describe('Timestamp handling equivalence', () => {
    it('should produce equivalent output with valid timestamp string', () => {
      const level = AG_LOGLEVEL.FATAL;
      const timestampStr = '2025-07-22T02:45:00.000Z';
      const args = [timestampStr, 'test message'];

      const legacy = AgLoggerGetMessage(level, ...args);
      const functional = formatLogMessage(level, ...args);

      expect(functional.timestamp).toEqual(legacy.timestamp);
      expect(functional.message).toBe(legacy.message);
      expect(functional.args).toEqual(legacy.args);
    });

    it('should produce equivalent output with complex timestamp scenario', () => {
      const level = AG_LOGLEVEL.DEBUG;
      const timestampStr = '2025-07-22T02:45:00.000Z';
      const args = [timestampStr, 'user:', 'john', { id: 123 }];

      const legacy = AgLoggerGetMessage(level, ...args);
      const functional = formatLogMessage(level, ...args);

      expect(functional.timestamp).toEqual(legacy.timestamp);
      expect(functional.message).toBe(legacy.message);
      expect(functional.args).toEqual(legacy.args);
    });
  });

  describe('Level conversion equivalence', () => {
    it('should maintain same log level value (numeric)', () => {
      const args = ['test message'];

      Object.values(AG_LOGLEVEL).forEach((level) => {
        if (typeof level === 'number') {
          const legacy = AgLoggerGetMessage(level, ...args);
          const functional = formatLogMessage(level, ...args);

          // Legacy stores numeric level, functional converts to string
          expect(legacy.logLevel).toBe(level);
          expect(functional.level).toBeDefined();
        }
      });
    });
  });

  describe('Edge cases equivalence', () => {
    it('should handle empty arguments equivalently', () => {
      const level = AG_LOGLEVEL.INFO;
      const args: unknown[] = [];

      const legacy = AgLoggerGetMessage(level, ...args);
      const functional = formatLogMessage(level, ...args);

      expect(functional.message).toBe(legacy.message);
      expect(functional.args).toEqual(legacy.args);
    });

    it('should handle null and undefined arguments equivalently', () => {
      const level = AG_LOGLEVEL.WARN;
      const args = ['test', null, undefined, 'message'];

      const legacy = AgLoggerGetMessage(level, ...args);
      const functional = formatLogMessage(level, ...args);

      expect(functional.message).toBe(legacy.message);
      expect(functional.args).toEqual(legacy.args);
    });
  });
});
