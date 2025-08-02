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
// interfaces
import type { AgLoggerOptions } from '../shared/types/AgLogger.interface';

// core
import { AgLoggerManager } from './AgLoggerManager.class';
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
  private _loggerManager: AgLoggerManager;
  private _config: AgLoggerConfig;

  protected constructor() {
    this._loggerManager = AgLoggerManager.getManager();
    this._config = new AgLoggerConfig();
  }

  /**
   * Returns the singleton instance of AgLogger,
   * optionally accepting configuration options.
   *
   * @param options - Optional configuration options for logger setup.
   * @returns The singleton AgLogger instance.
   */
  static getLogger(options?: AgLoggerOptions): AgLogger {
    const instance = (AgLogger._instance ??= new AgLogger());

    // If configuration is passed, delegate to setManager for unified handling
    if (options !== undefined) {
      instance.setManager(options);
    }

    return instance;
  }

  /**
   * Checks if a given log level passes the configured log level filter.
   *
   * @param level - Log level to check.
   * @returns True if the level should be logged; otherwise false.
   */
  protected shouldOutput(level: AgLogLevel): boolean {
    return this._config.shouldOutput(level);
  }

  /**
   * Sets the global log level filter.
   *
   * @param level - Log level to set.
   * @returns The updated log level.
   */
  setLogLevel(level: AgLogLevel): AgLogLevel {
    this._config.logLevel = level;
    return this._config.logLevel;
  }

  /**
   * Retrieves the current global log level.
   *
   * @returns The current log level.
   */
  getLogLevel(): AgLogLevel {
    return this._config.logLevel;
  }

  /**
   * Sets or gets the verbose flag.
   *
   * @param value - The verbose setting. If undefined, returns current value without setting.
   * @returns The current verbose setting.
   */
  setVerbose(value?: boolean): boolean {
    if (value !== undefined) {
      this._config.setVerbose = value;
    }
    return this._config.isVerbose;
  }

  /**
   * Gets the current verbose setting.
   * @returns The current verbose setting
   */
  get isVerbose(): boolean {
    return this._config.isVerbose;
  }

  /**
   * Internal method to perform logging if the log level is enabled.
   * Formats the message and invokes the appropriate logger function.
   *
   * @param level - Log level of the message.
   * @param args - Arguments to be logged.
   */
  protected executeLog(level: AgLogLevel, ...args: unknown[]): void {
    if (this.shouldOutput(level)) {
      const logMessage = AgLoggerGetMessage(level, ...args);
      const formatter = this._loggerManager.getFormatter();
      const formattedMessage = formatter(logMessage);

      // Only block logging if the formatter explicitly returns empty string
      // and the original message had actual content (not just empty args)
      if (formattedMessage === '' && logMessage.message !== '' && args.length > 0) {
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
   * @param options - Configuration options for the logger.
   */
  setManager(options: AgLoggerOptions): void {
    const enhancedOptions = { ...options };
    if (options.defaultLogger === ConsoleLogger && !options.loggerMap) {
      enhancedOptions.loggerMap = ConsoleLoggerMap;
    }
    this._loggerManager.setManager(enhancedOptions);
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
export const getLogger = (options?: AgLoggerOptions): AgLogger => {
  if (options?.defaultLogger === ConsoleLogger && !options.loggerMap) {
    options = { ...options, loggerMap: ConsoleLoggerMap };
  }

  return AgLogger.getLogger(options);
};

export default AgLogger;
