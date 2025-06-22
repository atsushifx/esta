// src: /src/plugins/logger/__tests__/ConsoleLogger.spec.ts
// @(#) : ConsoleLogger プラグインユニットテスト
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { beforeEach, describe, expect, it, vi } from 'vitest';

// constants
import { AgLogLevelCode } from '@shared/types';

// test unit
import {
  consoleLogDebug,
  consoleLogError,
  consoleLogFatal,
  ConsoleLogger,
  consoleLogInfo,
  consoleLogTrace,
  consoleLogWarn,
} from '../ConsoleLogger';

// mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// test main
describe('ConsoleLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  describe('ConsoleLogger Map', () => {
    it('OFF レベルは null を返す', () => {
      expect(ConsoleLogger[AgLogLevelCode.OFF]).toBeNull();
    });

    it('FATAL レベルでconsole.errorを呼び出す', () => {
      const logFunction = ConsoleLogger[AgLogLevelCode.FATAL];
      expect(logFunction).toBeDefined();

      logFunction!('test fatal message');
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('ERROR レベルでconsole.errorを呼び出す', () => {
      const logFunction = ConsoleLogger[AgLogLevelCode.ERROR];
      expect(logFunction).toBeDefined();

      logFunction!('test error message');
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('WARN レベルでconsole.warnを呼び出す', () => {
      const logFunction = ConsoleLogger[AgLogLevelCode.WARN];
      expect(logFunction).toBeDefined();

      logFunction!('test warn message');
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    });

    it('INFO レベルでconsole.infoを呼び出す', () => {
      const logFunction = ConsoleLogger[AgLogLevelCode.INFO];
      expect(logFunction).toBeDefined();

      logFunction!('test info message');
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });

    it('DEBUG レベルでconsole.debugを呼び出す', () => {
      const logFunction = ConsoleLogger[AgLogLevelCode.DEBUG];
      expect(logFunction).toBeDefined();

      logFunction!('test debug message');
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    });

    it('TRACE レベルでconsole.debugを呼び出す', () => {
      const logFunction = ConsoleLogger[AgLogLevelCode.TRACE];
      expect(logFunction).toBeDefined();

      logFunction!('test trace message');
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    });
  });

  describe('Individual Logger Functions', () => {
    it('consoleLogFatal は console.error を呼び出す', () => {
      consoleLogFatal('fatal message');
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('consoleLogError は console.error を呼び出す', () => {
      consoleLogError('error message');
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('consoleLogWarn は console.warn を呼び出す', () => {
      consoleLogWarn('warn message');
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    });

    it('consoleLogInfo は console.info を呼び出す', () => {
      consoleLogInfo('info message');
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });

    it('consoleLogDebug は console.debug を呼び出す', () => {
      consoleLogDebug('debug message');
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    });

    it('consoleLogTrace は console.debug を呼び出す', () => {
      consoleLogTrace('trace message');
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    });
  });

  describe('複数引数のテスト', () => {
    it('複数の引数を正しく処理する', () => {
      const logFunction = ConsoleLogger[AgLogLevelCode.INFO];
      logFunction!('message', 123, { data: 'test' });
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });
  });
});
