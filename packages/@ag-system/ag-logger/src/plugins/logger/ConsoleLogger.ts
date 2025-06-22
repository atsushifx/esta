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

// --- Console Logger Function Plugins
export const ConsoleLogger: AgLoggerMap = {
  [AgLogLevelCode.OFF]: null,
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

// --- Individual Logger Functions
export const consoleLogFatal: AgLoggerFunction = (...args: unknown[]) => {
  console.error(agLog(AgLogLevelCode.FATAL, ...args));
};

export const consoleLogError: AgLoggerFunction = (...args: unknown[]) => {
  console.error(agLog(AgLogLevelCode.ERROR, ...args));
};

export const consoleLogWarn: AgLoggerFunction = (...args: unknown[]) => {
  console.warn(agLog(AgLogLevelCode.WARN, ...args));
};

export const consoleLogInfo: AgLoggerFunction = (...args: unknown[]) => {
  console.info(agLog(AgLogLevelCode.INFO, ...args));
};

export const consoleLogDebug: AgLoggerFunction = (...args: unknown[]) => {
  console.debug(agLog(AgLogLevelCode.DEBUG, ...args));
};

export const consoleLogTrace: AgLoggerFunction = (...args: unknown[]) => {
  console.debug(agLog(AgLogLevelCode.TRACE, ...args));
};

export default ConsoleLogger;