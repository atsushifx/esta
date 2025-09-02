// src: tests/e2e/AglaError.e2e.spec.ts
// @(#) : E2E tests verifying real-world usage scenarios of AglaError
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import type { AglaError, AglaErrorContext, AglaErrorOptions } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// Test types
import type { _THttpHeaders } from '../../src/__tests__/helpers/test-types.types.js';

// Test-specific context types
type TestErrorContext = {
  // Top-level API info used in tests
  endpoint?: string;
  request?: {
    id: string;
    method: string;
    url: string;
    headers: _THttpHeaders;
  };
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
  system?: {
    timestamp: string;
    server: string;
    environment: string;
    version: string;
  };
  business?: {
    operation: string;
    workflow: string;
    step: string;
    metadata: AglaErrorContext;
  };
  transaction?: {
    id: string;
    type: string;
  };
  cause?: string;
  tags?: string[];
  metadata?: {
    correlation_id: string;
  };
  data?: {
    numbers: number[];
    nested: {
      deep: {
        value: string;
      };
    };
  };
  special_chars?: string;
  unicode?: string;
};

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.js';

/**
 * AglaError E2E Test Suite
 * Tests real-world user scenarios from developer perspective to system integration
 * Following atsushifx式 BDD methodology with user-centric workflows
 */

