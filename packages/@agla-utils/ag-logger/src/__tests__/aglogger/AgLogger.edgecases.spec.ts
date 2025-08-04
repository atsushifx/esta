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

/** 自己参照 */
type TCircularObj = {
  name: string;
  self?: TCircularObj;
};
/** 親子参照 */
type TParentChildObj = {
  name: string;
  parent?: TParentChildObj;
  children?: TParentChildObj[];
};

/** 深い参照 */
type TDeepObj = {
  level: number;
  nested?: TDeepObj;
};

/** カスタムエラー */
type TCustomError = Error & {
  code: string;
  details: unknown;
};

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
 * 複雑なオブジェクト構造のエッジケース
 * logger.infoで代表してテスト（全ログメソッド共通機能）
 */
describe('Complex Object Structure Edge Cases', () => {
  setupTestEnvironment();

  describe('Circular references', () => {
    it('should handle circular references in objects', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const circularObj: TCircularObj = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => logger.info('circular', circularObj)).not.toThrow();
    });

    it('should handle nested circular references', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const parent: TParentChildObj = { name: 'parent', children: [] };
      const child: TParentChildObj = { name: 'child', parent: parent };
      parent.children?.push(child);

      expect(() => logger.info('nested circular', parent)).not.toThrow();
    });
  });

  describe('Deep nesting', () => {
    it('should handle deeply nested objects', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      let deepObj: TDeepObj = { level: 0 };
      for (let i = 1; i < 100; i++) {
        deepObj = { level: i, nested: deepObj };
      }

      expect(() => logger.info('deep object', deepObj)).not.toThrow();
    });
  });
});

/**
 * エラーオブジェクト処理のエッジケース
 * logger.infoで代表してテスト（全ログメソッド共通機能）
 */
describe('Error Object Edge Cases', () => {
  setupTestEnvironment();

  describe('Standard error types', () => {
    it('should handle Error objects', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const errorObj = new Error('Test error');
      logger.info('error logging', errorObj);
    });

    it('should handle custom error types', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const typeError = new TypeError('Type error');
      const rangeError = new RangeError('Range error');

      logger.info('multiple errors', typeError, rangeError);
    });
  });

  describe('Error with additional properties', () => {
    it('should handle errors with custom properties', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const customError = new Error('Custom error');
      (customError as TCustomError).code = 'CUSTOM_CODE';
      (customError as TCustomError).details = { id: 123, context: 'test' };

      logger.info('custom error', customError);
    });
  });
});

/**
 * 大量データ処理のエッジケース
 * logger.infoで代表してテスト（全ログメソッド共通機能）
 */
describe('Large Data Edge Cases', () => {
  setupTestEnvironment();

  describe('Large messages', () => {
    it('should handle very long messages', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const longMessage = 'x'.repeat(10000);
      logger.info(longMessage);
    });
  });

  describe('Many arguments', () => {
    it('should handle large number of arguments', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const manyArgs = Array.from({ length: 100 }, (_, i) => `arg${i}`);
      logger.info('many args', ...manyArgs);
    });

    it('should handle large objects in arguments', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const largeObject = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `item_${i}`,
          value: Math.random(),
        })),
      };

      logger.info('large object', largeObject);
    });
  });
});

/**
 * 特殊な文字とエンコーディングのエッジケース
 * logger.infoで代表してテスト（全ログメソッド共通機能）
 */
describe('Special Characters and Encoding Edge Cases', () => {
  setupTestEnvironment();

  describe('Unicode and special characters', () => {
    it('should handle Unicode characters', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.info('Unicode test: 🌟 ñ © ® ™ ½ ¼ ¾');
    });

    it('should handle control characters', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.info('Control chars: \t\n\r\b\f');
    });

    it('should handle escape sequences', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      logger.info('Escape test: \' " \\ / \u0000');
    });
  });

  describe('Different string encodings', () => {
    it('should handle various whitespace types', () => {
      const logger = AgLogger.createLogger();
      logger.logLevel = AG_LOGLEVEL.INFO;

      const whitespaceMessages = [' ', '\t', '\n', '\r\n', '   ', '\t\n '];
      whitespaceMessages.forEach((msg) => logger.info(`whitespace: "${msg}"`));
    });
  });
});
