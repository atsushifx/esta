// src: /shared/types/AgLogger.interface.ts
// @(#) : Logger Interface Definitions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// type
import type { AgLogMessage } from './AgLogger.types';
import type { AgTLogLevel } from './LogLevel.types';

// --- interfaces ---
/**
 * Represents a logging function that processes formatted log messages.
 * Receives a formatted log message string and handles output processing.
 *
 * @param formattedLogMessage - The formatted log message string ready for output
 *
 * @example
 * ```typescript
 * const consoleLogger: AgLoggerFunction = (message) => console.log(message);
 * const fileLogger: AgLoggerFunction = (message) => fs.appendFileSync('log.txt', message);
 * ```
 */
export type AgLoggerFunction = (formattedLogMessage: string) => void;

/**
 * Represents a formatting function for log messages.
 * Accepts an `AgLogMessage` object and returns a formatted string,
 * e.g., combining timestamp, log level, and message.
 *
 * @param logMessage - The log message object containing all log data
 * @returns A formatted string ready for output by a logger function
 *
 * @example
 * ```typescript
 * const jsonFormatter: AgFormatFunction = (logMsg) => JSON.stringify(logMsg);
 * const plainFormatter: AgFormatFunction = (logMsg) =>
 *   `${logMsg.timestamp} [${logMsg.level}] ${logMsg.message}`;
 * ```
 */
export type AgFormatFunction = (logMessage: AgLogMessage) => string;

/**
 * A map holding logging functions for each log level.
 * Values can be a logging function for the level or `null` to disable logging at that level.
 * Allows different loggers to be used for different log levels.
 *
 * @template T - The type of logging function. Defaults to `AgLoggerFunction`.
 *
 * @example
 * ```typescript
 * const loggerMap: AgLoggerMap = {
 *   [AG_LOGLEVEL.ERROR]: (msg) => console.error(msg),
 *   [AG_LOGLEVEL.WARN]: (msg) => console.warn(msg),
 *   [AG_LOGLEVEL.INFO]: (msg) => console.info(msg),
 *   [AG_LOGLEVEL.DEBUG]: (msg) => console.debug(msg),
 *   [AG_LOGLEVEL.TRACE]: (msg) => console.debug(msg),
 *   [AG_LOGLEVEL.FATAL]: (msg) => console.error(msg),
 *   [AG_LOGLEVEL.OFF]: null,
 * };
 * ```
 */
export type AgLoggerMap<T extends AgLoggerFunction = AgLoggerFunction> = Record<AgTLogLevel, T | null>;

/**
 * Configuration options for AgLogger and AgLoggerManager instances.
 * Used to configure default logger, formatter, and logger map for different log levels.
 *
 * @example
 * ```typescript
 * const options: AgLoggerOptions = {
 *   defaultLogger: ConsoleLogger,
 *   formatter: JsonFormat,
 *   loggerMap: {
 *     [AG_LOGLEVEL.ERROR]: (msg) => console.error(msg),
 *     [AG_LOGLEVEL.WARN]: (msg) => console.warn(msg)
 *   }
 * };
 * ```
 */
export type AgLoggerOptions = {
  /**
   * Default logger function to use for all log levels unless overridden by loggerMap.
   */
  defaultLogger?: AgLoggerFunction;

  /**
   * Formatter function to format log messages before passing to logger functions.
   */
  formatter?: AgFormatFunction;

  /**
   * Partial map of logger functions for specific log levels.
   * Overrides defaultLogger for specified levels.
   */
  loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>;
};
