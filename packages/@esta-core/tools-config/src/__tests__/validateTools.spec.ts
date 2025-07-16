// src/__tests__/validateTools.spec.ts
// @(#) : validateTools関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';
// test target
import { validateTools } from '@/validator/tools';
// types
import type { ToolEntry } from '../../shared/types';

/**
 * validateTools関数のテスト
 *
 * このテストスイートでは、ツールエントリーリストの検証機能を
 * BDDスタイルでテストします。
 */
describe('validateTools', () => {
  describe('正常なtools検証', () => {
    it('有効なegetツールエントリーのリストを検証して成功する', () => {
      // Given: 有効なegetツールエントリーのリスト
      const validTools: ToolEntry[] = [
        {
          installer: 'eget',
          id: 'ripgrep',
          repository: 'BurntSushi/ripgrep',
          options: {
            version: 'latest',
            quiet: true,
          },
        },
        {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            version: 'v2.0.0',
            installDir: '/usr/local/bin',
          },
        },
      ];

      // When: toolsを検証する
      const result = validateTools(validTools);

      // Then: 検証が成功する
      expect(result.success).toBe(true);
      expect(result.validEntries).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('空のツールリストを検証して成功する', () => {
      // Given: 空のツールリスト
      const emptyTools: ToolEntry[] = [];

      // When: toolsを検証する
      const result = validateTools(emptyTools);

      // Then: 検証が成功する
      expect(result.success).toBe(true);
      expect(result.validEntries).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('optionsが省略されたegetツールエントリーを検証して成功する', () => {
      // Given: optionsが省略されたegetツールエントリー
      const validTools: ToolEntry[] = [
        {
          installer: 'eget',
          id: 'ripgrep',
          repository: 'BurntSushi/ripgrep',
        },
      ];

      // When: toolsを検証する
      const result = validateTools(validTools);

      // Then: 検証が成功する
      expect(result.success).toBe(true);
      expect(result.validEntries).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('異常なtools検証', () => {
    it('nullが含まれるリストを検証して部分的に失敗する', () => {
      // Given: nullが含まれるツールリスト
      const toolsWithNull = [
        {
          installer: 'eget',
          id: 'ripgrep',
          repository: 'BurntSushi/ripgrep',
        },
        null,
      ];

      // When: toolsを検証する
      const result = validateTools(toolsWithNull);

      // Then: 検証が部分的に失敗する
      expect(result.success).toBe(false);
      expect(result.validEntries).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        index: 1,
        entry: null,
        error: 'Tool entry must be an object with installer, id, and repository fields',
      });
    });

    it('installerフィールドが欠如したエントリーを検証して失敗する', () => {
      // Given: installerフィールドが欠如したエントリー
      const invalidTools = [
        {
          id: 'ripgrep',
          repository: 'BurntSushi/ripgrep',
        },
      ];

      // When: toolsを検証する
      const result = validateTools(invalidTools);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
      expect(result.validEntries).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('Tool entry must be an object with installer, id, and repository fields');
    });

    it('未対応のinstallerタイプを検証して失敗する', () => {
      // Given: 未対応のinstallerタイプのエントリー
      const invalidTools = [
        {
          installer: 'npm',
          id: 'typescript',
          repository: 'microsoft/typescript',
        },
      ];

      // When: toolsを検証する
      const result = validateTools(invalidTools);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
      expect(result.validEntries).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('Unsupported installer type: npm');
    });

    it('無効なegetエントリー（repositoryが不正）を検証して失敗する', () => {
      // Given: 無効なrepositoryを持つegetエントリー
      const invalidTools = [
        {
          installer: 'eget',
          id: 'invalid',
          repository: 'invalid-format',
        },
      ];

      // When: toolsを検証する
      const result = validateTools(invalidTools);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
      expect(result.validEntries).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('repository must be in "owner/repo" format');
    });
  });

  describe('混合リスト検証', () => {
    it('有効・無効エントリーが混在するリストを検証して部分的に成功する', () => {
      // Given: 有効・無効エントリーが混在するリスト
      const mixedTools = [
        {
          installer: 'eget',
          id: 'ripgrep',
          repository: 'BurntSushi/ripgrep',
        },
        {
          installer: 'npm',
          id: 'typescript',
          repository: 'microsoft/typescript',
        },
        {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
        },
        null,
      ];

      // When: toolsを検証する
      const result = validateTools(mixedTools);

      // Then: 検証が部分的に成功する
      expect(result.success).toBe(false);
      expect(result.validEntries).toHaveLength(2);
      expect(result.errors).toHaveLength(2);

      // 有効なエントリーを確認
      expect(result.validEntries[0].id).toBe('ripgrep');
      expect(result.validEntries[1].id).toBe('gh');

      // エラーを確認
      expect(result.errors[0].index).toBe(1);
      expect(result.errors[0].error).toBe('Unsupported installer type: npm');
      expect(result.errors[1].index).toBe(3);
      expect(result.errors[1].error).toBe('Tool entry must be an object with installer, id, and repository fields');
    });

    it('すべてのエントリーが無効なリストを検証して完全に失敗する', () => {
      // Given: すべてのエントリーが無効なリスト
      const invalidTools = [
        null,
        {
          installer: 'npm',
          id: 'typescript',
          repository: 'microsoft/typescript',
        },
        {
          id: 'missing-installer',
          repository: 'some/repo',
        },
      ];

      // When: toolsを検証する
      const result = validateTools(invalidTools);

      // Then: 検証が完全に失敗する
      expect(result.success).toBe(false);
      expect(result.validEntries).toHaveLength(0);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('エラー情報の詳細確認', () => {
    it('エラー情報にindex、entry、errorが含まれることを確認する', () => {
      // Given: 無効なツールエントリー
      const invalidEntry = {
        installer: 'unknown',
        id: 'test',
        repository: 'test/test',
      };

      // When: toolsを検証する
      const result = validateTools([invalidEntry]);

      // Then: エラー情報が正しく設定される
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toHaveProperty('index', 0);
      expect(result.errors[0]).toHaveProperty('entry', invalidEntry);
      expect(result.errors[0]).toHaveProperty('error');
      expect(typeof result.errors[0].error).toBe('string');
    });
  });
});
