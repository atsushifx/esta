// tests/utils/__tests__/E2eMockLogger.spec.ts
// @(#) : E2eMockLogger Unit Test
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// constants
import { AG_LOGLEVEL } from '../../../shared/types';

// test target
import { E2eMockLogger } from '@/plugins/logger/E2eMockLogger';

describe('E2eMockLogger', () => {
  let mockLogger: E2eMockLogger;

  // Initialize mockLogger for tests
  mockLogger = new E2eMockLogger('test-id');

  describe('testID管理: IDの切り替えと管理', () => {
    it('should allow switching to different test ID after construction', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      expect(() => mockLogger.info('test message')).not.toThrow();
      expect(mockLogger.getCurrentTestId()).toBe(ctx.task.id);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['test message']);
    });

    it('should throw error when trying to log after ending current test', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      mockLogger.endTest(); // End test manually to test error condition
      ctx.onTestFinished(() => {
        // No need to call endTest again since already called
      });

      expect(() => mockLogger.info('test message')).toThrow('No active test. Call startTest() before logging.');
      expect(mockLogger.getCurrentTestId()).toBeNull();
    });
  });

  describe('基本機能: errorメッセージを配列に保存できる', () => {
    it('should store error messages in array', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.error('First error');
      mockLogger.error('Second error');

      const errorMessages = mockLogger.getErrorMessages();
      expect(errorMessages).toEqual(['First error', 'Second error']);
    });
  });

  describe('基本機能: 最後のerrorメッセージを取得できる', () => {
    it('should return last error message', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.error('First error');
      mockLogger.error('Second error');

      const lastError = mockLogger.getLastErrorMessage();
      expect(lastError).toBe('Second error');
    });

    it('should return null when no error messages', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      const lastError = mockLogger.getLastErrorMessage();
      expect(lastError).toBeNull();
    });
  });

  describe('基本機能: errorメッセージをクリアできる', () => {
    it('should clear error messages', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.error('First error');
      mockLogger.error('Second error');

      mockLogger.clearErrorMessages();

      const errorMessages = mockLogger.getErrorMessages();
      expect(errorMessages).toEqual([]);
      expect(mockLogger.getLastErrorMessage()).toBeNull();
    });
  });

  describe('統一API設計: getLastMessage(logLevel)で統一', () => {
    it('should get last message for each level using unified method', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.fatal('Fatal 1');
      mockLogger.fatal('Fatal 2');
      mockLogger.error('Error 1');
      mockLogger.error('Error 2');

      expect(mockLogger.getLastMessage(AG_LOGLEVEL.FATAL)).toBe('Fatal 2');
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBe('Error 2');
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.WARN)).toBeNull();
    });

    it('should get messages for each level using unified method', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.fatal('Fatal message');
      mockLogger.error('Error message');
      mockLogger.warn('Warn message');

      expect(mockLogger.getMessages(AG_LOGLEVEL.FATAL)).toEqual(['Fatal message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['Error message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['Warn message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual([]);
    });

    it('should clear messages for specific level using unified method', (ctx) => {
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.fatal('Fatal message');
      mockLogger.error('Error message');

      mockLogger.clearMessages(AG_LOGLEVEL.FATAL);

      expect(mockLogger.getMessages(AG_LOGLEVEL.FATAL)).toEqual([]);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['Error message']);
    });
  });
});
