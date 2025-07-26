import { MOCK_LOGGER_ERROR_MESSAGES } from '../constants/errorMessages';
import { AglaError } from './error.types';

export type ErrorCategory = keyof typeof MOCK_LOGGER_ERROR_MESSAGES;
export type ErrorKey<T extends ErrorCategory> = keyof typeof MOCK_LOGGER_ERROR_MESSAGES[T];

export class MockLoggerError extends AglaError {
  public readonly category: ErrorCategory;

  constructor(
    category: ErrorCategory,
    messageKey: string,
    context?: Record<string, unknown>,
  ) {
    const message = (MOCK_LOGGER_ERROR_MESSAGES[category] as Record<string, string>)[messageKey] || 'Unknown error';
    super(`${category}_ERROR`, message, context);
    this.category = category;
  }
}

export class MockLoggerValidationError extends AglaError {
  constructor(
    message: string,
    context?: Record<string, unknown>,
  ) {
    super('VALIDATION_ERROR', message, context);
  }
}
