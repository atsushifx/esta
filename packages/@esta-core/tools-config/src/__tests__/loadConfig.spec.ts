// src/__tests__/loadConfig.spec.ts
// @(#) : loadConfig関数のユニットテスト（ファイル読み込み専用）
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it, vi } from 'vitest';
import type { MockedFunction } from 'vitest';
// test target
import { loadConfig } from '@/core/config/loader';

// fs moduleをモック
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

// config-loaderをモック
vi.mock('@esta-utils/config-loader', () => ({
  loadConfig: vi.fn(),
  TSearchConfigFileType: {
    PROJECT: 'project',
    USER: 'user',
    SYSTEM: 'system',
  },
}));

// モジュールのインポート
import { loadConfig as mockLoadConfigFile } from '@esta-utils/config-loader';
import { existsSync } from 'node:fs';

const mockLoadConfigFileTyped = mockLoadConfigFile as MockedFunction<typeof mockLoadConfigFile>;
const mockExistsSync = existsSync as MockedFunction<typeof existsSync>;

describe('loadConfig', () => {
  describe('ファイル読み込み', () => {
    it('設定ファイルが存在して正常に読み込める', async () => {
      // Given: ファイルが存在し、config-loaderが設定を返す
      mockExistsSync.mockReturnValue(true);
      const mockConfig = {
        defaultInstallDir: 'custom/bin',
        defaultTempDir: 'custom/tmp',
      };
      mockLoadConfigFileTyped.mockResolvedValue(mockConfig);

      // When: 設定ファイルを読み込む
      const result = await loadConfig('test-config.json');

      // Then: 設定が正常に読み込まれる
      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.config!.defaultInstallDir).toBe('custom/bin');
      expect(result.config!.defaultTempDir).toBe('custom/tmp');
    });

    it('空の設定ファイルを読み込める', async () => {
      // Given: ファイルが存在し、config-loaderが空の設定を返す
      mockExistsSync.mockReturnValue(true);
      mockLoadConfigFileTyped.mockResolvedValue({});

      // When: 設定ファイルを読み込む
      const result = await loadConfig('empty-config.json');

      // Then: 空の設定が読み込まれる
      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.config).toEqual({});
    });
  });

  describe('エラーハンドリング', () => {
    it('存在しないファイルでエラーが発生する', async () => {
      // Given: ファイルが存在しない
      mockExistsSync.mockReturnValue(false);

      // When: 設定ファイルを読み込む
      const result = await loadConfig('nonexistent-config.json');

      // Then: ファイル読み込みエラーが発生する
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Configuration file not found');
    });

    it('config-loaderがnullを返した場合エラーが発生する', async () => {
      // Given: ファイルが存在するが、config-loaderがnullを返す
      mockExistsSync.mockReturnValue(true);
      mockLoadConfigFileTyped.mockResolvedValue(null);

      // When: 設定ファイルを読み込む
      const result = await loadConfig('test-config.json');

      // Then: 設定読み込みエラーが発生する
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Configuration file could not be loaded');
    });

    it('config-loaderで例外が発生した場合エラーが発生する', async () => {
      // Given: ファイルが存在するが、config-loaderで例外が発生
      mockExistsSync.mockReturnValue(true);
      mockLoadConfigFileTyped.mockRejectedValue(new Error('Parse error'));

      // When: 設定ファイルを読み込む
      const result = await loadConfig('test-config.json');

      // Then: パースエラーが発生する
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toBe('Parse error');
    });

    it('予期しないエラーが発生した場合エラーが発生する', async () => {
      // Given: ファイルが存在するが、config-loaderで予期しないエラーが発生
      mockExistsSync.mockReturnValue(true);
      mockLoadConfigFileTyped.mockRejectedValue('Unexpected error');

      // When: 設定ファイルを読み込む
      const result = await loadConfig('test-config.json');

      // Then: 予期しないエラーが発生する
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toBe('Unknown error');
    });
  });
});
