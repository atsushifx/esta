// src: errors/TupleResult.ts
// @(#) : utility functions for tuple-based error handling
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Error codes for tuple result handling
import { ERROR_CODES } from '../../shared/constants';
// Type definition for tuple result pattern
import type { TupleResult } from '../../shared/types';
// ErrorResult class for error handling
import { ErrorResult } from './ErrorResult';

/**
 * Converts a Promise to a tuple result format [result, error]
 * @param promise - The promise to convert
 * @returns A tuple with either [result, undefined] or [undefined, error]
 */
export const toTupleResult = async <T>(
  promise: Promise<T>,
): Promise<TupleResult<T>> => {
  try {
    const result = await promise;
    return [result, undefined];
  } catch (error) {
    const errorResult = error instanceof ErrorResult
      ? error
      : new ErrorResult(ERROR_CODES.PROMISE_REJECTED, error instanceof Error ? error.message : String(error));
    return [undefined, errorResult];
  }
};

/**
 * Wraps a callback-based function to return a Promise with tuple result
 * @param fn - Callback-based function to wrap
 * @returns Promise resolving to tuple result
 */
export const wrapCallback = <T>(
  fn: (callback: (error: Error | null, result?: T) => void) => void,
): Promise<TupleResult<T>> => {
  return new Promise((resolve) => {
    fn((error, result) => {
      if (error) {
        const errorResult = new ErrorResult(ERROR_CODES.CALLBACK_ERROR, error.message);
        resolve([undefined, errorResult]);
      } else {
        resolve([result as T, undefined]);
      }
    });
  });
};
