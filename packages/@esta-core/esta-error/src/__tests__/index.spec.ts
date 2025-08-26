import { describe, expect, it } from 'vitest';

describe('Package entry point exports', () => {
  it('should export ErrorSeverity enum from @shared/types', async () => {
    const { ErrorSeverity } = await import('../../src/index');
    expect(ErrorSeverity).toBeDefined();
    expect(ErrorSeverity.FATAL).toBe('fatal');
    expect(ErrorSeverity.ERROR).toBe('error');
  });

  it('should export EstaError class from @shared/types', async () => {
    const { EstaError } = await import('../../src/index');
    expect(EstaError).toBeDefined();
    expect(EstaError.prototype.constructor.name).toBe('EstaError');
  });

  it('should export isValidErrorSeverity function from @shared/types', async () => {
    const { isValidErrorSeverity } = await import('../../src/index');
    expect(isValidErrorSeverity).toBeDefined();
    expect(typeof isValidErrorSeverity).toBe('function');
    expect(isValidErrorSeverity('fatal')).toBe(true);
    expect(isValidErrorSeverity('invalid')).toBe(false);
  });
});
