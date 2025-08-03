// shared/constants/agLoggerError.constants.ts
// @(#) : AgLogger Error Category Constants
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Error categories for AgLogger specific errors.
 * These constants are used to categorize and identify different types of errors in AgLogger operations.
 * Each category represents a specific type of error that can occur within the AgLogger system.
 *
 * @example
 * ```typescript
 * import { AG_LOGGER_ERROR_CATEGORIES } from './agLoggerError.constants';
 * import { AgLoggerError } from '../src/internal/AgLoggerError';
 *
 * // Usage in error throwing
 * throw new AgLoggerError(
 *   AG_LOGGER_ERROR_CATEGORIES.INVALID_LOG_LEVEL,
 *   'Log level 999 is not supported'
 * );
 * ```
 */
export const AG_LOGGER_ERROR_CATEGORIES = {
  /** Invalid log level provided to configuration methods. Used when log level is outside valid range (0-6). */
  INVALID_LOG_LEVEL: 'AG_LOGGER_INVALID_LOG_LEVEL',
  /** Invalid formatter configuration. Used when formatter function is not valid or properly configured. */
  INVALID_FORMATTER: 'AG_LOGGER_INVALID_FORMATTER',
  /** Invalid logger function configuration. Used when logger function is not valid or properly configured. */
  INVALID_LOGGER: 'AG_LOGGER_INVALID_LOGGER',
  /** Invalid configuration options. Used when configuration object contains invalid or incompatible options. */
  INVALID_CONFIG: 'AG_LOGGER_INVALID_CONFIG',
  /** Logger initialization error. Used when trying to get logger instance before creating it. */
  INITIALIZE_ERROR: 'AG_LOGGER_INITIALIZE_ERROR',
} as const;

/**
 * Error messages for AgLogger validation errors.
 * These constants provide consistent error messages throughout the AgLogger system.
 * Each message describes a specific validation failure scenario.
 *
 * @example
 * ```typescript
 * import { AG_LOGGER_ERROR_MESSAGES } from './agLoggerError.constants';
 *
 * // Usage in validation
 * throw new AgLoggerError(
 *   AG_LOGGER_ERROR_CATEGORIES.INVALID_CONFIGURATION,
 *   AG_LOGGER_ERROR_MESSAGES.INVALID_FORMATTER
 * );
 * ```
 */
export const AG_LOGGER_ERROR_MESSAGES = {
  /** Message when formatter is null, undefined, or not a function */
  INVALID_FORMATTER: 'formatter must be a valid function',
  /** Message when defaultLogger is null, undefined, or not a function */
  INVALID_DEFAULT_LOGGER: 'defaultLogger must be a valid function',
  /** Message when configuration object is null */
  NULL_CONFIGURATION: 'Cannot read properties of null',
  /** Message when trying to access logger before creation */
  LOGGER_NOT_CREATED: 'Logger instance not created. Call createLogger() first.',
  /** Logger initialization error. Used when trying to get logger instance before creating it. */
  INITIALIZE_ERROR: 'AG_LOGGER_INITIALIZE_ERROR',
} as const;

/**
 * Type for AgLogger error categories derived from AG_LOGGER_ERROR_CATEGORIES values.
 * This type ensures type safety when using error categories and prevents typos.
 *
 * @example
 * ```typescript
 * function handleError(category: TAgLoggerErrorCategory, message: string) {
 *   // category is guaranteed to be one of the valid error categories
 *   throw new AgLoggerError(category, message);
 * }
 * ```
 */
export type TAgLoggerErrorCategory = typeof AG_LOGGER_ERROR_CATEGORIES[keyof typeof AG_LOGGER_ERROR_CATEGORIES];
