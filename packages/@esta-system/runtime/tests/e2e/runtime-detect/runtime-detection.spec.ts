// src: tests/e2e/runtime-detect/runtime-detection.spec.ts
// @(#) : E2E test suite for runtime detection
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Node.js built-in modules
import { existsSync } from 'fs';
import path from 'path';

// Test framework utilities
import { describe, expect, it } from 'vitest';

// Test helper utilities
import { executeRuntimeDetector, isRuntimeAvailable } from '../helpers/runtimeTestUtils';

describe('Runtime Detection E2E Tests', () => {
  /** ランタイム検出ヘルパープログラムの絶対パス */
  const helperPath = path.resolve(__dirname, 'helpers', 'runtime-detector.ts');

  /**
   * @description テスト実行に必要なリソースとセットアップの検証
   * - runtime-detector.tsファイルの存在確認
   * - getRuntime関数のimport可能性確認
   */
  describe('Given: テスト実行環境が準備されている', () => {
    /**
     * @description テスト実行に必要なファイルとリソースの存在確認
     * - ヘルパーファイルの物理的存在
     * - 必要な関数のimport動作
     */
    describe('When: 必要なリソースが存在する', () => {
      it('runtime-detector.ts ファイルが存在し、getRuntime関数がimportできる', async () => {
        expect(existsSync(helperPath)).toBe(true);

        const { getRuntime } = await import('./helpers/runtime-detector');
        expect(typeof getRuntime).toBe('function');
      });
    });
  });

  /**
   * @description 各種JavaScript/TypeScriptランタイム環境での検出機能テスト
   * - Node.js環境での検出とバージョン情報取得
   * - Deno環境での検出（利用可能な場合）
   * - Bun環境での検出（利用可能な場合）
   */
  describe('Given: 各種ランタイム環境', () => {
    /**
     * @description ランタイム検出機能の実行とその結果検証
     * - 各ランタイム固有のコマンドでの実行
     * - 返却されるランタイム情報の正確性確認
     * - 利用不可能なランタイムのスキップ処理
     */
    describe('When: ランタイム検出を実行する', () => {
      it('Node.js環境: TSXでランタイム検出を実行すると、Node環境とバージョン情報が返される', async () => {
        const result = await executeRuntimeDetector('pnpm exec tsx', helperPath);

        expect(result.runtime).toBe('Node');
        expect(result.process).toMatch(/^v\d+\.\d+\.\d+/);
      }, 10_000);

      it('Deno環境: 利用可能な場合、Denoランタイムが正確に検出される', async () => {
        const isDenoAvailable = await isRuntimeAvailable('deno');

        if (!isDenoAvailable) {
          console.warn('Deno is not available, skipping test');
          return;
        }

        const result = await executeRuntimeDetector('deno run --allow-read --allow-env', helperPath);
        expect(result.runtime).toBe('Deno');
      }, 10_000);

      it('Bun環境: 利用可能な場合、Bunランタイムが正確に検出される', async () => {
        const isBunAvailable = await isRuntimeAvailable('bun');

        if (!isBunAvailable) {
          console.warn('Bun is not available, skipping test');
          return;
        }

        const result = await executeRuntimeDetector('bun run', helperPath);
        expect(result.runtime).toBe('Bun');
      }, 10_000);
    });
  });

  /**
   * @description ランタイム検出のエラーハンドリング機能テスト
   * - 不正なコマンドでの実行時の例外処理
   * - 存在しないファイルパスでの実行エラー処理
   * - タイムアウト時の適切な処理
   */
  describe('Given: ランタイム検出のエラーハンドリング', () => {
    /**
     * @description エラー状況での実行とエラー処理の検証
     * - コマンド実行失敗時の例外キャッチ
     * - 不正なパス指定時の適切なエラーメッセージ
     * - 長時間実行コマンドのタイムアウト処理
     */
    describe('When: エラー状況でランタイム検出を実行する', () => {
      it('存在しないコマンドでの実行時、適切なエラーが投げられる', async () => {
        await expect(executeRuntimeDetector('nonexistent-command', helperPath))
          .rejects.toThrow();
      }, 5_000);

      it('存在しないファイルパスでの実行時、適切なエラーが投げられる', async () => {
        const nonExistentPath = path.resolve(__dirname, 'nonexistent-file.ts');

        await expect(executeRuntimeDetector('pnpm exec tsx', nonExistentPath))
          .rejects.toThrow();
      }, 5_000);

      it('タイムアウト発生時、適切にエラーハンドリングされる', async () => {
        const timeoutCommand = process.platform === 'win32'
          ? 'timeout /t 15'
          : 'sleep 15';

        await expect(executeRuntimeDetector(timeoutCommand, helperPath))
          .rejects.toThrow();
      }, 8_000);
    });
  });

  /**
   * @description 環境変数汚染対策とテスト分離機能テスト
   * - テスト実行前後での環境変数状態の保持
   * - 複数テスト実行時の相互影響の排除
   * - プロセス環境の適切なクリーンアップ
   */
  describe('Given: テスト環境の分離とクリーンアップ', () => {
    /**
     * @description 環境変数とプロセス状態の分離テスト
     * - 各テスト実行前後での環境変数の一貫性確認
     * - テスト間でのランタイム検出結果の独立性検証
     * - グローバル状態のクリーンアップ動作確認
     */
    describe('When: 複数のテストを連続実行する', () => {
      it('GITHUB_ACTIONS環境変数が設定されても他のテストに影響しない', async () => {
        // 最初のテスト: GITHUB_ACTIONS=true で実行
        process.env.GITHUB_ACTIONS = 'true';
        const firstResult = await executeRuntimeDetector('pnpm exec tsx', helperPath);

        // 環境変数をクリア
        delete process.env.GITHUB_ACTIONS;

        // 2番目のテスト: 通常のNode.js環境での実行
        const secondResult = await executeRuntimeDetector('pnpm exec tsx', helperPath);

        // 結果の独立性を確認
        expect(firstResult.runtime).not.toBe(secondResult.runtime);
        expect(secondResult.runtime).toBe('Node');
      }, 15_000);

      it('複数回の実行で一貫したランタイム検出結果が得られる', async () => {
        const results: string[] = [];

        // 3回連続でランタイム検出を実行
        for (let i = 0; i < 3; i++) {
          const result = await executeRuntimeDetector('pnpm exec tsx', helperPath);
          results.push(result.runtime);
        }

        // 全ての結果が同じであることを確認
        expect(results.every((runtime) => runtime === results[0])).toBe(true);
      }, 20_000);
    });
  });
});
