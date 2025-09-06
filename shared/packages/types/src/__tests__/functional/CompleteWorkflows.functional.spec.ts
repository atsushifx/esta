// src: src/__tests__/functional/CompleteWorkflows.functional.spec.ts
// @(#): Complete workflow functional tests (serialization and chaining)
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { ErrorSeverity } from '../../../types/ErrorSeverity.types.js';

// Test utilities
import { TestAglaError } from '../helpers/TestAglaError.class.ts';

/**
 * Complete workflow functional tests
 * Tests end-to-end scenarios combining error chaining, serialization, and context merging
 */
describe('Complete Workflows', () => {
  /**
   * Error chaining workflow with context merging and serialization
   */
  describe('Error chaining workflow', () => {
    // Complete chaining workflow: tests message combination, property preservation, and serialization
    it('combines messages, preserves errorType, and merges context', () => {
      const originalError = new TestAglaError(
        'WORKFLOW_ERROR',
        'Original workflow message',
        {
          code: 'WF_001',
          severity: ErrorSeverity.ERROR,
          context: { userId: '123', operation: 'workflow' },
        },
      );
      const causeError = new Error('Underlying system failure');

      const chainedError = originalError.chain(causeError);

      expect(chainedError.message).toBe('Original workflow message (caused by: Underlying system failure)');
      expect(chainedError.errorType).toBe('WORKFLOW_ERROR');
      expect(chainedError.context).toEqual({
        userId: '123',
        operation: 'workflow',
        cause: 'Underlying system failure',
        originalError: {
          name: 'Error',
          message: 'Underlying system failure',
          stack: expect.any(String),
        },
      });

      const json = chainedError.toJSON();
      expect(json).toEqual({
        errorType: 'WORKFLOW_ERROR',
        message: 'Original workflow message (caused by: Underlying system failure)',
        code: 'WF_001',
        severity: ErrorSeverity.ERROR,
        context: chainedError.context,
      });

      const stringRepresentation = chainedError.toString();
      expect(stringRepresentation).toContain('WORKFLOW_ERROR');
      expect(stringRepresentation).toContain('Original workflow message (caused by: Underlying system failure)');
      expect(stringRepresentation).toContain(JSON.stringify(chainedError.context));
    });
  });

  /**
   * Complex serialization scenarios with nested data structures
   */
  describe('Complex serialization workflow', () => {
    // Deep serialization: handles nested objects, arrays, and complex data structures
    it('serializes deeply nested context and preserves fields', () => {
      const complexContext = {
        user: { id: '123', name: 'John Doe', roles: ['admin', 'user'] },
        operation: { type: 'CREATE', resource: 'document', metadata: { version: '1.0', tags: ['important', 'draft'] } },
        system: { hostname: 'server01', pid: 1234, memory: 512 },
      };

      const error = new TestAglaError(
        'COMPLEX_SERIALIZATION_ERROR',
        'Complex data serialization test',
        {
          code: 'CS_001',
          severity: ErrorSeverity.WARNING,
          timestamp: new Date('2025-12-31T23:59:59.999Z'),
          context: complexContext,
        },
      );

      const json = error.toJSON();
      const parsed = JSON.parse(JSON.stringify(json));

      expect(json).toHaveProperty('errorType', 'COMPLEX_SERIALIZATION_ERROR');
      expect(json).toHaveProperty('message', 'Complex data serialization test');
      expect(json).toHaveProperty('code', 'CS_001');
      expect(json).toHaveProperty('severity', ErrorSeverity.WARNING);
      expect(json).toHaveProperty('timestamp', '2025-12-31T23:59:59.999Z');
      expect(json).toHaveProperty('context');
      expect(json.context).toEqual(complexContext);

      expect(parsed.context.user.roles).toEqual(['admin', 'user']);
      expect(parsed.context.operation.metadata.tags).toEqual(['important', 'draft']);
    });
  });
});
