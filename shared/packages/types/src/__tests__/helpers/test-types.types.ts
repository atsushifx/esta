// src: src/__tests__/helpers/test-types.types.ts
// @(#): Test utility type definitions for AglaError testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Type definitions
import type { AglaErrorContext } from '../../../types/AglaError.types.js';

/**
 * Utility type that makes all readonly properties of T mutable.
 * Useful for testing scenarios where readonly properties need to be modified.
 */
export type _TMutable<T> = {
  -readonly [P in keyof T]: T[P];
};
/**
 * Test buffer type for generic object testing.
 */
export type _TTestBuffer = {
  [key: string]: unknown;
};

/**
 * Test error statistics type for testing error counting scenarios.
 */
export type _TErrorStatistics = {
  [key: string]: number;
};

/**
 * Test type for AglaErrorContext with symbol properties for edge case testing.
 */
export type _TAglaErrorContextWithSymbols = AglaErrorContext & {
  [key: symbol]: unknown;
};
/**
 * Test type for HTTP headers used in testing scenarios.
 */
export type _THttpHeaders = {
  [header: string]: string;
};
