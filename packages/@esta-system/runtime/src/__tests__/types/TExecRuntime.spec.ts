// src: shared/types/types/__tests__/TExecRuntime.spec.ts
// @(#) : BDD test suite for TExecRuntime enum
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { TExecRuntime } from '../../../shared/types/TExecRuntime.types';

describe('TExecRuntime enum', () => {
  describe('enumが正しい値を持つ', () => {
    it('Node値がNodeという文字列である', () => {
      expect(TExecRuntime.Node).toBe('Node');
    });

    it('Deno値がDenoという文字列である', () => {
      expect(TExecRuntime.Deno).toBe('Deno');
    });

    it('Bun値がBunという文字列である', () => {
      expect(TExecRuntime.Bun).toBe('Bun');
    });

    it('GHA値がGitHubActionsという文字列である', () => {
      expect(TExecRuntime.GHA).toBe('GitHubActions');
    });

    it('Unknown値がUnknownという文字列である', () => {
      expect(TExecRuntime.Unknown).toBe('Unknown');
    });
  });

  describe('enumが正しい数の項目を持つ', () => {
    it('enumが5つの項目を持つ', () => {
      const keys = Object.keys(TExecRuntime);
      expect(keys).toHaveLength(5);
    });
  });

  describe('enumの全ての値がユニークである', () => {
    it('enumの全ての値が重複していない', () => {
      const values = Object.values(TExecRuntime);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });
});
