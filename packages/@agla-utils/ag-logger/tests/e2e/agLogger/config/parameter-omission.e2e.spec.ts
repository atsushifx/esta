// tests/e2e/aglogger/config/parameter-omission.e2e.spec.ts
import { AgLogger } from '@/AgLogger.class';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
import { ConsoleLogger } from '@/plugins/logger/ConsoleLogger';
import { describe, expect, it, vi } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import { createConsoleMock } from '../../_helpers/consoleMock';

describe('AgLogger Config - Parameter Omission', () => {
  const { mockConsole, setup } = createConsoleMock(vi);

  it('初期設定後、全パラメータ省略で既存設定を再利用', () => {
    setup();
    const logger1 = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    logger1.logLevel = AG_LOGLEVEL.INFO;
    logger1.info('after initial setup');

    const logger2 = AgLogger.createLogger();
    logger2.info('after omission');

    expect(logger1).toBe(logger2);
    expect(mockConsole.info).toHaveBeenCalledTimes(2);
    const [a, b] = [mockConsole.info.mock.calls[0][0], mockConsole.info.mock.calls[1][0]];
    expect(a).toMatch(/\[INFO\] after initial setup$/);
    expect(b).toMatch(/\[INFO\] after omission$/);
  });

  it('一部省略時も既存設定を利用', () => {
    setup();
    AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger });
    logger.logLevel = AG_LOGLEVEL.INFO;
    logger.info('partial omission');
    expect(mockConsole.info).toHaveBeenCalledTimes(1);
    expect(mockConsole.info.mock.calls[0][0]).toMatch(/\[INFO\] partial omission$/);
  });

  it('シングルトン動作を保証', () => {
    setup();
    const logger1 = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    const logger2 = AgLogger.createLogger();
    const logger3 = AgLogger.createLogger({ defaultLogger: ConsoleLogger });
    expect(logger1).toBe(logger2);
    expect(logger2).toBe(logger3);
  });
});
