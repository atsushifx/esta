import { describe, expect, it } from 'vitest';
import {
  ERROR_CATEGORIES,
  MOCK_LOGGER_ERROR_MESSAGES,
  UNKNOWN_ERROR_MESSAGE,
} from '../../../shared/constants/errorMessages';
import type { TErrorCategory, TMessageId } from '../../../shared/constants/errorMessages';
import { getErrorMessage } from '../../utils/errorMessageUtils';

describe('ErrorMessages', () => {
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
