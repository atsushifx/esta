// src: /src/plugins/format/__tests__/PlainFormat.spec.ts
// @(#) : PlainFormat プラグインユニットテスト
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// constants
import { AgLogLevelCode } from '@shared/types';
import type { AgLogMessage } from '@shared/types';

// test unit
import { PlainFormat } from '../PlainFormat';

// test main
describe('PlainFormat', () => {
  it('基本的なメッセージをフォーマットする', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.INFO,
      timestamp: new Date('2025-01-01T12:00:00.000Z'),
      message: 'テストメッセージ',
      args: [],
    };

    const result = PlainFormat(logMessage);
    expect(result).toBe('2025-01-01T12:00:00Z [INFO] テストメッセージ');
  });

  it('引数付きのメッセージをフォーマットする', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.ERROR,
      timestamp: new Date('2025-06-22T15:30:45.123Z'),
      message: 'エラーが発生しました',
      args: [{ userId: 123, action: 'login' }],
    };

    const result = PlainFormat(logMessage);
    expect(result).toBe('2025-06-22T15:30:45Z [ERROR] エラーが発生しました {"userId":123,"action":"login"}');
  });

  it('複数の引数をJSONとして処理する', () => {
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

    const result = PlainFormat(logMessage);
    expect(result).toBe('2025-03-15T09:15:30Z [DEBUG] デバッグ情報 {"name":"John Doe"} {"age":30} ["item1","item2"]');
  });

  it('全てのログレベルで正しくフォーマットする', () => {
    const baseMessage: Omit<AgLogMessage, 'logLevel'> = {
      timestamp: new Date('2025-01-01T00:00:00.000Z'),
      message: 'テスト',
      args: [],
    };

    expect(PlainFormat({ ...baseMessage, logLevel: AgLogLevelCode.FATAL }))
      .toBe('2025-01-01T00:00:00Z [FATAL] テスト');
    expect(PlainFormat({ ...baseMessage, logLevel: AgLogLevelCode.ERROR }))
      .toBe('2025-01-01T00:00:00Z [ERROR] テスト');
    expect(PlainFormat({ ...baseMessage, logLevel: AgLogLevelCode.WARN }))
      .toBe('2025-01-01T00:00:00Z [WARN] テスト');
    expect(PlainFormat({ ...baseMessage, logLevel: AgLogLevelCode.INFO }))
      .toBe('2025-01-01T00:00:00Z [INFO] テスト');
    expect(PlainFormat({ ...baseMessage, logLevel: AgLogLevelCode.DEBUG }))
      .toBe('2025-01-01T00:00:00Z [DEBUG] テスト');
    expect(PlainFormat({ ...baseMessage, logLevel: AgLogLevelCode.TRACE }))
      .toBe('2025-01-01T00:00:00Z [TRACE] テスト');
  });

  it('空のメッセージでも正しくフォーマットする', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.WARN,
      timestamp: new Date('2025-12-31T23:59:59.999Z'),
      message: '',
      args: [{ warning: 'empty message' }],
    };

    const result = PlainFormat(logMessage);
    expect(result).toBe('2025-12-31T23:59:59Z [WARN]  {"warning":"empty message"}');
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

    expect(() => PlainFormat(logMessage)).toThrow();
  });
});
