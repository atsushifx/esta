// src: ./__tests__/parseConfig.spec.ts
// 設定データ解析ルーターのユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// test target
import { parseConfig } from '../parseConfig';

describe('parseConfig', () => {
  describe('基本的な設定形式の解析', () => {
    it('JSON設定を正しく解析すべき', async () => {
      const raw = '{"test": "value"}';
      const result = await parseConfig('.json', raw);
      expect(result).toEqual({ test: 'value' });
    });

    it('JSONC設定を正しく解析すべき', async () => {
      const raw = '{"test": "value", /* comment */ "other": 123}';
      const result = await parseConfig('.jsonc', raw);
      expect(result).toEqual({ test: 'value', other: 123 });
    });

    it('YAML設定を正しく解析すべき', async () => {
      const raw = 'test: value\nother: 123';
      const result = await parseConfig('.yaml', raw);
      expect(result).toEqual({ test: 'value', other: 123 });
    });

    it('YML設定を正しく解析すべき', async () => {
      const raw = 'test: value';
      const result = await parseConfig('.yml', raw);
      expect(result).toEqual({ test: 'value' });
    });

    it('TypeScript設定を正しく解析すべき', async () => {
      const raw = 'defineConfig({ test: "value" })';
      const result = await parseConfig('.ts', raw);
      expect(result).toEqual({ test: 'value' });
    });

    it('JavaScript設定を正しく解析すべき', async () => {
      const raw = 'defineConfig({ test: "value" })';
      const result = await parseConfig('.js', raw);
      expect(result).toEqual({ test: 'value' });
    });
  });

  describe('エラーハンドリングと特殊ケース', () => {
    it('未知の拡張子の場合は空オブジェクトを返すべき', async () => {
      const raw = 'some content';
      const result = await parseConfig('.unknown', raw);
      expect(result).toEqual({});
    });

    it('大文字小文字を区別せずに拡張子を処理すべき', async () => {
      const raw = '{"test": "value"}';
      const result = await parseConfig('.JSON', raw);
      expect(result).toEqual({ test: 'value' });
    });

    it('undefined の生データを適切に処理すべき', async () => {
      const result = await parseConfig('.json', undefined);
      expect(result).toEqual({});
    });
  });

  describe('型安全性とジェネリック対応', () => {
    it('ジェネリック型でJSON設定を正しく解析すべき', async () => {
      type TestConfig = {
        name: string;
        version: number;
      };
      const raw = '{"name": "test", "version": 1}';
      const result = await parseConfig<TestConfig>('.json', raw);
      expect(result).toEqual({ name: 'test', version: 1 });
      expect(result.name).toBe('test');
      expect(result.version).toBe(1);
    });

    it('ジェネリック型でYAML設定を正しく解析すべき', async () => {
      type TestConfig = {
        database: {
          host: string;
          port: number;
        };
      };
      const raw = 'database:\n  host: localhost\n  port: 5432';
      const result = await parseConfig<TestConfig>('.yaml', raw);
      expect(result.database.host).toBe('localhost');
      expect(result.database.port).toBe(5432);
    });

    it('ジェネリック型でTypeScript設定を正しく解析すべき', async () => {
      type TestConfig = {
        api: {
          endpoint: string;
          timeout: number;
        };
      };
      const raw = 'defineConfig({ api: { endpoint: "/api/v1", timeout: 5000 } })';
      const result = await parseConfig<TestConfig>('.ts', raw);
      expect(result.api.endpoint).toBe('/api/v1');
      expect(result.api.timeout).toBe(5000);
    });
  });
});
