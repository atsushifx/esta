// tests/e2e/getToolsConfig.e2e.spec.ts
// @(#) : getToolsConfig関数のE2Eテスト（完全なワークフロー）
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
import { getToolsConfig } from '@/getToolsConfig';
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
  const testDir = await createTempDirectory(`getToolsConfig-${testName}-${testContext.task.id}`);
  return {
    testDir,
    cleanup: async () => {
      await removeDirectory(testDir);
    },
  };
};

/**
 * getToolsConfig関数のE2Eテスト
 * ファイル読み込み・デフォルト設定マージ・検証の完全なワークフローをテスト
 */
describe('getToolsConfig E2E', () => {
  /**
   * 完全なワークフローテスト
   * 設定ファイル読み込みからデフォルト値マージまでの全フローを検証
   */
  describe('完全ワークフロー', () => {
    it('JSONファイルから設定を読み込み、デフォルト値とマージした完全設定を返す', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('json-workflow', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 部分的なJSON設定ファイルを作成
      const configFileName = 'tools-config.json';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const partialConfigData = {
        defaultTempDir: 'custom/temp/dir',
        tools: [
          {
            installer: 'eget',
            id: 'custom-tool',
            repository: 'custom/repo',
            version: 'v1.0.0',
          },
        ],
      };

      await writeFile(configFilePath, JSON.stringify(partialConfigData, null, 2));

      // When: getToolsConfigで設定を取得
      const config = await getToolsConfig(configFilePath);

      // Then: デフォルト値が適用された完全設定が返される
      expect(config.defaultInstallDir).toBeDefined(); // デフォルト値が設定されている
      expect(config.defaultTempDir).toBe('custom/temp/dir'); // ファイルの値が優先される
      expect(config.tools).toBeInstanceOf(Array);
      expect(config.tools.length).toBeGreaterThan(0); // デフォルトツール + カスタムツール

      // カスタムツールが含まれていることを確認
      const customTool = config.tools.find((tool) => tool.id === 'custom-tool');
      expect(customTool).toBeDefined();
      expect(customTool?.repository).toBe('custom/repo');
      expect(customTool?.version).toBe('v1.0.0');
    });

    it('YAMLファイルから設定を読み込み、デフォルト値とマージした完全設定を返す', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('yaml-workflow', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: YAML設定ファイルを作成
      const configFileName = 'tools-config.yaml';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const yamlContent = `
defaultInstallDir: custom/yaml/install
tools:
  - installer: eget
    id: yaml-tool
    repository: yaml/repo
    version: latest
`;

      await writeFile(configFilePath, yamlContent);

      // When: getToolsConfigで設定を取得
      const config = await getToolsConfig(configFilePath);

      // Then: デフォルト値が適用された完全設定が返される
      expect(config.defaultInstallDir).toBe('custom/yaml/install'); // ファイルの値が優先される
      expect(config.defaultTempDir).toBeDefined(); // デフォルト値が設定されている
      expect(config.tools).toBeInstanceOf(Array);
      expect(config.tools.length).toBeGreaterThan(0); // デフォルトツール + カスタムツール

      // カスタムツールが含まれていることを確認
      const yamlTool = config.tools.find((tool) => tool.id === 'yaml-tool');
      expect(yamlTool).toBeDefined();
      expect(yamlTool?.repository).toBe('yaml/repo');
      expect(yamlTool?.version).toBe('latest');
    });

    it('空の設定ファイルでもデフォルト値のみの完全設定を返す', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('empty-workflow', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 空のJSON設定ファイルを作成
      const configFileName = 'empty-config.json';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const emptyConfigData = {};

      await writeFile(configFilePath, JSON.stringify(emptyConfigData, null, 2));

      // When: getToolsConfigで設定を取得
      const config = await getToolsConfig(configFilePath);

      // Then: デフォルト値のみの完全設定が返される
      expect(config.defaultInstallDir).toBeDefined();
      expect(config.defaultTempDir).toBeDefined();
      expect(config.tools).toBeInstanceOf(Array);
      expect(config.tools.length).toBeGreaterThan(0); // デフォルトツールが含まれる
    });
  });

  /**
   * 複雑な設定マージテスト
   * 複数のツール設定を含むファイルでの完全なマージ処理を検証
   */
  describe('複雑な設定マージ', () => {
    it('複数のツール設定を含むファイルから完全設定を生成する', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('multi-tools-workflow', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 複数のツール設定を含むJSONファイルを作成
      const configFileName = 'multi-tools-config.json';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const multiToolsConfigData = {
        defaultInstallDir: 'custom/install/dir',
        defaultTempDir: 'custom/temp/dir',
        tools: [
          {
            installer: 'eget',
            id: 'tool1',
            repository: 'owner1/repo1',
            version: 'v1.0.0',
          },
          {
            installer: 'eget',
            id: 'tool2',
            repository: 'owner2/repo2',
            version: 'latest',
          },
          {
            installer: 'eget',
            id: 'tool3',
            repository: 'owner3/repo3',
            version: 'v3.0.0',
          },
        ],
      };

      await writeFile(configFilePath, JSON.stringify(multiToolsConfigData, null, 2));

      // When: getToolsConfigで設定を取得
      const config = await getToolsConfig(configFilePath);

      // Then: すべてのツールが正しくマージされた完全設定が返される
      expect(config.defaultInstallDir).toBe('custom/install/dir');
      expect(config.defaultTempDir).toBe('custom/temp/dir');
      expect(config.tools).toBeInstanceOf(Array);

      // カスタムツール3つ + デフォルトツールが含まれている
      expect(config.tools.length).toBeGreaterThanOrEqual(3);

      // 各カスタムツールが正しく含まれていることを確認
      const tool1 = config.tools.find((tool) => tool.id === 'tool1');
      const tool2 = config.tools.find((tool) => tool.id === 'tool2');
      const tool3 = config.tools.find((tool) => tool.id === 'tool3');

      expect(tool1).toBeDefined();
      expect(tool1?.repository).toBe('owner1/repo1');
      expect(tool1?.version).toBe('v1.0.0');

      expect(tool2).toBeDefined();
      expect(tool2?.repository).toBe('owner2/repo2');
      expect(tool2?.version).toBe('latest');

      expect(tool3).toBeDefined();
      expect(tool3?.repository).toBe('owner3/repo3');
      expect(tool3?.version).toBe('v3.0.0');
    });
  });

  /**
   * エラーケース統合テスト
   * ファイル不存在や無効設定での適切なエラーハンドリングを検証
   */
  describe('エラーハンドリング', () => {
    it('存在しないファイルの場合はデフォルト設定のみを返す', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('nonexistent-file-workflow', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 存在しないファイルパス
      const configFilePath = path.join(ctx.testDir, 'nonexistent-config.json');

      // When: getToolsConfigで設定を取得
      const config = await getToolsConfig(configFilePath);

      // Then: デフォルト設定のみが返される
      expect(config.defaultInstallDir).toBeDefined();
      expect(config.defaultTempDir).toBeDefined();
      expect(config.tools).toBeInstanceOf(Array);
      expect(config.tools.length).toBeGreaterThan(0); // デフォルトツールが含まれる
    });

    it('無効なJSONファイルの場合は適切なエラーを投げる', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('invalid-json-workflow', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 無効なJSONファイルを作成
      const configFileName = 'invalid-config.json';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const invalidJsonContent = '{ invalid json content }';

      await writeFile(configFilePath, invalidJsonContent);

      // When & Then: getToolsConfigでエラーが発生する
      await expect(getToolsConfig(configFilePath)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining('Configuration validation failed'),
        }),
      );
    });

    it('設定検証エラーの場合は適切なエラーを投げる', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('validation-error-workflow', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 検証エラーとなる設定ファイルを作成
      const configFileName = 'invalid-validation-config.json';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const invalidConfigData = {
        defaultInstallDir: '/invalid<>path', // 無効文字を含むパス
        tools: [
          {
            installer: 'eget',
            id: 'test-tool',
            repository: 'owner/repo',
            version: 'latest',
          },
        ],
      };

      await writeFile(configFilePath, JSON.stringify(invalidConfigData, null, 2));

      // When & Then: getToolsConfigで検証エラーが発生する
      await expect(getToolsConfig(configFilePath)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringMatching(
            /defaultInstallDir must be a valid path|Invalid path format|Configuration validation failed/,
          ),
        }),
      );
    });
  });

  /**
   * パフォーマンス統合テスト
   * 大量データでの完全ワークフローのパフォーマンスを検証
   */
  describe('パフォーマンステスト', () => {
    it('大量のツール設定（50個）を含むファイルを適切な時間内で処理する', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('performance-workflow', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: 大量のツール設定を含むJSONファイルを作成
      const configFileName = 'large-config.json';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const largeConfigData = {
        defaultInstallDir: 'custom/large/install',
        defaultTempDir: 'custom/large/temp',
        tools: Array.from({ length: 50 }, (_, i) => ({
          installer: 'eget',
          id: `tool-${i}`,
          repository: `owner${i}/repo${i}`,
          version: 'latest',
        })),
      };

      await writeFile(configFilePath, JSON.stringify(largeConfigData, null, 2));

      // When: 処理時間を測定してgetToolsConfigで設定を取得
      const start = Date.now();
      const config = await getToolsConfig(configFilePath);
      const end = Date.now();

      // Then: 適切な時間内（1秒未満）で処理され、正しい設定が返される
      expect(end - start).toBeLessThan(1000);
      expect(config.defaultInstallDir).toBe('custom/large/install');
      expect(config.defaultTempDir).toBe('custom/large/temp');
      expect(config.tools.length).toBeGreaterThanOrEqual(50); // 50個のカスタムツール + デフォルトツール
    });
  });

  /**
   * 国際化対応統合テスト
   * Unicode文字を含む設定での完全ワークフローを検証
   */
  describe('国際化対応テスト', () => {
    it('Unicode文字を含む設定ファイルから完全設定を生成する', async (testContext) => {
      // Given: テストコンテキストを作成（一意の一時ディレクトリ）
      const ctx = await createTestContext('unicode-workflow', testContext);
      testContext.onTestFinished(ctx.cleanup);

      // Given: Unicode文字を含むJSONファイルを作成
      const configFileName = 'unicode-config.json';
      const configFilePath = path.join(ctx.testDir, configFileName);
      const unicodeConfigData = {
        defaultInstallDir: '/テスト/ディレクトリ',
        defaultTempDir: '/tëst/dîrëctørÿ',
        tools: [
          {
            installer: 'eget',
            id: 'ツール名-🚀',
            repository: 'owner/repo',
            version: 'latest',
          },
        ],
      };

      await writeFile(configFilePath, JSON.stringify(unicodeConfigData, null, 2));

      // When: getToolsConfigで設定を取得
      const config = await getToolsConfig(configFilePath);

      // Then: Unicode文字が正しく処理された完全設定が返される
      expect(config.defaultInstallDir).toBe('/テスト/ディレクトリ');
      expect(config.defaultTempDir).toBe('/tëst/dîrëctørÿ');
      expect(config.tools).toBeInstanceOf(Array);

      // Unicode文字を含むツールが正しく含まれていることを確認
      const unicodeTool = config.tools.find((tool) => tool.id === 'ツール名-🚀');
      expect(unicodeTool).toBeDefined();
      expect(unicodeTool?.id).toBe('ツール名-🚀');
    });
  });
});
