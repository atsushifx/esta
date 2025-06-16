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
import { AgLogLevel } from '@shared/types';

// test unit
import { AgLoggerGetName } from '../AgLogger.helpers';

// test main
describe('Test AgLoggerGetName', () => {
  it('should return the correct log level name', () => {
    expect(AgLoggerGetName(AgLogLevel.OFF)).toBe('off');
    expect(AgLoggerGetName(AgLogLevel.FATAL)).toBe('fatal');
    expect(AgLoggerGetName(AgLogLevel.ERROR)).toBe('error');
    expect(AgLoggerGetName(AgLogLevel.WARN)).toBe('warn');
    expect(AgLoggerGetName(AgLogLevel.INFO)).toBe('info');
    expect(AgLoggerGetName(AgLogLevel.DEBUG)).toBe('debug');
    expect(AgLoggerGetName(AgLogLevel.TRACE)).toBe('trace');
  });
});
