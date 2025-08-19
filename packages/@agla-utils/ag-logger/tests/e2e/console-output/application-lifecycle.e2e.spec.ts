// tests/e2e/console-output/application-lifecycle.e2e.spec.ts
// @(#) : Production application lifecycle flow simulation
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework - テスト実行環境
import { describe, expect, it } from 'vitest';
import type { TestContext } from 'vitest';

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
 * - Startup Phase: Application initialization with various formatters
 * - Processing Phase: High-volume request handling and complex data processing
 * - Runtime Operations: Dynamic configuration and format switching
 */

/**
 * @suite Application Lifecycle | Startup/Processing
 * @description 起動/処理フェーズでのフォーマッタ差異と構造化ログの正当性を検証する。
 * @testType e2e
 * Scenarios: Startup Phase, Processing Phase
 */
describe('Application Lifecycle Scenarios', () => {
  /**
   * @context Given
   * @description 本番アプリケーションのライフサイクル要件を前提とした検証コンテキスト。
   */
  describe('Given production application lifecycle requirements', () => {
    /**
     * @scenario Startup Phase
     * @description 起動フェーズの初期化処理とログ出力（Plain/JSON）の正当性を検証する。
     */
    describe('When startup phase initialization', () => {
      // 起動時、PlainFormatterでINFOが1回出力されること
      it('should output INFO message for application start with PlainFormatter', (_ctx: TestContext) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.info('Starting application');
        expect(mockConsole.info).toHaveBeenCalledTimes(1);
      });

      // 起動時、設定読み込みでDEBUGが1回出力されること（Plain）
      it('should output DEBUG message for config loading with PlainFormatter', (_ctx: TestContext) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.debug('Loading config file', { configPath: '/app/config.json' });
        expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      });

      // 起動時、非推奨API使用でWARNが1回出力されること（Plain）
      it('should output WARN message for deprecated API with PlainFormatter', (_ctx: TestContext) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.warn('Using deprecated API', { api: 'oldMethod' });
        expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      });

      // 起動時、DB接続失敗でERRORが1回出力されること（Plain）
      it('should output ERROR message for database connection with PlainFormatter', (_ctx: TestContext) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.error('Failed to connect to database', { host: 'localhost', port: 5432, error: 'Connection timeout' });
        expect(mockConsole.error).toHaveBeenCalledTimes(1);
      });

      // 起動時、構造化データでINFOが1回出力されること（JSON）
      it('should output INFO message with structured data using JsonFormatter', (_ctx: TestContext) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.info('Application starting', { version: '2.1.0', environment: 'production' });
        expect(mockConsole.info).toHaveBeenCalledTimes(1);
      });

      // 起動時、設定情報付きでDEBUGが1回出力されること（JSON）
      it('should output DEBUG message with configuration data using JsonFormatter', (_ctx: TestContext) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.debug('Loading configuration', { configPath: '/app/config.json', size: '2.3KB' });
        expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      });

      // 起動時、非推奨API使用でWARNが1回出力されること（JSON）
      it('should output WARN message for deprecated API usage using JsonFormatter', (_ctx: TestContext) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.warn('Deprecated API usage detected', { api: 'v1/users', replacement: 'v2/users' });
        expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      });

      // 起動時、DB障害でERRORが1回出力されること（JSON）
      it('should output ERROR message for database failure using JsonFormatter', (_ctx: TestContext) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.error('Database connection failed', { host: 'db.example.com', error: 'timeout' });
        expect(mockConsole.error).toHaveBeenCalledTimes(1);
      });
    });

    /**
     * @scenario Processing Phase
     * @description 処理フェーズの高頻度出力・複合データ整形・入れ子構造の保全性を検証する。
     */
    describe('When processing phase operations', () => {
      // 処理フェーズ、高頻度INFOの回数とJSON構造が正しいこと
      it('should handle high-volume request processing with correct count and JSON structure', (_ctx: TestContext) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;
        const requestCount = 50;

        for (let i = 0; i < requestCount; i++) {
          logger.info('Request processed', { requestId: `req-${i}`, method: 'GET' });
        }

        expect(mockConsole.info).toHaveBeenCalledTimes(requestCount);
        const lastCallOutput = mockConsole.info.mock.calls[requestCount - 1][0];
        const lastParsedLog = JSON.parse(lastCallOutput);
        expect(lastParsedLog).toMatchObject({ level: 'INFO', message: 'Request processed' });
        expect(lastParsedLog.args).toEqual([{ requestId: `req-${requestCount - 1}`, method: 'GET' }]);
      });

      // 処理フェーズ、複合データのPlain整形が正しいこと
      it('should process complex data structures with PlainFormatter', (_ctx: TestContext) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;
        const complexData = {
          user: { id: 123, name: 'John Doe' },
          metadata: { timestamp: '2024-01-01T00:00:00Z', version: '1.0.0' },
          nested: { deep: { value: 'test' } },
        };
        logger.info('Complex data processing', complexData);
        expect(mockConsole.info).toHaveBeenCalledTimes(1);
        const logMessage = mockConsole.info.mock.calls[0][0];
        expect(logMessage).toMatch(/\[INFO\] Complex data processing/);
        expect(logMessage).toContain(JSON.stringify(complexData));
      });

      // 処理フェーズ、入れ子構造がJSONで保全されること
      it('should maintain nested structure integrity with JsonFormatter', (_ctx: TestContext) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        const complexData = {
          user: { id: 123, name: 'John Doe', roles: ['admin', 'user'] },
          metadata: {
            timestamp: '2024-01-01T00:00:00Z',
            version: '1.0.0',
            features: { darkMode: true, analytics: false },
          },
        };
        logger.info('Complex object logging', complexData);
        expect(mockConsole.info).toHaveBeenCalledTimes(1);
        const logOutput = mockConsole.info.mock.calls[0][0];
        const parsedLog = JSON.parse(logOutput);
        expect(parsedLog.level).toBe('INFO');
        expect(parsedLog.message).toBe('Complex object logging');
        expect(parsedLog.args).toEqual([complexData]);
        expect(parsedLog.args[0].user.id).toBe(123);
        expect(parsedLog.args[0].metadata.features.darkMode).toBe(true);
      });
    });
  });
});
