// src/helpers/AgLoggerGetMessage.ts
// @(#)  : Argument to Message Conversion Utility
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgLogLevel } from '../../shared/types';
import type { AgLogMessage } from '../../shared/types/AgLogger.types';
import { parseArgsToAgLogMessage } from '../functional/core/parseArgsToAgLogMessage';

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
  const formatted = parseArgsToAgLogMessage(logLevel, ...args);

  // parseArgsToAgLogMessage の結果を AgLogMessage 型に変換
  return {
    logLevel,
    timestamp: formatted.timestamp,
    message: formatted.message,
    args: [...formatted.args], // readonly を通常の配列に変換
  };
};
