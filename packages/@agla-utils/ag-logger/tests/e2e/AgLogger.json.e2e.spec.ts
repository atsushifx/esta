// tests/e2e/AgLogger.json.e2e.spec.ts
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
import { getLogger } from '@/AgLogger.class';

// --- types ---
import type { AG_LABEL_TO_LOGLEVEL_MAP } from '../../shared/types';

// Type definitions derived from log level constants
type TLogLevelLabels = keyof typeof AG_LABEL_TO_LOGLEVEL_MAP;
type TAgLoggerMethods = Lowercase<Exclude<TLogLevelLabels, 'OFF'>>;
type TMockConsoleMethods = keyof typeof mockConsole;
type TCircularObject = { name: string; self?: TCircularObject };

// プラグイン - JSON形式フォーマッター（構造化ログ用）
import { JsonFormat } from '@/plugins/format/JsonFormat';
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
 * AgLogger E2E テストスイート - JSON形式 + コンソール出力
 *
 * @description JsonFormatとConsoleLoggerの完全統合をエンドツーエンドで検証
 * 実際のプロダクション環境での使用パターンを模した包括的テストを実施
 *
 * @testType End-to-End Test
 * @testTarget AgLogger + JsonFormat + ConsoleLogger
 * @coverage
 * - 正常系: JSON構造化ログ、レベル別出力、複数引数処理
 * - 異常系: エラー状況での動作、フィルタリング
 * - エッジケース: 実世界シナリオ、複雑なデータ構造
 */
