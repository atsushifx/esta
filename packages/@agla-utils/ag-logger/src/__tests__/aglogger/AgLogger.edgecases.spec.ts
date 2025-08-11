// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// src/__tests__/AgLogger.edgeCases.spec.ts
// @(#) : Edge case tests for AgLogger - using logger.info as representative
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ログレベル定数 - テストで使用するログレベルの定義
import { AG_LOGLEVEL } from '../../../shared/types';

// テスト対象 - AgLoggerクラスのメイン実装
import { AgLogger } from '../../AgLogger.class';

// テストケース用設定

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
 * 特殊引数処理のエッジケース
 * logger.infoで代表してテスト（全ログメソッド共通機能）
 */
/**
 * 特殊引数処理ユニットテスト
 * @description 非常値・特殊型の受け入れ動作を検証
 */
describe('Special Arguments Edge Cases', () => {
  setupTestEnvironment();

  describe('Empty and null arguments', () => {
    it('should handle no arguments (empty call)', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.info();
    });

    it('should handle undefined as first argument', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.info(undefined);
    });

    it('should handle null as first argument', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.info(null);
    });

    it('should handle empty string', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.info('');
    });
  });

  describe('Falsy and special values', () => {
    it('should handle falsy values', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.info(0);
      logger.info(false);
      logger.info(NaN);
    });

    it('should handle Symbol arguments', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const testSymbol = Symbol('test');
      logger.info('symbol test', testSymbol);
    });

    it('should handle BigInt arguments', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const bigIntValue = BigInt('123456789012345678901234567890');
      logger.info('bigint test', bigIntValue);
    });
  });
});

/**
 * 基本的なオブジェクト構造のエッジケース
 * logger.infoで代表してテスト（全ログメソッド共通機能）
 */
describe('Basic Object Structure Edge Cases', () => {
  setupTestEnvironment();

  describe('Simple object handling', () => {
    it('should handle plain objects', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const simpleObj = { key: 'value', number: 42, boolean: true };

      expect(() => logger.info('simple object', simpleObj)).not.toThrow();
    });

    it('should handle arrays', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const simpleArray = [1, 'two', { three: 3 }, [4, 5]];

      expect(() => logger.info('array', simpleArray)).not.toThrow();
    });
  });
});

/**
 * 基本的なエラーオブジェクト処理のエッジケース
 * logger.infoで代表してテスト（全ログメソッド共通機能）
 */
describe('Basic Error Object Edge Cases', () => {
  setupTestEnvironment();

  describe('Standard error types', () => {
    it('should handle Error objects', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const errorObj = new Error('Test error');
      expect(() => logger.info('error logging', errorObj)).not.toThrow();
    });

    it('should handle TypeError objects', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const typeError = new TypeError('Type error');
      expect(() => logger.info('type error', typeError)).not.toThrow();
    });

    it('should handle RangeError objects', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const rangeError = new RangeError('Range error');
      expect(() => logger.info('range error', rangeError)).not.toThrow();
    });
  });
});

/**
 * 基本的なデータ型エッジケース
 * logger.infoで代表してテスト（全ログメソッド共通機能）
 */
describe('Basic Data Type Edge Cases', () => {
  setupTestEnvironment();

  describe('Primitive types', () => {
    it('should handle BigInt arguments', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const bigIntValue = BigInt('123456789012345678901234567890');
      expect(() => logger.info('bigint test', bigIntValue)).not.toThrow();
    });

    it('should handle Symbol arguments', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const testSymbol = Symbol('test');
      expect(() => logger.info('symbol test', testSymbol)).not.toThrow();
    });
  });
});

/**
 * 基本的な文字とエンコーディングのエッジケース
 * logger.infoで代表してテスト（全ログメソッド共通機能）
 */
describe('Basic Character and Encoding Edge Cases', () => {
  setupTestEnvironment();

  describe('Unicode and special characters', () => {
    it('should handle basic Unicode characters', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      expect(() => logger.info('Unicode test: ñ © ® ™')).not.toThrow();
    });

    it('should handle control characters', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      expect(() => logger.info('Control chars: \t\n\r')).not.toThrow();
    });

    it('should handle escape sequences', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      expect(() => logger.info('Escape test: \' " \\')).not.toThrow();
    });

    it('should handle basic whitespace types', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      expect(() => logger.info('whitespace: " "')).not.toThrow();
      expect(() => logger.info('whitespace: "\t"')).not.toThrow();
      expect(() => logger.info('whitespace: "\n"')).not.toThrow();
    });
  });
});
