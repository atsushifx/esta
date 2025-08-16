// tests/e2e/aglogger/config/setLoggerConfig.e2e.spec.ts
import { AgLogger } from '@/AgLogger.class';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';
import { ConsoleLogger } from '@/plugins/logger/ConsoleLogger';
import { describe, expect, it, vi } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import { createConsoleMock } from '../../_helpers/consoleMock';

describe('AgLogger Config - setLoggerConfig', () => {
  const { mockConsole, setup } = createConsoleMock(vi);

  it('setLoggerConfigで全設定を同時更新', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;
    logger.setLoggerConfig({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    logger.info('after setLoggerConfig');
    expect(mockConsole.info).toHaveBeenCalledTimes(1);
    expect(mockConsole.info.mock.calls[0][0]).toMatch(/\[INFO\] after setLoggerConfig$/);
  });

  it('setLoggerConfigで部分設定のみ更新', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;
    logger.setLoggerConfig({ formatter: PlainFormatter });
    logger.info('partial update');
    expect(mockConsole.info).toHaveBeenCalledTimes(1);
    expect(mockConsole.info.mock.calls[0][0]).toMatch(/\[INFO\] partial update$/);
  });

  it('連続更新で上書きが有効', () => {
    setup();
    const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    logger.logLevel = AG_LOGLEVEL.INFO;
    logger.setLoggerConfig({ defaultLogger: ConsoleLogger });
    logger.info('update1');
    logger.setLoggerConfig({ formatter: PlainFormatter });
    logger.info('update2');
    expect(mockConsole.info).toHaveBeenCalledTimes(2);
    const msgs = mockConsole.info.mock.calls.map((c) => c[0]);
    expect(msgs[0]).toMatch(/\[INFO\] update1$/);
    expect(msgs[1]).toMatch(/\[INFO\] update2$/);
  });

  it('設定変更とパラメータ省略の組み合わせ', () => {
    setup();
    const logger1 = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: PlainFormatter });
    logger1.logLevel = AG_LOGLEVEL.INFO;
    logger1.info('initial');
    logger1.setLoggerConfig({ formatter: PlainFormatter });
    logger1.info('after settings update');
    const logger2 = AgLogger.createLogger();
    logger2.info('after omission');
    expect(logger1).toBe(logger2);
    expect(mockConsole.info).toHaveBeenCalledTimes(3);
  });
});
