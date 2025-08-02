// src/plugins/logger/MockLogger.ts
// @(#) : Mock Logger for Unit and Integration Testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLoggerFunction, AgLoggerMap, AgLogLevel, AgLogMessage } from '../../../shared/types';

/**
 * Universal mock logger for unit and integration testing.
 * Provides message capture and verification capabilities for all test types.
 *
 * Features:
 * - Fast execution for unit and integration tests
 * - Component interaction verification
 * - Synchronous operations only
 * - Thread-safe for single-threaded test scenarios
 */
export class MockLogger {
  private messages: (AgLogMessage | string)[][] = [
    [], // OFF (0) - not used for actual logging
    [], // FATAL (1)
    [], // ERROR (2)
    [], // WARN (3)
    [], // INFO (4)
    [], // DEBUG (5)
    [], // TRACE (6)
  ];

  /**
   * Validates if the provided log level is valid.
   * @param logLevel - The log level to validate
   * @throws {Error} When log level is invalid
   */
  private validateLogLevel(logLevel: AgLogLevel): void {
    if (typeof logLevel !== 'number' || logLevel < 0 || logLevel > 6 || !Number.isInteger(logLevel)) {
      throw new Error(`Invalid log level: ${logLevel}`);
    }
  }

  // Logger methods
  fatal(message: AgLogMessage | string): void {
    this.messages[AG_LOGLEVEL.FATAL].push(message);
  }

  error(message: AgLogMessage | string): void {
    this.messages[AG_LOGLEVEL.ERROR].push(message);
  }

  warn(message: AgLogMessage | string): void {
    this.messages[AG_LOGLEVEL.WARN].push(message);
  }

  info(message: AgLogMessage | string): void {
    this.messages[AG_LOGLEVEL.INFO].push(message);
  }

  debug(message: AgLogMessage | string): void {
    this.messages[AG_LOGLEVEL.DEBUG].push(message);
  }

  trace(message: AgLogMessage | string): void {
    this.messages[AG_LOGLEVEL.TRACE].push(message);
  }

  // Query methods
  getMessages(logLevel: AgLogLevel): (AgLogMessage | string)[] {
    this.validateLogLevel(logLevel);
    return [...this.messages[logLevel]];
  }

  getLastMessage(logLevel: AgLogLevel): AgLogMessage | string | null {
    this.validateLogLevel(logLevel);
    const levelMessages = this.messages[logLevel];
    return levelMessages[levelMessages.length - 1] || null;
  }

  getAllMessages(): { [K in keyof typeof AG_LOGLEVEL]: (AgLogMessage | string)[] } {
    return {
      OFF: [...this.messages[AG_LOGLEVEL.OFF]],
      FATAL: [...this.messages[AG_LOGLEVEL.FATAL]],
      ERROR: [...this.messages[AG_LOGLEVEL.ERROR]],
      WARN: [...this.messages[AG_LOGLEVEL.WARN]],
      INFO: [...this.messages[AG_LOGLEVEL.INFO]],
      DEBUG: [...this.messages[AG_LOGLEVEL.DEBUG]],
      TRACE: [...this.messages[AG_LOGLEVEL.TRACE]],
    };
  }

  // Utility methods
  clearMessages(logLevel: AgLogLevel): void {
    this.validateLogLevel(logLevel);
    this.messages[logLevel] = [];
  }

  clearAllMessages(): void {
    this.messages = [
      [], // OFF (0)
      [], // FATAL (1)
      [], // ERROR (2)
      [], // WARN (3)
      [], // INFO (4)
      [], // DEBUG (5)
      [], // TRACE (6)
    ];
  }

  getMessageCount(logLevel: AgLogLevel): number {
    this.validateLogLevel(logLevel);
    return this.messages[logLevel].length;
  }

  getTotalMessageCount(): number {
    return this.messages.reduce((total, levelMessages) => total + levelMessages.length, 0);
  }

  hasMessages(logLevel: AgLogLevel): boolean {
    this.validateLogLevel(logLevel);
    return this.messages[logLevel].length > 0;
  }

  hasAnyMessages(): boolean {
    return this.messages.some((levelMessages) => levelMessages.length > 0);
  }

  /**
   * Create AgLoggerFunction for testing.
   * This can be used as a plugin for ag-logger.
   */
  createLoggerFunction(): AgLoggerFunction {
    return (formattedLogMessage: string | AgLogMessage): void => {
      // Use info level as default for generic logger function
      this.info(formattedLogMessage);
    };
  }

  /**
   * Create AgLoggerMap for testing.
   * This provides level-specific logging functions.
   */
  createLoggerMap(): AgLoggerMap {
    return {
      [AG_LOGLEVEL.OFF]: () => {}, // No-op for OFF level
      [AG_LOGLEVEL.FATAL]: (message: string | AgLogMessage) => this.fatal(message),
      [AG_LOGLEVEL.ERROR]: (message: string | AgLogMessage) => this.error(message),
      [AG_LOGLEVEL.WARN]: (message: string | AgLogMessage) => this.warn(message),
      [AG_LOGLEVEL.INFO]: (message: string | AgLogMessage) => this.info(message),
      [AG_LOGLEVEL.DEBUG]: (message: string | AgLogMessage) => this.debug(message),
      [AG_LOGLEVEL.TRACE]: (message: string | AgLogMessage) => this.trace(message),
    };
  }

  // Legacy methods for backward compatibility
  getErrorMessages(): (AgLogMessage | string)[] {
    return this.getMessages(AG_LOGLEVEL.ERROR);
  }

  getLastErrorMessage(): AgLogMessage | string | null {
    return this.getLastMessage(AG_LOGLEVEL.ERROR);
  }

  clearErrorMessages(): void {
    this.clearMessages(AG_LOGLEVEL.ERROR);
  }
}
