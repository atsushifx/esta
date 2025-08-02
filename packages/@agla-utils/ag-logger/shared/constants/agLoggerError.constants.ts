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
