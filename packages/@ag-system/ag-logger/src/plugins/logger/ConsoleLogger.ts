// src: /src/plugins/logger/ConsoleLogger.ts
// @(#) : Console Logger Plugin Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// --- modules
import { AgLogLevelCode } from '@shared/types';
import type { AgLoggerFunction, AgLoggerMap } from '@shared/types/AgLogger.interface';

// logger
import { NullLogger } from './NullLogger';

// --- Default Console Logger Function
export const ConsoleLogger: AgLoggerFunction = (...args: unknown[]) => {
  console.log(...args);
};

// --- Console Logger Function Plugins
export const ConsoleLoggerMap: AgLoggerMap = {
  [AgLogLevelCode.OFF]: NullLogger,
  [AgLogLevelCode.FATAL]: (formattedMessage: string) => {
    console.error(formattedMessage);
  },
  [AgLogLevelCode.ERROR]: (formattedMessage: string) => {
    console.error(formattedMessage);
  },
  [AgLogLevelCode.WARN]: (formattedMessage: string) => {
    console.warn(formattedMessage);
  },
  [AgLogLevelCode.INFO]: (formattedMessage: string) => {
    console.info(formattedMessage);
  },
  [AgLogLevelCode.DEBUG]: (formattedMessage: string) => {
    console.debug(formattedMessage);
  },
  [AgLogLevelCode.TRACE]: (formattedMessage: string) => {
    console.debug(formattedMessage);
  },
};

export default ConsoleLogger;
