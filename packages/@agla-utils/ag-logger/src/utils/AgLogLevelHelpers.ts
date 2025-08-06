// src/utils/AgLogLevelHelpers.ts
// @(#) : LogLevel helper functions implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { AG_LABEL_TO_LOGLEVEL_MAP, AG_LOGLEVEL, AG_LOGLEVEL_TO_LABEL_MAP } from '../../shared/types';
import type { AgLogLevel, AgLogLevelLabel } from '../../shared/types';
import { isValidLogLevel } from './AgLogValidators';

/**
 * Convert numeric log level to string label using map reference
 * @param level - Numeric log level
 * @returns String label for the log level, or empty string if invalid
 */
export const AgToLabel = (level: AgLogLevel): AgLogLevelLabel | '' => {
  if (!isValidLogLevel(level)) {
    return '' as AgLogLevelLabel;
  }

  // FORCE_OUTPUT時は空文字を返してラベルを表示しない
  // Special handling for FORCE_OUTPUT - return empty string
  if (level === AG_LOGLEVEL.FORCE_OUTPUT) {
    return '' as AgLogLevelLabel;
  }

  return AG_LOGLEVEL_TO_LABEL_MAP[level];
};

/**
 * Convert string label to numeric log level using map reference
 * @param label - String log level label
 * @returns Numeric log level, or undefined if invalid
 */
export const AgToLogLevel = (label: string): AgLogLevel | undefined => {
<<<<<<< HEAD
  if (!label || typeof label !== 'string') {
    return undefined;
  }
  const labelIndex = label.trim().toUpperCase();
  return AG_LABEL_TO_LOGLEVEL_MAP[labelIndex as AgLogLevelLabel];
||||||| parent of fc1acf8 (feat: メソッドsetLogger, getLoggerFunctionを追加し、logLeveでエラーがあるときはErrorスロー)
export const AgToLogLevel = (label: AgLogLevelLabel): AgLogLevel => {
  return AG_LABEL_TO_LOGLEVEL_MAP[label];
=======
  if (label == null || label == undefined || typeof label !== 'string') {
    return undefined;
  }
  const labelUpper = label.trim().toUpperCase();
  return AG_LABEL_TO_LOGLEVEL_MAP[labelUpper as AgLogLevelLabel];
>>>>>>> fc1acf8 (feat: メソッドsetLogger, getLoggerFunctionを追加し、logLeveでエラーがあるときはErrorスロー)
};
