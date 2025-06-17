// src: /shared/constants/AgLogger.constants.ts
// @(#) : Logger用定数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// type
import type { AgLogLevel } from '@shared/types/AgLogger.types';
// code
import { AgLogLevelCode } from '@shared/types/AgLogger.types';

/** AgLogLevel names mapping */
export const AgLogLevelNameMap: Record<AgLogLevel, string> = {
  [AgLogLevelCode.OFF]: 'off',
  [AgLogLevelCode.FATAL]: 'fatal',
  [AgLogLevelCode.ERROR]: 'error',
  [AgLogLevelCode.WARN]: 'warn',
  [AgLogLevelCode.INFO]: 'info',
  [AgLogLevelCode.DEBUG]: 'debug',
  [AgLogLevelCode.TRACE]: 'trace',
};
