// tests/e2e/plugins/e2e-mock-logger/integration-with-aglogger.e2e.spec.ts
import { AgLogger } from '@/AgLogger.class';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
import { E2eMockLogger as E2EMockLoggerWithTestId } from '@/plugins/logger/E2eMockLogger';
import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';

describe('E2EMockLogger - AgLogger統合', () => {
  it('AgLoggerFunctionとして機能する', (ctx) => {
    const mockLogger = new E2EMockLoggerWithTestId('plugin-integration');
    mockLogger.startTest(ctx.task.id);
    ctx.onTestFinished(() => mockLogger.endTest());
    const logger = AgLogger.createLogger({
      defaultLogger: mockLogger.createLoggerFunction(),
      formatter: PlainFormatter,
    });
    logger.logLevel = AG_LOGLEVEL.INFO;
    logger.info('via plugin');
    const messages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
    expect(messages).toHaveLength(1);
    expect(String(messages[0])).toMatch(/via plugin/);
  });

  it('AgLoggerMapとして機能する', (ctx) => {
    const mockLogger = new E2EMockLoggerWithTestId('plugin-integration-map');
    mockLogger.startTest(ctx.task.id);
    ctx.onTestFinished(() => mockLogger.endTest());
    const logger = AgLogger.createLogger({
      defaultLogger: mockLogger.createLoggerFunction(),
      formatter: PlainFormatter,
      loggerMap: mockLogger.createLoggerMap(),
    });
    logger.logLevel = AG_LOGLEVEL.DEBUG;
    logger.error('E');
    logger.warn('W');
    logger.info('I');
    logger.debug('D');
    expect(mockLogger.getMessages(AG_LOGLEVEL.ERROR)).toHaveLength(1);
    expect(mockLogger.getMessages(AG_LOGLEVEL.WARN)).toHaveLength(1);
    expect(mockLogger.getMessages(AG_LOGLEVEL.INFO)).toHaveLength(1);
    expect(mockLogger.getMessages(AG_LOGLEVEL.DEBUG)).toHaveLength(1);
  });
});
