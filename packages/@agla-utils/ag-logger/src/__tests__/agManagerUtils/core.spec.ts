// src/__tests__/agManagerUtils/AgManagerUtils.spec.ts
// @(#) : Unit tests for AgManagerUtils (atsushifx-style BDD)
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// テスト対象 - createManager と getLogger ユーティリティ関数およびAgManagerグローバル変数
import { AgManager, createManager, getLogger } from '../../index';
// 型定義とクラス
import type { AgLoggerOptions } from '../../../shared/types/AgLogger.interface';
import { AgLogger } from '../../AgLogger.class';
import { AgLoggerManager } from '../../AgLoggerManager.class';

/**
 * AgManagerUtils 仕様準拠BDDテストスイート
 *
 * @description atsushifx式BDD厳格プロセスに従った実装
 * createManagerとgetLoggerユーティリティ関数の統合テスト
 *
 * @testType Unit Test (BDD)
 * @testTarget createManager and getLogger utility functions with AgManager global variable
 */
describe('manager utility functions', () => {
  /**
   * テスト前の初期化 - シングルトンリセット
   */
  beforeEach(() => {
    AgLoggerManager.resetSingleton();
  });

  /**
   * テスト後のクリーンアップ - シングルトンリセット
   */
  afterEach(() => {
    AgLoggerManager.resetSingleton();
  });

  /**
   * createManager ユーティリティ関数カテゴリ
   *
   * @description createManagerユーティリティ関数の動作をテスト
   */
  describe('createManager ユーティリティ関数', () => {
    /**
     * カテゴリ1: 初回呼び出し動作
     *
     * @description 初回呼び出し時の正常動作をテスト
     */
    describe('初回呼び出し動作', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('should return AgLoggerManager instance when called for the first time', () => {
        const manager = createManager();
        expect(manager).toBeInstanceOf(AgLoggerManager);
      });

      // 2番目のテスト追加
      it('should set AgManager global variable when called for the first time', () => {
        expect(AgManager).toBeUndefined();
        createManager();
        expect(AgManager).toBeInstanceOf(AgLoggerManager);
      });

      // 3番目のテスト追加（BDDカテゴリ1完了）
      it('should accept optional AgLoggerOptions parameter', () => {
        const options: AgLoggerOptions = { logLevel: 4 };
        expect(() => createManager(options)).not.toThrow();
      });
    });

    /**
     * カテゴリ2: 二回目以降の呼び出し制御
     *
     * @description 二回目以降の呼び出しでエラーを投げる動作をテスト
     */
    describe('二回目以降の呼び出し制御', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('should throw error when called for the second time', () => {
        createManager();
        expect(() => createManager()).toThrow(/already created/i);
      });

      // 2番目のテスト追加
      it('should throw error when called after AgLoggerManager.createManager', () => {
        AgLoggerManager.createManager();
        expect(() => createManager()).toThrow(/already created/i);
      });

      // 3番目のテスト追加（BDDカテゴリ2完了）
      it('should not update AgManager global variable on second call', () => {
        const firstManager = createManager();
        try {
          createManager();
        } catch {
          // エラーは期待される
        }
        expect(AgManager).toBe(firstManager);
      });
    });

    /**
     * カテゴリ3: AgManagerグローバル変数の一貫性
     *
     * @description AgManagerグローバル変数が正しく管理されることをテスト
     */
    describe('AgManagerグローバル変数の一貫性', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('should maintain same reference between createManager return value and AgManager', () => {
        const manager = createManager();
        expect(AgManager).toBe(manager);
      });

      // 2番目のテスト追加
      it('should provide same reference as AgLoggerManager.getManager', () => {
        createManager();
        const staticManager = AgLoggerManager.getManager();
        expect(AgManager).toBe(staticManager);
      });

      // 3番目のテスト追加（BDDカテゴリ3完了）
      it('should reset AgManager to undefined after resetSingleton', () => {
        createManager();
        expect(AgManager).toBeDefined();
        AgLoggerManager.resetSingleton();
        expect(AgManager).toBeUndefined();
      });
    });
  });

  /**
   * getLogger ユーティリティ関数カテゴリ
   *
   * @description getLoggerユーティリティ関数の動作をテスト
   */
  describe('getLogger ユーティリティ関数', () => {
    /**
     * カテゴリ1: AgManager初期化済み時の動作
     *
     * @description AgManagerが初期化済みの場合のAgLoggerインスタンス取得をテスト
     */
    describe('AgManager初期化済み時の動作', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('should return AgLogger instance when AgManager is initialized', () => {
        createManager();
        const logger = getLogger();
        expect(logger).toBeInstanceOf(AgLogger);
      });

      // 2番目のテスト追加
      it('should return same AgLogger instance as AgManager.getLogger()', () => {
        const manager = createManager();
        const managerLogger = manager.getLogger();
        const utilityLogger = getLogger();
        expect(utilityLogger).toBe(managerLogger);
      });

      // 3番目のテスト追加（BDDカテゴリ1完了）
      it('should work after AgLoggerManager.createManager without createManager utility', () => {
        AgLoggerManager.createManager();
        const logger = getLogger();
        expect(logger).toBeInstanceOf(AgLogger);
      });
    });

    /**
     * カテゴリ2: AgManager未初期化時のエラー制御
     *
     * @description AgManagerが未初期化の場合にエラーを投げる動作をテスト
     */
    describe('AgManager未初期化時のエラー制御', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('should throw error when AgManager is undefined', () => {
        expect(() => getLogger()).toThrow(/not created/i);
      });

      // 2番目のテスト追加
      it('should throw error with appropriate error message', () => {
        expect(() => getLogger()).toThrow(/Logger instance not created/i);
      });

      // 3番目のテスト追加（BDDカテゴリ2完了）
      it('should throw error after resetSingleton', () => {
        createManager();
        AgLoggerManager.resetSingleton();
        expect(() => getLogger()).toThrow(/not created/i);
      });
    });

    /**
     * カテゴリ3: 既存APIとの一貫性
     *
     * @description 既存のAgLoggerManager APIとの一貫性をテスト
     */
    describe('既存APIとの一貫性', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('should provide same interface as AgLoggerManager.getManager().getLogger()', () => {
        createManager();
        const managerLogger = AgLoggerManager.getManager().getLogger();
        const utilityLogger = getLogger();
        expect(typeof utilityLogger.log).toBe(typeof managerLogger.log);
        expect(typeof utilityLogger.setLoggerConfig).toBe(typeof managerLogger.setLoggerConfig);
      });

      // 2番目のテスト追加
      it('should work consistently with AgManager global variable', () => {
        createManager();
        const logger = getLogger();
        expect(logger).toBeInstanceOf(AgLogger);
        expect(logger.log).toBeDefined();
      });

      // 3番目のテスト追加（BDDカテゴリ3完了）
      it('should throw same error type as AgLoggerManager methods when uninitialized', () => {
        let managerError: unknown;
        let utilityError: unknown;

        try {
          AgLoggerManager.getManager();
        } catch (error) {
          managerError = error;
        }

        try {
          getLogger();
        } catch (error) {
          utilityError = error;
        }

        expect(managerError).toBeDefined();
        expect(utilityError).toBeDefined();
        expect(utilityError?.constructor.name).toBe(managerError?.constructor.name);
      });
    });
  });

  /**
   * 統合動作カテゴリ
   *
   * @description createManagerとgetLoggerの連携動作をテスト
   */
  describe('統合動作', () => {
    /**
     * カテゴリ1: createManager -> getLogger フロー
     *
     * @description 典型的な使用パターンでの動作をテスト
     */
    describe('createManager -> getLogger フロー', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('should work in typical usage pattern', () => {
        const manager = createManager();
        const logger = getLogger();
        expect(manager).toBeInstanceOf(AgLoggerManager);
        expect(logger).toBeInstanceOf(AgLogger);
      });

      // 2番目のテスト追加
      it('should provide consistent logger instance across multiple getLogger calls', () => {
        createManager();
        const logger1 = getLogger();
        const logger2 = getLogger();
        expect(logger1).toBe(logger2);
      });

      // 3番目のテスト追加（BDDカテゴリ1完了）
      it('should maintain manager and logger consistency with options', () => {
        const options: AgLoggerOptions = { logLevel: 2 };
        const manager = createManager(options);
        const logger = getLogger();
        expect(manager.getLogger()).toBe(logger);
      });
    });

    /**
     * カテゴリ2: エラー状態での一貫性
     *
     * @description エラー条件下での両関数の一貫した動作をテスト
     */
    describe('エラー状態での一貫性', () => {
      // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
      it('should both fail consistently when manager is not created', () => {
        expect(() => createManager()).not.toThrow(); // 初回は成功
        expect(() => createManager()).toThrow(); // 二回目は失敗
        expect(() => getLogger()).not.toThrow(); // getLoggerは成功（既に作成済み）
      });

      // 2番目のテスト追加
      it('should both fail consistently after resetSingleton', () => {
        createManager();
        AgLoggerManager.resetSingleton();
        expect(() => getLogger()).toThrow(/not created/i);
        expect(() => createManager()).not.toThrow(); // 再作成は成功
      });

      // 3番目のテスト追加（BDDカテゴリ2完了）
      it('should handle multiple reset and recreation cycles', () => {
        // 最初のサイクル
        createManager();
        expect(getLogger()).toBeInstanceOf(AgLogger);

        // リセット
        AgLoggerManager.resetSingleton();
        expect(() => getLogger()).toThrow();

        // 二回目のサイクル
        createManager();
        expect(getLogger()).toBeInstanceOf(AgLogger);
      });
    });
  });
});
