// src/utils/LogLevelHelpers.ts
// @(#) : LogLevel helper functions implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { AG_LABEL_TO_LOGLEVEL_MAP, AG_LOGLEVEL, AG_LOGLEVEL_TO_LABEL_MAP } from '../../shared/types';
import type { AgTLogLevel, AgTLogLevelLabel } from '../../shared/types';

/**
 * Convert numeric log level to string label
 * @param level - Numeric log level
 * @returns String label for the log level
 * @throws Error if log level is invalid
 */
export const AgToLabel = (level: AgTLogLevel): AgTLogLevelLabel => {
  if (typeof level !== 'number' || level < AG_LOGLEVEL.OFF || level > AG_LOGLEVEL.TRACE || !Number.isInteger(level)) {
    throw new Error(`Invalid log level: ${level}`);
  }

  return AG_LOGLEVEL_TO_LABEL_MAP[level];
};

/**
 * Convert string label to numeric log level
 * @param label - String label for the log level
 * @returns Numeric log level
 */
export const AgToLogLevel = (label: AgTLogLevelLabel): AgTLogLevel => {
  const level = AG_LABEL_TO_LOGLEVEL_MAP[label];
  if (level === undefined) {
    throw new Error(`Invalid log level label: ${label}`);
  }
  return level;
};
