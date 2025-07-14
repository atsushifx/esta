import { describe, expect, test } from 'vitest';
import type { ToolEntry } from '../../../shared/types';
import {
  isEgetToolEntry,
  validateEgetToolEntry,
} from '../egetValidator';

describe('egetValidator', () => {
  describe('isEgetToolEntry', () => {
    test('egetインストーラーのエントリーでtrueを返す', () => {
      const entry: ToolEntry = {
        installer: 'eget',
        id: 'gh',
        repository: 'cli/cli',
      };

      expect(isEgetToolEntry(entry)).toBe(true);
    });

    test('eget以外のインストーラーでfalseを返す', () => {
      const entry: ToolEntry = {
        installer: 'npm',
        id: 'typescript',
        repository: 'microsoft/typescript',
      };

      expect(isEgetToolEntry(entry)).toBe(false);
    });
  });

  describe('validateEgetToolEntry', () => {
    test('有効なegetエントリーを正常に検証する', () => {
      const entry: ToolEntry = {
        installer: 'eget',
        id: 'gh',
        repository: 'cli/cli',
      };

      const result = validateEgetToolEntry(entry);

      expect(result).toEqual({
        installer: 'eget',
        id: 'gh',
        repository: 'cli/cli',
      });
    });

    test('有効なegetエントリー（オプション付き）を正常に検証する', () => {
      const entry: ToolEntry = {
        installer: 'eget',
        id: 'gh',
        repository: 'cli/cli',
        options: {
          version: 'v2.0.0',
          installDir: '/usr/local/bin',
          quiet: true,
          asset: 'gh_linux_amd64.tar.gz',
        },
      };

      const result = validateEgetToolEntry(entry);

      expect(result).toEqual({
        installer: 'eget',
        id: 'gh',
        repository: 'cli/cli',
        options: {
          version: 'v2.0.0',
          installDir: '/usr/local/bin',
          quiet: true,
          asset: 'gh_linux_amd64.tar.gz',
        },
      });
    });

    test('installerが"eget"でない場合はエラーを投げる', () => {
      const entry: ToolEntry = {
        installer: 'npm',
        id: 'typescript',
        repository: 'microsoft/typescript',
      };

      expect(() => validateEgetToolEntry(entry)).toThrow(
        'installer must be "eget"',
      );
    });

    test('repositoryがGitHub形式でない場合はエラーを投げる', () => {
      const entry: ToolEntry = {
        installer: 'eget',
        id: 'invalid',
        repository: 'invalid-format',
      };

      expect(() => validateEgetToolEntry(entry)).toThrow(
        'repository must be in "owner/repo" format',
      );
    });

    test('必須フィールドが不足している場合はエラーを投げる', () => {
      const entryWithoutId = {
        installer: 'eget',
        repository: 'cli/cli',
      } as ToolEntry;

      expect(() => validateEgetToolEntry(entryWithoutId)).toThrow(
        'Invalid eget tool entry',
      );
    });

    test('サポートされていないオプションがある場合は無視される', () => {
      const entry: ToolEntry = {
        installer: 'eget',
        id: 'gh',
        repository: 'cli/cli',
        options: {
          version: 'v2.0.0',
          unsupportedOption: 'value',
        },
      };

      const result = validateEgetToolEntry(entry);

      expect(result.options).toEqual({
        version: 'v2.0.0',
      });
      expect(result.options).not.toHaveProperty('unsupportedOption');
    });

    test('複雑なrepository名パターンを正しく検証する', () => {
      const validRepositories = [
        'owner/repo',
        'owner-name/repo-name',
        'owner.name/repo.name',
        'owner_name/repo_name',
        'owner123/repo456',
      ];

      validRepositories.forEach((repository) => {
        const entry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository,
        };

        expect(() => validateEgetToolEntry(entry)).not.toThrow();
      });
    });

    test('無効なrepository名パターンでエラーを投げる', () => {
      const invalidRepositories = [
        'owner',
        'owner/',
        '/repo',
        'owner/repo/extra',
        'owner repo',
        '',
      ];

      invalidRepositories.forEach((repository) => {
        const entry: ToolEntry = {
          installer: 'eget',
          id: 'test',
          repository,
        };

        expect(() => validateEgetToolEntry(entry)).toThrow(
          'repository must be in "owner/repo" format',
        );
      });
    });
  });
});
