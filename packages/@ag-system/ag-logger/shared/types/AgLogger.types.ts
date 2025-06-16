// src: /shared/types/AgLogger.types.ts
// @(#) : Logger Type Definitions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/** Log level definitions based on AWS CloudWatch Logs convention */
export const AgLogLevel = {
  OFF: 0,
  FATAL: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  DEBUG: 5,
  TRACE: 6,
} as const;

/** Value type of `AgLogLevel` */
export type AgLogLevel = typeof AgLogLevel[keyof typeof AgLogLevel];

/**
 * Parsed result from logging input arguments.
 * Used to separate human-readable message and structured data.
 */
export type AgLogParsedMessage = {
  /**
   * Formatted log message string.
   * Concatenated from primitive arguments such as strings, numbers, booleans.
   */
  message: string;

  /**
   * Structured arguments excluded from message output.
   * Typically includes object-like context (e.g. user info, metadata).
   */
  args: unknown[];
};
