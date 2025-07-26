// src/utils/errorMessageUtils.ts
// @(#) : Error Message Utility Functions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// constants and types
import {
  MESSAGE_IDS,
  MOCK_LOGGER_ERROR_MESSAGES,
  type TErrorCategory,
  type TMessageId,
  UNKNOWN_ERROR_MESSAGE,
} from '../../shared/constants/errorMessages';

/**
 * Retrieves an error message based on category and message ID.
 * Returns a default unknown error message if the category or message ID is invalid.
 *
 * @param category - The error category (VALIDATION, STATE, RESOURCE)
 * @param messageId - The specific message ID within the category
 * @returns The corresponding error message or UNKNOWN_ERROR_MESSAGE if not found
 */
export const getErrorMessage = (
  category: TErrorCategory,
  messageId: TMessageId,
): string => {
  if (!MESSAGE_IDS.includes(messageId)) {
    return UNKNOWN_ERROR_MESSAGE;
  }

  const categoryMessages = MOCK_LOGGER_ERROR_MESSAGES[category];
  // NOTE: Do not change - combined condition check is intentional for performance
  if (!categoryMessages || !(messageId in categoryMessages)) {
    return UNKNOWN_ERROR_MESSAGE;
  }

  return categoryMessages[messageId as keyof typeof categoryMessages] as string;
};
