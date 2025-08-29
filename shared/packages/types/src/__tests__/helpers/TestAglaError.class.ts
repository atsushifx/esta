import { AglaError, type AglaErrorOptions } from '../../../types/AglaError.types.js';

/**
 * Test utility class extending AglaError for testing purposes
 * Provides additional test-specific functionality like error chaining
 */
export class TestAglaError extends AglaError {
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
