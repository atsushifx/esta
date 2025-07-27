// src/tests/e2e/AgLogger.e2e.spec.ts
// @(#) : AgLogger E2E Test - Plain Format with Console Logger
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { describe, expect, it, vi } from 'vitest';

// ログレベル定数 - E2Eテストで使用するログレベル定義
import { AG_LOGLEVEL } from '../../shared/types';
// テスト対象 - getLogger関数（ロガー取得のエントリーポイント）
import { getLogger } from '../../src/AgLogger.class';
// プラグイン - 人間可読な平文フォーマッター
import { PlainFormat } from '../../src/plugins/format/PlainFormat';
// プラグイン - コンソール出力ロガー
import { ConsoleLogger } from '../../src/plugins/logger/ConsoleLogger';

// mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  log: vi.fn(),
};

/**
 * AgLogger E2Eテストスイート - PlainFormat + ConsoleLogger組み合わせ
 *
 * @description PlainFormatとConsoleLoggerの組み合わせでのAgLoggerの完全なE2Eテスト
 * 基本ログ出力、複数引数、ログレベルフィルタリング、
 * 循環参照エラー処理、実世界シナリオを網羅してテスト
 *
 * @testType End-to-End Test
 * @testTarget AgLogger + PlainFormat + ConsoleLogger
 * @realWorldScenarios
 * - アプリケーションライフサイクルログ
 * - デバッグ情報付きログ
 * - エラートラッキングログ
 * - 設定読み込みログ
 */
