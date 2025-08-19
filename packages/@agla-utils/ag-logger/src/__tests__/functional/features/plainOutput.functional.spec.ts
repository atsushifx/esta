// tests/e2e/aglogger/plain/basic.e2e.spec.ts
import { describe, expect, it } from 'vitest';
import type { TestContext } from 'vitest';

import { AG_LOGLEVEL } from '../../../../shared/types';
import type { AgFormatFunction } from '../../../../shared/types';
import { AgLogger } from '../../../AgLogger.class';

import type { AgMockBufferLogger } from '../../../plugins/logger/MockLogger';

// logger & formatter
import { PlainFormatter } from '../../../plugins/formatter/PlainFormatter';
import { MockLogger } from '../../../plugins/logger/MockLogger';

/**
 * テストセットアップ
 */
const setupTestContext = (_ctx?: TestContext): {
  mockLogger: AgMockBufferLogger;
  mockFormatter: AgFormatFunction;
} => {
  const _mockLogger = new MockLogger.buffer();
  const _mockFormatter = PlainFormatter;

  AgLogger.resetSingleton();

  _ctx?.onTestFinished(() => {
    AgLogger.resetSingleton();
  });

  return {
    mockLogger: _mockLogger,
    mockFormatter: _mockFormatter,
  };
};

describe('AgLogger Plain Basic Output', () => {
  it('INFO/ERROR/WARN/DEBUG の基本出力', () => {
    const { mockLogger, mockFormatter } = setupTestContext();

    const logger = AgLogger.createLogger({
      defaultLogger: mockLogger.getLoggerFunction(),
      formatter: mockFormatter,
      loggerMap: {
        [AG_LOGLEVEL.INFO]: mockLogger.info.bind(mockLogger),
        [AG_LOGLEVEL.ERROR]: mockLogger.error.bind(mockLogger),
        [AG_LOGLEVEL.WARN]: mockLogger.warn.bind(mockLogger),
        [AG_LOGLEVEL.DEBUG]: mockLogger.debug.bind(mockLogger),
      },
    });

    logger.logLevel = AG_LOGLEVEL.INFO;
    logger.info('Test message');
    expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(1);
    expect(mockLogger.getLastMessage(AG_LOGLEVEL.INFO)).toMatch(/\[INFO\] Test message$/);

    mockLogger.clearAllMessages();
    logger.logLevel = AG_LOGLEVEL.ERROR;
    logger.error('Error message');
    expect(mockLogger.getMessageCount(AG_LOGLEVEL.ERROR)).toBe(1);
    expect(mockLogger.getLastMessage(AG_LOGLEVEL.ERROR)).toMatch(/\[ERROR\] Error message$/);

    mockLogger.clearAllMessages();
    logger.logLevel = AG_LOGLEVEL.WARN;
    logger.warn('Warning message');
    expect(mockLogger.getMessageCount(AG_LOGLEVEL.WARN)).toBe(1);
    expect(mockLogger.getLastMessage(AG_LOGLEVEL.WARN)).toMatch(/\[WARN\] Warning message$/);

    mockLogger.clearAllMessages();
    logger.logLevel = AG_LOGLEVEL.DEBUG;
    logger.debug('Debug message');
    expect(mockLogger.getMessageCount(AG_LOGLEVEL.DEBUG)).toBe(1);
    expect(mockLogger.getLastMessage(AG_LOGLEVEL.DEBUG)).toMatch(/\[DEBUG\] Debug message$/);
  });

  it('複数引数: オブジェクト/配列を整形して末尾に付加', () => {
    const { mockLogger, mockFormatter } = setupTestContext();

    const logger = AgLogger.createLogger({
      defaultLogger: mockLogger.info.bind(mockLogger),
      formatter: mockFormatter,
      loggerMap: {
        [AG_LOGLEVEL.INFO]: mockLogger.info.bind(mockLogger),
        [AG_LOGLEVEL.DEBUG]: mockLogger.debug.bind(mockLogger),
      },
    });

    logger.logLevel = AG_LOGLEVEL.INFO;
    const obj = { userId: 123, userName: 'testUser' };
    logger.info('User data', obj, 'additional info');
    expect(mockLogger.getMessageCount(AG_LOGLEVEL.INFO)).toBe(1);
    expect(mockLogger.getLastMessage(AG_LOGLEVEL.INFO)).toMatch(
      /\[INFO\] User data additional info \{"userId":123,"userName":"testUser"\}$/,
    );

    mockLogger.clearAllMessages();
    logger.logLevel = AG_LOGLEVEL.DEBUG;
    const items = ['item1', 'item2', 'item3'];
    logger.debug('Items to process', items);
    expect(mockLogger.getMessageCount(AG_LOGLEVEL.DEBUG)).toBe(1);
    expect(mockLogger.getLastMessage(AG_LOGLEVEL.DEBUG)).toMatch(
      /\[DEBUG\] Items to process \["item1","item2","item3"\]$/,
    );
  });
});
