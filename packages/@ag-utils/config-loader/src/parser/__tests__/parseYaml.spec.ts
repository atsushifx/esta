// src: ./parser/__tests__/parseYaml.spec.ts
// parseYaml関数のBDDテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// test target
import { parseYaml } from '../parseYaml';

describe('parseYaml', () => {
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
