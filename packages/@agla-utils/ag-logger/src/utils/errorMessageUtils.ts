import { MOCK_LOGGER_ERROR_MESSAGES } from '../../shared/constants/errorMessages';

type ErrorCategory = keyof typeof MOCK_LOGGER_ERROR_MESSAGES;

export const getErrorMessage = (category: ErrorCategory, key: string): string => {
  if (!(category in MOCK_LOGGER_ERROR_MESSAGES)) {
    return 'Unknown error';
  }
  const messages = MOCK_LOGGER_ERROR_MESSAGES[category];
  return (messages as Record<string, string>)[key] || 'Unknown error';
};
