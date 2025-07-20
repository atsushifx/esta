// src/plugins/logger/ConsoleLogger.ts
// @(#) : Console Logger Plugin Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// --- modules
// constants
import { AG_LOG_LEVEL } from '../../../shared/types';
// types
import type { AgLoggerFunction, AgLoggerMap } from '../../../shared/types/AgLogger.interface';

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
  [AG_LOG_LEVEL.OFF]: NullLogger,
  [AG_LOG_LEVEL.FATAL]: (formattedMessage: string) => {
    console.error(formattedMessage);
  },
  [AG_LOG_LEVEL.ERROR]: (formattedMessage: string) => {
    console.error(formattedMessage);
  },
  [AG_LOG_LEVEL.WARN]: (formattedMessage: string) => {
    console.warn(formattedMessage);
  },
  [AG_LOG_LEVEL.INFO]: (formattedMessage: string) => {
    console.info(formattedMessage);
  },
  [AG_LOG_LEVEL.DEBUG]: (formattedMessage: string) => {
    console.debug(formattedMessage);
  },
  [AG_LOG_LEVEL.TRACE]: (formattedMessage: string) => {
    console.debug(formattedMessage);
  },
};

export default ConsoleLogger;
