// src/plugins/logger/E2eMockLogger.ts
// @(#) : E2E Mock Logger Implementation with Test ID Encapsulation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Node.js built-in modules
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';

// internal modules
import { MockLogger } from './MockLogger';

// types
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLoggerFunction, AgLoggerMap, AgTLogLevel } from '../../../shared/types';

/**
 * Mock logger for E2E testing that supports parallel test execution.
 * Uses a Map to bind testId to MockLogger instances for complete isolation.
 * Each test gets its own MockLogger instance for thread-safe parallel execution.
 */
export class E2eMockLogger {
  private testIdentifier: string;
  private currentTestId: string | null;
  private mockLoggers: Map<string, MockLogger>;

  constructor(identifier?: string) {
    const trimmedIdentifier = typeof identifier === 'string' ? identifier.trim() : '';
    this.testIdentifier = trimmedIdentifier || 'E2eDefault';
    this.currentTestId = null;
    this.mockLoggers = new Map<string, MockLogger>();
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
  getCurrentTestId(): string | null {
    return this.currentTestId;
  }

  /**
   * Start a new test with the given ID.
   * Creates a new MockLogger instance and binds it to the testId.
   */
  startTest(testId: string): void {
    if (!testId || typeof testId !== 'string') {
      throw new Error('testId is required and must be a non-empty string');
    }

    // Create new MockLogger instance for this test
    this.mockLoggers.set(testId, new MockLogger());
    this.currentTestId = testId;
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
  fatal(message: string): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.fatal(message);
  }

  error(message: string): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.error(message);
  }

  warn(message: string): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.warn(message);
  }

  info(message: string): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.info(message);
  }

  debug(message: string): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.debug(message);
  }

  trace(message: string): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.trace(message);
  }

  /**
   * Get the MockLogger instance for the current test.
   * Validates that there is an active test before returning.
   */
  private getCurrentMockLogger(): MockLogger {
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
  getMessages(logLevel: AgTLogLevel): string[] {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getMessages(logLevel);
  }

  getLastMessage(logLevel: AgTLogLevel): string | null {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getLastMessage(logLevel);
  }

  clearMessages(logLevel: AgTLogLevel): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.clearMessages(logLevel);
  }

  // Error-specific convenience methods
  getErrorMessages(): string[] {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getErrorMessages();
  }

  getLastErrorMessage(): string | null {
    const mockLogger = this.getCurrentMockLogger();
    return mockLogger.getLastErrorMessage();
  }

  clearErrorMessages(): void {
    const mockLogger = this.getCurrentMockLogger();
    mockLogger.clearErrorMessages();
  }

  /**
   * Get all messages for all log levels.
   */
  getAllMessages(): { [K in keyof typeof AG_LOGLEVEL]: string[] } {
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
    return (formattedLogMessage: string): void => {
      const mockLogger = this.getCurrentMockLogger();
      mockLogger.info(formattedLogMessage);
    };
  }

  /**
   * Create AgLoggerMap for the current test.
   * This provides level-specific logging functions.
   */
  createLoggerMap(): AgLoggerMap {
    return {
      [AG_LOGLEVEL.OFF]: () => {},
      [AG_LOGLEVEL.FATAL]: (message: string) => this.fatal(message),
      [AG_LOGLEVEL.ERROR]: (message: string) => this.error(message),
      [AG_LOGLEVEL.WARN]: (message: string) => this.warn(message),
      [AG_LOGLEVEL.INFO]: (message: string) => this.info(message),
      [AG_LOGLEVEL.DEBUG]: (message: string) => this.debug(message),
      [AG_LOGLEVEL.TRACE]: (message: string) => this.trace(message),
    };
  }
}

/**
 * Utility function to create a unique test ID for parallel test execution.
 * Uses timestamp and random string to guarantee uniqueness across all test runs.
 *
 * @param identifier - Can be app name, test file basename, or custom identifier
 * @returns Unique test ID in format: {identifier}-{timestamp}-{randomString}
 *
 * @example
 * // Using app name
 * createTestId('ag-logger') // → 'ag-logger-1643723400-abc123'
 *
 * // Using test file path
 * createTestId(__filename) // → 'AgLogger.spec-1643723400-def456'
 *
 * // Using custom identifier
 * createTestId('integration-test') // → 'integration-test-1643723400-ghi789'
 */
export const createTestId = (identifier: string = 'test'): string => {
  const timestamp = Date.now();
  const randomString = randomUUID().replace(/-/g, '').substring(0, 8).toLowerCase();

  // If identifier looks like a file path, extract basename without extension
  if (identifier.includes('/') || identifier.includes('\\') || identifier.includes('.')) {
    const fileBasename = basename(identifier, '.ts').replace('.spec', '').replace('.test', '');
    return `${fileBasename}-${timestamp}-${randomString}`;
  }

  return `${identifier}-${timestamp}-${randomString}`;
};
