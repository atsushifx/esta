// src/plugins/logger/NullLogger.ts
// @(#) : Null Logger Implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgLoggerFunction } from '../../../shared/types/AgLogger.interface';

/**
 * Null logger function that performs no operations.
 * Used to disable logging at specific levels without side effects.
 */
export const NullLogger: AgLoggerFunction = () => {
  // Do nothing - null logger implementation
};

export default NullLogger;
