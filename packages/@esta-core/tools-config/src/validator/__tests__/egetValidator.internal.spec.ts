// src/validator/__tests__/egetValidator.internal.spec.ts
// @(#) : egetValidator.ts内部関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import type { ToolEntry } from '../../types';
import { isEgetToolEntry, validateEgetToolEntry } from '../egetValidator';

describe('egetValidator.ts internal functions', () => {
  describe('validateEgetOptions (間接テスト)', () => {
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
        expect(result).toBeDefined();
        expect(result.options).toEqual({ '/q': '' });
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
        expect(result).toBeDefined();
        expect(result.options).toEqual({ '/quiet': '' });
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
        expect(result).toBeDefined();
        expect(result.options).toEqual({ '/a': 'gh_linux_amd64.tar.gz' });
      });

      it('有効な /asset: オプションを検証する', () => {
        // Given: /asset: オプションを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/asset:': 'gh_windows_amd64.zip',
          },
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toBeDefined();
        expect(result.options).toEqual({ '/asset:': 'gh_windows_amd64.zip' });
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
        expect(result).toBeDefined();
        expect(result.options).toEqual({
          '/q': '',
          '/asset:': 'gh_linux_amd64.tar.gz',
        });
      });

      it('空のオプションオブジェクトを検証する', () => {
        // Given: 空のオプションオブジェクトを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {},
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toBeDefined();
        expect(result.options).toEqual({});
      });
    });

    describe('異常系', () => {
      it('無効なオプションキーで検証に失敗する', () => {
        // Given: 無効なオプションキーを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/invalid': 'value',
          },
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('無効なオプションキーが複数含まれる場合は検証に失敗する', () => {
        // Given: 無効なオプションキーが複数含まれるツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/q': '',
            '/invalid1': 'value1',
            '/invalid2': 'value2',
          },
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/a オプションに値が設定されていない場合は検証に失敗する', () => {
        // Given: /a オプションに値が設定されていないツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/a': '',
          },
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/asset: オプションに値が設定されていない場合は検証に失敗する', () => {
        // Given: /asset: オプションに値が設定されていないツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/asset:': '',
          },
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/asset: オプションに空白のみの値が設定されている場合は検証に失敗する', () => {
        // Given: /asset: オプションに空白のみの値が設定されているツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/asset:': '   ',
          },
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/q オプションに値が設定されている場合は検証に失敗する', () => {
        // Given: /q オプションに値が設定されているツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/q': 'invalid_value',
          },
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });

      it('/quiet オプションに値が設定されている場合は検証に失敗する', () => {
        // Given: /quiet オプションに値が設定されているツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/quiet': 'invalid_value',
          },
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('Invalid eget options');
      });
    });
  });

  describe('validateRepositoryFormat (間接テスト)', () => {
    describe('正常系', () => {
      it('有効なGitHubリポジトリ形式を検証する', () => {
        // Given: 有効なGitHubリポジトリ形式を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toBeDefined();
        expect(result.repository).toBe('cli/cli');
      });

      it('数字を含むリポジトリ名を検証する', () => {
        // Given: 数字を含むリポジトリ名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli-v2',
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toBeDefined();
        expect(result.repository).toBe('cli/cli-v2');
      });

      it('ハイフンを含むリポジトリ名を検証する', () => {
        // Given: ハイフンを含むリポジトリ名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'ripgrep',
          repository: 'BurntSushi/ripgrep',
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toBeDefined();
        expect(result.repository).toBe('BurntSushi/ripgrep');
      });

      it('アンダースコアを含むリポジトリ名を検証する', () => {
        // Given: アンダースコアを含むリポジトリ名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository: 'owner_name/repo_name',
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toBeDefined();
        expect(result.repository).toBe('owner_name/repo_name');
      });

      it('ピリオドを含むリポジトリ名を検証する', () => {
        // Given: ピリオドを含むリポジトリ名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository: 'owner.name/repo.name',
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toBeDefined();
        expect(result.repository).toBe('owner.name/repo.name');
      });

      it('長いリポジトリ名を検証する', () => {
        // Given: 長いリポジトリ名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository: 'very-long-owner-name/very-long-repository-name',
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toBeDefined();
        expect(result.repository).toBe('very-long-owner-name/very-long-repository-name');
      });
    });

    describe('異常系', () => {
      it('スラッシュがないリポジトリ名で検証に失敗する', () => {
        // Given: スラッシュがないリポジトリ名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository: 'invalid-repo-name',
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('repository must be in "owner/repo" format');
      });

      it('複数のスラッシュを含むリポジトリ名で検証に失敗する', () => {
        // Given: 複数のスラッシュを含むリポジトリ名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository: 'owner/repo/extra',
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('repository must be in "owner/repo" format');
      });

      it('先頭にスラッシュがあるリポジトリ名で検証に失敗する', () => {
        // Given: 先頭にスラッシュがあるリポジトリ名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository: '/owner/repo',
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('repository must be in "owner/repo" format');
      });

      it('末尾にスラッシュがあるリポジトリ名で検証に失敗する', () => {
        // Given: 末尾にスラッシュがあるリポジトリ名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository: 'owner/repo/',
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('repository must be in "owner/repo" format');
      });

      it('空のオーナー名で検証に失敗する', () => {
        // Given: 空のオーナー名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository: '/repo',
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('repository must be in "owner/repo" format');
      });

      it('空のリポジトリ名で検証に失敗する', () => {
        // Given: 空のリポジトリ名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository: 'owner/',
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('repository must be in "owner/repo" format');
      });

      it('スペースを含むリポジトリ名で検証に失敗する', () => {
        // Given: スペースを含むリポジトリ名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository: 'owner name/repo name',
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('repository must be in "owner/repo" format');
      });

      it('無効文字を含むリポジトリ名で検証に失敗する', () => {
        // Given: 無効文字を含むリポジトリ名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository: 'owner@/repo#',
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('repository must be in "owner/repo" format');
      });

      it('空文字列のリポジトリ名で検証に失敗する', () => {
        // Given: 空文字列のリポジトリ名を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository: '',
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('repository must be in "owner/repo" format');
      });
    });
  });

  describe('isEgetToolEntry', () => {
    describe('正常系', () => {
      it('egetインストーラーの場合はtrueを返す', () => {
        // Given: egetインストーラーを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
        };

        // When: egetツールエントリーかチェックする
        const result = isEgetToolEntry(toolEntry);

        // Then: trueを返す
        expect(result).toBe(true);
      });

      it('egetインストーラーでオプションを持つ場合はtrueを返す', () => {
        // Given: egetインストーラーとオプションを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          options: {
            '/q': '',
          },
        };

        // When: egetツールエントリーかチェックする
        const result = isEgetToolEntry(toolEntry);

        // Then: trueを返す
        expect(result).toBe(true);
      });

      it('egetインストーラーでバージョンを持つ場合はtrueを返す', () => {
        // Given: egetインストーラーとバージョンを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          version: 'v2.0.0',
        };

        // When: egetツールエントリーかチェックする
        const result = isEgetToolEntry(toolEntry);

        // Then: trueを返す
        expect(result).toBe(true);
      });
    });

    describe('異常系', () => {
      it('eget以外のインストーラーの場合はfalseを返す', () => {
        // Given: eget以外のインストーラーを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'npm',
          id: 'typescript',
          repository: 'microsoft/typescript',
        };

        // When: egetツールエントリーかチェックする
        const result = isEgetToolEntry(toolEntry);

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('scriptインストーラーの場合はfalseを返す', () => {
        // Given: scriptインストーラーを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'script',
          id: 'custom',
          repository: 'owner/repo',
        };

        // When: egetツールエントリーかチェックする
        const result = isEgetToolEntry(toolEntry);

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('空文字列のインストーラーの場合はfalseを返す', () => {
        // Given: 空文字列のインストーラーを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: '',
          id: 'test',
          repository: 'owner/repo',
        };

        // When: egetツールエントリーかチェックする
        const result = isEgetToolEntry(toolEntry);

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('大文字小文字が異なるegetの場合はfalseを返す', () => {
        // Given: 大文字小文字が異なるegetを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'EGET',
          id: 'test',
          repository: 'owner/repo',
        };

        // When: egetツールエントリーかチェックする
        const result = isEgetToolEntry(toolEntry);

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('egetを含む文字列の場合はfalseを返す', () => {
        // Given: egetを含む文字列を持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget-extended',
          id: 'test',
          repository: 'owner/repo',
        };

        // When: egetツールエントリーかチェックする
        const result = isEgetToolEntry(toolEntry);

        // Then: falseを返す
        expect(result).toBe(false);
      });
    });
  });

  describe('validateEgetToolEntry統合テスト', () => {
    describe('正常系', () => {
      it('最小限の有効なegetツールエントリーを検証する', () => {
        // Given: 最小限の有効なegetツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toBeDefined();
        expect(result.installer).toBe('eget');
        expect(result.id).toBe('gh');
        expect(result.repository).toBe('cli/cli');
        expect(result.version).toBeUndefined();
        expect(result.options).toBeUndefined();
      });

      it('完全なegetツールエントリーを検証する', () => {
        // Given: 完全なegetツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'eget',
          id: 'gh',
          repository: 'cli/cli',
          version: 'v2.0.0',
          options: {
            '/q': '',
            '/asset:': 'gh_linux_amd64.tar.gz',
          },
        };

        // When: egetツールエントリーを検証する
        const result = validateEgetToolEntry(toolEntry);

        // Then: 検証に成功する
        expect(result).toBeDefined();
        expect(result.installer).toBe('eget');
        expect(result.id).toBe('gh');
        expect(result.repository).toBe('cli/cli');
        expect(result.version).toBe('v2.0.0');
        expect(result.options).toEqual({
          '/q': '',
          '/asset:': 'gh_linux_amd64.tar.gz',
        });
      });
    });

    describe('異常系', () => {
      it('eget以外のインストーラーで検証に失敗する', () => {
        // Given: eget以外のインストーラーを持つツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'npm',
          id: 'typescript',
          repository: 'microsoft/typescript',
        };

        // When & Then: 検証に失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('installer must be "eget"');
      });

      it('複数のバリデーションエラーを含む場合は統合エラーメッセージを返す', () => {
        // Given: 複数のバリデーションエラーを含むツールエントリー
        const toolEntry: ToolEntry = {
          installer: 'npm',
          id: 'test',
          repository: 'invalid-format',
          options: {
            '/invalid': 'value',
          },
        };

        // When & Then: 最初のエラーメッセージで失敗する
        expect(() => validateEgetToolEntry(toolEntry)).toThrow('installer must be "eget"');
      });
    });
  });
});
