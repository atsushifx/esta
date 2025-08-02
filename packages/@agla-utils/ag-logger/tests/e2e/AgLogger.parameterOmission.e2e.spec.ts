// src/tests/e2e/AgLogger.parameterOmission.spec.ts
// @(#) : AgLogger E2E Test - Parameter omission and setManager functionality
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { describe, expect, it, vi } from 'vitest';

// ログレベル定数 - E2Eテストで使用するログレベル定義
import { AG_LOGLEVEL } from '../../shared/types';
// テスト対象 - createLogger関数（ロガー作成のエントリーポイント）
import { createLogger } from '@/AgLogger.class';
// プラグイン - 人間可読な平文フォーマッター
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
// プラグイン - コンソール出力ロガー
import { ConsoleLogger } from '@/plugins/logger/ConsoleLogger';

// mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  log: vi.fn(),
};

/**
 * AgLogger E2Eテストスイート - パラメーター省略とsetManager機能
 *
 * @description getLogger呼び出しでのパラメーター省略と
 * setManagerメソッド機能をカバーするE2Eテスト
 * 設定継承、動的設定変更、シングルトン動作を実環境で検証
 *
 * @testType End-to-End Test
 * @testTarget AgLogger Configuration Management
 * @realWorldScenarios
 * - アプリケーション内でのロガー設定管理
 * - ライブラリ間でのロガー共有
 * - 動的ログ設定変更
 * - 設定ファイルや環境変数による設定更新
 */
describe('AgLogger E2E Tests - Parameter Omission and setManager', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  };

  /**
   * createLoggerパラメーター省略動作テストスイート
   *
   * @description 初期設定後のcreateLoggerでの全パラメーター省略時に
   * 以前の設定が再利用されることをテストする
   * 設定継承、シングルトン動作、部分省略時の動作を検証
   *
   * @testFocus Parameter Omission Behavior
   * @scenarios
   * - 初期設定後の全パラメーター省略時の設定継承
   * - 部分パラメーター省略時の既存設定使用
   * - 複数createLogger呼び出しでのシングルトン動作確認
   */
  describe('Parameter omission behavior in createLogger', () => {
    it('uses previous settings when all parameters are omitted after initial setup', () => {
      setupTestContext();
      // Initial setup
      const logger1 = createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
      logger1.logLevel = AG_LOGLEVEL.INFO;
      logger1.info('Log after initial setup');

      // createLogger with all parameters omitted
      const logger2 = createLogger();
      logger2.info('Log after parameter omission in createLogger');

      expect(mockConsole.info).toHaveBeenCalledTimes(2);

      const [firstLog] = mockConsole.info.mock.calls[0];
      const [secondLog] = mockConsole.info.mock.calls[1];

      expect(firstLog).toMatch(/\[INFO\] Log after initial setup$/);
      expect(secondLog).toMatch(/\[INFO\] Log after parameter omission in createLogger$/);
    });

    it('uses previous settings when only partial parameters are omitted', () => {
      setupTestContext();
      // Initial setup
      createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });

      // Omit formatter only
      const logger = createLogger({ defaultLogger: ConsoleLogger });
      logger.logLevel = AG_LOGLEVEL.INFO;
      logger.info('Log after partial parameter omission');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/\[INFO\] Log after partial parameter omission$/);
    });

    it('ensures singleton behavior', () => {
      setupTestContext();
      const logger1 = createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
      const logger2 = createLogger();
      const logger3 = createLogger({ defaultLogger: ConsoleLogger });

      expect(logger1).toBe(logger2);
      expect(logger2).toBe(logger3);
    });
  });

  /**
   * setManagerメソッド機能テストスイート
   *
   * @description setManagerメソッドのロガーやフォーマッター設定更新能力をテストする
   * 全設定同時更新、部分設定更新、個別コンポーネント更新の動作を検証
   *
   * @testFocus setManager Method Functionality
   * @scenarios
   * - 全設定の同時更新（defaultLogger + formatter）
   * - 部分設定の別々更新（formatterのみ、defaultLoggerのみ）
   * - 設定変更後のログ出力品質確認
   */
  describe('setManager method functionality', () => {
    it('updates all settings at once via setManager', () => {
      setupTestContext();
      const logger = createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Change settings via setManager
      logger.setManager({
        defaultLogger: ConsoleLogger,
        formatter: PlainFormatter,
      });

      logger.info('Log after setManager update');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/\[INFO\] Log after setManager update$/);
    });

    it('updates partial settings via setManager', () => {
      setupTestContext();
      const logger = createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Change only formatter
      logger.setManager({
        formatter: PlainFormatter,
      });

      logger.info('Log after partial settings update');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/\[INFO\] Log after partial settings update$/);
    });

    it('updates only defaultLogger via setManager', () => {
      setupTestContext();
      const logger = createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // Change only defaultLogger
      logger.setManager({
        defaultLogger: ConsoleLogger,
      });

      logger.info('Log after defaultLogger update');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/\[INFO\] Log after defaultLogger update$/);
    });
  });

  /**
   * 統合シナリオテストスイート
   *
   * @description 設定変更とパラメーター省略の組み合わせ使用シナリオをテストする
   * 実用的なアプリケーションでの設定管理パターンを再現し、
   * 組み合わせシナリオでの動作を検証
   *
   * @testFocus Combined Usage Scenarios
   * @scenarios
   * - 設定変更 + パラメーター省略の組み合わせ
   * - 複数setManager呼び出しでの設定上書き動作
   * - インスタンス同一性の保持と設定共有
   * - 継続的なログ出力品質の保証
   */
  describe('Integration scenario tests', () => {
    it('combines setting changes and parameter omission', () => {
      setupTestContext();
      // Initial setup
      const logger1 = createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
      logger1.logLevel = AG_LOGLEVEL.INFO;
      logger1.info('Initial setup');

      // Change settings via setManager
      logger1.setManager({
        formatter: PlainFormatter,
      });
      logger1.info('After settings update');

      // createLogger with omitted parameters
      const logger2 = createLogger();
      logger2.info('After parameter omission');

      // Ensure same instance
      expect(logger1).toBe(logger2);

      expect(mockConsole.info).toHaveBeenCalledTimes(3);

      const logs = mockConsole.info.mock.calls.map((call) => call[0]);
      expect(logs[0]).toMatch(/\[INFO\] Initial setup$/);
      expect(logs[1]).toMatch(/\[INFO\] After settings update$/);
      expect(logs[2]).toMatch(/\[INFO\] After parameter omission$/);
    });

    it('overwrites settings via multiple setManager calls', () => {
      setupTestContext();
      const logger = createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;

      // First settings update
      logger.setManager({
        defaultLogger: ConsoleLogger,
      });
      logger.info('First settings update');

      // Second settings update
      logger.setManager({
        formatter: PlainFormatter,
      });
      logger.info('Second settings update');

      expect(mockConsole.info).toHaveBeenCalledTimes(2);

      const logs = mockConsole.info.mock.calls.map((call) => call[0]);
      expect(logs[0]).toMatch(/\[INFO\] First settings update$/);
      expect(logs[1]).toMatch(/\[INFO\] Second settings update$/);
    });
  });
});
