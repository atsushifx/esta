// tests/e2e/aglogger/plain/integration.e2e.spec.ts
import { AgLogger } from '@/AgLogger.class';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
import { ConsoleLogger } from '@/plugins/logger/ConsoleLogger';
import { describe, expect, it, vi } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import { createConsoleMock } from '../../_helpers/consoleMock';

describe('AgLogger Plain Integration Scenarios', () => {
  const { mockConsole, setup } = createConsoleMock(vi);

  it('アプリ開始からエラーまでの一連のログ', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    logger.logLevel = AG_LOGLEVEL.DEBUG;

    logger.info('Starting application');
    logger.debug('Loading config file', { configPath: '/app/config.json' });
    logger.warn('Using deprecated API', { api: 'oldMethod' });
    logger.error('Failed to connect to database', { host: 'localhost', port: 5432, error: 'Connection timeout' });

    expect(mockConsole.info).toHaveBeenCalledTimes(1);
    expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    expect(mockConsole.error).toHaveBeenCalledTimes(1);

    expect(mockConsole.info.mock.calls[0][0]).toMatch(/\[INFO\] Starting application$/);
    expect(mockConsole.debug.mock.calls[0][0]).toMatch(
      /\[DEBUG\] Loading config file \{"configPath":"\/app\/config\.json"\}$/,
    );
    expect(mockConsole.warn.mock.calls[0][0]).toMatch(/\[WARN\] Using deprecated API \{"api":"oldMethod"\}$/);
    expect(mockConsole.error.mock.calls[0][0]).toMatch(/\[ERROR\] Failed to connect to database/);
  });
});
