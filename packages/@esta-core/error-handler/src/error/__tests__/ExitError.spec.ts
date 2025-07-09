import { ExitCode } from '@shared/constants/exitCode';
import { describe, expect, it } from 'vitest';
import { ExitError } from '../ExitError';

describe('ExitError', () => {
  it('should extend Error class', () => {
    const error = new ExitError(ExitCode.EXEC_FAILURE, 'test message');
    expect(error).toBeInstanceOf(Error);
  });

  it('should have code property with correct value', () => {
    const error = new ExitError(ExitCode.CONFIG_NOT_FOUND, 'test message');
    expect(error.code).toBe(ExitCode.CONFIG_NOT_FOUND);
  });

  it('should have isFatal method that returns false by default', () => {
    const error = new ExitError(ExitCode.EXEC_FAILURE, 'test message');
    expect(error.isFatal()).toBe(false);
  });

  it('should have isFatal method that returns true when fatal=true', () => {
    const error = new ExitError(ExitCode.EXEC_FAILURE, 'test message', true);
    expect(error.isFatal()).toBe(true);
  });
});
