// src: src/__tests__/functional/ErrorPropagation.functional.spec.ts
// @(#) : エラー伝播（多段チェーン、関数境界越え）機能テスト
//
// Copyright (c) 2025
// MIT License

import { describe, expect, it } from 'vitest';
import type { AglaError } from '../../../types/AglaError.types.js';
import { ErrorSeverity } from '../../../types/ErrorSeverity.types.js';
import { TestAglaError } from '../helpers/TestAglaError.class.ts';

describe('Error Propagation', () => {
  describe('Multi-level chaining', () => {
    it('preserves base properties across levels and appends causes', () => {
      const timestamp = new Date('2025-08-29T21:42:00Z');
      const base = new TestAglaError('MULTI_LEVEL_ERROR', 'Base level error', {
        code: 'ML_001',
        severity: ErrorSeverity.FATAL,
        timestamp,
        context: { level: 0, module: 'base' },
      });

      const level1 = base.chain(new Error('Level 1 failure'));
      const level2 = level1.chain(new Error('Level 2 failure'));
      const finalE = level2.chain(new Error('Final failure'));

      expect(finalE.message).toContain('Final failure');
      expect(finalE.message).toContain('Level 2 failure');
      expect(finalE.errorType).toBe('MULTI_LEVEL_ERROR');
      expect(finalE.code).toBe('ML_001');
      expect(finalE.severity).toBe(ErrorSeverity.FATAL);
      expect(finalE.context).toHaveProperty('level', 0);
      expect(finalE.context).toHaveProperty('module', 'base');
      expect(finalE.name).toBe('TestAglaError');
      expect(finalE.stack).toBeDefined();
    });
  });

  describe('Propagation across function boundaries', () => {
    const service = (): AglaError => {
      try {
        // Simulate low-level failure
        throw new Error('DB not reachable');
      } catch (e) {
        return new TestAglaError('SERVICE_ERROR', 'Service failed', {
          code: 'SVC_001',
          severity: ErrorSeverity.ERROR,
          context: { component: 'service' },
        }).chain(e as Error);
      }
    };

    const controller = (): AglaError => {
      const err = service();
      // enrich at controller level
      return err.chain(new Error('Controller observed failure'));
    };

    it('keeps severity and accumulates context', () => {
      const propagated = controller();
      expect(propagated.severity).toBe(ErrorSeverity.ERROR);
      expect(propagated.context).toHaveProperty('component', 'service');
      expect(propagated.message).toContain('Controller observed failure');
      const json = propagated.toJSON();
      expect(json).toHaveProperty('code', 'SVC_001');
      expect(json).toHaveProperty('severity', ErrorSeverity.ERROR);
    });
  });
});
