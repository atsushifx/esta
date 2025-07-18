// src/toolsValidator/validator/__tests__/validateTools.spec.ts
// @(#) : validateTools関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';
// test target
import { validateTools } from '../../index';
// types
import type { ToolEntry } from '@/internal/types';
// error handling
import { ExitError } from '@esta-core/error-handler';

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

      // When & Then: toolsを検証する（例外が発生しないことを確認）
      expect(() => validateTools(validTools)).not.toThrow();
    });

    it('空のツールリストを検証して成功する', () => {
      // Given: 空のツールリスト
      const emptyTools: ToolEntry[] = [];

      // When & Then: toolsを検証する（例外が発生しないことを確認）
      expect(() => validateTools(emptyTools)).not.toThrow();
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

      // When & Then: toolsを検証する（例外が発生しないことを確認）
      expect(() => validateTools(validTools)).not.toThrow();
    });
  });

  describe('異常なtools検証', () => {
    it('不正なインストーラータイプを検証して失敗する', () => {
      // Given: 不正なインストーラータイプのツールリスト
      const toolsWithInvalidInstaller: ToolEntry[] = [
        {
          installer: 'npm' as ToolEntry['installer'], // 未対応のインストーラー
          id: 'typescript',
          repository: 'microsoft/typescript',
        },
      ];

      // When & Then: toolsを検証する（ExitErrorが投げられることを確認）
      expect(() => validateTools(toolsWithInvalidInstaller)).toThrow(ExitError);
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

      // When & Then: toolsを検証する（ExitErrorが投げられることを確認）
      expect(() => validateTools(invalidTools)).toThrow(ExitError);
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

      // When & Then: toolsを検証する（ExitErrorが投げられることを確認）
      expect(() => validateTools(invalidTools)).toThrow(ExitError);
    });
  });

  describe('混合リスト検証', () => {
    it('有効・無効エントリーが混在するリストを検証して最初のエラーで失敗する', () => {
      // Given: 有効・無効エントリーが混在するリスト（有効なエントリーが最初）
      const mixedTools: ToolEntry[] = [
        {
          installer: 'eget',
          id: 'ripgrep',
          repository: 'BurntSushi/ripgrep',
        },
        {
          installer: 'npm' as ToolEntry['installer'], // 2番目で失敗
          id: 'typescript',
          repository: 'microsoft/typescript',
        },
        {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
        },
      ];

      // When & Then: toolsを検証する（最初の無効エントリーでExitErrorが投げられる）
      expect(() => validateTools(mixedTools)).toThrow(ExitError);
    });

    it('すべてのエントリーが無効なリストを検証して最初のエラーで失敗する', () => {
      // Given: すべてのエントリーが無効なリスト
      const invalidTools: ToolEntry[] = [
        null as unknown as ToolEntry, // 最初で失敗
        {
          installer: 'npm' as ToolEntry['installer'],
          id: 'typescript',
          repository: 'microsoft/typescript',
        },
      ];

      // When & Then: toolsを検証する（最初のエントリーでExitErrorが投げられる）
      expect(() => validateTools(invalidTools)).toThrow(ExitError);
    });
  });

  describe('エラー情報の詳細確認', () => {
    it('ExitErrorメッセージにindexが含まれることを確認する', () => {
      // Given: 無効なツールエントリー
      const invalidEntry: ToolEntry = {
        installer: 'unknown' as ToolEntry['installer'], // 型安全性テストのため
        id: 'test',
        repository: 'test/test',
      };

      // When & Then: toolsを検証する（エラーメッセージにindexが含まれることを確認）
      expect(() => validateTools([invalidEntry])).toThrow(/Tool entry at index 0:/);
    });
  });
});
