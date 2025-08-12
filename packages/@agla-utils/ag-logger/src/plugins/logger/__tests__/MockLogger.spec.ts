// src/plugins/logger/__tests__/MockLogger.spec.ts
// @(#) : Unit tests for MockLogger plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework - テストランナーと検証ライブラリ
import { beforeEach, describe, expect, it } from 'vitest';

// Constants and enums - ログレベル定数とEnum定義
import { AG_LOGLEVEL } from '../../../../shared/types';

// Test target - テスト対象のMockLoggerクラス
import { MockLogger } from '../MockLogger';

// Type definitions - TypeScript型定義（実行時影響なし）
import type { AgFormattedLogMessage, AgLogLevel, AgLogMessage } from '../../../../shared/types';
import type { AgMockBufferLogger } from '../MockLogger';

/**
 * MockLoggerプラグインの包括的ユニットテストスイート
 *
 * @description MockLoggerの全機能を効率的に検証
 * メッセージキャプチャ、クエリ機能、ユーティリティ、ロガー関数生成を包括的にテスト
 *
 * @testType Unit Test
 * @testTarget MockLogger Plugin
 * @coverage
 * - Core: 基本機能、メッセージ管理、クエリ機能
 * - Error: エラー処理、無効な入力
 * - Edge: 境界値、特殊条件、不変性
 */

/**
 * MockLogger環境設定関数
 *
 * @description テスト用MockLoggerインスタンスを作成・設定
 * @returns セットアップ済みのMockLoggerインスタンス
 */
const setupMockLogger = (): AgMockBufferLogger => {
  return new MockLogger.buffer();
};

/**
 * Core Functionality Tests - 核心機能テストスイート
 *
 * @description MockLoggerの基本的な機能群を体系的に検証
 * メッセージのログ記録、取得、管理、ロガー関数生成などの主要機能をテスト
 *
 * @testCoverage
 * - Message Logging: 各レベルでのメッセージキャプチャ機能
 * - Message Retrieval: クエリ・検索・取得機能
 * - Message Management: クリア・管理機能
 * - Logger Function Generation: 動的ロガー関数生成機能
 */
