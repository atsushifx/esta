// src: /src/__tests__/AgLoggerManager.spec.ts
// @(#) : AgLoggerManager クラスユニットテスト
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// constants
import { AgLogLevelCode } from '@shared/types';

// test unit
import { AgLoggerManager } from '../AgLoggerManager.class';

// mock functions
const mockDefaultLogger = vi.fn();
const mockFatalLogger = vi.fn();
const mockErrorLogger = vi.fn();
const mockWarnLogger = vi.fn();
const mockDebugLogger = vi.fn();
const mockFormatter = vi.fn();

// test main
describe('AgLoggerManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // シングルトンインスタンスをリセット
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (AgLoggerManager as any).instance = undefined;
  });

  afterEach(() => {
    vi.clearAllMocks();
    // テスト後もインスタンスをリセット
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (AgLoggerManager as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('シングルトンインスタンスを返す', () => {
      const instance1 = AgLoggerManager.getInstance();
      const instance2 = AgLoggerManager.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(AgLoggerManager);
    });

    it('初期状態では全てのログレベルがNullLoggerに設定されている', () => {
      const manager = AgLoggerManager.getInstance();

      const offLogger = manager.getLogger(AgLogLevelCode.OFF);
      const fatalLogger = manager.getLogger(AgLogLevelCode.FATAL);
      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const warnLogger = manager.getLogger(AgLogLevelCode.WARN);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);
      const debugLogger = manager.getLogger(AgLogLevelCode.DEBUG);
      const traceLogger = manager.getLogger(AgLogLevelCode.TRACE);

      expect(typeof offLogger).toBe('function');
      expect(typeof fatalLogger).toBe('function');
      expect(typeof errorLogger).toBe('function');
      expect(typeof warnLogger).toBe('function');
      expect(typeof infoLogger).toBe('function');
      expect(typeof debugLogger).toBe('function');
      expect(typeof traceLogger).toBe('function');
    });

    it('デフォルトロガーを指定してインスタンスを取得する', () => {
      const manager = AgLoggerManager.getInstance(mockDefaultLogger);

      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);
      infoLogger('test message');

      expect(mockDefaultLogger).toHaveBeenCalledWith('test message');
    });

    it('フォーマッターを指定してインスタンスを取得する', () => {
      const manager = AgLoggerManager.getInstance(undefined, mockFormatter);

      const formatter = manager.getFormatter();
      expect(formatter).toBe(mockFormatter);
    });

    it('ロガーマップを指定してインスタンスを取得する', () => {
      const loggerMap = {
        [AgLogLevelCode.ERROR]: mockErrorLogger,
        [AgLogLevelCode.WARN]: mockWarnLogger,
      };

      const manager = AgLoggerManager.getInstance(mockDefaultLogger, undefined, loggerMap);

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const warnLogger = manager.getLogger(AgLogLevelCode.WARN);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);

      errorLogger('error message');
      warnLogger('warn message');
      infoLogger('info message');

      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
      expect(mockWarnLogger).toHaveBeenCalledWith('warn message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
    });

    it('全てのオプションを指定してインスタンスを取得する', () => {
      const loggerMap = {
        [AgLogLevelCode.FATAL]: mockFatalLogger,
        [AgLogLevelCode.ERROR]: mockErrorLogger,
      };

      const manager = AgLoggerManager.getInstance(mockDefaultLogger, mockFormatter, loggerMap);

      expect(manager.getFormatter()).toBe(mockFormatter);

      const fatalLogger = manager.getLogger(AgLogLevelCode.FATAL);
      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);

      fatalLogger('fatal message');
      errorLogger('error message');
      infoLogger('info message');

      expect(mockFatalLogger).toHaveBeenCalledWith('fatal message');
      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
    });
  });

  describe('getLogger', () => {
    it('指定されたログレベルのロガーを返す', () => {
      const manager = AgLoggerManager.getInstance(mockDefaultLogger);

      const logger = manager.getLogger(AgLogLevelCode.INFO);
      expect(typeof logger).toBe('function');

      logger('test message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('test message');
    });

    it('存在しないログレベルの場合はデフォルトロガーを返す', () => {
      const manager = AgLoggerManager.getInstance(mockDefaultLogger);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const logger = manager.getLogger(999 as any);
      expect(logger).toBe(mockDefaultLogger);
    });
  });

  describe('getFormatter', () => {
    it('設定されたフォーマッターを返す', () => {
      const manager = AgLoggerManager.getInstance(undefined, mockFormatter);

      const formatter = manager.getFormatter();
      expect(formatter).toBe(mockFormatter);
    });

    it('初期状態ではNullFormatが設定されている', () => {
      const manager = AgLoggerManager.getInstance();

      const formatter = manager.getFormatter();
      expect(typeof formatter).toBe('function');
    });
  });

  describe('setLogger - 従来の形式', () => {
    it('指定されたログレベルにロガーを設定する', () => {
      const manager = AgLoggerManager.getInstance();

      manager.setLogger(AgLogLevelCode.ERROR, mockErrorLogger);

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      errorLogger('error message');

      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
    });

    it('nullを指定した場合はデフォルトロガーが設定される', () => {
      const manager = AgLoggerManager.getInstance(mockDefaultLogger);

      manager.setLogger(AgLogLevelCode.ERROR, null);

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      errorLogger('error message');

      expect(mockDefaultLogger).toHaveBeenCalledWith('error message');
    });
  });

  describe('setLogger - オプション形式', () => {
    it('デフォルトロガーを更新する', () => {
      const manager = AgLoggerManager.getInstance();

      manager.setLogger({ defaultLogger: mockDefaultLogger });

      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);
      infoLogger('info message');

      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
    });

    it('フォーマッターを更新する', () => {
      const manager = AgLoggerManager.getInstance();

      manager.setLogger({ formatter: mockFormatter });

      const formatter = manager.getFormatter();
      expect(formatter).toBe(mockFormatter);
    });

    it('ロガーマップを更新する', () => {
      const manager = AgLoggerManager.getInstance();

      const loggerMap = {
        [AgLogLevelCode.ERROR]: mockErrorLogger,
        [AgLogLevelCode.WARN]: mockWarnLogger,
      };

      manager.setLogger({ loggerMap });

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const warnLogger = manager.getLogger(AgLogLevelCode.WARN);

      errorLogger('error message');
      warnLogger('warn message');

      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
      expect(mockWarnLogger).toHaveBeenCalledWith('warn message');
    });

    it('全てのオプションを同時に更新する', () => {
      const manager = AgLoggerManager.getInstance();

      const loggerMap = {
        [AgLogLevelCode.FATAL]: mockFatalLogger,
        [AgLogLevelCode.DEBUG]: mockDebugLogger,
      };

      manager.setLogger({
        defaultLogger: mockDefaultLogger,
        formatter: mockFormatter,
        loggerMap,
      });

      expect(manager.getFormatter()).toBe(mockFormatter);

      const fatalLogger = manager.getLogger(AgLogLevelCode.FATAL);
      const debugLogger = manager.getLogger(AgLogLevelCode.DEBUG);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);

      fatalLogger('fatal message');
      debugLogger('debug message');
      infoLogger('info message');

      expect(mockFatalLogger).toHaveBeenCalledWith('fatal message');
      expect(mockDebugLogger).toHaveBeenCalledWith('debug message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
    });

    it('デフォルトロガーとロガーマップを同時に設定した場合、適切に更新される', () => {
      const manager = AgLoggerManager.getInstance();

      const loggerMap = {
        [AgLogLevelCode.ERROR]: mockErrorLogger,
      };

      manager.setLogger({
        defaultLogger: mockDefaultLogger,
        loggerMap,
      });

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);
      const warnLogger = manager.getLogger(AgLogLevelCode.WARN);

      errorLogger('error message');
      infoLogger('info message');
      warnLogger('warn message');

      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('warn message');
    });
  });

  describe('複合シナリオ', () => {
    it('getInstance後にsetLoggerで設定を変更できる', () => {
      const manager = AgLoggerManager.getInstance(mockDefaultLogger);

      manager.setLogger(AgLogLevelCode.ERROR, mockErrorLogger);
      manager.setLogger({ formatter: mockFormatter });

      expect(manager.getFormatter()).toBe(mockFormatter);

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);

      errorLogger('error message');
      infoLogger('info message');

      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
    });

    it('複数回setLoggerを呼び出しても正しく動作する', () => {
      const manager = AgLoggerManager.getInstance();

      manager.setLogger({ defaultLogger: mockDefaultLogger });
      manager.setLogger(AgLogLevelCode.ERROR, mockErrorLogger);
      manager.setLogger({ formatter: mockFormatter });

      const secondMockLogger = vi.fn();
      manager.setLogger(AgLogLevelCode.WARN, secondMockLogger);

      const errorLogger = manager.getLogger(AgLogLevelCode.ERROR);
      const warnLogger = manager.getLogger(AgLogLevelCode.WARN);
      const infoLogger = manager.getLogger(AgLogLevelCode.INFO);

      errorLogger('error message');
      warnLogger('warn message');
      infoLogger('info message');

      expect(mockErrorLogger).toHaveBeenCalledWith('error message');
      expect(secondMockLogger).toHaveBeenCalledWith('warn message');
      expect(mockDefaultLogger).toHaveBeenCalledWith('info message');
      expect(manager.getFormatter()).toBe(mockFormatter);
    });
  });
});
