// src: errors/__tests__/errorResult.spec.ts
// @(#) : unit tests for errorResult singleton instance
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
// Error codes and singleton instance
import { ERROR_CODES, errorResult } from '../..';

/**
 * Test suite for errorResult singleton
 * Tests the default ErrorResultFactory instance for creating errors and handling fatal conditions
 */
describe('errorResult singleton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests for singleton instance existence and structure
   * Verifies that the singleton is properly instantiated and has required methods
   */
  describe('singleton existence', () => {
    /**
     * Tests for basic singleton structure
     */
    describe('basic structure', () => {
      it('should be defined', () => {
        expect(errorResult).toBeDefined();
      });

      it('should have error method', () => {
        expect(errorResult.error).toBeDefined();
        expect(typeof errorResult.error).toBe('function');
      });

      it('should have fatal method', () => {
        expect(errorResult.fatal).toBeDefined();
        expect(typeof errorResult.fatal).toBe('function');
      });
    });
  });

  /**
   * Tests for the error method
   * Verifies creation of recoverable ErrorResult instances through singleton
   */
  describe('error method', () => {
    /**
     * Tests for basic error creation functionality
     */
    describe('basic error creation', () => {
      it('should create ErrorResult instances correctly', () => {
        const error = errorResult.error(ERROR_CODES.TEST_ERROR, 'Test message');

        expect(error.code).toBe(ERROR_CODES.TEST_ERROR);
        expect(error.message).toBe('Test message');
        expect(error.recoverable).toBe(true);
        expect(error.name).toBe('ErrorResult');
        expect(error.timestamp).toBeInstanceOf(Date);
      });
    });

    /**
     * Tests for error creation with context data
     */
    describe('error creation with context', () => {
      it('should create error with context', () => {
        const context = { userId: 123, operation: 'test' };
        const error = errorResult.error(ERROR_CODES.TEST_ERROR, 'Test message', context);

        expect(error.code).toBe(ERROR_CODES.TEST_ERROR);
        expect(error.message).toBe('Test message');
        expect(error.context).toEqual(context);
        expect(error.recoverable).toBe(true);
      });

      it('should create error without context', () => {
        const error = errorResult.error(ERROR_CODES.TEST_ERROR, 'Test message');

        expect(error.code).toBe(ERROR_CODES.TEST_ERROR);
        expect(error.message).toBe('Test message');
        expect(error.context).toBeUndefined();
        expect(error.recoverable).toBe(true);
      });
    });
  });

  /**
   * Tests for the fatal method
   * Verifies fatal error handling and process exit behavior through singleton
   */
  describe('fatal method', () => {
    /**
     * Tests for fatal error processing
     */
    describe('fatal error processing', () => {
      it('should call fatalExit properly', () => {
        expect(() => {
          errorResult.fatal(ERROR_CODES.TEST_ERROR, 'Fatal message');
        }).toThrow('Fatal exit called');

        expect(fatalExit).toHaveBeenCalledWith(1, 'Fatal message');
        expect(fatalExit).toHaveBeenCalledTimes(1);
      });

      it('should call fatalExit with context', () => {
        const context = { error: 'critical', system: 'main' };

        expect(() => {
          errorResult.fatal(ERROR_CODES.TEST_ERROR, 'Fatal message', context);
        }).toThrow('Fatal exit called');

        expect(fatalExit).toHaveBeenCalledWith(1, 'Fatal message');
        expect(fatalExit).toHaveBeenCalledTimes(1);
      });
    });
  });
});
