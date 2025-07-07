// src: ./__tests__/initFeatureFlags.spec.ts
// @(#) : initFeatureFlags test
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// test target
import { TEstaExecutionMode } from '../../shared/types/featureFlags';
import { defaultFeatures, estaFeatures, initEstaFeatures } from '../initFeatureFlags';

describe('defaultFeatures', () => {
  it('should be automatically set based on environment on import', () => {
    // defaultFeaturesは環境に応じて設定される不変の初期値
    expect([TEstaExecutionMode.GITHUB_ACTIONS, TEstaExecutionMode.CLI]).toContain(defaultFeatures.executionMode);
  });
});

describe('estaFeatures', () => {
  it('should be independent from defaultFeatures', () => {
    // defaultFeaturesとestaFeaturesは独立している
    expect(estaFeatures).not.toBe(defaultFeatures);
  });
});

describe('initEstaFeatures', () => {
  it('should override executionMode when parameter is specified', () => {
    // パラメータでCLIを指定してinitEstaFeaturesを実行
    const result = initEstaFeatures(TEstaExecutionMode.CLI);

    // パラメータで指定した値になることを確認
    expect(result.executionMode).toBe(TEstaExecutionMode.CLI);
    expect(estaFeatures.executionMode).toBe(TEstaExecutionMode.CLI);
  });

  it('should use defaultFeatures when no parameter is specified', () => {
    // initEstaFeaturesを実行（パラメータなし）
    const result = initEstaFeatures();

    // defaultFeaturesの値が使用されることを確認
    expect(result.executionMode).toBe(defaultFeatures.executionMode);
    expect(estaFeatures.executionMode).toBe(defaultFeatures.executionMode);
  });

  it('should be able to switch between different modes', () => {
    // GITHUB_ACTIONSモードに設定
    initEstaFeatures(TEstaExecutionMode.GITHUB_ACTIONS);
    expect(estaFeatures.executionMode).toBe(TEstaExecutionMode.GITHUB_ACTIONS);

    // CLIモードに切り替え
    initEstaFeatures(TEstaExecutionMode.CLI);
    expect(estaFeatures.executionMode).toBe(TEstaExecutionMode.CLI);
  });
});
