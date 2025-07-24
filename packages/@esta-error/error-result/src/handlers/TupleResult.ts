import { ErrorResult } from '../errors/ErrorResult';

export type TupleResult<T, E = ErrorResult> = [T, undefined] | [undefined, E];

export const toTupleResult = async <T>(
  promise: Promise<T>,
): Promise<TupleResult<T>> => {
  try {
    const result = await promise;
    return [result, undefined];
  } catch (error) {
    const errorResult = error instanceof ErrorResult
      ? error
      : new ErrorResult('PROMISE_REJECTED', error instanceof Error ? error.message : String(error));
    return [undefined, errorResult];
  }
};

export const wrapCallback = <T>(
  fn: (callback: (error: Error | null, result?: T) => void) => void,
): Promise<TupleResult<T>> => {
  return new Promise((resolve) => {
    fn((error, result) => {
      if (error) {
        const errorResult = new ErrorResult('CALLBACK_ERROR', error.message);
        resolve([undefined, errorResult]);
      } else {
        resolve([result as T, undefined]);
      }
    });
  });
};
