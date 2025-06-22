// src/plugins/format/PlainFormat.ts
// @(#) : Plain Format Plugin Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgFormatFunction, AgLogMessage } from '@shared/types';

// utils
import { AgLoggerGetLabel } from '../../utils/AgLoggerHelpers';

/**
 * Formats a log message into a plain text string.
 * The format includes ISO8601 timestamp (without milliseconds), log level label in uppercase,
 * the log message, and optional JSON-stringified arguments separated by spaces.
 *
 * @param logMessage - The log message object containing timestamp, level, message, and optional args.
 * @returns A formatted plain text log string.
 */
export const PlainFormat = (logMessage: AgLogMessage): string => {
  const timestamp = logMessage.timestamp.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const levelLabel = AgLoggerGetLabel(logMessage.logLevel);
  const message = logMessage.message;
  const argsString = logMessage.args.length > 0
    ? logMessage.args.map((arg) => JSON.stringify(arg)).join(' ')
    : '';

  return `${timestamp} [${levelLabel}] ${message} ${argsString}`.trim();
};

export default PlainFormat;
