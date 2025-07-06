// src/plugins/logger/ConsoleLogger.ts
// @(#) : Console Logger Plugin Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// --- modules
// constants
import { AgLogLevelCode } from '@shared/types';
// types
import type { AgLoggerFunction, AgLoggerMap } from '@shared/types/AgLogger.interface';

// logger if log level is OFF
import { NullLogger } from './NullLogger';

/**
 * Default console logger function.
 * Uses `console.log` to output the formatted log message.
 *
 * @param formattedLogMessage - The formatted log message to be logged.
 */
export const ConsoleLogger: AgLoggerFunction = (formattedLogMessage: string) => {
  console.log(formattedLogMessage);
};

/**
 * Mapping of log level codes to their respective console logging functions.
 * Uses appropriate console methods per log level for better log categorization.
 */
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
