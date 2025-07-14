// src/__tests__/platformCheckers.spec.ts
// @(#) : プラットフォーム判定関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';
// test target
import { getPlatform } from '@/getPlatform';
// constants
import { PLATFORM_TYPE } from '../../shared/types';

/**
 * プラットフォーム判定関数のテスト
 *
 * このテストスイートでは、isWindows、isLinux、isMacOS関数の
 * プラットフォーム判定機能を包括的にテストします。
 * process.platformをモックして異なるプラットフォームでの動作を確認します。
 */
describe('Platform Checker Functions', () => {
  const isWindows = (platform?: string): boolean => {
    return getPlatform(platform as string) === PLATFORM_TYPE.WINDOWS;
  };

  const isLinux = (platform?: string): boolean => {
    return getPlatform(platform as string) === PLATFORM_TYPE.LINUX;
  };

  const isMacOS = (platform?: string): boolean => {
    return getPlatform(platform as string) === PLATFORM_TYPE.MACOS;
  };

  /**
   * isWindows関数のテスト
   */
  describe('isWindows', () => {
    it('returns true for Windows platform', () => {
      expect(isWindows('win32')).toBe(true);
    });

    it('returns false for non-Windows platforms', () => {
      const nonWindowsPlatforms = ['linux', 'darwin'];

      nonWindowsPlatforms.forEach((platform) => {
        expect(isWindows(platform)).toBe(false);
      });
    });
  });

  /**
   * isLinux関数のテスト
   */
  describe('isLinux', () => {
    it('returns true for Linux platform', () => {
      expect(isLinux('linux')).toBe(true);
    });

    it('returns false for non-Linux platforms', () => {
      const nonLinuxPlatforms = ['win32', 'darwin'];

      nonLinuxPlatforms.forEach((platform) => {
        expect(isLinux(platform)).toBe(false);
      });
    });
  });

  /**
   * isMacOS関数のテスト
   */
  describe('isMacOS', () => {
    it('returns true for macOS platform', () => {
      expect(isMacOS('darwin')).toBe(true);
    });

    it('returns false for non-macOS platforms', () => {
      const nonMacOSPlatforms = ['win32', 'linux'];

      nonMacOSPlatforms.forEach((platform) => {
        expect(isMacOS(platform)).toBe(false);
      });
    });
  });

  /**
   * エラーハンドリングのテスト
   */
  describe('Error Handling', () => {
    it('throws for unsupported platforms', () => {
      expect(() => isWindows('freebsd')).toThrow(/Unsupported platform/);
      expect(() => isLinux('freebsd')).toThrow(/Unsupported platform/);
      expect(() => isMacOS('freebsd')).toThrow(/Unsupported platform/);
    });
  });
});
