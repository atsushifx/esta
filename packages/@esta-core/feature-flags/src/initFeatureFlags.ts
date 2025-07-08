// src: ./initFeatureFlags.ts
// @(#) : initialize ESTA Feature Flags
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { TEstaFeatureFlags } from '../shared/types/featureFlags';
import { TEstaExecutionMode } from '../shared/types/featureFlags';

// 環境判定ロジック
export const getExecutionModeFromEnvironment = (): TEstaExecutionMode => {
  return process.env.GITHUB_ACTIONS === 'true' ? TEstaExecutionMode.GITHUB_ACTIONS : TEstaExecutionMode.CLI;
};

// import時に自動的に環境判定を行ってdefaultFeaturesを設定（const、不変）
export const defaultFeatures: TEstaFeatureFlags = {
  executionMode: getExecutionModeFromEnvironment(),
};

// 現在のfeatureFlags状態を保持（let、可変）
export let estaFeatures: TEstaFeatureFlags = {
  ...defaultFeatures,
};

export const initEstaFeatures = (executionMode?: TEstaExecutionMode): TEstaFeatureFlags => {
  // パラメータが指定されたらその値を使用、されなければdefaultFeaturesをコピー
  const mode = executionMode ?? defaultFeatures.executionMode;

  // estaFeaturesを更新
  estaFeatures = {
    ...defaultFeatures,
    executionMode: mode,
  };

  return estaFeatures;
};