describe('MockLogger - Core Functionality Tests', () => {
  let mockLogger: AgMockBufferLogger;

  // 各テスト前に新しいMockLoggerインスタンスを作成（テスト間の独立性確保）
  beforeEach(() => {
    mockLogger = setupMockLogger();
  });
  /**
   * Message Logging - メッセージログ記録機能
   *
   * @description 全ログレベルでのメッセージキャプチャ機能を検証
   * 文字列・構造化オブジェクト両対応、複数メッセージ蓄積、VERBOSE/FORCE_OUTPUT特殊レベル対応
   *
   * @testBehaviors
   * - 全ログレベル（FATAL/ERROR/WARN/INFO/DEBUG/TRACE/VERBOSE）でのメッセージキャプチャ
   * - AgLogMessage構造化オブジェクトと文字列メッセージ両対応
   * - 同一レベルでの複数メッセージ蓄積
   * - VERBOSE(-99)とFORCE_OUTPUT特殊レベルの正常処理
   */
  describe('Message Logging', () => {
    // 全ログレベルでのメッセージキャプチャ動作確認
    it('should capture messages for all log levels', () => {
      const testCases = [
        { level: AG_LOGLEVEL.FATAL, method: mockLogger.getLoggerFunction(AG_LOGLEVEL.FATAL), message: 'fatal error' },
        { level: AG_LOGLEVEL.ERROR, method: mockLogger.getLoggerFunction(AG_LOGLEVEL.ERROR), message: 'error message' },
        { level: AG_LOGLEVEL.WARN, method: mockLogger.getLoggerFunction(AG_LOGLEVEL.WARN), message: 'warning message' },
        { level: AG_LOGLEVEL.INFO, method: mockLogger.getLoggerFunction(AG_LOGLEVEL.INFO), message: 'info message' },
        { level: AG_LOGLEVEL.DEBUG, method: mockLogger.getLoggerFunction(AG_LOGLEVEL.DEBUG), message: 'debug message' },
        { level: AG_LOGLEVEL.TRACE, method: mockLogger.getLoggerFunction(AG_LOGLEVEL.TRACE), message: 'trace message' },
      ];

      testCases.forEach(({ level, method, message }) => {
        method(message);
        expect(mockLogger.getMessages(level)).toEqual([message]);
        mockLogger.clearMessages(level);
      });
    });

    // VERBOSE(-99)特殊レベルでのメッセージ格納確認
    it('should capture verbose messages in VERBOSE level storage', () => {
      // Arrange
      const verboseMessage = 'verbose diagnostic message';

      // Act
      mockLogger.verbose(verboseMessage);

      // Assert
      expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toEqual([verboseMessage]);
    });

    // 同一レベルでの複数メッセージ蓄積動作確認
    it('should handle multiple messages per level', () => {
      mockLogger.error('first error');
      mockLogger.error('second error');
      mockLogger.info('info message');

      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['first error', 'second error']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info message']);
    });

    // AgLogMessage構造化オブジェクトと文字列両対応確認
    it('should accept AgLogMessage objects as well as strings', () => {
      // Arrange
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2023-12-01T10:30:00Z'),
        message: 'Structured log message',
        args: [{ userId: 123, action: 'login' }],
      };
      const stringMessage = 'Simple string message';

      // Act
      mockLogger.info(logMessage);
      mockLogger.info(stringMessage);

      // Assert
      const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual(logMessage);
      expect(messages[1]).toEqual(stringMessage);
    });

    // 全ロガーメソッドでのAgLogMessage構造化オブジェクト対応確認
    it('should accept AgLogMessage objects in all logger methods', () => {
      // Arrange
      const createLogMessage = (level: AgLogLevel, msg: string): AgLogMessage => ({
        logLevel: level,
        timestamp: new Date('2023-12-01T10:30:00Z'),
        message: msg,
        args: [],
      });

      // Helper function to create test method using executeLog
      const createTestMethod = (level: AgLogLevel) => (msg: AgFormattedLogMessage) => mockLogger.executeLog(level, msg);

      // Act & Assert
      const testCases = [
        { method: createTestMethod(AG_LOGLEVEL.FATAL), name: 'fatal', level: AG_LOGLEVEL.FATAL },
        { method: createTestMethod(AG_LOGLEVEL.ERROR), name: 'error', level: AG_LOGLEVEL.ERROR },
        { method: createTestMethod(AG_LOGLEVEL.WARN), name: 'warn', level: AG_LOGLEVEL.WARN },
        { method: createTestMethod(AG_LOGLEVEL.INFO), name: 'info', level: AG_LOGLEVEL.INFO },
        { method: createTestMethod(AG_LOGLEVEL.DEBUG), name: 'debug', level: AG_LOGLEVEL.DEBUG },
        { method: createTestMethod(AG_LOGLEVEL.TRACE), name: 'trace', level: AG_LOGLEVEL.TRACE },
        { method: createTestMethod(AG_LOGLEVEL.VERBOSE), name: 'verbose', level: AG_LOGLEVEL.VERBOSE },
      ];

      testCases.forEach(({ method, name, level }) => {
        const logMessage = createLogMessage(level, `${name} structured message`);
        method(logMessage);
        expect(mockLogger.getMessages(level)).toContain(logMessage);
        mockLogger.clearMessages(level);
      });
    });
  });

  /**
   * Message Retrieval - メッセージ取得・クエリ機能
   *
   * @description メッセージの検索・取得・集計機能を包括的に検証
   * 特定レベル取得、最終メッセージ取得、件数確認、存在確認、全体概要取得
   *
   * @testBehaviors
   * - getMessages(): 特定レベルのメッセージ配列取得
   * - getLastMessage(): 最新メッセージ取得（存在しない場合null）
   * - getMessageCount(): レベル別メッセージ件数取得
   * - getTotalMessageCount(): 全レベル合計件数取得
   * - hasMessages(): メッセージ存在確認（レベル別）
   * - hasAnyMessages(): 全体メッセージ存在確認
   * - getAllMessages(): 全レベルメッセージの包括的概要取得
   */
  describe('Message Retrieval', () => {
    // テスト用メッセージを事前設定（クエリ機能検証用データ準備）
    beforeEach(() => {
      mockLogger.error('error1');
      mockLogger.error('error2');
      mockLogger.info('info1');
      mockLogger.warn('warn1');
    });

    // 包括的クエリ機能（取得・件数・存在確認）の動作確認
    it('should provide comprehensive query capabilities', () => {
      // 特定レベルのメッセージ取得
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error1', 'error2']);
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBe('error2');
      expect(mockLogger.getLastMessage(AG_LOGLEVEL.DEBUG)).toBeNull();

      // メッセージ数の確認
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.ERROR)).toBe(2);
      expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(1);
      expect(mockLogger.getTotalMessageCount()).toBe(4);

      // メッセージ存在確認
      expect(mockLogger.hasMessages(AG_LOGLEVEL.ERROR)).toBe(true);
      expect(mockLogger.hasMessages(AG_LOGLEVEL.DEBUG)).toBe(false);
      expect(mockLogger.hasAnyMessages()).toBe(true);
    });

    // 全レベルメッセージ概要取得機能の動作確認
    it('should provide complete message overview', () => {
      const allMessages = mockLogger.getAllMessages();
      expect(allMessages.ERROR).toEqual(['error1', 'error2']);
      expect(allMessages.INFO).toEqual(['info1']);
      expect(allMessages.WARN).toEqual(['warn1']);
      expect(allMessages.DEBUG).toEqual([]);
    });

    // VERBOSE/TRACEメッセージの個別キー格納確認
    it('should return verbose messages in VERBOSE key and trace messages in TRACE key separately', () => {
      // Arrange
      mockLogger.verbose('verbose message 1');
      mockLogger.verbose('verbose message 2');
      mockLogger.trace('trace message 1');

      // Act
      const allMessages = mockLogger.getAllMessages();

      // Assert
      expect(allMessages.VERBOSE).toEqual(['verbose message 1', 'verbose message 2']);
      expect(allMessages.TRACE).toEqual(['trace message 1']);
    });
  });

  /**
   * Message Management - メッセージ管理・操作機能
   *
   * @description メッセージのクリア・削除・管理機能を検証
   * 選択的クリア、全体クリア、状態管理の正確性を確認
   *
   * @testBehaviors
   * - clearMessages(): 特定レベルのメッセージ選択的クリア
   * - clearAllMessages(): 全レベルメッセージの一括クリア
   * - 他レベルへの影響がないことの確認
   * - クリア後の状態（hasAnyMessages, getTotalMessageCount）正確性
   * - エラーメッセージ管理の新機能対応
   */
  describe('Message Management', () => {
    // テスト用メッセージを事前設定（クリア・管理機能検証用データ準備）
    beforeEach(() => {
      mockLogger.error('error message');
      mockLogger.info('info message');
      mockLogger.warn('warn message');
    });

    // メッセージの選択的・完全クリア機能動作確認
    it('should clear messages selectively and completely', () => {
      // 特定レベルのクリア
      mockLogger.clearMessages(AG_LOGLEVEL.ERROR);
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual([]);
      expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info message']);

      // 全メッセージクリア
      mockLogger.clearAllMessages();
      expect(mockLogger.hasAnyMessages()).toBe(false);
      expect(mockLogger.getTotalMessageCount()).toBe(0);
    });

    // 新メソッドによるエラーメッセージ管理機能確認
    it('should support error message management with new methods', () => {
      // 新しいmockLoggerインスタンスを使用してテストを分離
      const testLogger = new MockLogger.buffer();
      testLogger.error('error message');

      expect(testLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error message']);
      expect(testLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBe('error message');

      testLogger.clearMessages(AG_LOGLEVEL.ERROR);
      expect(testLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual([]);
    });
  });

  /**
   * Logger Function Generation - 動的ロガー関数生成機能
   *
   * @description ロガー関数マップの動的生成機能を検証
   * 全レベル対応、特殊レベル（VERBOSE/FORCE_OUTPUT）対応、OFFレベル処理
   *
   * @testBehaviors
   * - createLoggerMap(): レベル別ロガー関数マップ生成
   * - 生成された関数の正常動作確認
   * - VERBOSE(-99)レベルの正確なマッピング
   * - FORCE_OUTPUT特殊レベルの対応
   * - OFF(0)レベルでの非ログ動作（何もしない）
   * - 各レベル関数の独立性と正確性
   */
  describe('Logger Function Generation', () => {
    // 機能的ロガーマップ生成確認
    it('should create functional logger maps', () => {
      // ロガーマップ
      const loggerMap = mockLogger.createLoggerMap();
      loggerMap[AG_LOGLEVEL.ERROR]?.('error via map');
      loggerMap[AG_LOGLEVEL.WARN]?.('warn via map');

      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error via map']);
      expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['warn via map']);

      // OFFレベルは何もしない
      loggerMap[AG_LOGLEVEL.OFF]?.('should not log');
      expect(mockLogger.hasMessages(AG_LOGLEVEL.OFF)).toBe(false);
    });

    // VERBOSEレベルの正確なマッピング確認
    it('should include VERBOSE level in createLoggerMap with correct mapping', () => {
      // Arrange
      const loggerMap = mockLogger.createLoggerMap();

      // Act
      loggerMap[AG_LOGLEVEL.VERBOSE]?.('verbose message via map');

      // Assert
      expect(mockLogger.getMessages(AG_LOGLEVEL.VERBOSE)).toEqual(['verbose message via map']);
      expect(AG_LOGLEVEL.VERBOSE).toBe(-99); // Verify VERBOSE constant
    });

    // FORCE_OUTPUTレベルのマッピング対応確認
    it('should include FORCE_OUTPUT level in createLoggerMap', () => {
      const loggerMap = mockLogger.createLoggerMap();

      loggerMap[AG_LOGLEVEL.FORCE_OUTPUT]?.('force output message');

      expect(mockLogger.getMessages(AG_LOGLEVEL.FORCE_OUTPUT)).toEqual(['force output message']);
    });
  });
});

