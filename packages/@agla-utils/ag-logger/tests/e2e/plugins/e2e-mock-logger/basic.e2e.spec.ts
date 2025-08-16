// tests/e2e/plugins/e2e-mock-logger/basic.e2e.spec.ts
import { E2eMockLogger as E2EMockLoggerWithTestId } from '@/plugins/logger/E2eMockLogger';
import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';

describe('E2EMockLogger - 基本動作', () => {
  const mockLogger = new E2EMockLoggerWithTestId('basic');

  it('レベル毎にメッセージを収集', (ctx) => {
    mockLogger.startTest(ctx.task.id);
    ctx.onTestFinished(() => mockLogger.endTest());
    mockLogger.info('info');
    mockLogger.error('error');
    mockLogger.warn('warn');
    expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toEqual(['info']);
    expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toEqual(['error']);
    expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toEqual(['warn']);
  });

  it('最後のメッセージを取得', (ctx) => {
    mockLogger.startTest(ctx.task.id);
    ctx.onTestFinished(() => mockLogger.endTest());
    mockLogger.info('a');
    mockLogger.info('b');
    mockLogger.info('c');
    expect(mockLogger.getLastMessage(AG_LOGLEVEL.INFO)).toBe('c');
  });

  it('レベル単位でクリアできる', (ctx) => {
    mockLogger.startTest(ctx.task.id);
    ctx.onTestFinished(() => mockLogger.endTest());
    mockLogger.info('x');
    expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(1);
    mockLogger.clearMessages(AG_LOGLEVEL.INFO);
    expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(0);
  });
});
