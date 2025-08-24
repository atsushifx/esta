// shared/types/AgLoggerError.types.ts
// @(#) : AgLogger Specific Error Class
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// base error class
import { AglaError } from './AglaError.types';

// Error Messages
import type { TErrorType } from '../constants/agErrorMessages';

/**
 * AgLogger specific error class that extends AglaError.
 * Provides standardized error handling for AgLogger operations with structured error codes and context.
 *
 * This class is used throughout the AgLogger package to throw consistent, categorized errors
 * that can be caught and handled appropriately by calling code.
 *
 * @example
 * ```typescript
 * import { AgLoggerError } from './AgLoggerError.types';
 * import { AG_LOGGER_ERROR_CATEGORIES } from '../constants/agLoggerError.constants';
 *
 * // Throw an error with category and message
 * throw new AgLoggerError(
 *   AG_LOGGER_ERROR_CATEGORIES.INVALID_LOG_LEVEL,
 *   'Invalid log level: 999'
 * );
 *
 * // Throw an error with additional context
 * throw new AgLoggerError(
 *   AG_LOGGER_ERROR_CATEGORIES.INVALID_CONFIG,
 *   'Configuration validation failed',
 *   { invalidFields: ['logLevel', 'formatter'] }
 * );
 * ```
 *
 * @extends AglaError
 * @see AG_LOGGER_ERROR_CATEGORIES for available error categories
 */
export class AgLoggerError extends AglaError {
  /**
   * Creates a new AgLoggerError instance.
   *
   * @param errorType - The error type identifying the specific type of error
   * @param message - The human-readable error message
   * @param context - Optional context information for debugging
   */
  constructor(errorType: TErrorType, message: string, context?: Record<string, unknown>) {
    super(errorType, message, context);
  }
}
