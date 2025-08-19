// tests/e2e/aglogger/plain/basic.e2e.spec.ts
import { describe, expect, it, vi } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
// Console mock utilities removed - using vi.spyOn directly
import { AgLogger } from '../../../AgLogger.class';
import { PlainFormatter } from '../../../plugins/formatter/PlainFormatter';
import { ConsoleLogger } from '../../../plugins/logger/ConsoleLogger';

describe('AgLogger Plain Basic Output', () => {
  const setupTestContext = (): void => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  };

  it('INFO/ERROR/WARN/DEBUG の基本出力', () => {
    setupTestContext();

    // Setup console spies
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });

    logger.logLevel = AG_LOGLEVEL.INFO;
    logger.info('Test message');
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0][0]).toMatch(/\[INFO\] Test message$/);

    vi.clearAllMocks();
    logger.logLevel = AG_LOGLEVEL.ERROR;
    logger.error('Error message');
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toMatch(/\[ERROR\] Error message$/);

    vi.clearAllMocks();
    logger.logLevel = AG_LOGLEVEL.WARN;
    logger.warn('Warning message');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/\[WARN\] Warning message$/);

    vi.clearAllMocks();
    logger.logLevel = AG_LOGLEVEL.DEBUG;
    logger.debug('Debug message');
    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy.mock.calls[0][0]).toMatch(/\[DEBUG\] Debug message$/);

    // Cleanup spies
    infoSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    debugSpy.mockRestore();
  });

  it('複数引数: オブジェクト/配列を整形して末尾に付加', () => {
    setupTestContext();

    // Setup console spies
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;
    const obj = { userId: 123, userName: 'testUser' };
    logger.info('User data', obj, 'additional info');
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0][0]).toMatch(
      /\[INFO\] User data additional info \{"userId":123,"userName":"testUser"\}$/,
    );

    vi.clearAllMocks();
    logger.logLevel = AG_LOGLEVEL.DEBUG;
    const items = ['item1', 'item2', 'item3'];
    logger.debug('Items to process', items);
    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy.mock.calls[0][0]).toMatch(/\[DEBUG\] Items to process \["item1","item2","item3"\]$/);

    // Cleanup spies
    infoSpy.mockRestore();
    debugSpy.mockRestore();
  });
});
