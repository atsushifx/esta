// src: /src/ConsoleLogger.class.ts
// @(#) : console出力型 Logger
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// --- modules
import { AgLogLevelCode } from '@shared/types';

// --- class
import { AgLogger } from './AgLogger.class';
// utility functions
import { agLog, agLogMessage } from './AgLogUtils';

// --- main routine
export class ConsoleLogger extends AgLogger {
  log(...args: unknown[]): void {
    console.log(agLogMessage(...args));
  }

  logDebug(...args: unknown[]): void {
    console.debug(agLog(AgLogLevelCode.DEBUG, ...args));
  }

  logInfo(...args: unknown[]): void {
    console.debug(agLog(AgLogLevelCode.INFO, ...args));
  }

  logWarn(...args: unknown[]): void {
    console.warn(agLog(AgLogLevelCode.WARN, ...args));
  }

  logError(...args: unknown[]): void {
    console.error(agLog(AgLogLevelCode.ERROR, ...args));
  }
}

export default ConsoleLogger;
