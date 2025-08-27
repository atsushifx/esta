// src: shared/types/EstaError.types.ts
// @(#) : Esta specific error class with severity levels and chaining
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Shared dependencies - Internal shared packages and monorepo modules
import { AglaError } from '@shared/types';

// Local types - Type definitions and interfaces from current package
import type { ErrorSeverity } from './ErrorSeverity.types';

/**
 * Esta-specific error class that extends AglaError with additional context and features.
 * Provides severity levels, error codes, timestamps, and error chaining capabilities.
 *
 * @extends AglaError
 */
export class EstaError extends AglaError {
  /** The error code for identification and categorization */
  public readonly code: string;
  /** The timestamp when this error was created */
  public readonly timestamp: Date;
  /** The severity level of this error */
  public readonly severity: ErrorSeverity;

  /**
   * Creates a new EstaError instance.
   *
   * @param errorType - The error type identifying the specific type of error
   * @param message - The human-readable error message
   * @param code - The error code for identification
   * @param severity - The error severity level
   * @param context - Optional context information for debugging
   */
  constructor(
    errorType: string,
    message: string,
    code: string,
    severity: ErrorSeverity,
    context?: Record<string, unknown>,
  ) {
    super(errorType, message, context);
    this.code = code;
    this.severity = severity;
    this.timestamp = new Date();
  }

  /**
   * Serializes the error to a JSON object containing all error information.
   *
   * @returns Object representation of the error with all relevant fields
   *
   * @example
   * ```typescript
   * const error = new EstaError('AUTH_ERROR', 'Login failed', 'AUTH_001', ErrorSeverity.ERROR);
   * const json = error.toJSON();
   * console.log(json.errorType); // 'AUTH_ERROR'
   * console.log(json.severity); // 'error'
   * ```
   */
  toJSON(): object {
    return {
      errorType: this.errorType,
      message: this.message,
      code: this.code,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      ...(this.context && { context: this.context }),
    };
  }

  /**
   * Returns a formatted string representation of the error with severity level and timestamp.
   *
   * @returns Formatted string with severity, timestamp, and error details
   *
   * @example
   * ```typescript
   * const error = new EstaError('DB_ERROR', 'Connection failed', 'DB_001', ErrorSeverity.ERROR);
   * console.log(error.toString());
   * // Output: "[ERROR] 2025-01-27T10:30:45.123Z DB_ERROR: Connection failed"
   * ```
   */
  toString(): string {
    const baseStr = super.toString();
    return `[${this.severity.toUpperCase()}] ${this.timestamp.toISOString()} ${baseStr}`;
  }

  /**
   * Creates a new EstaError that chains this error with a causing error.
   * Combines error messages and preserves context information.
   *
   * @param cause - The error that caused this error
   * @returns New EstaError instance with chained error information
   *
   * @example
   * ```typescript
   * const originalError = new Error('Database connection lost');
   * const estaError = new EstaError('DB_ERROR', 'Query failed', 'DB_001', ErrorSeverity.ERROR);
   * const chainedError = estaError.chain(originalError);
   *
   * console.log(chainedError.message);
   * // Output: "Query failed (caused by: Database connection lost)"
   * ```
   */
  chain(cause: Error): EstaError {
    const chainedError = new EstaError(
      this.errorType,
      `${this.message} (caused by: ${cause.message})`,
      this.code,
      this.severity,
      { ...this.context, cause: cause.message },
    );
    return chainedError;
  }
}
