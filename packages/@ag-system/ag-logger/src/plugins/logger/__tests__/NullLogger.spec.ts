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
  it('引数なしで呼び出しても何もしない', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    NullLogger();
    
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('引数ありで呼び出しても何もしない', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    NullLogger('test message', 123, { data: 'test' });
    
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('戻り値はundefinedである', () => {
    const result = NullLogger('any message');
    expect(result).toBeUndefined();
  });

  it('複数回呼び出しても何もしない', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    NullLogger('message 1');
    NullLogger('message 2', 456);
    NullLogger();
    
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});