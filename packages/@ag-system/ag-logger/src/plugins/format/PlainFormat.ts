// src: /src/plugins/format/PlainFormat.ts
// @(#) : Plain Format Plugin Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgLogMessage } from '@shared/types';

import { AgLoggerGetLabel } from '../../utils/AgLoggerHelpers';

export const PlainFormat = (logMessage: AgLogMessage): string => {
  const timestamp = logMessage.timestamp.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const levelLabel = AgLoggerGetLabel(logMessage.logLevel).toUpperCase();
  const message = logMessage.message;

  const argsString = logMessage.args.length > 0
    ? ' ' + logMessage.args.map((arg) => JSON.stringify(arg)).join(' ')
    : '';

  return `${timestamp} [${levelLabel}] ${message}${argsString}`;
};

export default PlainFormat;
