// src/plugins/format/JsonFormat.ts
// @(#) : JSON Format Plugin Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgLogMessage } from '@shared/types';

// utilities
import { AgLoggerGetLabel } from '../../utils/AgLoggerHelpers';

/**
 * Formats a log message into a JSON string.
 *
 * @param logMessage - The log message object containing timestamp, level, message, and optional args.
 * @returns A JSON string representing the structured log entry.
 */
export const JsonFormat = (logMessage: AgLogMessage): string => {
  const logEntry = {
    timestamp: logMessage.timestamp.toISOString(),
    level: AgLoggerGetLabel(logMessage.logLevel),
    message: logMessage.message,
    ...(logMessage.args.length > 0 && { args: logMessage.args }),
  };

  return JSON.stringify(logEntry);
};

export default JsonFormat;