describe('AgLogger E2E Tests - JSON Format with Console Logger', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  };

  /**
   * 正常系テスト: JSON構造化ログ出力
   *
   * @description 各ログレベルでの正常なJSON出力を検証
   */
  describe('正常系: JSON Structured Logging', () => {
    /**
     * 基本JSON出力のテスト
     *
     * @description 各ログレベルでの基本的なJSON構造を検証
     */
    describe('Basic JSON Output', () => {
      it('should output structured JSON logs for all levels', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormat });
        logger.setLogLevel(AG_LOGLEVEL.TRACE);

        const testCases = [
          { method: 'error', level: 'ERROR', consoleMethod: 'error' },
          { method: 'warn', level: 'WARN', consoleMethod: 'warn' },
          { method: 'info', level: 'INFO', consoleMethod: 'info' },
          { method: 'debug', level: 'DEBUG', consoleMethod: 'debug' },
        ];

        testCases.forEach(({ method, level, consoleMethod }) => {
          (logger[method as TAgLoggerMethods] as (msg: string) => void)(`${method} message`);

          expect(mockConsole[consoleMethod as TMockConsoleMethods]).toHaveBeenCalledTimes(1);
          const consoleMock = mockConsole[consoleMethod as TMockConsoleMethods];
          const [logOutput] = consoleMock.mock.calls[0] as [string];

          const parsedLog = JSON.parse(logOutput);
          expect(parsedLog).toMatchObject({
            level,
            message: `${method} message`,
          });
          expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

          vi.clearAllMocks();
        });
      });
    });

    /**
     * 複数引数処理のテスト
     *
     * @description JSON形式での複数引数とオブジェクトの処理を検証
     */
    describe('Multiple Arguments Processing', () => {
      it('should handle complex data structures in JSON format', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormat });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        const complexData = {
          user: { id: 123, name: 'TestUser' },
          metadata: { version: '1.0.0', features: ['auth', 'logging'] },
          metrics: { requests: 1500, errors: 3 },
        };

        logger.info('API Request processed', complexData, 'success');

        expect(mockConsole.info).toHaveBeenCalledTimes(1);
        const [logOutput] = mockConsole.info.mock.calls[0];
        const parsedLog = JSON.parse(logOutput);

        expect(parsedLog).toMatchObject({
          level: 'INFO',
          message: 'API Request processed success',
          args: [complexData],
        });
        expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });

      it('should handle arrays and primitive types correctly', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormat });
        logger.setLogLevel(AG_LOGLEVEL.DEBUG);

        const testData = {
          numbers: [1, 2, 3],
          strings: ['a', 'b', 'c'],
          mixed: [null, null, true, false, 0, ''], // undefined becomes null in JSON
        };

        logger.debug('Data processing', testData, 42, true, null);

        expect(mockConsole.debug).toHaveBeenCalledTimes(1);
        const [logOutput] = mockConsole.debug.mock.calls[0];
        const parsedLog = JSON.parse(logOutput);

        expect(parsedLog).toMatchObject({
          level: 'DEBUG',
          message: 'Data processing 42 true',
          args: [testData, null],
        });
      });
    });

    /**
     * JSON形式特有機能のテスト
     *
     * @description JSON形式固有の機能を検証
     */
    describe('JSON Format Specific Features', () => {
      it('should omit args property when no structured arguments', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormat });
        logger.setLogLevel(AG_LOGLEVEL.INFO);

        logger.info('Simple message without args');

        expect(mockConsole.info).toHaveBeenCalledTimes(1);
        const [logOutput] = mockConsole.info.mock.calls[0];
        const parsedLog = JSON.parse(logOutput);

        expect(parsedLog).toMatchObject({
          level: 'INFO',
          message: 'Simple message without args',
          timestamp: expect.any(String),
        });
        expect(parsedLog).not.toHaveProperty('args');
      });

      it('should maintain JSON structure with empty objects and arrays', () => {
        setupTestContext();
        const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormat });
        logger.setLogLevel(AG_LOGLEVEL.WARN);

        logger.warn('Empty structures test', {}, [], '');

        expect(mockConsole.warn).toHaveBeenCalledTimes(1);
        const [logOutput] = mockConsole.warn.mock.calls[0];
        const parsedLog = JSON.parse(logOutput);

        expect(parsedLog).toMatchObject({
          level: 'WARN',
          message: 'Empty structures test',
          args: [{}, []],
        });
      });
    });
  });

  /**
   * 正常系テスト: ログレベルフィルタリング
   *
   * @description JSON形式でのログレベルフィルタリングを検証
   */
  describe('Log Level Filtering', () => {
    it('should filter logs based on current level with JSON output', () => {
      setupTestContext();
      const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormat });

      // INFO レベルに設定
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      logger.debug('debug message'); // フィルタリングされる
      logger.info('info message'); // 出力される
      logger.warn('warn message'); // 出力される
      logger.error('error message'); // 出力される

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);

      // JSON構造の確認
      const infoOutput = JSON.parse(mockConsole.info.mock.calls[0][0]);
      expect(infoOutput.level).toBe('INFO');
    });

    it('should block all output when level is OFF', () => {
      setupTestContext();
      const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormat });
      logger.setLogLevel(AG_LOGLEVEL.OFF);

      logger.fatal('fatal message');
      logger.error('error message');
      logger.warn('warn message');
      logger.info('info message');

      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
    });
  });

  /**
   * 異常系テスト: エラー処理
   *
   * @description JSON形式でのエラー処理を検証
   */
  describe('異常系: Error Handling', () => {
    it('should handle JSON serialization errors gracefully', () => {
      setupTestContext();
      const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormat });
      logger.setLogLevel(AG_LOGLEVEL.ERROR);

      // 循環参照オブジェクト
      const circularObj: TCircularObject = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => {
        logger.error('Circular reference test', circularObj);
      }).toThrow(); // JSON.stringify が例外を投げる
    });
  });

  /**
   * エッジケース: 実世界シナリオ
   *
   * @description 実際のアプリケーションでの使用パターンを検証
   */
  describe('エッジケース: Real-world Scenarios', () => {
    it('should handle complete application lifecycle logging', () => {
      setupTestContext();
      const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormat });
      logger.setLogLevel(AG_LOGLEVEL.DEBUG);

      // アプリケーション起動
      logger.info('Application starting', { version: '2.1.0', environment: 'production' });

      // 設定読み込み
      logger.debug('Loading configuration', {
        configPath: '/app/config.json',
        size: '2.3KB',
        lastModified: '2025-07-26T06:30:00Z',
      });

      // 警告
      logger.warn('Deprecated API usage detected', {
        api: 'v1/users',
        replacement: 'v2/users',
        deprecationDate: '2025-12-31',
      });

      // エラー
      logger.error('Database connection failed', {
        host: 'db.example.com',
        port: 5432,
        database: 'production',
        error: 'Connection timeout after 30s',
        retryAttempt: 3,
      });

      // 出力回数の確認
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);

      // 各ログのJSON構造確認
      const logs = {
        info: JSON.parse(mockConsole.info.mock.calls[0][0]),
        debug: JSON.parse(mockConsole.debug.mock.calls[0][0]),
        warn: JSON.parse(mockConsole.warn.mock.calls[0][0]),
        error: JSON.parse(mockConsole.error.mock.calls[0][0]),
      };

      expect(logs.info).toMatchObject({
        level: 'INFO',
        message: 'Application starting',
        args: [{ version: '2.1.0', environment: 'production' }],
      });

      expect(logs.error).toMatchObject({
        level: 'ERROR',
        message: 'Database connection failed',
        args: [expect.objectContaining({
          host: 'db.example.com',
          error: 'Connection timeout after 30s',
        })],
      });

      // タイムスタンプの整合性確認
      Object.values(logs).forEach((log) => {
        expect(log.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });

    it('should handle high-frequency logging with JSON format', () => {
      setupTestContext();
      const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormat });
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      // 大量のログ出力をシミュレート
      const logCount = 100;
      for (let i = 0; i < logCount; i++) {
        logger.info(`Request processed`, {
          requestId: `req-${i}`,
          method: 'GET',
          path: `/api/users/${i}`,
          statusCode: 200,
          responseTime: Math.floor(Math.random() * 100) + 50,
        });
      }

      expect(mockConsole.info).toHaveBeenCalledTimes(logCount);

      // 最後のログの構造確認
      const lastLog = JSON.parse(mockConsole.info.mock.calls[logCount - 1][0]);
      expect(lastLog).toMatchObject({
        level: 'INFO',
        message: 'Request processed',
        args: [expect.objectContaining({
          requestId: `req-${logCount - 1}`,
          method: 'GET',
        })],
      });
    });

    it('should handle log method (generic) with JSON format', () => {
      setupTestContext();
      const logger = getLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormat });
      logger.setLogLevel(AG_LOGLEVEL.INFO);

      logger.log('Generic log message', { data: 'test' });

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const [logOutput] = mockConsole.info.mock.calls[0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toMatchObject({
        level: 'INFO',
        message: 'Generic log message',
        args: [{ data: 'test' }],
      });
    });
  });
});
