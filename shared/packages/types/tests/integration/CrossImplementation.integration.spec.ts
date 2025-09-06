// src: tests/integration/CrossImplementation.integration.spec.ts
// @(#) : 複数実装/消費側前提の互換性確認（最小）

import { describe, expect, it } from 'vitest';
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.ts';
import { AglaError } from '../../types/AglaError.types.js';

describe('Cross Implementation Compatibility', () => {
  describe('Consumer expects AglaError-like shape', () => {
    const consumer = (e: { errorType: string; toJSON: () => unknown }): boolean => {
      const json = e.toJSON() as { errorType?: unknown };
      return typeof json.errorType === 'string';
    };

    it('accepts TestAglaError and preserves fields', () => {
      const err = new TestAglaError('X_IMPL', 'cross impl');
      expect(consumer(err)).toBe(true);
      const json = err.toJSON();
      expect(json).toHaveProperty('errorType', 'X_IMPL');
      expect(json).toHaveProperty('message', 'cross impl');
    });

    it('rejects non-conforming shape (missing errorType in toJSON)', () => {
      const fake = {
        errorType: 'FAKE',
        toJSON: () => ({ message: 'no errorType' }),
      };
      expect(consumer(fake)).toBe(false);
    });
  });

  describe('Union with native Error does not break usage', () => {
    it('filters AglaError instances correctly', () => {
      const list: (AglaError | Error)[] = [new TestAglaError('A', 'a'), new Error('b')];
      const aglaOnly = list.filter((e): e is AglaError => e instanceof AglaError);
      expect(aglaOnly).toHaveLength(1);
      expect(aglaOnly[0].errorType).toBe('A');
    });
  });
});
