export const MOCK_LOGGER_ERROR_MESSAGES = {
  VALIDATION: {
    INVALID_LOG_LEVEL: 'Invalid log level specified',
  },
  STATE: {
    BUFFER_NOT_FOUND: 'Buffer not found for testId. The logger may have been cleaned up or not properly initialized.',
  },
  RESOURCE: {
    BUFFER_OVERFLOW:
      'Buffer overflow: Maximum buffer size exceeded. This may indicate a test design issue with excessive logging.',
  },
} as const;
