// src: ./__tests__/errorExit.spec.ts
// @(#): errorExit関数のユニットテスチE//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants
import { EXIT_CODE } from '@shared/constants';
// test framework
import { describe, expect, it } from 'vitest';
// classes
import { ExitError } from '../error/ExitError';
// test target
import { errorExit } from '../errorExit';

describe('errorExit', () => {
  it('should throw ExitError with fatal=false', () => {
    expect(() => {
      errorExit(EXIT_CODE.INVALID_ARGS, 'invalid arguments');
    }).toThrow(ExitError);

    try {
      errorExit(EXIT_CODE.INVALID_ARGS, 'invalid arguments');
    } catch (error) {
      expect(error).toBeInstanceOf(ExitError);
      expect((error as ExitError).isFatal()).toBe(false);
      expect((error as ExitError).code).toBe(EXIT_CODE.INVALID_ARGS);
      expect((error as ExitError).message).toBe('invalid arguments');
    }
  });
});
