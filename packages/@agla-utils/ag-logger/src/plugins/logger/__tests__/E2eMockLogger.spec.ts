// src/plugins/logger/__tests__/E2eMockLogger.spec.ts
// @(#) : E2eMockLogger Unit Test
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { beforeEach, describe, expect, it } from 'vitest';

// types
import { AgLogLevelCode } from '@shared/types';

// test target
import { E2eMockLogger } from '../E2eMockLogger';

describe('E2eMockLogger', () => {
  let mockLogger: E2eMockLogger;

  beforeEach(() => {
    mockLogger = new E2eMockLogger();
  });

  describe('基本機能: errorメッセージを配列に保存できる', () => {
    it('should store error messages in array', () => {
      mockLogger.error('First error');
      mockLogger.error('Second error');

      const errorMessages = mockLogger.getErrorMessages();
      expect(errorMessages).toEqual(['First error', 'Second error']);
    });
  });

  describe('基本機能: 最後のerrorメッセージを取得できる', () => {
    it('should return last error message', () => {
      mockLogger.error('First error');
      mockLogger.error('Second error');

      const lastError = mockLogger.getLastErrorMessage();
      expect(lastError).toBe('Second error');
    });

    it('should return null when no error messages', () => {
      const lastError = mockLogger.getLastErrorMessage();
      expect(lastError).toBeNull();
    });
  });

  describe('基本機能: errorメッセージをクリアできる', () => {
    it('should clear error messages', () => {
      mockLogger.error('First error');
      mockLogger.error('Second error');

      mockLogger.clearErrorMessages();

      const errorMessages = mockLogger.getErrorMessages();
      expect(errorMessages).toEqual([]);
      expect(mockLogger.getLastErrorMessage()).toBeNull();
    });
  });

  describe('統一API設計: getLastMessage(logLevel)で統一', () => {
    it('should get last message for each level using unified method', () => {
      mockLogger.fatal('Fatal 1');
      mockLogger.fatal('Fatal 2');
      mockLogger.error('Error 1');
      mockLogger.error('Error 2');

      expect(mockLogger.getLastMessage(AgLogLevelCode.FATAL)).toBe('Fatal 2');
      expect(mockLogger.getLastMessage(AgLogLevelCode.ERROR)).toBe('Error 2');
      expect(mockLogger.getLastMessage(AgLogLevelCode.WARN)).toBeNull();
    });

    it('should get messages for each level using unified method', () => {
      mockLogger.fatal('Fatal message');
      mockLogger.error('Error message');
      mockLogger.warn('Warn message');

      expect(mockLogger.getMessages(AgLogLevelCode.FATAL)).toEqual(['Fatal message']);
      expect(mockLogger.getMessages(AgLogLevelCode.ERROR)).toEqual(['Error message']);
      expect(mockLogger.getMessages(AgLogLevelCode.WARN)).toEqual(['Warn message']);
      expect(mockLogger.getMessages(AgLogLevelCode.INFO)).toEqual([]);
    });

    it('should clear messages for specific level using unified method', () => {
      mockLogger.fatal('Fatal message');
      mockLogger.error('Error message');

      mockLogger.clearMessages(AgLogLevelCode.FATAL);

      expect(mockLogger.getMessages(AgLogLevelCode.FATAL)).toEqual([]);
      expect(mockLogger.getMessages(AgLogLevelCode.ERROR)).toEqual(['Error message']);
    });
  });
});
