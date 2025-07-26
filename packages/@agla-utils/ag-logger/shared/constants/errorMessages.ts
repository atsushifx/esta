export const ERROR_CATEGORIES = {
  VALIDATION: 'VALIDATION',
  STATE: 'STATE',
  RESOURCE: 'RESOURCE',
} as const;

export const MOCK_LOGGER_ERROR_MESSAGES = {
  [ERROR_CATEGORIES.VALIDATION]: {
    INVALID_LOG_LEVEL: 'Invalid log level specified',
    INVALID_MESSAGE_TYPE: 'Message must be a string',
    INVALID_TESTID_TYPE: 'testId must be a non-empty string',
    INVALID_TESTID_LENGTH: 'testId must be 255 characters or less',
  },
  [ERROR_CATEGORIES.STATE]: {
    BUFFER_NOT_FOUND: 'Buffer not found for testId. The logger may have been cleaned up or not properly initialized.',
  },
  [ERROR_CATEGORIES.RESOURCE]: {
    BUFFER_OVERFLOW:
      'Buffer overflow: Maximum buffer size exceeded. This may indicate a test design issue with excessive logging.',
  },
} as const;
