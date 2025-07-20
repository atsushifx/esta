// src/utils/LogLevelHelpers.ts
// @(#) : LogLevel helper functions implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { AG_LOG_LEVEL, AG_LOG_LEVEL_TO_LABEL_MAP } from '../../shared/types';
import type { AgTLogLevel, AgTLogLevelLabel } from '../../shared/types';

/**
 * Convert numeric log level to string label
 * @param level - Numeric log level
 * @returns String label for the log level
 * @throws Error if log level is invalid
 */
export const AgToLabel = (level: AgTLogLevel): AgTLogLevelLabel => {
  if (typeof level !== 'number' || level < AG_LOG_LEVEL.OFF || level > AG_LOG_LEVEL.TRACE || !Number.isInteger(level)) {
    throw new Error(`Invalid log level: ${level}`);
  }

  return AG_LOG_LEVEL_TO_LABEL_MAP[level];
};
