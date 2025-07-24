// src: errors/ErrorResult.ts
// @(#) : ErrorResult class for structured error handling
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Type definitions for ErrorResult class
import type { ErrorResultJSON } from '../../shared/types';

/**
 * ErrorResult class extends Error to provide structured error handling
 * with additional context, error codes, and recovery information.
 */
export class ErrorResult extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly recoverable: boolean;

  /**
   * Creates a new ErrorResult instance
   * @param code - Error code identifier
   * @param message - Error message
   * @param context - Additional context data
   * @param options - Error options including recovery flag
   */
  constructor(
    code: string,
    message: string,
    context?: Record<string, unknown>,
    options?: { recoverable?: boolean },
  ) {
    super(message);

    this.name = 'ErrorResult';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.recoverable = options?.recoverable ?? true;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ErrorResult);
    }
  }

  /**
   * Converts the ErrorResult to a JSON-serializable object
   * @returns JSON representation of the error
   */
  toJSON(): ErrorResultJSON {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      recoverable: this.recoverable,
    };
  }

  /**
   * Checks if the error is recoverable
   * @returns true if the error is recoverable, false otherwise
   */
  isRecoverable(): boolean {
    return this.recoverable;
  }
}
