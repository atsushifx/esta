// src: errors/__tests__/TupleResult.spec.ts
// @(#) : unit tests for TupleResult type and utility functions
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Vitest testing framework
import { describe, expect, it } from 'vitest';
// TupleResult type definition
import type { TupleResult } from '../../../shared/types';
// Error codes, classes, and utility functions
import { ERROR_CODES, ErrorResult, toTupleResult, wrapCallback } from '../..';

/**
 * Test suite for TupleResult type and related utility functions
 * Tests tuple-based error handling pattern with [result, error] structure
 */
describe('TupleResult', () => {
  /**
   * Tests for TupleResult type definition
   * Verifies correct tuple structure for success and error cases
   */
  describe('TupleResult type', () => {
    /**
     * Tests for success tuple structure
     */
    describe('success tuple structure', () => {
      it('should define success tuple correctly', () => {
        const successTuple: TupleResult<string> = ['success', undefined];

        expect(successTuple[0]).toBe('success');
        expect(successTuple[1]).toBeUndefined();
      });
    });

    /**
     * Tests for error tuple structure
     */
    describe('error tuple structure', () => {
      it('should define error tuple correctly', () => {
        const error = new ErrorResult(ERROR_CODES.TEST_ERROR, 'Test message');
        const errorTuple: TupleResult<string> = [undefined, error];

        expect(errorTuple[0]).toBeUndefined();
        expect(errorTuple[1]).toBeInstanceOf(ErrorResult);
      });
    });
  });

  /**
   * Tests for toTupleResult utility function
   * Verifies conversion of promises to tuple format
   */
  describe('toTupleResult', () => {
    /**
     * Tests for successful promise conversion
     */
    describe('successful promise conversion', () => {
      it('should convert successful promise to success tuple', async () => {
        const promise = Promise.resolve('success');
        const [result, error] = await toTupleResult(promise);

        expect(result).toBe('success');
        expect(error).toBeUndefined();
      });
    });

    /**
     * Tests for rejected promise conversion
     */
    describe('rejected promise conversion', () => {
      it('should convert rejected promise to error tuple', async () => {
        const promise = Promise.reject(new Error('Promise failed'));
        const [result, error] = await toTupleResult(promise);

        expect(result).toBeUndefined();
        expect(error).toBeInstanceOf(ErrorResult);
        expect(error?.code).toBe(ERROR_CODES.PROMISE_REJECTED);
        expect(error?.message).toBe('Promise failed');
      });

      it('should handle ErrorResult rejection correctly', async () => {
        const originalError = new ErrorResult(ERROR_CODES.CUSTOM_ERROR, 'Custom message');
        const promise = Promise.reject(originalError);
        const [result, error] = await toTupleResult(promise);

        expect(result).toBeUndefined();
        expect(error).toBe(originalError);
      });

      it('should handle non-Error rejection', async () => {
        const promise = Promise.reject('string error');
        const [result, error] = await toTupleResult(promise);

        expect(result).toBeUndefined();
        expect(error).toBeInstanceOf(ErrorResult);
        expect(error?.message).toBe('string error');
      });
    });
  });

  /**
   * Tests for wrapCallback utility function
   * Verifies conversion of Node.js-style callbacks to tuple format
   */
  describe('wrapCallback', () => {
    /**
     * Tests for successful callback conversion
     */
    describe('successful callback conversion', () => {
      it('should convert successful callback to success tuple', async () => {
        const fn = (callback: (error: Error | null, result?: string) => void) => {
          callback(null, 'success');
        };

        const [result, error] = await wrapCallback(fn);

        expect(result).toBe('success');
        expect(error).toBeUndefined();
      });
    });

    /**
     * Tests for error callback conversion
     */
    describe('error callback conversion', () => {
      it('should convert error callback to error tuple', async () => {
        const fn = (callback: (error: Error | null, result?: string) => void) => {
          callback(new Error('Callback failed'));
        };

        const [result, error] = await wrapCallback(fn);

        expect(result).toBeUndefined();
        expect(error).toBeInstanceOf(ErrorResult);
        expect(error?.code).toBe(ERROR_CODES.CALLBACK_ERROR);
        expect(error?.message).toBe('Callback failed');
      });
    });
  });
});
