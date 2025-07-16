// src/validator/__tests__/validateConfig.spec.ts
// @(#) : validateConfig関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';
// test target
import { validateCompleteConfig, validateConfig } from '../config';
// types
import type { ToolsConfig } from '../../../shared/types';

/**
 * validateConfig関数のテスト
 *
 * このテストスイートでは、tools設定の検証機能を
 * BDDスタイルでテストします。
 */
describe('validateConfig', () => {
  describe('正常なconfig検証', () => {
    it('完全で有効なToolsConfigを検証して成功する', () => {
      // Given: 完全で有効なToolsConfig
      const validConfig: ToolsConfig = {
        defaultInstallDir: '.tools/bin',
        defaultTempDir: '.tools/tmp',
        tools: [
          {
            installer: 'eget',
            id: 'ripgrep',
            repository: 'BurntSushi/ripgrep',
            version: 'latest',
            options: {
              '/q': '',
            },
          },
        ],
      };

      // When: configを検証する
      const result = validateConfig(validConfig);

      // Then: 検証が成功する
      expect(result.success).toBe(true);
    });
  });

  describe('null/undefined検証', () => {
    it('nullを検証して失敗する', () => {
      // Given: null値
      const invalidConfig = null;

      // When: configを検証する
      const result = validateConfig(invalidConfig);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
    });

    it('undefinedを検証して失敗する', () => {
      // Given: undefined値
      const invalidConfig = undefined;

      // When: configを検証する
      const result = validateConfig(invalidConfig);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
    });
  });

  describe('必須フィールド検証', () => {
    it('空オブジェクトを検証して失敗する', () => {
      // Given: 空オブジェクト
      const invalidConfig = {};

      // When: 完全設定として検証する
      const result = validateCompleteConfig(invalidConfig);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
    });

    it('defaultInstallDirのみ欠如した場合に失敗する', () => {
      // Given: defaultInstallDirが欠如したconfig
      const invalidConfig = {
        defaultTempDir: '.tools/tmp',
        tools: [],
      };

      // When: 完全設定として検証する
      const result = validateCompleteConfig(invalidConfig);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
    });

    it('defaultTempDirのみ欠如した場合に失敗する', () => {
      // Given: defaultTempDirが欠如したconfig
      const invalidConfig = {
        defaultInstallDir: '.tools/bin',
        tools: [],
      };

      // When: 完全設定として検証する
      const result = validateCompleteConfig(invalidConfig);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
    });

    it('toolsのみ欠如した場合に失敗する', () => {
      // Given: toolsが欠如したconfig
      const invalidConfig = {
        defaultInstallDir: '.tools/bin',
        defaultTempDir: '.tools/tmp',
      };

      // When: 完全設定として検証する
      const result = validateCompleteConfig(invalidConfig);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
    });
  });

  describe('toolEntry検証', () => {
    it('空のtoolsを検証して成功する', () => {
      // Given: 空のtools配列を持つconfig
      const validConfig = {
        defaultInstallDir: '.tools/bin',
        defaultTempDir: '.tools/tmp',
        tools: [],
      };

      // When: configを検証する
      const result = validateConfig(validConfig);

      // Then: 検証が成功する
      expect(result.success).toBe(true);
    });

    it('optionsが省略されたtoolEntryを検証して成功する', () => {
      // Given: optionsが省略されたtoolEntry
      const validConfig = {
        defaultInstallDir: '.tools/bin',
        defaultTempDir: '.tools/tmp',
        tools: [
          {
            installer: 'eget',
            id: 'ripgrep',
            repository: 'BurntSushi/ripgrep',
          },
        ],
      };

      // When: configを検証する
      const result = validateConfig(validConfig);

      // Then: 検証が成功する
      expect(result.success).toBe(true);
    });

    it('installerが欠如したtoolEntryを検証して失敗する', () => {
      // Given: installerが欠如したtoolEntry
      const invalidConfig = {
        defaultInstallDir: '.tools/bin',
        defaultTempDir: '.tools/tmp',
        tools: [
          {
            id: 'ripgrep',
            repository: 'BurntSushi/ripgrep',
          },
        ],
      };

      // When: configを検証する
      const result = validateConfig(invalidConfig);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
    });

    it('idが欠如したtoolEntryを検証して失敗する', () => {
      // Given: idが欠如したtoolEntry
      const invalidConfig = {
        defaultInstallDir: '.tools/bin',
        defaultTempDir: '.tools/tmp',
        tools: [
          {
            installer: 'eget',
            repository: 'BurntSushi/ripgrep',
          },
        ],
      };

      // When: configを検証する
      const result = validateConfig(invalidConfig);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
    });

    it('repositoryが欠如したtoolEntryを検証して失敗する', () => {
      // Given: repositoryが欠如したtoolEntry
      const invalidConfig = {
        defaultInstallDir: '.tools/bin',
        defaultTempDir: '.tools/tmp',
        tools: [
          {
            installer: 'eget',
            id: 'ripgrep',
          },
        ],
      };

      // When: configを検証する
      const result = validateConfig(invalidConfig);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
    });
  });

  describe('パス形式検証', () => {
    it('有効な相対パスのdefaultInstallDirを検証して成功する', () => {
      // Given: 有効な相対パスのdefaultInstallDir
      const validConfig = {
        defaultInstallDir: '.tools/bin',
        defaultTempDir: '.tools/tmp',
        tools: [],
      };

      // When: configを検証する
      const result = validateConfig(validConfig);

      // Then: 検証が成功する
      expect(result.success).toBe(true);
    });

    it('有効な絶対パス（Unix）のdefaultInstallDirを検証して成功する', () => {
      // Given: 有効な絶対パス（Unix）のdefaultInstallDir
      const validConfig = {
        defaultInstallDir: '/usr/local/bin',
        defaultTempDir: '/tmp',
        tools: [],
      };

      // When: configを検証する
      const result = validateConfig(validConfig);

      // Then: 検証が成功する
      expect(result.success).toBe(true);
    });

    it('有効な絶対パス（Windows）のdefaultInstallDirを検証して成功する', () => {
      // Given: 有効な絶対パス（Windows）のdefaultInstallDir
      const validConfig = {
        defaultInstallDir: 'C:\\tools\\bin',
        defaultTempDir: 'C:\\temp',
        tools: [],
      };

      // When: configを検証する
      const result = validateConfig(validConfig);

      // Then: 検証が成功する
      expect(result.success).toBe(true);
    });

    it('無効なパス（空文字列）のdefaultInstallDirを検証して失敗する', () => {
      // Given: 無効なパス（空文字列）のdefaultInstallDir
      const invalidConfig = {
        defaultInstallDir: '',
        defaultTempDir: '.tools/tmp',
        tools: [],
      };

      // When: configを検証する
      const result = validateConfig(invalidConfig);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
    });

    it('無効なパス（無効文字含む）のdefaultTempDirを検証して失敗する', () => {
      // Given: 無効なパス（無効文字含む）のdefaultTempDir
      const invalidConfig = {
        defaultInstallDir: '.tools/bin',
        defaultTempDir: 'path|invalid',
        tools: [],
      };

      // When: configを検証する
      const result = validateConfig(invalidConfig);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
    });

    it('連続スラッシュを含むパスを検証して失敗する', () => {
      // Given: 連続スラッシュを含むパス
      const invalidConfig = {
        defaultInstallDir: 'tools//bin',
        defaultTempDir: '.tools/tmp',
        tools: [],
      };

      // When: configを検証する
      const result = validateConfig(invalidConfig);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
    });
  });

  describe('ディレクトリ同一性検証', () => {
    it('defaultInstallDirとdefaultTempDirが同じ場合に失敗する', () => {
      // Given: defaultInstallDirとdefaultTempDirが同じconfig
      const invalidConfig = {
        defaultInstallDir: '.tools/bin',
        defaultTempDir: '.tools/bin',
        tools: [],
      };

      // When: 完全設定として検証する
      const result = validateCompleteConfig(invalidConfig);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0].message).toBe('defaultInstallDir and defaultTempDir must be different directories');
      }
    });

    it('defaultInstallDirとdefaultTempDirが異なる場合に成功する', () => {
      // Given: defaultInstallDirとdefaultTempDirが異なるconfig
      const validConfig = {
        defaultInstallDir: '.tools/bin',
        defaultTempDir: '.tools/tmp',
        tools: [],
      };

      // When: 完全設定として検証する
      const result = validateCompleteConfig(validConfig);

      // Then: 検証が成功する
      expect(result.success).toBe(true);
    });
  });
});
