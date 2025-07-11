// src/utils/AgLoggerHelpers.ts
// @(#) : ag-logger helper functions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants
import { AgLogLevelLabels } from '../../shared/constants/AgLogger.constants';
// types
import type { AgLogLevel } from '../../shared/types';

/**
 * Returns the uppercase string label corresponding to a given log level code.
 *
 * @param level - The log level code.
 * @returns The uppercase label string of the log level.
 */
export const AgLoggerGetLabel = (level: AgLogLevel): string => {
  return AgLogLevelLabels[level].toUpperCase();
};
