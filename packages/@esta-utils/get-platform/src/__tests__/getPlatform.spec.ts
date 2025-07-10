// src/__tests__/getPlatform.spec.ts
// @(#) : getPlatform関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';
// constants
import type { TPlatformKey } from '@shared/constants';
import { PLATFORM_TYPE } from '@shared/types';
// test target
import { getPlatform } from '@/getPlatform';

// テスト用ヘルパー: 型安全性を保ちながら無効な値をテストする
const testInvalidPlatform = (invalidValue: string, strict = true) => {
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

    it('handles empty string input', () => {
      expect(() => testInvalidPlatform('')).toThrow(/Unsupported platform/);
      expect(testInvalidPlatform('', false)).toBe(PLATFORM_TYPE.UNKNOWN);
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
      const result = getPlatform();
      expect(Object.values(PLATFORM_TYPE)).toContain(result);
    });

    it('uses strict=true by default', () => {
      expect(() => testInvalidPlatform('unsupported')).toThrow(/Unsupported platform/);
    });
  });
});
