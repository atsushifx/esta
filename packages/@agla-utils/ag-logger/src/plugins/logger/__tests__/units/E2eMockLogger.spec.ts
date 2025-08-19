// BDD: E2eMockLogger 統合ユニットテスト雛形
// 目的: 既存ユニット＋E2Eのユニット相当テストをGiven/When/Thenで再構成
// 注意: 当面は it.todo/it.skip として追加し、段階的に有効化する

import { E2eMockLogger } from '@/plugins/logger/E2eMockLogger';
import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../../../shared/types';

// 実装対象（移行時に有効化）
// import { expect } from 'vitest';
// import { E2eMockLogger } from '@/plugins/logger/E2eMockLogger';
// import { AG_LOGLEVEL } from '../../../../../shared/types';

describe('BDD: E2eMockLogger', () => {
  // 種別: ID/State 管理
  describe('Behavior: Test ID Management', () => {
    it('Given startTest済 When log Then currentTestIdがセットされメッセージが保存される', (ctx) => {
      // Given: 新規E2eMockLoggerとstartTest済
      const mockLogger = new E2eMockLogger('bdd-id');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When: INFOログを1件出力
      mockLogger.info('test message');

      // Then: currentTestIdがctx.task.id、メッセージが保存
      expect(mockLogger.getCurrentTestId()).toBe(ctx.task.id);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['test message']);
    });

    it('Given endTest後 When log Then 例外が発生しcurrentTestIdはnullのまま', (ctx) => {
      // Given: 新規E2eMockLogger、startTest後にendTestで終了
      const mockLogger = new E2eMockLogger('bdd-id');
      mockLogger.startTest(ctx.task.id);
      mockLogger.endTest();
      ctx.onTestFinished(() => {
        // すでに終了済のため何もしない
      });

      // When/Then: ログ呼び出しは例外、currentTestIdはnull
      expect(() => mockLogger.info('test message')).toThrow('No active test. Call startTest() before logging.');
      expect(mockLogger.getCurrentTestId()).toBeNull();
    });
  });

  // 種別: 基本機能（収集）
  describe('Behavior: Message Collection by Level', () => {
    it('Given INFO/ERROR/WARN をlog When 取得 Then 各レベル配列に分類', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-collection');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When
      mockLogger.info('info message');
      mockLogger.error('error message');
      mockLogger.warn('warn message');

      // Then
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['warn message']);
    });

    it('Given 同一レベルに3件 When 取得 Then 順序保持かつlength=3', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-order');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When
      mockLogger.info('first info');
      mockLogger.info('second info');
      mockLogger.info('third info');

      // Then
      const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(infoMessages).toEqual(['first info', 'second info', 'third info']);
      expect(infoMessages).toHaveLength(3);
    });

    it('Given 異なるレベル混在 When 取得 Then レベル毎に分離', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-mixed');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When
      mockLogger.error('error 1');
      mockLogger.info('info 1');
      mockLogger.error('error 2');
      mockLogger.warn('warn 1');
      mockLogger.info('info 2');

      // Then
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error 1', 'error 2']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info 1', 'info 2']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['warn 1']);
    });
  });

  // 種別: 基本機能（最新値）
  describe('Behavior: Last Message Retrieval', () => {
    it('Given 連続INFO When getLast Then 最後のINFOを返す', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-last');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When
      mockLogger.info('first info');
      mockLogger.info('second info');
      mockLogger.info('last info');

      // Then
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.INFO)).toBe('last info');
    });

    it('Given 未追加DEBUG When getLast Then nullを返す', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-last-none');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When/Then
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.DEBUG)).toBeNull();
    });

    it('Given INFO/ERROR混在 When getLast Then 各レベルの最後を返す', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-last-mixed');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When
      mockLogger.info('info 1');
      mockLogger.error('error 1');
      mockLogger.info('info 2');
      mockLogger.error('error 2');

      // Then
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.INFO)).toBe('info 2');
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBe('error 2');
    });
  });

  // 種別: 基本機能（クリア）
  describe('Behavior: Message Clearing', () => {
    it('Given 全レベル追加 When INFOのみclear Then INFOのみ空・他は保持', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-clear-specific');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.info('info message');
      mockLogger.error('error message');
      mockLogger.warn('warn message');

      // When
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(1); // 前提確認
      mockLogger.clearMessages(AG_LOGLEVEL.INFO);

      // Then
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(0);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toHaveLength(1);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toHaveLength(1);
    });

    it('Given 空配列 When clear Then 例外なく長さ0', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-clear-empty');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When/Then
      expect(() => mockLogger.clearMessages(AG_LOGLEVEL.INFO)).not.toThrow();
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(0);
    });

    it('Given clear後 When 追加 Then 新規メッセージが保持される', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-clear-then-add');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.info('before clear');
      mockLogger.clearMessages(AG_LOGLEVEL.INFO);

      // When
      mockLogger.info('after clear');

      // Then
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages).toEqual(['after clear']);
      expect(messages).toHaveLength(1);
    });
  });

  // 種別: エッジケース
  describe('Behavior: Edge Cases', () => {
    it('Given 空文字の追加 When 取得 Then 空文字が返る', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-empty-string');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When
      mockLogger.info('');
      mockLogger.error('');

      // Then
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['']);
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.INFO)).toBe('');
    });

    it('Given 長文の追加 When 取得 Then 長文が返る', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-long-message');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());
      const longMessage = 'a'.repeat(10000);

      // When
      mockLogger.info(longMessage);

      // Then
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual([longMessage]);
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.INFO)).toBe(longMessage);
    });
  });

  // 種別: ユーティリティ
  describe('Behavior: Utilities', () => {
    it('Purpose: カウント Given 3/2/0件 When count Then INFO=3,ERROR=2,WARN=0', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-utils-count');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When
      mockLogger.info('info 1');
      mockLogger.info('info 2');
      mockLogger.info('info 3');
      mockLogger.error('error 1');
      mockLogger.error('error 2');

      // Then
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(3);
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.ERROR)).toBe(2);
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.WARN)).toBe(0);
    });

    it('Purpose: 初期カウント Given 未追加 When count Then 全レベル0', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-utils-initial');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When/Then
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(0);
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.ERROR)).toBe(0);
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.WARN)).toBe(0);
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.DEBUG)).toBe(0);
    });

    it('Purpose: 存在確認 Given 前後で1件追加 When hasMessages Then INFOのみtrue', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-utils-has');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // Then - initial state
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(false);

      // When
      mockLogger.info('test message');

      // Then - after add
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(false);
    });

    it('Purpose: 全取得/全クリア Given 複数追加 When clearAll Then 各レベル0', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-utils-all');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When
      mockLogger.info('info message');
      mockLogger.warn('warn message');
      mockLogger.error('error message');
      mockLogger.debug('debug message');

      // Then - before clear
      const allMessages = mockLogger.getAllMessages();
      expect(allMessages).toBeDefined();
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['warn message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.DEBUG)).toEqual(['debug message']);

      // When - clear all
      mockLogger.clearAllMessages();

      // Then - after clear
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(0);
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.WARN)).toBe(0);
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.ERROR)).toBe(0);
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(false);
    });
  });

  // 種別: API一貫性
  describe('Behavior: Unified API', () => {
    it('Purpose: getLastMessage統一 When レベル別log Then 各レベルの最後が取得', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-unified-last');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When
      mockLogger.fatal('Fatal 1');
      mockLogger.fatal('Fatal 2');
      mockLogger.error('Error 1');
      mockLogger.error('Error 2');

      // Then
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.FATAL)).toBe('Fatal 2');
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBe('Error 2');
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.WARN)).toBeNull();
    });

    it('Purpose: getMessages統一 When レベル別log Then 各レベル配列が取得', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-unified-get');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      // When
      mockLogger.fatal('Fatal message');
      mockLogger.error('Error message');
      mockLogger.warn('Warn message');

      // Then
      expect(mockLogger.getMessages(AG_LOGLEVEL.FATAL)).toEqual(['Fatal message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['Error message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['Warn message']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual([]);
    });

    it('Purpose: clearMessages統一 When 一部clear Then 期待通り残る', (ctx) => {
      // Given
      const mockLogger = new E2eMockLogger('bdd-unified-clear');
      mockLogger.startTest(ctx.task.id);
      ctx.onTestFinished(() => mockLogger.endTest());

      mockLogger.fatal('Fatal message');
      mockLogger.error('Error message');

      // When
      mockLogger.clearMessages(AG_LOGLEVEL.FATAL);

      // Then
      expect(mockLogger.getMessages(AG_LOGLEVEL.FATAL)).toEqual([]);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['Error message']);
    });
  });
});
