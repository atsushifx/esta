// Copyright (c) 2025 // src/__tests__/AgLogger.validator.spec.ts
// @(#) : AgLogger validator error check behavior tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { beforeEach, describe, expect, it } from 'vitest';

import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../../shared/constants';
import { AgLoggerError } from '../../shared/types/AgLoggerError.types';
import { AgLogger } from '../AgLogger.class';

import type { AgLogMessage } from '../../shared/types';

describe('AgLogger setLoggerConfig validator error check', () => {
  beforeEach(() => {
    AgLogger.resetSingleton();
  });

  it('should throw AgLoggerError when defaultLogger is undefined', () => {
    // Arrange
    const logger = AgLogger.createLogger();
    const invalidOptions = { defaultLogger: undefined };

    // Act & Assert
    expect(() => logger.setLoggerConfig(invalidOptions)).toThrow(AgLoggerError);
    expect(() => logger.setLoggerConfig(invalidOptions)).toThrow(
      AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.CONFIG].INVALID_DEFAULT_LOGGER,
    );
  });

  it('should throw AgLoggerError when formatter is undefined', () => {
    // Arrange
    const logger = AgLogger.createLogger();
    const invalidOptions = { formatter: undefined };

    // Act & Assert
    expect(() => logger.setLoggerConfig(invalidOptions)).toThrow(AgLoggerError);
    expect(() => logger.setLoggerConfig(invalidOptions)).toThrow(
      AG_LOGGER_ERROR_MESSAGES[ERROR_TYPES.CONFIG].INVALID_FORMATTER,
    );
    expect(() => logger.setLoggerConfig(invalidOptions)).toThrow('formatter must be a valid function');
  });
});

describe('AgLogger getFormatter validator error check', () => {
  beforeEach(() => {
    AgLogger.resetSingleton();
  });

  it('should return formatter when getFormatter method is called', () => {
    // Arrange
    const logger = AgLogger.createLogger();

    // Act & Assert
    expect(logger.getFormatter).toBeDefined();
    expect(typeof logger.getFormatter()).toBe('function');
  });

  it('should validate and return formatter when valid formatter is set', () => {
    // Arrange
    const mockFormatter = (message: AgLogMessage): string => `formatted: ${message.message}`;
    const logger = AgLogger.createLogger();

    logger.setLoggerConfig({ formatter: mockFormatter });

    // Act & Assert
    expect(logger.getFormatter()).toBe(mockFormatter);
  });
});
