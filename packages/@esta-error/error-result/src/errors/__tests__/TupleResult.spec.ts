import { describe, expect, it } from 'vitest';
import type { TupleResult } from '../../../shared/types';
import { ERROR_CODES, ErrorResult, toTupleResult, wrapCallback } from '../..';

describe('TupleResult', () => {
  describe('TupleResult type', () => {
    it('should define success tuple correctly', () => {
      const successTuple: TupleResult<string> = ['success', undefined];

      expect(successTuple[0]).toBe('success');
      expect(successTuple[1]).toBeUndefined();
    });

    it('should define error tuple correctly', () => {
      const error = new ErrorResult(ERROR_CODES.TEST_ERROR, 'Test message');
      const errorTuple: TupleResult<string> = [undefined, error];

      expect(errorTuple[0]).toBeUndefined();
      expect(errorTuple[1]).toBeInstanceOf(ErrorResult);
    });
  });

  describe('toTupleResult', () => {
    it('should convert successful promise to success tuple', async () => {
      const promise = Promise.resolve('success');
      const [result, error] = await toTupleResult(promise);

      expect(result).toBe('success');
      expect(error).toBeUndefined();
    });

    it('should convert rejected promise to error tuple', async () => {
      const promise = Promise.reject(new Error('Promise failed'));
      const [result, error] = await toTupleResult(promise);

      expect(result).toBeUndefined();
      expect(error).toBeInstanceOf(ErrorResult);
      expect(error?.code).toBe(ERROR_CODES.PROMISE_REJECTED);
      expect(error?.message).toBe('Promise failed');
    });

    it('should handle ErrorResult rejection correctly', async () => {
      const originalError = new ErrorResult(ERROR_CODES.CUSTOM_ERROR, 'Custom message');
      const promise = Promise.reject(originalError);
      const [result, error] = await toTupleResult(promise);

      expect(result).toBeUndefined();
      expect(error).toBe(originalError);
    });

    it('should handle non-Error rejection', async () => {
      const promise = Promise.reject('string error');
      const [result, error] = await toTupleResult(promise);

      expect(result).toBeUndefined();
      expect(error).toBeInstanceOf(ErrorResult);
      expect(error?.message).toBe('string error');
    });
  });

  describe('wrapCallback', () => {
    it('should convert successful callback to success tuple', async () => {
      const fn = (callback: (error: Error | null, result?: string) => void) => {
        callback(null, 'success');
      };

      const [result, error] = await wrapCallback(fn);

      expect(result).toBe('success');
      expect(error).toBeUndefined();
    });

    it('should convert error callback to error tuple', async () => {
      const fn = (callback: (error: Error | null, result?: string) => void) => {
        callback(new Error('Callback failed'));
      };

      const [result, error] = await wrapCallback(fn);

      expect(result).toBeUndefined();
      expect(error).toBeInstanceOf(ErrorResult);
      expect(error?.code).toBe(ERROR_CODES.CALLBACK_ERROR);
      expect(error?.message).toBe('Callback failed');
    });
  });
});
