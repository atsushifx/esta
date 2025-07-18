// src/tools-validator/validator/__tests__/boundary.spec.ts
// @(#) : バリデーターの境界値テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, test } from 'vitest';
// type
import type { ToolEntry } from '@/internal/types';
// error handling
import { ExitError } from '@esta-core/error-handler';
// validator
import { validateEgetToolEntry } from '../egetValidator';
// test target
import { validateTools } from '../index';

describe('バリデーター境界値テスト', () => {
  describe('文字列長制限テスト', () => {
    test('最大文字数でのID検証', () => {
      // Given: 非常に長いID
      const longId = 'a'.repeat(1000);
      const toolEntry: ToolEntry = {
        installer: 'eget',
        id: longId,
        repository: 'owner/repo',
        version: 'latest',
      };

      // When & Then: ツール検証（例外が発生しないことを確認）
      expect(() => validateTools([toolEntry])).not.toThrow();
    });

    test('最大文字数でのリポジトリ名検証', () => {
      // Given: 非常に長いリポジトリ名
      const longOwner = 'a'.repeat(500);
      const longRepo = 'b'.repeat(500);
      const toolEntry: ToolEntry = {
        installer: 'eget',
        id: 'test-tool',
        repository: `${longOwner}/${longRepo}`,
        version: 'latest',
      };

      // When & Then: ツール検証（例外が発生しないことを確認）
      expect(() => validateTools([toolEntry])).not.toThrow();
    });

    test('空文字列での検証', () => {
      // Given: 空文字列を含むツールエントリ
      const emptyStringEntry: ToolEntry = {
        installer: 'eget',
        id: '',
        repository: 'owner/repo',
        version: '',
      };

      // When & Then: ツール検証（ExitErrorが投げられることを確認）
      expect(() => validateTools([emptyStringEntry])).toThrow(ExitError);
    });
  });

  describe('配列サイズ制限テスト', () => {
    test('大量のツールエントリ検証', () => {
      // Given: 大量のツールエントリ（1000個）
      const largeToolList = Array.from({ length: 1000 }, (_, i) => ({
        installer: 'eget',
        id: `tool-${i}`,
        repository: `owner${i}/repo${i}`,
        version: 'latest',
      }));

      // When: 処理時間を測定
      const start = Date.now();
      expect(() => validateTools(largeToolList)).not.toThrow();
      const end = Date.now();

      // Then: 適切な時間内で処理される（500ms未満）
      expect(end - start).toBeLessThan(500);
    });

    test('空の配列検証', () => {
      // Given: 空の配列
      const emptyArray: ToolEntry[] = [];

      // When & Then: ツール検証（例外が発生しないことを確認）
      expect(() => validateTools(emptyArray)).not.toThrow();
    });

    test('単一要素配列検証', () => {
      // Given: 単一要素配列
      const singleToolArray = [{
        installer: 'eget',
        id: 'single-tool',
        repository: 'owner/repo',
        version: 'latest',
      }];

      // When & Then: ツール検証（例外が発生しないことを確認）
      expect(() => validateTools(singleToolArray)).not.toThrow();
    });
  });

  describe('eget固有の境界値テスト', () => {
    test('極端に長いオプション値', () => {
      // Given: 非常に長いオプション値
      const longAsset = 'a'.repeat(2000);
      const toolEntry: ToolEntry = {
        installer: 'eget',
        id: 'test-tool',
        repository: 'owner/repo',
        version: 'latest',
        options: {
          '/asset:': longAsset,
        },
      };

      // When: egetバリデーション
      expect(() => {
        validateEgetToolEntry(toolEntry);
      }).not.toThrow();
    });

    test('最大数のオプション組み合わせ', () => {
      // Given: 許可されたオプションの組み合わせ
      const toolEntry: ToolEntry = {
        installer: 'eget',
        id: 'test-tool',
        repository: 'owner/repo',
        version: 'latest',
        options: {
          '/q': '',
          '/asset:': 'asset-name',
          '/a': 'another-asset',
          '/quiet': '',
        },
      };

      // When & Then: 無効なオプションでエラーが発生する
      expect(() => {
        validateEgetToolEntry(toolEntry);
      }).toThrow('Invalid eget options');
    });

    test('空のオプション値', () => {
      // Given: 空のオプション値
      const toolEntry: ToolEntry = {
        installer: 'eget',
        id: 'test-tool',
        repository: 'owner/repo',
        version: 'latest',
        options: {},
      };

      // When: egetバリデーション
      const result = validateEgetToolEntry(toolEntry);

      // Then: 空のオプションが適切に処理される
      expect(result.installer).toBe('eget');
      expect(result.options).toEqual({});
    });
  });

  describe('Unicode・特殊文字境界値テスト', () => {
    test('Unicode文字を含むツール情報', () => {
      // Given: Unicode文字を含むツールエントリ
      const unicodeEntry: ToolEntry = {
        installer: 'eget',
        id: 'テスト-ツール-🚀',
        repository: 'owner/repo',
        version: 'latest',
      };

      // When & Then: ツール検証（例外が発生しないことを確認）
      expect(() => validateTools([unicodeEntry])).not.toThrow();
    });

    test('制御文字を含む文字列', () => {
      // Given: 制御文字を含む文字列
      const controlCharEntry: ToolEntry = {
        installer: 'eget',
        id: 'tool\t\n\r',
        repository: 'owner/repo',
        version: 'latest',
      };

      // When & Then: ツール検証（例外が発生しないことを確認）
      expect(() => validateTools([controlCharEntry])).not.toThrow();
    });

    test('特殊記号を含むリポジトリ名', () => {
      // Given: 特殊記号を含むリポジトリ名（無効）
      const specialCharEntry: ToolEntry = {
        installer: 'eget',
        id: 'test-tool',
        repository: 'owner@#$/repo!@#$',
        version: 'latest',
      };

      // When & Then: ツール検証（ExitErrorが投げられることを確認）
      expect(() => validateTools([specialCharEntry])).toThrow(ExitError);
    });
  });

  describe('メモリ使用量境界値テスト', () => {
    test('大量の同時検証処理', () => {
      // Given: 並行して処理する大量のツール配列
      const batchSize = 100;
      const batches = Array.from(
        { length: 10 },
        (_, batchIndex) =>
          Array.from({ length: batchSize }, (_, toolIndex) => ({
            installer: 'eget',
            id: `batch-${batchIndex}-tool-${toolIndex}`,
            repository: `owner${batchIndex}/repo${toolIndex}`,
            version: 'latest',
          })),
      );

      // When & Then: 並行処理（すべてのバッチで例外が発生しないことを確認）
      batches.forEach((batch) => {
        expect(() => validateTools(batch)).not.toThrow();
      });
    });

    test('深い入れ子構造のオプション', () => {
      // Given: 有効なオプションのみを含む複雑な構造
      const complexEntry: ToolEntry = {
        installer: 'eget',
        id: 'complex-tool',
        repository: 'owner/repo',
        version: 'latest',
        options: {
          '/asset:': 'very-long-asset-name-with-many-characters'.repeat(10),
          '/q': '', // 有効なオプション
        },
      };

      // When & Then: 有効なオプションのみなので成功する
      expect(() => {
        const result = validateEgetToolEntry(complexEntry);
        expect(result.installer).toBe('eget');
      }).not.toThrow();
    });
  });
});
