// src/getRuntime.spec.ts
// @(#) : BDD test suite for getRuntime function
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Test framework utilities
import { describe, expect, it } from 'vitest';

// Types and target function
import { TExecRuntime } from '../../shared/types/TExecRuntime.types';
import { getRuntime } from '../getRuntime';

// Test helper utilities
import { withEnvVar, withMockRuntime } from './helpers/testUtils';

describe('getRuntime function', () => {
  /**
   * @description getRuntime関数の基本検出機能テスト
   * - 各ランタイム環境での正確な検出機能を検証
   * - Node.js、Deno、Bun、GitHub Actions環境での動作確認
   */
  describe('Given: getRuntime関数の基本検出機能', () => {
    /**
     * @description 標準的なランタイム環境での実行テスト
     * - 各ランタイムが正しく識別されることを確認
     * - 対応するTExecRuntime列挙値が返されることを検証
     */
    describe('When: 標準的なランタイム環境で実行する', () => {
      it('Node.js環境でTExecRuntime.Nodeを返す', () => {
        expect(getRuntime()).toBe(TExecRuntime.Node);
      });

      it('Deno環境でTExecRuntime.Denoを返す', () => {
        withMockRuntime('Deno', () => {
          expect(getRuntime()).toBe(TExecRuntime.Deno);
        });
      });

      it('Bun環境でTExecRuntime.Bunを返す', () => {
        withMockRuntime('Bun', () => {
          expect(getRuntime()).toBe(TExecRuntime.Bun);
        });
      });

      it('GitHub Actions環境でTExecRuntime.GHAを返す', () => {
        withMockRuntime('GHA', () => {
          expect(getRuntime()).toBe(TExecRuntime.GHA);
        });
      });
    });
  });

  /**
   * @description getRuntime関数のエッジケース処理機能テスト
   * - 環境変数による制御機能の検証
   * - 複数ランタイム競合時の優先度制御機能の確認
   */
  describe('Given: getRuntime関数のエッジケース処理', () => {
    /**
     * @description 特殊な条件設定での実行テスト
     * - 環境変数によるランタイム検出制御の動作確認
     * - 複数ランタイム存在時の優先度解決機能の検証
     */
    describe('When: 特殊な条件設定で実行する', () => {
      it('GITHUB_ACTIONS=false時はGHAを返さずNodeを返す', () => {
        withEnvVar('GITHUB_ACTIONS', 'false', () => {
          expect(getRuntime()).toBe(TExecRuntime.Node);
        });
      });

      it('複数ランタイム存在時はDeno優先で返す', () => {
        withMockRuntime('Deno', () => {
          withMockRuntime('Bun', () => {
            expect(getRuntime()).toBe(TExecRuntime.Deno);
          });
        });
      });
    });
  });
});
