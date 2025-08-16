// src/__tests__/agManagerUtils/AgManagerUtils.methodReplacement.spec.ts
// @(#) : AgManagerUtils Method Replacement Tests - Ensures AgManager automatic management
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// テスト対象: AgLoggerManagerとAgManager（index経由で自動初期化を有効化）
import { AgLoggerManager, AgManager, createManager } from '../../index';

// 共有定数: ログレベル定義
import { AG_LOGLEVEL } from '../../../shared/types';

/**
 * AgManagerUtils Method Replacement Tests
 *
 * @description setupManagerによるメソッド置き換えでAgManagerが自動管理されることをテスト
 * atsushifx式BDD構造でメソッド置き換え機能の正確性を検証
 */
describe('AgLoggerManager Method Replacement Tests', () => {
  beforeEach(() => {
    // 各テスト前にシングルトンをリセット
    AgLoggerManager.resetSingleton();
  });

  afterEach(() => {
    // 各テスト後にシングルトンをリセット
    AgLoggerManager.resetSingleton();
  });

  /**
   * When setupManagerによるメソッド置き換えが行われた場合のテスト
   */
  describe('When setupManagerによるメソッド置き換えが行われた場合', () => {
    /**
     * Given AgLoggerManager.createManagerを呼び出した場合
     */
    describe('Given AgLoggerManager.createManagerを呼び出した場合', () => {
      it('Then 元の機能に加えてAgManagerが自動設定される', () => {
        // Arrange: 初期状態の確認
        expect(AgManager).toBeUndefined();

        // Act: createManagerを呼び出し
        const manager = AgLoggerManager.createManager();

        // Assert: AgManagerが設定されていることを確認
        expect(AgManager).toBeDefined();
        expect(AgManager).toBe(manager);
        expect(AgManager).toBeInstanceOf(AgLoggerManager);
      });

      it('Then 戻り値は元のcreateManagerと同じAgLoggerManagerインスタンスである', () => {
        // Act: createManagerを呼び出し
        const manager = AgLoggerManager.createManager();

        // Assert: 戻り値が正しいAgLoggerManagerインスタンスであることを確認
        expect(manager).toBeInstanceOf(AgLoggerManager);
        expect(manager).toBe(AgManager);
        expect(() => manager.getLogger()).not.toThrow();
      });

      it('Then カスタム設定でもAgManagerが正しく初期化される', () => {
        // Arrange: カスタム設定を準備
        const customOptions = {
          logLevel: AG_LOGLEVEL.DEBUG,
        };

        // Act: カスタム設定でcreateManagerを呼び出し
        const manager = AgLoggerManager.createManager(customOptions);

        // Assert: AgManagerが設定され、設定が反映されていることを確認
        expect(AgManager).toBeDefined();
        expect(AgManager).toBe(manager);

        const logger = AgManager!.getLogger();
        expect(logger.logLevel).toBe(AG_LOGLEVEL.DEBUG);
      });
    });

    /**
     * Given AgLoggerManager.resetSingletonを呼び出した場合
     */
    describe('Given AgLoggerManager.resetSingletonを呼び出した場合', () => {
      it('Then 元の機能に加えてAgManagerが自動クリアされる', () => {
        // Arrange: managerを作成してAgManagerを設定
        AgLoggerManager.createManager();
        expect(AgManager).toBeDefined();

        // Act: resetSingletonを呼び出し
        AgLoggerManager.resetSingleton();

        // Assert: AgManagerがundefinedになることを確認
        expect(AgManager).toBeUndefined();
      });

      it('Then シングルトンインスタンスが正しくリセットされる', () => {
        // Arrange: managerを作成
        AgLoggerManager.createManager();
        expect(AgManager).toBeDefined();

        // Act: resetSingletonを呼び出し
        AgLoggerManager.resetSingleton();

        // Assert: シングルトンもリセットされることを確認
        expect(() => AgLoggerManager.getManager()).toThrow();
        expect(AgManager).toBeUndefined();
      });

      it('Then resetSingleton後に再度createManagerを呼び出すと正常に初期化される', () => {
        // Arrange: 一度managerを作成後リセット
        AgLoggerManager.createManager();
        AgLoggerManager.resetSingleton();
        expect(AgManager).toBeUndefined();

        // Act: 再度createManagerを呼び出し
        const newManager = AgLoggerManager.createManager();

        // Assert: 新しいAgManagerが設定されることを確認
        expect(AgManager).toBeDefined();
        expect(AgManager).toBe(newManager);
        expect(AgManager).toBeInstanceOf(AgLoggerManager);
      });
    });
  });

  /**
   * When 置き換え前後の動作比較を行う場合のテスト
   */
  describe('When 置き換え前後の動作比較を行う場合', () => {
    /**
     * Given 元のメソッドと置き換え後のメソッドを比較した場合
     */
    describe('Given 元のメソッドと置き換え後のメソッドを比較した場合', () => {
      it('Then createManagerの基本機能は変更されない', () => {
        // Act: createManagerを呼び出し
        const manager = AgLoggerManager.createManager();

        // Assert: 基本機能が維持されていることを確認
        expect(manager).toBeInstanceOf(AgLoggerManager);
        expect(() => manager.getLogger()).not.toThrow();
        expect(typeof manager.getLogger().info).toBe('function');
      });

      it('Then resetSingletonの基本機能は変更されない', () => {
        // Arrange: managerを作成
        AgLoggerManager.createManager();
        expect(() => AgLoggerManager.getManager()).not.toThrow();

        // Act: resetSingletonを呼び出し
        AgLoggerManager.resetSingleton();

        // Assert: 基本機能が維持されていることを確認
        expect(() => AgLoggerManager.getManager()).toThrow();
      });

      it('Then AgManager管理機能のみが追加される', () => {
        // Act: createManagerを呼び出し
        const manager = AgLoggerManager.createManager();

        // Assert: AgManager管理機能が追加されていることを確認
        expect(AgManager).toBe(manager);

        // Act: resetSingletonを呼び出し
        AgLoggerManager.resetSingleton();

        // Assert: AgManager管理機能が動作していることを確認
        expect(AgManager).toBeUndefined();
      });
    });
  });

  /**
   * When ユーティリティ関数createManager()を呼び出す場合のテスト
   */
  describe('When ユーティリティ関数createManager()を呼び出す場合', () => {
    /**
     * Given ユーティリティ関数createManagerを呼び出した場合
     */
    describe('Given ユーティリティ関数createManagerを呼び出した場合', () => {
      it('Then AgManagerが自動的に設定される', () => {
        // Arrange: 初期状態の確認
        expect(AgManager).toBeUndefined();

        // Act: ユーティリティ関数createManagerを呼び出し
        const manager = createManager();

        // Assert: AgManagerが設定されることを確認
        expect(AgManager).toBeDefined();
        expect(AgManager).toBe(manager);
        expect(AgManager).toBeInstanceOf(AgLoggerManager);
      });

      it('Then AgManagerとcreateManagerの戻り値が同一インスタンスである', () => {
        // Act: ユーティリティ関数createManagerを呼び出し
        const manager = createManager();

        // Assert: AgManagerと戻り値が同じインスタンスであることを確認
        expect(AgManager).toBe(manager);
        expect(AgManager === manager).toBe(true);
      });
    });
  });

  /**
   * When エラーケースのテスト
   */
  describe('When エラーケースを確認する場合', () => {
    /**
     * Given 既にmanagerが作成された状態で再度createManagerを呼び出した場合
     */
    describe('Given 既にmanagerが作成された状態で再度createManagerを呼び出した場合', () => {
      it('Then エラーが投げられるがAgManagerの状態は維持される', () => {
        // Arrange: 最初のmanagerを作成
        const firstManager = AgLoggerManager.createManager();
        expect(AgManager).toBe(firstManager);

        // Act & Assert: 二度目のcreateManagerはエラーを投げる
        expect(() => AgLoggerManager.createManager()).toThrow();

        // Assert: AgManagerは最初のmanagerのままであることを確認
        expect(AgManager).toBe(firstManager);
        expect(AgManager).toBeInstanceOf(AgLoggerManager);
      });
    });
  });
});
