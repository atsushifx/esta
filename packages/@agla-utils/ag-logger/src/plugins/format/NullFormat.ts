// src/plugins/format/NullFormat.ts
// @(#) : Null Format Plugin Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgFormatFunction, AgLogMessage } from '@shared/types';

/**
 * Null formatter that always returns an empty string,
 * regardless of the input log message.
 *
 * @param _logMessage - The log message object (ignored).
 * @returns An empty string.
 */
export const NullFormat: AgFormatFunction = (
  _logMessage: AgLogMessage,
): string => {
  return '';
};

export default NullFormat;
