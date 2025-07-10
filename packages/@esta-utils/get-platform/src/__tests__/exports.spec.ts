// src/__tests__/exports.spec.ts
// @(#) : エクスポート機能のテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';
// constants
import { PATH_DELIMITER, PLATFORM_MAP } from '@shared/constants';
// types
import { PLATFORM_TYPE } from '@shared/types';
// test target
import {
  getDelimiter,
  getPlatform,
  isLinux,
  isMacOS,
  isWindows,
} from '@/getPlatform';
// namespace
import { estaUtils } from '@/index';

/**
 * モジュールエクスポートのテスト
 *
 * このテストスイートでは、@esta-utils/get-platformパッケージから
 * エクスポートされる関数、型、定数が正しく利用可能であることを検証します。
 */
describe('Module Exports', () => {
  /**
   * 名前付きエクスポートのテスト
   *
   * getPlatform、プラットフォーム判定関数、getDelimiter、型、定数が
   * 適切に名前付きエクスポートされていることを確認します。
   */
  describe('Named Exports', () => {
    it('exports getPlatform function', () => {
      expect(typeof getPlatform).toBe('function');
      expect(getPlatform.name).toBe('getPlatform');
    });

    it('exports platform checker functions', () => {
      expect(typeof isWindows).toBe('function');
      expect(typeof isLinux).toBe('function');
      expect(typeof isMacOS).toBe('function');
      expect(isWindows.name).toBe('isWindows');
      expect(isLinux.name).toBe('isLinux');
      expect(isMacOS.name).toBe('isMacOS');
    });

    it('exports getDelimiter function', () => {
      expect(typeof getDelimiter).toBe('function');
      expect(getDelimiter.name).toBe('getDelimiter');
    });

    it('exports PLATFORM_TYPE enum', () => {
      expect(typeof PLATFORM_TYPE).toBe('object');
      expect(PLATFORM_TYPE.WINDOWS).toBe('windows');
      expect(PLATFORM_TYPE.LINUX).toBe('linux');
      expect(PLATFORM_TYPE.MACOS).toBe('macos');
      expect(PLATFORM_TYPE.UNKNOWN).toBe('');
    });

    it('exports constants', () => {
      expect(typeof PLATFORM_MAP).toBe('object');
      expect(typeof PATH_DELIMITER).toBe('object');
      expect(PLATFORM_MAP.win32).toBe('windows');
      expect(PATH_DELIMITER.WINDOWS).toBe(';');
    });
  });

  /**
   * 名前空間エクスポート（estaUtils）のテスト
   *
   * estaUtils名前空間として一括エクスポートされた機能が
   * 名前付きエクスポートと同一の機能を提供することを確認します。
   */
  describe('Namespace Export (estaUtils)', () => {
    it('contains all expected properties', () => {
      expect(estaUtils).toHaveProperty('getPlatform');
      expect(estaUtils).toHaveProperty('getDelimiter');
      expect(estaUtils).toHaveProperty('PLATFORM_TYPE');
    });

    it('references same functions as named exports', () => {
      expect(estaUtils.getPlatform).toBe(getPlatform);
      expect(estaUtils.getDelimiter).toBe(getDelimiter);
      expect(estaUtils.PLATFORM_TYPE).toBe(PLATFORM_TYPE);
    });

    it('namespace functions are callable', () => {
      expect(typeof estaUtils.getPlatform).toBe('function');
      expect(typeof estaUtils.getDelimiter).toBe('function');
      expect(estaUtils.getPlatform('win32')).toBe(PLATFORM_TYPE.WINDOWS);
    });
  });
});
