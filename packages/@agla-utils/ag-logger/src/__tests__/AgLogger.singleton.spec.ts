// src/__tests__/AgLogger.singleton.spec.ts
// @(#) : Unit tests for AgLogger singleton pattern management
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../../shared/constants';
import { AG_LOGLEVEL } from '../../shared/types';
import { AgLogger, getLogger } from '../AgLogger.class';

const mockLogger = vi.fn();
const mockFormatter = vi.fn().mockImplementation((msg) => msg.message ?? msg);

describe('AgLogger Singleton Pattern Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  describe('when creating logger instances', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = AgLogger.createLogger();
      const instance2 = AgLogger.createLogger();
      const instance3 = getLogger();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });
  });

  describe('when persisting settings across instances', () => {
    it('should maintain settings across instances', () => {
      const logger1 = AgLogger.createLogger();
      const logger2 = AgLogger.getLogger();

      logger1.logLevel = AG_LOGLEVEL.ERROR;
      logger1.setVerbose = true;

      expect(logger2.logLevel).toBe(AG_LOGLEVEL.ERROR);
      expect(logger2.isVerbose).toBe(true);
    });
  });

  describe('when accessing logger before creation', () => {
    it('should throw AgLoggerError when getLogger called before createLogger', () => {
      AgLogger.resetSingleton();
      expect(() => AgLogger.getLogger()).toThrow(
        AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.INITIALIZATION].LOGGER_NOT_CREATED,
      );
    });
  });

  describe('getLogger convenience function', () => {
    it('should work with custom logger and formatter', () => {
      AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
      const logger = AgLogger.getLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;
      logger.info('test');

      expect(mockLogger).toHaveBeenCalled();
      expect(mockFormatter).toHaveBeenCalled();
    });

    it('should handle invalid options by throwing an error with descriptive message', () => {
      expect(() => {
        // @ts-expect-error: Testing invalid null input
        AgLogger.createLogger(null);
      }).toThrow(AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.VALIDATION].NULL_CONFIGURATION);
    });
  });
});
