import { describe, expect, it } from 'vitest';
import { ERROR_CATEGORIES } from '../../../shared/constants/errorMessages';
import { MockLoggerError } from '../../../shared/types/mockLoggerError.types';

describe('MockLoggerError', () => {
  describe('when creating VALIDATION error', () => {
    it('should create error with INVALID_LOG_LEVEL message using constant', () => {
      const error = new MockLoggerError(ERROR_CATEGORIES.VALIDATION, 'INVALID_LOG_LEVEL');
      expect(error.message).toBe('Invalid log level specified');
      expect(error.errorType).toBe('VALIDATION_ERROR');
      expect(error.category).toBe(ERROR_CATEGORIES.VALIDATION);
    });
  });
});
