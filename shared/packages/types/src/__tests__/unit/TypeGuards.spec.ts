// src: src/__tests__/unit/TypeGuards.spec.ts
// @(#) : ランタイム型ガード関数の集約テスト
//
// Copyright (c) 2025 atsushifx
// MIT License

import { describe, expect, it } from 'vitest';

import { guardAglaErrorContext, isValidAglaErrorContext } from '../../../types/AglaError.types.js';

describe('Type Guards', () => {
  describe('isValidAglaErrorContext', () => {
    it('returns false for non-object values', () => {
      const cases = [null, undefined, 'str', 0, true, Symbol('x'), () => {}, BigInt(1)];
      cases.forEach((v) => expect(isValidAglaErrorContext(v)).toBe(false));
    });

    it('returns true for plain objects', () => {
      expect(isValidAglaErrorContext({})).toBe(true);
      expect(isValidAglaErrorContext({ user: 'a', id: 1 })).toBe(true);
    });
  });

  describe('guardAglaErrorContext', () => {
    it('returns same object when valid', () => {
      const obj = { k: 'v' };
      const guarded = guardAglaErrorContext(obj);
      expect(guarded).toBe(obj);
      expect(guarded.k).toBe('v');
    });

    it('throws for invalid values', () => {
      const invalids = [null, undefined, 'x', 1, true];
      invalids.forEach((v) => expect(() => guardAglaErrorContext(v)).toThrow());
    });
  });
});
