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

// core
import { AgLoggerManager } from './AgLoggerManager.class';
// plugins
import { ConsoleLogger, ConsoleLoggerMap } from './plugins/logger/ConsoleLogger';
// utils
import { AgLoggerGetMessage } from './utils/AgLoggerGetMessage';

// --- class definition
export class AgLogger {
  private static _instance: AgLogger | undefined;
  private static _logLevel: AgLogLevel = AgLogLevelCode.OFF;
  private _loggerManager: AgLoggerManager;

  private constructor() {
    this._loggerManager = AgLoggerManager.getInstance();
  }

  static getInstance(
    defaultLogger?: AgLoggerFunction,
    formatter?: AgFormatFunction,
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>,
  ): AgLogger {
    const instance = (AgLogger._instance ??= new AgLogger());

    // 設定が渡された場合はsetLoggerを使用して統一的に処理
    if (defaultLogger !== undefined || formatter !== undefined || loggerMap !== undefined) {
      instance.setLogger({ defaultLogger, formatter, loggerMap });
    }

    return instance;
  }

  private isOutputLevel(level: AgLogLevel): boolean {
    if (AgLogger._logLevel === AgLogLevelCode.OFF) {
      return false;
    }
    return level <= AgLogger._logLevel;
  }

  setLogLevel(level: AgLogLevel): AgLogLevel {
    AgLogger._logLevel = level;
    return AgLogger._logLevel;
  }

  getLogLevel(): AgLogLevel {
    return AgLogger._logLevel;
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

  setLogger(options: {
    defaultLogger?: AgLoggerFunction;
    formatter?: AgFormatFunction;
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>;
  }): void {
    // AgLoggerManagerに設定を委譲して処理を統一
    this._loggerManager.setLogger(options);
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
