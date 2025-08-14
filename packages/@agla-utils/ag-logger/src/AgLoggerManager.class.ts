// src/AgLoggerManager.class.ts
// @(#) : AG Logger Manager Singleton Class (Specification Compliant)
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgLoggerFunction, AgLoggerMap, AgLoggerOptions } from '../shared/types/AgLogger.interface';
import { AgLoggerError } from '../shared/types/AgLoggerError.types';
import type { AgLogLevel } from '../shared/types/AgLogLevel.types';
// constants
import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../shared/constants/agErrorMessages';
// plugins
import { NullLogger } from './plugins/logger/NullLogger';

// AgLogger
import { AgLogger } from './AgLogger.class';

/**
 * Singleton manager class providing AgLogger frontend interface.
 * Handles initialization, retrieval, and disposal of AgLogger instances.
 *
 * @description 仕様書準拠: docs/specs/refactor-agLoggerManager.spec.md
 */
export class AgLoggerManager {
  private static instance: AgLoggerManager | undefined;
  private logger: AgLogger | undefined;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Creates and initializes the AgLoggerManager singleton.
   * Must be called before getManager().
   *
   * @param options - Optional AgLogger configuration options
   * @returns The AgLoggerManager singleton instance
   * @throws AgLoggerError if manager already created
   */
  static createManager(options?: AgLoggerOptions): AgLoggerManager {
    if (AgLoggerManager.instance !== undefined) {
      throw new AgLoggerError(
        ERROR_TYPES.INITIALIZATION,
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_ALREADY_CREATED,
      );
    }

    AgLoggerManager.instance = new AgLoggerManager();
    AgLoggerManager.instance.logger = AgLogger.createLogger(options);

    return AgLoggerManager.instance;
  }

  /**
   * Gets the AgLoggerManager singleton instance.
   * Must be called after createManager() or setLogger().
   *
   * @returns The AgLoggerManager singleton instance
   * @throws AgLoggerError if manager not created
   */
  static getManager(): AgLoggerManager {
    if (AgLoggerManager.instance === undefined) {
      throw new AgLoggerError(
        ERROR_TYPES.INITIALIZATION,
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_NOT_CREATED,
      );
    }

    return AgLoggerManager.instance;
  }

  /**
   * Gets the AgLogger instance managed by this manager.
   *
   * @returns The AgLogger instance
   * @throws AgLoggerError if logger not initialized
   */
  getLogger(): AgLogger {
    if (this.logger === undefined) {
      throw new AgLoggerError(
        ERROR_TYPES.INITIALIZATION,
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_NOT_CREATED,
      );
    }
    return this.logger;
  }

  /**
   * Sets an external AgLogger instance for dependency injection.
   * Only allowed when manager is uninitialized.
   *
   * @param logger - The AgLogger instance to inject
   * @throws AgLoggerError if logger already initialized
   */
  setLogger(logger: AgLogger): void {
    if (this.logger !== undefined) {
      throw new AgLoggerError(
        ERROR_TYPES.INITIALIZATION,
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_ALREADY_INITIALIZED,
      );
    }

    this.logger = logger;
  }

  /**
   * Updates the logger configuration by delegating to AgLogger.setLoggerConfig.
   *
   * @param options - Partial logger configuration options to update
   * @throws AgLoggerError if logger not initialized
   */
  /**
   * Updates the logger configuration by delegating to AgLogger.setLoggerConfig.
   *
   * @param options - Partial logger configuration options to update
   * @throws AgLoggerError if logger not initialized
   */
  setLoggerConfig(options: AgLoggerOptions): void {
    if (this.logger === undefined) {
      throw new AgLoggerError(
        ERROR_TYPES.INITIALIZATION,
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_NOT_CREATED,
      );
    }

    this.logger.setLoggerConfig(options);
  }

  /**
   * Binds a logger function to a specific log level by delegating to AgLogger.
   *
   * @param level - The log level to bind the function to
   * @param fn - The logger function to bind
   * @returns true if binding was successful
   * @throws AgLoggerError if logger not initialized
   */
  bindLoggerFunction(level: AgLogLevel, fn: AgLoggerFunction): boolean {
    if (this.logger === undefined) {
      throw new AgLoggerError(
        ERROR_TYPES.INITIALIZATION,
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_NOT_CREATED,
      );
    }

    this.logger.setLoggerFunction(level, fn);
    return true;
  }

  /**
   * Updates the logger map by delegating to AgLogger.setLoggerConfig.
   *
   * @param map - Partial logger map to update
   * @throws AgLoggerError if logger not initialized
   */
  updateLoggerMap(map: Partial<AgLoggerMap<AgLoggerFunction>>): void {
    if (this.logger === undefined) {
      throw new AgLoggerError(
        ERROR_TYPES.INITIALIZATION,
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_NOT_CREATED,
      );
    }

    this.logger.setLoggerConfig({ loggerMap: map });
  }
  /**
   * Sets the default logger for a specific level (legacy method).
   *
   * @param level - The log level to set default logger for
   * @throws AgLoggerError if logger not initialized
   */
  /**
   * Removes the custom logger function for a specific level, reverting to default.
   *
   * @param level - The log level to remove custom logger function for
   * @throws AgLoggerError if logger not initialized
   */
  /**
   * Removes the custom logger function for a specific level, reverting to default.
   *
   * @param level - The log level to remove custom logger function for
   * @throws AgLoggerError if logger not initialized
   */
  removeLoggerFunction(level: AgLogLevel): void {
    if (this.logger === undefined) {
      throw new AgLoggerError(
        ERROR_TYPES.INITIALIZATION,
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_NOT_CREATED,
      );
    }

    // Reset the specified level to use the default logger by setting NullLogger
    this.logger.setLoggerFunction(level, NullLogger);
  }

  static resetSingleton(): void {
    if (AgLoggerManager.instance?.logger !== undefined) {
      AgLogger.resetSingleton();
    }
    AgLoggerManager.instance = undefined;
  }
}
export default AgLoggerManager;
