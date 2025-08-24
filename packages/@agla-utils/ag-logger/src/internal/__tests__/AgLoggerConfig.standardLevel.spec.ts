// src/internal/__tests__/AgLoggerConfig.standardLevel.spec.ts
// @(#) : AgLoggerConfig special log level handling BDD test implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogLevel } from '../../../shared/types';
import { AgLoggerConfig } from '../AgLoggerConfig.class';

describe('AgLoggerConfig special log level handling', () => {
  let config: AgLoggerConfig;

  beforeEach(() => {
    config = new AgLoggerConfig();
  });

  afterEach(() => {
    // Clean up any side effects
  });

  describe('特殊レベル設定の無視', () => {
    it('VERBOSE（-11）を設定しようとした時、設定が無視され元のレベルが保持されるべき', () => {
      // Given: 初期状態でOFF（0）に設定
      const initialLevel = AG_LOGLEVEL.OFF;
      config.logLevel = initialLevel;
      expect(config.logLevel).toBe(initialLevel);

      // When: 特殊レベルVERBOSEを設定
      config.logLevel = AG_LOGLEVEL.VERBOSE;

      // Then: 設定が無視され、元のレベルが保持される
      expect(config.logLevel).toBe(initialLevel);
    });

    it('LOG（-12）を設定しようとした時、設定が無視され元のレベルが保持されるべき', () => {
      // Given: 初期状態でINFO（4）に設定
      const initialLevel = AG_LOGLEVEL.INFO;
      config.logLevel = initialLevel;
      expect(config.logLevel).toBe(initialLevel);

      // When: 特殊レベルLOGを設定
      config.logLevel = AG_LOGLEVEL.LOG;

      // Then: 設定が無視され、元のレベルが保持される
      expect(config.logLevel).toBe(initialLevel);
    });

    it('DEFAULT（-99）を設定しようとした時、設定が無視され元のレベルが保持されるべき', () => {
      // Given: 初期状態でDEBUG（5）に設定
      const initialLevel = AG_LOGLEVEL.DEBUG;
      config.logLevel = initialLevel;
      expect(config.logLevel).toBe(initialLevel);

      // When: 特殊レベルDEFAULTを設定
      config.logLevel = AG_LOGLEVEL.DEFAULT;

      // Then: 設定が無視され、元のレベルが保持される
      expect(config.logLevel).toBe(initialLevel);
    });
  });

  describe('通常レベル設定の正常動作', () => {
    it('OFF（0）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      config.logLevel = AG_LOGLEVEL.OFF;

      // Then: 設定が反映される
      expect(config.logLevel).toBe(AG_LOGLEVEL.OFF);
    });

    it('FATAL（1）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      config.logLevel = AG_LOGLEVEL.FATAL;

      // Then: 設定が反映される
      expect(config.logLevel).toBe(AG_LOGLEVEL.FATAL);
    });

    it('ERROR（2）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      config.logLevel = AG_LOGLEVEL.ERROR;

      // Then: 設定が反映される
      expect(config.logLevel).toBe(AG_LOGLEVEL.ERROR);
    });

    it('WARN（3）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      config.logLevel = AG_LOGLEVEL.WARN;

      // Then: 設定が反映される
      expect(config.logLevel).toBe(AG_LOGLEVEL.WARN);
    });

    it('INFO（4）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      config.logLevel = AG_LOGLEVEL.INFO;

      // Then: 設定が反映される
      expect(config.logLevel).toBe(AG_LOGLEVEL.INFO);
    });

    it('DEBUG（5）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      config.logLevel = AG_LOGLEVEL.DEBUG;

      // Then: 設定が反映される
      expect(config.logLevel).toBe(AG_LOGLEVEL.DEBUG);
    });

    it('TRACE（6）は正常に設定されるべき', () => {
      // Given: 初期状態
      // When: 通常レベルを設定
      config.logLevel = AG_LOGLEVEL.TRACE;

      // Then: 設定が反映される
      expect(config.logLevel).toBe(AG_LOGLEVEL.TRACE);
    });
  });

  describe('複数回の特殊レベル設定試行', () => {
    it('複数の特殊レベルを順番に設定しようとした時、すべて無視されるべき', () => {
      // Given: 初期状態でWARN（3）に設定
      const initialLevel = AG_LOGLEVEL.WARN;
      config.logLevel = initialLevel;
      expect(config.logLevel).toBe(initialLevel);

      // When: 複数の特殊レベルを順番に設定
      config.logLevel = AG_LOGLEVEL.VERBOSE;
      expect(config.logLevel).toBe(initialLevel);

      config.logLevel = AG_LOGLEVEL.LOG;
      expect(config.logLevel).toBe(initialLevel);

      config.logLevel = AG_LOGLEVEL.DEFAULT;

      // Then: 最後まですべて無視され、元のレベルが保持される
      expect(config.logLevel).toBe(initialLevel);
    });
  });

  describe('特殊レベル設定後の通常レベル設定', () => {
    it('特殊レベル設定を無視した後、通常レベルは正常に設定されるべき', () => {
      // Given: 初期状態でERROR（2）に設定
      const initialLevel = AG_LOGLEVEL.ERROR;
      config.logLevel = initialLevel;
      expect(config.logLevel).toBe(initialLevel);

      // When: 特殊レベルを設定（無視される）
      config.logLevel = AG_LOGLEVEL.VERBOSE;
      expect(config.logLevel).toBe(initialLevel);

      // Then: その後の通常レベル設定は正常に動作する
      const newLevel = AG_LOGLEVEL.DEBUG;
      config.logLevel = newLevel;
      expect(config.logLevel).toBe(newLevel);
    });
  });

  describe('範囲外の値の処理', () => {
    it('範囲外の負の値（-1）を設定しようとした時、設定が無視されるべき', () => {
      // Given: 初期状態でINFO（4）に設定
      const initialLevel = AG_LOGLEVEL.INFO;
      config.logLevel = initialLevel;

      // When: 範囲外の値を設定
      config.logLevel = -1 as AgLogLevel;

      // Then: 設定が無視される
      expect(config.logLevel).toBe(initialLevel);
    });

    it('範囲外の正の値（7）を設定しようとした時、設定が無視されるべき', () => {
      // Given: 初期状態でTRACE（6）に設定
      const initialLevel = AG_LOGLEVEL.TRACE;
      config.logLevel = initialLevel;

      // When: 範囲外の値を設定
      config.logLevel = 7 as AgLogLevel;

      // Then: 設定が無視される
      expect(config.logLevel).toBe(initialLevel);
    });
  });
});
