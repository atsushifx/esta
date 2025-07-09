import { ExitCode } from '@shared/constants/exitCode';
import { describe, expect, it } from 'vitest';
import { ExitError } from '../error/ExitError';
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
      expect((error as ExitError).code).toBe(ExitCode.EXEC_FAILURE);
      expect((error as ExitError).message).toBe('test fatal error');
    }
  });

  it('should throw ExitError with fatal=true and custom code', () => {
    try {
      fatalExit('config not found', ExitCode.CONFIG_NOT_FOUND);
    } catch (error) {
      expect(error).toBeInstanceOf(ExitError);
      expect((error as ExitError).isFatal()).toBe(true);
      expect((error as ExitError).code).toBe(ExitCode.CONFIG_NOT_FOUND);
      expect((error as ExitError).message).toBe('config not found');
    }
  });
});
