// src: shared/types/ErrorSeverity.types.ts
// @(#) : Error severity levels enum and validation utilities
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Error severity levels enum for categorizing errors by their impact and urgency.
 * These levels help in logging, alerting, and error handling decisions.
 */
export enum ErrorSeverity {
  /** Critical system failures that require immediate attention and may cause system shutdown */
  FATAL = 'fatal',
  /** Runtime errors that prevent normal operation but allow system to continue */
  ERROR = 'error',
  /** Potential issues that don't prevent operation but should be investigated */
  WARNING = 'warning',
  /** Informational messages about error conditions for debugging purposes */
  INFO = 'info',
}

/**
 * Type guard function to validate if a value is a valid ErrorSeverity enum value.
 *
 * @param value - The value to check for ErrorSeverity validity
 * @returns True if the value is a valid ErrorSeverity, false otherwise
 *
 * @example
 * ```typescript
 * if (isValidErrorSeverity('fatal')) {
 *   // value is guaranteed to be ErrorSeverity
 *   console.log('Valid severity level');
 * }
 *
 * isValidErrorSeverity('invalid'); // false
 * isValidErrorSeverity(null); // false
 * isValidErrorSeverity(ErrorSeverity.ERROR); // true
 * ```
 */
export const isValidErrorSeverity = (value: unknown): value is ErrorSeverity => {
  return typeof value === 'string' && Object.values(ErrorSeverity).includes(value as ErrorSeverity);
};