// フェーズE1: 開発者ワークフローシナリオ（12テスト）
describe('Given developer creating custom error handling workflows', () => {
  describe('When implementing custom error class creation and usage workflow', () => {
    // E1-001-01
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

    // E1-001-02
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

    // E1-001-03
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

    // E1-001-04
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

    // E1-001-05
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

  describe('When implementing error instance generation and chain creation workflow', () => {
    // E1-002-01
    it('Then should generate error instance with complex context', () => {
      // Arrange - Complex application context
      const complexContext = {
        request: {
          id: 'req-12345',
          method: 'POST',
          url: '/api/v1/users',
          headers: { 'content-type': 'application/json', 'user-agent': 'TestClient/1.0' },
        },
        user: {
          id: 'user-67890',
          role: 'admin',
          permissions: ['read', 'write', 'delete'],
        },
        system: {
          timestamp: '2025-08-31T12:30:45.123Z',
          server: 'app-server-01',
          environment: 'production',
          version: '1.2.3',
        },
        business: {
          operation: 'user-creation',
          workflow: 'registration',
          step: 'validation',
          metadata: { source: 'web-app', campaign: 'signup-2025' },
        },
      };

      // Act - Generate error with complex context
      const error = new TestAglaError(
        'COMPLEX_CONTEXT_ERROR',
        'Complex context validation failed',
        {
          code: 'CCE001',
          severity: ErrorSeverity.ERROR,
          timestamp: new Date('2025-08-31T12:30:45.123Z'),
          context: complexContext,
        },
      );

      // Assert - Complex context preserved
      expect(error.context).toEqual(complexContext);
      const contextData = error.context as TestErrorContext;
      expect(contextData.request?.id).toBe('req-12345');
      expect(contextData.user?.permissions).toEqual(['read', 'write', 'delete']);
      expect(contextData.business?.metadata.campaign).toBe('signup-2025');

      // JSON serialization handles complex nested data
      const json = error.toJSON();
      const jsonContext = json.context as TestErrorContext;
      expect(jsonContext.request?.method).toBe('POST');
      expect(jsonContext.system?.environment).toBe('production');
    });

    // E1-002-02
    it('Then should create multi-level error chains', () => {
      // Arrange - Multi-tier application architecture simulation
      const databaseError = new Error('Connection timeout after 30 seconds');
      const serviceError = new TestAglaError(
        'SERVICE_ERROR',
        'User service operation failed',
        {
          severity: ErrorSeverity.ERROR,
          context: { service: 'UserService', method: 'createUser', layer: 'service' },
        },
      );
      const controllerError = new TestAglaError(
        'CONTROLLER_ERROR',
        'API controller request failed',
        {
          severity: ErrorSeverity.ERROR,
          context: { controller: 'UserController', action: 'create', layer: 'controller' },
        },
      );
      const apiError = new TestAglaError(
        'API_ERROR',
        'API request processing failed',
        {
          severity: ErrorSeverity.ERROR,
          context: { endpoint: '/api/v1/users', method: 'POST', layer: 'api' },
        },
      );

      // Act - Create multi-level chain
      const serviceChain = serviceError.chain(databaseError);
      const controllerChain = controllerError.chain(serviceChain);
      const apiChain = apiError.chain(controllerChain);

      // Assert - Chain structure preserved
      expect(apiChain.message).toContain('API request processing failed');
      expect(apiChain.message).toContain('API controller request failed');
      expect((apiChain.context as TestErrorContext).cause).toContain('API controller request failed');

      expect(controllerChain.message).toContain('User service operation failed');
      expect(serviceChain.message).toContain('Connection timeout after 30 seconds');

      // Each level maintains its identity
      expect(apiChain.errorType).toBe('API_ERROR');
      expect(controllerChain.errorType).toBe('CONTROLLER_ERROR');
      expect(serviceChain.errorType).toBe('SERVICE_ERROR');
    });

    // E1-002-03
    it('Then should preserve context through chain operations', () => {
      // Arrange - Context-rich error chain
      const originalContext = {
        transaction: { id: 'tx-001', type: 'payment' },
        user: { id: 'user-123', tier: 'premium' },
      };

      const baseError = new TestAglaError(
        'PAYMENT_ERROR',
        'Payment processing failed',
        {
          severity: ErrorSeverity.ERROR,
          context: originalContext,
        },
      );

      const networkError = new Error('Network unreachable');
      const timeoutError = new Error('Request timeout');

      // Act - Chain multiple errors
      const firstChain = baseError.chain(networkError);
      const finalChain = firstChain.chain(timeoutError);

      // Assert - Original context preserved and enhanced
      const finalContext = finalChain.context as TestErrorContext;
      expect(finalContext.transaction).toEqual({ id: 'tx-001', type: 'payment' });
      expect(finalContext.user).toEqual({ id: 'user-123', tier: 'premium' });
      expect(finalContext.cause).toBe('Request timeout');

      // Intermediate context also preserved
      const firstContext = firstChain.context as TestErrorContext;
      expect(firstContext.transaction).toEqual({ id: 'tx-001', type: 'payment' });
      expect(firstContext.cause).toBe('Network unreachable');

      // Error types maintained through chain
      expect(finalChain.errorType).toBe('PAYMENT_ERROR');
      expect(firstChain.errorType).toBe('PAYMENT_ERROR');
    });

    // E1-002-04
    it('Then should maintain error metadata consistency', () => {
      // Arrange - Metadata-rich error
      const baseTimestamp = new Date('2025-08-31T10:00:00Z');
      const baseError = new TestAglaError(
        'METADATA_TEST_ERROR',
        'Metadata consistency test',
        {
          code: 'MTE001',
          severity: ErrorSeverity.WARNING,
          timestamp: baseTimestamp,
          context: { version: '1.0', build: '12345' },
        },
      );

      const causeError = new Error('Underlying cause');

      // Act - Chain and serialize
      const chainedError = baseError.chain(causeError);
      const json = chainedError.toJSON();
      const stringRep = chainedError.toString();

      // Assert - Metadata consistency maintained
      expect(chainedError.errorType).toBe('METADATA_TEST_ERROR');
      expect(chainedError.code).toBe('MTE001');
      expect(chainedError.severity).toBe(ErrorSeverity.WARNING);
      expect(chainedError.timestamp).toBe(baseTimestamp);

      // JSON representation consistent
      expect(json.errorType).toBe('METADATA_TEST_ERROR');
      expect(json.code).toBe('MTE001');
      expect(json.severity).toBe(ErrorSeverity.WARNING);
      expect(json.timestamp).toBe(baseTimestamp.toISOString());

      // String representation includes metadata
      expect(stringRep).toContain('METADATA_TEST_ERROR');
      expect(stringRep).toContain('Underlying cause');
    });
  });

  describe('When implementing logging, JSON output, and error handling workflow', () => {
    // E1-003-01
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
      expect((jsonLog.context as TestErrorContext).metadata?.correlation_id).toBe('log-12345');

      expect(structuredLog.level).toBe('error');
      expect(structuredLog.error_type).toBe('LOGGING_INTEGRATION_ERROR');
      expect((structuredLog.context as TestErrorContext).tags).toEqual(['critical', 'user-facing']);

      expect(stringLog).toContain('LOGGING_INTEGRATION_ERROR');
      expect(stringLog).toContain('Structured logging test');
    });

    // E1-003-02
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
      const jsonContext = json.context as TestErrorContext;
      expect(jsonContext.data?.numbers).toEqual([1, 2, 3]);
      expect(jsonContext.data?.nested.deep.value).toBe('test');
      expect(jsonContext.special_chars).toBe('Special: äöü @#$%^&*()');
      expect(jsonContext.unicode).toBe('🚀✨🎯');
      expect(jsonContext.cause).toBe('Serialization cause');

      // Round-trip consistency
      expect(parsedBack).toEqual(json);
      const parsedContext = parsedBack.context as TestErrorContext & { data: { boolean: boolean; null_value: null } };
      expect(parsedContext.data.boolean).toBe(true);
      expect(parsedContext.data.null_value).toBe(null);
    });

    // E1-003-03
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

// フェーズE2: パッケージ利用者シナリオ（10テスト）
// E2-001 シナリオは tests/e2e/AglaError.consumer-usage.e2e.spec.ts に移行
