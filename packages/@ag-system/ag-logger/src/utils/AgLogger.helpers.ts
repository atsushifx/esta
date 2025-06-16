// src: /src/utils/agLogger.helpers.ts
// @(#) : ag-logger helper functions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgLogLevel } from '@shared/types';

// CONSTANTS
import { AgLogLevelNameMap } from '@shared/constants/AgLogger.constants';

export const AgLoggerGetName = (level: AgLogLevel): string => {
  return AgLogLevelNameMap[level];
};
