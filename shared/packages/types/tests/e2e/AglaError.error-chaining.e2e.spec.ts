// src: tests/e2e/AglaError.error-chaining.e2e.spec.ts
// @(#) : E2E tests for error instance generation and chain creation workflows
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
type CustomErrorWorkflowContext = {
  request?: {
    id: string;
    method: string;
    url: string;
    headers: Record<string, string>;
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
    metadata: Record<string, unknown>;
  };
  transaction?: {
    id: string;
    type: string;
  };
  service?: string;
  method?: string;
  layer?: string;
  controller?: string;
  action?: string;
  endpoint?: string;
  cause?: string;
};

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.js';

/**
 * AglaError Error Instance Generation and Chain Creation Test Suite
 * Tests error instance generation with complex contexts and multi-level error chaining
 * Following atsushifx式 BDD methodology with user-centric workflows
 */
describe('Given developer creating error handling workflows', () => {
  describe('When implementing error instance generation and chain creation workflow', () => {
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
      const contextData = error.context as CustomErrorWorkflowContext;
      expect(contextData.request?.id).toBe('req-12345');
      expect(contextData.user?.permissions).toEqual(['read', 'write', 'delete']);
      expect(contextData.business?.metadata.campaign).toBe('signup-2025');

      // JSON serialization handles complex nested data
      const json = error.toJSON();
      const jsonContext = json.context as CustomErrorWorkflowContext;
      expect(jsonContext.request?.method).toBe('POST');
      expect(jsonContext.system?.environment).toBe('production');
    });

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
      expect((apiChain.context as CustomErrorWorkflowContext).cause).toContain('API controller request failed');

      expect(controllerChain.message).toContain('User service operation failed');
      expect(serviceChain.message).toContain('Connection timeout after 30 seconds');

      // Each level maintains its identity
      expect(apiChain.errorType).toBe('API_ERROR');
      expect(controllerChain.errorType).toBe('CONTROLLER_ERROR');
      expect(serviceChain.errorType).toBe('SERVICE_ERROR');
    });

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
      const finalContext = finalChain.context as CustomErrorWorkflowContext;
      expect(finalContext.transaction).toEqual({ id: 'tx-001', type: 'payment' });
      expect(finalContext.user).toEqual({ id: 'user-123', tier: 'premium' });
      expect(finalContext.cause).toBe('Request timeout');

      // Intermediate context also preserved
      const firstContext = firstChain.context as CustomErrorWorkflowContext;
      expect(firstContext.transaction).toEqual({ id: 'tx-001', type: 'payment' });
      expect(firstContext.cause).toBe('Network unreachable');

      // Error types maintained through chain
      expect(finalChain.errorType).toBe('PAYMENT_ERROR');
      expect(firstChain.errorType).toBe('PAYMENT_ERROR');
    });

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
});
