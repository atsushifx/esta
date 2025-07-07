// src/plugins/logger/__tests__/NullLogger.spec.ts
// @(#) : Unit tests for NullLogger plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest imports
import { describe, expect, it, vi } from 'vitest';

// import test target
import { NullLogger } from '../NullLogger';

// test main
describe('NullLogger', () => {
  /**
   * Tests that calling NullLogger with a formatted message performs no operation.
   */
  it('does nothing when called with a formatted message', () => {
    const consoleSpy = vi.spyOn(console, 'log');

    NullLogger('formatted message');

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  /**
   * Tests that the return value of NullLogger is undefined.
   */
  it('returns undefined', () => {
    const result = NullLogger('any formatted message');
    expect(result).toBeUndefined();
  });

  /**
   * Tests that multiple calls to NullLogger do not trigger any console output.
   */
  it('does nothing when called multiple times', () => {
    const consoleSpy = vi.spyOn(console, 'log');

    NullLogger('formatted message 1');
    NullLogger('formatted message 2');

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