/**
 * Error Handling Tests - エラー処理・例外処理テストスイート
 *
 * @description MockLoggerの堅牢性を検証するエラー処理テスト
 * 無効な入力値に対する適切なエラー処理、一貫したバリデーション動作を確認
 *
 * @testCoverage
 * - Type Validation: 型エラー処理（文字列、真偽値、オブジェクト、配列、null/undefined）
 * - Range Validation: 範囲外数値エラー処理（正負の範囲外、小数点数）
 * - Method Consistency: 全メソッドでの一貫したバリデーション動作
 * - Empty State Handling: 空状態での安全な操作
 */
describe('MockLogger - Error Handling Tests', () => {
  let mockLogger: AgMockBufferLogger;

  // 各テスト前に新しいMockLoggerインスタンスを作成（エラー処理テスト用）
  beforeEach(() => {
    mockLogger = setupMockLogger();
  });
  /**
   * Type Validation - 型バリデーション機能
   *
   * @description 無効な型のログレベルに対するエラー処理を検証
   * 文字列・真偽値・オブジェクト・配列・null/undefinedでの適切なエラー発生
   *
   * @testBehaviors
   * - 文字列型ログレベルでのエラー処理（'DEBUG' -> エラー）
   * - 真偽値型ログレベルでのエラー処理（true/false -> エラー）
   * - オブジェクト型ログレベルでのエラー処理（{} -> エラー）
   * - 配列型ログレベルでのエラー処理（[] -> エラー）
   * - null/undefined型ログレベルでのエラー処理
   * - エラーメッセージの統一フォーマット確認
   */
  describe('Type Validation', () => {
    // 文字列型ログレベルでの適切なエラー発生確認
    it('should throw error for string log levels with exact format', () => {
      const stringLevel = 'DEBUG' as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(stringLevel))
        .toThrow('MockLogger: Invalid log level: DEBUG');
    });

    it('should throw error for boolean log levels with exact format', () => {
      const booleanLevel = true as unknown as AgLogLevel;

      expect(() => mockLogger.getMessages(booleanLevel))
        .toThrow('MockLogger: Invalid log level: true');
    });

    it('should throw error for object log levels with exact format', () => {
      const objectLevel = { level: 1 } as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(objectLevel))
        .toThrow('MockLogger: Invalid log level: [object Object]');
    });

    it('should throw error for array log levels with exact format', () => {
      const arrayLevel = [1, 2, 3] as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(arrayLevel))
        .toThrow('MockLogger: Invalid log level: 1,2,3');
    });

    it('should throw error for null and undefined log levels with exact format', () => {
      expect(() => mockLogger.getMessages(null as unknown as AgLogLevel))
        .toThrow('MockLogger: Invalid log level: null');
      expect(() => mockLogger.getMessages(undefined as unknown as AgLogLevel))
        .toThrow('MockLogger: Invalid log level: undefined');
    });
  });

  /**
   * Range Validation - 範囲バリデーション機能
   *
   * @description 数値型だが範囲外のログレベルに対するエラー処理を検証
   * 正負の範囲外値、小数点数、VERBOSE近傍値での適切なエラー発生
   *
   * @testBehaviors
   * - 正の範囲外数値でのエラー処理（7, 999 -> エラー）
   * - 負の範囲外数値でのエラー処理（-1, -97 -> エラー）
   * - 小数点数でのエラー処理（1.5 -> エラー）
   * - VERBOSE(-99)近傍無効値でのエラー処理
   * - 大きな範囲外数値でのエラー処理
   * - エラーメッセージの数値表示正確性
   */
  describe('Range Validation', () => {
    it('should throw error for out-of-range positive numbers with exact format', () => {
      const outOfRangeLevel = 7 as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(outOfRangeLevel))
        .toThrow('MockLogger: Invalid log level: 7');
    });

    it('should throw error for out-of-range negative numbers with exact format', () => {
      const negativeLevel = -1 as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(negativeLevel))
        .toThrow('MockLogger: Invalid log level: -1');
    });

    it('should throw error for invalid negative numbers near VERBOSE range with exact format', () => {
      const nearVerboseLevel = -97 as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(nearVerboseLevel))
        .toThrow(`MockLogger: Invalid log level: ${nearVerboseLevel}`);
    });

    it('should throw error for decimal numbers with exact format', () => {
      const decimalLevel = 1.5 as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(decimalLevel))
        .toThrow('MockLogger: Invalid log level: 1.5');
    });

    it('should throw error for large out-of-range numbers with exact format', () => {
      const largeLevel = 999 as unknown as AgLogLevel;
      expect(() => mockLogger.getMessages(largeLevel))
        .toThrow('MockLogger: Invalid log level: 999');
    });
  });

  /**
   * Method Consistency - 全メソッド一貫性検証
   *
   * @description 全クエリメソッドでの一貫したバリデーション動作を検証
   * 同一無効値で全メソッドが同様のエラーを発生させることを確認
   *
   * @testBehaviors
   * - getMessages()での無効値エラー処理
   * - clearMessages()での無効値エラー処理
   * - hasMessages()での無効値エラー処理
   * - getMessageCount()での無効値エラー処理
   * - getLastMessage()での無効値エラー処理
   * - 全メソッドでの統一エラーメッセージ確認
   */
  describe('Method Consistency', () => {
    const invalidLevel = 999 as unknown as AgLogLevel;

    // 全クエリメソッドでの一貫したバリデーション動作確認
    it('should validate log levels consistently in all query methods', () => {
      expect(() => mockLogger.getMessages(invalidLevel))
        .toThrow('MockLogger: Invalid log level: 999');
      expect(() => mockLogger.clearMessages(invalidLevel))
        .toThrow('MockLogger: Invalid log level: 999');
      expect(() => mockLogger.hasMessages(invalidLevel))
        .toThrow('MockLogger: Invalid log level: 999');
      expect(() => mockLogger.getMessageCount(invalidLevel))
        .toThrow('MockLogger: Invalid log level: 999');
      expect(() => mockLogger.getLastMessage(invalidLevel))
        .toThrow('MockLogger: Invalid log level: 999');
    });
  });

  // 空状態での安全な操作確認
  it('should handle empty state operations safely', () => {
    const emptyLogger = new MockLogger.buffer();

    expect(emptyLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toBeNull();
    expect(emptyLogger.getTotalMessageCount()).toBe(0);
    expect(emptyLogger.hasAnyMessages()).toBe(false);
    expect(() => emptyLogger.clearAllMessages()).not.toThrow();
  });
});

