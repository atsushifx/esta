// shared/types/AgLogLevel.types.ts
// @(#) : Unified LogLevel constants, types and conversion maps
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Core log level numeric constants with Ag prefix.
 * Based on AWS CloudWatch Logs convention.
 *
 * @remarks
 * - OFF (0): No logging
 * - FATAL (1): Fatal errors that cause application termination
 * - ERROR (2): Error conditions that don't stop the application
 * - WARN (3): Warning messages for potentially harmful situations
 * - INFO (4): General informational messages
 * - DEBUG (5): Detailed information for debugging
 * - TRACE (6): Very detailed tracing information
 */
export const AG_LOGLEVEL = {
  /** No logging output. */
  OFF: 0,
  /** Fatal errors that cause application termination. */
  FATAL: 1,
  /** Error conditions that don't stop the application. */
  ERROR: 2,
  /** Warning messages for potentially harmful situations. */
  WARN: 3,
  /** General informational messages. */
  INFO: 4,
  /** Detailed information for debugging. */
  DEBUG: 5,
  /** Very detailed tracing information. */
  TRACE: 6,
  // special level
  /** special level: verbose mode */
  VERBOSE: -11,
  /** special level: LOG output (force output) */
  LOG: -12,
  /** Special level: default (defaultLogger: LogLevel  is same for INFO) */
  DEFAULT: -99,
} as const;

/**
 * String log level label type derived from AG_LABEL_TO_LOGLEVEL_MAP keys.
 * Represents all valid string log level labels.
 *
 * @example
 * ```typescript
 * const label: AgLogLevelLabel = 'INFO'; // Valid
 * const invalid: AgLogLevelLabel = 'INVALID'; // Type error
 * ```
 */
export type AgLogLevel = typeof AG_LOGLEVEL[keyof typeof AG_LOGLEVEL];

export const AG_LOGLEVEL_VALUES = Object.values(AG_LOGLEVEL) as AgLogLevel[];

/**
 * String log level label type derived from AG_LABEL_TO_LOGLEVEL_MAP keys.
 * Represents all valid string log level labels.
 *
 * @example
 * ```typescript
 * const label: AgLogLevelLabel = 'INFO'; // Valid
 * const invalid: AgLogLevelLabel = 'INVALID'; // Type error
 * ```
 */
export type AgLogLevelLabel = keyof typeof AG_LOGLEVEL;

export const AG_LOGLEVEL_KEYS = Object.keys(AG_LOGLEVEL) as AgLogLevelLabel[];

/**
 * Map of string log level labels to their corresponding numeric log levels.
 * Used for conversion between string and numeric log levels.
 *
 * @example
 * ```typescript
 * const logLevel: AgLogLevel = AG_LABEL_TO_LOGLEVEL_MAP['INFO']; // 4
 * ```
 */
export const AG_LOGLEVEL_TO_LABEL_MAP = Object.fromEntries(
  (Object.entries(AG_LOGLEVEL) as [AgLogLevelLabel, AgLogLevel][])
    .map(([label, value]) => [value, label]),
) as Record<AgLogLevel, AgLogLevelLabel>;

/**
 * Map of string log level labels to their corresponding numeric log levels.
 * Used for conversion between string and numeric log levels.
 *
 * @example
 * ```typescript
 * const logLevel: AgLogLevel = AG_LABEL_TO_LOGLEVEL_MAP['INFO']; // 4
 * ```
 */
export const AG_LABEL_TO_LOGLEVEL_MAP = Object.fromEntries(
  (Object.entries(AG_LOGLEVEL) as [AgLogLevelLabel, AgLogLevel][])
    .map(([label, value]) => [label, value]),
) as Record<AgLogLevelLabel, AgLogLevel>;
