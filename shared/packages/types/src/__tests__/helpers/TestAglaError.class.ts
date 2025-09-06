// src: src/__tests__/helpers/TestAglaError.class.ts
// @(#) : Test utility class for AglaError testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Type definitions
import { AglaError, type AglaErrorOptions } from '../../../types/AglaError.types.js';

/**
 * Test utility class extending AglaError for testing purposes.
 * Provides concrete implementation of the abstract AglaError class with test-specific functionality.
 */
export class TestAglaError extends AglaError {
  /**
   * Creates a new TestAglaError instance for testing.
   * @param errorType - The error type identifying the specific type of error
   * @param message - The human-readable error message
   * @param options - Optional configuration including code, severity, timestamp, and context
   */
  constructor(
    errorType: string,
    message: string,
    options?: AglaErrorOptions,
  ) {
    super(errorType, message, options);
  }

  /**
   * Creates a new TestAglaError that chains this error with a causing error.
   * Uses the parent AglaError chain method and casts the result to TestAglaError.
   * @param cause - The error that caused this error
   * @returns New TestAglaError instance with chained error information
   */
  chain(cause: Error): TestAglaError {
    return super.chain(cause) as TestAglaError;
  }
}
