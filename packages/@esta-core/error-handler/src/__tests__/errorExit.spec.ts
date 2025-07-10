// src: ./__tests__/errorExit.spec.ts
// @(#): errorExit関数のユニットテスト
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants
import { ExitCode } from '@shared/constants/exitCode';
// test framework
import { describe, expect, it } from 'vitest';
// classes
import { ExitError } from '../error/ExitError';
// test target
import { errorExit } from '../errorExit';

describe('errorExit', () => {
  it('should throw ExitError with fatal=false', () => {
    expect(() => {
      errorExit(ExitCode.INVALID_ARGS, 'invalid arguments');
    }).toThrow(ExitError);

    try {
      errorExit(ExitCode.INVALID_ARGS, 'invalid arguments');
    } catch (error) {
      expect(error).toBeInstanceOf(ExitError);
      expect((error as ExitError).isFatal()).toBe(false);
      expect((error as ExitError).code).toBe(ExitCode.INVALID_ARGS);
      expect((error as ExitError).message).toBe('invalid arguments');
    }
  });
});
