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
import { validateTools } from '../../toolsValidator';
// types
import type { ToolEntry } from '../../internal/types';

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
          version: 'latest',
          options: {
            '/q': '',
          },
        },
        {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          version: 'v2.0.0',
          options: {
            '/asset:': 'gh_linux_amd64.tar.gz',
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
    it('不正なインストーラータイプを検証して失敗する', () => {
      // Given: 不正なインストーラータイプのツールリスト
      const toolsWithInvalidInstaller: ToolEntry[] = [
        {
          installer: 'eget',
          id: 'ripgrep',
          repository: 'BurntSushi/ripgrep',
        },
        {
          installer: 'npm' as ToolEntry['installer'], // 未対応のインストーラー
          id: 'typescript',
          repository: 'microsoft/typescript',
        },
      ];

      // When: toolsを検証する
      const result = validateTools(toolsWithInvalidInstaller);

      // Then: 検証が部分的に失敗する
      expect(result.success).toBe(false);
      expect(result.validEntries).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        index: 1,
        entry: {
          installer: 'npm',
          id: 'typescript',
          repository: 'microsoft/typescript',
        },
        error: 'Unsupported installer type: npm',
      });
    });

    it('不正なリポジトリ形式を検証して失敗する', () => {
      // Given: 不正なリポジトリ形式のエントリー
      const invalidTools: ToolEntry[] = [
        {
          installer: 'eget',
          id: 'invalid',
          repository: 'invalid-format', // 不正な形式
        },
      ];

      // When: toolsを検証する
      const result = validateTools(invalidTools);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
      expect(result.validEntries).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('Repository must be in "owner/repo" format');
    });

    it('不正なegetオプションを検証して失敗する', () => {
      // Given: 不正なegetオプションを持つエントリー
      const invalidTools: ToolEntry[] = [
        {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/invalid': 'value', // 不正なオプション
          },
        },
      ];

      // When: toolsを検証する
      const result = validateTools(invalidTools);

      // Then: 検証が失敗する
      expect(result.success).toBe(false);
      expect(result.validEntries).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('Invalid eget options');
    });
  });

  describe('混合リスト検証', () => {
    it('有効・無効エントリーが混在するリストを検証して部分的に成功する', () => {
      // Given: 有効・無効エントリーが混在するリスト
      const mixedTools: ToolEntry[] = [
        {
          installer: 'eget',
          id: 'ripgrep',
          repository: 'BurntSushi/ripgrep',
        },
        {
          installer: 'npm' as ToolEntry['installer'], // 型安全性テストのため
          id: 'typescript',
          repository: 'microsoft/typescript',
        },
        {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
        },
        null as unknown as ToolEntry, // 型安全性テストのため
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
      expect(result.errors[1].error).toBe(
        'Installer field is required, ID field is required, Repository field is required',
      );
    });

    it('すべてのエントリーが無効なリストを検証して完全に失敗する', () => {
      // Given: すべてのエントリーが無効なリスト
      const invalidTools: ToolEntry[] = [
        null as unknown as ToolEntry, // 型安全性テストのため
        {
          installer: 'npm' as ToolEntry['installer'], // 型安全性テストのため
          id: 'typescript',
          repository: 'microsoft/typescript',
        },
        {
          id: 'missing-installer',
          repository: 'some/repo',
        } as ToolEntry, // 型安全性テストのため
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
      const invalidEntry: ToolEntry = {
        installer: 'unknown' as ToolEntry['installer'], // 型安全性テストのため
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
