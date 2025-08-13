// src/__tests__/AgLogger.standardLevel.spec.ts
// @(#) : AgLogger special log level handling BDD test implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ERROR_TYPES } from '../../shared/constants/agErrorMessages';
import { AG_LOGLEVEL } from '../../shared/types';
import type { AgLogLevel } from '../../shared/types';
import { AgLoggerError } from '../../shared/types/AgLoggerError.types';
import { AgLogger } from '../AgLogger.class';
import { NullFormatter } from '../plugins/formatter/NullFormatter';
import { NullLogger } from '../plugins/logger/NullLogger';

describe('AgLogger special log level handling', () => {
  let logger: AgLogger;

  beforeEach(() => {
    AgLogger.resetSingleton();
    logger = AgLogger.createLogger({
      defaultLogger: NullLogger,
      formatter: NullFormatter,
    });
  });

  afterEach(() => {
    AgLogger.resetSingleton();
  });

  describe('特殊レベル設定時のエラー投げ', () => {
    it('VERBOSE（-11）を設定しようとした時、AgLoggerErrorを投げるべき', () => {
      // Given: 初期状態のAgLogger
      expect(logger.logLevel).toBe(AG_LOGLEVEL.OFF); // デフォルト

      // When & Then: 特殊レベルVERBOSEを設定しようとするとエラーが投げられる
      expect(() => {
        logger.logLevel = AG_LOGLEVEL.VERBOSE;
      }).toThrow(AgLoggerError);

      expect(() => {
        logger.logLevel = AG_LOGLEVEL.VERBOSE;
      }).toThrow('Special log levels cannot be set as default log level');

      // 元のレベルが保持されることを確認
      expect(logger.logLevel).toBe(AG_LOGLEVEL.OFF);
    });

    it('LOG（-12）を設定しようとした時、AgLoggerErrorを投げるべき', () => {
      // Given: 初期状態でINFO（4）に設定
      logger.logLevel = AG_LOGLEVEL.INFO;
      expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);

      // When & Then: 特殊レベルLOGを設定しようとするとエラーが投げられる
      expect(() => {
        logger.logLevel = AG_LOGLEVEL.LOG;
      }).toThrow(AgLoggerError);

      expect(() => {
        logger.logLevel = AG_LOGLEVEL.LOG;
      }).toThrow('Special log levels cannot be set as default log level');

      // 元のレベルが保持されることを確認
      expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
    });

    it('DEFAULT（-99）を設定しようとした時、AgLoggerErrorを投げるべき', () => {
      // Given: 初期状態でDEBUG（5）に設定
      logger.logLevel = AG_LOGLEVEL.DEBUG;
      expect(logger.logLevel).toBe(AG_LOGLEVEL.DEBUG);

      // When & Then: 特殊レベルDEFAULTを設定しようとするとエラーが投げられる
      expect(() => {
        logger.logLevel = AG_LOGLEVEL.DEFAULT;
      }).toThrow(AgLoggerError);

      expect(() => {
        logger.logLevel = AG_LOGLEVEL.DEFAULT;
      }).toThrow('Special log levels cannot be set as default log level');

      // 元のレベルが保持されることを確認
      expect(logger.logLevel).toBe(AG_LOGLEVEL.DEBUG);
    });
  });

  describe('エラーの詳細確認', () => {
    it('特殊レベル設定時のエラーは正しいエラータイプを持つべき', () => {
      // Given: 初期状態のAgLogger
      // When & Then: 特殊レベルを設定時にVALIDATIONエラーが投げられる
      try {
        logger.logLevel = AG_LOGLEVEL.VERBOSE;
        expect.fail('Expected AgLoggerError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AgLoggerError);
        const agError = error as AgLoggerError;
        expect(agError.errorType).toBe(ERROR_TYPES.VALIDATION);
      }
    });

    it('複数の特殊レベルを順番に設定しようとした時、それぞれでエラーが投げられるべき', () => {
      // Given: 初期状態でWARN（3）に設定
      logger.logLevel = AG_LOGLEVEL.WARN;
      expect(logger.logLevel).toBe(AG_LOGLEVEL.WARN);

      // When & Then: 各特殊レベルでエラーが投げられる
      expect(() => {
        logger.logLevel = AG_LOGLEVEL.VERBOSE;
      }).toThrow(AgLoggerError);

      expect(() => {
        logger.logLevel = AG_LOGLEVEL.LOG;
      }).toThrow(AgLoggerError);

      expect(() => {
        logger.logLevel = AG_LOGLEVEL.DEFAULT;
      }).toThrow(AgLoggerError);

      // 元のレベルが保持されることを確認
      expect(logger.logLevel).toBe(AG_LOGLEVEL.WARN);
    });
  });

  describe('通常レベル設定の正常動作', () => {
    it('OFF（0）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      expect(() => {
        logger.logLevel = AG_LOGLEVEL.OFF;
      }).not.toThrow();

      // Then: 設定が反映される
      expect(logger.logLevel).toBe(AG_LOGLEVEL.OFF);
    });

    it('FATAL（1）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      expect(() => {
        logger.logLevel = AG_LOGLEVEL.FATAL;
      }).not.toThrow();

      // Then: 設定が反映される
      expect(logger.logLevel).toBe(AG_LOGLEVEL.FATAL);
    });

    it('ERROR（2）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      expect(() => {
        logger.logLevel = AG_LOGLEVEL.ERROR;
      }).not.toThrow();

      // Then: 設定が反映される
      expect(logger.logLevel).toBe(AG_LOGLEVEL.ERROR);
    });

    it('WARN（3）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      expect(() => {
        logger.logLevel = AG_LOGLEVEL.WARN;
      }).not.toThrow();

      // Then: 設定が反映される
      expect(logger.logLevel).toBe(AG_LOGLEVEL.WARN);
    });

    it('INFO（4）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      expect(() => {
        logger.logLevel = AG_LOGLEVEL.INFO;
      }).not.toThrow();

      // Then: 設定が反映される
      expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
    });

    it('DEBUG（5）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      expect(() => {
        logger.logLevel = AG_LOGLEVEL.DEBUG;
      }).not.toThrow();

      // Then: 設定が反映される
      expect(logger.logLevel).toBe(AG_LOGLEVEL.DEBUG);
    });

    it('TRACE（6）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      expect(() => {
        logger.logLevel = AG_LOGLEVEL.TRACE;
      }).not.toThrow();

      // Then: 設定が反映される
      expect(logger.logLevel).toBe(AG_LOGLEVEL.TRACE);
    });
  });

  describe('範囲外の値の処理', () => {
    it('範囲外の負の値（-1）を設定しようとした時、AgLoggerErrorを投げるべき', () => {
      // Given: 初期状態でINFO（4）に設定
      logger.logLevel = AG_LOGLEVEL.INFO;

      // When & Then: 範囲外の値を設定時にエラーが投げられる
      expect(() => {
        logger.logLevel = -1 as AgLogLevel;
      }).toThrow(AgLoggerError);

      // 元のレベルが保持されることを確認
      expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
    });

    it('範囲外の正の値（7）を設定しようとした時、AgLoggerErrorを投げるべき', () => {
      // Given: 初期状態でTRACE（6）に設定
      logger.logLevel = AG_LOGLEVEL.TRACE;

      // When & Then: 範囲外の値を設定時にエラーが投げられる
      expect(() => {
        logger.logLevel = 7 as AgLogLevel;
      }).toThrow(AgLoggerError);

      // 元のレベルが保持されることを確認
      expect(logger.logLevel).toBe(AG_LOGLEVEL.TRACE);
    });
  });

  describe('特殊レベル設定エラー後の通常レベル設定', () => {
    it('特殊レベル設定でエラーが投げられた後、通常レベルは正常に設定されるべき', () => {
      // Given: 初期状態でERROR（2）に設定
      logger.logLevel = AG_LOGLEVEL.ERROR;
      expect(logger.logLevel).toBe(AG_LOGLEVEL.ERROR);

      // When: 特殊レベルを設定（エラーが投げられる）
      expect(() => {
        logger.logLevel = AG_LOGLEVEL.VERBOSE;
      }).toThrow(AgLoggerError);
      expect(logger.logLevel).toBe(AG_LOGLEVEL.ERROR);

      // Then: その後の通常レベル設定は正常に動作する
      expect(() => {
        logger.logLevel = AG_LOGLEVEL.DEBUG;
      }).not.toThrow();
      expect(logger.logLevel).toBe(AG_LOGLEVEL.DEBUG);
    });
  });
});
