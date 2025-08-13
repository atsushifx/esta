// src/utils/__tests__/AgLogValidators.standardLevel.spec.ts
// @(#) : isStandardLogLevel function BDD test implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogLevel } from '../../../shared/types';
import { isStandardLogLevel } from '../AgLogValidators';

describe('isStandardLogLevel function', () => {
  describe('通常レベル（0-6）の判定', () => {
    it('OFF（0）に対してtrueを返すべき', () => {
      expect(isStandardLogLevel(AG_LOGLEVEL.OFF)).toBe(true);
    });

    it('FATAL（1）に対してtrueを返すべき', () => {
      expect(isStandardLogLevel(AG_LOGLEVEL.FATAL)).toBe(true);
    });

    it('ERROR（2）に対してtrueを返すべき', () => {
      expect(isStandardLogLevel(AG_LOGLEVEL.ERROR)).toBe(true);
    });

    it('WARN（3）に対してtrueを返すべき', () => {
      expect(isStandardLogLevel(AG_LOGLEVEL.WARN)).toBe(true);
    });

    it('INFO（4）に対してtrueを返すべき', () => {
      expect(isStandardLogLevel(AG_LOGLEVEL.INFO)).toBe(true);
    });

    it('DEBUG（5）に対してtrueを返すべき', () => {
      expect(isStandardLogLevel(AG_LOGLEVEL.DEBUG)).toBe(true);
    });

    it('TRACE（6）に対してtrueを返すべき', () => {
      expect(isStandardLogLevel(AG_LOGLEVEL.TRACE)).toBe(true);
    });
  });

  describe('特殊レベルの除外', () => {
    it('VERBOSE（-11）に対してfalseを返すべき', () => {
      expect(isStandardLogLevel(AG_LOGLEVEL.VERBOSE)).toBe(false);
    });

    it('LOG（-12）に対してfalseを返すべき', () => {
      expect(isStandardLogLevel(AG_LOGLEVEL.LOG)).toBe(false);
    });

    it('DEFAULT（-99）に対してfalseを返すべき', () => {
      expect(isStandardLogLevel(AG_LOGLEVEL.DEFAULT)).toBe(false);
    });
  });

  describe('範囲外の数値の処理', () => {
    it('範囲外の負の数（-1）に対してfalseを返すべき', () => {
      expect(isStandardLogLevel(-1 as AgLogLevel)).toBe(false);
    });

    it('範囲外の正の数（7）に対してfalseを返すべき', () => {
      expect(isStandardLogLevel(7 as AgLogLevel)).toBe(false);
    });

    it('範囲外の大きな正の数（999）に対してfalseを返すべき', () => {
      expect(isStandardLogLevel(999 as AgLogLevel)).toBe(false);
    });
  });

  describe('非数値の処理', () => {
    it('文字列に対してfalseを返すべき', () => {
      expect(isStandardLogLevel('invalid' as unknown as AgLogLevel)).toBe(false);
    });

    it('nullに対してfalseを返すべき', () => {
      expect(isStandardLogLevel(null as unknown as AgLogLevel)).toBe(false);
    });

    it('undefinedに対してfalseを返すべき', () => {
      expect(isStandardLogLevel(undefined as unknown as AgLogLevel)).toBe(false);
    });

    it('オブジェクトに対してfalseを返すべき', () => {
      expect(isStandardLogLevel({} as unknown as AgLogLevel)).toBe(false);
    });

    it('配列に対してfalseを返すべき', () => {
      expect(isStandardLogLevel([] as unknown as AgLogLevel)).toBe(false);
    });

    it('関数に対してfalseを返すべき', () => {
      expect(isStandardLogLevel((() => {}) as unknown as AgLogLevel)).toBe(false);
    });
  });

  describe('数値の境界値テスト', () => {
    it('下限境界値（0）でtrueを返すべき', () => {
      expect(isStandardLogLevel(0 as AgLogLevel)).toBe(true);
    });

    it('上限境界値（6）でtrueを返すべき', () => {
      expect(isStandardLogLevel(6 as AgLogLevel)).toBe(true);
    });

    it('下限境界外（-1）でfalseを返すべき', () => {
      expect(isStandardLogLevel(-1 as AgLogLevel)).toBe(false);
    });

    it('上限境界外（7）でfalseを返すべき', () => {
      expect(isStandardLogLevel(7 as AgLogLevel)).toBe(false);
    });
  });

  describe('小数点数の処理', () => {
    it('小数点数（0.5）に対してfalseを返すべき', () => {
      expect(isStandardLogLevel(0.5 as AgLogLevel)).toBe(false);
    });

    it('小数点数（2.5）に対してfalseを返すべき', () => {
      expect(isStandardLogLevel(2.5 as AgLogLevel)).toBe(false);
    });
  });

  describe('すべての通常レベルの網羅的テスト', () => {
    it('すべての特殊レベルでfalseを返すべき', () => {
      const specialLevels = [AG_LOGLEVEL.VERBOSE, AG_LOGLEVEL.LOG, AG_LOGLEVEL.DEFAULT];
      specialLevels.forEach((level) => {
        expect(isStandardLogLevel(level)).toBe(false);
      });
    });
  });
});
