// src: tests/e2e/AglaError.logging-workflow.e2e.spec.ts
// @(#) : E2E tests for logging, JSON output, and error handling workflows
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// Test-specific context types
type LoggingReportContext = {
  module?: string;
  level?: string;
  tags?: string[];
  metadata?: {
    correlation_id?: string;
    trace_id?: string;
  };
  data?: {
    numbers: number[];
    nested: {
      deep: {
        value: string;
      };
    };
    boolean?: boolean;
    null_value?: null;
  };
  special_chars?: string;
  unicode?: string;
  cause?: string;
};

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.js';

/**
 * AglaError Logging and Error Handling Workflow Test Suite
 * Tests logging integration, JSON serialization, and complete error handling workflows
 * Following atsushifx式 BDD methodology with user-centric workflows
 */
describe('Given developer creating error handling workflows', () => {
  describe('When implementing logging, JSON output, and error handling workflow', () => {
    it('Then should format error for structured logging', () => {
      // Arrange - Logging system integration
      const logError = new TestAglaError(
        'LOGGING_INTEGRATION_ERROR',
        'Structured logging test',
        {
          code: 'LOG001',
          severity: ErrorSeverity.ERROR,
          timestamp: new Date('2025-08-31T14:30:00Z'),
          context: {
            module: 'logging',
            level: 'error',
            tags: ['critical', 'user-facing'],
            metadata: { correlation_id: 'log-12345', trace_id: 'trace-67890' },
          },
        },
      );

      // Act - Format for different logging systems
      const jsonLog = logError.toJSON();
      const stringLog = logError.toString();

      // Simulate structured log format
      const structuredLog = {
        level: 'error',
        timestamp: logError.timestamp?.toISOString(),
        message: logError.message,
        error_type: logError.errorType,
        error_code: logError.code,
        severity: logError.severity,
        context: logError.context,
        stack: logError.stack,
      };

      // Assert - Proper logging format
      expect(jsonLog).toHaveProperty('errorType', 'LOGGING_INTEGRATION_ERROR');
      expect(jsonLog).toHaveProperty('code', 'LOG001');
      expect(jsonLog).toHaveProperty('context');
      expect((jsonLog.context as LoggingReportContext).metadata?.correlation_id).toBe('log-12345');

      expect(structuredLog.level).toBe('error');
      expect(structuredLog.error_type).toBe('LOGGING_INTEGRATION_ERROR');
      expect((structuredLog.context as LoggingReportContext).tags).toEqual(['critical', 'user-facing']);

      expect(stringLog).toContain('LOGGING_INTEGRATION_ERROR');
      expect(stringLog).toContain('Structured logging test');
    });

    it('Then should serialize error to JSON correctly', () => {
      // Arrange - Complex error for serialization
      const serializationError = new TestAglaError(
        'SERIALIZATION_TEST_ERROR',
        'JSON serialization validation',
        {
          code: 'SER001',
          severity: ErrorSeverity.FATAL,
          timestamp: new Date('2025-08-31T16:45:00Z'),
          context: {
            data: {
              numbers: [1, 2, 3],
              nested: { deep: { value: 'test' } },
              boolean: true,
              null_value: null,
            },
            special_chars: 'Special: äöü @#$%^&*()',
            unicode: '🚀✨🎯',
          },
        },
      );

      const causeError = new Error('Serialization cause');
      const chainedError = serializationError.chain(causeError);

      // Act - Serialize and parse
      const json = chainedError.toJSON();
      const jsonString = JSON.stringify(json);
      const parsedBack = JSON.parse(jsonString);

      // Assert - Serialization accuracy
      expect(json.errorType).toBe('SERIALIZATION_TEST_ERROR');
      expect(json.message).toContain('Serialization cause');
      const jsonContext = json.context as LoggingReportContext;
      expect(jsonContext.data?.numbers).toEqual([1, 2, 3]);
      expect(jsonContext.data?.nested.deep.value).toBe('test');
      expect(jsonContext.special_chars).toBe('Special: äöü @#$%^&*()');
      expect(jsonContext.unicode).toBe('🚀✨🎯');
      expect(jsonContext.cause).toBe('Serialization cause');

      // Round-trip consistency
      expect(parsedBack).toEqual(json);
      const parsedContext = parsedBack.context as LoggingReportContext;
      expect(parsedContext.data?.boolean).toBe(true);
      expect(parsedContext.data?.null_value).toBe(null);
    });

    it('Then should handle error in complete workflow', () => {
      // Arrange - Complete error handling workflow simulation
      const workflowHandler = {
        errors: [] as TestAglaError[],
        logs: [] as string[],
        alerts: [] as object[],

        handleError(error: TestAglaError): void {
          // Store error
          this.errors.push(error);

          // Generate log
          this.logs.push(`[${error.severity}] ${error.errorType}: ${error.message}`);

          // Generate alert for severe errors
          if (error.severity === ErrorSeverity.ERROR || error.severity === ErrorSeverity.FATAL) {
            this.alerts.push({
              type: 'error_alert',
              severity: error.severity,
              error_type: error.errorType,
              message: error.message,
              context: error.context,
              timestamp: error.timestamp ?? new Date(),
            });
          }
        },
      };

      // Act - Process multiple errors through workflow
      const errors = [
        new TestAglaError('WORKFLOW_ERROR_1', 'First error', { severity: ErrorSeverity.WARNING }),
        new TestAglaError('WORKFLOW_ERROR_2', 'Second error', { severity: ErrorSeverity.ERROR }),
        new TestAglaError('WORKFLOW_ERROR_3', 'Third error', { severity: ErrorSeverity.FATAL }),
      ];

      errors.forEach((error) => workflowHandler.handleError(error));

      // Assert - Complete workflow handling
      expect(workflowHandler.errors).toHaveLength(3);
      expect(workflowHandler.logs).toHaveLength(3);
      expect(workflowHandler.alerts).toHaveLength(2); // Only ERROR and FATAL

      expect(workflowHandler.logs[0]).toContain('[warning] WORKFLOW_ERROR_1');
      expect(workflowHandler.logs[1]).toContain('[error] WORKFLOW_ERROR_2');
      expect(workflowHandler.logs[2]).toContain('[fatal] WORKFLOW_ERROR_3');

      expect(workflowHandler.alerts[0]).toHaveProperty('type', 'error_alert');
      expect(workflowHandler.alerts[0]).toHaveProperty('error_type', 'WORKFLOW_ERROR_2');
      expect(workflowHandler.alerts[1]).toHaveProperty('error_type', 'WORKFLOW_ERROR_3');
    });
  });
});
