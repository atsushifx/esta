// src: /shared/types/index.ts
// @(#) : Type Definitions Barrel File
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants
export { AG_LABEL_TO_LOG_LEVEL_MAP, AG_LOG_LEVEL, AG_LOG_LEVEL_TO_LABEL_MAP } from './LogLevel.types';

// types
export type { AgLogMessage } from './AgLogger.types';
export type { AgTLogLevel, AgTLogLevelLabel } from './LogLevel.types';

// Interface
export type { AgFormatFunction, AgLoggerFunction, AgLoggerMap } from './AgLogger.interface';
