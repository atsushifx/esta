// src/plugins/logger/ConsoleLogger.ts
// @(#) : Console Logger Plugin Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// --- modules
// constants
import { AG_LOGLEVEL } from '../../../shared/types';
// types
import type { AgFormattedLogMessage } from '../../../shared/types';
import type { AgLoggerFunction, AgLoggerMap } from '../../../shared/types/AgLogger.interface';

// logger if log level is OFF
import { NullLogger } from './NullLogger';

/**
 * Default console logger function.
 * Uses `console.log` to output the formatted log message.
 *
 * @param formattedLogMessage - The formatted log message to be logged.
 */
export const ConsoleLogger: AgLoggerFunction = (formattedLogMessage: AgFormattedLogMessage) => {
  console.log(formattedLogMessage);
};

/**
 * Mapping of log level codes to their respective console logging functions.
 * Uses appropriate console methods per log level for better log categorization.
 */
export const ConsoleLoggerMap: Partial<AgLoggerMap> = {
  [AG_LOGLEVEL.OFF]: NullLogger,
  [AG_LOGLEVEL.FATAL]: (formattedMessage: AgFormattedLogMessage) => {
    console.error(formattedMessage);
  },
  [AG_LOGLEVEL.ERROR]: (formattedMessage: AgFormattedLogMessage) => {
    console.error(formattedMessage);
  },
  [AG_LOGLEVEL.WARN]: (formattedMessage: AgFormattedLogMessage) => {
    console.warn(formattedMessage);
  },
  [AG_LOGLEVEL.INFO]: (formattedMessage: AgFormattedLogMessage) => {
    console.info(formattedMessage);
  },
  [AG_LOGLEVEL.DEBUG]: (formattedMessage: AgFormattedLogMessage) => {
    console.debug(formattedMessage);
  },
  [AG_LOGLEVEL.TRACE]: (formattedMessage: AgFormattedLogMessage) => {
    console.debug(formattedMessage);
  },
  // special level
  [AG_LOGLEVEL.VERBOSE]: (formattedMessage: AgFormattedLogMessage) => {
    console.debug(formattedMessage);
  },
  [AG_LOGLEVEL.LOG]: (formattedMessage: AgFormattedLogMessage) => {
    console.log(formattedMessage);
  },
};

export default ConsoleLogger;
