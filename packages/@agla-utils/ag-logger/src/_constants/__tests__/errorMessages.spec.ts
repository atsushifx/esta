import { describe, expect, it } from 'vitest';
import { MOCK_LOGGER_ERROR_MESSAGES } from '../../../shared/constants/errorMessages';

describe('ErrorMessages', () => {
  describe('MOCK_LOGGER_ERROR_MESSAGES constant', () => {
    it('should have VALIDATION category with INVALID_LOG_LEVEL message', () => {
      expect(MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL).toBeDefined();
      expect(typeof MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL).toBe('string');
    });

    it('should have STATE category with BUFFER_NOT_FOUND message', () => {
      expect(MOCK_LOGGER_ERROR_MESSAGES.STATE.BUFFER_NOT_FOUND).toBeDefined();
      expect(typeof MOCK_LOGGER_ERROR_MESSAGES.STATE.BUFFER_NOT_FOUND).toBe('string');
    });

    it('should have RESOURCE category with BUFFER_OVERFLOW message', () => {
      expect(MOCK_LOGGER_ERROR_MESSAGES.RESOURCE.BUFFER_OVERFLOW).toBeDefined();
      expect(typeof MOCK_LOGGER_ERROR_MESSAGES.RESOURCE.BUFFER_OVERFLOW).toBe('string');
    });
  });
});
