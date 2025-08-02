// src: /src/internal/AgLoggerConfig.ts
// @(#) : AgLoggerConfig Internal Class Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// utilities
import { isValidLogLevel, validateFormatter, validateLogger } from '../utils/AgLogValidator';

// types
import type { AgLoggerMap, AgLogLevel } from '../../shared/types';
import type { AgFormatFunction, AgLoggerFunction, AgLoggerOptions } from '../../shared/types/AgLogger.interface';
// constants
import { AG_LOGGER_ERROR_CATEGORIES } from '../../shared/constants/agLoggerError.constants';
import { AG_LOGLEVEL } from '../../shared/types';
// plugins
import { NullFormatter } from '../plugins/formatter/NullFormatter';
import { NullLogger } from '../plugins/logger/NullLogger';
// error classes
import { AgLoggerError } from '../../shared/types/AgLoggerError.types';

/**
 * Internal configuration management class for AgLogger.
 *
 * Provides comprehensive configuration management for the AgLogger system, including:
 * - Logger function mapping for different log levels
 * - Formatter configuration for message formatting
 * - Log level management with validation
 * - Verbose mode control for detailed output
 * - Output control logic for determining when to log messages
 *
 * This class follows the principle of secure defaults, initializing all logging
 * to disabled state (NullLogger, NullFormatter, OFF level) to prevent unintended output.
 *
 * **Note**: This class is internal to the AgLogger package and should not be
 * exported or used directly by external consumers.
 *
 * @internal
 * @since 0.2.0
 * @author atsushifx
 */
export class AgLoggerConfig {
  /**
   * Radix constant for decimal number parsing.
   * Used in Number.parseInt to explicitly specify base-10 conversion.
   */
  private static readonly DECIMAL_RADIX = 10;

  /**
   * Internal options storage containing all configuration settings.
   * Initialized with secure defaults to disable logging by default.
   */
  private _options: Required<AgLoggerOptions> = {
    defaultLogger: NullLogger,
    formatter: NullFormatter,
    logLevel: AG_LOGLEVEL.OFF,
    verbose: false,
    loggerMap: {},
  };

  /**
   * Map of log levels to their corresponding logger functions.
   * Initialized with all levels mapped to NullLogger.
   */
  private readonly _loggerMap: Map<AgLogLevel, AgLoggerFunction>;

  /**
   * Creates a new AgLoggerConfig instance with default settings.
   *
   * Initializes the configuration with secure defaults:
   * - All log levels mapped to NullLogger (logging disabled)
   * - Default logger set to NullLogger
   * - Formatter set to NullFormatter (formatting disabled)
   * - Log level set to OFF (no messages processed)
   * - Verbose mode disabled
   *
   * @since 0.2.0
   */
  constructor() {
    this._loggerMap = new Map<AgLogLevel, AgLoggerFunction>();
    this.clearLoggerMap();
  }

  /**
   * Clears the logger map and fills all log levels with NullLogger.
   * This ensures all logging is disabled by default for security.
   */
  private clearLoggerMap(): void {
    this._loggerMap.clear();
    this._loggerMap.set(AG_LOGLEVEL.VERBOSE, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.OFF, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.FATAL, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.ERROR, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.WARN, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.INFO, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.DEBUG, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.TRACE, NullLogger);
  }

  /**
   * Gets a copy of the current logger map.
   * @returns Map of log levels to logger functions
   */
  public getLoggerMap(): Map<AgLogLevel, AgLoggerFunction> {
    return new Map(this._loggerMap);
  }

