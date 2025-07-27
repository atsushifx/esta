// shared/types/error.types.ts
// @(#) : Base Error Classes for ag-logger Package
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Abstract base error class for all ag-logger related errors.
 * Provides structured error handling with error codes and context information.
 */
export abstract class AglaError extends Error {
  /** The error code identifying the specific type of error. */
  public readonly code: string;

  /** Optional context information providing additional details about the error. */
  public readonly context?: Record<string, unknown>;

  /**
   * Creates a new AglaError instance.
   *
   * @param code - The error code identifying the specific type of error
   * @param message - The human-readable error message
   * @param context - Optional context information for debugging
   */
  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.context = context;
    this.name = this.constructor.name;

    // NOTE: Do not change - Error.captureStackTrace check is intentional for Node.js compatibility
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Returns a string representation of the error including code, message, and context.
   *
   * @returns A formatted string containing the error code, message, and context (if present)
   */
  toString(): string {
    const contextStr = this.context ? JSON.stringify(this.context) : '';
    return `${this.code}: ${this.message}${contextStr ? ` ${contextStr}` : ''}`;
  }
}
