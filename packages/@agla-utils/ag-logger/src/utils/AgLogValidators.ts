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
import { valueToString } from './AgLogHelpers';

export const isValidLogLevel = (logLevel: AgLogLevel): boolean => {
  return (
    typeof logLevel === 'number'
    && Object.values(AG_LOGLEVEL).includes(logLevel)
  );
};

/**
 * validate log level and throw error if invalid
 */
export const validateLogLevel = (logLevel: AgLogLevel): AgLogLevel => {
  if (!isValidLogLevel(logLevel)) {
    throw new AgLoggerError(
      ERROR_TYPES.VALIDATION,
      `${AG_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL} (${valueToString(logLevel)})`,
    );
  }
  return logLevel;
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
