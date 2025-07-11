// src/utils/agLogger.helpers.ts
// @(#) : Unit tests for ag-logger helper functions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest imports
import { describe, expect, it } from 'vitest';

// constants
import { AgLogLevelCode } from '../../../shared/types';

// test subject
import { AgLoggerGetLabel } from '../AgLoggerHelpers';

/**
 * Unit tests for the AgLoggerGetLabel helper function.
 * Validates that each log level code returns the correctly uppercase label string.
 */
describe('Test AgLoggerGetLabel', () => {
  /**
   * Checks that all log level codes correctly map to their uppercase label strings.
   */
  it('should return the correct log level label', () => {
    expect(AgLoggerGetLabel(AgLogLevelCode.OFF)).toBe('OFF');
    expect(AgLoggerGetLabel(AgLogLevelCode.FATAL)).toBe('FATAL');
    expect(AgLoggerGetLabel(AgLogLevelCode.ERROR)).toBe('ERROR');
    expect(AgLoggerGetLabel(AgLogLevelCode.WARN)).toBe('WARN');
    expect(AgLoggerGetLabel(AgLogLevelCode.INFO)).toBe('INFO');
    expect(AgLoggerGetLabel(AgLogLevelCode.DEBUG)).toBe('DEBUG');
    expect(AgLoggerGetLabel(AgLogLevelCode.TRACE)).toBe('TRACE');
  });
});
