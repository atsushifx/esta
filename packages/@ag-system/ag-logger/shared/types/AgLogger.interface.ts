// src: /shared/types/AgLogger.interface.ts
// @(#) : Logger Interface Definitions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// type
import type { AgLogLevel, AgLogMessage } from './AgLogger.types';

// --- interfaces ---
/**
 * Represents a logging function.
 * Receives a formatted log message string and handles output processing.
 */
export type AgLoggerFunction = (formattedLogMessage: string) => void;

/**
 * Represents a formatting function for log messages.
 * Accepts an `AgLogMessage` object and returns a formatted string,
 * e.g., combining timestamp, log level, and message.
 */
export type AgFormatFunction = (logMessage: AgLogMessage) => string;

/**
 * A map holding logging functions for each log level.
 * Values can be a logging function for the level or `null` to disable logging at that level.
 *
 * @template T - The type of logging function. Defaults to `AgLoggerFunction`.
 */
export type AgLoggerMap<T extends AgLoggerFunction = AgLoggerFunction> = Record<AgLogLevel, T | null>;
