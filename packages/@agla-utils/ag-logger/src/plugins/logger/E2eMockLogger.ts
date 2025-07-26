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

// types
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLoggerFunction, AgLoggerMap, AgTLogLevel } from '../../../shared/types';

/**
 * Mock logger for E2E testing that captures log messages in arrays.
 * Each instance is tied to a specific test identifier for complete isolation.
 */
export class E2eMockLogger {
  private testId: string | null;
  private messages: string[][] = [
    [], // OFF (0) - not used for actual logging
    [], // FATAL (1)
    [], // ERROR (2)
    [], // WARN (3)
    [], // INFO (4)
    [], // DEBUG (5)
    [], // TRACE (6)
  ];

  constructor(identifier: string) {
    if (typeof identifier !== 'string') {
      throw new Error('identifier is required and must be a string');
    }
    const trimmedIdentifier = identifier.trim();
    const finalIdentifier = trimmedIdentifier || 'default';
    this.testId = createTestId(finalIdentifier);
    // Ensure clean state on instantiation
    this.cleanup();
  }

  /**
   * Get the test ID for this logger instance.
   */
  getTestId(): string {
    return this.testId ?? '';
  }

  /**
   * Get the current test ID for this logger instance.
   */
  getCurrentTestId(): string | null {
    return this.testId;
  }

  /**
   * Start a new test with the given ID.
   */
  startTest(testId: string): void {
    if (!testId || typeof testId !== 'string') {
      throw new Error('testId is required and must be a non-empty string');
    }
    this.testId = testId;
    this.cleanup();
  }

  /**
   * End the current test.
   */
  endTest(testId?: string): void {
    if (testId && !this.testId?.includes(testId)) {
      throw new Error(`Cannot end test '${testId}': current test is '${this.testId}'`);
    }
    this.testId = null;
  }

  // Logger methods
  fatal(message: string): void {
    this.validateActiveTest();
    this.messages[AG_LOGLEVEL.FATAL].push(message);
  }

  error(message: string): void {
    this.validateActiveTest();
    this.messages[AG_LOGLEVEL.ERROR].push(message);
  }

  warn(message: string): void {
    this.validateActiveTest();
    this.messages[AG_LOGLEVEL.WARN].push(message);
  }

  info(message: string): void {
    this.validateActiveTest();
    this.messages[AG_LOGLEVEL.INFO].push(message);
  }

  debug(message: string): void {
    this.validateActiveTest();
    this.messages[AG_LOGLEVEL.DEBUG].push(message);
  }

  trace(message: string): void {
    this.validateActiveTest();
    this.messages[AG_LOGLEVEL.TRACE].push(message);
  }

  /**
   * Validate that there is an active test before logging.
   */
  private validateActiveTest(): void {
    if (!this.testId) {
      throw new Error('No active test. Call startTest() before logging.');
    }
  }

  // Query methods
  getMessages(logLevel: AgTLogLevel): string[] {
    return [...this.messages[logLevel]];
  }

  getLastMessage(logLevel: AgTLogLevel): string | null {
    const messages = this.getMessages(logLevel);
    return messages[messages.length - 1] || null;
  }

  clearMessages(logLevel: AgTLogLevel): void {
    this.messages[logLevel] = [];
  }

  // Error-specific convenience methods
  getErrorMessages(): string[] {
    return this.getMessages(AG_LOGLEVEL.ERROR);
  }

  getLastErrorMessage(): string | null {
    return this.getLastMessage(AG_LOGLEVEL.ERROR);
  }

  clearErrorMessages(): void {
    this.clearMessages(AG_LOGLEVEL.ERROR);
  }

  /**
   * Get all messages for all log levels.
   */
  getAllMessages(): { [K in keyof typeof AG_LOGLEVEL]: string[] } {
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

  /**
   * Clean up all messages for this test.
   */
  cleanup(): void {
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

  /**
   * Create AgLoggerFunction for this test.
   * This can be used as a plugin for ag-logger.
   */
  createLoggerFunction(): AgLoggerFunction {
    return (formattedLogMessage: string): void => {
      // Use info level as default for generic logger function
      this.info(formattedLogMessage);
    };
  }

  /**
   * Create AgLoggerMap for this test.
   * This provides level-specific logging functions.
   */
  createLoggerMap(): AgLoggerMap {
    return {
      [AG_LOGLEVEL.OFF]: () => {}, // No-op for OFF level
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
