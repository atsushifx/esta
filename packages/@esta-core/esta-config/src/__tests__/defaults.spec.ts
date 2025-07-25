// src/defaults.spec.ts
// @(#) : Tests for defaultEstaConfig function
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { defaultEstaConfig } from '../defaults';
import { LogLevelSymbolMap } from '../logLevel';

describe('defaultEstaConfig', () => {
  it('should be a function', () => {
    expect(typeof defaultEstaConfig).toBe('function');
  });

  it('should return an object with toolsConfigPath property', () => {
    const config = defaultEstaConfig();
    expect(config).toHaveProperty('toolsConfigPath');
    expect(typeof config.toolsConfigPath).toBe('string');
  });

  it('should return an object with logLevel property', () => {
    const config = defaultEstaConfig();
    expect(config).toHaveProperty('logLevel');
    expect(typeof config.logLevel).toBe('number');
    expect(config.logLevel).toBeGreaterThanOrEqual(0);
    expect(config.logLevel).toBeLessThanOrEqual(6);
  });

  it('should return logLevel as INFO by default', () => {
    const config = defaultEstaConfig();
    expect(config.logLevel).toBe(LogLevelSymbolMap.INFO);
  });
});
