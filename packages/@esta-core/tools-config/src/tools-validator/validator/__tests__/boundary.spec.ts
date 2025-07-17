// src/tools-validator/validator/__tests__/boundary.spec.ts
// @(#) : バリデーターの境界値テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, test } from 'vitest';
import type { ToolEntry } from '../../../internal/types';
import { validateEgetToolEntry } from '../egetValidator';
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

      // When: ツール検証
      const result = validateTools([toolEntry]);

      // Then: 長いIDが適切に処理される
      expect(result.success).toBe(true);
      expect(result.validEntries).toHaveLength(1);
      expect(result.validEntries[0].id).toBe(longId);
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

      // When: ツール検証
      const result = validateTools([toolEntry]);

      // Then: 長いリポジトリ名が適切に処理される
      expect(result.success).toBe(true);
      expect(result.validEntries).toHaveLength(1);
      expect(result.validEntries[0].repository).toBe(`${longOwner}/${longRepo}`);
    });

    test('空文字列での検証', () => {
      // Given: 空文字列を含むツールエントリ
      const emptyStringEntry: ToolEntry = {
        installer: 'eget',
        id: '',
        repository: 'owner/repo',
        version: '',
      };

      // When: ツール検証
      const result = validateTools([emptyStringEntry]);

      // Then: 空文字列が適切にハンドリングされる
      expect(result.success).toBe(false);
      expect(result.validEntries).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
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
      const result = validateTools(largeToolList);
      const end = Date.now();

      // Then: 適切な時間内で処理される（500ms未満）
      expect(end - start).toBeLessThan(500);
      expect(result.success).toBe(true);
      expect(result.validEntries).toHaveLength(1000);
    });

    test('空の配列検証', () => {
      // Given: 空の配列
      const emptyArray: ToolEntry[] = [];

      // When: ツール検証
      const result = validateTools(emptyArray);

      // Then: 空配列が適切に処理される
      expect(result.success).toBe(true);
      expect(result.validEntries).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    test('単一要素配列検証', () => {
      // Given: 単一要素配列
      const singleToolArray = [{
        installer: 'eget',
        id: 'single-tool',
        repository: 'owner/repo',
        version: 'latest',
      }];

      // When: ツール検証
      const result = validateTools(singleToolArray);

      // Then: 単一要素が適切に処理される
      expect(result.success).toBe(true);
      expect(result.validEntries).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
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
          '/asset': longAsset,
        },
      };

      // When: egetバリデーション
      expect(() => {
        validateEgetToolEntry(toolEntry);
      }).not.toThrow();
    });

    test('最大数のオプション組み合わせ', () => {
      // Given: 多数のオプション組み合わせ
      const toolEntry: ToolEntry = {
        installer: 'eget',
        id: 'test-tool',
        repository: 'owner/repo',
        version: 'latest',
        options: {
          '/q': '',
          '/asset': 'asset-name',
          '/tag': 'v1.0.0',
          '/file': 'filename',
          '/to': '/custom/path',
        },
      };

      // When: egetバリデーション
      const result = validateEgetToolEntry(toolEntry);

      // Then: 多数のオプションが適切に処理される
      expect(result.installer).toBe('eget');
      expect(result.options).toEqual({
        '/q': '',
        '/asset': 'asset-name',
        '/tag': 'v1.0.0',
        '/file': 'filename',
        '/to': '/custom/path',
      });
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

      // When: ツール検証
      const result = validateTools([unicodeEntry]);

      // Then: Unicode文字が適切に処理される
      expect(result.success).toBe(true);
      expect(result.validEntries).toHaveLength(1);
      expect(result.validEntries[0].id).toBe('テスト-ツール-🚀');
    });

    test('制御文字を含む文字列', () => {
      // Given: 制御文字を含む文字列
      const controlCharEntry: ToolEntry = {
        installer: 'eget',
        id: 'tool\t\n\r',
        repository: 'owner/repo',
        version: 'latest',
      };

      // When: ツール検証
      const result = validateTools([controlCharEntry]);

      // Then: 制御文字が適切にハンドリングされる（通常は受け入れられる）
      expect(result.success).toBe(true);
      expect(result.validEntries).toHaveLength(1);
    });

    test('特殊記号を含むリポジトリ名', () => {
      // Given: 特殊記号を含むリポジトリ名（無効）
      const specialCharEntry: ToolEntry = {
        installer: 'eget',
        id: 'test-tool',
        repository: 'owner@#$/repo!@#$',
        version: 'latest',
      };

      // When: ツール検証
      const result = validateTools([specialCharEntry]);

      // Then: 無効なリポジトリ名がエラーとして処理される
      expect(result.success).toBe(false);
      expect(result.validEntries).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
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

      // When: 並行処理
      const results = batches.map((batch) => validateTools(batch));

      // Then: すべてのバッチが適切に処理される
      results.forEach((result, _index) => {
        expect(result.success).toBe(true);
        expect(result.validEntries).toHaveLength(batchSize);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('深い入れ子構造のオプション', () => {
      // Given: 複雑なオプション構造（実際は文字列のみだが、テストとして）
      const complexEntry: ToolEntry = {
        installer: 'eget',
        id: 'complex-tool',
        repository: 'owner/repo',
        version: 'latest',
        options: {
          '/asset': 'very-long-asset-name-with-many-characters'.repeat(10),
          '/tag': 'v1.0.0-beta.1+build.123456789',
          '/file': 'extremely-long-filename-with-multiple-extensions.tar.gz.sig',
          '/to': '/very/deep/directory/structure/with/many/levels/of/nesting',
        },
      };

      // When: egetバリデーション
      expect(() => {
        const result = validateEgetToolEntry(complexEntry);
        expect(result.installer).toBe('eget');
      }).not.toThrow();
    });
  });
});
