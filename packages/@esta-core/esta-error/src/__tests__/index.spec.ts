// src: src/__tests__/index.spec.ts
// @(#) : Unit tests for package entry point exports
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework - Testing utilities and assertions
import { describe, expect, it } from 'vitest';

describe('Package entry point exports', () => {
  it('should export ErrorSeverity enum from @shared/types', async () => {
    // Dynamic import - Testing package exports to verify module structure
    const { ErrorSeverity } = await import('../../src/index');
    expect(ErrorSeverity).toBeDefined();
    expect(ErrorSeverity.FATAL).toBe('fatal');
    expect(ErrorSeverity.ERROR).toBe('error');
  });

  it('should export EstaError class from @shared/types', async () => {
    // Dynamic import - Testing package exports to verify module structure
    const { EstaError } = await import('../../src/index');
    expect(EstaError).toBeDefined();
    expect(EstaError.prototype.constructor.name).toBe('EstaError');
  });

  it('should export isValidErrorSeverity function from @shared/types', async () => {
    // Dynamic import - Testing package exports to verify module structure
    const { isValidErrorSeverity } = await import('../../src/index');
    expect(isValidErrorSeverity).toBeDefined();
    expect(typeof isValidErrorSeverity).toBe('function');
    expect(isValidErrorSeverity('fatal')).toBe(true);
    expect(isValidErrorSeverity('invalid')).toBe(false);
  });
});
