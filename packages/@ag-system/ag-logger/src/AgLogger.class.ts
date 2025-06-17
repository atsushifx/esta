// src: /src/AgLogger.class.ts
// @(#) : AgLogger抽象クラス
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgLogLevel } from '@shared/types';
// module
import { AgLogLevelCode } from '@shared/types';

// --- class definition
export abstract class AgLogger {
  private static _logger: AgLogger;
  private static _logLevel: AgLogLevel = AgLogLevelCode.INFO;

  static getLogger<T extends AgLogger>(_construct?: new () => T): T {
    if (!AgLogger._logger) {
      if (!_construct) {
        throw new Error(`can't create Logger type <unknown}>.`);
      }
      AgLogger._logger = new _construct();
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

  // log method (output by logLevel)
  debug(...args: unknown[]): void {
    if (this.isOutputLevel(AgLogLevelCode.DEBUG)) {
      this.logDebug(...args);
    }
  }
  info(...args: unknown[]): void {
    if (this.isOutputLevel(AgLogLevelCode.INFO)) {
      this.logInfo(...args);
    }
  }
  warn(...args: unknown[]): void {
    if (this.isOutputLevel(AgLogLevelCode.WARN)) {
      this.logWarn(...args);
    }
  }
  error(...args: unknown[]): void {
    if (this.isOutputLevel(AgLogLevelCode.ERROR)) {
      this.logError(...args);
    }
  }
  // log method (output)
  abstract log(...args: unknown[]): void;
  abstract logDebug(...args: unknown[]): void;
  abstract logInfo(...args: unknown[]): void;
  abstract logWarn(...args: unknown[]): void;
  abstract logError(...args: unknown[]): void;
}

export default AgLogger;
