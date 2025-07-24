import { beforeEach, describe, expect, it, vi } from 'vitest';

// モックを事前に設定
vi.mock('@esta-core/error-handler', () => ({
  fatalExit: vi.fn(() => {
    throw new Error('Fatal exit called');
  }),
}));

vi.mock('@shared/constants', () => ({
  ExitCode: {
    EXEC_FAILURE: 1,
  },
}));

import { fatalExit } from '@esta-core/error-handler';
import { ERROR_CODES, errorResult } from '../..';

describe('errorResult singleton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('singleton existence', () => {
    it('should be defined', () => {
      expect(errorResult).toBeDefined();
    });

    it('should have error method', () => {
      expect(errorResult.error).toBeDefined();
      expect(typeof errorResult.error).toBe('function');
    });

    it('should have fatal method', () => {
      expect(errorResult.fatal).toBeDefined();
      expect(typeof errorResult.fatal).toBe('function');
    });
  });

  describe('error method', () => {
    it('should create ErrorResult instances correctly', () => {
      const error = errorResult.error(ERROR_CODES.TEST_ERROR, 'Test message');

      expect(error.code).toBe(ERROR_CODES.TEST_ERROR);
      expect(error.message).toBe('Test message');
      expect(error.recoverable).toBe(true);
      expect(error.name).toBe('ErrorResult');
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create error with context', () => {
      const context = { userId: 123, operation: 'test' };
      const error = errorResult.error(ERROR_CODES.TEST_ERROR, 'Test message', context);

      expect(error.code).toBe(ERROR_CODES.TEST_ERROR);
      expect(error.message).toBe('Test message');
      expect(error.context).toEqual(context);
      expect(error.recoverable).toBe(true);
    });

    it('should create error without context', () => {
      const error = errorResult.error(ERROR_CODES.TEST_ERROR, 'Test message');

      expect(error.code).toBe(ERROR_CODES.TEST_ERROR);
      expect(error.message).toBe('Test message');
      expect(error.context).toBeUndefined();
      expect(error.recoverable).toBe(true);
    });
  });

  describe('fatal method', () => {
    it('should call fatalExit properly', () => {
      expect(() => {
        errorResult.fatal(ERROR_CODES.TEST_ERROR, 'Fatal message');
      }).toThrow('Fatal exit called');

      expect(fatalExit).toHaveBeenCalledWith(1, 'Fatal message');
      expect(fatalExit).toHaveBeenCalledTimes(1);
    });

    it('should call fatalExit with context', () => {
      const context = { error: 'critical', system: 'main' };

      expect(() => {
        errorResult.fatal(ERROR_CODES.TEST_ERROR, 'Fatal message', context);
      }).toThrow('Fatal exit called');

      expect(fatalExit).toHaveBeenCalledWith(1, 'Fatal message');
      expect(fatalExit).toHaveBeenCalledTimes(1);
    });
  });
});
