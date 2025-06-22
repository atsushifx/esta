// src: /src/AgLogger.class.ts
// @(#) : AgLogger抽象クラス
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgLogLevel } from '@shared/types';
import { AgLogLevelCode } from '@shared/types';
// interfaces
import type { AgLoggerFunction, AgLoggerMap, AgFormatFunction } from '@shared/types/AgLogger.interface';

// plugins
import { AgLoggerManager } from '@/utils/AgLoggerManager.class';

import { NullFormat } from './plugins/format/NullFormat';

// utils

// --- class definition
export class AgLogger {
  private static _instance: AgLogger;
  private static _logLevel: AgLogLevel = AgLogLevelCode.INFO;
  private _defaultLogger: AgLoggerFunction;
  private _loggerMap: AgLoggerMap;

  private constructor(
    defaultLogger?: AgLoggerFunction,
    formatter?: AgFormatFunction,
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>
  ) {
    this._loggerManager = AgLoggerManager.getInstance(
      defaultLogger,
      formatter || NullFormat,
      loggerMap
    );
  }

  static getInstance(
    defaultLogger?: AgLoggerFunction,
    formatter?: AgFormatFunction,
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>
  ): AgLogger {
    if (!AgLogger._instance) {
      AgLogger._instance = new AgLogger(defaultLogger, formatter, loggerMap);
    }
    return AgLogger._instance;
  }

  private isOutputLevel(level: AgLogLevel): boolean {
    if (AgLogger._logLevel === AgLogLevelCode.OFF) {
      return false;
    }
    return level <= AgLogger._logLevel;
  }

  static setLogLevel(level: AgLogLevel): AgLogLevel {
    AgLogger._logLevel = level;
    return AgLogger._logLevel;
  }

  static getLogLevel(): AgLogLevel {
    return AgLogger._logLevel;
  }

  private logWithLevel(level: AgLogLevel, ...args: unknown[]): void {
    if (this.isOutputLevel(level)) {
      const logger = this._loggerMap[level];
      if (logger) {
        logger(...args);
      }
    }
  }

  updateLoggerMap(loggerMap: Partial<AgLoggerMap>): void {
    this._loggerMap = { ...this._loggerMap, ...loggerMap };
  }

  setDefaultLogger(defaultLogger: AgLoggerFunction): void {
    this._defaultLogger = defaultLogger;
    // Update all null entries with the new default logger
    Object.keys(this._loggerMap).forEach((key) => {
      const level = parseInt(key) as AgLogLevel;
      if (level !== AgLogLevelCode.OFF && !this._loggerMap[level]) {
        this._loggerMap[level] = defaultLogger;
      }
    });
  }

  // log method (public API)
  fatal(...args: unknown[]): void {
    this.logWithLevel(AgLogLevelCode.FATAL, ...args);
  }
  error(...args: unknown[]): void {
    this.logWithLevel(AgLogLevelCode.ERROR, ...args);
  }
  warn(...args: unknown[]): void {
    this.logWithLevel(AgLogLevelCode.WARN, ...args);
  }
  info(...args: unknown[]): void {
    this.logWithLevel(AgLogLevelCode.INFO, ...args);
  }
  debug(...args: unknown[]): void {
    this.logWithLevel(AgLogLevelCode.DEBUG, ...args);
  }
  trace(...args: unknown[]): void {
    this.logWithLevel(AgLogLevelCode.TRACE, ...args);
  }

  // general log method using default logger
  log(...args: unknown[]): void {
    this._defaultLogger(...args);
  }
}

// --- Convenience function for getting logger instance
export const getLogger = (
  defaultLogger?: AgLoggerFunction,
  formatter?: AgFormatFunction,
  loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>
): AgLogger => {
  return AgLogger.getInstance(defaultLogger, formatter, loggerMap);
};

export default AgLogger;
