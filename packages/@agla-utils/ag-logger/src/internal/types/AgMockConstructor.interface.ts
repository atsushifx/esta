// src/internal/types/AgMockConstructor.interface.ts
// @(#) : AgMockConstructor Type Definitions
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgFormatFunction, AgFormattedLogMessage, AgLogMessage } from '../../../shared/types';

/**
 * Format routine function type that processes AgLogMessage and returns formatted output.
 * Can return either a string, AgLogMessage object, or throw an error.
 *
 * @param msg - The log message to format
 * @returns Formatted message or throws error
 *
 * @example
 * ```typescript
 * const messageOnlyRoutine: AgFormatRoutine = (msg: AgLogMessage): string => msg.message;
 * const jsonRoutine: AgFormatRoutine = (msg: AgLogMessage): string => JSON.stringify(msg);
 * const errorRoutine: AgFormatRoutine = (msg: AgLogMessage): never => { throw new Error('Mock error'); };
 * ```
 */
export type AgFormatRoutine = (msg: AgLogMessage) => AgFormattedLogMessage | never;

/**
 * Type defining the contract for mock formatter constructors.
 * Represents a constructor function that creates mock formatter instances with statistics tracking.
 *
 * @example
 * ```typescript
 * class MyMockFormatter {
 *   static readonly __isMockConstructor = true;
 *
 *   constructor(routine: AgFormatRoutine) {
 *     // Implementation
 *   }
 *
 *   execute = (msg: AgLogMessage): AgFormattedLogMessage => {
 *     // Format and track statistics
 *   };
 *
 *   getStats() {
 *     return { callCount: this.callCount, lastMessage: this.lastMessage };
 *   }
 *
 *   reset(): void {
 *     // Clear statistics
 *   }
 * }
 *
 * // Usage as AgMockConstructor
 * const constructor: AgMockConstructor = MyMockFormatter;
 * ```
 */
export type AgMockConstructor = {
  /**
   * Static marker property to identify mock constructors.
   * Used by type guards and automatic instantiation logic.
   */
  readonly __isMockConstructor: true;

  /**
   * Constructor function that creates instances with execute, getStats, and reset methods.
   *
   * @param routine - Format routine function (required)
   */
  new(routine: AgFormatRoutine): {
    /**
     * Execute method that formats messages and tracks statistics.
     *
     * @param msg - Log message to format
     * @returns Formatted log message
     */
    execute: AgFormatFunction;

    /**
     * Get current statistics including call count and last message.
     *
     * @returns Statistics object with callCount and lastMessage
     */
    getStats(): { callCount: number; lastMessage: AgLogMessage | null };

    /**
     * Reset all statistics to initial state.
     */
    reset(): void;
  };
};

/**
 * Union type representing valid formatter inputs.
 * Can be either a standard format function or a mock constructor.
 *
 * @example
 * ```typescript
 * // Function formatter
 * const functionFormatter: AgFormatterInput = (msg: AgLogMessage): string => msg.message;
 *
 * // Mock constructor formatter
 * const mockFormatter: AgFormatterInput = AgMockFormatter;
 * ```
 */
export type AgFormatterInput = AgFormatFunction | AgMockConstructor;
