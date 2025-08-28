import { existsSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { executeRuntimeDetector, isRuntimeAvailable } from '../helpers/runtimeTestUtils';

describe('Runtime Detection E2E Tests', () => {
  const helperPath = path.resolve(__dirname, 'helpers', 'runtime-detector.ts');

  describe('Helper program setup', () => {
    it('runtime-detector.ts ファイルが存在する', () => {
      expect(existsSync(helperPath)).toBe(true);
    });

    it('getRuntime関数が正しくimportできる', async () => {
      const { getRuntime } = await import('./helpers/runtime-detector');
      expect(typeof getRuntime).toBe('function');
    });
  });

  describe('各ランタイム検出テスト', () => {
    it('Node.js環境でTExecRuntime.Nodeが検出される', async () => {
      const result = await executeRuntimeDetector('pnpm exec tsx', helperPath);

      expect(result.runtime).toBe('Node');
      expect(result.process).toMatch(/^v\d+\.\d+\.\d+/);
    }, 10000);

    it('Deno利用可能時にTExecRuntime.Denoが検出される', async () => {
      const isDenoAvailable = await isRuntimeAvailable('deno');

      if (!isDenoAvailable) {
        console.warn('Deno is not available, skipping test');
        return;
      }

      const result = await executeRuntimeDetector('deno run --allow-read --allow-env', helperPath);
      expect(result.runtime).toBe('Deno');
    }, 10000);

    it('Bun利用可能時にTExecRuntime.Bunが検出される', async () => {
      const isBunAvailable = await isRuntimeAvailable('bun');

      if (!isBunAvailable) {
        console.warn('Bun is not available, skipping test');
        return;
      }

      const result = await executeRuntimeDetector('bun run', helperPath);
      expect(result.runtime).toBe('Bun');
    }, 10000);
  });
});
