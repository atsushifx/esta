// src: ./__tests__/fatalExit.spec.ts
// @(#): fatalExit関数のユニットテスチE//
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
import { fatalExit } from '../fatalExit';

describe('fatalExit', () => {
  it('should throw ExitError with fatal=true and default code', () => {
    expect(() => {
      fatalExit('test fatal error');
    }).toThrow(ExitError);

    try {
      fatalExit('test fatal error');
    } catch (error) {
      expect(error).toBeInstanceOf(ExitError);
      expect((error as ExitError).isFatal()).toBe(true);
      expect((error as ExitError).code).toBe(EXIT_CODE.EXEC_FAILURE);
      expect((error as ExitError).message).toBe('test fatal error');
    }
  });

  it('should throw ExitError with fatal=true and custom code', () => {
    try {
      fatalExit('config not found', EXIT_CODE.CONFIG_ERROR);
    } catch (error) {
      expect(error).toBeInstanceOf(ExitError);
      expect((error as ExitError).isFatal()).toBe(true);
      expect((error as ExitError).code).toBe(EXIT_CODE.CONFIG_ERROR);
      expect((error as ExitError).message).toBe('config not found');
    }
  });
});
