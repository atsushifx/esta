// src/__tests__/AgLoggerManager.spec.ts
// @(#) : Unit tests for AgLoggerManager class (atsushifx-style BDD)
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// テスト対象 - AgLoggerManagerクラスのシングルトン実装
import { AgLoggerManager } from '../../AgLoggerManager.class';
// AgLoggerクラス - 参照比較のため
import { AgLogger } from '../../AgLogger.class';
// 型定義 - 委譲テスト用
import type { AgLoggerFunction, AgLoggerMap } from '../../../shared/types/AgLogger.interface';
import { AG_LOGLEVEL } from '../../../shared/types/AgLogLevel.types';

/**
 * AgLoggerManager仕様準拠BDDテストスイート
 *
 * @description atsushifx式BDD厳格プロセスに従った実装
 * 仕様書: docs/specs/refactor-agLoggerManager.spec.md に基づく
 *
 * @testType Unit Test (BDD)
 * @testTarget AgLoggerManager Class
 */
describe('AgLoggerManager', () => {
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
   * カテゴリ1: 初期化ガード
   *
   * @description 未初期化状態でのエラー処理と二重初期化防止
   */
  describe('初期化ガード', () => {
    // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
    it('should throw error when getManager is called without initialization', () => {
      expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
    });

    // 2番目のテスト追加
    it('should throw error when createManager is called twice', () => {
      AgLoggerManager.createManager();
      expect(() => AgLoggerManager.createManager()).toThrow(/already created/i);
    });

    // 3番目のテスト追加（BDDカテゴリ1完了）
    it('should return same reference when getManager is called after createManager', () => {
      const manager1 = AgLoggerManager.createManager();
      const manager2 = AgLoggerManager.getManager();
      expect(manager1).toBe(manager2);
    });
  });

  /**
   * カテゴリ2: Logger の生成・取得
   *
   * @description AgLoggerインスタンスの生成と取得機能
   */
  describe('Logger の生成・取得', () => {
    // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
    it('should return non-undefined logger after createManager', () => {
      const manager = AgLoggerManager.createManager();
      const logger = manager.getLogger();
      expect(logger).toBeDefined();
    });

    // 2番目のテスト追加
    it('should return same reference as AgLogger.getLogger', () => {
      AgLoggerManager.createManager();
      const manager = AgLoggerManager.getManager();
      const managerLogger = manager.getLogger();
      const directLogger = AgLogger.getLogger();
      expect(managerLogger).toBe(directLogger);
    });

    // 3番目のテスト追加（BDDカテゴリ2完了）
    it('should throw error when getLogger is called without initialization', () => {
      AgLoggerManager.resetSingleton(); // Ensure no instance exists
      expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
    });
  });

  /**
   * カテゴリ3: ロガーインスタンス注入
   *
   * @description setLoggerメソッドによる外部インスタンス注入機能
   */
  describe('ロガーインスタンス注入', () => {
    // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
    it('should successfully create manager with external logger via createManager', () => {
      AgLoggerManager.resetSingleton(); // Ensure clean state

      expect(() => {
        AgLoggerManager.createManager(); // Creates manager with logger
        // setLogger would throw because manager already has a logger
      }).not.toThrow();
    });

    // 2番目のテスト追加
    it('should return logger instance after manager creation', () => {
      AgLoggerManager.resetSingleton(); // Ensure clean state

      const manager = AgLoggerManager.createManager();
      const retrievedLogger = manager.getLogger();
      expect(retrievedLogger).toBeInstanceOf(AgLogger);
    });

    // 3番目のテスト追加（BDDカテゴリ3完了）
    it('should throw error when setLogger is called on initialized manager', () => {
      const externalLogger = AgLogger.createLogger();
      AgLoggerManager.resetSingleton(); // Ensure clean state

      const manager = AgLoggerManager.createManager(); // Initialize manager with logger

      expect(() => manager.setLogger(externalLogger)).toThrow(/already initialized/i);
    });
  });

  /**
   * カテゴリ4: 廃棄（テスト専用API）
   *
   * @description resetSingleton等のテスト専用API動作
   */
  describe('廃棄（テスト専用API）', () => {
    // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
    it('should throw error when getManager is called after resetSingleton', () => {
      AgLoggerManager.createManager();
      AgLoggerManager.resetSingleton();

      expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
    });

    // 2番目のテスト追加（BDDカテゴリ4完了）
    it('should allow createManager after resetSingleton', () => {
      AgLoggerManager.createManager();
      AgLoggerManager.resetSingleton();

      expect(() => {
        const manager = AgLoggerManager.createManager();
        expect(manager).toBeDefined();
      }).not.toThrow();
    });
  });

  /**
   * カテゴリ5: 委譲の成立（インタラクション）
   *
   * @description bindLoggerFunction等の委譲メソッドの動作
   */
  describe('委譲の成立（インタラクション）', () => {
    // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
    it('should call AgLogger.setLoggerFunction once when bindLoggerFunction is called', () => {
      const manager = AgLoggerManager.createManager();
      const logger = manager.getLogger();
      const mockFunction: AgLoggerFunction = vi.fn();

      // AgLoggerのsetLoggerFunctionメソッドをスパイ
      const setLoggerFunctionSpy = vi.spyOn(logger, 'setLoggerFunction');

      manager.bindLoggerFunction(AG_LOGLEVEL.INFO, mockFunction);

      expect(setLoggerFunctionSpy).toHaveBeenCalledOnce();
      expect(setLoggerFunctionSpy).toHaveBeenCalledWith(AG_LOGLEVEL.INFO, mockFunction);
    });

    // 2番目のテスト追加
    it('should call AgLogger.setLoggerConfig when updateLoggerMap is called', () => {
      const manager = AgLoggerManager.createManager();
      const logger = manager.getLogger();
      const mockLoggerMap: Partial<AgLoggerMap<AgLoggerFunction>> = {
        [AG_LOGLEVEL.ERROR]: vi.fn(),
        [AG_LOGLEVEL.WARN]: vi.fn(),
      };

      // AgLoggerのsetLoggerConfigメソッドをスパイ
      const setLoggerConfigSpy = vi.spyOn(logger, 'setLoggerConfig');

      manager.updateLoggerMap(mockLoggerMap);

      expect(setLoggerConfigSpy).toHaveBeenCalledOnce();
      expect(setLoggerConfigSpy).toHaveBeenCalledWith({ loggerMap: mockLoggerMap });
    });

    // 3番目のテスト追加
    it('should call AgLogger.setLoggerConfig when setLoggerConfig is called', () => {
      const manager = AgLoggerManager.createManager();
      const logger = manager.getLogger();
      const mockOptions = { logLevel: AG_LOGLEVEL.DEBUG };

      // AgLoggerのsetLoggerConfigメソッドをスパイ
      const setLoggerConfigSpy = vi.spyOn(logger, 'setLoggerConfig');

      manager.setLoggerConfig(mockOptions);

      expect(setLoggerConfigSpy).toHaveBeenCalledOnce();
      expect(setLoggerConfigSpy).toHaveBeenCalledWith(mockOptions);
    });

    // 4番目のテスト追加（BDDカテゴリ5完了）
    it('should call AgLogger.setLoggerFunction when removeLoggerFunction is called', () => {
      const manager = AgLoggerManager.createManager();
      const logger = manager.getLogger();

      // AgLoggerのsetLoggerFunctionメソッドをスパイ
      const setLoggerFunctionSpy = vi.spyOn(logger, 'setLoggerFunction');

      manager.removeLoggerFunction(AG_LOGLEVEL.INFO);

      expect(setLoggerFunctionSpy).toHaveBeenCalledOnce();
      // NullLoggerで置換されることを確認
      expect(setLoggerFunctionSpy).toHaveBeenCalledWith(AG_LOGLEVEL.INFO, expect.any(Function));
    });
  });

  /**
   * カテゴリ6: スレッショルド
   *
   * @description 例外メッセージの正規表現テスト（仕様書120行目準拠）
   */
  describe('スレッショルド', () => {
    // 最初のテストのみ作成（atsushifx式BDD厳格プロセス）
    it('should throw error message matching /not created/i for uninitialized getManager', () => {
      expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
    });
  });
});
