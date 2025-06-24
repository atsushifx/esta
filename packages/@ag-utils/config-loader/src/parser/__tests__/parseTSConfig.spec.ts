// src: ./utils/__tests__/parseWithModule.spec.ts
// モジュール設定データ解析ユーティリティのユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// test unit
import { defineConfig, parseTSConfig } from '../parseWithModule';

// testMain
describe('parseTSConfig', () => {
  describe('handle empty or invalid input', () => {
    it('returns empty object for undefined input', () => {
      const result = parseTSConfig(undefined);
      expect(result).toEqual({});
    });

    it('returns empty object for empty string', () => {
      const result = parseTSConfig('');
      expect(result).toEqual({});
    });

    it('returns empty object for invalid syntax', () => {
      const result = parseTSConfig('invalid syntax');
      expect(result).toEqual({});
    });
  });

  describe('parse simple configurations', () => {
    it('parses simple object literal', () => {
      const jsContent = '{ key1: "value1", key2: 123 }';
      const result = parseTSConfig(jsContent);
      expect(result).toEqual({
        key1: 'value1',
        key2: 123,
      });
    });

    it('parses configuration with defineConfig', () => {
      const jsContent = 'defineConfig({ key1: "value1", key2: 123 })';
      const result = parseTSConfig(jsContent);
      expect(result).toEqual({
        key1: 'value1',
        key2: 123,
      });
    });
  });

  describe('parse complex configurations', () => {
    it('parses nested objects', () => {
      const jsContent = `defineConfig({
        database: {
          host: "localhost",
          port: 5432,
          credentials: {
            username: "admin",
            password: "secret"
          }
        }
      })`;
      const result = parseTSConfig(jsContent);
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

    it('parses arrays and mixed types', () => {
      const jsContent = `defineConfig({
        servers: ["web1", "web2"],
        ports: [80, 443],
        enabled: true,
        timeout: null
      })`;
      const result = parseTSConfig(jsContent);
      expect(result).toEqual({
        servers: ['web1', 'web2'],
        ports: [80, 443],
        enabled: true,
        timeout: null,
      });
    });

    it('parses array of objects', () => {
      const jsContent = `defineConfig({
        plugins: [
          { name: "plugin1", enabled: true },
          { name: "plugin2", enabled: false }
        ]
      })`;
      const result = parseTSConfig(jsContent);
      expect(result).toEqual({
        plugins: [
          { name: 'plugin1', enabled: true },
          { name: 'plugin2', enabled: false },
        ],
      });
    });
  });
});

describe('defineConfig', () => {
  it('returns the same object passed to it', () => {
    const config = { key1: 'value1', key2: 123 };
    const result = defineConfig(config);
    expect(result).toBe(config);
    expect(result).toEqual(config);
  });

  it('preserves type information', () => {
    type TestConfig = {
      name: string;
      version: number;
    };
    const config: TestConfig = { name: 'test', version: 1 };
    const result = defineConfig(config);
    expect(result).toEqual(config);
  });
});
