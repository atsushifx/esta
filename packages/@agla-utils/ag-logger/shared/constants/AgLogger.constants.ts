// src/shared/constants/AgLogger.constants.ts
// @(#) : Logger Constants
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgLogLevel } from '../types/AgLogger.types';
// code
import { AgLogLevelCode } from '../types/AgLogger.types';

/**
 * Mapping of `AgLogLevel` numeric codes to their string label names.
 * Used for displaying or formatting log level names in output.
 */
export const AgLogLevelLabels: Record<AgLogLevel, string> = {
  [AgLogLevelCode.OFF]: 'off',
  [AgLogLevelCode.FATAL]: 'fatal',
  [AgLogLevelCode.ERROR]: 'error',
  [AgLogLevelCode.WARN]: 'warn',
  [AgLogLevelCode.INFO]: 'info',
  [AgLogLevelCode.DEBUG]: 'debug',
  [AgLogLevelCode.TRACE]: 'trace',
};
