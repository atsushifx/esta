// src: ./initFeatureFlags.ts
// @(#) : initialize ESTA Feature Flags
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { TEstaFeatureFlags } from '../shared/types/featureFlags';
import { TEstaExecutionMode } from '../shared/types/featureFlags';

/**
 * 環境変数を基に実行モードを判定する関数
 *
 * @returns {TEstaExecutionMode} 判定された実行モード
 * - GITHUB_ACTIONS環境変数が'true'の場合: GITHUB_ACTIONS
 * - それ以外の場合: CLI
 *
 * @example
 * ```typescript
 * // GitHub Actions環境で実行
 * process.env.GITHUB_ACTIONS = 'true';
 * const mode = getExecutionModeFromEnvironment(); // TEstaExecutionMode.GITHUB_ACTIONS
 *
 * // ローカル環境で実行
 * process.env.GITHUB_ACTIONS = 'false';
 * const mode = getExecutionModeFromEnvironment(); // TEstaExecutionMode.CLI
 * ```
 */
export const getExecutionModeFromEnvironment = (): TEstaExecutionMode => {
  return process.env.GITHUB_ACTIONS === 'true' ? TEstaExecutionMode.GITHUB_ACTIONS : TEstaExecutionMode.CLI;
};

/**
 * デフォルトの機能フラグ設定
 *
 * モジュールインポート時に環境を自動判定して設定される不変の初期値。
 * この値は実行環境に応じて一度だけ設定され、以降は変更されません。
 *
 * @readonly
 * @type {TEstaFeatureFlags}
 */
export const defaultFeatures: TEstaFeatureFlags = {
  executionMode: getExecutionModeFromEnvironment(),
};

/**
 * 現在の機能フラグ状態
 *
 * 実行時に変更可能な機能フラグの状態を保持します。
 * initEstaFeatures関数によって更新されます。
 *
 * @type {TEstaFeatureFlags}
 */
export let estaFeatures: TEstaFeatureFlags = {
  ...defaultFeatures,
};

/**
 * 機能フラグを初期化する関数
 *
 * @param {TEstaExecutionMode} [executionMode] - 設定する実行モード（省略時はdefaultFeaturesの値を使用）
 * @returns {TEstaFeatureFlags} 初期化された機能フラグ設定
 *
 * @description
 * 機能フラグの状態を初期化し、グローバルなestaFeatures変数を更新します。
 * executionModeパラメータが指定されない場合は、defaultFeaturesの値が使用されます。
 *
 * @example
 * ```typescript
 * // 明示的にCLIモードで初期化
 * const features = initEstaFeatures(TEstaExecutionMode.CLI);
 *
 * // デフォルト値で初期化（環境に応じて自動判定）
 * const features = initEstaFeatures();
 *
 * // GitHub Actionsモードで初期化
 * const features = initEstaFeatures(TEstaExecutionMode.GITHUB_ACTIONS);
 * ```
 */
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
