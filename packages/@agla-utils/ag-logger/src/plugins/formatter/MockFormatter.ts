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

/**
 * Statistics for individual formatter methods.
 * Tracks usage count and the last processed message for each formatter.
 */
type MockFormatterStats = {
  callCount: number;
  lastMessage: AgLogMessage | null;
};

/**
 * Internal statistics storage for all formatter methods.
 * Maintains call counts and last processed messages for tracking usage.
 */
const formatterStats: Record<string, MockFormatterStats> = {
  passthrough: { callCount: 0, lastMessage: null },
  json: { callCount: 0, lastMessage: null },
  messageOnly: { callCount: 0, lastMessage: null },
  errorThrow: { callCount: 0, lastMessage: null },
};

/**
 * Records usage statistics for a formatter method.
 * Increments call count and stores the last processed message.
 *
 * @param formatterName - Name of the formatter being used
 * @param logMessage - The log message being processed
 */
const recordUsage = (formatterName: string, logMessage: AgLogMessage): void => {
  const stats = formatterStats[formatterName];
  stats.callCount++;
  stats.lastMessage = logMessage;
};

// formatter

/**
 * Mock formatters for testing purposes.
 * Contains simple formatter functions that can be used in unit tests.
 * Each formatter tracks usage statistics including call count and last processed message.
 *
 * @example
 * ```typescript
 * // Use formatters normally
 * const result = MockFormatter.passthrough(logMessage);
 * const json = MockFormatter.json(logMessage);
 *
 * // Check usage statistics
 * const stats = MockFormatter.getStats('passthrough');
 * console.log(stats.callCount); // 1
 *
 * // Reset statistics
 * MockFormatter.resetStats();
 * ```
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
    recordUsage('passthrough', logMessage);
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
    recordUsage('json', logMessage);
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
    recordUsage('messageOnly', logMessage);
    return logMessage.message;
  }) as AgFormatFunction,

  /**
   * Error throwing formatter factory that creates a formatter function.
   * When the returned formatter is called, it throws an Error with the specified message.
   * Useful for testing error handling in logger systems.
   *
   * @param errorMessage - The error message to throw when the formatter is called
   * @returns A formatter function that throws an Error with the specified message
   */
  errorThrow: (errorMessage: string): AgFormatFunction => {
    return ((logMessage: AgLogMessage): never => {
      recordUsage('errorThrow', logMessage);
      throw new Error(errorMessage);
    }) as AgFormatFunction;
  },

  /**
   * Get usage statistics for a specific formatter.
   * @param formatterName - Name of the formatter to get stats for
   * @returns Statistics object containing call count and last message, or null if formatter not found
   */
  getStats: (formatterName: string): MockFormatterStats | null => {
    return formatterStats[formatterName] ?? null;
  },

  /**
   * Get usage statistics for all formatters.
   * @returns Object containing statistics for all formatter methods
   */
  getAllStats: (): Record<string, MockFormatterStats> => {
    return { ...formatterStats };
  },

  /**
   * Get the last log message processed by a specific formatter.
   * @param formatterName - Name of the formatter to get last message for
   * @returns Last log message processed by the formatter, or null if none or formatter not found
   */
  getLastMessage: (formatterName: string): AgLogMessage | null => {
    return formatterStats[formatterName]?.lastMessage ?? null;
  },

  /**
   * Reset usage statistics for all formatters.
   * Sets call counts to 0 and last messages to null.
   */
  resetStats: (): void => {
    Object.keys(formatterStats).forEach((key) => {
      formatterStats[key].callCount = 0;
      formatterStats[key].lastMessage = null;
    });
  },

  /**
   * Reset usage statistics for a specific formatter.
   * @param formatterName - Name of the formatter to reset stats for
   */
  resetFormatterStats: (formatterName: string): void => {
    const stats = formatterStats[formatterName];
    stats.callCount = 0;
    stats.lastMessage = null;
  },
} as const;

export default MockFormatter;
