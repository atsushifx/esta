// src/__tests__/platformCheckers.spec.ts
// @(#) : プラットフォーム判定関数のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
// test target
import { isLinux, isMacOS, isWindows } from '../getPlatform';

/**
 * プラットフォーム判定関数のテスト
 *
 * このテストスイートでは、isWindows、isLinux、isMacOS関数の
 * プラットフォーム判定機能を包括的にテストします。
 * process.platformをモックして異なるプラットフォームでの動作を確認します。
 */
describe('Platform Checker Functions', () => {
  let originalPlatform: PropertyDescriptor | undefined;

  beforeEach(() => {
    // Store original process.platform descriptor
    originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
  });

  afterEach(() => {
    // Restore original process.platform
    if (originalPlatform) {
      Object.defineProperty(process, 'platform', originalPlatform);
    }
  });

  /**
   * isWindows関数のテスト
   */
  describe('isWindows', () => {
    it('returns true for Windows platform', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true,
      });

      expect(isWindows()).toBe(true);
    });

    it('returns false for non-Windows platforms', () => {
      const nonWindowsPlatforms = ['linux', 'darwin'];

      nonWindowsPlatforms.forEach((platform) => {
        Object.defineProperty(process, 'platform', {
          value: platform,
          configurable: true,
        });

        expect(isWindows()).toBe(false);
      });
    });
  });

  /**
   * isLinux関数のテスト
   */
  describe('isLinux', () => {
    it('returns true for Linux platform', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true,
      });

      expect(isLinux()).toBe(true);
    });

    it('returns false for non-Linux platforms', () => {
      const nonLinuxPlatforms = ['win32', 'darwin'];

      nonLinuxPlatforms.forEach((platform) => {
        Object.defineProperty(process, 'platform', {
          value: platform,
          configurable: true,
        });

        expect(isLinux()).toBe(false);
      });
    });
  });

  /**
   * isMacOS関数のテスト
   */
  describe('isMacOS', () => {
    it('returns true for macOS platform', () => {
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        configurable: true,
      });

      expect(isMacOS()).toBe(true);
    });

    it('returns false for non-macOS platforms', () => {
      const nonMacOSPlatforms = ['win32', 'linux'];

      nonMacOSPlatforms.forEach((platform) => {
        Object.defineProperty(process, 'platform', {
          value: platform,
          configurable: true,
        });

        expect(isMacOS()).toBe(false);
      });
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

      expect(() => isWindows()).toThrow(/Unsupported platform/);
      expect(() => isLinux()).toThrow(/Unsupported platform/);
      expect(() => isMacOS()).toThrow(/Unsupported platform/);
    });
  });
});