  /**
   * Gets the logger function for the specified log level.
   * Returns the configured logger function for the given log level.
   * If an invalid log level is provided, returns NullLogger.
   * If the retrieved logger is undefined or NullLogger, returns defaultLogger.
   *
   * @param level - The log level to get the logger function for
   * @returns Logger function for the specified level, NullLogger for invalid levels, or defaultLogger as fallback
   *
   * @example
   * ```typescript
   * const config = new AgLoggerConfig();
   * const logger = config.getLoggerFunction(AG_LOGLEVEL.INFO); // Returns logger for INFO level
   * const invalid = config.getLoggerFunction(999 as AgLogLevel); // Returns NullLogger
   * ```
   */
  public getLoggerFunction(level: AgLogLevel): AgLoggerFunction {
    // Return NullLogger for invalid log levels
    if (!isValidLogLevel(level)) {
      return NullLogger;
    }

    // Get logger from map
    const logger = this._loggerMap.get(level);

    // If logger is undefined or NullLogger, return defaultLogger
    if (logger === undefined || logger === NullLogger) {
      return this._options.defaultLogger;
    }

    return logger;
  }

  /**
   * Gets the configured formatter function.
   * @returns The configured formatter function
   */
  public get formatter(): AgFormatFunction {
    return this._options.formatter;
  }

  /**
   * Sets the formatter function.
   * @param formatter - The formatter function to set
  */
  protected set formatter(formatter: AgFormatFunction) {
    this._options.formatter = formatter;
  }

  /**
     * getter for Verbose
     */
  public get isVerbose(): boolean {
    return this._options.verbose;
  }

  /**
   * setter for Verbose
   */
  public set setVerbose(value: boolean) {
    this._options.verbose = value;
  }



  /**
   *  getter for logLevel
   *  @return logLevel
   */
  public get logLevel(): AgLogLevel {
    return this._options.logLevel;
  }

  /**
   *  setter for logLevel
   *  @return logLevel
   */
  public set logLevel(level: AgLogLevel) {
    if (!isValidLogLevel(level)) {
      return;
    }
    this._options.logLevel = level;
  }

  /**
   * Determines whether a log message should be output based on the current log level setting.
   *
   * This method implements the core output control logic for the AgLogger system.
   * Messages are only output when their level meets or exceeds the configured log level.
   * When the log level is set to OFF, no messages should be output regardless of their level.
   *
   * @param level - The log level of the message to be potentially output
   * @returns True if the message should be output, false otherwise
   *
   * @example
   * ```typescript
   * const config = new AgLoggerConfig();
   *
   * // With log level OFF (default), nothing should be output
   * console.log(config.shouldOutput(AG_LOGLEVEL.ERROR)); // false
   *
   * // With log level set to WARN (3)
   * config.setLogLevel(AG_LOGLEVEL.WARN);
   * console.log(config.shouldOutput(AG_LOGLEVEL.FATAL)); // true (1 <= 3)
   * console.log(config.shouldOutput(AG_LOGLEVEL.ERROR)); // true (2 <= 3)
   * console.log(config.shouldOutput(AG_LOGLEVEL.WARN));  // true (3 <= 3)
   * console.log(config.shouldOutput(AG_LOGLEVEL.INFO));  // false (4 > 3)
   * console.log(config.shouldOutput(AG_LOGLEVEL.DEBUG)); // false (5 > 3)
   * ```
   *
   * @since 0.2.0
   */
  public shouldOutput(level: AgLogLevel): boolean {
    if (level === AG_LOGLEVEL.VERBOSE) {
      return this.isVerbose;
    }

    if (!isValidLogLevel(level)) {
      return false;
    }
    // When log level is OFF, no output should be generated
    if (this._options.logLevel === AG_LOGLEVEL.OFF) {
      return false;
    }

    // For other levels, only show messages at or below the configured level
    // Lower numbers = less verbose, higher numbers = more verbose
    // So we show messages when their level is <= the configured level
    return level <= this._options.logLevel;
  }

  /**
   * Determines whether verbose output should be generated based on the current verbose setting.
   *
   * This method provides a simple boolean check for verbose mode control.
   * When verbose mode is enabled, additional diagnostic information may be output.
   * When disabled, only standard log messages are generated.
   *
   * @returns True if verbose output should be generated, false otherwise
   *
   * @example
   * ```typescript
   * const config = new AgLoggerConfig();
   *
   * // Default verbose is false
   * console.log(config.shouldOutputVerbose()); // false
   *
   * // Enable verbose mode
   * config.setVerbose(true);
   * console.log(config.shouldOutputVerbose()); // true
   *
   * // Disable verbose mode
   * config.setVerbose(false);
   * console.log(config.shouldOutputVerbose()); // false
   * ```
   *
   * @since 0.2.0
   */
  public shouldOutputVerbose(): boolean {
    return this._options.verbose;
  }

