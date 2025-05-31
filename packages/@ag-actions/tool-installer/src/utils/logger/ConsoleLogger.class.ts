// src: /src/utils/consoleLogger.ts
// @(#) : console出力型 Logger
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// --- modules
import { AgLogLevel } from '@shared/types';

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
    console.debug(agLog(AgLogLevel.DEBUG, ...args));
  }

  logInfo(...args: unknown[]): void {
    console.debug(agLog(AgLogLevel.INFO, ...args));
  }

  logWarn(...args: unknown[]): void {
    console.warn(agLog(AgLogLevel.WARN, ...args));
  }

  logError(...args: unknown[]): void {
    console.error(agLog(AgLogLevel.ERROR, ...args));
  }
}

export default ConsoleLogger;
