// tests/e2e/aglogger/json/integration.e2e.spec.ts
import { AgLogger } from '@/AgLogger.class';
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { ConsoleLogger } from '@/plugins/logger/ConsoleLogger';
import { describe, expect, it, vi } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import { createConsoleMock } from '../../_helpers/consoleMock';

describe('AgLogger JSON Integration Scenarios', () => {
  const { mockConsole, setup } = createConsoleMock(vi);

  it('アプリのライフサイクルを通した統合ログ', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
    logger.logLevel = AG_LOGLEVEL.DEBUG;

    logger.info('Application starting', { version: '2.1.0', environment: 'production' });
    logger.debug('Loading configuration', { configPath: '/app/config.json', size: '2.3KB' });
    logger.warn('Deprecated API usage detected', { api: 'v1/users', replacement: 'v2/users' });
    logger.error('Database connection failed', { host: 'db.example.com', error: 'timeout' });

    expect(mockConsole.info).toHaveBeenCalledTimes(1);
    expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    expect(mockConsole.error).toHaveBeenCalledTimes(1);

    const info = JSON.parse(mockConsole.info.mock.calls[0][0]);
    expect(info).toMatchObject({ level: 'INFO', message: 'Application starting' });
  });

  it('高頻度ログでも構造を維持する', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;
    const N = 50;
    for (let i = 0; i < N; i++) {
      logger.info('Request processed', { requestId: `req-${i}`, method: 'GET' });
    }
    expect(mockConsole.info).toHaveBeenCalledTimes(N);
    const last = JSON.parse(mockConsole.info.mock.calls[N - 1][0]);
    expect(last).toMatchObject({ level: 'INFO', message: 'Request processed' });
  });

  it('logメソッドはlevelを持たない', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
    logger.log('Generic log message', { data: 'test' });
    expect(mockConsole.log).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(mockConsole.log.mock.calls[0][0]);
    expect(parsed.message).toBe('Generic log message');
    expect(parsed.level).toBeUndefined();
  });
});
