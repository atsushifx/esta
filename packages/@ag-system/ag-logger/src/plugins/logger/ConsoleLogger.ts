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

// utility functions
import { agLog } from '../../AgLogUtils';
import { NullLogger } from './NullLogger';

// --- Default Console Logger Function
export const ConsoleLogger: AgLoggerFunction = (...args: unknown[]) => {
  console.log(...args);
};

// --- Console Logger Function Plugins
export const ConsoleLoggerMap: AgLoggerMap = {
  [AgLogLevelCode.OFF]: NullLogger,
  [AgLogLevelCode.FATAL]: (...args: unknown[]) => {
    console.error(agLog(AgLogLevelCode.FATAL, ...args));
  },
  [AgLogLevelCode.ERROR]: (...args: unknown[]) => {
    console.error(agLog(AgLogLevelCode.ERROR, ...args));
  },
  [AgLogLevelCode.WARN]: (...args: unknown[]) => {
    console.warn(agLog(AgLogLevelCode.WARN, ...args));
  },
  [AgLogLevelCode.INFO]: (...args: unknown[]) => {
    console.info(agLog(AgLogLevelCode.INFO, ...args));
  },
  [AgLogLevelCode.DEBUG]: (...args: unknown[]) => {
    console.debug(agLog(AgLogLevelCode.DEBUG, ...args));
  },
  [AgLogLevelCode.TRACE]: (...args: unknown[]) => {
    console.debug(agLog(AgLogLevelCode.TRACE, ...args));
  },
};

export default ConsoleLoggerMap;
