// src: /tests/e2e/AgLogger.json.spec.ts
// @(#) : AgLogger E2E Test - JSON format with Console logger
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
import { JsonFormat } from '../../src/plugins/format/JsonFormat';
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
describe('AgLogger E2E Tests - JSON Format with Console Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  describe('基本的なJSONログ出力テスト', () => {
    it('JsonFormat + ConsoleLoggerでINFOログをJSON形式で出力', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.info('テストメッセージ');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'テストメッセージ',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('JsonFormat + ConsoleLoggerでERRORログをJSON形式で出力', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.ERROR);

      logger.error('エラーメッセージ');

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.error.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'ERROR',
        message: 'エラーメッセージ',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('JsonFormat + ConsoleLoggerでWARNログをJSON形式で出力', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.WARN);

      logger.warn('警告メッセージ');

      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.warn.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'WARN',
        message: '警告メッセージ',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('JsonFormat + ConsoleLoggerでDEBUGログをJSON形式で出力', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.DEBUG);

      logger.debug('デバッグメッセージ');

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.debug.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'DEBUG',
        message: 'デバッグメッセージ',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('複数引数を含むJSONログ出力テスト', () => {
    it('オブジェクトと文字列を含むJSONログメッセージ', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      const userData = { userId: 123, userName: 'testUser' };
      logger.info('ユーザー情報', userData, 'additional info');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'ユーザー情報additional info',
        args: [{ userId: 123, userName: 'testUser' }],
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('配列を含むJSONログメッセージ', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.DEBUG);

      const items = ['item1', 'item2', 'item3'];
      logger.debug('処理対象', items);

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.debug.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'DEBUG',
        message: '処理対象',
        args: [['item1', 'item2', 'item3']],
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('数値とブール値を含むJSONログメッセージ', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.info('ステータス更新', 42, true, null);

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'ステータス更新42true',
        args: [null],
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('JSONログレベル制御テスト', () => {
    it('ログレベルがINFOの場合、DEBUGログは出力されない', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.debug('デバッグメッセージ');
      logger.info('情報メッセージ');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalledTimes(1);

      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);
      expect(parsedLog.level).toBe('INFO');
    });

    it('ログレベルがERRORの場合、INFO/WARNログは出力されない', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.ERROR);

      logger.info('情報メッセージ');
      logger.warn('警告メッセージ');
      logger.error('エラーメッセージ');

      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledTimes(1);

      const [logOutput] = mockConsole.error.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);
      expect(parsedLog.level).toBe('ERROR');
    });

    it('ログレベルがOFFの場合、すべてのログが出力されない', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.OFF);

      logger.error('エラーメッセージ');
      logger.info('情報メッセージ');

      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
    });
  });

  describe('JSONフォーマット特有のテスト', () => {
    it('args配列が空の場合、argsプロパティは含まれない', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.info('シンプルメッセージ');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'シンプルメッセージ',
        timestamp: expect.any(String),
      });
      expect(parsedLog).not.toHaveProperty('args');
    });

    it('複雑なネストしたオブジェクトをJSONで正しく出力', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      const complexData = {
        user: {
          id: 123,
          profile: {
            name: '太郎',
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

      logger.info('複雑なデータ', complexData);

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: '複雑なデータ',
        args: [complexData],
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('実際の統合シナリオテスト（JSON版）', () => {
    it('アプリケーション起動からエラー発生までの一連のJSONログ出力', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
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

      // 各ログのJSON内容を検証
      const infoLog = JSON.parse(mockConsole.info.mock.calls[0][0]);
      const debugLog = JSON.parse(mockConsole.debug.mock.calls[0][0]);
      const warnLog = JSON.parse(mockConsole.warn.mock.calls[0][0]);
      const errorLog = JSON.parse(mockConsole.error.mock.calls[0][0]);

      expect(infoLog).toMatchObject({
        level: 'INFO',
        message: 'アプリケーションを開始します',
      });

      expect(debugLog).toMatchObject({
        level: 'DEBUG',
        message: '設定ファイルを読み込み中',
        args: [{ configPath: '/app/config.json' }],
      });

      expect(warnLog).toMatchObject({
        level: 'WARN',
        message: '非推奨のAPIを使用しています',
        args: [{ api: 'oldMethod' }],
      });

      expect(errorLog).toMatchObject({
        level: 'ERROR',
        message: 'データベース接続に失敗しました',
        args: [{
          host: 'localhost',
          port: 5432,
          error: 'Connection timeout',
        }],
      });

      // タイムスタンプの検証
      [infoLog, debugLog, warnLog, errorLog].forEach((log) => {
        expect(log.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });

    it('ログメソッド（log）のJSON出力動作確認', () => {
      const logger = getLogger(ConsoleLogger, JsonFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      logger.log('一般的なログメッセージ');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: '一般的なログメッセージ',
      });
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});
