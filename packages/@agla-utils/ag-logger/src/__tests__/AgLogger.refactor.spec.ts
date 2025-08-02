// src/__tests__/AgLogger.refactor.spec.ts
// @(#) : AgLogger Refactor Behavior Driven Development Tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AG_LOGLEVEL } from '../../shared/types';
import { AgLogger } from '../AgLogger.class';

describe('AgLogger property delegation to config', () => {
  beforeEach(() => {
    AgLogger.resetSingleton();
  });

  describe('when accessing verbose property through config delegation', () => {
    it('should delegate verbose property access to its config', () => {
      const logger = AgLogger.getLogger();

      expect(logger.isVerbose).toBe(false);
    });

    it('should delegate verbose property updates to its config', () => {
      const logger = AgLogger.getLogger();

      logger.setVerbose(true);

      expect(logger.isVerbose).toBe(true);
    });

    it('should maintain verbose state through config', () => {
      const logger = AgLogger.getLogger();

      logger.setVerbose(true);
      const result = logger.setVerbose();

      expect(result).toBe(true);
    });
  });

  describe('when accessing log level property through config delegation', () => {
    it('should delegate log level property access to its config', () => {
      const logger = AgLogger.getLogger();

      expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.OFF);
    });

    it('should delegate log level property updates to its config', () => {
      const logger = AgLogger.getLogger();

      logger.setLogLevel(AG_LOGLEVEL.INFO);

      expect(logger.getLogLevel()).toBe(AG_LOGLEVEL.INFO);
    });
  });

  describe('when using output level filtering through config delegation', () => {
    it('should use config shouldOutput method for filtering', () => {
      const logger = AgLogger.getLogger();
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      const shouldOutputError = (logger as AgLogger & { isOutputLevel: (level: AG_LOGLEVEL) => boolean }).isOutputLevel(
        AG_LOGLEVEL.ERROR,
      );
      const shouldOutputDebug = (logger as AgLogger & { isOutputLevel: (level: AG_LOGLEVEL) => boolean }).isOutputLevel(
        AG_LOGLEVEL.DEBUG,
      );

      expect(shouldOutputError).toBe(true);
      expect(shouldOutputDebug).toBe(false);
    });
  });

  describe('when using verbose method with config delegation', () => {
    it('should respect config verbose setting in verbose method', () => {
      const logger = AgLogger.getLogger();
      const mockLog = vi.fn();
      (logger as AgLogger & { log: typeof mockLog }).log = mockLog;

      logger.verbose('test message');
      expect(mockLog).not.toHaveBeenCalled();

      logger.setVerbose(true);
      logger.verbose('test message');
      expect(mockLog).toHaveBeenCalledWith('test message');
    });
  });
});
