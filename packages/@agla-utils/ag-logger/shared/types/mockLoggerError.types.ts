import { AglaError } from './error.types';

export abstract class MockLoggerError extends AglaError {
  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(code, message, context);
  }
}

export class MockLoggerValidationError extends MockLoggerError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, context);
  }
}

export class MockLoggerStateError extends MockLoggerError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('STATE_ERROR', message, context);
  }
}

export class MockLoggerResourceError extends MockLoggerError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('RESOURCE_ERROR', message, context);
  }
}
