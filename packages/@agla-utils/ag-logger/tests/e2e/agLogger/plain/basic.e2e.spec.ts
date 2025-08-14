// tests/e2e/aglogger/plain/basic.e2e.spec.ts
import { AgLogger } from '@/AgLogger.class';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
import { ConsoleLogger } from '@/plugins/logger/ConsoleLogger';
import { describe, expect, it, vi } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import { createConsoleMock } from '../../_helpers/consoleMock';

describe('AgLogger Plain Basic Output', () => {
  const { mockConsole, setup } = createConsoleMock(vi);

  it('INFO/ERROR/WARN/DEBUG の基本出力', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });

    logger.logLevel = AG_LOGLEVEL.INFO;
    logger.info('Test message');
    expect(mockConsole.info).toHaveBeenCalledTimes(1);
    expect(mockConsole.info.mock.calls[0][0]).toMatch(/\[INFO\] Test message$/);

    vi.clearAllMocks();
    logger.logLevel = AG_LOGLEVEL.ERROR;
    logger.error('Error message');
    expect(mockConsole.error.mock.calls[0][0]).toMatch(/\[ERROR\] Error message$/);

    vi.clearAllMocks();
    logger.logLevel = AG_LOGLEVEL.WARN;
    logger.warn('Warning message');
    expect(mockConsole.warn.mock.calls[0][0]).toMatch(/\[WARN\] Warning message$/);

    vi.clearAllMocks();
    logger.logLevel = AG_LOGLEVEL.DEBUG;
    logger.debug('Debug message');
    expect(mockConsole.debug.mock.calls[0][0]).toMatch(/\[DEBUG\] Debug message$/);
  });

  it('複数引数: オブジェクト/配列を整形して末尾に付加', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;
    const obj = { userId: 123, userName: 'testUser' };
    logger.info('User data', obj, 'additional info');
    expect(mockConsole.info).toHaveBeenCalledTimes(1);
    expect(mockConsole.info.mock.calls[0][0]).toMatch(
      /\[INFO\] User data additional info \{"userId":123,"userName":"testUser"\}$/,
    );

    vi.clearAllMocks();
    logger.logLevel = AG_LOGLEVEL.DEBUG;
    const items = ['item1', 'item2', 'item3'];
    logger.debug('Items to process', items);
    expect(mockConsole.debug.mock.calls[0][0]).toMatch(/\[DEBUG\] Items to process \["item1","item2","item3"\]$/);
  });
});
