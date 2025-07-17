// src/utils/__tests__/pathUtils.edge.spec.ts
// @(#) : パスユーティリティのエッジケーステスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, test } from 'vitest';
import { normalizePath } from '../pathUtils';

describe('パスユーティリティエッジケーステスト', () => {
  describe('極端なパス長での処理', () => {
    test('超長パスの処理', () => {
      // Given: 非常に長いパス（1000文字）
      const longPath = 'a'.repeat(1000);

      // When: パス正規化
      const result = normalizePath(longPath);

      // Then: 長いパスが適切に処理される（小文字化）
      expect(result).toBe(longPath.toLowerCase());
      expect(result.length).toBe(1000);
    });

    test('空文字列の処理', () => {
      // Given: 空文字列
      const emptyPath = '';

      // When & Then: 空文字列はエラーとなる
      expect(() => {
        normalizePath(emptyPath);
      }).toThrow('Invalid path format:');
    });

    test('単一文字パスの処理', () => {
      // Given: 単一文字パス
      const singleCharPath = 'a';

      // When: パス正規化
      const result = normalizePath(singleCharPath);

      // Then: 単一文字が適切に処理される（小文字化）
      expect(result).toBe('a');
    });
  });

  describe('特殊文字・記号を含むパス', () => {
    test('スペースを含むパス', () => {
      // Given: スペースを含むパス
      const pathWithSpaces = '/path with spaces/to file';

      // When: パス正規化
      const result = normalizePath(pathWithSpaces);

      // Then: スペースが保持される（小文字化）
      expect(result).toBe('/path with spaces/to file');
    });

    test('許可される特殊記号を含むパス', () => {
      // Given: 許可される特殊記号を含むパス
      const pathWithSymbols = '/path!@#$%^&*()_+-={}[].:,/file';

      // When: パス正規化
      const result = normalizePath(pathWithSymbols);

      // Then: 許可される特殊記号が保持される（小文字化）
      expect(result).toBe('/path!@#$%^&*()_+-={}[].:,/file');
    });

    test('無効な特殊記号を含むパス', () => {
      // Given: 無効な特殊記号を含むパス
      const pathWithInvalidSymbols = '/path<>|?*/file';

      // When & Then: 無効な文字はエラーとなる
      expect(() => {
        normalizePath(pathWithInvalidSymbols);
      }).toThrow('Invalid path format:');
    });

    test('Unicode文字を含むパス', () => {
      // Given: Unicode文字を含むパス
      const unicodePath = '/テスト/ディレクトリ/ファイル.txt';

      // When: パス正規化
      const result = normalizePath(unicodePath);

      // Then: Unicode文字が保持される（小文字化）
      expect(result).toBe('/テスト/ディレクトリ/ファイル.txt');
    });

    test('絵文字を含むパス', () => {
      // Given: 絵文字を含むパス
      const emojiPath = '/folder🚀/file📁.txt';

      // When: パス正規化
      const result = normalizePath(emojiPath);

      // Then: 絵文字が保持される（小文字化）
      expect(result).toBe('/folder🚀/file📁.txt');
    });
  });

  describe('Windowsネットワークパス', () => {
    test('UNCパスの処理', () => {
      // Given: UNCパス（連続バックスラッシュは無効）
      const uncPath = '\\\\server\\share\\folder\\file.txt';

      // When & Then: 連続バックスラッシュはエラーとなる
      expect(() => {
        normalizePath(uncPath);
      }).toThrow('Invalid path format:');
    });

    test('単一バックスラッシュパスの処理', () => {
      // Given: 単一バックスラッシュパス
      const backslashPath = '\\server\\share\\folder\\file.txt';

      // When: パス正規化
      const result = normalizePath(backslashPath);

      // Then: バックスラッシュがフォワードスラッシュに変換される（小文字化）
      expect(result).toBe('/server/share/folder/file.txt');
    });

    test('ドライブレター付きパス', () => {
      // Given: ドライブレター付きパス
      const driveLetterPath = 'C:\\Users\\Test\\file.txt';

      // When: パス正規化
      const result = normalizePath(driveLetterPath);

      // Then: バックスラッシュがフォワードスラッシュに変換され、小文字化される
      expect(result).toBe('c:/users/test/file.txt');
    });

    test('混合スラッシュパス', () => {
      // Given: バックスラッシュとフォワードスラッシュが混在
      const mixedPath = 'C:\\Users/Test\\folder/file.txt';

      // When: パス正規化
      const result = normalizePath(mixedPath);

      // Then: すべてフォワードスラッシュに統一され、小文字化される
      expect(result).toBe('c:/users/test/folder/file.txt');
    });
  });

  describe('相対パス・絶対パス', () => {
    test('相対パスの処理', () => {
      // Given: 相対パス
      const relativePath = './relative/path/to/file';

      // When: パス正規化
      const result = normalizePath(relativePath);

      // Then: 相対パスが保持される（小文字化）
      expect(result).toBe('./relative/path/to/file');
    });

    test('親ディレクトリを含む相対パス', () => {
      // Given: 親ディレクトリを含む相対パス
      const parentPath = '../parent/path/to/file';

      // When: パス正規化
      const result = normalizePath(parentPath);

      // Then: 親ディレクトリ参照が保持される（小文字化）
      expect(result).toBe('../parent/path/to/file');
    });

    test('複雑な相対パス', () => {
      // Given: 複雑な相対パス
      const complexPath = './folder/../another/./path/../../final';

      // When: パス正規化
      const result = normalizePath(complexPath);

      // Then: パス形式が正規化される（実際の解決はしない、小文字化）
      expect(result).toBe('./folder/../another/./path/../../final');
    });
  });

  describe('エラーハンドリング', () => {
    test('null値の処理', () => {
      // Given: null値
      const nullPath = null as unknown as string;

      // When & Then: エラーが発生するか、適切にハンドリングされる
      expect(() => {
        normalizePath(nullPath);
      }).toThrow();
    });

    test('undefined値の処理', () => {
      // Given: undefined値
      const undefinedPath = undefined as unknown as string;

      // When & Then: エラーが発生するか、適切にハンドリングされる
      expect(() => {
        normalizePath(undefinedPath);
      }).toThrow();
    });

    test('非文字列型の処理', () => {
      // Given: 数値型
      const numberPath = 123 as unknown as string;

      // When & Then: エラーが発生するか、適切にハンドリングされる
      expect(() => {
        normalizePath(numberPath);
      }).toThrow();
    });
  });

  describe('パフォーマンステスト', () => {
    test('大量のパス処理性能', () => {
      // Given: 大量のパス配列
      const paths = Array.from({ length: 1000 }, (_, i) => `/path${i}/to/file${i}.txt`);

      // When: 処理時間を測定
      const start = Date.now();
      const results = paths.map((path) => normalizePath(path));
      const end = Date.now();

      // Then: 適切な時間内で処理される（100ms未満）
      expect(end - start).toBeLessThan(100);
      expect(results).toHaveLength(1000);
    });

    test('超長パス処理性能', () => {
      // Given: 超長パス
      const longPath = 'a'.repeat(10000);

      // When: 処理時間を測定
      const start = Date.now();
      const result = normalizePath(longPath);
      const end = Date.now();

      // Then: 適切な時間内で処理される（10ms未満）
      expect(end - start).toBeLessThan(10);
      expect(result).toBe(longPath.toLowerCase());
    });
  });
});
