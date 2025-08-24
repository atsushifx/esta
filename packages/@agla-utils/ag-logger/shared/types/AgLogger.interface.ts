// src: /shared/types/AgLogger.interface.ts
// @(#) : Logger Interface Definitions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// type
import type { AgFormattedLogMessage, AgLogMessage } from './AgLogger.types';
import type { AgLogLevel } from './AgLogLevel.types';
import type { AgFormatterInput } from './AgMockConstructor.class';

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
export type AgLoggerFunction = (formattedLogMessage: AgFormattedLogMessage) => void;

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
export type AgFormatFunction = (logMessage: AgLogMessage) => AgFormattedLogMessage;

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
export type AgLoggerMap<T extends AgLoggerFunction = AgLoggerFunction> = Record<AgLogLevel, T | null>;

/**
 * Interface for logger instances that provide log output methods.
 * This interface defines the standard logging methods that should be available
 * on logger instances used for testing and production.
 *
 * @example
 * ```typescript
 * class ConsoleLogger implements AgLoggerInterface {
 *   fatal(message: string | AgLogMessage): void { console.error(message); }
 *   error(message: string | AgLogMessage): void { console.error(message); }
 *   warn(message: string | AgLogMessage): void { console.warn(message); }
 *   info(message: string | AgLogMessage): void { console.info(message); }
 *   debug(message: string | AgLogMessage): void { console.debug(message); }
 *   trace(message: string | AgLogMessage): void { console.debug(message); }
 *   verbose(message: string | AgLogMessage): void { console.debug(message); }
 *   log(message: string | AgLogMessage): void { console.log(message); }
 * }
 * ```
 */
export type AgLoggerInterface = {
  /** Log a fatal error message */
  fatal(message: string | AgLogMessage): void;
  /** Log an error message */
  error(message: string | AgLogMessage): void;
  /** Log a warning message */
  warn(message: string | AgLogMessage): void;
  /** Log an informational message */
  info(message: string | AgLogMessage): void;
  /** Log a debug message */
  debug(message: string | AgLogMessage): void;
  /** Log a trace message */
  trace(message: string | AgLogMessage): void;
  /** Log a verbose message */
  verbose(message: string | AgLogMessage): void;
  /** Log a general message */
  log(message: string | AgLogMessage): void;
};

/**
 * Configuration options for AgLogger and AgLoggerManager instances.
 * Used to configure default logger, formatter, logger map, log level, and verbose mode for different log levels.
 *
 * @example
 * ```typescript
 * const options: AgLoggerOptions = {
 *   defaultLogger: ConsoleLogger,
 *   formatter: JsonFormat,
 *   logLevel: AG_LOGLEVEL.INFO,
 *   verbose: true,
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
  formatter?: AgFormatterInput;

  /**
   * Log level setting that controls which log messages are output.
   * Messages at or above this level will be processed.
   */
  logLevel?: AgLogLevel;

  /**
   * Verbose mode setting that controls additional diagnostic output.
   * When enabled, verbose() method calls will produce output.
   */
  verbose?: boolean;

  /**
   * Partial map of logger functions for specific log levels.
   * Overrides defaultLogger for specified levels.
   */
  loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>;
};
