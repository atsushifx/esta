import { existsSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { executeRuntimeDetector, isRuntimeAvailable } from '../helpers/runtimeTestUtils';

describe('Runtime Detection E2E Tests', () => {
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
});
