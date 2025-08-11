// Copyright (c) 2025 // src/__tests__/AgLogger.validator.spec.ts
// @(#) : AgLogger validator error check behavior tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { beforeEach, describe, expect, it } from 'vitest';

import { AG_LOGGER_ERROR_MESSAGES, ERROR_TYPES } from '../../shared/constants';
import { AG_LOGLEVEL } from '../../shared/types';

import { AgLoggerError } from '../../shared/types/AgLoggerError.types';
import { AgLogger } from '../AgLogger.class';

import type { AgLogMessage } from '../../shared/types';

const setupTestEnvironment = () => {
  AgLogger.resetSingleton();
}

/**
 * AgLogger 入力値バリデーションユニットテスト
 * @description メッセージ内容とログレベル制御の検証
 */
describe('AgLogger Input Validation', () => {
  setupTestEnvironment();

  describe('Log Content Validation', () => {
    describe('Message Arguments Validation', () => {
      it('should handle undefined message arguments', () => {
        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;

        // Should not throw for basic undefined arguments
        expect(() => logger.info(undefined)).not.toThrow();
      });

      it('should handle null message arguments', () => {
        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;

        expect(() => logger.info(null)).not.toThrow();
      });

      it('should handle empty string arguments', () => {
        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;

        expect(() => logger.info('')).not.toThrow();
      });

      it('should handle special characters in messages', () => {
        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;

        expect(() => logger.info('Unicode: 🌟 ñ © ® ™')).not.toThrow();
        expect(() => logger.info('Control chars: \t\n\r\b\f')).not.toThrow();
      });
    });

    describe('Configuration Options Validation', () => {
      it('should throw AgLoggerError when defaultLogger is undefined', () => {
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
  });
});
