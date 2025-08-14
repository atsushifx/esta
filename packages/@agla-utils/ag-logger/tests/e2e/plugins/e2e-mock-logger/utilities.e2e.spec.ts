// tests/e2e/plugins/e2e-mock-logger/utilities.e2e.spec.ts
import { E2eMockLogger as E2EMockLoggerWithTestId } from '@/plugins/logger/E2eMockLogger';
import { describe, expect, it } from 'vitest';

describe('E2EMockLogger - ユーティリティ', () => {
  it('全メッセージをまとめて取得', (ctx) => {
    const mockLogger = new E2EMockLoggerWithTestId('utils');
    mockLogger.startTest(ctx.task.id);
    ctx.onTestFinished(() => mockLogger.endTest());
    mockLogger.info('Info message');
    mockLogger.error('Error message');
    mockLogger.warn('Warning message');
    const all = mockLogger.getAllMessages();
    expect(all.INFO).toEqual(['Info message']);
    expect(all.ERROR).toEqual(['Error message']);
    expect(all.WARN).toEqual(['Warning message']);
    expect(all.DEBUG).toEqual([]);
  });
});
