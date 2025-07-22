// src/tests/e2e/AgLogger.json.spec.ts
// @(#) : AgLogger E2E Test - JSON format with Console logger
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
// プラグイン - JSON形式フォーマッター（構造化ログ用）
import { JsonFormat } from '../../src/plugins/format/JsonFormat';
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
 * AgLogger E2Eテストスイート - JsonFormat + ConsoleLogger組み合わせ
 *
 * @description JsonFormatとConsoleLoggerの組み合わせでのAgLoggerの完全なE2Eテスト
 * 様々なログレベルでのログ出力正確性、複数引数処理、
 * ログレベルフィルタリング、JSON形式固有の機能、実際の統合シナリオをカバーし、
 * プロダクション環境での期待通りのログ動作を保証する
 *
 * @testType End-to-End Test
 * @testTarget AgLogger + JsonFormat + ConsoleLogger
 * @realWorldScenarios
 * - 構造化ログ出力（モニタリングシステム対応）
 * - メトリクス情報の記録
 * - APIレスポンスログ
 * - アプリケーション状態変更ログ
 */
describe('AgLogger E2E Tests - JSON Format with Console Logger', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  };

  /**
   * 基本JSONログ出力テストスイート
   *
   * @description 各レベルでのログが正しくフォーマットされたJSON文字列として出力されることをテストする
   * 適切なレベル、メッセージ、タイムスタンプフィールドを持つJSON出力を検証
   *
   * @testFocus Basic JSON Structure Output
   * @scenarios
   * - INFO/ERROR/WARN/DEBUGレベルのJSON構造化
   * - タイムスタンプのISO8601形式出力
   * - ログレベルラベルの文字列表現
   * - JSONパース可能性の保証
   */
  describe('Basic JSON log output tests', () => {
    it('outputs INFO log as JSON with JsonFormat and ConsoleLogger', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      logger.info('Test message');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'Test message',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('outputs ERROR log as JSON with JsonFormat and ConsoleLogger', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.ERROR);

      logger.error('Error message');

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.error.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'ERROR',
        message: 'Error message',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('outputs WARN log as JSON with JsonFormat and ConsoleLogger', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.WARN);

      logger.warn('Warning message');

      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.warn.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'WARN',
        message: 'Warning message',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('outputs DEBUG log as JSON with JsonFormat and ConsoleLogger', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.DEBUG);

      logger.debug('Debug message');

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.debug.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'DEBUG',
        message: 'Debug message',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  /**
   * JSON複数引数ログ出力テストスイート
   *
   * @description JSONログ出力が複数引数タイプを正しく含むことをテストする
   * オブジェクト、配列、プリミティブなどがメッセージとargsに正しく分離されることを検証
   *
   * @testFocus JSON Multiple Arguments Processing
   * @scenarios
   * - オブジェクトと文字列の混在JSON処理
   * - 配列データのargs配列への格納
   * - 数値・真偽値・空値のJSONシリアライゼーション
   * - messageとargsの適切な分離と構造化
   */
  describe('JSON log output tests with multiple arguments', () => {
    it('logs JSON message containing object and string', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      const userData = { userId: 123, userName: 'testUser' };
      logger.info('User info', userData, ' additional info');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'User info additional info',
        args: [{ userId: 123, userName: 'testUser' }],
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('logs JSON message containing array', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.DEBUG);

      const items = ['item1', 'item2', 'item3'];
      logger.debug('Processing items', items);

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.debug.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'DEBUG',
        message: 'Processing items',
        args: [['item1', 'item2', 'item3']],
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('logs JSON message containing number and boolean', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      logger.info('Status update', 42, true, null);

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'Status update 42 true',
        args: [null],
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  /**
   * JSONログレベルフィルタリングテストスイート
   *
   * @description 設定されたログレベルに従ってログがフィルタリングされることをテストする
   * レベルが高い場合、低レベルのログが出力されないことを保証
   * JSONフォーマットでのフィルタリング動作を検証
   *
   * @testFocus JSON Format Log Level Filtering
   * @scenarios
   * - INFOレベル設定時のDEBUGフィルタリングとJSON構造確認
   * - ERRORレベル設定時のINFO/WARNフィルタリングとJSON構造確認
   * - OFFレベル設定時の全ログフィルタリング
   * - フィルタリング時のconsoleメソッド未呼び出し確認
   */
  describe('JSON log level filtering tests', () => {
    it('does not output DEBUG logs when level is INFO', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      logger.debug('Debug message');
      logger.info('Info message');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalledTimes(1);

      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);
      expect(parsedLog.level).toBe('INFO');
    });

    it('does not output INFO/WARN logs when level is ERROR', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.ERROR);

      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledTimes(1);

      const [logOutput] = mockConsole.error.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);
      expect(parsedLog.level).toBe('ERROR');
    });

    it('does not output any logs when level is OFF', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.OFF);

      logger.error('Error message');
      logger.info('Info message');

      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
    });
  });

  /**
   * JSON形式固有機能テストスイート
   *
   * @description JSON形式固有の動作をテストする
   * 空のargs配列の省略、ネストした複雑オブジェクトの正しいシリアライゼーションを検証
   *
   * @testFocus JSON Format Specific Features
   * @scenarios
   * - 空引数時のargsプロパティの省略
   * - 深いネスト構造の複雑オブジェクトJSON出力
   * - JSON構造の正確性とパース可能性
   * - メタデータフィールドの適切な含有
   */
  describe('JSON format specific tests', () => {
    it('does not include args property when args array is empty', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      logger.info('Simple message');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'Simple message',
        timestamp: expect.any(String),
      });
      expect(parsedLog).not.toHaveProperty('args');
    });

    it('correctly outputs deeply nested complex objects in JSON', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      const complexData = {
        user: {
          id: 123,
          profile: {
            name: 'Taro',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
        metadata: {
          version: '1.0.0',
          features: ['feature1', 'feature2'],
        },
      };

      logger.info('Complex data', complexData);

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'Complex data',
        args: [complexData],
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  /**
   * 実用統合シナリオテストスイート（JSON版）
   *
   * @description アプリケーション起動からエラー処理までの
   * 実世界のログイベントシーケンスをテストし、
   * 完全で正確なJSON出力を検証する
   *
   * @testFocus Real-world JSON Integration Scenarios
   * @scenarios
   * - アプリケーションライフサイクルのJSON構造化ログ
   * - 各ログレベルでの正確なJSON形式とメタデータ
   * - タイムスタンプの一貫性と精度
   * - 汎用logメソッドのJSON出力確認
   */
  describe('Real integration scenario tests (JSON version)', () => {
    it('outputs a sequence of JSON logs from application start to error', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.DEBUG);

      // Application start
      logger.info('Application is starting');

      // Config loading
      logger.debug('Loading config file', { configPath: '/app/config.json' });

      // Warning
      logger.warn('Using deprecated API', { api: 'oldMethod' });

      // Error
      logger.error('Failed to connect to database', {
        host: 'localhost',
        port: 5432,
        error: 'Connection timeout',
      });

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);

      // Validate JSON content of each log
      const infoLog = JSON.parse(mockConsole.info.mock.calls[0][0]);
      const debugLog = JSON.parse(mockConsole.debug.mock.calls[0][0]);
      const warnLog = JSON.parse(mockConsole.warn.mock.calls[0][0]);
      const errorLog = JSON.parse(mockConsole.error.mock.calls[0][0]);

      expect(infoLog).toMatchObject({
        level: 'INFO',
        message: 'Application is starting',
      });

      expect(debugLog).toMatchObject({
        level: 'DEBUG',
        message: 'Loading config file',
        args: [{ configPath: '/app/config.json' }],
      });

      expect(warnLog).toMatchObject({
        level: 'WARN',
        message: 'Using deprecated API',
        args: [{ api: 'oldMethod' }],
      });

      expect(errorLog).toMatchObject({
        level: 'ERROR',
        message: 'Failed to connect to database',
        args: [{
          host: 'localhost',
          port: 5432,
          error: 'Connection timeout',
        }],
      });

      // Validate timestamps
      [infoLog, debugLog, warnLog, errorLog].forEach((log) => {
        expect(log.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });

    it('verifies JSON output for generic log method (log)', () => {
      setupTestContext();
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      logger.log('General log message');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'General log message',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});
