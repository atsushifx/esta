// src: tests/e2e/AglaError.error-reporting.e2e.spec.ts
// @(#) : E2E tests for error logging and report generation workflows
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework
import { describe, expect, it } from 'vitest';

// Type definitions
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// Test types
import type { _TErrorStatistics } from '../../src/__tests__/helpers/test-types.types.js';

// Test utilities
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.js';

/**
 * AglaError Error Reporting Test Suite
 * Tests package user scenarios for error logging and report generation workflows
 * Following atsushifx式 BDD methodology with user-centric workflows
 */
describe('Given package user implementing error logging and report generation workflow', () => {
  describe('When generating structured error reports', () => {
    it('Then should generate structured error reports', () => {
      // Arrange - Error reporting system
      const reportGenerator = {
        generateReport(errors: TestAglaError[]): object {
          return {
            report_id: 'RPT-001',
            generated_at: new Date().toISOString(),
            summary: {
              total_errors: errors.length,
              severities: errors.reduce((acc, err) => {
                const severity = err.severity ?? 'unknown';
                acc[severity] = (acc[severity] || 0) + 1;
                return acc;
              }, {} as _TErrorStatistics),
            },
            errors: errors.map((error, index) => ({
              id: `ERR-${String(index + 1).padStart(3, '0')}`,
              type: error.errorType,
              message: error.message,
              code: error.code,
              severity: error.severity,
              timestamp: error.timestamp?.toISOString(),
              context: error.context,
            })),
          };
        },
      };

      const errors = [
        new TestAglaError('REPORT_ERROR_1', 'First report error', {
          code: 'RPT001',
          severity: ErrorSeverity.ERROR,
          timestamp: new Date('2025-08-31T10:00:00Z'),
          context: { module: 'reporting', user: 'admin' },
        }),
        new TestAglaError('REPORT_ERROR_2', 'Second report error', {
          code: 'RPT002',
          severity: ErrorSeverity.WARNING,
          timestamp: new Date('2025-08-31T10:05:00Z'),
          context: { module: 'validation', user: 'user123' },
        }),
      ];

      // Act - Generate report
      const report = reportGenerator.generateReport(errors);

      // Assert - Report structure and content
      expect(report).toHaveProperty('report_id', 'RPT-001');
      expect(report).toHaveProperty('summary.total_errors', 2);
      const typedReport = report as {
        report_id: string;
        generated_at: string;
        summary: {
          total_errors: number;
          severities: _TErrorStatistics;
        };
        errors: Array<{
          id: string;
          type: string;
          message: string;
          code?: string;
          severity?: ErrorSeverity;
          timestamp?: string;
          context?: unknown;
        }>;
      };
      expect(typedReport.summary.severities).toEqual({
        error: 1,
        warning: 1,
      });
      expect(typedReport.errors).toHaveLength(2);
      expect(typedReport.errors[0]).toHaveProperty('type', 'REPORT_ERROR_1');
      expect(typedReport.errors[1]).toHaveProperty('type', 'REPORT_ERROR_2');
    });

    it('Then should format errors for different log levels', () => {
      // Arrange - Multi-level logging system
      const logFormatter = {
        formatForLevel(error: TestAglaError, level: 'debug' | 'info' | 'warn' | 'error'): string {
          const baseInfo = `${error.errorType}: ${error.message}`;

          switch (level) {
            case 'debug':
              return `[DEBUG] ${baseInfo} | Context: ${JSON.stringify(error.context)} | Code: ${error.code} | Stack: ${
                error.stack?.split('\n')[0]
              }`;
            case 'info':
              return `[INFO] ${baseInfo} | Code: ${error.code}`;
            case 'warn':
              return `[WARN] ${baseInfo} | Severity: ${error.severity}`;
            case 'error':
              return `[ERROR] ${baseInfo} | Code: ${error.code} | Severity: ${error.severity} | Context: ${
                JSON.stringify(error.context)
              }`;
            default:
              return baseInfo;
          }
        },
      };

      const error = new TestAglaError('LOG_FORMAT_ERROR', 'Log formatting test', {
        code: 'LF001',
        severity: ErrorSeverity.ERROR,
        context: { component: 'logger', test: true },
      });

      // Act - Format for different levels
      const debugLog = logFormatter.formatForLevel(error, 'debug');
      const infoLog = logFormatter.formatForLevel(error, 'info');
      const warnLog = logFormatter.formatForLevel(error, 'warn');
      const errorLog = logFormatter.formatForLevel(error, 'error');

      // Assert - Level-appropriate formatting
      expect(debugLog).toContain('[DEBUG]');
      expect(debugLog).toContain('Context:');
      expect(debugLog).toContain('Stack:');

      expect(infoLog).toContain('[INFO]');
      expect(infoLog).toContain('Code: LF001');
      expect(infoLog).not.toContain('Context:');

      expect(warnLog).toContain('[WARN]');
      expect(warnLog).toContain('Severity: error');

      expect(errorLog).toContain('[ERROR]');
      expect(errorLog).toContain('Context:');
      expect(errorLog).toContain('Severity:');
    });

    it('Then should create error summaries for monitoring', () => {
      // Arrange - Monitoring system integration
      const monitoringSystem = {
        createSummary(errors: TestAglaError[], timeWindow: string): object {
          const now = new Date();
          const errorsByType = errors.reduce((acc, err) => {
            acc[err.errorType] = (acc[err.errorType] || 0) + 1;
            return acc;
          }, {} as _TErrorStatistics);

          const errorsBySeverity = errors.reduce((acc, err) => {
            const severity = err.severity ?? 'unknown';
            acc[severity] = (acc[severity] || 0) + 1;
            return acc;
          }, {} as _TErrorStatistics);

          // R-006-01: エラー統計型置き換えテスト
          expect(errorsByType).toSatisfy((x: unknown): x is _TErrorStatistics => typeof x === 'object' && x !== null);
          expect(errorsBySeverity).toSatisfy((x: unknown): x is _TErrorStatistics =>
            typeof x === 'object' && x !== null
          );

          return {
            monitoring_summary: {
              time_window: timeWindow,
              generated_at: now.toISOString(),
              total_errors: errors.length,
              error_types: errorsByType,
              severities: errorsBySeverity,
              alerts: errors
                .filter((err) => err.severity === ErrorSeverity.FATAL || err.severity === ErrorSeverity.ERROR)
                .map((err) => ({
                  type: err.errorType,
                  message: err.message,
                  severity: err.severity,
                  code: err.code,
                })),
            },
          };
        },
      };

      const monitoringErrors = [
        new TestAglaError('MONITORING_ERROR_1', 'Monitor test 1', { severity: ErrorSeverity.FATAL }),
        new TestAglaError('MONITORING_ERROR_2', 'Monitor test 2', { severity: ErrorSeverity.ERROR }),
        new TestAglaError('MONITORING_ERROR_1', 'Monitor test 3', { severity: ErrorSeverity.WARNING }),
      ];

      // Act - Create monitoring summary
      const summary = monitoringSystem.createSummary(monitoringErrors, '1h');

      // Assert - Monitoring summary structure
      expect(summary).toHaveProperty('monitoring_summary');
      const typedSummary = summary as {
        monitoring_summary: {
          time_window: string;
          generated_at: string;
          total_errors: number;
          error_types: _TErrorStatistics;
          severities: _TErrorStatistics;
          alerts: Array<{
            type: string;
            message: string;
            severity?: ErrorSeverity;
            code?: string;
          }>;
        };
      };
      const monSummary = typedSummary.monitoring_summary;

      expect(monSummary.time_window).toBe('1h');
      expect(monSummary.total_errors).toBe(3);
      expect(monSummary.error_types).toEqual({
        MONITORING_ERROR_1: 2,
        MONITORING_ERROR_2: 1,
      });
      expect(monSummary.severities).toEqual({
        fatal: 1,
        error: 1,
        warning: 1,
      });
      expect(monSummary.alerts).toHaveLength(2); // Only FATAL and ERROR

      // R-006-02: 統計集計テスト型置き換え
      const aggregatedStats: _TErrorStatistics = {
        ...monSummary.error_types,
        ...monSummary.severities,
      };
      expect(aggregatedStats).toSatisfy((x: unknown): x is _TErrorStatistics => typeof x === 'object' && x !== null);
    });
  });
});
