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

export const valueToString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return String(value);
  } else if (Array.isArray(value)) {
    return (value.length > 0) ? `[${String(value)}]` : 'array';
  } else if (typeof value === 'function') {
    return (value.name === '') ? 'function' : 'function ' + value.name;
  } else if (typeof value === 'object') {
    return 'object';
  } else if (typeof value === 'string') {
    return `"${value}"`;
  }
  return String(value);
};

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
 * Validates that a formatter function is valid.
 * @param formatter - The formatter function to validate
 * @throws {AgLoggerError} When formatter is null, undefined, or not a function
 */
export const validateFormatter = function(formatter: unknown): void {
  if (formatter === null || formatter === undefined) {
    throw new AgLoggerError(
      ERROR_TYPES.CONFIG,
      AG_LOGGER_ERROR_MESSAGES.CONFIG.INVALID_FORMATTER,
    );
  }
  if (typeof formatter !== 'function') {
    throw new AgLoggerError(
      ERROR_TYPES.CONFIG,
      AG_LOGGER_ERROR_MESSAGES.CONFIG.INVALID_FORMATTER,
    );
  }
};

/**
 * Validates that a logger function is valid.
 * @param logger - The logger function to validate
 * @throws {AgLoggerError} When logger is null, undefined, or not a function
 */
export const validateLogger = function(logger: unknown): void {
  if (logger === null || logger === undefined) {
    throw new AgLoggerError(
      ERROR_TYPES.CONFIG,
      AG_LOGGER_ERROR_MESSAGES.CONFIG.INVALID_LOGGER,
    );
  }
  if (typeof logger !== 'function') {
    throw new AgLoggerError(
      ERROR_TYPES.CONFIG,
      AG_LOGGER_ERROR_MESSAGES.CONFIG.INVALID_LOGGER,
    );
  }
};
