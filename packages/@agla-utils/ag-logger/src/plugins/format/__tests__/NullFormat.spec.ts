// src/plugins/format/__tests__/NullFormat.spec.ts
// @(#) : Unit tests for NullFormat plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest imports
import { describe, expect, it } from 'vitest';

// constants
import { AgLogLevelCode } from '../../../../shared/types';
// types
import type { AgLogMessage } from '../../../../shared/types';

// subject under test
import { NullFormat } from '../NullFormat';

describe('NullFormat', () => {
  /**
   * Returns an empty string regardless of input arguments.
   */
  it('returns an empty string regardless of arguments', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.INFO,
      timestamp: new Date(),
      message: 'test message',
      args: [],
    };
    expect(NullFormat(logMessage)).toBe('');
  });

  /**
   * Returns an empty string even if multiple arguments are present.
   */
  it('returns an empty string even with multiple arguments', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.WARN,
      timestamp: new Date(),
      message: 'msg1 msg2',
      args: [123, true, { data: 'test' }],
    };
    expect(NullFormat(logMessage)).toBe('');
  });

  /**
   * Returns an empty string for all log levels.
   */
  it('returns an empty string for all log levels', () => {
    const baseMessage: Omit<AgLogMessage, 'logLevel'> = {
      timestamp: new Date(),
      message: 'test',
      args: [],
    };

    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.OFF })).toBe('');
    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.FATAL })).toBe('');
    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.ERROR })).toBe('');
    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.WARN })).toBe('');
    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.INFO })).toBe('');
    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.DEBUG })).toBe('');
    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.TRACE })).toBe('');
  });
});
