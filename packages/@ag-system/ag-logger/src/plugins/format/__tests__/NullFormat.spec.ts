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

// test unit
import { NullFormat } from '../NullFormat';

// test main
describe('NullFormat', () => {
  it('引数に関係なく空文字列を返す', () => {
    expect(NullFormat(AgLogLevelCode.INFO)).toBe('');
    expect(NullFormat(AgLogLevelCode.ERROR, 'test message')).toBe('');
    expect(NullFormat(AgLogLevelCode.DEBUG, 'user:', { name: 'John' })).toBe('');
  });

  it('複数の引数でも空文字列を返す', () => {
    expect(NullFormat(AgLogLevelCode.WARN, 'msg1', 'msg2', 123, true, { data: 'test' })).toBe('');
  });

  it('全てのログレベルで空文字列を返す', () => {
    expect(NullFormat(AgLogLevelCode.OFF)).toBe('');
    expect(NullFormat(AgLogLevelCode.FATAL)).toBe('');
    expect(NullFormat(AgLogLevelCode.ERROR)).toBe('');
    expect(NullFormat(AgLogLevelCode.WARN)).toBe('');
    expect(NullFormat(AgLogLevelCode.INFO)).toBe('');
    expect(NullFormat(AgLogLevelCode.DEBUG)).toBe('');
    expect(NullFormat(AgLogLevelCode.TRACE)).toBe('');
  });
});