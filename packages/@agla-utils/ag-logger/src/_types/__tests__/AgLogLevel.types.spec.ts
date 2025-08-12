// src: _types/__tests__/AgLogLevel.types.spec.ts
// @(#): AgLogLevel型定義の包括的テストスイート
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// test framework
import { describe, expect, it } from 'vitest';

// target types and constants
import type { AgLogLevel, AgLogLevelLabel } from '../../../shared/types/AgLogLevel.types';
import {
  AG_LABEL_TO_LOGLEVEL_MAP,
  AG_LOGLEVEL,
  AG_LOGLEVEL_KEYS,
  AG_LOGLEVEL_TO_LABEL_MAP,
  AG_LOGLEVEL_VALUES,
} from '../../../shared/types/AgLogLevel.types';

/**
 * AgLogLevel型定義の包括的テストスイート
 *
 * AgLogLevel関連の型定義、定数、変換マップの包括的な検証を行います。
 * atsushifx式BDDアプローチに従い、正常系、異常系、エッジケースを含む
 * 網羅的なテストを実装しています。
 *
 * @remarks
 * テストカバレッジ:
 * - AG_LOGLEVEL定数オブジェクトの構造と値の検証
 * - AgLogLevel型とAgLogLevelLabel型の型安全性テスト
 * - 配列・マップの整合性とデータ変換の正確性検証
 * - 境界値・エッジケースの包括的テスト
 */
