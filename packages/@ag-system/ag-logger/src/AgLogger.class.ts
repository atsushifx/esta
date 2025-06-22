// src: /src/AgLogger.class.ts
// @(#) : AgLogger抽象クラス
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgLogLevel } from '@shared/types';
// code
import { AgLogLevelCode } from '@shared/types';
// interfaces
import type { AgLoggerFunction, AgLoggerMap } from '@shared/types/AgLogger.interface';

// utils
import { AgLoggerManager } from '@/utils/AgLoggerManager.class';

// --- class definition
export abstract class AgLogger {
  private static _logger: AgLogger;
  private static _logLevel: AgLogLevel = AgLogLevelCode.INFO;
  private _loggerManager: AgLoggerManager;

  private constructor(
    defaultLogger?: AgLoggerFunction,
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>
  ) {
    this._loggerManager = AgLoggerManager.getInstance(defaultLogger, loggerMap);
  }

  static getInstance(
    defaultLogger?: AgLoggerFunction,
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>
  ): AgLogger {
    if (!AgLogger._instance) {
      AgLogger._instance = new AgLogger(defaultLogger, loggerMap);
    }
    return AgLogger._logger as T;
  }

  private isOutputLevel(level: AgLogLevel): boolean {
    switch (AgLogger._logLevel) {
      case AgLogLevelCode.DEBUG:
        return true;
      case AgLogLevelCode.INFO:
        return (level === AgLogLevelCode.INFO || level == AgLogLevelCode.WARN || level == AgLogLevelCode.ERROR);
      case AgLogLevelCode.WARN:
        return (level === AgLogLevelCode.WARN || level == AgLogLevelCode.ERROR);
      case AgLogLevelCode.ERROR:
        return (level === AgLogLevelCode.ERROR);
      default:
        return false;
    }
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
      const logger = this._loggerManager.getLogger(level);
      logger(...args);
    }
  }

  updateLoggerMap(loggerMap: Partial<AgLoggerMap<AgLoggerFunction>>): void {
    Object.keys(loggerMap).forEach((key) => {
      const level = parseInt(key) as AgLogLevel;
      if (loggerMap[level] !== undefined) {
        this._loggerManager.setLogger(level, loggerMap[level]!);
      }
    });
  }

  setLogger(level: AgLogLevel, logger: AgLoggerFunction | null): void {
    this._loggerManager.setLogger(level, logger);
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
    const defaultLogger = this._loggerManager.getLogger(AgLogLevelCode.INFO);
    defaultLogger(...args);
  }
}

// --- Convenience function for getting logger instance
export const getLogger = (
  defaultLogger?: AgLoggerFunction,
  loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>
): AgLogger => {
  return AgLogger.getInstance(defaultLogger, loggerMap);
};

export default AgLogger;
