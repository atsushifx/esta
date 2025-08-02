// src/utils/AgLogLevelHelpers.ts
// @(#) : LogLevel helper functions implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { AG_LOGLEVEL, AG_LOGLEVEL_TO_LABEL_MAP } from '../../shared/types';
import type { AgLogLevel, AgLogLevelLabel } from '../../shared/types';

/**
 * Convert numeric log level to string label
 * @param level - Numeric log level
 * @returns String label for the log level, or empty string if invalid
 */
export const AgToLabel = (level: AgLogLevel): AgLogLevelLabel => {
  if (!isValidLogLevel(level)) {
    return '' as AgLogLevelLabel;
  }

  return AG_LOGLEVEL_TO_LABEL_MAP[level];
};

/**
 * Convert numeric log level to numeric log level (identity function for consistency)
 * @param level - Numeric log level
 * @returns The same numeric log level
 */
export const AgToLogLevel = (level: AgLogLevel): AgLogLevel => {
  return level;
};

export const isValidLogLevel = (logLevel: AgLogLevel): boolean => {
  return (
    typeof logLevel === 'number'
    && Object.values(AG_LOGLEVEL).includes(logLevel)
  );
};
