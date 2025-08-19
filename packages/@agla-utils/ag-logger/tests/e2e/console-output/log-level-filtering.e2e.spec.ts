// tests/e2e/console-output/log-level-filtering.e2e.spec.ts
// @(#) : Production log level management and dynamic filtering scenarios
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
 * - Production Monitoring: Normal operations with INFO+ filtering for efficiency
 * - Critical Debugging: Emergency troubleshooting with DEBUG+ comprehensive logging
 * - Maintenance Mode: Minimal ERROR+ logging during system maintenance
 * - Dynamic Adjustment: Runtime log level changes for incident investigation
 */

/**
 * @suite Log Level Management | Filtering & Dynamics
 * @description 運用におけるログレベル管理（INFO+/DEBUG+/ERROR+/OFF）とランタイム調整の妥当性を検証する。
 * @testType e2e
 * Scenarios: Production Monitoring, Critical Debugging, Maintenance Mode, Dynamic Adjustment
 */
describe('Log Level Management Scenarios', () => {
  /**
   * @context Given
   * @description 本番運用におけるログレベル管理要件（INFO+/DEBUG+/ERROR+/OFF）を前提条件とする検証コンテキスト。
   */
  describe('Given production logging requirements', () => {
    /**
     * @scenario Production Monitoring (INFO+)
     * @description 通常運用ではINFO以上を出力し、DEBUGは抑止されることを検証する（Plain/JSON）。
     */
    describe('When Production Monitoring (INFO+)', () => {
      // INFOレベル時、DEBUGは出力されない（Plain）
      it('should not output DEBUG at INFO level (Plain)', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.debug('debug message');
        expect(mockConsole.debug).not.toHaveBeenCalled();
      });

      // INFOレベル時、INFOは1回出力される（Plain）
      it('should output INFO once at INFO level (Plain)', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.info('info message');
        expect(mockConsole.info).toHaveBeenCalledTimes(1);
      });

      // INFOレベル時、DEBUGは出力されない（JSON）
      it('should not output DEBUG at INFO level (JSON)', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.debug('debug message', { data: 'debug' });
        expect(mockConsole.debug).not.toHaveBeenCalled();
      });

      // INFOレベル時、INFOは1回出力される（JSON）
      it('should output INFO once at INFO level (JSON)', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.info('info message', { data: 'info' });
        expect(mockConsole.info).toHaveBeenCalledTimes(1);
      });

      // INFOレベル時、WARNは1回出力される（JSON）
      it('should output WARN once at INFO level (JSON)', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.warn('warn message', { data: 'warn' });
        expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      });
    });

    /**
     * @scenario Critical Debugging (DEBUG+)
     * @description 緊急デバッグではDEBUG以上をすべて出力することを検証する（Plain）。
     */
    describe('When Critical Debugging (DEBUG+)', () => {
      // DEBUGレベル時、ERRORは1回出力される
      it('should output ERROR once at DEBUG level', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.error('error message');
        expect(mockConsole.error).toHaveBeenCalledTimes(1);
      });

      // DEBUGレベル時、WARNは1回出力される
      it('should output WARN once at DEBUG level', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.warn('warn message');
        expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      });

      // DEBUGレベル時、INFOは1回出力される
      it('should output INFO once at DEBUG level', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.info('info message');
        expect(mockConsole.info).toHaveBeenCalledTimes(1);
      });

      // DEBUGレベル時、DEBUGは1回出力される
      it('should output DEBUG once at DEBUG level', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.DEBUG;
        logger.debug('debug message');
        expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      });
    });

    /**
     * @scenario Maintenance Mode (ERROR+ / OFF)
     * @description メンテ中は最小限のエラーログのみ、OFFでは全抑止となることを検証する。
     */
    describe('When Maintenance Mode (ERROR+ / OFF)', () => {
      // ERRORレベル時、INFOは出力されない
      it('should not output INFO at ERROR level', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.ERROR;
        logger.info('info message');
        expect(mockConsole.info).not.toHaveBeenCalled();
      });

      // ERRORレベル時、WARNは出力されない
      it('should not output WARN at ERROR level', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.ERROR;
        logger.warn('warn message');
        expect(mockConsole.warn).not.toHaveBeenCalled();
      });

      // ERRORレベル時、ERRORは1回出力される
      it('should output ERROR once at ERROR level', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.ERROR;
        logger.error('error message');
        expect(mockConsole.error).toHaveBeenCalledTimes(1);
      });

      // OFFレベル時、ERRORは出力されない
      it('should not output ERROR when OFF', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.OFF;
        logger.error('error message');
        expect(mockConsole.error).not.toHaveBeenCalled();
      });

      // OFFレベル時、WARNは出力されない
      it('should not output WARN when OFF', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.OFF;
        logger.warn('warn message');
        expect(mockConsole.warn).not.toHaveBeenCalled();
      });

      // OFFレベル時、INFOは出力されない
      it('should not output INFO when OFF', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.OFF;
        logger.info('info message');
        expect(mockConsole.info).not.toHaveBeenCalled();
      });

      // OFFレベル時、DEBUGは出力されない
      it('should not output DEBUG when OFF', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.OFF;
        logger.debug('debug message');
        expect(mockConsole.debug).not.toHaveBeenCalled();
      });
    });

    /**
     * @scenario Dynamic Adjustment
     * @description ランタイムでのログレベル変更により出力が即時に切り替わることを検証する。
     */
    describe('When Dynamic Adjustment at Runtime', () => {
      // ERRORレベル時、INFOは出力されない
      it('should not output INFO while at ERROR level', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.ERROR;
        logger.info('info before change');
        expect(mockConsole.info).not.toHaveBeenCalled();
      });

      // ERRORレベル時、ERRORは1回出力される
      it('should output ERROR once while at ERROR level', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.ERROR;
        logger.error('error before change');
        expect(mockConsole.error).toHaveBeenCalledTimes(1);
      });

      // INFOへ変更後、INFOは1回出力される
      it('should output INFO once after changing to INFO level', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.ERROR;
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.info('info after change');
        expect(mockConsole.info).toHaveBeenCalledTimes(1);
      });

      // INFOへ変更後でも、DEBUGは出力されない
      it('should still suppress DEBUG after changing to INFO level', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
        logger.logLevel = AG_LOGLEVEL.ERROR;
        logger.logLevel = AG_LOGLEVEL.INFO;
        logger.debug('debug after change');
        expect(mockConsole.debug).not.toHaveBeenCalled();
      });
    });

    /**
     * @scenario WARN level (JSON structure)
     * @description WARNレベル時のJSON構造の妥当性（レベルとargs）を検証する。
     */
    describe('When WARN level JSON validation', () => {
      // WARNレベル時、INFOは出力されない（JSON）
      it('should not output INFO at WARN level (JSON)', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.WARN;
        logger.info('info message', { data: 'info' });
        expect(mockConsole.info).not.toHaveBeenCalled();
      });

      // WARNレベル時、WARNは1回出力される（JSON）
      it('should output WARN once at WARN level (JSON)', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.WARN;
        logger.warn('warn message', { data: 'warn' });
        expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      });

      // WARNレベルのJSON構造が正しい
      it('should have correct WARN JSON structure', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.WARN;
        logger.warn('warn message', { data: 'warn' });
        const warnOutput = JSON.parse(mockConsole.warn.mock.calls[0][0]);
        expect(warnOutput.level).toBe('WARN');
        expect(warnOutput.args).toEqual([{ data: 'warn' }]);
      });

      // WARNレベル時、ERRORは1回出力される（JSON）
      it('should output ERROR once at WARN level (JSON)', (_ctx) => {
        const { mockConsole } = setupTest(_ctx);
        const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
        logger.logLevel = AG_LOGLEVEL.WARN;
        logger.error('error message', { data: 'error' });
        expect(mockConsole.error).toHaveBeenCalledTimes(1);
      });
    });
  });
});
