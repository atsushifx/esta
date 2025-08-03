// shared/constants/agErrorMessages.ts
// @(#) : Error Messages and Categories for MockLogger
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Categories of errors that can occur in the MockLogger system.
 * Used to organize error messages by type for better error handling.
 */
export const ERROR_CATEGORIES = {
  VALIDATION: 'VALIDATION',
  STATE: 'STATE',
  RESOURCE: 'RESOURCE',
  LOGGER: 'LOGGER',
} as const;

/**
 * Default error message used when a specific error message cannot be found.
 */
export const UNKNOWN_ERROR_MESSAGE = 'Unknown error' as const;

/**
 * Structured error messages organized by category.
 * Provides human-readable error messages for different types of MockLogger failures.
 */
export const MOCK_LOGGER_ERROR_MESSAGES = {
  [ERROR_CATEGORIES.VALIDATION]: {
    INVALID_MESSAGE_TYPE: 'Message must be a string',
    INVALID_TESTID_TYPE: 'testId must be a non-empty string',
    INVALID_TESTID_LENGTH: 'testId must be 255 characters or less',
  },
  [ERROR_CATEGORIES.LOGGER]: {
    INVALID_LOG_LEVEL: 'Invalid log level specified',
  },
  [ERROR_CATEGORIES.STATE]: {
    BUFFER_NOT_FOUND: 'Buffer not found for testId. The logger may have been cleaned up or not properly initialized.',
  },
  [ERROR_CATEGORIES.RESOURCE]: {
    BUFFER_OVERFLOW:
      'Buffer overflow: Maximum buffer size exceeded. This may indicate a test design issue with excessive logging.',
  },
} as const;

/**
 * Array of all available error categories.
 * Useful for iteration and validation purposes.
 */
export const ERROR_CATEGORY_LIST = Object.keys(ERROR_CATEGORIES) as ReadonlyArray<keyof typeof ERROR_CATEGORIES>;

/**
 * Array of all available message IDs across all categories.
 * Used for validation and lookup operations.
 */
export const MESSAGE_IDS = Object.values(MOCK_LOGGER_ERROR_MESSAGES)
  .flatMap((category) => Object.keys(category)) as ReadonlyArray<string>;

/**
 * Type representing the available error categories.
 */
export type TErrorCategory = keyof typeof ERROR_CATEGORIES;

/**
 * Type representing all possible message IDs across all error categories.
 * Provides type safety when referencing error message keys.
 */
export type TMessageId = {
  [K in keyof typeof MOCK_LOGGER_ERROR_MESSAGES]: keyof typeof MOCK_LOGGER_ERROR_MESSAGES[K];
}[keyof typeof MOCK_LOGGER_ERROR_MESSAGES];
