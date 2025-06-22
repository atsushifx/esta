// src: /src/plugins/format/JsonFormat.ts
// @(#) : JSON Format Plugin Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// type
import type { AgLogMessage } from '@shared/types';

// utils
import { AgLoggerGetLabel } from '../../utils/AgLoggerHelpers';

export const JsonFormat = (logMessage: AgLogMessage): string => {
  const logEntry = {
    timestamp: logMessage.timestamp.toISOString(),
    level: AgLoggerGetLabel(logMessage.logLevel).toUpperCase(),
    message: logMessage.message,
    ...(logMessage.args.length > 0 && { args: logMessage.args }),
  };

  return JSON.stringify(logEntry);
};

export default JsonFormat;
