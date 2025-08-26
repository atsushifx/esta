import { describe, expect, it } from 'vitest';
import { ErrorSeverity, isValidErrorSeverity } from '../../../shared/types';

describe('ErrorSeverity enum', () => {
  it('should define FATAL severity as fatal string', () => {
    expect(ErrorSeverity.FATAL).toBe('fatal');
  });

  it('should define ERROR severity as error string', () => {
    expect(ErrorSeverity.ERROR).toBe('error');
  });

  it('should define WARNING severity as warning string', () => {
    expect(ErrorSeverity.WARNING).toBe('warning');
  });

  it('should define INFO severity as info string', () => {
    expect(ErrorSeverity.INFO).toBe('info');
  });
});

describe('isValidErrorSeverity type guard', () => {
  it('should return true for valid fatal severity', () => {
    expect(isValidErrorSeverity('fatal')).toBe(true);
  });

  it('should return true for valid error severity', () => {
    expect(isValidErrorSeverity('error')).toBe(true);
  });

  it('should return true for valid warning severity', () => {
    expect(isValidErrorSeverity('warning')).toBe(true);
  });

  it('should return true for valid info severity', () => {
    expect(isValidErrorSeverity('info')).toBe(true);
  });

  it('should return false for invalid string value', () => {
    expect(isValidErrorSeverity('invalid')).toBe(false);
  });

  it('should return false for null value', () => {
    expect(isValidErrorSeverity(null)).toBe(false);
  });

  it('should return false for undefined value', () => {
    expect(isValidErrorSeverity(undefined)).toBe(false);
  });

  it('should return false for numeric value', () => {
    expect(isValidErrorSeverity(123)).toBe(false);
  });
});
