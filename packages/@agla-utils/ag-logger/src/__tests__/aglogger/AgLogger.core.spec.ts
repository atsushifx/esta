// src/__tests__/aglogger/AgLogger.core.spec.ts
// @(#) : Core functionality tests for AgLogger - Instance management and basic operations
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Constants
import { DISABLE, ENABLE } from '../../../shared/constants/common.constants';
import { AG_LOGLEVEL } from '../../../shared/types';

// Test target
import { AgLogger, createLogger } from '../../AgLogger.class';

// Test utilities
const mockLogger = vi.fn();
const mockFormatter = vi.fn().mockImplementation((msg) => msg.message ?? msg);

/**
 * 共通のテストセットアップとクリーンアップ
 */
const setupTestEnvironment = (): void => {
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });
};

/**
 * Core AgLogger Functionality Tests
 *
 * @description インスタンス生成、シングルトン管理、基本設定のテスト
 */
/**
 * AgLogger コア機能ユニットテスト
 * @description インスタンス生成/シングルトン/基本プロパティの検証
 */
describe('AgLogger Core Functionality', () => {
  setupTestEnvironment();

  describe('Instance Creation and Management', () => {
    describe('createLogger static method', () => {
      it('should create logger instance', () => {
        const logger = AgLogger.createLogger();
        expect(logger).toBeInstanceOf(AgLogger);
      });

      it('should return same instance on multiple calls', () => {
        const logger1 = AgLogger.createLogger();
        const logger2 = AgLogger.createLogger();
        const logger3 = createLogger();

        expect(logger1).toBe(logger2);
        expect(logger2).toBe(logger3);
      });

      it('should maintain singleton with different parameters', () => {
        const logger1 = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
        const logger2 = AgLogger.createLogger();

        expect(logger1).toBe(logger2);
      });
    });

    describe('getLogger static method', () => {
      it('should return existing instance when available', () => {
        const created = AgLogger.createLogger();
        const retrieved = AgLogger.getLogger();

        expect(created).toBe(retrieved);
      });

      it('should throw error when no instance exists', () => {
        AgLogger.resetSingleton();
        expect(() => AgLogger.getLogger()).toThrow('Logger instance not created. Call createLogger() first.');
      });
    });

    describe('Singleton reset', () => {
      it('should create new instance after reset', () => {
        const instance1 = AgLogger.createLogger();
        AgLogger.resetSingleton();
        const instance2 = AgLogger.createLogger();

        expect(instance1).not.toBe(instance2);
      });
    });
  });

  describe('Configuration Options Processing', () => {
    it('should handle undefined options gracefully', () => {
      const logger = AgLogger.createLogger(undefined);
      expect(logger).toBeInstanceOf(AgLogger);
    });

    it('should handle empty options object', () => {
      const logger = AgLogger.createLogger({});
      expect(logger).toBeInstanceOf(AgLogger);
    });

    it('should persist settings across instances', () => {
      const logger1 = AgLogger.createLogger();
      const logger2 = AgLogger.getLogger();

      logger1.logLevel = AG_LOGLEVEL.ERROR;
      logger1.setVerbose = ENABLE;

      expect(logger2.logLevel).toBe(AG_LOGLEVEL.ERROR);
      expect(logger2.isVerbose).toBe(ENABLE);
    });
  });

  describe('Property Delegation', () => {
    it('should delegate verbose property access to config', () => {
      const logger = AgLogger.createLogger();
      expect(logger.isVerbose).toBe(DISABLE);
    });

    it('should delegate verbose property updates to config', () => {
      const logger = AgLogger.createLogger();
      logger.setVerbose = ENABLE;
      expect(logger.isVerbose).toBe(ENABLE);
    });

    it('should delegate log level property access to config', () => {
      const logger = AgLogger.createLogger();
      expect(logger.logLevel).toBe(AG_LOGLEVEL.OFF);
    });

    it('should delegate log level property updates to config', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;
      expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
    });
  });
});
