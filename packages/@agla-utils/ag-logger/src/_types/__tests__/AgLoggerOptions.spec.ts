// src: _types/__tests__/AgLoggerOptions.spec.ts
// @(#): AgLoggerOptions型定義の包括的テストスイート
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// test framework
import { describe, expect, it } from 'vitest';

// type imports
import type {
  AgFormatFunction,
  AgLoggerFunction,
  AgLoggerOptions,
} from '../../../shared/types/AgLogger.interface';

// constants
import { AG_LOGLEVEL } from '../../../shared/types/LogLevel.types';

/**
 * AgLoggerOptions型定義の包括的テストスイート
 *
 * AgLoggerOptionsインターフェースの型安全性と構造を検証します。
 * t-wada式TDDアプローチに従い、Red-Green-Refactorサイクルで実装されています。
 *
 * @remarks
 * テストカバレッジ:
 * - 基本的な型定義の動作確認
 * - logLevel, verboseプロパティの型チェック
 * - 全プロパティのオプショナル性検証
 */
describe('AgLoggerOptions Interface Tests', () => {
  /**
   * 補助Task 1.1: AgLoggerOptionsの型定義が正しく動作することをテスト
   *
   * AgLoggerOptionsインターフェースが適切に定義され、
   * 有効なオプションオブジェクトを受け入れることを検証します。
   */
  describe('補助Task 1.1: AgLoggerOptionsの型定義が正しく動作することをテスト', () => {
    it('should accept valid AgLoggerOptions interface', () => {
      // テスト用のモック関数を作成
      const mockLogger: AgLoggerFunction = (message: string) => console.log(message);
      const mockFormatter: AgFormatFunction = (logMessage) => `${logMessage.message}`;

      // 有効なオプションオブジェクトを作成
      const validOptions: AgLoggerOptions = {
        defaultLogger: mockLogger,
        formatter: mockFormatter,
        logLevel: AG_LOGLEVEL.INFO,
        verbose: true,
        loggerMap: {
          [AG_LOGLEVEL.ERROR]: mockLogger,
        },
      };

      // 型の基本検証
      expect(validOptions).toBeDefined();
      expect(typeof validOptions.defaultLogger).toBe('function');
      expect(typeof validOptions.formatter).toBe('function');
      expect(typeof validOptions.logLevel).toBe('number');
      expect(typeof validOptions.verbose).toBe('boolean');
      expect(typeof validOptions.loggerMap).toBe('object');

      // 具体的な値の検証
      expect(validOptions.defaultLogger).toBe(mockLogger);
      expect(validOptions.formatter).toBe(mockFormatter);
      expect(validOptions.logLevel).toBe(AG_LOGLEVEL.INFO);
      expect(validOptions.verbose).toBe(true);
      expect(validOptions.loggerMap?.[AG_LOGLEVEL.ERROR]).toBe(mockLogger);
    });
  });

  /**
   * 補助Task 1.2: logLevel, verboseプロパティが正しく型チェックされることをテスト
   *
   * AgLoggerOptionsのlogLevelとverboseプロパティが適切な型（number, boolean）で
   * 型チェックされ、有効な値の範囲内であることを検証します。
   */
  describe('補助Task 1.2: logLevel, verboseプロパティが正しく型チェックされることをテスト', () => {
    it('should validate logLevel and verbose properties in AgLoggerOptions', () => {
      // テスト用の有効なlogLevelとverboseの組み合わせを作成
      const validLogLevelOptions: AgLoggerOptions = {
        logLevel: AG_LOGLEVEL.DEBUG,
        verbose: false,
      };

      const validVerboseOptions: AgLoggerOptions = {
        logLevel: AG_LOGLEVEL.WARN,
        verbose: true,
      };

      // logLevelとverboseプロパティの型検証
      expect(typeof validLogLevelOptions.logLevel).toBe('number');
      expect(typeof validLogLevelOptions.verbose).toBe('boolean');
      expect(typeof validVerboseOptions.logLevel).toBe('number');
      expect(typeof validVerboseOptions.verbose).toBe('boolean');

      // logLevelが有効な範囲内であることを検証
      expect(validLogLevelOptions.logLevel).toBeGreaterThanOrEqual(AG_LOGLEVEL.OFF);
      expect(validLogLevelOptions.logLevel).toBeLessThanOrEqual(AG_LOGLEVEL.TRACE);
      expect([true, false]).toContain(validLogLevelOptions.verbose);
      expect([true, false]).toContain(validVerboseOptions.verbose);

      // 全ての有効なlogLevelで型検証を実行
      const allValidLogLevels = [
        AG_LOGLEVEL.OFF,
        AG_LOGLEVEL.FATAL,
        AG_LOGLEVEL.ERROR,
        AG_LOGLEVEL.WARN,
        AG_LOGLEVEL.INFO,
        AG_LOGLEVEL.DEBUG,
        AG_LOGLEVEL.TRACE,
      ];

      allValidLogLevels.forEach((level) => {
        const testOptions: AgLoggerOptions = { logLevel: level };
        expect(typeof testOptions.logLevel).toBe('number');
        expect(testOptions.logLevel).toBe(level);
      });
    });
  });

  /**
   * 補助Task 1.3: 全てのプロパティがオプショナルであることをテスト
   *
   * AgLoggerOptionsインターフェースの全てのプロパティがオプショナル（?）であり、
   * 空のオブジェクトや部分的なオプションオブジェクトを受け入れることを検証します。
   */
  describe('補助Task 1.3: 全てのプロパティがオプショナルであることをテスト', () => {
    it('should allow empty AgLoggerOptions object', () => {
      // 空のオプションオブジェクトの作成と検証
      const emptyOptions: AgLoggerOptions = {};

      // 基本的なオブジェクト構造の検証
      expect(emptyOptions).toBeDefined();
      expect(typeof emptyOptions).toBe('object');

      // 全てのプロパティがundefinedであることを確認（オプショナル性の検証）
      expect(emptyOptions.defaultLogger).toBeUndefined();
      expect(emptyOptions.formatter).toBeUndefined();
      expect(emptyOptions.logLevel).toBeUndefined();
      expect(emptyOptions.verbose).toBeUndefined();
      expect(emptyOptions.loggerMap).toBeUndefined();

      // 部分的なオプション設定のテストケース
      const partialOptions1: AgLoggerOptions = {
        logLevel: AG_LOGLEVEL.INFO,
      };

      const partialOptions2: AgLoggerOptions = {
        verbose: true,
      };

      const partialOptions3: AgLoggerOptions = {
        defaultLogger: (msg: string) => console.log(msg),
        logLevel: AG_LOGLEVEL.DEBUG,
      };

      // 部分的なオプションが正しく動作することを検証
      expect(partialOptions1.logLevel).toBe(AG_LOGLEVEL.INFO);
      expect(partialOptions1.verbose).toBeUndefined();

      expect(partialOptions2.verbose).toBe(true);
      expect(partialOptions2.logLevel).toBeUndefined();

      expect(typeof partialOptions3.defaultLogger).toBe('function');
      expect(partialOptions3.logLevel).toBe(AG_LOGLEVEL.DEBUG);
      expect(partialOptions3.verbose).toBeUndefined();
      expect(partialOptions3.formatter).toBeUndefined();
    });
  });
});
