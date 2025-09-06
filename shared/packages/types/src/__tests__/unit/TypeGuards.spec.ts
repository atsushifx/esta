// src: src/__tests__/unit/TypeGuards.spec.ts
// @(#): Runtime type guard functions unit tests
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { guardAglaErrorContext, isValidAglaErrorContext } from '../../../types/AglaError.types.js';

/**
 * Runtime type guard functions unit tests
 * Tests validation and guard functions for AglaErrorContext type safety
 */
describe('Type Guards', () => {
  /**
   * isValidAglaErrorContext validation function tests
   */
  describe('isValidAglaErrorContext', () => {
    // Non-object rejection: returns false for primitive types and null/undefined
    it('returns false for non-object values', () => {
      const cases = [null, undefined, 'str', 0, true, Symbol('x'), () => {}, BigInt(1)];
      cases.forEach((v) => expect(isValidAglaErrorContext(v)).toBe(false));
    });

    // Object validation: returns true for valid plain objects
    it('returns true for plain objects', () => {
      expect(isValidAglaErrorContext({})).toBe(true);
      expect(isValidAglaErrorContext({ user: 'a', id: 1 })).toBe(true);
    });
  });

  /**
   * guardAglaErrorContext guard function tests
   */
  describe('guardAglaErrorContext', () => {
    // Pass-through validation: returns same object reference when valid
    it('returns same object when valid', () => {
      const obj = { k: 'v' };
      const guarded = guardAglaErrorContext(obj);
      expect(guarded).toBe(obj);
      expect(guarded.k).toBe('v');
    });

    // Error throwing: throws appropriate errors for invalid input values
    it('throws for invalid values', () => {
      const invalids = [null, undefined, 'x', 1, true];
      invalids.forEach((v) => expect(() => guardAglaErrorContext(v)).toThrow());
    });
  });
});
