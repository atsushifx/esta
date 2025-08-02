// src: /src/_types/__tests__/AgLoggerError.types.spec.ts
// @(#) : Unit Tests for AgLoggerError Class
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// testing framework
import { describe, expect, it } from 'vitest';
// target class
import { AgLoggerError } from '../../../shared/types/AgLoggerError.types';
// base error class for inheritance testing
import { AglaError } from '../../../shared/types/AglaError.types';
// error categories
import { AG_LOGGER_ERROR_CATEGORIES } from '../../../shared/constants/agLoggerError.constants';

/**
 * Test suite for AgLoggerError class.
 * Verifies error creation, inheritance, and structured error handling functionality.
 */
describe('AgLoggerError', () => {
  it('should create AgLoggerError instance with all properties', () => {
    const errorCode = 'TEST_CODE';
    const errorMessage = 'Test error message';
    const context = { level: 999, operation: 'test' };
    const error = new AgLoggerError(errorCode, errorMessage, context);

    expect(error).toBeInstanceOf(AgLoggerError);
    expect(error).toBeInstanceOf(AglaError);
    expect(error).toBeInstanceOf(Error);
    expect(error.errorType).toBe(errorCode);
    expect(error.message).toBe(errorMessage);
    expect(error.context).toEqual(context);
    expect(error.name).toBe('AgLoggerError');
    expect(error.stack).toBeDefined();
  });

  it('should work with predefined error categories', () => {
    const errorMessage = 'Invalid log level provided';
    const error = new AgLoggerError(AG_LOGGER_ERROR_CATEGORIES.INVALID_LOG_LEVEL, errorMessage);

    expect(error.errorType).toBe('AG_LOGGER_INVALID_LOG_LEVEL');
    expect(error.message).toBe(errorMessage);
  });

  it('should have proper toString representation', () => {
    const errorCode = 'TEST_CODE';
    const errorMessage = 'Test message';
    const context = { field: 'value' };

    const errorWithoutContext = new AgLoggerError(errorCode, errorMessage);
    const errorWithContext = new AgLoggerError(errorCode, errorMessage, context);

    expect(errorWithoutContext.toString()).toBe('TEST_CODE: Test message');
    expect(errorWithContext.toString()).toBe('TEST_CODE: Test message {"field":"value"}');
  });
});
