// src/internal/types/AgMockConstructor.class.ts
// @(#) : AgMockConstructor Class and Type Definitions
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgFormatFunction, AgFormattedLogMessage, AgLogMessage } from '../../shared/types';

/**
 * Format routine function type that processes AgLogMessage and returns formatted output.
 * Can return either a string, AgLogMessage object, or throw an error.
 */
export type AgFormatRoutine = (msg: AgLogMessage) => AgFormattedLogMessage | never;

/**
 * Type defining the contract for mock formatter constructors.
 * Represents a constructor function that creates mock formatter instances with statistics tracking.
 */
export type AgMockConstructor = {
  /**
   * Static marker property to identify mock constructors.
   * Used by type guards and automatic instantiation logic.
   */
  readonly __isMockConstructor: true;

  /**
   * Constructor function that creates instances with execute, getStats, and reset methods.
   * The routine parameter is optional - if not provided, a default passthrough routine will be used.
   */
  new(routine?: AgFormatRoutine): {
    execute: AgFormatFunction;
    getStats(): { callCount: number; lastMessage: AgLogMessage | null };
    reset(): void;
  };
};

/**
 * Union type representing valid formatter inputs.
 * Can be either a standard format function or a mock constructor.
 */
export type AgFormatterInput = AgFormatFunction | AgMockConstructor;
