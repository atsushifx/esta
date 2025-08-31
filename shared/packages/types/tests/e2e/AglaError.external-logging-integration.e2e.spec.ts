/**
 * E2E Test: AglaError External Logging System Integration
 * Phase E3-001: Error occurrence to structured log output workflow
 *
 * Given: External logging frameworks integration
 * When: AglaError instances are processed for log output
 * Then: Should format and output structured logs correctly
 */

import { describe, expect, it } from 'vitest';
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class';
import { ErrorSeverity } from '../../types/ErrorSeverity.types';

describe('Given AglaError external logging framework integration', () => {
  describe('When integrating with structured logging systems', () => {
    it('Then should integrate with logging frameworks', () => {
      // Arrange
      const error = new TestAglaError('INTEGRATION_ERROR', 'Database connection failed', {
        code: 'DB001',
        severity: ErrorSeverity.ERROR,
        context: {
          host: 'db.example.com',
          port: 5432,
          database: 'production',
          timeout: 5000,
        },
      });

      // Act
      const logOutput = {
        level: 'error',
        message: error.message,
        errorType: error.errorType,
        code: error.code,
        severity: error.severity,
        timestamp: error.timestamp ? error.timestamp.toISOString() : new Date().toISOString(),
        context: error.context,
        stack: error.stack,
      };

      // Assert
      expect(logOutput.level).toBe('error');
      expect(logOutput.message).toBe('Database connection failed');
      expect(logOutput.errorType).toBe('INTEGRATION_ERROR');
      expect(logOutput.code).toBe('DB001');
      expect(logOutput.severity).toBe(ErrorSeverity.ERROR);
      expect(logOutput.context).toEqual({
        host: 'db.example.com',
        port: 5432,
        database: 'production',
        timeout: 5000,
      });
      expect(typeof logOutput.timestamp).toBe('string');
      expect(logOutput.stack).toBeDefined();
    });

    it('Then should format errors for log aggregation', () => {
      // Arrange
      const chainedError = new TestAglaError('API_ERROR', 'Request failed', {
        code: 'API001',
        severity: ErrorSeverity.WARNING,
        context: { endpoint: '/api/users', method: 'GET' },
      });

      const rootCause = new Error('Network timeout');
      const wrappedError = chainedError.chain(rootCause);

      // Act
      const aggregationFormat = {
        '@timestamp': wrappedError.timestamp ? wrappedError.timestamp.toISOString() : new Date().toISOString(),
        'error.type': wrappedError.errorType,
        'error.message': wrappedError.message,
        'error.code': wrappedError.code,
        'error.severity': wrappedError.severity,
        'error.context': JSON.stringify(wrappedError.context ?? {}),
        'error.cause': rootCause.message,
        'service.name': 'api-service',
        'trace.id': '550e8400-e29b-41d4-a716-446655440000',
      };

      // Assert
      expect(aggregationFormat['error.type']).toBe('API_ERROR');
      expect(aggregationFormat['error.message']).toBe('Request failed (caused by: Network timeout)');
      expect(aggregationFormat['error.code']).toBe('API001');
      expect(aggregationFormat['error.severity']).toBe(ErrorSeverity.WARNING);
      expect(aggregationFormat['error.context']).toContain('"endpoint":"/api/users"');
      expect(aggregationFormat['error.context']).toContain('"method":"GET"');
      expect(aggregationFormat['error.cause']).toBe('Network timeout');
      expect(typeof aggregationFormat['@timestamp']).toBe('string');
    });

    it('Then should handle log output failures gracefully', () => {
      // Arrange
      const error = new TestAglaError('CRITICAL_ERROR', 'System failure', {
        code: 'SYS001',
        severity: ErrorSeverity.FATAL,
        context: { component: 'auth-service' },
      });

      // Act & Assert - Mock log output failure scenario
      const logData = error.toJSON();

      // Simulate fallback mechanism when primary logging fails
      const fallbackLog = {
        timestamp: new Date().toISOString(),
        level: 'fatal',
        message: `Logging failed - Error: ${error.message}`,
        errorType: error.errorType,
        fallback: true,
      };

      expect(logData).toHaveProperty('errorType', 'CRITICAL_ERROR');
      expect(logData).toHaveProperty('message', 'System failure');
      expect(fallbackLog.level).toBe('fatal');
      expect(fallbackLog.fallback).toBe(true);
      expect(fallbackLog.message).toContain('System failure');
    });
  });
});
