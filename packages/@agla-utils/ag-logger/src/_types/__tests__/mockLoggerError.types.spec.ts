import { describe, expect, it } from 'vitest';
import { AglaError } from '../../../shared/types/error.types';
import {
  MockLoggerError,
  MockLoggerResourceError,
  MockLoggerStateError,
  MockLoggerValidationError,
} from '../../../shared/types/mockLoggerError.types';

describe('MockLoggerError base class', () => {
  it('should inherit from AglaError properly', () => {
    class TestMockLoggerError extends MockLoggerError {
      constructor(message: string, context?: Record<string, unknown>) {
        super('TEST_CODE', message, context);
      }
    }

    const error = new TestMockLoggerError('Test message');
    expect(error).toBeInstanceOf(AglaError);
  });
});

describe('MockLoggerValidationError', () => {
  it('should inherit from MockLoggerError properly', () => {
    const error = new MockLoggerValidationError('Test message');
    expect(error).toBeInstanceOf(MockLoggerError);
  });
});

describe('MockLoggerStateError', () => {
  it('should inherit from MockLoggerError properly', () => {
    const error = new MockLoggerStateError('Test message');
    expect(error).toBeInstanceOf(MockLoggerError);
  });
});

describe('MockLoggerResourceError', () => {
  it('should inherit from MockLoggerError properly', () => {
    const error = new MockLoggerResourceError('Test message');
    expect(error).toBeInstanceOf(MockLoggerError);
  });
});
