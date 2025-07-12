// src: ./parser/__tests__/parseScript.spec.ts
// JavaScript/TypeScript設定ファイル解析のユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// test target
import { defineConfig, parseScript } from '../parseScript';

/**
 * @fileoverview parseScript関数の包括的ユニットテスト
 *
 * このテストスイートは、JavaScript/TypeScriptスクリプト解析関数の
 * 様々なスクリプト形式での正常動作とエラーハンドリングをテストします。
 *
 * @module parseScript.spec
 */
describe('parseScript', () => {
  /**
   * @description 空値や無効入力のエラーハンドリングテスト
   *
   * undefined、空文字列、サポートされない構文などに対する
   * 適切なエラーハンドリングを検証します。
   */
  describe('空または無効な入力が与えられた場合', () => {
    it('undefinedが与えられると空オブジェクトを返すべき', async () => {
      const result = await parseScript(undefined);
      expect(result).toEqual({});
    });

    it('空文字列が与えられると空オブジェクトを返すべき', async () => {
      const result = await parseScript('');
      expect(result).toEqual({});
    });

    it('無効な構文が与えられるとエラーをスローすべき', async () => {
      await expect(parseScript('invalid syntax')).rejects.toThrow(/unsupported.*format/i);
    });
  });

  /**
   * @description ES6 export default形式のスクリプト解析テスト
   *
   * export default構文を使用した様々な設定形式（シンプル、ネスト、配列含み）の
   * 正しい解析動作を検証します。
   */
  describe('export default形式の設定が与えられた場合', () => {
    it('export defaultでシンプルなオブジェクトを正しく解析すべき', async () => {
      const jsContent = 'export default { key1: "value1", key2: 123 }';
      const result = await parseScript(jsContent);
      expect(result).toEqual({
        key1: 'value1',
        key2: 123,
      });
    });

    it('export defaultでネストしたオブジェクトを正しく解析すべき', async () => {
      const jsContent = `export default {
        database: {
          host: "localhost",
          port: 5432,
          credentials: {
            username: "admin",
            password: "secret"
          }
        }
      }`;
      const result = await parseScript(jsContent);
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

    it('export defaultで配列を含む設定を正しく解析すべき', async () => {
      const jsContent = `export default {
        servers: ["web1", "web2"],
        ports: [80, 443],
        enabled: true,
        timeout: null
      }`;
      const result = await parseScript(jsContent);
      expect(result).toEqual({
        servers: ['web1', 'web2'],
        ports: [80, 443],
        enabled: true,
        timeout: null,
      });
    });

    it('export defaultでdefineConfigを包んだ設定を正しく解析すべき', async () => {
      const jsContent = 'export default defineConfig({ key1: "value1", key2: 123 })';
      const result = await parseScript(jsContent);
      expect(result).toEqual({
        key1: 'value1',
        key2: 123,
      });
    });
  });

  /**
   * @description defineConfigラッパー関数形式のスクリプト解析テスト
   *
   * defineConfig()関数を使用した型安全な設定定義形式の
   * 正しい解析動作を検証します。
   */
  describe('defineConfig形式の設定が与えられた場合', () => {
    it('defineConfigでシンプルなオブジェクトを正しく解析すべき', async () => {
      const jsContent = 'defineConfig({ key1: "value1", key2: 123 })';
      const result = await parseScript(jsContent);
      expect(result).toEqual({
        key1: 'value1',
        key2: 123,
      });
    });

    it('defineConfigでネストしたオブジェクトを正しく解析すべき', async () => {
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
      const result = await parseScript(jsContent);
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

    it('defineConfigで配列と混合型を正しく解析すべき', async () => {
      const jsContent = `defineConfig({
        servers: ["web1", "web2"],
        ports: [80, 443],
        enabled: true,
        timeout: null
      })`;
      const result = await parseScript(jsContent);
      expect(result).toEqual({
        servers: ['web1', 'web2'],
        ports: [80, 443],
        enabled: true,
        timeout: null,
      });
    });

    it('defineConfigでオブジェクトの配列を正しく解析すべき', async () => {
      const jsContent = `defineConfig({
        plugins: [
          { name: "plugin1", enabled: true },
          { name: "plugin2", enabled: false }
        ]
      })`;
      const result = await parseScript(jsContent);
      expect(result).toEqual({
        plugins: [
          { name: 'plugin1', enabled: true },
          { name: 'plugin2', enabled: false },
        ],
      });
    });
  });

  /**
   * @description オブジェクトリテラル形式のスクリプト解析テスト
   *
   * 純粋なオブジェクトリテラル{ ... }形式の設定の
   * 正しい解析動作を検証します。
   */
  describe('生のオブジェクトリテラル形式の設定が与えられた場合', () => {
    it('シンプルなオブジェクトリテラルを正しく解析すべき', async () => {
      const jsContent = '{ key1: "value1", key2: 123 }';
      const result = await parseScript(jsContent);
      expect(result).toEqual({
        key1: 'value1',
        key2: 123,
      });
    });

    it('ネストしたオブジェクトリテラルを正しく解析すべき', async () => {
      const jsContent = `{
        api: {
          baseUrl: "https://api.example.com",
          version: "v1",
          auth: {
            type: "bearer",
            token: "secret-token"
          }
        }
      }`;
      const result = await parseScript(jsContent);
      expect(result).toEqual({
        api: {
          baseUrl: 'https://api.example.com',
          version: 'v1',
          auth: {
            type: 'bearer',
            token: 'secret-token',
          },
        },
      });
    });

    it('配列を含むオブジェクトリテラルを正しく解析すべき', async () => {
      const jsContent = `{
        environments: ["development", "staging", "production"],
        features: {
          logging: true,
          metrics: false,
          cache: {
            enabled: true,
            ttl: 3600
          }
        }
      }`;
      const result = await parseScript(jsContent);
      expect(result).toEqual({
        environments: ['development', 'staging', 'production'],
        features: {
          logging: true,
          metrics: false,
          cache: {
            enabled: true,
            ttl: 3600,
          },
        },
      });
    });

    it('複雑なオブジェクトリテラルを正しく解析すべき', async () => {
      const jsContent = `{
        tasks: [
          {
            name: "build",
            commands: ["npm run build", "npm run test"],
            parallel: false
          },
          {
            name: "deploy",
            commands: ["docker build .", "docker push"],
            parallel: true
          }
        ],
        config: {
          timeout: 300,
          retries: 3
        }
      }`;
      const result = await parseScript(jsContent);
      expect(result).toEqual({
        tasks: [
          {
            name: 'build',
            commands: ['npm run build', 'npm run test'],
            parallel: false,
          },
          {
            name: 'deploy',
            commands: ['docker build .', 'docker push'],
            parallel: true,
          },
        ],
        config: {
          timeout: 300,
          retries: 3,
        },
      });
    });
  });
});

/**
 * @fileoverview defineConfigユーティリティ関数のユニットテスト
 *
 * このテストスイートは、型安全性を提供するdefineConfigヘルパー関数の
 * 正しい動作と型保持機能を検証します。
 *
 * @module defineConfig.spec
 */
describe('defineConfig', () => {
  /**
   * @description 設定オブジェクトの処理と型保持テスト
   *
   * defineConfig関数に渡された設定オブジェクトが
   * そのまま返され、型情報が保持されることを検証します。
   */
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

    it('ネストした設定オブジェクトを正しく処理すべき', () => {
      const config = {
        app: {
          name: 'my-app',
          version: '1.0.0',
          features: ['auth', 'logging', 'metrics'],
        },
        database: {
          host: 'localhost',
          port: 5432,
        },
      };
      const result = defineConfig(config);
      expect(result).toBe(config);
      expect(result).toEqual(config);
    });
  });
});
