// src: /src/AgLogger.class.ts
// @(#) : AgLogger Abstract Class Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import { AG_LOGLEVEL } from '../shared/types';
import type { AgTLogLevel } from '../shared/types';
// interfaces
import type { AgFormatFunction, AgLoggerFunction, AgLoggerMap } from '../shared/types/AgLogger.interface';

// core
import { AgLoggerManager } from './AgLoggerManager.class';
// plugins
import { ConsoleLogger, ConsoleLoggerMap } from './plugins/logger/ConsoleLogger';
// utils
import { AgLoggerGetMessage } from './utils/AgLoggerGetMessage';

/**
 * Abstract logger class providing singleton instance management,
 * log level filtering, and unified logging interface.
 * Supports custom logger functions, formatters, and log level mappings.
 */
export class AgLogger {
  private static _instance: AgLogger | undefined;
  private static _logLevel: AgTLogLevel = AG_LOGLEVEL.OFF;
  private _loggerManager: AgLoggerManager;
  private _verbose: boolean = false;

  private constructor() {
    this._loggerManager = AgLoggerManager.getInstance();
  }

  /**
   * Returns the singleton instance of AgLogger,
   * optionally accepting a default logger, formatter, and logger map.
   *
   * @param defaultLogger - Optional default logger function.
   * @param formatter - Optional formatter function.
   * @param loggerMap - Optional partial logger map for log levels.
   * @returns The singleton AgLogger instance.
   */
  static getInstance(
    defaultLogger?: AgLoggerFunction,
    formatter?: AgFormatFunction,
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>,
  ): AgLogger {
    const instance = (AgLogger._instance ??= new AgLogger());

    // If configuration is passed, delegate to setLogger for unified handling
    if (defaultLogger !== undefined || formatter !== undefined || loggerMap !== undefined) {
      instance.setLogger({ defaultLogger, formatter, loggerMap });
    }

    return instance;
  }

  /**
   * Checks if a given log level passes the configured log level filter.
   *
   * @param level - Log level to check.
   * @returns True if the level should be logged; otherwise false.
   */
  private isOutputLevel(level: AgTLogLevel): boolean {
    if (AgLogger._logLevel === AG_LOGLEVEL.OFF) {
      return false;
    }
    return level <= AgLogger._logLevel;
  }

  /**
   * Sets the global log level filter.
   *
   * @param level - Log level to set.
   * @returns The updated log level.
   */
  setLogLevel(level: AgTLogLevel): AgTLogLevel {
    AgLogger._logLevel = level;
    return AgLogger._logLevel;
  }

  /**
   * Retrieves the current global log level.
   *
   * @returns The current log level.
   */
  getLogLevel(): AgTLogLevel {
    return AgLogger._logLevel;
  }

  /**
   * Sets or gets the verbose flag.
   *
   * @param value - The verbose setting. If undefined, returns current value without setting.
   * @returns The current verbose setting.
   */
  setVerbose(value?: boolean): boolean {
    if (value !== undefined) {
      this._verbose = value;
    }
    return this._verbose;
  }

  /**
   * Internal method to perform logging if the log level is enabled.
   * Formats the message and invokes the appropriate logger function.
   *
   * @param level - Log level of the message.
   * @param args - Arguments to be logged.
   */
  private logWithLevel(level: AgTLogLevel, ...args: unknown[]): void {
    if (this.isOutputLevel(level)) {
      const logMessage = AgLoggerGetMessage(level, ...args);
      const formatter = this._loggerManager.getFormatter();
      const formattedMessage = formatter(logMessage);

      // Do not log if formatter returns an empty string
      if (formattedMessage === '') {
        return;
      }

      const logger = this._loggerManager.getLogger(level);
      logger(formattedMessage);
    }
  }

  /**
   * Configures the logger manager with the specified options.
   * If ConsoleLogger is specified without a logger map,
   * ConsoleLoggerMap will be automatically applied.
   *
   * @param options - Configuration options including defaultLogger, formatter, and loggerMap.
   */
  setLogger(options: {
    defaultLogger?: AgLoggerFunction;
    formatter?: AgFormatFunction;
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>;
  }): void {
    const enhancedOptions = { ...options };
    if (options.defaultLogger === ConsoleLogger && !options.loggerMap) {
      enhancedOptions.loggerMap = ConsoleLoggerMap;
    }
    this._loggerManager.setLogger(enhancedOptions);
  }

  /** Logs a message at FATAL level. */
  fatal(...args: unknown[]): void {
    this.logWithLevel(AG_LOGLEVEL.FATAL, ...args);
  }

  /** Logs a message at ERROR level. */
  error(...args: unknown[]): void {
    this.logWithLevel(AG_LOGLEVEL.ERROR, ...args);
  }

  /** Logs a message at WARN level. */
  warn(...args: unknown[]): void {
    this.logWithLevel(AG_LOGLEVEL.WARN, ...args);
  }

  /** Logs a message at INFO level. */
  info(...args: unknown[]): void {
    this.logWithLevel(AG_LOGLEVEL.INFO, ...args);
  }

  /** Logs a message at DEBUG level. */
  debug(...args: unknown[]): void {
    this.logWithLevel(AG_LOGLEVEL.DEBUG, ...args);
  }

  /** Logs a message at TRACE level. */
  trace(...args: unknown[]): void {
    this.logWithLevel(AG_LOGLEVEL.TRACE, ...args);
  }

  /** General log method logging at INFO level. */
  log(...args: unknown[]): void {
    this.logWithLevel(AG_LOGLEVEL.INFO, ...args);
  }

  /** Verbose log method that only outputs when verbose flag is true. */
  verbose(...args: unknown[]): void {
    if (this._verbose) {
      this.log(...args);
    }
  }

  /**
   * Resets the singleton instance and log level.
   * This method is intended for testing purposes to ensure clean state between tests.
   */
  static resetSingleton(): void {
    AgLogger._instance = undefined;
    AgLogger._logLevel = AG_LOGLEVEL.OFF;
  }
}

/**
 * Convenience function to get the AgLogger singleton instance.
 * If ConsoleLogger is specified as default without a logger map,
 * ConsoleLoggerMap is automatically applied.
 *
 * @param defaultLogger - Optional default logger function.
 * @param formatter - Optional formatter function.
 * @param loggerMap - Optional partial logger map.
 * @returns The singleton AgLogger instance.
 */
export const getLogger = (
  defaultLogger?: AgLoggerFunction,
  formatter?: AgFormatFunction,
  loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>,
): AgLogger => {
  if (defaultLogger === ConsoleLogger && !loggerMap) {
    loggerMap = ConsoleLoggerMap;
  }

  return AgLogger.getInstance(defaultLogger, formatter, loggerMap);
};

export default AgLogger;