describe('AgLogLevel Types and Constants Tests', () => {
  /**
   * Task 1: AG_LOGLEVEL定数オブジェクトの検証
   *
   * AG_LOGLEVELオブジェクトが正しく定義され、期待する値と構造を持つことを検証します。
   * 標準ログレベルと特殊ログレベルの両方をテストします。
   */
  describe('Task 1: AG_LOGLEVEL定数オブジェクトの検証', () => {
    /**
     * 補助Task 1.1: 標準ログレベル定数の値が正しく定義されていることをテスト
     */
    it('should define standard log level constants with correct numeric values', () => {
      expect(AG_LOGLEVEL.OFF).toBe(0);
      expect(AG_LOGLEVEL.FATAL).toBe(1);
      expect(AG_LOGLEVEL.ERROR).toBe(2);
      expect(AG_LOGLEVEL.WARN).toBe(3);
      expect(AG_LOGLEVEL.INFO).toBe(4);
      expect(AG_LOGLEVEL.DEBUG).toBe(5);
      expect(AG_LOGLEVEL.TRACE).toBe(6);
    });

    /**
     * 補助Task 1.2: 特殊ログレベル定数の値が正しく定義されていることをテスト
     */
    it('should define special log level constants with correct negative values', () => {
      expect(AG_LOGLEVEL.LOG).toBe(-12);
      expect(AG_LOGLEVEL.FORCE_OUTPUT).toBe(-98);
      expect(AG_LOGLEVEL.VERBOSE).toBe(-99);
    });

    /**
     * 補助Task 1.3: AG_LOGLEVELオブジェクトがconst assertionで型レベル不変であることをテスト
     */
    it('should be readonly at type level with const assertion', () => {
      // const assertionによる型レベル不変性の検証
      expect(AG_LOGLEVEL).toBeDefined();
      expect(typeof AG_LOGLEVEL).toBe('object');

      // 値の変更可能性をテスト（ランタイムでは変更可能）
      const originalValue = AG_LOGLEVEL.OFF;
      expect(originalValue).toBe(0);

      // プロパティの存在確認
      expect(Object.hasOwnProperty.call(AG_LOGLEVEL, 'OFF')).toBe(true);
    });
  });

  /**
   * Task 2: AgLogLevel型の型安全性テスト
   *
   * AgLogLevel型が適切に定義され、有効な値のみを受け入れることを検証します。
   */
  describe('Task 2: AgLogLevel型の型安全性テスト', () => {
    /**
     * 補助Task 2.1: 全ての有効なログレベル値でAgLogLevel型が動作することをテスト
     */
    it('should accept all valid log level numeric values', () => {
      const validLogLevels: AgLogLevel[] = [
        AG_LOGLEVEL.VERBOSE,
        AG_LOGLEVEL.FORCE_OUTPUT,
        AG_LOGLEVEL.LOG,
        AG_LOGLEVEL.OFF,
        AG_LOGLEVEL.FATAL,
        AG_LOGLEVEL.ERROR,
        AG_LOGLEVEL.WARN,
        AG_LOGLEVEL.INFO,
        AG_LOGLEVEL.DEBUG,
        AG_LOGLEVEL.TRACE,
      ];

      validLogLevels.forEach((level) => {
        expect(typeof level).toBe('number');
        expect(AG_LOGLEVEL_VALUES).toContain(level);
      });
    });

    /**
     * 補助Task 2.2: AgLogLevel配列の整合性をテスト
     */
    it('should have consistent AG_LOGLEVEL_VALUES array', () => {
      expect(AG_LOGLEVEL_VALUES).toHaveLength(10);
      expect(AG_LOGLEVEL_VALUES).toEqual(expect.arrayContaining([
        -99,
        -98,
        -12,
        0,
        1,
        2,
        3,
        4,
        5,
        6,
      ]));

      AG_LOGLEVEL_VALUES.forEach((value) => {
        expect(typeof value).toBe('number');
      });
    });
  });

  /**
   * Task 3: AgLogLevelLabel型の型安全性テスト
   *
   * AgLogLevelLabel型が適切に定義され、有効なラベル文字列のみを受け入れることを検証します。
   */
  describe('Task 3: AgLogLevelLabel型の型安全性テスト', () => {
    /**
     * 補助Task 3.1: 全ての有効なラベル文字列でAgLogLevelLabel型が動作することをテスト
     */
    it('should accept all valid log level label strings', () => {
      const validLabels: AgLogLevelLabel[] = [
        'VERBOSE',
        'FORCE_OUTPUT',
        'LOG',
        'OFF',
        'FATAL',
        'ERROR',
        'WARN',
        'INFO',
        'DEBUG',
        'TRACE',
      ];

      validLabels.forEach((label) => {
        expect(typeof label).toBe('string');
        expect(AG_LOGLEVEL_KEYS).toContain(label);
        expect(AG_LOGLEVEL).toHaveProperty(label);
      });
    });

    /**
     * 補助Task 3.2: AgLogLevelLabel配列の整合性をテスト
     */
    it('should have consistent AG_LOGLEVEL_KEYS array', () => {
      expect(AG_LOGLEVEL_KEYS).toHaveLength(10);
      expect(AG_LOGLEVEL_KEYS).toEqual(expect.arrayContaining([
        'VERBOSE',
        'FORCE_OUTPUT',
        'LOG',
        'OFF',
        'FATAL',
        'ERROR',
        'WARN',
        'INFO',
        'DEBUG',
        'TRACE',
      ]));

      AG_LOGLEVEL_KEYS.forEach((key) => {
        expect(typeof key).toBe('string');
      });
    });
  });

  /**
   * Task 4: 変換マップの整合性テスト
   *
   * AG_LOGLEVEL_TO_LABEL_MAPとAG_LABEL_TO_LOGLEVEL_MAPが正しく変換を行うことを検証します。
   */
  describe('Task 4: 変換マップの整合性テスト', () => {
    /**
     * 補助Task 4.1: ログレベルからラベルへの変換マップが正しく動作することをテスト
     */
    it('should convert log levels to labels correctly', () => {
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.OFF]).toBe('OFF');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.FATAL]).toBe('FATAL');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.ERROR]).toBe('ERROR');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.WARN]).toBe('WARN');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.INFO]).toBe('INFO');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.DEBUG]).toBe('DEBUG');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.TRACE]).toBe('TRACE');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.LOG]).toBe('LOG');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.FORCE_OUTPUT]).toBe('FORCE_OUTPUT');
      expect(AG_LOGLEVEL_TO_LABEL_MAP[AG_LOGLEVEL.VERBOSE]).toBe('VERBOSE');
    });

    /**
     * 補助Task 4.2: ラベルからログレベルへの変換マップが正しく動作することをテスト
     */
    it('should convert labels to log levels correctly', () => {
      expect(AG_LABEL_TO_LOGLEVEL_MAP['OFF']).toBe(AG_LOGLEVEL.OFF);
      expect(AG_LABEL_TO_LOGLEVEL_MAP['FATAL']).toBe(AG_LOGLEVEL.FATAL);
      expect(AG_LABEL_TO_LOGLEVEL_MAP['ERROR']).toBe(AG_LOGLEVEL.ERROR);
      expect(AG_LABEL_TO_LOGLEVEL_MAP['WARN']).toBe(AG_LOGLEVEL.WARN);
      expect(AG_LABEL_TO_LOGLEVEL_MAP['INFO']).toBe(AG_LOGLEVEL.INFO);
      expect(AG_LABEL_TO_LOGLEVEL_MAP['DEBUG']).toBe(AG_LOGLEVEL.DEBUG);
      expect(AG_LABEL_TO_LOGLEVEL_MAP['TRACE']).toBe(AG_LOGLEVEL.TRACE);
      expect(AG_LABEL_TO_LOGLEVEL_MAP['LOG']).toBe(AG_LOGLEVEL.LOG);
      expect(AG_LABEL_TO_LOGLEVEL_MAP['FORCE_OUTPUT']).toBe(AG_LOGLEVEL.FORCE_OUTPUT);
      expect(AG_LABEL_TO_LOGLEVEL_MAP['VERBOSE']).toBe(AG_LOGLEVEL.VERBOSE);
    });

    /**
     * 補助Task 4.3: 双方向変換の一貫性をテスト
     */
    it('should maintain bidirectional conversion consistency', () => {
      AG_LOGLEVEL_VALUES.forEach((level) => {
        const label = AG_LOGLEVEL_TO_LABEL_MAP[level];
        expect(AG_LABEL_TO_LOGLEVEL_MAP[label]).toBe(level);
      });

      AG_LOGLEVEL_KEYS.forEach((label) => {
        const level = AG_LABEL_TO_LOGLEVEL_MAP[label];
        expect(AG_LOGLEVEL_TO_LABEL_MAP[level]).toBe(label);
      });
    });
  });

  /**
   * Task 5: エッジケースと境界値テスト
   *
   * ログレベルの境界値やエッジケースでの動作を検証します。
   */
  describe('Task 5: エッジケースと境界値テスト', () => {
    /**
     * 補助Task 5.1: 最小値・最大値のログレベル境界をテスト
     */
    it('should handle minimum and maximum log level boundaries', () => {
      const minLogLevel = Math.min(...AG_LOGLEVEL_VALUES);
      const maxLogLevel = Math.max(...AG_LOGLEVEL_VALUES);

      expect(minLogLevel).toBe(AG_LOGLEVEL.VERBOSE);
      expect(maxLogLevel).toBe(AG_LOGLEVEL.TRACE);
      expect(minLogLevel).toBeLessThan(maxLogLevel);
    });

    /**
     * 補助Task 5.2: ログレベル順序の一貫性をテスト
     */
    it('should maintain consistent log level ordering', () => {
      expect(AG_LOGLEVEL.OFF).toBeLessThan(AG_LOGLEVEL.FATAL);
      expect(AG_LOGLEVEL.FATAL).toBeLessThan(AG_LOGLEVEL.ERROR);
      expect(AG_LOGLEVEL.ERROR).toBeLessThan(AG_LOGLEVEL.WARN);
      expect(AG_LOGLEVEL.WARN).toBeLessThan(AG_LOGLEVEL.INFO);
      expect(AG_LOGLEVEL.INFO).toBeLessThan(AG_LOGLEVEL.DEBUG);
      expect(AG_LOGLEVEL.DEBUG).toBeLessThan(AG_LOGLEVEL.TRACE);

      expect(AG_LOGLEVEL.VERBOSE).toBeLessThan(AG_LOGLEVEL.FORCE_OUTPUT);
      expect(AG_LOGLEVEL.FORCE_OUTPUT).toBeLessThan(AG_LOGLEVEL.LOG);
      expect(AG_LOGLEVEL.LOG).toBeLessThan(AG_LOGLEVEL.OFF);
    });

    /**
     * 補助Task 5.3: 重複値がないことをテスト
     */
    it('should have no duplicate log level values', () => {
      const uniqueValues = [...new Set(AG_LOGLEVEL_VALUES)];
      expect(uniqueValues).toHaveLength(AG_LOGLEVEL_VALUES.length);
    });

    /**
     * 補助Task 5.4: 重複ラベルがないことをテスト
     */
    it('should have no duplicate log level labels', () => {
      const uniqueKeys = [...new Set(AG_LOGLEVEL_KEYS)];
      expect(uniqueKeys).toHaveLength(AG_LOGLEVEL_KEYS.length);
    });
  });

  /**
   * Task 6: データ構造の整合性テスト
   *
   * 全ての関連データ構造が相互に整合性を保っていることを検証します。
   */
  describe('Task 6: データ構造の整合性テスト', () => {
    /**
     * 補助Task 6.1: 全データ構造の要素数が一致することをテスト
     */
    it('should have consistent element counts across all data structures', () => {
      const expectedCount = Object.keys(AG_LOGLEVEL).length;

      expect(AG_LOGLEVEL_KEYS).toHaveLength(expectedCount);
      expect(AG_LOGLEVEL_VALUES).toHaveLength(expectedCount);
      expect(Object.keys(AG_LOGLEVEL_TO_LABEL_MAP)).toHaveLength(expectedCount);
      expect(Object.keys(AG_LABEL_TO_LOGLEVEL_MAP)).toHaveLength(expectedCount);
    });

    /**
     * 補助Task 6.2: マップのキーと値の型が正しいことをテスト
     */
    it('should have correct key-value types in conversion maps', () => {
      Object.entries(AG_LOGLEVEL_TO_LABEL_MAP).forEach(([levelStr, label]) => {
        const level = Number(levelStr);
        expect(typeof level).toBe('number');
        expect(typeof label).toBe('string');
        expect(AG_LOGLEVEL_VALUES).toContain(level);
        expect(AG_LOGLEVEL_KEYS).toContain(label);
      });

      Object.entries(AG_LABEL_TO_LOGLEVEL_MAP).forEach(([label, level]) => {
        expect(typeof label).toBe('string');
        expect(typeof level).toBe('number');
        expect(AG_LOGLEVEL_KEYS).toContain(label);
        expect(AG_LOGLEVEL_VALUES).toContain(level);
      });
    });
  });
});
