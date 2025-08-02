// src/plugins/logger/MockLogger.ts
// @(#) : Mock Logger for Unit and Integration Testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import { isValidLogLevel } from '@/utils/AgLogLevelHelpers';
// constants
import { AG_LOGLEVEL, AG_LOGLEVEL_KEYS } from '../../../shared/types';
// types
import type {
  AgFormattedLogMessage,
  AgLoggerFunction,
  AgLoggerMap,
  AgLogLevel,
  AgLogLevelKey,
  AgLogMessage,
} from '../../../shared/types';

/**
 * Universal mock logger for unit and integration testing.
 * Provides message capture and verification capabilities for all test types.
 *
 * Features:
 * - Fast execution for unit and integration tests
 * - Component interaction verification
 * - Synchronous operations only
 * - Thread-safe for single-threaded test scenarios
 * - Deep immutability for message objects
 */
export class MockLogger {
  private messages: Map<AgLogLevel, AgFormattedLogMessage[]> = new Map([
    [AG_LOGLEVEL.VERBOSE, []], // VERBOSE (-99)
    [AG_LOGLEVEL.OFF, []], // OFF (0) - not used for actual logging
    [AG_LOGLEVEL.FATAL, []], // FATAL (1)
    [AG_LOGLEVEL.ERROR, []], // ERROR (2)
    [AG_LOGLEVEL.WARN, []], // WARN (3)
    [AG_LOGLEVEL.INFO, []], // INFO (4)
    [AG_LOGLEVEL.DEBUG, []], // DEBUG (5)
    [AG_LOGLEVEL.TRACE, []], // TRACE (6)
  ]);

  /**
   * Deep clone a message to ensure immutability.
   * @param message - The message to clone
   * @returns Deep clone of the message
   */
  private deepClone(message: AgFormattedLogMessage): AgFormattedLogMessage {
    if (typeof message === 'string' || typeof message === 'number' || message === null || message === undefined) {
      return message;
    }
    return JSON.parse(JSON.stringify(message));
  }

  /**
   * Validates if the provided log level is valid.
   * @param logLevel - The log level to validate
   * @throws {Error} When log level is invalid
   */
  private validateLogLevel(logLevel: AgLogLevel): void {
    if (!isValidLogLevel(logLevel)) {
      throw new Error(`MockLogger: Invalid log level: ${logLevel}`);
    }
  }

  // Logger methods
  fatal(message: AgFormattedLogMessage): void {
    this.messages.get(AG_LOGLEVEL.FATAL)!.push(message);
  }

  error(message: AgFormattedLogMessage): void {
    this.messages.get(AG_LOGLEVEL.ERROR)!.push(message);
  }

  warn(message: AgFormattedLogMessage): void {
    this.messages.get(AG_LOGLEVEL.WARN)!.push(message);
  }

  info(message: AgFormattedLogMessage): void {
    this.messages.get(AG_LOGLEVEL.INFO)!.push(message);
  }

  debug(message: AgFormattedLogMessage): void {
    this.messages.get(AG_LOGLEVEL.DEBUG)!.push(message);
  }

  trace(message: AgFormattedLogMessage): void {
    this.messages.get(AG_LOGLEVEL.TRACE)!.push(message);
  }

  verbose(message: AgFormattedLogMessage): void {
    this.messages.get(AG_LOGLEVEL.VERBOSE)!.push(message);
  }

  // Query methods
  getMessages(logLevel: AgLogLevel): AgFormattedLogMessage[] {
    this.validateLogLevel(logLevel);
    return this.messages.get(logLevel)?.slice() ?? [];
  }

  getLastMessage(logLevel: AgLogLevel): AgLogMessage | string | null {
    this.validateLogLevel(logLevel);
    return this.messages.get(logLevel)?.slice(-1)[0] ?? null;
  }

  getAllMessages(): { [K in AgLogLevelKey]: AgFormattedLogMessage[] } {
    return AG_LOGLEVEL_KEYS.reduce((acc, key) => ({
      ...acc,
      [key]: this.messages.get(AG_LOGLEVEL[key])?.slice() ?? [],
    }), {} as { [K in AgLogLevelKey]: AgFormattedLogMessage[] });
  }

  // Utility methods
  clearMessages(logLevel: AgLogLevel): void {
    this.validateLogLevel(logLevel);
    this.messages.set(logLevel, []);
  }

  clearAllMessages(): void {
    this.messages.set(AG_LOGLEVEL.VERBOSE, []);
    this.messages.set(AG_LOGLEVEL.OFF, []);
    this.messages.set(AG_LOGLEVEL.FATAL, []);
    this.messages.set(AG_LOGLEVEL.ERROR, []);
    this.messages.set(AG_LOGLEVEL.WARN, []);
    this.messages.set(AG_LOGLEVEL.INFO, []);
    this.messages.set(AG_LOGLEVEL.DEBUG, []);
    this.messages.set(AG_LOGLEVEL.TRACE, []);
  }

  getMessageCount(logLevel: AgLogLevel): number {
    this.validateLogLevel(logLevel);
    return this.messages.get(logLevel)!.length;
  }

  getTotalMessageCount(): number {
    let total = 0;
    for (const levelMessages of this.messages.values()) {
      total += levelMessages.length;
    }
    return total;
  }

  hasMessages(logLevel: AgLogLevel): boolean {
    this.validateLogLevel(logLevel);
    return this.messages.get(logLevel)!.length > 0;
  }

  hasAnyMessages(): boolean {
    for (const levelMessages of this.messages.values()) {
      if (levelMessages.length > 0) { return true; }
    }
    return false;
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
      [AG_LOGLEVEL.VERBOSE]: (message: string | AgLogMessage) => this.verbose(message),
      [AG_LOGLEVEL.OFF]: () => {}, // No-op for OFF level
      [AG_LOGLEVEL.FATAL]: (message: string | AgLogMessage) => this.fatal(message),
      [AG_LOGLEVEL.ERROR]: (message: string | AgLogMessage) => this.error(message),
      [AG_LOGLEVEL.WARN]: (message: string | AgLogMessage) => this.warn(message),
      [AG_LOGLEVEL.INFO]: (message: string | AgLogMessage) => this.info(message),
      [AG_LOGLEVEL.DEBUG]: (message: string | AgLogMessage) => this.debug(message),
      [AG_LOGLEVEL.TRACE]: (message: string | AgLogMessage) => this.trace(message),
    };
  }
}