/**
 * Edge Case Tests - エッジケース・境界値テストスイート
 *
 * @description 特殊な条件や境界値でのMockLogger動作を検証
 * データ整合性、不変性保証、特殊入力処理、並行操作安全性を確認
 *
 * @testCoverage
 * - Data Integrity: データ不変性・参照整合性の保証
 * - Special Input Handling: 特殊入力値（空文字、Unicode、null等）の処理
 * - Boundary Conditions: 境界値・並行操作・空状態での安全性
 */
describe('MockLogger - Edge Case Tests', () => {
  let mockLogger: AgMockBufferLogger;

  // 各テスト前に新しいMockLoggerインスタンスを作成（エッジケース・境界値テスト用）
  beforeEach(() => {
    mockLogger = setupMockLogger();
  });
  type TestNestedData = {
    user: {
      id: number;
      profile: {
        name: string;
      };
    };
  };

  /**
   * Data Integrity - データ整合性・不変性保証
   *
   * @description メッセージデータの不変性と参照整合性を検証
   * 外部からの配列変更に対する内部状態保護、オブジェクト参照の一貫性
   *
   * @testBehaviors
   * - getMessages()返却配列の外部変更に対する内部状態保護
   * - getAllMessages()返却オブジェクトの外部変更に対する保護
   * - AgLogMessageオブジェクトの参照一貫性（同一オブジェクト参照）
   * - 複雑なネストオブジェクトの構造保持
   */
  describe('Data Integrity', () => {
    // データ不変性保護機能確認
    it('should maintain data immutability', () => {
      mockLogger.error('original error');

      // 返された配列を変更しても内部状態は保護される
      const messages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
      messages.push('external modification');
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['original error']);

      // getAllMessagesでも同様
      const allMessages = mockLogger.getAllMessages();
      allMessages.ERROR.push('external modification');
      expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['original error']);
    });

    // AgLogMessageオブジェクトの参照一貫性確認
    it('should return same object references for AgLogMessage objects', () => {
      // Arrange
      const nestedLogMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2023-12-01T10:30:00Z'),
        message: 'Nested object test',
        args: [{ user: { id: 123, profile: { name: 'test' } } }],
      };

      // Act
      mockLogger.info(nestedLogMessage);
      const retrievedMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
      const allMessages = mockLogger.getAllMessages();

      // Assert - should return same object references (JavaScript standard behavior)
      expect(retrievedMessages[0]).toBe(nestedLogMessage);
      expect(allMessages.INFO[0]).toBe(nestedLogMessage);

      // Verify object structure is preserved
      if (typeof retrievedMessages[0] === 'object' && 'args' in retrievedMessages[0]) {
        // retrievedMessages[0]はAgLogMessage型で、args プロパティは readonly unknown[] として定義されているため
        const args = retrievedMessages[0].args;
        const testData = args[0] as TestNestedData;
        expect(testData.user.id).toBe(123);
        expect(testData.user.profile.name).toBe('test');
      }
    });
  });

  /**
   * Special Input Handling - 特殊入力処理機能
   *
   * @description 特殊な入力値に対する堅牢な処理を検証
   * 空文字、大容量文字列、Unicode、null/undefined、数値、オブジェクトなどの特殊ケース
   *
   * @testBehaviors
   * - 空文字列の正常処理
   * - 大量空白文字列の処理
   * - 改行文字を含むマルチライン文字列の処理
   * - Unicode文字（絵文字、日本語、中国語）の処理
   * - undefined/null値の処理
   * - 数値型入力の処理
   * - オブジェクト・配列型入力の処理
   */
  describe('Special Input Handling', () => {
    // 特殊メッセージ型の堅牢な処理確認
    it('should handle special message types', () => {
      const specialCases = [
        '', // 空文字列
        ' '.repeat(1000), // 大量の空白
        'multi\nline\nmessage', // 改行を含む
        'unicode: 🚀 テスト 中文', // Unicode文字
        undefined, // undefined
        null, // null
        123, // 数値
        { object: 'value' }, // オブジェクト
        ['array', 'values'], // 配列
      ];

      specialCases.forEach((testCase, _index) => {
        mockLogger.info(testCase as string);
        const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
        expect(messages).toContain(testCase);
        mockLogger.clearMessages(AG_LOGLEVEL.INFO);
      });
    });
  });

  /**
   * Boundary Conditions - 境界値・並行処理安全性
   *
   * @description 境界条件や並行操作での安全性を検証
   * 連続操作、状態変更の一貫性、空状態でのエラー回避
   *
   * @testBehaviors
   * - 複数操作の連続実行での状態一貫性
   * - メッセージ追加・取得・削除の並行処理安全性
   * - 状態変更中の中間状態の正確性
   * - 空状態でのクリア操作の安全性
   */
  describe('Boundary Conditions', () => {
    // 並行操作での安全性・状態一貫性確認
    it('should handle concurrent operations safely', () => {
      // 複数の操作を連続実行
      mockLogger.error('error1');
      const count1 = mockLogger.getMessageCount(AG_LOGLEVEL.ERROR);
      mockLogger.info('info1');
      const hasError = mockLogger.hasMessages(AG_LOGLEVEL.ERROR);
      mockLogger.clearMessages(AG_LOGLEVEL.ERROR);
      const count2 = mockLogger.getMessageCount(AG_LOGLEVEL.ERROR);

      expect(count1).toBe(1);
      expect(hasError).toBe(true);
      expect(count2).toBe(0);
      expect(mockLogger.hasMessages(AG_LOGLEVEL.INFO)).toBe(true);
    });
  });
});
