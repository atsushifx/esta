// src/plugins/logger/E2eMockLogger.ts
// @(#) : E2E Mock Logger Implementation with Test ID Encapsulation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// internal modules
import { createTestId, getNormalizedBasename } from '../../utils/testIdUtils';
import { MockLogger } from './MockLogger';

// types
import { AG_LOGLEVEL } from '../../../shared/types';
import type {
  AgFormattedLogMessage,
  AgLoggerFunction,
  AgLoggerInterface,
  AgLoggerMap,
  AgLogLevel,
  AgLogMessage,
  AgLogMessageCollection,
} from '../../../shared/types';
import type { AgMockBufferLogger } from './MockLogger';

/**
 * Mock logger for E2E testing that supports parallel test execution.
 * Uses a Map to bind testId to MockLogger instances for complete isolation.
 * Each test gets its own MockLogger instance for thread-safe parallel execution.
 */
export class E2eMockLogger implements AgLoggerInterface {
  private _testIdentifier: string;
  private _currentTestId: string | null;
  private _mockLoggers: Map<string, AgMockBufferLogger>;
  private _defaultLoggerMap: AgLoggerMap | undefined;

  constructor(identifier?: string) {
    const trimmedIdentifier = typeof identifier === 'string' ? identifier.trim() : '';
    this._testIdentifier = trimmedIdentifier ? getNormalizedBasename(trimmedIdentifier) : 'e2e-default';
    this._currentTestId = null;
    this._mockLoggers = new Map<string, AgMockBufferLogger>();
  }

  /**
   * Get the default logger map.
   */
  get defaultLoggerMap(): AgLoggerMap {
    if (!this._defaultLoggerMap) {
      const _mockLogger = this.getCurrentMockLogger();
      this._defaultLoggerMap = _mockLogger.defaultLoggerMap;
    }
    return this._defaultLoggerMap;
  }
  /**
   * Set the default logger map.
   */
  set defaultLoggerMap(value: AgLoggerMap | undefined) {
    this._defaultLoggerMap = value;
  }

  /**
   * Get the current test ID for this logger instance.
   */
  getCurrentTestId(): string | AgLogMessage | null {
    return this._currentTestId;
  }

  /**
   * Get the test identifier for this logger instance.
   */
  getTestIdentifier(): string {
    return this._testIdentifier;
  }

  /**
   * Start a new test with the given ID.
   * Creates a new MockLogger instance and binds it to the testId.
   */
  startTest(testId: string = ''): void {
    const trimmedTestId = testId.trim();
    const finalTestId = trimmedTestId === ''
      ? createTestId(this._testIdentifier)
      : trimmedTestId;

    // Create new MockLogger instance for this test
    this._mockLoggers.set(finalTestId, new MockLogger.buffer());
    this._currentTestId = finalTestId;
  }

  /**
   * End the current test.
   * Removes the MockLogger instance from map and cleans up resources.
   */
  endTest(testId?: string): void {
    if (testId) {
      if (testId !== this._currentTestId) {
        throw new Error(`Cannot end test '${testId}': current test is '${this._currentTestId}'`);
      }
      // Remove MockLogger instance from map
      this._mockLoggers.delete(testId);
      this._currentTestId = null;
    } else {
      // End current test if no specific testId provided
      if (this._currentTestId) {
        this._mockLoggers.delete(this._currentTestId);
        this._currentTestId = null;
      }
    }
  }

