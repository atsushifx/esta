/**
 * E2E Test: AglaError External Monitoring System Integration
 * Phase E3-002: Monitoring system notification to report generation workflow
 *
 * Given: External monitoring systems integration
 * When: AglaError instances trigger monitoring alerts and reports
 * Then: Should generate alerts, metrics and dashboard data correctly
 */

import { describe, expect, it } from 'vitest';
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class';
import { ErrorSeverity } from '../../types/ErrorSeverity.types';

describe('Given AglaError external monitoring system integration', () => {
  describe('When generating monitoring alerts and reports', () => {
    it('Then should generate alerts from error data', () => {
      // Arrange
      const criticalError = new TestAglaError('SERVICE_DOWN', 'Payment service unavailable', {
        code: 'PAY001',
        severity: ErrorSeverity.FATAL,
        context: {
          service: 'payment-gateway',
          region: 'us-east-1',
          instances: 3,
          healthCheck: 'failed',
        },
      });

      // Act
      const alertPayload = {
        alertId: `alert-${Date.now()}`,
        severity: criticalError.severity === ErrorSeverity.FATAL ? 'critical' : 'warning',
        title: `Service Alert: ${criticalError.errorType}`,
        description: criticalError.message,
        source: {
          errorType: criticalError.errorType,
          code: criticalError.code,
          timestamp: criticalError.timestamp?.toISOString(),
        },
        tags: {
          service: criticalError.context?.service,
          region: criticalError.context?.region,
          component: 'payment-system',
        },
        escalation: criticalError.severity === ErrorSeverity.FATAL,
        channels: ['slack', 'email', 'pagerduty'],
      };

      // Assert
      expect(alertPayload.severity).toBe('critical');
      expect(alertPayload.title).toBe('Service Alert: SERVICE_DOWN');
      expect(alertPayload.description).toBe('Payment service unavailable');
      expect(alertPayload.escalation).toBe(true);
      expect(alertPayload.channels).toContain('pagerduty');
      expect(alertPayload.tags.service).toBe('payment-gateway');
      expect(alertPayload.tags.region).toBe('us-east-1');
    });

    it('Then should create metrics from error patterns', () => {
      // Arrange
      const errors = [
        new TestAglaError('RATE_LIMIT', 'Too many requests', {
          code: 'RL001',
          severity: ErrorSeverity.WARNING,
          context: { endpoint: '/api/search', requests: 1000 },
        }),
        new TestAglaError('RATE_LIMIT', 'Rate limit exceeded', {
          code: 'RL002',
          severity: ErrorSeverity.ERROR,
          context: { endpoint: '/api/upload', requests: 500 },
        }),
        new TestAglaError('VALIDATION_ERROR', 'Invalid input', {
          code: 'VAL001',
          severity: ErrorSeverity.WARNING,
          context: { field: 'email', value: 'invalid-email' },
        }),
      ];

      // Act
      const errorMetrics = {
        timestamp: new Date().toISOString(),
        interval: '1m',
        metrics: {
          'error.count.total': errors.length,
          'error.count.by_type': {
            'RATE_LIMIT': errors.filter((e) => e.errorType === 'RATE_LIMIT').length,
            'VALIDATION_ERROR': errors.filter((e) => e.errorType === 'VALIDATION_ERROR').length,
          },
          'error.count.by_severity': {
            [ErrorSeverity.WARNING]: errors.filter((e) => e.severity === ErrorSeverity.WARNING).length,
            [ErrorSeverity.ERROR]: errors.filter((e) => e.severity === ErrorSeverity.ERROR).length,
          },
          'error.rate.per_minute': errors.length / 1,
          'error.endpoints.affected': new Set(
            errors.map((e) => e.context?.endpoint).filter(Boolean),
          ).size,
        },
      };

      // Assert
      expect(errorMetrics.metrics['error.count.total']).toBe(3);
      expect(errorMetrics.metrics['error.count.by_type']['RATE_LIMIT']).toBe(2);
      expect(errorMetrics.metrics['error.count.by_type']['VALIDATION_ERROR']).toBe(1);
      expect(errorMetrics.metrics['error.count.by_severity'][ErrorSeverity.WARNING]).toBe(2);
      expect(errorMetrics.metrics['error.count.by_severity'][ErrorSeverity.ERROR]).toBe(1);
      expect(errorMetrics.metrics['error.rate.per_minute']).toBe(3);
      expect(errorMetrics.metrics['error.endpoints.affected']).toBe(2);
    });

    it('Then should format errors for dashboards', () => {
      // Arrange
      const businessError = new TestAglaError('PAYMENT_FAILED', 'Transaction declined', {
        code: 'TXN001',
        severity: ErrorSeverity.ERROR,
        context: {
          transactionId: 'txn_123456789',
          amount: 99.99,
          currency: 'USD',
          merchantId: 'merchant_001',
          reason: 'insufficient_funds',
        },
      });

      // Act
      const dashboardData = {
        errorId: `${businessError.errorType}_${Date.now()}`,
        displayName: businessError.errorType.replace(/_/g, ' ').toLowerCase(),
        status: businessError.severity === ErrorSeverity.FATAL
          ? 'critical'
          : businessError.severity === ErrorSeverity.ERROR
          ? 'error'
          : 'warning',
        summary: {
          message: businessError.message,
          code: businessError.code,
          timestamp: businessError.timestamp?.toISOString(),
          impact: businessError.severity === ErrorSeverity.FATAL ? 'high' : 'medium',
        },
        businessContext: {
          transactionValue: businessError.context?.amount,
          currency: businessError.context?.currency,
          customer: businessError.context?.merchantId,
          category: 'payment-processing',
        },
        visualization: {
          color: businessError.severity === ErrorSeverity.FATAL
            ? '#ff4444'
            : businessError.severity === ErrorSeverity.ERROR
            ? '#ff8800'
            : '#ffcc00',
          icon: 'credit-card-off',
          trend: 'increasing',
        },
      };

      // Assert
      expect(dashboardData.displayName).toBe('payment failed');
      expect(dashboardData.status).toBe('error');
      expect(dashboardData.summary.impact).toBe('medium');
      expect(dashboardData.businessContext.transactionValue).toBe(99.99);
      expect(dashboardData.businessContext.currency).toBe('USD');
      expect(dashboardData.businessContext.category).toBe('payment-processing');
      expect(dashboardData.visualization.color).toBe('#ff8800');
      expect(dashboardData.visualization.icon).toBe('credit-card-off');
    });

    it('Then should handle monitoring system integration', () => {
      // Arrange
      const systemError = new TestAglaError('DISK_FULL', 'Storage capacity exceeded', {
        code: 'STO001',
        severity: ErrorSeverity.FATAL,
        context: {
          filesystem: '/var/log',
          usage: '98%',
          available: '1.2GB',
          threshold: '95%',
        },
      });

      // Act
      const monitoringIntegration = {
        webhook: {
          url: 'https://monitoring.example.com/webhooks/alerts',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          payload: {
            source: 'agla-error-system',
            errorType: systemError.errorType,
            severity: systemError.severity,
            message: systemError.message,
            metadata: systemError.context,
            timestamp: systemError.timestamp?.getTime(),
          },
        },
        healthcheck: {
          endpoint: '/health/storage',
          status: systemError.severity === ErrorSeverity.FATAL ? 'unhealthy' : 'degraded',
          lastCheck: systemError.timestamp?.toISOString(),
          details: {
            disk_usage: systemError.context?.usage,
            available_space: systemError.context?.available,
          },
        },
      };

      // Assert
      expect(monitoringIntegration.webhook.payload.source).toBe('agla-error-system');
      expect(monitoringIntegration.webhook.payload.errorType).toBe('DISK_FULL');
      expect(monitoringIntegration.webhook.payload.severity).toBe(ErrorSeverity.FATAL);
      expect(monitoringIntegration.healthcheck.status).toBe('unhealthy');
      expect(monitoringIntegration.healthcheck.details.disk_usage).toBe('98%');
      expect(monitoringIntegration.healthcheck.details.available_space).toBe('1.2GB');
    });
  });
});
