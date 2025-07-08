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

/**
 * @fileoverview 機能フラグモジュールのテストスイート
 *
 * このファイルは@esta-core/feature-flagsパッケージの機能フラグシステムの
 * 動作を検証するテストケースを含んでいます。
 */

/**
 * 機能フラグモジュール全体のテストスイート
 *
 * 環境検出機能と機能フラグの状態管理機能をテストします。
 */
describe('Feature Flags Module', () => {
  /**
   * 環境検出機能のテストスイート
   *
   * 実行環境の自動判定とデフォルト値の設定に関するテストを行います。
   */
  describe('Environment Detection', () => {
    /**
     * getExecutionModeFromEnvironment関数のテストスイート
     *
     * 環境変数GITHUB_ACTIONSの値に基づいて実行モードを正しく判定することを検証します。
     */
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

    /**
     * defaultFeatures定数のテストスイート
     *
     * モジュールインポート時に環境に応じて自動設定される
     * デフォルト機能フラグの動作を検証します。
     */
    describe('defaultFeatures', () => {
      it('should be automatically set based on environment on import', () => {
        // defaultFeaturesは環境に応じて設定される不変の初期値
        expect([TEstaExecutionMode.GITHUB_ACTIONS, TEstaExecutionMode.CLI]).toContain(defaultFeatures.executionMode);
      });
    });
  });

  /**
   * 機能フラグ状態管理のテストスイート
   *
   * 実行時の機能フラグ状態の管理と更新機能をテストします。
   */
  describe('Feature Flag State Management', () => {
    /**
     * estaFeatures変数のテストスイート
     *
     * 実行時に変更可能な機能フラグ状態の基本的な動作を検証します。
     */
    describe('estaFeatures', () => {
      it('should be independent from defaultFeatures', () => {
        // defaultFeaturesとestaFeaturesは独立している
        expect(estaFeatures).not.toBe(defaultFeatures);
      });
    });

    /**
     * initEstaFeatures関数のテストスイート
     *
     * 機能フラグの初期化処理とパラメータによる制御を検証します。
     */
    describe('initEstaFeatures', () => {
      /**
       * 明示的なパラメータ指定時の動作テスト
       *
       * executionModeパラメータが指定された場合の動作を検証します。
       */
      describe('with explicit parameter', () => {
        it('should override executionMode when parameter is specified', () => {
          // パラメータでCLIを指定してinitEstaFeaturesを実行
          const result = initEstaFeatures(TEstaExecutionMode.CLI);

          // パラメータで指定した値になることを確認
          expect(result.executionMode).toBe(TEstaExecutionMode.CLI);
          expect(estaFeatures.executionMode).toBe(TEstaExecutionMode.CLI);
        });
      });

      /**
       * パラメータ未指定時の動作テスト
       *
       * executionModeパラメータが省略された場合の動作を検証します。
       */
      describe('without parameter', () => {
        it('should use defaultFeatures when no parameter is specified', () => {
          // initEstaFeaturesを実行（パラメータなし）
          const result = initEstaFeatures();

          // defaultFeaturesの値が使用されることを確認
          expect(result.executionMode).toBe(defaultFeatures.executionMode);
          expect(estaFeatures.executionMode).toBe(defaultFeatures.executionMode);
        });
      });

      /**
       * 実行モード切り替え機能のテスト
       *
       * 異なる実行モード間での動的な切り替えが正しく動作することを検証します。
       */
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
