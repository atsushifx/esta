// src/plugins/formatter/PlainFormatter.ts
// @(#) : Plain Formatter Plugin Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgFormatFunction, AgLogMessage } from '../../../shared/types';

// utils
import { argsToString } from '../../utils/AgLogHelpers';
import { AgToLabel } from '../../utils/AgLogHelpers';

/**
 * Formats a log message into a plain text string.
 * The format includes ISO8601 timestamp (without milliseconds), log level label in uppercase,
 * the log message, and optional JSON-stringified arguments separated by spaces.
 *
 * @param logMessage - The log message object containing timestamp, level, message, and optional args.
 * @returns A formatted plain text log string.
 */
export const PlainFormatter: AgFormatFunction = (logMessage: AgLogMessage): string => {
  const timestamp = logMessage.timestamp.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const levelLabel = AgToLabel(logMessage.logLevel);
  const messagePart = `${logMessage.message} ${argsToString(logMessage.args)}`.trim();
  const labelPart = levelLabel ? `[${levelLabel}] ` : '';
  return `${timestamp} ${labelPart}${messagePart}`.trim();
};

export default PlainFormatter;
