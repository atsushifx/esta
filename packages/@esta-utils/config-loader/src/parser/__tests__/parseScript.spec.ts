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

describe('parseScript', () => {
  describe('空または無効な入力が与えられた場合', () => {
    it('undefinedが与えられると空オブジェクトを返すべき', async () => {
      const result = await parseScript(undefined);
      expect(result).toEqual({});
    });

    it('空文字列が与えられると空オブジェクトを返すべき', async () => {
      const result = await parseScript('');
      expect(result).toEqual({});
    });

    it('無効な構文が与えられると空オブジェクトを返すべき', async () => {
      const result = await parseScript('invalid syntax');
      expect(result).toEqual({});
    });
  });

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
