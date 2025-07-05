// src: ./parser/__tests__/parseScript.spec.ts
// parseScript関数のBDDテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// test target
import { defineConfig, parseScript } from '../parseScript';

describe('parseScript', () => {
  describe('空または無効な入力が与えられた場合', () => {
    it('undefinedが与えられると空オブジェクトを返すべき', () => {
      const result = parseScript(undefined);
      expect(result).toEqual({});
    });

    it('空文字列が与えられると空オブジェクトを返すべき', () => {
      const result = parseScript('');
      expect(result).toEqual({});
    });

    it('無効な構文が与えられると空オブジェクトを返すべき', () => {
      const result = parseScript('invalid syntax');
      expect(result).toEqual({});
    });
  });

  describe('シンプルな設定が与えられた場合', () => {
    it('シンプルなオブジェクトリテラルを正しく解析すべき', () => {
      const jsContent = '{ key1: "value1", key2: 123 }';
      const result = parseScript(jsContent);
      expect(result).toEqual({
        key1: 'value1',
        key2: 123,
      });
    });

    it('defineConfigで包まれた設定を正しく解析すべき', () => {
      const jsContent = 'defineConfig({ key1: "value1", key2: 123 })';
      const result = parseScript(jsContent);
      expect(result).toEqual({
        key1: 'value1',
        key2: 123,
      });
    });
  });

  describe('複雑な設定が与えられた場合', () => {
    it('ネストしたオブジェクトを正しく解析すべき', () => {
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
      const result = parseScript(jsContent);
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

    it('配列と混合型を正しく解析すべき', () => {
      const jsContent = `defineConfig({
        servers: ["web1", "web2"],
        ports: [80, 443],
        enabled: true,
        timeout: null
      })`;
      const result = parseScript(jsContent);
      expect(result).toEqual({
        servers: ['web1', 'web2'],
        ports: [80, 443],
        enabled: true,
        timeout: null,
      });
    });

    it('オブジェクトの配列を正しく解析すべき', () => {
      const jsContent = `defineConfig({
        plugins: [
          { name: "plugin1", enabled: true },
          { name: "plugin2", enabled: false }
        ]
      })`;
      const result = parseScript(jsContent);
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
  describe('設定オブジェクトが与えられた場合', () => {
    it('渡されたオブジェクトをそのまま返すべき', () => {
      const config = { key1: 'value1', key2: 123 };
      const result = defineConfig(config);
      expect(result).toBe(config);
      expect(result).toEqual(config);
    });

    it('型情報を保持すべき', () => {
      type TestConfig = {
        name: string;
        version: number;
      };
      const config: TestConfig = { name: 'test', version: 1 };
      const result = defineConfig(config);
      expect(result).toEqual(config);
    });
  });
});
