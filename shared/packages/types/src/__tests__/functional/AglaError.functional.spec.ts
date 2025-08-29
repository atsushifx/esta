import { describe, expect, it } from 'vitest';
import { ErrorSeverity } from '../../../types/ErrorSeverity.types.js';
import { TestAglaError } from '../helpers/TestAglaError.class.ts';

describe('Given AglaError instance for complete error handling workflows', () => {
  describe('When performing complete error chaining workflow', () => {
    it('Then should demonstrate complete error chaining behavior', () => {
      // Arrange
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

      // Act
      const chainedError = originalError.chain(causeError);

      // Assert - F1-001-02: message combination validation
      expect(chainedError.message).toBe('Original workflow message (caused by: Underlying system failure)');

      // Assert - F1-001-03: errorType preservation validation
      expect(chainedError.errorType).toBe('WORKFLOW_ERROR');

      // Assert - F1-001-04: context integration validation
      expect(chainedError.context).toEqual({
        userId: '123',
        operation: 'workflow',
        cause: 'Underlying system failure',
      });

      // Assert - F1-001-05: JSON integration validation
      const json = chainedError.toJSON();
      expect(json).toEqual({
        errorType: 'WORKFLOW_ERROR',
        message: 'Original workflow message (caused by: Underlying system failure)',
        code: 'WF_001',
        severity: ErrorSeverity.ERROR,
        context: {
          userId: '123',
          operation: 'workflow',
          cause: 'Underlying system failure',
        },
      });

      // Assert - F1-001-06: string integration validation
      const stringRepresentation = chainedError.toString();
      expect(stringRepresentation).toContain('WORKFLOW_ERROR');
      expect(stringRepresentation).toContain('Original workflow message (caused by: Underlying system failure)');
      expect(stringRepresentation).toContain(JSON.stringify(chainedError.context));
    });
  });

  describe('When handling multi-level error chaining workflow', () => {
    it('Then should demonstrate complete multi-level error handling', () => {
      // Arrange
      const timestamp = new Date('2025-08-29T21:42:00Z');
      const baseError = new TestAglaError(
        'MULTI_LEVEL_ERROR',
        'Base level error',
        {
          code: 'ML_001',
          severity: ErrorSeverity.FATAL,
          timestamp,
          context: { level: 0, module: 'base' },
        },
      );

      // Act - Multi-level chaining workflow
      const level1Error = baseError.chain(new Error('Level 1 failure'));
      const level2Error = level1Error.chain(new Error('Level 2 failure'));
      const finalError = level2Error.chain(new Error('Final failure'));

      // Assert - F1-002-02: multi-stage message validation
      expect(finalError.message).toContain('Final failure');
      expect(finalError.message).toContain('Level 2 failure');

      // Assert - F1-002-03: context inheritance validation
      expect(finalError.context).toHaveProperty('level', 0);
      expect(finalError.context).toHaveProperty('module', 'base');
      expect(finalError.context).toHaveProperty('cause', 'Final failure');

      // Assert - F1-002-04: inheritance integration validation
      expect(finalError instanceof Error).toBe(true);
      expect(finalError instanceof TestAglaError).toBe(true);
      expect(finalError.name).toBe('TestAglaError');
      expect(finalError.stack).toBeDefined();

      // Additional assertions
      expect(finalError.errorType).toBe('MULTI_LEVEL_ERROR');
      expect(finalError.code).toBe('ML_001');
      expect(finalError.severity).toBe(ErrorSeverity.FATAL);
    });
  });

  describe('When performing complete serialization workflow', () => {
    it('Then should handle complex serialization scenarios', () => {
      // Arrange
      const complexContext = {
        user: { id: '123', name: 'John Doe', roles: ['admin', 'user'] },
        operation: {
          type: 'CREATE',
          resource: 'document',
          metadata: { version: '1.0', tags: ['important', 'draft'] },
        },
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

      // Act - Complete serialization workflow
      const json = error.toJSON();
      const stringified = JSON.stringify(json);
      const parsed = JSON.parse(stringified);

      // Assert - Complete serialization behavior
      expect(json).toHaveProperty('errorType', 'COMPLEX_SERIALIZATION_ERROR');
      expect(json).toHaveProperty('message', 'Complex data serialization test');
      expect(json).toHaveProperty('code', 'CS_001');
      expect(json).toHaveProperty('severity', ErrorSeverity.WARNING);
      expect(json).toHaveProperty('timestamp', '2025-12-31T23:59:59.999Z');
      expect(json).toHaveProperty('context');

      // Deep context serialization
      expect(json.context).toEqual(complexContext);
      expect(parsed.context.user.roles).toEqual(['admin', 'user']);
      expect(parsed.context.operation.metadata.tags).toEqual(['important', 'draft']);
    });
  });
});
