// src: tests/e2e/AglaError.custom-error-workflow.e2e.spec.ts
// @(#) : E2E tests for custom error class creation and usage workflows
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import type { AglaError, AglaErrorOptions } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.js';

/**
 * AglaError Custom Error Class Workflow Test Suite
 * Tests developer scenarios for creating and using custom error classes
 * Following atsushifx式 BDD methodology with user-centric workflows
 */
describe('Given developer creating custom error handling workflows', () => {
  describe('When implementing custom error class creation and usage workflow', () => {
    it('Then should create custom error class extending TestAglaError', () => {
      // Arrange - Developer defines custom error class
      class CustomWorkflowError extends TestAglaError {
        constructor(
          errorType: string,
          message: string,
          options?: AglaErrorOptions,
        ) {
          super(errorType, message, options);
        }

        chain(cause: Error): CustomWorkflowError {
          return new CustomWorkflowError(
            this.errorType,
            `${this.message} (caused by: ${cause.message})`,
            { ...this.context, cause: cause.message },
          );
        }
      }

      // Act - Developer creates instance
      const customError = new CustomWorkflowError(
        'CUSTOM_WORKFLOW_ERROR',
        'Custom workflow failed',
        { severity: ErrorSeverity.ERROR, context: { module: 'workflow' } },
      );

      // Assert - Verifies proper inheritance and functionality
      expect(customError).toBeInstanceOf(CustomWorkflowError);
      expect(customError).toBeInstanceOf(TestAglaError);
      expect(customError.errorType).toBe('CUSTOM_WORKFLOW_ERROR');
      expect(customError.message).toBe('Custom workflow failed');
      expect(customError.context).toEqual({ module: 'workflow' });
    });

    it('Then should instantiate custom error with all properties', () => {
      // Arrange - Complete error configuration
      const errorConfig = {
        errorType: 'COMPLETE_CONFIG_ERROR',
        message: 'Complete configuration error',
        options: {
          code: 'CC001',
          severity: ErrorSeverity.WARNING,
          timestamp: new Date('2025-08-31T12:00:00Z'),
          context: {
            userId: 'dev-123',
            operation: 'configuration',
            parameters: { config: 'development', env: 'test' },
          },
        } as AglaErrorOptions,
      };

      // Act - Developer creates fully configured error
      const error = new TestAglaError(
        errorConfig.errorType,
        errorConfig.message,
        errorConfig.options,
      );

      // Assert - All properties properly set
      expect(error.errorType).toBe(errorConfig.errorType);
      expect(error.message).toBe(errorConfig.message);
      expect(error.code).toBe(errorConfig.options.code);
      expect(error.severity).toBe(errorConfig.options.severity);
      expect(error.timestamp).toBe(errorConfig.options.timestamp);
      expect(error.context).toEqual(errorConfig.options.context);
    });

    it('Then should validate custom error inheritance chain', () => {
      // Arrange - Multi-level inheritance
      class BaseApplicationError extends TestAglaError {
        readonly category = 'APPLICATION';
      }

      class SpecificWorkflowError extends BaseApplicationError {
        readonly workflowType: string;

        constructor(workflowType: string, message: string) {
          super('SPECIFIC_WORKFLOW_ERROR', message);
          this.workflowType = workflowType;
        }

        chain(cause: Error): SpecificWorkflowError {
          const chained = new SpecificWorkflowError(this.workflowType, `${this.message} (caused by: ${cause.message})`);
          return chained;
        }
      }

      // Act - Create instance and verify chain
      const workflowError = new SpecificWorkflowError('data-processing', 'Data processing failed');
      const originalError = new Error('Database connection lost');
      const chainedError = workflowError.chain(originalError);

      // Assert - Inheritance chain validation
      expect(workflowError).toBeInstanceOf(SpecificWorkflowError);
      expect(workflowError).toBeInstanceOf(BaseApplicationError);
      expect(workflowError).toBeInstanceOf(TestAglaError);
      expect(workflowError).toBeInstanceOf(Error);

      expect(workflowError.category).toBe('APPLICATION');
      expect(workflowError.workflowType).toBe('data-processing');

      expect(chainedError).toBeInstanceOf(SpecificWorkflowError);
      expect(chainedError.message).toBe('Data processing failed (caused by: Database connection lost)');
    });

    it('Then should verify custom error method availability', () => {
      // Arrange - Error with custom methods
      class MethodRichError extends TestAglaError {
        formatForLogging(): string {
          return `[${this.errorType}] ${this.message} | Context: ${JSON.stringify(this.context)}`;
        }

        getErrorCode(): string {
          return this.code ?? 'UNKNOWN';
        }

        isRecoverable(): boolean {
          return this.severity !== ErrorSeverity.FATAL;
        }

        chain(cause: Error): MethodRichError {
          return new MethodRichError(
            this.errorType,
            `${this.message} (caused by: ${cause.message})`,
            { ...this.context, cause: cause.message },
          );
        }
      }

      // Act - Create instance and use methods
      const error = new MethodRichError(
        'METHOD_RICH_ERROR',
        'Rich error functionality test',
        {
          code: 'MR001',
          severity: ErrorSeverity.ERROR,
          context: { feature: 'methods', test: true },
        },
      );

      // Assert - Custom methods work correctly
      expect(error.formatForLogging()).toBe(
        '[METHOD_RICH_ERROR] Rich error functionality test | Context: {"feature":"methods","test":true}',
      );
      expect(error.getErrorCode()).toBe('MR001');
      expect(error.isRecoverable()).toBe(true);

      // Verify inherited methods still work
      expect(typeof error.toJSON).toBe('function');
      expect(typeof error.toString).toBe('function');
      expect(typeof error.chain).toBe('function');
    });

    it('Then should confirm custom error type safety', () => {
      // Arrange - Type-safe error handling
      const processError = (error: AglaError): { type: string; recoverable: boolean } => {
        return {
          type: error.errorType,
          recoverable: error.severity !== ErrorSeverity.FATAL,
        };
      };

      // Act - Create typed errors
      const testError = new TestAglaError(
        'TYPE_SAFETY_ERROR',
        'Type safety validation',
        { severity: ErrorSeverity.WARNING },
      );

      const processedError = processError(testError);

      // Assert - Type safety maintained
      expect(processedError.type).toBe('TYPE_SAFETY_ERROR');
      expect(processedError.recoverable).toBe(true);

      // Type assertions should work
      expect(testError).toBeInstanceOf(TestAglaError);
      expect(testError.errorType).toBe('TYPE_SAFETY_ERROR');

      // Error is assignable to AglaError interface
      const aglaError: AglaError = testError;
      expect(aglaError.errorType).toBe('TYPE_SAFETY_ERROR');
    });
  });
});
