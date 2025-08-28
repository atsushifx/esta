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

  /**
   * @description getRuntime関数のUnknown検出機能テスト
   * - すべてのランタイム検出条件が満たされない場合の動作検証
   * - グローバルオブジェクト破損時の安全な動作確認
   */
  describe('Given: getRuntime関数のUnknown検出機能', () => {
    /**
     * @description 検出不能な環境での実行テスト
     * - すべてのランタイム識別子が存在しない状況
     * - グローバルオブジェクトが破損した状況での安全性確認
     */
    describe('When: 検出不能な環境で実行する', () => {
      it('すべてのランタイム検出条件が満たされない場合、TExecRuntime.Unknownを返す', () => {
        // Arrange: すべてのランタイム識別子を無効化
        const originalProcess = globalThis.process;
        const originalDeno = (globalThis as { Deno?: unknown }).Deno;
        const originalBun = (globalThis as { Bun?: unknown }).Bun;
        const originalGitHubActions = process.env.GITHUB_ACTIONS;

        try {
          // 環境変数を先に削除してからprocessをdelete
          delete process.env.GITHUB_ACTIONS;
          delete (globalThis as { process?: typeof process }).process;
          delete (globalThis as { Deno?: unknown }).Deno;
          delete (globalThis as { Bun?: unknown }).Bun;

          // Act & Assert
          expect(getRuntime()).toBe(TExecRuntime.Unknown);
        } finally {
          // Cleanup: 元の状態に復元
          (globalThis as { process?: typeof process }).process = originalProcess;
          if (originalDeno !== undefined) { (globalThis as { Deno?: unknown }).Deno = originalDeno; }
          if (originalBun !== undefined) { (globalThis as { Bun?: unknown }).Bun = originalBun; }
          if (originalGitHubActions !== undefined) { process.env.GITHUB_ACTIONS = originalGitHubActions; }
        }
      });

      it('processが存在するがversionsプロパティがない場合、TExecRuntime.Unknownを返す', () => {
        // Arrange: processオブジェクトを部分的に破損
        const originalVersions = process.versions;

        try {
          delete (process as { versions?: NodeJS.ProcessVersions }).versions;

          // Act & Assert
          expect(getRuntime()).toBe(TExecRuntime.Unknown);
        } finally {
          // Cleanup
          (process as { versions?: NodeJS.ProcessVersions }).versions = originalVersions;
        }
      });

      it('process.versionsが存在するがnodeプロパティがない場合、TExecRuntime.Unknownを返す', () => {
        // Arrange: process.versions.nodeを削除
        const originalNode = process.versions.node;

        try {
          delete (process.versions as { node?: string }).node;

          // Act & Assert
          expect(getRuntime()).toBe(TExecRuntime.Unknown);
        } finally {
          // Cleanup
          (process.versions as { node?: string }).node = originalNode;
        }
      });
    });
  });

  /**
   * @description getRuntime関数のGITHUB_ACTIONS環境変数エッジケーステスト
   * - 様々な環境変数値での動作検証
   * - 文字列値と真偽値の境界処理確認
   */
  describe('Given: getRuntime関数のGITHUB_ACTIONS環境変数処理', () => {
    /**
     * @description GITHUB_ACTIONS環境変数の多様な値でのテスト
     * - 'true'以外の値での動作確認
     * - 空文字、数値文字列などのエッジケース検証
     */
    describe('When: GITHUB_ACTIONS環境変数に様々な値が設定されている', () => {
      it('GITHUB_ACTIONS="1"の場合、TExecRuntime.Nodeを返す（trueではないため）', () => {
        withEnvVar('GITHUB_ACTIONS', '1', () => {
          expect(getRuntime()).toBe(TExecRuntime.Node);
        });
      });

      it('GITHUB_ACTIONS=""（空文字）の場合、TExecRuntime.Nodeを返す', () => {
        withEnvVar('GITHUB_ACTIONS', '', () => {
          expect(getRuntime()).toBe(TExecRuntime.Node);
        });
      });

      it('GITHUB_ACTIONS="True"（大文字）の場合、TExecRuntime.Nodeを返す（厳密比較のため）', () => {
        withEnvVar('GITHUB_ACTIONS', 'True', () => {
          expect(getRuntime()).toBe(TExecRuntime.Node);
        });
      });

      it('GITHUB_ACTIONS環境変数が未定義の場合、TExecRuntime.Nodeを返す', () => {
        const originalValue = process.env.GITHUB_ACTIONS;
        try {
          delete process.env.GITHUB_ACTIONS;
          expect(getRuntime()).toBe(TExecRuntime.Node);
        } finally {
          if (originalValue !== undefined) {
            process.env.GITHUB_ACTIONS = originalValue;
          }
        }
      });
    });
  });

  /**
   * @description getRuntime関数のランタイム優先度完全検証テスト
   * - 複数ランタイムが同時に存在する全パターンの確認
   * - 優先度順序の正確な動作検証
   */
  describe('Given: getRuntime関数の複数ランタイム優先度検証', () => {
    /**
     * @description 複数ランタイム同時存在時の優先度テスト
     * - GitHub Actions > Deno > Bun > Node.js の順序確認
     * - 全組み合わせパターンでの動作検証
     */
    describe('When: 複数ランタイムが同時に存在する', () => {
      it('GitHub Actions + Deno + Bun + Node.js が全て存在する場合、TExecRuntime.GHAを返す', () => {
        withEnvVar('GITHUB_ACTIONS', 'true', () => {
          withMockRuntime('Deno', () => {
            withMockRuntime('Bun', () => {
              expect(getRuntime()).toBe(TExecRuntime.GHA);
            });
          });
        });
      });

      it('Deno + Bun + Node.js が存在する場合、TExecRuntime.Denoを返す', () => {
        withMockRuntime('Deno', () => {
          withMockRuntime('Bun', () => {
            expect(getRuntime()).toBe(TExecRuntime.Deno);
          });
        });
      });

      it('GitHub Actions + Bun + Node.js が存在する場合、TExecRuntime.GHAを返す', () => {
        withEnvVar('GITHUB_ACTIONS', 'true', () => {
          withMockRuntime('Bun', () => {
            expect(getRuntime()).toBe(TExecRuntime.GHA);
          });
        });
      });

      it('GitHub Actions + Deno + Node.js が存在する場合、TExecRuntime.GHAを返す', () => {
        withEnvVar('GITHUB_ACTIONS', 'true', () => {
          withMockRuntime('Deno', () => {
            expect(getRuntime()).toBe(TExecRuntime.GHA);
          });
        });
      });

      it('Bun + Node.js が存在する場合、TExecRuntime.Bunを返す', () => {
        withMockRuntime('Bun', () => {
          expect(getRuntime()).toBe(TExecRuntime.Bun);
        });
      });
    });
  });
});
