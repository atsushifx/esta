// src: /src/utils/logger/__tests__/AgLogger.spec.ts
// @(#) : Loggerのユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it, vi } from 'vitest';

import { AgLogLevel } from '@shared/types';

// CONSTANTS

// test unit
import { agLog } from '../AgLogUtils';

// constants
const MOCK_DATE = '2025-05-05T00:00:00Z';

// test main
describe('Test AgLog as create right log message', () => {
  describe("test log's date", () => {
    it('should use provided ISO date string', () => {
      const log = agLog(AgLogLevel.INFO, '2025-05-01T12:34:56Z', 'Test message');

      expect(log.startsWith('2025-05-01T12:34:56Z')).toBeTruthy();
      expect(log).contains('info');
      expect(log.endsWith('Test message')).toBeTruthy();
    });

    it('should use current date if no date provided', () => {
      vi.useFakeTimers();
      vi.setSystemTime(MOCK_DATE);

      const log = agLog(AgLogLevel.DEBUG, 'Message without date');

      expect(log.startsWith(MOCK_DATE)).toBe(true);
      expect(log).toContain('[debug]');
      expect(log).toContain('Message without date');

      vi.useRealTimers();
    });
  });

  it('should fallback by invalid date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);

    const log = agLog(AgLogLevel.INFO, 'Invalid date', 'Message');
    expect(log.startsWith(MOCK_DATE)).toBeTruthy();
    expect(log).toContain('[info]');
    expect(log).toContain('Invalid date');
    expect(log).toContain('Message');

    vi.useRealTimers();
  });

  describe('test multiple args', () => {
    it('should join multiple args into a single string', () => {
      const log = agLog(AgLogLevel.WARN, 'Message', { with: 'multiple' }, 7);
      expect(log).toContain('Message');
      expect(log).toContain('with');
      expect(log).toContain('multiple');
      expect(log).toContain('7');
    });
  });
});
