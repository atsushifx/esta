// tests/e2e/aglogger/json/filtering.e2e.spec.ts
import { AgLogger } from '@/AgLogger.class';
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { ConsoleLogger } from '@/plugins/logger/ConsoleLogger';
import { describe, expect, it, vi } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import { createConsoleMock } from '../../_helpers/consoleMock';

describe('AgLogger JSON Log Level Filtering', () => {
  const { mockConsole, setup } = createConsoleMock(vi);

  it('INFOレベルでDEBUGは抑制される', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(mockConsole.debug).not.toHaveBeenCalled();
    expect(mockConsole.info).toHaveBeenCalledTimes(1);
    expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    expect(mockConsole.error).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(mockConsole.info.mock.calls[0][0]);
    expect(parsed.level).toBe('INFO');
  });

  it('OFFレベルでは全て出力されない', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
    logger.logLevel = AG_LOGLEVEL.OFF;
    logger.fatal('f');
    logger.error('e');
    logger.warn('w');
    logger.info('i');
    expect(mockConsole.error).not.toHaveBeenCalled();
    expect(mockConsole.warn).not.toHaveBeenCalled();
    expect(mockConsole.info).not.toHaveBeenCalled();
  });
});
