// src: /src/utils/logger/AbstractAgLogger.class.ts
// @(#) : AgLogger抽象クラス
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// module
import { AgLogLevel } from '@shared/types';
// types/ interface
import type { IAgLogger } from '@shared/types';

// --- class definition
export abstract class AgLogger implements IAgLogger {
  private static _logger: AgLogger;
  private static _logLevel: AgLogLevel = AgLogLevel.INFO;

  static getLogger<T extends AgLogger>(_construct?: new() => T): T {
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
      case AgLogLevel.DEBUG:
        return true;
      case AgLogLevel.INFO:
        return (level === AgLogLevel.INFO || level == AgLogLevel.WARN || level == AgLogLevel.ERROR);
      case AgLogLevel.WARN:
        return (level === AgLogLevel.WARN || level == AgLogLevel.ERROR);
      case AgLogLevel.ERROR:
        return (level === AgLogLevel.ERROR);
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
    if (this.isOutputLevel(AgLogLevel.DEBUG)) {
      this.logDebug(...args);
    }
  }
  info(...args: unknown[]): void {
    if (this.isOutputLevel(AgLogLevel.INFO)) {
      this.logInfo(...args);
    }
  }
  warn(...args: unknown[]): void {
    if (this.isOutputLevel(AgLogLevel.WARN)) {
      this.logWarn(...args);
    }
  }
  error(...args: unknown[]): void {
    if (this.isOutputLevel(AgLogLevel.ERROR)) {
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
