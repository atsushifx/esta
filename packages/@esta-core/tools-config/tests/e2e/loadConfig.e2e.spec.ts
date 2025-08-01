// tests/e2e/loadConfig.e2e.spec.ts
// @(#) : loadConfig関数のE2Eテスト（ファイル読み込み専用）
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';
// path
import path from 'node:path';

// test target
import { loadToolsConfig } from '@/core/config/loadToolsConfig';
// e2e framework
import {
  createTempDirectory,
  removeDirectory,
  writeFile,
} from '@agla-e2e/fileio-framework';

/**
 * テストコンテキスト作成ヘルパー
 */
const createTestContext = async (
  testName: string,
  testContext: { task: { id: string } },
): Promise<{ testDir: string; cleanup: () => Promise<void> }> => {
  const testDir = await createTempDirectory(`loadToolsConfig-${testName}-${testContext.task.id}`);
  return {
    testDir,
    cleanup: async () => {
      await removeDirectory(testDir);
    },
  };
};

/**
 * loadToolsConfig関数のE2Eテスト
 * 指定ファイルが正しく読めるかどうかのテスト
 */
describe('loadToolsConfig E2E', () => {
  /**
   * JSONファイル入出力テスト
   * 実際のJSONファイルを使用した読み込み機能の検証
   */
  describe('JSONファイル読み込み', () => {
    it('有効なJSON設定ファイルを読み込める', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('valid-json', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 有効なJSON設定ファイルを作成
      const configFileName = 'tools-config.json';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const configData = {
        defaultInstallDir: 'custom/install/dir',
        defaultTempDir: 'custom/temp/dir',
        tools: [
          {
            installer: 'eget',
            id: 'custom-tool',
            repository: 'custom/repo',
          },
        ],
      };

      await writeFile(configFilePath, JSON.stringify(configData, null, 2));

      // When: 設定ファイルを読み込む
      const config = await loadToolsConfig(configFilePath);

      // Then: 成功して設定が読み込まれる
      expect(config.defaultInstallDir).toBe('custom/install/dir');
      expect(config.defaultTempDir).toBe('custom/temp/dir');
      expect(config.tools).toHaveLength(1);
      expect(config.tools![0].id).toBe('custom-tool');
    });

    it('部分的な設定ファイルを読み込める', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('partial-config', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 部分的な設定ファイルを作成
      const configFileName = 'partial-config.json';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const configData = {
        defaultTempDir: 'custom/temp/dir',
        // defaultInstallDirは指定しない
      };

      await writeFile(configFilePath, JSON.stringify(configData, null, 2));

      // When: 設定ファイルを読み込む
      const config = await loadToolsConfig(configFilePath);

      // Then: 成功して読み込まれる
      expect(config.defaultTempDir).toBe('custom/temp/dir');
      expect(config.defaultInstallDir).toBeUndefined(); // 部分的な設定なので未定義
    });

    it('空のJSONファイルを読み込める', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('empty-json', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 空のJSON設定ファイルを作成
      const configFileName = 'empty-config.json';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const configData = {};

      await writeFile(configFilePath, JSON.stringify(configData, null, 2));

      // When: 設定ファイルを読み込む
      const config = await loadToolsConfig(configFilePath);

      // Then: 成功して空の設定が読み込まれる
      expect(config).toEqual({});
    });
  });

  /**
   * YAMLファイル入出力テスト
   * 実際のYAMLファイルを使用した読み込み機能の検証
   */
  describe('YAMLファイル読み込み', () => {
    it('YAML設定ファイルを読み込める', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('yaml-config', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: YAML設定ファイルを作成
      const configFileName = 'tools-config.yaml';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const yamlContent = `
defaultInstallDir: custom/yaml/dir
defaultTempDir: custom/yaml/tmp
tools:
  - installer: eget
    id: yaml-tool
    repository: yaml/repo
`;

      await writeFile(configFilePath, yamlContent);

      // When: 設定ファイルを読み込む
      const config = await loadToolsConfig(configFilePath);

      // Then: 成功して設定が読み込まれる
      expect(config.defaultInstallDir).toBe('custom/yaml/dir');
      expect(config.defaultTempDir).toBe('custom/yaml/tmp');
      expect(config.tools).toHaveLength(1);
      expect(config.tools![0].id).toBe('yaml-tool');
    });
  });

  /**
   * 複数アイテム処理テスト
   * 複数のツール設定を含むファイルの適切な処理を検証
   */
  describe('複数ツール設定', () => {
    it('複数のツール設定を読み込める', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('multiple-tools', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 複数のツール設定を含むファイルを作成
      const configFileName = 'multi-tools-config.json';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const configData = {
        defaultInstallDir: 'custom/multi/dir',
        tools: [
          {
            installer: 'eget',
            id: 'tool1',
            repository: 'owner1/repo1',
          },
          {
            installer: 'eget',
            id: 'tool2',
            repository: 'owner2/repo2',
          },
        ],
      };

      await writeFile(configFilePath, JSON.stringify(configData, null, 2));

      // When: 設定ファイルを読み込む
      const config = await loadToolsConfig(configFilePath);

      // Then: 成功して複数のツール設定が読み込まれる
      expect(config.tools).toHaveLength(2);
      expect(config.tools![0].id).toBe('tool1');
      expect(config.tools![1].id).toBe('tool2');
    });
  });

  /**
   * ファイルパス処理テスト
   * 相対パス、絶対パスの両方でのファイルアクセスを検証
   */
  describe('パス処理', () => {
    it('相対パスと絶対パスの両方を正しく処理する', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('path-handling', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 設定ファイルを作成
      const configFileName = 'path-test-config.json';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const configData = {
        defaultInstallDir: 'relative/path/dir',
        defaultTempDir: '/absolute/path/dir',
        tools: [
          {
            installer: 'eget',
            id: 'path-test-tool',
            repository: 'owner/repo',
          },
        ],
      };

      await writeFile(configFilePath, JSON.stringify(configData, null, 2));

      // When: 相対パスで設定ファイルを読み込む
      const relativePathConfig = await loadToolsConfig(configFilePath);

      // When: 絶対パスで設定ファイルを読み込む
      const absolutePathConfig = await loadToolsConfig(path.resolve(configFilePath));

      // Then: 両方とも同じ設定が読み込まれる
      expect(relativePathConfig).toEqual(absolutePathConfig);
      expect(relativePathConfig.defaultInstallDir).toBe('relative/path/dir');
      expect(relativePathConfig.defaultTempDir).toBe('/absolute/path/dir');
    });
  });

  /**
   * エラーケーステスト
   * ファイル不存在、無効フォーマットなどのエラーケースでの適切な処理を検証
   */
  describe('エラーハンドリング', () => {
    it('存在しないファイルの場合は空オブジェクトを返す', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('nonexistent-file', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 存在しないファイルパス
      const configFilePath = path.join(ctx.testDir, 'nonexistent-config.json');

      // When: 設定ファイルを読み込む
      const result = await loadToolsConfig(configFilePath);

      // Then: 空オブジェクトを返す
      expect(result).toEqual({});
    });

    it('不正なJSONファイルでエラーが発生する', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('invalid-json', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 不正なJSONファイル
      const configFileName = 'invalid-json.json';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const invalidJsonContent = '{ invalid json content }';

      await writeFile(configFilePath, invalidJsonContent);

      // When: 設定ファイルを読み込む & Then: JSONパースエラーが発生する
      await expect(loadToolsConfig(configFilePath)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining('Configuration validation failed'),
        }),
      );
    });
  });
});
