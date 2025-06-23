// src: ./utils/__tests__/parseConfig.spec.ts
// 設定データ解析ユーティリティのユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// test unit
import { parseJsoncConfig } from '../parseConfig';

// types

// testMain
describe('parseConfig JSONC format', () => {
  describe('parse invalid json', () => {
    it('if null is given', () => {
      const configRaw = '';
      const parsed = parseJsoncConfig(configRaw);
      expect(parsed).toEqual({});
    });

    it('if single value is given', () => {
      const configRaw = 'abc';
      expect(() => {
        parseJsoncConfig(configRaw);
      }).toThrow();
    });

    it('if single key:value is  given', () => {
      const configRaw = 'key: abc';
      expect(() => {
        parseJsoncConfig(configRaw);
      }).toThrow();
    });

    it('if braced key is  given', () => {
      const configRaw = '{ key }';
      expect(() => {
        parseJsoncConfig(configRaw);
      }).toThrow();
    });

    it('if braced key:value is  given', () => {
      const configRaw = '{ key: 123 }';
      expect(() => {
        parseJsoncConfig(configRaw);
      }).toThrow();
    });

    it('if braced "key" is  given', () => {
      const configRaw = '{ "key" }';
      expect(() => {
        parseJsoncConfig(configRaw);
      }).toThrow();
    });
  });

  describe('parse valid json on simple value', () => {
    it('if braced "key":"value" is  given', () => {
      const configRaw = '{ "key": "123" }';
      const parsed = parseJsoncConfig(configRaw);
      expect(parsed).toEqual({ key: '123' });
    });

    it('if braced "key": value is  given', () => {
      const configRaw = '{ "key": 123 }';
      const parsed = parseJsoncConfig(configRaw);
      expect(parsed).toEqual({ key: 123 });
    });

    it('if braced "key": string cause syntax error', () => {
      const configRaw = '{ "key": abc }';
      expect(() => {
        parseJsoncConfig(configRaw);
      }).toThrow();
    });

    it('if braced "key": true set boolean value', () => {
      const configRaw = '{ "key": true }';
      const parsed = parseJsoncConfig(configRaw);
      expect(parsed).toEqual({ key: true });
    });
  });

  describe('check special value', () => {
    it('if values is null', () => {
      const configRaw = '{ "key": null }';
      const parsed = parseJsoncConfig(configRaw);
      expect(parsed).toEqual({ key: null });
    });

    it('if values is null string (="")', () => {
      const configRaw = '{ "key": "" }';
      const parsed = parseJsoncConfig(configRaw);
      expect(parsed).toEqual({ key: '' });
    });

    it('if no values is given', () => {
      const configRaw = '{ "key":  }';
      const parsed = parseJsoncConfig(configRaw);
      expect(parsed).toEqual({ key: undefined });
    });
  });

  describe('check multiple values', () => {
    it('if braced "key1": "value1", "key2": "value2" is  given', () => {
      const configRaw = '{ "key1": "value1", "key2": "value2" }';
      const parsed = parseJsoncConfig(configRaw);
      expect(parsed).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('if array value is  given', () => {
      const configRaw = '{ "key1": [1, 2, 3], "key2": "value2" }';
      const parsed = parseJsoncConfig(configRaw);
      expect(parsed).toEqual({ key1: [1, 2, 3], key2: 'value2' });
    });
  });

  describe('check complex and nested values', () => {
    it('if array with braced value is given', () => {
      const configRaw = '{ "key1": [1, 2, 3], "key2": { "key3": "value3" } }';
      const parsed = parseJsoncConfig(configRaw);
      expect(parsed).toEqual({ key1: [1, 2, 3], key2: { key3: 'value3' } });
    });

    it('if brace value array are given"', () => {
      const configRaw = '{ "key1": [ { "key2": "value2" }, { "key3": "value3" } ] }';
      const parsed = parseJsoncConfig(configRaw);
      expect(parsed).toEqual({
        key1: [{ key2: 'value2' }, { key3: 'value3' }],
      });
    });
  });

  describe('check with comment json', () => {
    it('if comment json is given', () => {
      const configRaw = '{ "key1": [1, 2, 3], "key2": { "key3": "value3" } } // comment';
      const parsed = parseJsoncConfig(configRaw);
      expect(parsed).toEqual({ key1: [1, 2, 3], key2: { key3: 'value3' } });
    });

    it('if comment json is given with multi line', () => {
      const configRaw = `{
        // comment
        "key1": [1, 2, 3],
        "key2": { "key3": "value3" }
      }`;
      const parsed = parseJsoncConfig(configRaw);
      expect(parsed).toEqual({ key1: [1, 2, 3], key2: { key3: 'value3' } });
    });
  });
});
