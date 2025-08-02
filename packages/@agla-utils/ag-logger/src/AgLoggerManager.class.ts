// src/utils/AgLoggerManager.ts
// @(#) : AG Logger Manager Singleton Class
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import { AG_LOGLEVEL } from '../shared/types';
import type { AgLogLevel } from '../shared/types';
import type {
  AgFormatFunction,
  AgLoggerFunction,
  AgLoggerMap,
  AgLoggerOptions,
} from '../shared/types/AgLogger.interface';

// plugins
import { NullFormatter } from './plugins/formatter/NullFormatter';
import { NullLogger } from './plugins/logger/NullLogger';

/**
 * Singleton manager class for handling loggers and formatters by log level.
 * Manages a map of loggers for each log level and a default logger and formatter.
 */
export class AgLoggerManager {
  private static instance: AgLoggerManager | undefined;
  private loggerMap: AgLoggerMap<AgLoggerFunction>;
  private defaultLogger: AgLoggerFunction;
  private formatter: AgFormatFunction;

  private constructor() {
    this.defaultLogger = NullLogger;
    this.formatter = NullFormatter;
    this.loggerMap = {
      [AG_LOGLEVEL.VERBOSE]: NullLogger,
      [AG_LOGLEVEL.OFF]: NullLogger,
      [AG_LOGLEVEL.FATAL]: NullLogger,
      [AG_LOGLEVEL.ERROR]: NullLogger,
      [AG_LOGLEVEL.WARN]: NullLogger,
      [AG_LOGLEVEL.INFO]: NullLogger,
      [AG_LOGLEVEL.DEBUG]: NullLogger,
      [AG_LOGLEVEL.TRACE]: NullLogger,
    };
  }

  /**
   * Returns the singleton instance of AgLoggerManager.
   * Optionally sets configuration options on first initialization.
   *
   * @param options - Optional configuration options for logger setup.
   * @returns The singleton instance of AgLoggerManager.
   */
  static getManager(options?: AgLoggerOptions): AgLoggerManager {
    AgLoggerManager.instance ??= new AgLoggerManager();

    if (options?.defaultLogger) {
      AgLoggerManager.instance.defaultLogger = options.defaultLogger;
    }

    if (options?.formatter) {
      AgLoggerManager.instance.formatter = options.formatter;
    }

    // Update logger map with provided default logger or custom logger map
    if (options?.defaultLogger || options?.loggerMap) {
      AgLoggerManager.instance.updateLogMap(options.defaultLogger, options.loggerMap);
    }

    return AgLoggerManager.instance;
  }

  /**
   * Retrieves the logger function associated with the given log level.
   * Returns the default logger if no specific logger is found.
   *
   * @param logLevel - The log level to get the logger for.
   * @returns The logger function for the specified log level.
   */
  getLogger(logLevel: AgLogLevel): AgLoggerFunction {
    return this.loggerMap[logLevel] ?? this.defaultLogger;
  }

  /**
   * Retrieves the current formatter function.
   *
   * @returns The formatter function.
   */
  getFormatter(): AgFormatFunction {
    return this.formatter;
  }

  /**
   * Updates the internal logger map.
   * Sets all log levels to the given default logger,
   * then overrides with any provided specific loggers in the map.
   *
   * @param defaultLogger - The default logger function to assign.
   * @param loggerMap - A partial map of loggers to override default ones.
   */
  private updateLogMap(defaultLogger?: AgLoggerFunction, loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>): void {
    const targetLogger = defaultLogger ?? this.defaultLogger;

    // Set all log levels to the default logger
    Object.keys(AG_LOGLEVEL).forEach((key) => {
      const levelCode = AG_LOGLEVEL[key as keyof typeof AG_LOGLEVEL];
      this.loggerMap[levelCode] = targetLogger;
    });

    // Override specific log levels with provided loggers
    if (loggerMap) {
      Object.keys(loggerMap).forEach((key) => {
        const levelCode = parseInt(key) as AgLogLevel;
        if (loggerMap[levelCode] !== undefined) {
          this.loggerMap[levelCode] = loggerMap[levelCode]!;
        }
      });
    }
  }

  /**
   * Sets options including default logger, formatter, and logger map.
   * For setting individual logger functions, use setLogFunctionWithLevel.
   *
   * @param options - Configuration options for logger setup.
   */
  setManager(options: AgLoggerOptions): void {
    if (options.defaultLogger !== undefined) {
      this.defaultLogger = options.defaultLogger;
    }
    if (options.formatter !== undefined) {
      this.formatter = options.formatter;
    }

    // Update logger map if default logger or logger map provided
    if (options.defaultLogger || options.loggerMap) {
      this.updateLogMap(options.defaultLogger, options.loggerMap);
    }
  }

  /**
   * Sets a specific logger function for a log level.
   * To set a level to use the default logger, use setDefaultLogFunction instead.
   *
   * @param logLevel - The log level to set the logger for.
   * @param logFunction - The logger function to set.
   */
  setLogFunctionWithLevel(logLevel: AgLogLevel, logFunction: AgLoggerFunction): void {
    this.loggerMap[logLevel] = logFunction;
  }

  /**
   * Sets a log level to use the default logger.
   *
   * @param logLevel - The log level to set to default logger.
   */
  setDefaultLogFunction(logLevel: AgLogLevel): void {
    this.loggerMap[logLevel] = this.defaultLogger;
  }

  /**
   * Resets the singleton instance.
   * This method is intended for testing purposes to ensure clean state between tests.
   */
  static resetSingleton(): void {
    AgLoggerManager.instance = undefined;
  }
}
