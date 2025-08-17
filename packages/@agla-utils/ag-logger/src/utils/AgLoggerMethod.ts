// src/utils/AgLoggerMethod.ts
// @(#) : Utility function to bind logger methods to class instances based on AG_LOGLEVEL_VALUES
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { AG_LOGLEVEL_KEYS } from '../../shared/types';
import type { AgFormattedLogMessage } from '../../shared/types';

/**
 * Logger method type definition
 */
type LoggerMethod = (message: AgFormattedLogMessage) => void;

/**
 * Interface defining all required logger methods (excluding OFF level)
 * (rule: consistent-type-definitions に合わせて type で定義)
 */
export type AgLoggerMethodsInterface = {
  fatal(message: AgFormattedLogMessage): void;
  error(message: AgFormattedLogMessage): void;
  warn(message: AgFormattedLogMessage): void;
  info(message: AgFormattedLogMessage): void;
  debug(message: AgFormattedLogMessage): void;
  trace(message: AgFormattedLogMessage): void;
  verbose(message: AgFormattedLogMessage): void;
  log(message: AgFormattedLogMessage): void;
  default(message: AgFormattedLogMessage): void;
  [key: string]: LoggerMethod | unknown;
};

// (unused) LoggerInstance 型は未使用のため削除

/**
 * Binds logger methods to a class instance based on AG_LOGLEVEL_KEYS.
 * Only binds methods that exist on the target instance.
 *
 * @param instance - The class instance to bind logger methods to
 * @returns The instance with bound logger methods
 *
 * @example
 * ```typescript
 * class MyClass {
 *   info(message: AgFormattedLogMessage) { console.log(message); }
 *   debug(message: AgFormattedLogMessage) { console.log(message); }
 *   // warn method doesn't exist
 * }
 *
 * const instance = new MyClass();
 * const boundInstance = bindLoggerMethods(instance);
 * // Only 'info' and 'debug' methods will be bound
 * ```
 */
export const bindLoggerMethods = <T extends Partial<AgLoggerMethodsInterface>>(instance: T): T => {
  AG_LOGLEVEL_KEYS
    .map((levelKey) => levelKey.toLowerCase()) // map: create method names
    .filter((methodName) => typeof instance[methodName] === 'function') // filter: only existing methods
    .forEach((methodName) => { // forEach: bind methods (side effect allowed)
      (instance as Record<string, unknown>)[methodName] = (instance[methodName] as LoggerMethod).bind(instance);
    });

  return instance;
};