  /**
   * Sets the logger configuration using AgLoggerOptions.
   *
   * Applies the provided configuration options to the internal settings.
   * This method extracts settings from AgLoggerOptions and applies them
   * to the internal configuration state.
   *
   * @param options - The configuration options to apply
   *
   * @example
   * ```typescript
   * const config = new AgLoggerConfig();
   * const options: AgLoggerOptions = {
   *   logLevel: AG_LOGLEVEL.INFO,
   *   verbose: true
   * };
   * config.setLoggerConfig(options);
   * ```
   *
   * @since 0.2.0
   */
  public setLoggerConfig(options: AgLoggerOptions): void {
    // Apply defaultLogger setting if provided
    if (options.defaultLogger !== undefined) {
      this._options.defaultLogger = options.defaultLogger;
    }

    // Apply formatter setting if provided
    if (options.formatter !== undefined) {
      this._options.formatter = options.formatter;
    }

    // Apply logLevel setting if provided
    if (options.logLevel !== undefined) {
      this.logLevel = options.logLevel;
    }

    // Apply verbose setting if provided
    if (options.verbose !== undefined) {
      this.setVerbose = options.verbose;
    }

    // Apply loggerMap setting if provided (this overrides the defaultLogger initialization above)
    if (options.loggerMap !== undefined) {
      this._options.loggerMap = { ...this._options.loggerMap, ...options.loggerMap };
      this.updateLoggerMap(options.loggerMap);
    }
  }

  /**
   * Initializes all logger map entries with the current defaultLogger.
   * This is called when defaultLogger is set via setLoggerConfig to ensure
   * all levels use the new defaultLogger as base configuration.
   * @private
   */
  private initializeLoggerMapWithDefault(): void {
    Object.values(AG_LOGLEVEL).forEach((level) => {
      if (typeof level === 'number') {
        this._loggerMap.set(level as AgLogLevel, this._options.defaultLogger);
      }
    });
  }

  /**
   * Updates the logger map with the provided partial logger map.
   * First clears the logger map to ensure clean state.
   *
   * @param loggerMap - Partial logger map to update the internal logger map
   * @private
   */
  private updateLoggerMap(loggerMap: Partial<AgLoggerMap<AgLoggerFunction>>): void {
    // Clear the logger map first
    this.clearLoggerMap();

    // Update each logger in the provided map
    Object.keys(loggerMap).forEach((key) => {
      const level = Number.parseInt(key, AgLoggerConfig.DECIMAL_RADIX) as AgLogLevel;
      const logger = loggerMap[level];
      if (logger !== undefined && logger !== null) {
        this._loggerMap.set(level, logger);
      }
    });
  }

  /**
   * Sets a logger function at a specific log level.
   *
   * @param level - The log level to set the logger at
   * @param logger - The logger function to set
   * @throws {AgLoggerError} When an invalid log level is provided
   *
   * @internal Used internally for setting logger functions with validation
   */
  setLogger(level: AgLogLevel, logger: AgLoggerFunction): boolean {
    if (!isValidLogLevel(level)) {
      return false;
    }
    this._loggerMap.set(level, logger);
    return true;
  }

  /**
   * Validates a log level and throws an error if invalid.
   *
   * @param level - The log level to validate
   * @throws {AgLoggerError} When an invalid log level is provided
   *
   * @internal Used internally for input validation with error throwing
   */
  validateLogLevel(level: AgLogLevel): void {
    if (!isValidLogLevel(level)) {
      throw new AgLoggerError(
        AG_LOGGER_ERROR_CATEGORIES.INVALID_LOG_LEVEL,
        `Invalid log level: ${level}`,
      );
    }
  }
}
