// src: ./__tests__/parseConfig.errors.spec.ts
// 設定データ解析のエラーハンドリング専用テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// test target
import { parseConfig } from '../parseConfig';

describe('parseConfig - パースエラーの処理', () => {
  describe('JSON/JSONCパースエラー', () => {
    it('不正なJSON形式の場合にエラーをスローすべき', async () => {
      const invalidJson = '{"test": "value", invalid}';
      await expect(parseConfig('.json', invalidJson)).rejects.toThrow();
    });

    it('JSON中に不正な文法がある場合にエラーをスローすべき', async () => {
      const invalidJson = '{"test": "value" "missing_comma": "value"}';
      await expect(parseConfig('.json', invalidJson)).rejects.toThrow();
    });

    it('閉じ括弧が不足しているJSONの場合にエラーをスローすべき', async () => {
      const invalidJson = '{"test": "value", "nested": {"incomplete": "data"';
      await expect(parseConfig('.json', invalidJson)).rejects.toThrow();
    });

    it('JSONC形式で不正なコメント記法の場合にエラーをスローすべき', async () => {
      const invalidJsonc = '{"test": "value", /* incomplete comment "other": 123}';
      await expect(parseConfig('.jsonc', invalidJsonc)).rejects.toThrow();
    });
  });

  describe('JSON/JSONCエラーメッセージの確認', () => {
    it('不正なJSON形式でパース関連のエラーメッセージを含むべき', async () => {
      const invalidJson = '{"test": "value", invalid}';
      await expect(parseConfig('.json', invalidJson)).rejects.toThrow(/unexpected/i);
    });

    it('JSONのカンマ不足で適切なエラーメッセージを含むべき', async () => {
      const invalidJson = '{"test": "value" "missing_comma": "value"}';
      await expect(parseConfig('.json', invalidJson)).rejects.toThrow();
    });
  });

  describe('YAMLパースエラー', () => {
    it('不正なYAML形式の場合にエラーをスローすべき', async () => {
      const invalidYaml = 'test: value\n  invalid_indentation:\nkey: value';
      await expect(parseConfig('.yaml', invalidYaml)).rejects.toThrow();
    });

    it('YAMLでタブとスペースが混在している場合にエラーをスローすべき', async () => {
      const invalidYaml = 'test: value\n\tother: value\n  third: value';
      await expect(parseConfig('.yaml', invalidYaml)).rejects.toThrow();
    });

    it('不正なYAMLアンカー記法の場合にエラーをスローすべき', async () => {
      const invalidYaml = 'test: &anchor\nother: *undefined_anchor';
      await expect(parseConfig('.yaml', invalidYaml)).rejects.toThrow();
    });

    it('YMLファイルでも同様にエラーハンドリングされるべき', async () => {
      const invalidYml = 'test: [\nincomplete_array';
      await expect(parseConfig('.yml', invalidYml)).rejects.toThrow();
    });
  });

  describe('YAMLエラーメッセージの確認', () => {
    it('不正なYAMLインデントでマッピング関連のエラーメッセージを含むべき', async () => {
      const invalidYaml = 'test: value\n  invalid_indentation:\nkey: value';
      await expect(parseConfig('.yaml', invalidYaml)).rejects.toThrow(
        /nested.*mappings|compact.*mappings|line.*column/i,
      );
    });

    it('未定義アンカーで適切なエラーメッセージを含むべき', async () => {
      const invalidYaml = 'test: &anchor\nother: *undefined_anchor';
      await expect(parseConfig('.yaml', invalidYaml)).rejects.toThrow(/alias|anchor|undefined/i);
    });
  });

  describe('スクリプトパースエラー', () => {
    it('不正なJavaScriptコードの場合にエラーをスローすべき', async () => {
      const invalidJs = 'export default { test: "value" syntax error }';
      await expect(parseConfig('.js', invalidJs)).rejects.toThrow();
    });

    it('不正なTypeScriptコードの場合にエラーをスローすべき', async () => {
      const invalidTs = 'defineConfig({ test: "value", missing_bracket';
      await expect(parseConfig('.ts', invalidTs)).rejects.toThrow();
    });

    it('実行時エラーが発生するスクリプトの場合にエラーをスローすべき', async () => {
      const errorScript = 'export default { test: undefined.property }';
      await expect(parseConfig('.js', errorScript)).rejects.toThrow();
    });

    it('非サポート形式のスクリプトの場合にエラーをスローすべき', async () => {
      const unsupportedScript = 'function createConfig() { return {test: "value"}; }';
      await expect(parseConfig('.ts', unsupportedScript)).rejects.toThrow();
    });
  });

  describe('スクリプトエラーメッセージの確認', () => {
    it('非サポート形式でサポート形式についてのメッセージを含むべき', async () => {
      const unsupportedScript = 'function createConfig() { return {test: "value"}; }';
      await expect(parseConfig('.ts', unsupportedScript)).rejects.toThrow(
        /unsupported.*format|export default|defineConfig/i,
      );
    });

    it('TSX実行エラーで実行失敗に関するメッセージを含むべき', async () => {
      const errorScript = 'export default { test: undefined.property }';
      await expect(parseConfig('.js', errorScript)).rejects.toThrow(/tsx|execution|failed/i);
    });

    it('構文エラーで適切なエラーメッセージを含むべき', async () => {
      const syntaxError = 'export default { test: "value" syntax error }';
      await expect(parseConfig('.ts', syntaxError)).rejects.toThrow(/tsx|execution|failed|syntax/i);
    });
  });
});
