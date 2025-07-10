// src/__tests__/getPlatform.spec.ts
// @(#) : getPlatform関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// osモジュール全体をモック
vi.mock('os', () => ({
  platform: vi.fn(),
}));

// lib
import * as os from 'os';
// constants
import type { TPlatformKey } from '@shared/constants';
import { PLATFORM_TYPE } from '@shared/types';
// test target
import { clearPlatformCache, getPlatform } from '@/getPlatform';

// テスト用ヘルパー: 型安全性を保ちながら無効な値をテストする
const testInvalidPlatform = (invalidValue: string, strict = true): string => {
  return getPlatform(invalidValue as TPlatformKey | 'unknown', strict);
};

/**
 * getPlatform関数のコアプラットフォーム検出テスト
 *
 * このテストスイートでは、getPlatform関数のOSプラットフォーム検出機能を
 * 包括的にテストします。プラットフォームマッピング、エラーハンドリング、
 * デフォルト引数の動作を検証します。
 */
describe('getPlatform - Core Platform Detection', () => {
  beforeEach(() => {
    clearPlatformCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  /**
   * プラットフォームマッピングのテスト
   *
   * メジャーなOSプラットフォーム（Windows、Linux、macOS）の
   * 正しいマッピングを確認します。
   */
  describe('Platform Mapping', () => {
    it('returns "windows" for "win32"', () => {
      expect(getPlatform('win32')).toBe(PLATFORM_TYPE.WINDOWS);
    });

    it('returns "linux" for "linux"', () => {
      expect(getPlatform('linux')).toBe(PLATFORM_TYPE.LINUX);
    });

    it('returns "macos" for "darwin"', () => {
      expect(getPlatform('darwin')).toBe(PLATFORM_TYPE.MACOS);
    });
  });

  /**
   * エラーハンドリングのテスト
   *
   * サポートされていないプラットフォームの処理、strictモードの動作、
   * 空文字列入力のハンドリングを確認します。
   */
  describe('Error Handling', () => {
    it('throws for unsupported platforms by default (strict=true)', () => {
      expect(() => testInvalidPlatform('unsupported')).toThrow(/Unsupported platform/);
    });

    it('returns UNKNOWN for unsupported platforms with strict=false', () => {
      expect(testInvalidPlatform('unsupported', false)).toBe(PLATFORM_TYPE.UNKNOWN);
    });

    it('handles empty string input as os.platform()', () => {
      // os.platform()をモック
      const mockPlatform = vi.mocked(os.platform);
      mockPlatform.mockReturnValue('darwin');

      const result = testInvalidPlatform('');
      expect(result).toBe(PLATFORM_TYPE.MACOS);
      const resultNonStrict = testInvalidPlatform('', false);
      expect(resultNonStrict).toBe(PLATFORM_TYPE.MACOS);
    });
  });

  /**
   * 大文字小文字の区別テスト
   *
   * プラットフォーム名の大文字小文字の区別が適切に
   * 処理されることを確認します。
   */
  describe('Case Sensitivity', () => {
    it('handles case sensitivity correctly', () => {
      expect(() => testInvalidPlatform('WIN32')).toThrow(/Unsupported platform/);
      expect(() => testInvalidPlatform('Linux')).toThrow(/Unsupported platform/);
      expect(() => testInvalidPlatform('Darwin')).toThrow(/Unsupported platform/);
    });
  });

  /**
   * デフォルト引数のテスト
   */
  describe('Default Arguments', () => {
    it('uses os.platform() when no platform argument provided', () => {
      // os.platform()をモック
      const mockPlatform = vi.mocked(os.platform);
      mockPlatform.mockReturnValue('win32');

      const result = getPlatform();
      expect(result).toBe(PLATFORM_TYPE.WINDOWS);
      expect(mockPlatform).toHaveBeenCalled();
    });
  });

  /**
   * キャッシュ機能のテスト
   */
  describe('Cache Functionality', () => {
    it('uses os.platform() result when called with empty string', () => {
      // os.platform()をモック
      const mockPlatform = vi.mocked(os.platform);
      mockPlatform.mockReturnValue('linux');

      const result = getPlatform('');
      expect(result).toBe(PLATFORM_TYPE.LINUX);
    });

    it('caches result and calls os.platform() only once', () => {
      // os.platform()をモック
      const mockPlatform = vi.mocked(os.platform);
      mockPlatform.mockReturnValue('win32');

      // 空文字列で最初の呼び出し
      const result1 = getPlatform('');
      expect(result1).toBe(PLATFORM_TYPE.WINDOWS);
      expect(mockPlatform).toHaveBeenCalledTimes(1);

      // 間に明示的なプラットフォーム指定を挟む（os.platform()は呼ばれない）
      const darwinResult = getPlatform('darwin');
      expect(darwinResult).toBe(PLATFORM_TYPE.MACOS);
      expect(mockPlatform).toHaveBeenCalledTimes(1); // 1回のまま

      // 空文字列で2回目の呼び出し - キャッシュされているので同じ結果、os.platform()は呼ばれない
      const result2 = getPlatform('');
      expect(result2).toBe(PLATFORM_TYPE.WINDOWS);
      expect(mockPlatform).toHaveBeenCalledTimes(1); // 1回のまま

      // 3回目の空文字列呼び出しもキャッシュが使われる
      const result3 = getPlatform('');
      expect(result3).toBe(PLATFORM_TYPE.WINDOWS);
      expect(mockPlatform).toHaveBeenCalledTimes(1); // 1回のまま

      // 結果の一貫性確認
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('uses strict=true by default', () => {
      expect(() => testInvalidPlatform('unsupported')).toThrow(/Unsupported platform/);
    });
  });
});
