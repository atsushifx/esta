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
import { withEnvVar, withMockRuntime } from './helpers/testUtils';

describe('getRuntime function', () => {
  describe('各ランタイムを正しく検出する', () => {
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

  describe('境界値テスト', () => {
    it('GITHUB_ACTIONS=false時はGHAを返さない', () => {
      withEnvVar('GITHUB_ACTIONS', 'false', () => {
        expect(getRuntime()).toBe(TExecRuntime.Node);
      });
    });

    it('複数ランタイム検出時はDeno優先で返す', () => {
      withMockRuntime('Deno', () => {
        withMockRuntime('Bun', () => {
          expect(getRuntime()).toBe(TExecRuntime.Deno);
        });
      });
    });
  });
});