describe('AgLogger E2E Tests - Plain Format with Console Logger', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  };

  /**
   * 基本ログ出力テストスイート
   *
   * @description PlainFormat + ConsoleLoggerでの基本ログ機能をテストする
   * 出力が期待されるタイムスタンプ、レベル、メッセージパターンと一致することを確認
   * 各ログレベルでの適切なフォーマット出力とコンソールメソッド呼び出しを検証
   *
   * @testFocus Basic Plain Format Output
   * @scenarios
   * - INFO/ERROR/WARN/DEBUGレベルの正しいフォーマット
   * - タイムスタンプのISO形式出力
   * - ログレベルラベルの正確な表示
   * - メッセージ内容の正確な出力
   */
  describe('Basic log output tests', () => {
    it('outputs INFO log using PlainFormat and ConsoleLogger', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      logger.info('Test message');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] Test message$/);
    });

    it('outputs ERROR log using PlainFormat and ConsoleLogger', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOGLEVEL.ERROR);

      logger.error('Error message');

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.error.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[ERROR\] Error message$/);
    });

    it('outputs WARN log using PlainFormat and ConsoleLogger', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOGLEVEL.WARN);

      logger.warn('Warning message');

      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.warn.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[WARN\] Warning message$/);
    });

    it('outputs DEBUG log using PlainFormat and ConsoleLogger', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOGLEVEL.DEBUG);

      logger.debug('Debug message');

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.debug.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[DEBUG\] Debug message$/);
    });
  });

  /**
   * 複数引数ログ出力テストスイート
   *
   * @description 複数引数を含むメッセージのログ出功をテストする
   * オブジェクト、配列などの複雑データを含むメッセージの
   * 正しいフォーマット出力を検証する
   *
   * @testFocus Multiple Arguments Processing
   * @scenarios
   * - オブジェクトと文字列の混在処理
   * - 配列データのJSONシリアライゼーション
   * - 複数プリミティブ値の連結処理
   * - PlainFormatでの適切な表示形式
   */
  describe('Log output tests with multiple arguments', () => {
    it('logs message containing object and string', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      const userData = { userId: 123, userName: 'testUser' };
      logger.info('User data', userData, 'additional info');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] User data additional info \{"userId":123,"userName":"testUser"\}$/,
      );
    });

    it('logs message containing an array', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOGLEVEL.DEBUG);

      const items = ['item1', 'item2', 'item3'];
      logger.debug('Items to process', items);

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.debug.mock.calls[0];
      expect(logOutput).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[DEBUG\] Items to process \["item1","item2","item3"\]$/,
      );
    });
  });

  /**
   * ログレベルフィルタリングテストスイート
   *
   * @description 設定されたレベル以下のログが出力されないことを保証する
   * ログレベルフィルタリング動作をテストし、実環境での
   * 性能最適化とログ量制御を確認
   *
   * @testFocus Log Level Filtering
   * @scenarios
   * - INFOレベル設定時のDEBUGログフィルタリング
   * - ERRORレベル設定時のINFO/WARNログフィルタリング
   * - OFFレベル設定時の全ログフィルタリング
   * - フィルタリング時のconsoleメソッドの未呼び出し確認
   */
  describe('Log level filtering tests', () => {
    it('does not output DEBUG logs when level is INFO', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      logger.debug('Debug message');
      logger.info('Info message');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });

    it('does not output INFO/WARN logs when level is ERROR', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOGLEVEL.ERROR);

      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('does not output any logs when level is OFF', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOGLEVEL.OFF);

      logger.error('Error message');
      logger.info('Info message');

      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
    });
  });

  /**
   * エラー処理テストスイート
   *
   * @description 循環参照オブジェクトのログ出力時のエラー処理をテストする
   * PlainFormatでのJSON.stringifyエラーの適切な传播と
   * システム安定性の保持を検証
   *
   * @testFocus Error Handling
   * @scenarios
   * - 循環参照オブジェクトでの適切なエラースロー
   * - JSON.stringifyエラーの例外伝播
   * - エラー後のシステム安定性維持
   */
  describe('Error handling tests', () => {
    it('throws error when logging circular reference objects', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      const circularObj: { name: string; self?: unknown } = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => {
        logger.info('Circular reference test', circularObj);
      }).toThrow();
    });
  });

  /**
   * 完全統合シナリオテストスイート
   *
   * @description アプリケーション開始からエラー発生までの
   * 完全な統合シナリオをテストし、適切なログ出力を検証する
   * 実世界のアプリケーションライフサイクルを模擬したシナリオ
   *
   * @testFocus Real-world Integration Scenarios
   * @scenarios
   * - アプリケーション起動からエラー発生までの一連のログ
   * - 設定読み込み、警告、エラーの連続ログ
   * - 各ログレベルでの適切なメッセージ形式
   * - 汎用logメソッドの動作検証
   */
  describe('Full integration scenario tests', () => {
    it('logs a sequence from app start to error occurrence', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOGLEVEL.DEBUG);

      // Application start
      logger.info('Starting application');

      // Config loading
      logger.debug('Loading config file', { configPath: '/app/config.json' });

      // Warning
      logger.warn('Using deprecated API', { api: 'oldMethod' });

      // Error occurrence
      logger.error('Failed to connect to database', {
        host: 'localhost',
        port: 5432,
        error: 'Connection timeout',
      });

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);

      // Verify each log content
      const infoLog = mockConsole.info.mock.calls[0][0];
      const debugLog = mockConsole.debug.mock.calls[0][0];
      const warnLog = mockConsole.warn.mock.calls[0][0];
      const errorLog = mockConsole.error.mock.calls[0][0];

      expect(infoLog).toMatch(/\[INFO\] Starting application$/);
      expect(debugLog).toMatch(/\[DEBUG\] Loading config file \{"configPath":"\/app\/config\.json"\}$/);
      expect(warnLog).toMatch(/\[WARN\] Using deprecated API \{"api":"oldMethod"\}$/);
      expect(errorLog).toMatch(
        /\[ERROR\] Failed to connect to database \{"host":"localhost","port":5432,"error":"Connection timeout"\}$/,
      );
    });

    it('verifies log method (log) functionality', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      logger.log('General log message');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] General log message$/);
    });
  });
});
