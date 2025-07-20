// src/__tests__/logLevel.spec.ts
// @(#) : Tests for log level conversion utilities
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { LogLevelSymbolMap } from '../logLevel';

describe('LogLevelSymbolMap', () => {
  it('should be an object', () => {
    expect(typeof LogLevelSymbolMap).toBe('object');
  });

  it("should map 'INFO' to 4", () => {
    expect(LogLevelSymbolMap.INFO).toBe(4);
  });

  it("should map 'DEBUG' to 5", () => {
    expect(LogLevelSymbolMap.DEBUG).toBe(5);
  });

  it("should map 'WARN' to 3", () => {
    expect(LogLevelSymbolMap.WARN).toBe(3);
  });

  it("should map 'ERROR' to 2", () => {
    expect(LogLevelSymbolMap.ERROR).toBe(2);
  });

  it("should map 'FATAL' to 1", () => {
    expect(LogLevelSymbolMap.FATAL).toBe(1);
  });

  it("should map 'TRACE' to 6", () => {
    expect(LogLevelSymbolMap.TRACE).toBe(6);
  });

  it("should map 'OFF' to 0", () => {
    expect(LogLevelSymbolMap.OFF).toBe(0);
  });
});
