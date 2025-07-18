// src/utils/AgLoggerManager.ts
// @(#) : AG Logger Manager Singleton Class
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgFormatFunction, AgLoggerFunction, AgLoggerMap } from '../shared/types/AgLogger.interface';
import type { AgLogLevel } from '../shared/types/AgLogger.types';
// code
import { AgLogLevelCode } from '../shared/types/AgLogger.types';

// plugins
import { NullFormat } from '@/plugins/format/NullFormat';
import { NullLogger } from '@/plugins/logger/NullLogger';

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
    this.formatter = NullFormat;
    this.loggerMap = {
      [AgLogLevelCode.OFF]: NullLogger,
      [AgLogLevelCode.FATAL]: NullLogger,
      [AgLogLevelCode.ERROR]: NullLogger,
      [AgLogLevelCode.WARN]: NullLogger,
      [AgLogLevelCode.INFO]: NullLogger,
      [AgLogLevelCode.DEBUG]: NullLogger,
      [AgLogLevelCode.TRACE]: NullLogger,
    };
  }

  /**
   * Returns the singleton instance of AgLoggerManager.
   * Optionally sets default logger, formatter, and/or logger map on first initialization.
   *
   * @param defaultLogger - Optional default logger function.
   * @param formatter - Optional formatter function.
   * @param loggerMap - Optional partial map of loggers by log level.
   * @returns The singleton instance of AgLoggerManager.
   */
  static getInstance(
    defaultLogger?: AgLoggerFunction,
    formatter?: AgFormatFunction,
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>,
  ): AgLoggerManager {
    AgLoggerManager.instance ??= new AgLoggerManager();

    if (defaultLogger) {
      AgLoggerManager.instance.defaultLogger = defaultLogger;
    }

    if (formatter) {
      AgLoggerManager.instance.formatter = formatter;
    }

    // Update logger map with provided default logger or custom logger map
    if (defaultLogger || loggerMap) {
      AgLoggerManager.instance.updateLogMap(defaultLogger, loggerMap);
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
    Object.keys(AgLogLevelCode).forEach((key) => {
      const levelCode = AgLogLevelCode[key as keyof typeof AgLogLevelCode];
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
   * Sets loggers or options.
   * Supports two overloads:
   * - Set a logger function for a specific log level.
   * - Set options including default logger, formatter, and logger map.
   *
   * @param logLevelOrOptions - Either a log level or an options object.
   * @param logFunction - Logger function or null (optional, only for log level overload).
   */
  setLogger(logLevel: AgLogLevel, logFunction: AgLoggerFunction | null): void;
  setLogger(options: {
    defaultLogger?: AgLoggerFunction;
    formatter?: AgFormatFunction;
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>;
  }): void;
  setLogger(
    logLevelOrOptions: AgLogLevel | {
      defaultLogger?: AgLoggerFunction;
      formatter?: AgFormatFunction;
      loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>;
    },
    logFunction?: AgLoggerFunction | null,
  ): void {
    if (typeof logLevelOrOptions === 'number') {
      // Old-style: setLogger(logLevel, logFunction)
      this.loggerMap[logLevelOrOptions] = logFunction ?? this.defaultLogger;
    } else {
      // New-style: setLogger(options)
      const options = logLevelOrOptions;
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
  }
}
