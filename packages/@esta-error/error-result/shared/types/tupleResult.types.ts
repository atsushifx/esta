// src: shared/types/tupleResult.types.ts
// @(#) : type definitions for tuple-based error handling
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// ErrorResult class type for tuple result pattern
import type { ErrorResult } from '@/errors/ErrorResult';

/**
 * Tuple result type for error handling patterns
 * Returns either [result, undefined] for success or [undefined, error] for failure
 * @template T - The type of the successful result
 * @template E - The type of the error (defaults to ErrorResult)
 */
export type TupleResult<T, E = ErrorResult> = [T, undefined] | [undefined, E];
