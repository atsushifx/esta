// src/getRuntime.spec.ts
// @(#) : BDD test suite for getRuntime function
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { TExecRuntime } from '../../shared/types/TExecRuntime.types';
import { getRuntime } from '../getRuntime';

// Type for global this with runtime objects
type RuntimeGlobalThis = {
  Deno?: unknown;
  Bun?: unknown;
  process?: typeof process;
};

describe('getRuntime function', () => {
  describe('各ランタイムを正しく検出する', () => {
    it('Node.js環境でTExecRuntime.Nodeを返す', () => {
      expect(getRuntime()).toBe(TExecRuntime.Node);
    });

    it('Deno環境でTExecRuntime.Denoを返す', () => {
      // Mock Deno global object
      (globalThis as RuntimeGlobalThis).Deno = {};
      expect(getRuntime()).toBe(TExecRuntime.Deno);
      // Cleanup
      delete (globalThis as RuntimeGlobalThis).Deno;
    });

    it('Bun環境でTExecRuntime.Bunを返す', () => {
      // Mock Bun global object
      (globalThis as RuntimeGlobalThis).Bun = {};
      expect(getRuntime()).toBe(TExecRuntime.Bun);
      // Cleanup
      delete (globalThis as RuntimeGlobalThis).Bun;
    });

    it('GitHub Actions環境でTExecRuntime.GHAを返す', () => {
      // Mock GitHub Actions environment
      const originalValue = process.env.GITHUB_ACTIONS;
      process.env.GITHUB_ACTIONS = 'true';
      expect(getRuntime()).toBe(TExecRuntime.GHA);
      // Cleanup
      if (originalValue === undefined) {
        delete process.env.GITHUB_ACTIONS;
      } else {
        process.env.GITHUB_ACTIONS = originalValue;
      }
    });
  });

  describe('不明な環境での処理', () => {
    it('検出不可能な環境でTExecRuntime.Unknownを返す', () => {
      // Mock clean environment
      const originalGitHubActions = process.env.GITHUB_ACTIONS;
      const originalProcess = (globalThis as RuntimeGlobalThis).process;

      // Clean environment - no GitHub Actions, no process
      delete process.env.GITHUB_ACTIONS;
      (globalThis as RuntimeGlobalThis).process = { env: {} } as typeof process;

      expect(getRuntime()).toBe(TExecRuntime.Unknown);

      // Cleanup
      if (originalGitHubActions !== undefined) {
        process.env.GITHUB_ACTIONS = originalGitHubActions;
      }
      (globalThis as RuntimeGlobalThis).process = originalProcess;
    });
  });

  describe('境界値とエラーケース', () => {
    it('GitHub ActionsとNode.js両方存在時はGHAを返す', () => {
      const originalValue = process.env.GITHUB_ACTIONS;
      process.env.GITHUB_ACTIONS = 'true';
      // Node.js environment is already present in test environment
      expect(getRuntime()).toBe(TExecRuntime.GHA);
      // Cleanup
      if (originalValue === undefined) {
        delete process.env.GITHUB_ACTIONS;
      } else {
        process.env.GITHUB_ACTIONS = originalValue;
      }
    });

    it('GITHUB_ACTIONS=false時はGHAを返さない', () => {
      const originalValue = process.env.GITHUB_ACTIONS;
      process.env.GITHUB_ACTIONS = 'false';
      expect(getRuntime()).not.toBe(TExecRuntime.GHA);
      // Should return Node in test environment
      expect(getRuntime()).toBe(TExecRuntime.Node);
      // Cleanup
      if (originalValue === undefined) {
        delete process.env.GITHUB_ACTIONS;
      } else {
        process.env.GITHUB_ACTIONS = originalValue;
      }
    });

    it('複数ランタイム検出時は定義順優先で返す', () => {
      // Mock both Deno and Bun present
      (globalThis as RuntimeGlobalThis).Deno = {};
      (globalThis as RuntimeGlobalThis).Bun = {};

      // Should return Deno (higher priority than Bun)
      expect(getRuntime()).toBe(TExecRuntime.Deno);

      // Cleanup
      delete (globalThis as RuntimeGlobalThis).Deno;
      delete (globalThis as RuntimeGlobalThis).Bun;
    });
  });
});
