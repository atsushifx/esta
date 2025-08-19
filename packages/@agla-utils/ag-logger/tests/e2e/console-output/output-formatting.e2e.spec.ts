// tests/e2e/console-output/output-formatting.e2e.spec.ts
// @(#) : Production logging format management and consumer compatibility
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
 * - Development to Production: Format migration during deployment lifecycle
 * - Multi-Consumer Support: Different formats for monitoring, analysis, debugging systems
 * - Format Optimization: Runtime switching for performance vs. readability balance
 * - Legacy Integration: Format compatibility across system version transitions
 */

/**
 * @suite Output Formatting | Migration/Consumers
 * @description フォーマット移行、複数消費者、レベル別フォーマット最適化の検証。
 * @testType e2e
 * Scenarios: Development→Production, Multi-Consumer Support, Format Optimization, Legacy Integration
 */
describe('Output Formatting Scenarios', () => {
  describe('Given production format management requirements', () => {
    // Development to Production（Plain→JSON移行）
    describe('When migrating from development to production', () => {
      // Plain→JSON 切替後に2件目がJSONで出力される
      it('should output JSON after switching from Plain', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.info('plain format message', { data: 'plain' });
        logger.setLoggerConfig({ formatter: JsonFormatter });
        logger.info('json format message', { data: 'json' });

        expect(mockConsole.info).toHaveBeenCalledTimes(2);

        const plainMessage = mockConsole.info.mock.calls[0][0];
        expect(plainMessage).toMatch(/\[INFO\] plain format message/);

        const jsonMessage = mockConsole.info.mock.calls[1][0];
        const parsedJson = JSON.parse(jsonMessage);
        expect(parsedJson.level).toBe('INFO');
        expect(parsedJson.message).toBe('json format message');
        expect(parsedJson.args).toEqual([{ data: 'json' }]);
      });
    });

    // Multi-Consumer Support（汎用log/JSON基礎）
    describe('When supporting multiple log consumers', () => {
      // JsonFormatterでINFOが1回出力
      it('should output a single INFO with JsonFormatter', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.info('Application starting', { version: '2.1.0', environment: 'production' });
        expect(mockConsole.info).toHaveBeenCalledTimes(1);
      });

      // JSONのキーがlevel/message/argsである
      it('should match JSON keys level/message/args', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.info('Application starting', { version: '2.1.0', environment: 'production' });
        const logOutput = mockConsole.info.mock.calls[0][0];
        const parsedLog = JSON.parse(logOutput);
        expect(parsedLog).toMatchObject({ level: 'INFO', message: 'Application starting' });
        expect(parsedLog.args).toEqual([{ version: '2.1.0', environment: 'production' }]);
      });

      // generic log() は1回出力、JSONでlevelなし、args一致
      it('should output generic log once (JSON)', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.log('Generic log message', { data: 'test' });
        expect(mockConsole.log).toHaveBeenCalledTimes(1);
      });

      it('should omit level and match args in generic log', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.log('Generic log message', { data: 'test' });
        const logOutput = mockConsole.log.mock.calls[0][0];
        const parsedLog = JSON.parse(logOutput);
        expect(parsedLog.message).toBe('Generic log message');
        expect(parsedLog.level).toBeUndefined();
        expect(parsedLog.args).toEqual([{ data: 'test' }]);
      });
    });

    // Format Optimization（レベル別フォーマット最適化）
    describe('When optimizing formatting by log level', () => {
      // INFOのフォーマットが正しい（Plain）
      it('should format INFO correctly', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.info('Starting application');
        expect(mockConsole.info.mock.calls[0][0]).toMatch(/\[INFO\] Starting application$/);
      });

      // DEBUGのフォーマットが正しい（Plain）
      it('should format DEBUG correctly', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.debug('Loading config file', { configPath: '/app/config.json' });
        expect(mockConsole.debug.mock.calls[0][0]).toMatch(
          /\[DEBUG\] Loading config file \{"configPath":"\/app\/config\.json"\}$/,
        );
      });

      // WARNのフォーマットが正しい（Plain）
      it('should format WARN correctly', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.warn('Using deprecated API', { api: 'oldMethod' });
        expect(mockConsole.warn.mock.calls[0][0]).toMatch(/\[WARN\] Using deprecated API \{"api":"oldMethod"\}$/);
      });

      // ERRORのフォーマットが正しい（Plain）
      it('should format ERROR correctly', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.error('Failed to connect to database', { host: 'localhost', port: 5432, error: 'Connection timeout' });
        expect(mockConsole.error.mock.calls[0][0]).toMatch(/\[ERROR\] Failed to connect to database/);
      });
    });

    // Legacy Integration（JSON→Plain移行）
    describe('When switching back for legacy integration', () => {
      // JSON→Plain 切替後に2件目がPlainで出力される
      it('should output Plain after switching from JSON', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;

        logger.info('json format message', { data: 'json' });
        logger.setLoggerConfig({ formatter: PlainFormatter });
        logger.info('plain format message', { data: 'plain' });

        expect(mockConsole.info).toHaveBeenCalledTimes(2);

        const jsonMessage = mockConsole.info.mock.calls[0][0];
        const parsedJson = JSON.parse(jsonMessage);
        expect(parsedJson.level).toBe('INFO');

        const plainMessage = mockConsole.info.mock.calls[1][0];
        expect(plainMessage).toMatch(/\[INFO\] plain format message/);
      });
    });
  });
});
