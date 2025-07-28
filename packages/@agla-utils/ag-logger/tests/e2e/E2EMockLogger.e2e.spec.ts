// tests/e2e/E2EMockLoggerWithTestId.spec.ts
// @(#) : E2E tests for E2EMockLoggerWithTestId
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { getLogger } from '@/AgLogger.class';
import { PlainFormat } from '@/plugins/format/PlainFormat';
import { E2eMockLogger as E2EMockLoggerWithTestId } from '@/plugins/logger/E2eMockLogger';
import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../shared/types';

/**
 * E2EMockLoggerWithTestId E2Eテストスイート
 *
 * @description E2EMockLoggerWithTestIdの完全な機能テスト
 * 機能・目的別にカテゴリー分けし、各カテゴリー内で正常系・異常系・エッジケースに分類して検証
 *
 * @testType End-to-End Test
 * @testTarget E2EMockLoggerWithTestId
 * @structure
 * - 機能別カテゴリー
 *   - 正常系: 基本的な動作確認
 *   - 異常系: エラー処理、例外時の動作
 *   - エッジケース: 境界値、特殊入力、実世界シナリオ
 */
describe('E2EMockLoggerWithTestId', () => {
  /**
   * 基本ログ機能
   *
   * @description 基本的なログメッセージのキャプチャーと取得機能のテスト
   */
  describe('Basic Logging Functionality', () => {
    /**
     * 正常系: 基本的なログ機能
     */
    describe('正常系: Basic Logging Operations', () => {
      const mockLogger = new E2EMockLoggerWithTestId('basic-logging-test');

      it('should capture log messages by level', (ctx) => {
        mockLogger.startTest(ctx.task.id);
        ctx.onTestFinished(() => mockLogger.endTest());

        mockLogger.info('Test info message');
        mockLogger.error('Test error message');
        mockLogger.warn('Test warning message');

        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['Test info message']);
        expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['Test error message']);
        expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['Test warning message']);
      });

      it('should get last message correctly', (ctx) => {
        mockLogger.startTest(ctx.task.id);
        ctx.onTestFinished(() => mockLogger.endTest());

        mockLogger.info('First info');
        mockLogger.info('Second info');
        mockLogger.info('Third info');

        expect(mockLogger.getLastMessage(AG_LOGLEVEL.INFO)).toBe('Third info');
      });

      it('should clear messages by level', (ctx) => {
        mockLogger.startTest(ctx.task.id);
        ctx.onTestFinished(() => mockLogger.endTest());

        mockLogger.info('Test message');
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(1);

        mockLogger.clearMessages(AG_LOGLEVEL.INFO);
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(0);
      });
    });
  });

  /**
   * テストID管理機能
   *
   * @description テストIDの管理と識別機能のテスト
   */
  describe('Test ID Management Functionality', () => {
    /**
     * 正常系: 基本的なテストID管理
     */
    describe('正常系: Basic Test ID Management', () => {
      const mockLogger = new E2EMockLoggerWithTestId('test-id-management');

      it('should get test identifier', (ctx) => {
        mockLogger.startTest(ctx.task.id);
        ctx.onTestFinished(() => mockLogger.endTest());

        const testIdentifier = mockLogger.getTestIdentifier();
        const currentTestId = mockLogger.getCurrentTestId();

        expect(testIdentifier).toBe('test-id-management');
        expect(currentTestId).toBe(ctx.task.id);
      });

      it('should manage multiple tests independently', (ctx) => {
        const mockLogger2 = new E2EMockLoggerWithTestId('independent-test');

        mockLogger.startTest(ctx.task.id + '-logger1');
        mockLogger2.startTest(ctx.task.id + '-logger2');
        ctx.onTestFinished(() => {
          mockLogger.endTest();
          mockLogger2.endTest();
        });

        // Log to first test
        mockLogger.info('Message from test 1');

        // Log to second test
        mockLogger2.info('Message from test 2');

        // Check messages are independent
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['Message from test 1']);
        expect(mockLogger2.getMessages(AG_LOGLEVEL.INFO)).toEqual(['Message from test 2']);
      });
    });
  });

  /**
   * AgLoggerプラグイン統合機能
   *
   * @description AgLoggerとのプラグイン統合機能のテスト
   */
  describe('AgLogger Plugin Integration Functionality', () => {
    /**
     * 正常系: 基本的なプラグイン統合
     */
    describe('正常系: Basic Plugin Integration', () => {
      const mockLogger = new E2EMockLoggerWithTestId('plugin-integration');

      it('should work as AgLoggerFunction plugin', (ctx) => {
        mockLogger.startTest(ctx.task.id);
        ctx.onTestFinished(() => mockLogger.endTest());

        const loggerFunction = mockLogger.createLoggerFunction();
        const logger = getLogger({ defaultLogger: loggerFunction, formatter: PlainFormat });

        logger.setLogLevel(AG_LOGLEVEL.INFO);
        logger.info('Test message via plugin');

        const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
        expect(messages).toHaveLength(1);
        expect(messages[0]).toMatch(/Test message via plugin/);
      });

      it('should work as AgLoggerMap plugin', (ctx) => {
        mockLogger.startTest(ctx.task.id);
        ctx.onTestFinished(() => mockLogger.endTest());

        const loggerMap = mockLogger.createLoggerMap();
        const logger = getLogger({
          defaultLogger: mockLogger.createLoggerFunction(),
          formatter: PlainFormat,
          loggerMap: loggerMap,
        });

        logger.setLogLevel(AG_LOGLEVEL.DEBUG);
        logger.error('Error message');
        logger.warn('Warning message');
        logger.info('Info message');
        logger.debug('Debug message');

        expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toHaveLength(1);
        expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toHaveLength(1);
        expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(1);
        expect(mockLogger.getMessages(AG_LOGLEVEL.DEBUG)).toHaveLength(1);
      });
    });
  });

  /**
   * 並列実行シミュレーション機能
   *
   * @description 並列実行環境でのテスト実行のテスト
   */
  describe('Parallel Execution Simulation Functionality', () => {
    /**
     * 正常系: 基本的な並列実行
     */
    describe('正常系: Basic Parallel Execution', () => {
      it('should handle concurrent test execution without interference', async () => {
        const testResults = await Promise.all([
          simulateParallelTest('test-1', 'Message from test 1'),
          simulateParallelTest('test-2', 'Message from test 2'),
          simulateParallelTest('test-3', 'Message from test 3'),
        ]);

        // Each test should have captured only its own message
        testResults.forEach(({ testId: _resultTestId, messages }, index) => {
          expect(messages).toEqual([`Message from test ${index + 1}`]);
        });
      });
    });
  });

  /**
   * ユーティリティ機能
   *
   * @description ユーティリティメソッドとヘルパー機能のテスト
   */
  describe('Utility Functions Functionality', () => {
    /**
     * 正常系: 基本的なユーティリティ機能
     */
    describe('正常系: Basic Utility Operations', () => {
      const mockLogger = new E2EMockLoggerWithTestId('utility-functions');

      it('should create unique test identifiers', (ctx) => {
        const logger2 = new E2EMockLoggerWithTestId('utility-functions-2');

        mockLogger.startTest(ctx.task.id + '-logger1');
        logger2.startTest(ctx.task.id + '-logger2');
        ctx.onTestFinished(() => {
          mockLogger.endTest();
          logger2.endTest();
        });

        const identifier1 = mockLogger.getTestIdentifier();
        const identifier2 = logger2.getTestIdentifier();
        const currentId1 = mockLogger.getCurrentTestId();
        const currentId2 = logger2.getCurrentTestId();

        expect(identifier1).toBe('utility-functions');
        expect(identifier2).toBe('utility-functions-2');
        expect(currentId1).toBe(ctx.task.id + '-logger1');
        expect(currentId2).toBe(ctx.task.id + '-logger2');
      });

      it('should get all messages for a test', (ctx) => {
        mockLogger.startTest(ctx.task.id);
        ctx.onTestFinished(() => mockLogger.endTest());

        mockLogger.info('Info message');
        mockLogger.error('Error message');
        mockLogger.warn('Warning message');

        const allMessages = mockLogger.getAllMessages();

        expect(allMessages.INFO).toEqual(['Info message']);
        expect(allMessages.ERROR).toEqual(['Error message']);
        expect(allMessages.WARN).toEqual(['Warning message']);
        expect(allMessages.DEBUG).toEqual([]);
      });
    });
  });

  // Helper function for parallel test simulation
  const simulateParallelTest = async function(
    identifier: string,
    message: string,
  ): Promise<{ testId: string; messages: string[] }> {
    const parallelMockLogger = new E2EMockLoggerWithTestId(identifier);
    const testId = `${identifier}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      parallelMockLogger.startTest(testId);
      parallelMockLogger.info(message);

      // Simulate some async work
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 10));

      return {
        testId: testId,
        messages: parallelMockLogger.getMessages(AG_LOGLEVEL.INFO),
      };
    } finally {
      parallelMockLogger.endTest();
    }
  };
});
