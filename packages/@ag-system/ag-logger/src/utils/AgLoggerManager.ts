// src: /src/utils/AgLoggerManager.ts
// @(#) : AG Logger Manager
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// type
import type { AgLoggerFunction, AgLoggerMap } from '@shared/types/AgLogger.interface';
import type { AgLogLevel } from '@shared/types/AgLogger.types';
// code
import { AgLogLevelCode } from '@shared/types/AgLogger.types';

// logger
import { NullLogger } from '../plugins/logger/NullLogger';

export class AgLoggerManager {
  private static instance: AgLoggerManager | undefined;
  private loggerMap: AgLoggerMap<AgLoggerFunction>;
  private defaultLogger: AgLoggerFunction;

  private constructor() {
    this.defaultLogger = NullLogger;
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

  static getInstance(
    loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>,
    defaultLogger?: AgLoggerFunction,
  ): AgLoggerManager {
    AgLoggerManager.instance ??= new AgLoggerManager();

    if (defaultLogger) {
      AgLoggerManager.instance.defaultLogger = defaultLogger;
    }

    if (loggerMap) {
      Object.keys(AgLogLevelCode).forEach((key) => {
        const levelCode = AgLogLevelCode[key as keyof typeof AgLogLevelCode];
        if (loggerMap[levelCode] !== undefined) {
          AgLoggerManager.instance!.loggerMap[levelCode] = loggerMap[levelCode]!;
        } else {
          AgLoggerManager.instance!.loggerMap[levelCode] = AgLoggerManager.instance!.defaultLogger;
        }
      });
    }

    return AgLoggerManager.instance;
  }

  getLogger(logLevel: AgLogLevel): AgLoggerFunction {
    return this.loggerMap[logLevel] ?? this.defaultLogger;
  }

  setLogger(logLevel: AgLogLevel, logFunction: AgLoggerFunction | null): void {
    this.loggerMap[logLevel] = logFunction ?? this.defaultLogger;
  }
}
