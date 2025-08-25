// src/utils/AgLogHelpers.ts
// @(#) : AgLogger helper utility functions

// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { AG_LABEL_TO_LOGLEVEL_MAP, AG_LOGLEVEL, AG_LOGLEVEL_TO_LABEL_MAP } from '../../shared/types';
import type { AgFormattedLogMessage, AgLoggerFunction, AgLogLevel, AgLogLevelLabel } from '../../shared/types';
import { isValidLogLevel } from './AgLogValidators';

/**
 * Convert numeric log level to string label using map reference
 * @param level - Numeric log level
 * @returns String label for the log level, or empty string if invalid
 */
export const AgToLabel = (level: AgLogLevel): AgLogLevelLabel | '' => {
  if (!isValidLogLevel(level)) {
    return '' as AgLogLevelLabel;
  }

  // return empty string if log level is LOG
  if (level === AG_LOGLEVEL.LOG) {
    return '' as AgLogLevelLabel;
  }

  return AG_LOGLEVEL_TO_LABEL_MAP[level];
};

/**
 * Convert string label to numeric log level using map reference
 * @param label - String log level label
 * @returns Numeric log level, or undefined if invalid
 */
export const AgToLogLevel = (label: string): AgLogLevel | undefined => {
  if (!label || typeof label !== 'string') {
    return undefined;
  }
  const labelIndex = label.trim().toUpperCase();
  return AG_LABEL_TO_LOGLEVEL_MAP[labelIndex as AgLogLevelLabel];
};

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
 * Extracts the message string from arguments by filtering stringifiable values.
 *
 * @param args - Array of arguments to process
 * @returns Concatenated string message
 */
export const extractMessage = (args: readonly unknown[]): string => {
  return args
    .filter(isMessageArgument)
    .map((arg) => String(arg))
    .join(' ')
    .trim();
};

/**
 * Converts any value to a string representation with type-specific formatting.
 *
 * @param value - The value to convert to string
 * @returns String representation of the value
 */
export const valueToString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return String(value);
  } else if (Array.isArray(value)) {
    return (value.length <= 0) ? 'array' : `[${String(value)}]`;
  } else if (typeof value === 'function') {
    return (value.name === '') ? 'function' : 'function ' + value.name;
  } else if (typeof value === 'object') {
    return 'object';
  } else if (typeof value === 'string') {
    return `"${value}"`;
  }
  return String(value);
};

/**
 * Converts an array of arguments to a space-separated string.
 * Uses JSON.stringify when possible, falls back to valueToString for non-stringifiable values.
 *
 * @param args - Array of arguments to convert
 * @returns Space-separated string representation of all arguments
 */
export const argsToString = (args: readonly unknown[]): string => {
  if (args.length === 0) {
    return '';
  }

  const message = args.map((arg) => JSON.stringify(arg) || valueToString(arg)).join(' ').trim();
  return message;
};

/**
 * Creates a logger function that can be registered in loggerMap.
 * Takes a module function and returns a function compatible with AgLoggerFunction.
 *
 * @param moduleFunc - The function to wrap (e.g., this.executeLog, this.debug, console.error)
 * @returns A function that takes logLevel and message and calls the module function
 *
 * @example
 * ```typescript
 * // For this.executeLog(level, message)
 * const loggerFunc = createLoggerFunction((level, message) => this.executeLog(level, message));
 *
 * // For this.debug(message)
 * const debugFunc = createLoggerFunction((level, message) => this.debug(message));
 *
 * // For console.error(formattedMessage)
 * const consoleFunc = createLoggerFunction((level, message) => console.error(message));
 * ```
 */
export const createLoggerFunction = (
  moduleFunc: (level: AgLogLevel, message: AgFormattedLogMessage) => void,
): AgLoggerFunction => {
  return (formattedMessage: AgFormattedLogMessage): void => {
    // Extract level information if available, otherwise use a default level
    // Since we only have the formatted message, we'll pass a default level
    moduleFunc(AG_LOGLEVEL.INFO, formattedMessage);
  };
};
