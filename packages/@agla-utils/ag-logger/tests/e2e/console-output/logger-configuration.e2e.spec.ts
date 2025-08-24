// tests/e2e/console-output/logger-configuration.e2e.spec.ts
// @(#) : Runtime logger configuration management scenarios
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework - テスト実行環境
import { describe, expect, it } from 'vitest';

// Core logger functionality - ログ機能コア
import { AgLogger } from '@/AgLogger.class';

// Output formatters - 出力フォーマッター（個別import）
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

// Logger implementations - ログ出力実装
import { ConsoleLogger } from '@/plugins/logger/ConsoleLogger';

// Test utilities - テストユーティリティ
import { setupTest } from './__helpers__/setup-tests.helper';

// Shared types and constants - 共有型・定数
import { AG_LOGLEVEL } from '../../../shared/types';

/**
 * Test Scenarios:
 * - Hot Reconfiguration: Live system configuration updates without restart
 * - Environment Migration: Configuration switching between dev/staging/prod
 * - Format Migration: Gradual formatter changes during deployment
 * - Configuration Persistence: Settings retention across application restarts
 */

/**
 * @suite Logger Configuration Management | Hot/Format/Persistence
 * @description ランタイム構成管理（ホット再設定・フォーマット移行・設定保持）の検証。
 * @testType e2e
 * Scenarios: Hot Reconfiguration, Configuration Persistence, Format Migration
 */
describe('Logger Configuration Scenarios', () => {
  /**
   * @context Given
   * @description ランタイムでのロガー構成管理要件を前提とする。
   */
  describe('Given runtime configuration management needs', () => {
    /**
     * @scenario Hot Reconfiguration
     * @description 無停止での完全/部分/連続更新で出力が期待通りになることを検証。
     */
    describe('When system requires hot reconfiguration', () => {
      // 完全更新後にINFOが1回出力される
      it('should output one INFO log after complete update', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.setLoggerConfig({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.info('after setLoggerConfig');

        expect(mockConsole.info).toHaveBeenCalledTimes(1);
      });

      // 完全更新後のメッセージが期待どおり
      it('should match INFO message after complete setLoggerConfig', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.setLoggerConfig({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.info('after setLoggerConfig');

        expect(mockConsole.info.mock.calls[0][0]).toMatch(/\[INFO\] after setLoggerConfig$/);
      });

      // 部分更新後にINFOが1回出力される
      it('should output one INFO log after partial update', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.setLoggerConfig({ formatter: PlainFormatter });
        logger.info('partial update');

        expect(mockConsole.info).toHaveBeenCalledTimes(1);
      });

      // 部分更新後のメッセージが期待どおり
      it('should match INFO message on partial update', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.setLoggerConfig({ formatter: PlainFormatter });
        logger.info('partial update');

        expect(mockConsole.info.mock.calls[0][0]).toMatch(/\[INFO\] partial update$/);
      });

      // 連続更新でINFOが2回出力される
      it('should output INFO twice across sequential updates', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.setLoggerConfig({ defaultLogger: ConsoleLogger });
        logger.info('update1');
        logger.setLoggerConfig({ formatter: PlainFormatter });
        logger.info('update2');

        expect(mockConsole.info).toHaveBeenCalledTimes(2);
      });

      // 1回目のメッセージが一致
      it('should match first INFO message update1', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.setLoggerConfig({ defaultLogger: ConsoleLogger });
        logger.info('update1');
        logger.setLoggerConfig({ formatter: PlainFormatter });
        logger.info('update2');

        const messages = mockConsole.info.mock.calls.map((call) => call[0]);
        expect(messages[0]).toMatch(/\[INFO\] update1$/);
      });

      // 2回目のメッセージが一致
      it('should match second INFO message update2', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.setLoggerConfig({ defaultLogger: ConsoleLogger });
        logger.info('update1');
        logger.setLoggerConfig({ formatter: PlainFormatter });
        logger.info('update2');

        const messages = mockConsole.info.mock.calls.map((call) => call[0]);
        expect(messages[1]).toMatch(/\[INFO\] update2$/);
      });
    });

    /**
     * @scenario Configuration Persistence
     * @description パラメータ省略やインスタンス再取得において設定が共有・保持されることを検証。
     */
    describe('When configuration persistence is required', () => {
      // パラメータ省略でもINFOが1回出力
      it('should output one INFO log with omitted params', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);

        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.info('omitted parameter test');

        expect(mockConsole.info).toHaveBeenCalledTimes(1);
      });

      // パラメータ省略時の出力はstring
      it('should output a string message with omitted params', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);

        const logger = AgLogger.createLogger();
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.info('omitted parameter test');

        const message = mockConsole.info.mock.calls[0][0];
        expect(typeof message).toBe('string');
      });

      // 設定更新後にcreateLogger()で同一インスタンス
      it('should return same instance via createLogger()', (_ctx) => {
        setupTest(_ctx);
        const logger1 = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger1.logLevel = AG_LOGLEVEL.INFO;

        logger1.info('initial message');
        logger1.setLoggerConfig({ formatter: PlainFormatter });
        logger1.info('after settings update');

        const logger2 = AgLogger.createLogger();
        logger2.info('after omission');

        expect(logger1).toBe(logger2);
      });

      // INFO合計が3回
      it('should output INFO three times overall', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger1 = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger1.logLevel = AG_LOGLEVEL.INFO;

        logger1.info('initial message');
        logger1.setLoggerConfig({ formatter: PlainFormatter });
        logger1.info('after settings update');

        const logger2 = AgLogger.createLogger();
        logger2.info('after omission');

        expect(mockConsole.info).toHaveBeenCalledTimes(3);
      });

      // 更新後にcreateLogger()で同一インスタンス
      it('should return same instance after update', (_ctx) => {
        setupTest(_ctx);
        const logger1 = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger1.logLevel = AG_LOGLEVEL.INFO;

        logger1.setLoggerConfig({ formatter: JsonFormatter });
        const logger2 = AgLogger.createLogger();
        logger2.info('shared config test', { shared: true });

        expect(logger1).toBe(logger2);
      });

      // 更新後のINFOが1回
      it('should output one INFO log after update', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger1 = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger1.logLevel = AG_LOGLEVEL.INFO;

        logger1.setLoggerConfig({ formatter: JsonFormatter });
        const logger2 = AgLogger.createLogger();
        logger2.info('shared config test', { shared: true });

        expect(mockConsole.info).toHaveBeenCalledTimes(1);
      });

      // JSON argsに { shared: true } を含む
      it('should include { shared: true } in JSON args', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger1 = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger1.logLevel = AG_LOGLEVEL.INFO;

        logger1.setLoggerConfig({ formatter: JsonFormatter });
        const logger2 = AgLogger.createLogger();
        logger2.info('shared config test', { shared: true });

        const message = mockConsole.info.mock.calls[0][0];
        const parsedJson = JSON.parse(message);
        expect(parsedJson.args).toEqual([{ shared: true }]);
      });
    });

    // Format Migration は本ファイルではPersistence側で担保（必要時に別途拡張）
  });
});
