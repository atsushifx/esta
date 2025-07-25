// src/plugins/logger/E2eMockLogger.ts
// @(#) : E2E Mock Logger Implementation with Parallel Test Support
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
 * Supports both single-test mode and parallel test execution with test IDs.
 *
 * This class merges the functionality of the original E2eMockLogger and
 * E2EMockLoggerWithTestId to provide a unified solution for all testing scenarios.
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

  private testBuffers: Map<string, string[][]> = new Map();
  private currentTestId: string | null = null;

  constructor(testId: string) {
    this.startTest(testId);
  }

  /**
   * Start a new test with the given test ID for parallel execution.
   * Creates an independent buffer for this test.
   */
  startTest(testId: string): void {
    this.currentTestId = testId;
    this.testBuffers.set(testId, [
      [], // OFF (0) - not used for actual logging
      [], // FATAL (1)
      [], // ERROR (2)
      [], // WARN (3)
      [], // INFO (4)
      [], // DEBUG (5)
      [], // TRACE (6)
    ]);
  }

  /**
   * End the test and clean up its buffer.
   * Removes all log data for the specified test ID.
   */
  endTest(testId: string): void {
    this.testBuffers.delete(testId);
    if (this.currentTestId === testId) {
      this.currentTestId = null;
    }
  }

  /**
   * Get the appropriate buffer for logging.
   * Returns test-specific buffer if testId is active, otherwise default buffer.
   */
  private getBuffer(): string[][] {
    if (this.currentTestId) {
      const buffer = this.testBuffers.get(this.currentTestId);
      if (!buffer) {
        throw new Error(`Buffer not found for test ID: ${this.currentTestId}`);
      }
      return buffer;
    }
    return this.messages;
  }

  /**
   * Check if logging is allowed in the current context.
   * Always requires an active test for E2E scenarios.
   */
  private checkLoggingAllowed(): void {
    if (!this.currentTestId) {
      throw new Error('No active test. Call startTest() before logging.');
    }
  }

  // Logger methods
  fatal(message: string): void {
    this.checkLoggingAllowed();
    const buffer = this.getBuffer();
    buffer[AG_LOGLEVEL.FATAL].push(message);
  }

  error(message: string): void {
    this.checkLoggingAllowed();
    const buffer = this.getBuffer();
    buffer[AG_LOGLEVEL.ERROR].push(message);
  }

  warn(message: string): void {
    this.checkLoggingAllowed();
    const buffer = this.getBuffer();
    buffer[AG_LOGLEVEL.WARN].push(message);
  }

  info(message: string): void {
    this.checkLoggingAllowed();
    const buffer = this.getBuffer();
    buffer[AG_LOGLEVEL.INFO].push(message);
  }

  debug(message: string): void {
    this.checkLoggingAllowed();
    const buffer = this.getBuffer();
    buffer[AG_LOGLEVEL.DEBUG].push(message);
  }

  trace(message: string): void {
    this.checkLoggingAllowed();
    const buffer = this.getBuffer();
    buffer[AG_LOGLEVEL.TRACE].push(message);
  }

  // Query methods
  getMessages(logLevel: AgTLogLevel, testId?: string): string[] {
    if (testId) {
      const buffer = this.testBuffers.get(testId);
      if (!buffer) {
        throw new Error(`Buffer not found for test ID: ${testId}`);
      }
      return [...buffer[logLevel]];
    }

    const buffer = this.getBuffer();
    return [...buffer[logLevel]];
  }

  getLastMessage(logLevel: AgTLogLevel, testId?: string): string | null {
    const messages = this.getMessages(logLevel, testId);
    return messages[messages.length - 1] || null;
  }

  clearMessages(logLevel: AgTLogLevel, testId?: string): void {
    if (testId) {
      const buffer = this.testBuffers.get(testId);
      if (!buffer) {
        throw new Error(`Buffer not found for test ID: ${testId}`);
      }
      buffer[logLevel] = [];
      return;
    }

    const buffer = this.getBuffer();
    buffer[logLevel] = [];
  }

  /**
   * Get all messages for all log levels for the specified test or current context.
   */
  getAllMessages(testId?: string): { [K in keyof typeof AG_LOGLEVEL]: string[] } {
    let buffer: string[][];

    if (testId) {
      const testBuffer = this.testBuffers.get(testId);
      if (!testBuffer) {
        throw new Error(`Buffer not found for test ID: ${testId}`);
      }
      buffer = testBuffer;
    } else {
      buffer = this.getBuffer();
    }

    return {
      OFF: [...buffer[AG_LOGLEVEL.OFF]],
      FATAL: [...buffer[AG_LOGLEVEL.FATAL]],
      ERROR: [...buffer[AG_LOGLEVEL.ERROR]],
      WARN: [...buffer[AG_LOGLEVEL.WARN]],
      INFO: [...buffer[AG_LOGLEVEL.INFO]],
      DEBUG: [...buffer[AG_LOGLEVEL.DEBUG]],
      TRACE: [...buffer[AG_LOGLEVEL.TRACE]],
    };
  }

  /**
   * Check if a test is currently active.
   */
  hasActiveTest(): boolean {
    return this.currentTestId !== null;
  }

  /**
   * Get the current test ID.
   */
  getCurrentTestId(): string | null {
    return this.currentTestId;
  }

  /**
   * Get list of all active test IDs.
   */
  getActiveTestIds(): string[] {
    return Array.from(this.testBuffers.keys());
  }

  /**
   * Clean up all test buffers and reset to single-test mode.
   * Useful for afterEach cleanup in tests.
   */
  cleanup(): void {
    this.testBuffers.clear();
    this.currentTestId = null;
    // Reset default buffer
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
   * Create AgLoggerFunction for the current test or default context.
   * This can be used as a plugin for ag-logger.
   */
  createLoggerFunction(): AgLoggerFunction {
    return (formattedLogMessage: string): void => {
      // Use info level as default for generic logger function
      this.info(formattedLogMessage);
    };
  }

  /**
   * Create AgLoggerMap for the current test or default context.
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

  // Legacy methods for backward compatibility
  getErrorMessages(testId?: string): string[] {
    return this.getMessages(AG_LOGLEVEL.ERROR, testId);
  }

  getLastErrorMessage(testId?: string): string | null {
    return this.getLastMessage(AG_LOGLEVEL.ERROR, testId);
  }

  clearErrorMessages(testId?: string): void {
    this.clearMessages(AG_LOGLEVEL.ERROR, testId);
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

/**
 * Convenience function to create test ID from the current test file.
 * Uses import.meta.url or __filename to automatically determine the test file name.
 *
 * @example
 * // In a test file named 'AgLogger.integration.spec.ts'
 * const testId = createTestIdFromFile(import.meta.url); // → 'AgLogger.integration-{uuid}'
 */
export const createTestIdFromFile = (fileUrl: string): string => {
  return createTestId(fileUrl);
};
