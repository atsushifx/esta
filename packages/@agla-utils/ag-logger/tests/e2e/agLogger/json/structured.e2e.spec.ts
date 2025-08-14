// tests/e2e/aglogger/json/structured.e2e.spec.ts
import { AgLogger } from '@/AgLogger.class';
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { ConsoleLogger } from '@/plugins/logger/ConsoleLogger';
import { describe, expect, it, vi } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import { createConsoleMock } from '../../_helpers/consoleMock';

type TCircular = { name: string; self?: TCircular };

describe('AgLogger JSON Structured Logging', () => {
  const { mockConsole, setup } = createConsoleMock(vi);

  describe('基本: 構造化出力と引数処理', () => {
    it('各レベルでJSON構造を出力する', () => {
      setup();
      const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
      logger.logLevel = AG_LOGLEVEL.TRACE;

      const cases = [
        { call: () => logger.error('ERROR message'), method: mockConsole.error, level: 'ERROR' },
        { call: () => logger.warn('WARN message'), method: mockConsole.warn, level: 'WARN' },
        { call: () => logger.info('INFO message'), method: mockConsole.info, level: 'INFO' },
        { call: () => logger.debug('DEBUG message'), method: mockConsole.debug, level: 'DEBUG' },
      ];

      for (const c of cases) {
        c.call();
        expect(c.method).toHaveBeenCalledTimes(1);
        const parsed = JSON.parse(c.method.mock.calls[0][0]);
        expect(parsed).toMatchObject({ level: c.level, message: `${c.level} message` });
        expect(parsed.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
        vi.clearAllMocks();
      }
    });

    it('オブジェクト/配列/プリミティブ引数を正しく扱う', () => {
      setup();
      const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
      logger.logLevel = AG_LOGLEVEL.DEBUG;

      const complex = { user: { id: 1 }, list: [1, 2], flags: { a: true } };
      logger.info('API done', complex, 'ok');
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      const info = JSON.parse(mockConsole.info.mock.calls[0][0]);
      expect(info).toMatchObject({ level: 'INFO', message: 'API done ok', args: [complex] });

      vi.clearAllMocks();
      const mixed = { numbers: [1, 2, 3], mixed: [null, true, 0, ''] };
      logger.debug('Data', mixed, 42, true, null);
      const debug = JSON.parse(mockConsole.debug.mock.calls[0][0]);
      expect(debug).toMatchObject({ level: 'DEBUG', message: 'Data 42 true', args: [mixed, null] });
    });

    it('構造化引数が無い場合はargsを省略する', () => {
      setup();
      const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
      logger.logLevel = AG_LOGLEVEL.INFO;
      logger.info('hello');
      const parsed = JSON.parse(mockConsole.info.mock.calls[0][0]);
      expect(parsed).toMatchObject({ level: 'INFO', message: 'hello' });
      expect(parsed).not.toHaveProperty('args');
    });

    it('空オブジェクト/配列でもJSON構造を保持する', () => {
      setup();
      const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
      logger.logLevel = AG_LOGLEVEL.WARN;
      logger.warn('Empty', {}, [], '');
      const parsed = JSON.parse(mockConsole.warn.mock.calls[0][0]);
      expect(parsed).toMatchObject({ level: 'WARN', message: 'Empty', args: [{}, []] });
    });
  });

  describe('異常系: シリアライズエラー', () => {
    it('循環参照のシリアライズで例外を投げる', () => {
      setup();
      const logger = AgLogger.createLogger({ defaultLogger: ConsoleLogger, formatter: JsonFormatter });
      logger.logLevel = AG_LOGLEVEL.ERROR;
      const circular: TCircular = { name: 'x' };
      circular.self = circular;
      expect(() => logger.error('circular', circular)).toThrow();
    });
  });
});
