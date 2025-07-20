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
export const AG_LOG_LEVEL = {
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
export const AG_LABEL_TO_LOG_LEVEL_MAP = {
  'OFF': AG_LOG_LEVEL.OFF,
  'FATAL': AG_LOG_LEVEL.FATAL,
  'ERROR': AG_LOG_LEVEL.ERROR,
  'WARN': AG_LOG_LEVEL.WARN,
  'INFO': AG_LOG_LEVEL.INFO,
  'DEBUG': AG_LOG_LEVEL.DEBUG,
  'TRACE': AG_LOG_LEVEL.TRACE,
} as const;

/**
 * Numeric to label log level conversion map (auto-generated)
 * Used for numeric-to-string conversion in formatters and utilities
 */
export const AG_LOG_LEVEL_TO_LABEL_MAP = Object.fromEntries(
  Object.entries(AG_LABEL_TO_LOG_LEVEL_MAP).map(([key, value]) => [value, key]),
) as Record<AgTLogLevel, AgTLogLevelLabel>;

/**
 * Numeric log level type derived from AG_LOG_LEVEL values
 */
export type AgTLogLevel = typeof AG_LOG_LEVEL[keyof typeof AG_LOG_LEVEL];

/**
 * String log level label type derived from AG_LABEL_TO_LOG_LEVEL_MAP keys
 */
export type AgTLogLevelLabel = keyof typeof AG_LABEL_TO_LOG_LEVEL_MAP;
