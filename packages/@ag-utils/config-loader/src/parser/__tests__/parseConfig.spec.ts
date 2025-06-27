// src: /parser/__tests__/parseConfig.spec.ts
// モジュール設定データ解析ユーティリティのユニットテスト
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
  describe('JSON/JSONC formats', () => {
    it('should parse JSON config', () => {
      const raw = '{"test": "value"}';
      const result = parseConfig('.json', raw);
      expect(result).toEqual({ test: 'value' });
    });

    it('should parse JSONC config', () => {
      const raw = '{"test": "value", /* comment */ "other": 123}';
      const result = parseConfig('.jsonc', raw);
      expect(result).toEqual({ test: 'value', other: 123 });
    });

    it('should work with generic types - JSON', () => {
      type TestConfig = {
        name: string;
        version: number;
      };
      const raw = '{"name": "test", "version": 1}';
      const result = parseConfig<TestConfig>('.json', raw);
      expect(result).toEqual({ name: 'test', version: 1 });
      expect(result.name).toBe('test');
      expect(result.version).toBe(1);
    });
  });

  describe('YAML formats', () => {
    it('should parse YAML config', () => {
      const raw = 'test: value\nother: 123';
      const result = parseConfig('.yaml', raw);
      expect(result).toEqual({ test: 'value', other: 123 });
    });

    it('should parse YML config', () => {
      const raw = 'test: value';
      const result = parseConfig('.yml', raw);
      expect(result).toEqual({ test: 'value' });
    });

    it('should work with generic types - YAML', () => {
      type TestConfig = {
        database: {
          host: string;
          port: number;
        };
      };
      const raw = 'database:\n  host: localhost\n  port: 5432';
      const result = parseConfig<TestConfig>('.yaml', raw);
      expect(result.database.host).toBe('localhost');
      expect(result.database.port).toBe(5432);
    });
  });

  describe('JavaScript/TypeScript formats', () => {
    it('should parse TypeScript config', () => {
      const raw = 'defineConfig({ test: "value" })';
      const result = parseConfig('.ts', raw);
      expect(result).toEqual({ test: 'value' });
    });

    it('should parse JavaScript config', () => {
      const raw = 'defineConfig({ test: "value" })';
      const result = parseConfig('.js', raw);
      expect(result).toEqual({ test: 'value' });
    });

    it('should work with generic types - TypeScript', () => {
      type TestConfig = {
        api: {
          endpoint: string;
          timeout: number;
        };
      };
      const raw = 'defineConfig({ api: { endpoint: "/api/v1", timeout: 5000 } })';
      const result = parseConfig<TestConfig>('.ts', raw);
      expect(result.api.endpoint).toBe('/api/v1');
      expect(result.api.timeout).toBe(5000);
    });
  });

  describe('Markdown formats', () => {
    it('should parse markdown with marked library', () => {
      const raw = '# Title\n\nThis is a **markdown** content.';
      const result = parseConfig('.md', raw);
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('raw', raw);
    });
  });

  describe('Error/Wildcard formats', () => {
    it('should parse error file as plaintext by default', () => {
      const raw = 'Error: Something went wrong\nStack trace here';
      const result = parseConfig('.error', raw);
      expect(result).toEqual({ content: raw });
    });

    it('should parse error file as markdown when option specified', () => {
      const raw = '# Error Log\n\n**Error**: Something went wrong';
      const result = parseConfig('.error', raw, { parseAs: 'md' });
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('raw', raw);
    });

    it('should parse error file as plaintext when explicitly specified', () => {
      const raw = 'Error: Something went wrong\nStack trace here';
      const result = parseConfig('.error', raw, { parseAs: 'plaintext' });
      expect(result).toEqual({ content: raw });
    });
  });

  describe('General behavior', () => {
    it('should return empty object for unknown extension', () => {
      const raw = 'some content';
      const result = parseConfig('.unknown', raw);
      expect(result).toEqual({});
    });

    it('should handle case insensitive extensions', () => {
      const raw = '{"test": "value"}';
      const result = parseConfig('.JSON', raw);
      expect(result).toEqual({ test: 'value' });
    });

    it('should handle undefined raw data', () => {
      const result = parseConfig('.json', undefined);
      expect(result).toEqual({});
    });
  });
});
