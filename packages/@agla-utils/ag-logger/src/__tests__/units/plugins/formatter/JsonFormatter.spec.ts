// src: /src/plugins/format/__tests__/JsonFormatter.spec.ts
// @(#) : JUnit tests for JsonFormatter plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行とアサーション機能を提供
import { describe, expect, it } from 'vitest';

// ログレベル定数 - テストで使用するログレベル定義
import { AG_LOGLEVEL } from '../../../../../shared/types';
// 型定義 - ログメッセージの構造を定義する型
import type { AgLogMessage } from '../../../../../shared/types/AgLogger.types';

// テスト対象 - JSON形式フォーマッタープラグインの実装
import { JsonFormatter } from '../../../../plugins/formatter/JsonFormatter';

// test main

/**
 * JsonFormatterプラグインのユニットテストスイート
 *
 * @description JSON形式でのログメッセージフォーマット機能を検証する
 * 基本メッセージのJSON化、複数引数処理、全ログレベル対応、
 * エラーハンドリング、出力の妥当性をテスト
 *
 * @testType Unit Test
 * @testTarget JsonFormatter Plugin
 * @coverage
 * - 基本ログメッセージのJSON構造化
 * - 引数・配列・オブジェクトの適切なシリアライゼーション
 * - 全ログレベルでの正確なレベル表示
 * - タイムスタンプの正確な形式
 * - 循環参照でのエラー処理
 * - 有効なJSON文字列の出力保証
 */
describe('JsonFormatter', () => {
  /**
   * Tests basic message formatting into JSON.
   */
  it('formats a basic log message as JSON', () => {
    const logMessage: AgLogMessage = {
      logLevel: AG_LOGLEVEL.INFO,
      timestamp: new Date('2025-01-01T12:00:00.000Z'),
      message: 'Test message',
      args: [],
    };

    const result = JsonFormatter(logMessage);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2025-01-01T12:00:00.000Z');
    expect(parsed.level).toBe('INFO');
    expect(parsed.message).toBe('Test message');
    expect(parsed.args).toBeUndefined();
  });

  /**
   * Tests formatting of a message with additional arguments.
   */
  it('formats a log message with arguments as JSON', () => {
    const logMessage: AgLogMessage = {
      logLevel: AG_LOGLEVEL.ERROR,
      timestamp: new Date('2025-06-22T15:30:45.123Z'),
      message: 'An error occurred',
      args: [{ userId: 123, action: 'login' }],
    };

    const result = JsonFormatter(logMessage);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2025-06-22T15:30:45.123Z');
    expect(parsed.level).toBe('ERROR');
    expect(parsed.message).toBe('An error occurred');
    expect(parsed.args).toEqual([{ userId: 123, action: 'login' }]);
  });

  /**
   * Tests formatting of multiple arguments as a JSON array.
   */
  it('formats multiple arguments as a JSON array', () => {
    const logMessage: AgLogMessage = {
      logLevel: AG_LOGLEVEL.DEBUG,
      timestamp: new Date('2025-03-15T09:15:30.500Z'),
      message: 'Debug info',
      args: [
        { name: 'John Doe' },
        { age: 30 },
        ['item1', 'item2'],
      ],
    };

    const result = JsonFormatter(logMessage);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2025-03-15T09:15:30.500Z');
    expect(parsed.level).toBe('DEBUG');
    expect(parsed.message).toBe('Debug info');
    expect(parsed.args).toEqual([
      { name: 'John Doe' },
      { age: 30 },
      ['item1', 'item2'],
    ]);
  });

  /**
   * Tests correct JSON formatting for all log levels.
   */
  it('formats correctly for all log levels', () => {
    const baseMessage: Omit<AgLogMessage, 'logLevel'> = {
      timestamp: new Date('2025-01-01T00:00:00.000Z'),
      message: 'Test',
      args: [],
    };

    const testCases = [
      { level: AG_LOGLEVEL.FATAL, expected: 'FATAL' },
      { level: AG_LOGLEVEL.ERROR, expected: 'ERROR' },
      { level: AG_LOGLEVEL.WARN, expected: 'WARN' },
      { level: AG_LOGLEVEL.INFO, expected: 'INFO' },
      { level: AG_LOGLEVEL.DEBUG, expected: 'DEBUG' },
      { level: AG_LOGLEVEL.TRACE, expected: 'TRACE' },
    ];

    testCases.forEach(({ level, expected }) => {
      const result = JsonFormatter({ ...baseMessage, logLevel: level });
      const parsed = JSON.parse(result);
      expect(parsed.level).toBe(expected);
    });
  });

  /**
   * Tests LOG level formatting without level field.
   */
  it('formats LOG level without level field', () => {
    const logMessage: AgLogMessage = {
      logLevel: AG_LOGLEVEL.LOG,
      timestamp: new Date('2025-01-01T12:00:00.000Z'),
      message: 'Force output message',
      args: [],
    };

    const result = JsonFormatter(logMessage);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2025-01-01T12:00:00.000Z');
    expect(parsed.level).toBeUndefined();
    expect(parsed.message).toBe('Force output message');
    expect(parsed.args).toBeUndefined();
  });

  /**
   * Tests JSON formatting with an empty message string.
   */
  it('formats correctly even with an empty message', () => {
    const logMessage: AgLogMessage = {
      logLevel: AG_LOGLEVEL.WARN,
      timestamp: new Date('2025-12-31T23:59:59.999Z'),
      message: '',
      args: [{ warning: 'empty message' }],
    };

    const result = JsonFormatter(logMessage);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2025-12-31T23:59:59.999Z');
    expect(parsed.level).toBe('WARN');
    expect(parsed.message).toBe('');
    expect(parsed.args).toEqual([{ warning: 'empty message' }]);
  });

  /**
   * Tests that circular references throw during JSON.stringify.
   */
  it('throws when JSON.stringify cannot serialize circular objects', () => {
    const circularObj: { name: string; self?: unknown } = { name: 'test' };
    circularObj.self = circularObj;

    const logMessage: AgLogMessage = {
      logLevel: AG_LOGLEVEL.INFO,
      timestamp: new Date('2025-01-01T12:00:00.000Z'),
      message: 'circular reference test',
      args: [circularObj],
    };

    expect(() => JsonFormatter(logMessage)).toThrow('Converting circular structure to JSON');
  });

  /**
   * Tests that the output is a valid JSON string without line breaks.
   */
  it('outputs valid JSON string without newlines', () => {
    const logMessage: AgLogMessage = {
      logLevel: AG_LOGLEVEL.INFO,
      timestamp: new Date('2025-01-01T12:00:00.000Z'),
      message: 'Test',
      args: [{ key: 'value' }],
    };

    const result = JsonFormatter(logMessage);

    // Verify that output is valid JSON
    expect(() => JSON.parse(result)).not.toThrow();

    // Verify output is single-line JSON string
    expect(result).not.toContain('\n');
  });
});
