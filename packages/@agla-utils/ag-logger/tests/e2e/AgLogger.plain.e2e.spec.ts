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
import { getLogger } from '@/AgLogger.class';
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
 * AgLogger E2Eテストスイート - PlainFormat + ConsoleLogger組み合わせ
 *
 * @description PlainFormatとConsoleLoggerの組み合わせでのAgLoggerの完全なE2Eテスト
 * 機能・目的別にカテゴリー分けし、各カテゴリー内で正常系・異常系・エッジケースに分類して検証
 *
 * @testType End-to-End Test
 * @testTarget AgLogger + PlainFormat + ConsoleLogger
 * @structure
 * - 機能別カテゴリー
 *   - 正常系: 基本的な動作確認
 *   - 異常系: エラー処理、例外時の動作
 *   - エッジケース: 境界値、特殊入力、実世界シナリオ
 */
describe('AgLogger E2E Tests - Plain Format with Console Logger', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  };

  /**
   * 基本ログ出力機能
   *
   * @description PlainFormat + ConsoleLoggerでの基本ログ出力のテスト
   */
  describe('Basic Log Output Functionality', () => {
    /**
     * 正常系: 基本的なログ出力
     */
    describe('正常系: Basic Log Output', () => {
      it('outputs INFO log using PlainFormat and ConsoleLogger', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        logger.info('Test message');

        expect(mockConsole.info).toHaveBeenCalledTimes(1);
        const [logOutput] = mockConsole.info.mock.calls[0];
        expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] Test message$/);
      });

      it('outputs ERROR log using PlainFormat and ConsoleLogger', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.setLogLevel(AG_LOGLEVEL.ERROR);

        logger.error('Error message');

        expect(mockConsole.error).toHaveBeenCalledTimes(1);
        const [logOutput] = mockConsole.error.mock.calls[0];
        expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[ERROR\] Error message$/);
      });

      it('outputs WARN log using PlainFormat and ConsoleLogger', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.setLogLevel(AG_LOGLEVEL.WARN);

        logger.warn('Warning message');

        expect(mockConsole.warn).toHaveBeenCalledTimes(1);
        const [logOutput] = mockConsole.warn.mock.calls[0];
        expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[WARN\] Warning message$/);
      });

      it('outputs DEBUG log using PlainFormat and ConsoleLogger', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.setLogLevel(AG_LOGLEVEL.DEBUG);

        logger.debug('Debug message');

        expect(mockConsole.debug).toHaveBeenCalledTimes(1);
        const [logOutput] = mockConsole.debug.mock.calls[0];
        expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[DEBUG\] Debug message$/);
      });
    });

    /**
     * 異常系: エラー処理
     */
    describe('異常系: Error Handling', () => {
      it('throws error when logging circular reference objects', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        const circularObj: { name: string; self?: unknown } = { name: 'test' };
        circularObj.self = circularObj;

        expect(() => {
          logger.info('Circular reference test', circularObj);
        }).toThrow();
      });
    });
  });

  /**
   * 複数引数処理機能
   *
   * @description 複数引数を含むメッセージのログ出力のテスト
   */
  describe('Multiple Arguments Processing Functionality', () => {
    /**
     * 正常系: 基本的な複数引数処理
     */
    describe('正常系: Basic Multiple Arguments Processing', () => {
      it('logs message containing object and string', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
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
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
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
  });

  /**
   * ログレベルフィルタリング機能
   *
   * @description ログレベルによるフィルタリング動作のテスト
   */
  describe('Log Level Filtering Functionality', () => {
    /**
     * 正常系: 基本的なフィルタリング動作
     */
    describe('正常系: Basic Filtering Operations', () => {
      it('does not output DEBUG logs when level is INFO', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        logger.debug('Debug message');
        logger.info('Info message');

        expect(mockConsole.debug).not.toHaveBeenCalled();
        expect(mockConsole.info).toHaveBeenCalledTimes(1);
      });

      it('does not output INFO/WARN logs when level is ERROR', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
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
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.setLogLevel(AG_LOGLEVEL.OFF);

        logger.error('Error message');
        logger.info('Info message');

        expect(mockConsole.error).not.toHaveBeenCalled();
        expect(mockConsole.info).not.toHaveBeenCalled();
      });
    });
  });

  /**
   * 実世界統合シナリオ機能
   *
   * @description 実際のアプリケーションでの使用パターンのテスト
   */
  describe('Real-world Integration Scenarios Functionality', () => {
    /**
     * 正常系: 基本的な統合シナリオ
     */
    describe('正常系: Basic Integration Scenarios', () => {
      it('logs a sequence from app start to error occurrence', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
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
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        logger.log('General log message');

        expect(mockConsole.info).toHaveBeenCalledTimes(1);
        const [logOutput] = mockConsole.info.mock.calls[0];
        expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] General log message$/);
      });
    });
  });
});
