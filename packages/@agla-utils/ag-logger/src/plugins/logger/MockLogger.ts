// src/plugins/logger/MockLogger.ts
// @(#) : Mock Logger for Unit and Integration Testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLoggerFunction, AgLoggerMap, AgLogLevel } from '../../../shared/types';

/**
 * Universal mock logger for unit and integration testing.
 * Provides message capture and verification capabilities for all test types.
 *
 * Features:
 * - Fast execution for unit and integration tests
 * - Component interaction verification
 * - Synchronous operations only
 * - Thread-safe for single-threaded test scenarios
 * - Auto-configured loggerMap for seamless integration
 */
export class MockLogger {
  private _messages: string[][] = [
    [], // OFF (0) - not used for actual logging
    [], // FATAL (1)
    [], // ERROR (2)
    [], // WARN (3)
    [], // INFO (4)
    [], // DEBUG (5)
    [], // TRACE (6)
  ];

  private _loggerMap: AgLoggerMap;
  private _defaultLoggerFunction: AgLoggerFunction;

  constructor() {
    // Auto-create loggerMap with level-specific functions
    this._loggerMap = this.createLoggerMap();
    this._defaultLoggerFunction = this.createLoggerFunction();
  }

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

  // Logger methods - use loggerMap functions for consistency
  fatal(message: string): void {
    this._loggerMap[AG_LOGLEVEL.FATAL](message);
  }

  error(message: string): void {
    this._loggerMap[AG_LOGLEVEL.ERROR](message);
  }

  warn(message: string): void {
    this._loggerMap[AG_LOGLEVEL.WARN](message);
  }

  info(message: string): void {
    this._loggerMap[AG_LOGLEVEL.INFO](message);
  }

  debug(message: string): void {
    this._loggerMap[AG_LOGLEVEL.DEBUG](message);
  }

  trace(message: string): void {
    this._loggerMap[AG_LOGLEVEL.TRACE](message);
  }

  // Query methods
  getMessages(logLevel: AgLogLevel): string[] {
    this.validateLogLevel(logLevel);
    return [...this._messages[logLevel]];
  }

  getLastMessage(logLevel: AgLogLevel): string | null {
    this.validateLogLevel(logLevel);
    const levelMessages = this._messages[logLevel];
    return levelMessages[levelMessages.length - 1] || null;
  }

  getAllMessages(): { [K in keyof typeof AG_LOGLEVEL]: string[] } {
    return {
      OFF: [...this._messages[AG_LOGLEVEL.OFF]],
      FATAL: [...this._messages[AG_LOGLEVEL.FATAL]],
      ERROR: [...this._messages[AG_LOGLEVEL.ERROR]],
      WARN: [...this._messages[AG_LOGLEVEL.WARN]],
      INFO: [...this._messages[AG_LOGLEVEL.INFO]],
      DEBUG: [...this._messages[AG_LOGLEVEL.DEBUG]],
      TRACE: [...this._messages[AG_LOGLEVEL.TRACE]],
    };
  }

  // Utility methods
  clearMessages(logLevel: AgLogLevel): void {
    this.validateLogLevel(logLevel);
    this._messages[logLevel] = [];
  }

  clearAllMessages(): void {
    this._messages = [
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
    return this._messages[logLevel].length;
  }

  getTotalMessageCount(): number {
    return this._messages.reduce((total, levelMessages) => total + levelMessages.length, 0);
  }

  hasMessages(logLevel: AgLogLevel): boolean {
    this.validateLogLevel(logLevel);
    return this._messages[logLevel].length > 0;
  }

  hasAnyMessages(): boolean {
    return this._messages.some((levelMessages) => levelMessages.length > 0);
  }

  /**
   * Create AgLoggerFunction for testing.
   * This can be used as a plugin for ag-logger.
   *
   * @param defaultLevel - The log level to use for messages. Defaults to INFO.
   */
  createLoggerFunction(defaultLevel: AgLogLevel = AG_LOGLEVEL.INFO): AgLoggerFunction {
    this.validateLogLevel(defaultLevel);

    // Return a function that directly pushes to the specified level's buffer
    return (formattedLogMessage: string): void => {
      if (defaultLevel === AG_LOGLEVEL.OFF) {
        // No-op for OFF level
        return;
      }
      this._messages[defaultLevel].push(formattedLogMessage);
    };
  }

  /**
   * Get the auto-configured loggerMap for direct use in tests.
   * @returns The pre-configured AgLoggerMap
   */
  getLoggerMap(): AgLoggerMap {
    return this._loggerMap;
  }

  /**
   * Get the default logger function for direct use in tests.
   * @returns The pre-configured default AgLoggerFunction
   */
  getDefaultLoggerFunction(): AgLoggerFunction {
    return this._defaultLoggerFunction;
  }

  /**
   * Create AgLoggerMap for testing.
   * This provides level-specific logging functions using createLoggerFunction.
   */
  createLoggerMap(): AgLoggerMap {
    return {
      [AG_LOGLEVEL.OFF]: this.createLoggerFunction(AG_LOGLEVEL.OFF),
      [AG_LOGLEVEL.FATAL]: this.createLoggerFunction(AG_LOGLEVEL.FATAL),
      [AG_LOGLEVEL.ERROR]: this.createLoggerFunction(AG_LOGLEVEL.ERROR),
      [AG_LOGLEVEL.WARN]: this.createLoggerFunction(AG_LOGLEVEL.WARN),
      [AG_LOGLEVEL.INFO]: this.createLoggerFunction(AG_LOGLEVEL.INFO),
      [AG_LOGLEVEL.DEBUG]: this.createLoggerFunction(AG_LOGLEVEL.DEBUG),
      [AG_LOGLEVEL.TRACE]: this.createLoggerFunction(AG_LOGLEVEL.TRACE),
    };
  }

  // Legacy methods for backward compatibility
  getErrorMessages(): string[] {
    return this.getMessages(AG_LOGLEVEL.ERROR);
  }

  getLastErrorMessage(): string | null {
    return this.getLastMessage(AG_LOGLEVEL.ERROR);
  }

  clearErrorMessages(): void {
    this.clearMessages(AG_LOGLEVEL.ERROR);
  }
}
