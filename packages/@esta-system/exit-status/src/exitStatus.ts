// src/exitStatus.ts
// @(#) : Exit Status Manager Singleton Class
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { EXIT_CODE } from '@shared/constants';

/**
 * Exit status manager that maintains a single exit status across the application.
 *
 * This class uses the singleton pattern to ensure consistent exit status management.
 * Once a non-zero exit status is set, it cannot be overwritten by setting to zero,
 * providing fail-fast behavior for error handling.
 *
 * @example
 * ```typescript
 * // Set exit status on error
 * ExitStatus.set(1);
 *
 * // Get current status
 * const status = ExitStatus.get(); // Returns 1
 *
 * // Reset to success status
 * ExitStatus.reset();
 * const resetStatus = ExitStatus.get(); // Returns 0
 * ```
 */
export class ExitStatus {
  /**
   * Internal exit status storage.
   * @private
   */
  private static _status = 0;

  /**
   * Sets the exit status to a non-zero value.
   *
   * This method only accepts positive non-zero values. Zero values and negative values
   * are ignored. Once a non-zero value is set, subsequent zero values will not override it.
   *
   * @param status - The exit status code to set (must be positive and non-zero)
   *
   * @example
   * ```typescript
   * ExitStatus.set(1);     // Sets status to 1
   * ExitStatus.set(0);     // Ignored - status remains 1
   * ExitStatus.set(-1);    // Ignored - status remains 1
   * ExitStatus.set(2);     // Sets status to 2
   * ```
   */
  static set(status: number): void {
    if (status != EXIT_CODE.SUCCESS && status > 0) {
      ExitStatus._status = status;
    }
  }

  /**
   * Gets the current exit status.
   *
   * @returns The current exit status code (0 for success, non-zero for errors)
   *
   * @example
   * ```typescript
   * const status = ExitStatus.get();
   * if (status !== 0) {
   *   console.error(`Process failed with exit code ${status}`);
   * }
   * ```
   */
  static get(): number {
    return ExitStatus._status;
  }

  /**
   * Resets the exit status to zero (success).
   *
   * This method explicitly clears the exit status, setting it back to the success state.
   * This is the only way to clear a previously set non-zero exit status.
   *
   * @example
   * ```typescript
   * ExitStatus.set(1);     // Set error status
   * ExitStatus.reset();    // Clear to success status
   * console.log(ExitStatus.get()); // Outputs: 0
   * ```
   */
  static reset(): void {
    ExitStatus._status = 0;
  }
}
