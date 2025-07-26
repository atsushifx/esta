import { MOCK_LOGGER_ERROR_MESSAGES } from '../../shared/constants/errorMessages';

export const getErrorMessage = (category: keyof typeof MOCK_LOGGER_ERROR_MESSAGES, key: string): string => {
  const messages = MOCK_LOGGER_ERROR_MESSAGES[category];
  return (messages as Record<string, string>)[key] || 'Unknown error';
};
