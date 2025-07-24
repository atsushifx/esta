// src: shared/constants/errorCode.constants.ts
// @(#) : error code constants for error-result package
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Predefined error codes for common error scenarios
 */
export const ERROR_CODES = {
  PROMISE_REJECTED: 'PROMISE_REJECTED',
  CALLBACK_ERROR: 'CALLBACK_ERROR',
  CUSTOM_ERROR: 'CUSTOM_ERROR',
  TEST_ERROR: 'TEST_ERROR',
} as const;

/**
 * Type representing all possible error code values
 */
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
