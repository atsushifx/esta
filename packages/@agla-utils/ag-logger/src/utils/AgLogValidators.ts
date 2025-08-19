// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// src/utils/AgLogLevelValidators.ts
// @(#) : AgLogger validator functions

// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { AgLoggerError } from 'shared/types/AgLoggerError.types';
import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../../shared/constants/agErrorMessages';
import { AG_LOGLEVEL } from '../../shared/types';
import type { AgLogLevel } from '../../shared/types';
import type { AgMockConstructor } from '../../shared/types/AgMockConstructor.class';
import { valueToString } from './AgLogHelpers';

export const isValidLogLevel = (logLevel: unknown): logLevel is AgLogLevel => {
  return (
    logLevel !== undefined
    && logLevel !== null
    && typeof logLevel === 'number'
    && Number.isFinite(logLevel)
    && Number.isInteger(logLevel)
    && Object.values(AG_LOGLEVEL).includes(logLevel as AgLogLevel)
  );
};

/**
 * validate log level and throw error if invalid
 */
export const validateLogLevel = (input: unknown): AgLogLevel => {
  // Quick check with isValidLogLevel first
  if (!isValidLogLevel(input)) {
    // Detailed error reporting for specific failure cases
    if (input === undefined) {
      throw new AgLoggerError(
        ERROR_TYPES.VALIDATION,
        `${AG_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL} (undefined)`,
      );
    }

    if (input === null) {
      throw new AgLoggerError(
        ERROR_TYPES.VALIDATION,
        `${AG_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL} (null)`,
      );
    }

    if (typeof input !== 'number') {
      throw new AgLoggerError(
        ERROR_TYPES.VALIDATION,
        `${AG_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL} (${valueToString(input)} - expected number)`,
      );
    }

    if (!Number.isFinite(input)) {
      throw new AgLoggerError(
        ERROR_TYPES.VALIDATION,
        `${AG_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL} (${input} - must be finite number)`,
      );
    }

    if (!Number.isInteger(input)) {
      throw new AgLoggerError(
        ERROR_TYPES.VALIDATION,
        `${AG_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL} (${input} - must be integer)`,
      );
    }

    // If we reach here, it must be out of range
    throw new AgLoggerError(
      ERROR_TYPES.VALIDATION,
      `${AG_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL} (${input} - out of valid range)`,
    );
  }
  return input;
};

/**
 * Checks if a given value is a valid formatter function
 * @param formatter - Value to check
 * @returns True if the value is a non-null, non-undefined function, false otherwise
 */
export const isValidFormatter = (formatter: unknown): boolean => {
  return formatter !== null
    && formatter !== undefined
    && typeof formatter === 'function';
};

/**
 * Validates that a formatter function is valid.
 * @param formatter - The formatter function to validate
 * @throws {AgLoggerError} When formatter is null, undefined, or not a function
 */
export const validateFormatter = (formatter: unknown): void => {
  if (!isValidFormatter(formatter)) {
    throw new AgLoggerError(
      ERROR_TYPES.CONFIG,
      AG_LOGGER_ERROR_MESSAGES.CONFIG.INVALID_FORMATTER,
    );
  }
};

/**
 * Checks if a given value is a valid logger function
 * @param logger - Value to check
 * @returns True if the value is a non-null, non-undefined function, false otherwise
 */
export const isValidLogger = (logger: unknown): boolean => {
  return logger !== null
    && logger !== undefined
    && typeof logger === 'function';
};

/**
 * Validates that a logger function is valid.
 * @param logger - The logger function to validate
 * @throws {AgLoggerError} When logger is null, undefined, or not a function
 */
export const validateLogger = (logger: unknown): void => {
  if (!isValidLogger(logger)) {
    throw new AgLoggerError(
      ERROR_TYPES.CONFIG,
      AG_LOGGER_ERROR_MESSAGES.CONFIG.INVALID_LOGGER,
    );
  }
};

/**
 * Checks if a given log level is a standard log level (0-6 range).
 * Standard log levels are OFF(0), FATAL(1), ERROR(2), WARN(3), INFO(4), DEBUG(5), TRACE(6).
 * Special log levels like VERBOSE(-11), LOG(-12), DEFAULT(-99) are not standard levels.
 *
 * @param logLevel - Log level to check
 * @returns True if the level is a standard level (0-6), false otherwise
 *
 * @example
 * ```typescript
 * isStandardLogLevel(AG_LOGLEVEL.INFO);    // true
 * isStandardLogLevel(AG_LOGLEVEL.VERBOSE); // false
 * isStandardLogLevel(-1);                  // false
 * isStandardLogLevel(7);                   // false
 * ```
 */
export const isStandardLogLevel = (logLevel: AgLogLevel | undefined): boolean => {
  // Early type check for performance
  if (logLevel === undefined || !isValidLogLevel(logLevel)) {
    return false;
  }

  // Check integer constraint and range in one go
  return logLevel >= AG_LOGLEVEL.OFF // 0
    && logLevel <= AG_LOGLEVEL.TRACE; // 6
};
export const isAgMockConstructor = (value: unknown): value is AgMockConstructor => {
  if (typeof value !== 'function') {
    return false;
  }
  // 判定用の静的フラグを確認
  const marker = (value as { __isMockConstructor?: unknown }).__isMockConstructor;
  return marker === true;
};
