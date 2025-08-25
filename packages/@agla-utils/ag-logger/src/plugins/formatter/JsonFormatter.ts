// src/plugins/format/JsonFormatter.ts
// @(#) : JSON Formatter Plugin Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgLogMessage } from '../../../shared/types';

// utilities
import { AgToLabel } from '../../utils/AgLogHelpers';

/**
 * Formats a log message into a JSON string.
 *
 * @param logMessage - The log message object containing timestamp, level, message, and optional args.
 * @returns A JSON string representing the structured log entry.
 */
export const JsonFormatter = (logMessage: AgLogMessage): string => {
  const levelLabel = AgToLabel(logMessage.logLevel);
  const logEntry = {
    timestamp: logMessage.timestamp.toISOString(),
    ...(levelLabel && { level: levelLabel }),
    message: logMessage.message,
    ...(logMessage.args.length > 0 && { args: logMessage.args }),
  };

  return JSON.stringify(logEntry);
};

export default JsonFormatter;
