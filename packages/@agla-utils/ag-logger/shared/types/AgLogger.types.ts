// src: /shared/types/AgLogger.types.ts
// @(#) : Logger Type Definitions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgTLogLevel } from './LogLevel.types';

/**
 * Parsed result from logging input arguments.
 * Used to separate human-readable message and structured data.
 *
 * @example
 * ```typescript
 * const logMessage: AgLogMessage = {
 *   logLevel: AG_LOGLEVEL.INFO,
 *   timestamp: new Date(),
 *   message: 'User logged in',
 *   args: [{ userId: 123, ip: '192.168.1.1' }]
 * };
 * ```
 */
export type AgLogMessage = {
  /**
   * Log level indicating the severity of the log entry.
   * Uses numeric levels based on AWS CloudWatch Logs convention:
   * OFF (0), FATAL (1), ERROR (2), WARN (3), INFO (4), DEBUG (5), TRACE (6).
   *
   * @example AG_LOGLEVEL.INFO (4)
   */
  logLevel: AgTLogLevel;

  /**
   * Timestamp for the log entry.
   * If provided as first argument, uses that timestamp; otherwise uses current time.
   *
   * @example new Date('2023-12-01T10:30:00Z')
   */
  timestamp: Date;

  /**
   * Formatted log message string.
   * Concatenated from primitive arguments such as strings, numbers, booleans.
   * Non-primitive arguments are stored in the args array instead.
   *
   * @example "User logged in successfully"
   */
  message: string;

  /**
   * Structured arguments excluded from message output.
   * Typically includes object-like context (e.g. user info, metadata).
   * These are not included in the message string but can be used by formatters.
   *
   * @example [{ userId: 123, sessionId: 'abc123' }]
   */
  args: unknown[];
};
