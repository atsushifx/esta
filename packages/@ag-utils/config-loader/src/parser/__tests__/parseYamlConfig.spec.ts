// src: ./utils/__tests__/parseYamlConfig.spec.ts
// YAML設定データ解析ユーティリティのユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// test unit
import { parseYamlConfig } from '../parseWithModule';

// testMain
describe('parseYamlConfig', () => {
  describe('handle empty or invalid input', () => {
    it('returns empty object for undefined input', () => {
      const result = parseYamlConfig(undefined);
      expect(result).toEqual({});
    });

    it('returns empty object for empty string', () => {
      const result = parseYamlConfig('');
      expect(result).toEqual({});
    });
  });

  describe('parse simple YAML', () => {
    it('parses simple key-value pairs', () => {
      const yamlContent = `
key1: value1
key2: value2
`;
      const result = parseYamlConfig(yamlContent);
      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('parses different data types', () => {
      const yamlContent = `
string: hello
number: 123
boolean: true
null_value: null
`;
      const result = parseYamlConfig(yamlContent);
      expect(result).toEqual({
        string: 'hello',
        number: 123,
        boolean: true,
        null_value: null,
      });
    });
  });

  describe('parse arrays', () => {
    it('parses array values', () => {
      const yamlContent = `
items:
  - item1
  - item2
  - item3
numbers: [1, 2, 3]
`;
      const result = parseYamlConfig(yamlContent);
      expect(result).toEqual({
        items: ['item1', 'item2', 'item3'],
        numbers: [1, 2, 3],
      });
    });
  });

  describe('parse nested objects', () => {
    it('parses nested objects', () => {
      const yamlContent = `
database:
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: secret
`;
      const result = parseYamlConfig(yamlContent);
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

  describe('parse complex structures', () => {
    it('parses mixed arrays and objects', () => {
      const yamlContent = `
servers:
  - name: web1
    host: 192.168.1.1
    ports: [80, 443]
  - name: web2
    host: 192.168.1.2
    ports: [80, 443]
`;
      const result = parseYamlConfig(yamlContent);
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
