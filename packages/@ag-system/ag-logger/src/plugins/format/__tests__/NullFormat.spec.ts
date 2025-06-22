// src: /src/plugins/format/__tests__/NullFormat.spec.ts
// @(#) : NullFormat プラグインユニットテスト
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
import { NullFormat } from '../NullFormat';

// test main
describe('NullFormat', () => {
  it('引数に関係なく空文字列を返す', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.INFO,
      timestamp: new Date(),
      message: 'test message',
      args: [],
    };
    expect(NullFormat(logMessage)).toBe('');
  });

  it('複数の引数があっても空文字列を返す', () => {
    const logMessage: AgLogMessage = {
      logLevel: AgLogLevelCode.WARN,
      timestamp: new Date(),
      message: 'msg1 msg2',
      args: [123, true, { data: 'test' }],
    };
    expect(NullFormat(logMessage)).toBe('');
  });

  it('全てのログレベルで空文字列を返す', () => {
    const baseMessage: Omit<AgLogMessage, 'logLevel'> = {
      timestamp: new Date(),
      message: 'test',
      args: [],
    };

    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.OFF })).toBe('');
    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.FATAL })).toBe('');
    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.ERROR })).toBe('');
    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.WARN })).toBe('');
    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.INFO })).toBe('');
    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.DEBUG })).toBe('');
    expect(NullFormat({ ...baseMessage, logLevel: AgLogLevelCode.TRACE })).toBe('');
  });
});
