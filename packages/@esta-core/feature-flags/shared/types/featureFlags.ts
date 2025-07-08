// src: ./shared/types/featureFlags.ts
// @(#) : ESTA Feature Flags
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * @fileoverview ESTA機能フラグシステムの型定義
 *
 * このファイルはESTA(Easy Setup Tools Action)プロジェクトの機能フラグシステムで
 * 使用される型定義を含んでいます。実行環境の判定や機能の切り替えに使用されます。
 */

// import { DISABLE, ENABLE } from '@shared/constants';

/**
 * ESTA実行モードの列挙型
 *
 * ESTAが実行される環境を表します。この値に基づいて機能フラグの
 * 動作が決定されます。
 *
 * @enum {string}
 * @readonly
 *
 * @example
 * ```typescript
 * // GitHub Actions環境での実行
 * const mode = TEstaExecutionMode.GITHUB_ACTIONS; // 'GHA'
 *
 * // CLI環境での実行
 * const mode = TEstaExecutionMode.CLI; // 'CLI'
 * ```
 */
export enum TEstaExecutionMode {
  /**
   * GitHub Actions環境での実行
   *
   * GitHub ActionsのワークフロータスクやジョブのCI/CD環境での
   * 実行を表します。
   */
  'GITHUB_ACTIONS' = 'GHA',

  /**
   * CLI環境での実行
   *
   * ローカル開発環境やターミナルでの直接実行を表します。
   */
  'CLI' = 'CLI',
}

/**
 * ESTA機能フラグの設定型
 *
 * ESTA機能フラグシステムの設定を定義する型です。
 * 実行モードに応じて機能の有効/無効を制御します。
 *
 * @interface
 *
 * @property {TEstaExecutionMode} executionMode - 現在の実行モード
 *
 * @example
 * ```typescript
 * // GitHub Actions環境用の設定
 * const ghaFeatures: TEstaFeatureFlags = {
 *   executionMode: TEstaExecutionMode.GITHUB_ACTIONS
 * };
 *
 * // CLI環境用の設定
 * const cliFeatures: TEstaFeatureFlags = {
 *   executionMode: TEstaExecutionMode.CLI
 * };
 * ```
 */
export type TEstaFeatureFlags = {
  /**
   * 実行モード
   *
   * ESTAが実行される環境を示します。この値に基づいて
   * 各機能の動作が決定されます。
   */
  executionMode: TEstaExecutionMode;
};
