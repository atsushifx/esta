// src: /tests/e2e/AgLogger.e2e.spec.ts
// @(#) : AgLogger E2E Test - Plain format with Console logger
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { beforeEach, describe, expect, it, vi } from 'vitest';

// constants
import { AgLogLevelCode } from '../../shared/types';
// test unit
import { getLogger } from '../../src/AgLogger.class';
import { PlainFormat } from '../../src/plugins/format/PlainFormat';
import { ConsoleLogger } from '../../src/plugins/logger/ConsoleLogger';

// mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  log: vi.fn(),
};

// test main
describe('AgLogger E2E Tests - Plain Format with Console Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  describe('基本的なログ出力テスト', () => {
    it('PlainFormat + ConsoleLoggerでINFOログを出力', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.info('テストメッセージ');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] テストメッセージ$/);
    });

    it('PlainFormat + ConsoleLoggerでERRORログを出力', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.ERROR);

      logger.error('エラーメッセージ');

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.error.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[ERROR\] エラーメッセージ$/);
    });

    it('PlainFormat + ConsoleLoggerでWARNログを出力', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.WARN);

      logger.warn('警告メッセージ');

      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.warn.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[WARN\] 警告メッセージ$/);
    });

    it('PlainFormat + ConsoleLoggerでDEBUGログを出力', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.DEBUG);

      logger.debug('デバッグメッセージ');

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.debug.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[DEBUG\] デバッグメッセージ$/);
    });
  });

  describe('複数引数を含むログ出力テスト', () => {
    it('オブジェクトと文字列を含むログメッセージ', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      const userData = { userId: 123, userName: 'testUser' };
      logger.info('ユーザー情報', userData, 'additional info');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] ユーザー情報additional info \{"userId":123,"userName":"testUser"\}$/,
      );
    });

    it('配列を含むログメッセージ', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.DEBUG);

      const items = ['item1', 'item2', 'item3'];
      logger.debug('処理対象', items);

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.debug.mock.calls[0];
      expect(logOutput).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[DEBUG\] 処理対象 \["item1","item2","item3"\]$/,
      );
    });
  });

  describe('ログレベル制御テスト', () => {
    it('ログレベルがINFOの場合、DEBUGログは出力されない', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.debug('デバッグメッセージ');
      logger.info('情報メッセージ');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });

    it('ログレベルがERRORの場合、INFO/WARNログは出力されない', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.ERROR);

      logger.info('情報メッセージ');
      logger.warn('警告メッセージ');
      logger.error('エラーメッセージ');

      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('ログレベルがOFFの場合、すべてのログが出力されない', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.OFF);

      logger.error('エラーメッセージ');
      logger.info('情報メッセージ');

      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
    });
  });

  describe('エラーハンドリングテスト', () => {
    it('循環参照オブジェクトを含む場合のエラーハンドリング', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      const circularObj: { name: string; self?: unknown } = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => {
        logger.info('循環参照テスト', circularObj);
      }).toThrow();
    });
  });

  describe('実際の統合シナリオテスト', () => {
    it('アプリケーション起動からエラー発生までの一連のログ出力', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.DEBUG);

      // アプリケーション起動
      logger.info('アプリケーションを開始します');

      // 設定読み込み
      logger.debug('設定ファイルを読み込み中', { configPath: '/app/config.json' });

      // 警告
      logger.warn('非推奨のAPIを使用しています', { api: 'oldMethod' });

      // エラー発生
      logger.error('データベース接続に失敗しました', {
        host: 'localhost',
        port: 5432,
        error: 'Connection timeout',
      });

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);

      // 各ログの内容を検証
      const infoLog = mockConsole.info.mock.calls[0][0];
      const debugLog = mockConsole.debug.mock.calls[0][0];
      const warnLog = mockConsole.warn.mock.calls[0][0];
      const errorLog = mockConsole.error.mock.calls[0][0];

      expect(infoLog).toMatch(/\[INFO\] アプリケーションを開始します$/);
      expect(debugLog).toMatch(/\[DEBUG\] 設定ファイルを読み込み中 \{"configPath":"\/app\/config\.json"\}$/);
      expect(warnLog).toMatch(/\[WARN\] 非推奨のAPIを使用しています \{"api":"oldMethod"\}$/);
      expect(errorLog).toMatch(
        /\[ERROR\] データベース接続に失敗しました \{"host":"localhost","port":5432,"error":"Connection timeout"\}$/,
      );
    });

    it('ログメソッド（log）の動作確認', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.log('一般的なログメッセージ');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[INFO\] 一般的なログメッセージ$/);
    });
  });
});
