// src/__tests__/AgLogger.logLevel.spec.ts
// @(#) : Unit tests for AgLogger log level management
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AG_LOGLEVEL } from '../../shared/types';
import type { AgLogLevel } from '../../shared/types';
import { AgLogger } from '../AgLogger.class';

const mockLogger = vi.fn();
const mockFormatter = vi.fn().mockImplementation((msg) => msg.message ?? msg);

describe('ログレベルによるフィルタリング機能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  it('should filter out debug logs when level is WARN', () => {
    const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
    logger.logLevel = AG_LOGLEVEL.WARN;

    logger.debug('debug message');

    expect(mockLogger).toHaveBeenCalledTimes(0);
  });

  it('should allow warn logs when level is WARN', () => {
    const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
    logger.logLevel = AG_LOGLEVEL.WARN;

    logger.warn('warn message');

    expect(mockLogger).toHaveBeenCalledTimes(1);
  });
});

describe('ログレベル入力検証機能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  it('should throw error with message when logLevel is undefined', () => {
    const logger = AgLogger.createLogger();

    expect(() => {
      logger.logLevel = undefined as unknown as AgLogLevel;
    }).toThrow('Invalid log level (undefined)');
  });

  it('should throw error with message when logLevel is null', () => {
    const logger = AgLogger.createLogger();

    expect(() => {
      logger.logLevel = null as unknown as AgLogLevel;
    }).toThrow('Invalid log level (null)');
  });

  it('should throw error with message when logLevel is string', () => {
    const logger = AgLogger.createLogger();

    expect(() => {
      logger.logLevel = 'invalid' as unknown as AgLogLevel;
    }).toThrow('Invalid log level ("invalid")');
  });

  it('should throw error with message when logLevel is negative out of range', () => {
    const logger = AgLogger.createLogger();

    expect(() => {
      logger.logLevel = -1 as AgLogLevel;
    }).toThrow('Invalid log level (-1)');
  });

  it('should throw error with message when logLevel is positive out of range', () => {
    const logger = AgLogger.createLogger();

    expect(() => {
      logger.logLevel = 999 as AgLogLevel;
    }).toThrow('Invalid log level (999)');
  });

  it('should throw error with message when setLogger receives invalid logLevel', () => {
    const logger = AgLogger.createLogger();
    const mockLoggerFunc = vi.fn();

    expect(() => logger.setLogger(undefined as unknown as AgLogLevel, mockLoggerFunc))
      .toThrow('Invalid log level (undefined)');
  });
});

describe('ログレベル設定管理機能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  it('should return true when setting valid logger function', () => {
    const logger = AgLogger.createLogger();
    const customLogger = vi.fn();

    const result = logger.setLogger(AG_LOGLEVEL.INFO, customLogger);

    expect(result).toBe(true);
  });

  it('should retrieve the same logger function that was set', () => {
    const logger = AgLogger.createLogger();
    const customLogger = vi.fn();

    logger.setLogger(AG_LOGLEVEL.INFO, customLogger);
    const retrievedLogger = logger.getLoggerFunction(AG_LOGLEVEL.INFO);

    expect(retrievedLogger).toBe(customLogger);
  });

  it('should accept valid logLevel when setting logLevel property', () => {
    const logger = AgLogger.createLogger();

    logger.logLevel = AG_LOGLEVEL.DEBUG;

    expect(logger.logLevel).toBe(AG_LOGLEVEL.DEBUG);
  });
});
