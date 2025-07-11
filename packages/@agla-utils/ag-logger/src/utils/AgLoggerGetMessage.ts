// src/helpers/AgLoggerGetMessage.ts
// @(#)  : Argument to Message Conversion Utility
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgLogLevel, AgLogMessage } from '../../shared/types/AgLogger.types';

/**
 * Parses log arguments into a structured log message object.
 * Extracts an optional timestamp if the first argument is a valid ISO string,
 * concatenates primitive arguments into a single message string,
 * and collects remaining complex arguments separately.
 *
 * @param logLevel - The severity level of the log.
 * @param args - The variable list of log arguments, which may include
 *               a timestamp string, primitive values, and complex objects.
 * @returns A structured `AgLogMessage` object with parsed timestamp, message, and arguments.
 */
export const AgLoggerGetMessage = (logLevel: AgLogLevel, ...args: unknown[]): AgLogMessage => {
  const args2 = [...args];

  const isArgToString = (arg: unknown): boolean => {
    const type = typeof arg;
    return ['string', 'number', 'boolean', 'symbol'].includes(type);
  };

  const isTimestamp = (arg: unknown): boolean => {
    if (typeof arg !== 'string') { return false; }
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
