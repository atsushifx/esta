// src: /src/internal/AgLoggerConfig.ts
// @(#) : AgLoggerConfig Internal Class Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgLogLevel } from '../../shared/types';
import type {
  AgFormatFunction,
  AgLoggerFunction,
  AgLoggerMap,
  AgLoggerOptions,
} from '../../shared/types/AgLogger.interface';
// constants
import { AG_LOGLEVEL } from '../../shared/types';
// plugins
import { NullFormat } from '../plugins/format/NullFormat';
import { NullLogger } from '../plugins/logger/NullLogger';
// errors
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
   * Default logger function used when no specific logger is configured.
   * Initialized to NullLogger to disable logging by default.
   */
  public defaultLogger: AgLoggerFunction = NullLogger;

  /**
   * Default formatter function used to format log messages.
   * Initialized to NullFormat to disable formatting by default.
   */
  public formatter: AgFormatFunction = NullFormat;

  /**
   * Current log level setting that determines which messages are processed.
   * Initialized to AG_LOGLEVEL.OFF to disable all logging by default.
   */
  public logLevel: AgTLogLevel = AG_LOGLEVEL.OFF;

  /**
   * Verbose mode setting that controls additional output behavior.
   * Initialized to false to disable verbose output by default.
   */
  public verbose: boolean = false;

  /**
   * Map of log levels to their corresponding logger functions.
   * Initialized with all levels mapped to NullLogger.
   */
  private readonly loggerMap: Map<AgTLogLevel, AgLoggerFunction>;

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
    this.loggerMap = this.createDefaultLoggerMap();
  }

  /**
   * Creates a default logger map with all log levels mapped to the current defaultLogger.
   * This ensures consistent behavior where loggerMap reflects the defaultLogger unless explicitly overridden.
   * @returns Map containing all log levels mapped to current defaultLogger
   */
  private createDefaultLoggerMap(): Map<AgLogLevel, AgLoggerFunction> {
    const map = new Map<AgLogLevel, AgLoggerFunction>();
    map.set(AG_LOGLEVEL.OFF, this.defaultLogger);
    map.set(AG_LOGLEVEL.FATAL, this.defaultLogger);
    map.set(AG_LOGLEVEL.ERROR, this.defaultLogger);
    map.set(AG_LOGLEVEL.WARN, this.defaultLogger);
    map.set(AG_LOGLEVEL.INFO, this.defaultLogger);
    map.set(AG_LOGLEVEL.DEBUG, this.defaultLogger);
    map.set(AG_LOGLEVEL.TRACE, this.defaultLogger);
    return map;
  }

  /**
   * Gets the current logger map.
   * @returns Map of log levels to logger functions
   */
  public getLoggerMap(): Map<AgTLogLevel, AgLoggerFunction> {
    return this.loggerMap;
  }

  /**
   * Gets the logger function for the specified log level.
   * @param level - The log level to get the logger function for
   * @returns Logger function for the specified level
   */
  public getLoggerFunction(level: AgTLogLevel): AgLoggerFunction {
    if (!this.isValidLogLevel(level)) {
      throw new AgLoggerError(
        AG_LOGGER_ERROR_CATEGORIES.INVALID_LOG_LEVEL,
        `Invalid log level: ${level}`,
      );
    }
    return this.loggerMap.get(level) ?? this.defaultLogger;
  }

  /**
   * Gets the configured formatter function.
   * @returns The configured formatter function
   */
  public getFormatter(): AgFormatFunction {
    return this.formatter;
  }

  /**
   * Gets the current log level setting.
   * @returns The current log level
   */
  public getLogLevel(): AgTLogLevel {
    return this.logLevel;
  }

  /**
   * Gets the current verbose setting.
   * @returns The current verbose setting
   */
  public getVerbose(): boolean {
    return this.verbose;
  }

  /**
   * Sets the log level for the configuration.
   *
   * Updates the current log level after validating that the provided level is valid.
   * This setting determines which log messages will be processed by the logger.
   * Only messages at or above this level will be output.
   *
   * @param level - The log level to set. Must be a valid AgTLogLevel value.
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
   *   config.setLogLevel(999 as AgTLogLevel);
   * } catch (error) {
   *   console.log(error.message); // "Invalid log level: 999"
   * }
   * ```
   *
   * @since 0.2.0
   */
  public setLogLevel(level: AgTLogLevel): AgTLogLevel {
    if (!this.isValidLogLevel(level)) {
      throw new AgLoggerError(
        AG_LOGGER_ERROR_CATEGORIES.INVALID_LOG_LEVEL,
        `Invalid log level: ${level}`,
      );
    }
    return this.loggerMap.get(level) ?? this.defaultLogger;
  }

  /**
   * Gets the configured formatter function.
   * @returns The configured formatter function
   */
  public getFormatter(): AgFormatFunction {
    return this.formatter;
  }

  /**
   * Gets the current log level setting.
   * @returns The current log level
   */
  public getLogLevel(): AgTLogLevel {
    return this.logLevel;
  }

  /**
   * Gets the current verbose setting.
   * @returns The current verbose setting
   */
  public getVerbose(): boolean {
    return this.verbose;
  }

  /**
   * Validates if the provided log level is valid.
   * Checks if the log level exists in the AG_LOGLEVEL constants.
   *
   * @param level - The log level to validate
   * @returns True if the log level is valid (exists in AG_LOGLEVEL), false otherwise
   *
   * @private
   * @internal Used internally for input validation
   */
  private isValidLogLevel(level: AgLogLevel): boolean {
    return Object.values(AG_LOGLEVEL).includes(level);
  }
}
