/**
 * Test suite for AgLogger VERBOSE level handling
 *
 * This test suite verifies that AgLogger properly handles the special VERBOSE level
 * in both createLogger and setLoggerConfig methods according to atsushifx式BDD process.
 *
 * Test focuses on:
 * - createLogger with VERBOSE level should throw AgLoggerError
 * - setLoggerConfig with VERBOSE level should throw AgLoggerError
 * - Error messages should be appropriate and consistent
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { AgLoggerError } from '../../shared/types/AgLoggerError.types';
import { AG_LOGLEVEL } from '../../shared/types/AgLogLevel.types';
import { AgLogger } from '../AgLogger.class';

describe('AgLogger VERBOSE level handling', () => {
  beforeEach(() => {
    AgLogger.resetSingleton();
  });

  describe('createLogger with VERBOSE level', () => {
    it('VERBOSEレベルを指定したcreateLoggerは適切にAgLoggerErrorを投げるべき', () => {
      // Arrange
      const verboseOptions = {
        logLevel: AG_LOGLEVEL.VERBOSE,
      };

      // Act & Assert
      expect(() => {
        AgLogger.createLogger(verboseOptions);
      }).toThrow(AgLoggerError);
    });

    it('VERBOSEレベル指定のcreateLoggerエラーメッセージは特殊レベルに関する適切なメッセージであるべき', () => {
      // Arrange
      const verboseOptions = {
        logLevel: AG_LOGLEVEL.VERBOSE,
      };

      // Act & Assert
      expect(() => {
        AgLogger.createLogger(verboseOptions);
      }).toThrow(/Special log levels cannot be set as default log level/i);
    });
  });

  describe('setLoggerConfig with VERBOSE level', () => {
    it('VERBOSEレベルを指定したsetLoggerConfigは適切にAgLoggerErrorを投げるべき', () => {
      // Arrange
      const logger = AgLogger.createLogger();
      const verboseOptions = {
        logLevel: AG_LOGLEVEL.VERBOSE,
      };

      // Act & Assert
      expect(() => {
        logger.setLoggerConfig(verboseOptions);
      }).toThrow(AgLoggerError);
    });

    it('VERBOSEレベル指定のsetLoggerConfigエラーメッセージは特殊レベルに関する適切なメッセージであるべき', () => {
      // Arrange
      const logger = AgLogger.createLogger();
      const verboseOptions = {
        logLevel: AG_LOGLEVEL.VERBOSE,
      };

      // Act & Assert
      expect(() => {
        logger.setLoggerConfig(verboseOptions);
      }).toThrow(/Special log levels cannot be set as default log level/i);
    });
  });

  describe('Other special levels', () => {
    it('LOGレベル(-12)を指定したcreateLoggerはAgLoggerErrorを投げるべき', () => {
      // Arrange
      const logOptions = {
        logLevel: AG_LOGLEVEL.LOG,
      };

      // Act & Assert
      expect(() => {
        AgLogger.createLogger(logOptions);
      }).toThrow(AgLoggerError);
    });

    it('DEFAULTレベル(-99)を指定したcreateLoggerはAgLoggerErrorを投げるべき', () => {
      // Arrange
      const defaultOptions = {
        logLevel: AG_LOGLEVEL.DEFAULT,
      };

      // Act & Assert
      expect(() => {
        AgLogger.createLogger(defaultOptions);
      }).toThrow(AgLoggerError);
    });

    it('LOGレベルを指定したsetLoggerConfigはAgLoggerErrorを投げるべき', () => {
      // Arrange
      const logger = AgLogger.createLogger();
      const logOptions = {
        logLevel: AG_LOGLEVEL.LOG,
      };

      // Act & Assert
      expect(() => {
        logger.setLoggerConfig(logOptions);
      }).toThrow(AgLoggerError);
    });

    it('DEFAULTレベルを指定したsetLoggerConfigはAgLoggerErrorを投げるべき', () => {
      // Arrange
      const logger = AgLogger.createLogger();
      const defaultOptions = {
        logLevel: AG_LOGLEVEL.DEFAULT,
      };

      // Act & Assert
      expect(() => {
        logger.setLoggerConfig(defaultOptions);
      }).toThrow(AgLoggerError);
    });
  });
});
