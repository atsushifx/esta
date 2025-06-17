// src: /src/helpers/AgLoggerGetMessage.ts
// @(#)  : 引数 → メッセージ変換
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgLogLevel, AgLogMessage } from '@shared/types/AgLogger.types';

export const AgLoggerGetMessage = (logLevel: AgLogLevel, ...args: unknown[]): AgLogMessage => {
  const args2 = [...args];

  const isArgToString = (arg: unknown): boolean => {
    return typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean' || typeof arg === 'symbol';
  };

  const isTimestamp = (arg: unknown): boolean => {
    if (typeof arg !== 'string') return false;
    const timestamp = new Date(arg);
    return !isNaN(timestamp.getTime());
  };

  let timestamp: Date = new Date();

  if (args2.length > 0 && isTimestamp(args2[0])) {
    timestamp = new Date(args2[0] as string);
    args2.shift();
  }

  const argsStr: string[] = [];
  const argsPrm: unknown[] = [];
  args2.forEach((arg) => {
    if (isArgToString(arg)) {
      argsStr.push(String(arg));
    } else {
      argsPrm.push(arg);
    }
  });

  return {
    logLevel,
    timestamp,
    message: argsStr.join(''),
    args: argsPrm,
  };
};

