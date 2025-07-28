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
import { AglaError } from '../../../shared/types/error.types';
// error categories
import { AG_LOGGER_ERROR_CATEGORIES } from '../../../shared/constants/agLoggerError.constants';

/**
 * Test suite for AgLoggerError class.
 * Verifies error creation, inheritance, and structured error handling functionality.
 */
describe('AgLoggerError', () => {
  it('should create AgLoggerError instance with code and message', () => {
    const errorCode = 'TEST_CODE';
    const errorMessage = 'Test error message';
    const error = new AgLoggerError(errorCode, errorMessage);

    expect(error).toBeInstanceOf(AgLoggerError);
    expect(error.code).toBe(errorCode);
    expect(error.message).toBe(errorMessage);
    expect(error.name).toBe('AgLoggerError');
  });

  it('should inherit from AglaError', () => {
    const error = new AgLoggerError('TEST_CODE', 'Test message');

    expect(error).toBeInstanceOf(AglaError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should create AgLoggerError with context information', () => {
    const errorCode = 'TEST_CODE';
    const errorMessage = 'Test error with context';
    const context = { level: 999, operation: 'getLoggerFunction' };
    const error = new AgLoggerError(errorCode, errorMessage, context);

    expect(error.code).toBe(errorCode);
    expect(error.message).toBe(errorMessage);
    expect(error.context).toEqual(context);
  });

  it('should work with predefined error categories', () => {
    const errorMessage = 'Invalid log level provided';
    const error = new AgLoggerError(AG_LOGGER_ERROR_CATEGORIES.INVALID_LOG_LEVEL, errorMessage);

    expect(error.code).toBe(AG_LOGGER_ERROR_CATEGORIES.INVALID_LOG_LEVEL);
    expect(error.code).toBe('AG_LOGGER_INVALID_LOG_LEVEL');
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

  it('should maintain stack trace', () => {
    const error = new AgLoggerError('TEST_CODE', 'Test message');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('AgLoggerError');
  });
});
