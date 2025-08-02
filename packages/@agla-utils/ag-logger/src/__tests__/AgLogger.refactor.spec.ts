
// src/__tests__/AgLogger.refactor.spec.ts
// @(#) : AgLogger Refactor Behavior Driven Development Tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DISABLE, ENABLE } from '../../shared/constants/common.constants';
import { AG_LOGLEVEL } from '../../shared/types';
import type { AgLogLevel } from '../../shared/types/AgLogLevel.types';
import { AgLogger } from '../AgLogger.class';

type TestableAgLogger = AgLogger & {
  shouldOutput: (level: AgLogLevel) => boolean;
};

describe('AgLogger property delegation to config', () => {
  beforeEach(() => {
    AgLogger.resetSingleton();
  });

  describe('when accessing verbose property through config delegation', () => {
    it('should delegate verbose property access to its config', () => {
      const logger = AgLogger.createLogger();

      expect(logger.isVerbose).toBe(DISABLE);
    });

    it('should delegate verbose property updates to its config', () => {
      const logger = AgLogger.createLogger();

      logger.setVerbose = ENABLE;

      expect(logger.isVerbose).toBe(ENABLE);
    });

    it('should maintain verbose state through config', () => {
      const logger = AgLogger.createLogger();

      logger.setVerbose = ENABLE;
      const result = logger.isVerbose;

      expect(result).toBe(ENABLE);
    });
  });

  describe('when accessing log level property through config delegation', () => {
    it('should delegate log level property access to its config', () => {
      const logger = AgLogger.createLogger();

      expect(logger.logLevel).toBe(AG_LOGLEVEL.OFF);
    });

    it('should delegate log level property updates to its config', () => {
      const logger = AgLogger.createLogger();

      logger.logLevel = AG_LOGLEVEL.INFO;

      expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
    });
  });

  describe('when using output level filtering through config delegation', () => {
    it('should use config shouldOutput method for filtering', () => {
      const testLogger = AgLogger.createLogger() as TestableAgLogger;
      testLogger.logLevel = AG_LOGLEVEL.INFO;

      const shouldOutputError = testLogger.shouldOutput(AG_LOGLEVEL.ERROR);
      const shouldOutputDebug = testLogger.shouldOutput(AG_LOGLEVEL.DEBUG);

      expect(shouldOutputError).toBe(ENABLE);
      expect(shouldOutputDebug).toBe(DISABLE);
    });
  });

  describe('when using verbose method with config delegation', () => {
    it('should respect config verbose setting in verbose method', () => {
      const mockLog = vi.fn();
      const mockFormatter = vi.fn((msg) => msg.message);
      const logger = AgLogger.createLogger({ defaultLogger: mockLog, formatter: mockFormatter });

      logger.verbose('test message');
      expect(mockLog).not.toHaveBeenCalled();

      logger.setVerbose = ENABLE;
      logger.verbose('test message');
      expect(mockLog).toHaveBeenCalledWith('test message');
    });
  });
});
