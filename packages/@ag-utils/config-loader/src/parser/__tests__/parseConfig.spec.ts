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
