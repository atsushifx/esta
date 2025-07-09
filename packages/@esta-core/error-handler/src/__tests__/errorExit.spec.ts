import { ExitCode } from '@shared/constants/exitCode';
import { describe, expect, it } from 'vitest';
import { ExitError } from '../error/ExitError';
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
