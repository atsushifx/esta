// src: /src/utils/agLogger.helpers.ts
// @(#) : ag-logger helpers
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// constants
import { AgLogLevelCode } from '@shared/types';

// test unit
import { AgLoggerGetLabel } from '../AgLoggerHelpers';

// test main
describe('Test AgLoggerGetLabel', () => {
  it('should return the correct log level label', () => {
    expect(AgLoggerGetLabel(AgLogLevelCode.OFF)).toBe('off');
    expect(AgLoggerGetLabel(AgLogLevelCode.FATAL)).toBe('fatal');
    expect(AgLoggerGetLabel(AgLogLevelCode.ERROR)).toBe('error');
    expect(AgLoggerGetLabel(AgLogLevelCode.WARN)).toBe('warn');
    expect(AgLoggerGetLabel(AgLogLevelCode.INFO)).toBe('info');
    expect(AgLoggerGetLabel(AgLogLevelCode.DEBUG)).toBe('debug');
    expect(AgLoggerGetLabel(AgLogLevelCode.TRACE)).toBe('trace');
  });
});
