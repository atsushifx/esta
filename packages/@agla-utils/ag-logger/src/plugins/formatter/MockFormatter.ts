// src/plugins/formatter/MockFormatter.ts
// @(#) : Mock Formatter for Testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgFormatFunction, AgLogMessage } from '../../../shared/types';
// utilities
import { AgToLabel } from '../../utils/AgLogHelpers';

// formatter

/**
 * Mock formatters for testing purposes.
 * Contains simple formatter functions that can be used in unit tests.
 */
export const MockFormatter = {
  /**
   * Passthrough formatter that returns the log message as-is.
   * Useful for testing when you want to verify the raw AgLogMessage object.
   *
   * @param logMessage - The log message object
   * @returns The same log message object unchanged
   */
  passthrough: ((logMessage: AgLogMessage): AgLogMessage => {
    return logMessage;
  }) as AgFormatFunction,

  /**
   * JSON formatter that converts the log message to a JSON string.
   * Converts logLevel to level string for proper JSON structure.
   *
   * @param logMessage - The log message object
   * @returns JSON string representation of the log message with string level
   */
  json: ((logMessage: AgLogMessage): string => {
    const levelLabel = AgToLabel(logMessage.logLevel);
    const logEntry = {
      timestamp: logMessage.timestamp.toISOString(),
      logLevel: logMessage.logLevel,
      ...(levelLabel && { level: levelLabel }),
      message: logMessage.message,
      ...(logMessage.args.length > 0 && { args: logMessage.args }),
    };
    return JSON.stringify(logEntry);
  }) as AgFormatFunction,

  messageOnly: ((logMessage: AgLogMessage): string => {
    return logMessage.message;
  }) as AgFormatFunction,
} as const;

export default MockFormatter;
