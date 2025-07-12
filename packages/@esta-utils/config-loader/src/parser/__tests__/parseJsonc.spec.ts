// src: ./parser/__tests__/parseJsonc.spec.ts
// JSONC設定ファイル解析のユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// test target
import { parseJsonc } from '../parseJsonc';

/**
 * @fileoverview parseJsonc関数の包括的ユニットテスト
 *
 * このテストスイートは、JSONC（コメント付きJSON）解析関数の
 * 正常ケース、エラーケース、特殊ケースを網羅的にテストします。
 *
 * @module parseJsonc.spec
 */
describe('parseJsonc', () => {
  /**
   * @description 不正なJSON入力のエラーハンドリングテスト
   *
   * 様々な不正なJSON形式（空文字列、単一値、YAML形式など）に対して
   * 適切なエラーハンドリングが行われることを検証します。
   */
  describe('不正なJSONが与えられた場合', () => {
    it('空文字列を与えると空オブジェクトを返すべき', () => {
      const configRaw = '';
      const parsed = parseJsonc(configRaw);
      expect(parsed).toEqual({});
    });

    it('単一の値を与えると例外を投げるべき', () => {
      const configRaw = 'abc';
      expect(() => {
        parseJsonc(configRaw);
      }).toThrow();
    });

    it('YAML形式のkey:valueを与えると例外を投げるべき', () => {
      const configRaw = 'key: abc';
      expect(() => {
        parseJsonc(configRaw);
      }).toThrow();
    });

    it('クォートされていないkeyを与えると例外を投げるべき', () => {
      const configRaw = '{ key }';
      expect(() => {
        parseJsonc(configRaw);
      }).toThrow();
    });

    it('クォートされていないkey:valueを与えると例外を投げるべき', () => {
      const configRaw = '{ key: 123 }';
      expect(() => {
        parseJsonc(configRaw);
      }).toThrow();
    });

    it('値のないクォートされたkeyを与えると例外を投げるべき', () => {
      const configRaw = '{ "key" }';
      expect(() => {
        parseJsonc(configRaw);
      }).toThrow();
    });
  });

  /**
   * @description 有効なJSON形式の正常解析テスト
   *
   * 標準的なJSON形式（文字列、数値、ブール値など）の
   * 正しい解析動作を検証します。
   */
  describe('有効なJSONが与えられた場合', () => {
    it('文字列値を正しく解析すべき', () => {
      const configRaw = '{ "key": "123" }';
      const parsed = parseJsonc(configRaw);
      expect(parsed).toEqual({ key: '123' });
    });

    it('数値を正しく解析すべき', () => {
      const configRaw = '{ "key": 123 }';
      const parsed = parseJsonc(configRaw);
      expect(parsed).toEqual({ key: 123 });
    });

    it('クォートされていない文字列を与えると例外を投げるべき', () => {
      const configRaw = '{ "key": abc }';
      expect(() => {
        parseJsonc(configRaw);
      }).toThrow();
    });

    it('boolean値を正しく解析すべき', () => {
      const configRaw = '{ "key": true }';
      const parsed = parseJsonc(configRaw);
      expect(parsed).toEqual({ key: true });
    });
  });

  /**
   * @description 特殊値の解析テスト
   *
   * null、空文字列、undefinedなどの特殊な値に対する
   * 正しい処理を検証します。
   */
  describe('特殊な値が与えられた場合', () => {
    it('null値を正しく解析すべき', () => {
      const configRaw = '{ "key": null }';
      const parsed = parseJsonc(configRaw);
      expect(parsed).toEqual({ key: null });
    });

    it('空文字列を正しく解析すべき', () => {
      const configRaw = '{ "key": "" }';
      const parsed = parseJsonc(configRaw);
      expect(parsed).toEqual({ key: '' });
    });

    it('値が省略された場合はundefinedを返すべき', () => {
      const configRaw = '{ "key":  }';
      const parsed = parseJsonc(configRaw);
      expect(parsed).toEqual({ key: undefined });
    });
  });

  /**
   * @description 複数プロパティと配列の解析テスト
   *
   * 複数のkey-valueペアや配列を含むJSONの
   * 正しい解析動作を検証します。
   */
  describe('複数の値が与えられた場合', () => {
    it('複数のkey-valueペアを正しく解析すべき', () => {
      const configRaw = '{ "key1": "value1", "key2": "value2" }';
      const parsed = parseJsonc(configRaw);
      expect(parsed).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('配列を含む値を正しく解析すべき', () => {
      const configRaw = '{ "key1": [1, 2, 3], "key2": "value2" }';
      const parsed = parseJsonc(configRaw);
      expect(parsed).toEqual({ key1: [1, 2, 3], key2: 'value2' });
    });
  });

  /**
   * @description ネストした構造の解析テスト
   *
   * オブジェクトのネスト、オブジェクトの配列などの
   * 複雑な構造の正しい解析動作を検証します。
   */
  describe('ネストしたオブジェクトが与えられた場合', () => {
    it('配列とオブジェクトの組み合わせを正しく解析すべき', () => {
      const configRaw = '{ "key1": [1, 2, 3], "key2": { "key3": "value3" } }';
      const parsed = parseJsonc(configRaw);
      expect(parsed).toEqual({ key1: [1, 2, 3], key2: { key3: 'value3' } });
    });

    it('オブジェクトの配列を正しく解析すべき', () => {
      const configRaw = '{ "key1": [ { "key2": "value2" }, { "key3": "value3" } ] }';
      const parsed = parseJsonc(configRaw);
      expect(parsed).toEqual({
        key1: [{ key2: 'value2' }, { key3: 'value3' }],
      });
    });
  });

  /**
   * @description JSONC特有のコメント機能のテスト
   *
   * 行末コメント、複数行コメントなどのJSONC特有の機能を
   * 正しく処理してJSONとして解析できることを検証します。
   */
  describe('コメント付きJSONが与えられた場合', () => {
    it('行末コメントを無視して正しく解析すべき', () => {
      const configRaw = '{ "key1": [1, 2, 3], "key2": { "key3": "value3" } } // comment';
      const parsed = parseJsonc(configRaw);
      expect(parsed).toEqual({ key1: [1, 2, 3], key2: { key3: 'value3' } });
    });

    it('複数行コメントを無視して正しく解析すべき', () => {
      const configRaw = `{
        // comment
        "key1": [1, 2, 3],
        "key2": { "key3": "value3" }
      }`;
      const parsed = parseJsonc(configRaw);
      expect(parsed).toEqual({ key1: [1, 2, 3], key2: { key3: 'value3' } });
    });
  });
});
