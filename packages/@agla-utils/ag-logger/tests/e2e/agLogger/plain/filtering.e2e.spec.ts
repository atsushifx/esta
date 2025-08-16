// tests/e2e/aglogger/plain/filtering.e2e.spec.ts
import { AgLogger } from '@/AgLogger.class';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
import { ConsoleLogger } from '@/plugins/logger/ConsoleLogger';
import { describe, expect, it, vi } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import { createConsoleMock } from '../../_helpers/consoleMock';

describe('AgLogger Plain Log Level Filtering', () => {
  const { mockConsole, setup } = createConsoleMock(vi);

  it('INFOレベルでDEBUGは出力されない', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;
    logger.debug('d');
    logger.info('i');
    expect(mockConsole.debug).not.toHaveBeenCalled();
    expect(mockConsole.info).toHaveBeenCalledTimes(1);
  });

  it('ERRORレベルではINFO/WARNは出力されない', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    logger.logLevel = AG_LOGLEVEL.ERROR;
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(mockConsole.info).not.toHaveBeenCalled();
    expect(mockConsole.warn).not.toHaveBeenCalled();
    expect(mockConsole.error).toHaveBeenCalledTimes(1);
  });

  it('OFFレベルでは何も出力されない', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    logger.logLevel = AG_LOGLEVEL.OFF;
    logger.error('e');
    logger.info('i');
    expect(mockConsole.error).not.toHaveBeenCalled();
    expect(mockConsole.info).not.toHaveBeenCalled();
  });
});
