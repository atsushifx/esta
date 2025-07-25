import { describe, expect, it } from 'vitest';
import {
  ERROR_CATEGORIES,
  MOCK_LOGGER_ERROR_MESSAGES,
  UNKNOWN_ERROR_MESSAGE,
} from '../../../shared/constants/errorMessages';
import type { TErrorCategory, TMessageId } from '../../../shared/constants/errorMessages';
import { getErrorMessage } from '../../utils/errorMessageUtils';

describe('ErrorMessages', () => {
  describe('MOCK_LOGGER_ERROR_MESSAGES constant', () => {
    it('should have VALIDATION category with INVALID_LOG_LEVEL message', () => {
      expect(MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL).toBeDefined();
      expect(typeof MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL).toBe('string');
    });

    it('should have VALIDATION category with INVALID_MESSAGE_TYPE message', () => {
      expect(MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_MESSAGE_TYPE).toBeDefined();
      expect(typeof MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_MESSAGE_TYPE).toBe('string');
    });

    it('should have VALIDATION category with INVALID_TESTID_TYPE message', () => {
      expect(MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_TESTID_TYPE).toBeDefined();
      expect(typeof MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_TESTID_TYPE).toBe('string');
    });

    it('should have VALIDATION category with INVALID_TESTID_LENGTH message', () => {
      expect(MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_TESTID_LENGTH).toBeDefined();
      expect(typeof MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_TESTID_LENGTH).toBe('string');
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

  describe('getErrorMessage helper function', () => {
    it('should return correct message for existing key using constant', () => {
      const message = getErrorMessage(ERROR_CATEGORIES.VALIDATION, 'INVALID_LOG_LEVEL');
      expect(message).toBe(MOCK_LOGGER_ERROR_MESSAGES[ERROR_CATEGORIES.VALIDATION].INVALID_LOG_LEVEL);
    });

    it('should return default message for non-existing key', () => {
      const message = getErrorMessage(ERROR_CATEGORIES.VALIDATION, 'NON_EXISTING_KEY' as TMessageId);
      expect(message).toBe(UNKNOWN_ERROR_MESSAGE);
    });

    it('should return default message for non-existing category', () => {
      const message = getErrorMessage('NON_EXISTING_CATEGORY' as TErrorCategory, 'INVALID_LOG_LEVEL');
      expect(message).toBe(UNKNOWN_ERROR_MESSAGE);
    });
  });
});
