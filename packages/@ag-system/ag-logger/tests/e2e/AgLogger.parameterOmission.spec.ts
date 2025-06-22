// src: /tests/e2e/AgLogger.parameterOmission.spec.ts
// @(#) : AgLogger E2E Test - Parameter omission and setLogger functionality
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
describe('AgLogger E2E Tests - Parameter Omission and setLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  describe('getLoggerパラメータ省略機能', () => {
    it('初回設定後、全パラメータ省略で前回設定を使用', () => {
      // 初回設定
      const logger1 = getLogger(ConsoleLogger, PlainFormat);
      logger1.setLogLevel(AgLogLevelCode.INFO);
      logger1.info('初回設定でのログ出力');

      // 全省略でgetLogger
      const logger2 = getLogger();
      logger2.info('全省略getLogger後のログ出力');

      expect(mockConsole.info).toHaveBeenCalledTimes(2);

      const [firstLog] = mockConsole.info.mock.calls[0];
      const [secondLog] = mockConsole.info.mock.calls[1];

      expect(firstLog).toMatch(/\[INFO\] 初回設定でのログ出力$/);
      expect(secondLog).toMatch(/\[INFO\] 全省略getLogger後のログ出力$/);
    });

    it('部分的なパラメータ省略で前回設定を使用', () => {
      // 初回設定
      getLogger(ConsoleLogger, PlainFormat);

      // formatterのみ省略
      const logger = getLogger(ConsoleLogger);
      logger.setLogLevel(AgLogLevelCode.INFO);
      logger.info('部分省略でのログ出力');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/\[INFO\] 部分省略でのログ出力$/);
    });

    it('シングルトンパターンの確認', () => {
      const logger1 = getLogger(ConsoleLogger, PlainFormat);
      const logger2 = getLogger();
      const logger3 = getLogger(ConsoleLogger);

      expect(logger1).toBe(logger2);
      expect(logger2).toBe(logger3);
    });
  });

  describe('setLoggerメソッド機能', () => {
    it('setLoggerで全設定を一括変更', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      // setLoggerで設定変更
      logger.setLogger({
        defaultLogger: ConsoleLogger,
        formatter: PlainFormat,
      });

      logger.info('setLogger後のログ出力');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/\[INFO\] setLogger後のログ出力$/);
    });

    it('setLoggerで部分的な設定変更', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      // フォーマッターのみ変更
      logger.setLogger({
        formatter: PlainFormat,
      });

      logger.info('部分設定変更後のログ出力');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/\[INFO\] 部分設定変更後のログ出力$/);
    });

    it('setLoggerでdefaultLoggerのみ変更', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      // defaultLoggerのみ変更
      logger.setLogger({
        defaultLogger: ConsoleLogger,
      });

      logger.info('defaultLogger変更後のログ出力');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      expect(logOutput).toMatch(/\[INFO\] defaultLogger変更後のログ出力$/);
    });
  });

  describe('統合シナリオテスト', () => {
    it('設定変更と省略を組み合わせた使用パターン', () => {
      // 初回設定
      const logger1 = getLogger(ConsoleLogger, PlainFormat);
      logger1.setLogLevel(AgLogLevelCode.INFO);
      logger1.info('初回設定');

      // setLoggerで設定変更
      logger1.setLogger({
        formatter: PlainFormat,
      });
      logger1.info('設定変更後');

      // 新しいgetLoggerで省略
      const logger2 = getLogger();
      logger2.info('省略getLogger');

      // 同じインスタンスであることを確認
      expect(logger1).toBe(logger2);

      expect(mockConsole.info).toHaveBeenCalledTimes(3);

      const logs = mockConsole.info.mock.calls.map((call) => call[0]);
      expect(logs[0]).toMatch(/\[INFO\] 初回設定$/);
      expect(logs[1]).toMatch(/\[INFO\] 設定変更後$/);
      expect(logs[2]).toMatch(/\[INFO\] 省略getLogger$/);
    });

    it('複数回のsetLoggerによる設定上書き', () => {
      const logger = getLogger(ConsoleLogger, PlainFormat);
      logger.setLogLevel(AgLogLevelCode.INFO);

      // 1回目の設定変更
      logger.setLogger({
        defaultLogger: ConsoleLogger,
      });
      logger.info('1回目設定変更');

      // 2回目の設定変更
      logger.setLogger({
        formatter: PlainFormat,
      });
      logger.info('2回目設定変更');

      expect(mockConsole.info).toHaveBeenCalledTimes(2);

      const logs = mockConsole.info.mock.calls.map((call) => call[0]);
      expect(logs[0]).toMatch(/\[INFO\] 1回目設定変更$/);
      expect(logs[1]).toMatch(/\[INFO\] 2回目設定変更$/);
    });
  });
});
