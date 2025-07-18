// src/__tests__/utils.spec.ts
// @(#) : ユーティリティ関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';
// constants
import { PATH_DELIMITER } from '../../shared/constants';
import type { TPlatformKey } from '../../shared/constants';
// test target
import { getPlatform } from '@/getPlatform';
// types
import { PLATFORM_TYPE } from '../../shared/types';

/**
 * ユーティリティ関数のテスト
 *
 * このテストスイートでは、パッケージが提供するユーティリティ関数を
 * テストします。現在はgetDelimiter関数のプラットフォーム別の
 * PATH区切り文字取得機能を検証します。
 */
describe('Utility Functions', () => {
  const getDelimiter = (platform?: TPlatformKey | 'unknown' | ''): string => {
    const platformType = getPlatform(platform);
    return platformType === PLATFORM_TYPE.WINDOWS ? PATH_DELIMITER.WINDOWS : PATH_DELIMITER.UNIX;
  };

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
        expect(getDelimiter('win32')).toBe(PATH_DELIMITER.WINDOWS);
        expect(getDelimiter('win32')).toBe(';');
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
        expect(getDelimiter('linux')).toBe(PATH_DELIMITER.UNIX);
        expect(getDelimiter('linux')).toBe(':');
      });

      it('returns colon (:) for macOS platform', () => {
        expect(getDelimiter('darwin')).toBe(PATH_DELIMITER.UNIX);
        expect(getDelimiter('darwin')).toBe(':');
      });
    });

    /**
     * エラーハンドリングのテスト
     */
    describe('Error Handling', () => {
      it('throws for unsupported platforms', () => {
        const unsupportedPlatform = 'freebsd' as TPlatformKey;
        expect(() => getDelimiter(unsupportedPlatform)).toThrow(/Unsupported platform/);
      });
    });
  });
});
