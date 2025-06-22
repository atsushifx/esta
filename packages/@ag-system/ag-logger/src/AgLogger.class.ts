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
import type { AgFormatFunction, AgLoggerFunction, AgLoggerMap } from '@shared/types/AgLogger.interface';

// utils
import { AgLoggerManager } from '@/utils/AgLoggerManager.class';

// helpers
import { AgLoggerGetMessage } from './helpers/AgLoggerGetMessage';
// plugins
import { NullFormat } from './plugins/format/NullFormat';
import { ConsoleLogger, ConsoleLoggerMap } from './plugins/logger/ConsoleLogger';
import { NullLogger } from './plugins/logger/NullLogger';

// --- class definition
export class AgLogger {
  private static _instance: AgLogger | undefined;
  private static _logLevel: AgLogLevel = AgLogLevelCode.OFF;
  private _defaultLogger: AgLoggerFunction = NullLogger;
  private _loggerMap: AgLoggerMap = {
    [AgLogLevelCode.OFF]: NullLogger,
    [AgLogLevelCode.FATAL]: NullLogger,
    [AgLogLevelCode.ERROR]: NullLogger,
    [AgLogLevelCode.WARN]: NullLogger,
    [AgLogLevelCode.INFO]: NullLogger,
    [AgLogLevelCode.DEBUG]: NullLogger,
    [AgLogLevelCode.TRACE]: NullLogger,
  };
  private _loggerManager: AgLoggerManager;

  private constructor(
    defaultLogger?: AgLoggerFunction,
    formatter?: AgFormatFunction,
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>,
  ) {
    this._loggerManager = AgLoggerManager.getInstance(
      defaultLogger,
      formatter ?? NullFormat,
      loggerMap,
    );
  }

  static getInstance(
    defaultLogger?: AgLoggerFunction,
    formatter?: AgFormatFunction,
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>,
  ): AgLogger {
    return (AgLogger._instance ??= new AgLogger(defaultLogger, formatter, loggerMap));
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

  setLogLevel(level: AgLogLevel): AgLogLevel {
    return AgLogger.setLogLevel(level);
  }

  getLogLevel(): AgLogLevel {
    return AgLogger.getLogLevel();
  }

  private logWithLevel(level: AgLogLevel, ...args: unknown[]): void {
    if (this.isOutputLevel(level)) {
      const logMessage = AgLoggerGetMessage(level, ...args);
      const formatter = this._loggerManager.getFormatter();
      const formattedMessage = formatter(logMessage);

      // formatterが空文字列を返した場合はログを出力しない
      if (formattedMessage === '') {
        return;
      }

      const logger = this._loggerManager.getLogger(level);
      logger(formattedMessage);
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
      if (this._loggerMap[level] != null) {
        this._loggerManager.setLogger(level, this._loggerMap[level]);
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
    this.logWithLevel(AgLogLevelCode.INFO, ...args);
  }
}

// --- Convenience function for getting logger instance
export const getLogger = (
  defaultLogger?: AgLoggerFunction,
  formatter?: AgFormatFunction,
  loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>,
): AgLogger => {
  // ConsoleLoggerが指定されていてloggerMapが未指定の場合、ConsoleLoggerMapを自動適用
  if (defaultLogger === ConsoleLogger && !loggerMap) {
    loggerMap = ConsoleLoggerMap;
  }

  return AgLogger.getInstance(defaultLogger, formatter, loggerMap);
};

export default AgLogger;
