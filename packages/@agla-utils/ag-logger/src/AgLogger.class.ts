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
import type { AgFormatFunction, AgLoggerFunction, AgLoggerOptions } from '../shared/types/AgLogger.interface';
// constants
import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../shared/constants/agErrorMessages';

// internal
import { AgLoggerConfig } from './internal/AgLoggerConfig.class';
// plugins
import type { AgMockFormatter } from './plugins/formatter/AgMockFormatter';
import { ConsoleLogger, ConsoleLoggerMap } from './plugins/logger/ConsoleLogger';
// utils
import { AgLoggerGetMessage } from './utils/AgLoggerGetMessage';
import { isStandardLogLevel, isValidLogger, validateFormatter, validateLogLevel } from './utils/AgLogValidators';

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

    // Bind methods to ensure proper 'this' context when methods are extracted
    this.fatal = this.fatal.bind(this);
    this.error = this.error.bind(this);
    this.warn = this.warn.bind(this);
    this.info = this.info.bind(this);
    this.debug = this.debug.bind(this);
    this.trace = this.trace.bind(this);
    this.log = this.log.bind(this);
    this.verbose = this.verbose.bind(this);
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
  /**
   * Returns the singleton instance of AgLogger without configuration.
   * Simply returns the existing instance.
   *
   * @returns The singleton AgLogger instance.
   * @throws AgLoggerError when instance not created
   */
  static getLogger(): AgLogger {
    if (!this._instance) {
      throw new AgLoggerError(
        ERROR_TYPES.INITIALIZATION,
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_NOT_CREATED,
      );
    }
    return this._instance;
  }

  /**
   * Configures the logger manager with the specified options.
   * If ConsoleLogger is specified without a logger map,
   * ConsoleLoggerMap will be automatically applied.
   *
   * @param options - Configuration options for the logger.
   */
  public setLoggerConfig(options: AgLoggerOptions): void {
    // Validate options is not null or undefined first (runtime safety for type-erased environments)
    if ((options as unknown) === null || (options as unknown) === undefined) {
      throw new AgLoggerError(
        ERROR_TYPES.VALIDATION,
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.VALIDATION].NULL_CONFIGURATION,
      );
    }

    if ('formatter' in options) {
      validateFormatter(options.formatter);
    }
    if ('defaultLogger' in options) {
      if (!isValidLogger(options.defaultLogger)) {
        throw new AgLoggerError(
          ERROR_TYPES.CONFIG,
          AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.CONFIG].INVALID_DEFAULT_LOGGER,
        );
      }
    }
    // If ConsoleLogger is specified without a logger map, apply ConsoleLoggerMap
    const enhancedOptions = { ...options };
    if (options.defaultLogger === ConsoleLogger && !options.loggerMap) {
      enhancedOptions.loggerMap = ConsoleLoggerMap;
    }
    if ('logLevel' in options) {
      if (!isStandardLogLevel(options.logLevel)) {
        throw new AgLoggerError(
          ERROR_TYPES.VALIDATION,
          AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.VALIDATION].SPECIAL_LOG_LEVEL_NOT_ALLOWED,
        );
      }
    }

    // set config
    const configResult = this._config.setLoggerConfig(enhancedOptions);
    if (!configResult) {
      // Check if the failure was due to special log level
      // Generic configuration error for other validation failures
      throw new AgLoggerError(
        ERROR_TYPES.CONFIG,
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.CONFIG].INVALID_CONFIG,
      );
    }
  }

  /**
   * Sets a custom logger function for a specific log level.
   * @param logLevel - The log level to set the logger for
   * @param loggerFunction - The logger function to use for the specified level
   * @returns true if the logger was set successfully
   */
  setLoggerFunction(logLevel: AgLogLevel, loggerFunction: AgLoggerFunction): boolean {
    const validatedLogLevel = validateLogLevel(logLevel);
    return this._config.setLogger(validatedLogLevel, loggerFunction);
  }

  /**
   * Gets the logger function for a specific log level.
   * @param logLevel - The log level to get the logger function for
   * @returns The logger function for the specified level
   */
  getLoggerFunction(logLevel: AgLogLevel): AgLoggerFunction {
    const validatedLogLevel = validateLogLevel(logLevel);
    return this._config.getLoggerFunction(validatedLogLevel);
  }

  public setFormatter(formatter: AgFormatFunction): void {
    validateFormatter(formatter);
    this._config.formatter = formatter;
  }

  /**
   * Gets the current formatter function.
   * @returns The current formatter function
   */
  getFormatter(): AgFormatFunction {
    return this._config.formatter;
  }

  /**
   * Gets the statistics formatter instance if available.
   * Returns the AgMockFormatter instance that provides statistics tracking capabilities.
   *
   * @returns AgMockFormatter instance if available, null otherwise
   * @since 0.2.0
   */
  getStatsFormatter(): AgMockFormatter | null {
    return this._config.getStatsFormatter();
  }

  /**
   * Checks if a statistics formatter instance is available for statistics access.
   * Returns true if a mock formatter instance is currently stored.
   *
   * @returns True if statistics formatter instance is available, false otherwise
   * @since 0.2.0
   */
  hasStatsFormatter(): boolean {
    return this._config.hasStatsFormatter();
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

  /**
   * Sets the global log level filter.
   *
   * @param level - Log level to set.
   * @returns The updated log level.
   */
  set logLevel(level: AgLogLevel) {
    const validatedLogLevel = validateLogLevel(level);
    // Special log levels (VERBOSE, LOG, DEFAULT) cannot be set as default log level
    if (!isStandardLogLevel(validatedLogLevel)) {
      throw new AgLoggerError(
        ERROR_TYPES.VALIDATION,
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.VALIDATION].SPECIAL_LOG_LEVEL_NOT_ALLOWED,
      );
    }
    this._config.logLevel = validatedLogLevel;
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
   * Internal method to perform logging if the log level is enabled.
   * Formats the message and invokes the appropriate logger function.
   *
   * @param level - Log level of the message.
   * @param args - Arguments to be logged.
   */
  protected executeLog(level: AgLogLevel, ...args: unknown[]): void {
    // Input validation for logLevel
    validateLogLevel(level);

    if (!this._config.shouldOutput(level)) {
      return;
    }

    // Cache formatter and logger references at the start to avoid race conditions
    // in concurrent execution scenarios where config might change
    const formatter = this.getFormatter();
    const logger = this.getLoggerFunction(level);

    const logMessage = AgLoggerGetMessage(level, ...args);

    // Suppress logs where message is empty string (but allow no args or other args)
    if (args.length === 1 && args[0] === '') {
      return;
    }

    const formattedMessage = formatter(logMessage);

    // Don't output log if formatter returns empty string
    if (formattedMessage === '') {
      return;
    }

    logger(formattedMessage);
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

  /** General log method that always outputs (LOG level). */
  log(...args: unknown[]): void {
    this.executeLog(AG_LOGLEVEL.LOG, ...args);
  }

  /** Verbose log method that only outputs when verbose flag is true. */
  verbose(...args: unknown[]): void {
    this.executeLog(AG_LOGLEVEL.VERBOSE, ...args);
  }

  /**
   * Resets the singleton instance and log level.
   * This method is intended for testing purposes to ensure clean state between tests.
   */
  static resetSingleton(): void {
    AgLogger._instance = undefined;
  }
}

export default AgLogger;
