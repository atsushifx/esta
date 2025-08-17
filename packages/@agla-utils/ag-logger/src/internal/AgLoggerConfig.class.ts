// src: /src/internal/AgLoggerConfig.ts
// @(#) : AgLoggerConfig Internal Class Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// utilities
import {
  isAgMockConstructor,
  isStandardLogLevel,
  isValidFormatter,
  isValidLogger,
  isValidLogLevel,
} from '../utils/AgLogValidators';

// types
import type { AgLoggerMap, AgLogLevel, AgLogMessage } from '../../shared/types';
import type { AgFormatFunction, AgLoggerFunction, AgLoggerOptions } from '../../shared/types/AgLogger.interface';

// constants
import { AG_LOGLEVEL } from '../../shared/types';
// plugins
import type { AgMockFormatter } from '../plugins/formatter/AgMockFormatter';
import { NullFormatter } from '../plugins/formatter/NullFormatter';
import { NullLogger } from '../plugins/logger/NullLogger';

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
   * Formatter instance storage for statistics access and control.
   * Contains the actual formatter instance when AgMockConstructor is used.
   * Provides access to getStats() and reset() methods for testing and monitoring.
   */
  private _formatterInstance: AgMockFormatter | null = null;

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
    this._loggerMap.set(AG_LOGLEVEL.LOG, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.OFF, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.FATAL, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.ERROR, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.WARN, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.INFO, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.DEBUG, NullLogger);
    this._loggerMap.set(AG_LOGLEVEL.TRACE, NullLogger);
  }

  /**  }

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
    if (level === AG_LOGLEVEL.OFF && logger === NullLogger) { // level=OFF: NullLoggerでも可
      return NullLogger;
    }

    // If no logger function is found, fall back to defaultLogger
    if (!logger || logger === NullLogger) {
      return this._options.defaultLogger;
    }
    return logger;
  }

  /**
   * Gets the configured formatter function.
   * @returns The configured formatter function
   */
  public get formatter(): AgFormatFunction {
    return this._options.formatter as AgFormatFunction;
  }

  /**
   * Sets the formatter function.
   * @param formatter - The formatter function to set
   */
  public set formatter(formatter: AgFormatFunction) {
    if (!isValidFormatter(formatter)) {
      return;
    }
    this._options.formatter = formatter;
  }

  /**
   * Gets the configured default logger function.
   * @returns The default logger function
   */
  public get defaultLogger(): AgLoggerFunction {
    return this._options.defaultLogger;
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
   *  @param level - The log level to set
   */
  public set logLevel(level: AgLogLevel) {
    if (!isValidLogLevel(level)) {
      return;
    }
    // Special log levels (VERBOSE, LOG, DEFAULT) cannot be set as default log level
    if (!isStandardLogLevel(level)) {
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
    if (!isValidLogLevel(level)) {
      return false;
    }

    if (level === AG_LOGLEVEL.LOG) {
      return true;
    }

    if (level === AG_LOGLEVEL.VERBOSE) {
      return this.isVerbose;
    }
    // When log level is OFF, no output should be generated
    if (this._options.logLevel === AG_LOGLEVEL.OFF) {
      return false;
    }

    if (level === AG_LOGLEVEL.DEFAULT) {
      return AG_LOGLEVEL.INFO <= this._options.logLevel;
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
   * @returns True if configuration was applied successfully, false if validation failed
   *
   * @example
   * ```typescript
   * const config = new AgLoggerConfig();
   * const options: AgLoggerOptions = {
   *   logLevel: AG_LOGLEVEL.INFO,
   *   verbose: true
   * };
   * const success = config.setLoggerConfig(options);
   * ```
   *
   * @since 0.2.0
   */
  public setLoggerConfig(options: AgLoggerOptions): boolean {
    // Validate provided options
    if ('defaultLogger' in options) {
      if (!isValidLogger(options.defaultLogger)) {
        return false;
      }
    }
    // formatter: AgMockConstructor対応（自動インスタンス化して execute を設定）
    let resolvedOptions: AgLoggerOptions = options;
    if ('formatter' in options) {
      const input = options.formatter as unknown;
      if (isAgMockConstructor(input)) {
        // AgMockConstructor自体がデフォルトルーチンを提供
        const instance = new input();
        this._formatterInstance = instance as AgMockFormatter;
        resolvedOptions = { ...options, formatter: instance.execute };
      } else {
        // 通常のフォーマッタの場合はインスタンスをクリア
        this._formatterInstance = null;
        if (!isValidFormatter(options.formatter)) {
          return false;
        }
      }
    }
    // Validate logLevel if provided - special levels cannot be set as default log level
    if ('logLevel' in options) {
      if (!isStandardLogLevel(options.logLevel)) {
        return false;
      }
    }

    // After validation, safely update options
    this._options = { ...this._options, ...resolvedOptions };

    // Apply loggerMap setting if provided (this overrides the defaultLogger initialization above)
    if (resolvedOptions.loggerMap !== undefined) {
      this.updateLoggerMap(resolvedOptions.loggerMap);
    }
    return true;
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
    Object.entries(loggerMap)
      // 1. key, logger -> level, logger
      .map(([key, logger]) =>
        [
          Number.parseInt(key, AgLoggerConfig.DECIMAL_RADIX) as AgLogLevel,
          logger,
        ] as const
      )
      // 2. logger === null を除外
      .filter(([, logger]) => logger != null)
      // 3. 残ったものを _loggerMap に登録
      .forEach(([level, logger]) => {
        this._loggerMap.set(level, logger as AgLoggerFunction);
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
    // Track explicit overrides in options to distinguish from initial defaults
    this._options.loggerMap = { ...this._options.loggerMap, [level]: logger };
    return true;
  }

  /**
   * Gets formatter statistics if a mock formatter instance is available.
   * Returns null if no formatter instance is stored or if the formatter is not a mock formatter.
   *
   * @returns Formatter statistics object with callCount and lastMessage, or null if not available
   * @since 0.2.0
   */
  public getFormatterStats(): { callCount: number; lastMessage: AgLogMessage | null } | null {
    return this._formatterInstance?.getStats() ?? null;
  }

  /**
   * Resets formatter statistics if a mock formatter instance is available.
   * Does nothing if no formatter instance is stored or if the formatter is not a mock formatter.
   *
   * @since 0.2.0
   */
  public resetFormatterStats(): void {
    this._formatterInstance?.reset();
  }

  /**
   * Gets the statistics formatter instance if available.
   * Returns the AgMockFormatter instance that provides statistics tracking capabilities.
   *
   * @returns AgMockFormatter instance if available, null otherwise
   * @since 0.2.0
   */
  public getStatsFormatter(): AgMockFormatter | null {
    return this._formatterInstance;
  }

  /**
   * Checks if a statistics formatter instance is available for statistics access.
   * Returns true if a mock formatter instance is currently stored.
   *
   * @returns True if statistics formatter instance is available, false otherwise
   * @since 0.2.0
   */
  public hasStatsFormatter(): boolean {
    return this._formatterInstance !== null;
  }
}
