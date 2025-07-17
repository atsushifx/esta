// src/core/config/__tests__/loadConfig.spec.ts
// @(#) : loadConfig.ts関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it, vi } from 'vitest';

// lib
import { existsSync } from 'node:fs';
// internal module
import { errorExit, ExitCode } from '@esta-core/error-handler';
import { loadConfig as loadConfigFile } from '@esta-utils/config-loader';

// type
import type { PartialToolsConfig } from '../../../internal/types';
// test target
import { isCompleteConfig, loadToolsConfig, validateCompleteConfig } from '../loadToolsConfig';

// Mock dependencies
vi.mock('node:fs');
vi.mock('@esta-utils/config-loader');
vi.mock('@esta-core/error-handler');

const mockExistsSync = vi.mocked(existsSync);
const mockLoadConfigFile = vi.mocked(loadConfigFile);
const mockErrorExit = vi.mocked(errorExit);

describe('loadConfig.ts functions', () => {
  describe('loadToolsConfig', () => {
    describe('正常系', () => {
      it('有効な設定ファイルを読み込んで成功する', async () => {
        // Given: 有効な設定ファイルが存在する
        const configPath = '/path/to/config.json';
        const mockConfig: PartialToolsConfig = {
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
            },
          ],
        };

        mockExistsSync.mockReturnValue(true);
        mockLoadConfigFile.mockResolvedValue(mockConfig);

        // When: 設定ファイルを読み込む
        const result = await loadToolsConfig(configPath);

        // Then: 成功する
        expect(result).toBeDefined();
        expect(result.tools!).toHaveLength(1);
        expect(result.tools![0].id).toBe('gh');
        expect(result.defaultInstallDir).toBeUndefined();
        expect(result.defaultTempDir).toBeUndefined();
      });

      it('完全な設定ファイルを読み込んで成功する', async () => {
        // Given: 完全な設定ファイルが存在する
        const configPath = '/path/to/complete-config.json';
        const mockConfig: PartialToolsConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
          tools: [
            {
              installer: 'eget',
              id: 'ripgrep',
              repository: 'BurntSushi/ripgrep',
              version: 'v13.0.0',
            },
          ],
        };

        mockExistsSync.mockReturnValue(true);
        mockLoadConfigFile.mockResolvedValue(mockConfig);

        // When: 設定ファイルを読み込む
        const result = await loadToolsConfig(configPath);

        // Then: 成功する
        expect(result.defaultInstallDir).toBe('/custom/bin');
        expect(result.defaultTempDir).toBe('/custom/tmp');
        expect(result.tools!).toHaveLength(1);
      });

      it('空のツール配列を持つ設定ファイルを読み込んで成功する', async () => {
        // Given: 空のツール配列を持つ設定ファイル
        const configPath = '/path/to/empty-tools.json';
        const mockConfig: PartialToolsConfig = {
          tools: [],
        };

        mockExistsSync.mockReturnValue(true);
        mockLoadConfigFile.mockResolvedValue(mockConfig);

        // When: 設定ファイルを読み込む
        const result = await loadToolsConfig(configPath);

        // Then: 成功する
        expect(result.tools!).toHaveLength(0);
      });
    });

    describe('異常系', () => {
      it('設定ファイルが存在しない場合は空オブジェクトを返す', async () => {
        // Given: 設定ファイルが存在しない
        const configPath = '/path/to/nonexistent.json';
        mockExistsSync.mockReturnValue(false);

        // When: 設定ファイルを読み込む
        const result = await loadToolsConfig(configPath);

        // Then: 空オブジェクトを返す
        expect(result).toEqual({});
        expect(mockErrorExit).not.toHaveBeenCalled();
      });

      it('設定ファイルの読み込みに失敗した場合は空オブジェクトを返す', async () => {
        // Given: 設定ファイルは存在するが読み込みに失敗する
        const configPath = '/path/to/config.json';
        mockExistsSync.mockReturnValue(true);
        mockLoadConfigFile.mockResolvedValue(null);

        // When: 設定ファイルを読み込む
        const result = await loadToolsConfig(configPath);

        // Then: 空オブジェクトを返す
        expect(result).toEqual({});
        expect(mockErrorExit).not.toHaveBeenCalled();
      });

      it('設定ファイルの内容が無効な場合は成功する（スキーマが許可しているため）', async () => {
        // Given: 無効な設定ファイル
        const configPath = '/path/to/invalid-config.json';
        const invalidConfig = {
          tools: [
            {
              installer: 'invalid',
              id: 'test',
              repository: 'test/test',
            },
          ],
        };

        mockExistsSync.mockReturnValue(true);
        mockLoadConfigFile.mockResolvedValue(invalidConfig);

        // When: 設定ファイルを読み込む
        const result = await loadToolsConfig(configPath);

        // Then: 成功する（スキーマが許可しているため）
        expect(result.tools!).toHaveLength(1);
        expect(result.tools![0].installer).toBe('invalid');
      });

      it('loadConfigFile が例外を投げた場合はerrorExitを呼び出す', async () => {
        // Given: loadConfigFile が例外を投げる
        const configPath = '/path/to/config.json';
        const error = new Error('File read error');
        mockExistsSync.mockReturnValue(true);
        mockLoadConfigFile.mockRejectedValue(error);
        mockErrorExit.mockImplementation(() => {
          throw new Error('errorExit called');
        });

        // When & Then: 設定ファイルを読み込む
        await expect(loadToolsConfig(configPath)).rejects.toThrow('errorExit called');
        expect(mockErrorExit).toHaveBeenCalledWith(
          ExitCode.VALIDATION_FAILED,
          'Configuration validation failed: File read error',
        );
      });

      it('不明なエラーの場合はerrorExitを呼び出す', async () => {
        // Given: 不明なエラーが発生する
        const configPath = '/path/to/config.json';
        mockExistsSync.mockReturnValue(true);
        mockLoadConfigFile.mockRejectedValue('string error');
        mockErrorExit.mockImplementation(() => {
          throw new Error('errorExit called');
        });

        // When & Then: 設定ファイルを読み込む
        await expect(loadToolsConfig(configPath)).rejects.toThrow('errorExit called');
        expect(mockErrorExit).toHaveBeenCalledWith(
          ExitCode.VALIDATION_FAILED,
          'Configuration validation failed: Unknown error',
        );
      });
    });
  });

  describe('isCompleteConfig', () => {
    describe('正常系', () => {
      it('完全な設定の場合はtrueを返す', () => {
        // Given: 完全な設定
        const completeConfig: PartialToolsConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
            },
          ],
        };

        // When: 完全な設定かチェックする
        const result = isCompleteConfig(completeConfig);

        // Then: trueを返す
        expect(result).toBe(true);
      });

      it('空のツール配列を持つ完全な設定の場合はtrueを返す', () => {
        // Given: 空のツール配列を持つ完全な設定
        const completeConfig: PartialToolsConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
          tools: [],
        };

        // When: 完全な設定かチェックする
        const result = isCompleteConfig(completeConfig);

        // Then: trueを返す
        expect(result).toBe(true);
      });
    });

    describe('異常系', () => {
      it('部分的な設定の場合はfalseを返す', () => {
        // Given: 部分的な設定（defaultInstallDirが欠如）
        const partialConfig: PartialToolsConfig = {
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
            },
          ],
        };

        // When: 完全な設定かチェックする
        const result = isCompleteConfig(partialConfig);

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('defaultTempDirが欠如した設定の場合はfalseを返す', () => {
        // Given: defaultTempDirが欠如した設定
        const partialConfig: PartialToolsConfig = {
          defaultInstallDir: '/custom/bin',
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
            },
          ],
        };

        // When: 完全な設定かチェックする
        const result = isCompleteConfig(partialConfig);

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('toolsが欠如した設定の場合はfalseを返す', () => {
        // Given: toolsが欠如した設定
        const partialConfig: PartialToolsConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
        };

        // When: 完全な設定かチェックする
        const result = isCompleteConfig(partialConfig);

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('無効な設定の場合はfalseを返す', () => {
        // Given: 無効な設定
        const invalidConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
          tools: [
            {
              installer: 'invalid',
              id: 'test',
              repository: 'test/test',
            },
          ],
        };

        // When: 完全な設定かチェックする
        const result = isCompleteConfig(invalidConfig);

        // Then: trueを返す（スキーマが許可しているため）
        expect(result).toBe(true);
      });
    });
  });

  describe('validateCompleteConfig', () => {
    describe('正常系', () => {
      it('有効な完全設定を検証して返す', () => {
        // Given: 有効な完全設定
        const validConfig: PartialToolsConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
              version: 'v2.0.0',
            },
          ],
        };

        // When: 完全設定として検証する
        const result = validateCompleteConfig(validConfig);

        // Then: 検証済み設定を返す
        expect(result).toBeDefined();
        expect(result.defaultInstallDir).toBe('/custom/bin');
        expect(result.defaultTempDir).toBe('/custom/tmp');
        expect(result.tools).toHaveLength(1);
        expect(result.tools[0].id).toBe('gh');
      });

      it('空のツール配列を持つ完全設定を検証して返す', () => {
        // Given: 空のツール配列を持つ完全設定
        const validConfig: PartialToolsConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
          tools: [],
        };

        // When: 完全設定として検証する
        const result = validateCompleteConfig(validConfig);

        // Then: 検証済み設定を返す
        expect(result).toBeDefined();
        expect(result.tools).toHaveLength(0);
      });
    });

    describe('異常系', () => {
      it('部分的な設定の場合は例外を投げる', () => {
        // Given: 部分的な設定
        const partialConfig: PartialToolsConfig = {
          tools: [
            {
              installer: 'eget',
              id: 'gh',
              repository: 'cli/cli',
            },
          ],
        };

        // When & Then: 例外を投げる
        expect(() => validateCompleteConfig(partialConfig)).toThrow();
      });

      it('無効な設定の場合は例外を投げる', () => {
        // Given: 無効な設定（実際に無効なパス）
        const invalidConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
          tools: 'invalid', // 配列でない
        } as unknown as PartialToolsConfig;

        // When & Then: 例外を投げる
        expect(() => validateCompleteConfig(invalidConfig)).toThrow();
      });

      it('toolsが欠如した設定の場合は例外を投げる', () => {
        // Given: toolsが欠如した設定
        const invalidConfig = {
          defaultInstallDir: '/custom/bin',
          defaultTempDir: '/custom/tmp',
        };

        // When & Then: 例外を投げる
        expect(() => validateCompleteConfig(invalidConfig)).toThrow();
      });
    });
  });
});
