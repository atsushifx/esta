// src/logLevel.ts
// @(#) : Log level symbol to AgLogLevel conversion
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgLogLevel } from '@agla-utils/ag-logger';

export type LogLevelSymbol = 'OFF' | 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';

export const LogLevelSymbolMap: Record<LogLevelSymbol, AgLogLevel> = {
  OFF: 0,
  FATAL: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  DEBUG: 5,
  TRACE: 6,
} as const;
