// shared/types/LogLevel.types.ts
// @(#) : Unified LogLevel constants, types and conversion maps
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Core log level numeric constants with Ag prefix
 * Based on AWS CloudWatch Logs convention
 */
export const AG_LOGLEVEL = {
  OFF: 0,
  FATAL: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  DEBUG: 5,
  TRACE: 6,
} as const;

/**
 * Label to numeric log level conversion map
 * Used for configuration file integration and string-to-numeric conversion
 */
export const AG_LABEL_TO_LOGLEVEL_MAP = {
  'OFF': AG_LOGLEVEL.OFF,
  'FATAL': AG_LOGLEVEL.FATAL,
  'ERROR': AG_LOGLEVEL.ERROR,
  'WARN': AG_LOGLEVEL.WARN,
  'INFO': AG_LOGLEVEL.INFO,
  'DEBUG': AG_LOGLEVEL.DEBUG,
  'TRACE': AG_LOGLEVEL.TRACE,
} as const;

/**
 * Numeric to label log level conversion map (auto-generated)
 * Used for numeric-to-string conversion in formatters and utilities
 */
export const AG_LOGLEVEL_TO_LABEL_MAP = Object.fromEntries(
  Object.entries(AG_LABEL_TO_LOGLEVEL_MAP).map(([key, value]) => [value, key]),
) as Record<AgTLogLevel, AgTLogLevelLabel>;

/**
 * Numeric log level type derived from AG_LOGLEVEL values
 */
export type AgTLogLevel = typeof AG_LOGLEVEL[keyof typeof AG_LOGLEVEL];

/**
 * String log level label type derived from AG_LABEL_TO_LOGLEVEL_MAP keys
 */
export type AgTLogLevelLabel = keyof typeof AG_LABEL_TO_LOGLEVEL_MAP;
