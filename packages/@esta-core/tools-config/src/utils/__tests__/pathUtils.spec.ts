// src/utils/__tests__/pathUtils.spec.ts
// @(#) : pathUtils.ts関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { arePathsEqual, normalizePath, validateAndNormalizePath } from '../pathUtils';

/**
 * pathUtils.ts関数のテスト
 *
 * パス操作に関する各種ユーティリティ関数の動作を検証します。
 * 主要な関数：normalizePath, validateAndNormalizePath, arePathsEqual
 */
describe('pathUtils.ts functions', () => {
  /**
   * normalizePath関数のテスト
   *
   * パス文字列の正規化機能をテストします。
   * 区切り文字の統一、大文字小文字の変換、末尾スラッシュの処理などを検証します。
   */
  describe('normalizePath', () => {
    /**
     * 正常系のテスト
     *
     * 有効なパス文字列が正しく正規化されることを確認します。
     */
    describe('正常系', () => {
      describe('Unixパス', () => {
        it('基本的なUnixパスを正規化する', () => {
          // When: 基本的なUnixパスを正規化する
          const result = normalizePath('/home/user/project');

          // Then: 正規化されたパスを返す
          expect(result).toBe('/home/user/project');
        });

        it('末尾のスラッシュを除去する', () => {
          // When: 末尾にスラッシュがあるパスを正規化する
          const result = normalizePath('/home/user/project/');

          // Then: 末尾のスラッシュが除去される
          expect(result).toBe('/home/user/project');
        });

        it('複数の末尾スラッシュを除去する', () => {
          // When: 複数の末尾スラッシュがあるパスを正規化する
          // Then: 連続スラッシュは無効なため例外が投げられる
          expect(() => normalizePath('/home/user/project///')).toThrow('Invalid path format: /home/user/project///');
        });

        it('ルートディレクトリの場合は末尾スラッシュを保持する', () => {
          // When: ルートディレクトリを正規化する
          const result = normalizePath('/');

          // Then: 末尾のスラッシュが保持される
          expect(result).toBe('/');
        });

        it('Windowsスラッシュを含むパスをUnixパスに変換する', () => {
          // When: Windowsスラッシュを含むパスを正規化する
          const result = normalizePath('/home\\user\\project');

          // Then: Unixパスに変換される
          expect(result).toBe('/home/user/project');
        });

        it('相対パスを正規化する', () => {
          // When: 相対パスを正規化する
          const result = normalizePath('./project/src');

          // Then: 正規化されたパスを返す
          expect(result).toBe('./project/src');
        });

        it('親ディレクトリパスを正規化する', () => {
          // When: 親ディレクトリパスを正規化する
          const result = normalizePath('../project/src');

          // Then: 正規化されたパスを返す
          expect(result).toBe('../project/src');
        });

        it('空白文字を含むパスを正規化する', () => {
          // When: 空白文字を含むパスを正規化する
          const result = normalizePath('  /home/user/project  ');

          // Then: 空白文字が除去される
          expect(result).toBe('/home/user/project');
        });
      });

      describe('Windowsパス', () => {
        it('基本的なWindowsパスを正規化する', () => {
          // When: 基本的なWindowsパスを正規化する
          const result = normalizePath('C:\\Users\\user\\project');

          // Then: 正規化されたパスを返す（フォワードスラッシュに変換、小文字化）
          expect(result).toBe('c:/users/user/project');
        });

        it('末尾のバックスラッシュを除去する', () => {
          // When: 末尾にバックスラッシュがあるパスを正規化する
          const result = normalizePath('C:\\Users\\user\\project\\');

          // Then: 末尾のバックスラッシュが除去される
          expect(result).toBe('c:/users/user/project');
        });

        it('Windowsルートディレクトリの場合は末尾バックスラッシュを保持する', () => {
          // When: Windowsルートディレクトリを正規化する
          const result = normalizePath('C:\\');

          // Then: 末尾のスラッシュが保持される（フォワードスラッシュに変換）
          expect(result).toBe('c:/');
        });

        it('ドライブのみの場合を正規化する', () => {
          // When: ドライブのみのパスを正規化する
          const result = normalizePath('C:');

          // Then: 正規化されたパスを返す
          expect(result).toBe('c:');
        });

        it('フォワードスラッシュを含むWindowsパスをそのまま保持する', () => {
          // When: フォワードスラッシュを含むWindowsパスを正規化する
          const result = normalizePath('C:/Users/user/project');

          // Then: フォワードスラッシュのまま、小文字化される
          expect(result).toBe('c:/users/user/project');
        });

        it('混合スラッシュを含むWindowsパスを正規化する', () => {
          // When: 混合スラッシュを含むWindowsパスを正規化する
          const result = normalizePath('C:\\Users/user\\project');

          // Then: フォワードスラッシュに統一される
          expect(result).toBe('c:/users/user/project');
        });

        it('小文字ドライブレターのWindowsパスを正規化する', () => {
          // When: 小文字ドライブレターのWindowsパスを正規化する
          const result = normalizePath('d:\\temp\\project');

          // Then: 正規化されたパスを返す
          expect(result).toBe('d:/temp/project');
        });
      });
    });

    describe('異常系', () => {
      it('空文字列の場合は例外を投げる', () => {
        // When & Then: 空文字列で例外を投げる
        expect(() => normalizePath('')).toThrow('Invalid path format: ');
      });

      it('空白のみの文字列の場合は例外を投げる', () => {
        // When & Then: 空白のみの文字列で例外を投げる
        expect(() => normalizePath('   ')).toThrow('Invalid path format:    ');
      });

      it('無効文字（<）を含む場合は例外を投げる', () => {
        // When & Then: 無効文字を含む場合は例外を投げる
        expect(() => normalizePath('/home/user<project')).toThrow('Invalid path format: /home/user<project');
      });

      it('無効文字（>）を含む場合は例外を投げる', () => {
        // When & Then: 無効文字を含む場合は例外を投げる
        expect(() => normalizePath('/home/user>project')).toThrow('Invalid path format: /home/user>project');
      });

      it('無効文字（|）を含む場合は例外を投げる', () => {
        // When & Then: 無効文字を含む場合は例外を投げる
        expect(() => normalizePath('/home/user|project')).toThrow('Invalid path format: /home/user|project');
      });

      it('無効文字（"）を含む場合は例外を投げる', () => {
        // When & Then: 無効文字を含む場合は例外を投げる
        expect(() => normalizePath('/home/user"project')).toThrow('Invalid path format: /home/user"project');
      });

      it('無効文字（*）を含む場合は例外を投げる', () => {
        // When & Then: 無効文字を含む場合は例外を投げる
        expect(() => normalizePath('/home/user*project')).toThrow('Invalid path format: /home/user*project');
      });

      it('無効文字（?）を含む場合は例外を投げる', () => {
        // When & Then: 無効文字を含む場合は例外を投げる
        expect(() => normalizePath('/home/user?project')).toThrow('Invalid path format: /home/user?project');
      });

      it('連続するスラッシュを含む場合は例外を投げる', () => {
        // When & Then: 連続するスラッシュを含む場合は例外を投げる
        expect(() => normalizePath('/home//user/project')).toThrow('Invalid path format: /home//user/project');
      });

      it('連続するバックスラッシュを含む場合は例外を投げる', () => {
        // When & Then: 連続するバックスラッシュを含む場合は例外を投げる
        expect(() => normalizePath('C:\\\\Users\\\\user')).toThrow('Invalid path format: C:\\\\Users\\\\user');
      });
    });
  });

  describe('validateAndNormalizePath', () => {
    describe('正常系', () => {
      it('有効な絶対Unixパスを検証・正規化する', () => {
        // When: 有効な絶対Unixパスを検証・正規化する
        const result = validateAndNormalizePath('/home/user/project');

        // Then: 正規化されたパスを返す
        expect(result).toBe('/home/user/project');
      });

      it('有効な絶対Windowsパスを検証・正規化する', () => {
        // When: 有効な絶対Windowsパスを検証・正規化する
        const result = validateAndNormalizePath('C:\\Users\\user\\project');

        // Then: 正規化されたパスを返す（フォワードスラッシュに変換、小文字化）
        expect(result).toBe('c:/users/user/project');
      });

      it('有効な相対パス（./）を検証・正規化する', () => {
        // When: 有効な相対パスを検証・正規化する
        const result = validateAndNormalizePath('./project/src');

        // Then: 正規化されたパスを返す
        expect(result).toBe('./project/src');
      });

      it('有効な相対パス（../）を検証・正規化する', () => {
        // When: 有効な相対パスを検証・正規化する
        const result = validateAndNormalizePath('../project/src');

        // Then: 正規化されたパスを返す
        expect(result).toBe('../project/src');
      });

      it('カレントディレクトリ（.）を検証・正規化する', () => {
        // When: カレントディレクトリを検証・正規化する
        const result = validateAndNormalizePath('.');

        // Then: 正規化されたパスを返す
        expect(result).toBe('.');
      });

      it('親ディレクトリ（..）を検証・正規化する', () => {
        // When: 親ディレクトリを検証・正規化する
        const result = validateAndNormalizePath('..');

        // Then: 正規化されたパスを返す
        expect(result).toBe('..');
      });

      it('暗黙的な相対パスを検証・正規化する', () => {
        // When: 暗黙的な相対パスを検証・正規化する
        const result = validateAndNormalizePath('project/src');

        // Then: 正規化されたパスを返す
        expect(result).toBe('project/src');
      });

      it('Windowsの暗黙的な相対パスを検証・正規化する', () => {
        // When: Windowsの暗黙的な相対パスを検証・正規化する
        const result = validateAndNormalizePath('project\\src');

        // Then: 正規化されたパスを返す（フォワードスラッシュに変換）
        expect(result).toBe('project/src');
      });
    });

    describe('異常系', () => {
      it('無効なパス形式の場合は例外を投げる', () => {
        // When & Then: 無効なパス形式で例外を投げる
        expect(() => validateAndNormalizePath('/home/user<project')).toThrow('Invalid path format: /home/user<project');
      });

      it('空文字列の場合は例外を投げる', () => {
        // When & Then: 空文字列で例外を投げる
        expect(() => validateAndNormalizePath('')).toThrow('Invalid path format: ');
      });

      it('空白のみの文字列の場合は例外を投げる', () => {
        // When & Then: 空白のみの文字列で例外を投げる
        expect(() => validateAndNormalizePath('   ')).toThrow('Invalid path format:    ');
      });

      it('連続するスラッシュを含む場合は例外を投げる', () => {
        // When & Then: 連続するスラッシュを含む場合は例外を投げる
        expect(() => validateAndNormalizePath('/home//user/project')).toThrow(
          'Invalid path format: /home//user/project',
        );
      });
    });
  });

  describe('arePathsEqual', () => {
    describe('正常系', () => {
      it('同じUnixパスの場合はtrueを返す', () => {
        // When: 同じUnixパスを比較する
        const result = arePathsEqual('/home/user/project', '/home/user/project');

        // Then: trueを返す
        expect(result).toBe(true);
      });

      it('同じWindowsパスの場合はtrueを返す', () => {
        // When: 同じWindowsパスを比較する
        const result = arePathsEqual('C:\\Users\\user\\project', 'C:\\Users\\user\\project');

        // Then: trueを返す
        expect(result).toBe(true);
      });

      it('大文字小文字が異なる同じパスの場合はtrueを返す', () => {
        // When: 大文字小文字が異なる同じパスを比較する
        const result = arePathsEqual('C:\\Users\\user\\project', 'c:\\users\\user\\project');

        // Then: trueを返す
        expect(result).toBe(true);
      });

      it('末尾スラッシュの有無が異なる同じパスの場合はtrueを返す', () => {
        // When: 末尾スラッシュの有無が異なる同じパスを比較する
        const result = arePathsEqual('/home/user/project', '/home/user/project/');

        // Then: trueを返す
        expect(result).toBe(true);
      });

      it('スラッシュ形式が異なる同じWindowsパスの場合はtrueを返す', () => {
        // When: スラッシュ形式が異なる同じWindowsパスを比較する
        const result = arePathsEqual('C:\\Users\\user\\project', 'C:/Users/user/project');

        // Then: trueを返す
        expect(result).toBe(true);
      });

      it('空白文字の有無が異なる同じパスの場合はtrueを返す', () => {
        // When: 空白文字の有無が異なる同じパスを比較する
        const result = arePathsEqual('  /home/user/project  ', '/home/user/project');

        // Then: trueを返す
        expect(result).toBe(true);
      });

      it('同じ相対パスの場合はtrueを返す', () => {
        // When: 同じ相対パスを比較する
        const result = arePathsEqual('./project/src', './project/src');

        // Then: trueを返す
        expect(result).toBe(true);
      });

      it('異なるパスの場合はfalseを返す', () => {
        // When: 異なるパスを比較する
        const result = arePathsEqual('/home/user/project1', '/home/user/project2');

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('異なるディレクトリ構造の場合はfalseを返す', () => {
        // When: 異なるディレクトリ構造を比較する
        const result = arePathsEqual('/home/user/project', '/home/user/project/src');

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('異なるドライブレターの場合はfalseを返す', () => {
        // When: 異なるドライブレターを比較する
        const result = arePathsEqual('C:\\Users\\user\\project', 'D:\\Users\\user\\project');

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('絶対パスと相対パスの場合はfalseを返す', () => {
        // When: 絶対パスと相対パスを比較する
        const result = arePathsEqual('/home/user/project', './project');

        // Then: falseを返す
        expect(result).toBe(false);
      });
    });

    describe('異常系', () => {
      it('第1引数が無効な場合はfalseを返す', () => {
        // When: 第1引数が無効な場合
        const result = arePathsEqual('/home/user<project', '/home/user/project');

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('第2引数が無効な場合はfalseを返す', () => {
        // When: 第2引数が無効な場合
        const result = arePathsEqual('/home/user/project', '/home/user>project');

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('両方の引数が無効な場合はfalseを返す', () => {
        // When: 両方の引数が無効な場合
        const result = arePathsEqual('/home/user<project', '/home/user>project');

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('空文字列を含む場合はfalseを返す', () => {
        // When: 空文字列を含む場合
        const result = arePathsEqual('', '/home/user/project');

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('両方が空文字列の場合はfalseを返す', () => {
        // When: 両方が空文字列の場合
        const result = arePathsEqual('', '');

        // Then: falseを返す
        expect(result).toBe(false);
      });

      it('連続するスラッシュを含む場合はfalseを返す', () => {
        // When: 連続するスラッシュを含む場合
        const result = arePathsEqual('/home//user/project', '/home/user/project');

        // Then: falseを返す
        expect(result).toBe(false);
      });
    });
  });
});
