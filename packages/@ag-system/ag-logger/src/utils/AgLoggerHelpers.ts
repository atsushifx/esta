// src: /src/utils/AgLoggerHelpers.ts
// @(#) : ag-logger helper functions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// CONSTANTS
import { AgLogLevelLabels } from '@shared/constants/AgLogger.constants';
// types
import type { AgLogLevel } from '@shared/types';

export const AgLoggerGetLabel = (level: AgLogLevel): string => {
  return AgLogLevelLabels[level];
};
