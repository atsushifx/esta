// src/utils/validationUtils.ts
// @(#) : Validation Utility Functions for MockLogger
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants
import { MOCK_LOGGER_ERROR_MESSAGES } from '../../shared/constants/errorMessages';
import { AG_LOGLEVEL } from '../../shared/types/LogLevel.types';
import { MockLoggerValidationError } from '../../shared/types/mockLoggerError.types';

// types
import type { AgTLogLevel } from '../../shared/types/LogLevel.types';

/** Minimum allowed log level value. */
const MIN_LOG_LEVEL = AG_LOGLEVEL.OFF;

/** Maximum allowed log level value. */
const MAX_LOG_LEVEL = AG_LOGLEVEL.TRACE;

/**
 * Creates a validation error with context information for debugging.
 *
 * @param invalidValue - The invalid value that caused the error
 * @param context - Additional context information for debugging
 * @returns A MockLoggerValidationError with detailed error information
 */
const createValidationError = (invalidValue: unknown, context: Record<string, unknown>): MockLoggerValidationError => {
  return new MockLoggerValidationError(
    MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL,
    { invalidValue, ...context },
  );
};

/**
 * Validates that a log level is within the acceptable range.
 * Throws a MockLoggerValidationError if the level is invalid.
 *
 * @param level - The log level to validate
 * @throws {MockLoggerValidationError} When the level is not a number or outside valid range
 */
export const validateLogLevel = (level: AgTLogLevel): void => {
  if (typeof level !== 'number') {
    throw createValidationError(level, { expectedType: 'number' });
  }

  if (level >= MIN_LOG_LEVEL && level <= MAX_LOG_LEVEL) {
    return;
  }

  throw createValidationError(level, {
    expectedRange: `${MIN_LOG_LEVEL}-${MAX_LOG_LEVEL}`,
  });
};
