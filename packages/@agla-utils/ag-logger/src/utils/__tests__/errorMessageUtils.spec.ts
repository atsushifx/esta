import { describe, expect, it } from 'vitest';
import { UNKNOWN_ERROR_MESSAGE } from '../../../shared/constants/errorMessages';
import type { TMessageId } from '../../../shared/constants/errorMessages';
import { getErrorMessage } from '../errorMessageUtils';

describe('getErrorMessage helper function', () => {
  it('should return correct message for existing key', () => {
    const message = getErrorMessage('VALIDATION', 'INVALID_LOG_LEVEL');
    expect(message).toBe('Invalid log level specified');
  });

  it('should return default message for non-existing key', () => {
    const message = getErrorMessage('VALIDATION', 'NON_EXISTING_KEY' as TMessageId);
    expect(message).toBe(UNKNOWN_ERROR_MESSAGE);
  });
});
