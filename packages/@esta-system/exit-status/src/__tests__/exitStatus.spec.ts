// src/__tests__/exitStatus.spec.ts
// @(#) : Exit Status Manager Unit Tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants
import { EXIT_CODE } from '@shared/constants';
// Testing framework - test utilities
import { beforeEach, describe, expect, it } from 'vitest';
// test target
import { ExitStatus } from '../exitStatus';

/**
 * ExitStatus class unit tests
 *
 * Tests the singleton exit status manager functionality including
 * setting, getting, and resetting exit status codes.
 */
describe('ExitStatus', () => {
  beforeEach(() => {
    ExitStatus.reset();
  });

  /**
   * Basic functionality tests
   *
   * Tests core methods: set(), get(), and reset()
   */
  describe('基本機能', () => {
    it('set()で非ゼロ値を設定できる', () => {
      ExitStatus.set(1);
      expect(ExitStatus.get()).toBe(1);
    });

    it('get()で設定された値を取得できる', () => {
      ExitStatus.set(42);
      expect(ExitStatus.get()).toBe(42);
    });

    it('reset()で値をリセットできる', () => {
      ExitStatus.set(5);
      ExitStatus.reset();
      expect(ExitStatus.get()).toBe(0);
    });

    it('set(0)で0を設定してもstatusは変わらない', () => {
      ExitStatus.set(0);
      expect(ExitStatus.get()).toBe(0);
    });
  });

  /**
   * Specification-specific behavior tests
   *
   * Tests unique behavior requirements such as non-zero persistence,
   * multiple value handling, and constant integration.
   */
  describe('仕様固有の動作', () => {
    it('一度非ゼロ値を設定したら、ゼロを設定しても変更されない', () => {
      ExitStatus.set(1);
      ExitStatus.set(0);
      expect(ExitStatus.get()).toBe(1);
    });

    it('複数の非ゼロ値を設定した場合、最後の値が保持される', () => {
      ExitStatus.set(1);
      ExitStatus.set(2);
      expect(ExitStatus.get()).toBe(2);
    });

    it('負の終了コードは設定されない', () => {
      ExitStatus.set(-1);
      expect(ExitStatus.get()).toBe(0);
    });

    it('EXIT_CODE.SUCCESS定数として正しく動作する', () => {
      ExitStatus.set(EXIT_CODE.SUCCESS);
      expect(ExitStatus.get()).toBe(0);
    });
  });

  /**
   * Edge case tests
   *
   * Tests boundary conditions and unusual scenarios to ensure
   * robust behavior under various conditions.
   */
  describe('エッジケース', () => {
    it('連続してreset()を呼んでも問題ない', () => {
      ExitStatus.set(1);
      ExitStatus.reset();
      ExitStatus.reset();
      expect(ExitStatus.get()).toBe(0);
    });

    it('大きな終了コード値も正しく処理される', () => {
      ExitStatus.set(255);
      expect(ExitStatus.get()).toBe(255);
    });
  });
});
