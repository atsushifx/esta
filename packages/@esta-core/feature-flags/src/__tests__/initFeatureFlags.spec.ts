// src: ./__tests__/initFeatureFlags.spec.ts
// @(#) : initFeatureFlags test
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { beforeEach, describe, expect, it, vi } from 'vitest';

// test target
import { TEstaExecutionMode } from '../../shared/types/featureFlags';
import { defaultFeatures, estaFeatures, getExecutionModeFromEnvironment, initEstaFeatures } from '../initFeatureFlags';

describe('Feature Flags Module', () => {
  describe('Environment Detection', () => {
    describe('getExecutionModeFromEnvironment', () => {
      beforeEach(() => {
        vi.restoreAllMocks();
      });

      it('should return GITHUB_ACTIONS when GITHUB_ACTIONS=true', () => {
        vi.stubEnv('GITHUB_ACTIONS', 'true');
        const result = getExecutionModeFromEnvironment();
        expect(result).toBe(TEstaExecutionMode.GITHUB_ACTIONS);
      });

      it('should return CLI when GITHUB_ACTIONS is not true', () => {
        vi.stubEnv('GITHUB_ACTIONS', 'false');
        const result = getExecutionModeFromEnvironment();
        expect(result).toBe(TEstaExecutionMode.CLI);
      });

      it('should return CLI when GITHUB_ACTIONS is undefined', () => {
        vi.stubEnv('GITHUB_ACTIONS', undefined);
        const result = getExecutionModeFromEnvironment();
        expect(result).toBe(TEstaExecutionMode.CLI);
      });
    });

    describe('defaultFeatures', () => {
      it('should be automatically set based on environment on import', () => {
        // defaultFeaturesは環境に応じて設定される不変の初期値
        expect([TEstaExecutionMode.GITHUB_ACTIONS, TEstaExecutionMode.CLI]).toContain(defaultFeatures.executionMode);
      });
    });
  });

  describe('Feature Flag State Management', () => {
    describe('estaFeatures', () => {
      it('should be independent from defaultFeatures', () => {
        // defaultFeaturesとestaFeaturesは独立している
        expect(estaFeatures).not.toBe(defaultFeatures);
      });
    });

    describe('initEstaFeatures', () => {
      describe('with explicit parameter', () => {
        it('should override executionMode when parameter is specified', () => {
          // パラメータでCLIを指定してinitEstaFeaturesを実行
          const result = initEstaFeatures(TEstaExecutionMode.CLI);

          // パラメータで指定した値になることを確認
          expect(result.executionMode).toBe(TEstaExecutionMode.CLI);
          expect(estaFeatures.executionMode).toBe(TEstaExecutionMode.CLI);
        });
      });

      describe('without parameter', () => {
        it('should use defaultFeatures when no parameter is specified', () => {
          // initEstaFeaturesを実行（パラメータなし）
          const result = initEstaFeatures();

          // defaultFeaturesの値が使用されることを確認
          expect(result.executionMode).toBe(defaultFeatures.executionMode);
          expect(estaFeatures.executionMode).toBe(defaultFeatures.executionMode);
        });
      });

      describe('mode switching', () => {
        it('should be able to switch between different modes', () => {
          // GITHUB_ACTIONSモードに設定
          initEstaFeatures(TEstaExecutionMode.GITHUB_ACTIONS);
          expect(estaFeatures.executionMode).toBe(TEstaExecutionMode.GITHUB_ACTIONS);

          // CLIモードに切り替え
          initEstaFeatures(TEstaExecutionMode.CLI);
          expect(estaFeatures.executionMode).toBe(TEstaExecutionMode.CLI);
        });
      });
    });
  });
});
