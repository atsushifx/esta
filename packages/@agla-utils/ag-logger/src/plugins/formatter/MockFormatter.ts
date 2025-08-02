// src/plugins/formatter/MockFormatter.ts
// @(#) : Mock Formatter for Testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgFormatFunction, AgLogMessage } from '../../../shared/types';

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
   * Simple implementation for testing JSON serialization.
   *
   * @param logMessage - The log message object
   * @returns JSON string representation of the log message
   */
  json: ((logMessage: AgLogMessage): string => {
    return JSON.stringify(logMessage);
  }) as AgFormatFunction,
} as const;

export default MockFormatter;
