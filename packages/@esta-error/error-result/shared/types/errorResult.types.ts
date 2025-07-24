// src: shared/types/errorResult.types.ts
// @(#) : type definitions for ErrorResult
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * JSON representation of an ErrorResult for serialization
 */
export type ErrorResultJSON = {
  name: string;
  code: string;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  recoverable: boolean;
};

/**
 * Options for configuring ErrorResult behavior
 */
export type ErrorResultOptions = {
  recoverable?: boolean;
};
