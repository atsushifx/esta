import type { ErrorResult } from '@/errors/ErrorResult';

export type TupleResult<T, E = ErrorResult> = [T, undefined] | [undefined, E];
