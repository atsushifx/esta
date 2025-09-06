// src: src/__tests__/functional/ErrorPropagation.functional.spec.ts
// @(#): Error propagation functional tests (multi-level chaining and function boundaries)
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import type { AglaError } from '../../../types/AglaError.types.js';
import { ErrorSeverity } from '../../../types/ErrorSeverity.types.js';

// Test utilities
import { TestAglaError } from '../helpers/TestAglaError.class.ts';

/**
 * Error propagation functional tests
 * Tests multi-level error chaining and propagation across function boundaries
 */
describe('Error Propagation', () => {
  /**
   * Multi-level error chaining scenarios
   */
  describe('Multi-level chaining', () => {
    // Multi-level preservation: tests property preservation through multiple chaining levels
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

  /**
   * Error propagation across different function contexts
   */
  describe('Propagation across function boundaries', () => {
    /**
     * Simulates a service layer error with database failure
     * @returns AglaError with service context and chained cause
     */
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

    /**
     * Simulates a controller layer error that enriches service error
     * @returns AglaError with additional controller context
     */
    const controller = (): AglaError => {
      const err = service();
      // enrich at controller level
      return err.chain(new Error('Controller observed failure'));
    };

    // Cross-boundary propagation: maintains error properties while enriching context
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
