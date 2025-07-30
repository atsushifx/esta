// src: /src/internal/AgLoggerConfig.ts
// @(#) : AgLoggerConfig Internal Class Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgLoggerMap, AgLogLevel } from '../../shared/types';
import type { AgFormatFunction, AgLoggerFunction, AgLoggerOptions } from '../../shared/types/AgLogger.interface';
// constants
import { AG_LOGGER_ERROR_CATEGORIES } from '../../shared/constants/agLoggerError.constants';
import { AG_LOGLEVEL } from '../../shared/types';
// plugins
import { NullFormat } from '../plugins/format/NullFormat';
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
 * to disabled state (NullLogger, NullFormat, OFF level) to prevent unintended output.
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
   * Default logger function used when no specific logger is configured.
   * Initialized to NullLogger to disable logging by default.
   */
  private _defaultLogger: AgLoggerFunction = NullLogger;

  /**
   * Default formatter function used to format log messages.
   * Initialized to NullFormat to disable formatting by default.
   */
  public _formatter: AgFormatFunction = NullFormat;

  /**
   * Current log level setting that determines which messages are processed.
   * Initialized to AG_LOGLEVEL.OFF to disable all logging by default.
   */
  public _logLevel: AgLogLevel = AG_LOGLEVEL.OFF;

  /**
   * Verbose mode setting that controls additional output behavior.
   * Initialized to false to disable verbose output by default.
   */
  public _verbose: boolean = false;

  /**
   * Map of log levels to their corresponding logger functions.
   * Initialized with all levels mapped to NullLogger.
   */
  private readonly _loggerMap: Partial<AgLoggerMap<AgLoggerFunction>>;

  /**
   * Creates a new AgLoggerConfig instance with default settings.
   *
   * Initializes the configuration with secure defaults:
   * - All log levels mapped to NullLogger (logging disabled)
   * - Default logger set to NullLogger
   * - Formatter set to NullFormat (formatting disabled)
   * - Log level set to OFF (no messages processed)
   * - Verbose mode disabled
   *
   * @since 0.2.0
   */
  constructor() {
    this._loggerMap = this.createDefaultLoggerMap();
  }

  /**
   * Creates a default logger map with all log levels mapped to the current defaultLogger.
   * This ensures consistent behavior where loggerMap reflects the defaultLogger unless explicitly overridden.
   * @returns Record containing all log levels mapped to current defaultLogger
   */
  private createDefaultLoggerMap(): Partial<AgLoggerMap<AgLoggerFunction>> {
    return {
      [AG_LOGLEVEL.OFF]: this._defaultLogger,
      [AG_LOGLEVEL.FATAL]: this._defaultLogger,
      [AG_LOGLEVEL.ERROR]: this._defaultLogger,
      [AG_LOGLEVEL.WARN]: this._defaultLogger,
      [AG_LOGLEVEL.INFO]: this._defaultLogger,
      [AG_LOGLEVEL.DEBUG]: this._defaultLogger,
      [AG_LOGLEVEL.TRACE]: this._defaultLogger,
    };
  }

  /**
   * Gets a copy of the current logger map.
   * @returns Record of log levels to logger functions
   */
  public getLoggerMap(): Partial<AgLoggerMap<AgLoggerFunction>> {
    return { ...this._loggerMap };
  }

  /**
   * Gets the logger function for the specified log level.
   * Returns the configured logger function for the given log level.
   * If an invalid log level is provided, throws an AgLoggerError with appropriate error category.
   *
   * @param level - The log level to get the logger function for
   * @returns Logger function for the specified level, or defaultLogger as fallback
   * @throws {AgLoggerError} When an invalid log level is provided (error category: INVALID_LOG_LEVEL)
   *
   * @example
   * ```typescript
   * const config = new AgLoggerConfig();
   * const logger = config.getLoggerFunction(AG_LOGLEVEL.INFO); // Returns logger for INFO level
   * ```
   */
  public getLoggerFunction(level: AgLogLevel): AgLoggerFunction {
    this.validateLogLevel(level);
    return this._loggerMap[level] ?? this._defaultLogger;
  }

  /**
   * Gets the configured formatter function.
   * @returns The configured formatter function
   */
  public getFormatter(): AgFormatFunction {
    return this._formatter;
  }

  /**
   * Gets the current log level setting.
   * @returns The current log level
   */
  public getLogLevel(): AgLogLevel {
    return this._logLevel;
  }

  /**
   * Gets the current verbose setting.
   * @returns The current verbose setting
   */
  public getVerbose(): boolean {
    return this._verbose;
  }

  /**
   * Sets the log level for the configuration.
   *
   * Updates the current log level after validating that the provided level is valid.
   * This setting determines which log messages will be processed by the logger.
   * Only messages at or above this level will be output.
   *
   * @param level - The log level to set. Must be a valid AgLogLevel value.
   * @returns The log level that was successfully set
   * @throws {AgLoggerError} When an invalid log level is provided (error category: INVALID_LOG_LEVEL)
   *
   * @example
   * ```typescript
   * const config = new AgLoggerConfig();
   *
   * // Set log level to INFO
   * const setLevel = config.setLogLevel(AG_LOGLEVEL.INFO);
   * console.log(setLevel); // Outputs: 4 (AG_LOGLEVEL.INFO value)
   *
   * // Attempting to set invalid log level throws error
   * try {
   *   config.setLogLevel(999 as AgLogLevel);
   * } catch (error) {
   *   console.log(error.message); // "Invalid log level: 999"
   * }
   * ```
   *
   * @since 0.2.0
   */
  public setLogLevel(level: AgLogLevel): AgLogLevel {
    this.validateLogLevel(level);
    this._logLevel = level;
    return this._logLevel;
  }

  /**
   * Sets the verbose mode setting for the configuration.
   *
   * Controls whether the logger should provide detailed/verbose output.
   * When enabled (true), the logger may output additional diagnostic information.
   * When disabled (false), only standard log messages are output.
   *
   * @param value - The verbose setting to set. Use ENABLE (true) or DISABLE (false) constants for better readability.
   * @returns The verbose setting that was successfully set
   *
   * @example
   * ```typescript
   * import { ENABLE, DISABLE } from '../../../shared/constants/common.constants';
   *
   * const config = new AgLoggerConfig();
   *
   * // Enable verbose mode
   * const verboseEnabled = config.setVerbose(ENABLE);
   * console.log(verboseEnabled); // Outputs: true
   *
   * // Disable verbose mode
   * const verboseDisabled = config.setVerbose(DISABLE);
   * console.log(verboseDisabled); // Outputs: false
   *
   * // Check current verbose setting
   * console.log(config.getVerbose()); // Outputs: false
   * ```
   *
   * @since 0.2.0
   */
  public setVerbose(value: boolean): boolean {
    this._verbose = value;
    return this._verbose;
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
    // When log level is OFF, no output should be generated
    if (this._logLevel === AG_LOGLEVEL.OFF) {
      return false;
    }

    // For other levels, only show messages at or below the configured level
    // Lower numbers = less verbose, higher numbers = more verbose
    // So we show messages when their level is <= the configured level
    return level <= this._logLevel;
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
    return this._verbose;
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
      this._defaultLogger = options.defaultLogger;
      // When defaultLogger is set via setLoggerConfig, initialize all loggerMap entries
      this.initializeLoggerMapWithDefault();
    }

    // Apply formatter setting if provided
    if (options.formatter !== undefined) {
      this._formatter = options.formatter;
    }

    // Apply logLevel setting if provided
    if (options.logLevel !== undefined) {
      this.setLogLevel(options.logLevel);
    }

    // Apply verbose setting if provided
    if (options.verbose !== undefined) {
      this.setVerbose(options.verbose);
    }

    // Apply loggerMap setting if provided (this overrides the defaultLogger initialization above)
    if (options.loggerMap !== undefined) {
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
        this._loggerMap[level as AgLogLevel] = this._defaultLogger;
      }
    });
  }

  /**
   * Updates the logger map with the provided partial logger map.
   *
   * @param loggerMap - Partial logger map to update the internal logger map
   * @private
   */
  private updateLoggerMap(loggerMap: Partial<AgLoggerMap<AgLoggerFunction>>): void {
    // Update each logger in the provided map
    Object.keys(loggerMap).forEach((key) => {
      const level = Number.parseInt(key, AgLoggerConfig.DECIMAL_RADIX) as AgLogLevel;
      const logger = loggerMap[level];
      if (logger !== undefined) {
        this._loggerMap[level] = logger;
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
  setLogger(level: AgLogLevel, logger: AgLoggerFunction): void {
    this.validateLogLevel(level);
    this._loggerMap[level] = logger;
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
    if (!this.isValidLogLevel(level)) {
      throw new AgLoggerError(
        AG_LOGGER_ERROR_CATEGORIES.INVALID_LOG_LEVEL,
        `Invalid log level: ${level}`,
      );
    }
  }

  /**
   * Validates if the provided log level is valid.
   * Checks if the log level exists in the configured logger map.
   *
   * @param level - The log level to validate
   * @returns True if the log level is valid (exists in loggerMap), false otherwise
   *
   * @private
   * @internal Used internally for input validation
   */
  private isValidLogLevel(level: AgLogLevel): boolean {
    return level in this._loggerMap;
  }

  /**
   * Returns the current logger configuration settings as a defensive copy.
   *
   * This method provides access to all current configuration settings
   * while ensuring external code cannot modify the internal state.
   * The returned object is a defensive copy of the current configuration.
   *
   * @returns A copy of the current configuration settings
   *
   * @example
   * ```typescript
   * const config = new AgLoggerConfig();
   * config.setLogLevel(AG_LOGLEVEL.INFO);
   * config.setVerbose(true);
   *
   * const settings = config.getCurrentSettings();
   * console.log(settings.logLevel);  // AG_LOGLEVEL.INFO
   * console.log(settings.verbose);   // true
   * ```
   *
   * @since 0.2.0
   */
  public getCurrentSettings(): AgLoggerOptions {
    return {
      defaultLogger: this._defaultLogger,
      formatter: this._formatter,
      loggerMap: this._loggerMap,
      logLevel: this._logLevel,
      verbose: this._verbose,
    };
  }
}
