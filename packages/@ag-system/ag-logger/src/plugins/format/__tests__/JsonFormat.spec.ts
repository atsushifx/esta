// src: /src/plugins/format/__tests__/JsonFormat.spec.ts
// @(#) : JsonFormat プラグインユニットテスト
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// constants
import { AgLogLevelCode } from '@shared/types';
// type
import type { AgLogMessage } from '@shared/types';

// test unit
import { JsonFormat } from '../JsonFormat';

// test main
describe('JsonFormat', () => {
  it('基本的なメッセージをJSONフォーマットする', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.INFO,
      timestamp: new Date('2025-01-01T12:00:00.000Z'),
      message: 'テストメッセージ',
      args: [],
    };

    const result = JsonFormat(logMessage);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2025-01-01T12:00:00.000Z');
    expect(parsed.level).toBe('INFO');
    expect(parsed.message).toBe('テストメッセージ');
    expect(parsed.args).toBeUndefined();
  });

  it('引数付きのメッセージをJSONフォーマットする', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.ERROR,
      timestamp: new Date('2025-06-22T15:30:45.123Z'),
      message: 'エラーが発生しました',
      args: [{ userId: 123, action: 'login' }],
    };

    const result = JsonFormat(logMessage);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2025-06-22T15:30:45.123Z');
    expect(parsed.level).toBe('ERROR');
    expect(parsed.message).toBe('エラーが発生しました');
    expect(parsed.args).toEqual([{ userId: 123, action: 'login' }]);
  });

  it('複数の引数をJSON配列として処理する', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.DEBUG,
      timestamp: new Date('2025-03-15T09:15:30.500Z'),
      message: 'デバッグ情報',
      args: [
        { name: 'John Doe' },
        { age: 30 },
        ['item1', 'item2'],
      ],
    };

    const result = JsonFormat(logMessage);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2025-03-15T09:15:30.500Z');
    expect(parsed.level).toBe('DEBUG');
    expect(parsed.message).toBe('デバッグ情報');
    expect(parsed.args).toEqual([
      { name: 'John Doe' },
      { age: 30 },
      ['item1', 'item2'],
    ]);
  });

  it('全てのログレベルで正しくJSONフォーマットする', () => {
    const baseMessage: Omit<AgLogMessage, 'logLevel'> = {
      timestamp: new Date('2025-01-01T00:00:00.000Z'),
      message: 'テスト',
      args: [],
    };

    const testCases = [
      { level: AgLogLevelCode.FATAL, expected: 'FATAL' },
      { level: AgLogLevelCode.ERROR, expected: 'ERROR' },
      { level: AgLogLevelCode.WARN, expected: 'WARN' },
      { level: AgLogLevelCode.INFO, expected: 'INFO' },
      { level: AgLogLevelCode.DEBUG, expected: 'DEBUG' },
      { level: AgLogLevelCode.TRACE, expected: 'TRACE' },
    ];

    testCases.forEach(({ level, expected }) => {
      const result = JsonFormat({ ...baseMessage, logLevel: level });
      const parsed = JSON.parse(result);
      expect(parsed.level).toBe(expected);
    });
  });

  it('空のメッセージでも正しくJSONフォーマットする', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.WARN,
      timestamp: new Date('2025-12-31T23:59:59.999Z'),
      message: '',
      args: [{ warning: 'empty message' }],
    };

    const result = JsonFormat(logMessage);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2025-12-31T23:59:59.999Z');
    expect(parsed.level).toBe('WARN');
    expect(parsed.message).toBe('');
    expect(parsed.args).toEqual([{ warning: 'empty message' }]);
  });

  it('JSON.stringify できないオブジェクトも処理する', () => {
    const circularObj: { name: string; self?: unknown } = { name: 'test' };
    circularObj.self = circularObj;

    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.INFO,
      timestamp: new Date('2025-01-01T12:00:00.000Z'),
      message: 'circular reference test',
      args: [circularObj],
    };

    expect(() => JsonFormat(logMessage)).toThrow();
  });

  it('有効なJSONオブジェクトとして出力される', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.INFO,
      timestamp: new Date('2025-01-01T12:00:00.000Z'),
      message: 'テスト',
      args: [{ key: 'value' }],
    };

    const result = JsonFormat(logMessage);

    // JSONとして解析可能であることを確認
    expect(() => JSON.parse(result)).not.toThrow();

    // 改行がないことを確認（一行のJSONであること）
    expect(result).not.toContain('\n');
  });
});
