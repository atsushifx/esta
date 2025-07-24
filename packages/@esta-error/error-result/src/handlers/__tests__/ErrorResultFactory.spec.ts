// src: handlers/__tests__/ErrorResultFactory.spec.ts
// @(#) : unit tests for ErrorResultFactory class
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Vitest testing framework
import { beforeEach, describe, expect, it, vi } from 'vitest';

// モックを事前に設定
vi.mock('@esta-error/error-handler', () => ({
  fatalExit: vi.fn(() => {
    throw new Error('Fatal exit called');
  }),
}));

vi.mock('@shared/constants', () => ({
  ExitCode: {
    EXEC_FAILURE: 1,
  },
}));

// Fatal error handler utility
import { fatalExit } from '@esta-error/error-handler';
// Error codes and factory class
import { ERROR_CODES, ErrorResultFactory } from '../..';

/**
 * Test suite for ErrorResultFactory class
 * Tests factory methods for creating ErrorResult instances and handling fatal errors
 */
describe('ErrorResultFactory', () => {
  let factory: ErrorResultFactory;

  beforeEach(() => {
    factory = new ErrorResultFactory();
    vi.clearAllMocks();
  });

  /**
   * Tests for the error method
   * Verifies creation of recoverable ErrorResult instances
   */
  describe('error method', () => {
    /**
     * Tests for basic error creation functionality
     */
    describe('basic error creation', () => {
      it('should create recoverable error', () => {
        const error = factory.error(ERROR_CODES.TEST_ERROR, 'Test message');

        expect(error.code).toBe(ERROR_CODES.TEST_ERROR);
        expect(error.message).toBe('Test message');
        expect(error.recoverable).toBe(true);
      });
    });

    /**
     * Tests for error creation with context data
     */
    describe('error creation with context', () => {
      it('should create error with context', () => {
        const context = { userId: 123 };
        const error = factory.error(ERROR_CODES.TEST_ERROR, 'Test message', context);

        expect(error.context).toEqual(context);
      });
    });
  });

  /**
   * Tests for the fatal method
   * Verifies fatal error handling and process exit behavior
   */
  describe('fatal method', () => {
    /**
     * Tests for fatal error processing
     */
    describe('fatal error processing', () => {
      it('should call fatalExit with correct parameters', () => {
        expect(() => {
          factory.fatal(ERROR_CODES.TEST_ERROR, 'Fatal message');
        }).toThrow('Fatal exit called');

        expect(fatalExit).toHaveBeenCalledWith(1, 'Fatal message');
      });
    });
  });
});
