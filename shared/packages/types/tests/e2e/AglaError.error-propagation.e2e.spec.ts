// src: tests/e2e/AglaError.error-propagation.e2e.spec.ts
// @(#) : E2E tests for upper layer error propagation workflows
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
type LayerPropagationContext = {
  layer?: string;
  operation?: string;
  cause?: string;
  client_safe?: boolean;
  client_error?: unknown;
  server_error?: unknown;
  database?: string;
  connection_pool?: string;
  initial?: boolean;
  trace?: {
    trace_id: string;
    operation: string;
    layer: string;
    timestamp: string;
  };
  original_type?: string;
  timestamp?: string;
  transformation_timestamp?: string;
};

type TraceableError = {
  trace_id: string;
  span_id: string;
  parent_span?: string;
  operation: string;
  layer: string;
};

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.js';

/**
 * AglaError Error Propagation Test Suite
 * Tests package user scenarios for upper layer error propagation workflows
 * Following atsushifx式 BDD methodology with user-centric workflows
 */
describe('Given package user implementing upper layer error propagation workflow', () => {
  describe('When propagating errors through application layers', () => {
    it('Then should propagate errors through application layers', () => {
      // Arrange - Multi-layer application architecture
      const applicationLayers = {
        dataLayer: {
          processData(): TestAglaError {
            throw new TestAglaError('DATA_LAYER_ERROR', 'Data processing failed', {
              code: 'DL001',
              severity: ErrorSeverity.ERROR,
              context: { layer: 'data', operation: 'process' },
            });
          },
        },

        serviceLayer: {
          handleDataOperation(): TestAglaError {
            try {
              return applicationLayers.dataLayer.processData();
            } catch (error) {
              if (error instanceof TestAglaError) {
                throw error.chain(new Error('Service layer processing failed'));
              }
              throw error;
            }
          },
        },

        apiLayer: {
          handleRequest(): { success: boolean; error?: TestAglaError } {
            try {
              applicationLayers.serviceLayer.handleDataOperation();
              return { success: true };
            } catch (error) {
              if (error instanceof TestAglaError) {
                const apiError = error.chain(new Error('API request failed'));
                return { success: false, error: apiError };
              }
              return { success: false };
            }
          },
        },
      };

      // Act - Propagate error through layers
      const result = applicationLayers.apiLayer.handleRequest();

      // Assert - Error propagation
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(TestAglaError);
      expect(result.error?.errorType).toBe('DATA_LAYER_ERROR');
      expect(result.error?.message).toContain('Data processing failed');
      expect(result.error?.message).toContain('Service layer processing failed');
      expect(result.error?.message).toContain('API request failed');

      const errorContext = result.error?.context as LayerPropagationContext;
      expect(errorContext.layer).toBe('data');
      expect(errorContext.operation).toBe('process');
      expect(errorContext.cause).toBe('API request failed');
    });

    it('Then should transform errors for different contexts', () => {
      // Arrange - Error transformation system
      const errorTransformer = {
        transformForClient(serverError: TestAglaError): TestAglaError {
          // Transform internal server error to client-friendly format
          const clientMessage = serverError.severity === ErrorSeverity.FATAL
            ? 'Service temporarily unavailable'
            : 'Operation failed';

          return new TestAglaError(
            'CLIENT_ERROR',
            clientMessage,
            {
              code: 'CE001',
              severity: ErrorSeverity.WARNING,
              context: {
                original_type: serverError.errorType,
                client_safe: true,
                timestamp: new Date().toISOString(),
              },
            },
          );
        },

        transformForLogging(clientError: TestAglaError, originalError: TestAglaError): TestAglaError {
          return new TestAglaError(
            'LOG_ERROR',
            'Error occurred during request processing',
            {
              code: 'LE001',
              severity: originalError.severity,
              context: {
                client_error: {
                  type: clientError.errorType,
                  message: clientError.message,
                  code: clientError.code,
                },
                server_error: {
                  type: originalError.errorType,
                  message: originalError.message,
                  code: originalError.code,
                  context: originalError.context,
                },
                transformation_timestamp: new Date().toISOString(),
              },
            },
          );
        },
      };

      const serverError = new TestAglaError('INTERNAL_SERVER_ERROR', 'Database connection failed', {
        code: 'ISE001',
        severity: ErrorSeverity.FATAL,
        context: { database: 'users', connection_pool: 'primary' },
      });

      // Act - Transform for different contexts
      const clientError = errorTransformer.transformForClient(serverError);
      const logError = errorTransformer.transformForLogging(clientError, serverError);

      // Assert - Context-appropriate transformations
      expect(clientError.errorType).toBe('CLIENT_ERROR');
      expect(clientError.message).toBe('Service temporarily unavailable');
      expect(clientError.severity).toBe(ErrorSeverity.WARNING);
      expect((clientError.context as LayerPropagationContext).client_safe).toBe(true);

      expect(logError.errorType).toBe('LOG_ERROR');
      expect(logError.severity).toBe(ErrorSeverity.FATAL);
      const logContext = logError.context as LayerPropagationContext;
      expect(logContext.client_error).toBeDefined();
      expect(logContext.server_error).toBeDefined();
    });

    it('Then should preserve error traceability', () => {
      // Arrange - Traceability system
      const traceabilitySystem = {
        addTrace(error: TestAglaError, traceInfo: TraceableError): TestAglaError {
          return new TestAglaError(
            error.errorType,
            error.message,
            {
              code: error.code,
              severity: error.severity,
              timestamp: error.timestamp,
              context: {
                ...error.context,
                trace: traceInfo,
              },
            },
          );
        },

        propagateTrace(error: TestAglaError, newSpanInfo: Omit<TraceableError, 'trace_id'>): TestAglaError {
          const errorContext = error.context as { trace?: TraceableError } | undefined;
          const existingTrace = errorContext?.trace;
          const newTrace: TraceableError = {
            ...newSpanInfo,
            trace_id: existingTrace?.trace_id ?? 'trace-' + Math.random().toString(36).substr(2, 9),
          };

          return this.addTrace(error, newTrace);
        },
      };

      // Create initial error with trace
      const initialError = new TestAglaError('TRACEABLE_ERROR', 'Initial traceable error', {
        code: 'TE001',
        severity: ErrorSeverity.ERROR,
        context: { initial: true },
      });

      // Act - Add and propagate traces through layers
      const databaseError = traceabilitySystem.addTrace(initialError, {
        trace_id: 'trace-12345',
        span_id: 'span-001',
        operation: 'database_query',
        layer: 'database',
      });

      const serviceError = traceabilitySystem.propagateTrace(databaseError, {
        span_id: 'span-002',
        parent_span: 'span-001',
        operation: 'service_process',
        layer: 'service',
      });

      const apiError = traceabilitySystem.propagateTrace(serviceError, {
        span_id: 'span-003',
        parent_span: 'span-002',
        operation: 'api_request',
        layer: 'api',
      });

      // Assert - Traceability preserved and enhanced
      const databaseTrace = (databaseError.context as { trace: TraceableError }).trace;
      expect(databaseTrace.trace_id).toBe('trace-12345');
      expect(databaseTrace.span_id).toBe('span-001');
      expect(databaseTrace.operation).toBe('database_query');

      const serviceTrace = (serviceError.context as { trace: TraceableError }).trace;
      expect(serviceTrace.trace_id).toBe('trace-12345'); // Same trace ID
      expect(serviceTrace.span_id).toBe('span-002');
      expect(serviceTrace.parent_span).toBe('span-001');

      const apiTrace = (apiError.context as { trace: TraceableError }).trace;
      expect(apiTrace.trace_id).toBe('trace-12345'); // Same trace ID
      expect(apiTrace.span_id).toBe('span-003');
      expect(apiTrace.parent_span).toBe('span-002');
      expect(apiTrace.operation).toBe('api_request');
      expect(apiTrace.layer).toBe('api');
    });
  });
});
