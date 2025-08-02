// src: /src/AgLogger.class.ts
// @(#) : AgLogger Abstract Class Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import { AG_LOGLEVEL } from '../shared/types';
import type { AgLogLevel } from '../shared/types';
import { AgLoggerError } from '../shared/types/AgLoggerError.types';
// interfaces
import type { AgLoggerOptions } from '../shared/types/AgLogger.interface';
// constants
import { AG_LOGGER_ERROR_CATEGORIES } from '../shared/constants/agLoggerError.constants';

// internal
import { AgLoggerConfig } from './internal/AgLoggerConfig.class';
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
  private _config: AgLoggerConfig;

  protected constructor() {
    this._config = new AgLoggerConfig();
  }

  /**
   * Returns the singleton instance of AgLogger,
   * optionally accepting configuration options.
   *
   * @param options - Optional configuration options for logger setup.
   * @returns The singleton AgLogger instance.
   */
  static createLogger(options?: AgLoggerOptions): AgLogger {
    const instance = (AgLogger._instance ??= new AgLogger());

    // If configuration is passed, delegate to setLoggerConfig for unified handling
    if (options !== undefined) {
      instance.setLoggerConfig(options);
    }

    return instance;
  }

  static getLogger(): AgLogger {
    if (AgLogger._instance === undefined) {
      throw new AgLoggerError(AG_LOGGER_ERROR_CATEGORIES.INITIALIZE_ERROR, 'Logger instance not created. Call createLogger() first.');
    }
    return AgLogger._instance;
  }

  /**
   * Checks if a given log level passes the configured log level filter.
   *
   * @param level - Log level to check.
   * @returns True if the level should be logged; otherwise false.
   */
  private shouldOutput(level: AgLogLevel): boolean {
    if (this.logLevel === AG_LOGLEVEL.OFF) {
      return false;
    }
    return (level <= this.logLevel);
  }

  /**
   * Sets the global log level filter.
   *
   * @param level - Log level to set.
   * @returns The updated log level.
   */
  get isVerbose(): boolean {
    return this._config.isVerbose;
  }

  set setVerbose(value: boolean) {
    this._config.setVerbose = value;
  }


  /**
   * Gets the current log level.
   * @returns The current log level
   */
  public get logLevel(): AgLogLevel {
    return this._config.logLevel;
  }

  public set logLevel(level: AgLogLevel) {
    this._config.logLevel = level;
  }

  /**
   * Internal method to perform logging if the log level is enabled.
   * Formats the message and invokes the appropriate logger function.
   *
   * @param level - Log level of the message.
   * @param args - Arguments to be logged.
   */
  protected executeLog(level: AgLogLevel, ...args: unknown[]): void {
    if (!this.shouldOutput(level)) {
      return;
    }

    // Block logging if the first argument is empty string and no additional arguments
    if (args.length === 1 && args[0] === '') {
      return;
    }

    const logMessage = AgLoggerGetMessage(level, ...args);
    const formatter = this._config.formatter
    const formattedMessage = formatter(logMessage);

    // Only block logging if the formatter explicitly returns empty string
    // and the original message had actual content (not just empty args)
    if (formattedMessage === '') {
      return;
    }

    const logger = this._config.getLoggerFunction(level);
    logger(formattedMessage);
  }


  /**
   * Configures the logger manager with the specified options.
   * If ConsoleLogger is specified without a logger map,
   * ConsoleLoggerMap will be automatically applied.
   *
   * @param options - Configuration options for the logger.
   */
  setLoggerConfig(options: AgLoggerOptions): void {
    const enhancedOptions = { ...options };
    if (options.defaultLogger === ConsoleLogger && !options.loggerMap) {
      enhancedOptions.loggerMap = ConsoleLoggerMap;
    }
    this._config.setLoggerConfig(enhancedOptions);
  }

  /** Logs a message at FATAL level. */
  fatal(...args: unknown[]): void {
    this.executeLog(AG_LOGLEVEL.FATAL, ...args);
  }

  /** Logs a message at ERROR level. */
  error(...args: unknown[]): void {
    this.executeLog(AG_LOGLEVEL.ERROR, ...args);
  }

  /** Logs a message at WARN level. */
  warn(...args: unknown[]): void {
    this.executeLog(AG_LOGLEVEL.WARN, ...args);
  }

  /** Logs a message at INFO level. */
  info(...args: unknown[]): void {
    this.executeLog(AG_LOGLEVEL.INFO, ...args);
  }

  /** Logs a message at DEBUG level. */
  debug(...args: unknown[]): void {
    this.executeLog(AG_LOGLEVEL.DEBUG, ...args);
  }

  /** Logs a message at TRACE level. */
  trace(...args: unknown[]): void {
    this.executeLog(AG_LOGLEVEL.TRACE, ...args);
  }

  /** General log method logging at INFO level. */
  log(...args: unknown[]): void {
    this.executeLog(AG_LOGLEVEL.INFO, ...args);
  }

  /** Verbose log method that only outputs when verbose flag is true. */
  verbose(...args: unknown[]): void {
    if (this._config.isVerbose) {
      this.log(...args);
    }
  }

  /**
   * Resets the singleton instance and log level.
   * This method is intended for testing purposes to ensure clean state between tests.
   */
  static resetSingleton(): void {
    AgLogger._instance = undefined;
  }
}

/**
 * Convenience function to get the AgLogger singleton instance.
 * If ConsoleLogger is specified as default without a logger map,
 * ConsoleLoggerMap is automatically applied.
 *
 * @param options - Optional configuration options for the logger.
 * @returns The singleton AgLogger instance.
 */
export const createLogger = (options?: AgLoggerOptions): AgLogger => {
  return AgLogger.createLogger(options);
};

export const getLogger = (): AgLogger => {
  return AgLogger.getLogger();
};

export default AgLogger;
