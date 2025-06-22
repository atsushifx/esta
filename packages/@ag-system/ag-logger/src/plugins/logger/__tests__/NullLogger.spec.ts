// src: /src/plugins/logger/__tests__/NullLogger.spec.ts
// @(#) : NullLogger プラグインユニットテスト
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it, vi } from 'vitest';

// test unit
import { NullLogger } from '../NullLogger';

// test main
describe('NullLogger', () => {
  it('フォーマット済みメッセージで呼び出しても何もしない', () => {
    const consoleSpy = vi.spyOn(console, 'log');

    NullLogger('formatted message');

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('戻り値はundefinedである', () => {
    const result = NullLogger('any formatted message');
    expect(result).toBeUndefined();
  });

  it('複数回呼び出しても何もしない', () => {
    const consoleSpy = vi.spyOn(console, 'log');

    NullLogger('formatted message 1');
    NullLogger('formatted message 2');

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
