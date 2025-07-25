// src: ./error/__tests__/ExitError.spec.ts
// @(#): ExitErrorクラスのユニットテスチE//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants
import { EXIT_CODE } from '@shared/constants';
// test framework
import { describe, expect, it } from 'vitest';
// test target
import { ExitError } from '../ExitError';

describe('ExitError', () => {
  it('should extend Error class', () => {
    const error = new ExitError(EXIT_CODE.EXEC_FAILURE, 'test message');
    expect(error).toBeInstanceOf(Error);
  });

  it('should have code property with correct value', () => {
    const error = new ExitError(EXIT_CODE.CONFIG_ERROR, 'test message');
    expect(error.code).toBe(EXIT_CODE.CONFIG_ERROR);
  });

  it('should have isFatal method that returns false by default', () => {
    const error = new ExitError(EXIT_CODE.EXEC_FAILURE, 'test message');
    expect(error.isFatal()).toBe(false);
  });

  it('should have isFatal method that returns true when fatal=true', () => {
    const error = new ExitError(EXIT_CODE.EXEC_FAILURE, 'test message', true);
    expect(error.isFatal()).toBe(true);
  });
});
