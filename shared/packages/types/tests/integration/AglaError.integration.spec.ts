import { describe, expect, it } from 'vitest';
import { TestAglaError } from '../../src/__tests__/helpers/TestAglaError.class.ts';
import type { AglaErrorOptions } from '../../types/AglaError.types.js';
import { ErrorSeverity } from '../../types/ErrorSeverity.types.js';

// P8-INTEGRATION-001: 統合シナリオ
describe('when handling complex error scenarios with all features', () => {
  it('then should handle complex error scenarios with all features', () => {
    // Arrange
    const errorType = 'INTEGRATION_TEST_ERROR';
    const message = 'Integration base message';
    const code = 'INT_001';
    const severity = ErrorSeverity.WARNING;
    const timestamp = new Date('2025-08-29T21:42:00.000Z');
    const context = { userId: 'u-123', operation: 'integrated' };

    const base = new TestAglaError(errorType, message, { code, severity, timestamp, context });
    const cause = new Error('Root cause');

    // Act
    const chained = base.chain(cause);
    const json = chained.toJSON() as Record<string, unknown>;
    const str = chained.toString();

    // Assert
    expect(chained).toBeInstanceOf(TestAglaError);
    expect(chained instanceof Error).toBe(true);
    expect(chained.name).toBe('TestAglaError');

    expect(chained.errorType).toBe(errorType);
    expect(chained.message).toBe('Integration base message (caused by: Root cause)');
    expect(chained.code).toBe(code);
    expect(chained.severity).toBe(severity);
    expect(chained.timestamp).toBe(timestamp);
    expect(chained.context).toEqual({ ...context, cause: 'Root cause' });

    expect(json).toEqual({
      errorType,
      message: chained.message,
      code,
      severity,
      timestamp: timestamp.toISOString(),
      context: { ...context, cause: 'Root cause' },
    });

    expect(str).toContain(errorType);
    expect(str).toContain(chained.message);
    expect(str).toContain(JSON.stringify({ ...context, cause: 'Root cause' }));
  });
});

// P8-INTEGRATION-002: 互換性最終確認
describe('when ensuring full backward compatibility', () => {
  it('then should maintain full backward compatibility', () => {
    // Arrange
    const errorType = 'LEGACY_TEST_ERROR';
    const message = 'Legacy mode';
    const legacyContext = { legacy: true, path: '/v0' };

    // Act: 旧APIの第3引数にcontextオブジェクトを渡す
    const legacy = new TestAglaError(errorType, message, legacyContext as unknown as AglaErrorOptions);
    const legacyJson = legacy.toJSON() as Record<string, unknown>;
    const legacyStr = legacy.toString();

    // Assert
    expect(legacy.errorType).toBe(errorType);
    expect(legacy.message).toBe(message);
    expect(legacy.context).toBe(legacyContext);
    expect(legacy.code).toBeUndefined();
    expect(legacy.severity).toBeUndefined();
    expect(legacy.timestamp).toBeUndefined();

    expect(legacyJson).toEqual({
      errorType,
      message,
      context: legacyContext,
    });

    // toStringの一貫フォーマット
    expect(legacyStr).toBe(`${errorType}: ${message} ${JSON.stringify(legacyContext)}`);
  });
});
