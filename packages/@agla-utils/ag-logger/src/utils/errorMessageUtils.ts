import {
  MESSAGE_IDS,
  MOCK_LOGGER_ERROR_MESSAGES,
  type TErrorCategory,
  type TMessageId,
  UNKNOWN_ERROR_MESSAGE,
} from '../../shared/constants/errorMessages';

export const getErrorMessage = (
  category: TErrorCategory,
  messageId: TMessageId,
): string => {
  if (!MESSAGE_IDS.includes(messageId)) {
    return UNKNOWN_ERROR_MESSAGE;
  }

  const categoryMessages = MOCK_LOGGER_ERROR_MESSAGES[category];
  if (!categoryMessages || !(messageId in categoryMessages)) {
    return UNKNOWN_ERROR_MESSAGE;
  }

  return categoryMessages[messageId as keyof typeof categoryMessages] as string;
};
