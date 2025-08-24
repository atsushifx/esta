// src/functional/core/formatLogMessage.ts
// @(#) : Pure function for formatting log messages
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgLogLevel } from '../../../shared/types';
import { AgToLabel } from '../../utils/AgLogHelpers';
import { extractMessage } from '../../utils/AgLogHelpers';

export type LogMessage = {
  readonly level: string;
  readonly message: string;
  readonly timestamp: Date;
  readonly args: readonly unknown[];
};

// Helper functions (pure functions)

/**
 * Checks if an argument should be included in the log message text.
 * Primitive types are concatenated into the message, while complex types are stored separately.
 *
 * @param arg - The argument to check
 * @returns True if the argument is a primitive type that belongs in the message
 */
const isMessageArgument = (arg: unknown): arg is string | number | boolean | symbol => {
  const argType = typeof arg;
  return ['string', 'number', 'boolean', 'symbol'].includes(argType);
};

/**
 * Checks if an argument is a valid timestamp string.
 * Only accepts ISO format or 'yyyy-mm-dd HH:MM:SS' format.
 *
 * @param arg - The argument to check
 * @returns True if the argument is a valid ISO timestamp or 'yyyy-mm-dd HH:MM:SS' format
 */
const isTimestamp = (arg: unknown): arg is string => {
  if (typeof arg !== 'string') { return false; }

  // Check for ISO timestamp format (strict)
  const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)$/;

  // Check for 'yyyy-mm-dd HH:MM:SS' format
  const standardPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

  if (!isoPattern.test(arg) && !standardPattern.test(arg)) { return false; }

  const timestamp = new Date(arg);
  return !isNaN(timestamp.getTime());
};

/**
 * Extracts the message string from arguments by filtering stringifiable values.
 *
 * @param args - Array of arguments to process
 * @returns Concatenated string message
 */

/**
 * Extracts non-message arguments for structured data storage.
 *
 * @param args - Array of arguments to process
 * @returns Array of complex arguments that don't belong in the message text (objects, arrays, etc.)
 */
const extractArgs = (args: readonly unknown[]): readonly unknown[] => {
  return args.filter((arg) => !isMessageArgument(arg));
};

/**
 * Parses timestamp from the first argument if present, otherwise uses current time.
 *
 * @param args - Array of arguments to check for timestamp
 * @returns Tuple of [timestamp, remaining arguments]
 */
const parseTimestamp = (args: readonly unknown[]): [Date, readonly unknown[]] => {
  if (args.length > 0 && isTimestamp(args[0])) {
    return [new Date(args[0]), args.slice(1)];
  }
  return [new Date(), args];
};

/**
 * Pure function to parse arguments into structured log message.
 * Converts AgLogLevel to string labels, handles optional timestamp,
 * and separates message from structured arguments.
 *
 * @param level - The log level
 * @param args - Variable arguments to be processed (optional timestamp first)
 * @returns Immutable LogMessage object
 */
export const parseArgsToAgLogMessage = (
  level: AgLogLevel,
  ...args: readonly unknown[]
): LogMessage => {
  const [timestamp, remainingArgs] = parseTimestamp(args);

  const result: LogMessage = {
    level: AgToLabel(level),
    message: extractMessage(remainingArgs),
    timestamp,
    args: Object.freeze([...extractArgs(remainingArgs)]),
  };

  return Object.freeze(result);
};
