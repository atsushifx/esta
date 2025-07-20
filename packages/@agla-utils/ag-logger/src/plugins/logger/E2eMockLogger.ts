// src/plugins/logger/E2eMockLogger.ts
// @(#) : E2E Mock Logger Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import { AG_LOG_LEVEL } from '../../../shared/types';
import type { AgTLogLevel } from '../../../shared/types';

/**
 * Mock logger for E2E testing that captures log messages in arrays.
 * Uses 2D array structure for efficient log level management.
 */
export class E2eMockLogger {
  private messages: string[][] = [
    [], // OFF (0) - not used for actual logging
    [], // FATAL (1)
    [], // ERROR (2)
    [], // WARN (3)
    [], // INFO (4)
    [], // DEBUG (5)
    [], // TRACE (6)
  ];

  fatal(message: string): void {
    this.messages[AG_LOG_LEVEL.FATAL].push(message);
  }

  error(message: string): void {
    this.messages[AG_LOG_LEVEL.ERROR].push(message);
  }

  warn(message: string): void {
    this.messages[AG_LOG_LEVEL.WARN].push(message);
  }

  info(message: string): void {
    this.messages[AG_LOG_LEVEL.INFO].push(message);
  }

  debug(message: string): void {
    this.messages[AG_LOG_LEVEL.DEBUG].push(message);
  }

  trace(message: string): void {
    this.messages[AG_LOG_LEVEL.TRACE].push(message);
  }

  getMessages(logLevel: AgTLogLevel): string[] {
    return [...this.messages[logLevel]];
  }

  getLastMessage(logLevel: AgTLogLevel): string | null {
    const levelMessages = this.messages[logLevel];
    return levelMessages[levelMessages.length - 1] || null;
  }

  clearMessages(logLevel: AgTLogLevel): void {
    this.messages[logLevel] = [];
  }

  // Legacy methods for backward compatibility
  getErrorMessages(): string[] {
    return this.getMessages(AG_LOG_LEVEL.ERROR);
  }

  getLastErrorMessage(): string | null {
    return this.getLastMessage(AG_LOG_LEVEL.ERROR);
  }

  clearErrorMessages(): void {
    this.clearMessages(AG_LOG_LEVEL.ERROR);
  }
}
