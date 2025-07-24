// src: handlers/ErrorResultFactory.ts
// @(#) : factory class for creating ErrorResult instances
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Fatal error handler utility
import { fatalExit } from '@esta-error/error-handler';
// Exit code constants
import { ExitCode } from '@shared/constants';
// ErrorResult class for error handling
import { ErrorResult } from '../errors/ErrorResult';

/**
 * Factory class for creating ErrorResult instances and handling fatal errors
 */
export class ErrorResultFactory {
  /**
   * Creates a recoverable ErrorResult instance
   * @param code - Error code identifier
   * @param message - Error message
   * @param context - Additional context data
   * @returns New ErrorResult instance
   */
  error(code: string, message: string, context?: Record<string, unknown>): ErrorResult {
    return new ErrorResult(code, message, context, { recoverable: true });
  }

  /**
   * Creates a fatal error and exits the process
   * @param code - Error code identifier
   * @param message - Error message
   * @param _context - Additional context data (unused)
   * @returns Never returns, exits the process
   */
  fatal(code: string, message: string, _context?: Record<string, unknown>): never {
    return fatalExit(ExitCode.EXEC_FAILURE, message);
  }
}

/**
 * Default instance of ErrorResultFactory for convenient usage
 */
export const errorResult = new ErrorResultFactory();
