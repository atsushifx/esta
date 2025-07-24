import { beforeEach, describe, expect, it, vi } from 'vitest';

// モックを事前に設定
vi.mock('@esta-error/error-handler', () => ({
  fatalExit: vi.fn(() => {
    throw new Error('Fatal exit called');
  }),
}));

vi.mock('@shared/constants', () => ({
  ExitCode: {
    EXEC_FAILURE: 1,
  },
}));

import { fatalExit } from '@esta-error/error-handler';
import { ErrorResultFactory } from '../handlers/ErrorResultFactory';

describe('ErrorResultFactory', () => {
  let factory: ErrorResultFactory;

  beforeEach(() => {
    factory = new ErrorResultFactory();
    vi.clearAllMocks();
  });

  describe('error method', () => {
    it('should create recoverable error', () => {
      const error = factory.error('TEST_ERROR', 'Test message');

      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.recoverable).toBe(true);
    });

    it('should create error with context', () => {
      const context = { userId: 123 };
      const error = factory.error('TEST_ERROR', 'Test message', context);

      expect(error.context).toEqual(context);
    });
  });

  describe('fatal method', () => {
    it('should call fatalExit with correct parameters', () => {
      expect(() => {
        factory.fatal('FATAL_ERROR', 'Fatal message');
      }).toThrow('Fatal exit called');

      expect(fatalExit).toHaveBeenCalledWith(1, 'Fatal message');
    });
  });
});
