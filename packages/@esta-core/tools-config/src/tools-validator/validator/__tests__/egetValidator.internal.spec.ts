// src/toolsValidator/validator/__tests__/egetValidator.internal.spec.ts
// @(#) : egetValidator.ts内部関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import type { ToolEntry } from '../../../internal/types';
import { validateEgetToolEntry } from '../egetValidator';

/**
 * egetValidator.ts内部関数のテスト
 *
 * egetValidator.tsで定義されている内部関数の動作を間接的にテストします。
 * 主にvalidateEgetOptions関数やvalidateRepositoryFormat関数の動作確認を行います。
 */
describe('egetValidator.ts internal functions', () => {
  /**
   * validateEgetOptions関数の間接テスト
   *
   * egetツールエントリーの検証を通じて、内部で呼び出される
   * validateEgetOptions関数の動作をテストします。
   */
  describe('validateEgetOptions (間接テスト)', () => {
    /**
     * 正常系のテスト
     *
     * 有効なegetオプションが正しく検証されることを確認します。
     */
    describe('正常系', () => {
      it('有効な /q オプションを検証する', () => {
        // Given: /q オプションを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/q': '',
          },
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toEqual(toolEntry);
      });

      it('有効な /quiet オプションを検証する', () => {
        // Given: /quiet オプションを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/quiet': '',
          },
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toEqual(toolEntry);
      });

      it('有効な /a オプションを検証する', () => {
        // Given: /a オプションを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/a': 'gh_linux_amd64.tar.gz',
          },
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toEqual(toolEntry);
      });

      it('有効な /asset: オプションを検証する', () => {
        // Given: /asset: オプションを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/asset:': 'gh_linux_amd64.tar.gz',
          },
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toEqual(toolEntry);
      });

      it('有効な /asset: オプションを検証する', () => {
        // Given: /asset: オプションを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/asset:': 'linux_amd64',
          },
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toEqual(toolEntry);
      });

      it('有効な /a オプションを検証する', () => {
        // Given: /a オプションを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/a': 'gh_linux_amd64.tar.gz',
          },
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toEqual(toolEntry);
      });

      it('複数の有効なオプションを検証する', () => {
        // Given: 複数の有効なオプションを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/q': '',
            '/asset:': 'gh_linux_amd64.tar.gz',
          },
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toEqual(toolEntry);
      });

      it('オプションが未定義の場合を検証する', () => {
        // Given: オプションが未定義のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toEqual(toolEntry);
      });
    });

    /**
     * 異常系のテスト
     *
     * 無効なegetオプションが適切にエラーとして検出されることを確認します。
     */
    describe('異常系', () => {
      it('無効なオプションキー /invalid を検証して失敗する', () => {
        // Given: 無効なオプションキーを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/invalid': 'value',
          },
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/q オプションに値がある場合を検証して失敗する', () => {
        // Given: /q オプションに値があるツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/q': 'invalid',
          },
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/quiet オプションに値がある場合を検証して失敗する', () => {
        // Given: /quiet オプションに値があるツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/quiet': 'invalid',
          },
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/a オプションが空文字列の場合を検証して失敗する', () => {
        // Given: /a オプションが空文字列のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/a': '',
          },
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/asset: オプションが空文字列の場合を検証して失敗する', () => {
        // Given: /asset: オプションが空文字列のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/asset:': '',
          },
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/to: オプションが空文字列の場合を検証して失敗する', () => {
        // Given: /to: オプションが空文字列のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/to:': '',
          },
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/tag: オプションが空文字列の場合を検証して失敗する', () => {
        // Given: /tag: オプションが空文字列のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/tag:': '',
          },
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('複数の無効なオプションを検証して失敗する', () => {
        // Given: 複数の無効なオプションを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/invalid1': 'value1',
            '/invalid2': 'value2',
          },
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('有効と無効なオプションが混在する場合を検証して失敗する', () => {
        // Given: 有効と無効なオプションが混在するツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/q': '', // 有効
            '/invalid': 'value', // 無効
          },
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/aと/asset:の競合を検証して失敗する', () => {
        // Given: /aと/asset:の両方を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/a': 'asset1.tar.gz',
            '/asset:': 'asset2.tar.gz', // 競合
          },
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/a,/q,/asset:の競合を検証して失敗する', () => {
        // Given: /a,/q,/asset:の組み合わせ（/aと/asset:が競合）
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/a': 'asset1.tar.gz',
            '/q': '',
            '/asset:': 'asset2.tar.gz', // /aと競合
          },
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/qと/quietの両方が使用された場合を検証して失敗する', () => {
        // Given: /q と /quiet の両方を持つツールエントリー（同じオプションのショート・ロングフォーム）
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/q': '',
            '/quiet': '', // 競合
          },
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });
    });
  });

  /**
   * validateGitHubRepository関数の間接テスト
   *
   * egetツールエントリーの検証を通じて、内部で呼び出される
   * validateGitHubRepository関数の動作をテストします。
   */
  describe('validateGitHubRepository (間接テスト)', () => {
    /**
     * 正常系のテスト
     *
     * 有効なGitHubリポジトリ形式が正しく検証されることを確認します。
     */
    describe('正常系', () => {
      it('標準的なGitHubリポジトリ形式を検証する', () => {
        // Given: 標準的なGitHubリポジトリ形式のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toEqual(toolEntry);
      });

      it('ハイフンを含むリポジトリ名を検証する', () => {
        // Given: ハイフンを含むリポジトリ名のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'docker-compose',
          repository: 'docker/compose',
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toEqual(toolEntry);
      });

      it('アンダースコアを含むリポジトリ名を検証する', () => {
        // Given: アンダースコアを含むリポジトリ名のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'tool_name',
          repository: 'owner_name/repo_name',
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toEqual(toolEntry);
      });

      it('ドットを含むリポジトリ名を検証する', () => {
        // Given: ドットを含むリポジトリ名のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'tool',
          repository: 'owner.name/repo.name',
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toEqual(toolEntry);
      });

      it('数字を含むリポジトリ名を検証する', () => {
        // Given: 数字を含むリポジトリ名のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'tool123',
          repository: 'owner123/repo456',
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toEqual(toolEntry);
      });
    });

    /**
     * 異常系のテスト
     *
     * 無効なGitHubリポジトリ形式が適切にエラーとして検出されることを確認します。
     */
    describe('異常系', () => {
      it('スラッシュが不足するリポジトリ名を検証して失敗する', () => {
        // Given: スラッシュが不足するリポジトリ名のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'invalid',
          repository: 'invalidRepo',
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow(
          'Repository must be in "owner/repo" format',
        );
      });

      it('オーナー名が空のリポジトリ名を検証して失敗する', () => {
        // Given: オーナー名が空のリポジトリ名のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'invalid',
          repository: '/repo',
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow(
          'Repository must be in "owner/repo" format',
        );
      });

      it('リポジトリ名が空のリポジトリ名を検証して失敗する', () => {
        // Given: リポジトリ名が空のリポジトリ名のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'invalid',
          repository: 'owner/',
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow(
          'Repository must be in "owner/repo" format',
        );
      });

      it('余分なスラッシュを含むリポジトリ名を検証して失敗する', () => {
        // Given: 余分なスラッシュを含むリポジトリ名のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'invalid',
          repository: 'owner/repo/extra',
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow(
          'Repository must be in "owner/repo" format',
        );
      });

      it('空白を含むリポジトリ名を検証して失敗する', () => {
        // Given: 空白を含むリポジトリ名のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'invalid',
          repository: 'owner name/repo name',
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow(
          'Repository must be in "owner/repo" format',
        );
      });

      it('空文字列のリポジトリ名を検証して失敗する', () => {
        // Given: 空文字列のリポジトリ名のツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'invalid',
          repository: '',
        };

        // When & Then: 検証が失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow(
          'Repository must be in "owner/repo" format',
        );
      });
    });
  });
});
