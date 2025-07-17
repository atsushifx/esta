import { describe, expect, it } from 'vitest';
import type { ToolEntry } from '../../../internal/types';
import {
  isEgetToolEntry,
  validateEgetToolEntry,
} from '../egetValidator';

describe('egetValidator', () => {
  describe('isEgetToolEntry', () => {
    it('egetインストーラーのエントリーでtrueを返す', () => {
      const entry: ToolEntry = {
        installer: 'eget',
        id: 'gh',
        repository: 'cli/cli',
      };

      expect(isEgetToolEntry(entry)).toBe(true);
    });

    it('eget以外のインストーラーでfalseを返す', () => {
      const entry: ToolEntry = {
        installer: 'npm',
        id: 'typescript',
        repository: 'microsoft/typescript',
      };

      expect(isEgetToolEntry(entry)).toBe(false);
    });
  });

  describe('validateEgetToolEntry', () => {
    it('有効なegetエントリーを正常に検証する', () => {
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

    it('有効なegetエントリー（オプション付き）を正常に検証する', () => {
      const entry: ToolEntry = {
        installer: 'eget',
        id: 'gh',
        repository: 'cli/cli',
        version: 'v2.0.0',
        options: {
          '/q': '',
          '/asset:': 'gh_linux_amd64.tar.gz',
        },
      };

      const result = validateEgetToolEntry(entry);

      expect(result).toEqual({
        installer: 'eget',
        id: 'gh',
        repository: 'cli/cli',
        version: 'v2.0.0',
        options: {
          '/q': '',
          '/asset:': 'gh_linux_amd64.tar.gz',
        },
      });
    });

    it('installerが"eget"でない場合はエラーを投げる', () => {
      const entry: ToolEntry = {
        installer: 'npm',
        id: 'typescript',
        repository: 'microsoft/typescript',
      };

      expect(() => validateEgetToolEntry(entry)).toThrow(
        'Installer must be "eget"',
      );
    });

    it('repositoryがGitHub形式でない場合はエラーを投げる', () => {
      const entry: ToolEntry = {
        installer: 'eget',
        id: 'invalid',
        repository: 'invalid-format',
      };

      expect(() => validateEgetToolEntry(entry)).toThrow(
        'Repository must be in "owner/repo" format',
      );
    });

    it('必須フィールドが不足している場合はエラーを投げる', () => {
      const entryWithoutId = {
        installer: 'eget',
        repository: 'cli/cli',
      } as ToolEntry;

      expect(() => validateEgetToolEntry(entryWithoutId)).toThrow(
        'Invalid eget tool entry',
      );
    });

    it('無効なオプションがある場合はエラーを投げる', () => {
      const entry: ToolEntry = {
        installer: 'eget',
        id: 'gh',
        repository: 'cli/cli',
        options: {
          '/invalid': 'value',
        },
      };

      expect(() => validateEgetToolEntry(entry)).toThrow(
        'Invalid eget options',
      );
    });

    it('/a や /asset: でアセット文字列が空の場合はエラーを投げる', () => {
      const entry: ToolEntry = {
        installer: 'eget',
        id: 'gh',
        repository: 'cli/cli',
        options: {
          '/a': '',
        },
      };

      expect(() => validateEgetToolEntry(entry)).toThrow(
        'Invalid eget options',
      );
    });

    it('/q や /quiet で値が空でない場合はエラーを投げる', () => {
      const entry: ToolEntry = {
        installer: 'eget',
        id: 'gh',
        repository: 'cli/cli',
        options: {
          '/q': 'invalid',
        },
      };

      expect(() => validateEgetToolEntry(entry)).toThrow(
        'Invalid eget options',
      );
    });

    it('複雑なrepository名パターンを正しく検証する', () => {
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

    it('無効なrepository名パターンでエラーを投げる', () => {
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
          'Repository must be in "owner/repo" format',
        );
      });
    });
  });
});
