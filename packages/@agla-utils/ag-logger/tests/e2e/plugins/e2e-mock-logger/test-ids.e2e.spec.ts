// tests/e2e/plugins/e2e-mock-logger/test-ids.e2e.spec.ts
import { E2eMockLogger as E2EMockLoggerWithTestId } from '@/plugins/logger/E2eMockLogger';
import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';

describe('E2EMockLogger - テストID管理', () => {
  const mockLogger = new E2EMockLoggerWithTestId('test-id-management');

  it('識別子と現在のテストIDを取得', (ctx) => {
    mockLogger.startTest(ctx.task.id);
    ctx.onTestFinished(() => mockLogger.endTest());
    expect(mockLogger.getTestIdentifier()).toBe('test-id-management');
    expect(mockLogger.getCurrentTestId()).toBe(ctx.task.id);
  });

  it('複数インスタンスで独立管理', (ctx) => {
    const mockLogger2 = new E2EMockLoggerWithTestId('independent-test');
    mockLogger.startTest(ctx.task.id + '-1');
    mockLogger2.startTest(ctx.task.id + '-2');
    ctx.onTestFinished(() => {
      mockLogger.endTest();
      mockLogger2.endTest();
    });
    mockLogger.info('m1');
    mockLogger2.info('m2');
    expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['m1']);
    expect(mockLogger2.getMessages(AG_LOGLEVEL.INFO)).toEqual(['m2']);
  });
});
