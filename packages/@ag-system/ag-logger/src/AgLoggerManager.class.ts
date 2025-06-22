// src: /src/utils/AgLoggerManager.ts
// @(#) : AG Logger Manager
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// type
import type { AgFormatFunction, AgLoggerFunction, AgLoggerMap } from '@shared/types/AgLogger.interface';
import type { AgLogLevel } from '@shared/types/AgLogger.types';
// code
import { AgLogLevelCode } from '@shared/types/AgLogger.types';

// plugins
import { NullFormat } from '@/plugins/format/NullFormat';
import { NullLogger } from '@/plugins/logger/NullLogger';

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

    // ロガーマップの更新
    if (defaultLogger || loggerMap) {
      AgLoggerManager.instance.updateLogMap(defaultLogger, loggerMap);
    }

    return AgLoggerManager.instance;
  }

  getLogger(logLevel: AgLogLevel): AgLoggerFunction {
    return this.loggerMap[logLevel] ?? this.defaultLogger;
  }

  getFormatter(): AgFormatFunction {
    return this.formatter;
  }

  private updateLogMap(defaultLogger?: AgLoggerFunction, loggerMap?: Partial<AgLoggerMap<AgLoggerFunction>>): void {
    const targetLogger = defaultLogger ?? this.defaultLogger;

    // 全てのレベルをデフォルトロガーに設定
    Object.keys(AgLogLevelCode).forEach((key) => {
      const levelCode = AgLogLevelCode[key as keyof typeof AgLogLevelCode];
      this.loggerMap[levelCode] = targetLogger;
    });

    // loggerMapで指定されたものは個別に上書き
    if (loggerMap) {
      Object.keys(loggerMap).forEach((key) => {
        const levelCode = parseInt(key) as AgLogLevel;
        if (loggerMap[levelCode] !== undefined) {
          this.loggerMap[levelCode] = loggerMap[levelCode]!;
        }
      });
    }
  }

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
      // 従来のsetLogger(logLevel, logFunction)の形式
      this.loggerMap[logLevelOrOptions] = logFunction ?? this.defaultLogger;
    } else {
      // 新しいsetLogger(options)の形式
      const options = logLevelOrOptions;
      if (options.defaultLogger !== undefined) {
        this.defaultLogger = options.defaultLogger;
      }
      if (options.formatter !== undefined) {
        this.formatter = options.formatter;
      }

      // ロガーマップの更新
      if (options.defaultLogger || options.loggerMap) {
        this.updateLogMap(options.defaultLogger, options.loggerMap);
      }
    }
  }
}
