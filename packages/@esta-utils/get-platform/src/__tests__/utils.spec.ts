// src/__tests__/utils.spec.ts
// @(#) : ユーティリティ関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
// constants
import { PATH_DELIMITER } from '../../shared/constants';
// test target
import { getDelimiter } from '@/getPlatform';

/**
 * ユーティリティ関数のテスト
 *
 * このテストスイートでは、パッケージが提供するユーティリティ関数を
 * テストします。現在はgetDelimiter関数のプラットフォーム別の
 * PATH区切り文字取得機能を検証します。
 */
describe('Utility Functions', () => {
  let originalPlatform: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
  });

  afterEach(() => {
    if (originalPlatform) {
      Object.defineProperty(process, 'platform', originalPlatform);
    }
  });

  /**
   * getDelimiter関数のテスト
   *
   * プラットフォーム別のPATH環境変数の区切り文字を取得する
   * 機能をテストします。Windowsではセミコロン、Unix系ではコロンを返します。
   */
  describe('getDelimiter', () => {
    /**
     * Windowsプラットフォームのテスト
     *
     * Windows（win32）プラットフォームでのセミコロン（;）区切り文字の
     * 正しい返却を確認します。
     */
    describe('Windows Platform', () => {
      it('returns semicolon (;) for Windows platform', () => {
        Object.defineProperty(process, 'platform', {
          value: 'win32',
          configurable: true,
        });

        expect(getDelimiter()).toBe(PATH_DELIMITER.WINDOWS);
        expect(getDelimiter()).toBe(';');
      });
    });

    /**
     * Unix系プラットフォームのテスト
     *
     * Linux、macOS等のUnix系プラットフォームでのコロン（:）区切り文字の
     * 正しい返却、およびサポート外プラットフォームのエラーハンドリングを確認します。
     */
    describe('Unix-like Platforms', () => {
      it('returns colon (:) for Linux platform', () => {
        Object.defineProperty(process, 'platform', {
          value: 'linux',
          configurable: true,
        });

        expect(getDelimiter()).toBe(PATH_DELIMITER.UNIX);
        expect(getDelimiter()).toBe(':');
      });

      it('returns colon (:) for macOS platform', () => {
        Object.defineProperty(process, 'platform', {
          value: 'darwin',
          configurable: true,
        });

        expect(getDelimiter()).toBe(PATH_DELIMITER.UNIX);
        expect(getDelimiter()).toBe(':');
      });
    });

    /**
     * エラーハンドリングのテスト
     */
    describe('Error Handling', () => {
      it('throws for unsupported platforms', () => {
        Object.defineProperty(process, 'platform', {
          value: 'freebsd',
          configurable: true,
        });

        expect(() => getDelimiter()).toThrow(/Unsupported platform/);
      });
    });
  });
});
