import { MOCK_LOGGER_ERROR_MESSAGES } from '../../shared/constants/errorMessages';
import { AG_LOGLEVEL } from '../../shared/types/LogLevel.types';
import { MockLoggerValidationError } from '../../shared/types/mockLoggerError.types';

import type { AgTLogLevel } from '../../shared/types/LogLevel.types';

const MIN_LOG_LEVEL = AG_LOGLEVEL.OFF;
const MAX_LOG_LEVEL = AG_LOGLEVEL.TRACE;

const createValidationError = (invalidValue: unknown, context: Record<string, unknown>): MockLoggerValidationError => {
  return new MockLoggerValidationError(
    MOCK_LOGGER_ERROR_MESSAGES.VALIDATION.INVALID_LOG_LEVEL,
    { invalidValue, ...context },
  );
};

export const validateLogLevel = (level: AgTLogLevel): void => {
  if (typeof level !== 'number') {
    throw createValidationError(level, { expectedType: 'number' });
  }

  if (level >= MIN_LOG_LEVEL && level <= MAX_LOG_LEVEL) {
    return;
  }

  throw createValidationError(level, {
    expectedRange: `${MIN_LOG_LEVEL}-${MAX_LOG_LEVEL}`,
  });
};