  // Logger methods
  fatal(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.FATAL, message);
  }

  error(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.ERROR, message);
  }

  warn(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.WARN, message);
  }

  info(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.INFO, message);
  }

  debug(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.DEBUG, message);
  }

  trace(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.TRACE, message);
  }

  verbose(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.VERBOSE, message);
  }

  log(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.LOG, message);
  }

  /**
   * Default level logger method for special DEFAULT level (-99).
   * Provided for API parity and completeness.
   */
  default(message: AgFormattedLogMessage): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.executeLog(AG_LOGLEVEL.DEFAULT, message);
  }

  // Query methods
  getMessages(logLevel: AgLogLevel): AgLogMessageCollection {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getMessages(logLevel);
  }

  getLastMessage(logLevel: AgLogLevel): string | AgLogMessage | null {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getLastMessage(logLevel);
  }

  clearMessages(logLevel: AgLogLevel): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.clearMessages(logLevel);
  }

  /**
   * Get all messages for all log levels.
   */
  getAllMessages(): { [K in keyof typeof AG_LOGLEVEL]: AgLogMessageCollection } {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getAllMessages();
  }

  /**
   * Clean up all messages for the current test.
   */
  cleanup(): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.clearAllMessages();
  }

  /**
   * Get the total message count for the current test.
   */
  getTotalMessageCount(): number {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getTotalMessageCount();
  }

  /**
   * Get the message count for a specific log level.
   */
  getMessageCount(logLevel: AgLogLevel): number {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getMessageCount(logLevel);
  }

  /**
   * Check if there are any messages for a specific log level.
   */
  hasMessages(logLevel: AgLogLevel): boolean {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.hasMessages(logLevel);
  }

  /**
   * Check if there are any messages for any log level.
   */
  hasAnyMessages(): boolean {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.hasAnyMessages();
  }

  /**
   * Clear all messages for the current test.
   */
  clearAllMessages(): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.clearAllMessages();
  }

  /**
   * Get the logger function for a specific log level.
   */
  getLoggerFunction(logLevel: AgLogLevel = AG_LOGLEVEL.DEFAULT): AgLoggerFunction {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getLoggerFunction(logLevel);
  }

  /**
   * Get the MockLogger instance for the current test.
   * Validates that there is an active test before returning.
   */
  private getCurrentMockLogger(): AgMockBufferLogger {
    if (!this._currentTestId) {
      throw new Error('No active test. Call startTest() before logging.');
    }

    const mockLogger = this._mockLoggers.get(this._currentTestId);
    if (!mockLogger) {
      throw new Error(`MockLogger not found for test ID: ${this._currentTestId}`);
    }

    return mockLogger;
  }

  /**
   * Parse log level from formatted message.
   * Extracts the log level from the formatted message by looking for [LABEL] pattern.
   * Falls back to DEFAULT level if no label is found or if label is not recognized.
   */
  private parseLogLevelFromFormattedMessage(formattedMessage: AgFormattedLogMessage): AgLogLevel {
    // Convert to string if it's not already a string
    const messageStr = typeof formattedMessage === 'string' ? formattedMessage : String(formattedMessage);

    // Extract label from format: "timestamp [LABEL] message"
    const labelMatch = messageStr.match(/\[([A-Z]+)\]/);
    if (!labelMatch) {
      return AG_LOGLEVEL.DEFAULT;
    }

    const label = labelMatch[1] as keyof typeof AG_LOGLEVEL;

    // Check if the label exists in AG_LOGLEVEL enum
    if (label in AG_LOGLEVEL) {
      return AG_LOGLEVEL[label];
    }

    return AG_LOGLEVEL.DEFAULT;
  }

  /**
   * Create AgLoggerFunction for the current test.
   * This can be used as a plugin for ag-logger.
   */
  createLoggerFunction(): AgLoggerFunction {
    return (formattedLogMessage: AgFormattedLogMessage): void => {
      const mockLogger = this.getCurrentMockLogger();

      // Parse log level from formatted message
      // Format: "timestamp [LABEL] message" where LABEL is the log level
      const logLevel = this.parseLogLevelFromFormattedMessage(formattedLogMessage);

      mockLogger.executeLog(logLevel, formattedLogMessage);
    };
  }

  /**
   * Create AgLoggerMap for the current test.
   * This provides level-specific logging functions.
   */
  createLoggerMap(): Partial<AgLoggerMap> {
    return {
      [AG_LOGLEVEL.OFF]: () => {},
      [AG_LOGLEVEL.FATAL]: (message: AgFormattedLogMessage) => this.fatal(message),
      [AG_LOGLEVEL.ERROR]: (message: AgFormattedLogMessage) => this.error(message),
      [AG_LOGLEVEL.WARN]: (message: AgFormattedLogMessage) => this.warn(message),
      [AG_LOGLEVEL.INFO]: (message: AgFormattedLogMessage) => this.info(message),
      [AG_LOGLEVEL.DEBUG]: (message: AgFormattedLogMessage) => this.debug(message),
      [AG_LOGLEVEL.TRACE]: (message: AgFormattedLogMessage) => this.trace(message),
      // logger for special log level
      [AG_LOGLEVEL.VERBOSE]: (message: AgFormattedLogMessage) => this.verbose(message),
      [AG_LOGLEVEL.LOG]: (message: AgFormattedLogMessage) => this.log(message),
      [AG_LOGLEVEL.DEFAULT]: (message: AgFormattedLogMessage) => this.default(message),
    };
  }
}
