// shared/types/AgLoggerError.types.ts
// @(#) : AgLogger Specific Error Class
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// base error class
import { AglaError } from '@shared/types';
import type { ErrorSeverity } from './ErrorSeverity.types';

// Error Messages
export class EstaError extends AglaError {
  public readonly code: string;
  public readonly timestamp: Date;
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

  toString(): string {
    const baseStr = super.toString();
    return `[${this.severity.toUpperCase()}] ${this.timestamp.toISOString()} ${baseStr}`;
  }

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
