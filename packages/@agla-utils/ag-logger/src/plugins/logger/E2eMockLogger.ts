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
  private testIdentifier: string;
  private currentTestId: string | null;
  private mockLoggers: Map<string, AgMockBufferLogger>;

  constructor(identifier?: string) {
    const trimmedIdentifier = typeof identifier === 'string' ? identifier.trim() : '';
    this.testIdentifier = trimmedIdentifier ? getNormalizedBasename(trimmedIdentifier) : 'e2e-default';
    this.currentTestId = null;
    this.mockLoggers = new Map<string, AgMockBufferLogger>();
  }

  /**
   * Get the test identifier for this logger instance.
   */
  getTestIdentifier(): string {
    return this.testIdentifier;
  }

  /**
   * Get the current test ID for this logger instance.
   */
  getCurrentTestId(): string | AgLogMessage | null {
    return this.currentTestId;
  }

  /**
   * Start a new test with the given ID.
   * Creates a new MockLogger instance and binds it to the testId.
   */
  startTest(testId: string = ''): void {
    const trimmedTestId = testId.trim();
    const finalTestId = trimmedTestId === ''
      ? createTestId(this.testIdentifier)
      : trimmedTestId;

    // Create new MockLogger instance for this test
    this.mockLoggers.set(finalTestId, new MockLogger.buffer());
    this.currentTestId = finalTestId;
  }

  /**
   * End the current test.
   * Removes the MockLogger instance from map and cleans up resources.
   */
  endTest(testId?: string): void {
    if (testId) {
      if (testId !== this.currentTestId) {
        throw new Error(`Cannot end test '${testId}': current test is '${this.currentTestId}'`);
      }
      // Remove MockLogger instance from map
      this.mockLoggers.delete(testId);
      this.currentTestId = null;
    } else {
      // End current test if no specific testId provided
      if (this.currentTestId) {
        this.mockLoggers.delete(this.currentTestId);
        this.currentTestId = null;
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

  /**
   * Get the MockLogger instance for the current test.
   * Validates that there is an active test before returning.
   */
  private getCurrentMockLogger(): AgMockBufferLogger {
    if (!this.currentTestId) {
      throw new Error('No active test. Call startTest() before logging.');
    }

    const mockLogger = this.mockLoggers.get(this.currentTestId);
    if (!mockLogger) {
      throw new Error(`MockLogger not found for test ID: ${this.currentTestId}`);
    }

    return mockLogger;
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
   * Create AgLoggerFunction for the current test.
   * This can be used as a plugin for ag-logger.
   */
  createLoggerFunction(): AgLoggerFunction {
    return (formattedLogMessage: AgFormattedLogMessage): void => {
      const mockLogger = this.getCurrentMockLogger();
      mockLogger.info(formattedLogMessage);
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
