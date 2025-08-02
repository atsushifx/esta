// src/__tests__/AgLogger.execution.spec.ts
// @(#) : Unit tests for AgLogger log method execution and formatter integration
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AG_LOGLEVEL } from '../../shared/types';
import { AgLogger } from '../AgLogger.class';

const mockLogger = vi.fn();
const mockFormatter = vi.fn().mockImplementation((msg) => msg.message ?? msg);

describe('ログメッセージ出力機能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  it('should execute fatal level log method correctly', () => {
    const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
    logger.logLevel = AG_LOGLEVEL.TRACE;

    logger.fatal('fatal message');

    expect(mockLogger).toHaveBeenCalledTimes(1);
  });

  it('should execute error level log method correctly', () => {
    const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
    logger.logLevel = AG_LOGLEVEL.TRACE;

    logger.error('error message');

    expect(mockLogger).toHaveBeenCalledTimes(1);
  });

  it('should execute warn level log method correctly', () => {
    const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
    logger.logLevel = AG_LOGLEVEL.TRACE;

    logger.warn('warn message');

    expect(mockLogger).toHaveBeenCalledTimes(1);
  });

  it('should execute info level log method correctly', () => {
    const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
    logger.logLevel = AG_LOGLEVEL.TRACE;

    logger.info('info message');

    expect(mockLogger).toHaveBeenCalledTimes(1);
  });

  it('should execute debug level log method correctly', () => {
    const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
    logger.logLevel = AG_LOGLEVEL.TRACE;

    logger.debug('debug message');

    expect(mockLogger).toHaveBeenCalledTimes(1);
  });

  it('should execute trace level log method correctly', () => {
    const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
    logger.logLevel = AG_LOGLEVEL.TRACE;

    logger.trace('trace message');

    expect(mockLogger).toHaveBeenCalledTimes(1);
  });
});

describe('メッセージフォーマッティング機能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  it('should apply custom formatter to log message', () => {
    const customFormatter = vi.fn().mockReturnValue('formatted message');
    const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: customFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;

    logger.info('original message');

    expect(mockLogger).toHaveBeenCalledWith('formatted message');
  });

  it('should call formatter function with log message data', () => {
    const inspectingFormatter = vi.fn().mockReturnValue('formatted');
    const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: inspectingFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;

    logger.info('test message');

    expect(inspectingFormatter).toHaveBeenCalled();
  });
});

describe('ログ抑制制御機能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  it('should not output when message is empty string', () => {
    const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: mockFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;

    logger.info('');

    expect(mockLogger).not.toHaveBeenCalled();
  });

  it('should not output when formatter returns empty string', () => {
    const emptyFormatter = vi.fn().mockReturnValue('');
    const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: emptyFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;

    logger.info('test message');

    expect(mockLogger).not.toHaveBeenCalled();
  });
});

describe('エラーハンドリング機能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  it('should throw error when logger function fails', () => {
    const throwingLogger = vi.fn(() => {
      throw new Error('Logger error');
    });
    const logger = AgLogger.createLogger({ defaultLogger: throwingLogger, formatter: mockFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;

    expect(() => logger.info('test')).toThrow('Logger error');
  });

  it('should throw error when formatter function fails', () => {
    const throwingFormatter = vi.fn(() => {
      throw new Error('Formatter error');
    });
    const logger = AgLogger.createLogger({ defaultLogger: mockLogger, formatter: throwingFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;

    expect(() => logger.info('test')).toThrow('Formatter error');
  });
});
