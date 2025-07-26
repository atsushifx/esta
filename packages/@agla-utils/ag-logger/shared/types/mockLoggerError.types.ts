// shared/types/mockLoggerError.types.ts
// @(#) : MockLogger Specific Error Classes and Types
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants
import { MOCK_LOGGER_ERROR_MESSAGES } from '../constants/errorMessages';
// base classes
import { AglaError } from './error.types';

/**
 * Type representing the available error categories for MockLogger errors.
 */
export type ErrorCategory = keyof typeof MOCK_LOGGER_ERROR_MESSAGES;

/**
 * Type representing the error keys available within a specific error category.
 */
export type ErrorKey<T extends ErrorCategory> = keyof typeof MOCK_LOGGER_ERROR_MESSAGES[T];

/**
 * General error class for MockLogger operations with categorized error messages.
 * Automatically resolves error messages based on category and message key.
 */
export class MockLoggerError extends AglaError {
  /** The error category this error belongs to (VALIDATION, STATE, RESOURCE). */
  public readonly category: ErrorCategory;

  /**
   * Creates a MockLoggerError with categorized error message.
   *
   * @param category - The error category (VALIDATION, STATE, RESOURCE)
   * @param messageKey - The specific error message key within the category
   * @param context - Optional context information for debugging
   */
  constructor(
    category: ErrorCategory,
    messageKey: string,
    context?: Record<string, unknown>,
  ) {
    const message = (MOCK_LOGGER_ERROR_MESSAGES[category] as Record<string, string>)[messageKey] || 'Unknown error';
    super(`${category}_ERROR`, message, context);
    this.category = category;
  }
}

/**
 * Specialized error class for MockLogger validation failures.
 * Used specifically for parameter validation errors.
 */
export class MockLoggerValidationError extends AglaError {
  /**
   * Creates a MockLoggerValidationError.
   *
   * @param message - The validation error message
   * @param context - Optional context information for debugging
   */
  constructor(
    message: string,
    context?: Record<string, unknown>,
  ) {
    super('VALIDATION_ERROR', message, context);
  }
}
