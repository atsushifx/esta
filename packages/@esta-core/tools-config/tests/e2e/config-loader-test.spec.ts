// tests/e2e/config-loader-test.spec.ts
// @(#) : config-loaderの動作確認テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';
// config-loader
import { loadConfig as loadConfigFile, TSearchConfigFileType } from '@esta-utils/config-loader';
// e2e framework
import {
  createTempDirectory,
  removeDirectory,
  writeFile,
} from '@agla-e2e/fileio-framework';
// path
import path from 'node:path';
// crypto for unique identifiers
import { randomUUID } from 'node:crypto';

/**
 * config-loaderの動作確認テスト
 * マージ機能をテストする前に、config-loaderが想定通りに動作することを確認
 */
describe('config-loader動作確認', () => {
  describe('JSONファイル読み込み', () => {
    it('JSONファイルを正しく読み込める', async (testContext) => {
      // Given: テスト用一時ディレクトリを作成
      const testId = randomUUID().slice(0, 8);
      const testDir = await createTempDirectory(`config-loader-json-test-${testId}`);
      testContext.onTestFinished(async () => {
        await removeDirectory(testDir);
      });

      // Given: テスト用JSONファイルを作成
      const configFileName = 'test-config.json';
      const configFilePath = path.join(testDir, configFileName);
      const configData = {
        defaultInstallDir: 'custom/install/dir',
        defaultTempDir: 'custom/temp/dir',
        tools: [
          {
            installer: 'eget',
            id: 'test-tool',
            repository: 'owner/repo',
          },
        ],
      };

      await writeFile(configFilePath, JSON.stringify(configData, null, 2));

      // When: config-loaderで読み込み
      const result = await loadConfigFile({
        baseNames: 'test-config',
        appName: 'test-app',
        searchType: TSearchConfigFileType.PROJECT,
        baseDirectory: testDir,
      });

      // Then: 正しく読み込まれる
      expect(result).toBeDefined();
      expect(result).toEqual(configData);
    });

    it('存在しないファイルでnullが返される', async (testContext) => {
      // Given: テスト用一時ディレクトリを作成
      const testId = randomUUID().slice(0, 8);
      const testDir = await createTempDirectory(`config-loader-null-test-${testId}`);
      testContext.onTestFinished(async () => {
        await removeDirectory(testDir);
      });

      // When: 存在しないファイルを読み込み
      const result = await loadConfigFile({
        baseNames: 'nonexistent-config',
        appName: 'test-app',
        searchType: TSearchConfigFileType.PROJECT,
        baseDirectory: testDir,
      });

      // Then: nullが返される
      console.log('config-loader result for nonexistent file:', result);
      expect(result).toBeNull();
    });
  });

  describe('YAMLファイル読み込み', () => {
    it('YAMLファイルを正しく読み込める', async (testContext) => {
      // Given: テスト用一時ディレクトリを作成
      const testId = randomUUID().slice(0, 8);
      const testDir = await createTempDirectory(`config-loader-yaml-test-${testId}`);
      testContext.onTestFinished(async () => {
        await removeDirectory(testDir);
      });

      // Given: テスト用YAMLファイルを作成
      const configFileName = 'test-config.yaml';
      const configFilePath = path.join(testDir, configFileName);
      const yamlContent = `
defaultInstallDir: custom/yaml/dir
defaultTempDir: custom/yaml/tmp
tools:
  - installer: eget
    id: yaml-tool
    repository: yaml/repo
`;

      await writeFile(configFilePath, yamlContent);

      // When: config-loaderで読み込み
      const result = await loadConfigFile({
        baseNames: 'test-config',
        appName: 'test-app',
        searchType: TSearchConfigFileType.PROJECT,
        baseDirectory: testDir,
      });

      // Then: 正しく読み込まれる
      console.log('config-loader YAML result:', result);
      expect(result).toBeDefined();
      expect(result).toMatchObject({
        defaultInstallDir: 'custom/yaml/dir',
        defaultTempDir: 'custom/yaml/tmp',
        tools: [
          {
            installer: 'eget',
            id: 'yaml-tool',
            repository: 'yaml/repo',
          },
        ],
      });
    });
  });
});
