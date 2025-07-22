// src/functional/core/formatLogMessage.ts
// @(#) : Pure function for formatting log messages
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgTLogLevel } from '../../../shared/types';

export type LogMessage = {
  readonly level: string;
  readonly message: string;
  readonly timestamp: Date;
  readonly args: readonly unknown[];
};

// Helper functions (pure functions)
const convertLogLevel = (level: AgTLogLevel): string => {
  const levelMap: Record<AgTLogLevel, string> = {
    0: 'OFF',
    1: 'FATAL',
    2: 'ERROR',
    3: 'WARN',
    4: 'INFO',
    5: 'DEBUG',
    6: 'TRACE',
  };
  return levelMap[level] ?? 'INFO';
};

const isStringifiable = (arg: unknown): arg is string | number | boolean | symbol => {
  const type = typeof arg;
  return ['string', 'number', 'boolean', 'symbol'].includes(type);
};

const isTimestamp = (arg: unknown): arg is string => {
  if (typeof arg !== 'string') { return false; }
  const timestamp = new Date(arg);
  return !isNaN(timestamp.getTime());
};

const extractMessage = (args: readonly unknown[]): string => {
  return args
    .filter(isStringifiable)
    .map((arg) => String(arg).trim())
    .join(' ');
};

const extractArgs = (args: readonly unknown[]): readonly unknown[] => {
  return args.filter((arg) => !isStringifiable(arg));
};

const parseTimestamp = (args: readonly unknown[]): [Date, readonly unknown[]] => {
  if (args.length > 0 && isTimestamp(args[0])) {
    return [new Date(args[0]), args.slice(1)];
  }
  return [new Date(), args];
};

/**
 * Pure function to format log messages.
 * Converts AgTLogLevel to string labels, handles optional timestamp,
 * and separates message from structured arguments.
 *
 * @param level - The log level
 * @param args - Variable arguments to be processed (optional timestamp first)
 * @returns Immutable LogMessage object
 */
export const formatLogMessage = (
  level: AgTLogLevel,
  ...args: readonly unknown[]
): LogMessage => {
  const [timestamp, remainingArgs] = parseTimestamp(args);

  const result: LogMessage = {
    level: convertLogLevel(level),
    message: extractMessage(remainingArgs),
    timestamp,
    args: Object.freeze([...extractArgs(remainingArgs)]),
  };

  return Object.freeze(result);
};
