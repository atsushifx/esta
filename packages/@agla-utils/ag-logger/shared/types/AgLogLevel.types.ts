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
  /** special value: verbose mode  */
  VERBOSE: -99,
} as const;

/**
 * Label to numeric log level conversion map.
 * Used for configuration file integration and string-to-numeric conversion.
 *
 * @example
 * ```typescript
 * const level = AG_LABEL_TO_LOGLEVEL_MAP['INFO']; // Returns 4
 * ```
 */
export const AG_LABEL_TO_LOGLEVEL_MAP = {
  /** Maps 'OFF' string to numeric value 0. */
  'OFF': AG_LOGLEVEL.OFF,
  /** Maps 'FATAL' string to numeric value 1. */
  'FATAL': AG_LOGLEVEL.FATAL,
  /** Maps 'ERROR' string to numeric value 2. */
  'ERROR': AG_LOGLEVEL.ERROR,
  /** Maps 'WARN' string to numeric value 3. */
  'WARN': AG_LOGLEVEL.WARN,
  /** Maps 'INFO' string to numeric value 4. */
  'INFO': AG_LOGLEVEL.INFO,
  /** Maps 'DEBUG' string to numeric value 5. */
  'DEBUG': AG_LOGLEVEL.DEBUG,
  /** Maps 'TRACE' string to numeric value 6. */
  'TRACE': AG_LOGLEVEL.TRACE,
  /** Maps 'VERBOSE' string to numeric value -99. */
  'VERBOSE': AG_LOGLEVEL.VERBOSE,
} as const;

/**
 * Numeric to label log level conversion map (auto-generated).
 * Used for numeric-to-string conversion in formatters and utilities.
 *
 * @example
 * ```typescript
 * const label = AG_LOGLEVEL_TO_LABEL_MAP[4]; // Returns 'INFO'
 * ```
 */
export const AG_LOGLEVEL_TO_LABEL_MAP = Object.fromEntries(
  Object.entries(AG_LABEL_TO_LOGLEVEL_MAP).map(([key, value]) => [value, key]),
) as Record<AgLogLevel, AgLogLevelLabel>;

/**
 * Numeric log level type derived from AG_LOGLEVEL values.
 * Represents all valid numeric log level values (0-6).
 *
 * @example
 * ```typescript
 * const level: AgLogLevel = AG_LOGLEVEL.INFO; // Valid
 * const invalid: AgLogLevel = 7; // Type error
 * ```
 */
export type AgLogLevel = typeof AG_LOGLEVEL[keyof typeof AG_LOGLEVEL];

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
export type AgLogLevelLabel = keyof typeof AG_LABEL_TO_LOGLEVEL_MAP;

/**
 * Log level key type derived from AG_LOGLEVEL keys.
 * Represents all valid log level constant names.
 *
 * @example
 * ```typescript
 * const key: AgLogLevelKey = 'INFO'; // Valid
 * const invalid: AgLogLevelKey = 'INVALID'; // Type error
 * ```
 */
export type AgLogLevelKey = keyof typeof AG_LOGLEVEL;

/**
 * Array of all log level keys in AG_LOGLEVEL.
 * Useful for iteration and functional programming operations.
 *
 * @example
 * ```typescript
 * AG_LOGLEVEL_KEYS.forEach(key => console.log(AG_LOGLEVEL[key]));
 * ```
 */
export const AG_LOGLEVEL_KEYS = Object.keys(AG_LOGLEVEL) as AgLogLevelKey[];
