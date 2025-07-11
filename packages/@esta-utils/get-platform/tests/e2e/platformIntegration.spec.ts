// tests/e2e/platformIntegration.spec.ts
// @(#) : プラットフォーム検出機能の統合テスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';
// types
import { PLATFORM_TYPE } from '../../shared/types';
// test target
import {
  estaUtils,
  getDelimiter,
  getPlatform,
  isLinux,
  isMacOS,
  isWindows,
} from '@/index';

describe('Platform Detection Integration', () => {
  describe('Cross-Function Consistency', () => {
    it('platform checkers match getPlatform results', () => {
      const testScenarios = [
        { osPlatform: 'win32' as const, expectedType: PLATFORM_TYPE.WINDOWS },
        { osPlatform: 'linux' as const, expectedType: PLATFORM_TYPE.LINUX },
        { osPlatform: 'darwin' as const, expectedType: PLATFORM_TYPE.MACOS },
      ];

      testScenarios.forEach(({ osPlatform, expectedType }) => {
        // Test direct function consistency
        const detectedType = getPlatform(osPlatform);
        expect(detectedType).toBe(expectedType);

        // Mock process.platform for checker functions
        const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
        Object.defineProperty(process, 'platform', {
          value: osPlatform,
          configurable: true,
        });

        // Verify exactly one checker returns true
        const checkerResults = [isWindows(), isLinux(), isMacOS()];
        const trueCount = checkerResults.filter(Boolean).length;
        expect(trueCount).toBe(1);

        // Verify the correct checker returns true
        switch (expectedType) {
          case PLATFORM_TYPE.WINDOWS:
            expect(isWindows()).toBe(true);
            expect(isLinux()).toBe(false);
            expect(isMacOS()).toBe(false);
            break;
          case PLATFORM_TYPE.LINUX:
            expect(isWindows()).toBe(false);
            expect(isLinux()).toBe(true);
            expect(isMacOS()).toBe(false);
            break;
          case PLATFORM_TYPE.MACOS:
            expect(isWindows()).toBe(false);
            expect(isLinux()).toBe(false);
            expect(isMacOS()).toBe(true);
            break;
        }

        // Restore original platform
        if (originalPlatform) {
          Object.defineProperty(process, 'platform', originalPlatform);
        }
      });
    });

    it('getDelimiter matches platform detection', () => {
      const scenarios = [
        { platform: 'win32', expectedDelimiter: ';' },
        { platform: 'linux', expectedDelimiter: ':' },
        { platform: 'darwin', expectedDelimiter: ':' },
      ];

      scenarios.forEach(({ platform, expectedDelimiter }) => {
        const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
        Object.defineProperty(process, 'platform', {
          value: platform,
          configurable: true,
        });

        const delimiter = getDelimiter();
        expect(delimiter).toBe(expectedDelimiter);

        // Verify delimiter matches expected platform behavior
        if (platform === 'win32') {
          expect(isWindows()).toBe(true);
          expect(delimiter).toBe(';');
        } else {
          expect(isWindows()).toBe(false);
          expect(delimiter).toBe(':');
        }

        // Restore original
        if (originalPlatform) {
          Object.defineProperty(process, 'platform', originalPlatform);
        }
      });
    });
  });

  describe('Package Export Integration', () => {
    it('all functions accessible through main export', () => {
      // Verify all functions are exported and callable
      expect(typeof getPlatform).toBe('function');
      expect(typeof isWindows).toBe('function');
      expect(typeof isLinux).toBe('function');
      expect(typeof isMacOS).toBe('function');
      expect(typeof getDelimiter).toBe('function');

      // Test actual functionality through exports
      expect(getPlatform('win32')).toBe(PLATFORM_TYPE.WINDOWS);
      expect(typeof getDelimiter()).toBe('string');
    });

    it('namespace export provides same functionality', () => {
      // Compare namespace and direct exports
      expect(estaUtils.getPlatform('linux')).toBe(getPlatform('linux'));

      const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true,
      });

      expect(estaUtils.getDelimiter()).toBe(getDelimiter());

      if (originalPlatform) {
        Object.defineProperty(process, 'platform', originalPlatform);
      }
    });
  });

  describe('Real Environment Integration', () => {
    it('functions work with actual runtime environment', () => {
      // Test with real process.platform
      const actualPlatform = getPlatform();
      const actualDelimiter = getDelimiter();

      // Verify results are consistent with environment
      expect(typeof actualPlatform).toBe('string');
      expect(Object.values(PLATFORM_TYPE)).toContain(actualPlatform);

      expect(typeof actualDelimiter).toBe('string');
      expect([';', ':']).toContain(actualDelimiter);

      // Verify platform checkers match actual environment
      const checkerResults = [isWindows(), isLinux(), isMacOS()];
      const trueCount = checkerResults.filter(Boolean).length;

      // In a real environment, exactly one should be true
      // (unless running in unsupported environment where all could be false)
      expect(trueCount).toBeGreaterThanOrEqual(0);
      expect(trueCount).toBeLessThanOrEqual(1);
    });
  });
});
