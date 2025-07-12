// src: ./parser/__tests__/parseYaml.spec.ts
// YAML設定ファイル解析のユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// test target
import { parseYaml } from '../parseYaml';

/**
 * @fileoverview parseYaml関数の包括的ユニットテスト
 *
 * このテストスイートは、YAML解析関数の様々な入力ケースでの
 * 正常動作とエラーハンドリングを網羅的にテストします。
 *
 * @module parseYaml.spec
 */
describe('parseYaml', () => {
  /**
   * @description 空値や無効入力のエラーハンドリングテスト
   *
   * undefined、空文字列などの無効な入力に対して
   * 適切なデフォルト値（空オブジェクト）を返すことを検証します。
   */
  describe('空または無効な入力が与えられた場合', () => {
    it('undefinedが与えられると空オブジェクトを返すべき', () => {
      const result = parseYaml(undefined);
      expect(result).toEqual({});
    });

    it('空文字列が与えられると空オブジェクトを返すべき', () => {
      const result = parseYaml('');
      expect(result).toEqual({});
    });
  });

  /**
   * @description 基本的なYAML形式の解析テスト
   *
   * シンプルなkey-valueペアや異なるデータ型（文字列、数値、ブール値、null）の
   * 正しい解析動作を検証します。
   */
  describe('シンプルなYAMLが与えられた場合', () => {
    it('シンプルなkey-valueペアを正しく解析すべき', () => {
      const yamlContent = `
key1: value1
key2: value2
`;
      const result = parseYaml(yamlContent);
      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('異なるデータ型を正しく解析すべき', () => {
      const yamlContent = `
string: hello
number: 123
boolean: true
null_value: null
`;
      const result = parseYaml(yamlContent);
      expect(result).toEqual({
        string: 'hello',
        number: 123,
        boolean: true,
        null_value: null,
      });
    });
  });

  /**
   * @description YAML配列構造の解析テスト
   *
   * リスト形式とインライン配列形式の両方の配列表現を
   * 正しく解析できることを検証します。
   */
  describe('配列が与えられた場合', () => {
    it('配列値を正しく解析すべき', () => {
      const yamlContent = `
items:
  - item1
  - item2
  - item3
numbers: [1, 2, 3]
`;
      const result = parseYaml(yamlContent);
      expect(result).toEqual({
        items: ['item1', 'item2', 'item3'],
        numbers: [1, 2, 3],
      });
    });
  });

  /**
   * @description ネストしたオブジェクト構造の解析テスト
   *
   * 階層的なオブジェクト構造や深いネストを含むYAMLの
   * 正しい解析動作を検証します。
   */
  describe('ネストしたオブジェクトが与えられた場合', () => {
    it('ネストしたオブジェクトを正しく解析すべき', () => {
      const yamlContent = `
database:
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: secret
`;
      const result = parseYaml(yamlContent);
      expect(result).toEqual({
        database: {
          host: 'localhost',
          port: 5432,
          credentials: {
            username: 'admin',
            password: 'secret',
          },
        },
      });
    });
  });

  /**
   * @description 複雑な混合構造の解析テスト
   *
   * 配列とオブジェクトが混在した複雑なYAML構造の
   * 正しい解析動作を検証します。
   */
  describe('複雑な構造が与えられた場合', () => {
    it('配列とオブジェクトの混合構造を正しく解析すべき', () => {
      const yamlContent = `
servers:
  - name: web1
    host: 192.168.1.1
    ports: [80, 443]
  - name: web2
    host: 192.168.1.2
    ports: [80, 443]
`;
      const result = parseYaml(yamlContent);
      expect(result).toEqual({
        servers: [
          {
            name: 'web1',
            host: '192.168.1.1',
            ports: [80, 443],
          },
          {
            name: 'web2',
            host: '192.168.1.2',
            ports: [80, 443],
          },
        ],
      });
    });
  });
});
