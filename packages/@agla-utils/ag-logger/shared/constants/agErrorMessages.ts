// shared/constants/agErrorMessages.ts
// @(#) : Error Messages and Categories for MockLogger
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Types of errors that can occur in the AgLogger system.
 * Used to organize error messages by type for better error handling.
 */
export const ERROR_TYPES = {
  VALIDATION: 'VALIDATION',
  CONFIG: 'CONFIG',
  INITIALIZATION: 'INITIALIZATION',
  STATE: 'STATE',
  RESOURCE: 'RESOURCE',
} as const;

/**
 * Default error message used when a specific error message cannot be found.
 */
export const UNKNOWN_ERROR_MESSAGE = 'Unknown error' as const;

/**
 * Structured error messages organized by error type.
 * Provides human-readable error messages for different types of AgLogger failures.
 */
export const AG_LOGGER_ERROR_MESSAGES = {
  [ERROR_TYPES.VALIDATION]: {
    INVALID_LOG_LEVEL: 'Invalid log level',
    SPECIAL_LOG_LEVEL_NOT_ALLOWED: 'Special log levels cannot be set as default log level',
    INVALID_MESSAGE_TYPE: 'Message must be a string',
    INVALID_TESTID_TYPE: 'testId must be a non-empty string',
    INVALID_TESTID_LENGTH: 'testId must be 255 characters or less',
    NULL_CONFIGURATION: 'Cannot read properties of null',
  },
  [ERROR_TYPES.CONFIG]: {
    INVALID_FORMATTER: 'formatter must be a valid function',
    INVALID_LOGGER: 'logger must be a valid function',
    INVALID_DEFAULT_LOGGER: 'defaultLogger must be a valid function',
    INVALID_CONFIG: 'Invalid configuration options provided',
  },
  [ERROR_TYPES.INITIALIZATION]: {
    LOGGER_NOT_CREATED: 'Logger instance not created. Call createLogger() first.',
    LOGGER_ALREADY_CREATED: 'Logger instance already created. Cannot create multiple instances.',
    LOGGER_ALREADY_INITIALIZED: 'Logger already initialized. Cannot set external logger.',
    INITIALIZE_ERROR: 'Logger initialization failed',
  },
  [ERROR_TYPES.STATE]: {
    BUFFER_NOT_FOUND: 'Buffer not found for testId. The logger may have been cleaned up or not properly initialized.',
  },
  [ERROR_TYPES.RESOURCE]: {
    BUFFER_OVERFLOW:
      'Buffer overflow: Maximum buffer size exceeded. This may indicate a test design issue with excessive logging.',
  },
} as const;

/**
 * Array of all available error types.
 * Useful for iteration and validation purposes.
 */
export const ERROR_TYPE_LIST = Object.keys(ERROR_TYPES) as ReadonlyArray<keyof typeof ERROR_TYPES>;

/**
 * Array of all available message IDs across all error types.
 * Used for validation and lookup operations.
 */
export const MESSAGE_IDS = Object.values(AG_LOGGER_ERROR_MESSAGES)
  .flatMap((category) => Object.keys(category)) as ReadonlyArray<string>;

/**
 * Type representing the available error types.
 */
export type TErrorType = keyof typeof ERROR_TYPES;

/**
 * Type representing all possible message IDs across all error types.
 * Provides type safety when referencing error message keys.
 */
export type TMessageId = {
  [K in keyof typeof AG_LOGGER_ERROR_MESSAGES]: keyof typeof AG_LOGGER_ERROR_MESSAGES[K];
}[keyof typeof AG_LOGGER_ERROR_MESSAGES];
