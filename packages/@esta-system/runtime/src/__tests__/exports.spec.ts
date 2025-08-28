// src/__tests__/exports.spec.ts
// @(#) : Integration test for package exports
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';

describe('Package exports', () => {
  describe('index.tsからの正しいエクスポート', () => {
    it('getRuntime関数がエクスポートされる', async () => {
      const module = await import('../index');
      expect(module.getRuntime).toBeTypeOf('function');
    });

    it('TExecRuntime enumがエクスポートされる', async () => {
      const module = await import('../index');
      expect(module.TExecRuntime).toBeDefined();
      expect(module.TExecRuntime.Node).toBe('Node');
      expect(module.TExecRuntime.Deno).toBe('Deno');
      expect(module.TExecRuntime.Bun).toBe('Bun');
      expect(module.TExecRuntime.GHA).toBe('GitHubActions');
      expect(module.TExecRuntime.Unknown).toBe('Unknown');
    });

    it('getRuntime関数が正しく動作する', async () => {
      const { getRuntime, TExecRuntime } = await import('../index');
      const result = getRuntime();
      // Result should be one of the enum values
      expect(Object.values(TExecRuntime)).toContain(result);
    });
  });
});
